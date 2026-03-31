import React, { useEffect, useState } from 'react';
import { RefreshCw, Receipt } from 'lucide-react';
import { fetchWebsiteOrders } from '../../services/orderService';
import type { WebsiteOrder } from '../../types/app';
import { getOrderCourseNames } from '../../utils/order';

export default function Orders() {
  const [orders, setOrders] = useState<WebsiteOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  const loadOrders = async () => {
    try {
      setLoading(true);
      setOrders(await fetchWebsiteOrders());
    } catch (error) {
      console.error('Failed to fetch website orders', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const filteredOrders = orders.filter((order) => {
    if (!filter.trim()) return true;

    const query = filter.trim().toLowerCase();

    return [
      order.userName || '',
      order.userEmail,
      getOrderCourseNames(order).join(' '),
      order.orderId,
      order.paymentStatus,
    ].some((value) => value.toLowerCase().includes(query));
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6 gap-4">
        <div>
          <h2 className="text-3xl font-black uppercase text-white mb-2 flex items-center gap-3">
            <Receipt className="text-primary" /> Website <span className="text-primary italic">Orders</span>
          </h2>
          <p className="text-white/60 font-bold">Track website purchases only. LMS-originated orders are excluded.</p>
        </div>
        <button
          onClick={loadOrders}
          className="p-2 bg-white/5 text-white/50 hover:bg-white/10 hover:text-white transition-colors border-2 border-transparent hover:border-white/20"
          title="Refresh"
        >
          <RefreshCw size={20} className={loading ? 'animate-spin text-primary' : ''} />
        </button>
      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Filter by user, email, course, or order ID"
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
          className="bg-black border-2 border-white/20 text-white p-3 font-bold text-sm outline-none focus:border-primary transition-colors w-full max-w-md"
        />
      </div>

      <div className="overflow-x-auto border-2 border-white/10 bg-black shadow-[4px_4px_0px_0px_rgba(255,255,255,0.05)]">
        <table className="w-full text-left text-white">
          <thead className="text-xs uppercase font-black bg-primary/20 text-white/80 border-b-2 border-white/10">
            <tr>
              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Course</th>
              <th className="px-6 py-4">Order ID</th>
              <th className="px-6 py-4">Payment Status</th>
              <th className="px-6 py-4">Amount</th>
              <th className="px-6 py-4">Date</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => (
              <tr key={order.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                <td className="px-6 py-4 font-bold">{order.userName || '---'}</td>
                <td className="px-6 py-4 font-mono text-sm opacity-80">{order.userEmail}</td>
                <td className="px-6 py-4">
                  <div className="space-y-1">
                    {getOrderCourseNames(order).map((courseName) => (
                      <div key={courseName}>{courseName}</div>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 font-mono text-xs opacity-70">{order.orderId}</td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 text-[10px] font-black uppercase tracking-widest ${
                      order.paymentStatus === 'PAID'
                        ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                        : order.paymentStatus === 'FAILED'
                          ? 'bg-red-500/20 text-red-400 border border-red-500/50'
                          : 'bg-white/10 text-white/70 border border-white/20'
                    }`}
                  >
                    {order.paymentStatus}
                  </span>
                </td>
                <td className="px-6 py-4">₹{order.amount}</td>
                <td className="px-6 py-4 opacity-70">{new Date(order.createdAt).toLocaleString()}</td>
              </tr>
            ))}
            {!loading && filteredOrders.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-white/40 font-bold uppercase tracking-widest">
                  No website orders found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
