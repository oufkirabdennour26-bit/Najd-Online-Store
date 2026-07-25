import { useState, useEffect } from 'react';
import { Product, CartItem } from '../types';

export function useCart(products: Product[], triggerToast: (msg: string) => void, isAr: boolean, fetchProducts?: () => void) {
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('salla_cart');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('salla_cart', JSON.stringify(cart));
  }, [cart]);

  const handleAddToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          triggerToast(isAr ? 'عذراً، لقد تجاوزت الكمية المتاحة في المخزن!' : 'Sorry, maximum stock quantity reached!');
          return prev;
        }
        triggerToast(isAr ? 'تم تحديث كمية المنتج في السلة!' : 'Quantity updated in your cart!');
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      triggerToast(isAr ? 'تم إضافة المنتج إلى السلة بنجاح!' : 'Product added to cart successfully!');
      return [...prev, { product, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveItem(productId);
      return;
    }
    const targetProduct = products.find((p) => p.id === productId);
    if (targetProduct && quantity > targetProduct.stock) {
      triggerToast(isAr ? 'عذراً، هذه أقصى كمية متوفرة بالمنتج.' : 'Sorry, this is the maximum available stock.');
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.product.id === productId ? { ...item, quantity } : item))
    );
  };

  const handleRemoveItem = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
    triggerToast(isAr ? 'تم إزالة المنتج من السلة.' : 'Product removed from cart.');
  };

  const handleClearCart = () => {
    setCart([]);
    if (fetchProducts) {
      fetchProducts();
    }
  };

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return {
    cart,
    setCart,
    handleAddToCart,
    handleUpdateQuantity,
    handleRemoveItem,
    handleClearCart,
    cartCount,
  };
}
