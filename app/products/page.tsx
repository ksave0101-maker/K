'use client';

import { Package, Search, Heart, ShoppingCart, Star, Zap, Shield, Leaf } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useLocale } from '@/context/LocaleContext';
import { translations } from '@/translations';
import Image from 'next/image';

export default function ProductsPage() {
  const { locale } = useLocale();
  const t = translations[locale];
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/korea/products')
      .then(r => r.json())
      .then(data => setProducts(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  const _staticProducts = [
    {
      id: 1,
      name: 'K-SAVER 10',
      category: 'Power Saving Device',
      price: 12999,
      rating: 4.8,
      reviews: 156,
      inStock: true,
      image: 'https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=328,fit=crop,q=95/AMqDpBqx0RHlW36D/logo-kenergysave-YBgKEvz0bZtlqpNx.png',
      description: 'Entry-level power saving solution for small to medium applications',
      specs: ['7-10% power reduction', 'Up to 30A capacity', 'Voltage stabilization', 'Surge protection'],
      features: ['🔋 Energy Efficient', '🛡️ Equipment Protection', '♻️ Eco-Friendly']
    },
    {
      id: 2,
      name: 'K-SAVER 30',
      category: 'Power Saving Device',
      price: 28999,
      rating: 4.9,
      reviews: 243,
      inStock: true,
      image: 'https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=328,fit=crop,q=95/AMqDpBqx0RHlW36D/logo-kenergysave-YBgKEvz0bZtlqpNx.png',
      description: 'Mid-range solution with enhanced power quality improvement',
      specs: ['10-15% power reduction', 'Up to 60A capacity', 'Advanced voltage regulation', 'Harmonic reduction'],
      features: ['⚡ High Performance', '📊 Power Quality', '🌍 Global Standard']
    },
    {
      id: 3,
      name: 'K-SAVER Max',
      category: 'Power Saving Device',
      price: 45999,
      rating: 5.0,
      reviews: 189,
      inStock: true,
      image: 'https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=328,fit=crop,q=95/AMqDpBqx0RHlW36D/logo-kenergysave-YBgKEvz0bZtlqpNx.png',
      description: 'Premium power saving device for industrial and commercial applications',
      specs: ['12-20% power reduction', 'Up to 100A capacity', 'Full power optimization', 'Complete system protection'],
      features: ['🏆 Premium Quality', '🔬 Advanced Tech', '✅ Certified Reliability']
    },
    {
      id: 4,
      name: 'K-SAVER Installation Kit',
      category: 'Accessories',
      price: 2999,
      rating: 4.6,
      reviews: 89,
      inStock: true,
      image: 'https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=328,fit=crop,q=95/AMqDpBqx0RHlW36D/logo-kenergysave-YBgKEvz0bZtlqpNx.png',
      description: 'Complete installation kit for K-SAVER devices',
      specs: ['Professional mounting hardware', 'Cable management', 'Installation manual', 'Safety equipment'],
      features: ['🔧 Easy Install', '📖 Instructions Included', '🔒 Safety First']
    },
    {
      id: 5,
      name: 'K-SAVER Monitoring System',
      category: 'Accessories',
      price: 8999,
      rating: 4.7,
      reviews: 124,
      inStock: true,
      image: 'https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=328,fit=crop,q=95/AMqDpBqx0RHlW36D/logo-kenergysave-YBgKEvz0bZtlqpNx.png',
      description: 'Real-time monitoring and analytics system for K-SAVER devices',
      specs: ['Real-time data tracking', 'Mobile app integration', 'Energy consumption reports', 'Alert notifications'],
      features: ['📱 Smart Monitoring', '📈 Analytics Dashboard', '🔔 Real-time Alerts']
    },
    {
      id: 6,
      name: 'Extended Warranty Package',
      category: 'Service',
      price: 4999,
      rating: 4.8,
      reviews: 201,
      inStock: true,
      image: 'https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=328,fit=crop,q=95/AMqDpBqx0RHlW36D/logo-kenergysave-YBgKEvz0bZtlqpNx.png',
      description: '5-year extended warranty with priority support',
      specs: ['5-year coverage', 'Priority technical support', 'Free annual inspection', 'Parts replacement included'],
      features: ['🛡️ Peace of Mind', '⏰ Long-term Protection', '👨‍🔧 Expert Support']
    },
  ];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{t.products}</h1>
        <p className="text-gray-600">K Energy Save - Power Saving Solutions</p>
      </div>

      {/* Info Banner */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 mb-6 border border-green-200">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Energy Saving Technology</h3>
            <p className="text-sm text-gray-700 mb-3">
              K-SAVER devices reduce power consumption by 7-15% while improving power quality and protecting your electrical equipment.
              Certified, eco-friendly, and trusted worldwide.
            </p>
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-green-600" />
                <span className="text-gray-700">Patented Technology</span>
              </div>
              <div className="flex items-center gap-2">
                <Leaf className="w-4 h-4 text-green-600" />
                <span className="text-gray-700">Eco-Friendly</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-green-600" />
                <span className="text-gray-700">Power Quality</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex-1 min-w-[250px] relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={`${t.search} ${t.products}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <select 
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
          >
            <option value="all">{t.allCategories}</option>
            <option value="Power Saving Device">Power Saving Device</option>
            <option value="Accessories">{t.accessories}</option>
            <option value="Service">Service</option>
          </select>
        </div>
        <div className="mt-4 text-sm text-gray-600">
          Showing {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <div key={product.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-all group">
            {/* Product Image */}
            <div className="relative bg-gradient-to-br from-green-50 to-emerald-50 h-48 flex items-center justify-center p-6">
              <Image
                src={product.image}
                alt={product.name}
                width={200}
                height={100}
                className="object-contain max-h-32"
                unoptimized
              />
              {!product.inStock && (
                <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                  {t.outOfStock}
                </div>
              )}
              <button className="absolute top-3 left-3 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50">
                <Heart className="w-4 h-4 text-gray-600 hover:text-red-500" />
              </button>
            </div>

            {/* Product Info */}
            <div className="p-5">
              <div className="text-xs text-primary font-medium mb-1">{product.category}</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{product.name}</h3>
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
              
              {/* Features Pills */}
              <div className="flex flex-wrap gap-1 mb-3">
                {product.features.map((feature: string, idx: number) => (
                  <span key={idx} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                    {feature}
                  </span>
                ))}
              </div>

              {/* Specs */}
              <div className="mb-3 space-y-1">
                {product.specs.slice(0, 2).map((spec: string, idx: number) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-gray-600">
                    <span className="text-green-600 mt-0.5">✓</span>
                    <span>{spec}</span>
                  </div>
                ))}
              </div>
              
              {/* Rating */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(product.rating)
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600">
                  {product.rating} ({product.reviews} {t.reviews})
                </span>
              </div>

              {/* Price and Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div>
                  <div className="text-xs text-gray-500 mb-1">Price</div>
                  <div className="text-2xl font-bold text-gray-900">
                    ${(product.price / 100).toFixed(0)}
                  </div>
                </div>
                <button
                  disabled={!product.inStock}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    product.inStock
                      ? 'bg-primary text-white hover:bg-primary/90'
                      : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <ShoppingCart className="w-4 h-4" />
                  {product.inStock ? t.addToCart : t.outOfStock}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* No Results */}
      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-600">Try adjusting your search or filters</p>
        </div>
      )}

      {/* Company Info */}
      <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-start gap-4">
          <Image
            src="https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=328,fit=crop,q=95/AMqDpBqx0RHlW36D/logo-kenergysave-YBgKEvz0bZtlqpNx.png"
            alt="K Energy Save Logo"
            width={80}
            height={80}
            className="object-contain"
            unoptimized
          />
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">K Energy Save Co., Ltd.</h3>
            <p className="text-sm text-gray-700 mb-4">
              Leading provider of power-saving solutions with proven technology validated across global exports. 
              Our certified, eco-friendly, and patented solutions improve power quality and system reliability for 
              industrial and commercial applications worldwide.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Thailand Office</h4>
                <p className="text-sm text-gray-600">
                  84 Chaloem Phrakiat Rama 9 Soi 34<br />
                  Nong Bon, Prawet, Bangkok 10250<br />
                  📞 +66 2 0808916<br />
                  📧 info@kenergy-save.com
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Korea Office</h4>
                <p className="text-sm text-gray-600">
                  2F, 16-10, 166beon-gil, Elseso-ro<br />
                  Gunpo-si, Gyeonggi-do, Korea<br />
                  📞 +82 31-427-1380<br />
                  📧 info@zera-energy.com
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
