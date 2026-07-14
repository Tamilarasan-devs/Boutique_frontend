import React, { useState, useEffect } from 'react';
import { Search, Mail, Phone, MapPin, Users, Loader2 } from 'lucide-react';
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

const Customers: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setIsLoading(true);
    try {
      const data = await customerApi.getCustomers();
      // Ensure data is an array
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

  return (
    <div className="flex flex-col h-full space-y-6 p-6 bg-slate-50/50">
      <div className="flex justify-between items-center pb-4 border-b border-slate-100">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Customers</h1>
          <p className="text-sm text-slate-500 mt-1">Manage and filter all entered customer records.</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        {/* Stats */}
        <div className="flex gap-4 w-full md:w-auto">
          <div className="bg-white px-4 py-3 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3 w-full md:w-auto">
            <div className="p-2 bg-blue-50 rounded-xl">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase block">Total Customers</span>
              <span className="text-lg font-black text-slate-900">{customers.length}</span>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="flex items-center bg-white border border-slate-200 rounded-xl px-4 py-2.5 w-full md:w-1/3 shadow-sm focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all">
          <Search className="w-4 h-4 text-slate-400 mr-2" />
          <input
            type="text"
            placeholder="Search by name, email or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-none outline-none text-sm text-slate-800 placeholder-slate-400 w-full"
          />
        </div>
      </div>

      {isLoading ? (
          <TableSkeleton />
        ) : filteredCustomers.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-900">No customers found</h3>
          <p className="text-sm text-slate-500 mt-1">
            {searchTerm ? "No customers matched your search query." : "You have not added any customers yet."}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Customer Name</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Contact Info</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Address</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date Added</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCustomers.map(customer => (
                  <tr key={customer.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 align-top">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm flex-shrink-0">
                          {customer.name ? customer.name.charAt(0).toUpperCase() : '?'}
                        </div>
                        <span className="font-semibold text-slate-800">{customer.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 align-top space-y-1.5">
                      <div className="flex items-center text-sm text-slate-600">
                        <Phone className="w-3.5 h-3.5 text-slate-400 mr-2 flex-shrink-0" />
                        {customer.phone || <span className="text-slate-300 italic">No phone</span>}
                      </div>
                      <div className="flex items-center text-sm text-slate-600">
                        <Mail className="w-3.5 h-3.5 text-slate-400 mr-2 flex-shrink-0" />
                        {customer.email ? (
                          <a href={`mailto:${customer.email}`} className="hover:text-blue-600 transition-colors">{customer.email}</a>
                        ) : (
                          <span className="text-slate-300 italic">No email</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 align-top max-w-[250px]">
                      <div className="flex items-start text-sm text-slate-600">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="truncate" title={customer.address || ''}>
                          {customer.address || <span className="text-slate-300 italic">No address provided</span>}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 align-top">
                      <span className="text-sm font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
                        {new Date(customer.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;
