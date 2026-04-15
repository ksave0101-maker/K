'use client';

import { useState } from 'react';
import { useLocale } from '@/lib/LocaleContext';
import { RefreshCw, Grid, ExternalLink } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  image: string;
  outOfStock?: boolean;
  sale?: boolean;
}

// Mock products data
const productsData: Product[] = [
  {
    id: 1,
    name: 'Machine Monitoring Completed Set',
    category: 'Uncategorized',
    price: 8950,
    originalPrice: 9980,
    image: '/placeholder-product.jpg',
  },
  {
    id: 2,
    name: 'PT100 Temperature Sensor ชุดวัดอุณหภูมิ PT100 การเชื่อมต่อข้อมูลแบบ BLE',
    category: 'Uncategorized',
    price: 2700,
    image: '/placeholder-product.jpg',
  },
  {
    id: 3,
    name: 'Smart EC Sensor',
    category: 'Uncategorized',
    price: 5050,
    image: '/placeholder-product.jpg',
    outOfStock: true,
  },
  {
    id: 4,
    name: 'Smart Meter 3 Phase (Flexible Coil) เครื่องวัดพลังงานไฟฟ้าฮอนล์ 3 เฟส',
    category: 'Uncategorized',
    price: 8450,
    image: '/placeholder-product.jpg',
  },
];

export default function ProductsInfoPage() {
  const { t } = useLocale();
  const [sortBy, setSortBy] = useState('default');

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-3xl">😊</span>
              <h1 className="text-2xl font-semibold text-gray-800">
                {t('productsInfo')}
              </h1>
            </div>
            <p className="text-gray-600">{t('browseOurProductsAndServices')}</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <RefreshCw className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Grid className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-blue-600">
              <ExternalLink className="w-5 h-5" />
              <span className="ml-1 text-sm font-medium">{t('openInNewTab')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {t('showing')} 1–12 {t('of')} 22 {t('results')}
          </div>
          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="default">{t('sortByDefault')}</option>
              <option value="price-asc">{t('priceLowToHigh')}</option>
              <option value="price-desc">{t('priceHighToLow')}</option>
              <option value="name">{t('sortByName')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {productsData.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
          >
            {/* Product Image */}
            <div className="relative h-64 bg-gray-100">
              <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <div className="text-6xl mb-2">📦</div>
                  <p className="text-sm">{t('productImage')}</p>
                </div>
              </div>
              {product.outOfStock && (
                <div className="absolute top-2 right-2 px-3 py-1 bg-red-500 text-white text-sm font-semibold rounded">
                  OUT OF STOCK
                </div>
              )}
              {product.sale && (
                <div className="absolute top-2 left-2 px-3 py-1 bg-red-500 text-white text-sm font-semibold rounded">
                  Sale!
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="p-4">
              <p className="text-xs text-gray-500 mb-2">{product.category}</p>
              <h3 className="text-sm font-medium text-gray-800 mb-3 line-clamp-2 h-10">
                {product.name}
              </h3>

              {/* Price */}
              <div className="mb-3">
                {product.originalPrice ? (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 line-through text-sm">
                      ฿{product.originalPrice.toLocaleString()}
                    </span>
                    <span className="text-lg font-bold text-primary">
                      ฿{product.price.toLocaleString()}
                    </span>
                  </div>
                ) : (
                  <span className="text-lg font-bold text-primary">
                    ฿{product.price.toLocaleString()}
                  </span>
                )}
              </div>

              {/* Request Quotation Button */}
              <button className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors text-sm">
                {t('requestQuotation')}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Load More */}
      <div className="mt-8 text-center">
        <button className="px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-md font-medium transition-colors">
          {t('loadMore')}
        </button>
      </div>
    </div>
  );
}
