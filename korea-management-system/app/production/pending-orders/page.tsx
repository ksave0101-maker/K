'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from '@/lib/LocaleContext';
import { translations } from '@/lib/translations';
import CountryFlag from '@/components/CountryFlag';
import LanguageSwitcher from '@/components/LanguageSwitcher';

interface ProductItem {
  name: string;
  code: string;
  quantity: number;
  unit: string;
  description?: string;
}

interface Order {
  id: string;
  orderNumber: string;
  branch: 'Korea' | 'Brunei' | 'Thailand' | 'Vietnam';
  branchCode: 'KR' | 'BN' | 'TH' | 'VN';
  product: string;
  quantity: number;
  status: 'pending' | 'in-progress' | 'ready';
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
  customerName: string;
  orderDate: string;
  productionNote?: string;
  items: ProductItem[];
}

export default function PendingOrdersPage() {
  const router = useRouter();
  const { locale } = useLocale();
  const t = translations[locale];
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [completedItems, setCompletedItems] = useState<Set<string>>(new Set());

  // Sample data
  const [orders] = useState<Order[]>([
    {
      id: '1',
      orderNumber: 'PO-2026-001',
      branch: 'Korea',
      branchCode: 'KR',
      product: 'Energy Saving System Model A-2024',
      quantity: 50,
      status: 'in-progress',
      dueDate: '2026-02-20',
      priority: 'high',
      customerName: 'Seoul Energy Corp.',
      orderDate: '2026-02-10',
      productionNote: 'Urgent order - expedite production',
      items: [
        { name: 'Main Control Unit', code: 'MCU-A2024', quantity: 50, unit: 'pcs', description: 'Central processing unit' },
        { name: 'Power Module', code: 'PM-500W', quantity: 50, unit: 'pcs', description: '500W power supply' },
        { name: 'Display Panel', code: 'DP-LCD7', quantity: 50, unit: 'pcs', description: '7-inch LCD touchscreen' },
        { name: 'Sensor Array', code: 'SA-V3', quantity: 50, unit: 'sets', description: 'Temperature & humidity sensors' },
        { name: 'Mounting Kit', code: 'MK-STD', quantity: 50, unit: 'sets', description: 'Standard wall mount' },
      ]
    },
    {
      id: '2',
      orderNumber: 'PO-2026-002',
      branch: 'Thailand',
      branchCode: 'TH',
      product: 'Solar Panel Controller Pro',
      quantity: 100,
      status: 'pending',
      dueDate: '2026-02-25',
      priority: 'medium',
      customerName: 'Bangkok Solar Solutions',
      orderDate: '2026-02-12',
      items: [
        { name: 'Controller Board', code: 'CB-SOLAR-PRO', quantity: 100, unit: 'pcs' },
        { name: 'Cooling Fan', code: 'CF-12V', quantity: 100, unit: 'pcs' },
        { name: 'Cable Harness', code: 'CH-SOLAR', quantity: 100, unit: 'sets' },
        { name: 'Enclosure', code: 'ENC-IP65', quantity: 100, unit: 'pcs' },
      ]
    },
    {
      id: '3',
      orderNumber: 'PO-2026-003',
      branch: 'Brunei',
      branchCode: 'BN',
      product: 'Energy Monitor Display X500',
      quantity: 30,
      status: 'in-progress',
      dueDate: '2026-02-18',
      priority: 'high',
      customerName: 'Brunei Smart Home Ltd.',
      orderDate: '2026-02-08',
      productionNote: 'VIP customer - premium packaging required',
      items: [
        { name: 'Display Unit X500', code: 'DU-X500', quantity: 30, unit: 'pcs' },
        { name: 'Wireless Module', code: 'WM-5GHz', quantity: 30, unit: 'pcs' },
        { name: 'Power Adapter', code: 'PA-12V2A', quantity: 30, unit: 'pcs' },
        { name: 'Premium Box', code: 'BOX-PREM', quantity: 30, unit: 'pcs' },
      ]
    },
    {
      id: '4',
      orderNumber: 'PO-2026-004',
      branch: 'Vietnam',
      branchCode: 'VN',
      product: 'Smart Energy Hub',
      quantity: 75,
      status: 'pending',
      dueDate: '2026-03-01',
      priority: 'low',
      customerName: 'Hanoi Tech Distribution',
      orderDate: '2026-02-13',
      items: [
        { name: 'Hub Main Board', code: 'HMB-2026', quantity: 75, unit: 'pcs' },
        { name: 'Antennas', code: 'ANT-DUAL', quantity: 150, unit: 'pcs' },
        { name: 'Power Supply', code: 'PS-24V', quantity: 75, unit: 'pcs' },
        { name: 'Standard Packaging', code: 'PKG-STD', quantity: 75, unit: 'sets' },
      ]
    },
    {
      id: '5',
      orderNumber: 'PO-2026-005',
      branch: 'Thailand',
      branchCode: 'TH',
      product: 'Wireless Sensor Module',
      quantity: 200,
      status: 'pending',
      dueDate: '2026-02-28',
      priority: 'medium',
      customerName: 'Chiang Mai Industrial',
      orderDate: '2026-02-14',
      items: [
        { name: 'Sensor PCB', code: 'PCB-SENS-V2', quantity: 200, unit: 'pcs' },
        { name: 'Battery Holder', code: 'BH-CR2032', quantity: 200, unit: 'pcs' },
        { name: 'Plastic Casing', code: 'CS-WS-WHT', quantity: 200, unit: 'pcs' },
        { name: 'CR2032 Battery', code: 'BAT-CR2032', quantity: 200, unit: 'pcs' },
      ]
    },
  ]);

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      'in-progress': 'bg-blue-100 text-blue-800',
      ready: 'bg-green-100 text-green-800'
    };
    
    const labels = {
      pending: locale === 'ko' ? '대기 중' : 'Pending',
      'in-progress': locale === 'ko' ? '생산 중' : 'In Progress',
      ready: locale === 'ko' ? '준비 완료' : 'Ready'
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const styles = {
      high: 'bg-red-100 text-red-800',
      medium: 'bg-orange-100 text-orange-800',
      low: 'bg-gray-100 text-gray-800'
    };
    
    const labels = {
      high: locale === 'ko' ? '높음' : 'High',
      medium: locale === 'ko' ? '중간' : 'Medium',
      low: locale === 'ko' ? '낮음' : 'Low'
    };

    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${styles[priority as keyof typeof styles]}`}>
        {labels[priority as keyof typeof labels]}
      </span>
    );
  };

  const groupedOrders = orders.reduce((acc, order) => {
    if (!acc[order.branch]) acc[order.branch] = [];
    acc[order.branch].push(order);
    return acc;
  }, {} as Record<string, Order[]>);

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
    // Reset completed items when closing modal
    setCompletedItems(new Set());
  };

  const handleStartProduction = () => {
    if (selectedOrder) {
      const totalItems = selectedOrder.items.length;
      const completedCount = selectedOrder.items.filter(item => isItemCompleted(item.code)).length;
      const progressPercent = Math.round((completedCount / totalItems) * 100);
      
      if (completedCount === 0) {
        alert(
          locale === 'ko' 
            ? `경고: 생산을 시작하기 전에 최소 1개 이상의 품목을 확인해주세요.` 
            : `Warning: Please confirm at least 1 item before starting production.`
        );
        return;
      }
      
      const message = locale === 'ko'
        ? `주문번호: ${selectedOrder.orderNumber}\n\n완료된 품목: ${completedCount}/${totalItems} (${progressPercent}%)\n\n${completedCount === totalItems ? '모든 품목이 확인되었습니다! ' : ''}생산을 시작하시겠습니까?`
        : `Order: ${selectedOrder.orderNumber}\n\nCompleted Items: ${completedCount}/${totalItems} (${progressPercent}%)\n\n${completedCount === totalItems ? 'All items confirmed! ' : ''}Proceed with production?`;
      
      if (confirm(message)) {
        // TODO: Add actual API call to update order status
        alert(
          locale === 'ko' 
            ? `생산이 시작되었습니다!` 
            : `Production has been started!`
        );
        closeModal();
      }
    }
  };

  const toggleItemCompletion = (itemCode: string) => {
    setCompletedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemCode)) {
        newSet.delete(itemCode);
      } else {
        newSet.add(itemCode);
      }
      return newSet;
    });
  };

  const isItemCompleted = (itemCode: string) => completedItems.has(itemCode);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      {/* Header */}
      <div className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/production/dashboard')}
              className="text-orange-600 hover:text-orange-800"
            >
              ← {t.back}
            </button>
            <div className="border-l-2 border-gray-300 pl-4">
              <h1 className="text-2xl font-bold text-gray-800">
                {t.pendingProductionOrdersByBranch}
              </h1>
              <p className="text-sm text-gray-600">
                {locale === 'ko' ? '각 지점별 생산 대기 주문 관리' : 'Manage production orders by branch'}
              </p>
            </div>
          </div>
          <div>
            <LanguageSwitcher />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {Object.entries(groupedOrders).map(([branch, branchOrders]) => (
            <div key={branch} className="bg-white rounded-lg shadow-md p-4">
              <div className="flex items-center gap-3 mb-2">
                <CountryFlag 
                  country={branchOrders[0].branchCode} 
                  size="md" 
                />
                <span className="font-semibold text-gray-800">{branch}</span>
              </div>
              <p className="text-2xl font-bold text-orange-600">{branchOrders.length}</p>
              <p className="text-xs text-gray-600">{t.totalOrders}</p>
            </div>
          ))}
        </div>

        {/* Orders by Branch */}
        <div className="space-y-6">
          {Object.entries(groupedOrders).map(([branch, branchOrders]) => (
            <div key={branch} className="bg-white rounded-xl shadow-md overflow-hidden">
              {/* Branch Header */}
              <div className="bg-gradient-to-r from-orange-500 to-red-500 px-6 py-4">
                <div className="flex items-center gap-3">
                  <CountryFlag 
                    country={branchOrders[0].branchCode} 
                    size="lg" 
                  />
                  <div>
                    <h2 className="text-xl font-bold text-white">{branch}</h2>
                    <p className="text-sm text-orange-100">
                      {branchOrders.length} {t.totalOrders}
                    </p>
                  </div>
                </div>
              </div>

              {/* Orders Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t.orderNumber}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t.product}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t.quantity}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t.dueDate}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {locale === 'ko' ? '우선순위' : 'Priority'}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t.status}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t.actions}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {branchOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-gray-900">
                            {order.orderNumber}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-900">{order.product}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900">{order.quantity}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900">{order.dueDate}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getPriorityBadge(order.priority)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(order.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button 
                            onClick={() => handleViewDetails(order)}
                            className="text-orange-600 hover:text-orange-900 font-medium hover:underline"
                          >
                            {locale === 'ko' ? '상세보기' : 'View Details'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Order Details Modal */}
      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-orange-500 to-red-500 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CountryFlag country={selectedOrder.branchCode} size="lg" />
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {selectedOrder.orderNumber}
                  </h2>
                  <p className="text-orange-100 text-sm">
                    {selectedOrder.branch} - {selectedOrder.customerName}
                  </p>
                </div>
              </div>
              <button
                onClick={closeModal}
                className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Order Information */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600">{locale === 'ko' ? '주문일' : 'Order Date'}</p>
                  <p className="font-semibold text-gray-800">{selectedOrder.orderDate}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">{t.dueDate}</p>
                  <p className="font-semibold text-gray-800">{selectedOrder.dueDate}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">{t.status}</p>
                  <div className="mt-1">{getStatusBadge(selectedOrder.status)}</div>
                </div>
                <div>
                  <p className="text-sm text-gray-600">{locale === 'ko' ? '우선순위' : 'Priority'}</p>
                  <div className="mt-1">{getPriorityBadge(selectedOrder.priority)}</div>
                </div>
                <div>
                  <p className="text-sm text-gray-600">{locale === 'ko' ? '고객명' : 'Customer'}</p>
                  <p className="font-semibold text-gray-800">{selectedOrder.customerName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">{locale === 'ko' ? '총 수량' : 'Total Quantity'}</p>
                  <p className="font-semibold text-gray-800">{selectedOrder.quantity}</p>
                </div>
              </div>

              {/* Production Note */}
              {selectedOrder.productionNote && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p className="font-semibold text-yellow-800 mb-1">
                        {locale === 'ko' ? '생산 참고사항' : 'Production Note'}
                      </p>
                      <p className="text-sm text-yellow-700">{selectedOrder.productionNote}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Product Items List */}
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  {locale === 'ko' ? '생산 항목 목록' : 'Production Items List'}
                </h3>
                
                <div className="bg-gray-50 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                          {locale === 'ko' ? '품목명' : 'Item Name'}
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                          {locale === 'ko' ? '품목코드' : 'Code'}
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase">
                          {t.quantity}
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                          {locale === 'ko' ? '단위' : 'Unit'}
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                          {locale === 'ko' ? '설명' : 'Description'}
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase">
                          {locale === 'ko' ? '생산상태' : 'Status'}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {selectedOrder.items.map((item, index) => {
                        const isCompleted = isItemCompleted(item.code);
                        return (
                        <tr key={index} className={`hover:bg-gray-50 transition-colors ${isCompleted ? 'bg-green-50' : ''}`}>
                          <td className={`px-4 py-3 text-sm font-medium ${
                            isCompleted ? 'text-gray-400 line-through' : 'text-gray-900'
                          }`}>
                            {item.name}
                          </td>
                          <td className={`px-4 py-3 text-sm font-mono ${
                            isCompleted ? 'text-gray-400 line-through' : 'text-gray-600'
                          }`}>
                            {item.code}
                          </td>
                          <td className={`px-4 py-3 text-sm text-center font-semibold ${
                            isCompleted ? 'text-gray-400 line-through' : 'text-gray-900'
                          }`}>
                            {item.quantity}
                          </td>
                          <td className={`px-4 py-3 text-sm ${
                            isCompleted ? 'text-gray-400 line-through' : 'text-gray-600'
                          }`}>
                            {item.unit}
                          </td>
                          <td className={`px-4 py-3 text-sm ${
                            isCompleted ? 'text-gray-400 line-through' : 'text-gray-600'
                          }`}>
                            {item.description || '-'}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() => toggleItemCompletion(item.code)}
                              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium text-xs transition-all ${
                                isCompleted 
                                  ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                                  : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                              }`}
                            >
                              {isCompleted ? (
                                <>
                                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                  {locale === 'ko' ? '완료' : 'Done'}
                                </>
                              ) : (
                                <>
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                  </svg>
                                  {locale === 'ko' ? '확인' : 'Mark'}
                                </>
                              )}
                            </button>
                          </td>
                        </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Items Summary */}
                <div className="mt-4 grid grid-cols-3 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-xs text-gray-600 mb-1">{locale === 'ko' ? '총 품목 수' : 'Total Items'}</p>
                    <p className="text-2xl font-bold text-blue-600">{selectedOrder.items.length}</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <p className="text-xs text-gray-600 mb-1">{locale === 'ko' ? '완료' : 'Completed'}</p>
                    <p className="text-2xl font-bold text-green-600">
                      {selectedOrder.items.filter(item => isItemCompleted(item.code)).length}
                    </p>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-4">
                    <p className="text-xs text-gray-600 mb-1">{locale === 'ko' ? '진행률' : 'Progress'}</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {selectedOrder.items.length > 0 
                        ? Math.round((selectedOrder.items.filter(item => isItemCompleted(item.code)).length / selectedOrder.items.length) * 100)
                        : 0}%
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={closeModal}
                  className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg transition-colors"
                >
                  {t.close}
                </button>
                <button
                  onClick={handleStartProduction}
                  disabled={selectedOrder && selectedOrder.items.filter(item => isItemCompleted(item.code)).length === 0}
                  className={`flex-1 px-6 py-3 font-medium rounded-lg transition-colors ${
                    selectedOrder && selectedOrder.items.filter(item => isItemCompleted(item.code)).length === 0
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-orange-500 hover:bg-orange-600 text-white'
                  }`}
                >
                  <div className="flex flex-col items-center">
                    <span>{locale === 'ko' ? '생산 시작' : 'Start Production'}</span>
                    {selectedOrder && selectedOrder.items.filter(item => isItemCompleted(item.code)).length > 0 && (
                      <span className="text-xs mt-1 opacity-90">
                        {selectedOrder.items.filter(item => isItemCompleted(item.code)).length}/{selectedOrder.items.length} {locale === 'ko' ? '품목 확인' : 'items ready'}
                      </span>
                    )}
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
