import React, { useState } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';

const CheckoutForm = ({ amount, onSuccess, clientSecret }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [isProcessing, setIsProcessing] = useState(false);
    const [message, setMessage] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setIsProcessing(true);

        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: `${window.location.origin}/subscription`,
            },
        });

        if (error) {
            setMessage(error.message);
            setIsProcessing(false);
        } else {
            setMessage('Payment succeeded!');
            onSuccess();
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <PaymentElement />
            <button
                type="submit"
                disabled={!stripe || isProcessing}
                className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 disabled:opacity-50"
            >
                {isProcessing ? 'Processing...' : `Pay HK$${amount}`}
            </button>
            {message && <div className="mt-4 text-red-500">{message}</div>}
        </form>
    );
};

export default CheckoutForm;