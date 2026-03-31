import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

interface Profile {
  id: string;
  email: string;
  name: string;
  phone: string;
  gender: string;
  role: string;
}

export default function Users() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUsers() {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, name, phone, gender, role')
        .order('name');
        
      if (!error && data) {
        setUsers(data as Profile[]);
      }
      setLoading(false);
    }
    
    fetchUsers();
  }, []);

  return (
    <div>
      <h2 className="text-3xl font-black uppercase text-white mb-6">User <span className="text-primary italic">Directory</span></h2>
      <p className="text-white/60 font-bold mb-8">View-only access to platform members.</p>

      {loading ? (
        <div className="animate-pulse text-white/50 uppercase font-black text-sm">Fetching...</div>
      ) : (
        <div className="overflow-x-auto border-2 border-white/10 bg-black">
          <table className="w-full text-left text-white">
            <thead className="text-xs uppercase font-black bg-primary/20 text-white/80 border-b-2 border-white/10">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Phone</th>
                <th className="px-6 py-4">Gender</th>
                <th className="px-6 py-4">Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 font-bold">{user.name || '---'}</td>
                  <td className="px-6 py-4 font-mono text-sm opacity-80">{user.email || '---'}</td>
                  <td className="px-6 py-4 font-mono text-sm opacity-80">{user.phone || '---'}</td>
                  <td className="px-6 py-4 text-xs tracking-widest uppercase">{user.gender || '---'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-[10px] font-black uppercase tracking-widest ${user.role === 'MANAGER' ? 'bg-primary/20 text-primary border border-primary' : 'bg-white/10 text-white/70'}`}>
                      {user.role}
                    </span>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-white/40 font-bold uppercase tracking-widest">No Members Found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
