'use client';

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { Meal, MealProvider } from '@/types/meal.type';

export interface CartItem {
  meal: Meal;
  quantity: number;
  note?: string;
}

interface CartContextType {
  items: CartItem[];
  provider: MealProvider | null;
  totalCount: number;
  subtotal: number;
  isDrawerOpen: boolean;
  setIsDrawerOpen: (open: boolean) => void;
  selectedMealForModal: Meal | null;
  openCustomizationModal: (meal: Meal) => void;
  closeCustomizationModal: () => void;
  addItem: (meal: Meal, quantity: number, note?: string) => void;
  updateQuantity: (mealId: string, quantity: number) => void;
  removeItem: (mealId: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const STORAGE_KEY = 'foodhub_cart';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [provider, setProvider] = useState<MealProvider | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedMealForModal, setSelectedMealForModal] = useState<Meal | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.items)) {
          setItems(parsed.items);
          setProvider(parsed.provider || null);
        }
      }
    } catch (e) {
      console.error('Failed to load cart from storage', e);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // Save cart to localStorage on change
  useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ items, provider }));
    } catch (e) {
      console.error('Failed to persist cart to storage', e);
    }
  }, [items, provider, isInitialized]);

  const totalCount = useMemo(() => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  }, [items]);

  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => {
      const price = typeof item.meal.price === 'number'
        ? item.meal.price
        : parseFloat(item.meal.price || '0');
      return sum + (isNaN(price) ? 0 : price * item.quantity);
    }, 0);
  }, [items]);

  const openCustomizationModal = (meal: Meal) => {
    setSelectedMealForModal(meal);
  };

  const closeCustomizationModal = () => {
    setSelectedMealForModal(null);
  };

  const addItem = (meal: Meal, quantity: number, note?: string) => {
    const mealProvider = meal.provider || null;

    setItems((prevItems) => {
      // Check for provider conflict: FoodHub requires single-provider orders.
      // If adding from a new provider, silently replace previous provider's items.
      if (provider && mealProvider && provider.id !== mealProvider.id && prevItems.length > 0) {
        setProvider(mealProvider);
        return [{ meal, quantity, note: note?.trim() || undefined }];
      }

      if (!provider && mealProvider) {
        setProvider(mealProvider);
      }

      const existingIndex = prevItems.findIndex((item) => item.meal.id === meal.id);
      if (existingIndex > -1) {
        const updated = [...prevItems];
        const existing = updated[existingIndex];
        updated[existingIndex] = {
          ...existing,
          quantity: Math.min(20, existing.quantity + quantity),
          note: note !== undefined ? (note.trim() || undefined) : existing.note,
        };
        return updated;
      }

      return [...prevItems, { meal, quantity, note: note?.trim() || undefined }];
    });
  };

  const updateQuantity = (mealId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(mealId);
      return;
    }

    setItems((prev) =>
      prev.map((item) =>
        item.meal.id === mealId
          ? { ...item, quantity: Math.min(20, Math.max(1, quantity)) }
          : item
      )
    );
  };

  const removeItem = (mealId: string) => {
    setItems((prev) => {
      const filtered = prev.filter((item) => item.meal.id !== mealId);
      if (filtered.length === 0) {
        setProvider(null);
      }
      return filtered;
    });
  };

  const clearCart = () => {
    setItems([]);
    setProvider(null);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        provider,
        totalCount,
        subtotal,
        isDrawerOpen,
        setIsDrawerOpen,
        selectedMealForModal,
        openCustomizationModal,
        closeCustomizationModal,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
