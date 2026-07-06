import React, { useState, useEffect } from 'react';
import { Scissors, Sparkles, CheckCircle2, ChevronRight, User, Plus, X, Trash2, Calendar as CalendarIcon, Truck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { productionApi } from '../../../api/productionApi';
import { deliveryApi } from '../../../api/deliveryApi';

interface ProductionItem {
  id: string;
  orderId: string;
  customerName: string;
  garment: string;
  tailor: string;
  stage: 'Cutting' | 'Stitching' | 'Trial' | 'Ready';
  priority: string;
  startDate: string;
  expectedEndDate: string;
  notes: string;
}

const stageConfig: Record<string, { icon: any; color: string; bgColor: string }> = {
  'Cutting': { icon: Scissors, color: 'text-[#C99A3E]', bgColor: 'bg-[#C99A3E]/10' },
  'Stitching': { icon: Sparkles, color: 'text-[#7A5AA8]', bgColor: 'bg-[#7A5AA8]/10' },
  'Trial': { icon: User, color: 'text-[#C1652F]', bgColor: 'bg-[#C1652F]/10' },
  'Ready': { icon: CheckCircle2, color: 'text-[#2F5D4F]', bgColor: 'bg-[#2F5D4F]/10' },
};

const priorityStyles: Record<string, string> = {
  'High': 'bg-[#9B3B43]/10 text-[#9B3B43] border-[#9B3B43]/20',
  'Medium': 'bg-[#C99A3E]/10 text-[#8a6a25] border-[#C99A3E]/20',
  'Low': 'bg-[#1C2430]/[0.05] text-[#1C2430]/60 border-[#1C2430]/10',
};

const Production: React.FC = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<ProductionItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [orderId, setOrderId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [garment, setGarment] = useState('');
  const [tailor, setTailor] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [startDate, setStartDate] = useState('');
  const [expectedEndDate, setExpectedEndDate] = useState('');
  const [notes, setNotes] = useState('');

  const stages: ProductionItem['stage'][] = ['Cutting', 'Stitching', 'Trial', 'Ready'];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await productionApi.getProduction();
        const formatted = data.map((item: any) => ({
          id: `PRD-${item.id}`,
          orderId: item.order_id || '',
          customerName: item.customer_name,
          garment: item.garment,
          tailor: item.tailor || '',
          stage: item.stage,
          priority: item.priority || 'Medium',
          startDate: item.start_date ? new Date(item.start_date).toISOString().split('T')[0] : '',
          expectedEndDate: item.expected_end_date ? new Date(item.expected_end_date).toISOString().split('T')[0] : '',
          notes: item.notes || '',
        }));
        setItems(formatted);
      } catch (error) {
        console.error('Error loading production:', error);
      }
    };
    fetchData();
  }, []);

  const promoteStage = async (id: string, currentStage: ProductionItem['stage']) => {
    const currentIndex = stages.indexOf(currentStage);
    if (currentIndex === -1 || currentIndex === stages.length - 1) return;
    const nextStage = stages[currentIndex + 1];
    try {
      await productionApi.updateStage(id, nextStage);
      setItems(items.map(item => item.id === id ? { ...item, stage: nextStage } : item));
    } catch (error) {
      console.error('Error promoting stage:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await productionApi.deleteProduction(id);
      setItems(items.filter(item => item.id !== id));
    } catch (error) {
      console.error('Error deleting production item:', error);
    }
  };

  const handleSendToDelivery = async (item: ProductionItem) => {
    if (!window.confirm(`Send "${item.garment}" for ${item.customerName} to Delivery queue?`)) return;
    try {
      await deliveryApi.addDelivery({
        order_id: item.orderId || '',
        customer_name: item.customerName,
        phone: '',
        garment: item.garment,
        ready_date: new Date().toISOString().split('T')[0],
        delivery_method: 'Pickup',
        status: 'Ready for Pickup',
      });
      // Remove from production queue once it's sent to delivery
      await handleDelete(item.id);
      navigate('/orders/delivery');
    } catch (error) {
      console.error('Error sending to delivery:', error);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !garment) return;

    try {
      const response = await productionApi.addProduction({
        order_id: orderId, customer_name: customerName, garment, tailor,
        priority, start_date: startDate || undefined, expected_end_date: expectedEndDate || undefined, notes,
      });
      const p = response.production;
      setItems([{
        id: `PRD-${p.id}`, orderId: p.order_id || '', customerName: p.customer_name,
        garment: p.garment, tailor: p.tailor || '', stage: p.stage, priority: p.priority,
        startDate: p.start_date ? new Date(p.start_date).toISOString().split('T')[0] : '',
        expectedEndDate: p.expected_end_date ? new Date(p.expected_end_date).toISOString().split('T')[0] : '',
        notes: p.notes || '',
      }, ...items]);
      setOrderId(''); setCustomerName(''); setGarment(''); setTailor('');
      setPriority('Medium'); setStartDate(''); setExpectedEndDate(''); setNotes('');
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error creating production item:', error);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F1] text-[#1C2430]">
      <div className="flex flex-col h-full space-y-5 p-6 md:p-8 max-w-[1600px] mx-auto">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 pb-5 border-b border-[#1C2430]/[0.08]">
          <div>
            <p className="text-xs font-semibold tracking-[0.18em] uppercase text-[#C1652F] mb-1.5">Workshop</p>
            <h1 className="text-3xl md:text-[2rem] font-serif font-semibold tracking-tight text-[#1C2430]">Production Queue</h1>
            <p className="text-sm text-[#1C2430]/55 mt-1">Track cutting, stitching, trial and ready states for master tailors.</p>
          </div>
          <button onClick={() => setIsModalOpen(true)} className="px-4 py-2.5 bg-[#1C2430] hover:bg-[#2a3545] text-[#FAF7F1] rounded-xl text-sm font-semibold flex items-center gap-1.5 transition shadow-md shadow-[#1C2430]/10 self-start sm:self-auto">
            <Plus className="w-4 h-4" /> Add to Queue
          </button>
        </div>

        {/* Kanban Board */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 items-start">
          {stages.map((stage) => {
            const config = stageConfig[stage];
            const StageIcon = config.icon;
            const stageItems = items.filter(item => item.stage === stage);
            
            return (
              <div key={stage} className={`${config.bgColor} p-4 rounded-2xl flex flex-col min-h-[400px]`}>
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <StageIcon className={`w-4 h-4 ${config.color}`} />
                    <span className="text-sm font-bold text-[#1C2430]">{stage}</span>
                  </div>
                  <span className="text-xs bg-white/70 text-[#1C2430]/60 px-2.5 py-0.5 rounded-full font-bold">
                    {stageItems.length}
                  </span>
                </div>

                <div className="space-y-3 flex-1 overflow-y-auto">
                  {stageItems.map((item) => (
                    <div key={item.id} className="bg-white p-4 rounded-xl border border-[#1C2430]/[0.06] shadow-[0_1px_3px_rgba(28,36,48,0.04)] hover:shadow-[0_4px_12px_rgba(28,36,48,0.08)] transition-all duration-200 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-[#1C2430]/40 tracking-wider">{item.orderId || 'NO ORDER'}</span>
                        <div className="flex items-center gap-1.5">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${priorityStyles[item.priority] || priorityStyles['Medium']}`}>
                            {item.priority}
                          </span>
                          <button onClick={() => handleDelete(item.id)} className="p-0.5 text-[#1C2430]/25 hover:text-[#9B3B43] transition">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-serif font-bold text-[#1C2430] text-sm">{item.garment}</h4>
                        <p className="text-xs text-[#1C2430]/55 mt-0.5">For {item.customerName}</p>
                      </div>

                      {item.tailor && (
                        <div className="bg-[#FAF7F1] p-2 rounded-lg text-xs text-[#1C2430]/65 border border-[#1C2430]/[0.04] flex justify-between items-center">
                          <span>Tailor: <span className="font-bold text-[#1C2430]">{item.tailor}</span></span>
                        </div>
                      )}

                      {item.expectedEndDate && (
                        <div className="flex items-center gap-1.5 text-[10px] font-semibold text-[#1C2430]/45">
                          <CalendarIcon className="w-3 h-3" />
                          <span>Due: {item.expectedEndDate}</span>
                        </div>
                      )}

                      {stage !== 'Ready' && (
                        <button 
                          onClick={() => promoteStage(item.id, item.stage)}
                          className="w-full py-2 bg-[#1C2430]/[0.04] hover:bg-[#C1652F]/10 text-[#C1652F] rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition"
                        >
                          Promote <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {stage === 'Ready' && (
                        <button
                          onClick={() => handleSendToDelivery(item)}
                          className="w-full py-2 bg-[#2F5D4F]/10 hover:bg-[#2F5D4F]/20 text-[#2F5D4F] rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition"
                        >
                          <Truck className="w-3.5 h-3.5" /> Send to Delivery
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Create Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-[#1C2430]/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl border border-[#1C2430]/[0.06] shadow-2xl shadow-[#1C2430]/20 w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col">
              <div className="px-6 py-5 border-b border-[#1C2430]/[0.08] flex justify-between items-center shrink-0">
                <h2 className="text-xl font-serif font-bold text-[#1C2430]">Add to Production Queue</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 bg-[#1C2430]/[0.03] hover:bg-[#1C2430]/[0.08] text-[#1C2430]/50 hover:text-[#1C2430] rounded-full transition"><X className="w-4 h-4" /></button>
              </div>
              <div className="overflow-y-auto p-6">
                <form id="productionForm" onSubmit={handleCreate} className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#1C2430]/45 uppercase tracking-wider mb-1.5">Order Reference</label>
                      <input type="text" value={orderId} onChange={(e) => setOrderId(e.target.value)} placeholder="e.g. ORD-2026-001" className="w-full px-4 py-3 border border-[#1C2430]/[0.1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C1652F]/25 focus:border-[#C1652F]/40 text-sm transition" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#1C2430]/45 uppercase tracking-wider mb-1.5">Priority</label>
                      <select value={priority} onChange={(e) => setPriority(e.target.value)} className="w-full px-4 py-3 border border-[#1C2430]/[0.1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C1652F]/25 text-sm bg-white transition">
                        <option>High</option>
                        <option>Medium</option>
                        <option>Low</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#1C2430]/45 uppercase tracking-wider mb-1.5">Customer Name *</label>
                    <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} required placeholder="e.g. Anjali Sharma" className="w-full px-4 py-3 border border-[#1C2430]/[0.1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C1652F]/25 focus:border-[#C1652F]/40 text-sm transition" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#1C2430]/45 uppercase tracking-wider mb-1.5">Garment *</label>
                    <input type="text" value={garment} onChange={(e) => setGarment(e.target.value)} required placeholder="e.g. Silk Anarkali Suit" className="w-full px-4 py-3 border border-[#1C2430]/[0.1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C1652F]/25 focus:border-[#C1652F]/40 text-sm transition" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#1C2430]/45 uppercase tracking-wider mb-1.5">Assigned Tailor</label>
                    <input type="text" value={tailor} onChange={(e) => setTailor(e.target.value)} placeholder="e.g. Ramesh Singh" className="w-full px-4 py-3 border border-[#1C2430]/[0.1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C1652F]/25 focus:border-[#C1652F]/40 text-sm transition" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#1C2430]/45 uppercase tracking-wider mb-1.5">Start Date</label>
                      <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full px-4 py-3 border border-[#1C2430]/[0.1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C1652F]/25 text-sm transition" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#1C2430]/45 uppercase tracking-wider mb-1.5">Expected End</label>
                      <input type="date" value={expectedEndDate} onChange={(e) => setExpectedEndDate(e.target.value)} className="w-full px-4 py-3 border border-[#1C2430]/[0.1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C1652F]/25 text-sm transition" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#1C2430]/45 uppercase tracking-wider mb-1.5">Notes</label>
                    <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Special instructions for the tailor..." rows={2} className="w-full px-4 py-3 border border-[#1C2430]/[0.1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C1652F]/25 text-sm resize-none transition" />
                  </div>
                </form>
              </div>
              <div className="px-6 py-5 border-t border-[#1C2430]/[0.08] flex justify-end shrink-0 bg-[#FAF7F1]/50">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-sm font-semibold text-[#1C2430]/60 hover:text-[#1C2430] transition mr-3">Cancel</button>
                <button type="submit" form="productionForm" className="px-6 py-2.5 bg-[#1C2430] hover:bg-[#2a3545] text-[#FAF7F1] rounded-xl text-sm font-bold shadow-md shadow-[#1C2430]/10 transition">Add to Queue</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Production;
