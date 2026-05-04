
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { amount } = req.body;

    if (!amount || isNaN(Number(amount)) || Number(amount) < 1) {
      return res.status(400).json({ error: 'Invalid amount. Minimum ₹1 is required.' });
    }

    const RAZORPAY_KEY_ID = (process.env.RAZORPAY_KEY_ID || '').trim();
    const RAZORPAY_KEY_SECRET = (process.env.RAZORPAY_KEY_SECRET || '').trim();

    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
      console.error('Razorpay credentials missing');
      return res.status(500).json({ 
        error: 'Razorpay credentials not configured. Please add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in AI Studio Settings > Secrets.' 
      });
    }

    // Diagnostic logging (safe version)
    console.log('Razorpay Order Request Diagnostic:', {
      keyId: `${RAZORPAY_KEY_ID.substring(0, 8)}...${RAZORPAY_KEY_ID.substring(RAZORPAY_KEY_ID.length - 4)}`,
      keyIdLength: RAZORPAY_KEY_ID.length,
      secretLength: RAZORPAY_KEY_SECRET.length,
      secretStart: RAZORPAY_KEY_SECRET.substring(0, 3),
      secretEnd: RAZORPAY_KEY_SECRET.substring(RAZORPAY_KEY_SECRET.length - 3),
      amountPaise: Math.round(Number(amount) * 100)
    });

    // Manual fetch for more control and direct error inspection
    const auth = Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64');
    
    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount: Math.round(Number(amount) * 100),
        currency: 'INR',
        receipt: `rcpt_${Date.now()}`
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Razorpay API Error Detail:', JSON.stringify(data, null, 2));
      
      if (response.status === 401) {
        return res.status(401).json({ 
          error: 'Authentication failed: Your Razorpay Key ID or Secret is incorrect. Please double-check them in AI Studio Settings > Secrets. Ensure there are no extra spaces.',
          debug: {
            keyIdLength: RAZORPAY_KEY_ID.length,
            secretLength: RAZORPAY_KEY_SECRET.length
          }
        });
      }

      return res.status(response.status).json({
        error: data.error?.description || `Razorpay API error (${response.status})`,
        code: data.error?.code
      });
    }

    return res.status(200).json(data);

  } catch (error: any) {
    console.error('Razorpay order handler error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error during order creation' });
  }
}
