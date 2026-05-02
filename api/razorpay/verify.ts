import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature 
    } = req.body;

    const RAZORPAY_KEY_SECRET = (process.env.RAZORPAY_KEY_SECRET || '').trim();

    // Diagnostic logging
    console.log('Razorpay Verify Diagnostic:', {
      secretLength: RAZORPAY_KEY_SECRET.length,
      envSecretPresent: !!process.env.RAZORPAY_KEY_SECRET
    });

    if (!RAZORPAY_KEY_SECRET) {
      console.error('RAZORPAY_KEY_SECRET missing for verification');
      return res.status(500).json({ error: 'Razorpay secret not configured in AI Studio Settings > Secrets.' });
    }

    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac('sha256', RAZORPAY_KEY_SECRET)
      .update(sign)
      .digest('hex');

    if (razorpay_signature === expectedSign) {
      return res.status(200).json({ 
        success: true,
        paymentId: razorpay_payment_id
      });
    } else {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid signature' 
      });
    }

  } catch (error: any) {
    console.error('Razorpay verify error:', error);
    return res.status(500).json({ error: error.message });
  }
}
