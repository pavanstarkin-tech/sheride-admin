import { auth } from './firebase';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  headers?: Record<string, string>;
}

export async function fetchApi<T = any>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'POST', body, headers = {} } = options;

  let token: string | null = null;
  if (auth.currentUser) {
    try {
      token = await auth.currentUser.getIdToken();
    } catch (e) {
      console.warn('Could not get Firebase token:', e);
    }
  }

  const reqHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  };

  if (token) {
    reqHeaders['Authorization'] = `Bearer ${token}`;
  }

  const url = `${API_BASE_URL}/${endpoint.replace(/^\//, '')}`;

  const res = await fetch(url, {
    method,
    headers: reqHeaders,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || errData.message || `API error (${res.status})`);
  }

  return res.json();
}

export const adminApi = {
  approveRider: async (riderId: string, action: 'approve' | 'reject', reason?: string) => {
    return fetchApi('admin_approve_rider.php', {
      method: 'POST',
      body: { riderId, action, reason },
    });
  },

  processPayout: async (payoutId: string, riderId: string, amount: number, transactionId?: string) => {
    return fetchApi('admin_process_payout.php', {
      method: 'POST',
      body: { payoutId, riderId, amount, transactionId, status: 'completed' },
    });
  },

  cancelRide: async (rideId: string, reason: string) => {
    return fetchApi('admin_cancel_ride.php', {
      method: 'POST',
      body: { rideId, reason, adminId: auth.currentUser?.uid || 'admin' },
    });
  },

  updateCommission: async (commissionRate: number, baseFares?: any) => {
    return fetchApi('admin_update_commission.php', {
      method: 'POST',
      body: { commissionRate, baseFares, adminId: auth.currentUser?.uid || 'admin' },
    });
  },

  getAnalytics: async () => {
    return fetchApi('admin_get_analytics.php', {
      method: 'GET',
    });
  },

  sendMarketingPush: async (payload: {
    title: string;
    body: string;
    targetGroup?: 'all' | 'users' | 'riders';
    promoCode?: string;
    imageUrl?: string;
  }) => {
    return fetchApi('send_marketing_notification.php', {
      method: 'POST',
      body: payload,
    });
  },

  sendRideNotification: async (payload: {
    rideId: string;
    event: string;
    passengerUid?: string;
    riderUid?: string;
    captainName?: string;
    fare?: number;
    reason?: string;
  }) => {
    return fetchApi('send_ride_notification.php', {
      method: 'POST',
      body: payload,
    });
  },
};

