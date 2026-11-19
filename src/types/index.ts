export interface Role {
  id: string;
  name: 'GLOBAL_ADMIN' | 'STORE_ADMIN';
}

export interface User {
  id: string;
  name: string;
  email?: string;
  role: Role;
  storeIds: string[]; // empty if GLOBAL_ADMIN
  isActive: boolean;
}

export interface Store {
  id: string;
  name: string;
  address: string;
  barrio?: string;
  phone: string;
  schedule: string;
  image: string;
  description: string;
}


export interface AuditLog {
  id: number;
  userId?: number;
  userName: string;
  userEmail: string;
  userRole: string;
  actionType: string;
  entityType: string;
  entityId?: string;
  previousData?: string;
  newData?: string;
  ipAddress?: string;
  storeId?: number;
  storeName?: string;
  createdAt: string;
}

export interface AuditAlert {
  id: string | number;
  alertType: 'SIN_ACTUALIZACION' | 'BAJA_ACTIVIDAD' | 'ELIMINACION_MASIVA' | 'EDICION_MASIVA' | 'SIN_CUMPLIMIENTO';
  title: string;
  description: string;
  sedeId?: number | string;
  sedeName: string;
  severity: 'CRITICA' | 'SEGUIMIENTO' | 'INFORMATIVA';
  status: 'PENDIENTE' | 'REVISADA';
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

export interface AuditAlertSettings {
  dailyTarget: number;
  inactiveDaysThreshold: number;
  massEditThreshold: number;
  massDeleteThreshold: number;
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
  agreesToPublicDisplay?: boolean;
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
  // Solo en reservas con vencimiento (instante ISO-8601 en UTC)
  reservedUntil?: string;
}

export interface TicketPurchaseRequest {
  ticketIds: string[];
  buyer: {
    name: string;
    phone: string;
    email: string;
  };
}

// Respuesta de la compra: boletos reservados (pendientes de pago), no vendidos
export interface TicketReservation {
  raffleId: string;
  ticketIds: string[];
  ticketNumbers: string[];
  status: 'RESERVED';
  reservedUntil: string;
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

export interface JobVacancy {
  id?: number;
  company: string;
  sede: string;
  position: string;
  employmentType: string;
  title: string;
  description: string;
  workScheduleType: string;
  workScheduleHours: string;
  saturdayHours?: string;
  workDays: string;
  sundayPolicy: string;
  sundayHours: string;
  holidayPolicy: string;
  holidayHours: string;
  scheduleObservations?: string;
  remunerationType: string;
  baseSalary: string;
  transportAid: string;
  sundayHolidaySurcharge: string;
  benefits: string;
  salaryObservations?: string;
  requirements: string;
  contractType: string;
  paymentFrequency: string;
  paymentDates: string;
  probationPeriod: string;
  workPlace: string;
  status: 'ACTIVA' | 'EN_PROCESO' | 'PAUSADA' | 'CERRADA' | 'BORRADOR';
  vacanciesCount: number;
  createdAt?: string;
  updatedAt?: string;
  postulacionesCount?: number;
}

export interface JobApplication {
  id?: number;
  vacancyId?: number;
  vacancyTitle?: string;
  status?: 'EN_REVISION' | 'PRESELECCIONADO' | 'EN_ENTREVISTA' | 'SELECCIONADO' | 'CONTRATADO' | 'NO_SELECCIONADO';
  score?: number;
  employeeStatus?: 'Activo' | 'Periodo de prueba' | 'Inactivo';
  hiredAt?: string;
  hiredPosition?: string;
  hiredSede?: string;
  hiredSalary?: string;
  hiredContractType?: string;
  fullName: string;
  documentType: string;
  documentNumber: string;
  phone: string;
  email: string;
  city: string;
  neighborhood: string;
  address?: string;
  instagram?: string;
  facebook?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  targetPosition: string;
  salesExperience: string;
  workedInClothingStores: boolean;
  experienceDescription?: string;
  currentlyStudying: boolean;
  educationLevel: string;
  weekendHolidayAvailability: string;
  agreesWithSchedule: string;
  agreesWithPayment: string;
  immediateAvailability: boolean;
  accessibleCommute: string;
  habitualTransport: string;
  motivation: string;
  highlightSkills: string;
  socialMediaSalesExp?: boolean;
  salesGoalsAchieved?: string;
  howDidYouHear?: string;
  hasMedicalCondition?: boolean;
  medicalConditionDetails?: string;
  inOtherSelectionProcesses?: boolean;
  additionalObservations?: string;
  familyRefName: string;
  familyRefRelationship: string;
  familyRefPhone: string;
  personalRefName: string;
  personalRefRelationship: string;
  personalRefPhone: string;
  commercialRefCompany: string;
  commercialRefPosition: string;
  commercialRefPhone: string;
  resumeUrl?: string;
  resumeOriginalName?: string;
  documentFileUrl?: string;
  documentFileOriginalName?: string;
  dataPolicyAccepted: boolean;
  infoVerificationAccepted: boolean;
  creditCheckAccepted: boolean;
  imageAuthorizationAccepted?: boolean;
  adminNotes?: string;
  interviewDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface JobInterview {
  id?: number;
  applicationId?: number;
  vacancyId?: number;
  candidateName: string;
  candidateDocument?: string;
  candidatePhone?: string;
  candidateEmail?: string;
  position: string;
  sede?: string;
  interviewer?: string;
  scheduledAt: string;
  status: 'PROGRAMADA' | 'REALIZADA' | 'CANCELADA';
  result?: 'APROBADA' | 'NO_APROBADA' | 'PENDIENTE';
  notes?: string;
  createdAt?: string;
}

export interface RecruitmentSummary {
  activeVacancies: number;
  totalApplications: number;
  scheduledInterviews: number;
  hiredCount: number;
  enRevisionCount?: number;
  preseleccionadoCount?: number;
  enEntrevistaCount?: number;
  seleccionadoCount?: number;
  noSeleccionadoCount?: number;
  totalInterviews?: number;
  interviewsPendientes?: number;
  interviewsRealizadas?: number;
  interviewsAprobadas?: number;
  interviewsNoAprobadas?: number;
  hiredActivos?: number;
  hiredPeriodoPrueba?: number;
  hiredInactivos?: number;
  funnel: {
    enRevision: number;
    preseleccionado?: number;
    enEntrevista: number;
    seleccionado?: number;
    noSeleccionado: number;
    contratado: number;
  };
  recentVacancies: (JobVacancy & { postulacionesCount: number })[];
  recentApplications: JobApplication[];
  upcomingInterviews: JobInterview[];
}

// --- TikTok Module Interfaces ---
export interface TikTokAccountStatus {
  sedeId?: number;
  sedeName: string;
  storeName?: string;
  address?: string;
  storeImage?: string;
  connected: boolean;
  status: string; // "Conectada" | "Sin vincular"
  accountId?: number;
  tiktokAccountId?: string;
  username?: string;
  displayName?: string;
  avatarUrl?: string;
  connectedAt?: string;
  permissions?: string;
}

export interface TikTokVideo {
  id: number;
  accountId?: number;
  sedeName: string;
  videoId?: string;
  title: string;
  description?: string;
  hashtags?: string;
  thumbnailUrl?: string;
  videoUrl?: string;
  duration?: string;
  publishedAt: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  contentType?: string;
}

export interface TikTokScheduledVideo {
  id: number;
  accountId?: number;
  sedeName: string;
  title: string;
  topic?: string;
  scheduledAt: string;
  duration?: string;
  thumbnailUrl?: string;
  status: string; // "PROGRAMADO" | "PUBLICADO"
  notes?: string;
}

export interface TikTokScheduledDay {
  dayName: string; // "Lunes", "Martes", etc.
  dayNumber: number;
  date: string; // "YYYY-MM-DD"
  videos: TikTokScheduledVideo[];
  note?: string;
}

export interface TikTokWeeklySchedule {
  weekStart: string;
  weekEnd: string;
  sede?: string;
  isLinked?: boolean;
  linkedUsername?: string;
  videosProgramados: number;
  diasConContenido: number;
  promedioDiario: number;
  programacionActiva: number;
  days: TikTokScheduledDay[];
}

export interface TikTokSummary {
  isLinked?: boolean;
  videosPublicados: number;
  visualizacionesAcumuladas: number;
  meGusta: number;
  comentarios: number;
  compartidos: number;
  viewsBySede: {
    sede: string;
    views: number;
    percentage: number;
  }[];
  recentVideos: TikTokVideo[];
}

