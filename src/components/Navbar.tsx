import React from 'react';
import { Search, ShoppingBag, Globe, PackageOpen, ShieldCheck } from 'lucide-react';
import { Language, Category } from '../types';

interface NavbarProps {
  lang: Language;
  setLang: (lang: Language) => void;
  search: string;
  setSearch: (search: string) => void;
  activeCategory: Category | 'all';
  setActiveCategory: (cat: Category | 'all') => void;
  cartCount: number;
  toggleCart: () => void;
  showTracker: boolean;
  setShowTracker: (show: boolean) => void;
  showAdmin: boolean;
  setShowAdmin: (show: boolean) => void;
}

export default function Navbar({
  lang,
  setLang,
  search,
  setSearch,
  activeCategory,
  setActiveCategory,
  cartCount,
  toggleCart,
  showTracker,
  setShowTracker,
  showAdmin,
  setShowAdmin,
}: NavbarProps) {
  const isAr = lang === 'ar';

  const categories: { id: Category | 'all'; ar: string; en: string }[] = [
    { id: 'all', ar: 'جميع المنتجات', en: 'All Products' },
    { id: 'electronics', ar: 'إلكترونيات', en: 'Electronics' },
    { id: 'home', ar: 'المنزل والمعيشة', en: 'Home & Living' },
    { id: 'fashion', ar: 'الأزياء والإكسسوارات', en: 'Fashion' },
    { id: 'wellness', ar: 'العناية والصحة', en: 'Wellness' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 border-b border-charcoal/10 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* Logo */}
          <div 
            className="flex items-center gap-2 cursor-pointer shrink-0" 
            onClick={() => {
              setShowTracker(false);
              setShowAdmin(false);
              setActiveCategory('all');
            }}
          >
            <div className="w-10 h-10 bg-charcoal flex items-center justify-center text-white font-serif font-black text-xl tracking-tight">
              S
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-serif font-black text-charcoal tracking-tight leading-none">
                {isAr ? 'متجر سلة الفاخر' : 'Salla Store'}
              </span>
              <span className="text-[10px] font-bold text-vermilion uppercase tracking-wider mt-1 font-sans">
                {isAr ? 'دفع آمن ١٠٠٪' : '100% Secure Checkout'}
              </span>
            </div>
          </div>

          {/* Search bar (Hidden in tracker or admin mode) */}
          {!showTracker && !showAdmin && (
            <div className="hidden md:flex items-center flex-1 max-w-md relative">
              <input
                type="text"
                placeholder={isAr ? 'ابحث عن منتج فريد...' : 'Search unique products...'}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={`w-full py-2.5 px-4 rounded-none border border-charcoal/10 text-sm bg-paper focus:bg-white focus:outline-none focus:border-vermilion transition-all ${
                  isAr ? 'pr-10 text-right' : 'pl-10 text-left'
                }`}
              />
              <Search className={`w-4 h-4 text-charcoal/40 absolute ${isAr ? 'right-3' : 'left-3'}`} />
            </div>
          )}

          {/* Actions panel */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Admin Dashboard Switcher */}
            <button
              onClick={() => {
                setShowAdmin(!showAdmin);
                if (!showAdmin) setShowTracker(false);
              }}
              className={`flex items-center gap-1.5 px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-none text-xs font-serif font-bold border transition-colors ${
                showAdmin
                  ? 'bg-vermilion text-white border-vermilion'
                  : 'bg-paper text-charcoal border-charcoal/15 hover:bg-charcoal hover:text-white'
              }`}
            >
              <ShieldCheck className="w-4 h-4 shrink-0 text-vermilion" />
              <span className="hidden sm:inline">{isAr ? 'لوحة التحكم' : 'Admin'}</span>
            </button>

            {/* Order Tracker Switcher */}
            <button
              onClick={() => {
                setShowTracker(!showTracker);
                if (!showTracker) setShowAdmin(false);
              }}
              className={`flex items-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2.5 rounded-none text-xs font-serif font-bold border transition-colors ${
                showTracker
                  ? 'bg-charcoal text-white border-charcoal'
                  : 'bg-white text-charcoal border-charcoal/10 hover:bg-paper'
              }`}
            >
              <PackageOpen className="w-4 h-4 shrink-0 text-vermilion" />
              <span>{isAr ? 'تتبع طلبك' : 'Track Order'}</span>
            </button>

            {/* Language Switcher */}
            <button
              onClick={() => setLang(isAr ? 'en' : 'ar')}
              className="flex items-center gap-1.5 px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-none border border-charcoal/10 text-xs font-serif font-bold text-charcoal hover:bg-paper transition-colors"
            >
              <Globe className="w-3.5 h-3.5 text-vermilion" />
              <span>{isAr ? 'English' : 'العربية'}</span>
            </button>

            {/* Cart Button */}
            <button
              onClick={toggleCart}
              className="relative p-2.5 text-charcoal hover:bg-paper transition-colors"
              aria-label="Cart"
            >
              <ShoppingBag className="w-6 h-6" />
              {cartCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-5 h-5 rounded-none bg-vermilion text-white text-[10px] font-bold flex items-center justify-center animate-bounce">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Categories Bar (Only show when not in Tracker or Admin mode) */}
        {!showTracker && !showAdmin && (
          <div className="flex items-center gap-2 py-3 overflow-x-auto scrollbar-none border-t border-charcoal/10">
            {categories.map((cat) => {
              const active = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-4 py-2 rounded-none text-xs font-serif font-bold whitespace-nowrap border transition-all duration-200 ${
                    active
                      ? 'bg-vermilion text-white border-vermilion shadow-[2px_2px_0px_rgba(26,26,26,0.1)]'
                      : 'bg-paper text-charcoal border-charcoal/5 hover:bg-charcoal/5 hover:border-charcoal/20'
                  }`}
                >
                  {isAr ? cat.ar : cat.en}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </header>
  );
}
