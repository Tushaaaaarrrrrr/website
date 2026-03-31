import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { MessageSquare, X, Send } from 'lucide-react';
import BruteButton from './BruteButton';

export default function SupportWidget() {
  const { user, profile } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({ subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) return alert('Please sign in to submit a ticket.');
    
    setLoading(true);
    const { error } = await supabase.from('support_tickets').insert([{
      userId: user.id,
      email: profile.email,
      subject: formData.subject,
      message: formData.message,
    }]);

    setLoading(false);
    if (!error) {
      setSuccess(true);
      setTimeout(() => {
        setIsOpen(false);
        setSuccess(false);
        setFormData({ subject: '', message: '' });
      }, 3000);
    } else {
      alert('Failed to submit ticket. Please try again.');
    }
  };

  if (!user || profile?.role === 'MANAGER') return null; // Managers use the manager panel

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-[90] w-16 h-16 bg-primary text-white flex items-center justify-center rounded-full shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-black hover:scale-110 transition-transform hover:bg-black"
        title="Get Support"
      >
        <MessageSquare size={28} />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/80 sm:p-4 backdrop-blur-sm">
          <div className="bg-surface w-full sm:w-[500px] max-h-[90vh] overflow-y-auto border-t-4 sm:border-4 border-black relative shadow-[8px_8px_0px_0px_rgba(206,18,52,1)] p-8">
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-2 bg-black text-white hover:bg-primary transition-colors border-2 border-transparent hover:border-black"
            >
              <X size={20} />
            </button>

            <h3 className="text-3xl font-black uppercase mb-2">Alpha <span className="text-primary italic">Support</span></h3>
            <p className="text-black/60 font-bold text-sm mb-6 border-b-2 border-black/10 pb-4">
              Need assistance? Submit a ticket and our industrial team will respond shortly.
            </p>

            {success ? (
              <div className="bg-green-100 border-2 border-green-500 p-6 text-center">
                <div className="w-16 h-16 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-black text-3xl font-black">✓</div>
                <h4 className="text-xl font-black uppercase text-green-800">Transmission Secured</h4>
                <p className="font-bold text-green-700/80 uppercase tracking-widest text-xs mt-2">Your ticket has been logged.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest mb-1">Subject</label>
                  <input 
                    required 
                    className="w-full border-2 border-black bg-white p-3 font-bold text-sm focus:border-primary focus:outline-none transition-colors"
                    placeholder="e.g. Payment Issue, Course Access"
                    value={formData.subject}
                    onChange={e => setFormData({...formData, subject: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest mb-1">Message Description</label>
                  <textarea 
                    required 
                    rows={5}
                    className="w-full border-2 border-black bg-white p-3 font-bold text-sm focus:border-primary focus:outline-none transition-colors"
                    placeholder="Provide details about your query..."
                    value={formData.message}
                    onChange={e => setFormData({...formData, message: e.target.value})}
                  />
                </div>
                <BruteButton variant="primary" type="submit" className="w-full py-4 flex justify-center items-center gap-2" disabled={loading}>
                  {loading ? 'Transmitting...' : <><Send size={18} /> Submit Query</>}
                </BruteButton>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
