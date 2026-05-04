import { collection, getDocs, query, where } from "firebase/firestore";
import { AlertCircle, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db } from "../lib/firebase";

export default function ReceiptViewer() {
  const { orderId } = useParams();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReceipt = async () => {
      try {
        if (!orderId) {
           setError("No Order ID provided.");
           return;
        }

        const q = query(collection(db, "orders"), where("orderId", "==", orderId));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          setError("Order not found or no receipt uploaded.");
        } else {
          const doc = querySnapshot.docs[0];
          const data = doc.data();
          if (data.paymentScreenshotUrl) {
            setImageUrl(data.paymentScreenshotUrl);
          } else {
            setError("No receipt image attached to this order.");
          }
        }
      } catch (err) {
        console.error("Failed to fetch receipt:", err);
        setError("Failed to load receipt.");
      } finally {
        setLoading(false);
      }
    };

    fetchReceipt();
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-primary flex flex-col items-center justify-center p-4">
        <Loader2 className="animate-spin text-brand-accent mb-4" size={48} />
        <p className="text-text-muted">Loading receipt...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-brand-primary flex flex-col items-center justify-center p-4">
        <AlertCircle className="text-red-500 mb-4" size={48} />
        <p className="text-text-main font-semibold mb-2">{error}</p>
        <p className="text-text-muted text-sm max-w-md text-center">
          The requested receipt is not available or an error occurred.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-primary flex flex-col items-center p-4 md:p-8">
      <div className="bg-brand-surface border border-brand-border rounded-xl p-4 md:p-8 max-w-3xl w-full shadow-2xl">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-heading font-bold text-text-main">Order Receipt</h1>
          <p className="text-text-muted">Order ID: {orderId}</p>
        </div>
        
        {imageUrl && (
          <div className="relative rounded-lg overflow-hidden border border-brand-border bg-black/40">
            <img 
              src={imageUrl} 
              alt="Payment Receipt" 
              className="w-full h-auto max-h-[70vh] object-contain mx-auto"
            />
          </div>
        )}
      </div>
    </div>
  );
}
