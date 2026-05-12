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

    const updateSubscriptionProfile = async (uid, subscription, explicitStatus) => {
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
    };

    // Handle the event
    switch (event.type) {
        case 'checkout.session.completed': {
            const checkoutSession = event.data.object;
            const uid = checkoutSession?.metadata?.uid;
            const tier = checkoutSession?.metadata?.tier;
            if (uid) {
                await UserProfileService.createOrUpdateProfile(uid, {
                    subscription_tier: tier || 'pro',
                    subscription_status: 'active',
                    stripe_customer_id: checkoutSession.customer || null,
                    stripe_subscription_id: checkoutSession.subscription || null,
                    subscription_updated: new Date().toISOString()
                });
                console.log(`[Stripe webhook] checkout.session.completed -> profile updated for ${uid}`);
            }
            break;
        }
        case 'customer.subscription.created':
        case 'customer.subscription.updated': {
            const subscription = event.data.object;
            const uid = subscription?.metadata?.uid;
            await updateSubscriptionProfile(uid, subscription);
            console.log(`[Stripe webhook] ${event.type} -> profile updated for ${uid || 'unknown uid'}`);
            break;
        }
        case 'customer.subscription.deleted': {
            const subscription = event.data.object;
            const uid = subscription?.metadata?.uid;
            await updateSubscriptionProfile(uid, subscription, 'cancelled');
            console.log(`[Stripe webhook] customer.subscription.deleted -> profile updated for ${uid || 'unknown uid'}`);
            break;
        }
        case 'invoice.payment_succeeded':
        case 'invoice.payment_failed': {
            const invoice = event.data.object;
            const subscriptionId = invoice?.subscription;
            if (subscriptionId) {
                const subscription = await stripe.subscriptions.retrieve(subscriptionId);
                const uid = subscription?.metadata?.uid;
                const status = event.type === 'invoice.payment_failed' ? 'past_due' : subscription.status;
                await updateSubscriptionProfile(uid, subscription, status);
                console.log(`[Stripe webhook] ${event.type} -> profile updated for ${uid || 'unknown uid'}`);
            }
            break;
        }
        case 'payment_intent.succeeded':
            const paymentIntent = event.data.object;
            console.log('PaymentIntent was successful!');
            try {
                const uid = paymentIntent.metadata?.uid || null;
                const tier = paymentIntent.metadata?.tier || 'pro';
                if (uid) {
                await UserProfileService.createOrUpdateProfile(uid, {
                    subscription_tier: tier,
                    subscription_status: 'active',
                    subscription_updated: new Date().toISOString()
                });
                console.log(`Subscription updated to ${tier} for user ${uid}`);
                }
            } catch (error) {
                console.error('Error updating subscription:', error);
            }
            break;
        case 'payment_method.attached':
            const paymentMethod = event.data.object;
            console.log('PaymentMethod was attached to a Customer!');
            break;
        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
});

module.exports = router;