import express from 'express';
import path from 'path';

import { createServer as createViteServer } from 'vite';

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  // Dynamic routes removed; using static files in /public directory instead.

  app.use(express.json());

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
