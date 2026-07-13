import React, { useState, useEffect } from 'react';
import { Plus, Search, Calendar as CalendarIcon, Clock, User, MessageSquare, Check, X, Phone, UserCheck, Trash2, Loader2 } from 'lucide-react';
import { appointmentApi } from '../../../api/appointmentApi';

interface Appointment {
  id: string; // Database ID
  displayId: string; // UI display ID
  customerName: string;
  type: string;
  date: string;
  time: string;
  phone?: string;
  assignedTo?: string;
  notes?: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled';
}

const mockAppointments: Appointment[] = [
  { id: '1001', displayId: 'APT-1001', customerName: 'Anjali Sharma', type: 'Fitting', date: '2026-06-28', time: '11:00 AM', phone: '9876543210', assignedTo: 'Ritu (Lead Designer)', notes: 'First fitting for wedding lehenga', status: 'Scheduled' },
  { id: '1002', displayId: 'APT-1002', customerName: 'Priyanka Sen', type: 'Design Consultation', date: '2026-06-28', time: '02:30 PM', phone: '9876543211', notes: 'Discussion about reception gown styles', status: 'Scheduled' },
  { id: '1003', displayId: 'APT-1003', customerName: 'Sanjana Roy', type: 'Fabric Selection', date: '2026-06-29', time: '10:00 AM', assignedTo: 'Amit (Fabric Specialist)', notes: 'Needs to review new silk stock', status: 'Scheduled' },
  { id: '1004', displayId: 'APT-1004', customerName: 'Kriti Sen', type: 'Measurement Collection', date: '2026-06-27', time: '04:00 PM', phone: '9876543213', status: 'Completed' },
];

const getTypeStyle = (type: string) => {
  const styles: Record<string, string> = {
    'Fitting': 'bg-[#8338EC]/10 text-[#6200EA] border-[#8338EC]/20',
    'Design Consultation': 'bg-[#7A5AA8]/10 text-[#5d4485] border-[#7A5AA8]/20',
    'Fabric Selection': 'bg-[#10B981]/10 text-[#234638] border-[#10B981]/20',
    'Measurement Collection': 'bg-[#7209B7]/10 text-[#a3531f] border-[#7209B7]/20',
  };
  return styles[type] || 'bg-[#16132D]/10 text-[#16132D] border-[#16132D]/20';
};

const statusStyles: Record<Appointment['status'], string> = {
  'Scheduled': 'bg-[#16132D]/[0.05] text-[#16132D]/70',
  'Completed': 'bg-[#10B981]/10 text-[#234638]',
  'Cancelled': 'bg-[#F43F5E]/10 text-[#7a2e34]',
};

const Appointments: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>(mockAppointments);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [customerName, setCustomerName] = useState('');
  const [type, setType] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [phone, setPhone] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const data = await appointmentApi.getAppointments();
        const formatted = data.map((item: any) => ({
          id: item.id.toString(),
          displayId: item.display_id || `APT-${item.id}`,
          customerName: item.customer_name,
          type: item.type,
          date: new Date(item.date).toISOString().split('T')[0], // Format date if needed
          time: item.time,
          phone: item.phone || '',
          assignedTo: item.assigned_to || '',
          notes: item.notes || '',
          status: item.status
        }));
        setAppointments(formatted);
      } catch (err) {
        console.error("Failed to load appointments:", err);
      }
    };
    fetchAppointments();
  }, []);

  const filteredAppointments = appointments.filter(apt => 
    apt.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    apt.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !date || !time) return;

    setIsSubmitting(true);
    try {
      const response = await appointmentApi.addAppointment({
        customer_name: customerName,
        type,
        date,
        time,
        phone,
        assigned_to: assignedTo,
        notes,
        status: 'Scheduled'
      });
      
      const newAppointment: Appointment = {
        id: response.appointment.id.toString(),
        displayId: response.appointment.display_id || `APT-${response.appointment.id}`,
        customerName: response.appointment.customer_name,
        type: response.appointment.type,
        date: new Date(response.appointment.date).toISOString().split('T')[0],
        time: response.appointment.time,
        phone: response.appointment.phone || '',
        assignedTo: response.appointment.assigned_to || '',
        notes: response.appointment.notes || '',
        status: response.appointment.status
      };

      setAppointments([newAppointment, ...appointments]);
      setCustomerName('');
      setDate('');
      setTime('');
      setPhone('');
      setAssignedTo('');
      setType('');
      setNotes('');
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error adding appointment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id: string, nextStatus: Appointment['status']) => {
    try {
      await appointmentApi.updateAppointmentStatus(id, nextStatus);
      setAppointments(appointments.map(apt => apt.id === id ? { ...apt, status: nextStatus } : apt));
    } catch (error) {
      console.error("Error updating appointment status:", error);
    }
  };

  const handleDeleteAppointment = async (id: string) => {
    try {
      await appointmentApi.deleteAppointment(id);
      setAppointments(appointments.filter(apt => apt.id !== id));
    } catch (error) {
      console.error("Error deleting appointment:", error);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F3F8] text-[#16132D]">
      <div className="flex flex-col h-full space-y-5 p-6 md:p-8 max-w-[1500px] mx-auto">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 pb-5 border-b border-[#16132D]/[0.08]">
          <div>
            <p className="text-xs font-semibold tracking-[0.18em] uppercase text-[#7209B7] mb-1.5">
              Schedule
            </p>
            <h1 className="text-3xl md:text-[2rem] font-serif font-semibold tracking-tight text-[#16132D]">
              Appointments
            </h1>
            <p className="text-sm text-[#16132D]/55 mt-1">
              Schedule and manage customer fittings, consultation trials, and design reviews.
            </p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 bg-[#16132D] hover:bg-[#2a3545] text-[#F4F3F8] rounded-xl text-sm font-semibold flex items-center gap-1.5 transition shadow-md shadow-[#16132D]/10 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" /> Book Appointment
          </button>
        </div>

        {/* Filter Area & Search */}
        <div className="flex items-center bg-white border border-[#16132D]/[0.08] rounded-xl px-4 py-2.5 w-full sm:w-80 shadow-sm focus-within:ring-2 focus-within:ring-[#7209B7]/25 focus-within:border-[#7209B7]/40 transition">
          <Search className="w-4 h-4 text-[#16132D]/35 mr-2 flex-shrink-0" />
          <input 
            type="text" 
            placeholder="Search by customer or type..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-none outline-none text-sm text-[#16132D] placeholder-[#16132D]/35 w-full"
          />
        </div>

        {/* Appointment Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredAppointments.map((apt) => (
            <div key={apt.id} className="bg-white p-5 rounded-2xl border border-[#16132D]/[0.06] shadow-[0_1px_3px_rgba(28,36,48,0.04)] hover:shadow-[0_8px_18px_rgba(28,36,48,0.08)] hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase border ${getTypeStyle(apt.type)}`}>
                    {apt.type}
                  </span>
                  <h3 className="text-lg font-serif font-semibold text-[#16132D] mt-3">{apt.customerName}</h3>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] bg-[#16132D]/[0.05] text-[#16132D]/55 font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                      {apt.displayId}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${statusStyles[apt.status]}`}>
                    {apt.status}
                  </span>
                  <button 
                    onClick={() => handleDeleteAppointment(apt.id)} 
                    className="text-[#16132D]/30 hover:text-[#F43F5E] transition p-1"
                    title="Delete Appointment"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2.5 text-xs font-semibold text-[#16132D]/55 pt-2">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-[#16132D]/35" />
                  <span>{apt.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#16132D]/35" />
                  <span>{apt.time}</span>
                </div>
                {apt.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-[#16132D]/35" />
                    <span>{apt.phone}</span>
                  </div>
                )}
                {apt.assignedTo && (
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-[#16132D]/35" />
                    <span>{apt.assignedTo}</span>
                  </div>
                )}
                {apt.notes && (
                  <div className="flex items-start gap-2 pt-3 mt-1 border-t border-[#16132D]/[0.04] text-[#16132D]/65">
                    <MessageSquare className="w-4 h-4 text-[#16132D]/35 mt-0.5 flex-shrink-0" />
                    <p className="font-normal leading-relaxed">"{apt.notes}"</p>
                  </div>
                )}
              </div>

              {apt.status === 'Scheduled' && (
                <div className="flex gap-2 pt-4 mt-2 border-t border-[#16132D]/[0.06]">
                  <button 
                    onClick={() => handleUpdateStatus(apt.id, 'Completed')}
                    className="flex-1 py-2 bg-[#10B981]/10 hover:bg-[#10B981]/20 text-[#234638] text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition"
                  >
                    <Check className="w-3.5 h-3.5" /> Complete
                  </button>
                  <button 
                    onClick={() => handleUpdateStatus(apt.id, 'Cancelled')}
                    className="flex-1 py-2 bg-[#F43F5E]/10 hover:bg-[#F43F5E]/20 text-[#7a2e34] text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition"
                  >
                    <X className="w-3.5 h-3.5" /> Cancel
                  </button>
                </div>
              )}
            </div>
          ))}
          {filteredAppointments.length === 0 && (
             <div className="col-span-full py-12 text-center text-sm font-semibold text-[#16132D]/35">
               No appointments found.
             </div>
          )}
        </div>

        {/* Create Appointment Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-[#16132D]/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl border border-[#16132D]/[0.06] shadow-2xl shadow-[#16132D]/20 w-full max-w-md overflow-hidden">
              <div className="px-6 py-5 border-b border-[#16132D]/[0.08] flex justify-between items-center">
                <div>
                  <p className="text-[10px] font-semibold tracking-[0.18em] uppercase text-[#7209B7] mb-1">New Entry</p>
                  <h3 className="font-serif font-semibold text-[#16132D] text-lg">Book Appointment</h3>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="text-[#16132D]/35 hover:text-[#16132D] hover:bg-[#16132D]/[0.05] p-1.5 rounded-lg transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleCreateAppointment} className="p-6 space-y-5">
                <div>
                  <label className="block text-xs font-bold text-[#16132D]/45 uppercase tracking-wider mb-1.5">Customer Name *</label>
                  <input 
                    type="text" 
                    value={customerName} 
                    onChange={(e) => setCustomerName(e.target.value)} 
                    required
                    placeholder="e.g. Shalini Roy" 
                    className="w-full px-4 py-3 border border-[#16132D]/[0.1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7209B7]/25 focus:border-[#7209B7]/40 text-sm transition"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#16132D]/45 uppercase tracking-wider mb-1.5">Date *</label>
                    <input 
                      type="date" 
                      value={date} 
                      onChange={(e) => setDate(e.target.value)} 
                      required
                      className="w-full px-4 py-3 border border-[#16132D]/[0.1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7209B7]/25 focus:border-[#7209B7]/40 text-sm transition text-[#16132D]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#16132D]/45 uppercase tracking-wider mb-1.5">Time *</label>
                    <input 
                      type="time" 
                      value={time} 
                      onChange={(e) => setTime(e.target.value)} 
                      required
                      className="w-full px-4 py-3 border border-[#16132D]/[0.1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7209B7]/25 focus:border-[#7209B7]/40 text-sm transition"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#16132D]/45 uppercase tracking-wider mb-1.5">Phone Number</label>
                    <input 
                      type="tel" 
                      value={phone} 
                      onChange={(e) => setPhone(e.target.value)} 
                      placeholder="+91 98765 43210"
                      className="w-full px-4 py-3 border border-[#16132D]/[0.1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7209B7]/25 focus:border-[#7209B7]/40 text-sm transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#16132D]/45 uppercase tracking-wider mb-1.5">Assigned To</label>
                    <input 
                      type="text" 
                      value={assignedTo} 
                      onChange={(e) => setAssignedTo(e.target.value)} 
                      placeholder="e.g. Ritu (Lead Designer)"
                      className="w-full px-4 py-3 border border-[#16132D]/[0.1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7209B7]/25 focus:border-[#7209B7]/40 text-sm transition"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#16132D]/45 uppercase tracking-wider mb-1.5">Consultation Type</label>
                  <input 
                    type="text" 
                    value={type} 
                    onChange={(e) => setType(e.target.value)} 
                    placeholder="e.g. Fitting, Alteration..."
                    className="w-full px-4 py-3 border border-[#16132D]/[0.1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7209B7]/25 focus:border-[#7209B7]/40 text-sm transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#16132D]/45 uppercase tracking-wider mb-1.5">Notes</label>
                  <textarea 
                    value={notes} 
                    onChange={(e) => setNotes(e.target.value)} 
                    placeholder="Additional customer requirements..." 
                    rows={3}
                    className="w-full px-4 py-3 border border-[#16132D]/[0.1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7209B7]/25 focus:border-[#7209B7]/40 text-sm resize-none transition"
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full py-3 bg-[#16132D] hover:bg-[#2a3545] disabled:opacity-60 text-[#F4F3F8] rounded-xl text-sm font-semibold transition mt-2 shadow-md shadow-[#16132D]/10 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isSubmitting ? 'Scheduling...' : 'Schedule Appointment'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Appointments;
