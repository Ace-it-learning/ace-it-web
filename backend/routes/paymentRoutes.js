const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');
const UserProfileService = require('../services/UserProfileService');
const { requireResolvedUid } = require('../middleware/requireResolvedUid');

const PLAN_TO_PRICE_ID = {
    pro: process.env.STRIPE_PRICE_ID_PRO,
    premium: process.env.STRIPE_PRICE_ID_PREMIUM
};

function normalizePlanId(planId) {
    const normalized = String(planId || '').toLowerCase();
    if (normalized === 'pro' || normalized === 'premium') return normalized;
    return null;
}

function getTierFromPriceId(priceId) {
    if (!priceId) return null;
    if (priceId === process.env.STRIPE_PRICE_ID_PREMIUM) return 'premium';
    if (priceId === process.env.STRIPE_PRICE_ID_PRO) return 'pro';
    return null;
}

function getSuccessUrl() {
    return process.env.STRIPE_CHECKOUT_SUCCESS_URL || 'http://localhost:3005/subscription?checkout=success';
}

function getCancelUrl() {
    return process.env.STRIPE_CHECKOUT_CANCEL_URL || 'http://localhost:3005/subscription?checkout=cancelled';
}

async function ensureStripeCustomer(uid, preferredEmail) {
    const profile = await UserProfileService.getProfile(uid);
    if (profile?.stripe_customer_id) {
        return profile.stripe_customer_id;
    }

    const customer = await stripe.customers.create({
        email: preferredEmail || undefined,
        metadata: { uid }
    });

    await UserProfileService.createOrUpdateProfile(uid, {
        stripe_customer_id: customer.id,
        stripe_customer_email: preferredEmail || profile?.email || null
    });

    return customer.id;
}

async function updateSubscriptionProfile(uid, subscription, explicitStatus) {
    if (!uid || !subscription) return;
    const firstItem = subscription?.items?.data?.[0];
    const priceId = firstItem?.price?.id || null;
    const derivedTier =
        subscription?.metadata?.tier ||
        getTierFromPriceId(priceId) ||
        'pro';

    await UserProfileService.createOrUpdateProfile(uid, {
        subscription_tier: derivedTier,
        subscription_status: explicitStatus || subscription.status || 'active',
        subscription_expiry: subscription.current_period_end
            ? new Date(subscription.current_period_end * 1000).toISOString()
            : null,
        subscription_cancel_at_period_end: !!subscription.cancel_at_period_end,
        stripe_customer_id: subscription.customer || null,
        stripe_subscription_id: subscription.id || null,
        stripe_price_id: priceId,
        subscription_updated: new Date().toISOString()
    });
}

// Create a payment intent for subscription
router.post('/create-payment-intent', requireResolvedUid, async (req, res) => {
    try {
        const { amount, currency = 'hkd', customer_email, tier } = req.body;

        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount * 100, // Stripe expects amount in cents
            currency,
            receipt_email: customer_email,
            metadata: {
                integration_check: 'accept_a_payment',
                tier: tier
            },
        });

        res.send({
            clientSecret: paymentIntent.client_secret,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/create-checkout-session', requireResolvedUid, async (req, res) => {
    try {
        const uid = req.uid || req.body?.uid;
        const planId = normalizePlanId(req.body?.planId || req.body?.tier);
        if (!uid) return res.status(401).json({ error: 'Unauthorized' });
        if (!planId) return res.status(400).json({ error: 'Invalid plan. Must be pro or premium.' });

        const priceId = PLAN_TO_PRICE_ID[planId];
        if (!priceId) return res.status(400).json({ error: `Missing Stripe price ID for ${planId}` });

        const email = req.authUser?.email || req.body?.customer_email || null;
        const customerId = await ensureStripeCustomer(uid, email);

        // Check if user already has an active subscription
        const existingSubscriptions = await stripe.subscriptions.list({
            customer: customerId,
            status: 'active',
            limit: 10
        });

        const activeSubscription = existingSubscriptions.data.find(
            sub => sub.status === 'active' || sub.status === 'trialing'
        );

        if (activeSubscription) {
            // Upgrade / downgrade existing subscription
            const currentItem = activeSubscription.items.data[0];
            const currentPriceId = currentItem?.price?.id;

            if (currentPriceId === priceId) {
                return res.status(400).json({ error: `You are already subscribed to the ${planId} plan.` });
            }

            // Use Stripe Checkout to handle upgrades/downgrades.
            // Stripe Checkout supports subscription updates with proration and
            // works regardless of Billing Portal configuration.
            const successUrl = getSuccessUrl();
            const successUrlWithSession = `${successUrl}${successUrl.includes('?') ? '&' : '?'}session_id={CHECKOUT_SESSION_ID}`;
            const session = await stripe.checkout.sessions.create({
                mode: 'subscription',
                customer: customerId,
                line_items: [{ price: priceId, quantity: 1 }],
                success_url: successUrlWithSession,
                cancel_url: getCancelUrl(),
                metadata: {
                    uid,
                    tier: planId
                },
                subscription_data: {
                    metadata: {
                        uid,
                        tier: planId
                    }
                },
                allow_promotion_codes: true
            });

            return res.json({
                success: true,
                upgraded: true,
                subscriptionId: activeSubscription.id,
                tier: planId,
                url: session.url,
                message: `Please complete checkout to change your plan to ${planId}.`
            });
        }

        // No active subscription — create a new checkout session
        const successUrl = getSuccessUrl();
        const successUrlWithSession = `${successUrl}${successUrl.includes('?') ? '&' : '?'}session_id={CHECKOUT_SESSION_ID}`;
        const session = await stripe.checkout.sessions.create({
            mode: 'subscription',
            customer: customerId,
            line_items: [{ price: priceId, quantity: 1 }],
            success_url: successUrlWithSession,
            cancel_url: getCancelUrl(),
            metadata: {
                uid,
                tier: planId
            },
            subscription_data: {
                metadata: {
                    uid,
                    tier: planId
                }
            },
            allow_promotion_codes: true
        });

        return res.json({ sessionId: session.id, url: session.url });
    } catch (error) {
        console.error('[Stripe] create-checkout-session failed:', error);
        return res.status(500).json({ error: error.message || 'Failed to create checkout session' });
    }
});

router.post('/create-customer-portal-session', requireResolvedUid, async (req, res) => {
    try {
        const uid = req.uid || req.body?.uid;
        if (!uid) return res.status(401).json({ error: 'Unauthorized' });

        const profile = await UserProfileService.getProfile(uid);
        const email = req.authUser?.email || profile?.email || null;
        const customerId = profile?.stripe_customer_id || await ensureStripeCustomer(uid, email);
        const returnUrl = process.env.STRIPE_BILLING_PORTAL_RETURN_URL || 'http://localhost:3005/account?tab=subscription';

        const session = await stripe.billingPortal.sessions.create({
            customer: customerId,
            return_url: returnUrl
        });

        return res.json({ url: session.url });
    } catch (error) {
        console.error('[Stripe] create-customer-portal-session failed:', error);
        return res.status(500).json({ error: error.message || 'Failed to create customer portal session' });
    }
});

// Webhook to handle Stripe events
router.post('/webhook', async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
        console.log(`Webhook signature verification failed.`, err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
        case 'checkout.session.completed': {
            const checkoutSession = event.data.object;
            const uid = checkoutSession?.metadata?.uid;
            const tier = checkoutSession?.metadata?.tier;
            console.log(`[Stripe webhook] checkout.session.completed: uid=${uid || 'MISSING'}, tier=${tier || 'MISSING'}`);
            if (uid) {
                try {
                    await UserProfileService.createOrUpdateProfile(uid, {
                        subscription_tier: tier || 'pro',
                        subscription_status: 'active',
                        stripe_customer_id: checkoutSession.customer || null,
                        stripe_subscription_id: checkoutSession.subscription || null,
                        subscription_updated: new Date().toISOString()
                    });
                    console.log(`[Stripe webhook] checkout.session.completed -> profile updated for ${uid}`);
                } catch (err) {
                    console.error(`[Stripe webhook] checkout.session.completed -> FAILED for ${uid}:`, err.message);
                    // Return 500 so Stripe will retry
                    return res.status(500).json({ error: err.message });
                }
            }
            break;
        }
        case 'customer.subscription.created':
        case 'customer.subscription.updated': {
            const subscription = event.data.object;
            const uid = subscription?.metadata?.uid;
            console.log(`[Stripe webhook] ${event.type}: uid=${uid || 'MISSING'}`);
            try {
                await updateSubscriptionProfile(uid, subscription);
                console.log(`[Stripe webhook] ${event.type} -> profile updated for ${uid || 'unknown uid'}`);
            } catch (err) {
                console.error(`[Stripe webhook] ${event.type} -> FAILED for ${uid || 'unknown uid'}:`, err.message);
                return res.status(500).json({ error: err.message });
            }
            break;
        }
        case 'customer.subscription.deleted': {
            const subscription = event.data.object;
            const uid = subscription?.metadata?.uid;
            console.log(`[Stripe webhook] customer.subscription.deleted: uid=${uid || 'MISSING'}`);
            try {
                await updateSubscriptionProfile(uid, subscription, 'cancelled');
                console.log(`[Stripe webhook] customer.subscription.deleted -> profile updated for ${uid || 'unknown uid'}`);
            } catch (err) {
                console.error(`[Stripe webhook] customer.subscription.deleted -> FAILED for ${uid || 'unknown uid'}:`, err.message);
                return res.status(500).json({ error: err.message });
            }
            break;
        }
        case 'invoice.payment_succeeded':
        case 'invoice.payment_failed': {
            const invoice = event.data.object;
            const subscriptionId = invoice?.subscription;
            console.log(`[Stripe webhook] ${event.type}: subscriptionId=${subscriptionId || 'MISSING'}`);
            if (subscriptionId) {
                try {
                    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
                    const uid = subscription?.metadata?.uid;
                    const status = event.type === 'invoice.payment_failed' ? 'past_due' : subscription.status;
                    console.log(`[Stripe webhook] ${event.type}: resolved uid=${uid || 'MISSING'}, status=${status}`);
                    await updateSubscriptionProfile(uid, subscription, status);
                    console.log(`[Stripe webhook] ${event.type} -> profile updated for ${uid || 'unknown uid'}`);
                } catch (err) {
                    console.error(`[Stripe webhook] ${event.type} -> FAILED:`, err.message);
                    return res.status(500).json({ error: err.message });
                }
            }
            break;
        }
        case 'payment_intent.succeeded': {
            const paymentIntent = event.data.object;
            console.log('[Stripe webhook] PaymentIntent was successful!');
            try {
                const uid = paymentIntent.metadata?.uid || null;
                const tier = paymentIntent.metadata?.tier || 'pro';
                console.log(`[Stripe webhook] payment_intent.succeeded: uid=${uid || 'MISSING'}, tier=${tier}`);
                if (uid) {
                    await UserProfileService.createOrUpdateProfile(uid, {
                        subscription_tier: tier,
                        subscription_status: 'active',
                        subscription_updated: new Date().toISOString()
                    });
                    console.log(`[Stripe webhook] Subscription updated to ${tier} for user ${uid}`);
                }
            } catch (error) {
                console.error('[Stripe webhook] Error updating subscription:', error);
                return res.status(500).json({ error: error.message });
            }
            break;
        }
        case 'payment_method.attached': {
            const paymentMethod = event.data.object;
            console.log('[Stripe webhook] PaymentMethod was attached to a Customer!');
            break;
        }
        default:
            console.log(`[Stripe webhook] Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
});

// GET /api/payment/sync-subscription — force sync with Stripe and refresh profile
router.get('/sync-subscription', requireResolvedUid, async (req, res) => {
    try {
        const uid = req.uid || req.query?.uid;
        if (!uid) return res.status(401).json({ error: 'Unauthorized' });

        console.log(`[Stripe sync] Starting sync for uid=${uid}`);
        
        const profile = await UserProfileService.getProfile(uid);
        console.log(`[Stripe sync] Current profile tier: ${profile?.subscription_tier}, stripe_customer_id: ${profile?.stripe_customer_id || 'none'}`);
        
        const customerId = profile?.stripe_customer_id;

        if (!customerId) {
            console.log(`[Stripe sync] No Stripe customer linked for uid=${uid}`);
            return res.json({
                synced: false,
                message: 'No Stripe customer linked to this account.',
                subscription_tier: profile?.subscription_tier || 'free'
            });
        }

        // Fetch active subscriptions from Stripe
        const subscriptions = await stripe.subscriptions.list({
            customer: customerId,
            status: 'active',
            limit: 5
        });
        
        console.log(`[Stripe sync] Found ${subscriptions.data.length} subscriptions for customer ${customerId}`);

        const activeSub = subscriptions.data.find(s => s.status === 'active' || s.status === 'trialing');

        if (activeSub) {
            const firstItem = activeSub.items?.data?.[0];
            const priceId = firstItem?.price?.id || null;
            const derivedTier = getTierFromPriceId(priceId) || activeSub.metadata?.tier || 'pro';
            
            console.log(`[Stripe sync] Active subscription found: id=${activeSub.id}, tier=${derivedTier}, status=${activeSub.status}`);

            // Force update even if values look the same (bypasses cache issues)
            await UserProfileService.createOrUpdateProfile(uid, {
                subscription_tier: derivedTier,
                subscription_status: activeSub.status,
                subscription_expiry: activeSub.current_period_end
                    ? new Date(activeSub.current_period_end * 1000).toISOString()
                    : null,
                stripe_subscription_id: activeSub.id,
                stripe_price_id: priceId,
                subscription_updated: new Date().toISOString()
            });
            
            console.log(`[Stripe sync] Profile updated to tier=${derivedTier} for uid=${uid}`);

            return res.json({
                synced: true,
                subscription_tier: derivedTier,
                subscription_status: activeSub.status,
                stripe_subscription_id: activeSub.id
            });
        }

        // No active subscription found in Stripe — ensure user is marked as free
        console.log(`[Stripe sync] No active subscription found in Stripe for uid=${uid}`);
        if (profile?.subscription_tier !== 'free') {
            await UserProfileService.createOrUpdateProfile(uid, {
                subscription_tier: 'free',
                subscription_status: 'cancelled',
                subscription_updated: new Date().toISOString()
            });
        }

        return res.json({
            synced: true,
            subscription_tier: 'free',
            message: 'No active subscription found in Stripe.'
        });
    } catch (error) {
        console.error('[Stripe] sync-subscription failed:', error);
        return res.status(500).json({ error: error.message || 'Failed to sync subscription' });
    }
});

module.exports = router;