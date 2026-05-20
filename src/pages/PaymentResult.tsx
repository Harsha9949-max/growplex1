import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { Loader2, AlertCircle } from "lucide-react";

export default function PaymentResult() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("order_id");
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) {
      setError("No order ID found in the payment response.");
      setLoading(false);
      return;
    }

    const checkStatus = async () => {
      try {
        // Fetch order details from Firestore
        const orderRef = doc(db, "orders", orderId);
        const orderSnap = await getDoc(orderRef);

        if (!orderSnap.exists()) {
          setError(`Order with ID ${orderId} could not be found.`);
          setLoading(false);
          return;
        }

        // Verify with real Cashfree server endpoint
        const verifyRes = await fetch(`/api/cashfree/verify-order?order_id=${orderId}`);
        const verifyData = await verifyRes.json();

        if (verifyRes.ok && verifyData.paymentStatus === "paid") {
          // Redirect to success route
          navigate("/success", { state: { orderId } });
        } else {
          // If failed
          navigate("/failed");
        }
      } catch (err: any) {
        console.error("Verification error:", err);
        setError("An error occurred while verifying the payment. Please refresh or contact support.");
      } finally {
        setLoading(false);
      }
    };

    checkStatus();
  }, [orderId, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-brand-primary text-text-main font-sans">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center p-4">
          <Loader2 className="animate-spin text-brand-accent mb-4" size={48} />
          <h2 className="text-xl font-bold">Verifying Payment Status...</h2>
          <p className="text-text-muted text-sm mt-1">Please do not refresh or close this tab.</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-brand-primary text-text-main font-sans">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center p-4">
          <div className="max-w-md w-full bg-brand-surface border border-brand-border rounded-2xl p-8 text-center shadow-2xl relative overflow-hidden">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
              <AlertCircle size={32} />
            </div>
            <h2 className="text-2xl font-bold font-heading mb-2">Verification Error</h2>
            <p className="text-text-muted text-sm mb-6 leading-relaxed">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-brand-accent text-brand-primary font-bold py-3.5 rounded-xl transition duration-300 hover:bg-brand-accent-hover"
            >
              Retry Verification
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return null;
}
