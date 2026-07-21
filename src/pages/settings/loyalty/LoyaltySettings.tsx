import React, { useState, useEffect } from 'react';
import { Heart, Save, AlertCircle, TrendingUp, Gift, Loader2 } from 'lucide-react';
import { settingsApi } from '../../../api/settingsApi';
import { useSettings } from '../../../context/SettingsContext';
import { toast } from 'sonner';

const LoyaltySettings: React.FC = () => {
  const { companySettings, refreshSettings } = useSettings();
  const [isSaving, setIsSaving] = useState(false);
  const [loyaltyEnabled, setLoyaltyEnabled] = useState(false);
  const [pointsPerUnit, setPointsPerUnit] = useState(100);
  const [redemptionValue, setRedemptionValue] = useState(1.00);

  useEffect(() => {
    if (companySettings) {
      setLoyaltyEnabled(companySettings.loyalty_enabled || false);
      setPointsPerUnit(companySettings.points_per_unit || 100);
      setRedemptionValue(companySettings.redemption_value || 1.00);
    }
  }, [companySettings]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await settingsApi.updateCompanyProfile({
        ...companySettings,
        loyalty_enabled: loyaltyEnabled,
        points_per_unit: pointsPerUnit,
        redemption_value: redemptionValue
      });
      await refreshSettings();
      toast.success('Loyalty settings updated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update loyalty settings');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F3F8]">
      {/* Header */}
      <div className="bg-white border-b border-[var(--primary-hex)]/5 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-8 py-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-[var(--primary-hex)] mb-2">Loyalty Program</p>
              <h1 className="text-3xl font-extrabold text-[var(--primary-hex)] tracking-tight">Reward Your Customers</h1>
              <p className="text-[var(--primary-hex)]/60 mt-2 font-medium">Configure how customers earn points and redeem them for discounts.</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-[var(--primary-hex)]/10 to-[var(--primary-hex)]/5 rounded-2xl flex items-center justify-center shadow-inner border border-[var(--primary-hex)]/10">
              <Heart className="w-6 h-6 text-[var(--primary-hex)]" />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl p-8 border border-[var(--primary-hex)]/5 shadow-sm">
              <form onSubmit={handleSave} className="space-y-8">
                
                {/* Enable Toggle */}
                <div className="flex items-center justify-between p-6 bg-gradient-to-br from-[#F4F3F8] to-white rounded-2xl border border-[var(--primary-hex)]/5 shadow-sm">
                  <div>
                    <h3 className="text-base font-bold text-[var(--primary-hex)] flex items-center gap-2">
                      <Heart className="w-4 h-4 text-[var(--primary-hex)]" />
                      Enable Loyalty Program
                    </h3>
                    <p className="text-sm text-[var(--primary-hex)]/60 mt-1">Allow customers to earn points on every completed order.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={loyaltyEnabled} onChange={(e) => setLoyaltyEnabled(e.target.checked)} />
                    <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[var(--primary-hex)]"></div>
                  </label>
                </div>

                <div className={`space-y-8 transition-opacity duration-300 ${loyaltyEnabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                  {/* Earn Settings */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-[var(--primary-hex)] uppercase tracking-wider flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-[var(--primary-hex)]" /> Earning Rules
                    </h3>
                    <div className="p-6 bg-[#F4F3F8]/50 rounded-2xl border border-[var(--primary-hex)]/5">
                      <label className="block text-sm font-semibold text-[var(--primary-hex)]/80 mb-2">Spend required to earn 1 Point</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-[var(--primary-hex)]/40">{companySettings?.currency || 'INR'}</span>
                        <input
                          type="number"
                          value={pointsPerUnit}
                          onChange={(e) => setPointsPerUnit(Number(e.target.value))}
                          className="w-full pl-12 pr-4 py-3 bg-white border border-[var(--primary-hex)]/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary-hex)]/20 text-sm font-bold transition-all"
                          placeholder="100"
                          min="1"
                        />
                      </div>
                      <p className="text-xs text-[var(--primary-hex)]/50 mt-2 italic">Example: If set to 100, a {companySettings?.currency || 'INR'} 500 order earns 5 points.</p>
                    </div>
                  </div>

                  {/* Redeem Settings */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-[var(--primary-hex)] uppercase tracking-wider flex items-center gap-2">
                      <Gift className="w-4 h-4 text-[var(--primary-hex)]" /> Redemption Rules
                    </h3>
                    <div className="p-6 bg-[#F4F3F8]/50 rounded-2xl border border-[var(--primary-hex)]/5">
                      <label className="block text-sm font-semibold text-[var(--primary-hex)]/80 mb-2">Value of 1 Point during redemption</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-[var(--primary-hex)]/40">{companySettings?.currency || 'INR'}</span>
                        <input
                          type="number"
                          value={redemptionValue}
                          onChange={(e) => setRedemptionValue(Number(e.target.value))}
                          step="0.01"
                          className="w-full pl-12 pr-4 py-3 bg-white border border-[var(--primary-hex)]/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary-hex)]/20 text-sm font-bold transition-all"
                          placeholder="1.00"
                          min="0.01"
                        />
                      </div>
                      <p className="text-xs text-[var(--primary-hex)]/50 mt-2 italic">Example: If set to 1.00, redeeming 50 points gives a {companySettings?.currency || 'INR'} 50 discount.</p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-[var(--primary-hex)]/5">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-6 py-3 bg-[var(--primary-hex)] hover:bg-[#2A3441] text-white rounded-xl text-sm font-bold transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
                  >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {isSaving ? 'Saving...' : 'Save Settings'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Info Card */}
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-[var(--primary-hex)] to-[#56078C] rounded-3xl p-6 text-white shadow-xl shadow-[var(--primary-hex)]/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10" />
              <Heart className="w-8 h-8 text-white/80 mb-4" />
              <h3 className="text-lg font-bold mb-2">Why Loyalty Matters</h3>
              <p className="text-white/80 text-sm leading-relaxed mb-4">
                A structured loyalty program increases customer retention by up to 30%. Reward your best customers and watch your boutique thrive.
              </p>
              <div className="bg-white/10 p-4 rounded-xl border border-white/10 backdrop-blur-sm">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-[#F43F5E] flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-white/90 font-medium">
                    Points are only awarded when an order's status is changed to <span className="font-bold">Delivered</span>. Redemptions happen when creating or modifying an order.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoyaltySettings;
