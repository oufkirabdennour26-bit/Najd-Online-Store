import React from 'react';
import { Sparkles } from 'lucide-react';
import { Language, Category } from '../types';
import Navbar from '../components/Navbar';

interface MainLayoutProps {
  children: React.ReactNode;
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
  toastMessage: string;
}

export function MainLayout({
  children,
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
  toastMessage,
}: MainLayoutProps) {
  const isAr = lang === 'ar';

  return (
    <div className="min-h-screen bg-paper font-sans flex flex-col selection:bg-vermilion selection:text-white text-charcoal">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-none bg-charcoal text-white text-xs font-serif font-bold shadow-[4px_4px_0px_rgba(217,79,51,0.3)] flex items-center gap-2 border border-vermilion animate-bounce">
          <Sparkles className="w-4 h-4 text-vermilion shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Sticky Bilingual Header Navigation */}
      <Navbar
        lang={lang}
        setLang={setLang}
        search={search}
        setSearch={setSearch}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        cartCount={cartCount}
        toggleCart={toggleCart}
        showTracker={showTracker}
        setShowTracker={setShowTracker}
        showAdmin={showAdmin}
        setShowAdmin={setShowAdmin}
      />

      {/* Main Content Body */}
      <main className="flex-1 pb-20">{children}</main>

      {/* Footer copyright */}
      <footer className="border-t border-charcoal/10 bg-white py-12 mt-auto text-center text-xs text-charcoal/60">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p className="font-serif font-bold text-charcoal text-sm">
            {isAr ? '© ٢٠٢٦ متجر سلة الفاخر. جميع الحقوق محفوظة.' : '© 2026 Salla Store. All Rights Reserved.'}
          </p>
          <p className="max-w-md mx-auto leading-normal text-charcoal/50">
            {isAr
              ? 'متصل ببوابة دفع مشفرة تجريبية آمنة. يرجى عدم إدخال معلومات بطاقتك الائتمانية الحقيقية.'
              : 'Connected to a highly secure mock merchant account. Do NOT insert your real financial cards.'}
          </p>
        </div>
      </footer>
    </div>
  );
}
