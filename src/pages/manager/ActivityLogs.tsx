import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Activity, RefreshCw } from 'lucide-react';

interface ActivityLog {
  id: string;
  userId: string | null;
  email: string | null;
  action: string;
  courseId: string | null;
  metadata: any;
  timestamp: string;
}

export default function ActivityLogs() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [filterAction, setFilterAction] = useState<string>('ALL');
  const [filterEmail, setFilterEmail] = useState<string>('');

  const fetchLogs = async () => {
    setLoading(true);
    let query = supabase.from('activity_logs').select('*').order('timestamp', { ascending: false }).limit(100);
    
    if (filterAction !== 'ALL') query = query.eq('action', filterAction);
    if (filterEmail) query = query.ilike('email', `%${filterEmail}%`);

    const { data, error } = await query;
    if (!error && data) {
      setLogs(data as ActivityLog[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLogs();
  }, [filterAction, filterEmail]); // auto filter

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-black uppercase text-white mb-2 flex items-center gap-3">
            <Activity className="text-primary" /> Event <span className="text-primary italic">Logs</span>
          </h2>
          <p className="text-white/60 font-bold">Monitor platform transactions and system events.</p>
        </div>
        <button onClick={fetchLogs} className="p-2 bg-white/5 text-white/50 hover:bg-white/10 hover:text-white transition-colors border-2 border-transparent hover:border-white/20" title="Refresh">
          <RefreshCw size={20} className={loading ? "animate-spin text-primary" : ""} />
        </button>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-4">
        <select 
          value={filterAction} 
          onChange={(e) => setFilterAction(e.target.value)}
          className="bg-black border-2 border-white/20 text-white p-2 font-bold text-sm tracking-widest uppercase outline-none focus:border-primary transition-colors"
        >
          <option value="ALL">ALL EVENTS</option>
          <option value="PURCHASE">PURCHASE (Success)</option>
          <option value="VISIT_CHECKOUT">VISIT CHECKOUT</option>
          <option value="PAYMENT_FAILED">PAYMENT FAILED</option>
          <option value="SUPPORT_TICKET">SUPPORT TICKET</option>
        </select>
        <input 
          type="text" 
          placeholder="Filter by Email..." 
          value={filterEmail}
          onChange={(e) => setFilterEmail(e.target.value)}
          className="bg-black border-2 border-white/20 text-white p-2 font-bold text-sm outline-none focus:border-primary transition-colors w-64"
        />
      </div>

      <div className="overflow-x-auto border-2 border-white/10 bg-black shadow-[4px_4px_0px_0px_rgba(255,255,255,0.05)]">
        <table className="w-full text-left text-white">
          <thead className="text-xs uppercase font-black bg-primary/20 text-white/80 border-b-2 border-white/10">
            <tr>
              <th className="px-6 py-4">Timestamp</th>
              <th className="px-6 py-4">Action Event</th>
              <th className="px-6 py-4">User Email</th>
              <th className="px-6 py-4">Course Ref</th>
              <th className="px-6 py-4">Metadata</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-b border-white/5 hover:bg-white/5 transition-colors font-mono text-xs">
                <td className="px-6 py-4 opacity-70">
                  {new Date(log.timestamp).toLocaleString()}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 font-black uppercase tracking-widest ${
                    log.action === 'PURCHASE' ? 'bg-green-500/20 text-green-400 border border-green-500/50' :
                    log.action === 'PAYMENT_FAILED' ? 'bg-red-500/20 text-red-400 border border-red-500/50' :
                    log.action === 'VISIT_CHECKOUT' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50' :
                    'bg-white/10 text-white/70 border border-white/20'
                  }`}>
                    {log.action}
                  </span>
                </td>
                <td className="px-6 py-4 font-bold">{log.email || 'Anonymous'}</td>
                <td className="px-6 py-4 opacity-70">{log.courseId || '---'}</td>
                <td className="px-6 py-4 truncate max-w-xs opacity-50" title={JSON.stringify(log.metadata)}>
                  {log.metadata ? JSON.stringify(log.metadata) : '---'}
                </td>
              </tr>
            ))}
            {logs.length === 0 && !loading && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-white/40 font-bold uppercase tracking-widest">No Events Found matching criteria</td>
              </tr>
            )}
            {loading && logs.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-primary font-black uppercase animate-pulse">Loading Telemetry...</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
