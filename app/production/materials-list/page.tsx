'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from '@/lib/LocaleContext';
import { translations } from '@/lib/translations';
import LanguageSwitcher from '@/components/LanguageSwitcher';

interface Material {
  id: string;
  materialCode: string;
  materialName: string;
  category: 'electronic' | 'mechanical' | 'packaging' | 'chemical';
  quantity: number;
  unit: string;
  estimatedCost: number;
  supplier: string;
  urgency: 'high' | 'medium' | 'low';
  requestedBy: string;
  requestDate: string;
  requiredDate: string;
  status: 'pending' | 'approved' | 'ordered';
  notes?: string;
}

export default function MaterialsListPage() {
  const router = useRouter();
  const { locale } = useLocale();
  const t = translations[locale];
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterUrgency, setFilterUrgency] = useState<string>('all');
  const [editQuantity, setEditQuantity] = useState(0);
  const [editUnit, setEditUnit] = useState('');
  const [editEstimatedCost, setEditEstimatedCost] = useState(0);
  const [editSupplier, setEditSupplier] = useState('');
  const [editRequestedBy, setEditRequestedBy] = useState('');
  const [editRequestDate, setEditRequestDate] = useState('');
  const [editRequiredDate, setEditRequiredDate] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editCategory, setEditCategory] = useState<Material['category']>('electronic');
  const [editUrgency, setEditUrgency] = useState<Material['urgency']>('medium');
  const [editStatus, setEditStatus] = useState<Material['status']>('pending');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newMaterial, setNewMaterial] = useState({
    materialCode: '',
    materialName: '',
    category: 'electronic' as Material['category'],
    quantity: 0,
    unit: 'pcs',
    estimatedCost: 0,
    supplier: '',
    urgency: 'medium' as Material['urgency'],
    requestedBy: '',
    requestDate: new Date().toISOString().split('T')[0],
    requiredDate: '',
    status: 'pending' as Material['status'],
    notes: '',
  });

  const [materials, setMaterials] = useState<Material[]>([]);

  useEffect(() => {
    fetch('/api/korea/materials')
      .then(r => r.json())
      .then(data => setMaterials(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  const _staticMaterials: Material[] = [
    {
      id: '1',
      materialCode: 'MAT-E-001',
      materialName: 'Microcontroller STM32F4',
      category: 'electronic',
      quantity: 500,
      unit: 'pcs',
      estimatedCost: 2500000,
      supplier: 'ST Microelectronics Korea',
      urgency: 'high',
      requestedBy: 'Production Team A',
      requestDate: '2026-02-15',
      requiredDate: '2026-02-18',
      status: 'pending',
      notes: 'Critical component for Model A-2024'
    },
    {
      id: '2',
      materialCode: 'MAT-E-002',
      materialName: 'Power Supply Module 24V',
      category: 'electronic',
      quantity: 300,
      unit: 'pcs',
      estimatedCost: 1800000,
      supplier: 'Mean Well Korea',
      urgency: 'high',
      requestedBy: 'Engineering Dept',
      requestDate: '2026-02-15',
      requiredDate: '2026-02-19',
      status: 'approved',
      notes: 'Urgent for Thai branch order'
    },
    {
      id: '3',
      materialCode: 'MAT-M-003',
      materialName: 'Aluminum Housing Case',
      category: 'mechanical',
      quantity: 200,
      unit: 'pcs',
      estimatedCost: 3200000,
      supplier: 'Korea Metalworks Co.',
      urgency: 'medium',
      requestedBy: 'Assembly Team',
      requestDate: '2026-02-15',
      requiredDate: '2026-02-22',
      status: 'pending',
      notes: 'Custom dimensions required'
    },
    {
      id: '4',
      materialCode: 'MAT-E-004',
      materialName: 'LCD Display 7 inch',
      category: 'electronic',
      quantity: 150,
      unit: 'pcs',
      estimatedCost: 2250000,
      supplier: 'Samsung Display',
      urgency: 'medium',
      requestedBy: 'Production Team B',
      requestDate: '2026-02-15',
      requiredDate: '2026-02-25',
      status: 'pending'
    },
    {
      id: '5',
      materialCode: 'MAT-M-005',
      materialName: 'Cooling Fan Assembly',
      category: 'mechanical',
      quantity: 400,
      unit: 'pcs',
      estimatedCost: 1600000,
      supplier: 'Delta Electronics',
      urgency: 'high',
      requestedBy: 'Production Team A',
      requestDate: '2026-02-15',
      requiredDate: '2026-02-20',
      status: 'approved',
      notes: 'Required for all models'
    },
    {
      id: '6',
      materialCode: 'MAT-P-006',
      materialName: 'Corrugated Shipping Boxes',
      category: 'packaging',
      quantity: 1000,
      unit: 'pcs',
      estimatedCost: 800000,
      supplier: 'Korea Packaging Ltd',
      urgency: 'low',
      requestedBy: 'Logistics Dept',
      requestDate: '2026-02-15',
      requiredDate: '2026-02-28',
      status: 'ordered'
    },
    {
      id: '7',
      materialCode: 'MAT-C-007',
      materialName: 'Thermal Paste Premium',
      category: 'chemical',
      quantity: 50,
      unit: 'kg',
      estimatedCost: 500000,
      supplier: 'Arctic Silver Korea',
      urgency: 'medium',
      requestedBy: 'Assembly Team',
      requestDate: '2026-02-15',
      requiredDate: '2026-02-23',
      status: 'pending'
    },
    {
      id: '8',
      materialCode: 'MAT-E-008',
      materialName: 'Ethernet RJ45 Connector',
      category: 'electronic',
      quantity: 600,
      unit: 'pcs',
      estimatedCost: 600000,
      supplier: 'Molex Korea',
      urgency: 'high',
      requestedBy: 'Production Team B',
      requestDate: '2026-02-15',
      requiredDate: '2026-02-21',
      status: 'pending',
      notes: 'Industrial grade required'
    },
    {
      id: '9',
      materialCode: 'MAT-M-009',
      materialName: 'Mounting Brackets Set',
      category: 'mechanical',
      quantity: 250,
      unit: 'sets',
      estimatedCost: 1250000,
      supplier: 'Korea Hardware Supply',
      urgency: 'low',
      requestedBy: 'Assembly Team',
      requestDate: '2026-02-15',
      requiredDate: '2026-02-26',
      status: 'approved'
    },
    {
      id: '10',
      materialCode: 'MAT-P-010',
      materialName: 'Anti-Static Foam Inserts',
      category: 'packaging',
      quantity: 500,
      unit: 'pcs',
      estimatedCost: 750000,
      supplier: 'SafePack Korea',
      urgency: 'medium',
      requestedBy: 'QC Department',
      requestDate: '2026-02-15',
      requiredDate: '2026-02-24',
      status: 'pending'
    },
    {
      id: '11',
      materialCode: 'MAT-E-011',
      materialName: 'Capacitor Bank 100µF',
      category: 'electronic',
      quantity: 1000,
      unit: 'pcs',
      estimatedCost: 1000000,
      supplier: 'Nichicon Korea',
      urgency: 'high',
      requestedBy: 'Engineering Dept',
      requestDate: '2026-02-15',
      requiredDate: '2026-02-19',
      status: 'pending',
      notes: 'High temperature rating'
    },
    {
      id: '12',
      materialCode: 'MAT-C-012',
      materialName: 'Conformal Coating Solution',
      category: 'chemical',
      quantity: 30,
      unit: 'liters',
      estimatedCost: 900000,
      supplier: 'Dow Chemical Korea',
      urgency: 'low',
      requestedBy: 'QC Department',
      requestDate: '2026-02-15',
      requiredDate: '2026-02-27',
      status: 'approved'
    }
  ];

  const getCategoryInfo = (category: string) => {
    const categories = {
      'electronic': {
        label: locale === 'ko' ? '전자 부품' : 'Electronic',
        color: 'bg-blue-100 text-blue-800',
        icon: '⚡'
      },
      'mechanical': {
        label: locale === 'ko' ? '기계 부품' : 'Mechanical',
        color: 'bg-gray-100 text-gray-800',
        icon: '⚙️'
      },
      'packaging': {
        label: locale === 'ko' ? '포장재' : 'Packaging',
        color: 'bg-amber-100 text-amber-800',
        icon: '📦'
      },
      'chemical': {
        label: locale === 'ko' ? '화학 물질' : 'Chemical',
        color: 'bg-purple-100 text-purple-800',
        icon: '🧪'
      }
    };
    return categories[category as keyof typeof categories] || categories.electronic;
  };

  const getUrgencyInfo = (urgency: string) => {
    const urgencies = {
      'high': {
        label: locale === 'ko' ? '긴급' : 'High',
        color: 'bg-red-100 text-red-800',
        icon: '🔴'
      },
      'medium': {
        label: locale === 'ko' ? '보통' : 'Medium',
        color: 'bg-yellow-100 text-yellow-800',
        icon: '🟡'
      },
      'low': {
        label: locale === 'ko' ? '낮음' : 'Low',
        color: 'bg-green-100 text-green-800',
        icon: '🟢'
      }
    };
    return urgencies[urgency as keyof typeof urgencies] || urgencies.medium;
  };

  const getStatusInfo = (status: string) => {
    const statuses = {
      'pending': {
        label: locale === 'ko' ? '대기 중' : 'Pending',
        color: 'bg-yellow-100 text-yellow-800'
      },
      'approved': {
        label: locale === 'ko' ? '승인됨' : 'Approved',
        color: 'bg-blue-100 text-blue-800'
      },
      'ordered': {
        label: locale === 'ko' ? '주문됨' : 'Ordered',
        color: 'bg-green-100 text-green-800'
      }
    };
    return statuses[status as keyof typeof statuses] || statuses.pending;
  };

  const filteredMaterials = materials.filter(material => {
    const categoryMatch = filterCategory === 'all' || material.category === filterCategory;
    const urgencyMatch = filterUrgency === 'all' || material.urgency === filterUrgency;
    return categoryMatch && urgencyMatch;
  });

  const handleViewDetails = (material: Material) => {
    setSelectedMaterial(material);
    setEditQuantity(material.quantity);
    setEditUnit(material.unit);
    setEditEstimatedCost(material.estimatedCost);
    setEditSupplier(material.supplier);
    setEditRequestedBy(material.requestedBy);
    setEditRequestDate(material.requestDate);
    setEditRequiredDate(material.requiredDate);
    setEditNotes(material.notes || '');
    setEditCategory(material.category);
    setEditUrgency(material.urgency);
    setEditStatus(material.status);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedMaterial(null);
  };

  const handleDeleteMaterial = async (material: Material) => {
    const message = locale === 'ko'
      ? `${material.materialName} (${material.materialCode})\n\n이 자재를 삭제하시겠습니까?`
      : `${material.materialName} (${material.materialCode})\n\nDelete this material?`;
    if (confirm(message)) {
      await fetch(`/api/korea/materials?id=${material.id}`, { method: 'DELETE' });
      setMaterials(prev => prev.filter(m => m.id !== material.id));
      alert(locale === 'ko' ? '삭제되었습니다!' : 'Deleted successfully!');
    }
  };

  const handleSaveMaterial = () => {
    if (!selectedMaterial) return;
    const updated: Material = {
      ...selectedMaterial,
      category: editCategory,
      urgency: editUrgency,
      status: editStatus,
      quantity: editQuantity,
      unit: editUnit,
      estimatedCost: editEstimatedCost,
      supplier: editSupplier,
      requestedBy: editRequestedBy,
      requestDate: editRequestDate,
      requiredDate: editRequiredDate,
      notes: editNotes || undefined,
    };
    fetch('/api/korea/materials', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updated) }).catch(() => {});
    setMaterials(prev => prev.map(m => m.id === updated.id ? updated : m));
    setSelectedMaterial(updated);
    alert(locale === 'ko' ? '저장되었습니다!' : 'Saved successfully!');
  };

  const handleApprovePurchase = () => {
    if (selectedMaterial) {
      alert(
        locale === 'ko'
          ? `${selectedMaterial.materialName} 구매가 승인되었습니다!`
          : `Purchase approved for ${selectedMaterial.materialName}!`
      );
      closeModal();
    }
  };

  const resetNewMaterialForm = () => {
    setNewMaterial({
      materialCode: '',
      materialName: '',
      category: 'electronic',
      quantity: 0,
      unit: 'pcs',
      estimatedCost: 0,
      supplier: '',
      urgency: 'medium',
      requestedBy: '',
      requestDate: new Date().toISOString().split('T')[0],
      requiredDate: '',
      status: 'pending',
      notes: '',
    });
  };

  const handleCreateMaterial = async () => {
    if (!newMaterial.materialCode || !newMaterial.materialName) {
      alert(locale === 'ko' ? '자재 코드와 자재명을 입력해주세요.' : 'Please enter material code and name.');
      return;
    }
    const id = `MAT-${Date.now()}`;
    const created: Material = { id, ...newMaterial, notes: newMaterial.notes || undefined };
    await fetch('/api/korea/materials', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(created) });
    setMaterials(prev => [...prev, created]);
    resetNewMaterialForm();
    setIsAddModalOpen(false);
    alert(locale === 'ko' ? '자재가 추가되었습니다!' : 'Material added successfully!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      {/* Header */}
      <div className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/production/dashboard')}
              className="text-amber-600 hover:text-amber-800"
            >
              ← {t.back}
            </button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-800">
                {locale === 'ko' ? '자재 구매 대기 목록' : 'Materials Awaiting Purchase'}
              </h1>
              <p className="text-gray-600 mt-1">
                {locale === 'ko' ? '구매 승인 대기 중인 자재' : 'Materials pending purchase approval'}
              </p>
            </div>
            <LanguageSwitcher />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 shadow">
            <p className="text-sm text-gray-600">{locale === 'ko' ? '전체 자재' : 'Total Materials'}</p>
            <p className="text-2xl font-bold text-amber-600">{materials.length}</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow">
            <p className="text-sm text-gray-600">{locale === 'ko' ? '긴급' : 'High Priority'}</p>
            <p className="text-2xl font-bold text-red-600">
              {materials.filter(m => m.urgency === 'high').length}
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow">
            <p className="text-sm text-gray-600">{locale === 'ko' ? '대기 중' : 'Pending'}</p>
            <p className="text-2xl font-bold text-yellow-600">
              {materials.filter(m => m.status === 'pending').length}
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow">
            <p className="text-sm text-gray-600">{locale === 'ko' ? '승인됨' : 'Approved'}</p>
            <p className="text-2xl font-bold text-blue-600">
              {materials.filter(m => m.status === 'approved').length}
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow">
            <p className="text-sm text-gray-600">{locale === 'ko' ? '총 예상 비용' : 'Total Est. Cost'}</p>
            <p className="text-2xl font-bold text-green-600">
              ₩{(materials.reduce((sum, m) => sum + m.estimatedCost, 0) / 1000000).toFixed(1)}M
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {locale === 'ko' ? '카테고리' : 'Category'}
              </label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
              >
                <option value="all">{locale === 'ko' ? '전체' : 'All'}</option>
                <option value="electronic">{locale === 'ko' ? '전자 부품' : 'Electronic'}</option>
                <option value="mechanical">{locale === 'ko' ? '기계 부품' : 'Mechanical'}</option>
                <option value="packaging">{locale === 'ko' ? '포장재' : 'Packaging'}</option>
                <option value="chemical">{locale === 'ko' ? '화학 물질' : 'Chemical'}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {locale === 'ko' ? '긴급도' : 'Urgency'}
              </label>
              <select
                value={filterUrgency}
                onChange={(e) => setFilterUrgency(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
              >
                <option value="all">{locale === 'ko' ? '전체' : 'All'}</option>
                <option value="high">{locale === 'ko' ? '긴급' : 'High'}</option>
                <option value="medium">{locale === 'ko' ? '보통' : 'Medium'}</option>
                <option value="low">{locale === 'ko' ? '낮음' : 'Low'}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Materials List */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">
              {locale === 'ko' ? '자재 목록' : 'Materials List'} ({filteredMaterials.length})
            </h2>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white font-medium rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {locale === 'ko' ? '자재 추가' : 'Add Material'}
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {locale === 'ko' ? '자재 코드' : 'Material Code'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {locale === 'ko' ? '자재명' : 'Material Name'}
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    {locale === 'ko' ? '카테고리' : 'Category'}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    {locale === 'ko' ? '수량' : 'Quantity'}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    {locale === 'ko' ? '예상 비용' : 'Est. Cost'}
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    {locale === 'ko' ? '긴급도' : 'Urgency'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {locale === 'ko' ? '필요일' : 'Required Date'}
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    {locale === 'ko' ? '상태' : 'Status'}
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    {locale === 'ko' ? '작업' : 'Actions'}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredMaterials.map((material) => {
                  const categoryInfo = getCategoryInfo(material.category);
                  const urgencyInfo = getUrgencyInfo(material.urgency);
                  const statusInfo = getStatusInfo(material.status);
                  return (
                    <tr key={material.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{material.materialCode}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{material.materialName}</div>
                        <div className="text-xs text-gray-500">{material.supplier}</div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${categoryInfo.color}`}>
                          <span>{categoryInfo.icon}</span>
                          <span>{categoryInfo.label}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">{material.quantity.toLocaleString()}</div>
                        <div className="text-xs text-gray-500">{material.unit}</div>
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">
                          ₩{(material.estimatedCost / 1000000).toFixed(2)}M
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${urgencyInfo.color}`}>
                          <span>{urgencyInfo.icon}</span>
                          <span>{urgencyInfo.label}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{material.requiredDate}</div>
                        <div className="text-xs text-gray-500">{material.requestedBy}</div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleViewDetails(material)}
                            className="text-amber-600 hover:text-amber-800 text-sm font-medium hover:underline"
                          >
                            {t.viewDetails}
                          </button>
                          <button
                            onClick={() => handleDeleteMaterial(material)}
                            className="text-red-500 hover:text-red-700 text-sm font-medium hover:underline"
                          >
                            {locale === 'ko' ? '삭제' : 'Delete'}
                          </button>
                        </div>
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
      {isModalOpen && selectedMaterial && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">{selectedMaterial.materialCode}</h2>
                <p className="text-amber-100 text-sm">{selectedMaterial.materialName}</p>
              </div>
              <button onClick={closeModal} className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Overview */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-6 border border-amber-200">
                <div className="flex items-center gap-4 mb-4 flex-wrap">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">{locale === 'ko' ? '카테고리' : 'Category'}</p>
                    <select
                      value={editCategory}
                      onChange={e => setEditCategory(e.target.value as Material['category'])}
                      className={`px-4 py-2 rounded-full text-sm font-medium border-0 cursor-pointer focus:ring-2 focus:ring-amber-500 ${getCategoryInfo(editCategory).color}`}
                    >
                      <option value="electronic">{locale === 'ko' ? '⚡ 전자 부품' : '⚡ Electronic'}</option>
                      <option value="mechanical">{locale === 'ko' ? '⚙️ 기계 부품' : '⚙️ Mechanical'}</option>
                      <option value="packaging">{locale === 'ko' ? '📦 포장재' : '📦 Packaging'}</option>
                      <option value="chemical">{locale === 'ko' ? '🧪 화학 물질' : '🧪 Chemical'}</option>
                    </select>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">{locale === 'ko' ? '긴급도' : 'Urgency'}</p>
                    <select
                      value={editUrgency}
                      onChange={e => setEditUrgency(e.target.value as Material['urgency'])}
                      className={`px-4 py-2 rounded-full text-sm font-medium border-0 cursor-pointer focus:ring-2 focus:ring-amber-500 ${getUrgencyInfo(editUrgency).color}`}
                    >
                      <option value="high">{locale === 'ko' ? '🔴 긴급' : '🔴 High'}</option>
                      <option value="medium">{locale === 'ko' ? '🟡 보통' : '🟡 Medium'}</option>
                      <option value="low">{locale === 'ko' ? '🟢 낮음' : '🟢 Low'}</option>
                    </select>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">{locale === 'ko' ? '상태' : 'Status'}</p>
                    <select
                      value={editStatus}
                      onChange={e => setEditStatus(e.target.value as Material['status'])}
                      className={`px-4 py-2 rounded-full text-sm font-medium border-0 cursor-pointer focus:ring-2 focus:ring-amber-500 ${getStatusInfo(editStatus).color}`}
                    >
                      <option value="pending">{locale === 'ko' ? '대기 중' : 'Pending'}</option>
                      <option value="approved">{locale === 'ko' ? '승인됨' : 'Approved'}</option>
                      <option value="ordered">{locale === 'ko' ? '주문됨' : 'Ordered'}</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg p-4">
                    <p className="text-xs text-gray-600 mb-1">{locale === 'ko' ? '수량' : 'Quantity'}</p>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={editQuantity}
                        onChange={e => setEditQuantity(parseInt(e.target.value) || 0)}
                        className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-lg font-bold text-amber-600 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                        min={0}
                      />
                      <select
                        value={editUnit}
                        onChange={e => setEditUnit(e.target.value)}
                        className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-lg font-bold text-amber-600 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 cursor-pointer"
                      >
                        <option value="pcs">pcs</option>
                        <option value="kg">kg</option>
                        <option value="sets">sets</option>
                        <option value="liters">liters</option>
                        <option value="meters">meters</option>
                        <option value="rolls">rolls</option>
                        <option value="boxes">boxes</option>
                      </select>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <p className="text-xs text-gray-600 mb-1">{locale === 'ko' ? '예상 비용' : 'Estimated Cost'}</p>
                    <div className="flex items-center gap-1">
                      <span className="text-lg font-bold text-green-600">₩</span>
                      <input
                        type="number"
                        value={editEstimatedCost}
                        onChange={e => setEditEstimatedCost(parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-lg font-bold text-green-600 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        min={0}
                        step={100000}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{locale === 'ko' ? '공급업체' : 'Supplier'}</p>
                  <input
                    type="text"
                    value={editSupplier}
                    onChange={e => setEditSupplier(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">{locale === 'ko' ? '요청자' : 'Requested By'}</p>
                  <input
                    type="text"
                    value={editRequestedBy}
                    onChange={e => setEditRequestedBy(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">{locale === 'ko' ? '요청일' : 'Request Date'}</p>
                  <input
                    type="date"
                    value={editRequestDate}
                    onChange={e => setEditRequestDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">{locale === 'ko' ? '필요일' : 'Required Date'}</p>
                  <input
                    type="date"
                    value={editRequiredDate}
                    onChange={e => setEditRequiredDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Notes */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="font-semibold text-blue-800 mb-2">{locale === 'ko' ? '비고' : 'Notes'}</p>
                <textarea
                  value={editNotes}
                  onChange={e => setEditNotes(e.target.value)}
                  placeholder={locale === 'ko' ? '비고 입력' : 'Enter notes'}
                  rows={2}
                  className="w-full px-3 py-2 border border-blue-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button onClick={closeModal} className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg">
                  {t.close}
                </button>
                <button onClick={handleSaveMaterial} className="flex-1 px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg">
                  {locale === 'ko' ? '저장' : 'Save'}
                </button>
                {selectedMaterial.status === 'pending' && (
                  <button onClick={handleApprovePurchase} className="flex-1 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-lg">
                    {locale === 'ko' ? '구매 승인' : 'Approve Purchase'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Material Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {locale === 'ko' ? '자재 추가' : 'Add Material'}
                </h2>
                <p className="text-amber-100 text-sm">
                  {locale === 'ko' ? '새 자재 정보를 입력하세요' : 'Enter new material information'}
                </p>
              </div>
              <button onClick={() => { resetNewMaterialForm(); setIsAddModalOpen(false); }} className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Code & Name */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{locale === 'ko' ? '자재 코드' : 'Material Code'} *</p>
                  <input
                    type="text"
                    value={newMaterial.materialCode}
                    onChange={e => setNewMaterial(prev => ({ ...prev, materialCode: e.target.value }))}
                    placeholder="MAT-E-XXX"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">{locale === 'ko' ? '자재명' : 'Material Name'} *</p>
                  <input
                    type="text"
                    value={newMaterial.materialName}
                    onChange={e => setNewMaterial(prev => ({ ...prev, materialName: e.target.value }))}
                    placeholder={locale === 'ko' ? '자재명 입력' : 'Enter material name'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Category, Urgency, Status */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{locale === 'ko' ? '카테고리' : 'Category'}</p>
                  <select
                    value={newMaterial.category}
                    onChange={e => setNewMaterial(prev => ({ ...prev, category: e.target.value as Material['category'] }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  >
                    <option value="electronic">{locale === 'ko' ? '⚡ 전자 부품' : '⚡ Electronic'}</option>
                    <option value="mechanical">{locale === 'ko' ? '⚙️ 기계 부품' : '⚙️ Mechanical'}</option>
                    <option value="packaging">{locale === 'ko' ? '📦 포장재' : '📦 Packaging'}</option>
                    <option value="chemical">{locale === 'ko' ? '🧪 화학 물질' : '🧪 Chemical'}</option>
                  </select>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">{locale === 'ko' ? '긴급도' : 'Urgency'}</p>
                  <select
                    value={newMaterial.urgency}
                    onChange={e => setNewMaterial(prev => ({ ...prev, urgency: e.target.value as Material['urgency'] }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  >
                    <option value="high">{locale === 'ko' ? '🔴 긴급' : '🔴 High'}</option>
                    <option value="medium">{locale === 'ko' ? '🟡 보통' : '🟡 Medium'}</option>
                    <option value="low">{locale === 'ko' ? '🟢 낮음' : '🟢 Low'}</option>
                  </select>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">{locale === 'ko' ? '상태' : 'Status'}</p>
                  <select
                    value={newMaterial.status}
                    onChange={e => setNewMaterial(prev => ({ ...prev, status: e.target.value as Material['status'] }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  >
                    <option value="pending">{locale === 'ko' ? '대기 중' : 'Pending'}</option>
                    <option value="approved">{locale === 'ko' ? '승인됨' : 'Approved'}</option>
                    <option value="ordered">{locale === 'ko' ? '주문됨' : 'Ordered'}</option>
                  </select>
                </div>
              </div>

              {/* Quantity, Unit, Cost */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{locale === 'ko' ? '수량' : 'Quantity'}</p>
                  <input
                    type="number"
                    value={newMaterial.quantity}
                    onChange={e => setNewMaterial(prev => ({ ...prev, quantity: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    min={0}
                  />
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">{locale === 'ko' ? '단위' : 'Unit'}</p>
                  <select
                    value={newMaterial.unit}
                    onChange={e => setNewMaterial(prev => ({ ...prev, unit: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 cursor-pointer"
                  >
                    <option value="pcs">pcs</option>
                    <option value="kg">kg</option>
                    <option value="sets">sets</option>
                    <option value="liters">liters</option>
                    <option value="meters">meters</option>
                    <option value="rolls">rolls</option>
                    <option value="boxes">boxes</option>
                  </select>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">{locale === 'ko' ? '예상 비용 (₩)' : 'Estimated Cost (₩)'}</p>
                  <input
                    type="number"
                    value={newMaterial.estimatedCost}
                    onChange={e => setNewMaterial(prev => ({ ...prev, estimatedCost: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    min={0}
                    step={100000}
                  />
                </div>
              </div>

              {/* Supplier & Requested By */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{locale === 'ko' ? '공급업체' : 'Supplier'}</p>
                  <input
                    type="text"
                    value={newMaterial.supplier}
                    onChange={e => setNewMaterial(prev => ({ ...prev, supplier: e.target.value }))}
                    placeholder={locale === 'ko' ? '공급업체 입력' : 'Enter supplier'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">{locale === 'ko' ? '요청자' : 'Requested By'}</p>
                  <input
                    type="text"
                    value={newMaterial.requestedBy}
                    onChange={e => setNewMaterial(prev => ({ ...prev, requestedBy: e.target.value }))}
                    placeholder={locale === 'ko' ? '요청자 입력' : 'Enter requester'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{locale === 'ko' ? '요청일' : 'Request Date'}</p>
                  <input
                    type="date"
                    value={newMaterial.requestDate}
                    onChange={e => setNewMaterial(prev => ({ ...prev, requestDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">{locale === 'ko' ? '필요일' : 'Required Date'}</p>
                  <input
                    type="date"
                    value={newMaterial.requiredDate}
                    onChange={e => setNewMaterial(prev => ({ ...prev, requiredDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <p className="text-sm text-gray-600 mb-1">{locale === 'ko' ? '비고' : 'Notes'}</p>
                <textarea
                  value={newMaterial.notes}
                  onChange={e => setNewMaterial(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder={locale === 'ko' ? '비고 입력' : 'Enter notes'}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => { resetNewMaterialForm(); setIsAddModalOpen(false); }}
                  className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg"
                >
                  {t.close}
                </button>
                <button
                  onClick={handleCreateMaterial}
                  className="flex-1 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-lg"
                >
                  {locale === 'ko' ? '자재 추가' : 'Add Material'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
