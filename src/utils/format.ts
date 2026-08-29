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
