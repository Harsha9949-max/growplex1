const MARKUP = Number((import.meta as any).env.VITE_MARKUP_PERCENT || '40') / 100;
const USD_TO_INR = 84;

async function callAPI(params: Record<string, any>) {
  console.log('GrowwSMM callAPI request:', params);
  try {
    const res = await fetch('/api/growwsmm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    
    // Check for non-OK response right away if it's not JSON
    const contentType = res.headers.get('content-type');
    let data;
    if (contentType && contentType.includes('application/json')) {
      data = await res.json();
    } else {
      const text = await res.text();
      console.error('GrowwSMM callAPI non-JSON response:', text.substring(0, 100) + '...');
      throw new Error(`Service unreachable or invalid response format (Status: ${res.status})`);
    }
    
    if (!res.ok) {
      console.error('GrowwSMM callAPI error response:', data);
      throw new Error(data.error || `Server Proxy error (Status: ${res.status})`);
    }
    
    // Check for API-level errors that might come with a 200 OK
    if (data && data.error) {
       console.error('GrowwSMM API internal error:', data.error);
       throw new Error(data.error);
    }
    
    console.log('GrowwSMM callAPI success response:', Array.isArray(data) ? `Array of ${data.length} items` : data);
    return data;
  } catch (error: any) {
    console.error('GrowwSMM callAPI fetch failed:', error);
    // Rethrow standard error messaging so UI can consume it simply
    throw new Error(error.message || 'Failed to connect to service. Please verify network or try again.');
  }
}

export async function fetchGrowwServices() {
  const data = await callAPI({ action: 'services' });
  if (!Array.isArray(data)) return [];
  return data.map((s: any) => ({
    growwServiceId: parseInt(s.service),
    name: s.name,
    type: s.type,
    category: s.category,
    providerRate: parseFloat(s.rate),
    displayRate: parseFloat((parseFloat(s.rate) * (1 + MARKUP) * USD_TO_INR).toFixed(2)),
    minQuantity: parseInt(s.min),
    maxQuantity: parseInt(s.max),
    refill: s.refill === '1' || s.refill === true,
    cancel: s.cancel === '1' || s.cancel === true,
    isActive: true
  }));
}

export async function placeGrowwOrder(serviceId: number, link: string, quantity: number) {
  return callAPI({ action: 'add', service: String(serviceId), link, quantity: String(quantity) });
}

export async function getOrderStatus(growwOrderId: number) {
  return callAPI({ action: 'status', order: String(growwOrderId) });
}

export async function getMultipleOrderStatuses(orderIds: number[]) {
  return callAPI({ action: 'status', orders: orderIds.join(',') });
}

export async function getProviderBalance() {
  return callAPI({ action: 'balance' });
}

export async function requestRefill(growwOrderId: number) {
  return callAPI({ action: 'refill', order: String(growwOrderId) });
}

export async function cancelOrder(growwOrderId: number) {
  return callAPI({ action: 'cancel', orders: String(growwOrderId) });
}
