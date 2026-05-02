import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Clock, Info, CheckCircle, Loader2 } from "lucide-react";
import { Service, Package } from "../types";
import { generateOrderId } from "../lib/utils";
import { useNavigate } from "react-router-dom";

interface OrderModalProps {
  service: Service;
  selectedPackage: Package;
  onClose: () => void;
  getCategoryIcon: (cat: string) => React.ReactNode;
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
      // 1. Create order on backend (mocked API call)
      const orderId = generateOrderId();
      const amount = selectedPackage.price;
      
      const response = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: amount,
          currency: "INR",
          receipt: orderId
        })
      });

      if (!response.ok) {
        throw new Error("Failed to create order");
      }

      const orderData = await response.json();

      const handlePaymentSuccess = async (paymentId: string) => {
        try {
          const res = await fetch("/api/save-order", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              paymentId,
              customerName: formData.customerName,
              phone: formData.phone,
              serviceName: service.name,
              packageQuantity: selectedPackage.quantity,
              price: selectedPackage.price,
              paymentStatus: "paid"
            })
          });
          const data = await res.json();
          if (data.id) {
             navigate("/success", { state: { orderId: data.id } });
          } else {
             throw new Error("Failed to save order");
          }
        } catch (err: any) {
          console.error("Save order error:", err);
          // If server fails after payment, still send to success but without ID or with a fallback ID
          navigate("/success", { state: { orderId: "PENDING-CONFIRMATION" } });
        }
      };

      // 2. Initialize Razorpay
      if (orderData.key_id === "rzp_test_mockkey") {
         setTimeout(() => {
            handlePaymentSuccess("pay_mock_123456");
         }, 1500);
         return;
      }

      const options = {
        key: orderData.key_id, // Fetched from backend
        amount: orderData.amount, 
        currency: orderData.currency,
        name: "Growplex",
        description: `Payment for ${service.name} (${selectedPackage.quantity})`,
        order_id: orderData.id, 
        handler: async function (response: any) {
          // Verify payment, generate order ID, redirect
          await handlePaymentSuccess(response.razorpay_payment_id);
        },
        prefill: {
          name: formData.customerName,
          contact: formData.phone,
        },
        theme: {
          color: "#E8B84B"
        }
      };

      const windowWithRazorpay = window as any;
      if (windowWithRazorpay.Razorpay) {
        const rzp1 = new windowWithRazorpay.Razorpay(options);
        rzp1.on('payment.failed', function (response: any){
          navigate("/failed");
        });
        rzp1.open();
      } else {
        throw new Error("Razorpay SDK failed to load");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred");
    } finally {
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
