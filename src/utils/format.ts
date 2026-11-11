export function formatPrice(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num) || num === undefined || num === null) return '$0';
  return `$${Math.round(num).toLocaleString('es-CO')}`;
}

export function getDiscountedPrice(price: number, discountPercentage?: number): number {
  if (discountPercentage && discountPercentage > 0) {
    return price * (1 - discountPercentage / 100);
  }
  return price;
}

export function formatDate(dateString: string | undefined): string {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'N/A';
  return new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

export function getStoreBarrio(store?: { name?: string; barrio?: string; address?: string } | null): string {
  if (!store) return '';
  if (store.barrio && store.barrio.trim()) return store.barrio.trim();
  const n = (store.name || '').toUpperCase();
  const a = (store.address || '').toUpperCase();
  if (n.includes('CIUDAD MODELO') || a.includes('MODELO')) return 'Ciudad Modelo';
  if (n.includes('VILLA COLOMBIA') || a.includes('52#13A') || a.includes('COLOMBIA')) return 'Villa Colombia';
  if (n.includes('ISRAEL') || a.includes('ISRAEL')) return 'República de Israel';
  if (n.includes('MARIANO RAMOS') || a.includes('MARIANO')) return 'Mariano Ramos';
  return '';
}

export function formatStoreName(store?: { name?: string; barrio?: string; address?: string } | null): string {
  if (!store || !store.name) return '';
  const barrio = getStoreBarrio(store);
  return barrio ? `${store.name} - ${barrio}` : store.name;
}
