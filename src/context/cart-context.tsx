'use client';

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { Meal, MealProvider } from '@/types/meal.type';

export interface CartItem {
  meal: Meal;
  quantity: number;
  note?: string;
}

export interface ProviderConflict {
  newMeal: Meal;
  quantity: number;
  note?: string;
  currentProviderName: string;
  newProviderName: string;
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
  isInitialized: boolean;
  providerConflict: ProviderConflict | null;
  resolveProviderConflict: (accept: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const STORAGE_KEY = 'foodhub_cart';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [providerConflict, setProviderConflict] = useState<ProviderConflict | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedMealForModal, setSelectedMealForModal] = useState<Meal | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Derive provider purely from current items
  const provider = useMemo<MealProvider | null>(() => {
    return items.length > 0 ? (items[0].meal.provider ?? null) : null;
  }, [items]);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.items)) {
          setItems(parsed.items);
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

  const openCustomizationModal = useCallback((meal: Meal) => {
    setSelectedMealForModal(meal);
  }, []);

  const closeCustomizationModal = useCallback(() => {
    setSelectedMealForModal(null);
  }, []);

  const addItem = useCallback((meal: Meal, quantity: number, note?: string) => {
    const mealProvider = meal.provider || null;

    // Check for provider conflict: FoodHub requires single-provider orders.
    if (provider && mealProvider && provider.id !== mealProvider.id && items.length > 0) {
      setProviderConflict({
        newMeal: meal,
        quantity,
        note,
        currentProviderName: provider.name,
        newProviderName: mealProvider.name,
      });
      return;
    }

    setItems((prevItems) => {
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
  }, [provider, items.length]);

  const resolveProviderConflict = useCallback((accept: boolean) => {
    if (accept && providerConflict) {
      setItems([{
        meal: providerConflict.newMeal,
        quantity: providerConflict.quantity,
        note: providerConflict.note?.trim() || undefined,
      }]);
    }
    setProviderConflict(null);
  }, [providerConflict]);

  const updateQuantity = useCallback((mealId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((item) => item.meal.id !== mealId));
      return;
    }

    setItems((prev) =>
      prev.map((item) =>
        item.meal.id === mealId
          ? { ...item, quantity: Math.min(20, Math.max(1, quantity)) }
          : item
      )
    );
  }, []);

  const removeItem = useCallback((mealId: string) => {
    setItems((prev) => prev.filter((item) => item.meal.id !== mealId));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const value = useMemo(
    () => ({
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
      isInitialized,
      providerConflict,
      resolveProviderConflict,
    }),
    [
      items,
      provider,
      totalCount,
      subtotal,
      isDrawerOpen,
      selectedMealForModal,
      openCustomizationModal,
      closeCustomizationModal,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
      isInitialized,
      providerConflict,
      resolveProviderConflict,
    ]
  );

  return (
    <CartContext.Provider value={value}>
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
