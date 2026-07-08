import React, { useState, useEffect } from 'react';
import { useToast, useConfirm } from '../../context';
import { measurementHistoryApi } from '../../api/measurementHistoryApi';
import { customerApi } from '../../api/customerApi';
import { FileText, Save, User, Plus, Trash2, Scissors, Edit, X } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { orderApi } from '../../api/orderApi';
import { productionApi } from '../../api/productionApi';

interface MeasurementField {
  name: string;
  value: string;
}

const Measurements: React.FC = () => {
  const { toast } = useToast();
  const { confirm } = useConfirm();
  const [history, setHistory] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [returnTo, setReturnTo] = useState<string | null>(null);
  const [cancelReturnTo, setCancelReturnTo] = useState<string | null>(null);
  const [actionOnSuccess, setActionOnSuccess] = useState<any>(null);
  const [lastAutoFilledCustomer, setLastAutoFilledCustomer] = useState<string>('');

  const location = useLocation();
  const navigate = useNavigate();

  // Form State
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [garmentType, setGarmentType] = useState<string>('');
  const [fields, setFields] = useState<MeasurementField[]>([{ name: '', value: '' }]);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchHistory();
    fetchCustomers();
  }, []);

  useEffect(() => {
    const state = location.state as any;
    if (state?.openNewModal && customers.length > 0) {
      const match = customers.find(c => c.name.toLowerCase() === state.customerName?.toLowerCase());
      if (match) {
        setSelectedCustomerId(String(match.id));
      }
      if (state.garment) {
        setGarmentType(state.garment);
      }
      if (state.returnTo) {
        setReturnTo(state.returnTo);
      }
      if (state.cancelReturnTo) {
        setCancelReturnTo(state.cancelReturnTo);
      }
      if (state.actionOnSuccess) {
        setActionOnSuccess(state.actionOnSuccess);
      }
      setIsModalOpen(true);
      // Clear location state
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [customers, location.state, location.pathname, navigate]);

  useEffect(() => {
    if (!editingId && selectedCustomerId && selectedCustomerId !== lastAutoFilledCustomer && history.length > 0) {
      const lastMeasurement = history.find(h => String(h.customer_id) === selectedCustomerId);
      if (lastMeasurement && lastMeasurement.measurements) {
        const fieldsArr = Object.entries(lastMeasurement.measurements).map(([name, value]) => ({
          name,
          value: String(value)
        }));
        if (fieldsArr.length > 0) {
          setFields(fieldsArr);
        } else {
          setFields([{ name: '', value: '' }]);
        }
      } else {
        setFields([{ name: '', value: '' }]);
      }
      setLastAutoFilledCustomer(selectedCustomerId);
    }
  }, [selectedCustomerId, history, editingId, lastAutoFilledCustomer]);

  const fetchHistory = async () => {
    try {
      const data = await measurementHistoryApi.getHistory();
      setHistory(data);
    } catch (err) {
      toast('Failed to load measurement records', 'error');
    }
  };

  const fetchCustomers = async () => {
    try {
      const data = await customerApi.getCustomers().catch(() => []);
      setCustomers(data);
    } catch (err) {
      toast('Error loading customers', 'error');
    }
  };

  const openNewModal = () => {
    setEditingId(null);
    setSelectedCustomerId('');
    setGarmentType('');
    setFields([{ name: '', value: '' }]);
    setNotes('');
    setLastAutoFilledCustomer('');
    setIsModalOpen(true);
  };

  const handleCancelModal = () => {
    setIsModalOpen(false);
    if (cancelReturnTo) {
      navigate(cancelReturnTo);
    } else if (returnTo) {
      navigate(returnTo);
    }
  };

  const openEditModal = (record: any) => {
    setEditingId(record.id);
    setSelectedCustomerId(String(record.customer_id));
    
    // Parse notes to extract garment type if we saved it there
    let extractedGarment = '';
    let extractedNotes = record.notes || '';
    if (extractedNotes.startsWith('Garment: ')) {
      const lines = extractedNotes.split('\n');
      extractedGarment = lines[0].replace('Garment: ', '').trim();
      extractedNotes = lines.slice(1).join('\n');
    }
    setGarmentType(extractedGarment);
    setNotes(extractedNotes);

    // Convert measurements object to array
    const fieldsArr = Object.entries(record.measurements || {}).map(([name, value]) => ({
      name,
      value: String(value)
    }));
    setFields(fieldsArr.length > 0 ? fieldsArr : [{ name: '', value: '' }]);
    
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number | string) => {
    const isConfirmed = await confirm('Are you sure you want to delete this measurement record?', {
      title: 'Delete Measurement',
      confirmText: 'Delete',
      destructive: true
    });
    if (!isConfirmed) return;
    try {
      await measurementHistoryApi.deleteHistory(id);
      setHistory(prev => prev.filter(h => h.id !== id));
      toast('Record deleted successfully', 'success');
    } catch (err) {
      toast('Failed to delete record', 'error');
    }
  };

  const handleAddField = () => {
    setFields([...fields, { name: '', value: '' }]);
  };

  const handleRemoveField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  const handleFieldChange = (index: number, key: 'name' | 'value', val: string) => {
    const updated = [...fields];
    updated[index][key] = val;
    setFields(updated);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId || !garmentType.trim()) {
      toast('Please select a customer and enter a garment type', 'error');
      return;
    }

    const validFields = fields.filter(f => f.name.trim() !== '');
    if (validFields.length === 0) {
      toast('Please add at least one measurement dimension', 'error');
      return;
    }

    const measurementsObj: Record<string, string> = {};
    validFields.forEach(f => {
      measurementsObj[f.name.trim()] = f.value.trim();
    });

    try {
      const payload = {
        customerId: parseInt(selectedCustomerId, 10),
        templateId: null,
        measurements: measurementsObj,
        notes: `Garment: ${garmentType.trim()}\n${notes}`
      };

      if (editingId) {
        await measurementHistoryApi.updateHistory(editingId, payload);
        toast('Measurement updated successfully', 'success');
      } else {
        await measurementHistoryApi.createHistory(payload);
        toast('Measurement saved successfully', 'success');
      }
      
      setIsModalOpen(false);
      fetchHistory(); // Refresh list
      
      // Execute pending workflow action
      if (actionOnSuccess) {
        if (actionOnSuccess.type === 'convertQuotation') {
          await orderApi.convertFromQuotation(actionOnSuccess.quotationId);
        } else if (actionOnSuccess.type === 'sendToProduction') {
          await productionApi.addProduction(actionOnSuccess.payload);
          await orderApi.updateOrderStatus(actionOnSuccess.payload.order_id, 'Cutting');
        }
      }

      if (returnTo) {
        navigate(returnTo);
      }
    } catch (err) {
      toast('Failed to save measurement', 'error');
    }
  };

  return (
    <div className="flex flex-col h-full space-y-4 p-4 sm:p-6 bg-slate-50 min-w-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-bold font-serif text-slate-900 flex items-center gap-2">
            <Scissors className="w-7 h-7 text-blue-600" />
            Measurement Records
          </h1>
          <nav className="text-sm text-slate-600 mt-2 font-medium">
            <span>Home</span> <span className="mx-2">/</span> <span className="text-blue-600 font-semibold">Measurements</span>
          </nav>
        </div>
        <button 
          onClick={openNewModal}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          New Measurement
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-bold text-slate-700 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-slate-700 uppercase tracking-wider">Garment / Details</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-slate-700 uppercase tracking-wider">Recorded At</th>
                <th className="px-6 py-4 text-right text-sm font-bold text-slate-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {history.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-600 text-base">
                    No measurement records found. Click "New Measurement" to add one.
                  </td>
                </tr>
              ) : (
                history.map((record) => {
                  let extractedGarment = 'Custom Garment';
                  if (record.notes?.startsWith('Garment: ')) {
                    extractedGarment = record.notes.split('\n')[0].replace('Garment: ', '').trim();
                  }
                  
                  return (
                    <tr key={record.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap text-base font-bold text-slate-900">
                        {record.customer_name || `Customer #${record.customer_id}`}
                      </td>
                      <td className="px-6 py-4 text-base text-slate-800">
                        <span className="font-semibold text-slate-900">{extractedGarment}</span>
                        <div className="text-sm text-slate-500 mt-1 font-medium">
                          {Object.keys(record.measurements || {}).length} dimensions recorded
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-base text-slate-700 font-medium">
                        {new Date(record.created_at || record.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-base font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => openEditModal(record)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                            title="Edit Record"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(record.id)} 
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                            title="Delete Record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-scale-in">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-xl font-bold font-serif text-slate-900 flex items-center gap-2">
                <Scissors className="w-5 h-5 text-blue-600" />
                {editingId ? 'Edit Measurement' : 'New Measurement'}
              </h3>
              <button 
                onClick={handleCancelModal}
                className="text-slate-500 hover:text-slate-800 hover:bg-slate-200 p-1.5 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-xl border border-slate-200">
                <div>
                  <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <User className="w-4 h-4 text-slate-600" /> Customer *
                  </label>
                  <select 
                    value={selectedCustomerId} 
                    onChange={e => setSelectedCustomerId(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-base font-medium text-slate-800 transition-all"
                    required
                  >
                    <option value="">Select a customer...</option>
                    {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Garment Type *
                  </label>
                  <input 
                    type="text"
                    value={garmentType} 
                    onChange={e => setGarmentType(e.target.value)}
                    placeholder="e.g. Bridal Lehenga, Men's Suit..."
                    className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-base font-medium text-slate-800 placeholder-slate-400 transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-end mb-4">
                  <label className="block text-base font-bold font-serif text-slate-900">
                    Measurement Dimensions
                  </label>
                  <button
                    type="button"
                    onClick={handleAddField}
                    className="text-sm font-bold text-blue-700 hover:text-blue-800 flex items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-md hover:bg-blue-100 transition-colors"
                  >
                    <Plus className="w-4 h-4" /> Add Dimension
                  </button>
                </div>

                <div className="space-y-4">
                  {fields.map((field, idx) => (
                    <div key={idx} className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-400 transition-all group">
                      <div className="w-1/2">
                        <input
                          type="text"
                          value={field.name}
                          onChange={e => handleFieldChange(idx, 'name', e.target.value)}
                          placeholder="Dimension Name (e.g. Chest)"
                          className="w-full px-3 py-2 bg-transparent border-none focus:outline-none focus:ring-0 text-base font-bold text-slate-800 placeholder-slate-400"
                          required
                        />
                      </div>
                      <div className="w-px h-8 bg-slate-300"></div>
                      <div className="w-1/2">
                        <input
                          type="text"
                          value={field.value}
                          onChange={e => handleFieldChange(idx, 'value', e.target.value)}
                          placeholder="Value (e.g. 42)"
                          className="w-full px-3 py-2 bg-transparent border-none focus:outline-none focus:ring-0 text-base font-semibold text-slate-800 placeholder-slate-400"
                        />
                      </div>
                      {fields.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveField(idx)}
                          className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors mr-1"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Special Instructions / Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-base font-medium text-slate-800 placeholder-slate-400 transition-all"
                  placeholder="Any special alterations or posture notes..."
                />
              </div>
            </form>
            
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button 
                type="button"
                onClick={handleCancelModal}
                className="px-5 py-2.5 text-slate-600 font-semibold hover:bg-slate-200 bg-slate-100 rounded-xl text-sm transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-md hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5 transition-all active:scale-95"
              >
                <Save className="w-4 h-4" /> {editingId ? 'Update' : 'Save'} Measurement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Measurements;
