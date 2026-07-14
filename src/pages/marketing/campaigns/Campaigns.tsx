import React, { useState, useEffect } from 'react';
import { Plus, Search, Users, Megaphone, CheckCircle2, X, Loader2 } from 'lucide-react';
import { campaignApi, MarketingCampaign } from '../../../api/campaignApi';
import { toast } from 'sonner';

const channelColor: Record<string, string> = {
  Email: 'bg-blue-50 text-blue-700 border-blue-100',
  WhatsApp: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  SMS: 'bg-amber-50 text-amber-700 border-amber-100',
};

const Campaigns: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [campaigns, setCampaigns] = useState<MarketingCampaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Audience Data
  const [audiences, setAudiences] = useState<{ customers: string[], leads: string[], followups: string[] }>({ customers: [], leads: [], followups: [] });
  const [audienceLoading, setAudienceLoading] = useState(false);
  const [selectedAudienceSource, setSelectedAudienceSource] = useState<'customers'|'leads'|'followups'|'all'>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newCampaign, setNewCampaign] = useState({
    name: '',
    subject: '',
    body: '',
  });

  const fetchCampaigns = async () => {
    setIsLoading(true);
    try {
      const data = await campaignApi.getCampaigns();
      setCampaigns(data);
    } catch (error) {
      toast.error('Failed to load campaigns');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const openNewCampaignModal = async () => {
    setIsModalOpen(true);
    setAudienceLoading(true);
    try {
      const data = await campaignApi.getCampaignAudiences();
      setAudiences(data);
    } catch (error) {
      toast.error('Failed to load audience lists');
    } finally {
      setAudienceLoading(false);
    }
  };

  const getSelectedAudienceCount = () => {
    if (selectedAudienceSource === 'customers') return audiences.customers.length;
    if (selectedAudienceSource === 'leads') return audiences.leads.length;
    if (selectedAudienceSource === 'followups') return audiences.followups.length;
    
    // all unique emails across the three lists
    const allEmails = new Set([...audiences.customers, ...audiences.leads, ...audiences.followups]);
    return allEmails.size;
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const audienceCount = getSelectedAudienceCount();

    if (!newCampaign.name || !newCampaign.subject || !newCampaign.body) {
      toast.error('Please fill all required fields');
      return;
    }
    
    if (audienceCount === 0) {
      toast.error('Selected audience is empty. Cannot send campaign.');
      return;
    }

    setIsSubmitting(true);
    try {
      await campaignApi.createCampaign({
        ...newCampaign,
        audience_count: audienceCount,
        channel: 'Email',
        status: 'Completed' // Mocking the send for now
      });
      toast.success('Email campaign successfully dispatched!');
      setIsModalOpen(false);
      setNewCampaign({ name: '', subject: '', body: '' });
      fetchCampaigns();
    } catch (error) {
      toast.error('Failed to create campaign');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = campaigns.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full space-y-5 p-6 bg-slate-50/50">
      <div className="flex justify-between items-center pb-4 border-b border-slate-100">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Email Campaigns</h1>
          <p className="text-sm text-slate-500 mt-1">Create and monitor bulk email marketing campaigns.</p>
        </div>
        <button 
          onClick={openNewCampaignModal}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold flex items-center gap-1.5 transition shadow-sm"
        >
          <Plus className="w-4 h-4" /> New Campaign
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-xl"><Megaphone className="w-5 h-5 text-blue-600" /></div>
          <div><span className="text-xs font-bold text-slate-400 uppercase block">Total Campaigns</span><span className="text-lg font-black text-slate-900">{campaigns.length}</span></div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
          <div className="p-2 bg-emerald-50 rounded-xl"><CheckCircle2 className="w-5 h-5 text-emerald-600" /></div>
          <div><span className="text-xs font-bold text-slate-400 uppercase block">Completed</span><span className="text-lg font-black text-slate-900">{campaigns.filter(c => c.status === 'Completed').length}</span></div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
          <div className="p-2 bg-purple-50 rounded-xl"><Users className="w-5 h-5 text-purple-600" /></div>
          <div><span className="text-xs font-bold text-slate-400 uppercase block">Total Reach</span><span className="text-lg font-black text-slate-900">{campaigns.reduce((s, c) => s + c.audience_count, 0)}</span></div>
        </div>
      </div>

      <div className="flex items-center bg-white border border-slate-200 rounded-xl px-4 py-2.5 w-1/3 shadow-sm">
        <Search className="w-4 h-4 text-slate-400 mr-2" />
        <input type="text" placeholder="Search campaigns..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="bg-transparent border-none outline-none text-sm text-slate-800 placeholder-slate-400 w-full" />
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : campaigns.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center">
          <Megaphone className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-900">No campaigns yet</h3>
          <p className="text-sm text-slate-500 mt-1">Click "New Campaign" to launch your first email marketing effort.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filtered.map(c => (
            <div key={c.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-3 hover:shadow-md transition">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-slate-800">{c.name}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{new Date(c.created_at).toLocaleDateString()}</p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
                  c.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                  c.status === 'Running' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                  c.status === 'Paused' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                  'bg-slate-50 text-slate-600 border-slate-200'
                }`}>{c.status}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${channelColor[c.channel] || channelColor['Email']}`}>{c.channel}</span>
                <span className="text-xs text-slate-500 font-semibold flex items-center gap-1"><Users className="w-3 h-3" /> {c.audience_count} recipients</span>
              </div>
              <div className="text-sm text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <span className="font-semibold block text-xs text-slate-400 uppercase tracking-wider mb-1">Subject</span>
                {c.subject}
              </div>
              {c.open_rate !== undefined && c.open_rate > 0 && (
                <div className="space-y-1 pt-2">
                  <div className="flex justify-between text-xs font-semibold text-slate-500">
                    <span>Open Rate</span><span className="font-bold text-slate-800">{c.open_rate}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${c.open_rate}%` }} />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* New Campaign Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <h2 className="text-lg font-bold text-slate-900">Create Email Campaign</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition text-slate-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreate} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Campaign Name <span className="text-red-500">*</span></label>
                <input required type="text" value={newCampaign.name} onChange={e => setNewCampaign({...newCampaign, name: e.target.value})} placeholder="e.g. Summer Sale 2026" className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Target Audience <span className="text-red-500">*</span></label>
                <select 
                  value={selectedAudienceSource}
                  onChange={e => setSelectedAudienceSource(e.target.value as any)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value="all">Everyone (All Contacts)</option>
                  <option value="customers">Customers Only</option>
                  <option value="leads">Leads Only</option>
                  <option value="followups">Followups Only</option>
                </select>
                <div className="mt-2 p-3 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-between">
                  <span className="text-sm text-blue-800 font-medium">Audience Size:</span>
                  {audienceLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                  ) : (
                    <span className="font-bold text-blue-900 flex items-center gap-1.5">
                      <Users className="w-4 h-4" /> {getSelectedAudienceCount()} emails
                    </span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Subject <span className="text-red-500">*</span></label>
                <input required type="text" value={newCampaign.subject} onChange={e => setNewCampaign({...newCampaign, subject: e.target.value})} placeholder="Exclusive Offer Inside!" className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Body <span className="text-red-500">*</span></label>
                <textarea required rows={6} value={newCampaign.body} onChange={e => setNewCampaign({...newCampaign, body: e.target.value})} placeholder="Write your marketing email here..." className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm resize-none"></textarea>
              </div>

              <div className="pt-4 flex gap-3 border-t border-slate-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition shadow-sm disabled:opacity-70">
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Megaphone className="w-4 h-4" />}
                  {isSubmitting ? 'Sending...' : 'Send Campaign'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Campaigns;
