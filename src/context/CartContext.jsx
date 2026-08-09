import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { effectivePrice, productImage } from '../utils/constants';
import { useAuth } from './AuthContext';
import client from '../api/client';

const CartContext = createContext(null);

const STORAGE_KEY = 'godwinshop.cart.v1';

/**
 * Client-side cart. This state is for the UI only — the backend re-validates
 * every product, price and stock quantity when the order is placed.
 */
export function CartProvider({ children }) {
  const { user } = useAuth();
  const [items, setItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  // Switch carts between accounts: cart is keyed by user, so different
  // accounts never inherit each other's carts.
  useEffect(() => {
    const key = user ? `godwinshop.cart.${user.id}` : STORAGE_KEY;
    try {
      setItems(JSON.parse(localStorage.getItem(key)) || []);
    } catch {
      setItems([]);
    }
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  function persist(next) {
    const key = user ? `godwinshop.cart.${user.id}` : STORAGE_KEY;
    localStorage.setItem(key, JSON.stringify(next));
    setItems(next);
  }

  const addItem = (product, quantity = 1) => {
    const existing = items.find((i) => i.product_id === product.id);
    let next;
    if (existing) {
      next = items.map((i) =>
        i.product_id === product.id
          ? { ...i, quantity: Math.min(i.quantity + quantity, product.stock_quantity) }
          : i
      );
    } else {
      next = [
        ...items,
        {
          product_id: product.id,
          name: product.name,
          price: effectivePrice(product),
          image_url: productImage(product),
          stock: product.stock_quantity,
          quantity
        }
      ];
    }
    persist(next);
  };

  const updateQuantity = (productId, quantity) => {
    const next = items
      .map((i) =>
        i.product_id === productId
          ? { ...i, quantity: Math.max(1, Math.min(quantity, i.stock || 99)) }
          : i
      )
      .filter((i) => i.quantity > 0);
    persist(next);
  };

  const removeItem = (productId) => {
    persist(items.filter((i) => i.product_id !== productId));
  };

  const clearCart = () => persist([]);

  const { subtotal, deliveryFee, total, count } = useMemo(() => {
    const sub = items.reduce((sum, i) => sum + Number(i.price || 0) * i.quantity, 0);
    const fee = sub >= 50000 ? 0 : 2500;
    const count = items.reduce((sum, i) => sum + i.quantity, 0);
    return { subtotal: sub, deliveryFee: fee, total: sub + fee, count };
  }, [items]);

  const value = useMemo(
    () => ({
      items,
      count,
      subtotal,
      deliveryFee,
      total,
      addItem,
      updateQuantity,
      removeItem,
      clearCart
    }),
    [items, count, subtotal, deliveryFee, total] // eslint-disable-line react-hooks/exhaustive-deps
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>');
  return ctx;
}