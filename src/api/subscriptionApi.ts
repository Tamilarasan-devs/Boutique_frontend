import { fetchWithAuth } from './client';
import { API_BASE_URL } from '@/constants';

export interface SubscriptionStatus {
  id: number;
  razorpay_customer_id: string | null;
  razorpay_subscription_id: string | null;
  plan_id: string | null;
  status: 'active' | 'halted' | 'cancelled' | 'completed' | 'inactive' | 'trialing' | 'expired';
  current_period_end: string | null;
  trial_end: string | null;
}

export const subscriptionApi = {
  getSubscriptionStatus: async (): Promise<SubscriptionStatus> => {
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/subscription/status`);
      if (!response.ok) throw new Error('Failed to fetch status');
      return await response.json();
    } catch (error) {
      console.error('Error fetching subscription status:', error);
      throw error;
    }
  },

  createSubscription: async (plan_id: string): Promise<any> => {
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/subscription/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ plan_id }),
      });
      if (!response.ok) throw new Error('Failed to create subscription');
      return await response.json();
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw error;
    }
  },

  verifySignature: async (data: {
    razorpay_payment_id: string;
    razorpay_subscription_id: string;
    razorpay_signature: string;
  }): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/subscription/verify-signature`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to verify signature');
      return await response.json();
    } catch (error) {
      console.error('Error verifying signature:', error);
      throw error;
    }
  },
};
