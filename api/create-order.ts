import Razorpay from "razorpay";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const { amount, currency, receipt } = req.body;

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.error("Razorpay keys not found in environment variables");
      return res.status(500).json({
        error: "Razorpay keys not configured. Please add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in Vercel Environment Variables."
      });
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
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
  } catch (error) {
    console.error("Create order error:", error);
    res.status(500).json({
      error: "Order creation failed"
    });
  }
}
