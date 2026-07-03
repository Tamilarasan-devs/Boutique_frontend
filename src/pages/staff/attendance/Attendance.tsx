import React, { useState, useEffect, useCallback } from 'react';
import { attendanceApi, AttendanceRecord, AttendanceSummary } from '../../../api/attendanceApi';

type AttendanceStatus = 'Present' | 'Absent' | 'Half-Day' | 'Late';

const STATUS_OPTIONS: AttendanceStatus[] = ['Present', 'Absent', 'Half-Day', 'Late'];

const statusConfig: Record<AttendanceStatus, { color: string; bg: string; dot: string; emoji: string }> = {
  Present:  { color: 'text-emerald-800', bg: 'bg-emerald-100', dot: 'bg-emerald-500', emoji: '🟢' },
  Absent:   { color: 'text-red-800',     bg: 'bg-red-100',     dot: 'bg-red-500',     emoji: '🔴' },
  'Half-Day': { color: 'text-amber-800', bg: 'bg-amber-100',   dot: 'bg-amber-500',   emoji: '🟡' },
  Late:     { color: 'text-orange-800',  bg: 'bg-orange-100',  dot: 'bg-orange-500',  emoji: '🟠' },
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
      // Update locally
      setRecords(prev => prev.map(r =>
        r.employee_id === empId
          ? { ...r, status, attendance_id: r.attendance_id || undefined }
          : r
      ));
    } catch (e) {
      alert('Failed to mark attendance');
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
      alert('Failed to bulk mark attendance');
    } finally {
      setBulkMarking(false);
    }
  };

  // Save check-in or check-out time for a specific employee
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
      alert('Failed to update time');
    }
  };

  // One-click "Now" button — sets check-in or check-out to current time
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
      alert('Failed to save notes');
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
  const lateCount = records.filter(r => r.status === 'Late').length;
  const unmarkedCount = records.filter(r => !r.status).length;

  const isToday = selectedDate === todayStr();

  return (
    <div className="flex flex-col h-full space-y-4 p-6">
      {/* Header */}
      <div className="flex justify-between items-center pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Attendance</h1>
          <nav className="text-sm text-gray-500 mt-1">
            <span>Home</span><span className="mx-2">/</span><span className="text-gray-900">Attendance</span>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchAttendance}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
          <button
            onClick={handleBulkMarkPresent}
            disabled={bulkMarking}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 disabled:opacity-60 flex items-center gap-2 shadow-sm"
          >
            {bulkMarking
              ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : <span>✅</span>}
            {bulkMarking ? 'Marking...' : 'Mark All Present'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {(['daily', 'summary'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-lg text-sm font-semibold capitalize transition-all ${activeTab === tab ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
            {tab === 'daily' ? '📅 Daily View' : '📊 Monthly Summary'}
          </button>
        ))}
      </div>

      {activeTab === 'daily' ? (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-5 gap-3">
            {[
              { label: 'Total Staff', value: records.length, color: 'from-slate-500 to-slate-600' },
              { label: 'Present', value: presentCount, color: 'from-emerald-500 to-emerald-600' },
              { label: 'Absent', value: absentCount, color: 'from-red-500 to-red-600' },
              { label: 'Half-Day', value: halfDayCount, color: 'from-amber-500 to-amber-600' },
              { label: 'Unmarked', value: unmarkedCount, color: 'from-gray-400 to-gray-500' },
            ].map(stat => (
              <div key={stat.label} className={`bg-gradient-to-r ${stat.color} rounded-xl p-4 text-white shadow-sm`}>
                <p className="text-xs font-medium opacity-90">{stat.label}</p>
                <p className="text-2xl font-bold mt-1">{loading ? '—' : stat.value}</p>
              </div>
            ))}
          </div>

          {/* Filters row */}
          <div className="flex flex-wrap gap-3 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            {/* Date picker */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Date:</label>
              <input type="date" value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
                max={todayStr()}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
              {!isToday && (
                <button onClick={() => setSelectedDate(todayStr())}
                  className="px-3 py-2 text-xs text-teal-600 border border-teal-200 rounded-lg hover:bg-teal-50">Today</button>
              )}
            </div>
            <div className="flex-1 min-w-[200px] relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input type="text" placeholder="Search employee..."
                value={search} onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
            </div>
          </div>

          {/* Attendance Table */}
          <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm text-gray-500">Loading attendance...</p>
                </div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <p className="text-red-600 font-medium">{error}</p>
                  <button onClick={fetchAttendance} className="mt-3 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm">Retry</button>
                </div>
              </div>
            ) : filteredRecords.length === 0 ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="text-5xl mb-4">📋</div>
                  <h3 className="text-lg font-semibold text-gray-900">No employees found</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {records.length === 0
                      ? 'Add employees first from the Staff page.'
                      : 'No employees match your search.'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-100">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Employee</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Role</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Quick Mark</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Check In</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Check Out</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredRecords.map(record => {
                      const isMarking = markingId === record.employee_id;
                      const cfg = record.status ? statusConfig[record.status as AttendanceStatus] : null;
                      const checkInVal = record.check_in ? record.check_in.substring(0, 5) : '';
                      const checkOutVal = record.check_out ? record.check_out.substring(0, 5) : '';

                      return (
                        <tr key={record.employee_id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                                {record.employee_name?.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900 text-sm">{record.employee_name}</p>
                                <p className="text-xs text-gray-500">{record.employee_phone || '—'}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                              {record.employee_role}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {isMarking ? (
                              <div className="w-5 h-5 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
                            ) : cfg ? (
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.color}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                                {record.status}
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500 italic">
                                Unmarked
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-1">
                              {STATUS_OPTIONS.map(s => {
                                const sCfg = statusConfig[s];
                                const isActive = record.status === s;
                                return (
                                  <button key={s}
                                    onClick={() => handleMarkStatus(record, s)}
                                    disabled={isMarking}
                                    className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                                      isActive
                                        ? `${sCfg.bg} ${sCfg.color} ring-1 ring-offset-0`
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}>
                                    {sCfg.emoji} {s}
                                  </button>
                                );
                              })}
                            </div>
                          </td>
                          {/* Check In column */}
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5">
                              <input
                                type="time"
                                value={checkInVal}
                                onChange={e => handleTimeChange(record, 'check_in', e.target.value)}
                                className="px-2 py-1.5 border border-gray-300 rounded-lg text-xs w-[100px] focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                              />
                              {!checkInVal && isToday && (
                                <button
                                  onClick={() => handleQuickTime(record, 'check_in')}
                                  className="px-2 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-medium hover:bg-emerald-100 transition-colors whitespace-nowrap"
                                  title="Set current time as check-in"
                                >
                                  Now
                                </button>
                              )}
                            </div>
                          </td>
                          {/* Check Out column */}
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5">
                              <input
                                type="time"
                                value={checkOutVal}
                                onChange={e => handleTimeChange(record, 'check_out', e.target.value)}
                                className="px-2 py-1.5 border border-gray-300 rounded-lg text-xs w-[100px] focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                              />
                              {checkInVal && !checkOutVal && isToday && (
                                <button
                                  onClick={() => handleQuickTime(record, 'check_out')}
                                  className="px-2 py-1.5 bg-orange-50 text-orange-700 border border-orange-200 rounded-lg text-xs font-medium hover:bg-orange-100 transition-colors whitespace-nowrap"
                                  title="Set current time as check-out"
                                >
                                  Now
                                </button>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => setNotesModal({ record, notes: record.notes || '' })}
                              className="flex items-center gap-1 text-xs text-indigo-600 hover:bg-indigo-50 px-2 py-1 rounded"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              {record.notes ? 'Edit' : 'Add'} Note
                            </button>
                            {record.notes && (
                              <p className="text-xs text-gray-500 mt-1 max-w-[150px] truncate">{record.notes}</p>
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
        </>
      ) : (
        /* Monthly Summary Tab */
        <>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">Monthly Attendance Summary — {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>
              <p className="text-sm text-gray-500 mt-0.5">Overview of attendance for all staff this month</p>
            </div>
            {summaryLoading ? (
              <div className="flex items-center justify-center h-48">
                <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : summary.length === 0 ? (
              <div className="flex items-center justify-center h-48">
                <div className="text-center">
                  <div className="text-4xl mb-3">📊</div>
                  <p className="text-gray-500 text-sm">No attendance data for this month yet.</p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-100">
                  <thead className="bg-gray-50">
                    <tr>
                      {['Employee', 'Role', 'Present', 'Absent', 'Half-Day', 'Late', 'Total Marked', 'Attendance %'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {summary.map(s => {
                      const pct = s.total_marked > 0 ? Math.round((Number(s.present_days) / Number(s.total_marked)) * 100) : 0;
                      return (
                        <tr key={s.employee_id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-semibold text-sm">
                                {s.employee_name.charAt(0).toUpperCase()}
                              </div>
                              <span className="font-medium text-gray-900 text-sm">{s.employee_name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded">{s.employee_role}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800">{s.present_days}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-red-100 text-red-800">{s.absent_days}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-800">{s.half_days}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-orange-100 text-orange-800">{s.late_days}</span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600 font-medium">{s.total_marked}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-gray-200 rounded-full h-1.5 min-w-[60px]">
                                <div
                                  className={`h-1.5 rounded-full ${pct >= 80 ? 'bg-emerald-500' : pct >= 60 ? 'bg-amber-500' : 'bg-red-500'}`}
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                              <span className="text-xs font-semibold text-gray-700">{pct}%</span>
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
        </>
      )}

      {/* Notes Modal */}
      {notesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <h3 className="text-base font-bold text-gray-900 mb-1">
              Add Note — {notesModal.record.employee_name}
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              {selectedDate} · {notesModal.record.status || 'Unmarked'}
            </p>
            <textarea
              value={notesModal.notes}
              onChange={e => setNotesModal(n => n ? { ...n, notes: e.target.value } : null)}
              rows={3}
              placeholder="e.g. Left early due to medical appointment..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none mb-4"
            />
            <div className="flex gap-3">
              <button onClick={() => setNotesModal(null)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
              <button onClick={handleSaveNotes} disabled={savingNotes}
                className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-semibold hover:bg-teal-700 disabled:opacity-60">
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
