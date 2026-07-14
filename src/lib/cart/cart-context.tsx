"use client";

import * as React from "react";

export type CartItem = {
  productoId: string;
  varianteId: string | null;
  slug: string;
  nombre: string;
  marca: string;
  categoriaSlug: string;
  imagenUrl?: string | null;
  precioUnitario: number;
  cantidad: number;
  stockDisponible: number;
  varianteLabel?: string;
};

type CartState = { items: CartItem[]; hidratado: boolean };

type CartAction =
  | { type: "hydrate"; items: CartItem[] }
  | { type: "add"; item: Omit<CartItem, "cantidad">; cantidad: number }
  | { type: "remove"; productoId: string; varianteId: string | null }
  | { type: "setCantidad"; productoId: string; varianteId: string | null; cantidad: number }
  | { type: "clear" };

const STORAGE_KEY = "ecomers_carrito_v1";

function claveItem(productoId: string, varianteId: string | null) {
  return `${productoId}::${varianteId ?? ""}`;
}

function reducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "hydrate":
      return { items: action.items, hidratado: true };
    case "add": {
      const clave = claveItem(action.item.productoId, action.item.varianteId);
      const existente = state.items.find(
        (i) => claveItem(i.productoId, i.varianteId) === clave,
      );
      if (existente) {
        const nuevaCantidad = Math.min(
          existente.cantidad + action.cantidad,
          existente.stockDisponible,
        );
        return {
          ...state,
          items: state.items.map((i) =>
            claveItem(i.productoId, i.varianteId) === clave
              ? { ...i, cantidad: nuevaCantidad }
              : i,
          ),
        };
      }
      return {
        ...state,
        items: [
          ...state.items,
          { ...action.item, cantidad: Math.min(action.cantidad, action.item.stockDisponible) },
        ],
      };
    }
    case "remove":
      return {
        ...state,
        items: state.items.filter(
          (i) => claveItem(i.productoId, i.varianteId) !== claveItem(action.productoId, action.varianteId),
        ),
      };
    case "setCantidad":
      return {
        ...state,
        items: state.items.map((i) =>
          claveItem(i.productoId, i.varianteId) === claveItem(action.productoId, action.varianteId)
            ? { ...i, cantidad: Math.max(1, Math.min(action.cantidad, i.stockDisponible)) }
            : i,
        ),
      };
    case "clear":
      return { ...state, items: [] };
    default:
      return state;
  }
}

type CartContextValue = {
  items: CartItem[];
  cantidadTotal: number;
  subtotal: number;
  agregarItem: (item: Omit<CartItem, "cantidad">, cantidad?: number) => void;
  quitarItem: (productoId: string, varianteId: string | null) => void;
  actualizarCantidad: (productoId: string, varianteId: string | null, cantidad: number) => void;
  vaciarCarrito: () => void;
};

const CartContext = React.createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = React.useReducer(reducer, { items: [], hidratado: false });

  React.useEffect(() => {
    let items: CartItem[] = [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) items = JSON.parse(raw);
    } catch {
      // localStorage no disponible o datos corruptos: se ignora y se parte de un carrito vacío.
    }
    dispatch({ type: "hydrate", items });
  }, []);

  React.useEffect(() => {
    if (!state.hidratado) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
  }, [state.items, state.hidratado]);

  const value = React.useMemo<CartContextValue>(() => {
    const cantidadTotal = state.items.reduce((acc, i) => acc + i.cantidad, 0);
    const subtotal = state.items.reduce((acc, i) => acc + i.cantidad * i.precioUnitario, 0);
    return {
      items: state.items,
      cantidadTotal,
      subtotal,
      agregarItem: (item, cantidad = 1) => dispatch({ type: "add", item, cantidad }),
      quitarItem: (productoId, varianteId) => dispatch({ type: "remove", productoId, varianteId }),
      actualizarCantidad: (productoId, varianteId, cantidad) =>
        dispatch({ type: "setCantidad", productoId, varianteId, cantidad }),
      vaciarCarrito: () => dispatch({ type: "clear" }),
    };
  }, [state.items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = React.useContext(CartContext);
  if (!ctx) throw new Error("useCart debe usarse dentro de <CartProvider>");
  return ctx;
}
