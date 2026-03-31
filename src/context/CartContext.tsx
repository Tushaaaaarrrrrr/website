import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

interface CartState {
  items: string[];
  selectedIds: string[];
}

interface CartContextType {
  items: string[];
  selectedIds: string[];
  cartCount: number;
  selectedCount: number;
  addToCart: (courseId: string) => void;
  removeFromCart: (courseId: string) => void;
  toggleSelection: (courseId: string) => void;
  selectOnly: (courseIds: string[]) => void;
  selectAll: () => void;
  clearCart: () => void;
  clearPurchasedCourses: (courseIds: string[]) => void;
  isInCart: (courseId: string) => boolean;
  isSelected: (courseId: string) => boolean;
}

const STORAGE_KEY = 'alpha-iitian-cart';

const CartContext = createContext<CartContextType | undefined>(undefined);

function normalizeCartState(value: unknown): CartState {
  if (!value || typeof value !== 'object') {
    return { items: [], selectedIds: [] };
  }

  const raw = value as Partial<CartState>;
  const items = Array.isArray(raw.items) ? [...new Set(raw.items.filter((item): item is string => typeof item === 'string'))] : [];
  const selectedIds = Array.isArray(raw.selectedIds)
    ? [...new Set(raw.selectedIds.filter((item): item is string => typeof item === 'string'))].filter((item) => items.includes(item))
    : items;

  return {
    items,
    selectedIds,
  };
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<CartState>(() => {
    if (typeof window === 'undefined') {
      return { items: [], selectedIds: [] };
    }

    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      return stored ? normalizeCartState(JSON.parse(stored)) : { items: [], selectedIds: [] };
    } catch {
      return { items: [], selectedIds: [] };
    }
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const value = useMemo<CartContextType>(() => ({
    items: state.items,
    selectedIds: state.selectedIds,
    cartCount: state.items.length,
    selectedCount: state.selectedIds.length,
    addToCart: (courseId: string) => {
      setState((current) => {
        if (current.items.includes(courseId)) {
          return current;
        }

        return {
          items: [...current.items, courseId],
          selectedIds: [...current.selectedIds, courseId],
        };
      });
    },
    removeFromCart: (courseId: string) => {
      setState((current) => ({
        items: current.items.filter((item) => item !== courseId),
        selectedIds: current.selectedIds.filter((item) => item !== courseId),
      }));
    },
    toggleSelection: (courseId: string) => {
      setState((current) => {
        if (!current.items.includes(courseId)) {
          return current;
        }

        return current.selectedIds.includes(courseId)
          ? {
              items: current.items,
              selectedIds: current.selectedIds.filter((item) => item !== courseId),
            }
          : {
              items: current.items,
              selectedIds: [...current.selectedIds, courseId],
            };
      });
    },
    selectOnly: (courseIds: string[]) => {
      setState((current) => {
        const nextSelected = [...new Set(courseIds)].filter((item) => current.items.includes(item));
        return {
          items: current.items,
          selectedIds: nextSelected,
        };
      });
    },
    selectAll: () => {
      setState((current) => ({
        items: current.items,
        selectedIds: current.items,
      }));
    },
    clearCart: () => {
      setState({ items: [], selectedIds: [] });
    },
    clearPurchasedCourses: (courseIds: string[]) => {
      const purchasedSet = new Set(courseIds);

      setState((current) => ({
        items: current.items.filter((item) => !purchasedSet.has(item)),
        selectedIds: current.selectedIds.filter((item) => !purchasedSet.has(item)),
      }));
    },
    isInCart: (courseId: string) => state.items.includes(courseId),
    isSelected: (courseId: string) => state.selectedIds.includes(courseId),
  }), [state]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }

  return context;
}
