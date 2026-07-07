import React, { useState, useEffect } from 'react';
import { useToast } from '../../../context';
import { measurementHistoryApi } from '../../../api/measurementHistoryApi';
import { measurementTemplateApi } from '../../../api/measurementTemplateApi';
import { customerApi } from '../../../api/customerApi';
import { Search, Plus, Trash2, X, FileText, CheckCircle, User } from 'lucide-react';

interface HistoryRecord {
  id: string | number;
  customer_id: number;
  template_id: number;
  customer_name?: string;
  template_name?: string;
  measurements: Record<string, string | number>;
  notes?: string;
  created_at: string;
  updated_at: string;
}

const History: React.FC = () => {
  const { toast } = useToast();
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [measurements, setMeasurements] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [histData, tplData, custData] = await Promise.all([
        measurementHistoryApi.getHistory(),
        measurementTemplateApi.getTemplates(),
        customerApi.getCustomers().catch(() => []) // Fallback if no customers endpoint
      ]);
      setHistory(histData);
      setTemplates(tplData);
      setCustomers(custData);
    } catch (err) {
      toast('Error loading data', 'error');
    }
  };

  const selectedTemplate = templates.find(t => String(t.id) === selectedTemplateId);

  const handleMeasurementChange = (fieldName: string, value: string) => {
    setMeasurements(prev => ({ ...prev, [fieldName]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId || !selectedTemplateId) {
      toast('Please select a customer and template', 'error');
      return;
    }

    // Validation
    if (selectedTemplate && selectedTemplate.fields) {
      const missingFields = selectedTemplate.fields.filter((f: any) => f.required && !measurements[f.name]);
      if (missingFields.length > 0) {
        toast(`Missing required fields: ${missingFields.map((f: any) => f.name).join(', ')}`, 'error');
        return;
      }
    }

    try {
      const newHistory = await measurementHistoryApi.createHistory({
        customerId: parseInt(selectedCustomerId, 10),
        templateId: parseInt(selectedTemplateId, 10),
        measurements,
        notes
      });
      // Append names for immediate display
      const c = customers.find(c => String(c.id) === selectedCustomerId);
      const t = templates.find(t => String(t.id) === selectedTemplateId);
      newHistory.customer_name = c?.name;
      newHistory.template_name = t?.name;
      
      setHistory(prev => [newHistory, ...prev]);
      toast('Measurement saved successfully', 'success');
      setIsModalOpen(false);
      
      // Reset form
      setSelectedCustomerId('');
      setSelectedTemplateId('');
      setMeasurements({});
      setNotes('');
    } catch (err) {
      toast('Failed to save measurement', 'error');
    }
  };

  const handleDelete = async (id: string | number) => {
    if (confirm('Delete this measurement record?')) {
      try {
        await measurementHistoryApi.deleteHistory(id);
        setHistory(prev => prev.filter(h => h.id !== id));
        toast('Deleted successfully', 'success');
      } catch (err) {
        toast('Failed to delete', 'error');
      }
    }
  };

  const availableProfiles = selectedCustomerId 
    ? templates.filter(t => !t.customer_id || String(t.customer_id) === selectedCustomerId)
    : templates;

  return (
    <div className="flex flex-col h-full space-y-4 p-6">
      <div className="flex justify-between items-center pb-4 border-b">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Measurement Records</h1>
          <nav className="text-sm text-gray-500 mt-1">
            <span>Home</span> <span className="mx-2">/</span> <span>Measurements</span> <span className="mx-2">/</span> <span className="text-blue-600 font-semibold">Records</span>
          </nav>
        </div>
        <div className="flex space-x-3">
          <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700">
            <Plus className="w-4 h-4" /> New Entry
          </button>
        </div>
      </div>

      {history.length > 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Style Profile</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recorded At</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {history.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{record.customer_name || `Customer #${record.customer_id}`}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.template_name || `Profile #${record.template_id}`}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(record.created_at).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => handleDelete(record.id)} className="text-red-600 hover:text-red-900">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex-1 bg-white rounded-lg shadow-sm border border-gray-100 p-8 flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 text-blue-500 mb-4">
              <FileText className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">No measurement records</h3>
            <p className="mt-1 text-sm text-gray-500">Record a new measurement for a customer.</p>
            <div className="mt-6">
              <button onClick={() => setIsModalOpen(true)} className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700">
                New Entry
              </button>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900">Record Measurement</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 overflow-y-auto max-h-[70vh]">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Customer *</label>
                  <select 
                    value={selectedCustomerId} 
                    onChange={e => setSelectedCustomerId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required
                  >
                    <option value="">Select a customer...</option>
                    {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Style Profile *</label>
                  <select 
                    value={selectedTemplateId} 
                    onChange={e => setSelectedTemplateId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required
                  >
                    <option value="">Select a style profile...</option>
                    {availableProfiles.map(t => <option key={t.id} value={t.id}>{t.name} ({t.category})</option>)}
                  </select>
                </div>

                {selectedTemplate && selectedTemplate.fields && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3 border-b pb-2">Measurements</h4>
                    <div className="grid grid-cols-2 gap-4">
                      {selectedTemplate.fields.map((field: any, idx: number) => (
                        <div key={idx}>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            {field.name} {field.required && <span className="text-red-500">*</span>}
                          </label>
                          <input
                            type="number"
                            step="0.1"
                            value={measurements[field.name] || ''}
                            onChange={(e) => handleMeasurementChange(field.name, e.target.value)}
                            className={`w-full px-3 py-1.5 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                              field.required && !measurements[field.name] ? 'border-red-300' : 'border-gray-300'
                            }`}
                            placeholder={field.type}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Any special instructions..."
                  />
                </div>
              </div>
              
              <div className="mt-6 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700">
                  Save Measurement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default History;
