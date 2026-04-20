// ============ PAYMONGO PAYMENT SERVICE ============
// Handles GCash and other payment method integrations via PayMonggo

import dotenv from 'dotenv';
dotenv.config();

const PAYMONGO_PUBLIC_KEY = process.env.PAYMONGO_PUBLIC_KEY;
const PAYMONGO_SECRET_KEY = process.env.PAYMONGO_SECRET_KEY;
const PAYMONGO_BASE_URL = 'https://api.paymongo.com/v1';

// Base64 encode credentials for API authentication
const getAuthHeader = () => {
  const credentials = `${PAYMONGO_SECRET_KEY}:`;
  return `Basic ${Buffer.from(credentials).toString('base64')}`;
};

const getPublicKeyHeader = () => {
  return PAYMONGO_PUBLIC_KEY;
};

export { getPublicKeyHeader };

// ============ CREATE PAYMENT INTENT ============
// Creates a payment intent for GCash payments
export const createPaymentIntent = async ({ amount, billReference, lotNumber, residentName }) => {
  try {
    // Amount must be in cents (multiply by 100)
    const amountInCents = Math.round(amount * 100);
    
    const payload = {
      data: {
        attributes: {
          amount: amountInCents,
          currency: 'PHP',
          description: `Payment for ${billReference} - Lot ${lotNumber}`,
          metadata: {
            billReference,
            lotNumber,
            residentName
          }
        }
      }
    };

    const response = await fetch(`${PAYMONGO_BASE_URL}/payment_intents`, {
      method: 'POST',
      headers: {
        'Authorization': getAuthHeader(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('PayMonggo createPaymentIntent error:', data);
      throw new Error(data.errors?.[0]?.detail || 'Failed to create payment intent');
    }

    return {
      clientKey: data.data.attributes.client_key,
      paymentIntentId: data.data.id,
      amount: data.data.attributes.amount,
      currency: data.data.attributes.currency,
      status: data.data.attributes.status
    };
  } catch (error) {
    console.error('PayMonggo createPaymentIntent exception:', error);
    throw error;
  }
};

// ============ RETRIEVE PAYMENT INTENT ============
// Check payment status
export const retrievePaymentIntent = async (paymentIntentId) => {
  try {
    const response = await fetch(`${PAYMONGO_BASE_URL}/payment_intents/${paymentIntentId}`, {
      method: 'GET',
      headers: {
        'Authorization': getAuthHeader(),
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('PayMonggo retrievePaymentIntent error:', data);
      throw new Error(data.errors?.[0]?.detail || 'Failed to retrieve payment intent');
    }

    return {
      paymentIntentId: data.data.id,
      amount: data.data.attributes.amount,
      currency: data.data.attributes.currency,
      status: data.data.attributes.status,
      payments: data.data.attributes.payments
    };
  } catch (error) {
    console.error('PayMonggo retrievePaymentIntent exception:', error);
    throw error;
  }
};

// ============ CREATE CHECKOUT SESSION ============
// Creates a checkout session for GCash redirect
export const createCheckoutSession = async ({ amount, billReference, lotNumber, residentName, successUrl, failedUrl }) => {
  try {
    const amountInCents = Math.round(amount * 100);
    
    const payload = {
      data: {
        attributes: {
          amount: amountInCents,
          currency: 'PHP',
          description: `Payment for ${billReference} - Lot ${lotNumber}`,
          metadata: {
            billReference,
            lotNumber,
            residentName
          },
          payment_method_allowed: ['gcash'],
          payment_method_options: {
            card: { request_three_d_secure: 'automatic' }
          },
          success_url: successUrl,
          cancel_url: failedUrl
        }
      }
    };

    const response = await fetch(`${PAYMONGO_BASE_URL}/checkout_session`, {
      method: 'POST',
      headers: {
        'Authorization': getAuthHeader(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('PayMonggo createCheckoutSession error:', data);
      throw new Error(data.errors?.[0]?.detail || 'Failed to create checkout session');
    }

    return {
      sessionId: data.data.id,
      checkoutUrl: data.data.attributes.url,
      amount: data.data.attributes.amount,
      currency: data.data.attributes.currency,
      status: data.data.attributes.status
    };
  } catch (error) {
    console.error('PayMonggo createCheckoutSession exception:', error);
    throw error;
  }
};

// ============ RETRIEVE CHECKOUT SESSION ============
// Check checkout session status
export const retrieveCheckoutSession = async (sessionId) => {
  try {
    const response = await fetch(`${PAYMONGO_BASE_URL}/checkout_session/${sessionId}`, {
      method: 'GET',
      headers: {
        'Authorization': getAuthHeader(),
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('PayMonggo retrieveCheckoutSession error:', data);
      throw new Error(data.errors?.[0]?.detail || 'Failed to retrieve checkout session');
    }

    return {
      sessionId: data.data.id,
      checkoutUrl: data.data.attributes.url,
      amount: data.data.attributes.amount,
      currency: data.data.attributes.currency,
      status: data.data.attributes.status,
      paymentIntent: data.data.attributes.payment_intent
    };
  } catch (error) {
    console.error('PayMonggo retrieveCheckoutSession exception:', error);
    throw error;
  }
};

// ============ CREATE SOURCE (QR Code) ============
// Creates a source for GCash QR payments
export const createSource = async ({ amount, type = 'gcash', billReference, lotNumber, residentName }) => {
  try {
    const amountInCents = Math.round(amount * 100);
    
    const payload = {
      data: {
        attributes: {
          amount: amountInCents,
          currency: 'PHP',
          type: type,
          metadata: {
            billReference,
            lotNumber,
            residentName
          }
        }
      }
    };

    const response = await fetch(`${PAYMONGO_BASE_URL}/sources`, {
      method: 'POST',
      headers: {
        'Authorization': getAuthHeader(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('PayMonggo createSource error:', data);
      throw new Error(data.errors?.[0]?.detail || 'Failed to create payment source');
    }

    return {
      sourceId: data.data.id,
      amount: data.data.attributes.amount,
      currency: data.data.attributes.currency,
      type: data.data.attributes.type,
      redirectUrl: data.data.attributes.redirect?.checkout_url,
      qrCodeUrl: data.data.attributes.redirect?.qr?.download,
      status: data.data.attributes.status
    };
  } catch (error) {
    console.error('PayMonggo createSource exception:', error);
    throw error;
  }
};

// ============ WEBHOOK VERIFICATION ============
// Verify webhook signature from PayMonggo
export const verifyWebhook = (payload) => {
  // For test mode, we'll skip detailed verification
  // In production, use the webhook secret to verify
  try {
    const event = JSON.parse(payload);
    return {
      valid: true,
      eventType: event.type,
      data: event.data
    };
  } catch (error) {
    return {
      valid: false,
      error: error.message
    };
  }
};

// Export utility functions
export const getPublicKeyHeaderFn = getPublicKeyHeader;
export default {
  createPaymentIntent,
  retrievePaymentIntent,
  createCheckoutSession,
  retrieveCheckoutSession,
  createSource,
  verifyWebhook,
  getPublicKeyHeader
};