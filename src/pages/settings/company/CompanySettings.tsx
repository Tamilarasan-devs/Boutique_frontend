import React, { useState, useEffect } from 'react';
import { Save, Building2, Phone, Mail, MapPin, Globe, CheckCircle2, Loader2, Landmark, Receipt, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { settingsApi } from '../../../api/settingsApi';
import { useSettings } from '../../../context/SettingsContext';
import { THEMES, applyTheme } from '../../../utils/theme';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu & Kashmir', 'Ladakh', 'Puducherry'
];

/* ---------- Building blocks ---------- */

const Field = ({
  label, value, onChange, placeholder = '', type = 'text', hint = '', required = false
}: { label: string; value: string; onChange: (val: string) => void; placeholder?: string; type?: string; hint?: string; required?: boolean }) => (
  <div>
    <label className="block text-[13px] font-medium text-gray-700 mb-1.5">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-[14px] text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--primary-hex)]/20 focus:border-[var(--primary-hex)] transition-colors"
    />
    {hint && <p className="text-[12px] text-gray-400 mt-1.5">{hint}</p>}
  </div>
);

const Select = ({
  label, value, onChange, children
}: { label: string; value: string; onChange: (val: string) => void; children: React.ReactNode }) => (
  <div>
    <label className="block text-[13px] font-medium text-gray-700 mb-1.5">{label}</label>
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-[14px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--primary-hex)]/20 focus:border-[var(--primary-hex)] transition-colors cursor-pointer"
    >
      {children}
    </select>
  </div>
);

const SectionCard = ({
  icon: Icon, title, description, children
}: { icon: any; title: string; description?: string; children: React.ReactNode }) => (
  <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
    <div className="px-6 py-5 border-b border-gray-100 flex items-start gap-3">
      <div className="w-9 h-9 rounded-lg bg-[var(--primary-hex)]/5 flex items-center justify-center flex-shrink-0">
        <Icon className="w-4.5 h-4.5 text-[var(--primary-hex)]" />
      </div>
      <div>
        <h2 className="text-[15px] font-semibold text-gray-900">{title}</h2>
        {description && <p className="text-[13px] text-gray-500 mt-0.5">{description}</p>}
      </div>
    </div>
    <div className="p-6">{children}</div>
  </div>
);

const CompanySettings: React.FC = () => {
  const { companySettings, refreshSettings } = useSettings();
  const [saved, setSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [currentThemeName, setCurrentThemeName] = useState(() => localStorage.getItem('boutique_theme_name') || THEMES[0].name);
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
    logoUrl: '',
  });

  const handleChange = (key: string, value: string) => setForm({ ...form, [key]: value });

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingLogo(true);
    try {
      const url = await settingsApi.uploadLogo(file);
      handleChange('logoUrl', url);
      
      // Auto-save the logo to the backend so it doesn't get lost on refresh
      await settingsApi.updateCompanyProfile({ ...form, logoUrl: url, invoicePrefix: form.invoicePrefix });
      await refreshSettings();

      toast.success('Logo uploaded successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload logo');
    } finally {
      setIsUploadingLogo(false);
      e.target.value = '';
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await settingsApi.updateCompanyProfile({ ...form, invoicePrefix: form.invoicePrefix });
      await refreshSettings();
      setSaved(true);
      toast.success('Company profile updated');
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
        logoUrl: companySettings.logo_url || companySettings.logoUrl || '',
      });
    }
  }, [companySettings]);

  const initials = form.name
    ? form.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : 'BC';

  // simple profile-completeness indicator
  const requiredFields = [form.name, form.email, form.phone, form.address, form.city, form.pincode];
  const completeness = Math.round((requiredFields.filter(Boolean).length / requiredFields.length) * 100);

  return (
    <div className="min-h-screen bg-gray-50">
      <form onSubmit={handleSave}>
        <div className="max-w-6xl mx-auto px-6 md:px-8 py-8 space-y-6">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 pb-6 border-b border-gray-200">
            <div>
              <nav className="text-[13px] text-gray-400 mb-1.5">
                Settings <span className="mx-1.5">/</span> <span className="text-gray-600 font-medium">Company profile</span>
              </nav>
              <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Company profile</h1>
              <p className="text-[13px] text-gray-500 mt-1">
                This information appears on invoices, receipts, and client-facing communication.
              </p>
            </div>
            <button
              type="submit"
              disabled={isSaving}
              className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-[14px] font-semibold transition-colors self-start sm:self-auto cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${
                saved
                  ? 'bg-emerald-600 text-white'
                  : 'bg-[var(--primary-hex)] hover:opacity-90 text-white'
              }`}
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              {isSaving ? 'Saving…' : saved ? 'Saved' : 'Save changes'}
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Left rail: profile summary */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <div className="flex items-center gap-4">
                  {form.logoUrl ? (
                    <img src={form.logoUrl} alt="Company Logo" className="w-14 h-14 rounded-full object-cover border border-gray-200 flex-shrink-0" />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-[var(--primary-hex)] text-white font-semibold text-lg flex items-center justify-center flex-shrink-0">
                      {initials}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-[15px] font-semibold text-gray-900 truncate">{form.name || 'Your company'}</p>
                    <p className="text-[13px] text-gray-500 truncate">{form.tagline || 'No tagline set'}</p>
                  </div>
                </div>

                <div className="mt-5 space-y-2.5">
                  {[
                    { icon: Phone, value: form.phone },
                    { icon: Mail, value: form.email },
                    { icon: MapPin, value: form.city && form.state ? `${form.city}, ${form.state}` : '' },
                    { icon: Globe, value: form.website },
                  ].filter(row => row.value).map(({ icon: Icon, value }, i) => (
                    <div key={i} className="flex items-center gap-2.5 text-[13px] text-gray-600">
                      <Icon className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                      <span className="truncate">{value}</span>
                    </div>
                  ))}
                  {!form.phone && !form.email && !form.website && (
                    <p className="text-[13px] text-gray-400 italic">Fill in the form to build your company profile card.</p>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <div className="flex items-center justify-between mb-2.5">
                  <p className="text-[13px] font-medium text-gray-700">Profile completeness</p>
                  <span className="text-[13px] font-semibold text-gray-900">{completeness}%</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[var(--primary-hex)] rounded-full transition-all duration-500"
                    style={{ width: `${completeness}%` }}
                  />
                </div>
                <p className="text-[12px] text-gray-400 mt-2.5">
                  Required: name, email, phone, address, city, and PIN code.
                </p>
              </div>
            </div>

            {/* Form sections */}
            <div className="lg:col-span-2 space-y-6">
              <SectionCard icon={Building2} title="Business details" description="Basic information used across the app and on documents">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Field label="Company name" required value={form.name} onChange={(v) => handleChange('name', v)} placeholder="e.g. Acme Corp" />
                  <div>
                    <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Company logo</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      disabled={isUploadingLogo}
                      className="block w-full text-[13px] text-gray-500 file:mr-3 file:py-2 file:px-3 file:rounded-md file:border-0 file:text-[13px] file:font-medium file:bg-[var(--primary-hex)]/10 file:text-[var(--primary-hex)] hover:file:bg-[var(--primary-hex)]/20 cursor-pointer focus:outline-none transition-colors"
                    />
                    {isUploadingLogo && <p className="text-[12px] text-[var(--primary-hex)] mt-1.5 flex items-center gap-1.5"><Loader2 className="w-3 h-3 animate-spin" /> Uploading...</p>}
                  </div>
                  <Field label="Tagline" value={form.tagline} onChange={(v) => handleChange('tagline', v)} placeholder="Crafting excellence" />
                  <Field label="Email address" value={form.email} onChange={(v) => handleChange('email', v)} placeholder="hello@company.com" type="email" />
                  <Field label="Phone number" value={form.phone} onChange={(v) => handleChange('phone', v)} placeholder="+91 98765 43210" />
                  <Field label="Website" value={form.website} onChange={(v) => handleChange('website', v)} placeholder="www.boutique.in" />
                  <Select label="Currency" value={form.currency} onChange={(v) => handleChange('currency', v)}>
                    <option value="INR">₹ INR — Indian Rupee</option>
                    <option value="USD">$ USD — US Dollar</option>
                    <option value="AED">AED — UAE Dirham</option>
                  </Select>
                </div>
              </SectionCard>

              {/* <SectionCard icon={Receipt} title="Billing & tax" description="Used to generate compliant invoices and receipts">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Field label="GST number" value={form.gst} onChange={(v) => handleChange('gst', v)} placeholder="27AAAAA1111A1Z1" hint="15-digit GSTIN" />
                  <Field label="PAN number" value={form.pan} onChange={(v) => handleChange('pan', v)} placeholder="AAAAA1111A" hint="10-character PAN" />
                  <Field label="Invoice prefix" value={form.invoicePrefix} onChange={(v) => handleChange('invoicePrefix', v)} placeholder="INV" hint="e.g. INV → INV-001" />
                </div>
              </SectionCard> */}

              <SectionCard icon={Landmark} title="Registered address" description="Your company's legal or operating address">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="md:col-span-3">
                    <Field label="Street address" value={form.address} onChange={(v) => handleChange('address', v)} placeholder="12, Fashion Arcade, Linking Road" />
                  </div>
                  <Field label="City" value={form.city} onChange={(v) => handleChange('city', v)} placeholder="Mumbai" />
                  <Select label="State" value={form.state} onChange={(v) => handleChange('state', v)}>
                    {INDIAN_STATES.map(s => <option key={s}>{s}</option>)}
                  </Select>
                  <Field label="PIN code" value={form.pincode} onChange={(v) => handleChange('pincode', v)} placeholder="400001" />
                </div>
              </SectionCard>

              <div className="flex items-start gap-2.5 px-1">
                <ShieldCheck className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                <p className="text-[12.5px] text-gray-500">
                  Your business information is stored securely and only used to personalize invoices, receipts, and client communication.
                </p>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CompanySettings;