import Razorpay from "razorpay";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const { amount, currency, receipt } = req.body;

    const key_id = process.env.RAZORPAY_KEY_ID?.trim();
    const key_secret = process.env.RAZORPAY_KEY_SECRET?.trim();

    if (!key_id || !key_secret) {
      console.error("Razorpay keys not found in environment variables");
      return res.status(500).json({
        error: "Razorpay keys not configured. Please add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in Vercel Environment Variables."
      });
    }

    const razorpay = new Razorpay({
      key_id,
      key_secret,
    });

    const order = await razorpay.orders.create({
      amount: amount,
      currency: currency || "INR",
      receipt,
    });

    // Remap id to order_id for consistency with the prompt instructions
    res.status(200).json({ 
      order_id: order.id, 
      amount: order.amount, 
      currency: order.currency,
      key_id: process.env.RAZORPAY_KEY_ID 
    });
  } catch (error: any) {
    console.error("Create order error:", error);
    let errorMessage = "Order creation failed";
    
    // Razorpay often sends error details inside error.error.description
    if (error.error && error.error.description) {
      errorMessage = error.error.description;
    } else if (error.message) {
      errorMessage = error.message;
    }

    res.status(500).json({
      error: errorMessage,
      details: error
    });
  }
}
