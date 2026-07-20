import React, { useState, useEffect } from 'react';
import Pagination from '@/components/ui/Pagination';
import { Search, Mail, Phone, MapPin, Users, CalendarDays, MoreVertical } from 'lucide-react';
import { customerApi } from '../../../api/customerApi';
import { toast } from 'sonner';
import { TableSkeleton } from '@/components/ui/Skeleton';

interface Customer {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  created_at: string;
}

const AVATAR_PALETTE = [
  { bg: 'bg-indigo-50 border-indigo-100', text: 'text-indigo-600' },
  { bg: 'bg-emerald-50 border-emerald-100', text: 'text-emerald-600' },
  { bg: 'bg-amber-50 border-amber-100', text: 'text-amber-600' },
  { bg: 'bg-rose-50 border-rose-100', text: 'text-rose-600' },
  { bg: 'bg-cyan-50 border-cyan-100', text: 'text-cyan-600' },
  { bg: 'bg-fuchsia-50 border-fuchsia-100', text: 'text-fuchsia-600' },
];

const getAvatarStyle = (name: string) => {
  const index = name ? name.charCodeAt(0) % AVATAR_PALETTE.length : 0;
  return AVATAR_PALETTE[index];
};

const Customers: React.FC = () => {
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const itemsPerPage = 12;

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  const fetchCustomers = async () => {
    setIsLoading(true);
    try {
      const data = await customerApi.getCustomers(1, 1000);
      setCustomers(Array.isArray(data) ? data : data.customers || []);
    } catch (error) {
      toast.error('Failed to load customers');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCustomers = customers.filter(customer => {
    const term = searchTerm.toLowerCase();
    return (
      customer.name?.toLowerCase().includes(term) ||
      customer.email?.toLowerCase().includes(term) ||
      customer.phone?.toLowerCase().includes(term)
    );
  });

  const calculatedTotalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const paginatedCustomers = filteredCustomers.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  return (
    <div className="flex flex-col h-full space-y-8 p-6 md:p-8 bg-[#fafafa] min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-2">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Customers</h1>
          <p className="text-sm text-slate-500 mt-2 max-w-xl leading-relaxed">
            Manage and filter all entered customer records. Keep track of contact information and registration dates seamlessly.
          </p>
        </div>
        
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          {/* Stats Badge */}
          <div className="bg-white px-5 py-3 rounded-2xl border border-slate-200/60 shadow-sm flex items-center gap-4 w-full md:w-auto">
            <div className="p-2.5 bg-blue-50/80 rounded-xl">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">Total</span>
              <span className="text-xl font-black text-slate-900 leading-none">{customers.length}</span>
            </div>
          </div>
          
          {/* Search Box */}
          <div className="relative flex items-center bg-white border border-slate-200/60 rounded-2xl px-4 py-3.5 w-full md:w-80 shadow-sm focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all">
            <Search className="w-4 h-4 text-slate-400 mr-3 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent border-none outline-none text-sm font-medium text-slate-800 placeholder-slate-400 w-full"
            />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <TableSkeleton />
      ) : filteredCustomers.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm p-16 text-center flex flex-col items-center justify-center min-h-[400px]">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
            <Users className="w-10 h-10 text-slate-300" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">No customers found</h3>
          <p className="text-slate-500 max-w-sm mx-auto">
            {searchTerm ? `We couldn't find any customers matching "${searchTerm}".` : "You haven't added any customers yet. New customers will appear here."}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden flex flex-col flex-1">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-200/60">
                  <th className="px-8 py-5 text-xs font-semibold text-slate-500 uppercase tracking-widest">Customer Details</th>
                  <th className="px-8 py-5 text-xs font-semibold text-slate-500 uppercase tracking-widest">Contact Info</th>
                  <th className="px-8 py-5 text-xs font-semibold text-slate-500 uppercase tracking-widest text-right">Registered</th>
                  <th className="px-4 py-5"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/80">
                {paginatedCustomers.map(customer => {
                  const avatar = getAvatarStyle(customer.name);
                  return (
                    <tr key={customer.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-8 py-5 align-middle">
                        <div className="flex items-center gap-4">
                          <div className={`w-11 h-11 rounded-2xl border flex items-center justify-center font-bold text-[15px] flex-shrink-0 ${avatar.bg} ${avatar.text}`}>
                            {customer.name ? customer.name.charAt(0).toUpperCase() : '?'}
                          </div>
                          <div>
                            <span className="font-semibold text-slate-900 block mb-0.5 capitalize">{customer.name}</span>
                            <span className="text-xs font-medium text-slate-400">ID: {String(customer.id).slice(0, 8)}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5 align-middle">
                        <div className="space-y-2.5">
                          <div className="flex items-center text-sm font-medium text-slate-600">
                            <Phone className="w-4 h-4 text-slate-400 mr-2.5 flex-shrink-0" />
                            {customer.phone || <span className="text-slate-300 italic">No phone</span>}
                          </div>
                          <div className="flex items-center text-sm font-medium text-slate-600">
                            <Mail className="w-4 h-4 text-slate-400 mr-2.5 flex-shrink-0" />
                            {customer.email ? (
                              <a href={`mailto:${customer.email}`} className="hover:text-blue-600 transition-colors">{customer.email}</a>
                            ) : (
                              <span className="text-slate-300 italic">No email</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5 align-middle text-right">
                        <div className="inline-flex items-center gap-2 bg-slate-50 border border-slate-200/60 px-3 py-1.5 rounded-lg">
                          <CalendarDays className="w-3.5 h-3.5 text-slate-400" />
                          <span className="text-xs font-semibold text-slate-600">
                            {new Date(customer.created_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-5 align-middle text-right">
                        <button className="p-2 text-slate-300 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all opacity-0 group-hover:opacity-100 focus:opacity-100">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            </div>
            {calculatedTotalPages > 0 && (
              <div className="mt-auto border-t border-slate-200/60 p-4 mb-4">
                <Pagination currentPage={page} totalPages={calculatedTotalPages} onPageChange={setPage} />
              </div>
            )}
        </div>
      )}
    </div>
  );
};

export default Customers;
