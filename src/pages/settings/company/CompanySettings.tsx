import React, { useState, useEffect } from 'react';
import { Save, Building2, Phone, Mail, MapPin, Globe, CheckCircle2, Scissors, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { settingsApi } from '../../../api/settingsApi';
import { useSettings } from '../../../context/SettingsContext';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu & Kashmir', 'Ladakh', 'Puducherry'
];

const Field = ({
  label, value, onChange, placeholder = '', type = 'text', hint = ''
}: { label: string; value: string; onChange: (val: string) => void; placeholder?: string; type?: string; hint?: string }) => (
  <div>
    <label className="block text-xs font-bold text-[#1C2430]/45 uppercase tracking-wider mb-1.5">{label}</label>
    <input
      type={type}
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-4 py-2.5 border border-[#1C2430]/[0.1] rounded-xl text-sm font-medium text-[#1C2430] bg-white focus:outline-none focus:ring-2 focus:ring-[#C1652F]/25 focus:border-[#C1652F]/40 transition placeholder-[#1C2430]/25"
    />
    {hint && <p className="text-[10px] text-[#1C2430]/35 mt-1 font-medium">{hint}</p>}
  </div>
);

const SectionCard = ({ icon: Icon, title, children }: { icon: any; title: string; children: React.ReactNode }) => (
  <div className="bg-white rounded-2xl border border-[#1C2430]/[0.06] shadow-[0_1px_3px_rgba(28,36,48,0.04)] overflow-hidden">
    <div className="px-6 py-4 border-b border-[#1C2430]/[0.07] flex items-center gap-2.5">
      <div className="p-1.5 bg-[#C1652F]/10 rounded-lg">
        <Icon className="w-4 h-4 text-[#C1652F]" />
      </div>
      <h2 className="text-sm font-bold text-[#1C2430]">{title}</h2>
    </div>
    <div className="p-6">{children}</div>
  </div>
);

const CompanySettings: React.FC = () => {
  const { companySettings, refreshSettings } = useSettings();
  const [saved, setSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    tagline: '',
    email: '',
    phone: '',
    gst: '',
    pan: '',
    address: '',
    city: '',
    state: 'Maharashtra',
    pincode: '',
    website: '',
    currency: 'INR',
    invoicePrefix: 'INV',
  });

  const handleChange = (key: string, value: string) => setForm({ ...form, [key]: value });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await settingsApi.updateCompanyProfile({ ...form, invoicePrefix: form.invoicePrefix });
      await refreshSettings();
      setSaved(true);
      toast.success('Boutique profile updated');
      setTimeout(() => setSaved(false), 2500);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update settings');
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    if (companySettings) {
      setForm({
        name: companySettings.name || '',
        tagline: companySettings.tagline || '',
        email: companySettings.email || '',
        phone: companySettings.phone || '',
        gst: companySettings.gst || '',
        pan: companySettings.pan || '',
        address: companySettings.address || '',
        city: companySettings.city || '',
        state: companySettings.state || 'Maharashtra',
        pincode: companySettings.pincode || '',
        website: companySettings.website || '',
        currency: companySettings.currency || 'INR',
        invoicePrefix: companySettings.invoice_prefix || 'INV',
      });
    }
  }, [companySettings]);

  const initials = form.name
    ? form.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : 'BC';

  return (
    <div className="min-h-screen bg-[#FAF7F1] text-[#1C2430]">
      <form onSubmit={handleSave}>
        <div className="max-w-5xl mx-auto px-6 md:px-8 py-8 space-y-6">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 pb-6 border-b border-[#1C2430]/[0.08]">
            <div>
              <p className="text-xs font-semibold tracking-[0.18em] uppercase text-[#C1652F] mb-1.5">Settings</p>
              <h1 className="text-3xl font-serif font-semibold text-[#1C2430]">Boutique Profile</h1>
              <p className="text-sm text-[#1C2430]/55 mt-1">Your boutique's identity, business details, and contact information.</p>
            </div>
            <button
              type="submit"
              disabled={isSaving}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition shadow-md self-start sm:self-auto cursor-pointer disabled:opacity-70 ${
                saved
                  ? 'bg-[#2F5D4F] text-white shadow-[#2F5D4F]/20'
                  : 'bg-[#1C2430] hover:bg-[#2a3545] text-[#FAF7F1] shadow-[#1C2430]/10'
              }`}
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              {isSaving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Live Preview Card */}
            <div className="bg-white rounded-2xl border border-[#1C2430]/[0.06] shadow-[0_1px_3px_rgba(28,36,48,0.04)] overflow-hidden flex flex-col">
              <div className="bg-gradient-to-br from-[#1C2430] to-[#2a3545] p-6 flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-2xl bg-[#C1652F] flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-[#C1652F]/30 mb-3">
                  {initials}
                </div>
                <h2 className="text-lg font-serif font-bold text-white">{form.name || 'Your Boutique'}</h2>
                {form.tagline && <p className="text-xs text-white/55 mt-1 italic">{form.tagline}</p>}
              </div>
              <div className="p-4 space-y-2 flex-1">
                {[
                  { icon: Phone, value: form.phone, placeholder: '+91 98765 43210' },
                  { icon: Mail, value: form.email, placeholder: 'hello@boutique.in' },
                  { icon: MapPin, value: form.city && form.state ? `${form.city}, ${form.state}` : '', placeholder: 'City, State' },
                  { icon: Globe, value: form.website, placeholder: 'www.boutique.in' },
                ].map(({ icon: Icon, value, placeholder }, i) => (
                  <div key={i} className="flex items-center gap-2.5 text-xs text-[#1C2430]/60 font-medium">
                    <Icon className="w-3.5 h-3.5 text-[#1C2430]/30 flex-shrink-0" />
                    <span className={value ? '' : 'text-[#1C2430]/25 italic'}>{value || placeholder}</span>
                  </div>
                ))}
              </div>
              <div className="px-4 pb-4 pt-1">
                <div className="text-[10px] font-bold text-[#1C2430]/30 uppercase tracking-wider flex items-center gap-1.5">
                  <Scissors className="w-3 h-3" /> Live Preview
                </div>
              </div>
            </div>

            {/* Form Sections */}
            <div className="lg:col-span-2 space-y-5">
              <SectionCard icon={Building2} title="Business Details">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Boutique Name *" value={form.name} onChange={(v) => handleChange('name', v)} placeholder="e.g. Priya's Atelier" />
                  <Field label="Tagline" value={form.tagline} onChange={(v) => handleChange('tagline', v)} placeholder="Crafting elegance, stitch by stitch" />
                  <Field label="Email Address" value={form.email} onChange={(v) => handleChange('email', v)} placeholder="hello@boutique.in" type="email" />
                  <Field label="Phone Number" value={form.phone} onChange={(v) => handleChange('phone', v)} placeholder="+91 98765 43210" />
                  <Field label="GST Number" value={form.gst} onChange={(v) => handleChange('gst', v)} placeholder="27AAAAA1111A1Z1" hint="15-digit GSTIN" />
                  <Field label="PAN Number" value={form.pan} onChange={(v) => handleChange('pan', v)} placeholder="AAAAA1111A" hint="10-character PAN" />
                  <Field label="Website" value={form.website} onChange={(v) => handleChange('website', v)} placeholder="www.boutique.in" />
                  <div>
                    <label className="block text-xs font-bold text-[#1C2430]/45 uppercase tracking-wider mb-1.5">Currency</label>
                    <select
                      value={form.currency}
                      onChange={e => handleChange('currency', e.target.value)}
                      className="w-full px-4 py-2.5 border border-[#1C2430]/[0.1] rounded-xl text-sm font-medium text-[#1C2430] bg-white focus:outline-none focus:ring-2 focus:ring-[#C1652F]/25 cursor-pointer"
                    >
                      <option value="INR">₹ INR — Indian Rupee</option>
                      <option value="USD">$ USD — US Dollar</option>
                      <option value="AED">AED — UAE Dirham</option>
                    </select>
                  </div>
                  <Field label="Invoice Prefix" value={form.invoicePrefix} onChange={(v) => handleChange('invoicePrefix', v)} placeholder="INV" hint="e.g. INV → INV-001" />
                </div>
              </SectionCard>

              <SectionCard icon={MapPin} title="Registered Address">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-3">
                    <Field label="Street Address" value={form.address} onChange={(v) => handleChange('address', v)} placeholder="12, Fashion Arcade, Linking Road" />
                  </div>
                  <Field label="City" value={form.city} onChange={(v) => handleChange('city', v)} placeholder="Mumbai" />
                  <div>
                    <label className="block text-xs font-bold text-[#1C2430]/45 uppercase tracking-wider mb-1.5">State</label>
                    <select
                      value={form.state}
                      onChange={e => handleChange('state', e.target.value)}
                      className="w-full px-4 py-2.5 border border-[#1C2430]/[0.1] rounded-xl text-sm font-medium text-[#1C2430] bg-white focus:outline-none focus:ring-2 focus:ring-[#C1652F]/25 cursor-pointer"
                    >
                      {INDIAN_STATES.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <Field label="PIN Code" value={form.pincode} onChange={(v) => handleChange('pincode', v)} placeholder="400001" />
                </div>
              </SectionCard>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CompanySettings;
