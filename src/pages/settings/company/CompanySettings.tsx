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
    <label className="block text-[11px] font-bold text-[#16132D]/60 uppercase tracking-widest mb-2">{label}</label>
    <div className="relative group">
      <input
        type={type}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 bg-white border border-[#16132D]/10 rounded-xl text-[13px] font-semibold text-[#16132D] placeholder-[#16132D]/30 focus:outline-none focus:ring-4 focus:ring-[#7209B7]/10 focus:border-[#7209B7] transition-all hover:border-[#16132D]/20 shadow-sm shadow-[#16132D]/[0.02]"
      />
    </div>
    {hint && <p className="text-[10px] text-[#16132D]/40 mt-1.5 font-semibold flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-[#16132D]/20"></span>{hint}</p>}
  </div>
);

const SectionCard = ({ icon: Icon, title, children }: { icon: any; title: string; children: React.ReactNode }) => (
  <div className="bg-white rounded-2xl border border-[#16132D]/[0.05] shadow-[0_4px_24px_-12px_rgba(22,19,45,0.05)] overflow-hidden transition-all duration-300 hover:shadow-[0_8px_32px_-12px_rgba(22,19,45,0.08)]">
    <div className="px-7 py-5 border-b border-[#16132D]/[0.05] flex items-center gap-3 bg-gradient-to-b from-white to-[#F8F8FB]/50">
      <div className="p-2 bg-gradient-to-br from-[#7209B7]/10 to-[#7209B7]/5 rounded-xl border border-[#7209B7]/10 shadow-inner">
        <Icon className="w-4 h-4 text-[#7209B7]" />
      </div>
      <h2 className="text-[15px] font-bold text-[#16132D] tracking-tight">{title}</h2>
    </div>
    <div className="p-7">{children}</div>
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
    <div className="min-h-screen bg-[#F4F3F8] text-[#16132D]">
      <form onSubmit={handleSave}>
        <div className="max-w-5xl mx-auto px-6 md:px-8 py-8 space-y-6">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-5 pb-8 border-b border-[#16132D]/[0.05]">
            <div>
              <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#7209B7] mb-2">Company Settings</p>
              <h1 className="text-3xl font-serif font-bold text-[#16132D] tracking-tight">Boutique Profile</h1>
              <p className="text-[13px] font-medium text-[#16132D]/60 mt-1.5 max-w-xl leading-relaxed">Manage your boutique's identity, contact information, and billing details to customize how you appear to clients.</p>
            </div>
            <button
              type="submit"
              disabled={isSaving}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[13px] font-bold transition-all duration-300 shadow-lg self-start sm:self-auto cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed group ${
                saved
                  ? 'bg-[#10B981] text-white shadow-[#10B981]/25 hover:shadow-[#10B981]/40'
                  : 'bg-[#16132D] hover:bg-[#2D2854] text-white shadow-[#16132D]/20 hover:shadow-[#16132D]/30 hover:-translate-y-0.5'
              }`}
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4 group-hover:scale-110 transition-transform" />}
              {isSaving ? 'Saving...' : saved ? 'Saved successfully!' : 'Save Changes'}
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Live Preview Card */}
            <div className="bg-white rounded-2xl border border-[#16132D]/[0.05] shadow-[0_8px_32px_-12px_rgba(22,19,45,0.06)] overflow-hidden flex flex-col relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent pointer-events-none z-10" />
              <div className="bg-gradient-to-br from-[#16132D] to-[#252047] p-8 flex flex-col items-center text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 mix-blend-overlay"></div>
                <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-[#7209B7] to-[#430570] flex items-center justify-center text-white font-black text-3xl shadow-xl shadow-[#7209B7]/40 mb-5 relative z-10 border border-white/10 ring-4 ring-white/5">
                  {initials}
                </div>
                <h2 className="text-xl font-serif font-bold text-white relative z-10 tracking-tight">{form.name || 'Your Boutique'}</h2>
                {form.tagline && <p className="text-[13px] font-medium text-white/60 mt-1.5 italic relative z-10">"{form.tagline}"</p>}
              </div>
              <div className="p-6 space-y-3.5 flex-1 relative z-10 bg-white">
                {[
                  { icon: Phone, value: form.phone, placeholder: '+91 98765 43210' },
                  { icon: Mail, value: form.email, placeholder: 'hello@boutique.in' },
                  { icon: MapPin, value: form.city && form.state ? `${form.city}, ${form.state}` : '', placeholder: 'City, State' },
                  { icon: Globe, value: form.website, placeholder: 'www.boutique.in' },
                ].map(({ icon: Icon, value, placeholder }, i) => (
                  <div key={i} className="flex items-center gap-3.5 text-[13px] font-semibold group/item">
                    <div className="w-8 h-8 rounded-full bg-[#F8F8FB] border border-[#16132D]/[0.04] flex items-center justify-center text-[#16132D]/40 group-hover/item:text-[#7209B7] group-hover/item:bg-[#7209B7]/5 group-hover/item:border-[#7209B7]/20 transition-all">
                      <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                    </div>
                    <span className={`truncate transition-colors ${value ? 'text-[#16132D]/80' : 'text-[#16132D]/30 italic font-medium'}`}>
                      {value || placeholder}
                    </span>
                  </div>
                ))}
              </div>
              <div className="px-6 pb-5 pt-3 bg-white relative z-10 border-t border-[#16132D]/[0.03]">
                <div className="text-[10px] font-bold text-[#16132D]/30 uppercase tracking-[0.2em] flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse"></span>
                  Live Preview
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
                    <label className="block text-[11px] font-bold text-[#16132D]/60 uppercase tracking-widest mb-2">Currency</label>
                    <select
                      value={form.currency}
                      onChange={e => handleChange('currency', e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-[#16132D]/10 rounded-xl text-[13px] font-semibold text-[#16132D] focus:outline-none focus:ring-4 focus:ring-[#7209B7]/10 focus:border-[#7209B7] transition-all hover:border-[#16132D]/20 shadow-sm shadow-[#16132D]/[0.02] cursor-pointer"
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
                    <label className="block text-[11px] font-bold text-[#16132D]/60 uppercase tracking-widest mb-2">State</label>
                    <select
                      value={form.state}
                      onChange={e => handleChange('state', e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-[#16132D]/10 rounded-xl text-[13px] font-semibold text-[#16132D] focus:outline-none focus:ring-4 focus:ring-[#7209B7]/10 focus:border-[#7209B7] transition-all hover:border-[#16132D]/20 shadow-sm shadow-[#16132D]/[0.02] cursor-pointer"
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
