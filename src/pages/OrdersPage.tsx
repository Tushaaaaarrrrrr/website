import React, { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { ArrowLeft, Receipt } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fetchStudentOrders } from '../services/orderService';
import type { WebsiteOrder } from '../types/app';
import { getOrderCourseNames } from '../utils/order';

export default function OrdersPage() {
  const { user, isManager } = useAuth();
  const [orders, setOrders] = useState<WebsiteOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || isManager) return;

    async function loadOrders() {
      try {
        setLoading(true);
        setError(null);
        setOrders(await fetchStudentOrders(user.id));
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load orders.';
        setError(message);
      } finally {
        setLoading(false);
      }
    }

    loadOrders();
  }, [isManager, user]);

  if (!user) {
    return null;
  }

  if (isManager) {
    return <Navigate to="/manager/orders" replace />;
  }

  return (
    <div className="min-h-screen bg-surface pt-24 px-6 relative">
      <div className="max-w-6xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-black/60 font-bold uppercase tracking-widest text-sm hover:text-primary mb-8 transition-colors">
          <ArrowLeft size={16} /> Return to Base
        </Link>

        <h1 className="text-5xl md:text-6xl font-black font-headline uppercase leading-tight mb-4 text-black">
          Order <span className="text-primary italic">History</span>
        </h1>
        <p className="text-black/70 font-bold mb-12 border-l-4 border-primary pl-6">
          Review all of your website purchases and their payment status.
        </p>

        {loading ? (
          <div className="text-primary font-black uppercase tracking-widest animate-pulse">Loading orders...</div>
        ) : error ? (
          <div className="brute-card bg-white p-8 text-red-600 font-bold border-4 border-red-500">{error}</div>
        ) : orders.length === 0 ? (
          <div className="brute-card bg-white p-12 text-center border-4 border-black/10 text-black/40 font-black uppercase">
            <Receipt size={48} className="mx-auto mb-4 opacity-50" />
            No website orders found
          </div>
        ) : (
          <div className="overflow-x-auto border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <table className="w-full text-left text-black">
              <thead className="text-xs uppercase font-black bg-black text-white tracking-widest">
                <tr>
                  <th className="px-6 py-4">Order ID</th>
                  <th className="px-6 py-4">Courses</th>
                  <th className="px-6 py-4">Payment Status</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b-2 border-black/10 font-bold">
                    <td className="px-6 py-4 font-mono text-sm">{order.orderId}</td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {getOrderCourseNames(order).map((courseName) => (
                          <div key={courseName}>{courseName}</div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 text-[11px] uppercase tracking-widest border-2 ${
                          order.paymentStatus === 'PAID'
                            ? 'border-green-600 text-green-700 bg-green-100'
                            : order.paymentStatus === 'FAILED'
                              ? 'border-red-600 text-red-700 bg-red-100'
                              : 'border-black text-black bg-surface'
                        }`}
                      >
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4">₹{order.amount}</td>
                    <td className="px-6 py-4">{new Date(order.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
