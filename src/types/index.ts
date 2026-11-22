export type UserRoleName = 'GLOBAL_ADMIN' | 'STORE_ADMIN' | 'VENDEDOR' | string;

export interface Role {
  id: string;
  name: UserRoleName;
}

export type UserStatus = 'ACTIVO' | 'INACTIVO' | 'SUSPENDIDO';
export type DocumentType = 'CC' | 'CE' | 'PASAPORTE' | 'PPT' | 'TI' | string;

export interface User {
  id: string; // 1. ID de usuario (generado automáticamente)
  name: string; // 2. Nombre completo (Nombres y apellidos)
  documentType?: DocumentType; // 3. Tipo de documento (CC, CE, Pasaporte, etc.)
  documentNumber?: string; // 4. Número de documento de identificación
  phone?: string; // 5. Celular de contacto
  email?: string; // 6. Correo electrónico (personal o corporativo)
  username?: string; // 7. Usuario (identificador para inicio de sesión)
  password?: string; // 8. Contraseña de acceso
  role: Role; // 9. Rol (Administrador de sede, Global Admin, etc.)
  storeIds: string[]; // 10. Sede asignada (IDs)
  assignedStoreNames?: string[]; // Nombres legibles de las sedes
  status?: UserStatus; // 11. Estado: Activo, inactivo o suspendido
  isActive: boolean; // Retrocompatibilidad con la API
  createdAt?: string; // 12. Fecha de creación automática
  lastLogin?: string; // 13. Último acceso (fecha y hora de último inicio de sesión)
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

export interface ShiftDateItem {
  id: string;
  date: string;
  rawDate?: string;
  dayName?: string;
  label?: string;
  hours: string;
  dailyPay?: string;
}

export function formatShiftDateFromRaw(rawDateStr: string): { fullDate: string; dayName: string; shortDate: string } {
  if (!rawDateStr) return { fullDate: '', dayName: '—', shortDate: '' };
  const parts = rawDateStr.split('-');
  if (parts.length !== 3) return { fullDate: rawDateStr, dayName: '—', shortDate: rawDateStr };
  const y = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10) - 1;
  const d = parseInt(parts[2], 10);
  const dt = new Date(y, m, d);

  const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const dayShortNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const monthNames = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  const monthShortNames = ['ene.', 'feb.', 'mar.', 'abr.', 'may.', 'jun.', 'jul.', 'ago.', 'sep.', 'oct.', 'nov.', 'dic.'];

  const dayIndex = dt.getDay();
  const dayName = dayNames[dayIndex] || '—';
  const dayShort = dayShortNames[dayIndex] || '';
  const monthName = monthNames[m] || '';
  const monthShort = monthShortNames[m] || '';

  const fullDate = `${dayShort}, ${d} de ${monthName} de ${y}`;
  const shortDate = `${dayShort}, ${d} de ${monthShort} de ${y}`;

  return { fullDate, dayName, shortDate };
}

export const defaultDecemberShifts: ShiftDateItem[] = [
  { id: '1', date: 'Sáb, 6 de diciembre de 2026', rawDate: '2026-12-06', dayName: 'Sábado', hours: '10:00 a. m. – 8:00 p. m.', dailyPay: '$40.000' },
  { id: '2', date: 'Dom, 7 de diciembre de 2026', rawDate: '2026-12-07', dayName: 'Domingo', hours: '10:00 a. m. – 8:00 p. m.', dailyPay: '$40.000' },
  { id: '3', date: 'Sáb, 13 de diciembre de 2026', rawDate: '2026-12-13', dayName: 'Sábado', hours: '10:00 a. m. – 8:00 p. m.', dailyPay: '$40.000' },
  { id: '4', date: 'Dom, 14 de diciembre de 2026', rawDate: '2026-12-14', dayName: 'Domingo', hours: '10:00 a. m. – 8:00 p. m.', dailyPay: '$40.000' },
  { id: '5', date: 'Sáb, 20 de diciembre de 2026', rawDate: '2026-12-20', dayName: 'Sábado', hours: '10:00 a. m. – 8:00 p. m.', dailyPay: '$40.000' },
  { id: '6', date: 'Dom, 21 de diciembre de 2026', rawDate: '2026-12-21', dayName: 'Domingo', hours: '10:00 a. m. – 8:00 p. m.', dailyPay: '$40.000' },
  { id: '7', date: 'Mié, 24 de diciembre de 2026', rawDate: '2026-12-24', dayName: 'Miércoles', hours: '10:00 a. m. – 6:00 p. m.', dailyPay: '$40.000' },
  { id: '8', date: 'Jue, 31 de diciembre de 2026', rawDate: '2026-12-31', dayName: 'Jueves', hours: '10:00 a. m. – 5:00 p. m.', dailyPay: '$40.000' },
  { id: '9', date: 'Jue, 1 de enero de 2027', rawDate: '2027-01-01', dayName: 'Jueves', hours: '12:00 m. – 6:00 p. m.', dailyPay: '$40.000' }
];

export const serializeShiftDates = (dates: ShiftDateItem[]): string => {
  if (!dates || dates.length === 0) return '';
  const lines = dates.map(d => `• ${d.date}${d.dayName ? ` (${d.dayName})` : ''}: ${d.hours} - Pago: ${d.dailyPay || '$40.000'}`);
  return `📅 FECHAS Y HORARIOS ASIGNADOS:\n${lines.join('\n')}\n\n[DATOS_TURNOS_JSON:${JSON.stringify(dates)}]`;
};

export const parseShiftDates = (text?: string): ShiftDateItem[] => {
  if (!text) return [];
  const match = text.match(/\[DATOS_TURNOS_JSON:(.*?)\]/s);
  if (match && match[1]) {
    try {
      return JSON.parse(match[1]);
    } catch {
      // fallback
    }
  }
  const items: ShiftDateItem[] = [];
  const lines = text.split('\n');
  lines.forEach((line, i) => {
    if (line.trim().startsWith('•')) {
      const cleaned = line.replace('•', '').trim();
      const parts = cleaned.split(':');
      if (parts.length >= 2) {
        const datePart = parts[0].trim();
        const hoursPart = parts.slice(1).join(':').trim();
        items.push({
          id: `shift-${i}`,
          date: datePart,
          dayName: '',
          label: '',
          hours: hoursPart,
          dailyPay: '$40.000'
        });
      }
    }
  });
  return items;
};

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
  shiftDates?: ShiftDateItem[];
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

