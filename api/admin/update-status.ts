import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

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

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  
  const { orderId, status } = req.body;
  try {
     const snapshot = await db.collection("orders").where("orderId", "==", orderId).get();
     if (!snapshot.empty) {
        const docRef = snapshot.docs[0].ref;
        await docRef.update({ orderStatus: status });
        return res.status(200).json({ success: true });
     }
     return res.status(404).json({ error: "Order not found" });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Failed to update" });
  }
}
