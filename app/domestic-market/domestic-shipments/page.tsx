'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from '@/lib/LocaleContext';
import { translations } from '@/lib/translations';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { ArrowLeft, Package, Plus, Eye, Trash2, X, Search as SearchIcon, Truck, MapPin, Clock, AlertCircle, FileText } from 'lucide-react';

interface ShipmentItem {
  productName: string;
  productCode: string;
  quantity: number;
  unit: string;
  weight: string;
  dimensions?: string;
}

interface DomesticShipment {
  id: string;
  shipmentNumber: string;
  orderNumber: string;
  destinationRegion: string;
  destinationRegionKey: string;
  destinationAddress: string;
  status: 'packed' | 'ready-to-ship' | 'in-transit' | 'delivered' | 'delayed';
  shipDate?: string;
  estimatedDelivery: string;
  actualDelivery?: string;
  carrier: string;
  trackingNumber: string;
  priority: 'urgent' | 'normal' | 'low';
  customerName: string;
  contactPerson: string;
  contactPhone: string;
  items: ShipmentItem[];
  packagingNote?: string;
  totalWeight: string;
  totalBoxes: number;
  shipmentMethod: 'truck' | 'express' | 'standard';
  deliveryFee: number;
  updates?: {
    timestamp: string;
    location: string;
    status: string;
    notes: string;
  }[];
}

export default function DomesticShipmentsPage() {
  const router = useRouter();
  const { locale } = useLocale();
  const t = translations[locale];
  const [selectedShipment, setSelectedShipment] = useState<DomesticShipment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [regionFilter, setRegionFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const regions = [
    { key: 'seoul', name: t.seoulMetro, emoji: '🏙️' },
    { key: 'busan', name: t.busanArea, emoji: '🌊' },
    { key: 'daegu', name: t.daeguArea, emoji: '🏔️' },
    { key: 'daejeon', name: t.daejeonArea, emoji: '🏛️' },
    { key: 'gwangju', name: t.gwangjuArea, emoji: '🌾' },
    { key: 'incheon', name: t.incheonArea, emoji: '✈️' },
    { key: 'jeju', name: t.jejuIsland, emoji: '🏝️' },
  ];

  const [shipments, setShipments] = useState<DomesticShipment[]>([]);

  useEffect(() => {
    fetch('/api/korea/domestic-shipments').then(r => r.json()).then(data => {
      if (Array.isArray(data)) setShipments(data.map((r: any) => ({
        ...r,
        items: r.items ?? [],
        updates: r.updates ?? [],
        customerName: r.customerName ?? '',
        contactPerson: r.contactPerson ?? '',
        contactPhone: r.contactPhone ?? '',
        totalWeight: r.totalWeight ?? '',
        totalBoxes: r.totalBoxes ?? 0,
        shipmentMethod: r.shipmentMethod ?? 'truck',
        deliveryFee: r.deliveryFee ?? 0,
      })));
    });
  }, []);


  const filteredShipments = shipments.filter(shipment => {
    const matchesSearch = shipment.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         shipment.shipmentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         shipment.orderNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || shipment.status === statusFilter;
    const matchesRegion = regionFilter === 'all' || shipment.destinationRegionKey === regionFilter;
    return matchesSearch && matchesStatus && matchesRegion;
  });

  const getStatusBadge = (status: string) => {
    const styles = {
      'packed': 'bg-blue-100 text-blue-800',
      'ready-to-ship': 'bg-green-100 text-green-800',
      'in-transit': 'bg-purple-100 text-purple-800',
      'delivered': 'bg-gray-100 text-gray-800',
      'delayed': 'bg-red-100 text-red-800',
    };

    const labels = {
      'packed': locale === 'ko' ? '포장완료' : 'Packed',
      'ready-to-ship': locale === 'ko' ? '출고대기' : 'Ready to Ship',
      'in-transit': locale === 'ko' ? '배송중' : 'In Transit',
      'delivered': locale === 'ko' ? '배송완료' : 'Delivered',
      'delayed': locale === 'ko' ? '지연' : 'Delayed',
    };

    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const styles = {
      urgent: 'bg-red-100 text-red-800',
      normal: 'bg-yellow-100 text-yellow-800',
      low: 'bg-green-100 text-green-800',
    };

    const labels = {
      urgent: locale === 'ko' ? '긴급' : 'Urgent',
      normal: locale === 'ko' ? '일반' : 'Normal',
      low: locale === 'ko' ? '낮음' : 'Low',
    };

    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${styles[priority as keyof typeof styles]}`}>
        {labels[priority as keyof typeof labels]}
      </span>
    );
  };

  const getShipmentMethodBadge = (method: string) => {
    const styles = {
      truck: 'bg-orange-100 text-orange-800',
      express: 'bg-red-100 text-red-800', 
      standard: 'bg-blue-100 text-blue-800',
    };

    const labels = {
      truck: locale === 'ko' ? '트럭운송' : 'Truck',
      express: locale === 'ko' ? '특송' : 'Express',
      standard: locale === 'ko' ? '일반택배' : 'Standard',
    };

    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${styles[method as keyof typeof styles]}`}>
        {labels[method as keyof typeof labels]}
      </span>
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'packed':
        return <Package className="h-4 w-4 text-blue-600" />;
      case 'ready-to-ship':
        return <Clock className="h-4 w-4 text-green-600" />;
      case 'in-transit':
        return <Truck className="h-4 w-4 text-purple-600" />;
      case 'delivered':
        return <Package className="h-4 w-4 text-gray-600" />;
      case 'delayed':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Package className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW'
    }).format(amount);
  };

  const handleDelete = (id: string) => {
    setShipments(shipments.filter(s => s.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Truck className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">
                    {t.domesticShipments}
                  </h1>
                  <p className="text-sm text-gray-500">
                    {t.domesticShipmentsDesc}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => router.push('/domestic-market/quotations')}
                className="flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FileText className="w-4 h-4" />
                {t.quotationMenu}
              </button>
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">{locale === 'ko' ? '전체 배송' : 'Total Shipments'}</p>
                <p className="text-2xl font-semibold text-gray-900">{shipments.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Truck className="h-8 w-8 text-purple-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">{locale === 'ko' ? '배송 중' : 'In Transit'}</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {shipments.filter(s => s.status === 'in-transit').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-gray-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">{locale === 'ko' ? '배송 완료' : 'Delivered'}</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {shipments.filter(s => s.status === 'delivered').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <AlertCircle className="h-8 w-8 text-red-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">{locale === 'ko' ? '지연' : 'Delayed'}</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {shipments.filter(s => s.status === 'delayed').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border mb-6 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={locale === 'ko' ? "고객명, 배송번호, 주문번호 검색..." : "Search by customer, shipment, order..."}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent w-full"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              >
                <option value="all">{locale === 'ko' ? '전체 상태' : 'All Status'}</option>
                <option value="packed">{locale === 'ko' ? '포장완료' : 'Packed'}</option>
                <option value="ready-to-ship">{locale === 'ko' ? '출고대기' : 'Ready to Ship'}</option>
                <option value="in-transit">{locale === 'ko' ? '배송중' : 'In Transit'}</option>
                <option value="delivered">{locale === 'ko' ? '배송완료' : 'Delivered'}</option>
                <option value="delayed">{locale === 'ko' ? '지연' : 'Delayed'}</option>
              </select>
              <select
                value={regionFilter}
                onChange={(e) => setRegionFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              >
                <option value="all">{locale === 'ko' ? '전체 지역' : 'All Regions'}</option>
                {regions.map(region => (
                  <option key={region.key} value={region.key}>{region.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Shipments Table */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="px-6 py-4 border-b bg-gray-50">
            <h3 className="text-lg font-medium text-gray-900">
              {t.domesticDelivery} ({filteredShipments.length})
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {locale === 'ko' ? '배송번호' : 'Shipment No.'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {locale === 'ko' ? '고객정보' : 'Customer'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {locale === 'ko' ? '목적지' : 'Destination'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {locale === 'ko' ? '상태' : 'Status'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {locale === 'ko' ? '배송예정' : 'Est. Delivery'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {locale === 'ko' ? '운송업체' : 'Carrier'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {locale === 'ko' ? '작업' : 'Actions'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredShipments.map((shipment) => (
                  <tr key={shipment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(shipment.status)}
                        <div className="ml-2">
                          <span className="text-sm font-medium text-gray-900">
                            {shipment.shipmentNumber}
                          </span>
                          <div className="text-xs text-gray-500">
                            {shipment.orderNumber}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{shipment.customerName}</div>
                      <div className="text-xs text-gray-500">
                        {shipment.contactPerson} • {shipment.contactPhone}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <span className="text-lg mr-2">
                          {regions.find(r => r.key === shipment.destinationRegionKey)?.emoji}
                        </span>
                        <div>
                          <div className="text-sm text-gray-900">{shipment.destinationRegion}</div>
                          <div className="text-xs text-gray-500 max-w-xs truncate">
                            {shipment.destinationAddress}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        {getStatusBadge(shipment.status)}
                        {getPriorityBadge(shipment.priority)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{shipment.estimatedDelivery}</div>
                      {shipment.actualDelivery && (
                        <div className="text-xs text-green-600">실제: {shipment.actualDelivery}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{shipment.carrier}</div>
                      <div className="text-xs text-gray-500">{shipment.trackingNumber}</div>
                      {getShipmentMethodBadge(shipment.shipmentMethod)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => {
                            setSelectedShipment(shipment);
                            setIsModalOpen(true);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(shipment.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Detail Modal */}
      {isModalOpen && selectedShipment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                {locale === 'ko' ? '배송 상세정보' : 'Shipment Details'} - {selectedShipment.shipmentNumber}
              </h3>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setSelectedShipment(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">{locale === 'ko' ? '기본 정보' : 'Basic Information'}</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>{locale === 'ko' ? '주문번호' : 'Order Number'}:</strong> {selectedShipment.orderNumber}</div>
                    <div><strong>{locale === 'ko' ? '고객명' : 'Customer'}:</strong> {selectedShipment.customerName}</div>
                    <div><strong>{locale === 'ko' ? '담당자' : 'Contact Person'}:</strong> {selectedShipment.contactPerson}</div>
                    <div><strong>{locale === 'ko' ? '연락처' : 'Phone'}:</strong> {selectedShipment.contactPhone}</div>
                    <div><strong>{locale === 'ko' ? '우선순위' : 'Priority'}:</strong> {getPriorityBadge(selectedShipment.priority)}</div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">{locale === 'ko' ? '배송 정보' : 'Shipping Information'}</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>{locale === 'ko' ? '운송업체' : 'Carrier'}:</strong> {selectedShipment.carrier}</div>
                    <div><strong>{locale === 'ko' ? '송장번호' : 'Tracking Number'}:</strong> {selectedShipment.trackingNumber}</div>
                    <div><strong>{locale === 'ko' ? '배송방법' : 'Method'}:</strong> {getShipmentMethodBadge(selectedShipment.shipmentMethod)}</div>
                    <div><strong>{locale === 'ko' ? '총 중량' : 'Total Weight'}:</strong> {selectedShipment.totalWeight}</div>
                    <div><strong>{locale === 'ko' ? '박스 수' : 'Boxes'}:</strong> {selectedShipment.totalBoxes}개</div>
                    <div><strong>{locale === 'ko' ? '배송비' : 'Delivery Fee'}:</strong> {formatCurrency(selectedShipment.deliveryFee)}</div>
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">{locale === 'ko' ? '배송 주소' : 'Delivery Address'}</h4>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center mb-2">
                    <MapPin className="h-4 w-4 text-gray-600 mr-2" />
                    <span className="font-medium">{selectedShipment.destinationRegion}</span>
                  </div>
                  <p className="text-sm text-gray-700">{selectedShipment.destinationAddress}</p>
                </div>
              </div>

              {/* Items */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">{locale === 'ko' ? '배송 품목' : 'Shipped Items'}</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left">{locale === 'ko' ? '제품명' : 'Product'}</th>
                        <th className="px-4 py-2 text-left">{locale === 'ko' ? '제품코드' : 'Code'}</th>
                        <th className="px-4 py-2 text-left">{locale === 'ko' ? '수량' : 'Quantity'}</th>
                        <th className="px-4 py-2 text-left">{locale === 'ko' ? '중량' : 'Weight'}</th>
                        <th className="px-4 py-2 text-left">{locale === 'ko' ? '크기' : 'Dimensions'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {selectedShipment.items.map((item, index) => (
                        <tr key={index}>
                          <td className="px-4 py-2">{item.productName}</td>
                          <td className="px-4 py-2 text-gray-600">{item.productCode}</td>
                          <td className="px-4 py-2">{item.quantity} {item.unit}</td>
                          <td className="px-4 py-2">{item.weight}</td>
                          <td className="px-4 py-2 text-gray-600">{item.dimensions || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Tracking Updates */}
              {selectedShipment.updates && (
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">{locale === 'ko' ? '배송 추적' : 'Tracking Updates'}</h4>
                  <div className="space-y-3">
                    {selectedShipment.updates.map((update, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className="flex-shrink-0">
                          <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-900">{update.status}</p>
                            <p className="text-xs text-gray-500">{update.timestamp}</p>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{update.location}</p>
                          {update.notes && (
                            <p className="text-sm text-gray-500 mt-1">{update.notes}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Packaging Note */} 
              {selectedShipment.packagingNote && (
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">{locale === 'ko' ? '포장 주의사항' : 'Packaging Notes'}</h4>
                  <div className="p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
                    <p className="text-sm text-yellow-800">{selectedShipment.packagingNote}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}