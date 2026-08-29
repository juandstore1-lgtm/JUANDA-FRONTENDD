export interface Role {
  id: string;
  name: 'GLOBAL_ADMIN' | 'STORE_ADMIN';
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  storeIds: string[]; // empty if GLOBAL_ADMIN
  isActive: boolean;
}

export interface Store {
  id: string;
  name: string;
  address: string;
  phone: string;
  schedule: string;
  image: string;
  description: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  oldPrice?: number;
  discountPercentage?: number;
  description: string;
  category: string;
  sizes: string[];
  colors: string[];
  images: string[];
  storeIds: string[];
  status: 'AVAILABLE' | 'OUT_OF_STOCK';
  tags: string[]; // e.g. 'Nuevo', 'Oferta', 'Destacado'
  order: number;
}

export interface GalleryImage {
  id: string;
  url: string;
  title: string;
  description: string;
  storeId?: string;
  order: number;
}

export interface Video {
  id: string;
  url: string;
  title: string;
  category: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  date: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'REPLIED';
}

export interface Promotion {
  id: string;
  title: string;
  discountPercentage: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface Coupon {
  id: string;
  code: string;
  discountPercentage: number;
  expiresAt: string;
  isActive: boolean;
}

export interface Category {
  id: number | string;
  name: string;
  image?: string;
  storeId?: number | string;
}

export interface HeroSlide {
  id?: number | string;
  imageUrl: string;
  season: string;
  title: string;
  slideOrder: number;
}

export interface RouletteSetting {
  id: number;
  activeDays: string; // Comma separated, e.g. "WEDNESDAY,THURSDAY"
  values: string;     // Comma separated, e.g. "5,10,15,20,25,10,5,15"
  probabilities: string; // Comma separated, e.g. "12.5,12.5,12.5,12.5,12.5,12.5,12.5,12.5"
}

export interface MysteryBoxSetting {
  id: number;
  title: string;
  description: string;
  price: number;
  estimatedValue?: string;
  revealedSubtext?: string;
  perk1?: string;
  perk2?: string;
  perk3?: string;
  sizes?: string;
  active: boolean;
}

export type ContestStatus = 'DRAFT' | 'UPCOMING' | 'ACTIVE' | 'FINISHED' | 'DISABLED';
export type ParticipantStatus = 'PARTICIPANT' | 'WINNER' | 'DISQUALIFIED';

export interface Contest {
  id: number;
  title: string;
  description: string;
  rules: string;
  bannerUrl: string;
  startDate: string;
  endDate: string;
  status: ContestStatus;
  showInMenu: boolean;
  formEnabled: boolean;
  countdownEnabled: boolean;
  closedMessage?: string;
  requireIdNumber?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ContestParticipant {
  id?: number;
  contest?: { id: number };
  fullName: string;
  identificationNumber?: string;
  phone: string;
  email: string;
  city: string;
  socialMedia?: string;
  outfitImageUrl: string;
  acceptedTerms: boolean;
  status?: ParticipantStatus;
  createdAt?: string;
}

// ----------------- RAFFLES -----------------

export interface Raffle {
  id: string; // or number, backend uses Long but strings are easier in frontend IDs
  name: string;
  description: string;
  imageUrl: string;
  prize: string;
  ticketPrice: number;
  totalTickets: number;
  availableTickets: number;
  startDate: string;
  endDate: string;
  status: 'UPCOMING' | 'ACTIVE' | 'SOLD_OUT' | 'FINISHED';
  createdAt?: string;
}

export type TicketStatus = 'AVAILABLE' | 'RESERVED' | 'SOLD';

export interface Buyer {
  id: string;
  name: string;
  phone: string;
  email: string;
  paymentStatus: 'PENDING' | 'CONFIRMED' | 'FAILED';
  paymentMethod?: string;
  notes?: string;
  createdAt?: string;
}

export interface Ticket {
  id: string;
  raffleId: string;
  ticketNumber: string;
  status: TicketStatus;
  buyer?: Buyer;
  updatedAt?: string;
}

export interface TicketPurchaseRequest {
  ticketIds: string[];
  buyer: {
    name: string;
    phone: string;
    email: string;
  };
}

export interface ContestWinner {
  id: number;
  contest: Contest;
  participant: ContestParticipant;
  selectedAt: string;
}
export interface HomeCategoryCollection {
  id?: number;
  name: string;
  description: string;
  imageUrl: string;
  categoryFilter: string;
  displayOrder: number;
}
