'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
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

type ProductionOrderSearchResult = {
  id?: string | number;
  orderNumber?: string;
  product?: string;
  customerName?: string;
  quantity?: number;
  status?: string;
  dueDate?: string;
};

type ProductSearchResult = {
  id?: number | null;
  sku?: string | null;
  name?: string | null;
  unit?: string | null;
  weight?: string | null;
};

type ShipmentUpdateRow = Partial<ShipmentUpdate> & {
  shipmentMethod?: string;
  currentStatus?: string;
  totalBoxes?: number | string;
  items?: unknown;
  updates?: unknown;
};

function normalizeShipment(row: ShipmentUpdateRow): ShipmentUpdate {
  return {
    id: String(row?.id ?? ''),
    shipmentNumber: row?.shipmentNumber ?? '',
    orderNumber: row?.orderNumber ?? '',
    destination: (row?.destination ?? 'Korea') as ShipmentUpdate['destination'],
    destCode: (row?.destCode ?? 'KR') as ShipmentUpdate['destCode'],
    shipmentMethod: row?.shipmentMethod === 'land' ? 'land' : 'sea',
    currentStatus: (row?.currentStatus ?? 'preparing') as ShipmentUpdate['currentStatus'],
    currentLocation: row?.currentLocation ?? '',
    estimatedDelivery: row?.estimatedDelivery ?? '',
    trackingNumber: row?.trackingNumber ?? '',
    carrier: row?.carrier ?? '',
    lastUpdate: row?.lastUpdate ?? '',
    destinationAddress: row?.destinationAddress ?? '',
    contactPerson: row?.contactPerson ?? '',
    contactPhone: row?.contactPhone ?? '',
    packagingNote: row?.packagingNote ?? '',
    totalWeight: row?.totalWeight ?? '',
    totalBoxes: Number(row?.totalBoxes ?? 0),
    items: Array.isArray(row?.items) ? row.items : [],
    updates: Array.isArray(row?.updates) ? row.updates : [],
  };
}

function getCurrentTimestamp() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
}

function formatDateOnly(value?: string) {
  if (!value) return '-';
  const asText = String(value);
  if (/^\d{4}-\d{2}-\d{2}$/.test(asText)) return asText;
  const d = new Date(asText);
  if (Number.isNaN(d.getTime())) return asText;
  return d.toISOString().slice(0, 10);
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
  const [shipments, setShipments] = useState<ShipmentUpdate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [poSearchQuery, setPoSearchQuery] = useState('');
  const [poSearchResults, setPoSearchResults] = useState<ProductionOrderSearchResult[]>([]);
  const [showPoDropdown, setShowPoDropdown] = useState(false);
  const [showPoSearchModal, setShowPoSearchModal] = useState(false);
  const [allProductionOrders, setAllProductionOrders] = useState<ProductionOrderSearchResult[]>([]);
  const [productSearchResults, setProductSearchResults] = useState<ProductSearchResult[]>([]);
  const [activeProductRow, setActiveProductRow] = useState<number | null>(null);
  const [productSearchLoading, setProductSearchLoading] = useState(false);
  const productSearchRef = useRef<HTMLDivElement | null>(null);
  const productSearchTimeout = useRef<number | null>(null);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (productSearchRef.current && !productSearchRef.current.contains(event.target as Node)) {
        setActiveProductRow(null);
        setProductSearchResults([]);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const loadShipments = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/korea/shipment-updates', { cache: 'no-store' });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || 'Failed to load shipment updates');
      }

      setShipments(Array.isArray(data) ? data.map(normalizeShipment) : []);
      setLoadError('');
    } catch (error) {
      console.error('Failed to load shipment updates:', error);
      setLoadError(locale === 'ko' ? '배송 데이터를 불러오지 못했습니다.' : 'Unable to load shipment data.');
      setShipments([]);
    } finally {
      setIsLoading(false);
    }
  }, [locale]);

  useEffect(() => {
    loadShipments();
  }, [loadShipments]);

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

  const upsertShipment = (shipment: ShipmentUpdate) => {
    setShipments(prev => {
      const exists = prev.some(s => s.id === shipment.id);
      if (!exists) return [shipment, ...prev];
      return prev.map(s => s.id === shipment.id ? shipment : s);
    });
    setSelectedShipment(shipment);
  };

  const handleSaveShipment = async () => {
    if (!selectedShipment) return;

    try {
      setIsSaving(true);

      const response = await fetch('/api/korea/shipment-updates', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedShipment.id,
          carrier: editCarrier,
          trackingNumber: editTracking,
          destinationAddress: editAddress,
          contactPerson: editContact,
          contactPhone: editPhone,
          packagingNote: editPackagingNote || null,
          items: editItems,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || 'Failed to save shipment');
      }

      if (data?.shipment) {
        upsertShipment(normalizeShipment(data.shipment));
      }

      alert(locale === 'ko' ? '저장되었습니다!' : 'Saved successfully!');
    } catch (error) {
      console.error('Failed to save shipment:', error);
      alert(locale === 'ko' ? '저장에 실패했습니다.' : 'Failed to save shipment.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddUpdate = async () => {
    if (!selectedShipment) return;

    try {
      setIsSaving(true);

      const timestamp = getCurrentTimestamp();
      const updateEntry = {
        timestamp,
        location: selectedShipment.currentLocation || '-',
        status: getStatusInfo(selectedShipment.currentStatus).label,
        notes: locale === 'ko' ? '배송 정보가 갱신되었습니다.' : 'Shipment details were updated.',
      };

      const response = await fetch('/api/korea/shipment-updates', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedShipment.id,
          carrier: editCarrier,
          trackingNumber: editTracking,
          destinationAddress: editAddress,
          contactPerson: editContact,
          contactPhone: editPhone,
          packagingNote: editPackagingNote || null,
          items: editItems,
          appendUpdate: updateEntry,
          lastUpdate: timestamp,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || 'Failed to append shipment update');
      }

      if (data?.shipment) {
        upsertShipment(normalizeShipment(data.shipment));
      }

      alert(
        locale === 'ko'
          ? `${selectedShipment.shipmentNumber} 업데이트가 추가되었습니다!`
          : `Update added for ${selectedShipment.shipmentNumber}!`
      );
      closeModal();
    } catch (error) {
      console.error('Failed to add shipment update:', error);
      alert(locale === 'ko' ? '업데이트 추가에 실패했습니다.' : 'Failed to add shipment update.');
    } finally {
      setIsSaving(false);
    }
  };

  const destMap: Record<string, string> = { Korea: 'KR', Brunei: 'BN', Thailand: 'TH', Vietnam: 'VN' };

  const generateShipmentNumber = async () => {
    try {
      const response = await fetch('/api/documents/generate-number', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'sh' })
      });
      const data = await response.json();
      if (data.success && data.docNo) {
        setNewShipment(p => ({ ...p, shipmentNumber: data.docNo }));
      }
    } catch (error) {
      console.error('Failed to generate shipment number:', error);
    }
  };

  const searchProductionOrders = async (searchTerm: string) => {
    if (!searchTerm || searchTerm.length < 2) {
      setPoSearchResults([]);
      setShowPoDropdown(false);
      return;
    }

    try {
      const response = await fetch(`/api/korea/production-orders?search=${encodeURIComponent(searchTerm)}`);
      const data = await response.json();
      if (Array.isArray(data)) {
        setPoSearchResults(data);
        setShowPoDropdown(true);
      }
    } catch (error) {
      console.error('Failed to search production orders:', error);
      setPoSearchResults([]);
    }
  };

  const selectProductionOrder = (order: ProductionOrderSearchResult) => {
    const orderNo = order.orderNumber || String(order.id || '');
    setNewShipment(p => ({
      ...p,
      orderNumber: orderNo,
    }));
    setPoSearchQuery(orderNo);
    setShowPoDropdown(false);
    setShowPoSearchModal(false);
  };

  const openPoSearchModal = async () => {
    setShowPoSearchModal(true);
    try {
      const response = await fetch('/api/korea/production-orders');
      const data = await response.json();
      if (Array.isArray(data)) {
        setAllProductionOrders(data);
      }
    } catch (error) {
      console.error('Failed to load production orders:', error);
    }
  };

  const resetNewShipmentForm = () => {
    setNewShipment({
      shipmentNumber: '', orderNumber: '', destination: 'Korea', destCode: 'KR',
      shipmentMethod: 'sea', currentStatus: 'preparing', currentLocation: '',
      estimatedDelivery: '', trackingNumber: '', carrier: '', destinationAddress: '',
      contactPerson: '', contactPhone: '', packagingNote: '', totalWeight: '', totalBoxes: 0,
    });
    setNewItems([{ productName: '', productCode: '', quantity: 0, unit: 'pcs', weight: '' }]);
    setPoSearchQuery('');
    setPoSearchResults([]);
    setShowPoDropdown(false);
  };

  const handleCreateShipment = async () => {
    if (!newShipment.shipmentNumber || !newShipment.orderNumber) {
      alert(locale === 'ko' ? '배송번호와 주문번호를 입력하세요.' : 'Please enter shipment number and order number.');
      return;
    }

    try {
      setIsSaving(true);

      const timestamp = getCurrentTimestamp();
      const response = await fetch('/api/korea/shipment-updates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: `ship-${Date.now()}`,
          ...newShipment,
          lastUpdate: timestamp,
          packagingNote: newShipment.packagingNote || null,
          items: newItems.filter(it => it.productName),
          updates: [
            {
              timestamp,
              location: newShipment.currentLocation || '-',
              status: 'Preparing',
              notes: locale === 'ko' ? '배송 등록됨' : 'Shipment registered',
            },
          ],
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || 'Failed to create shipment');
      }

      const created: ShipmentUpdate = normalizeShipment({
        id: data?.id || `ship-${Date.now()}`,
        ...newShipment,
        lastUpdate: timestamp,
        items: newItems.filter(it => it.productName),
        updates: [
          {
            timestamp,
            location: newShipment.currentLocation || '-',
            status: 'Preparing',
            notes: locale === 'ko' ? '배송 등록됨' : 'Shipment registered',
          },
        ],
      });

      setShipments(prev => [created, ...prev]);
      setIsAddModalOpen(false);
      resetNewShipmentForm();
      alert(locale === 'ko' ? '배송이 등록되었습니다!' : 'Shipment created!');
    } catch (error) {
      console.error('Failed to create shipment:', error);
      alert(locale === 'ko' ? '배송 등록에 실패했습니다.' : 'Failed to create shipment.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleNewItemChange = (index: number, field: keyof ShipmentItem, value: string | number) => {
    setNewItems(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item));
  };

  const searchProducts = async (keyword: string, rowIndex: number) => {
    const q = keyword.trim();
    if (!q) {
      setProductSearchResults([]);
      setProductSearchLoading(false);
      setActiveProductRow(null);
      return;
    }

    try {
      setProductSearchLoading(true);
      const response = await fetch(`/api/products?q=${encodeURIComponent(q)}&limit=20`);
      const data = await response.json();
      if (Array.isArray(data?.products)) {
        setProductSearchResults(data.products);
        setActiveProductRow(rowIndex);
      } else {
        setProductSearchResults([]);
      }
    } catch (error) {
      console.error('Failed to search products:', error);
      setProductSearchResults([]);
    } finally {
      setProductSearchLoading(false);
    }
  };

  const handleProductInputChange = (index: number, value: string) => {
    setNewItems(prev => prev.map((item, i) => (
      i === index
        ? { ...item, productName: value, productCode: value ? item.productCode : '', unit: value ? item.unit : 'pcs', weight: value ? item.weight : '' }
        : item
    )));

    setActiveProductRow(index);
    if (productSearchTimeout.current) window.clearTimeout(productSearchTimeout.current);

    if (!value.trim()) {
      setProductSearchResults([]);
      setProductSearchLoading(false);
      return;
    }

    productSearchTimeout.current = window.setTimeout(() => {
      searchProducts(value, index);
    }, 250) as unknown as number;
  };

  const handleProductSelect = (index: number, product: ProductSearchResult) => {
    setNewItems(prev => prev.map((item, i) => (
      i === index
        ? {
            ...item,
            productName: product.name || '',
            productCode: product.sku || '',
            unit: product.unit || item.unit || 'pcs',
            weight: product.weight || item.weight || '',
          }
        : item
    )));
    setProductSearchResults([]);
    setActiveProductRow(null);
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
        {loadError && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {loadError}
          </div>
        )}

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
            <div className="flex gap-2">
              <button
                onClick={loadShipments}
                disabled={isLoading}
                className="px-4 py-2 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors flex items-center gap-2 text-sm disabled:opacity-50"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {locale === 'ko' ? 'รีเฟรช' : 'Refresh'}
              </button>
              <button
                onClick={() => { setIsAddModalOpen(true); generateShipmentNumber(); }}
                className="px-4 py-2 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors flex items-center gap-2 text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                {locale === 'ko' ? '배송 추가' : 'Add Shipment'}
              </button>
            </div>
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
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-10 text-center text-sm text-gray-500">
                      {locale === 'ko' ? '배송 데이터를 불러오는 중...' : 'Loading shipment data...'}
                    </td>
                  </tr>
                ) : shipments.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-10 text-center text-sm text-gray-500">
                      {locale === 'ko' ? '등록된 배송이 없습니다.' : 'No shipment updates found.'}
                    </td>
                  </tr>
                ) : shipments.map((shipment) => {
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
                        <div className="text-xs text-gray-500">{formatDateOnly(shipment.lastUpdate)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatDateOnly(shipment.estimatedDelivery)}</div>
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
                    <p className="font-semibold text-gray-900">{formatDateOnly(selectedShipment.estimatedDelivery)}</p>
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
                  <p className="font-semibold text-gray-800">{formatDateOnly(selectedShipment.lastUpdate)}</p>
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
                    <p className="text-xs text-gray-600 mb-1">{locale === 'ko' ? '총 박스 수' : 'Total Boxes'}</p>
                    <p className="text-2xl font-bold text-purple-600">{Number(selectedShipment.totalBoxes || 0) > 0 ? selectedShipment.totalBoxes : '-'}</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button onClick={closeModal} className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg">
                  {t.close}
                </button>
                <button onClick={handleSaveShipment} disabled={isSaving} className="flex-1 px-6 py-3 bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white font-medium rounded-lg">
                  {isSaving ? (locale === 'ko' ? '저장 중...' : 'Saving...') : (locale === 'ko' ? '저장' : 'Save')}
                </button>
                <button onClick={handleAddUpdate} disabled={isSaving} className="flex-1 px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-medium rounded-lg">
                  {isSaving ? (locale === 'ko' ? '처리 중...' : 'Working...') : (locale === 'ko' ? '업데이트 추가' : 'Add Update')}
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
                  <div className="flex gap-2">
                    <input type="text" value={newShipment.shipmentNumber} onChange={e => setNewShipment(p => ({ ...p, shipmentNumber: e.target.value }))} placeholder="SH-2026-XX-00X" className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500" readOnly />
                    <button
                      onClick={generateShipmentNumber}
                      className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium"
                      title={locale === 'ko' ? '새 번호 생성' : 'Generate New Number'}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="relative">
                  <label className="text-sm text-gray-600 mb-1 block">{locale === 'ko' ? '주문번호' : 'Order No.'} *</label>
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={poSearchQuery}
                        onChange={e => {
                          const value = e.target.value;
                          setPoSearchQuery(value);
                          setNewShipment(p => ({ ...p, orderNumber: value }));
                          searchProductionOrders(value);
                        }}
                        onFocus={() => {
                          if (poSearchResults.length > 0) setShowPoDropdown(true);
                        }}
                        placeholder="PO-2026-00X"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                      {showPoDropdown && poSearchResults.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                          {poSearchResults.map((order, idx) => (
                            <div
                              key={idx}
                              onClick={() => selectProductionOrder(order)}
                              className="px-3 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                            >
                              <div className="font-medium text-sm text-gray-800">{order.orderNumber || order.id}</div>
                              <div className="text-xs text-gray-600">
                                {order.product} • {order.customerName} • {order.quantity} units
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={openPoSearchModal}
                      className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium"
                      title={locale === 'ko' ? 'ค้นหา PO' : 'Search PO'}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </button>
                  </div>
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
              <div ref={productSearchRef}>
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
                        <div className="col-span-2 md:col-span-1 relative">
                          <input
                            type="text"
                            value={item.productName}
                            onChange={e => handleProductInputChange(i, e.target.value)}
                            onFocus={() => {
                              setActiveProductRow(i);
                              if (item.productName.trim()) {
                                searchProducts(item.productName, i);
                              }
                            }}
                            placeholder={locale === 'ko' ? '상품 검색 및 선택' : 'Search and select product'}
                            className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-green-500"
                          />
                          <div className="mt-1 text-[11px] text-gray-500">
                            {locale === 'ko' ? '상품명 또는 SKU로 검색 후 선택하세요.' : 'Search by product name or SKU, then select.'}
                          </div>
                          {activeProductRow === i && (productSearchLoading || productSearchResults.length > 0 || item.productName.trim()) && (
                            <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-56 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
                              {productSearchLoading && (
                                <div className="px-3 py-2 text-xs text-gray-500">
                                  {locale === 'ko' ? '상품 검색 중...' : 'Searching products...'}
                                </div>
                              )}
                              {!productSearchLoading && productSearchResults.length === 0 && item.productName.trim() && (
                                <div className="px-3 py-2 text-xs text-gray-500">
                                  {locale === 'ko' ? '검색된 상품이 없습니다.' : 'No products found.'}
                                </div>
                              )}
                              {!productSearchLoading && productSearchResults.map((product) => (
                                <button
                                  key={product.id || product.sku || product.name}
                                  type="button"
                                  onClick={() => handleProductSelect(i, product)}
                                  className="block w-full border-b border-gray-100 px-3 py-2 text-left hover:bg-green-50 last:border-b-0"
                                >
                                  <div className="text-sm font-medium text-gray-800">{product.name || '-'}</div>
                                  <div className="text-xs text-gray-500">
                                    {product.sku ? `SKU: ${product.sku}` : locale === 'ko' ? '코드 없음' : 'No SKU'}
                                    {product.unit ? ` • ${product.unit}` : ''}
                                  </div>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        <input type="text" value={item.productCode} onChange={e => handleNewItemChange(i, 'productCode', e.target.value)} placeholder={locale === 'ko' ? '품목코드' : 'Code'} className="px-2 py-1.5 border border-gray-300 rounded text-sm font-mono focus:ring-2 focus:ring-green-500" />
                        <input type="number" value={item.quantity} onChange={e => handleNewItemChange(i, 'quantity', parseInt(e.target.value) || 0)} placeholder={locale === 'ko' ? '수량' : 'Qty'} min={0} className="px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-green-500" />
                        <input type="text" value={item.unit} onChange={e => handleNewItemChange(i, 'unit', e.target.value)} placeholder={locale === 'ko' ? '단위' : 'Unit'} className="px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-green-500" />
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
                <button onClick={handleCreateShipment} disabled={isSaving} className="flex-1 px-6 py-3 bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white font-medium rounded-lg">
                  {isSaving ? (locale === 'ko' ? '등록 중...' : 'Creating...') : (locale === 'ko' ? '배송 등록' : 'Create Shipment')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PO Search Modal */}
      {showPoSearchModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-500 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">
                {locale === 'ko' ? 'ค้นหา Production Order' : 'Search Production Order'}
              </h2>
              <button onClick={() => setShowPoSearchModal(false)} className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              {allProductionOrders.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <svg className="w-16 h-16 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-lg font-medium">{locale === 'ko' ? 'ไม่มี Production Order' : 'No Production Orders'}</p>
                  <p className="text-sm mt-1">{locale === 'ko' ? 'กรุณาสร้าง PO ก่อน' : 'Please create a PO first'}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {allProductionOrders.map((order, idx) => (
                    <div
                      key={idx}
                      onClick={() => selectProductionOrder(order)}
                      className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-bold text-blue-600">{order.orderNumber || order.id}</span>
                            {order.status && (
                              <span className={`px-2 py-0.5 text-xs rounded-full ${
                                order.status === 'ready' ? 'bg-green-100 text-green-800' :
                                order.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {order.status}
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-700">
                            <p className="font-medium">{order.product}</p>
                            <p className="text-gray-600 mt-1">
                              {locale === 'ko' ? '고객' : 'Customer'}: {order.customerName || '-'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">{locale === 'ko' ? '수량' : 'Qty'}</p>
                          <p className="text-lg font-bold text-gray-800">{order.quantity}</p>
                          {order.dueDate && (
                            <p className="text-xs text-gray-500 mt-1">{order.dueDate}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
