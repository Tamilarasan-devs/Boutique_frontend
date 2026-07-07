import React, { useState, useEffect } from 'react';
import { Plus, Search, Mail, Phone, Calendar, Scissors, Edit2, Trash2, X, Loader2 } from 'lucide-react';
import { customerApi } from '../../../api/customerApi';

interface Customer {
  id: string;
  rawId: string; // numeric DB id
  name: string;
  email: string;
  phone: string;
  ordersCount: number;
  lastOrderDate: string;
  status: 'Active' | 'Inactive';
}

const Customers: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modal State: 'add' | 'edit' | null
  const [modalMode, setModalMode] = useState<'add' | 'edit' | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setIsLoading(true);
    try {
      const data = await customerApi.getCustomers();
      const formatted = data.map((item: any) => ({
        id: `CUST-${item.id}`,
        rawId: String(item.id),
        name: item.name,
        email: item.email || '',
        phone: item.phone || '',
        ordersCount: item.orders_count || 0,
        lastOrderDate: item.last_order_date ? item.last_order_date.substring(0, 10) : 'N/A',
        status: 'Active' as const
      }));
      setCustomers(formatted);
    } catch (err) {
      console.error('Failed to load customers:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCustomers = customers.filter(cust => {
    const matchesSearch =
      cust.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cust.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cust.phone.includes(searchTerm);
    const matchesStatus = statusFilter === 'All' || cust.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const openAddModal = () => {
    setModalMode('add');
    setSelectedCustomer(null);
    setName('');
    setEmail('');
    setPhone('');
  };

  const openEditModal = (cust: Customer) => {
    setModalMode('edit');
    setSelectedCustomer(cust);
    setName(cust.name);
    setEmail(cust.email);
    setPhone(cust.phone);
  };

  const closeModal = () => {
    setModalMode(null);
    setSelectedCustomer(null);
    setName('');
    setEmail('');
    setPhone('');
  };

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;
    setIsSaving(true);
    try {
      const response = await customerApi.addCustomer({ name, email, phone, address: '' });
      const newCust: Customer = {
        id: `CUST-${response.customer.id}`,
        rawId: String(response.customer.id),
        name: response.customer.name,
        email: response.customer.email,
        phone: response.customer.phone,
        ordersCount: 0,
        lastOrderDate: 'N/A',
        status: 'Active'
      };
      setCustomers([newCust, ...customers]);
      closeModal();
    } catch (error: any) {
      console.error('Error adding customer:', error);
      alert(error.response?.data?.error || error.message || 'Failed to add customer. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer || !name || !phone) return;
    setIsSaving(true);
    try {
      const response = await customerApi.updateCustomer(selectedCustomer.rawId, {
        name,
        email,
        phone,
        address: ''
      });
      const updated = response.customer;
      setCustomers(customers.map(c =>
        c.rawId === selectedCustomer.rawId
          ? { ...c, name: updated.name, email: updated.email, phone: updated.phone }
          : c
      ));
      closeModal();
    } catch (error: any) {
      console.error('Error updating customer:', error);
      alert(error.response?.data?.error || error.message || 'Failed to update customer. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCustomer = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await customerApi.deleteCustomer(deleteTarget.rawId);
      setCustomers(customers.filter(c => c.rawId !== deleteTarget.rawId));
      setDeleteTarget(null);
    } catch (error) {
      console.error('Error deleting customer:', error);
      alert('Failed to delete customer. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F3F8] text-[#16132D]">
      <div className="flex flex-col h-full space-y-5 p-6 md:p-8 max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 pb-5 border-b border-[#16132D]/[0.08]">
          <div>
            <p className="text-xs font-semibold tracking-[0.18em] uppercase text-[#7209B7] mb-1.5">CRM</p>
            <h1 className="text-3xl md:text-[2rem] font-serif font-semibold tracking-tight text-[#16132D]">Customers</h1>
            <p className="text-sm text-[#16132D]/55 mt-1">Manage boutique customer profiles and order history.</p>
          </div>
          <div className="flex gap-3 self-start sm:self-auto">
            <button className="px-4 py-2.5 bg-white border border-[#16132D]/15 hover:bg-[#16132D]/[0.03] rounded-xl text-sm font-semibold text-[#16132D]/80 transition shadow-sm">
              Export List
            </button>
            <button
              onClick={openAddModal}
              className="px-4 py-2.5 bg-[#16132D] hover:bg-[#2a3545] text-[#F4F3F8] rounded-xl text-sm font-semibold flex items-center gap-1.5 transition shadow-md shadow-[#16132D]/10"
            >
              <Plus className="w-4 h-4" /> Add Customer
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-4 bg-white rounded-2xl border border-[#16132D]/[0.06] shadow-sm">
          <div className="flex items-center bg-[#F4F3F8] border border-[#16132D]/[0.08] rounded-xl px-4 py-2.5 w-full sm:w-80 focus-within:ring-2 focus-within:ring-[#7209B7]/20 focus-within:border-[#7209B7]/35 transition">
            <Search className="w-4 h-4 text-[#16132D]/35 mr-2 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search by name, email or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent border-none outline-none text-sm text-[#16132D] placeholder-[#16132D]/35 w-full"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 border border-[#16132D]/[0.1] rounded-xl bg-white text-sm font-semibold text-[#16132D]/80 focus:outline-none focus:ring-2 focus:ring-[#7209B7]/20 cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

        {/* Customers Table */}
        <div className="bg-white rounded-2xl border border-[#16132D]/[0.06] shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 text-[#16132D]/40 animate-spin" />
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-[#16132D]/40 gap-2">
              <Scissors className="w-8 h-8 opacity-40" />
              <p className="text-sm font-medium">No customers found</p>
              <p className="text-xs">Try adjusting your search or add a new customer</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[#16132D]/[0.08] bg-[#F4F3F8]/70 text-[#16132D]/40 font-semibold text-xs uppercase tracking-wide">
                    <th className="py-4 px-6">Customer</th>
                    <th className="py-4 px-6">Contact Info</th>
                    <th className="py-4 px-6 text-center">Orders</th>
                    <th className="py-4 px-6">Last Order</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#16132D]/[0.05]">
                  {filteredCustomers.map((cust) => (
                    <tr key={cust.id} className="hover:bg-[#F4F3F8]/60 transition">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-[#7209B7]/10 border border-[#7209B7]/15 text-[#7209B7] flex items-center justify-center font-bold text-sm flex-shrink-0">
                            {cust.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </div>
                          <div>
                            <div className="font-semibold text-[#16132D]">{cust.name}</div>
                            <div className="text-xs text-[#16132D]/35 font-medium">{cust.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 space-y-1">
                        <div className="flex items-center gap-1.5 text-xs text-[#16132D]/55">
                          <Mail className="w-3.5 h-3.5 text-[#16132D]/30" />
                          {cust.email || '—'}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-[#16132D]/55">
                          <Phone className="w-3.5 h-3.5 text-[#16132D]/30" />
                          {cust.phone || '—'}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className="font-bold font-serif text-[#16132D] text-base">{cust.ordersCount}</span>
                      </td>
                      <td className="py-4 px-6 text-[#16132D]/60 font-medium">
                        <div className="flex items-center gap-1.5 text-sm">
                          <Calendar className="w-3.5 h-3.5 text-[#16132D]/30" />
                          {cust.lastOrderDate}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ring-1 ${
                          cust.status === 'Active'
                            ? 'bg-[#10B981]/10 text-[#234638] ring-[#10B981]/20'
                            : 'bg-[#16132D]/[0.05] text-[#16132D]/50 ring-[#16132D]/10'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${cust.status === 'Active' ? 'bg-[#10B981]' : 'bg-[#16132D]/40'}`} />
                          {cust.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditModal(cust)}
                            className="p-2 hover:bg-[#8338EC]/10 rounded-lg text-[#16132D]/40 hover:text-[#8338EC] transition cursor-pointer"
                            title="Edit Customer"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(cust)}
                            className="p-2 hover:bg-[#F43F5E]/10 rounded-lg text-[#16132D]/40 hover:text-[#F43F5E] transition cursor-pointer"
                            title="Delete Customer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Customer Modal */}
      {modalMode && (
        <div className="fixed inset-0 bg-[#16132D]/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-[#16132D]/[0.06] shadow-2xl shadow-[#16132D]/20 w-full max-w-md overflow-hidden">
            <div className="px-6 py-5 border-b border-[#16132D]/[0.08] flex justify-between items-center">
              <div>
                <p className="text-[10px] font-semibold tracking-[0.18em] uppercase text-[#7209B7] mb-1">
                  {modalMode === 'add' ? 'New Entry' : 'Update Profile'}
                </p>
                <h3 className="font-serif font-semibold text-[#16132D] text-lg">
                  {modalMode === 'add' ? 'Add New Customer' : 'Edit Customer'}
                </h3>
              </div>
              <button
                onClick={closeModal}
                className="p-2 rounded-lg text-[#16132D]/35 hover:text-[#16132D] hover:bg-[#16132D]/[0.05] transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={modalMode === 'add' ? handleAddCustomer : handleUpdateCustomer} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#16132D]/45 uppercase tracking-wider mb-1.5">Full Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="e.g. Shalini Roy"
                  className="w-full px-4 py-2.5 border border-[#16132D]/[0.1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7209B7]/25 focus:border-[#7209B7]/40 text-sm transition bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#16132D]/45 uppercase tracking-wider mb-1.5">Phone Number *</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  placeholder="e.g. +91 98765 43210"
                  className="w-full px-4 py-2.5 border border-[#16132D]/[0.1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7209B7]/25 focus:border-[#7209B7]/40 text-sm transition bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#16132D]/45 uppercase tracking-wider mb-1.5">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. shalini@example.com"
                  className="w-full px-4 py-2.5 border border-[#16132D]/[0.1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7209B7]/25 focus:border-[#7209B7]/40 text-sm transition bg-white"
                />
              </div>
              <button
                type="submit"
                disabled={isSaving}
                className="w-full py-2.5 bg-[#16132D] hover:bg-[#2a3545] disabled:opacity-60 text-[#F4F3F8] rounded-lg text-sm font-semibold transition mt-2 shadow-md shadow-[#16132D]/10 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                {isSaving ? 'Saving...' : modalMode === 'add' ? 'Add Customer' : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-[#16132D]/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-[#16132D]/[0.06] shadow-2xl shadow-[#16132D]/20 w-full max-w-sm overflow-hidden">
            <div className="p-6 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#F43F5E]/10 border border-[#F43F5E]/15 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-[#F43F5E]" />
              </div>
              <div>
                <h3 className="font-serif font-semibold text-[#16132D] text-lg">Delete Customer?</h3>
                <p className="text-sm text-[#16132D]/55 mt-1">
                  Are you sure you want to delete <span className="font-semibold text-[#16132D]">{deleteTarget.name}</span>? This action cannot be undone.
                </p>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="flex-1 py-2.5 bg-[#F4F3F8] hover:bg-[#16132D]/[0.04] border border-[#16132D]/[0.08] rounded-xl text-sm font-semibold text-[#16132D]/80 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteCustomer}
                  disabled={isDeleting}
                  className="flex-1 py-2.5 bg-[#F43F5E] hover:bg-[#7a2e34] disabled:opacity-60 text-white rounded-xl text-sm font-semibold transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isDeleting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;
