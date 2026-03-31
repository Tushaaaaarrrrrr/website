import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Users, BookOpen, Activity, MessageSquare, Receipt } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState({
    users: 0,
    courses: 0,
    orders: 0,
    activity: 0,
    support: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      // Best effort counting for the dashboard
      setLoading(true);
      try {
        const [
          { count: usersCount },
          { count: coursesCount },
          { count: ordersCount },
          { count: activityCount },
          { count: supportCount }
        ] = await Promise.all([
          supabase.from('profiles').select('*', { count: 'exact', head: true }),
          supabase.from('courses').select('*', { count: 'exact', head: true }),
          supabase.from('website_orders').select('*', { count: 'exact', head: true }),
          supabase.from('activity_logs').select('*', { count: 'exact', head: true }),
          supabase.from('support_tickets').select('*', { count: 'exact', head: true }).eq('status', 'OPEN')
        ]);

        setStats({
          users: usersCount || 0,
          courses: coursesCount || 0,
          orders: ordersCount || 0,
          activity: activityCount || 0,
          support: supportCount || 0,
        });
      } catch (error) {
        console.error("Failed to fetch dashboard stats", error);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) return <div className="animate-pulse text-white uppercase font-black">Loading Intelligence...</div>;

  return (
    <div>
      <h1 className="text-4xl font-black uppercase mb-8 text-white">System <span className="text-primary italic">Overview</span></h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Members', value: stats.users, icon: Users },
          { label: 'Active Courses', value: stats.courses, icon: BookOpen },
          { label: 'Website Orders', value: stats.orders, icon: Receipt },
          { label: 'System Logs', value: stats.activity, icon: Activity },
          { label: 'Open Tickets', value: stats.support, icon: MessageSquare, highlight: stats.support > 0 }
        ].map((stat, i) => (
          <div key={i} className="bg-surface/10 border-2 border-white/10 p-6 shadow-[4px_4px_0px_0px_rgba(255,255,255,0.05)]">
            <div className="flex justify-between items-start mb-4">
              <stat.icon size={24} className={stat.highlight ? "text-primary animate-pulse" : "text-white/50"} />
            </div>
            <div className="text-4xl font-black text-white">{stat.value}</div>
            <div className="text-sm font-bold uppercase tracking-widest text-white/40 mt-2">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
