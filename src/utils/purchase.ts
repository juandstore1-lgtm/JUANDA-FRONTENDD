// Validación previa del formulario de compra (solo ayuda al usuario: el backend vuelve a validar y es la autoridad).
// Mismas reglas que PurchaseRequestValidator del backend.

export interface BuyerForm {
  name: string;
  phone: string;
  email: string;
}

export type BuyerErrors = Partial<Record<keyof BuyerForm, string>>;

const NAME = /^\p{L}[\p{L}\p{M} .'-]*$/u;
const PHONE = /^\+?\d+$/;
const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export const validateBuyer = (buyer: BuyerForm): BuyerErrors => {
  const errors: BuyerErrors = {};
  const name = buyer.name.trim().replace(/\s+/g, ' ');
  if (name.length < 2 || name.length > 100 || !NAME.test(name)) {
    errors.name = 'Ingresa un nombre válido (solo letras, entre 2 y 100 caracteres)';
  }
  const phone = buyer.phone.trim().replace(/[\s().-]/g, '');
  const digits = phone.replace(/^\+/, '');
  if (!PHONE.test(phone) || digits.length < 7 || digits.length > 15) {
    errors.phone = 'Ingresa un número de teléfono válido';
  }
  const email = buyer.email.trim();
  if (email && (email.length > 254 || !EMAIL.test(email))) {
    errors.email = 'Ingresa un correo electrónico válido';
  }
  return errors;
};

// Hora local del visitante para el vencimiento que devuelve el backend (instante UTC)
export const formatReservationDeadline = (reservedUntil: string): string =>
  new Date(reservedUntil).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });

// Boletos seleccionados que ya no están libres según la lista actualizada
export const unavailableSelection = (selectedIds: string[], tickets: { id: string; status: string; ticketNumber: string }[]) =>
  tickets.filter((t) => selectedIds.includes(t.id) && t.status !== 'AVAILABLE');
