import React, { useState, useEffect } from 'react';
import { ShoppingBag, X, Sparkles, Check } from 'lucide-react';
import { Language, CartItem, Product, PromoCode, Category } from './types';
import { useLanguage } from './hooks/useLanguage';
import { useCart } from './hooks/useCart';
import { MainLayout } from './layouts/MainLayout';
import { CatalogPage } from './pages/CatalogPage';
import { AdminPage } from './pages/AdminPage';
import { productService } from './services/productService';
import { settingsService } from './services/settingsService';
import { StoreSettingsFormData } from './types/admin';
import CartDrawer from './components/CartDrawer';
import CheckoutModal from './components/CheckoutModal';
import OrderTracker from './components/OrderTracker';

export default function App() {
  const { lang, setLang, isAr } = useLanguage();

  // State
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<Category | 'all'>('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [shippingCost, setShippingCost] = useState<number>(0.0);
  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null);
  const [storeSettings, setStoreSettings] = useState<StoreSettingsFormData | null>(null);

  // View control
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [showTracker, setShowTracker] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);

  // Toast
  const [toastMessage, setToastMessage] = useState('');

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 3000);
  };

  // Load products from service
  const fetchProducts = async () => {
    setIsLoadingProducts(true);
    try {
      const data = await productService.getProducts();
      setProducts(Array.isArray(data) ? data : (data as any)?.items || []);
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Load store settings (shipping cost, tax rate, maintenance mode) from the server
  useEffect(() => {
    (async () => {
      try {
        const settings = await settingsService.getPublicSettings();
        setStoreSettings(settings);
        setShippingCost(settings.defaultShippingCost);
      } catch (err) {
        console.error('Error fetching store settings:', err);
      }
    })();
  }, []);

  // Use custom cart hook
  const {
    cart,
    handleAddToCart,
    handleUpdateQuantity,
    handleRemoveItem,
    handleClearCart,
    cartCount,
  } = useCart(products, triggerToast, isAr, fetchProducts);

  // Filter products
  const safeProducts = Array.isArray(products) ? products : [];
  const filteredProducts = safeProducts.filter((product) => {
    const matchCategory = activeCategory === 'all' || product.category === activeCategory;
    const trans = (isAr ? product.ar : product.en) || product.ar || product.en || { name: '', description: '' };
    const name = trans.name || '';
    const desc = trans.description || '';
    const matchSearch =
      name.toLowerCase().includes(search.toLowerCase()) ||
      desc.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <MainLayout
      lang={lang}
      setLang={setLang}
      search={search}
      setSearch={setSearch}
      activeCategory={activeCategory}
      setActiveCategory={setActiveCategory}
      cartCount={cartCount}
      toggleCart={() => setIsCartOpen(!isCartOpen)}
      showTracker={showTracker}
      setShowTracker={setShowTracker}
      showAdmin={showAdmin}
      setShowAdmin={setShowAdmin}
      toastMessage={toastMessage}
    >
      {showAdmin ? (
        /* Admin Page View (always reachable, even during maintenance, so it can be turned off) */
        <AdminPage
          lang={lang}
          onClose={() => setShowAdmin(false)}
          onProductsUpdated={fetchProducts}
        />
      ) : storeSettings?.isMaintenanceMode ? (
        /* Maintenance Mode View */
        <div className="flex flex-col items-center justify-center text-center py-32 px-6">
          <h2 className="text-xl font-bold text-slate-900 mb-2">
            {isAr ? 'المتجر تحت الصيانة حالياً' : 'Store is currently under maintenance'}
          </h2>
          <p className="text-sm text-slate-500 max-w-md">
            {isAr
              ? 'نعمل على تحسين تجربتك، يرجى المحاولة مرة أخرى بعد قليل.'
              : "We're working on improving your experience. Please check back shortly."}
          </p>
        </div>
      ) : showTracker ? (
        /* Tracker Page View */
        <OrderTracker lang={lang} onClose={() => setShowTracker(false)} />
      ) : (
        /* Catalog/Storefront Page View */
        <CatalogPage
          products={products}
          filteredProducts={filteredProducts}
          isLoadingProducts={isLoadingProducts}
          lang={lang}
          search={search}
          setSearch={setSearch}
          setActiveCategory={setActiveCategory}
          onAddToCart={handleAddToCart}
          onViewProduct={(prod) => setSelectedProduct(prod)}
        />
      )}

      {/* Cart Drawer Component */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        lang={lang}
        cart={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        shippingCost={shippingCost}
        setShippingCost={setShippingCost}
        appliedPromo={appliedPromo}
        setAppliedPromo={setAppliedPromo}
        onCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
      />

      {/* Secure Checkout Modal Wizard */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        lang={lang}
        cart={cart}
        shippingCost={shippingCost}
        appliedPromo={appliedPromo}
        onClearCart={handleClearCart}
      />

      {/* Product Detail Modal Dialog */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-charcoal/40 backdrop-blur-sm" onClick={() => setSelectedProduct(null)} />
          
          <div className="relative w-full max-w-2xl bg-white border border-charcoal/10 shadow-[8px_8px_0px_rgba(26,26,26,0.1)] overflow-hidden transform transition-all flex flex-col text-charcoal">
            {/* Header close button */}
            <button 
              onClick={() => setSelectedProduct(null)}
              className="absolute top-4 right-4 z-10 p-1.5 bg-charcoal hover:bg-vermilion text-white transition-colors shadow"
              id="close-details-modal-btn"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2">
              {/* Product Visual */}
              <div className="relative aspect-square md:h-full bg-paper">
                <img
                  src={selectedProduct.image}
                  alt={isAr ? selectedProduct.ar.name : selectedProduct.en.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-4 left-4 px-3 py-1 font-serif text-[10px] font-bold bg-charcoal text-white uppercase tracking-wider">
                  {selectedProduct.category}
                </span>
              </div>

              {/* Product specifications & detail sheet */}
              <div className="p-6 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className={`text-lg font-serif font-black text-charcoal tracking-tight ${isAr ? 'text-right' : 'text-left'}`}>
                    {isAr ? selectedProduct.ar.name : selectedProduct.en.name}
                  </h3>
                  
                  {/* Rating */}
                  <div className={`flex items-center gap-1 mt-1.5 mb-3 ${isAr ? 'justify-start' : 'justify-start'}`}>
                    {[...Array(5)].map((_, i) => (
                      <Check className="w-3.5 h-3.5 text-vermilion fill-vermilion" key={i} />
                    ))}
                    <span className="text-xs font-bold text-charcoal/70 ml-1">({selectedProduct.reviewsCount} {isAr ? 'تقييم' : 'reviews'})</span>
                  </div>

                  <p className={`text-xs text-charcoal/70 leading-relaxed ${isAr ? 'text-right' : 'text-left'}`}>
                    {isAr ? selectedProduct.ar.description : selectedProduct.en.description}
                  </p>

                  {/* Highlights Bulleted */}
                  <div className="mt-4 space-y-1">
                    <p className={`text-[10px] font-sans font-bold uppercase text-charcoal/50 tracking-wider ${isAr ? 'text-right' : 'text-left'}`}>
                      {isAr ? 'أهم المميزات المضمونة' : 'Certified Features'}
                    </p>
                    <ul className="space-y-1 text-xs text-charcoal/80">
                      {(isAr ? selectedProduct.ar.features : selectedProduct.en.features).map((feat, id) => (
                        <li key={id} className={`flex items-start gap-1.5 ${isAr ? 'flex-row-reverse text-right' : 'flex-row text-left'}`}>
                          <span className="text-vermilion font-extrabold mt-0.5">✓</span>
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Specs Table */}
                  <div className="mt-4 space-y-1">
                    <p className={`text-[10px] font-sans font-bold uppercase text-charcoal/50 tracking-wider ${isAr ? 'text-right' : 'text-left'}`}>
                      {isAr ? 'المواصفات الفنية' : 'Technical Specifications'}
                    </p>
                    <div className="bg-paper p-3 text-[11px] space-y-1.5 border border-charcoal/10">
                      {Object.entries(isAr ? selectedProduct.ar.specs : selectedProduct.en.specs).map(([k, v]) => (
                        <div key={k} className={`flex justify-between ${isAr ? 'flex-row-reverse text-right' : 'flex-row text-left'}`}>
                          <span className="font-bold text-charcoal/80">{k}:</span>
                          <span className="text-charcoal/60">{v}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Modal Footer (Price & Action) */}
                <div className="border-t border-charcoal/10 pt-4 flex items-center justify-between">
                  <div>
                    <span className="text-xl font-serif font-black text-vermilion">${selectedProduct.price.toFixed(2)}</span>
                    <p className="text-[9px] text-charcoal/40 font-medium">
                      {isAr ? 'شامل ضريبة القيمة المضافة ومشمول بالضمان' : 'Tax included & warranty coverage active'}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      handleAddToCart(selectedProduct);
                      setSelectedProduct(null);
                    }}
                    disabled={selectedProduct.stock === 0}
                    className="px-5 py-2.5 bg-vermilion text-white hover:bg-charcoal text-xs font-serif font-bold tracking-wider flex items-center gap-1.5 transition-all cursor-pointer"
                    id="modal-add-to-cart-btn"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>{isAr ? 'أضف للحقيبة الآن' : 'Add to Bag'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
