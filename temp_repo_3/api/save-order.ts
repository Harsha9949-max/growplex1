import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import TelegramBot from "node-telegram-bot-api";

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

const db = getFirestore();

let bot: TelegramBot | null = null;
if (process.env.TELEGRAM_BOT_TOKEN) {
  bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: false });
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const data = req.body;
    const randomNum = Math.floor(10000000 + Math.random() * 90000000);
    const orderId = `GRX-${randomNum}`;

    await db.collection("orders").add({
      ...data,
      orderId,
      orderStatus: "new",
      createdAt: FieldValue.serverTimestamp(),
    });

    // Telegram notification
    if (bot && process.env.TELEGRAM_CHAT_ID) {
      const { customerName, phone, serviceName, packageQuantity, price } = data;
      const message = `New Growplex Order\n\nOrder ID:\n${orderId}\n\nCustomer:\n${customerName}\n\nPhone:\n${phone}\n\nService:\n${serviceName}\n\nPackage:\n${packageQuantity}\n\nAmount:\n₹${price}\n\nStatus:\nNew Order`;
      bot.sendMessage(process.env.TELEGRAM_CHAT_ID, message).catch((err: any) => {
         console.error("Telegram notification failed:", err);
      });
    }

    res.status(200).json({
      success: true,
      orderId,
      id: orderId // Add this to preserve frontend compatibility
    });
  } catch (error) {
    console.error("Firestore error:", error);
    res.status(500).json({
      error: "Order save failed"
    });
  }
}
