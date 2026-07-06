import React, { useState, useEffect } from 'react';
import { Search, Plus, FileText, Eye, X, Trash2, Printer } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { billingApi, BILLING_EVENTS_URL, Invoice as InvoiceType, InvoiceItemDetail } from '../../../api/billingApi';
import { customerApi } from '../../../api/customerApi';
import { useToast } from '../../../context/context';

const statusStyles: Record<InvoiceType['status'], string> = {
  'Paid': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Pending': 'bg-amber-50 text-amber-700 border-amber-200',
  'Overdue': 'bg-red-50 text-red-700 border-red-200',
  'Draft': 'bg-slate-50 text-slate-500 border-slate-200',
};

const Invoice: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [invoices, setInvoices] = useState<InvoiceType[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Modal States
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceType | null>(null);

  // New Invoice Form State
  const [customers, setCustomers] = useState<{ id: number; name: string }[]>([]);
  const [quotations, setQuotations] = useState<any[]>([]);
  const [creationMode, setCreationMode] = useState<'Manual' | 'FromQuotation'>('Manual');
  const [selectedQuotationId, setSelectedQuotationId] = useState<string>('');

  const [customerName, setCustomerName] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [items, setItems] = useState<Omit<InvoiceItemDetail, 'amount'>[]>([
    { description: '', quantity: 1, price: 0 }
  ]);

  // Fetch invoices and customers
  const fetchInvoices = async () => {
    try {
      const data = await billingApi.getInvoices();
      setInvoices(data);
    } catch (err) {
      toast('Failed to load invoices', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const data = await customerApi.getCustomers();
      setCustomers(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchQuotations = async () => {
    try {
      const { quotationApi } = await import('../../../api/quotationApi');
      const data = await quotationApi.getQuotations();
      // Only keep 'Accepted' quotations for generating invoices
      const acceptedQuotations = data.filter((q: any) => q.status === 'Accepted');
      setQuotations(acceptedQuotations);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchInvoices();
    fetchCustomers();
    fetchQuotations();

    const state = location.state as any;
    if (state?.openModal) {
      setIsNewModalOpen(true);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, []);

  // SSE Subscription for real-time synchronization
  useEffect(() => {
    const eventSource = new EventSource(BILLING_EVENTS_URL);

    eventSource.addEventListener('invoice_created', (e) => {
      const newInv = JSON.parse(e.data) as InvoiceType;
      setInvoices(prev => {
        if (prev.some(inv => inv.id === newInv.id)) return prev;
        return [newInv, ...prev];
      });
      toast(`Invoice ${newInv.invoice_number} created for ${newInv.customer_name}!`, 'success');
    });

    eventSource.addEventListener('invoice_updated', (e) => {
      const updatedInv = JSON.parse(e.data) as InvoiceType;
      if ((updatedInv as any).deleted) {
        const deletedId = (updatedInv as any).id;
        setInvoices(prev => prev.filter(inv => inv.id !== deletedId));
        setSelectedInvoice(current => current?.id === deletedId ? null : current);
        setIsDetailModalOpen(current => current && selectedInvoice?.id === deletedId ? false : current);
        toast('Invoice deleted successfully', 'warning');
      } else {
        setInvoices(prev => prev.map(inv => inv.id === updatedInv.id ? updatedInv : inv));
        setSelectedInvoice(current => current?.id === updatedInv.id ? updatedInv : current);
        toast(`Invoice ${updatedInv.invoice_number} updated to ${updatedInv.status}`, 'info');
      }
    });

    return () => {
      eventSource.close();
    };
  }, [selectedInvoice]);

  const parseItems = (itemsInput: string | InvoiceItemDetail[]): InvoiceItemDetail[] => {
    if (Array.isArray(itemsInput)) return itemsInput;
    try {
      return JSON.parse(itemsInput);
    } catch (e) {
      return [];
    }
  };

  // Calculations
  const totalRevenue = invoices
    .filter(i => i.status === 'Paid')
    .reduce((s, i) => s + parseFloat(i.total_amount as any), 0);

  const totalPending = invoices
    .filter(i => i.status === 'Pending' || i.status === 'Overdue')
    .reduce((s, i) => s + parseFloat(i.total_amount as any), 0);

  const filteredInvoices = invoices.filter(inv =>
    inv.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.invoice_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Form handlers
  const handleAddItemRow = () => {
    setItems([...items, { description: '', quantity: 1, price: 0 }]);
  };

  const handleRemoveItemRow = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleItemChange = (index: number, field: keyof Omit<InvoiceItemDetail, 'amount'>, value: string | number) => {
    const newItems = [...items];
    if (field === 'description') {
      newItems[index].description = value as string;
    } else if (field === 'quantity') {
      newItems[index].quantity = Math.max(1, parseInt(value as string) || 1);
    } else if (field === 'price') {
      newItems[index].price = Math.max(0, parseFloat(value as string) || 0);
    }
    setItems(newItems);
  };

  const calculateFormTotal = () => {
    return items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  };

  const handleQuotationSelect = (qId: string) => {
    setSelectedQuotationId(qId);
    const quotation = quotations.find(q => q.id.toString() === qId);
    if (quotation) {
      setCustomerName(quotation.customer_name);
      const parsedItems = parseItems(quotation.items);
      const newItems = parsedItems.map((i: any) => ({
        description: i.description || i.item || '',
        quantity: i.quantity || 1,
        price: i.price || i.rate || 0
      }));
      setItems(newItems.length > 0 ? newItems : [{ description: '', quantity: 1, price: 0 }]);
    }
  };

  const handleCreateInvoiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName) {
      toast('Please select or enter customer name', 'warning');
      return;
    }
    if (!dueDate) {
      toast('Please select a due date', 'warning');
      return;
    }

    const finalItems: InvoiceItemDetail[] = items.map(item => ({
      ...item,
      amount: item.quantity * item.price
    }));

    const totalAmount = calculateFormTotal();

    try {
      const response = await billingApi.createInvoice({
        order_id: null,
        quotation_id: creationMode === 'FromQuotation' && selectedQuotationId ? parseInt(selectedQuotationId) : null,
        customer_name: customerName,
        invoice_date: invoiceDate,
        due_date: dueDate,
        total_amount: totalAmount,
        status: 'Pending',
        items: finalItems
      });

      if (response && response.invoice) {
        setInvoices(current => {
          if (!current.find(i => i.id === response.invoice.id)) {
            return [response.invoice, ...current];
          }
          return current;
        });
      }

      // Clear state and close
      setCustomerName('');
      setInvoiceDate(new Date().toISOString().split('T')[0]);
      setDueDate('');
      setItems([{ description: '', quantity: 1, price: 0 }]);
      setCreationMode('Manual');
      setSelectedQuotationId('');
      setIsNewModalOpen(false);
      fetchQuotations(); // Refresh quotations in case one was used
    } catch (err) {
      toast('Error creating invoice', 'error');
    }
  };

  const handleDeleteInvoice = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      try {
        await billingApi.deleteInvoice(id);
        setIsDetailModalOpen(false);
      } catch (err) {
        toast('Error deleting invoice', 'error');
      }
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col h-full space-y-5 p-6 bg-slate-50/50">
      <div className="flex justify-between items-center pb-4 border-b border-slate-100 print:hidden">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Invoices</h1>
          <p className="text-sm text-slate-500 mt-1">Create and manage customer invoices.</p>
        </div>
        <button
          onClick={() => setIsNewModalOpen(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold flex items-center gap-1.5 transition shadow-sm"
        >
          <Plus className="w-4 h-4" /> New Invoice
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 print:hidden">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm transition hover:shadow">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Invoices</span>
          <h3 className="text-2xl font-black text-slate-900 mt-1">{invoices.length}</h3>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm transition hover:shadow">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Collected</span>
          <h3 className="text-2xl font-black text-emerald-600 mt-1">₹{totalRevenue.toLocaleString('en-IN')}</h3>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm transition hover:shadow">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Outstanding</span>
          <h3 className="text-2xl font-black text-amber-600 mt-1">₹{totalPending.toLocaleString('en-IN')}</h3>
        </div>
      </div>

      <div className="flex items-center bg-white border border-slate-200 rounded-xl px-4 py-2.5 w-full md:w-1/3 shadow-sm print:hidden">
        <Search className="w-4 h-4 text-slate-400 mr-2" />
        <input
          type="text"
          placeholder="Search invoices..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-transparent border-none outline-none text-sm text-slate-800 placeholder-slate-400 w-full"
        />
      </div>

      {/* Main Invoices Table */}
      <div className="flex-1 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden print:hidden">
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredInvoices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <FileText className="w-12 h-12 mb-3 text-slate-300" />
            <p className="text-sm">No invoices found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 min-w-[800px]">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-500 font-semibold">
                  <th className="py-4 px-6">Invoice #</th>
                  <th className="py-4 px-6">Customer</th>
                  <th className="py-4 px-6">Date</th>
                  <th className="py-4 px-6">Due Date</th>
                  <th className="py-4 px-6">Items</th>
                  <th className="py-4 px-6 text-right">Amount</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredInvoices.map(inv => {
                  const parsed = parseItems(inv.items);
                  return (
                    <tr key={inv.id} className="hover:bg-slate-50/40 transition">
                      <td className="py-4 px-6 font-semibold text-slate-800 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-slate-400" />
                        {inv.invoice_number}
                      </td>
                      <td className="py-4 px-6 font-medium text-slate-700">{inv.customer_name}</td>
                      <td className="py-4 px-6 text-slate-500">{new Date(inv.invoice_date).toLocaleDateString('en-IN')}</td>
                      <td className="py-4 px-6 text-slate-500">{new Date(inv.due_date).toLocaleDateString('en-IN')}</td>
                      <td className="py-4 px-6 text-slate-500">{parsed.length} items</td>
                      <td className="py-4 px-6 text-right font-bold text-slate-800">
                        ₹{parseFloat(inv.total_amount as any).toLocaleString('en-IN')}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${statusStyles[inv.status]}`}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <button
                          onClick={() => {
                            setSelectedInvoice(inv);
                            setIsDetailModalOpen(true);
                          }}
                          className="text-slate-400 hover:text-blue-600 transition"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* NEW INVOICE MODAL */}
      {isNewModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden border border-slate-100 max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-900">Create New Invoice</h2>
              <button onClick={() => setIsNewModalOpen(false)} className="p-1 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-slate-600 transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateInvoiceSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
              
              <div className="flex gap-4 p-1 bg-slate-100 rounded-lg w-max mb-4">
                <button
                  type="button"
                  onClick={() => setCreationMode('Manual')}
                  className={`px-4 py-1.5 rounded-md text-sm font-semibold transition ${creationMode === 'Manual' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Manual Entry
                </button>
                <button
                  type="button"
                  onClick={() => setCreationMode('FromQuotation')}
                  className={`px-4 py-1.5 rounded-md text-sm font-semibold transition ${creationMode === 'FromQuotation' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  From Quotation
                </button>
              </div>

              {creationMode === 'FromQuotation' && (
                <div className="mb-4">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Select Converted Quotation</label>
                  <select
                    value={selectedQuotationId}
                    onChange={(e) => handleQuotationSelect(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="" disabled>-- Select a Quotation --</option>
                    {quotations.map(q => (
                      <option key={q.id} value={q.id}>
                        QOT-{q.id.toString().padStart(3, '0')} - {q.customer_name} - ₹{q.total_amount}
                      </option>
                    ))}
                  </select>
                  {quotations.length === 0 && (
                    <p className="text-xs text-amber-600 mt-1">No accepted quotations found. Create or accept a quotation first.</p>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Customer Name</label>
                  <input
                    type="text"
                    list="customers-list"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Enter or select customer name"
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <datalist id="customers-list">
                    {customers.map(c => (
                      <option key={c.id} value={c.name} />
                    ))}
                  </datalist>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Due Date</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Invoice Date</label>
                  <input
                    type="date"
                    value={invoiceDate}
                    onChange={(e) => setInvoiceDate(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-bold text-slate-700">Line Items</h3>
                  <button
                    type="button"
                    onClick={handleAddItemRow}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Item
                  </button>
                </div>

                <div className="space-y-2">
                  {items.map((item, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <div className="flex-1">
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                          placeholder="Item description (e.g. Lehenga stitching)"
                          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <div className="w-20">
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                          min="1"
                          placeholder="Qty"
                          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <div className="w-32">
                        <input
                          type="number"
                          value={item.price}
                          onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                          min="0"
                          placeholder="Price"
                          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <div className="w-28 text-right font-medium text-slate-700 pr-2 text-sm">
                        ₹{(item.quantity * item.price).toLocaleString('en-IN')}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveItemRow(index)}
                        disabled={items.length === 1}
                        className="p-2 text-slate-400 hover:text-red-500 disabled:opacity-30 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                <span className="text-sm font-bold text-slate-500">Total Invoice Amount</span>
                <span className="text-xl font-extrabold text-slate-900">₹{calculateFormTotal().toLocaleString('en-IN')}</span>
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-sm font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition shadow-sm"
                >
                  Save Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DETAIL & PRINT MODAL */}
      {isDetailModalOpen && selectedInvoice && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:p-0 print:bg-white print:static print:inset-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden border border-slate-100 max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200 print:shadow-none print:border-none print:max-h-none print:w-full print:h-auto">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center print:hidden">
              <h2 className="text-xl font-bold text-slate-900">Invoice Details</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="p-2 hover:bg-slate-200 rounded-lg text-slate-600 transition flex items-center gap-1.5 text-sm font-semibold"
                >
                  <Printer className="w-4 h-4" /> Print
                </button>
                <button
                  onClick={() => handleDeleteInvoice(selectedInvoice.id)}
                  className="p-2 hover:bg-red-50 rounded-lg text-red-500 hover:text-red-700 transition"
                  title="Delete Invoice"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button onClick={() => setIsDetailModalOpen(false)} className="p-1 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-slate-600 transition">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Area */}
            <div className="flex-1 overflow-y-auto p-8 space-y-6 print:p-0 print:overflow-visible">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-2xl font-black text-blue-600 tracking-tight">BOUTIQUE CREATIVE</h3>
                  <p className="text-xs text-slate-400 mt-0.5">High Fashion Tailoring & Couture</p>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border inline-block mb-2 ${statusStyles[selectedInvoice.status]}`}>
                    {selectedInvoice.status}
                  </span>
                  <p className="text-lg font-bold text-slate-900">{selectedInvoice.invoice_number}</p>
                </div>
              </div>

              <hr className="border-slate-100" />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Billed To</h4>
                  <p className="font-semibold text-slate-800 mt-1">{selectedInvoice.customer_name}</p>
                </div>
                <div className="text-right">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Invoice Details</h4>
                  <p className="text-sm text-slate-600 mt-1">
                    <span className="font-medium text-slate-500">Date:</span> {new Date(selectedInvoice.invoice_date).toLocaleDateString('en-IN')}
                  </p>
                  <p className="text-sm text-slate-600 mt-0.5">
                    <span className="font-medium text-slate-500">Due Date:</span> {new Date(selectedInvoice.due_date).toLocaleDateString('en-IN')}
                  </p>
                </div>
              </div>

              <div>
                <table className="w-full text-left text-sm text-slate-600">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/50 text-slate-500 font-bold">
                      <th className="py-2.5 px-4">Item Description</th>
                      <th className="py-2.5 px-4 text-center">Qty</th>
                      <th className="py-2.5 px-4 text-right">Price</th>
                      <th className="py-2.5 px-4 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {parseItems(selectedInvoice.items).map((item, index) => (
                      <tr key={index}>
                        <td className="py-3 px-4 text-slate-800 font-medium">{item.description}</td>
                        <td className="py-3 px-4 text-center text-slate-500">{item.quantity}</td>
                        <td className="py-3 px-4 text-right text-slate-500">₹{parseFloat(item.price as any).toLocaleString('en-IN')}</td>
                        <td className="py-3 px-4 text-right text-slate-900 font-semibold">₹{parseFloat(item.amount as any).toLocaleString('en-IN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-100">
                <div className="w-64 space-y-2 text-sm">
                  <div className="flex justify-between font-semibold text-slate-700">
                    <span>Subtotal:</span>
                    <span>₹{parseFloat(selectedInvoice.total_amount as any).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-slate-700">
                    <span>Tax (0%):</span>
                    <span>₹0.00</span>
                  </div>
                  <div className="flex justify-between font-extrabold text-slate-900 text-base pt-2 border-t border-slate-100">
                    <span>Total Amount:</span>
                    <span>₹{parseFloat(selectedInvoice.total_amount as any).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 text-center text-slate-400 text-xs">
                <p>Thank you for your business!</p>
                <p className="mt-0.5">For queries, please contact Boutique Creative Support.</p>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2 print:hidden">
              <button
                type="button"
                onClick={() => setIsDetailModalOpen(false)}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-sm font-semibold transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Invoice;
