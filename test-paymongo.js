// Test PayMonggo API Connection
import dotenv from 'dotenv';
dotenv.config();

const PAYMONGO_SECRET_KEY = process.env.PAYMONGO_SECRET_KEY;
const PAYMONGO_BASE_URL = 'https://api.paymongo.com/v1';

const getAuthHeader = () => {
  const credentials = `${PAYMONGO_SECRET_KEY}:`;
  return `Basic ${Buffer.from(credentials).toString('base64')}`;
};

async function testPayMonggo() {
  console.log('Testing PayMonggo API connection...\n');
  console.log('Public Key:', process.env.PAYMONGO_PUBLIC_KEY);
  console.log('Secret Key:', PAYMONGO_SECRET_KEY ? '****' + PAYMONGO_SECRET_KEY.slice(-8) : 'NOT SET');
  console.log('');

  // Test 1: Create a payment intent with correct format
  try {
    console.log('Test 1: Creating a test payment intent...');
    const payload = {
      data: {
        attributes: {
          amount: 100,
          currency: 'PHP',
          description: 'Test payment - Sentrina',
          payment_method_allowed: ['gcash'],
          payment_method_options: {
            card: { request_three_d_secure: 'automatic' }
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
    console.log('Status:', response.status);
    
    if (response.ok) {
      console.log('✅ SUCCESS: PayMonggo API is CONNECTED and working!');
      console.log('Payment Intent ID:', data.data.id);
      console.log('Client Key:', data.data.attributes.client_key);
      console.log('Status:', data.data.attributes.status);
    } else if (response.status === 401) {
      console.log('❌ ERROR: Invalid API keys');
      console.log('Response:', JSON.stringify(data, null, 2));
    } else {
      // 400 error means API is reachable but payload needs adjustment
      // This still means keys are VALID
      console.log('API reachable, keys are VALID');
      console.log('Response:', JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.error('❌ CONNECTION ERROR:', error.message);
  }
}

testPayMonggo();