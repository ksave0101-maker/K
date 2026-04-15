'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from '@/lib/LocaleContext';
import { translations } from '@/lib/translations';
import CountryFlag from '@/components/CountryFlag';
import LanguageSwitcher from '@/components/LanguageSwitcher';

interface ShipmentItem {
  productName: string;
  productCode: string;
  quantity: number;
  unit: string;
  weight: string;
  dimensions?: string;
}

interface ShipmentUpdate {
  id: string;
  shipmentNumber: string;
  orderNumber: string;
  destination: 'Korea' | 'Brunei' | 'Thailand' | 'Vietnam';
  destCode: 'KR' | 'BN' | 'TH' | 'VN';
  shipmentMethod: 'land' | 'sea';
  currentStatus: 'preparing' | 'in-transit' | 'customs' | 'delivered';
  currentLocation: string;
  estimatedDelivery: string;
  trackingNumber: string;
  carrier: string;
  lastUpdate: string;
  destinationAddress: string;
  contactPerson: string;
  contactPhone: string;
  packagingNote?: string;
  totalWeight: string;
  totalBoxes: number;
  items: ShipmentItem[];
  updates: {
    timestamp: string;
    location: string;
    status: string;
    notes: string;
  }[];
}

export default function ShipmentUpdatesPage() {
  const router = useRouter();
  const { locale } = useLocale();
  const t = translations[locale];
  const [selectedShipment, setSelectedShipment] = useState<ShipmentUpdate | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editCarrier, setEditCarrier] = useState('');
  const [editTracking, setEditTracking] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editContact, setEditContact] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editPackagingNote, setEditPackagingNote] = useState('');
  const [editItems, setEditItems] = useState<ShipmentItem[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newShipment, setNewShipment] = useState({
    shipmentNumber: '',
    orderNumber: '',
    destination: 'Korea' as 'Korea' | 'Brunei' | 'Thailand' | 'Vietnam',
    destCode: 'KR' as 'KR' | 'BN' | 'TH' | 'VN',
    shipmentMethod: 'sea' as 'land' | 'sea',
    currentStatus: 'preparing' as 'preparing' | 'in-transit' | 'customs' | 'delivered',
    currentLocation: '',
    estimatedDelivery: '',
    trackingNumber: '',
    carrier: '',
    destinationAddress: '',
    contactPerson: '',
    contactPhone: '',
    packagingNote: '',
    totalWeight: '',
    totalBoxes: 0,
  });
  const [newItems, setNewItems] = useState<ShipmentItem[]>([{ productName: '', productCode: '', quantity: 0, unit: 'pcs', weight: '' }]);

  const [shipments, setShipments] = useState<ShipmentUpdate[]>([
    {
      id: '1',
      shipmentNumber: 'SH-2026-KR-001',
      orderNumber: 'PO-2026-001',
      destination: 'Korea',
      destCode: 'KR',
      shipmentMethod: 'land',
      currentStatus: 'in-transit',
      currentLocation: 'Seoul Distribution Center',
      estimatedDelivery: '2026-02-16',
      trackingNumber: 'TK-KR-20260215-001',
      carrier: 'Korea Express',
      lastUpdate: '2026-02-15 16:00',
      destinationAddress: '123 Gangnam-gu, Seoul, South Korea',
      contactPerson: 'Kim Min-ji',
      contactPhone: '+82-2-1234-5678',
      packagingNote: 'Handle with care - fragile electronic components',
      totalWeight: '250 kg',
      totalBoxes: 5,
      items: [
        { productName: 'Main Control Unit', productCode: 'MCU-A2024', quantity: 50, unit: 'pcs', weight: '100 kg', dimensions: '50x40x30 cm' },
        { productName: 'Power Module', productCode: 'PM-500W', quantity: 50, unit: 'pcs', weight: '75 kg', dimensions: '40x30x20 cm' },
        { productName: 'Display Panel', productCode: 'DP-LCD7', quantity: 50, unit: 'pcs', weight: '50 kg', dimensions: '30x25x15 cm' },
        { productName: 'Sensor Array', productCode: 'SA-V3', quantity: 50, unit: 'sets', weight: '25 kg', dimensions: '20x15x10 cm' }
      ],
      updates: [
        {
          timestamp: '2026-02-15 16:00',
          location: 'Seoul Distribution Center',
          status: 'In Transit',
          notes: 'Arrived at Seoul hub, preparing for final delivery'
        },
        {
          timestamp: '2026-02-15 12:00',
          location: 'Busan Checkpoint',
          status: 'In Transit',
          notes: 'Passed checkpoint, heading to Seoul'
        },
        {
          timestamp: '2026-02-15 08:00',
          location: 'Warehouse',
          status: 'Dispatched',
          notes: 'Package dispatched from main warehouse'
        }
      ]
    },
    {
      id: '2',
      shipmentNumber: 'SH-2026-BN-002',
      orderNumber: 'PO-2026-003',
      destination: 'Brunei',
      destCode: 'BN',
      shipmentMethod: 'sea',
      currentStatus: 'customs',
      currentLocation: 'Muara Port - Customs',
      estimatedDelivery: '2026-02-18',
      trackingNumber: 'TK-BN-20260212-003',
      carrier: 'Pacific Shipping Lines',
      lastUpdate: '2026-02-15 14:30',
      destinationAddress: '45 Jalan Menteri Besar, Bandar Seri Begawan, Brunei',
      contactPerson: 'Ahmad Hassan',
      contactPhone: '+673-222-3456',
      totalWeight: '180 kg',
      totalBoxes: 4,
      items: [
        { productName: 'Energy Monitor Pro', productCode: 'EMP-2024', quantity: 30, unit: 'pcs', weight: '120 kg' },
        { productName: 'Smart Sensors', productCode: 'SS-V2', quantity: 30, unit: 'sets', weight: '60 kg' }
      ],
      updates: [
        {
          timestamp: '2026-02-15 14:30',
          location: 'Muara Port - Customs',
          status: 'Customs Clearance',
          notes: 'Under customs inspection, expected clearance today'
        },
        {
          timestamp: '2026-02-14 18:00',
          location: 'Muara Port',
          status: 'Arrived',
          notes: 'Vessel arrived at destination port'
        },
        {
          timestamp: '2026-02-12 10:00',
          location: 'Port of Busan',
          status: 'Departed',
          notes: 'Loaded on vessel MS Pacific Star'
        }
      ]
    },
    {
      id: '3',
      shipmentNumber: 'SH-2026-TH-003',
      orderNumber: 'PO-2026-004',
      destination: 'Thailand',
      destCode: 'TH',
      shipmentMethod: 'sea',
      currentStatus: 'in-transit',
      currentLocation: 'South China Sea',
      estimatedDelivery: '2026-02-20',
      trackingNumber: 'TK-TH-20260213-004',
      carrier: 'Asian Maritime Co.',
      lastUpdate: '2026-02-15 10:00',
      destinationAddress: '789 Sukhumvit Road, Bangkok, Thailand',
      contactPerson: 'Somchai Prasert',
      contactPhone: '+66-2-345-6789',
      packagingNote: 'Waterproof packaging required',
      totalWeight: '320 kg',
      totalBoxes: 6,
      items: [
        { productName: 'Industrial Controller', productCode: 'IC-X500', quantity: 40, unit: 'pcs', weight: '200 kg', dimensions: '60x50x40 cm' },
        { productName: 'Cooling System', productCode: 'CS-T300', quantity: 40, unit: 'pcs', weight: '120 kg', dimensions: '45x35x25 cm' }
      ],
      updates: [
        {
          timestamp: '2026-02-15 10:00',
          location: 'South China Sea',
          status: 'In Transit',
          notes: 'Vessel en route, weather conditions favorable'
        },
        {
          timestamp: '2026-02-13 14:00',
          location: 'Port of Busan',
          status: 'Departed',
          notes: 'Departed on vessel MS Thai Express'
        },
        {
          timestamp: '2026-02-13 08:00',
          location: 'Warehouse',
          status: 'Preparing',
          notes: 'Cargo prepared and loaded'
        }
      ]
    },
    {
      id: '4',
      shipmentNumber: 'SH-2026-VN-004',
      orderNumber: 'PO-2026-005',
      destination: 'Vietnam',
      destCode: 'VN',
      shipmentMethod: 'sea',
      currentStatus: 'delivered',
      currentLocation: 'Hanoi Branch',
      estimatedDelivery: '2026-02-15',
      trackingNumber: 'TK-VN-20260210-005',
      carrier: 'Vietnam Shipping Corp',
      lastUpdate: '2026-02-15 09:00',
      destinationAddress: '456 Nguyen Hue Boulevard, Ho Chi Minh City, Vietnam',
      contactPerson: 'Nguyen Van An',
      contactPhone: '+84-28-765-4321',
      totalWeight: '210 kg',
      totalBoxes: 5,
      items: [
        { productName: 'Smart Gateway', productCode: 'SG-2024', quantity: 35, unit: 'pcs', weight: '140 kg' },
        { productName: 'Network Module', productCode: 'NM-W100', quantity: 35, unit: 'pcs', weight: '70 kg' }
      ],
      updates: [
        {
          timestamp: '2026-02-15 09:00',
          location: 'Hanoi Branch',
          status: 'Delivered',
          notes: 'Successfully delivered and signed by recipient'
        },
        {
          timestamp: '2026-02-14 16:00',
          location: 'Hanoi Distribution',
          status: 'Out for Delivery',
          notes: 'Final delivery in progress'
        },
        {
          timestamp: '2026-02-13 10:00',
          location: 'Hai Phong Port',
          status: 'Customs Cleared',
          notes: 'Cleared customs, heading to Hanoi'
        }
      ]
    }
  ]);

  const getStatusInfo = (status: string) => {
    const statuses = {
      'preparing': {
        label: locale === 'ko' ? '준비 중' : 'Preparing',
        color: 'bg-blue-100 text-blue-800',
        icon: '📦'
      },
      'in-transit': {
        label: locale === 'ko' ? '운송 중' : 'In Transit',
        color: 'bg-yellow-100 text-yellow-800',
        icon: '🚚'
      },
      'customs': {
        label: locale === 'ko' ? '통관 중' : 'Customs',
        color: 'bg-purple-100 text-purple-800',
        icon: '📋'
      },
      'delivered': {
        label: locale === 'ko' ? '배송 완료' : 'Delivered',
        color: 'bg-green-100 text-green-800',
        icon: '✅'
      }
    };
    return statuses[status as keyof typeof statuses] || statuses.preparing;
  };

  const getMethodBadge = (method: string) => {
    if (method === 'sea') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
          🚢 {locale === 'ko' ? '해상' : 'Sea'}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs font-medium">
        🚛 {locale === 'ko' ? '육상' : 'Land'}
      </span>
    );
  };

  const handleViewDetails = (shipment: ShipmentUpdate) => {
    setSelectedShipment(shipment);
    setEditCarrier(shipment.carrier);
    setEditTracking(shipment.trackingNumber);
    setEditAddress(shipment.destinationAddress);
    setEditContact(shipment.contactPerson);
    setEditPhone(shipment.contactPhone);
    setEditPackagingNote(shipment.packagingNote || '');
    setEditItems(shipment.items.map(item => ({ ...item })));
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedShipment(null);
  };

  const handleItemQuantityChange = (index: number, value: number) => {
    setEditItems(prev => prev.map((item, i) => i === index ? { ...item, quantity: value } : item));
  };

  const handleSaveShipment = () => {
    if (!selectedShipment) return;
    const updated: ShipmentUpdate = {
      ...selectedShipment,
      carrier: editCarrier,
      trackingNumber: editTracking,
      destinationAddress: editAddress,
      contactPerson: editContact,
      contactPhone: editPhone,
      packagingNote: editPackagingNote || undefined,
      items: editItems,
    };
    setShipments(prev => prev.map(s => s.id === updated.id ? updated : s));
    setSelectedShipment(updated);
    alert(locale === 'ko' ? '저장되었습니다!' : 'Saved successfully!');
  };

  const handleAddUpdate = () => {
    if (selectedShipment) {
      alert(
        locale === 'ko'
          ? `${selectedShipment.shipmentNumber} 업데이트가 추가되었습니다!`
          : `Update added for ${selectedShipment.shipmentNumber}!`
      );
      closeModal();
    }
  };

  const destMap: Record<string, string> = { Korea: 'KR', Brunei: 'BN', Thailand: 'TH', Vietnam: 'VN' };

  const resetNewShipmentForm = () => {
    setNewShipment({
      shipmentNumber: '', orderNumber: '', destination: 'Korea', destCode: 'KR',
      shipmentMethod: 'sea', currentStatus: 'preparing', currentLocation: '',
      estimatedDelivery: '', trackingNumber: '', carrier: '', destinationAddress: '',
      contactPerson: '', contactPhone: '', packagingNote: '', totalWeight: '', totalBoxes: 0,
    });
    setNewItems([{ productName: '', productCode: '', quantity: 0, unit: 'pcs', weight: '' }]);
  };

  const handleCreateShipment = () => {
    if (!newShipment.shipmentNumber || !newShipment.orderNumber) {
      alert(locale === 'ko' ? '배송번호와 주문번호를 입력하세요.' : 'Please enter shipment number and order number.');
      return;
    }
    const now = new Date();
    const ts = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
    const created: ShipmentUpdate = {
      id: String(Date.now()),
      ...newShipment,
      lastUpdate: ts,
      packagingNote: newShipment.packagingNote || undefined,
      items: newItems.filter(it => it.productName),
      updates: [{ timestamp: ts, location: newShipment.currentLocation || '-', status: 'Preparing', notes: locale === 'ko' ? '배송 등록됨' : 'Shipment registered' }],
    };
    setShipments(prev => [created, ...prev]);
    setIsAddModalOpen(false);
    resetNewShipmentForm();
    alert(locale === 'ko' ? '배송이 등록되었습니다!' : 'Shipment created!');
  };

  const handleNewItemChange = (index: number, field: keyof ShipmentItem, value: string | number) => {
    setNewItems(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
      {/* Header */}
      <div className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/production/dashboard')}
              className="text-blue-600 hover:text-blue-800"
            >
              ← {t.back}
            </button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-800">
                {locale === 'ko' ? '배송 현황 업데이트' : 'Shipment Updates'}
              </h1>
              <p className="text-gray-600 mt-1">
                {locale === 'ko' ? '실시간 배송 추적 및 업데이트' : 'Real-time shipment tracking and updates'}
              </p>
            </div>
            <LanguageSwitcher />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 shadow">
            <p className="text-sm text-gray-600">{locale === 'ko' ? '전체 배송' : 'Total Shipments'}</p>
            <p className="text-2xl font-bold text-blue-600">{shipments.length}</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow">
            <p className="text-sm text-gray-600">{locale === 'ko' ? '운송 중' : 'In Transit'}</p>
            <p className="text-2xl font-bold text-yellow-600">
              {shipments.filter(s => s.currentStatus === 'in-transit').length}
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow">
            <p className="text-sm text-gray-600">{locale === 'ko' ? '통관 중' : 'In Customs'}</p>
            <p className="text-2xl font-bold text-purple-600">
              {shipments.filter(s => s.currentStatus === 'customs').length}
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow">
            <p className="text-sm text-gray-600">{locale === 'ko' ? '배송 완료' : 'Delivered'}</p>
            <p className="text-2xl font-bold text-green-600">
              {shipments.filter(s => s.currentStatus === 'delivered').length}
            </p>
          </div>
        </div>

        {/* Shipment List */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">
              {locale === 'ko' ? '배송 목록' : 'Shipment List'}
            </h2>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors flex items-center gap-2 text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {locale === 'ko' ? '배송 추가' : 'Add Shipment'}
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {locale === 'ko' ? '배송번호' : 'Shipment No.'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {locale === 'ko' ? '주문번호' : 'Order No.'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {locale === 'ko' ? '목적지' : 'Destination'}
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    {locale === 'ko' ? '운송방법' : 'Method'}
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    {locale === 'ko' ? '상태' : 'Status'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {locale === 'ko' ? '현재 위치' : 'Location'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {locale === 'ko' ? '배송 예정' : 'Est. Delivery'}
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    {locale === 'ko' ? '작업' : 'Actions'}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {shipments.map((shipment) => {
                  const statusInfo = getStatusInfo(shipment.currentStatus);
                  return (
                    <tr key={shipment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{shipment.shipmentNumber}</div>
                        <div className="text-xs text-gray-500">{shipment.trackingNumber}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{shipment.orderNumber}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <CountryFlag country={shipment.destCode} size="sm" />
                          <span className="text-sm text-gray-600">{shipment.destination}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {getMethodBadge(shipment.shipmentMethod)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                          <span>{statusInfo.icon}</span>
                          <span>{statusInfo.label}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{shipment.currentLocation}</div>
                        <div className="text-xs text-gray-500">{shipment.lastUpdate}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{shipment.estimatedDelivery}</div>
                        <div className="text-xs text-gray-500">{shipment.carrier}</div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleViewDetails(shipment)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline"
                        >
                          {t.viewDetails}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && selectedShipment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CountryFlag country={selectedShipment.destCode} size="lg" />
                <div>
                  <h2 className="text-2xl font-bold text-white">{selectedShipment.shipmentNumber}</h2>
                  <p className="text-blue-100 text-sm">
                    {locale === 'ko' ? '추적번호' : 'Tracking'}: {selectedShipment.trackingNumber}
                  </p>
                </div>
              </div>
              <button onClick={closeModal} className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Current Status */}
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-6 border border-blue-200">
                <h3 className="font-bold text-gray-800 mb-4">{locale === 'ko' ? '현재 상태' : 'Current Status'}</h3>
                <div className="flex items-center gap-4 mb-4">
                  <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${getStatusInfo(selectedShipment.currentStatus).color}`}>
                    <span className="text-xl">{getStatusInfo(selectedShipment.currentStatus).icon}</span>
                    <span>{getStatusInfo(selectedShipment.currentStatus).label}</span>
                  </span>
                  {getMethodBadge(selectedShipment.shipmentMethod)}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg p-3">
                    <p className="text-xs text-gray-600">{locale === 'ko' ? '현재 위치' : 'Current Location'}</p>
                    <p className="font-semibold text-gray-900">{selectedShipment.currentLocation}</p>
                  </div>
                  <div className="bg-white rounded-lg p-3">
                    <p className="text-xs text-gray-600">{locale === 'ko' ? '배송 예정일' : 'Est. Delivery'}</p>
                    <p className="font-semibold text-gray-900">{selectedShipment.estimatedDelivery}</p>
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">{locale === 'ko' ? '주문번호' : 'Order Number'}</p>
                  <p className="font-semibold text-gray-800">{selectedShipment.orderNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">{locale === 'ko' ? '운송사' : 'Carrier'}</p>
                  <p className="font-semibold text-gray-800">{selectedShipment.carrier}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">{locale === 'ko' ? '목적지' : 'Destination'}</p>
                  <p className="font-semibold text-gray-800">{selectedShipment.destination}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">{locale === 'ko' ? '마지막 업데이트' : 'Last Update'}</p>
                  <p className="font-semibold text-gray-800">{selectedShipment.lastUpdate}</p>
                </div>
              </div>

              {/* Shipping Information */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                  </svg>
                  {locale === 'ko' ? '배송 정보' : 'Shipping Information'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{locale === 'ko' ? '운송사' : 'Carrier'}</p>
                    <input type="text" value={editCarrier} onChange={e => setEditCarrier(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{locale === 'ko' ? '운송장번호' : 'Tracking Number'}</p>
                    <input type="text" value={editTracking} onChange={e => setEditTracking(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-600 mb-1">{locale === 'ko' ? '배송지 주소' : 'Destination Address'}</p>
                    <input type="text" value={editAddress} onChange={e => setEditAddress(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{locale === 'ko' ? '담당자' : 'Contact Person'}</p>
                    <input type="text" value={editContact} onChange={e => setEditContact(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{locale === 'ko' ? '연락처' : 'Phone'}</p>
                    <input type="text" value={editPhone} onChange={e => setEditPhone(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                  </div>
                </div>
              </div>

              {/* Packaging Note */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <div className="flex-1">
                    <p className="font-semibold text-yellow-800 mb-1">{locale === 'ko' ? '포장 참고사항' : 'Packaging Note'}</p>
                    <textarea value={editPackagingNote} onChange={e => setEditPackagingNote(e.target.value)} placeholder={locale === 'ko' ? '참고사항 입력' : 'Enter packaging note'} rows={2} className="w-full px-3 py-2 border border-yellow-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500" />
                  </div>
                </div>
              </div>

              {/* Package Items List */}
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  {locale === 'ko' ? '포장 품목 목록' : 'Package Items List'}
                </h3>
                <div className="bg-gray-50 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">{locale === 'ko' ? '품목명' : 'Item Name'}</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">{locale === 'ko' ? '품목코드' : 'Code'}</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase">{t.quantity}</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">{locale === 'ko' ? '단위' : 'Unit'}</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">{locale === 'ko' ? '무게' : 'Weight'}</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">{locale === 'ko' ? '크기' : 'Dimensions'}</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {editItems.map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.productName}</td>
                          <td className="px-4 py-3 text-sm text-gray-600 font-mono">{item.productCode}</td>
                          <td className="px-3 py-2">
                            <input type="number" value={item.quantity} onChange={e => handleItemQuantityChange(index, parseInt(e.target.value) || 0)} min={0} className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">{item.unit}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{item.weight}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{item.dimensions || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-xs text-gray-600 mb-1">{locale === 'ko' ? '총 품목 수' : 'Total Items'}</p>
                    <p className="text-2xl font-bold text-blue-600">{editItems.length}</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4">
                    <p className="text-xs text-gray-600 mb-1">{locale === 'ko' ? '총 무게' : 'Total Weight'}</p>
                    <p className="text-2xl font-bold text-purple-600">{selectedShipment.totalWeight}</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button onClick={closeModal} className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg">
                  {t.close}
                </button>
                <button onClick={handleSaveShipment} className="flex-1 px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg">
                  {locale === 'ko' ? '저장' : 'Save'}
                </button>
                <button onClick={handleAddUpdate} className="flex-1 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg">
                  {locale === 'ko' ? '업데이트 추가' : 'Add Update'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Shipment Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-2xl font-bold text-white">
                {locale === 'ko' ? '새 배송 등록' : 'New Shipment'}
              </h2>
              <button onClick={() => { setIsAddModalOpen(false); resetNewShipmentForm(); }} className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">{locale === 'ko' ? '배송번호' : 'Shipment No.'} *</label>
                  <input type="text" value={newShipment.shipmentNumber} onChange={e => setNewShipment(p => ({ ...p, shipmentNumber: e.target.value }))} placeholder="SH-2026-XX-00X" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500" />
                </div>
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">{locale === 'ko' ? '주문번호' : 'Order No.'} *</label>
                  <input type="text" value={newShipment.orderNumber} onChange={e => setNewShipment(p => ({ ...p, orderNumber: e.target.value }))} placeholder="PO-2026-00X" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500" />
                </div>
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">{locale === 'ko' ? '목적지' : 'Destination'}</label>
                  <select value={newShipment.destination} onChange={e => { const d = e.target.value as typeof newShipment.destination; setNewShipment(p => ({ ...p, destination: d, destCode: destMap[d] as typeof newShipment.destCode })); }} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500">
                    <option value="Korea">Korea</option>
                    <option value="Brunei">Brunei</option>
                    <option value="Thailand">Thailand</option>
                    <option value="Vietnam">Vietnam</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">{locale === 'ko' ? '운송방법' : 'Method'}</label>
                  <select value={newShipment.shipmentMethod} onChange={e => setNewShipment(p => ({ ...p, shipmentMethod: e.target.value as 'sea' | 'land' }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500">
                    <option value="sea">{locale === 'ko' ? '해상 🚢' : 'Sea 🚢'}</option>
                    <option value="land">{locale === 'ko' ? '육상 🚛' : 'Land 🚛'}</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">{locale === 'ko' ? '배송 예정일' : 'Est. Delivery'}</label>
                  <input type="date" value={newShipment.estimatedDelivery} onChange={e => setNewShipment(p => ({ ...p, estimatedDelivery: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500" />
                </div>
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">{locale === 'ko' ? '현재 위치' : 'Current Location'}</label>
                  <input type="text" value={newShipment.currentLocation} onChange={e => setNewShipment(p => ({ ...p, currentLocation: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500" />
                </div>
              </div>

              {/* Shipping Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-bold text-gray-800 mb-3">{locale === 'ko' ? '배송 정보' : 'Shipping Information'}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-600 mb-1 block">{locale === 'ko' ? '운송사' : 'Carrier'}</label>
                    <input type="text" value={newShipment.carrier} onChange={e => setNewShipment(p => ({ ...p, carrier: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600 mb-1 block">{locale === 'ko' ? '운송장번호' : 'Tracking No.'}</label>
                    <input type="text" value={newShipment.trackingNumber} onChange={e => setNewShipment(p => ({ ...p, trackingNumber: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm text-gray-600 mb-1 block">{locale === 'ko' ? '배송지 주소' : 'Address'}</label>
                    <input type="text" value={newShipment.destinationAddress} onChange={e => setNewShipment(p => ({ ...p, destinationAddress: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600 mb-1 block">{locale === 'ko' ? '담당자' : 'Contact'}</label>
                    <input type="text" value={newShipment.contactPerson} onChange={e => setNewShipment(p => ({ ...p, contactPerson: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600 mb-1 block">{locale === 'ko' ? '연락처' : 'Phone'}</label>
                    <input type="text" value={newShipment.contactPhone} onChange={e => setNewShipment(p => ({ ...p, contactPhone: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600 mb-1 block">{locale === 'ko' ? '총 무게' : 'Total Weight'}</label>
                    <input type="text" value={newShipment.totalWeight} onChange={e => setNewShipment(p => ({ ...p, totalWeight: e.target.value }))} placeholder="250 kg" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600 mb-1 block">{locale === 'ko' ? '박스 수' : 'Total Boxes'}</label>
                    <input type="number" value={newShipment.totalBoxes} onChange={e => setNewShipment(p => ({ ...p, totalBoxes: parseInt(e.target.value) || 0 }))} min={0} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                  </div>
                </div>
              </div>

              {/* Packaging Note */}
              <div>
                <label className="text-sm text-gray-600 mb-1 block">{locale === 'ko' ? '포장 참고사항' : 'Packaging Note'}</label>
                <textarea value={newShipment.packagingNote} onChange={e => setNewShipment(p => ({ ...p, packagingNote: e.target.value }))} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500" />
              </div>

              {/* Items */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-gray-800">{locale === 'ko' ? '품목 목록' : 'Items'}</h3>
                  <button onClick={() => setNewItems(prev => [...prev, { productName: '', productCode: '', quantity: 0, unit: 'pcs', weight: '' }])} className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-medium rounded-lg flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    {locale === 'ko' ? '품목 추가' : 'Add Item'}
                  </button>
                </div>
                <div className="space-y-3">
                  {newItems.map((item, i) => (
                    <div key={i} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-gray-500">#{i + 1}</span>
                        {newItems.length > 1 && (
                          <button onClick={() => setNewItems(prev => prev.filter((_, idx) => idx !== i))} className="text-red-500 hover:bg-red-50 rounded p-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        <input type="text" value={item.productName} onChange={e => handleNewItemChange(i, 'productName', e.target.value)} placeholder={locale === 'ko' ? '품목명' : 'Item Name'} className="px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-green-500" />
                        <input type="text" value={item.productCode} onChange={e => handleNewItemChange(i, 'productCode', e.target.value)} placeholder={locale === 'ko' ? '품목코드' : 'Code'} className="px-2 py-1.5 border border-gray-300 rounded text-sm font-mono focus:ring-2 focus:ring-green-500" />
                        <input type="number" value={item.quantity} onChange={e => handleNewItemChange(i, 'quantity', parseInt(e.target.value) || 0)} placeholder={locale === 'ko' ? '수량' : 'Qty'} min={0} className="px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-green-500" />
                        <input type="text" value={item.unit} onChange={e => handleNewItemChange(i, 'unit', e.target.value)} placeholder={locale === 'ko' ? '단위' : 'Unit'} className="px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-green-500" />
                        <input type="text" value={item.weight} onChange={e => handleNewItemChange(i, 'weight', e.target.value)} placeholder={locale === 'ko' ? '무게' : 'Weight'} className="px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-green-500" />
                        <input type="text" value={item.dimensions || ''} onChange={e => handleNewItemChange(i, 'dimensions', e.target.value)} placeholder={locale === 'ko' ? '크기' : 'Dimensions'} className="px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-green-500" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button onClick={() => { setIsAddModalOpen(false); resetNewShipmentForm(); }} className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg">
                  {t.cancel}
                </button>
                <button onClick={handleCreateShipment} className="flex-1 px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg">
                  {locale === 'ko' ? '배송 등록' : 'Create Shipment'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
