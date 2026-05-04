import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  req: VercelRequest, 
  res: VercelResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { action, ...params } = req.body;
    
    const body = new URLSearchParams();
    body.append('key', process.env.GROWWSMM_API_KEY || '6713a86288db6a88c0b7d28cbc60068b');
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
    console.log('GrowwSMM raw response:', text);

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
}
