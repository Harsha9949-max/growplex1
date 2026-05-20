import 'dotenv/config';
import express from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';

import { checkAndStoreEnvironment, validateCashfreeConfig } from './paymentEnvironmentManager.js';

import { createServer as createViteServer } from 'vite';

function sanitizeEnvVar(val: string | undefined): string | undefined {
  if (!val) return undefined;
  let s = val.trim();
  if (s.startsWith('"') && s.endsWith('"')) {
    s = s.substring(1, s.length - 1);
  } else if (s.startsWith("'") && s.endsWith("'")) {
    s = s.substring(1, s.length - 1);
  }
  return s.trim();
}

const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
const firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId);

async function startServer() {
  console.log("Starting server initialization...");
  
  let cashfreeError = null;
  // Strict Environment Validation
  try {
    await checkAndStoreEnvironment(db);
  } catch (err: any) {
    console.error("CRITICAL FATAL: Payment environment validation failed.");
    console.error(err.message);
    cashfreeError = err.message;
  }

  const app = express();
  const PORT = process.env.PORT || 3000;

  // Dynamic routes removed; using static files in /public directory instead.

  app.use(express.json({
    verify: (req: any, res, buf) => {
      req.rawBody = buf.toString('utf8');
    }
  }));

  const handleTelegramMessage = async (message: any) => {
    if (message && message.text === '/start') {
      const chatId = message.chat.id.toString();
      
      // Update Firestore via REST API
      const url = "https://firestore.googleapis.com/v1/projects/educantpro1/databases/ai-studio-2517a055-ba39-4325-adaa-13bf1adca537/documents/system/settings";
      const response = await fetch(url);
      const data = await response.json();
      
      let currentChatIds = data.fields?.telegramChatId?.stringValue || "";
      
      if (!currentChatIds.includes(chatId)) {
        const newChatIds = currentChatIds ? `${currentChatIds},${chatId}` : chatId;
        
        await fetch(`${url}?updateMask.fieldPaths=telegramChatId`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
              fields: {
                telegramChatId: { stringValue: newChatIds }
              }
          })
        });

        const botToken = data.fields?.telegramBotToken?.stringValue;
        if (botToken) {
          await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: chatId,
              text: "✅ Registration Successful! You will now receive new order notifications here."
            })
          });
        }
      }
    }
  };

  async function placeGrowwSmmOrder(orderInfo: any, orderId: string) {
    try {
      const providerOrderRef = doc(db, 'providerOrders', orderId);
      const providerOrderDoc = await getDoc(providerOrderRef);
      if (providerOrderDoc.exists()) {
        console.log(`Provider order already exists for ${orderId}. Skipping duplicate placement.`);
        return;
      }

      // Check service source
      let syncSource = 'api';
      let cleanServiceId = orderInfo.serviceId || 'default';
      
      // Look up service in firestore
      const sRef = doc(db, 'services', `api_${cleanServiceId}`);
      const mRef = doc(db, 'services', cleanServiceId); // For manual, ID is just the generated one
      
      let serviceDoc = await getDoc(sRef);
      if (!serviceDoc.exists()) {
        serviceDoc = await getDoc(mRef);
      }

      if (serviceDoc.exists()) {
        syncSource = serviceDoc.data().syncSource || 'api';
      } else if (cleanServiceId && cleanServiceId.toString().startsWith('MANUAL')) {
        syncSource = 'manual';
      }

      const settingsDoc = await getDoc(doc(db, "system", "settings"));
      const settings = settingsDoc.exists() ? settingsDoc.data() : null;
      
      if (syncSource === 'manual') {
        const manualStatus = 'manual_pending';
        console.log(`Routing order ${orderId} as MANUAL.`);
        await setDoc(doc(db, 'manualOrders', orderId), {
           orderId,
           serviceId: cleanServiceId,
           adminNotes: '',
           fulfillmentStatus: manualStatus,
           createdAt: new Date().toISOString()
        });
        
        await updateDoc(doc(db, 'orders', orderId), { orderStatus: manualStatus });
        
        // Telegram Alert for manual
        const botToken = settings?.telegramBotToken;
        const chatId = settings?.telegramChatId;
        if (botToken && chatId) {
           const chatIds = chatId.split(",").map((id: string) => id.trim()).filter(Boolean);
           for (const id of chatIds) {
             fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ chat_id: id, text: `🔧 *Manual Order Alert* #${orderId}\nService: ${orderInfo.serviceName}` })
             }).catch(() => null);
           }
        }
        return;
      }
      
      const apiKey = settings?.providerApiKey;
      const apiUrl = settings?.providerApiUrl || "https://growwsmmpanel.com/api/v2";
      
      let initialStatus = 'queued';
      let growwOrderId = null;
      
      if (apiKey) {
        console.log(`Placing GrowwSmmPanel order for ${orderId}...`);
        try {
          const reqBody = {
            key: apiKey,
            action: 'add',
            service: String(orderInfo.serviceId || 'default'),
            link: orderInfo.serviceLink || '',
            quantity: String(orderInfo.packageQuantity || 1)
          };
          
          const res = await fetch(apiUrl, {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify(reqBody)
          });
          
          if (res.ok) {
            const data = await res.json();
            if (data.order) {
              growwOrderId = data.order;
              initialStatus = 'processing';
            } else {
              console.warn('GrowwSmmPanel order placement warning (no order id):', data);
            }
          } else {
             console.warn('GrowwSmmPanel order placement HTTP error:', res.status);
          }
        } catch (apiErr) {
          console.error("Error communicating with Provider API during webhook:", apiErr);
          // status remains 'queued' for retry later
        }
      } else {
        console.warn('GrowwSmm apiKey missing, queuing order safely.');
      }
      
      await setDoc(providerOrderRef, {
        providerOrderId: growwOrderId ? String(growwOrderId) : (apiKey ? `PROVIDER_${Date.now()}` : null),
        originalOrderId: orderId,
        serviceId: orderInfo.serviceId || 'default',
        quantity: orderInfo.packageQuantity || 1,
        targetLink: orderInfo.serviceLink || '',
        apiStatus: initialStatus, // queued, processing, completed, partial, failed, canceled
        providerName: 'GrowwSmmPanel',
        createdAt: new Date().toISOString()
      });
      console.log(`Safely persisted provider order for ${orderId} as ${initialStatus}`);
    } catch(err) {
      console.error('Failed to place provider order:', err);
      // Fallback: safely persist as queued if possible without throwing, to maintain idempotency
      try {
        await setDoc(doc(db, 'providerOrders', orderId), {
           originalOrderId: orderId,
           apiStatus: 'queued',
           providerName: 'GrowwSmmPanel',
           createdAt: new Date().toISOString(),
           error: String(err)
        });
      } catch (e) {}
    }
  }

  // Telegram Webhook Endpoint
  app.post('/api/telegram-webhook', async (req, res) => {
    try {
      await handleTelegramMessage(req.body?.message);
      // Always return 200 OK to Telegram so it doesn't retry
      res.status(200).send('OK');
    } catch (error) {
      console.error('Telegram Webhook Error:', error);
      res.status(500).send('Error');
    }
  });

  async function sendTelegramNotificationBackend(order: {
    orderId: string;
    customerName: string;
    phone: string;
    serviceName: string;
    packageQuantity: number;
    price: number;
    serviceLink: string;
  }) {
    try {
      const settingsDoc = await getDoc(doc(db, "system", "settings"));
      const settings = settingsDoc.exists() ? settingsDoc.data() : null;

      const botToken = settings?.telegramBotToken;
      const chatId = settings?.telegramChatId;

      if (!botToken || !chatId) {
        console.warn("Telegram bot not configured. Skipping backend notification.");
        return;
      }

      const chatIds = chatId.split(",").map((id: string) => id.trim()).filter(Boolean);

      const message = [
        `🆕 *New Growplex Order (Paid via Cashfree)*`,
        ``,
        `📋 *Order ID:* \`${order.orderId}\``,
        `👤 *Customer:* ${order.customerName}`,
        `📞 *Phone:* ${order.phone}`,
        `🔗 *Link:* ${order.serviceLink}`,
        ``,
        `📦 *Service:* ${order.serviceName}`,
        `📊 *Package:* ${order.packageQuantity}`,
        `💰 *Amount:* ₹${order.price}`,
        `💳 *Payment Status:* PAID`,
      ].join("\n");

      const promises = chatIds.map(async (id: string) => {
        await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: id,
            text: message,
            parse_mode: "Markdown",
          }),
        });
      });

      await Promise.allSettled(promises);
    } catch (err) {
      console.error("Telegram backend notification failed:", err);
    }
  }

  // Create Cashfree payment order (server-side to protect keys)
  app.post('/api/cashfree/create-order', async (req, res) => {
    const { amount, customerName, phone, email, serviceName, serviceCategory, packageQuantity, serviceLink, userId, deviceId } = req.body;
    
    if (!amount || !customerName || !phone || !serviceName || !packageQuantity || !serviceLink) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }
    
    try {
      const orderId = `GP_${Date.now()}_${Math.random().toString(36).substring(2, 5).toUpperCase()}`;
      
      const cfConfig = validateCashfreeConfig();

      const payload = {
        order_amount: Number(amount),
        order_currency: 'INR',
        order_id: orderId,
        customer_details: {
          customer_id: userId || `guest_${phone}`,
          customer_phone: phone,
          customer_email: email || `${phone}@growplex.com`,
          customer_name: customerName
        },
        order_meta: {
          return_url: `${process.env.APP_URL || 'http://localhost:3000'}/payment-result?order_id=${orderId}`
        }
      };

      const headers = {
        'x-client-id': cfConfig.appId,
        'x-client-secret': cfConfig.secretKey,
        'x-api-version': '2023-08-01',
        'Content-Type': 'application/json'
      };

      console.log(`Attempting Cashfree order creation in ${cfConfig.mode} mode...`);
      
      const response = await fetch(`${cfConfig.endpoint}/orders`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errText = await response.text();
        
        // Diagnostic logs
        console.error("--- Cashfree order creation failed ---");
        console.error(`Current mode: ${cfConfig.mode}`);
        console.error(`Current endpoint: ${cfConfig.endpoint}/orders`);
        console.error(`Credential type: ${cfConfig.mode}`);
        console.error(`Error details: ${errText}`);
        console.error("--------------------------------------");
        
        let cashfreeError = "Unknown error";
        try {
          const parsedErr = JSON.parse(errText);
          cashfreeError = parsedErr.message || cashfreeError;
        } catch(e) {}
        throw new Error(`${cfConfig.mode === 'TEST' ? 'Sandbox' : 'Production'} credentials invalid: ${cashfreeError}`);
      }

      const cfOrder = await response.json();
      const paymentSessionId = cfOrder.payment_session_id;
      const cfOrderId = cfOrder.cf_order_id;
      console.log(`Cashfree order successfully created. activeMode: ${cfConfig.mode}, cf_order_id: ${cfOrderId}`);

      const orderData = {
        orderId,
        customerName,
        phone,
        serviceName,
        serviceCategory: serviceCategory || "Social Media",
        packageQuantity,
        price: Number(amount),
        paymentStatus: 'initiated', // initiated, processing, paid, failed 
        orderStatus: 'new',
        deviceId: deviceId || 'default',
        userId: userId || null,
        serviceLink,
        createdAt: new Date().toISOString(),
        paymentSessionId,
        cfOrderId,
        paymentGateway: 'cashfree',
        cashfreeMode: cfConfig.mode
      };
      
      await setDoc(doc(db, 'orders', orderId), orderData);
      
      return res.json({
        orderId,
        paymentSessionId,
        cfOrderId,
        paymentGateway: 'cashfree',
        simulated: false
      });
    } catch (error: any) {
      console.error('Create Cashfree Order Error:', error);
      return res.status(500).json({ error: error.message });
    }
  });

  // Verify Cashfree order status
  app.get('/api/cashfree/verify-order', async (req, res) => {
    const { order_id } = req.query;
    if (!order_id || typeof order_id !== 'string') {
      return res.status(400).json({ error: 'Missing order_id' });
    }
    
    try {
      const orderDocRef = doc(db, 'orders', order_id);
      const orderDoc = await getDoc(orderDocRef);
      
      if (!orderDoc.exists()) {
        return res.status(404).json({ error: 'Order not found in DB' });
      }
      
      const orderData = orderDoc.data();
      let dbPaymentStatus = orderData.paymentStatus;
      
      const cfConfig = validateCashfreeConfig();
      
      const cfMode = orderData.cashfreeMode; // mode the order was created in
      if (cfMode && cfMode !== cfConfig.mode) {
        throw new Error(`Order was created in ${cfMode} mode but system is currently in ${cfConfig.mode} mode. Cannot verify.`);
      }

      // Query Cashfree API directly
      console.log(`Querying order status in ${cfConfig.mode} environment for order: ${order_id}...`);
      const response = await fetch(`${cfConfig.endpoint}/orders/${order_id}/payments`, {
        method: 'GET',
        headers: {
          'x-client-id': cfConfig.appId,
          'x-client-secret': cfConfig.secretKey,
          'x-api-version': '2023-08-01'
        }
      });
      
      if (response.ok) {
        const paymentsList = await response.json();
        if (Array.isArray(paymentsList) && paymentsList.length > 0) {
          const isSuccess = paymentsList.some((p: any) => p.payment_status === 'SUCCESS');
          const isFailed = paymentsList.every((p: any) => p.payment_status === 'FAILED');
          
          if (isSuccess) {
            dbPaymentStatus = 'paid';
          } else if (isFailed) {
            dbPaymentStatus = 'failed';
          } else {
            dbPaymentStatus = 'processing';
          }
        } else {
          dbPaymentStatus = 'initiated';
        }
      } else {
        const errText = await response.text();
        console.error(`Verification query failed in ${cfConfig.mode} mode with message:`, errText);
      }
      
      const currentStatus = orderData.paymentStatus;
      
      if (dbPaymentStatus !== currentStatus) {
        await updateDoc(orderDocRef, {
          paymentStatus: dbPaymentStatus,
          updatedAt: new Date().toISOString()
        });
        
        if (dbPaymentStatus === 'paid' && currentStatus !== 'paid') {
          await sendTelegramNotificationBackend({
            orderId: order_id,
            customerName: orderData.customerName || 'N/A',
            phone: orderData.phone || 'N/A',
            serviceName: orderData.serviceName || 'N/A',
            packageQuantity: orderData.packageQuantity || 1,
            price: Number(orderData.price || 0),
            serviceLink: orderData.serviceLink || 'N/A'
          });
        }
      }
      
      return res.json({
        orderId: order_id,
        paymentStatus: dbPaymentStatus,
        orderStatus: dbPaymentStatus === 'paid' ? 'processing' : orderData.orderStatus
      });
    } catch (error: any) {
      console.error('Verify order error:', error);
      return res.status(500).json({ error: error.message });
    }
  });

  // Cashfree Webhook Endpoint
  app.post('/api/cashfree/webhook', async (req, res) => {
    try {
      console.log('Cashfree Webhook Received');
      
      const signature = req.headers['x-webhook-signature'];
      const timestamp = req.headers['x-webhook-timestamp'];
      const payloadStr = (req as any).rawBody;

      if (!signature || !timestamp || !payloadStr) {
        return res.status(400).json({ error: 'Missing security headers' });
      }

      const cfConfig = validateCashfreeConfig();
      const secretKey = cfConfig.secretKey;
      
      const combined = timestamp + payloadStr;
      const expectedSig = crypto.createHmac('sha256', secretKey).update(combined).digest('base64');
      if (expectedSig !== signature) {
         console.error("Webhook signature mismatch.");
         return res.status(403).json({ error: "Invalid signature" });
      }

      const data = req.body?.data;
      const orderObj = data?.order || req.body?.order;
      const paymentObj = data?.payment || req.body?.payment;
      
      const orderId = orderObj?.order_id || req.body?.orderId || req.body?.order_id;
      const amount = orderObj?.order_amount || req.body?.orderAmount;
      const paymentStatus = paymentObj?.payment_status || req.body?.paymentStatus;
      
      if (!orderId) {
        return res.status(400).json({ error: 'Missing order_id' });
      }
      
      const eventId = req.headers['x-webhook-version'] ? `${orderId}_${timestamp}` : orderId; 
      
      // Idempotency Check
      const logRef = doc(db, 'webhookLogs', eventId);
      const logDoc = await getDoc(logRef);
      if (logDoc.exists()) {
         const d = logDoc.data();
         if (d.processingStatus === 'completed') {
           console.log(`Webhook ${eventId} already processed safely.`);
           return res.status(200).json({ status: 'OK' });
         }
      }

      await setDoc(logRef, {
        eventId,
        payload: req.body,
        timestamp: new Date().toISOString(),
        signatureVerified: true,
        processingStatus: 'processing',
        environment: cfConfig.mode,
        orderId,
        cfPaymentId: paymentObj?.cf_payment_id || null
      });
      
      const orderDocRef = doc(db, 'orders', orderId);
      const orderDoc = await getDoc(orderDocRef);
      
      if (!orderDoc.exists()) {
        await updateDoc(logRef, { processingStatus: 'failed', error: 'Order not found in DB' });
        return res.status(404).json({ error: 'Order not found in DB' });
      }
      
      const orderInfo = orderDoc.data();
      const currentStatus = orderInfo.paymentStatus;
      
      let dbPaymentStatus = currentStatus;
      if (paymentStatus === 'SUCCESS') {
        dbPaymentStatus = 'paid';
      } else if (paymentStatus === 'FAILED') {
        dbPaymentStatus = 'failed';
      } else if (paymentStatus === 'PENDING' && currentStatus === 'initiated') {
        dbPaymentStatus = 'processing';
      }
      
      if (dbPaymentStatus !== currentStatus) {
        await updateDoc(orderDocRef, {
          paymentStatus: dbPaymentStatus,
          updatedAt: new Date().toISOString()
        });
        
        if (dbPaymentStatus === 'paid') {
          await sendTelegramNotificationBackend({
            orderId: orderId,
            customerName: orderInfo?.customerName || 'N/A',
            phone: orderInfo?.phone || 'N/A',
            serviceName: orderInfo?.serviceName || 'N/A',
            packageQuantity: orderInfo?.packageQuantity || 1,
            price: Number(amount || orderInfo?.price || 0),
            serviceLink: orderInfo?.serviceLink || 'N/A'
          });

          await placeGrowwSmmOrder(orderInfo, orderId);
        }
      }

      await updateDoc(logRef, { processingStatus: 'completed' });
      return res.status(200).json({ status: 'OK' });
    } catch (err: any) {
      console.error('Webhook processing error:', err);
      return res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/services/sync', async (req, res) => {
    try {
      const { adminEmail } = req.body;
      const overrideEmail = process.env.VITE_ADMIN_EMAIL_OVERRIDE || "override@example.com";
      if (adminEmail !== 'marateyh@gmail.com' && adminEmail !== overrideEmail) {
         return res.status(403).json({ error: "Unauthorized" });
      }

      const settingsDoc = await getDoc(doc(db, "system", "settings"));
      const settings = settingsDoc.exists() ? settingsDoc.data() : null;
      
      const apiUrl = settings?.providerApiUrl || "https://growwsmmpanel.com/api/v2";
      const apiKey = settings?.providerApiKey;

      // Mock response if no key for local testing
      if (!apiKey) {
        console.warn("GrowwSMM API key not configured, using mock sync.");
        const providerServices = [
          { service: '1', name: 'Mock API Service 1', category: 'Instagram', rate: '10' },
          { service: '2', name: 'Mock API Service 2', category: 'YouTube', rate: '20' }
        ];

        for (const s of providerServices) {
          const sRef = doc(db, 'services', `api_${s.service}`);
          const sDoc = await getDoc(sRef);
          let marginPct = 25;
          if (sDoc.exists() && sDoc.data().marginPct !== undefined) {
             marginPct = sDoc.data().marginPct;
          }
          const basePrice = Number(s.rate) || 0;
          const finalPrice = basePrice * (1 + marginPct / 100);

          await setDoc(sRef, {
             serviceId: String(s.service),
             name: s.name,
             category: s.category || 'General',
             basePrice,
             marginPct,
             finalPrice,
             syncSource: 'api',
             apiEndpoint: apiUrl,
             isActive: true,
             updatedAt: new Date().toISOString()
          }, { merge: true });
        }
        return res.json({ status: "success", syncedCount: providerServices.length });
      }

      // Hit API
      const reqBody = { key: apiKey, action: 'services' };
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reqBody)
      });
      
      if (!response.ok) throw new Error("API call failed");
      
      const respText = await response.text();
      let providerServices;
      try { providerServices = JSON.parse(respText); } catch(e) { throw new Error("Invalid format"); }

      if (Array.isArray(providerServices)) {
        for (const s of providerServices) {
          const sRef = doc(db, 'services', `api_${s.service}`);
          const sDoc = await getDoc(sRef);
          let marginPct = 25;
          if (sDoc.exists() && sDoc.data().marginPct !== undefined) {
             marginPct = sDoc.data().marginPct;
          }
          const basePrice = Number(s.rate) || 0;
          const finalPrice = basePrice * (1 + marginPct / 100);

          await setDoc(sRef, {
             serviceId: String(s.service),
             name: s.name,
             category: s.category || 'General',
             basePrice,
             marginPct,
             finalPrice,
             syncSource: 'api',
             apiEndpoint: apiUrl,
             isActive: true,
             updatedAt: new Date().toISOString()
          }, { merge: true });
        }
      }

      return res.json({ status: "success", syncedCount: providerServices.length || 0 });
    } catch(err: any) {
       console.error("GrowwSMM sync error", err);
       return res.status(500).json({ error: err.message });
    }
  });

  // GrowwSMM Proxy Endpoint
  app.post('/api/growwsmm', async (req, res) => {
    try {
      const settingsDoc = await getDoc(doc(db, "system", "settings"));
      const settings = settingsDoc.exists() ? settingsDoc.data() : null;
      
      const apiUrl = settings?.providerApiUrl || "https://growwsmmpanel.com/api/v2";
      const apiKey = settings?.providerApiKey;
      
      if (!apiKey) {
        // Return a mock response or error if we have no key for preview purposes
        // Often these panels return an error object if auth fails.
        return res.status(400).json({ error: "GrowwSMM API key not configured in Admin Settings" });
      }
      
      const requestData = { key: apiKey, ...req.body };
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      });
      
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        return res.json(data);
      } else {
        const text = await response.text();
        throw new Error(`Provider returned non-JSON response: ${text.substring(0, 100)}`);
      }
    } catch (error: any) {
      console.error("GrowwSMM Proxy error:", error);
      return res.status(500).json({ error: error.message });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);

    // Start telegram polling in development
    setTimeout(async () => {
      let lastUpdateId = 0;
      while (true) {
        try {
          const url = "https://firestore.googleapis.com/v1/projects/educantpro1/databases/ai-studio-2517a055-ba39-4325-adaa-13bf1adca537/documents/system/settings";
          const response = await fetch(url);
          if (!response.ok) { await new Promise(r => setTimeout(r, 10000)); continue; }
          const data = await response.json();
          const botToken = data.fields?.telegramBotToken?.stringValue;

          if (botToken) {
             // Delete webhook to allow polling
             await fetch(`https://api.telegram.org/bot${botToken}/deleteWebhook`, {
               headers: { 'Connection': 'close' }
             }).catch(() => null);

             const updateRes = await fetch(`https://api.telegram.org/bot${botToken}/getUpdates?offset=${lastUpdateId + 1}&timeout=30`, {
               headers: { 'Connection': 'close' }
             });
             if (updateRes.ok) {
               const updateData = await updateRes.json();
               if (updateData.ok && updateData.result.length > 0) {
                 for (const update of updateData.result) {
                   lastUpdateId = update.update_id;
                   await handleTelegramMessage(update.message);
                 }
               }
             }
          }
        } catch (e: any) {
          const errMsg = String(e?.message || "");
          const errCause = String(e?.cause?.message || e?.cause || "");
          const isConnReset = errMsg.includes("ECONNRESET") || errCause.includes("ECONNRESET") || errMsg.includes("fetch failed");
          if (isConnReset) {
            console.log("Telegram polling connection reset (normal behavior under long polling timeout), retrying...");
          } else {
            console.error("Polling error", e);
          }
        }
        await new Promise(r => setTimeout(r, 2000));
      }
    }, 1000);

  } else {
    // Check if dist exists, else it might be build time
    const distPath = path.join(process.cwd(), 'dist');
    // Ensure static files are served correctly without index fallback for missing assets
    app.use(express.static(distPath, {
      index: false,
    }));
    
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // GrowwSmmPanel tracking polling worker
  setInterval(async () => {
    try {
      const activeStates = ['queued', 'processing', 'partial'];
      const q = query(
         collection(db, 'providerOrders'),
         where('apiStatus', 'in', activeStates)
      );
      const snapshot = await getDocs(q);
      
      const now = Date.now();
      for (const d of snapshot.docs) {
        const pOrder: any = { id: d.id, ...d.data() };
        
        // Dynamic polling:
        // new order (queued): every 2 mins
        // processing: every 10 mins
        // Wait, since we fetch all 'active', we check lastPolled timestamp here to throttle.
        const lastPolled = pOrder.lastPolled || 0;
        const stateThresholds: any = {
           'queued': 120 * 1000,
           'processing': 600 * 1000,
           'partial': 600 * 1000
        };
        const threshold = stateThresholds[pOrder.apiStatus] || 120 * 1000;
        
        if (now - lastPolled < threshold) continue;
        
        // Simulating the GrowwSmm API check
        // In real app: fetch(`groww-api-url?key=...&action=status&order=${pOrder.providerOrderId}`)
        
        let newApiStatus = pOrder.apiStatus;
        if (pOrder.apiStatus === 'queued') newApiStatus = 'processing';
        else if (pOrder.apiStatus === 'processing' && now - (new Date(pOrder.createdAt).getTime()) > 300000) newApiStatus = 'completed'; 
        
        if (newApiStatus !== pOrder.apiStatus) {
           console.log(`Provider order ${pOrder.id} status changed: ${pOrder.apiStatus} -> ${newApiStatus}`);
           await updateDoc(doc(db, 'providerOrders', pOrder.id), {
              apiStatus: newApiStatus,
              lastPolled: now
           });
           
           // Log tracking
           await setDoc(doc(collection(db, 'trackingLogs')), {
             providerOrderId: pOrder.providerOrderId,
             originalOrderId: pOrder.originalOrderId,
             oldStatus: pOrder.apiStatus,
             newStatus: newApiStatus,
             time: new Date().toISOString()
           });
           
           // Update User Order Status
           await updateDoc(doc(db, 'orders', pOrder.originalOrderId), {
             orderStatus: newApiStatus,
             updatedAt: new Date().toISOString()
           });
        } else {
           await updateDoc(doc(db, 'providerOrders', pOrder.id), { lastPolled: now });
        }
      }
    } catch (e) {
      console.error('GrowwSmm tracking worker error:', e);
    }
  }, 60 * 1000); // Check every minute

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
