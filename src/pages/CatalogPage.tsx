import React from 'react';
import { Tag, Loader2 } from 'lucide-react';
import { Product, Language, Category } from '../types';
import ProductCard from '../components/ProductCard';

interface CatalogPageProps {
  products: Product[];
  filteredProducts: Product[];
  isLoadingProducts: boolean;
  lang: Language;
  search: string;
  setSearch: (search: string) => void;
  setActiveCategory: (cat: Category | 'all') => void;
  onAddToCart: (product: Product) => void;
  onViewProduct: (product: Product) => void;
}

export function CatalogPage({
  filteredProducts,
  isLoadingProducts,
  lang,
  search,
  setSearch,
  setActiveCategory,
  onAddToCart,
  onViewProduct,
}: CatalogPageProps) {
  const isAr = lang === 'ar';

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 pt-8 space-y-12">
      {/* Decorative localized Salla Hero Banner with dynamic promo codes */}
      <div className="relative overflow-hidden bg-white border border-charcoal/15 shadow-[6px_6px_0px_rgba(26,26,26,0.06)] p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="space-y-4 max-w-xl text-center md:text-start flex flex-col items-center md:items-start">
          <span className="px-3.5 py-1.5 font-sans font-bold text-[10px] tracking-widest bg-charcoal text-white uppercase animate-pulse">
            {isAr ? 'عروض نهاية العام الفاخرة' : 'Limited Luxury Edition'}
          </span>
          <h1 className="text-3xl md:text-5xl font-serif font-black tracking-tight leading-[1.1] text-charcoal">
            {isAr
              ? 'اكتشف رقي المنتجات الحصرية والدفع الآمن السريع'
              : 'Discover Curated Luxury Items & Fast Checkout'}
          </h1>
          
          <div className="h-[2px] w-12 bg-vermilion" />
          
          <p className="text-xs md:text-sm text-charcoal/80 leading-relaxed max-w-lg font-sans">
            {isAr
              ? 'تسوق بثقة تامة عبر متجرنا المتكامل المدعوم بأنظمة تشفير دفع SSL ثلاثية الأبعاد لحماية بطاقتك الائتمانية ومعلوماتك.'
              : 'Shop with absolute peace of mind. Our state-of-the-art payment sandbox simulates bank-grade 256-bit TLS encryption.'}
          </p>

          {/* Promo Code Badges inside Hero */}
          <div className="pt-2 flex flex-wrap gap-2 text-xs">
            <div className="flex items-center gap-1.5 px-3.5 py-1.5 bg-paper text-charcoal border border-charcoal/10 font-serif font-bold text-[11px]">
              <Tag className="w-3.5 h-3.5 text-vermilion" />
              <span>
                {isAr ? 'خصم ١٠٪: WELCOME10' : '10% OFF: WELCOME10'}
              </span>
            </div>
            <div className="flex items-center gap-1.5 px-3.5 py-1.5 bg-paper text-charcoal border border-charcoal/10 font-serif font-bold text-[11px]">
              <Tag className="w-3.5 h-3.5 text-vermilion" />
              <span>
                {isAr ? 'خصم ٢٠٪: EASYBUY20' : '20% OFF: EASYBUY20'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Products grid container */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-charcoal/15 pb-4">
          <div>
            <h2 className="text-2xl font-serif font-black text-charcoal tracking-tight">
              {isAr ? 'قائمة المنتجات المميزة' : 'Featured Catalog'}
            </h2>
            <p className="text-xs text-charcoal/50 font-sans mt-1">
              {isAr 
                ? `نعرض ${filteredProducts.length} منتج حصري ومكفول` 
                : `Displaying ${filteredProducts.length} unique items`}
            </p>
          </div>
        </div>

        {/* Grid or Empty view or Loading view */}
        {isLoadingProducts ? (
          <div className="py-20 text-center space-y-4 bg-white border border-charcoal/10 shadow-[4px_4px_0px_rgba(26,26,26,0.04)] max-w-lg mx-auto p-8 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 text-vermilion animate-spin mb-2" />
            <p className="text-sm font-serif font-bold text-charcoal">
              {isAr ? 'جاري تحميل المنتجات من قاعدة البيانات...' : 'Loading catalog from database...'}
            </p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-20 text-center space-y-4 bg-white border border-charcoal/10 shadow-[4px_4px_0px_rgba(26,26,26,0.04)] max-w-lg mx-auto p-8">
            <p className="text-base font-serif font-bold text-charcoal">
              {isAr ? 'لم نجد أي نتائج تطابق بحثك' : 'No matches found for your query'}
            </p>
            <p className="text-xs text-charcoal/60 max-w-xs mx-auto leading-relaxed">
              {isAr 
                ? 'جرب البحث بكلمات أخرى أو اختر فئة منتجات مختلفة من الشريط العلوي.' 
                : 'Try typing a different keyword or toggle alternate categories.'}
            </p>
            <button
              onClick={() => { setSearch(''); setActiveCategory('all'); }}
              className="mt-4 px-5 py-2.5 bg-vermilion hover:bg-charcoal text-white text-xs font-serif font-bold tracking-wider transition-all"
            >
              {isAr ? 'إعادة تعيين المرشحات' : 'Reset Filters'}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                lang={lang}
                onAddToCart={onAddToCart}
                onViewDetails={onViewProduct}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
