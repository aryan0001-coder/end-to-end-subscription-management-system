// PaymentForm.tsx - React component for handling Stripe card input and subscription creation
// Uses Stripe Elements for secure card entry and communicates with backend to create a subscription
import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useAuth } from './contexts/AuthContext';

function PaymentForm() {
  // Get Stripe.js and Elements context
  const stripe = useStripe();
  const elements = useElements();
  const { user, token } = useAuth();
  // Local state for status messages and loading spinner
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  // TODO: Replace with actual price ID from your app
  const priceId = 'price_1RketrFgJ53AeXCqeRGdPmjb';

  // Handles form submission and subscription creation
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('');
    setLoading(true);

    // Check if user is authenticated
    if (!user || !token) {
      setStatus('Please login to subscribe.');
      setLoading(false);
      return;
    }

    // Ensure Stripe.js and Elements are loaded
    if (!stripe || !elements) {
      setStatus('Stripe.js has not loaded yet.');
      setLoading(false);
      return;
    }

    // Get the card details from the CardElement
    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setStatus('Card element not found.');
      setLoading(false);
      return;
    }

    // Create a PaymentMethod in Stripe
    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: cardElement as any, // Explicitly cast to correct type
    });

    if (error) {
      setStatus(error.message || 'Payment method creation failed.');
      setLoading(false);
      return;
    }

    // Send paymentMethod.id and priceId to your backend to create the subscription
    const response = await fetch('http://localhost:3001/subscriptions/elements-subscribe', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        priceId,
        paymentMethodId: paymentMethod.id,
      }),
    });

    if (response.ok) {
      setStatus('Subscription created successfully!');
    } else {
      const data = await response.json();
      setStatus(data.message || 'Subscription failed.');
    }
    setLoading(false);
  };

  // Show login message if user is not authenticated
  if (!user || !token) {
    return (
      <div style={{
        maxWidth: 400,
        margin: '40px auto',
        padding: 32,
        borderRadius: 16,
        boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
        background: '#fff',
        fontFamily: 'system-ui, sans-serif',
        textAlign: 'center',
      }}>
        <h2>Please Login to Subscribe</h2>
        <p>You need to be logged in to create a subscription.</p>
      </div>
    );
  }

  // Render the payment form UI
  return (
    <div style={{
      maxWidth: 400,
      margin: '40px auto',
      padding: 32,
      borderRadius: 16,
      boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
      background: '#fff',
      fontFamily: 'system-ui, sans-serif',
    }}>
      <h2 style={{ textAlign: 'center', marginBottom: 24 }}>Subscribe</h2>
      <p style={{ textAlign: 'center', marginBottom: 24, color: '#666' }}>
        Welcome, {user.email}!
      </p>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 24 }}>
          {/* Stripe CardElement for secure card input */}
          <CardElement options={{
            style: {
              base: {
                fontSize: '18px',
                color: '#32325d',
                '::placeholder': { color: '#a0aec0' },
                padding: '12px 8px',
              },
              invalid: { color: '#e53e3e' },
            },
          }} />
        </div>
        <button
          type="submit"
          disabled={!stripe || loading}
          style={{
            width: '100%',
            padding: '14px 0',
            fontSize: 18,
            borderRadius: 8,
            border: 'none',
            background: '#635bff',
            color: '#fff',
            fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer',
            boxShadow: '0 2px 8px rgba(99,91,255,0.10)',
            transition: 'background 0.2s',
          }}
        >
          {loading ? 'Processing...' : 'Subscribe'}
        </button>
        {/* Show status message after submission */}
        {status && (
          <div style={{
            marginTop: 24,
            color: status.includes('success') ? '#38a169' : '#e53e3e',
            textAlign: 'center',
            fontWeight: 500,
          }}>{status}</div>
        )}
      </form>
    </div>
  );
}

export default PaymentForm; 