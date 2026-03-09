import { createContext, useContext, useState, useEffect, useCallback } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Product {
  id: number;
  name: string;
  price: number;
  oldPrice?: number;
  img: string;
  images?: string[];
  colors: string[];
  sizes: string[];
  description: string;
  videos?: { id: number; thumb: string; duration: string }[];
  tag?: string;
  discount?: number;
  category?: string;
}

export interface CartItem extends Product {
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
}

interface ShopContextValue {
  // ── Cart ──
  cart: CartItem[];
  addToCart: (product: any, quantity?: number, color?: string, size?: string)  => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  isInCart: (productId: number) => boolean;
  cartCount: number;
  cartTotal: number;

  // ── Favourites ──
  favourites: Product[];
  addToFavourites: (product: Product) => void;
  removeFromFavourites: (productId: number) => void;
  toggleFavourite: (product: any) => void;
  isFavourite: (productId: number) => boolean;
  favouriteCount: number;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const ShopContext = createContext<ShopContextValue | null>(null);

const CART_KEY = "shop_cart";
const FAV_KEY  = "shop_favourites";

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    console.warn(`[ShopContext] Could not persist "${key}" to localStorage.`);
  }
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export const ShopProvider = ({ children }: { children: any }) => {
  const [cart, setCart] = useState<CartItem[]>(() =>
    loadFromStorage<CartItem[]>(CART_KEY, [])
  );
  const [favourites, setFavourites] = useState<Product[]>(() =>
    loadFromStorage<Product[]>(FAV_KEY, [])
  );

  useEffect(() => saveToStorage(CART_KEY, cart),      [cart]);
  useEffect(() => saveToStorage(FAV_KEY, favourites), [favourites]);

  // ── Cart ──────────────────────────────────────────────────────────────────

  const addToCart = useCallback(
    (product: Product, quantity = 1, color?: string, size?: string) => {
      setCart((prev) => {
        const existing = prev.find((item) => item.id === product.id);
        if (existing) {
          return prev.map((item) =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        }
        return [...prev, { ...product, quantity, selectedColor: color, selectedSize: size }];
      });
    },
    []
  );

  const removeFromCart = useCallback((productId: number) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId: number, quantity: number) => {
    if (quantity <= 0) {
      setCart((prev) => prev.filter((item) => item.id !== productId));
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const isInCart = useCallback(
    (productId: number) => cart.some((item) => item.id === productId),
    [cart]
  );

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // ── Favourites ────────────────────────────────────────────────────────────

  const addToFavourites = useCallback((product: Product) => {
    setFavourites((prev) =>
      prev.find((p) => p.id === product.id) ? prev : [...prev, product]
    );
  }, []);

  const removeFromFavourites = useCallback((productId: number) => {
    setFavourites((prev) => prev.filter((p) => p.id !== productId));
  }, []);

  const toggleFavourite = useCallback((product: Product) => {
    setFavourites((prev) =>
      prev.find((p) => p.id === product.id)
        ? prev.filter((p) => p.id !== product.id)
        : [...prev, product]
    );
  }, []);

  const isFavourite = useCallback(
    (productId: number) => favourites.some((p) => p.id === productId),
    [favourites]
  );

  const favouriteCount = favourites.length;

  return (
    <ShopContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isInCart,
        cartCount,
        cartTotal,
        favourites,
        addToFavourites,
        removeFromFavourites,
        toggleFavourite,
        isFavourite,
        favouriteCount,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useShop = (): ShopContextValue => {
  const ctx = useContext(ShopContext);
  if (!ctx) throw new Error("useShop must be used inside <ShopProvider>");
  return ctx;
};