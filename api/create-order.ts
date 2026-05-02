import Razorpay from "razorpay";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const { amount, currency, receipt } = req.body;

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });

    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: currency || "INR",
      receipt,
    });

    res.status(200).json({ ...order, key_id: process.env.RAZORPAY_KEY_ID });
  } catch (error) {
    console.error("Create order error:", error);
    res.status(500).json({
      error: "Order creation failed"
    });
  }
}
