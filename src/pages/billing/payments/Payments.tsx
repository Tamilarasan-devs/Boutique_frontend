import React, { useState, useEffect } from 'react';
import { Search, Plus, IndianRupee, CreditCard, Banknote, Smartphone, X, Calendar, FileText } from 'lucide-react';
import { billingApi, BILLING_EVENTS_URL, Payment, Invoice } from '../../../api/billingApi';
import { useToast } from '../../../context/context';

const methodIcons: Record<Payment['method'], React.ReactNode> = {
  'Cash': <Banknote className="w-3.5 h-3.5 text-emerald-600" />,
  'UPI': <Smartphone className="w-3.5 h-3.5 text-purple-600" />,
  'Card': <CreditCard className="w-3.5 h-3.5 text-blue-600" />,
  'Bank Transfer': <IndianRupee className="w-3.5 h-3.5 text-amber-600" />,
};

const Payments: React.FC = () => {
  const { toast } = useToast();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Modal States
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);

  // Form States
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>('');
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<Payment['method']>('UPI');
  const [paymentDate, setPaymentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [paymentNote, setPaymentNote] = useState<string>('');

  // Fetch initial data
  const fetchData = async () => {
    try {
      const paymentsData = await billingApi.getPayments();
      const invoicesData = await billingApi.getInvoices();
      setPayments(paymentsData);
      setInvoices(invoicesData);
    } catch (err) {
      toast('Failed to load payments data', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // SSE Subscription for real-time synchronization
  useEffect(() => {
    const eventSource = new EventSource(BILLING_EVENTS_URL);

    eventSource.addEventListener('payment_recorded', (e) => {
      const newPay = JSON.parse(e.data) as Payment;
      setPayments(prev => {
        if (prev.some(p => p.id === newPay.id)) return prev;
        return [newPay, ...prev];
      });
      toast(`Payment of ₹${parseFloat(newPay.amount as any).toLocaleString('en-IN')} recorded from ${newPay.customer_name}!`, 'success');
    });

    eventSource.addEventListener('invoice_updated', (e) => {
      const updatedInv = JSON.parse(e.data) as Invoice;
      if ((updatedInv as any).deleted) {
        const deletedId = (updatedInv as any).id;
        setInvoices(prev => prev.filter(inv => inv.id !== deletedId));
      } else {
        setInvoices(prev => prev.map(inv => inv.id === updatedInv.id ? updatedInv : inv));
      }
    });

    return () => {
      eventSource.close();
    };
  }, []);

  // Search filter
  const filtered = payments.filter(p =>
    p.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.receipt_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Stat metrics
  const totalCollected = payments.reduce((sum, p) => sum + parseFloat(p.amount as any), 0);

  const getMethodTotal = (method: Payment['method']) => {
    return payments
      .filter(p => p.method === method)
      .reduce((sum, p) => sum + parseFloat(p.amount as any), 0);
  };

  // Find selected invoice to show outstanding amounts
  const selectedInvoice = invoices.find(inv => inv.id === parseInt(selectedInvoiceId, 10));

  const calculateOutstanding = (invoice: Invoice) => {
    const totalPaidForInvoice = payments
      .filter(p => p.invoice_id === invoice.id)
      .reduce((sum, p) => sum + parseFloat(p.amount as any), 0);
    return Math.max(0, parseFloat(invoice.total_amount as any) - totalPaidForInvoice);
  };

  // Record Payment submit handler
  const handleRecordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedInvoiceId) {
      toast('Please select an invoice', 'warning');
      return;
    }

    const invoiceIdNum = parseInt(selectedInvoiceId, 10);
    const targetInvoice = invoices.find(inv => inv.id === invoiceIdNum);
    if (!targetInvoice) {
      toast('Selected invoice not found', 'error');
      return;
    }

    const amountNum = parseFloat(paymentAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast('Please enter a valid positive amount', 'warning');
      return;
    }

    const outstanding = calculateOutstanding(targetInvoice);
    if (amountNum > outstanding) {
      if (!window.confirm(`The entered payment amount (₹${amountNum.toLocaleString('en-IN')}) exceeds the outstanding balance (₹${outstanding.toLocaleString('en-IN')}). Proceed anyway?`)) {
        return;
      }
    }

    try {
      await billingApi.recordPayment({
        invoice_id: invoiceIdNum,
        customer_name: targetInvoice.customer_name,
        amount: amountNum,
        method: paymentMethod,
        payment_date: paymentDate,
        note: paymentNote
      });

      // Clear states & close
      setSelectedInvoiceId('');
      setPaymentAmount('');
      setPaymentMethod('UPI');
      setPaymentDate(new Date().toISOString().split('T')[0]);
      setPaymentNote('');
      setIsRecordModalOpen(false);
      
      // Update invoices to reflect new status
      const updatedInvoices = await billingApi.getInvoices();
      setInvoices(updatedInvoices);
    } catch (err) {
      toast('Error recording payment', 'error');
    }
  };

  return (
    <div className="flex flex-col h-full space-y-5 p-6 bg-slate-50/50">
      <div className="flex justify-between items-center pb-4 border-b border-slate-100">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Payments</h1>
          <p className="text-sm text-slate-500 mt-1">Record and track all customer payment transactions.</p>
        </div>
        <button
          onClick={() => setIsRecordModalOpen(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold flex items-center gap-1.5 transition shadow-sm"
        >
          <Plus className="w-4 h-4" /> Record Payment
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm col-span-1 sm:col-span-2 md:col-span-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Collected</span>
          <h3 className="text-2xl font-black text-slate-900 mt-1">₹{totalCollected.toLocaleString('en-IN')}</h3>
        </div>
        {(['Cash', 'UPI', 'Card', 'Bank Transfer'] as const).map(m => {
          const total = getMethodTotal(m);
          return (
            <div key={m} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3.5 transition hover:shadow">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center">
                {methodIcons[m]}
              </div>
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{m}</span>
                <h3 className="text-lg font-extrabold text-slate-800">₹{total.toLocaleString('en-IN')}</h3>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center bg-white border border-slate-200 rounded-xl px-4 py-2.5 w-full md:w-1/3 shadow-sm">
        <Search className="w-4 h-4 text-slate-400 mr-2" />
        <input
          type="text"
          placeholder="Search payments..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-transparent border-none outline-none text-sm text-slate-800 placeholder-slate-400 w-full"
        />
      </div>

      {/* Payments Table */}
      <div className="flex-1 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <IndianRupee className="w-12 h-12 mb-3 text-slate-300" />
            <p className="text-sm">No payment records found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 min-w-[800px]">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-500 font-semibold">
                  <th className="py-4 px-6">Receipt #</th>
                  <th className="py-4 px-6">Invoice</th>
                  <th className="py-4 px-6">Customer</th>
                  <th className="py-4 px-6 text-right">Amount</th>
                  <th className="py-4 px-6">Method</th>
                  <th className="py-4 px-6">Date</th>
                  <th className="py-4 px-6">Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(p => {
                  const linkedInv = invoices.find(inv => inv.id === p.invoice_id);
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/40 transition">
                      <td className="py-4 px-6 font-bold text-slate-800">{p.receipt_number}</td>
                      <td className="py-4 px-6 text-slate-500">{linkedInv?.invoice_number || '—'}</td>
                      <td className="py-4 px-6 font-medium text-slate-700">{p.customer_name}</td>
                      <td className="py-4 px-6 text-right font-bold text-emerald-600">
                        + ₹{parseFloat(p.amount as any).toLocaleString('en-IN')}
                      </td>
                      <td className="py-4 px-6">
                        <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                          {methodIcons[p.method]} {p.method}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-slate-500">{new Date(p.payment_date).toLocaleDateString('en-IN')}</td>
                      <td className="py-4 px-6 text-slate-500 max-w-[200px] truncate text-xs" title={p.note}>
                        {p.note || '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* RECORD PAYMENT MODAL */}
      {isRecordModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-900">Record Customer Payment</h2>
              <button onClick={() => setIsRecordModalOpen(false)} className="p-1 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-slate-600 transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Select Invoice</label>
                <select
                  value={selectedInvoiceId}
                  onChange={(e) => {
                    setSelectedInvoiceId(e.target.value);
                    const inv = invoices.find(i => i.id === parseInt(e.target.value, 10));
                    if (inv) {
                      setPaymentAmount(calculateOutstanding(inv).toString());
                    }
                  }}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  required
                >
                  <option value="">-- Select Invoice --</option>
                  {invoices
                    .filter(inv => inv.status !== 'Paid')
                    .map(inv => {
                      const outstanding = calculateOutstanding(inv);
                      return (
                        <option key={inv.id} value={inv.id}>
                          {inv.invoice_number} - {inv.customer_name} (Outstanding: ₹{outstanding.toLocaleString('en-IN')})
                        </option>
                      );
                    })}
                </select>
              </div>

              {selectedInvoice && (
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs text-slate-600 space-y-1">
                  <div className="flex justify-between">
                    <span>Customer:</span>
                    <span className="font-semibold text-slate-800">{selectedInvoice.customer_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Invoice Total:</span>
                    <span className="font-semibold text-slate-800">₹{parseFloat(selectedInvoice.total_amount as any).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Current Outstanding:</span>
                    <span className="font-bold text-amber-600">₹{calculateOutstanding(selectedInvoice).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as Payment['method'])}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    required
                  >
                    <option value="UPI">UPI</option>
                    <option value="Cash">Cash</option>
                    <option value="Card">Card</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Payment Date</label>
                  <input
                    type="date"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Amount (₹)</label>
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder="Enter paid amount"
                  min="0.01"
                  step="0.01"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Note / Reference</label>
                <textarea
                  value={paymentNote}
                  onChange={(e) => setPaymentNote(e.target.value)}
                  placeholder="Add payment notes (e.g. Transaction ID, UPI reference)"
                  rows={2}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsRecordModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-sm font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition shadow-sm"
                >
                  Record Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payments;
