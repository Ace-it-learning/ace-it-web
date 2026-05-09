const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');
const admin = require('firebase-admin');
const UserProfileService = require('../services/UserProfileService');
const { requireResolvedUid } = require('../middleware/requireResolvedUid');

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

// Webhook to handle Stripe events
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
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
        case 'payment_intent.succeeded':
            const paymentIntent = event.data.object;
            console.log('PaymentIntent was successful!');
            // Update user subscription in Firebase
            try {
                const customerEmail = paymentIntent.receipt_email;
                const tier = paymentIntent.metadata.tier || 'pro';
                // Get user by email
                const userRecord = await admin.auth().getUserByEmail(customerEmail);
                const uid = userRecord.uid;
                // Update user profile in active data store (Cosmos/Azure repos)
                await UserProfileService.createOrUpdateProfile(uid, {
                    subscription_tier: tier,
                    subscription_updated: new Date().toISOString()
                });
                console.log(`Subscription updated to ${tier} for user ${uid}`);
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