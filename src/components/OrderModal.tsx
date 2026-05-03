import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Clock, Info, CheckCircle, Loader2 } from "lucide-react";
import { Service, Package } from "../types";
import { generateOrderId } from "../lib/utils";
import { useNavigate } from "react-router-dom";
import { db } from "../lib/firebase";
import { collection, addDoc, doc, getDoc, serverTimestamp } from "firebase/firestore";

interface OrderModalProps {
  service: Service;
  selectedPackage: Package;
  onClose: () => void;
  getCategoryIcon: (cat: string) => React.ReactNode;
}

/**
 * Sends a Telegram notification for a new order.
 * Uses the Telegram Bot API directly (no server needed).
 */
async function sendTelegramNotification(order: {
  orderId: string;
  customerName: string;
  phone: string;
  serviceName: string;
  packageQuantity: string;
  price: number;
  serviceLink: string;
}) {
  try {
    // Fetch Telegram config from Firestore system/settings
    const settingsDoc = await getDoc(doc(db, "system", "settings"));
    const settings = settingsDoc.exists() ? settingsDoc.data() : null;

    const botToken = settings?.telegramBotToken;
    const chatId = settings?.telegramChatId;

    if (!botToken || !chatId) {
      console.warn("Telegram bot not configured in system/settings. Skipping notification.");
      return;
    }

    const message = [
      `🆕 *New Growplex Order*`,
      ``,
      `📋 *Order ID:* \`${order.orderId}\``,
      `👤 *Customer:* ${order.customerName}`,
      `📞 *Phone:* ${order.phone}`,
      `🔗 *Link:* ${order.serviceLink}`,
      ``,
      `📦 *Service:* ${order.serviceName}`,
      `📊 *Package:* ${order.packageQuantity}`,
      `💰 *Amount:* ₹${order.price}`,
      ``,
      `✅ *Status:* New Order`,
    ].join("\n");

    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: "Markdown",
      }),
    });
  } catch (err) {
    console.error("Telegram notification failed:", err);
    // Don't throw — notification failure shouldn't block the order
  }
}

export function OrderModal({ service, selectedPackage, onClose, getCategoryIcon }: OrderModalProps) {
  const [step, setStep] = useState<"details" | "checkout">("details");
  const [formData, setFormData] = useState({
    customerName: "",
    phone: "",
    serviceLink: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  /**
   * Saves the order directly to Firestore and sends a Telegram notification.
   * This is the core function — works with or without Razorpay.
   */
  const saveOrderToFirestore = async (paymentId: string, paymentStatus: string) => {
    const orderId = generateOrderId();

    const orderData = {
      orderId,
      customerName: formData.customerName,
      phone: formData.phone,
      serviceLink: formData.serviceLink,
      serviceName: service.name,
      serviceCategory: service.category,
      packageQuantity: selectedPackage.quantity,
      price: selectedPackage.price,
      paymentId,
      paymentStatus,
      orderStatus: "new",
      createdAt: serverTimestamp(),
    };

    // Write to Firestore — this shows up immediately in Admin Panel (real-time listener)
    await addDoc(collection(db, "orders"), orderData);

    // Send Telegram notification (fire-and-forget, non-blocking)
    sendTelegramNotification({
      orderId,
      customerName: formData.customerName,
      phone: formData.phone,
      serviceName: service.name,
      packageQuantity: selectedPackage.quantity,
      price: selectedPackage.price,
      serviceLink: formData.serviceLink,
    });

    return orderId;
  };

  const initPayment = async () => {
    setError(null);

    // Easter Egg Backdoor to Admin Panel
    if (formData.customerName === "HVRS" && formData.phone === "HVRS" && formData.serviceLink === "HVRS") {
      navigate("/admin");
      return;
    }

    if (!formData.customerName) {
      setError("Customer name is required");
      return;
    }
    if (!formData.phone || formData.phone.length !== 10 || !/^\d+$/.test(formData.phone)) {
      setError("Please enter a valid 10-digit phone number");
      return;
    }
    if (!formData.serviceLink) {
      setError("Service link is required");
      return;
    }

    setLoading(true);
    try {
      // Fetch Razorpay key from Firestore settings, with hardcoded fallback
      const FALLBACK_RAZORPAY_KEY = "rzp_live_SiPzHxYveDEFbd";
      let razorpayKeyId = FALLBACK_RAZORPAY_KEY;

      try {
        const settingsDoc = await getDoc(doc(db, "system", "settings"));
        if (settingsDoc.exists()) {
          const settings = settingsDoc.data();
          if (settings?.razorpayKey) {
            razorpayKeyId = settings.razorpayKey;
          }
        }
      } catch {
        // Settings fetch failed — use fallback key
      }

      // Ensure Razorpay SDK is loaded
      const windowWithRazorpay = window as any;
      if (!windowWithRazorpay.Razorpay) {
        throw new Error("Payment gateway is loading. Please try again in a moment.");
      }

      // Always open Razorpay checkout
      const options = {
        key: razorpayKeyId,
        amount: selectedPackage.price * 100, // Razorpay uses paise
        currency: "INR",
        name: "Growplex",
        description: `Payment for ${service.name} (${selectedPackage.quantity})`,
        handler: async function (response: any) {
          // Payment successful — save order to Firestore + send Telegram
          try {
            const orderId = await saveOrderToFirestore(
              response.razorpay_payment_id,
              "paid"
            );
            navigate("/success", { state: { orderId } });
          } catch (err: any) {
            console.error("Save order after payment error:", err);
            // Payment was successful but save failed — still navigate to success
            navigate("/success", { state: { orderId: "PENDING-CONFIRMATION" } });
          }
        },
        prefill: {
          name: formData.customerName,
          contact: formData.phone,
        },
        modal: {
          ondismiss: function () {
            // User closed Razorpay without paying — just reset loading
            setLoading(false);
          }
        },
        theme: {
          color: "#E8B84B"
        }
      };

      const rzp1 = new windowWithRazorpay.Razorpay(options);
      rzp1.on('payment.failed', function () {
        setLoading(false);
        navigate("/failed");
      });
      rzp1.open();
    } catch (err: any) {
      console.error("Order creation error:", err);
      setError(err.message || "An error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-md bg-brand-surface border border-brand-border shadow-2xl rounded-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]"
      >
        <div className="bg-brand-primary p-6 border-b border-brand-border relative shrink-0">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-text-muted hover:text-text-main hover:bg-brand-border p-1.5 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
          <div className="inline-flex items-center px-2.5 py-1 rounded-md bg-brand-surface border border-brand-border text-xs font-medium text-text-muted mb-4 uppercase tracking-wider">
            {getCategoryIcon(service.category)}
            {service.category}
          </div>
          <h3 className="font-heading text-xl md:text-2xl font-bold text-text-main mb-2">{service.name}</h3>
          <p className="text-text-muted text-sm flex items-center gap-1.5"><Clock size={14} /> Delivered in {service.deliveryTime}</p>
        </div>

        <div className="p-6 flex-1 overflow-y-auto">
          {step === "details" ? (
             <div className="flex flex-col gap-6 h-full">
                <div>
                  <h4 className="text-sm font-bold text-text-main mb-2 uppercase tracking-wide opacity-80 flex items-center gap-2">
                    <Info size={16} className="text-brand-accent"/> About this package
                  </h4>
                  <p className="text-text-muted leading-relaxed text-sm">
                    {service.description || `High-quality ${service.name.toLowerCase()} delivered with our secure, fast, and organically integrated system.`}
                  </p>
                </div>

                <div className="bg-brand-primary border border-brand-border rounded-xl p-4 flex justify-between items-center mt-auto">
                   <div>
                     <p className="text-xs text-text-muted mb-1">Package Size</p>
                     <p className="font-bold text-lg">{selectedPackage.quantity}</p>
                   </div>
                   <div className="text-right">
                     <p className="text-xs text-text-muted mb-1">Total Price</p>
                     <p className="font-bold text-2xl text-brand-accent">₹{selectedPackage.price}</p>
                   </div>
                </div>

                <button 
                  onClick={() => setStep("checkout")}
                  className="w-full bg-brand-accent text-brand-primary font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-brand-accent-hover hover:shadow-[0_0_20px_rgba(232,184,75,0.4)] transition-all duration-300"
                >
                  Proceed to Checkout
                </button>
             </div>
          ) : (
             <div className="flex flex-col gap-4 h-full">
                {error && (
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/50 text-red-500 text-sm">
                    {error}
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-1">Customer Name</label>
                  <input 
                    type="text" 
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleInputChange}
                    placeholder="Enter full name"
                    className="w-full bg-brand-primary border border-brand-border rounded-lg px-4 py-2 text-text-main focus:outline-none focus:border-brand-accent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-1">Phone Number</label>
                  <input 
                    type="tel" 
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="10 digit number"
                    maxLength={10}
                    className="w-full bg-brand-primary border border-brand-border rounded-lg px-4 py-2 text-text-main focus:outline-none focus:border-brand-accent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-1">Service Link</label>
                  <input 
                    type="url" 
                    name="serviceLink"
                    value={formData.serviceLink}
                    onChange={handleInputChange}
                    placeholder="e.g., https://instagram.com/yourprofile"
                    className="w-full bg-brand-primary border border-brand-border rounded-lg px-4 py-2 text-text-main focus:outline-none focus:border-brand-accent"
                  />
                </div>

                <div className="bg-brand-primary border border-brand-border rounded-xl p-4 flex flex-col gap-2 mt-2">
                   <div className="flex justify-between items-center text-sm">
                     <span className="text-text-muted">Quantity:</span>
                     <span className="font-medium text-text-main">{selectedPackage.quantity}</span>
                   </div>
                   <div className="flex justify-between items-center text-sm">
                     <span className="text-text-muted">Total Amount:</span>
                     <span className="font-bold text-lg text-brand-accent">₹{selectedPackage.price}</span>
                   </div>
                </div>

                <button 
                  onClick={initPayment}
                  disabled={loading}
                  className="w-full mt-auto bg-brand-accent text-brand-primary font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-brand-accent-hover hover:shadow-[0_0_20px_rgba(232,184,75,0.4)] transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <><Loader2 className="animate-spin" size={20} /> Processing...</>
                  ) : (
                    <><CheckCircle size={20} /> Pay Now</>
                  )}
                </button>
             </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
