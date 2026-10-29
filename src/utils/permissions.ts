import { User, Product, Category } from '../types';

// Reflejo en la interfaz de la regla del backend (SedeAccessService). Solo oculta acciones:
// el backend sigue siendo quien autoriza y responde 403 si la regla no se cumple.

const isGlobalAdmin = (user: User | null) => user?.role.name === 'GLOBAL_ADMIN';

// STORE_ADMIN: todas las sedes del producto deben ser suyas; los productos sin sede son solo de GLOBAL_ADMIN
export const canManageProduct = (user: User | null, product: Pick<Product, 'storeIds'>): boolean => {
  if (!user) return false;
  if (isGlobalAdmin(user)) return true;
  const storeIds = product.storeIds ?? [];
  return storeIds.length > 0 && storeIds.every((id) => user.storeIds?.includes(String(id)));
};

// STORE_ADMIN: solo categorías de una de sus sedes; las categorías globales son solo de GLOBAL_ADMIN
export const canManageCategory = (user: User | null, category: Pick<Category, 'storeId'>): boolean => {
  if (!user) return false;
  if (isGlobalAdmin(user)) return true;
  return !!category.storeId && !!user.storeIds?.includes(String(category.storeId));
};
