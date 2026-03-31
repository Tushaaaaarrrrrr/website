import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ManagerRoute = () => {
  const { user, profile, loading } = useAuth();

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-black text-primary font-black uppercase text-2xl animate-pulse">Checking Authorization...</div>;

  if (!user || profile?.role !== 'MANAGER') {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ManagerRoute;
