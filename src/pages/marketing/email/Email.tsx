import React, { useState, useEffect, useRef } from 'react';
import emailjs from '@emailjs/browser';
import { emailLogApi, EmailLog, EmailStats } from '../../../api/emailApi';

// ── EmailJS credentials ──────────────────────────────────────────────────────
const EMAILJS_SERVICE_ID = 'service_spekqpp';
const EMAILJS_TEMPLATE_ID = 'template_f4in486';
const EMAILJS_PUBLIC_KEY = 'xUlwFoqOQI__YZhBm';

// ── Built-in templates ───────────────────────────────────────────────────────
interface Template {
  id: string;
  name: string;
  subject: string;
  body: string;
  category: string;
}

const TEMPLATES: Template[] = [
  {
    id: '1',
    name: 'Order Confirmation',
    category: 'Orders',
    subject: 'Your Order is Confirmed! 🎉',
    body: `Dear {{to_name}},

Thank you for choosing Creative Boutique! Your order has been successfully placed and is now being processed.

Our skilled team will begin work shortly. We will keep you updated at every step.

If you have any questions, feel free to reply to this email.

Warm regards,
Creative Boutique Team`,
  },
  {
    id: '2',
    name: 'Bridal Collection Newsletter',
    category: 'Marketing',
    subject: '✨ Our Exclusive Bridal Collection is Here!',
    body: `Dear {{to_name}},

We're thrilled to announce the launch of our new Bridal Collection for this season!

✨ Handcrafted bridal ensembles
👗 Custom fitting for your perfect day
💍 Exclusive designs you won't find anywhere else

Book your consultation today and let us create your dream outfit.

With love,
Creative Boutique`,
  },
  {
    id: '3',
    name: 'Payment Receipt',
    category: 'Billing',
    subject: 'Payment Receipt — Creative Boutique',
    body: `Dear {{to_name}},

We have successfully received your payment. Thank you!

Your balance is now updated and your order is confirmed for processing.

Please keep this email as your receipt for reference.

For any queries, contact us at support@creativeboutique.com

Best regards,
Creative Boutique Billing Team`,
  },
  {
    id: '4',
    name: 'Ready for Pickup',
    category: 'Orders',
    subject: 'Your Order is Ready for Pickup! 🎊',
    body: `Dear {{to_name}},

Great news! Your order is ready and waiting for you at our boutique.

📍 Our Address: Creative Boutique, Main Branch
🕐 Pickup Hours: 10 AM – 7 PM (Mon–Sat)

Please bring this email along when you come to collect.

We look forward to seeing you!

Warm regards,
Creative Boutique`,
  },
  {
    id: '5',
    name: 'Trial Appointment Reminder',
    category: 'Appointments',
    subject: 'Your Trial Appointment Reminder — Creative Boutique',
    body: `Dear {{to_name}},

This is a friendly reminder about your upcoming trial appointment at Creative Boutique.

Please arrive on time so we can give you our full attention and ensure the perfect fit.

If you need to reschedule, please call us at least 24 hours in advance.

Looking forward to your visit!

Creative Boutique`,
  },
  {
    id: '6',
    name: 'Custom Message',
    category: 'Custom',
    subject: '',
    body: '',
  },
];

const CATEGORY_COLORS: Record<string, string> = {
  Orders: 'bg-blue-100 text-blue-700',
  Marketing: 'bg-purple-100 text-purple-700',
  Billing: 'bg-emerald-100 text-emerald-700',
  Appointments: 'bg-amber-100 text-amber-700',
  Custom: 'bg-gray-100 text-gray-700',
};

// ── Component ─────────────────────────────────────────────────────────────────
const Email: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'compose' | 'history'>('compose');
  const [selectedTemplate, setSelectedTemplate] = useState<Template>(TEMPLATES[0]);
  const [toEmail, setToEmail] = useState('');
  const [toName, setToName] = useState('');
  const [subject, setSubject] = useState(TEMPLATES[0].subject);
  const [body, setBody] = useState(TEMPLATES[0].body);
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  // History
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [stats, setStats] = useState<EmailStats | null>(null);
  const [logsLoading, setLogsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const formRef = useRef<HTMLFormElement>(null);

  // Load stats + logs
  const fetchHistory = async () => {
    setLogsLoading(true);
    try {
      const [logsData, statsData] = await Promise.all([
        emailLogApi.getLogs({ limit: 50 }) as Promise<EmailLog[]>,
        emailLogApi.getStats(),
      ]);
      setLogs(Array.isArray(logsData) ? logsData : (logsData as any).logs || []);
      setStats(statsData);
    } catch {
      // silently fail — history is non-critical
    } finally {
      setLogsLoading(false);
    }
  };

  useEffect(() => { fetchHistory(); }, []);

  const handleTemplateSelect = (t: Template) => {
    setSelectedTemplate(t);
    setSubject(t.subject);
    setBody(t.body);
    setSendResult(null);
  };

  const handleSend = async () => {
    if (!toEmail.trim()) { setSendResult({ type: 'error', msg: 'Please enter a recipient email.' }); return; }
    if (!subject.trim()) { setSendResult({ type: 'error', msg: 'Subject cannot be empty.' }); return; }
    if (!body.trim()) { setSendResult({ type: 'error', msg: 'Message body cannot be empty.' }); return; }

    setSending(true);
    setSendResult(null);

    // Variable names must match the EmailJS template exactly:
    // {{name}}    → displayed sender name in email body
    // {{title}}   → shown under name (their email address)
    // {{message}} → message content
    // {{subject}} → used in "Contact Us: {{subject}}"
    // {{to_email}} → Reply-To field
    const templateParams = {
      name: toName.trim() || 'Customer',
      title: toEmail.trim(),
      message: body.trim(),
      subject: subject.trim(),
      to_email: toEmail.trim(),
      from_name: 'Creative Boutique',
    };

    try {
      await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams, EMAILJS_PUBLIC_KEY);

      // Log success to backend
      await emailLogApi.logEmail({
        to_email: toEmail.trim(),
        to_name: toName.trim() || undefined,
        subject: subject.trim(),
        message: body.trim(),
        template_name: selectedTemplate.name,
        status: 'sent',
      });

      setSendResult({ type: 'success', msg: `Email sent successfully to ${toEmail}!` });
      setToEmail('');
      setToName('');
      fetchHistory();
    } catch (err: any) {
      const errorMsg = err?.text || err?.message || 'Failed to send email. Please try again.';

      // Log failure to backend
      try {
        await emailLogApi.logEmail({
          to_email: toEmail.trim(),
          to_name: toName.trim() || undefined,
          subject: subject.trim(),
          message: body.trim(),
          template_name: selectedTemplate.name,
          status: 'failed',
          error_message: errorMsg,
        });
      } catch { /* ignore logging errors */ }

      setSendResult({ type: 'error', msg: errorMsg });
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await emailLogApi.deleteLog(id);
      setLogs(prev => prev.filter(l => l.id !== id));
      setDeleteConfirm(null);
      fetchHistory();
    } catch {
      alert('Failed to delete log');
    }
  };

  const filteredLogs = logs.filter(l =>
    !search ||
    l.to_email.toLowerCase().includes(search.toLowerCase()) ||
    l.subject.toLowerCase().includes(search.toLowerCase()) ||
    (l.to_name?.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="flex flex-col h-full space-y-5 p-6 bg-slate-50/50">
      {/* Header */}
      <div className="flex justify-between items-center pb-4 border-b border-slate-100">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Email</h1>
          <p className="text-sm text-slate-500 mt-1">Compose and send emails to customers via EmailJS. All emails are logged.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('compose')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${activeTab === 'compose' ? 'bg-blue-600 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
          >
            ✉️ Compose
          </button>
          <button
            onClick={() => { setActiveTab('history'); fetchHistory(); }}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${activeTab === 'history' ? 'bg-blue-600 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
          >
            📋 History
          </button>
        </div>
      </div>

      {/* Stats strip — always visible */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Total Sent', value: stats.total_sent, color: 'from-blue-500 to-blue-600', icon: '📬' },
            { label: 'Successful', value: stats.successful, color: 'from-emerald-500 to-emerald-600', icon: '✅' },
            { label: 'Failed', value: stats.failed, color: 'from-red-500 to-red-600', icon: '❌' },
            { label: 'Sent Today', value: stats.sent_today, color: 'from-purple-500 to-purple-600', icon: '📅' },
          ].map(s => (
            <div key={s.label} className={`bg-gradient-to-r ${s.color} rounded-xl p-4 text-white shadow-sm`}>
              <div className="flex items-center gap-2">
                <span className="text-xl">{s.icon}</span>
                <p className="text-xs font-medium opacity-90">{s.label}</p>
              </div>
              <p className="text-2xl font-bold mt-1">{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── COMPOSE TAB ──────────────────────────────────────────────────── */}
      {activeTab === 'compose' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Template Sidebar */}
          <div className="space-y-2">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Templates</h2>
            {TEMPLATES.map(t => (
              <button
                key={t.id}
                onClick={() => handleTemplateSelect(t)}
                className={`w-full text-left p-4 rounded-xl border transition-all ${
                  selectedTemplate.id === t.id
                    ? 'border-blue-300 bg-blue-50/60 ring-2 ring-blue-100'
                    : 'bg-white border-slate-100 hover:border-slate-300 shadow-sm hover:shadow-md'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-sm font-bold text-slate-800">{t.name}</p>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${CATEGORY_COLORS[t.category] || 'bg-gray-100 text-gray-600'}`}>
                    {t.category}
                  </span>
                </div>
                {t.subject && (
                  <p className="text-xs text-slate-400 truncate">{t.subject}</p>
                )}
              </button>
            ))}
          </div>

          {/* Compose Editor */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-bold text-slate-600 uppercase tracking-wider">Compose Email</h2>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${CATEGORY_COLORS[selectedTemplate.category] || ''}`}>
                {selectedTemplate.name}
              </span>
            </div>

            {/* Send Result */}
            {sendResult && (
              <div className={`px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2 ${
                sendResult.type === 'success'
                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                  : 'bg-red-50 border border-red-200 text-red-800'
              }`}>
                <span>{sendResult.type === 'success' ? '✅' : '❌'}</span>
                {sendResult.msg}
              </div>
            )}

            {/* Recipient fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  To (Email) <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={toEmail}
                  onChange={e => setToEmail(e.target.value)}
                  placeholder="customer@example.com"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Recipient Name
                </label>
                <input
                  type="text"
                  value={toName}
                  onChange={e => setToName(e.target.value)}
                  placeholder="Customer name (optional)"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition"
                />
              </div>
            </div>

            {/* Subject */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Subject <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={subject}
                onChange={e => setSubject(e.target.value)}
                placeholder="Email subject..."
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition"
              />
            </div>

            {/* Body */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Message Body <span className="text-red-500">*</span>
                </label>
                <span className="text-xs text-slate-400">{body.length} chars</span>
              </div>
              <textarea
                value={body}
                onChange={e => setBody(e.target.value)}
                rows={10}
                placeholder="Write your message here..."
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition resize-none font-mono text-slate-700 leading-relaxed"
              />
            </div>

            {/* Preview hint */}
            <div className="text-xs text-slate-400 bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
              💡 <strong>Note:</strong> Use <code className="bg-slate-200 px-1 rounded">{'{{to_name}}'}</code> in your message — it will be replaced with the recipient's name automatically.
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center pt-2">
              <button
                onClick={() => { setToEmail(''); setToName(''); setSubject(selectedTemplate.subject); setBody(selectedTemplate.body); setSendResult(null); }}
                className="px-4 py-2 text-sm text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition"
              >
                Reset
              </button>
              <button
                onClick={handleSend}
                disabled={sending}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold flex items-center gap-2 transition shadow-sm disabled:opacity-60"
              >
                {sending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    Send Email
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── HISTORY TAB ──────────────────────────────────────────────────── */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          {/* Search */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search by email, name or subject..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>
            <button onClick={fetchHistory} className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            {logsLoading ? (
              <div className="flex items-center justify-center h-48">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-9 h-9 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm text-slate-500">Loading email history...</p>
                </div>
              </div>
            ) : filteredLogs.length === 0 ? (
              <div className="flex items-center justify-center h-48">
                <div className="text-center">
                  <div className="text-4xl mb-3">📭</div>
                  <p className="text-slate-500 font-medium">No emails sent yet</p>
                  <p className="text-sm text-slate-400 mt-1">Compose and send your first email!</p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-100">
                  <thead className="bg-slate-50">
                    <tr>
                      {['Recipient', 'Subject', 'Template', 'Status', 'Sent At', 'Actions'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredLogs.map(log => (
                      <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm flex-shrink-0">
                              {(log.to_name || log.to_email).charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-slate-800">{log.to_name || '—'}</p>
                              <p className="text-xs text-slate-400">{log.to_email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm text-slate-700 font-medium max-w-[220px] truncate">{log.subject}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${CATEGORY_COLORS[log.template_name ? 'Orders' : 'Custom'] || 'bg-gray-100 text-gray-600'}`}>
                            {log.template_name || 'Custom'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            log.status === 'sent'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${log.status === 'sent' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                            {log.status === 'sent' ? 'Sent' : 'Failed'}
                          </span>
                          {log.error_message && (
                            <p className="text-xs text-red-500 mt-0.5 max-w-[160px] truncate" title={log.error_message}>{log.error_message}</p>
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-500">
                          {new Date(log.sent_at).toLocaleString('en-IN', {
                            day: '2-digit', month: 'short', year: 'numeric',
                            hour: '2-digit', minute: '2-digit',
                          })}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => setDeleteConfirm(log.id)}
                            className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete log"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirm !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Delete Email Log</h3>
                <p className="text-sm text-slate-500 mt-0.5">This will permanently remove this email record.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 border border-slate-200 text-slate-700 rounded-xl text-sm hover:bg-slate-50">
                Cancel
              </button>
              <button onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Email;
