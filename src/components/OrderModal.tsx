import { addDoc, collection, doc, getDoc, serverTimestamp } from "firebase/firestore";
import { ArrowLeft, Camera, Check, CheckCircle, Clock, Copy, IndianRupee, Info, Loader2, Upload, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { QRCodeSVG } from "qrcode.react";
import React, { useCallback, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../lib/firebase";
import { generateOrderId } from "../lib/utils";
import { Package, Service } from "../types";

interface OrderModalProps {
  service: Service;
  selectedPackage: Package;
  onClose: () => void;
  getCategoryIcon: (cat: string) => React.ReactNode;
}

// UPI Payment destination
const UPI_ID = "harshahvr@fam";
const UPI_NAME = "Growplex";

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
  screenshotUrl?: string; // Optional screenshot URL to send as photo
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

    const chatIds = chatId.split(",").map((id: string) => id.trim()).filter(Boolean);

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
    ].join("\n");

    const promises = chatIds.map(async (id: string) => {
      if (order.screenshotUrl) {
        if (order.screenshotUrl.startsWith("data:image")) {
          const form = new FormData();
          form.append("chat_id", id);
          form.append("caption", message);
          form.append("parse_mode", "Markdown");

          // Convert base64 to blob
          const res = await fetch(order.screenshotUrl);
          const blob = await res.blob();
          form.append("photo", blob, "payment.jpg");

          await fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
            method: "POST",
            body: form,
          });
        } else {
          await fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: id,
              photo: order.screenshotUrl,
              caption: message,
              parse_mode: "Markdown",
            }),
          });
        }
      } else {
        await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: id,
            text: message,
            parse_mode: "Markdown",
          }),
        });
      }
    });

    await Promise.allSettled(promises);
  } catch (err) {
    console.error("Telegram notification failed:", err);
    // Don't throw — notification failure shouldn't block the order
  }
}

export function OrderModal({ service, selectedPackage, onClose, getCategoryIcon }: OrderModalProps) {
  const [step, setStep] = useState<"details" | "checkout" | "payment">("details");
  const [formData, setFormData] = useState({
    customerName: "",
    phone: "",
    serviceLink: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [screenshotName, setScreenshotName] = useState<string | null>(null);
  const [upiCopied, setUpiCopied] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const [finalQuantity, setFinalQuantity] = useState<string>(selectedPackage.quantity);
  
  // calculate the rate cleanly to avoid compounding rounding errors
  const isSynced = service.type === 'synced' && service.baseRateUsd !== undefined;
  
  const ratePer1000 = isSynced 
    ? (service.baseRateUsd || 0) * 84 * (1 + (service.marginPercentage || 0) / 100)
    : undefined;
    
  // parse the starting quantity for non-synced fallback
  const startQtyNum = parseFloat(selectedPackage.quantity.replace(/[^0-9.-]/g, "")) || 1;
  const unitPrice = ratePer1000 !== undefined ? (ratePer1000 / 1000) : (selectedPackage.price / startQtyNum);

  const [finalPrice, setFinalPrice] = useState<number>(selectedPackage.price);
  
  const minQty = selectedPackage.min || 1;
  const maxQty = selectedPackage.max || 100000;

  const handleCustomQuantityChange = (val: string) => {
    setFinalQuantity(val);
    const num = Number(val);
    if (!isNaN(num) && num > 0) {
       setFinalPrice(Math.round(unitPrice * num));
    }
  };

  // Generate the UPI deep link for QR code
  const orderId = useRef(generateOrderId()).current;
  const upiLink = `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(UPI_NAME)}&am=${finalPrice}&cu=INR&tn=${encodeURIComponent(`Growplex Order ${orderId}`)}`;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleScreenshotSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file (PNG, JPG, etc.)");
      return;
    }

    // Validate file size (max 10MB initial)
    if (file.size > 10 * 1024 * 1024) {
      setError("Screenshot must be less than 10MB");
      return;
    }

    setError(null);

    // Create compressed base64 string
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 600;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions
        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          // Fill with white background in case of transparent PNG
          ctx.fillStyle = "white";
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);
          // Compress to JPEG with 0.5 quality for max <100kb payload
          const compressedBase64 = canvas.toDataURL("image/jpeg", 0.5);
          setScreenshotPreview(compressedBase64);
          setScreenshotName(file.name);
        }
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  }, []);

  const copyUpiId = useCallback(() => {
    navigator.clipboard.writeText(UPI_ID);
    setUpiCopied(true);
    setTimeout(() => setUpiCopied(false), 2000);
  }, []);

  const proceedToPayment = async () => {
    setError(null);

    const isQuantityValid = Number(finalQuantity) >= minQty && Number(finalQuantity) <= maxQty;
    if (!isQuantityValid) {
      setError(`Quantity must be between ${minQty} and ${maxQty}`);
      return;
    }

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

    // Instead of setting step to "payment", launch Razorpay
    try {
      console.log("Initiating payment...");
      setLoading(true);
      setError(null);

      // Create order
      console.log("Fetching /api/create-order...");
      const orderResponse = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Math.round(finalPrice * 100), // paise
          currency: "INR",
          receipt: orderId
        })
      });

      const orderData = await orderResponse.json();
      console.log("Create order response:", orderData);
      
      if (!orderResponse.ok) {
        throw new Error(orderData.error || "Failed to create order");
      }

      console.log("Setting up Razorpay options..");
      const options = {
        key: orderData.key_id,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Growplex",
        description: `${finalQuantity} ${service.name}`,
        order_id: orderData.order_id,
        handler: async function(response: any) {
          try {
            setLoading(true);
            setUploadProgress("Verifying payment...");
            const verifyRes = await fetch("/api/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature
              })
            });

            const verifyData = await verifyRes.json();
            if (!verifyRes.ok) {
              throw new Error(verifyData.error || "Payment verification failed");
            }

            // Save to Firestore
            setUploadProgress("Completing order...");
            const dbOrderData: any = {
              orderId: orderData.order_id,
              customerName: formData.customerName,
              phone: formData.phone,
              serviceLink: formData.serviceLink,
              serviceName: service.name,
              serviceCategory: service.category,
              packageQuantity: finalQuantity,
              price: finalPrice,
              paymentId: response.razorpay_payment_id,
              paymentStatus: "paid",
              orderStatus: "new", // will be updated to processing if automated
              createdAt: serverTimestamp(),
            };

            try {
              // Optional Automation for Synced Services
              if (service.type === 'synced' && service.smmServiceId) {
                 setUploadProgress("Automating fulfillment...");
                 const { placeGrowwOrder } = await import("../lib/growwsmm");
                 // Quantity must be a number for API
                 const qty = Number(finalQuantity);
                 if (!isNaN(qty) && qty > 0) {
                    const smmResponse = await placeGrowwOrder(Number(service.smmServiceId), formData.serviceLink, qty);
                    if (smmResponse && smmResponse.order) {
                       dbOrderData.growwOrderId = smmResponse.order;
                       dbOrderData.orderStatus = "processing";
                    }
                 }
              }
            } catch (autoErr) {
               console.error("Order automation failed. Saving as manual review.", autoErr);
               dbOrderData.automationError = String(autoErr);
            }

            await addDoc(collection(db, "orders"), dbOrderData);

            // Send Telegram notification
            sendTelegramNotification({
              orderId: orderData.order_id,
              customerName: formData.customerName,
              phone: formData.phone,
              serviceName: service.name,
              packageQuantity: finalQuantity,
              price: finalPrice,
              serviceLink: formData.serviceLink,
            });

            navigate("/success", { state: { orderId: orderData.order_id } });
          } catch (err: any) {
             console.error("Verification error:", err);
             setError(err.message || "Payment verification failed");
             setLoading(false);
          }
        },
        prefill: {
          name: formData.customerName,
          contact: formData.phone
        },
        theme: {
          color: "#E8B84B"
        },
        modal: {
          ondismiss: function() {
            setLoading(false);
            console.log("Checkout form closed");
          }
        }
      };

      // Ensure script is loaded
      if (!(window as any).Razorpay) {
        console.log("Loading Razorpay script dynamically...");
        await new Promise((resolve, reject) => {
          const script = document.createElement("script");
          script.src = "https://checkout.razorpay.com/v1/checkout.js";
          script.onload = resolve;
          script.onerror = reject;
          document.body.appendChild(script);
        });
      }

      if (!(window as any).Razorpay) {
        throw new Error("Razorpay SDK not loaded. Please disable adblockers and try again.");
      }
      
      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        setError(response.error.description || "Payment failed");
        setLoading(false);
      });
      rzp.open();
    } catch (err: any) {
      console.error('Full payment error logic:', err);
      setError(err.message || "Failed to initiate payment. Please try again.");
      setLoading(false);
    }
  };

  const submitOrder = async () => {
    // Legacy QR code submission logic removed
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
          {step === "payment" && (
            <button
              onClick={() => { setStep("checkout"); setError(null); }}
              className="absolute top-4 left-4 text-text-muted hover:text-text-main hover:bg-brand-border p-1.5 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
          )}
          <div className="inline-flex items-center px-2.5 py-1 rounded-md bg-brand-surface border border-brand-border text-xs font-medium text-text-muted mb-4 uppercase tracking-wider">
            {getCategoryIcon(service.category)}
            {service.category}
          </div>
          <h3 className="font-heading text-xl md:text-2xl font-bold text-text-main mb-2">{service.name}</h3>
          <p className="text-text-muted text-sm flex items-center gap-1.5"><Clock size={14} /> Delivered in {service.deliveryTime}</p>
        </div>

        <div className="p-6 flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            {step === "details" && (
              <motion.div
                key="details"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col gap-6 h-full"
              >
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
                     
                     <div className="flex flex-col gap-2 relative">
                        <div className="flex items-center">
                           <input 
                             type="number" 
                             min={minQty}
                             max={maxQty}
                             value={finalQuantity}
                             onChange={(e) => handleCustomQuantityChange(e.target.value)}
                             className="bg-brand-surface border border-brand-border rounded-lg px-3 py-1.5 w-32 font-bold text-lg text-text-main focus:outline-none focus:border-brand-accent/50 transition-colors"
                           />
                           <span className="ml-2 text-xs text-text-muted">Min: {minQty} | Max: {maxQty}</span>
                        </div>
                        {Number(finalQuantity) < minQty && <span className="text-xs text-red-500 absolute -bottom-5">Minimum is {minQty}</span>}
                        {Number(finalQuantity) > maxQty && <span className="text-xs text-red-500 absolute -bottom-5">Maximum is {maxQty}</span>}
                     </div>
                   </div>
                   <div className="text-right flex flex-col justify-end">
                     <p className="text-xs text-text-muted mb-1 flex items-center justify-end gap-2">
                       Total Price
                       {ratePer1000 !== undefined && (
                         <span className="text-[10px] text-brand-accent/70 font-normal uppercase tracking-wider">
                           (₹{ratePer1000.toFixed(2)} per 1000)
                         </span>
                       )}
                     </p>
                     <p className="font-bold text-2xl text-brand-accent">₹{finalPrice}</p>
                   </div>
                </div>

                <button 
                  onClick={() => setStep("checkout")}
                  className="w-full bg-brand-accent text-brand-primary font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-brand-accent-hover hover:shadow-[0_0_20px_rgba(232,184,75,0.4)] transition-all duration-300"
                >
                  Proceed to Checkout
                </button>
              </motion.div>
            )}

            {step === "checkout" && (
              <motion.div
                key="checkout"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col gap-4 h-full"
              >
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
                     <span className="font-medium text-text-main">{finalQuantity}</span>
                   </div>
                   <div className="flex justify-between items-center text-sm">
                     <span className="text-text-muted">Total Amount:</span>
                     <span className="font-bold text-lg text-brand-accent">₹{finalPrice}</span>
                   </div>
                </div>

                <button 
                  onClick={proceedToPayment}
                  disabled={loading}
                  className="w-full mt-auto bg-brand-accent text-brand-primary font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-brand-accent-hover hover:shadow-[0_0_20px_rgba(232,184,75,0.4)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <><Loader2 className="animate-spin" size={20} /> Processing...</>
                  ) : (
                    <><IndianRupee size={20} /> Pay ₹{finalPrice}</>
                  )}
                </button>
              </motion.div>
            )}

            {step === "payment" && (
              <motion.div
                key="payment"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col gap-5 h-full"
              >
                {error && (
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/50 text-red-500 text-sm">
                    {error}
                  </div>
                )}

                {/* QR Code Section */}
                <div className="flex flex-col items-center gap-3">
                  <div className="bg-white p-4 rounded-2xl shadow-lg">
                    <QRCodeSVG
                      value={upiLink}
                      size={180}
                      level="H"
                      includeMargin={false}
                      bgColor="#ffffff"
                      fgColor="#000000"
                    />
                  </div>
                  <div className="text-center">
                    <p className="text-text-muted text-xs mb-1">Scan with any UPI app</p>
                    <p className="text-brand-accent font-bold text-2xl">₹{finalPrice}</p>
                  </div>
                </div>

                {/* UPI ID Display */}
                <div className="bg-brand-primary border border-brand-border rounded-xl p-3">
                  <p className="text-xs text-text-muted mb-2 text-center">Or pay manually to UPI ID</p>
                  <div className="flex items-center justify-between bg-brand-surface rounded-lg px-3 py-2 border border-brand-border">
                    <span className="font-mono text-sm text-text-main font-medium">{UPI_ID}</span>
                    <button
                      onClick={copyUpiId}
                      className="text-text-muted hover:text-brand-accent transition-colors p-1"
                      title="Copy UPI ID"
                    >
                      {upiCopied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                    </button>
                  </div>
                </div>

                {/* Screenshot Upload */}
                <div className="border-t border-brand-border pt-4">
                  <p className="text-sm font-medium text-text-main mb-3 flex items-center gap-2">
                    <Camera size={16} className="text-brand-accent" />
                    Upload Payment Screenshot
                  </p>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleScreenshotSelect}
                    className="hidden"
                  />

                  {screenshotPreview ? (
                    <div className="relative group">
                      <img
                        src={screenshotPreview}
                        alt="Payment screenshot"
                        className="w-full max-h-40 object-contain rounded-xl border border-brand-border bg-brand-primary"
                      />
                      <button
                        onClick={() => {
                          setScreenshotName(null);
                          setScreenshotPreview(null);
                          if (fileInputRef.current) fileInputRef.current.value = "";
                        }}
                        className="absolute top-2 right-2 bg-red-500/80 hover:bg-red-500 text-white p-1 rounded-full transition-colors"
                      >
                        <X size={14} />
                      </button>
                      <p className="text-xs text-green-500 mt-2 flex items-center gap-1">
                        <CheckCircle size={12} /> Screenshot attached — {screenshotName}
                      </p>
                    </div>
                  ) : (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full border-2 border-dashed border-brand-border hover:border-brand-accent/50 rounded-xl p-6 flex flex-col items-center gap-2 transition-colors group"
                    >
                      <Upload size={28} className="text-text-muted group-hover:text-brand-accent transition-colors" />
                      <span className="text-sm text-text-muted group-hover:text-text-main transition-colors">
                        Tap to upload screenshot
                      </span>
                      <span className="text-xs text-text-muted">Any image up to 10MB (auto-compressed for fast upload)</span>
                    </button>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  onClick={submitOrder}
                  disabled={loading || !screenshotPreview}
                  className="w-full bg-brand-accent text-brand-primary font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-brand-accent-hover hover:shadow-[0_0_20px_rgba(232,184,75,0.4)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <><Loader2 className="animate-spin" size={20} /> {uploadProgress || "Processing..."}</>
                  ) : (
                    <><CheckCircle size={20} /> Confirm Payment</>
                  )}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
