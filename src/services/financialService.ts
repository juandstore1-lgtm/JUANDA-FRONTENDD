// Service for Control Financiero (Gastos, Deudas Proveedores, Deudas Bancarias, Cuentas por Cobrar, Calendario)
export type StoreId = 'republica' | 'modelo' | 'quality' | 'mariano' | 'todas';

export interface FinancialExpense {
  id: string;
  date: string; // YYYY-MM-DD
  concept: string;
  category: 'Arriendo' | 'Servicios públicos' | 'Internet' | 'Nómina' | 'Logística' | 'Otros';
  store: 'República' | 'Ciudad Modelo' | 'Quality' | 'Sede Mariano' | 'Todas las sedes';
  amount: number;
  status: 'Pagado' | 'Pendiente';
  notes?: string;
}

export interface RecurringExpense {
  id: string;
  title: string;
  period: string; // 'Mensual'
  nextDue: string; // e.g. '01 Dic'
  amount: number;
  isActive: boolean;
}

export interface DebtAbono {
  id: string;
  date: string;
  amount: number;
  paymentMethod: string;
  notes?: string;
}

export interface SupplierDebt {
  id: string;
  supplier: string;
  concept: string;
  store: 'República' | 'Ciudad Modelo' | 'Quality' | 'Sede Mariano' | 'Todas';
  initialDebt: number;
  abonado: number;
  pendingBalance: number;
  dueDate: string; // YYYY-MM-DD
  status: 'Pendiente' | 'Pagada';
  abonosList?: DebtAbono[];
}

export interface BankDebt {
  id: string;
  bank: 'Bancolombia' | 'Davivienda' | 'Banco de Bogotá' | string;
  debtType: string;
  totalAmount: number;
  abonado: number;
  pendingBalance: number;
  monthlyQuota: number;
  dueDate: string; // YYYY-MM-DD
  status: 'Vigente' | 'Cancelada';
  paymentsList?: DebtAbono[];
}

export interface Receivable {
  id: string;
  debtor: string;
  concept: string;
  store: 'República' | 'Ciudad Modelo' | 'Quality' | 'Sede Mariano' | 'Todas las sedes';
  totalAmount: number;
  abonado: number;
  pendingBalance: number;
  createdDate: string; // YYYY-MM-DD
  dueDate: string; // YYYY-MM-DD
  status: 'Pendiente' | 'Al día' | 'Vencida';
  abonosList?: DebtAbono[];
}

export interface CalendarItem {
  id: string;
  date: string; // YYYY-MM-DD
  day: number;
  title: string;
  concept: string;
  amount: number;
  type: 'gasto' | 'proveedor' | 'banco' | 'arriendo';
  status: 'pagado' | 'pendiente' | 'vencido';
  store: string;
  category: string;
}

export interface FinancialData {
  expenses: FinancialExpense[];
  recurringExpenses: RecurringExpense[];
  supplierDebts: SupplierDebt[];
  bankDebts: BankDebt[];
  receivables: Receivable[];
  calendarEvents: CalendarItem[];
}

export const MONTH_NAMES_MAP: Record<string, string> = {
  '01': 'Enero', '02': 'Febrero', '03': 'Marzo', '04': 'Abril',
  '05': 'Mayo', '06': 'Junio', '07': 'Julio', '08': 'Agosto',
  '09': 'Septiembre', '10': 'Octubre', '11': 'Noviembre', '12': 'Diciembre'
};

export const getMonthYearKey = (dateStr: string): string => {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length < 2) return '';
  const y = parts[0];
  const m = parts[1];
  return `${MONTH_NAMES_MAP[m] || m} ${y}`;
};

// Generador de gastos completos para todos los 12 meses del año 2026
function generateFullYearExpenses(): FinancialExpense[] {
  const allExpenses: FinancialExpense[] = [];

  // Noviembre 2026 (Mes Actual con valores exactos validados por el usuario: $17.034.000 total, $4.485.000 pagados, $12.549.000 pendientes)
  const novExpenses: FinancialExpense[] = [
    { id: 'exp-nov-1', date: '2026-11-03', concept: 'Arriendo Local República', category: 'Arriendo', store: 'República', amount: 1800000, status: 'Pagado', notes: 'Pago canon noviembre' },
    { id: 'exp-nov-2', date: '2026-11-03', concept: 'Arriendo Local Ciudad Modelo', category: 'Arriendo', store: 'Ciudad Modelo', amount: 1600000, status: 'Pagado', notes: 'Transferencia Bancolombia' },
    { id: 'exp-nov-3', date: '2026-11-05', concept: 'Servicios públicos', category: 'Servicios públicos', store: 'República', amount: 350000, status: 'Pagado', notes: 'Luz y agua' },
    { id: 'exp-nov-4', date: '2026-11-05', concept: 'Internet fibra', category: 'Internet', store: 'Ciudad Modelo', amount: 85000, status: 'Pagado', notes: 'Plan corporativo' },
    { id: 'exp-nov-5', date: '2026-11-07', concept: 'Nómina vendedores', category: 'Nómina', store: 'Todas las sedes', amount: 3200000, status: 'Pendiente', notes: 'Quincena colaboradores' },
    { id: 'exp-nov-6', date: '2026-11-10', concept: 'Transporte de mercancía', category: 'Logística', store: 'Quality', amount: 420000, status: 'Pendiente', notes: 'Flete Medellín' },
    { id: 'exp-nov-7', date: '2026-11-12', concept: 'Mantenimiento local', category: 'Otros', store: 'Sede Mariano', amount: 650000, status: 'Pagado', notes: 'Reparaciones y pintura' },
    { id: 'exp-nov-8', date: '2026-11-15', concept: 'Arriendo Sede Quality', category: 'Arriendo', store: 'Quality', amount: 2100000, status: 'Pendiente', notes: 'Canon mensual' },
    { id: 'exp-nov-9', date: '2026-11-18', concept: 'Servicios de aseo e insumos', category: 'Servicios públicos', store: 'Sede Mariano', amount: 280000, status: 'Pendiente' },
    { id: 'exp-nov-10', date: '2026-11-20', concept: 'Publicidad e impresiones', category: 'Otros', store: 'Todas las sedes', amount: 704000, status: 'Pendiente' },
    { id: 'exp-nov-11', date: '2026-11-22', concept: 'Servicios públicos Ciudad Modelo', category: 'Servicios públicos', store: 'Ciudad Modelo', amount: 450000, status: 'Pendiente' },
    { id: 'exp-nov-12', date: '2026-11-24', concept: 'Arriendo Sede Mariano', category: 'Arriendo', store: 'Sede Mariano', amount: 1900000, status: 'Pendiente' },
    { id: 'exp-nov-13', date: '2026-11-25', concept: 'Internet sedes adicionales', category: 'Internet', store: 'Todas las sedes', amount: 255000, status: 'Pendiente' },
    { id: 'exp-nov-14', date: '2026-11-26', concept: 'Flete y logística de despacho', category: 'Logística', store: 'República', amount: 830000, status: 'Pendiente' },
    { id: 'exp-nov-15', date: '2026-11-27', concept: 'Gastos bancarios y comisiones', category: 'Otros', store: 'Todas las sedes', amount: 420000, status: 'Pendiente' },
    { id: 'exp-nov-16', date: '2026-11-28', concept: 'Honorarios contables y legales', category: 'Otros', store: 'Todas las sedes', amount: 1450000, status: 'Pendiente' },
    { id: 'exp-nov-17', date: '2026-11-29', concept: 'Servicios públicos Quality', category: 'Servicios públicos', store: 'Quality', amount: 540000, status: 'Pendiente' }
  ];

  allExpenses.push(...novExpenses);

  // Otros meses de 2026 (Enero a Octubre = meses pasados 100% Pagados; Diciembre = mes futuro 100% Pendiente)
  const monthDataConfigs = [
    { m: '01', name: 'Enero', totalTarget: 14800000, log: 400000, maint: 350000, pub: 420000, hon: 1200000, isPast: true },
    { m: '02', name: 'Febrero', totalTarget: 15000000, log: 450000, maint: 400000, pub: 450000, hon: 1250000, isPast: true },
    { m: '03', name: 'Marzo', totalTarget: 15300000, log: 520000, maint: 420000, pub: 500000, hon: 1300000, isPast: true },
    { m: '04', name: 'Abril', totalTarget: 15100000, log: 480000, maint: 380000, pub: 480000, hon: 1280000, isPast: true },
    { m: '05', name: 'Mayo', totalTarget: 15400000, log: 560000, maint: 450000, pub: 520000, hon: 1320000, isPast: true },
    { m: '06', name: 'Junio', totalTarget: 14500000, log: 410000, maint: 360000, pub: 400000, hon: 1250000, isPast: true },
    { m: '07', name: 'Julio', totalTarget: 15200000, log: 530000, maint: 440000, pub: 490000, hon: 1300000, isPast: true },
    { m: '08', name: 'Agosto', totalTarget: 16000000, log: 720000, maint: 520000, pub: 610000, hon: 1380000, isPast: true },
    { m: '09', name: 'Septiembre', totalTarget: 15800000, log: 680000, maint: 490000, pub: 580000, hon: 1350000, isPast: true },
    { m: '10', name: 'Octubre', totalTarget: 16300000, log: 810000, maint: 580000, pub: 650000, hon: 1420000, isPast: true },
    { m: '12', name: 'Diciembre', totalTarget: 18200000, log: 1250000, maint: 650000, pub: 950000, hon: 1500000, isPast: false }
  ];

  for (const cfg of monthDataConfigs) {
    const status: 'Pagado' | 'Pendiente' = cfg.isPast ? 'Pagado' : 'Pendiente';
    const m = cfg.m;

    allExpenses.push(
      { id: `exp-${m}-1`, date: `2026-${m}-03`, concept: 'Arriendo Local República', category: 'Arriendo', store: 'República', amount: 1800000, status },
      { id: `exp-${m}-2`, date: `2026-${m}-03`, concept: 'Arriendo Local Ciudad Modelo', category: 'Arriendo', store: 'Ciudad Modelo', amount: 1600000, status },
      { id: `exp-${m}-3`, date: `2026-${m}-03`, concept: 'Arriendo Sede Quality', category: 'Arriendo', store: 'Quality', amount: 2100000, status },
      { id: `exp-${m}-4`, date: `2026-${m}-03`, concept: 'Arriendo Sede Mariano', category: 'Arriendo', store: 'Sede Mariano', amount: 1900000, status },
      { id: `exp-${m}-5`, date: `2026-${m}-05`, concept: 'Servicios públicos República', category: 'Servicios públicos', store: 'República', amount: 350000, status },
      { id: `exp-${m}-6`, date: `2026-${m}-05`, concept: 'Servicios públicos Ciudad Modelo', category: 'Servicios públicos', store: 'Ciudad Modelo', amount: 450000, status },
      { id: `exp-${m}-7`, date: `2026-${m}-05`, concept: 'Servicios públicos Quality', category: 'Servicios públicos', store: 'Quality', amount: 540000, status },
      { id: `exp-${m}-8`, date: `2026-${m}-05`, concept: 'Servicios de aseo e insumos Mariano', category: 'Servicios públicos', store: 'Sede Mariano', amount: 280000, status },
      { id: `exp-${m}-9`, date: `2026-${m}-05`, concept: 'Internet fibra sedes', category: 'Internet', store: 'Todas las sedes', amount: 340000, status },
      { id: `exp-${m}-10`, date: `2026-${m}-13`, concept: m === '12' ? 'Nómina colaboradores y prima' : 'Nómina vendedores', category: 'Nómina', store: 'Todas las sedes', amount: m === '12' ? 4200000 : 3200000, status },
      { id: `exp-${m}-11`, date: `2026-${m}-15`, concept: 'Transporte y flete de mercancía', category: 'Logística', store: 'Quality', amount: cfg.log, status },
      { id: `exp-${m}-12`, date: `2026-${m}-18`, concept: 'Mantenimiento de locales', category: 'Otros', store: 'Sede Mariano', amount: cfg.maint, status },
      { id: `exp-${m}-13`, date: `2026-${m}-20`, concept: 'Publicidad e impresiones', category: 'Otros', store: 'Todas las sedes', amount: cfg.pub, status },
      { id: `exp-${m}-14`, date: `2026-${m}-25`, concept: 'Gastos bancarios y comisiones', category: 'Otros', store: 'Todas las sedes', amount: 390000, status },
      { id: `exp-${m}-15`, date: `2026-${m}-28`, concept: 'Honorarios contables y soporte', category: 'Otros', store: 'Todas las sedes', amount: cfg.hon, status }
    );
  }

  return allExpenses;
}

const STORAGE_KEY = 'juand_financial_data_v2';

// Initial realistic dataset matching the user's screenshots
export const INITIAL_FINANCIAL_DATA: FinancialData = {
  expenses: generateFullYearExpenses(),
  recurringExpenses: [
    {
      id: 'rec-1',
      title: 'Arriendo (4 sedes)',
      period: 'Mensual',
      nextDue: '01 Dic',
      amount: 7400000,
      isActive: true
    },
    {
      id: 'rec-2',
      title: 'Servicios públicos',
      period: 'Mensual',
      nextDue: '05 Dic',
      amount: 2520000,
      isActive: true
    },
    {
      id: 'rec-3',
      title: 'Internet',
      period: 'Mensual',
      nextDue: '05 Dic',
      amount: 340000,
      isActive: true
    },
    {
      id: 'rec-4',
      title: 'Nómina',
      period: 'Mensual',
      nextDue: '15 Dic',
      amount: 3200000,
      isActive: true
    }
  ],
  supplierDebts: [
    {
      id: 'sup-1',
      supplier: 'Open Mind',
      concept: 'Lote Camisas y Buzos',
      store: 'Todas',
      initialDebt: 4850000,
      abonado: 1500000,
      pendingBalance: 3350000,
      dueDate: '2026-11-28',
      status: 'Pendiente',
      abonosList: [
        { id: 'ab-1', date: '2026-11-10', amount: 1500000, paymentMethod: 'Transferencia Bancolombia', notes: 'Primer abono lote' }
      ]
    },
    {
      id: 'sup-2',
      supplier: 'Pedro Liliana',
      concept: 'Surtido Jeans y Licras',
      store: 'República',
      initialDebt: 3200000,
      abonado: 1000000,
      pendingBalance: 2200000,
      dueDate: '2026-11-30',
      status: 'Pendiente',
      abonosList: [
        { id: 'ab-2', date: '2026-11-12', amount: 1000000, paymentMethod: 'Efectivo', notes: 'Abono en tienda' }
      ]
    },
    {
      id: 'sup-3',
      supplier: 'Juliana Impacto',
      concept: 'Lote Pantalonetas NBA',
      store: 'Ciudad Modelo',
      initialDebt: 2400000,
      abonado: 800000,
      pendingBalance: 1600000,
      dueDate: '2026-12-05',
      status: 'Pendiente',
      abonosList: [
        { id: 'ab-3', date: '2026-11-14', amount: 800000, paymentMethod: 'Nequi', notes: 'Abono 33%' }
      ]
    },
    {
      id: 'sup-4',
      supplier: 'Trend Textil',
      concept: 'Camisetas y Esqueletos',
      store: 'Quality',
      initialDebt: 1250000,
      abonado: 1250000,
      pendingBalance: 0,
      dueDate: '2026-11-15',
      status: 'Pagada',
      abonosList: [
        { id: 'ab-4', date: '2026-11-05', amount: 1250000, paymentMethod: 'Bold', notes: 'Liquidado en su totalidad' }
      ]
    },
    {
      id: 'sup-5',
      supplier: 'Urban Clothes',
      concept: 'Petos y Conjuntos',
      store: 'Sede Mariano',
      initialDebt: 500000,
      abonado: 250000,
      pendingBalance: 250000,
      dueDate: '2026-12-10',
      status: 'Pendiente',
      abonosList: [
        { id: 'ab-5', date: '2026-11-16', amount: 250000, paymentMethod: 'Efectivo', notes: '50% inicial abonado' }
      ]
    }
  ],
  bankDebts: [
    {
      id: 'bank-1',
      bank: 'Bancolombia',
      debtType: 'Préstamo comercial',
      totalAmount: 20000000,
      abonado: 5000000,
      pendingBalance: 15000000,
      monthlyQuota: 750000,
      dueDate: '2026-11-25',
      status: 'Vigente',
      paymentsList: [
        { id: 'bp-1', date: '2026-10-25', amount: 750000, paymentMethod: 'Débito automático' }
      ]
    },
    {
      id: 'bank-2',
      bank: 'Davivienda',
      debtType: 'Crédito de capital de trabajo',
      totalAmount: 10000000,
      abonado: 3000000,
      pendingBalance: 7000000,
      monthlyQuota: 350000,
      dueDate: '2026-11-28',
      status: 'Vigente',
      paymentsList: [
        { id: 'bp-2', date: '2026-10-28', amount: 350000, paymentMethod: 'Débito automático' }
      ]
    },
    {
      id: 'bank-3',
      bank: 'Banco de Bogotá',
      debtType: 'Línea de crédito',
      totalAmount: 5000000,
      abonado: 2000000,
      pendingBalance: 3000000,
      monthlyQuota: 150000,
      dueDate: '2026-12-05',
      status: 'Vigente',
      paymentsList: [
        { id: 'bp-3', date: '2026-11-05', amount: 150000, paymentMethod: 'Transferencia' }
      ]
    }
  ],
  receivables: [
    {
      id: 'rec-c-1',
      debtor: 'Distribuciones La 14',
      concept: 'Mercancía (20 camisas)',
      store: 'República',
      totalAmount: 3000000,
      abonado: 1000000,
      pendingBalance: 2000000,
      createdDate: '2026-11-05',
      dueDate: '2026-11-20',
      status: 'Pendiente',
      abonosList: [
        { id: 'rab-1', date: '2026-11-10', amount: 1000000, paymentMethod: 'Transferencia' }
      ]
    },
    {
      id: 'rec-c-2',
      debtor: 'Cliente Mayorista - Andrés G.',
      concept: 'Mercancía (lote jeans)',
      store: 'Ciudad Modelo',
      totalAmount: 2000000,
      abonado: 500000,
      pendingBalance: 1500000,
      createdDate: '2026-10-28',
      dueDate: '2026-11-15',
      status: 'Vencida',
      abonosList: [
        { id: 'rab-2', date: '2026-11-02', amount: 500000, paymentMethod: 'Efectivo' }
      ]
    },
    {
      id: 'rec-c-3',
      debtor: 'Eventos D&D',
      concept: 'Suministro de ropa',
      store: 'Quality',
      totalAmount: 1200000,
      abonado: 0,
      pendingBalance: 1200000,
      createdDate: '2026-11-10',
      dueDate: '2026-11-30',
      status: 'Pendiente'
    },
    {
      id: 'rec-c-4',
      debtor: 'Juan Camilo R.',
      concept: 'Compra a crédito',
      store: 'Sede Mariano',
      totalAmount: 800000,
      abonado: 500000,
      pendingBalance: 300000,
      createdDate: '2026-11-02',
      dueDate: '2026-11-18',
      status: 'Pendiente',
      abonosList: [
        { id: 'rab-3', date: '2026-11-10', amount: 500000, paymentMethod: 'Nequi' }
      ]
    },
    {
      id: 'rec-c-5',
      debtor: 'Tienda Aliada - Moda Urbana',
      concept: 'Lote pantalones',
      store: 'Todas las sedes',
      totalAmount: 1000000,
      abonado: 0,
      pendingBalance: 1000000,
      createdDate: '2026-11-06',
      dueDate: '2026-11-25',
      status: 'Pendiente'
    },
    {
      id: 'rec-c-6',
      debtor: 'Santiago V.',
      concept: 'Mercancía (camisetas)',
      store: 'República',
      totalAmount: 500000,
      abonado: 0,
      pendingBalance: 500000,
      createdDate: '2026-11-12',
      dueDate: '2026-12-05',
      status: 'Pendiente'
    }
  ],
  calendarEvents: [
    {
      id: 'cal-1',
      date: '2026-11-02',
      day: 2,
      title: 'Internet',
      concept: 'Internet Claro sedes',
      amount: 85000,
      type: 'gasto',
      status: 'pagado',
      store: 'Ciudad Modelo',
      category: 'Internet'
    },
    {
      id: 'cal-2',
      date: '2026-11-05',
      day: 5,
      title: 'Proveedor Open Mind',
      concept: 'Abono camisas',
      amount: 2400000,
      type: 'proveedor',
      status: 'pagado',
      store: 'Todas las sedes',
      category: 'Proveedores'
    },
    {
      id: 'cal-3',
      date: '2026-11-10',
      day: 10,
      title: 'Servicios',
      concept: 'Servicios públicos centrales',
      amount: 320000,
      type: 'gasto',
      status: 'pagado',
      store: 'República',
      category: 'Servicios públicos'
    },
    {
      id: 'cal-4',
      date: '2026-11-13',
      day: 13,
      title: 'Nómina',
      concept: 'Pago quincenal colaboradores',
      amount: 3200000,
      type: 'gasto',
      status: 'pagado',
      store: 'Todas las sedes',
      category: 'Nómina'
    },
    {
      id: 'cal-5',
      date: '2026-11-19',
      day: 19,
      title: 'Proveedor Juliana Impacto',
      concept: 'Lote pantalonetas',
      amount: 1600000,
      type: 'proveedor',
      status: 'pendiente',
      store: 'Ciudad Modelo',
      category: 'Proveedores'
    },
    {
      id: 'cal-6',
      date: '2026-11-25',
      day: 25,
      title: 'Banco Bancolombia',
      concept: 'Cuota préstamo comercial',
      amount: 1250000,
      type: 'banco',
      status: 'pendiente',
      store: 'Todas las sedes',
      category: 'Deudas bancarias'
    },
    {
      id: 'cal-7',
      date: '2026-11-28',
      day: 28,
      title: 'Proveedor Pedro Liliana',
      concept: 'Surtido jeans y licras',
      amount: 2200000,
      type: 'proveedor',
      status: 'pendiente',
      store: 'República',
      category: 'Proveedores'
    },
    {
      id: 'cal-8',
      date: '2026-11-30',
      day: 30,
      title: 'Arriendo',
      concept: 'Arriendo sedes comerciales',
      amount: 1800000,
      type: 'arriendo',
      status: 'pendiente',
      store: 'República',
      category: 'Arriendo'
    }
  ]
};

export class FinancialService {
  static getFinancialData(): FinancialData {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: FinancialData = JSON.parse(stored);
        // Migración automática: Si los gastos en cache son menos de 50 (ej. solo tenían Noviembre), actualizar al año completo
        if (parsed.expenses && parsed.expenses.length < 50) {
          const fullData = {
            ...INITIAL_FINANCIAL_DATA,
            ...parsed,
            expenses: INITIAL_FINANCIAL_DATA.expenses
          };
          this.saveFinancialData(fullData);
          return fullData;
        }
        return parsed;
      }
    } catch (e) {
      console.warn('Error reading financial data from localStorage:', e);
    }
    this.saveFinancialData(INITIAL_FINANCIAL_DATA);
    return INITIAL_FINANCIAL_DATA;
  }

  static saveFinancialData(data: FinancialData): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Error saving financial data:', e);
    }
  }

  // --- Expenses ---
  static addExpense(expense: Omit<FinancialExpense, 'id'>): FinancialExpense {
    const data = this.getFinancialData();
    const newExpense: FinancialExpense = {
      ...expense,
      id: 'exp-' + Date.now()
    };
    data.expenses.unshift(newExpense);
    this.saveFinancialData(data);
    return newExpense;
  }

  static updateExpense(id: string, updates: Partial<FinancialExpense>): void {
    const data = this.getFinancialData();
    data.expenses = data.expenses.map(e => e.id === id ? { ...e, ...updates } : e);
    this.saveFinancialData(data);
  }

  static deleteExpense(id: string): void {
    const data = this.getFinancialData();
    data.expenses = data.expenses.filter(e => e.id !== id);
    this.saveFinancialData(data);
  }

  static toggleExpenseStatus(id: string): void {
    const data = this.getFinancialData();
    data.expenses = data.expenses.map(e => {
      if (e.id === id) {
        const nextStatus = e.status === 'Pagado' ? 'Pendiente' : 'Pagado';
        return { ...e, status: nextStatus };
      }
      return e;
    });
    this.saveFinancialData(data);
  }

  // --- Recurring Expenses ---
  static addRecurringExpense(rec: Omit<RecurringExpense, 'id'>): RecurringExpense {
    const data = this.getFinancialData();
    const newRec: RecurringExpense = {
      ...rec,
      id: 'rec-' + Date.now()
    };
    data.recurringExpenses.push(newRec);
    this.saveFinancialData(data);
    return newRec;
  }

  static toggleRecurringExpense(id: string): void {
    const data = this.getFinancialData();
    data.recurringExpenses = data.recurringExpenses.map(r =>
      r.id === id ? { ...r, isActive: !r.isActive } : r
    );
    this.saveFinancialData(data);
  }

  static deleteRecurringExpense(id: string): void {
    const data = this.getFinancialData();
    data.recurringExpenses = data.recurringExpenses.filter(r => r.id !== id);
    this.saveFinancialData(data);
  }

  // --- Supplier Debts ---
  static addSupplierDebt(debt: Omit<SupplierDebt, 'id' | 'pendingBalance' | 'abonado'> & { abonado?: number }): SupplierDebt {
    const data = this.getFinancialData();
    const abonado = debt.abonado || 0;
    const pendingBalance = Math.max(0, debt.initialDebt - abonado);
    const newDebt: SupplierDebt = {
      ...debt,
      id: 'sup-' + Date.now(),
      abonado,
      pendingBalance,
      status: pendingBalance === 0 ? 'Pagada' : 'Pendiente',
      abonosList: []
    };
    data.supplierDebts.unshift(newDebt);
    this.saveFinancialData(data);
    return newDebt;
  }

  static recordSupplierAbono(debtId: string, amount: number, paymentMethod: string, notes?: string): void {
    const data = this.getFinancialData();
    data.supplierDebts = data.supplierDebts.map(d => {
      if (d.id === debtId) {
        const newAbonado = d.abonado + amount;
        const newPending = Math.max(0, d.initialDebt - newAbonado);
        const abono: DebtAbono = {
          id: 'ab-' + Date.now(),
          date: new Date().toISOString().split('T')[0],
          amount,
          paymentMethod,
          notes
        };
        const currentList = d.abonosList || [];
        return {
          ...d,
          abonado: newAbonado,
          pendingBalance: newPending,
          status: newPending === 0 ? 'Pagada' : 'Pendiente',
          abonosList: [abono, ...currentList]
        };
      }
      return d;
    });
    this.saveFinancialData(data);
  }

  static updateSupplierDebt(id: string, updates: Partial<SupplierDebt>): void {
    const data = this.getFinancialData();
    data.supplierDebts = data.supplierDebts.map(d => {
      if (d.id === id) {
        const merged = { ...d, ...updates };
        merged.pendingBalance = Math.max(0, merged.initialDebt - merged.abonado);
        merged.status = merged.pendingBalance === 0 ? 'Pagada' : 'Pendiente';
        return merged;
      }
      return r;
    });
    this.saveFinancialData(data);
  }

  static deleteSupplierDebt(id: string): void {
    const data = this.getFinancialData();
    data.supplierDebts = data.supplierDebts.filter(d => d.id !== id);
    this.saveFinancialData(data);
  }

  // --- Bank Debts ---
  static addBankDebt(debt: Omit<BankDebt, 'id' | 'pendingBalance' | 'abonado'> & { abonado?: number }): BankDebt {
    const data = this.getFinancialData();
    const abonado = debt.abonado || 0;
    const pendingBalance = Math.max(0, debt.totalAmount - abonado);
    const newDebt: BankDebt = {
      ...debt,
      id: 'bank-' + Date.now(),
      abonado,
      pendingBalance,
      status: pendingBalance === 0 ? 'Cancelada' : 'Vigente',
      paymentsList: []
    };
    data.bankDebts.unshift(newDebt);
    this.saveFinancialData(data);
    return newDebt;
  }

  static recordBankQuotaPayment(debtId: string, amount: number, paymentMethod: string, notes?: string): void {
    const data = this.getFinancialData();
    data.bankDebts = data.bankDebts.map(d => {
      if (d.id === debtId) {
        const newAbonado = d.abonado + amount;
        const newPending = Math.max(0, d.totalAmount - newAbonado);
        const payment: DebtAbono = {
          id: 'bp-' + Date.now(),
          date: new Date().toISOString().split('T')[0],
          amount,
          paymentMethod,
          notes
        };
        const currentList = d.paymentsList || [];
        return {
          ...d,
          abonado: newAbonado,
          pendingBalance: newPending,
          status: newPending === 0 ? 'Cancelada' : 'Vigente',
          paymentsList: [payment, ...currentList]
        };
      }
      return d;
    });
    this.saveFinancialData(data);
  }

  static updateBankDebt(id: string, updates: Partial<BankDebt>): void {
    const data = this.getFinancialData();
    data.bankDebts = data.bankDebts.map(d => {
      if (d.id === id) {
        const merged = { ...d, ...updates };
        merged.pendingBalance = Math.max(0, merged.totalAmount - merged.abonado);
        merged.status = merged.pendingBalance === 0 ? 'Cancelada' : 'Vigente';
        return merged;
      }
      return r;
    });
    this.saveFinancialData(data);
  }

  static deleteBankDebt(id: string): void {
    const data = this.getFinancialData();
    data.bankDebts = data.bankDebts.filter(d => d.id !== id);
    this.saveFinancialData(data);
  }

  // --- Receivables ---
  static addReceivable(item: Omit<Receivable, 'id' | 'pendingBalance' | 'abonado'> & { abonado?: number }): Receivable {
    const data = this.getFinancialData();
    const abonado = item.abonado || 0;
    const pendingBalance = Math.max(0, item.totalAmount - abonado);
    const newReceivable: Receivable = {
      ...item,
      id: 'rec-c-' + Date.now(),
      abonado,
      pendingBalance,
      status: pendingBalance === 0 ? 'Al día' : item.status || 'Pendiente',
      abonosList: []
    };
    data.receivables.unshift(newReceivable);
    this.saveFinancialData(data);
    return newReceivable;
  }

  static recordReceivableAbono(id: string, amount: number, paymentMethod: string, notes?: string): void {
    const data = this.getFinancialData();
    data.receivables = data.receivables.map(r => {
      if (r.id === id) {
        const newAbonado = r.abonado + amount;
        const newPending = Math.max(0, r.totalAmount - newAbonado);
        const abono: DebtAbono = {
          id: 'rab-' + Date.now(),
          date: new Date().toISOString().split('T')[0],
          amount,
          paymentMethod,
          notes
        };
        const currentList = r.abonosList || [];
        return {
          ...r,
          abonado: newAbonado,
          pendingBalance: newPending,
          status: newPending === 0 ? 'Al día' : r.status,
          abonosList: [abono, ...currentList]
        };
      }
      return r;
    });
    this.saveFinancialData(data);
  }

  static updateReceivable(id: string, updates: Partial<Receivable>): void {
    const data = this.getFinancialData();
    data.receivables = data.receivables.map(r => {
      if (r.id === id) {
        const merged = { ...r, ...updates };
        merged.pendingBalance = Math.max(0, merged.totalAmount - merged.abonado);
        if (merged.pendingBalance === 0) merged.status = 'Al día';
        return merged;
      }
      return r;
    });
    this.saveFinancialData(data);
  }

  static deleteReceivable(id: string): void {
    const data = this.getFinancialData();
    data.receivables = data.receivables.filter(r => r.id !== id);
    this.saveFinancialData(data);
  }

  // --- Calendar Events ---
  static addCalendarEvent(event: Omit<CalendarItem, 'id' | 'day'>): CalendarItem {
    const data = this.getFinancialData();
    const day = parseInt(event.date.split('-')[2] || '1', 10);
    const newEvent: CalendarItem = {
      ...event,
      id: 'cal-' + Date.now(),
      day
    };
    data.calendarEvents.push(newEvent);
    this.saveFinancialData(data);
    return newEvent;
  }

  static toggleCalendarEventStatus(id: string): void {
    const data = this.getFinancialData();
    data.calendarEvents = data.calendarEvents.map(ev => {
      if (ev.id === id) {
        const nextStatus = ev.status === 'pagado' ? 'pendiente' : 'pagado';
        return { ...ev, status: nextStatus };
      }
      return ev;
    });
    this.saveFinancialData(data);
  }

  static deleteCalendarEvent(id: string): void {
    const data = this.getFinancialData();
    data.calendarEvents = data.calendarEvents.filter(ev => ev.id !== id);
    this.saveFinancialData(data);
  }

  static resetToDefaults(): FinancialData {
    this.saveFinancialData(INITIAL_FINANCIAL_DATA);
    return INITIAL_FINANCIAL_DATA;
  }
}
