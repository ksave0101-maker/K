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

interface Shipment {
  id: string;
  shipmentNumber: string;
  orderNumber: string;
  destination: 'Korea' | 'Brunei' | 'Thailand' | 'Vietnam';
  destinationCode: 'KR' | 'BN' | 'TH' | 'VN';
  destinationAddress: string;
  status: 'packed' | 'ready-to-ship' | 'in-transit' | 'delivered';
  shipDate?: string;
  estimatedDelivery: string;
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
  updates?: {
    timestamp: string;
    location: string;
    status: string;
    notes: string;
  }[];
}

export default function PendingShipmentsPage() {
  const router = useRouter();
  const { locale } = useLocale();
  const t = translations[locale];
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);


  // Sample data
  const [shipments, setShipments] = useState<Shipment[]>([
    {
      id: '1',
      shipmentNumber: 'SH-2026-001',
      orderNumber: 'PO-2026-001',
      destination: 'Korea',
      destinationCode: 'KR',
      destinationAddress: '123 Gangnam-gu, Seoul, South Korea',
      status: 'ready-to-ship',
      estimatedDelivery: '2026-02-18',
      carrier: 'DHL Express',
      trackingNumber: 'DHL1234567890KR',
      priority: 'urgent',
      customerName: 'Seoul Energy Corp.',
      contactPerson: 'Kim Min-ji',
      contactPhone: '+82-2-1234-5678',
      totalWeight: '250 kg',
      totalBoxes: 5,
      packagingNote: 'Handle with care - fragile electronic components',
      shipmentMethod: 'land',
      items: [
        { productName: 'Main Control Unit', productCode: 'MCU-A2024', quantity: 50, unit: 'pcs', weight: '100 kg', dimensions: '50x40x30 cm' },
        { productName: 'Power Module', productCode: 'PM-500W', quantity: 50, unit: 'pcs', weight: '75 kg', dimensions: '40x30x20 cm' },
        { productName: 'Display Panel', productCode: 'DP-LCD7', quantity: 50, unit: 'pcs', weight: '50 kg', dimensions: '30x25x15 cm' },
        { productName: 'Sensor Array', productCode: 'SA-V3', quantity: 50, unit: 'sets', weight: '25 kg', dimensions: '20x15x10 cm' }
      ],
      updates: [
        { timestamp: '2026-02-15 16:00', location: 'Seoul Distribution Center', status: 'In Transit', notes: 'Arrived at Seoul hub, preparing for final delivery' },
        { timestamp: '2026-02-15 12:00', location: 'Busan Checkpoint', status: 'In Transit', notes: 'Passed checkpoint, heading to Seoul' },
        { timestamp: '2026-02-15 08:00', location: 'Warehouse', status: 'Dispatched', notes: 'Package dispatched from main warehouse' }
      ]
    },
    {
      id: '2',
      shipmentNumber: 'SH-2026-002',
      orderNumber: 'PO-2026-003',
      destination: 'Brunei',
      destinationCode: 'BN',
      destinationAddress: '45 Jalan Menteri Besar, Bandar Seri Begawan, Brunei',
      status: 'packed',
      estimatedDelivery: '2026-02-22',
      priority: 'normal',
      customerName: 'Brunei Utilities Ltd.',
      contactPerson: 'Ahmad Hassan',
      contactPhone: '+673-222-3456',
      totalWeight: '180 kg',
      totalBoxes: 4,
      shipmentMethod: 'sea',
      items: [
        { productName: 'Energy Monitor Pro', productCode: 'EMP-2024', quantity: 30, unit: 'pcs', weight: '120 kg' },
        { productName: 'Smart Sensors', productCode: 'SS-V2', quantity: 30, unit: 'sets', weight: '60 kg' }
      ],
      updates: [
        { timestamp: '2026-02-15 14:30', location: 'Muara Port - Customs', status: 'Customs Clearance', notes: 'Under customs inspection, expected clearance today' },
        { timestamp: '2026-02-14 18:00', location: 'Muara Port', status: 'Arrived', notes: 'Vessel arrived at destination port' },
        { timestamp: '2026-02-12 10:00', location: 'Port of Busan', status: 'Departed', notes: 'Loaded on vessel MS Pacific Star' }
      ]
    },
    {
      id: '3',
      shipmentNumber: 'SH-2026-003',
      orderNumber: 'PO-2026-004',
      destination: 'Thailand',
      destinationCode: 'TH',
      destinationAddress: '789 Sukhumvit Road, Bangkok, Thailand',
      status: 'ready-to-ship',
      estimatedDelivery: '2026-02-19',
      carrier: 'Kerry Express',
      trackingNumber: 'KERRY9876543210TH',
      priority: 'normal',
      customerName: 'Bangkok Smart Energy',
      contactPerson: 'Somchai Prasert',
      contactPhone: '+66-2-345-6789',
      totalWeight: '320 kg',
      totalBoxes: 6,
      packagingNote: 'Waterproof packaging required',
      shipmentMethod: 'sea',
      items: [
        { productName: 'Industrial Controller', productCode: 'IC-X500', quantity: 40, unit: 'pcs', weight: '200 kg', dimensions: '60x50x40 cm' },
        { productName: 'Cooling System', productCode: 'CS-T300', quantity: 40, unit: 'pcs', weight: '120 kg', dimensions: '45x35x25 cm' }
      ],
      updates: [
        { timestamp: '2026-02-15 10:00', location: 'South China Sea', status: 'In Transit', notes: 'Vessel en route, weather conditions favorable' },
        { timestamp: '2026-02-13 14:00', location: 'Port of Busan', status: 'Departed', notes: 'Departed on vessel MS Thai Express' },
        { timestamp: '2026-02-13 08:00', location: 'Warehouse', status: 'Preparing', notes: 'Cargo prepared and loaded' }
      ]
    },
    {
      id: '4',
      shipmentNumber: 'SH-2026-004',
      orderNumber: 'PO-2026-005',
      destination: 'Vietnam',
      destinationCode: 'VN',
      destinationAddress: '456 Nguyen Hue Boulevard, Ho Chi Minh City, Vietnam',
      status: 'in-transit',
      shipDate: '2026-02-14',
      estimatedDelivery: '2026-02-17',
      carrier: 'Vietnam Post EMS',
      trackingNumber: 'VN1234567890EMS',
      priority: 'urgent',
      customerName: 'Vietnam Green Tech',
      contactPerson: 'Nguyen Van An',
      contactPhone: '+84-28-765-4321',
      totalWeight: '210 kg',
      totalBoxes: 5,
      shipmentMethod: 'sea',
      items: [
        { productName: 'Smart Gateway', productCode: 'SG-2024', quantity: 35, unit: 'pcs', weight: '140 kg' },
        { productName: 'Network Module', productCode: 'NM-W100', quantity: 35, unit: 'pcs', weight: '70 kg' }
      ],
      updates: [
        { timestamp: '2026-02-15 09:00', location: 'Hanoi Branch', status: 'Delivered', notes: 'Successfully delivered and signed by recipient' },
        { timestamp: '2026-02-14 16:00', location: 'Hanoi Distribution', status: 'Out for Delivery', notes: 'Final delivery in progress' },
        { timestamp: '2026-02-13 10:00', location: 'Hai Phong Port', status: 'Customs Cleared', notes: 'Cleared customs, heading to Hanoi' }
      ]
    }
  ]);

  const getStatusBadge = (status: string) => {
    const styles = {
      'packed': 'bg-blue-100 text-blue-800',
      'ready-to-ship': 'bg-green-100 text-green-800',
      'in-transit': 'bg-purple-100 text-purple-800',
      'delivered': 'bg-gray-100 text-gray-800',
    };

    const labels = {
      'packed': locale === 'ko' ? '포장완료' : 'Packed',
      'ready-to-ship': locale === 'ko' ? '출고대기' : 'Ready to Ship',
      'in-transit': locale === 'ko' ? '배송중' : 'In Transit',
      'delivered': locale === 'ko' ? '배송완료' : 'Delivered',
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
      low: 'bg-gray-100 text-gray-800',
    };

    const labels = {
      urgent: locale === 'ko' ? '긴급' : 'Urgent',
      normal: locale === 'ko' ? '보통' : 'Normal',
      low: locale === 'ko' ? '낮음' : 'Low',
    };

    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${styles[priority as keyof typeof styles]}`}>
        {labels[priority as keyof typeof labels]}
      </span>
    );
  };

  const groupedShipments = shipments.reduce((acc, shipment) => {
    if (!acc[shipment.destination]) acc[shipment.destination] = [];
    acc[shipment.destination].push(shipment);
    return acc;
  }, {} as Record<string, Shipment[]>);

  const handleViewDetails = (shipment: Shipment) => {
    setSelectedShipment(shipment);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedShipment(null);
  };

  const handleProcessShipment = () => {
    if (selectedShipment) {
      const message = locale === 'ko'
        ? `출고번호: ${selectedShipment.shipmentNumber}\n고객: ${selectedShipment.customerName}\n\n출고를 진행하시겠습니까?`
        : `Shipment: ${selectedShipment.shipmentNumber}\nCustomer: ${selectedShipment.customerName}\n\nProcess this shipment?`;
      
      if (confirm(message)) {
        alert(
          locale === 'ko' 
            ? `출고가 처리되었습니다!` 
            : `Shipment has been processed!`
        );
        closeModal();
      }
    }
  };

  // Calculate progress percentage based on status
  const getProgressPercentage = (status: string) => {
    const progressMap = {
      'packed': 25,
      'ready-to-ship': 50,
      'in-transit': 75,
      'delivered': 100,
    };
    return progressMap[status as keyof typeof progressMap] || 0;
  };

  // Vehicle SVG Icons with enhanced 3D animation
  const ShipIcon = () => (
    <div className="relative">
      <svg className="w-24 h-24 drop-shadow-2xl" viewBox="0 0 240 240" fill="none">
        <defs>
          <linearGradient id="oceanWave1" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#3B82F6', stopOpacity: 0.4 }} />
            <stop offset="100%" style={{ stopColor: '#0EA5E9', stopOpacity: 0.7 }} />
          </linearGradient>
          <linearGradient id="shipHullGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#DC2626', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#7F1D1D', stopOpacity: 1 }} />
          </linearGradient>
          <linearGradient id="shipDeckGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#F3F4F6', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#D1D5DB', stopOpacity: 1 }} />
          </linearGradient>
          <filter id="shipShadow3D">
            <feGaussianBlur in="SourceAlpha" stdDeviation="5"/>
            <feOffset dx="0" dy="8"/>
            <feComponentTransfer><feFuncA type="linear" slope="0.5"/></feComponentTransfer>
            <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>
        
        {/* Animated ocean */}
        <path d="M0 160 Q30 155 60 160 T120 160 T180 160 T240 160 L240 240 L0 240 Z" fill="url(#oceanWave1)">
          <animate attributeName="d" 
                   values="M0 160 Q30 155 60 160 T120 160 T180 160 T240 160 L240 240 L0 240 Z;
                           M0 160 Q30 165 60 160 T120 160 T180 160 T240 160 L240 240 L0 240 Z;
                           M0 160 Q30 155 60 160 T120 160 T180 160 T240 160 L240 240 L0 240 Z"
                   dur="3s" repeatCount="indefinite"/>
        </path>
        
        <g filter="url(#shipShadow3D)">
          {/* Hull */}
          <path d="M50 145 L190 145 L210 165 L30 165 Z" fill="url(#shipHullGrad)" stroke="#991B1B" strokeWidth="3"/>
          
          {/* Port holes */}
          {[65, 85, 105, 125, 145, 165].map(x => (
            <circle key={x} cx={x} cy="155" r="4"  fill="#FDE047" opacity="0.9"/>
          ))}
          
          {/* Deck */}
          <rect x="55" y="95" width="130" height="50" fill="url(#shipDeckGrad)" stroke="#9CA3AF" strokeWidth="2" rx="4"/>
          
          {/* Containers with 3D */}
          <g>
            <rect x="70" y="70" width="28" height="25" fill="#F59E0B" stroke="#D97706" strokeWidth="2" rx="2"/>
            <rect x="72" y="72" width="24" height="4" fill="#FDE68A" opacity="0.6"/>
            <line x1="77" y1="75" x2="77" y2="93" stroke="#B45309" strokeWidth="1"/>
            <line x1="89" y1="75" x2="89" y2="93" stroke="#B45309" strokeWidth="1"/>
          </g>
          
          <g>
            <rect x="104" y="70" width="28" height="25" fill="#10B981" stroke="#059669" strokeWidth="2" rx="2"/>
            <rect x="106" y="72" width="24" height="4" fill="#A7F3D0" opacity="0.6"/>
            <line x1="111" y1="75" x2="111" y2="93" stroke="#065F46" strokeWidth="1"/>
            <line x1="123" y1="75" x2="123" y2="93" stroke="#065F46" strokeWidth="1"/>
          </g>
          
          <g>
            <rect x="138" y="70" width="28" height="25" fill="#3B82F6" stroke="#1D4ED8" strokeWidth="2" rx="2"/>
            <rect x="140" y="72" width="24" height="4" fill="#BFDBFE" opacity="0.6"/>
            <line x1="145" y1="75" x2="145" y2="93" stroke="#1E3A8A" strokeWidth="1"/>
            <line x1="157" y1="75" x2="157" y2="93" stroke="#1E3A8A" strokeWidth="1"/>
          </g>
          
          {/* Bridge */}
          <rect x="155" y="50" width="38" height="45" fill="#1E3A8A" stroke="#1E40AF" strokeWidth="2" rx="3"/>
          <rect x="157" y="52" width="34" height="41" fill="#2563EB" opacity="0.4" rx="2"/>
          
          {/* Windows */}
          {[[162, 58], [175, 58], [162, 69], [175, 69], [162, 80], [175, 80]].map(([x, y], i) => (
            <rect key={i} x={x} y={y} width="10" height="7" fill="#FCD34D" rx="1" opacity="0.95"/>
          ))}
          
          {/* Chimney */}
          <rect x="170" y="32" width="14" height="18" fill="#DC2626" stroke="#7F1D1D" strokeWidth="2" rx="2"/>
          <ellipse cx="177" cy="32" rx="7" ry="4" fill="#EF4444"/>
          
          {/* Smoke */}
          {[0, 1, 2].map(i => (
            <circle key={i} cx={177 + i * 2} cy="28" r="3" fill="#9CA3AF" opacity="0.6">
              <animate attributeName="cy" values="28;10;0" dur="3s" begin={`${i}s`} repeatCount="indefinite"/>
              <animate attributeName="r" values="3;5;7" dur="3s" begin={`${i}s`} repeatCount="indefinite"/>
              <animate attributeName="opacity" values="0.6;0.3;0" dur="3s" begin={`${i}s`} repeatCount="indefinite"/>
            </circle>
          ))}
          
          {/* Company name */}
          <rect x="85" y="130" width="70" height="12" fill="#FFFFFF" rx="2" opacity="0.95"/>
          <text x="120" y="139" fontSize="9" fill="#1F2937" fontWeight="bold" textAnchor="middle">K-ENERGY</text>
        </g>
        
        {/* Waves splash */}
        <path d="M200 165 L210 160 L215 165" stroke="#60A5FA" strokeWidth="3" fill="none" opacity="0.7">
          <animate attributeName="d" 
                   values="M200 165 L210 160 L215 165;M200 165 L210 162 L215 165;M200 165 L210 160 L215 165"
                   dur="2s" repeatCount="indefinite"/>
        </path>
        
        {/* Ship movement */}
        <animateTransform attributeName="transform" type="translate" values="0,0; 0,-3; 0,0" dur="4s" repeatCount="indefinite"/>
      </svg>
    </div>
  );

  const TruckIcon = () => (
    <div className="relative">
      <svg className="w-24 h-24 drop-shadow-2xl" viewBox="0 0 240 240" fill="none">
        <defs>
          <linearGradient id="roadGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#4B5563', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#1F2937', stopOpacity: 1 }} />
          </linearGradient>
          <linearGradient id="truckCabGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#FBBF24', stopOpacity: 1 }} />
            <stop offset="50%" style={{ stopColor: '#F59E0B', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#D97706', stopOpacity: 1 }} />
          </linearGradient>
          <linearGradient id="cargoGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style={{ stopColor: '#60A5FA', stopOpacity: 1 }} />
            <stop offset="50%" style={{ stopColor: '#3B82F6', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#2563EB', stopOpacity: 1 }} />
          </linearGradient>
          <radialGradient id="wheel3D">
            <stop offset="0%" style={{ stopColor: '#4B5563', stopOpacity: 1 }} />
            <stop offset="70%" style={{ stopColor: '#1F2937', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#000000', stopOpacity: 1 }} />
          </radialGradient>
          <filter id="truckShadow3D">
            <feGaussianBlur in="SourceAlpha" stdDeviation="5"/>
            <feOffset dx="0" dy="8"/>
            <feComponentTransfer><feFuncA type="linear" slope="0.5"/></feComponentTransfer>
            <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>
        
        {/* Road */}
        <rect x="0" y="170" width="240" height="40" fill="url(#roadGrad)"/>
        
        {/* Lane markings animated */}
        {[0, 1, 2, 3, 4, 5].map(i => (
          <rect key={i} x={i * 50 - 30} y="188" width="30" height="4" fill="#FDE047" rx="2">
            <animate attributeName="x" values={`${i * 50 - 30};${i * 50 + 240}`} dur="1.2s" repeatCount="indefinite"/>
          </rect>
        ))}
        
        <g filter="url(#truckShadow3D)">
          {/* Cargo container */}
          <rect x="20" y="85" width="95" height="75" fill="url(#cargoGrad)" stroke="#1E40AF" strokeWidth="3" rx="5"/>
          
          {/* Container panels */}
          {[35, 52, 69, 86, 103].map(x => (
            <line key={x} x1={x} y1="88" x2={x} y2="157" stroke="#1E40AF" strokeWidth="2.5"/>
          ))}
          <line x1="23" y1="110" x2="112" y2="110" stroke="#1E40AF" strokeWidth="2" opacity="0.7"/>
          <line x1="23" y1="135" x2="112" y2="135" stroke="#1E40AF" strokeWidth="2" opacity="0.7"/>
          
          {/* Door handles */}
          <rect x="56" y="120" width="5" height="25" fill="#1E3A8A" rx="2"/>
          <rect x="76" y="120" width="5" height="25" fill="#1E3A8A" rx="2"/>
          
          {/* Cabin */}
          <path d="M115 100 L115 160 L185 160 L185 118 L155 100 Z" fill="url(#truckCabGrad)" stroke="#B45309" strokeWidth="3"/>
          
          {/* Shine effect */}
          <path d="M118 103 L152 103 L182 121 L182 118 L155 100 L118 100 Z" fill="#FDE68A" opacity="0.5"/>
          
          {/* Front window */}
          <path d="M122 108 L148 108 L148 128 L122 128 Z" fill="#60A5FA" stroke="#3B82F6" strokeWidth="2" opacity="0.85"/>
          <rect x="124" y="110" width="22" height="5" fill="#FFFFFF" opacity="0.6"/>
          
          {/* Side window */}
          <path d="M153 108 L178 120 L178 138 L153 128 Z" fill="#60A5FA" stroke="#3B82F6" strokeWidth="2" opacity="0.85"/>
          
          {/* Headlights */}
          <circle cx="180" cy="138" r="5" fill="#FDE047" stroke="#F59E0B" strokeWidth="2">
            <animate attributeName="opacity" values="1;0.7;1" dur="2s" repeatCount="indefinite"/>
          </circle>
          <circle cx="180" cy="150" r="5" fill="#EF4444" stroke="#DC2626" strokeWidth="2"/>
          
          {/* Grille */}
          <rect x="182" y="122" width="4" height="36" fill="#1F2937" rx="1"/>
          {[126, 132, 138, 144, 150, 156].map(y => (
            <line key={y} x1="182" y1={y} x2="186" y2={y} stroke="#4B5563" strokeWidth="1"/>
          ))}
          
          {/* Mirror */}
          <ellipse cx="118" cy="112" rx="4" ry="7" fill="#374151" stroke="#1F2937" strokeWidth="2" transform="rotate(-15 118 112)"/>
          
          {/* Exhaust */}
          <rect x="113" y="100" width="4" height="20" fill="#374151" rx="1"/>
          <ellipse cx="115" cy="100" rx="2" ry="1.5" fill="#4B5563"/>
          
          {/* Smoke */}
          {[0, 1].map(i => (
            <circle key={i} cx={115} cy={96 - i * 3} r="3" fill="#9CA3AF" opacity="0.5">
              <animate attributeName="cy" values={`${96 - i * 3};${85 - i * 3};${75 - i * 3}`} dur="2.5s" begin={`${i * 1.2}s`} repeatCount="indefinite"/>
              <animate attributeName="r" values="3;4;6" dur="2.5s" begin={`${i * 1.2}s`} repeatCount="indefinite"/>
              <animate attributeName="opacity" values="0.5;0.25;0" dur="2.5s" begin={`${i * 1.2}s`} repeatCount="indefinite"/>
            </circle>
          ))}
        </g>
        
        {/* Wheels with spokes */}
        <g filter="url(#truckShadow3D)">
          {[50, 95, 165].map((x, idx) => (
            <g key={idx}>
              <circle cx={x} cy="165" r="17" fill="url(#wheel3D)" stroke="#000000" strokeWidth="3"/>
              <circle cx={x} cy="165" r="12" fill="#374151"/>
              <circle cx={x} cy="165" r="6" fill="#6B7280"/>
              {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
                const rad = angle * Math.PI / 180;
                const x2 = x + 12 * Math.cos(rad);
                const y2 = 165 + 12 * Math.sin(rad);
                return <line key={i} x1={x} y1="165" x2={x2} y2={y2} stroke="#9CA3AF" strokeWidth="2"/>;
              })}
              <animateTransform attributeName="transform" type="rotate" from={`0 ${x} 165`} to={`360 ${x} 165`} dur="0.6s" repeatCount="indefinite"/>
            </g>
          ))}
        </g>
        
        {/* Speed lines */}
        {[100, 115, 130].map((y, i) => (
          <line key={i} x1="8" y1={y} x2="18" y2={y} stroke="#9CA3AF" strokeWidth="3" strokeLinecap="round" opacity="0.6">
            <animate attributeName="x1" values="8;-20" dur={`${0.4 + i * 0.05}s`} repeatCount="indefinite"/>
            <animate attributeName="x2" values="18;-10" dur={`${0.4 + i * 0.05}s`} repeatCount="indefinite"/>
            <animate attributeName="opacity" values="0.6;0" dur={`${0.4 + i * 0.05}s`} repeatCount="indefinite"/>
          </line>
        ))}
        
        {/* Bounce */}
        <animateTransform attributeName="transform" type="translate" values="0,0; 0,-2; 0,0; 0,-1; 0,0" dur="0.6s" repeatCount="indefinite"/>
      </svg>
    </div>
  );

  // Render animated tracking component
  const AnimatedTracking = ({ shipment }: { shipment: Shipment }) => {
    const progress = getProgressPercentage(shipment.status);
    const statusLabels = {
      'packed': locale === 'ko' ? '포장완료' : 'Packed',
      'ready-to-ship': locale === 'ko' ? '출고준비' : 'Ready',
      'in-transit': locale === 'ko' ? '배송중' : 'In Transit',
      'delivered': locale === 'ko' ? '배송완료' : 'Delivered',
    };

    return (
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 pt-16 border border-blue-200 shadow-md">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          {locale === 'ko' ? '배송 추적' : 'Shipment Tracking'}
        </h3>
        
        {/* Transport Method Badge */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm font-medium text-gray-600">
            {locale === 'ko' ? '운송수단' : 'Transport'}:
          </span>
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
            shipment.shipmentMethod === 'sea' 
              ? 'bg-blue-100 text-blue-800' 
              : shipment.shipmentMethod === 'land'
              ? 'bg-green-100 text-green-800'
              : 'bg-purple-100 text-purple-800'
          }`}>
            {shipment.shipmentMethod === 'sea' 
              ? (locale === 'ko' ? '🚢 해상운송' : '🚢 Sea Freight')
              : shipment.shipmentMethod === 'land'
              ? (locale === 'ko' ? '🚛 육상운송' : '🚛 Land Transport')
              : (locale === 'ko' ? '✈️ 항공운송' : '✈️ Air Freight')
            }
          </span>
        </div>

        {/* Progress Bar with Animated Vehicle */}
        <div className="relative mt-6 mb-4">
          {/* Progress Track */}
          <div className="h-6 bg-gray-200 rounded-full overflow-hidden shadow-inner">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-full transition-all duration-1000 ease-out shadow-lg"
              style={{ width: `${progress}%` }}
            />
          </div>
          
          {/* Animated Vehicle */}
          <div 
            className="absolute -top-8 transform -translate-x-1/2 transition-all duration-1000 ease-out"
            style={{ left: `${progress}%` }}
          >
            {shipment.shipmentMethod === 'sea' ? <ShipIcon /> : <TruckIcon />}
          </div>
        </div>

        {/* Status Milestones */}
        <div className="grid grid-cols-4 gap-2 mt-12">
          {['packed', 'ready-to-ship', 'in-transit', 'delivered'].map((status, index) => {
            const isActive = getProgressPercentage(shipment.status) >= (index + 1) * 25;
            return (
              <div key={status} className="text-center">
                <div className={`w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center border-2 transition-all ${
                  isActive 
                    ? 'bg-blue-500 border-blue-500 text-white scale-110' 
                    : 'bg-gray-200 border-gray-300 text-gray-400'
                }`}>
                  {isActive ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <span className="text-xs font-bold">{index + 1}</span>
                  )}
                </div>
                <p className={`text-xs font-medium ${isActive ? 'text-gray-800' : 'text-gray-400'}`}>
                  {statusLabels[status as keyof typeof statusLabels]}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
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
                {locale === 'ko' ? '출고 대기 목록' : 'Pending Shipments'}
              </h1>
              <p className="text-gray-600 mt-1">
                {locale === 'ko' ? '배송 준비 중인 주문 목록' : 'Orders ready for shipping'}
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
            <p className="text-sm text-gray-600">{locale === 'ko' ? '총 출고건' : 'Total Shipments'}</p>
            <p className="text-2xl font-bold text-blue-600">{shipments.length}</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow">
            <p className="text-sm text-gray-600">{locale === 'ko' ? '출고 대기' : 'Ready to Ship'}</p>
            <p className="text-2xl font-bold text-green-600">
              {shipments.filter(s => s.status === 'ready-to-ship').length}
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow">
            <p className="text-sm text-gray-600">{locale === 'ko' ? '배송중' : 'In Transit'}</p>
            <p className="text-2xl font-bold text-purple-600">
              {shipments.filter(s => s.status === 'in-transit').length}
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow">
            <p className="text-sm text-gray-600">{locale === 'ko' ? '긴급 출고' : 'Urgent'}</p>
            <p className="text-2xl font-bold text-red-600">
              {shipments.filter(s => s.priority === 'urgent').length}
            </p>
          </div>
        </div>

        {/* Shipments by Destination */}
        <div className="space-y-6">
          {Object.entries(groupedShipments).map(([destination, shipmentList]) => (
            <div key={destination} className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 px-6 py-4 flex items-center gap-3">
                <CountryFlag country={shipmentList[0].destinationCode} size="lg" />
                <h2 className="text-xl font-bold text-white">
                  {destination} ({shipmentList.length})
                </h2>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        {locale === 'ko' ? '출고번호' : 'Shipment No.'}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        {locale === 'ko' ? '주문번호' : 'Order No.'}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        {locale === 'ko' ? '고객명' : 'Customer'}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        {locale === 'ko' ? '운송사' : 'Carrier'}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        {locale === 'ko' ? '배송예정일' : 'Est. Delivery'}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        {locale === 'ko' ? '총 무게' : 'Weight'}
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                        {locale === 'ko' ? '우선순위' : 'Priority'}
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                        {t.status}
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                        {locale === 'ko' ? '작업' : 'Actions'}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {shipmentList.map((shipment) => (
                      <tr key={shipment.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-900">{shipment.shipmentNumber}</span>
                            <span className="text-lg" title={
                              shipment.shipmentMethod === 'sea' 
                                ? (locale === 'ko' ? '해상운송' : 'Sea Freight')
                                : shipment.shipmentMethod === 'land'
                                ? (locale === 'ko' ? '육상운송' : 'Land Transport')
                                : (locale === 'ko' ? '항공운송' : 'Air Freight')
                            }>
                              {shipment.shipmentMethod === 'sea' ? '🚢' : shipment.shipmentMethod === 'land' ? '🚛' : '✈️'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600">{shipment.orderNumber}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">{shipment.customerName}</div>
                          <div className="text-xs text-gray-500">{shipment.contactPerson}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{shipment.carrier || '-'}</div>
                          {shipment.trackingNumber && (
                            <div className="text-xs text-gray-500 font-mono">{shipment.trackingNumber}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{shipment.estimatedDelivery}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{shipment.totalWeight}</div>
                          <div className="text-xs text-gray-500">{shipment.totalBoxes} {locale === 'ko' ? '박스' : 'boxes'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          {getPriorityBadge(shipment.priority)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          {getStatusBadge(shipment.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <button
                            onClick={() => handleViewDetails(shipment)}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline"
                          >
                            {t.viewDetails}
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

      {/* Shipment Details Modal */}
      {isModalOpen && selectedShipment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-purple-500 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CountryFlag country={selectedShipment.destinationCode} size="lg" />
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {selectedShipment.shipmentNumber}
                  </h2>
                  <p className="text-blue-100 text-sm">
                    {selectedShipment.destination} - {selectedShipment.customerName}
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
              {/* Shipment Information */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600">{locale === 'ko' ? '주문번호' : 'Order Number'}</p>
                  <p className="font-semibold text-gray-800">{selectedShipment.orderNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">{locale === 'ko' ? '배송예정일' : 'Est. Delivery'}</p>
                  <p className="font-semibold text-gray-800">{selectedShipment.estimatedDelivery}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">{t.status}</p>
                  <div className="mt-1">{getStatusBadge(selectedShipment.status)}</div>
                </div>
                <div>
                  <p className="text-sm text-gray-600">{locale === 'ko' ? '우선순위' : 'Priority'}</p>
                  <div className="mt-1">{getPriorityBadge(selectedShipment.priority)}</div>
                </div>
                <div>
                  <p className="text-sm text-gray-600">{locale === 'ko' ? '총 무게' : 'Total Weight'}</p>
                  <p className="font-semibold text-gray-800">{selectedShipment.totalWeight}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">{locale === 'ko' ? '박스 수' : 'Total Boxes'}</p>
                  <p className="font-semibold text-gray-800">{selectedShipment.totalBoxes} {locale === 'ko' ? '박스' : 'boxes'}</p>
                </div>
              </div>

              {/* Animated Tracking */}
              <AnimatedTracking shipment={selectedShipment} />

              {/* Tracking History */}
              {selectedShipment.updates && selectedShipment.updates.length > 0 && (
                <div>
                  <h3 className="font-bold text-gray-800 mb-4">
                    {locale === 'ko' ? '배송 이력' : 'Tracking History'}
                  </h3>
                  <div className="space-y-4">
                    {selectedShipment.updates.map((update, index) => (
                      <div key={index} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className={`w-3 h-3 rounded-full ${index === 0 ? 'bg-blue-500' : 'bg-gray-300'}`} />
                          {index < (selectedShipment.updates?.length || 0) - 1 && (
                            <div className="w-0.5 h-full bg-gray-300 mt-1" />
                          )}
                        </div>
                        <div className="flex-1 pb-4">
                          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            <div className="flex justify-between items-start mb-2">
                              <p className="font-semibold text-gray-900">{update.location}</p>
                              <span className="text-xs text-gray-500 whitespace-nowrap ml-4">{update.timestamp}</span>
                            </div>
                            <p className="text-sm font-medium text-blue-600 mb-1">{update.status}</p>
                            <p className="text-sm text-gray-600">{update.notes}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={closeModal}
                  className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg transition-colors"
                >
                  {t.close}
                </button>
                {selectedShipment.status !== 'in-transit' && selectedShipment.status !== 'delivered' && (
                  <button
                    onClick={handleProcessShipment}
                    className="flex-1 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors"
                  >
                    {locale === 'ko' ? '출고 처리' : 'Process Shipment'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
