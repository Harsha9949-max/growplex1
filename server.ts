import 'dotenv/config';
import express from 'express';
import path from 'path';
import crypto from 'crypto';

import { createServer as createViteServer } from 'vite';

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  // Global Security & Cache Headers
  app.use((req, res, next) => {
    // HSTS enforcement for HTTPS
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    
    // Cache headers for static assets
    if (req.path.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    } else {
      res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
    }
    next();
  });

  // Dynamic routes removed; using static files in /public directory instead.

  app.use(express.json());

  // Razorpay Integration
  app.post('/api/create-order', async (req, res) => {
    try {
      const { amount, currency, receipt } = req.body;
      if (!amount || amount < 100) {
        return res.status(400).json({ error: 'Minimum amount is 100 paise' });
      }

      const key_id = process.env.RAZORPAY_KEY_ID?.trim();
      const key_secret = process.env.RAZORPAY_KEY_SECRET?.trim();

      if (!key_id || !key_secret) {
        console.error("Razorpay keys not found in environment variables");
        return res.status(500).json({ error: 'Razorpay keys not configured' });
      }

      const Razorpay = (await import('razorpay')).default;
      const razorpay = new Razorpay({
        key_id,
        key_secret,
      });
      console.log("Creating Razorpay order with key:", key_id);

      const order = await razorpay.orders.create({
        amount, // amount in paise
        currency: currency || 'INR',
        receipt: receipt || `receipt_${Date.now()}`
      });

      res.status(200).json({
        order_id: order.id,
        amount: order.amount,
        currency: order.currency,
        key_id: process.env.RAZORPAY_KEY_ID
      });
    } catch (error: any) {
      console.error('Create order error:', error);
      let errorMessage = 'Order creation failed';
      if (error?.error?.description) {
        errorMessage = error.error.description;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      res.status(500).json({ error: errorMessage });
    }
  });

  app.post('/api/verify-payment', (req, res) => {
    try {
      const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;
      
      if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const text = `${razorpay_order_id}|${razorpay_payment_id}`;
      const secret = process.env.RAZORPAY_KEY_SECRET || '';
      const generated_signature = crypto.createHmac('sha256', secret).update(text).digest('hex');

      if (generated_signature === razorpay_signature) {
        res.status(200).json({ success: true, message: 'Payment verified successfully' });
      } else {
        res.status(400).json({ error: 'Signature mismatch' });
      }
    } catch (error: any) {
      console.error('Verify payment error:', error);
      res.status(500).json({ error: error.message || 'Verification failed' });
    }
  });

  // GrowwSMM API Access endpoint
  app.post('/api/growwsmm', async (req, res) => {
    try {
      const { action, ...params } = req.body;
      
      const body = new URLSearchParams();
      body.append('key', process.env.GROWWSMM_API_KEY || 'eb4551c8deb17e197d30508da488abd3');
      body.append('action', action);
      Object.entries(params).forEach(([k, v]) => 
        body.append(k, String(v))
      );

      const response = await fetch(
        process.env.GROWWSMM_API_URL || 'https://growwsmmpanel.com/api/v2',
        {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/x-www-form-urlencoded' 
          },
          body: body.toString()
        }
      );

      const text = await response.text();
      try {
        const data = JSON.parse(text);
        return res.status(200).json(data);
      } catch (e) {
        return res.status(500).json({ 
          error: 'Invalid response from provider: ' + text 
        });
      }
    } catch (error: any) {
      console.error('GrowwSMM error:', error);
      return res.status(500).json({ error: error.message });
    }
  });

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

  // Google Chat Webhook Relay Endpoint
  app.post('/api/google-chat/send', async (req, res) => {
    try {
      const { text, senderName, senderRole } = req.body;
      if (!text) {
        return res.status(400).json({ error: 'Message is empty' });
      }

      // Fetch webhook URL dynamically from Firestore settings document
      const settingsUrl = "https://firestore.googleapis.com/v1/projects/educantpro1/databases/ai-studio-2517a055-ba39-4325-adaa-13bf1adca537/documents/system/settings";
      const settingsResponse = await fetch(settingsUrl);
      if (settingsResponse.ok) {
         const settingsData = await settingsResponse.json();
         const googleChatWebhookUrl = settingsData.fields?.googleChatWebhookUrl?.stringValue;
         
         if (googleChatWebhookUrl) {
            console.log("Relaying message to Google Chat webhook:", googleChatWebhookUrl);
            const chatPayload = {
              text: `💬 *${senderName}* (${senderRole?.toUpperCase()}): ${text}`
            };
            const chatRes = await fetch(googleChatWebhookUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(chatPayload)
            });
            if (!chatRes.ok) {
               console.error("Google Chat webhook response error:", await chatRes.text());
            }
         } else {
            console.log("Google Chat Webhook URL is not configured. Skipping relay.");
         }
      } else {
         console.error("Failed to fetch system settings in Google Chat webhook proxy router.");
      }
      res.status(200).json({ success: true });
    } catch (error: any) {
      console.error('Google Chat relay API error:', error);
      res.status(500).json({ error: error.message || 'Relay failed' });
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
             await fetch(`https://api.telegram.org/bot${botToken}/deleteWebhook`);

             const updateRes = await fetch(`https://api.telegram.org/bot${botToken}/getUpdates?offset=${lastUpdateId + 1}&timeout=30`);
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
        } catch (e) {
          console.error("Polling error", e);
        }
        await new Promise(r => setTimeout(r, 2000));
      }
    }, 1000);

  } else {
    // Check if dist exists, else it might be build time
    const distPath = path.join(process.cwd(), 'dist');
    
    // Explicit static maps for exact route matching
    app.get('/sitemap.xml', (req, res) => {
      res.setHeader('Content-Type', 'application/xml');
      res.sendFile(path.join(distPath, 'sitemap.xml'));
    });
    app.get('/robots.txt', (req, res) => {
      res.setHeader('Content-Type', 'text/plain');
      res.sendFile(path.join(distPath, 'robots.txt'));
    });

    // Ensure static files are served correctly without index fallback for missing assets
    app.use(express.static(distPath, {
      index: false,
    }));
    
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
