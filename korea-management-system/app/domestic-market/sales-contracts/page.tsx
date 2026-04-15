'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from '@/lib/LocaleContext';
import { translations } from '@/lib/translations';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { ArrowLeft, FileSignature, Plus, Eye, Trash2, X, Search as SearchIcon, Printer, FileDown } from 'lucide-react';

interface SalesContract {
  id: number;
  contractNumber: string;
  region: string;
  regionKey: string;
  buyer: string;
  seller: string;
  productName: string;
  quantity: number;
  contractValue: number;
  contractDate: string;
  deliveryDate: string;
  status: 'active' | 'completed' | 'pending' | 'terminated';
  remarks: string;
}

export default function DomesticSalesContractsPage() {
  const router = useRouter();
  const { locale } = useLocale();
  const t = translations[locale];
  const [searchTerm, setSearchTerm] = useState('');
  const [regionFilter, setRegionFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedItem, setSelectedItem] = useState<SalesContract | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const regions = locale === 'ko'
    ? [{ key: 'seoul', name: '서울/경기' }, { key: 'busan', name: '부산/경남' }, { key: 'daegu', name: '대구/경북' }, { key: 'daejeon', name: '대전/충청' }, { key: 'gwangju', name: '광주/전라' }, { key: 'incheon', name: '인천/강원' }, { key: 'jeju', name: '제주' }]
    : [{ key: 'seoul', name: 'Seoul/Gyeonggi' }, { key: 'busan', name: 'Busan/Gyeongnam' }, { key: 'daegu', name: 'Daegu/Gyeongbuk' }, { key: 'daejeon', name: 'Daejeon/Chungcheong' }, { key: 'gwangju', name: 'Gwangju/Jeolla' }, { key: 'incheon', name: 'Incheon/Gangwon' }, { key: 'jeju', name: 'Jeju' }];

  const [items, setItems] = useState<SalesContract[]>([
    { id: 1, contractNumber: 'DSC-2026-001', region: '서울/경기', regionKey: 'seoul', buyer: '서울특별시청', seller: 'K Energy Save Co., Ltd', productName: '태양광 패널 시스템 500kW', quantity: 1, contractValue: 2500000000, contractDate: '2026-01-15', deliveryDate: '2026-06-30', status: 'active', remarks: '서울시 친환경 에너지 1단계 사업' },
    { id: 2, contractNumber: 'DSC-2026-002', region: '부산/경남', regionKey: 'busan', buyer: '삼성중공업', seller: 'K Energy Save Co., Ltd', productName: '에너지 절감 장치 A200', quantity: 200, contractValue: 1800000000, contractDate: '2026-01-20', deliveryDate: '2026-05-15', status: 'active', remarks: '거제 조선소 에너지 효율화 프로젝트' },
    { id: 3, contractNumber: 'DSC-2026-003', region: '대구/경북', regionKey: 'daegu', buyer: 'POSCO 포항제철', seller: 'K Energy Save Co., Ltd', productName: '스마트 인버터 SI-3000', quantity: 150, contractValue: 1350000000, contractDate: '2026-01-10', deliveryDate: '2026-04-30', status: 'active', remarks: '포항 제철소 전력 관리 고도화' },
    { id: 4, contractNumber: 'DSC-2026-004', region: '대전/충청', regionKey: 'daejeon', buyer: 'KAIST', seller: 'K Energy Save Co., Ltd', productName: '전력 모니터링 시스템 PMS', quantity: 5, contractValue: 450000000, contractDate: '2025-12-01', deliveryDate: '2026-03-31', status: 'completed', remarks: '연구단지 전력 모니터링 구축 완료' },
    { id: 5, contractNumber: 'DSC-2026-005', region: '서울/경기', regionKey: 'seoul', buyer: '현대건설', seller: 'K Energy Save Co., Ltd', productName: 'EV 충전기 EC-300', quantity: 300, contractValue: 900000000, contractDate: '2025-11-15', deliveryDate: '2026-02-28', status: 'completed', remarks: '신규 아파트 단지 충전 인프라' },
    { id: 6, contractNumber: 'DSC-2026-006', region: '광주/전라', regionKey: 'gwangju', buyer: '한국전력공사 전남지사', seller: 'K Energy Save Co., Ltd', productName: 'LED 조명 모듈 LM-100', quantity: 1000, contractValue: 320000000, contractDate: '2025-10-20', deliveryDate: '2026-01-31', status: 'completed', remarks: '공공기관 LED 교체 사업' },
    { id: 7, contractNumber: 'DSC-2026-007', region: '인천/강원', regionKey: 'incheon', buyer: '인천국제공항공사', seller: 'K Energy Save Co., Ltd', productName: '태양광 컨트롤러 SC-200', quantity: 100, contractValue: 680000000, contractDate: '2026-02-01', deliveryDate: '2026-07-31', status: 'pending', remarks: '공항 지붕 태양광 설치 승인 대기' },
    { id: 8, contractNumber: 'DSC-2026-008', region: '제주', regionKey: 'jeju', buyer: '제주에너지공사', seller: 'K Energy Save Co., Ltd', productName: '풍력 변환 시스템 WCS-500', quantity: 10, contractValue: 2200000000, contractDate: '2026-02-05', deliveryDate: '2026-09-30', status: 'pending', remarks: '제주 해상풍력 연계 프로젝트' },
    { id: 9, contractNumber: 'DSC-2026-009', region: '부산/경남', regionKey: 'busan', buyer: 'LG화학 울산공장', seller: 'K Energy Save Co., Ltd', productName: '배터리 저장 시스템 BS-500', quantity: 30, contractValue: 1050000000, contractDate: '2025-09-01', deliveryDate: '2025-12-31', status: 'terminated', remarks: '사업 범위 변경으로 계약 해지' },
    { id: 10, contractNumber: 'DSC-2026-010', region: '대구/경북', regionKey: 'daegu', buyer: '경북도청', seller: 'K Energy Save Co., Ltd', productName: '에너지 감사 키트 EAK-1', quantity: 50, contractValue: 180000000, contractDate: '2026-01-25', deliveryDate: '2026-04-15', status: 'active', remarks: '경북 공공건물 에너지 감사 장비' },
  ]);

  const [newItem, setNewItem] = useState({ region: 'seoul', buyer: '', productName: '', quantity: 0, contractValue: 0, deliveryDate: '', remarks: '' });

  const formatCurrency = (v: number) => '₩' + new Intl.NumberFormat(locale === 'ko' ? 'ko-KR' : 'en-US').format(v);

  const statusBadge = (s: string) => {
    const map: Record<string, string> = { active: 'bg-green-100 text-green-700', completed: 'bg-blue-100 text-blue-700', pending: 'bg-yellow-100 text-yellow-700', terminated: 'bg-red-100 text-red-700' };
    const label: Record<string, string> = { active: t.active, completed: t.completed, pending: t.pending, terminated: t.terminated };
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${map[s]}`}>{label[s]}</span>;
  };

  const filtered = items.filter(o => {
    const matchSearch = o.contractNumber.toLowerCase().includes(searchTerm.toLowerCase()) || o.buyer.toLowerCase().includes(searchTerm.toLowerCase()) || o.productName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchRegion = regionFilter === 'all' || o.regionKey === regionFilter;
    const matchStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchSearch && matchRegion && matchStatus;
  });

  const handleDelete = (id: number) => {
    if (confirm(locale === 'ko' ? '정말 삭제하시겠습니까?' : 'Are you sure you want to delete?')) {
      setItems(items.filter(o => o.id !== id));
    }
  };

  const handleCreate = () => {
    const newId = Math.max(...items.map(o => o.id)) + 1;
    setItems([...items, {
      id: newId,
      contractNumber: `DSC-2026-${String(newId).padStart(3, '0')}`,
      region: regions.find(r => r.key === newItem.region)?.name || '',
      regionKey: newItem.region,
      buyer: newItem.buyer,
      seller: 'K Energy Save Co., Ltd',
      productName: newItem.productName,
      quantity: newItem.quantity,
      contractValue: newItem.contractValue,
      contractDate: '2026-02-15',
      deliveryDate: newItem.deliveryDate,
      status: 'pending',
      remarks: newItem.remarks,
    }]);
    setIsAddModalOpen(false);
    setNewItem({ region: 'seoul', buyer: '', productName: '', quantity: 0, contractValue: 0, deliveryDate: '', remarks: '' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-violet-100">
      {/* Header */}
      <div className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => router.push('/domestic-market/dashboard')} className="text-purple-600 hover:text-purple-800 flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />{t.back}
              </button>
              <div className="border-l-2 border-gray-300 pl-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                  <FileSignature className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-800">{t.salesContracts}</h1>
                  <p className="text-xs text-gray-500">🇰🇷 {t.domesticMarket}</p>
                </div>
              </div>
            </div>
            <LanguageSwitcher />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-md p-4">
            <p className="text-sm text-gray-600">{t.active}</p>
            <p className="text-2xl font-bold text-green-600">{items.filter(i => i.status === 'active').length}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <p className="text-sm text-gray-600">{t.pending}</p>
            <p className="text-2xl font-bold text-yellow-600">{items.filter(i => i.status === 'pending').length}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <p className="text-sm text-gray-600">{t.completed}</p>
            <p className="text-2xl font-bold text-blue-600">{items.filter(i => i.status === 'completed').length}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <p className="text-sm text-gray-600">{t.terminated}</p>
            <p className="text-2xl font-bold text-red-600">{items.filter(i => i.status === 'terminated').length}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" placeholder={t.search} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
            </div>
            <select value={regionFilter} onChange={e => setRegionFilter(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500">
              <option value="all">{t.allRegions}</option>
              {regions.map(r => <option key={r.key} value={r.key}>{r.name}</option>)}
            </select>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500">
              <option value="all">{t.contractStatus}</option>
              <option value="active">{t.active}</option>
              <option value="pending">{t.pending}</option>
              <option value="completed">{t.completed}</option>
              <option value="terminated">{t.terminated}</option>
            </select>
            <button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
              <Plus className="w-4 h-4" />{t.addNew}
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-purple-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">{t.contractNumber}</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">{t.region}</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">{t.buyer}</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">{t.productName}</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">{t.contractValue}</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">{t.deliveryDate}</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">{t.contractStatus}</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">{t.edit}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filtered.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-purple-600">{item.contractNumber}</td>
                    <td className="px-4 py-3 text-sm">{regions.find(r => r.key === item.regionKey)?.name || item.region}</td>
                    <td className="px-4 py-3 text-sm max-w-[150px] truncate">{item.buyer}</td>
                    <td className="px-4 py-3 text-sm max-w-[150px] truncate">{item.productName}</td>
                    <td className="px-4 py-3 text-sm text-right font-medium">{formatCurrency(item.contractValue)}</td>
                    <td className="px-4 py-3 text-sm">{item.deliveryDate}</td>
                    <td className="px-4 py-3 text-center">{statusBadge(item.status)}</td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => setSelectedItem(item)} className="text-purple-500 hover:text-purple-700"><Eye className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-500">{t.noData}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-bold">{t.viewDetails}</h2>
              <button onClick={() => setSelectedItem(null)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-xs text-gray-500">{t.contractNumber}</p><p className="font-medium">{selectedItem.contractNumber}</p></div>
                <div><p className="text-xs text-gray-500">{t.region}</p><p className="font-medium">{regions.find(r => r.key === selectedItem.regionKey)?.name || selectedItem.region}</p></div>
                <div><p className="text-xs text-gray-500">{t.buyer}</p><p className="font-medium">{selectedItem.buyer}</p></div>
                <div><p className="text-xs text-gray-500">{t.seller}</p><p className="font-medium">{selectedItem.seller}</p></div>
                <div><p className="text-xs text-gray-500">{t.productName}</p><p className="font-medium">{selectedItem.productName}</p></div>
                <div><p className="text-xs text-gray-500">{t.quantity}</p><p className="font-medium">{selectedItem.quantity.toLocaleString()}</p></div>
                <div><p className="text-xs text-gray-500">{t.contractValue}</p><p className="font-medium text-purple-700">{formatCurrency(selectedItem.contractValue)}</p></div>
                <div><p className="text-xs text-gray-500">{t.contractDate}</p><p className="font-medium">{selectedItem.contractDate}</p></div>
                <div><p className="text-xs text-gray-500">{t.deliveryDate}</p><p className="font-medium">{selectedItem.deliveryDate}</p></div>
                <div><p className="text-xs text-gray-500">{t.contractStatus}</p>{statusBadge(selectedItem.status)}</div>
              </div>
              <div><p className="text-xs text-gray-500">{t.remarks}</p><p className="font-medium">{selectedItem.remarks}</p></div>
              <div className="flex gap-2 pt-2">
                <button className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200"><Printer className="w-4 h-4" />{t.printDocument}</button>
                <button className="flex-1 flex items-center justify-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"><FileDown className="w-4 h-4" />{t.exportPDF}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-bold">{t.addNew} - {t.salesContracts}</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.region}</label>
                <select value={newItem.region} onChange={e => setNewItem({ ...newItem, region: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2">
                  {regions.map(r => <option key={r.key} value={r.key}>{r.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.buyer}</label>
                <input type="text" value={newItem.buyer} onChange={e => setNewItem({ ...newItem, buyer: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.productName}</label>
                <input type="text" value={newItem.productName} onChange={e => setNewItem({ ...newItem, productName: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.quantity}</label>
                  <input type="number" value={newItem.quantity} onChange={e => setNewItem({ ...newItem, quantity: Number(e.target.value) })} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.contractValue}</label>
                  <input type="number" value={newItem.contractValue} onChange={e => setNewItem({ ...newItem, contractValue: Number(e.target.value) })} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.deliveryDate}</label>
                <input type="date" value={newItem.deliveryDate} onChange={e => setNewItem({ ...newItem, deliveryDate: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.remarks}</label>
                <textarea value={newItem.remarks} onChange={e => setNewItem({ ...newItem, remarks: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" rows={3} />
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={() => setIsAddModalOpen(false)} className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300">{t.cancel}</button>
                <button onClick={handleCreate} className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700">{t.save}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
