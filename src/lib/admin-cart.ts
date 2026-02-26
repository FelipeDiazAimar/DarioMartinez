export type AdminCartItem = {
  id: string;
  title: string;
  price?: number;
  priceCurrency?: string;
  stock: number;
  imageUrl: string;
  descriptionAdditional?: string;
  quantity: number;
};

const ADMIN_CART_KEY = 'admin-cart';
const ADMIN_CART_UPDATED_EVENT = 'admin-cart-updated';

function isBrowser() {
  return typeof window !== 'undefined';
}

export function getAdminCartStorageKey() {
  return ADMIN_CART_KEY;
}

export function getAdminCartUpdatedEvent() {
  return ADMIN_CART_UPDATED_EVENT;
}

export function readAdminCart(): AdminCartItem[] {
  if (!isBrowser()) {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(ADMIN_CART_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((item) => item && typeof item.id === 'string' && typeof item.title === 'string');
  } catch {
    return [];
  }
}

function persistAdminCart(items: AdminCartItem[]) {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(ADMIN_CART_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event(ADMIN_CART_UPDATED_EVENT));
}

export function addToAdminCart(item: Omit<AdminCartItem, 'quantity'>, quantity = 1) {
  const safeQuantity = Number.isFinite(quantity) ? Math.max(1, Math.floor(quantity)) : 1;
  const current = readAdminCart();
  const existingIndex = current.findIndex((cartItem) => cartItem.id === item.id);

  if (existingIndex >= 0) {
    const currentItem = current[existingIndex];
    const maxStock = Math.max(1, Math.floor(currentItem.stock));
    const nextQuantity = Math.min(currentItem.quantity + safeQuantity, maxStock);
    current[existingIndex] = { ...currentItem, quantity: nextQuantity };
    persistAdminCart(current);
    return;
  }

  const maxStock = Math.max(1, Math.floor(item.stock));
  current.push({ ...item, quantity: Math.min(safeQuantity, maxStock) });
  persistAdminCart(current);
}

export function updateAdminCartItemQuantity(itemId: string, quantity: number) {
  const current = readAdminCart();
  const nextQuantity = Math.max(1, Math.floor(quantity));
  const next = current.map((item) => {
    if (item.id !== itemId) {
      return item;
    }

    const maxStock = Math.max(1, Math.floor(item.stock));
    return {
      ...item,
      quantity: Math.min(nextQuantity, maxStock),
    };
  });

  persistAdminCart(next);
}

export function removeFromAdminCart(itemId: string) {
  const current = readAdminCart();
  persistAdminCart(current.filter((item) => item.id !== itemId));
}

export function clearAdminCart() {
  persistAdminCart([]);
}
