import { toast } from 'sonner';
import React, { useState, useEffect, useCallback } from 'react';
import { attendanceApi, AttendanceRecord, AttendanceSummary } from '../../../api/attendanceApi';
import { 
  CalendarDays, Search, CheckCircle2, XCircle, Clock, 
  FileEdit, RefreshCw, BarChart3, Users, Calendar
} from 'lucide-react';

type AttendanceStatus = 'Present' | 'Absent' | 'Half-Day' | 'Late';

const STATUS_OPTIONS: AttendanceStatus[] = ['Present', 'Absent', 'Half-Day', 'Late'];

const statusConfig: Record<AttendanceStatus, { color: string; bg: string; dot: string; icon: React.ReactNode }> = {
  Present:  { color: 'text-[#10B981]', bg: 'bg-[#10B981]/10', dot: 'bg-[#10B981]', icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  Absent:   { color: 'text-[#F43F5E]', bg: 'bg-[#F43F5E]/10', dot: 'bg-[#F43F5E]', icon: <XCircle className="w-3.5 h-3.5" /> },
  'Half-Day': { color: 'text-[#7209B7]', bg: 'bg-[#7209B7]/10', dot: 'bg-[#7209B7]', icon: <Clock className="w-3.5 h-3.5" /> },
  Late:     { color: 'text-[#8338EC]', bg: 'bg-[#8338EC]/10', dot: 'bg-[#8338EC]', icon: <Clock className="w-3.5 h-3.5" /> },
};

const todayStr = () => new Date().toISOString().split('T')[0];
const currentMonthStr = () => new Date().toISOString().slice(0, 7);

const Attendance: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(todayStr());
  const [search, setSearch] = useState('');
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [summary, setSummary] = useState<AttendanceSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bulkMarking, setBulkMarking] = useState(false);
  const [markingId, setMarkingId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'daily' | 'summary'>('daily');

  // Edit notes modal
  const [notesModal, setNotesModal] = useState<{ record: AttendanceRecord; notes: string } | null>(null);
  const [savingNotes, setSavingNotes] = useState(false);

  const fetchAttendance = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await attendanceApi.getAttendanceByDate(selectedDate);
      setRecords(data);
    } catch (e) {
      setError('Failed to load attendance. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  const fetchSummary = useCallback(async () => {
    setSummaryLoading(true);
    try {
      const data = await attendanceApi.getAttendanceSummary(currentMonthStr());
      setSummary(data);
    } catch (e) {
      // summary is supplementary
    } finally {
      setSummaryLoading(false);
    }
  }, []);

  useEffect(() => { fetchAttendance(); }, [fetchAttendance]);
  useEffect(() => { fetchSummary(); }, [fetchSummary]);

  const handleMarkStatus = async (record: AttendanceRecord, status: AttendanceStatus) => {
    const empId = record.employee_id;
    setMarkingId(empId);
    try {
      await attendanceApi.markAttendance({
        employee_id: empId,
        date: selectedDate,
        status,
        check_in: record.check_in || undefined,
        check_out: record.check_out || undefined,
      });
      setRecords(prev => prev.map(r =>
        r.employee_id === empId
          ? { ...r, status, attendance_id: r.attendance_id || undefined }
          : r
      ));
    } catch (e) {
      toast.error('Failed to mark attendance');
    } finally {
      setMarkingId(null);
    }
  };

  const handleBulkMarkPresent = async () => {
    setBulkMarking(true);
    try {
      await attendanceApi.bulkMarkAttendance({ date: selectedDate, status: 'Present' });
      fetchAttendance();
      fetchSummary();
    } catch {
      toast.error('Failed to bulk mark attendance');
    } finally {
      setBulkMarking(false);
    }
  };

  const handleTimeChange = async (record: AttendanceRecord, field: 'check_in' | 'check_out', value: string) => {
    const empId = record.employee_id;
    try {
      await attendanceApi.markAttendance({
        employee_id: empId,
        date: selectedDate,
        status: record.status || 'Present',
        check_in: field === 'check_in' ? value : (record.check_in || undefined),
        check_out: field === 'check_out' ? value : (record.check_out || undefined),
      });
      setRecords(prev => prev.map(r =>
        r.employee_id === empId
          ? { ...r, [field]: value, status: r.status || 'Present' }
          : r
      ));
    } catch {
      toast.error('Failed to update time');
    }
  };

  const handleQuickTime = async (record: AttendanceRecord, field: 'check_in' | 'check_out') => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    await handleTimeChange(record, field, timeStr);
  };

  const handleSaveNotes = async () => {
    if (!notesModal) return;
    setSavingNotes(true);
    try {
      if (notesModal.record.attendance_id) {
        await attendanceApi.updateAttendance(notesModal.record.attendance_id, {
          status: notesModal.record.status,
          notes: notesModal.notes,
        });
      } else {
        await attendanceApi.markAttendance({
          employee_id: notesModal.record.employee_id,
          date: selectedDate,
          status: notesModal.record.status || 'Present',
          notes: notesModal.notes,
        });
      }
      setNotesModal(null);
      fetchAttendance();
    } catch {
      toast.error('Failed to save notes');
    } finally {
      setSavingNotes(false);
    }
  };

  const filteredRecords = records.filter(r =>
    !search || r.employee_name?.toLowerCase().includes(search.toLowerCase())
  );

  const presentCount = records.filter(r => r.status === 'Present').length;
  const absentCount = records.filter(r => r.status === 'Absent').length;
  const halfDayCount = records.filter(r => r.status === 'Half-Day').length;
  const unmarkedCount = records.filter(r => !r.status).length;

  const isToday = selectedDate === todayStr();

  return (
    <div className="flex flex-col h-full space-y-6 p-6 bg-[#F4F3F8]">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#16132D]/[0.08]">
        <div>
          <h1 className="text-3xl font-serif font-bold text-[#16132D] flex items-center gap-3">
            <CalendarDays className="w-8 h-8 text-[#7209B7]" />
            Staff Attendance
          </h1>
          <p className="text-sm text-[#16132D]/60 mt-1 font-medium">Manage daily attendance, timesheets, and monthly summaries</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={fetchAttendance}
            className="px-4 py-2 bg-white border border-[#16132D]/[0.1] rounded-xl text-sm font-semibold text-[#16132D] hover:bg-[#F4F3F8] transition-all flex items-center gap-2 shadow-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button
            onClick={handleBulkMarkPresent}
            disabled={bulkMarking}
            className="px-5 py-2 bg-[#16132D] text-[#F4F3F8] rounded-xl text-sm font-bold hover:bg-[#2a3545] disabled:opacity-60 transition-all flex items-center gap-2 shadow-md shadow-[#16132D]/10"
          >
            {bulkMarking ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4 text-[#10B981]" />}
            {bulkMarking ? 'Marking...' : 'Mark All Present'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-[#16132D]/[0.04] p-1.5 rounded-xl w-fit border border-[#16132D]/[0.08]">
        <button 
          onClick={() => setActiveTab('daily')}
          className={`px-5 py-2 rounded-lg text-sm font-bold capitalize transition-all flex items-center gap-2 ${activeTab === 'daily' ? 'bg-white shadow-sm text-[#16132D]' : 'text-[#16132D]/60 hover:text-[#16132D]'}`}
        >
          <Calendar className="w-4 h-4" /> Daily View
        </button>
        <button 
          onClick={() => setActiveTab('summary')}
          className={`px-5 py-2 rounded-lg text-sm font-bold capitalize transition-all flex items-center gap-2 ${activeTab === 'summary' ? 'bg-white shadow-sm text-[#16132D]' : 'text-[#16132D]/60 hover:text-[#16132D]'}`}
        >
          <BarChart3 className="w-4 h-4" /> Monthly Summary
        </button>
      </div>

      {activeTab === 'daily' ? (
        <div className="flex flex-col gap-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { label: 'Total Staff', value: records.length, icon: Users, color: 'text-[#8338EC]', bg: 'bg-[#8338EC]/10' },
              { label: 'Present', value: presentCount, icon: CheckCircle2, color: 'text-[#10B981]', bg: 'bg-[#10B981]/10' },
              { label: 'Absent', value: absentCount, icon: XCircle, color: 'text-[#F43F5E]', bg: 'bg-[#F43F5E]/10' },
              { label: 'Half-Day', value: halfDayCount, icon: Clock, color: 'text-[#7209B7]', bg: 'bg-[#7209B7]/10' },
              { label: 'Unmarked', value: unmarkedCount, icon: CalendarDays, color: 'text-[#7A5AA8]', bg: 'bg-[#7A5AA8]/10' },
            ].map(stat => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="bg-white rounded-2xl p-5 border border-[#16132D]/[0.08] shadow-sm flex flex-col transition-all hover:shadow-md">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-xs font-bold text-[#16132D]/50 uppercase tracking-wider">{stat.label}</p>
                    <div className={`p-1.5 rounded-lg ${stat.bg}`}>
                      <Icon className={`w-4 h-4 ${stat.color}`} />
                    </div>
                  </div>
                  <p className="text-3xl font-black text-[#16132D]">{loading ? '-' : stat.value}</p>
                </div>
              );
            })}
          </div>

          {/* Filters row */}
          <div className="flex flex-wrap md:flex-nowrap gap-4 bg-white p-4 rounded-2xl shadow-sm border border-[#16132D]/[0.08]">
            <div className="flex items-center gap-3 bg-[#F4F3F8] px-4 py-2 rounded-xl border border-[#16132D]/[0.06]">
              <label className="text-xs font-bold text-[#16132D]/60 uppercase tracking-wider">Date:</label>
              <input 
                type="date" 
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
                max={todayStr()}
                className="bg-transparent border-none outline-none text-sm font-semibold text-[#16132D] focus:ring-0 cursor-pointer" 
              />
              {!isToday && (
                <button onClick={() => setSelectedDate(todayStr())}
                  className="px-3 py-1 text-xs font-bold text-[#7209B7] bg-[#7209B7]/10 rounded-lg hover:bg-[#7209B7]/20 transition">Today</button>
              )}
            </div>
            
            <div className="flex-1 min-w-[200px] relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#16132D]/40" />
              <input 
                type="text" 
                placeholder="Search employee by name..."
                value={search} 
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-[#F4F3F8] border border-[#16132D]/[0.06] rounded-xl text-sm font-medium text-[#16132D] placeholder-[#16132D]/40 focus:outline-none focus:ring-2 focus:ring-[#7209B7]/20 focus:border-[#7209B7]/30 transition-all" 
              />
            </div>
          </div>

          {/* Attendance Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-[#16132D]/[0.08] overflow-hidden">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-64 gap-4">
                <RefreshCw className="w-8 h-8 text-[#7209B7] animate-spin" />
                <p className="text-sm font-semibold text-[#16132D]/60">Loading attendance data...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center h-64 gap-3 text-center px-4">
                <div className="w-12 h-12 rounded-full bg-[#F43F5E]/10 flex items-center justify-center mb-2">
                  <XCircle className="w-6 h-6 text-[#F43F5E]" />
                </div>
                <p className="text-[#F43F5E] font-bold">{error}</p>
                <button onClick={fetchAttendance} className="mt-2 px-5 py-2.5 bg-[#16132D] text-white rounded-xl text-sm font-bold shadow-md hover:bg-[#2a3545]">Retry Now</button>
              </div>
            ) : filteredRecords.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 gap-3 text-center px-4">
                <div className="w-16 h-16 rounded-full bg-[#F4F3F8] flex items-center justify-center mb-2">
                  <Users className="w-8 h-8 text-[#16132D]/30" />
                </div>
                <h3 className="text-lg font-bold text-[#16132D]">No employees found</h3>
                <p className="text-sm text-[#16132D]/60">
                  {records.length === 0 ? 'Add employees from the Staff page to manage their attendance.' : 'No employees match your search criteria.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-[#F4F3F8]/50 border-b border-[#16132D]/[0.08]">
                      <th className="px-6 py-4 font-bold text-[#16132D]/60 uppercase tracking-wider text-[11px]">Employee</th>
                      <th className="px-6 py-4 font-bold text-[#16132D]/60 uppercase tracking-wider text-[11px]">Status</th>
                      <th className="px-6 py-4 font-bold text-[#16132D]/60 uppercase tracking-wider text-[11px]">Quick Mark</th>
                      <th className="px-6 py-4 font-bold text-[#16132D]/60 uppercase tracking-wider text-[11px]">Check In</th>
                      <th className="px-6 py-4 font-bold text-[#16132D]/60 uppercase tracking-wider text-[11px]">Check Out</th>
                      <th className="px-6 py-4 font-bold text-[#16132D]/60 uppercase tracking-wider text-[11px]">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#16132D]/[0.04]">
                    {filteredRecords.map(record => {
                      const isMarking = markingId === record.employee_id;
                      const cfg = record.status ? statusConfig[record.status as AttendanceStatus] : null;
                      const checkInVal = record.check_in ? record.check_in.substring(0, 5) : '';
                      const checkOutVal = record.check_out ? record.check_out.substring(0, 5) : '';

                      return (
                        <tr key={record.employee_id} className="hover:bg-[#F4F3F8]/30 transition-colors group">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7209B7] to-[#8338EC] flex items-center justify-center text-white font-bold text-sm shadow-sm shadow-[#7209B7]/20 flex-shrink-0">
                                {record.employee_name?.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-bold text-[#16132D]">{record.employee_name}</p>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="text-[11px] font-semibold text-[#7A5AA8] bg-[#7A5AA8]/10 px-2 py-0.5 rounded-md">{record.employee_role}</span>
                                  <span className="text-xs text-[#16132D]/50 font-medium">{record.employee_phone || 'No phone'}</span>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {isMarking ? (
                              <RefreshCw className="w-5 h-5 text-[#7209B7] animate-spin" />
                            ) : cfg ? (
                              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border border-current ${cfg.bg} ${cfg.color}`}>
                                {cfg.icon}
                                {record.status}
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold bg-[#F4F3F8] text-[#16132D]/50 border border-[#16132D]/10 border-dashed">
                                Unmarked
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-1.5 p-1 bg-[#F4F3F8] rounded-xl border border-[#16132D]/[0.04] w-fit">
                              {STATUS_OPTIONS.map(s => {
                                const sCfg = statusConfig[s];
                                const isActive = record.status === s;
                                return (
                                  <button key={s}
                                    onClick={() => handleMarkStatus(record, s)}
                                    disabled={isMarking}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                                      isActive
                                        ? `${sCfg.bg} ${sCfg.color} shadow-sm`
                                        : 'text-[#16132D]/50 hover:bg-white hover:text-[#16132D] hover:shadow-sm'
                                    }`}>
                                    {isActive && <span className={`w-1.5 h-1.5 rounded-full ${sCfg.dot}`} />}
                                    {s}
                                  </button>
                                );
                              })}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <input
                                type="time"
                                value={checkInVal}
                                onChange={e => handleTimeChange(record, 'check_in', e.target.value)}
                                className="px-3 py-2 bg-[#F4F3F8] border border-[#16132D]/[0.08] rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#7209B7]/30 transition-all w-[110px]"
                              />
                              {!checkInVal && isToday && (
                                <button
                                  onClick={() => handleQuickTime(record, 'check_in')}
                                  className="px-3 py-2 bg-[#10B981]/10 text-[#10B981] rounded-xl text-xs font-bold hover:bg-[#10B981]/20 transition-all whitespace-nowrap"
                                  title="Check In Now"
                                >
                                  Now
                                </button>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <input
                                type="time"
                                value={checkOutVal}
                                onChange={e => handleTimeChange(record, 'check_out', e.target.value)}
                                className="px-3 py-2 bg-[#F4F3F8] border border-[#16132D]/[0.08] rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#7209B7]/30 transition-all w-[110px]"
                              />
                              {checkInVal && !checkOutVal && isToday && (
                                <button
                                  onClick={() => handleQuickTime(record, 'check_out')}
                                  className="px-3 py-2 bg-[#F43F5E]/10 text-[#F43F5E] rounded-xl text-xs font-bold hover:bg-[#F43F5E]/20 transition-all whitespace-nowrap"
                                  title="Check Out Now"
                                >
                                  Now
                                </button>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => setNotesModal({ record, notes: record.notes || '' })}
                              className="flex items-center justify-center w-8 h-8 bg-[#F4F3F8] text-[#16132D]/60 hover:bg-[#7209B7]/10 hover:text-[#7209B7] rounded-xl transition-all"
                              title={record.notes ? 'Edit Note' : 'Add Note'}
                            >
                              <FileEdit className="w-4 h-4" />
                            </button>
                            {record.notes && (
                              <p className="text-[11px] font-medium text-[#16132D]/50 mt-1.5 max-w-[120px] truncate" title={record.notes}>
                                {record.notes}
                              </p>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Monthly Summary Tab */
        <div className="bg-white rounded-2xl shadow-sm border border-[#16132D]/[0.08] overflow-hidden">
          <div className="px-6 py-5 border-b border-[#16132D]/[0.06] bg-[#F4F3F8]/30">
            <h3 className="text-lg font-bold text-[#16132D]">Monthly Summary — {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>
            <p className="text-sm font-medium text-[#16132D]/60 mt-0.5">Performance and attendance overview for all active staff</p>
          </div>
          
          {summaryLoading ? (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
              <RefreshCw className="w-8 h-8 text-[#7209B7] animate-spin" />
              <p className="text-sm font-semibold text-[#16132D]/60">Analyzing monthly data...</p>
            </div>
          ) : summary.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 gap-3 text-center px-4">
              <div className="w-16 h-16 rounded-full bg-[#F4F3F8] flex items-center justify-center mb-2">
                <BarChart3 className="w-8 h-8 text-[#16132D]/30" />
              </div>
              <h3 className="text-lg font-bold text-[#16132D]">No attendance data yet</h3>
              <p className="text-sm text-[#16132D]/60">Data will appear here once attendance is marked for this month.</p>
            </div>
          ) : (
            <div className="overflow-x-auto p-4">
              <table className="w-full text-left text-sm border-separate border-spacing-0">
                <thead>
                  <tr>
                    {['Employee', 'Role', 'Present', 'Absent', 'Half-Day', 'Late', 'Total Marked', 'Attendance %'].map((h, i) => (
                      <th key={h} className={`px-4 py-3 font-bold text-[#16132D]/60 uppercase tracking-wider text-[11px] bg-[#F4F3F8]/50 ${i === 0 ? 'rounded-tl-xl' : ''} ${i === 7 ? 'rounded-tr-xl' : ''}`}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {summary.map((s, i) => {
                    const pct = s.total_marked > 0 ? Math.round((Number(s.present_days) / Number(s.total_marked)) * 100) : 0;
                    const isLast = i === summary.length - 1;
                    
                    return (
                      <tr key={s.employee_id} className="hover:bg-[#F4F3F8]/40 transition-colors">
                        <td className={`px-4 py-3 border-b border-[#16132D]/[0.04] ${isLast ? 'border-b-0' : ''}`}>
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#16132D] to-[#2a3545] flex items-center justify-center text-[#F4F3F8] font-bold text-xs shadow-sm shadow-[#16132D]/10 flex-shrink-0">
                              {s.employee_name.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-bold text-[#16132D]">{s.employee_name}</span>
                          </div>
                        </td>
                        <td className={`px-4 py-3 border-b border-[#16132D]/[0.04] ${isLast ? 'border-b-0' : ''}`}>
                          <span className="text-[11px] font-bold text-[#7209B7] bg-[#7209B7]/10 px-2.5 py-1 rounded-md">{s.employee_role}</span>
                        </td>
                        <td className={`px-4 py-3 border-b border-[#16132D]/[0.04] ${isLast ? 'border-b-0' : ''}`}>
                          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-[#10B981]/10 text-[#10B981]">{s.present_days}</span>
                        </td>
                        <td className={`px-4 py-3 border-b border-[#16132D]/[0.04] ${isLast ? 'border-b-0' : ''}`}>
                          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-[#F43F5E]/10 text-[#F43F5E]">{s.absent_days}</span>
                        </td>
                        <td className={`px-4 py-3 border-b border-[#16132D]/[0.04] ${isLast ? 'border-b-0' : ''}`}>
                          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-[#7209B7]/10 text-[#7209B7]">{s.half_days}</span>
                        </td>
                        <td className={`px-4 py-3 border-b border-[#16132D]/[0.04] ${isLast ? 'border-b-0' : ''}`}>
                          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-[#8338EC]/10 text-[#8338EC]">{s.late_days}</span>
                        </td>
                        <td className={`px-4 py-3 border-b border-[#16132D]/[0.04] ${isLast ? 'border-b-0' : ''}`}>
                          <span className="font-bold text-[#16132D]/80">{s.total_marked}</span>
                        </td>
                        <td className={`px-4 py-3 border-b border-[#16132D]/[0.04] ${isLast ? 'border-b-0' : ''}`}>
                          <div className="flex items-center gap-3">
                            <div className="flex-1 bg-[#16132D]/[0.06] rounded-full h-2 min-w-[70px] overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${pct >= 80 ? 'bg-[#10B981]' : pct >= 60 ? 'bg-[#8338EC]' : 'bg-[#F43F5E]'}`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="text-xs font-black text-[#16132D] w-8">{pct}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Notes Modal */}
      {notesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#16132D]/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl shadow-[#16132D]/20 w-full max-w-sm p-6 transform transition-all">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-serif font-bold text-[#16132D]">
                Add Note
              </h3>
              <div className="px-2.5 py-1 bg-[#F4F3F8] rounded-lg text-xs font-bold text-[#16132D]/60">
                {notesModal.record.employee_name}
              </div>
            </div>
            
            <p className="text-xs font-bold text-[#16132D]/50 mb-4 uppercase tracking-wider">
              {selectedDate} • <span className="text-[#7209B7]">{notesModal.record.status || 'Unmarked'}</span>
            </p>
            
            <textarea
              value={notesModal.notes}
              onChange={e => setNotesModal(n => n ? { ...n, notes: e.target.value } : null)}
              rows={4}
              placeholder="e.g. Left early due to medical appointment..."
              className="w-full px-4 py-3 bg-[#F4F3F8] border border-[#16132D]/[0.08] rounded-xl text-sm font-medium text-[#16132D] focus:outline-none focus:ring-2 focus:ring-[#7209B7]/20 focus:border-[#7209B7]/30 resize-none mb-6 transition-all"
            />
            
            <div className="flex gap-3">
              <button 
                onClick={() => setNotesModal(null)}
                className="flex-1 px-4 py-3 bg-white border border-[#16132D]/[0.1] text-[#16132D] rounded-xl text-sm font-bold hover:bg-[#F4F3F8] transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveNotes} 
                disabled={savingNotes}
                className="flex-1 px-4 py-3 bg-[#16132D] text-[#F4F3F8] rounded-xl text-sm font-bold shadow-md shadow-[#16132D]/10 hover:bg-[#2a3545] disabled:opacity-60 transition-all"
              >
                {savingNotes ? 'Saving...' : 'Save Note'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Attendance;
