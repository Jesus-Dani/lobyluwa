"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type CartItem = { variantId: string; quantity: number };

type CartContextValue = {
  items: CartItem[];
  totalCount: number;
  addItem: (variantId: string, quantity?: number) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "lobyluwa-cart";

// Phase 1 cart is intentionally client-only (localStorage), not a
// Cart/CartItem DB model — an account is required at checkout, and the
// cart only becomes durable Order/OrderItem rows once checkout is
// submitted (see docs/TRD.md's data model, which has no Cart entity).
export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) setItems(JSON.parse(stored));
    } catch {
      // Corrupt localStorage value — ignore and start with an empty cart.
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  function addItem(variantId: string, quantity = 1) {
    setItems((prev) => {
      const existing = prev.find((item) => item.variantId === variantId);
      if (existing) {
        return prev.map((item) =>
          item.variantId === variantId ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prev, { variantId, quantity }];
    });
  }

  function removeItem(variantId: string) {
    setItems((prev) => prev.filter((item) => item.variantId !== variantId));
  }

  function updateQuantity(variantId: string, quantity: number) {
    if (quantity <= 0) return removeItem(variantId);
    setItems((prev) => prev.map((item) => (item.variantId === variantId ? { ...item, quantity } : item)));
  }

  function clear() {
    setItems([]);
  }

  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{ items, totalCount, addItem, removeItem, updateQuantity, clear }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
}
