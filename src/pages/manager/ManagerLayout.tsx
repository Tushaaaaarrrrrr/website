import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Users, BookOpen, Activity, MessageSquare } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const NAV_ITEMS = [
  { path: '/manager', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { path: '/manager/users', label: 'Users', icon: Users },
  { path: '/manager/courses', label: 'Courses', icon: BookOpen },
  { path: '/manager/activity', label: 'Activity Logs', icon: Activity },
  { path: '/manager/support', label: 'Support', icon: MessageSquare },
];

function ManagerLayout() {
  const { profile } = useAuth();
  
  return (
    <div className="min-h-screen bg-black text-surface flex flex-col md:flex-row pt-20">
      {/* Sidebar */}
      <aside className="w-full md:w-64 border-b-4 md:border-b-0 md:border-r-4 border-primary/20 bg-surface/5 flex flex-col p-6 overflow-y-auto shrink-0">
        <div className="mb-8">
          <h2 className="text-xl font-black uppercase tracking-tighter text-white">
            Manager <span className="text-primary italic">Panel</span>
          </h2>
          <p className="text-xs uppercase font-bold text-white/50 tracking-widest mt-1">
            Access: {profile?.role}
          </p>
        </div>

        <nav className="flex flex-col gap-2">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.exact}
              className={({ isActive }) =>
                `flex items-center gap-3 p-3 font-bold uppercase text-sm border-l-4 transition-all ${
                  isActive
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-transparent text-white/60 hover:border-white/20 hover:text-white hover:bg-white/5'
                }`
              }
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-12 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}

export default ManagerLayout;
