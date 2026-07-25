import React from 'react';
import { Star, Plus, Eye } from 'lucide-react';
import { Product, Language } from '../types';

interface ProductCardProps {
  product: Product;
  lang: Language;
  onAddToCart: (product: Product) => void;
  onViewDetails: (product: Product) => void;
  key?: string | number;
}

export default function ProductCard({ product, lang, onAddToCart, onViewDetails }: ProductCardProps) {
  const isAr = lang === 'ar';
  const trans = (isAr ? product.ar : product.en) || product.ar || product.en || { name: 'Product', description: '' };
  
  // Calculate discount percent
  const price = product.price || 0;
  const originalPrice = product.originalPrice;
  const discountPercent = originalPrice 
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;

  return (
    <div className="group relative flex flex-col bg-white border border-charcoal/10 overflow-hidden hover:shadow-[4px_4px_0px_rgba(26,26,26,0.06)] transition-all duration-300">
      
      {/* Product Image Panel */}
      <div className="relative aspect-square w-full bg-paper overflow-hidden">
        <img
          src={product.image}
          alt={trans.name}
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
        />
        
        {/* Badges */}
        <div className={`absolute top-3 ${isAr ? 'right-3' : 'left-3'} flex flex-col gap-1.5`}>
          {discountPercent > 0 && (
            <span className="inline-flex items-center px-2.5 py-1 text-[10px] font-serif font-bold bg-vermilion text-white tracking-wider">
              {isAr ? `وفر ${discountPercent}٪` : `Save ${discountPercent}%`}
            </span>
          )}
          {product.stock <= 5 && product.stock > 0 && (
            <span className="inline-flex items-center px-2.5 py-1 text-[10px] font-serif font-bold bg-charcoal text-white tracking-wider uppercase">
              {isAr ? 'كمية محدودة' : 'Low Stock'}
            </span>
          )}
          {product.stock === 0 && (
            <span className="inline-flex items-center px-2.5 py-1 text-[10px] font-serif font-bold bg-charcoal/10 text-charcoal/50 border border-charcoal/25 tracking-wider uppercase">
              {isAr ? 'نفذت الكمية' : 'Out of Stock'}
            </span>
          )}
        </div>

        {/* Floating actions on hover */}
        <div className="absolute inset-0 bg-charcoal/10 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-3 transition-opacity duration-300">
          <button
            onClick={() => onViewDetails(product)}
            className="p-3 bg-white text-charcoal hover:bg-vermilion hover:text-white transition-colors duration-200 border border-charcoal/10 shadow-sm"
            title={isAr ? 'عرض التفاصيل' : 'Quick View'}
          >
            <Eye className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Details Box */}
      <div className="flex-1 p-4 flex flex-col">
        {/* Rating and review counts */}
        <div className="flex items-center gap-1 mb-2">
          <Star className="w-3.5 h-3.5 text-vermilion fill-vermilion" />
          <span className="text-xs font-bold text-charcoal">{product.rating}</span>
          <span className="text-xs text-charcoal/40">({product.reviewsCount})</span>
        </div>

        {/* Title */}
        <h3 className={`text-base font-serif font-bold text-charcoal leading-snug line-clamp-2 h-12 ${isAr ? 'text-right' : 'text-left'}`}>
          {trans.name}
        </h3>

        {/* Short Description */}
        <p className={`text-xs text-charcoal/60 mt-1 line-clamp-2 mb-4 flex-1 ${isAr ? 'text-right' : 'text-left'}`}>
          {trans.description}
        </p>

        {/* Price & Action Button */}
        <div className="flex items-center justify-between border-t border-charcoal/10 pt-3.5 mt-auto">
          <div className="flex flex-col">
            <span className="text-base font-serif font-black text-charcoal">
              ${price.toFixed(2)}
            </span>
            {originalPrice && (
              <span className="text-xs text-charcoal/40 line-through">
                ${originalPrice.toFixed(2)}
              </span>
            )}
          </div>

          <button
            onClick={() => product.stock > 0 && onAddToCart(product)}
            disabled={product.stock === 0}
            className={`flex items-center gap-1 px-3.5 py-2 text-xs font-serif font-bold tracking-wider transition-colors ${
              product.stock === 0
                ? 'bg-charcoal/10 text-charcoal/30 cursor-not-allowed border border-charcoal/5'
                : 'bg-vermilion text-white hover:bg-charcoal'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isAr ? 'أضف للسلة' : 'Add to Cart'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
