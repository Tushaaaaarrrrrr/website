import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { MessageSquare, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function SupportHistory() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTickets() {
      if (!user) return;
      setLoading(true);
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('userId', user.id)
        .order('createdAt', { ascending: false });
        
      if (!error && data) setTickets(data);
      setLoading(false);
    }
    fetchTickets();
  }, [user]);

  if (!user) return <div className="min-h-screen bg-black text-white p-12 text-center uppercase font-black text-2xl">Access Denied</div>;

  return (
    <div className="min-h-screen bg-surface pt-24 px-6 relative">
      <div className="max-w-4xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-black/60 font-bold uppercase tracking-widest text-sm hover:text-primary mb-8 transition-colors">
          <ArrowLeft size={16} /> Return to Base
        </Link>
        
        <h1 className="text-5xl md:text-6xl font-black font-headline uppercase leading-tight mb-4 text-black">
          Support <span className="text-primary italic">History</span>
        </h1>
        <p className="text-black/70 font-bold mb-12 border-l-4 border-primary pl-6">
          Track the status of your reported issues and communication with the industrial team.
        </p>

        {loading ? (
          <div className="text-primary font-black uppercase tracking-widest animate-pulse">Scanning Archive...</div>
        ) : tickets.length === 0 ? (
          <div className="brute-card bg-white p-12 text-center border-4 border-black/10 text-black/40 font-black uppercase">
            <MessageSquare size={48} className="mx-auto mb-4 opacity-50" />
            No Support Logs Found
          </div>
        ) : (
          <div className="space-y-6">
            {tickets.map(ticket => (
              <div key={ticket.id} className="brute-card bg-white p-6 md:p-8 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden group">
                <div className={`absolute top-0 right-0 p-4 border-b-4 border-l-4 border-black font-black uppercase text-sm tracking-widest ${
                  ticket.status === 'OPEN' ? 'bg-primary text-white' : 
                  ticket.status === 'RESOLVED' ? 'bg-green-500 text-white' : 
                  'bg-black/10 text-black/60'
                }`}>
                  {ticket.status}
                </div>

                <div className="mb-6 max-w-[80%]">
                   <h3 className="text-2xl font-black uppercase text-black leading-tight mb-2">{ticket.subject}</h3>
                   <div className="flex items-center gap-4 text-xs font-bold font-mono text-black/50">
                     <span>TKN: {ticket.id.slice(0,8)}</span>
                     <span>•</span>
                     <span>{new Date(ticket.createdAt).toLocaleString()}</span>
                   </div>
                </div>

                <div className="bg-surface border-2 border-black/10 p-4 sm:p-6 font-mono text-sm leading-relaxed whitespace-pre-wrap text-black/80 shadow-inner">
                  {ticket.message}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
