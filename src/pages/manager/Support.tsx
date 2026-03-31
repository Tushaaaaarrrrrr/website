import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { MessageSquare, CheckCircle, AlertCircle, X } from 'lucide-react';
import BruteButton from '../../components/BruteButton';

interface SupportTicket {
  id: string;
  email: string;
  subject: string;
  message: string;
  status: 'OPEN' | 'CLOSED' | 'RESOLVED';
  createdAt: string;
}

export default function Support() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);

  const fetchTickets = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('support_tickets')
      .select('*')
      .order('status', { ascending: false }) // 'OPEN' comes before 'CLOSED' alphabetically
      .order('createdAt', { ascending: false });
      
    if (!error && data) setTickets(data as SupportTicket[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    const { error } = await supabase.from('support_tickets').update({ status: newStatus }).eq('id', id);
    if (!error) {
      if (selectedTicket?.id === id) setSelectedTicket({ ...selectedTicket, status: newStatus as any });
      await fetchTickets();
    } else {
      alert("Failed to update status");
    }
  };

  return (
    <div>
      <h2 className="text-3xl font-black uppercase text-white mb-2 flex items-center gap-3">
        <MessageSquare className="text-primary" /> Support <span className="text-primary italic">Desk</span>
      </h2>
      <p className="text-white/60 font-bold mb-8">Manage incoming user queries.</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ticket List */}
        <div className="lg:col-span-1 bg-black border-2 border-white/10 max-h-[70vh] overflow-y-auto">
          {loading && <div className="p-6 text-primary font-black uppercase tracking-widest animate-pulse">Scanning...</div>}
          {!loading && tickets.length === 0 && <div className="p-6 text-white/40 font-bold uppercase">No Tickets Active</div>}
          
          {tickets.map(ticket => (
            <div 
              key={ticket.id} 
              onClick={() => setSelectedTicket(ticket)}
              className={`p-4 border-b border-white/5 cursor-pointer transition-colors hover:bg-white/5 ${selectedTicket?.id === ticket.id ? 'bg-primary/10 border-l-4 border-l-primary' : 'border-l-4 border-l-transparent'}`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 border ${ticket.status === 'OPEN' ? 'border-red-500 text-red-500 bg-red-500/10' : 'border-green-500 text-green-500 bg-green-500/10'}`}>
                  {ticket.status}
                </span>
                <span className="text-xs text-white/40 font-mono">{new Date(ticket.createdAt).toLocaleDateString()}</span>
              </div>
              <h4 className="font-bold text-white truncate text-sm">{ticket.subject}</h4>
              <p className="text-xs text-white/50 truncate font-mono mt-1">{ticket.email}</p>
            </div>
          ))}
        </div>

        {/* Selected Ticket View */}
        <div className="lg:col-span-2">
          {selectedTicket ? (
             <div className="bg-surface border-2 border-black p-8 text-black sticky top-6 shadow-[8px_8px_0px_0px_rgba(255,255,255,0.1)]">
               <div className="flex justify-between items-start mb-6 pb-6 border-b-2 border-black/10">
                 <div>
                   <h3 className="text-2xl font-black uppercase leading-tight mb-2">{selectedTicket.subject}</h3>
                   <div className="flex items-center gap-4 text-sm font-bold opacity-60">
                     <span>From: {selectedTicket.email}</span>
                     <span>•</span>
                     <span className="font-mono">{new Date(selectedTicket.createdAt).toLocaleString()}</span>
                   </div>
                 </div>
                 <button onClick={() => setSelectedTicket(null)} className="p-2 hover:bg-black/5 rounded-full transition-colors border border-transparent hover:border-black/20">
                   <X size={20} />
                 </button>
               </div>

               <div className="font-mono text-sm leading-relaxed whitespace-pre-wrap bg-white border-2 border-black/10 p-6 min-h-[200px] mb-8">
                 {selectedTicket.message}
               </div>

               <div className="flex items-center justify-between mt-auto">
                 <div className="flex items-center gap-2">
                   {selectedTicket.status === 'OPEN' ? (
                     <AlertCircle className="text-primary" />
                   ) : (
                     <CheckCircle className="text-green-500" />
                   )}
                   <span className="font-black uppercase tracking-widest text-sm text-black/60">
                     Status: {selectedTicket.status}
                   </span>
                 </div>
                 
                 {selectedTicket.status === 'OPEN' ? (
                   <div className="flex gap-4">
                     <BruteButton variant="primary" onClick={() => handleUpdateStatus(selectedTicket.id, 'RESOLVED')}>
                       Mark Resolved
                     </BruteButton>
                   </div>
                 ) : (
                   <button onClick={() => handleUpdateStatus(selectedTicket.id, 'OPEN')} className="text-sm font-bold uppercase border-2 border-black px-4 py-2 hover:bg-black hover:text-white transition-colors">
                     Reopen Issue
                   </button>
                 )}
               </div>
             </div>
          ) : (
            <div className="h-full min-h-[400px] border-2 border-dashed border-white/20 flex flex-col items-center justify-center text-white/40 uppercase font-black tracking-widest">
              <MessageSquare size={48} className="mb-4 opacity-50" />
              Select a ticket to view details
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
