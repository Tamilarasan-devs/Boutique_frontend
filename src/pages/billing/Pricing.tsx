import React, { useState, useEffect } from 'react';
import { Check, Shield, Zap, Sparkles, Loader2 } from 'lucide-react';
import { subscriptionApi, SubscriptionStatus } from '../../api/subscriptionApi';

// Extend window for Razorpay
declare global {
  interface Window {
    Razorpay: any;
  }
}

const Pricing: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<SubscriptionStatus | null>(null);

  useEffect(() => {
    fetchStatus();
    // Load Razorpay Script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const fetchStatus = async () => {
    try {
      const data = await subscriptionApi.getSubscriptionStatus();
      setStatus(data);
    } catch (error) {
      console.error('Failed to fetch status:', error);
    }
  };

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      // 1. Create subscription via our backend
      const subscription = await subscriptionApi.createSubscription('plan_pro_monthly');

      // 2. Open Razorpay Checkout
      const options = {
        key: 'rzp_test_T8b3MwEJ41lxAO', // Real test key
        subscription_id: subscription.id,
        name: 'Creative Boutique CRM',
        description: 'Pro Monthly Subscription',
        handler: async function (response: any) {
          try {
            // 3. Verify payment signature on backend
            await subscriptionApi.verifySignature({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_subscription_id: response.razorpay_subscription_id,
              razorpay_signature: response.razorpay_signature,
            });
            alert('Subscription successful! Welcome to Pro.');
            fetchStatus(); // Refresh status to unlock CRM
            window.location.href = '/'; // Redirect to dashboard
          } catch (err) {
            alert('Payment verification failed.');
          }
        },
        prefill: {
          name: 'Boutique Owner',
          email: 'owner@creativeboutique.com',
          contact: '9999999999',
        },
        theme: {
          color: '#1C2430',
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      alert('Error initiating checkout. Please try again later.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (status?.status === 'active') {
    return (
      <div className="min-h-screen bg-[#FAF7F1] flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-[#1C2430]/10 max-w-md w-full">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-[#1C2430] mb-2">You're Subscribed!</h2>
          <p className="text-[#1C2430]/60 mb-6">Your Pro Subscription is active. Thank you for using Creative Boutique CRM.</p>
          <div className="bg-[#FAF7F1] p-4 rounded-xl text-left border border-[#1C2430]/[0.05]">
            <p className="text-sm font-semibold text-[#1C2430]">Subscription ID</p>
            <p className="text-xs text-[#1C2430]/60 truncate font-mono">{status.razorpay_subscription_id || 'N/A'}</p>
          </div>
          <a href="/" className="block mt-6 px-4 py-2.5 bg-[#1C2430] hover:bg-[#2a3545] text-white rounded-lg font-semibold transition">
            Go to Dashboard
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7F1] text-[#1C2430] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h1 className="text-4xl font-serif font-bold tracking-tight text-[#1C2430] sm:text-5xl mb-4">
            Upgrade to Pro
          </h1>
          <p className="text-lg text-[#1C2430]/60">
            Unlock the full potential of your boutique with advanced CRM features, automated marketing, and inventory management.
          </p>
        </div>

        <div className="max-w-lg mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-[#1C2430]/10 relative">
          {/* Decorative top bar */}
          <div className="h-2 w-full bg-gradient-to-r from-[#C99A3E] via-[#C1652F] to-[#7A5AA8]"></div>
          
          <div className="p-8 sm:p-10">
            <div className="flex justify-between items-end mb-6">
              <div>
                <h3 className="text-2xl font-bold text-[#1C2430] flex items-center gap-2">
                  Pro Plan <Sparkles className="w-5 h-5 text-[#C99A3E]" />
                </h3>
                <p className="text-sm text-[#1C2430]/60 mt-1">Everything you need to grow.</p>
              </div>
              <div className="text-right">
                <span className="text-4xl font-bold text-[#1C2430]">₹1,999</span>
                <span className="text-[#1C2430]/60 block text-sm">/ month</span>
              </div>
            </div>

            <ul className="space-y-4 mb-8">
              {[
                'Unlimited Customers & Leads',
                'Advanced Production Tracking',
                'Automated Email & WhatsApp Marketing',
                'Inventory & Stock Ledger',
                'Staff Attendance & Payroll',
                'Priority Support'
              ].map((feature, idx) => (
                <li key={idx} className="flex items-start">
                  <div className="flex-shrink-0 w-5 h-5 mt-0.5 rounded-full bg-[#2F5D4F]/10 flex items-center justify-center">
                    <Check className="w-3 h-3 text-[#2F5D4F]" />
                  </div>
                  <span className="ml-3 text-[#1C2430]/80 font-medium">{feature}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={handleSubscribe}
              disabled={loading}
              className="w-full py-4 px-6 rounded-xl bg-[#1C2430] hover:bg-[#2a3545] text-[#FAF7F1] text-lg font-bold flex items-center justify-center gap-2 transition shadow-lg shadow-[#1C2430]/10 disabled:opacity-70"
            >
              {loading ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</>
              ) : (
                <><Zap className="w-5 h-5" /> Subscribe Now</>
              )}
            </button>
            
            <p className="text-center text-xs text-[#1C2430]/50 mt-4 flex items-center justify-center gap-1.5">
              <Shield className="w-4 h-4" /> Secured by Razorpay
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
