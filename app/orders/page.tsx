'use client';

import { Package, Search, Filter, Eye, Download, RefreshCw } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useLocale } from '@/context/LocaleContext';
import { translations } from '@/translations';

export default function OrdersPage() {
  const { locale } = useLocale();
  const t = translations[locale];
  const [filter, setFilter] = useState('all');
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/korea/orders')
      .then(r => r.json())
      .then(data => setOrders(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  const _staticOrders = [
    {
      id: 'ORD-2024-001',
      date: '2026-02-10', 
      product: 'Wireless Headphones', 
      quantity: 1, 
      total: '$129.99', 
      status: 'Delivered',
      tracking: 'TRK123456789'
    },
    { 
      id: 'ORD-2024-002', 
      date: '2026-02-12', 
      product: 'Smart Watch', 
      quantity: 1, 
      total: '$299.99', 
      status: 'In Transit',
      tracking: 'TRK987654321'
    },
    { 
      id: 'ORD-2024-003', 
      date: '2026-02-13', 
      product: 'Laptop Stand', 
      quantity: 2, 
      total: '$99.98', 
      status: 'Processing',
      tracking: 'Pending'
    },
    { 
      id: 'ORD-2024-004', 
      date: '2026-02-14', 
      product: 'USB-C Cable', 
      quantity: 3, 
      total: '$59.97', 
      status: 'Delivered',
      tracking: 'TRK456789123'
    },
    { 
      id: 'ORD-2024-005', 
      date: '2026-02-08', 
      product: 'Wireless Mouse', 
      quantity: 1, 
      total: '$39.99', 
      status: 'Cancelled',
      tracking: 'N/A'
    },
  ];

  const filteredOrders = filter === 'all' ? orders : orders.filter((o: any) => o.status === filter);

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{t.myOrders}</h1>
        <p className="text-gray-600">{t.trackManageOrders}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: t.allOrders, value: '24', color: 'bg-blue-500' },
          { label: t.delivered, value: '18', color: 'bg-green-500' },
          { label: t.inTransit, value: '3', color: 'bg-yellow-500' },
          { label: t.cancelled, value: '3', color: 'bg-red-500' },
        ].map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm p-4">
            <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center mb-3`}>
              <Package className="w-5 h-5 text-white" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            <div className="text-sm text-gray-600">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={t.searchOrdersPlaceholder}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
          >
            <option value="all">{t.allStatus}</option>
            <option value="delivered">{t.delivered}</option>
            <option value="transit">{t.inTransit}</option>
            <option value="processing">{t.processing}</option>
            <option value="cancelled">{t.cancelled}</option>
          </select>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Filter className="w-4 h-4" />
            {t.filter}
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t.orderId}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t.date}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t.product}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t.quantity}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t.total}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t.status}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t.tracking}
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t.actions}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredOrders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{order.id}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-600">{order.date}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">{order.product}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-600">{order.quantity}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{order.total}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                    order.status === 'In Transit' ? 'bg-blue-100 text-blue-800' :
                    order.status === 'Processing' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-600">{order.tracking}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button className="text-primary hover:text-primary/80 mr-3">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button className="text-gray-600 hover:text-gray-900 mr-3">
                    <Download className="w-4 h-4" />
                  </button>
                  {order.status === 'In Transit' && (
                    <button className="text-blue-600 hover:text-blue-900">
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
