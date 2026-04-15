'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from '@/lib/LocaleContext';
import { translations } from '@/lib/translations';
import CountryFlag from '@/components/CountryFlag';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { ArrowLeft, Globe, Eye, Trash2, X, Search as SearchIcon, Plane, Ship, Truck, Package, Clock, AlertCircle, FileText, CheckCircle } from 'lucide-react';

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
  branchCountry: 'Brunei' | 'Thailand' | 'Vietnam';
  branchCountryCode: 'BN' | 'TH' | 'VN';
  destination: string;
  destinationAddress: string;
  status: 'packed' | 'ready-to-ship' | 'in-transit' | 'delivered' | 'delayed';
  shipDate?: string;
  estimatedDelivery: string;
  actualDelivery?: string;
  carrier?: string;
  trackingNumber?: string;
  priority: 'urgent' | 'normal' | 'low';
  customerName: string;
  contactPerson: string;
  contactPhone: string;
  items: ShipmentItem[];
  totalWeight: string;
  totalBoxes: number;
  shipmentMethod: 'truck' | 'motorcycle' | 'express';
  shippingCost: number;
  currency: string;
  estimatedTransitDays: number;
  updates?: {
    timestamp: string;
    location: string;
    status: string;
    notes: string;
  }[];
}

interface InternationalShipment {
  id: string;
  shipmentNumber: string;
  orderNumber: string;
  destination: 'Brunei' | 'Thailand' | 'Vietnam';
  destinationCode: 'BN' | 'TH' | 'VN';
  destinationAddress: string;
  status: 'packed' | 'ready-to-ship' | 'customs-processing' | 'in-transit' | 'customs-clearance' | 'delivered' | 'delayed';
  shipDate?: string;
  estimatedDelivery: string;
  actualDelivery?: string;
  carrier?: string;
  trackingNumber?: string;
  priority: 'urgent' | 'normal' | 'low';
  customerName: string;
  contactPerson: string;
  contactPhone: string;
  items: ShipmentItem[];
  packagingNote?: string;
  totalWeight: string;
  totalBoxes: number;
  shipmentMethod: 'sea' | 'land' | 'air';
  shippingCost: number;
  currency: string;
  estimatedTransitDays: number;
  customsDocuments?: string[];
  shipmentType: 'hq-to-branch' | 'local-delivery'; // Korea HQ to international branch vs local branch delivery
  updates?: {
    timestamp: string;
    location: string;
    status: string;
    notes: string;
  }[];
}

// Animated Vehicle Component
const AnimatedVehicle = ({ method, status }: { method: string; status: string }) => {
  const getVehicleIcon = () => {
    switch (method) {
      case 'sea':
        return <Ship className="h-5 w-5 text-blue-600" />;
      case 'air':
        return <Plane className="h-5 w-5 text-sky-600" />;
      case 'land':
        return <Truck className="h-5 w-5 text-green-600" />;
      default:
        return <Package className="h-5 w-5 text-gray-600" />;
    }
  };

  const getAnimationClass = () => {
    switch (status) {
      case 'packed':
        return '';
      case 'ready-to-ship':
        return 'animate-pulse';
      case 'in-transit':
        return method === 'sea' ? 'animate-bounce' : method === 'air' ? 'animate-ping' : 'animate-pulse';
      case 'customs-processing':
      case 'customs-clearance':
        return 'animate-bounce';
      case 'delivered':
        return '';
      case 'delayed':
        return 'animate-pulse opacity-50';
      default:
        return '';
    }
  };

  const getProgressPosition = () => {
    switch (status) {
      case 'packed':
        return '0%';
      case 'ready-to-ship':
        return '10%';
      case 'customs-processing':
        return '25%';
      case 'in-transit':
        return '60%';
      case 'customs-clearance':
        return '85%';
      case 'delivered':
        return '100%';
      case 'delayed':
        return '40%';
      default:
        return '0%';
    }
  };

  return (
    <div className="relative w-full h-8 bg-gray-100 rounded-full overflow-hidden">
      {/* Progress Track */}
      <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-200 to-green-200 rounded-full transition-all duration-1000"
           style={{ width: getProgressPosition() }}>
      </div>
      
      {/* Moving Vehicle */}
      <div className={`absolute top-1/2 transform -translate-y-1/2 transition-all duration-2000 ease-in-out ${getAnimationClass()}`}
           style={{ left: getProgressPosition(), transform: 'translateY(-50%) translateX(-50%)' }}>
        <div className="bg-white rounded-full p-1 shadow-md border">
          {getVehicleIcon()}
        </div>
      </div>
      
      {/* Status Dots */}
      <div className="absolute top-1/2 left-2 transform -translate-y-1/2 w-2 h-2 bg-gray-400 rounded-full"></div>
      <div className="absolute top-1/2 left-1/4 transform -translate-y-1/2 -translate-x-1/2 w-2 h-2 bg-orange-400 rounded-full"></div>
      <div className="absolute top-1/2 left-3/4 transform -translate-y-1/2 -translate-x-1/2 w-2 h-2 bg-yellow-400 rounded-full"></div>
      <div className="absolute top-1/2 right-2 transform -translate-y-1/2 w-2 h-2 bg-green-400 rounded-full"></div>
    </div>
  );
};

export default function InternationalShipmentsPage() {
  const router = useRouter();
  const { locale } = useLocale();
  const t = translations[locale];
  const [selectedShipment, setSelectedShipment] = useState<InternationalShipment | null>(null);
  const [selectedDomesticShipment, setSelectedDomesticShipment] = useState<DomesticShipment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDomesticModalOpen, setIsDomesticModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [countryFilter, setCountryFilter] = useState('all');
  const [shipmentTypeFilter, setShipmentTypeFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDomesticCountry, setSelectedDomesticCountry] = useState<string>('all');

  const countries = [
    { code: 'BN', name: 'Brunei', flag: 'BN', currency: 'B$', color: 'bg-emerald-500' },
    { code: 'TH', name: 'Thailand', flag: 'TH', currency: '฿', color: 'bg-red-500' },
    { code: 'VN', name: 'Vietnam', flag: 'VN', currency: '₫', color: 'bg-yellow-500' },
  ];

  // Sample data for international shipments to overseas branches only
  const [shipments, setShipments] = useState<InternationalShipment[]>([
    {
      id: '1',
      shipmentNumber: 'IS-2026-001',
      orderNumber: 'IO-2026-001',
      destination: 'Brunei',
      destinationCode: 'BN',
      destinationAddress: '45 Jalan Menteri Besar, Bandar Seri Begawan, Brunei BD1710',
      status: 'customs-clearance',
      shipDate: '2026-02-12',
      estimatedDelivery: '2026-02-18',
      carrier: 'Brunei Express Logistics',
      trackingNumber: 'BEL987654321BN',
      priority: 'normal',
      customerName: 'Brunei Utilities Ltd.',
      contactPerson: 'Ahmad Hassan',
      contactPhone: '+673-222-3456',
      totalWeight: '180 kg',
      totalBoxes: 4,
      shipmentMethod: 'sea',
      shippingCost: 850,
      currency: 'USD',
      estimatedTransitDays: 7,
      shipmentType: 'hq-to-branch',
      customsDocuments: ['Bill of Lading', 'Commercial Invoice', 'Import License'],
      items: [
        { productName: 'KSAVE Energy Monitor Pro', productCode: 'EMP-2024', quantity: 30, unit: 'pcs', weight: '120 kg' },
        { productName: 'KSAVE Smart Sensors', productCode: 'SS-V2', quantity: 30, unit: 'sets', weight: '60 kg' }
      ],
      updates: [
        { timestamp: '2026-02-15 11:30', location: 'Muara Port - Customs', status: 'Customs Inspection', notes: 'Under customs inspection, expected clearance today' },
        { timestamp: '2026-02-14 18:00', location: 'Muara Port', status: 'Arrived at Port', notes: 'Vessel MS Pacific Star arrived at destination port' },
        { timestamp: '2026-02-12 10:00', location: 'Port of Busan', status: 'Departed', notes: 'Loaded on vessel MS Pacific Star, voyage BN-240212' }
      ]
    },
    {
      id: '2',
      shipmentNumber: 'IS-2026-002',
      orderNumber: 'IO-2026-002',
      destination: 'Thailand',
      destinationCode: 'TH',
      destinationAddress: '789 Sukhumvit Road, Watthana, Bangkok, Thailand 10110',
      status: 'in-transit',
      shipDate: '2026-02-13',
      estimatedDelivery: '2026-02-19',
      carrier: 'Bangkok Cargo Express',
      trackingNumber: 'BCE9876543210TH',
      priority: 'normal',
      customerName: 'Bangkok Smart Energy Co., Ltd.',
      contactPerson: 'Somchai Prasert',
      contactPhone: '+66-2-345-6789',
      totalWeight: '320 kg',
      totalBoxes: 6,
      shipmentMethod: 'sea',
      shippingCost: 45000,
      currency: 'THB',
      estimatedTransitDays: 6,
      shipmentType: 'local-delivery',
      packagingNote: 'Waterproof packaging required - monsoon season',
      customsDocuments: ['Export Declaration', 'Commercial Invoice', 'Thai Import Permit'],
      items: [
        { productName: 'KSAVE Industrial Controller', productCode: 'IC-X500', quantity: 40, unit: 'pcs', weight: '200 kg', dimensions: '60x50x40 cm' },
        { productName: 'KSAVE Cooling System', productCode: 'CS-T300', quantity: 40, unit: 'pcs', weight: '120 kg', dimensions: '45x35x25 cm' }
      ],
      updates: [
        { timestamp: '2026-02-15 08:00', location: 'South China Sea', status: 'In Transit - Sea', notes: 'Vessel en route to Laem Chabang Port, weather conditions favorable' },
        { timestamp: '2026-02-13 14:00', location: 'Port of Busan', status: 'Departed', notes: 'Departed on vessel MS Thai Express, ETA Bangkok 2026-02-18' },
        { timestamp: '2026-02-13 08:00', location: 'Busan HQ Warehouse', status: 'Cargo Prepared', notes: 'Sea freight cargo prepared and loaded' }
      ]
    },
    {
      id: '3',
      shipmentNumber: 'IS-2026-003',
      orderNumber: 'IO-2026-003',
      destination: 'Vietnam',
      destinationCode: 'VN',
      destinationAddress: '456 Nguyen Hue Boulevard, District 1, Ho Chi Minh City, Vietnam 700000',
      status: 'delayed',
      shipDate: '2026-02-14',
      estimatedDelivery: '2026-02-17',
      carrier: 'Vietnam Logistics Express',
      trackingNumber: 'VLE1234567890VN',
      priority: 'urgent',
      customerName: 'Vietnam Green Technology JSC',
      contactPerson: 'Nguyen Van An',
      contactPhone: '+84-28-765-4321',
      totalWeight: '210 kg',
      totalBoxes: 5,
      shipmentMethod: 'air',
      shippingCost: 2800000,
      currency: 'VND',
      estimatedTransitDays: 2,
      shipmentType: 'hq-to-branch',
      customsDocuments: ['Air Waybill', 'Commercial Invoice', 'Vietnam Import License'],
      items: [
        { productName: 'KSAVE Smart Gateway', productCode: 'SG-2024', quantity: 35, unit: 'pcs', weight: '140 kg' },
        { productName: 'KSAVE Network Module', productCode: 'NM-W100', quantity: 35, unit: 'pcs', weight: '70 kg' }
      ],
      updates: [
        { timestamp: '2026-02-15 15:00', location: 'Ho Chi Minh Airport', status: 'Customs Delay', notes: 'Additional documentation required, estimated 24-hour delay' },
        { timestamp: '2026-02-14 22:00', location: 'Tan Son Nhat Airport', status: 'Arrived', notes: 'Flight VN456 arrived, awaiting customs clearance' },
        { timestamp: '2026-02-14 16:00', location: 'Gimhae International Airport', status: 'Departed', notes: 'Air freight departed for Ho Chi Minh City' },
        { timestamp: '2026-02-14 09:00', location: 'Busan HQ', status: 'Prepared', notes: 'Urgent air shipment prepared' }
      ]
    },
    {
      id: '4',
      shipmentNumber: 'IS-2026-004',
      orderNumber: 'IO-2026-004',
      destination: 'Thailand',
      destinationCode: 'TH',
      destinationAddress: '321 Chiang Mai Technology Park, Chiang Mai, Thailand 50200',
      status: 'ready-to-ship',
      estimatedDelivery: '2026-02-22',
      carrier: 'Thai Logistics Network',
      trackingNumber: 'TLN555666777TH',
      priority: 'low',
      customerName: 'Chiang Mai Solar Solutions',
      contactPerson: 'Apinya Techaphan',
      contactPhone: '+66-53-987-6543',
      totalWeight: '150 kg',
      totalBoxes: 3,
      shipmentMethod: 'land',
      shippingCost: 25000,
      currency: 'THB',
      estimatedTransitDays: 5,
      shipmentType: 'local-delivery',
      packagingNote: 'Standard packaging for overland transport',
      customsDocuments: ['Transit Declaration', 'Commercial Invoice'],
      items: [
        { productName: 'KSAVE Solar Integration Kit', productCode: 'SIK-2024', quantity: 25, unit: 'sets', weight: '100 kg' },
        { productName: 'KSAVE Monitoring Software', productCode: 'MS-PRO', quantity: 25, unit: 'licenses', weight: '1 kg' },
        { productName: 'Installation Tools', productCode: 'TOOLS-STD', quantity: 1, unit: 'set', weight: '49 kg' }
      ],
      updates: [
        { timestamp: '2026-02-15 17:00', location: 'Busan HQ Warehouse', status: 'Ready for Shipment', notes: 'All items packed and ready for overland transport to Thailand' },
        { timestamp: '2026-02-15 10:00', location: 'Busan HQ', status: 'Order Confirmed', notes: 'Order processing completed, preparing for shipment' }
      ]
    },
    {
      id: '5',
      shipmentNumber: 'IS-2026-005',
      orderNumber: 'IO-2026-005',
      destination: 'Brunei',
      destinationCode: 'BN',
      destinationAddress: '88 Simpang 88, Temburong District, Brunei BE1318',
      status: 'packed',
      estimatedDelivery: '2026-02-25',
      priority: 'normal',
      customerName: 'Temburong Energy Initiative',
      contactPerson: 'Hajah Siti Aminah',
      contactPhone: '+673-444-5678',
      totalWeight: '95 kg',
      totalBoxes: 2,
      shipmentMethod: 'sea',
      shippingCost: 650,
      currency: 'USD',
      estimatedTransitDays: 10,
      shipmentType: 'hq-to-branch',
      customsDocuments: ['Bill of Lading', 'Environmental Certificate'],
      items: [
        { productName: 'KSAVE Eco-Friendly Model', productCode: 'ECO-2024', quantity: 15, unit: 'pcs', weight: '75 kg' },
        { productName: 'Eco Installation Kit', productCode: 'ECO-KIT', quantity: 15, unit: 'sets', weight: '20 kg' }
      ],
      updates: [
        { timestamp: '2026-02-15 16:00', location: 'Busan HQ Warehouse', status: 'Packed', notes: 'Eco-friendly packaging completed, awaiting vessel schedule' },
        { timestamp: '2026-02-15 09:00', location: 'Busan HQ', status: 'Processing', notes: 'Special eco-friendly packaging in progress' }
      ]
    }
  ]);

  // Sample domestic shipments data for each branch
  const [domesticShipments] = useState<DomesticShipment[]>([
    // Brunei Branch - Local Deliveries
    {
      id: 'BD-001',
      shipmentNumber: 'BD-2026-001',
      orderNumber: 'BDO-2026-001',
      branchCountry: 'Brunei',
      branchCountryCode: 'BN',
      destination: 'Bandar Seri Begawan City Center',
      destinationAddress: '15 Jalan Sultan, Bandar Seri Begawan BA1910, Brunei',
      status: 'in-transit',
      shipDate: '2026-02-15',
      estimatedDelivery: '2026-02-16',
      carrier: 'Brunei Local Express',
      trackingNumber: 'BLE2026001',
      priority: 'normal',
      customerName: 'Brunei Smart Home Solutions',
      contactPerson: 'Haji Rahman',
      contactPhone: '+673-223-1234',
      totalWeight: '25 kg',
      totalBoxes: 2,
      shipmentMethod: 'truck',
      shippingCost: 50,
      currency: 'BND',
      estimatedTransitDays: 1,
      items: [
        { productName: 'KSAVE Home Monitor', productCode: 'HM-2024', quantity: 5, unit: 'pcs', weight: '25 kg' }
      ],
      updates: [
        { timestamp: '2026-02-15 14:00', location: 'Brunei Branch Hub', status: 'Departed for delivery', notes: 'Out for local delivery' }
      ]
    },
    {
      id: 'BD-002',
      shipmentNumber: 'BD-2026-002',
      orderNumber: 'BDO-2026-002',
      branchCountry: 'Brunei',
      branchCountryCode: 'BN',
      destination: 'Kuala Belait Industrial Area',
      destinationAddress: '78 Jalan Tengah, Kuala Belait KA1131, Brunei',
      status: 'delivered',
      shipDate: '2026-02-14',
      estimatedDelivery: '2026-02-15',
      actualDelivery: '2026-02-15',
      carrier: 'Brunei Industrial Logistics',
      trackingNumber: 'BIL2026002',
      priority: 'normal',
      customerName: 'Belait Manufacturing Co.',
      contactPerson: 'Pengiran Ahmad',
      contactPhone: '+673-334-5678',
      totalWeight: '45 kg',
      totalBoxes: 3,
      shipmentMethod: 'truck',
      shippingCost: 85,
      currency: 'BND',
      estimatedTransitDays: 1,
      items: [
        { productName: 'KSAVE Industrial Sensor', productCode: 'IS-2024', quantity: 10, unit: 'pcs', weight: '45 kg' }
      ]
    },
    // Thailand Branch - Local Deliveries
    {
      id: 'TD-001',
      shipmentNumber: 'TD-2026-001',
      orderNumber: 'TDO-2026-001',
      branchCountry: 'Thailand',
      branchCountryCode: 'TH',
      destination: 'Bangkok Metropolitan',
      destinationAddress: '456 Sukhumvit 21, Asoke, Bangkok 10110, Thailand',
      status: 'ready-to-ship',
      estimatedDelivery: '2026-02-17',
      carrier: 'Bangkok Local Delivery',
      trackingNumber: 'BLD2026001',
      priority: 'urgent',
      customerName: 'Bangkok Office Solutions',
      contactPerson: 'Khun Somchai',
      contactPhone: '+66-2-123-4567',
      totalWeight: '30 kg',
      totalBoxes: 2,
      shipmentMethod: 'motorcycle',
      shippingCost: 250,
      currency: 'THB',
      estimatedTransitDays: 1,
      items: [
        { productName: 'KSAVE Office Kit', productCode: 'OK-2024', quantity: 8, unit: 'pcs', weight: '30 kg' }
      ]
    },
    {
      id: 'TD-002',
      shipmentNumber: 'TD-2026-002',
      orderNumber: 'TDO-2026-002',
      branchCountry: 'Thailand',
      branchCountryCode: 'TH',
      destination: 'Phuket Province',
      destinationAddress: '89 Patong Beach Road, Kathu, Phuket 83150, Thailand',
      status: 'packed',
      estimatedDelivery: '2026-02-18',
      carrier: 'South Thailand Express',
      trackingNumber: 'STE2026002',
      priority: 'normal',
      customerName: 'Phuket Resort Energy',
      contactPerson: 'Khun Niran',
      contactPhone: '+66-76-987-6543',
      totalWeight: '60 kg',
      totalBoxes: 4,
      shipmentMethod: 'truck',
      shippingCost: 800,
      currency: 'THB',
      estimatedTransitDays: 2,
      items: [
        { productName: 'KSAVE Resort System', productCode: 'RS-2024', quantity: 12, unit: 'pcs', weight: '60 kg' }
      ]
    },
    // Vietnam Branch - Local Deliveries
    {
      id: 'VD-001',
      shipmentNumber: 'VD-2026-001',
      orderNumber: 'VDO-2026-001',
      branchCountry: 'Vietnam',
      branchCountryCode: 'VN',
      destination: 'Ho Chi Minh City District 3',
      destinationAddress: '123 Nam Ky Khoi Nghia Street, District 3, Ho Chi Minh City 700000, Vietnam',
      status: 'delayed',
      shipDate: '2026-02-14',
      estimatedDelivery: '2026-02-16',
      carrier: 'HCMC Fast Delivery',
      trackingNumber: 'HFD2026001',
      priority: 'urgent',
      customerName: 'Saigon Tech Solutions',
      contactPerson: 'Nguyen Thanh Phong',
      contactPhone: '+84-28-123-4567',
      totalWeight: '35 kg',
      totalBoxes: 3,
      shipmentMethod: 'motorcycle',
      shippingCost: 150000,
      currency: 'VND',
      estimatedTransitDays: 1,
      items: [
        { productName: 'KSAVE City Monitor', productCode: 'CM-2024', quantity: 7, unit: 'pcs', weight: '35 kg' }
      ]
    },
    {
      id: 'VD-002',
      shipmentNumber: 'VD-2026-002',
      orderNumber: 'VDO-2026-002',
      branchCountry: 'Vietnam',
      branchCountryCode: 'VN',
      destination: 'Hanoi Central District',
      destinationAddress: '67 Hoan Kiem Lake Area, Hoan Kiem District, Hanoi 100000, Vietnam',
      status: 'in-transit',
      shipDate: '2026-02-15',
      estimatedDelivery: '2026-02-17',
      carrier: 'Hanoi Express Line',
      trackingNumber: 'HEL2026002',
      priority: 'normal',
      customerName: 'Hanoi Government Building',
      contactPerson: 'Le Van Duc',
      contactPhone: '+84-24-987-6543',
      totalWeight: '80 kg',
      totalBoxes: 5,
      shipmentMethod: 'truck',
      shippingCost: 300000,
      currency: 'VND',
      estimatedTransitDays: 2,
      items: [
        { productName: 'KSAVE Government Package', productCode: 'GP-2024', quantity: 15, unit: 'pcs', weight: '80 kg' }
      ]
    }
  ]);

  const filteredShipments = shipments.filter(shipment => {
    const matchesSearch = shipment.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         shipment.shipmentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         shipment.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         shipment.trackingNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || shipment.status === statusFilter;
    const matchesCountry = countryFilter === 'all' || shipment.destinationCode === countryFilter;
    const matchesShipmentType = shipmentTypeFilter === 'all' || shipment.shipmentType === shipmentTypeFilter;
    return matchesSearch && matchesStatus && matchesCountry && matchesShipmentType;
  });

  const getStatusBadge = (status: string) => {
    const styles = {
      'packed': 'bg-blue-100 text-blue-800',
      'ready-to-ship': 'bg-green-100 text-green-800',
      'customs-processing': 'bg-orange-100 text-orange-800',
      'in-transit': 'bg-purple-100 text-purple-800',
      'customs-clearance': 'bg-yellow-100 text-yellow-800',
      'delivered': 'bg-gray-100 text-gray-800',
      'delayed': 'bg-red-100 text-red-800',
    };

    const labels = {
      'packed': locale === 'ko' ? '포장완료' : 'Packed',
      'ready-to-ship': locale === 'ko' ? '출고대기' : 'Ready to Ship',
      'customs-processing': locale === 'ko' ? '통관처리중' : 'Customs Processing',
      'in-transit': locale === 'ko' ? '운송중' : 'In Transit',
      'customs-clearance': locale === 'ko' ? '통관대기' : 'Customs Clearance',
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

  const getKoreanStatus = (status: string) => {
    const koreanStatuses: { [key: string]: string } = {
      'packed': '포장완료',
      'ready-to-ship': '출고대기',
      'customs-processing': '통관처리중',
      'in-transit': '운송중',
      'customs-clearance': '통관대기',
      'delivered': '배송완료',
      'delayed': '지연'
    };
    return koreanStatuses[status] || status;
  };

  const getShipmentMethodIcon = (method: string) => {
    switch (method) {
      case 'air':
        return <Plane className="h-4 w-4 text-blue-600" />;
      case 'sea':
        return <Ship className="h-4 w-4 text-teal-600" />;
      case 'land':
        return <Truck className="h-4 w-4 text-orange-600" />;
      case 'truck':
        return <Truck className="h-4 w-4 text-green-600" />;
      case 'rail':
        return <Package className="h-4 w-4 text-blue-600" />;
      case 'express':
        return <Plane className="h-4 w-4 text-red-600" />;
      default:
        return <Package className="h-4 w-4 text-gray-600" />;
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'air':
      case 'express':
        return <Plane className="h-4 w-4 text-blue-600" />;
      case 'sea':
        return <Ship className="h-4 w-4 text-teal-600" />;
      case 'land':
      case 'truck':
        return <Truck className="h-4 w-4 text-green-600" />;
      case 'rail':
        return <Package className="h-4 w-4 text-blue-600" />;
      default:
        return <Package className="h-4 w-4 text-gray-600" />;
    }
  };

  const getShipmentMethodBadge = (method: string) => {
    const colors: { [key: string]: string } = {
      air: 'bg-blue-100 text-blue-800',
      sea: 'bg-teal-100 text-teal-800',
      land: 'bg-orange-100 text-orange-800',
      truck: 'bg-green-100 text-green-800',
      rail: 'bg-purple-100 text-purple-800',
      express: 'bg-red-100 text-red-800'
    };

    const labels: { [key: string]: string } = {
      air: locale === 'ko' ? '항공' : 'Air',
      sea: locale === 'ko' ? '해상' : 'Sea',
      land: locale === 'ko' ? '육로' : 'Land',
      truck: locale === 'ko' ? '트럭' : 'Truck',
      rail: locale === 'ko' ? '철도' : 'Rail',
      express: locale === 'ko' ? '특급' : 'Express'
    };

    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${colors[method] || colors.truck}`}>
        {labels[method] || method}
      </span>
    );
  };

  const formatCurrency = (amount: number, currency: string) => {
    const currencySymbols: { [key: string]: string } = {
      USD: '$',
      KRW: '₩',
      THB: '฿',
      VND: '₫',
      BND: 'B$'
    };

    const symbol = currencySymbols[currency] || currency;
    
    if (currency === 'KRW') {
      return `${symbol}${amount.toLocaleString('ko-KR')}`;
    } else if (currency === 'VND') {
      return `${amount.toLocaleString('vi-VN')}${symbol}`;
    } else {
      return `${symbol}${amount.toLocaleString()}`;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'packed':
        return <Package className="h-4 w-4 text-blue-600 animate-pulse" />;
      case 'ready-to-ship':
        return <Clock className="h-4 w-4 text-green-600" />;
      case 'customs-processing':
      case 'customs-clearance':
        return <FileText className="h-4 w-4 text-orange-600 animate-bounce" />;
      case 'in-transit':
        return <Globe className="h-4 w-4 text-purple-600 animate-spin" />;
      case 'delivered':
        return <CheckCircle className="h-4 w-4 text-gray-600" />;
      case 'delayed':
        return <AlertCircle className="h-4 w-4 text-red-600 animate-pulse" />;
      default:
        return <Package className="h-4 w-4 text-gray-600" />;
    }
  };

  const handleDelete = (id: string) => {
    setShipments(shipments.filter(s => s.id !== id));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-300">
      {/* Header */}
      <header className="bg-gradient-to-r from-gray-200 to-gray-100 shadow-xl border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
          <div className="flex justify-between items-center h-24">
            <div className="flex items-center space-x-6">
              <button 
                onClick={() => router.back()}
                className="p-4 hover:bg-gray-100 rounded-2xl transition-all duration-300 hover:shadow-lg group"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600 group-hover:text-gray-800 transition-colors" />
              </button>
              <div className="flex items-center space-x-5">
                <div className="p-4 bg-gradient-to-br from-purple-500 via-purple-600 to-blue-700 rounded-2xl shadow-xl">
                  <Globe className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-black text-gray-900 bg-gradient-to-r from-purple-700 to-blue-700 bg-clip-text text-transparent">
                    {t.internationalShipments}
                  </h1>
                  <p className="text-base text-gray-600 font-medium mt-1">
                    {t.internationalShipmentsDesc}
                  </p>
                </div>
              </div>
            </div>
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-10">
        {/* Advanced Filters */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-200 mb-10 p-6">
          <div className="mb-5">
            <h2 className="text-lg font-bold text-gray-800 mb-1">{locale === 'ko' ? '검색 및 필터' : 'Search & Filters'}</h2>
            <p className="text-xs text-gray-600">{locale === 'ko' ? '원하는 배송 정보를 빠르게 찾아보세요' : 'Find your shipment information quickly'}</p>
          </div>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-3 flex-1">
              <div className="relative flex-1 max-w-md">
                <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={locale === 'ko' ? "고객명, 배송번호, 추적번호 검색..." : "Search by customer, shipment, tracking..."}
                  className="pl-12 pr-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-gray-500/30 focus:border-gray-500 w-full shadow-sm transition-all duration-200 text-sm font-medium"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-gray-500/30 focus:border-gray-500 bg-white shadow-sm font-medium text-sm min-w-[140px]"
              >
                <option value="all">{locale === 'ko' ? '전체 상태' : 'All Status'}</option>
                <option value="packed">{locale === 'ko' ? '포장완료' : 'Packed'}</option>
                <option value="ready-to-ship">{locale === 'ko' ? '출고대기' : 'Ready to Ship'}</option>
                <option value="customs-processing">{locale === 'ko' ? '통관처리중' : 'Customs Processing'}</option>
                <option value="in-transit">{locale === 'ko' ? '운송중' : 'In Transit'}</option>
                <option value="customs-clearance">{locale === 'ko' ? '통관대기' : 'Customs Clearance'}</option>
                <option value="delivered">{locale === 'ko' ? '배송완료' : 'Delivered'}</option>
                <option value="delayed">{locale === 'ko' ? '지연' : 'Delayed'}</option>
              </select>
              <select
                value={countryFilter}
                onChange={(e) => setCountryFilter(e.target.value)}
                className="px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-gray-500/30 focus:border-gray-500 bg-white shadow-sm font-medium text-sm min-w-[140px]"
              >
                <option value="all">{locale === 'ko' ? '전체 국가' : 'All Countries'}</option>
                {countries.map(country => (
                  <option key={country.code} value={country.code}>{country.name}</option>
                ))}
              </select>
              <select
                value={shipmentTypeFilter}
                onChange={(e) => setShipmentTypeFilter(e.target.value)}
                className="px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-gray-500/30 focus:border-gray-500 bg-white shadow-sm font-medium text-sm min-w-[140px]"
              >
                <option value="all">{locale === 'ko' ? '전체 유형' : 'All Types'}</option>
                <option value="hq-to-branch">{locale === 'ko' ? '본사→해외지점' : 'HQ to Branch'}</option>
                <option value="local-delivery">{locale === 'ko' ? '지점→현지배송' : 'Local Delivery'}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Branch Domestic Deliveries Section */}
        <div className="mb-12">
          <div className="bg-gradient-to-br from-gray-500 via-gray-600 to-gray-700 rounded-3xl shadow-2xl p-8 mb-8">
            <div className="flex items-center space-x-4 mb-6">
              <div className="p-4 bg-white/25 rounded-2xl backdrop-blur-sm">
                <Truck className="h-10 w-10 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-black text-white mb-2">
                  {locale === 'ko' ? '각 지점 국내 배송' : 'Branch Domestic Deliveries'}
                </h2>
                <p className="text-gray-100 text-lg font-medium">
                  {locale === 'ko' ? '해외 지점에서 현지 고객으로의 배송 현황' : 'Local deliveries from international branches to customers'}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
              {/* All Countries Button */}
              <button
                onClick={() => setSelectedDomesticCountry('all')}
                className={`rounded-2xl p-5 text-left transition-all duration-300 transform hover:scale-105 hover:shadow-lg ${
                  selectedDomesticCountry === 'all' 
                    ? 'bg-white/35 ring-3 ring-white shadow-2xl backdrop-blur-sm' 
                    : 'bg-white/15 hover:bg-white/25'
                }`}
              >
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-8 h-6 bg-gradient-to-r from-blue-400 to-purple-500 rounded-lg flex items-center justify-center shadow-lg">
                    <Globe className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-white font-bold text-lg">{locale === 'ko' ? '전체' : 'All'}</span>
                </div>
                <div className="text-white/90 text-sm space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{locale === 'ko' ? '전체:' : 'Total:'}</span>
                    <span className="font-black text-lg">{domesticShipments.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{locale === 'ko' ? '운송중:' : 'In Transit:'}</span>
                    <span className="font-black text-lg text-yellow-200">{domesticShipments.filter(s => s.status === 'in-transit').length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{locale === 'ko' ? '배송완료:' : 'Delivered:'}</span>
                    <span className="font-black text-lg text-green-200">{domesticShipments.filter(s => s.status === 'delivered').length}</span>
                  </div>
                </div>
              </button>
              
              {countries.map(country => {
                const branchDeliveries = domesticShipments.filter(s => s.branchCountryCode === country.code);
                const inTransit = branchDeliveries.filter(s => s.status === 'in-transit').length;
                const delivered = branchDeliveries.filter(s => s.status === 'delivered').length;
                
                return (
                  <button
                    key={country.code}
                    onClick={() => setSelectedDomesticCountry(country.code)}
                    className={`rounded-2xl p-5 text-left transition-all duration-300 transform hover:scale-105 hover:shadow-lg ${
                      selectedDomesticCountry === country.code 
                        ? 'bg-white/35 ring-3 ring-white shadow-2xl backdrop-blur-sm' 
                        : 'bg-white/15 hover:bg-white/25'
                    }`}
                  >
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="p-1 bg-white/20 rounded-lg">
                        <CountryFlag country={country.code as 'BN' | 'TH' | 'VN'} className="w-8 h-6" />
                      </div>
                      <span className="text-white font-bold text-lg">{country.name}</span>
                    </div>
                    <div className="text-white/90 text-sm space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{locale === 'ko' ? '전체:' : 'Total:'}</span>
                        <span className="font-black text-lg">{branchDeliveries.length}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{locale === 'ko' ? '운송중:' : 'In Transit:'}</span>
                        <span className="font-black text-lg text-yellow-200">{inTransit}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{locale === 'ko' ? '배송완료:' : 'Delivered:'}</span>
                        <span className="font-black text-lg text-green-200">{delivered}</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Domestic Deliveries Cards by Country */}
          <div className="space-y-6">
            {countries
              .filter(country => selectedDomesticCountry === 'all' || selectedDomesticCountry === country.code)
              .map(country => {
                const branchDeliveries = domesticShipments.filter(s => s.branchCountryCode === country.code);
                
                if (branchDeliveries.length === 0) return null;
                
                return (
                <div key={country.code} className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 px-8 py-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-white rounded-xl shadow-md">
                          <CountryFlag country={country.code as 'BN' | 'TH' | 'VN'} className="w-10 h-7" />
                        </div>
                        <div>
                          <h3 className="text-xl font-black text-gray-800">
                            {country.name} {locale === 'ko' ? '지점 - 국내 배송' : 'Branch - Domestic Deliveries'} <span className="text-blue-600">({branchDeliveries.length})</span>
                          </h3>
                          <p className="text-sm text-gray-600 font-medium mt-1">
                            {locale === 'ko' ? `${country.name} 지점에서 현지 고객으로의 배송` : `Local deliveries within ${country.name}`}
                          </p>
                        </div>
                      </div>
                      {selectedDomesticCountry !== 'all' && (
                        <button
                          onClick={() => setSelectedDomesticCountry('all')}
                          className="px-6 py-3 bg-gradient-to-r from-gray-200 to-gray-300 hover:from-gray-300 hover:to-gray-400 rounded-2xl text-sm font-bold transition-all duration-300 shadow-lg hover:shadow-xl"
                        >
                          {locale === 'ko' ? '전체 보기' : 'Show All'}
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                        <tr>
                          <th className="px-8 py-5 text-left text-xs font-black text-gray-700 uppercase tracking-wider">
                            {locale === 'ko' ? '배송번호' : 'Shipment No.'}
                          </th>
                          <th className="px-8 py-5 text-left text-xs font-black text-gray-700 uppercase tracking-wider">
                            {locale === 'ko' ? '고객정보' : 'Customer'}
                          </th>
                          <th className="px-8 py-5 text-left text-xs font-black text-gray-700 uppercase tracking-wider">
                            {locale === 'ko' ? '목적지' : 'Destination'}
                          </th>
                          <th className="px-8 py-5 text-left text-xs font-black text-gray-700 uppercase tracking-wider">
                            {locale === 'ko' ? '상태' : 'Status'}
                          </th>
                          <th className="px-8 py-5 text-left text-xs font-black text-gray-700 uppercase tracking-wider">
                            {locale === 'ko' ? '운송방법' : 'Method'}
                          </th>
                          <th className="px-8 py-5 text-left text-xs font-black text-gray-700 uppercase tracking-wider">
                            {locale === 'ko' ? '비용' : 'Cost'}
                          </th>
                          <th className="px-8 py-5 text-left text-xs font-black text-gray-700 uppercase tracking-wider">
                            {locale === 'ko' ? '작업' : 'Actions'}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {branchDeliveries.map((shipment) => (
                          <tr key={shipment.id} className="hover:bg-gray-50 transition-colors duration-150">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="space-y-2">
                                <div className="flex items-center">
                                  {getStatusIcon(shipment.status)}
                                  <div className="ml-2">
                                    <span className="text-sm font-medium text-gray-900">
                                      {shipment.shipmentNumber}
                                    </span>
                                    <div className="text-xs text-gray-500">
                                      {shipment.orderNumber}
                                    </div>
                                    {shipment.trackingNumber && (
                                      <div className="text-xs text-blue-600">
                                        {shipment.trackingNumber}
                                      </div>
                                    )}
                                  </div>
                                </div>
                                {/* Mini progress for domestic */}
                                <div className="w-full max-w-xs">
                                  <AnimatedVehicle method={shipment.shipmentMethod} status={shipment.status} />
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
                              <div>
                                <div className="text-sm font-medium text-gray-900">{shipment.destination}</div>
                                <div className="text-xs text-gray-500 max-w-xs truncate">
                                  {shipment.destinationAddress}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="space-y-1">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  getStatusBadge(shipment.status)
                                }`}>
                                  {locale === 'ko' ? getKoreanStatus(shipment.status) : shipment.status}
                                </span>
                                {getPriorityBadge(shipment.priority)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center space-x-1">
                                {shipment.shipmentMethod === 'truck' && <Truck className="h-4 w-4 text-green-600" />}
                                {shipment.shipmentMethod === 'motorcycle' && <Package className="h-4 w-4 text-orange-600" />}
                                {shipment.shipmentMethod === 'express' && <Plane className="h-4 w-4 text-red-600" />}
                                <span className="text-sm font-medium capitalize">{shipment.shipmentMethod}</span>
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                {shipment.carrier}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium text-gray-900">
                                {formatCurrency(shipment.shippingCost, shipment.currency)}
                              </div>
                              <div className="text-xs text-gray-500">
                                {shipment.totalWeight} • {shipment.totalBoxes} {locale === 'ko' ? '박스' : 'boxes'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex items-center space-x-3">
                                <button
                                  onClick={() => {
                                    setSelectedDomesticShipment(shipment);
                                    setIsDomesticModalOpen(true);
                                  }}
                                  className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded"
                                >
                                  <Eye className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* International Shipments Section */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="px-8 py-6 border-b border-gray-200 bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-gray-600 to-gray-700 rounded-2xl shadow-lg">
                <Globe className="h-7 w-7 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-gray-800">
                  {locale === 'ko' ? '국제 배송' : 'International Delivery'} <span className="text-gray-600">({filteredShipments.length})</span>
                </h3>
                <p className="text-base text-gray-600 font-medium mt-1">
                  {locale === 'ko' ? '한국 본사에서 해외 지점으로의 배송 현황' : 'Shipments from Korea HQ to international branches'}
                </p>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-4 text-left text-xs font-black text-gray-700 uppercase tracking-wider">
                    {locale === 'ko' ? '배송번호' : 'Shipment No.'}
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-black text-gray-700 uppercase tracking-wider">
                    {locale === 'ko' ? '고객정보' : 'Customer'}
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-black text-gray-700 uppercase tracking-wider">
                    {locale === 'ko' ? '목적지' : 'Destination'}
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-black text-gray-700 uppercase tracking-wider">
                    {locale === 'ko' ? '상태' : 'Status'}
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-black text-gray-700 uppercase tracking-wider">
                    {locale === 'ko' ? '운송방법' : 'Method'}
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-black text-gray-700 uppercase tracking-wider">
                    {locale === 'ko' ? '유형' : 'Type'}
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-black text-gray-700 uppercase tracking-wider">
                    {locale === 'ko' ? '비용' : 'Cost'}
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-black text-gray-700 uppercase tracking-wider">
                    {locale === 'ko' ? '작업' : 'Actions'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredShipments.map((shipment, index) => (
                  <tr key={shipment.id} className={`transition-all duration-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="space-y-2">
                        <div className="flex items-center">
                          {getStatusIcon(shipment.status)}
                          <div className="ml-2">
                            <span className="text-sm font-bold text-gray-900">
                              {shipment.shipmentNumber}
                            </span>
                            <div className="text-xs text-gray-600 font-medium">
                              {shipment.orderNumber}
                            </div>
                            {shipment.trackingNumber && (
                              <div className="text-xs text-blue-600 font-semibold truncate max-w-[100px]">
                                {shipment.trackingNumber}
                              </div>
                            )}
                          </div>
                        </div>
                        {/* Compact Animated Vehicle Progress */}
                        <div className="w-full max-w-[120px]">
                          <AnimatedVehicle method={shipment.shipmentMethod} status={shipment.status} />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="max-w-[140px]">
                        <div className="text-sm font-bold text-gray-900 truncate" title={shipment.customerName}>{shipment.customerName}</div>
                        <div className="text-xs text-gray-600 font-medium truncate mt-1" title={shipment.contactPerson}>
                          {shipment.contactPerson}
                        </div>
                        <div className="text-xs text-gray-500 font-medium truncate">
                          {shipment.contactPhone}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-start space-x-2 max-w-[160px]">
                        <CountryFlag country={shipment.destinationCode as 'BN' | 'TH' | 'VN'} className="w-5 h-4 mt-1 flex-shrink-0 shadow-sm rounded" />
                        <div className="min-w-0">
                          <div className="text-sm font-bold text-gray-900 truncate">{shipment.destination}</div>
                          <div className="text-xs text-gray-600 truncate mt-1" title={shipment.destinationAddress}>
                            {shipment.destinationAddress.split(',')[0] + '...'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="space-y-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-bold shadow-sm ${
                          getStatusBadge(shipment.status)
                        }`}>
                          {locale === 'ko' ? getKoreanStatus(shipment.status) : shipment.status.replace('-', ' ')}
                        </span>
                        <div className="mt-1">{getPriorityBadge(shipment.priority)}</div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <div className="flex-shrink-0">{getShipmentMethodIcon(shipment.shipmentMethod)}</div>
                        <div>
                          <div className="text-sm font-bold text-gray-800">{getShipmentMethodBadge(shipment.shipmentMethod)}</div>
                          <div className="text-xs text-gray-600 font-medium">
                            {shipment.estimatedTransitDays} {locale === 'ko' ? '일' : 'days'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {shipment.shipmentType === 'hq-to-branch' ? (
                          <>
                            <div className="p-1.5 bg-blue-100 rounded-lg shadow-sm">
                              <Plane className="h-3 w-3 text-blue-600" />
                            </div>
                            <div className="max-w-[80px]">
                              <span className="text-xs font-bold text-blue-700 block">
                                {locale === 'ko' ? '본사→지점' : 'HQ→Branch'}
                              </span>
                              <div className="text-xs text-gray-600 truncate font-medium" title={shipment.carrier}>
                                {shipment.carrier}
                              </div>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="p-1.5 bg-green-100 rounded-lg shadow-sm">
                              <Truck className="h-3 w-3 text-green-600" />
                            </div>
                            <div className="max-w-[80px]">
                              <span className="text-xs font-bold text-green-700 block">
                                {locale === 'ko' ? '지점→고객' : 'Branch→Customer'}
                              </span>
                              <div className="text-xs text-gray-600 truncate font-medium" title={shipment.carrier}>
                                {shipment.carrier}
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div>
                        <div className="text-sm font-bold text-gray-900">
                          {formatCurrency(shipment.shippingCost, shipment.currency)}
                        </div>
                        <div className="text-xs text-gray-600 font-medium mt-1">
                          {shipment.totalWeight} • {shipment.totalBoxes} {locale === 'ko' ? '박스' : 'boxes'}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setSelectedShipment(shipment);
                            setIsModalOpen(true);
                          }}
                          className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(shipment.id)}
                          className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
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
                {locale === 'ko' ? '국제배송 상세정보' : 'International Shipment Details'} - {selectedShipment.shipmentNumber}
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
                  <div className="space-y-2 text-sm">                  <div><strong>{locale === 'ko' ? '배송 유형' : 'Shipment Type'}:</strong> 
                    <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                      selectedShipment.shipmentType === 'hq-to-branch' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {selectedShipment.shipmentType === 'hq-to-branch' 
                        ? (locale === 'ko' ? '본사 → 해외지점' : 'HQ → Branch')
                        : (locale === 'ko' ? '지점 → 현지배송' : 'Branch → Local')}
                    </span>
                  </div>                    <div><strong>{locale === 'ko' ? '운송업체' : 'Carrier'}:</strong> {selectedShipment.carrier || '-'}</div>
                    <div><strong>{locale === 'ko' ? '송장번호' : 'Tracking Number'}:</strong> {selectedShipment.trackingNumber || '-'}</div>
                    <div><strong>{locale === 'ko' ? '운송방법' : 'Method'}:</strong> {getShipmentMethodBadge(selectedShipment.shipmentMethod)}</div>
                    <div><strong>{locale === 'ko' ? '예상 운송기간' : 'Transit Time'}:</strong> {selectedShipment.estimatedTransitDays} {locale === 'ko' ? '일' : 'days'}</div>
                    <div><strong>{locale === 'ko' ? '총 중량' : 'Total Weight'}:</strong> {selectedShipment.totalWeight}</div>
                    <div><strong>{locale === 'ko' ? '박스 수' : 'Boxes'}:</strong> {selectedShipment.totalBoxes}개</div>
                    <div><strong>{locale === 'ko' ? '배송비' : 'Shipping Cost'}:</strong> {formatCurrency(selectedShipment.shippingCost, selectedShipment.currency)}</div>
                  </div>
                </div>
              </div>

              {/* Shipment Progress Visualization */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">{locale === 'ko' ? '배송 진행 상황' : 'Shipment Progress'}</h4>
                <div className="bg-gray-50 p-6 rounded-xl">
                  <AnimatedVehicle method={selectedShipment.shipmentMethod} status={selectedShipment.status} />
                  <div className="mt-4 text-center">
                    <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
                      getStatusBadge(selectedShipment.status)
                    }`}>
                      {locale === 'ko' ? getKoreanStatus(selectedShipment.status) : selectedShipment.status}
                    </span>
                    <div className="mt-2 text-xs text-gray-600">
                      {selectedShipment.shipmentMethod === 'sea' && (locale === 'ko' ? '해상 운송' : 'Sea Transport')}
                      {selectedShipment.shipmentMethod === 'air' && (locale === 'ko' ? '항공 운송' : 'Air Transport')}
                      {selectedShipment.shipmentMethod === 'land' && (locale === 'ko' ? '육상 운송' : 'Land Transport')}
                    </div>
                  </div>
                </div>
              </div>

              {/* Destination */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">{locale === 'ko' ? '목적지 정보' : 'Destination Information'}</h4>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center mb-2">
                    <CountryFlag country={selectedShipment.destinationCode as 'BN' | 'TH' | 'VN'} className="w-6 h-5 mr-3" />
                    <span className="font-medium">{selectedShipment.destination}</span>
                  </div>
                  <p className="text-sm text-gray-700">{selectedShipment.destinationAddress}</p>
                </div>
              </div>

              {/* Customs Documents */}
              {'customsDocuments' in selectedShipment && selectedShipment.customsDocuments && (
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">{locale === 'ko' ? '통관 서류' : 'Customs Documents'}</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {selectedShipment.customsDocuments.map((doc, index) => (
                      <div key={index} className="flex items-center p-2 bg-blue-50 rounded text-sm">
                        <FileText className="h-4 w-4 text-blue-600 mr-2" />
                        <span className="text-blue-800">{doc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

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

              {/* Shipment Progress Visualization */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">{locale === 'ko' ? '배송 진행 상황' : 'Shipment Progress'}</h4>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <AnimatedVehicle method={selectedShipment.shipmentMethod} status={selectedShipment.status} />
                  <div className="mt-3 text-center">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      getStatusBadge(selectedShipment.status)
                    }`}>
                      {locale === 'ko' ? getKoreanStatus(selectedShipment.status) : selectedShipment.status}
                    </span>
                  </div>
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
                          <div className="w-2 h-2 bg-purple-600 rounded-full mt-2"></div>
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
      
      {/* Domestic Shipment Detail Modal */}
      {isDomesticModalOpen && selectedDomesticShipment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                {locale === 'ko' ? '국내배송 상세정보' : 'Domestic Delivery Details'} - {selectedDomesticShipment.shipmentNumber}
              </h3>
              <button
                onClick={() => {
                  setIsDomesticModalOpen(false);
                  setSelectedDomesticShipment(null);
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
                    <div><strong>{locale === 'ko' ? '주문번호' : 'Order Number'}:</strong> {selectedDomesticShipment.orderNumber}</div>
                    <div><strong>{locale === 'ko' ? '고객명' : 'Customer'}:</strong> {selectedDomesticShipment.customerName}</div>
                    <div><strong>{locale === 'ko' ? '담당자' : 'Contact Person'}:</strong> {selectedDomesticShipment.contactPerson}</div>
                    <div><strong>{locale === 'ko' ? '연락처' : 'Phone'}:</strong> {selectedDomesticShipment.contactPhone}</div>
                    <div><strong>{locale === 'ko' ? '우선순위' : 'Priority'}:</strong> {getPriorityBadge(selectedDomesticShipment.priority)}</div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">{locale === 'ko' ? '배송 정보' : 'Shipping Information'}</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>{locale === 'ko' ? '지점' : 'Branch'}:</strong> 
                      <span className="ml-2 inline-flex items-center">
                        <CountryFlag country={selectedDomesticShipment.branchCountryCode as 'BN' | 'TH' | 'VN'} className="w-4 h-3 mr-1" />
                        {selectedDomesticShipment.branchCountry}
                      </span>
                    </div>
                    <div><strong>{locale === 'ko' ? '운송업체' : 'Carrier'}:</strong> {selectedDomesticShipment.carrier || '-'}</div>
                    <div><strong>{locale === 'ko' ? '송장번호' : 'Tracking Number'}:</strong> {selectedDomesticShipment.trackingNumber || '-'}</div>
                    <div><strong>{locale === 'ko' ? '운송방법' : 'Method'}:</strong> 
                      <span className="ml-2 capitalize">{selectedDomesticShipment.shipmentMethod}</span>
                    </div>
                    <div><strong>{locale === 'ko' ? '예상 운송기간' : 'Transit Time'}:</strong> {selectedDomesticShipment.estimatedTransitDays} {locale === 'ko' ? '일' : 'days'}</div>
                    <div><strong>{locale === 'ko' ? '총 중량' : 'Total Weight'}:</strong> {selectedDomesticShipment.totalWeight}</div>
                    <div><strong>{locale === 'ko' ? '박스 수' : 'Boxes'}:</strong> {selectedDomesticShipment.totalBoxes}개</div>
                    <div><strong>{locale === 'ko' ? '배송비' : 'Shipping Cost'}:</strong> {formatCurrency(selectedDomesticShipment.shippingCost, selectedDomesticShipment.currency)}</div>
                  </div>
                </div>
              </div>

              {/* Shipment Progress */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">{locale === 'ko' ? '배송 진행 상황' : 'Delivery Progress'}</h4>
                <div className="bg-gray-50 p-6 rounded-xl">
                  <AnimatedVehicle method={selectedDomesticShipment.shipmentMethod} status={selectedDomesticShipment.status} />
                  <div className="mt-4 text-center">
                    <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
                      getStatusBadge(selectedDomesticShipment.status)
                    }`}>
                      {locale === 'ko' ? getKoreanStatus(selectedDomesticShipment.status) : selectedDomesticShipment.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Destination */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">{locale === 'ko' ? '배송지 정보' : 'Delivery Address'}</h4>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center mb-2">
                    <CountryFlag country={selectedDomesticShipment.branchCountryCode as 'BN' | 'TH' | 'VN'} className="w-6 h-5 mr-3" />
                    <span className="font-medium">{selectedDomesticShipment.destination}</span>
                  </div>
                  <p className="text-sm text-gray-700">{selectedDomesticShipment.destinationAddress}</p>
                </div>
              </div>

              {/* Items */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">{locale === 'ko' ? '배송 품목' : 'Delivery Items'}</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left">{locale === 'ko' ? '제품명' : 'Product'}</th>
                        <th className="px-4 py-2 text-left">{locale === 'ko' ? '제품코드' : 'Code'}</th>
                        <th className="px-4 py-2 text-left">{locale === 'ko' ? '수량' : 'Quantity'}</th>
                        <th className="px-4 py-2 text-left">{locale === 'ko' ? '중량' : 'Weight'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {selectedDomesticShipment.items.map((item, index) => (
                        <tr key={index}>
                          <td className="px-4 py-2">{item.productName}</td>
                          <td className="px-4 py-2 text-gray-600">{item.productCode}</td>
                          <td className="px-4 py-2">{item.quantity} {item.unit}</td>
                          <td className="px-4 py-2">{item.weight}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Updates */}
              {selectedDomesticShipment.updates && (
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">{locale === 'ko' ? '배송 추적' : 'Delivery Updates'}</h4>
                  <div className="space-y-3">
                    {selectedDomesticShipment.updates.map((update, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className="flex-shrink-0">
                          <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
}