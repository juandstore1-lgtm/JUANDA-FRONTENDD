// Service for Control Comercial (Ventas, Finanzas, Inventario, Costos y Cuadres)
export interface CommercialProduct {
  id: string;
  name: string;
  category: string;
  costPrice: number;
  sellingPrice: number;
  stocks: { [storeKey: string]: number }; // e.g. { republica: 58, modelo: 18, quality: 20, mariano: 25 }
}

export interface CommercialSaleLine {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  costPrice: number;
  sellingPrice: number;
  subtotal: number;
  costTotal: number;
  profit: number;
  paymentMethod: string; // 'Bold' | 'Efectivo' | 'Nequi' | 'Daviplata' | 'Datáfono' | 'Sistecrédito' | 'Addi'
  hour: string;
  verified?: boolean;
}

export interface CommercialDailyCuadre {
  id: string;
  dateStr: string; // YYYY-MM-DD
  storeId: string; // 'republica' | 'modelo' | 'quality' | 'mariano'
  storeName: string;
  status: 'REGISTERED' | 'NO_SALES' | 'PENDING';
  sales: CommercialSaleLine[];
  totalSales: number;
  totalCost: number;
  totalProfit: number;
  totalItems: number;
  totalsByMethod: { [method: string]: number };
  images?: string[];
  notes?: string;
  updatedAt?: string;
}

export interface CommercialMovementItem {
  productId: string;
  productName: string;
  quantity: number;
  costPrice: number;
  subtotal: number;
}

export interface CommercialMovement {
  id: string;
  type: 'ENTRADA' | 'SALIDA' | 'TRASLADO';
  dateStr: string;
  storeId: string;
  storeName: string;
  targetStoreId?: string;
  targetStoreName?: string;
  items: CommercialMovementItem[];
  totalUnits: number;
  totalCost: number;
  reference: string;
  observations: string;
  images?: string[];
  createdAt: string;
}

export interface CommercialExpense {
  id: string;
  concept: string;
  local: string; // 'JUAND REPUBLICA' | 'JUAND C.MODELO' | 'QUALITY' | 'Q. SEDE MARIANO' | 'Global'
  monthlyAmount: number;
  category: 'FIJO' | 'VARIABLE';
  statusByMonth: { [monthIndex: number]: 'PAGADO' | 'PENDIENTE' }; // 1 to 12
}

export interface CommercialDebt {
  id: string;
  dateStr: string;
  thirdParty: string; // Proveedor o Deudor
  concept: string;
  totalInitial: number;
  abonos: { dateStr: string; amount: number }[];
  totalAbonado: number;
  pendingBalance: number;
  status: 'PENDIENTE' | 'PAGADO';
  type: 'PAYABLE' | 'RECEIVABLE'; // PAYABLE = Deuda a proveedor | RECEIVABLE = Cartera de clientes
  description?: string;
}

export interface StoreDefinition {
  id: string;
  name: string;
  shortName: string;
  address: string;
  manager: string;
}

export const STORES_LIST: StoreDefinition[] = [
  { id: 'republica', name: "JUAN'D STORE - República de Israel", shortName: 'República', address: 'Carrera 46 # 38a-59', manager: 'Yeferson' },
  { id: 'modelo', name: "JUAN'D STORE - Ciudad Modelo", shortName: 'Ciudad Modelo', address: 'Calle 29 # 40a-19', manager: 'Juliana' },
  { id: 'quality', name: 'QUALITY STORE - Villa Colombia', shortName: 'Quality', address: 'Calle 52 # 13a-6', manager: 'Daniela' },
  { id: 'mariano', name: 'QUALITY STORE - Mariano Ramos', shortName: 'Sede Mariano', address: 'Cra. 46 con Cl. 40', manager: 'Paola' }
];

export const PAYMENT_METHODS = [
  { id: 'Bold', label: 'Bold', color: '#0052cc', bg: 'bg-blue-50 text-blue-700 border-blue-200' },
  { id: 'Efectivo', label: 'Efectivo', color: '#16a34a', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { id: 'Nequi', label: 'Nequi', color: '#7c3aed', bg: 'bg-purple-50 text-purple-700 border-purple-200' },
  { id: 'Daviplata', label: 'Daviplata', color: '#dc2626', bg: 'bg-red-50 text-red-700 border-red-200' },
  { id: 'Datáfono', label: 'Datáfono', color: '#0284c7', bg: 'bg-sky-50 text-sky-700 border-sky-200' },
  { id: 'Sistecrédito', label: 'Sistecrédito', color: '#15803d', bg: 'bg-green-50 text-green-700 border-green-200' },
  { id: 'Addi', label: 'Addi', color: '#2563eb', bg: 'bg-indigo-50 text-indigo-700 border-indigo-200' }
];

// Seed Inventory based on real Excel data
const INITIAL_PRODUCTS: CommercialProduct[] = [
  { id: 'p1', name: 'CAMISAS ALTA GAMA', category: 'Camisas', costPrice: 40000, sellingPrice: 70000, stocks: { republica: 146, modelo: 160, quality: 185, mariano: 202 } },
  { id: 'p2', name: 'CAMISAS FB', category: 'Camisas', costPrice: 25000, sellingPrice: 60000, stocks: { republica: 16, modelo: 11, quality: 20, mariano: 22 } },
  { id: 'p3', name: 'JEANS', category: 'Pantalones', costPrice: 100000, sellingPrice: 140000, stocks: { republica: 18, modelo: 18, quality: 20, mariano: 20 } },
  { id: 'p4', name: 'MOCHOS', category: 'Pantalones', costPrice: 90000, sellingPrice: 120000, stocks: { republica: 18, modelo: 14, quality: 12, mariano: 11 } },
  { id: 'p5', name: 'PANTALONETA NBA', category: 'Pantalonetas', costPrice: 33000, sellingPrice: 70000, stocks: { republica: 13, modelo: 11, quality: 9, mariano: 13 } },
  { id: 'p6', name: 'PANTALONETA 1.1', category: 'Pantalonetas', costPrice: 42000, sellingPrice: 65000, stocks: { republica: 24, modelo: 14, quality: 10, mariano: 14 } },
  { id: 'p7', name: 'SUDADERAS', category: 'Deportivo', costPrice: 40000, sellingPrice: 70000, stocks: { republica: 16, modelo: 14, quality: 15, mariano: 14 } },
  { id: 'p8', name: 'ZAPATILLAS', category: 'Calzado', costPrice: 80000, sellingPrice: 140000, stocks: { republica: 21, modelo: 29, quality: 51, mariano: 25 } },
  { id: 'p9', name: 'GORRAS', category: 'Accesorios', costPrice: 25000, sellingPrice: 50000, stocks: { republica: 39, modelo: 36, quality: 46, mariano: 42 } },
  { id: 'p10', name: 'RELOJS', category: 'Accesorios', costPrice: 50000, sellingPrice: 90000, stocks: { republica: 7, modelo: 4, quality: 6, mariano: 8 } },
  { id: 'p11', name: 'BOXER', category: 'Ropa Interior', costPrice: 12000, sellingPrice: 18000, stocks: { republica: 8, modelo: 29, quality: 26, mariano: 21 } },
  { id: 'p12', name: 'SACOS 1.1', category: 'Sacos', costPrice: 85000, sellingPrice: 120000, stocks: { republica: 11, modelo: 6, quality: 8, mariano: 11 } },
  { id: 'p13', name: 'SACOS SIN CAPUCHA 1.1', category: 'Sacos', costPrice: 60000, sellingPrice: 115000, stocks: { republica: 2, modelo: 6, quality: 4, mariano: 5 } },
  { id: 'p14', name: 'BILLETERAS', category: 'Accesorios', costPrice: 25000, sellingPrice: 50000, stocks: { republica: 6, modelo: 5, quality: 6, mariano: 5 } },
  { id: 'p15', name: 'POLOS', category: 'Camisas', costPrice: 38000, sellingPrice: 70000, stocks: { republica: 6, modelo: 15, quality: 6, mariano: 5 } },
  { id: 'p16', name: 'CANGUROS', category: 'Accesorios', costPrice: 35000, sellingPrice: 60000, stocks: { republica: 3, modelo: 2, quality: 1, mariano: 2 } },
  { id: 'p17', name: 'LOCIONES', category: 'Perfumería', costPrice: 35000, sellingPrice: 70000, stocks: { republica: 5, modelo: 6, quality: 8, mariano: 7 } },
  { id: 'p18', name: 'CONJUNTO IMPERMEABLE', category: 'Conjuntos', costPrice: 95000, sellingPrice: 140000, stocks: { republica: 5, modelo: 5, quality: 6, mariano: 5 } },
  { id: 'p19', name: 'CONJUNTOS TIPO ORIGINAL 1.1', category: 'Conjuntos', costPrice: 90000, sellingPrice: 130000, stocks: { republica: 4, modelo: 7, quality: 6, mariano: 4 } },
  { id: 'p20', name: 'CORREAS', category: 'Accesorios', costPrice: 20000, sellingPrice: 50000, stocks: { republica: 4, modelo: 4, quality: 3, mariano: 4 } },
  { id: 'p21', name: 'CARRIEL 1.1', category: 'Accesorios', costPrice: 50000, sellingPrice: 80000, stocks: { republica: 4, modelo: 1, quality: 3, mariano: 4 } },
  { id: 'p22', name: 'CHANCLAS MIND', category: 'Calzado', costPrice: 75000, sellingPrice: 120000, stocks: { republica: 3, modelo: 3, quality: 6, mariano: 5 } },
  { id: 'p23', name: 'MALETIN 1.1', category: 'Accesorios', costPrice: 35000, sellingPrice: 90000, stocks: { republica: 1, modelo: 2, quality: 5, mariano: 3 } },
  { id: 'p24', name: 'ESQUELETO FB', category: 'Camisetas', costPrice: 30000, sellingPrice: 65000, stocks: { republica: 1, modelo: 11, quality: 8, mariano: 3 } },
  { id: 'p25', name: 'CHAQUETAS', category: 'Chaquetas', costPrice: 60000, sellingPrice: 100000, stocks: { republica: 2, modelo: 1, quality: 1, mariano: 2 } },
  { id: 'p26', name: 'MEDIAS (CAJA/PAR)', category: 'Accesorios', costPrice: 2250, sellingPrice: 5000, stocks: { republica: 35, modelo: 45, quality: 60, mariano: 40 } },
  { id: 'p27', name: 'CAMISA PROMOCION', category: 'Promociones', costPrice: 12000, sellingPrice: 20000, stocks: { republica: 17, modelo: 20, quality: 15, mariano: 18 } }
];

// Initial Debts from Excel
const INITIAL_DEBTS: CommercialDebt[] = [
  // Deudas a Proveedores (Payable)
  { id: 'd1', dateStr: '2026-06-01', thirdParty: 'OPEN MIND', concept: 'Préstamo capital trabajo', totalInitial: 4000000, abonos: [{ dateStr: '2026-08-15', amount: 540000 }], totalAbonado: 540000, pendingBalance: 3460000, status: 'PENDIENTE', type: 'PAYABLE' },
  { id: 'd2', dateStr: '2026-10-26', thirdParty: 'PEDRO LILIANA', concept: 'Lote ropa importada', totalInitial: 3752000, abonos: [], totalAbonado: 0, pendingBalance: 3752000, status: 'PENDIENTE', type: 'PAYABLE' },
  { id: 'd3', dateStr: '2026-10-28', thirdParty: 'LINA', concept: 'Mercancía jeans y polos', totalInitial: 2616000, abonos: [], totalAbonado: 0, pendingBalance: 2616000, status: 'PENDIENTE', type: 'PAYABLE' },
  { id: 'd4', dateStr: '2026-11-04', thirdParty: 'JULIANA IMPACTO', concept: 'Lote camisas alta gama', totalInitial: 11853000, abonos: [], totalAbonado: 0, pendingBalance: 11853000, status: 'PENDIENTE', type: 'PAYABLE' },
  { id: 'd5', dateStr: '2026-09-21', thirdParty: 'KEVIN PELUDA', concept: 'Mercancía calzado y zapatillas', totalInitial: 8047000, abonos: [], totalAbonado: 0, pendingBalance: 8047000, status: 'PENDIENTE', type: 'PAYABLE' },
  { id: 'd6', dateStr: '2026-10-26', thirdParty: 'PAPERA', concept: 'Saldo pendiente insumos', totalInitial: 948000, abonos: [], totalAbonado: 0, pendingBalance: 948000, status: 'PENDIENTE', type: 'PAYABLE' },
  { id: 'd7', dateStr: '2026-10-23', thirdParty: 'OPEN MIND', concept: 'Préstamo temporal', totalInitial: 3000000, abonos: [], totalAbonado: 0, pendingBalance: 3000000, status: 'PENDIENTE', type: 'PAYABLE' },

  // Cartera Clientes (Receivable)
  { id: 'c1', dateStr: '2026-11-01', thirdParty: 'ADRIAN', concept: 'Saldo pendiente mercancía', totalInitial: 742000, abonos: [], totalAbonado: 0, pendingBalance: 742000, status: 'PENDIENTE', type: 'RECEIVABLE', description: 'Debe valor total de lote' },
  { id: 'c2', dateStr: '2026-11-01', thirdParty: 'LOFTY', concept: 'Saldo prendas', totalInitial: 1676000, abonos: [{ dateStr: '2026-11-10', amount: 400000 }], totalAbonado: 400000, pendingBalance: 1276000, status: 'PENDIENTE', type: 'RECEIVABLE' },
  { id: 'c3', dateStr: '2026-11-05', thirdParty: 'LEYDER', concept: 'Saldo tiendas', totalInitial: 130000, abonos: [], totalAbonado: 0, pendingBalance: 130000, status: 'PENDIENTE', type: 'RECEIVABLE', description: 'Saldo anterior' },
  { id: 'c4', dateStr: '2026-11-08', thirdParty: 'HORMIGA UNIDAD', concept: 'Zapatillas bota', totalInitial: 140000, abonos: [], totalAbonado: 0, pendingBalance: 140000, status: 'PENDIENTE', type: 'RECEIVABLE' },
  { id: 'c5', dateStr: '2026-10-15', thirdParty: 'VARGAS', concept: 'Saldo ropa mayorista', totalInitial: 3920000, abonos: [], totalAbonado: 0, pendingBalance: 3920000, status: 'PENDIENTE', type: 'RECEIVABLE' },
  { id: 'c6', dateStr: '2026-11-12', thirdParty: 'DON GUMER', concept: 'Lote ropa', totalInitial: 590000, abonos: [{ dateStr: '2026-11-15', amount: 200000 }], totalAbonado: 200000, pendingBalance: 390000, status: 'PENDIENTE', type: 'RECEIVABLE' }
];

// Initial Fixed & Variable Expenses
const INITIAL_EXPENSES: CommercialExpense[] = [
  { id: 'e1', concept: 'Arriendo local (10 de cada mes)', local: 'JUAND REPUBLICA', monthlyAmount: 1050000, category: 'FIJO', statusByMonth: { 6: 'PAGADO', 7: 'PAGADO', 8: 'PAGADO', 9: 'PAGADO', 10: 'PAGADO', 11: 'PAGADO', 12: 'PENDIENTE' } },
  { id: 'e2', concept: 'Arriendo local (19 de cada mes)', local: 'JUAND C.MODELO', monthlyAmount: 1250000, category: 'FIJO', statusByMonth: { 6: 'PAGADO', 7: 'PAGADO', 8: 'PAGADO', 9: 'PAGADO', 10: 'PENDIENTE', 11: 'PENDIENTE', 12: 'PENDIENTE' } },
  { id: 'e3', concept: 'Arriendo local (5 de cada mes)', local: 'QUALITY', monthlyAmount: 1050000, category: 'FIJO', statusByMonth: { 6: 'PAGADO', 7: 'PAGADO', 8: 'PAGADO', 9: 'PAGADO', 10: 'PAGADO', 11: 'PENDIENTE', 12: 'PENDIENTE' } },
  { id: 'e4', concept: 'Arriendo local (1 de cada mes)', local: 'Q. SEDE MARIANO', monthlyAmount: 1700000, category: 'FIJO', statusByMonth: { 6: 'PAGADO', 7: 'PAGADO', 8: 'PAGADO', 9: 'PAGADO', 10: 'PAGADO', 11: 'PENDIENTE', 12: 'PENDIENTE' } },
  { id: 'e5', concept: 'Arriendo Bodega Caracoli (15 de cada mes)', local: 'Global', monthlyAmount: 1200000, category: 'FIJO', statusByMonth: { 6: 'PAGADO', 7: 'PAGADO', 8: 'PAGADO', 9: 'PAGADO', 10: 'PAGADO', 11: 'PENDIENTE', 12: 'PENDIENTE' } },
  { id: 'e6', concept: 'Servicios públicos (Luz/Agua)', local: 'JUAND REPUBLICA', monthlyAmount: 390000, category: 'FIJO', statusByMonth: { 6: 'PAGADO', 7: 'PAGADO', 8: 'PAGADO', 9: 'PAGADO', 10: 'PAGADO', 11: 'PENDIENTE', 12: 'PENDIENTE' } },
  { id: 'e7', concept: 'Servicios públicos (Luz/Agua)', local: 'JUAND C.MODELO', monthlyAmount: 300000, category: 'FIJO', statusByMonth: { 6: 'PAGADO', 7: 'PAGADO', 8: 'PAGADO', 9: 'PENDIENTE', 10: 'PENDIENTE', 11: 'PENDIENTE', 12: 'PENDIENTE' } },
  { id: 'e8', concept: 'Servicios públicos (Luz/Agua)', local: 'QUALITY', monthlyAmount: 280000, category: 'FIJO', statusByMonth: { 6: 'PAGADO', 7: 'PAGADO', 8: 'PAGADO', 9: 'PAGADO', 10: 'PAGADO', 11: 'PENDIENTE', 12: 'PENDIENTE' } },
  { id: 'e9', concept: 'Internet fibra óptica', local: 'JUAND REPUBLICA', monthlyAmount: 70000, category: 'FIJO', statusByMonth: { 6: 'PAGADO', 7: 'PAGADO', 8: 'PAGADO', 9: 'PAGADO', 10: 'PAGADO', 11: 'PENDIENTE', 12: 'PENDIENTE' } },
  { id: 'e10', concept: 'Internet fibra óptica', local: 'JUAND C.MODELO', monthlyAmount: 70000, category: 'FIJO', statusByMonth: { 6: 'PAGADO', 7: 'PAGADO', 8: 'PAGADO', 9: 'PAGADO', 10: 'PAGADO', 11: 'PENDIENTE', 12: 'PENDIENTE' } },
  { id: 'e11', concept: 'Internet fibra óptica', local: 'QUALITY', monthlyAmount: 120000, category: 'FIJO', statusByMonth: { 6: 'PAGADO', 7: 'PAGADO', 8: 'PAGADO', 9: 'PAGADO', 10: 'PAGADO', 11: 'PENDIENTE', 12: 'PENDIENTE' } },
  { id: 'e12', concept: 'Internet Sede Mariano', local: 'Q. SEDE MARIANO', monthlyAmount: 80000, category: 'FIJO', statusByMonth: { 6: 'PAGADO', 7: 'PAGADO', 8: 'PAGADO', 9: 'PAGADO', 10: 'PAGADO', 11: 'PENDIENTE', 12: 'PENDIENTE' } },
  { id: 'e13', concept: 'Nómina Quincena 15 (Yeferson)', local: 'JUAND REPUBLICA', monthlyAmount: 1070000, category: 'FIJO', statusByMonth: { 6: 'PAGADO', 7: 'PAGADO', 8: 'PAGADO', 9: 'PAGADO', 10: 'PAGADO', 11: 'PAGADO', 12: 'PENDIENTE' } },
  { id: 'e14', concept: 'Nómina Quincena 15 (Juliana)', local: 'JUAND C.MODELO', monthlyAmount: 1070000, category: 'FIJO', statusByMonth: { 6: 'PAGADO', 7: 'PAGADO', 8: 'PAGADO', 9: 'PAGADO', 10: 'PAGADO', 11: 'PAGADO', 12: 'PENDIENTE' } },
  { id: 'e15', concept: 'Nómina Quincena 15 (Daniela)', local: 'QUALITY', monthlyAmount: 1070000, category: 'FIJO', statusByMonth: { 6: 'PAGADO', 7: 'PAGADO', 8: 'PAGADO', 9: 'PAGADO', 10: 'PAGADO', 11: 'PAGADO', 12: 'PENDIENTE' } },
  { id: 'e16', concept: 'Nómina Quincena 15 (Paola)', local: 'Q. SEDE MARIANO', monthlyAmount: 1070000, category: 'FIJO', statusByMonth: { 6: 'PAGADO', 7: 'PAGADO', 8: 'PAGADO', 9: 'PAGADO', 10: 'PAGADO', 11: 'PAGADO', 12: 'PENDIENTE' } },
  { id: 'e17', concept: 'Nómina Quincena 30 (Yeferson)', local: 'JUAND REPUBLICA', monthlyAmount: 1070000, category: 'FIJO', statusByMonth: { 6: 'PAGADO', 7: 'PAGADO', 8: 'PAGADO', 9: 'PAGADO', 10: 'PENDIENTE', 11: 'PENDIENTE', 12: 'PENDIENTE' } },
  { id: 'e18', concept: 'Nómina Quincena 30 (Juliana)', local: 'JUAND C.MODELO', monthlyAmount: 1070000, category: 'FIJO', statusByMonth: { 6: 'PAGADO', 7: 'PAGADO', 8: 'PAGADO', 9: 'PAGADO', 10: 'PENDIENTE', 11: 'PENDIENTE', 12: 'PENDIENTE' } },
  { id: 'e19', concept: 'Nómina Quincena 30 (Daniela)', local: 'QUALITY', monthlyAmount: 1070000, category: 'FIJO', statusByMonth: { 6: 'PAGADO', 7: 'PAGADO', 8: 'PAGADO', 9: 'PAGADO', 10: 'PENDIENTE', 11: 'PENDIENTE', 12: 'PENDIENTE' } },
  { id: 'e20', concept: 'Nómina Quincena 30 (Paola)', local: 'Q. SEDE MARIANO', monthlyAmount: 1070000, category: 'FIJO', statusByMonth: { 6: 'PAGADO', 7: 'PAGADO', 8: 'PAGADO', 9: 'PAGADO', 10: 'PENDIENTE', 11: 'PENDIENTE', 12: 'PENDIENTE' } },
  { id: 'e21', concept: 'Cuota Crédito Mundo Mujer 21M (Juan)', local: 'Global', monthlyAmount: 1660000, category: 'FIJO', statusByMonth: { 6: 'PAGADO', 7: 'PAGADO', 8: 'PAGADO', 9: 'PAGADO', 10: 'PAGADO', 11: 'PAGADO', 12: 'PENDIENTE' } },
  { id: 'e22', concept: 'Cuota Crédito Mundo Mujer 30M (Majo)', local: 'Global', monthlyAmount: 2100000, category: 'FIJO', statusByMonth: { 6: 'PAGADO', 7: 'PAGADO', 8: 'PAGADO', 9: 'PAGADO', 10: 'PAGADO', 11: 'PAGADO', 12: 'PENDIENTE' } },
  { id: 'e23', concept: 'Cuota Crédito Mundo Mujer 9M (Majo)', local: 'Global', monthlyAmount: 1074000, category: 'FIJO', statusByMonth: { 6: 'PAGADO', 7: 'PAGADO', 8: 'PAGADO', 9: 'PAGADO', 10: 'PAGADO', 11: 'PAGADO', 12: 'PENDIENTE' } },
  { id: 'e24', concept: 'Tanqueo combustible', local: 'Global', monthlyAmount: 600000, category: 'VARIABLE', statusByMonth: { 6: 'PAGADO', 7: 'PAGADO', 8: 'PAGADO', 9: 'PAGADO', 10: 'PENDIENTE', 11: 'PENDIENTE', 12: 'PENDIENTE' } },
  { id: 'e25', concept: 'Almuerzos diarios tiendas (30 días)', local: 'Global', monthlyAmount: 1200000, category: 'VARIABLE', statusByMonth: { 6: 'PAGADO', 7: 'PAGADO', 8: 'PAGADO', 9: 'PAGADO', 10: 'PENDIENTE', 11: 'PENDIENTE', 12: 'PENDIENTE' } },
  { id: 'e26', concept: 'Implementos de aseo sedes', local: 'Global', monthlyAmount: 200000, category: 'VARIABLE', statusByMonth: { 6: 'PAGADO', 7: 'PAGADO', 8: 'PAGADO', 9: 'PAGADO', 10: 'PAGADO', 11: 'PENDIENTE', 12: 'PENDIENTE' } }
];

// Seed Historical Cuadres and Sales
const generateSeedCuadres = (): CommercialDailyCuadre[] => {
  const cuadres: CommercialDailyCuadre[] = [];
  const stores = ['republica', 'modelo', 'quality', 'mariano'];

  // Generate for days 1 to 20 of November 2026
  for (let day = 1; day <= 20; day++) {
    const dayStr = `2026-11-${String(day).padStart(2, '0')}`;
    stores.forEach((sId, sIdx) => {
      // Simulate registered vs pending matching the mockups
      const isPending = (day === 16 && sId === 'modelo') || 
                        (day === 17 && (sId === 'republica' || sId === 'quality')) || 
                        (day === 18 && sId === 'mariano') || 
                        (day === 19 && sId === 'modelo') ||
                        (day === 20);

      const storeObj = STORES_LIST.find(s => s.id === sId)!;
      
      if (isPending) {
        cuadres.push({
          id: `cuadre-${dayStr}-${sId}`,
          dateStr: dayStr,
          storeId: sId,
          storeName: storeObj.shortName,
          status: 'PENDING',
          sales: [],
          totalSales: 0,
          totalCost: 0,
          totalProfit: 0,
          totalItems: 0,
          totalsByMethod: {}
        });
      } else {
        // Daily simulated real sales based on store typical volume
        const baseVal = sId === 'quality' ? 950000 : (sId === 'modelo' ? 780000 : 720000);
        const randSeed = (day * 13 + sIdx * 17) % 5;
        const totalSales = baseVal + randSeed * 95000;
        const totalCost = Math.round(totalSales * 0.61);
        const totalProfit = totalSales - totalCost;
        const totalItems = 10 + randSeed * 2;

        const boldAmount = Math.round(totalSales * 0.42);
        const efectivoAmount = Math.round(totalSales * 0.28);
        const nequiAmount = Math.round(totalSales * 0.15);
        const davAmount = totalSales - boldAmount - efectivoAmount - nequiAmount;

        const sampleSales: CommercialSaleLine[] = [
          { id: `s-${dayStr}-${sId}-1`, productId: 'p1', productName: 'CAMISAS ALTA GAMA', quantity: 2, costPrice: 40000, sellingPrice: 70000, subtotal: 140000, costTotal: 80000, profit: 60000, paymentMethod: 'Bold', hour: '11:15 a. m.', verified: true },
          { id: `s-${dayStr}-${sId}-2`, productId: 'p3', productName: 'JEANS', quantity: 1, costPrice: 100000, sellingPrice: 140000, subtotal: 140000, costTotal: 100000, profit: 40000, paymentMethod: 'Efectivo', hour: '12:30 p. m.', verified: true },
          { id: `s-${dayStr}-${sId}-3`, productId: 'p8', productName: 'ZAPATILLAS', quantity: 1, costPrice: 80000, sellingPrice: 145000, subtotal: 145000, costTotal: 80000, profit: 65000, paymentMethod: 'Bold', hour: '02:40 p. m.', verified: true },
          { id: `s-${dayStr}-${sId}-4`, productId: 'p5', productName: 'PANTALONETA NBA', quantity: 2, costPrice: 33000, sellingPrice: 65000, subtotal: 130000, costTotal: 66000, profit: 64000, paymentMethod: 'Nequi', hour: '04:10 p. m.', verified: true },
          { id: `s-${dayStr}-${sId}-5`, productId: 'p9', productName: 'GORRAS', quantity: 2, costPrice: 25000, sellingPrice: 50000, subtotal: 100000, costTotal: 50000, profit: 50000, paymentMethod: 'Daviplata', hour: '05:55 p. m.', verified: true }
        ];

        cuadres.push({
          id: `cuadre-${dayStr}-${sId}`,
          dateStr: dayStr,
          storeId: sId,
          storeName: storeObj.shortName,
          status: 'REGISTERED',
          sales: sampleSales,
          totalSales,
          totalCost,
          totalProfit,
          totalItems,
          totalsByMethod: {
            Bold: boldAmount,
            Efectivo: efectivoAmount,
            Nequi: nequiAmount,
            Daviplata: davAmount,
            Datáfono: 0,
            Sistecrédito: 0,
            Addi: 0
          }
        });
      }
    });
  }

  return cuadres;
};

// Seed Movements
const INITIAL_MOVEMENTS: CommercialMovement[] = [
  {
    id: 'mov-1',
    type: 'TRASLADO',
    dateStr: '2026-11-14',
    storeId: 'republica',
    storeName: 'República',
    targetStoreId: 'modelo',
    targetStoreName: 'Ciudad Modelo',
    items: [
      { productId: 'p3', productName: 'JEANS', quantity: 10, costPrice: 100000, subtotal: 1000000 },
      { productId: 'p1', productName: 'CAMISAS ALTA GAMA', quantity: 20, costPrice: 40000, subtotal: 800000 },
      { productId: 'p5', productName: 'PANTALONETA NBA', quantity: 5, costPrice: 33000, subtotal: 165000 }
    ],
    totalUnits: 35,
    totalCost: 1965000,
    reference: 'Redistribución de inventario fin de semana',
    observations: 'Traslado verificado entre sedes',
    createdAt: '2026-11-14T10:30:00Z'
  },
  {
    id: 'mov-2',
    type: 'ENTRADA',
    dateStr: '2026-11-15',
    storeId: 'quality',
    storeName: 'Quality',
    items: [
      { productId: 'p8', productName: 'ZAPATILLAS', quantity: 12, costPrice: 80000, subtotal: 960000 },
      { productId: 'p9', productName: 'GORRAS', quantity: 20, costPrice: 25000, subtotal: 500000 }
    ],
    totalUnits: 32,
    totalCost: 1460000,
    reference: 'Pedido Proveedor Medellín',
    observations: 'Entrada cargada con IA desde nota de remisión',
    createdAt: '2026-11-15T09:15:00Z'
  },
  {
    id: 'mov-3',
    type: 'SALIDA',
    dateStr: '2026-11-16',
    storeId: 'modelo',
    storeName: 'Ciudad Modelo',
    items: [
      { productId: 'p18', productName: 'CONJUNTO IMPERMEABLE', quantity: 1, costPrice: 95000, subtotal: 95000 }
    ],
    totalUnits: 1,
    totalCost: 95000,
    reference: 'Desarme por defecto de cremallera',
    observations: 'Se envía a reparación con proveedor',
    createdAt: '2026-11-16T14:20:00Z'
  }
];

export class CommercialService {
  private static STORAGE_KEY = 'juand_commercial_system_v2';

  public static getData(): {
    products: CommercialProduct[];
    cuadres: CommercialDailyCuadre[];
    movements: CommercialMovement[];
    expenses: CommercialExpense[];
    debts: CommercialDebt[];
  } {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Could not parse commercial storage, using seed data:', e);
    }

    const initial = {
      products: INITIAL_PRODUCTS,
      cuadres: generateSeedCuadres(),
      movements: INITIAL_MOVEMENTS,
      expenses: INITIAL_EXPENSES,
      debts: INITIAL_DEBTS
    };

    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(initial));
    } catch (e) {}

    return initial;
  }

  public static saveData(data: {
    products: CommercialProduct[];
    cuadres: CommercialDailyCuadre[];
    movements: CommercialMovement[];
    expenses: CommercialExpense[];
    debts: CommercialDebt[];
  }) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Error saving commercial data:', e);
    }
  }

  // Register or update daily cuadre with automatic inventory discount
  public static saveCuadre(newCuadre: CommercialDailyCuadre): boolean {
    const data = this.getData();
    const existingIndex = data.cuadres.findIndex(c => c.dateStr === newCuadre.dateStr && c.storeId === newCuadre.storeId);

    // If new sales registered, discount stock from store
    newCuadre.sales.forEach(sale => {
      const prod = data.products.find(p => p.id === sale.productId || p.name.toUpperCase() === sale.productName.toUpperCase());
      if (prod) {
        if (!prod.stocks[newCuadre.storeId]) prod.stocks[newCuadre.storeId] = 0;
        prod.stocks[newCuadre.storeId] = Math.max(0, prod.stocks[newCuadre.storeId] - sale.quantity);
      }
    });

    if (existingIndex >= 0) {
      data.cuadres[existingIndex] = newCuadre;
    } else {
      data.cuadres.push(newCuadre);
    }

    this.saveData(data);
    return true;
  }

  // Record inventory movement (Entrada, Salida, Traslado)
  public static saveMovement(movement: CommercialMovement): boolean {
    const data = this.getData();

    movement.items.forEach(item => {
      const prod = data.products.find(p => p.id === item.productId || p.name.toUpperCase() === item.productName.toUpperCase());
      if (prod) {
        if (movement.type === 'ENTRADA') {
          prod.stocks[movement.storeId] = (prod.stocks[movement.storeId] || 0) + item.quantity;
        } else if (movement.type === 'SALIDA') {
          prod.stocks[movement.storeId] = Math.max(0, (prod.stocks[movement.storeId] || 0) - item.quantity);
        } else if (movement.type === 'TRASLADO' && movement.targetStoreId) {
          prod.stocks[movement.storeId] = Math.max(0, (prod.stocks[movement.storeId] || 0) - item.quantity);
          prod.stocks[movement.targetStoreId] = (prod.stocks[movement.targetStoreId] || 0) + item.quantity;
        }
      }
    });

    data.movements.unshift(movement);
    this.saveData(data);
    return true;
  }

  // Add or update commercial product
  public static saveProduct(product: CommercialProduct): boolean {
    const data = this.getData();
    const idx = data.products.findIndex(p => p.id === product.id);
    if (idx >= 0) {
      data.products[idx] = product;
    } else {
      data.products.push(product);
    }
    this.saveData(data);
    return true;
  }

  // Delete commercial product
  public static deleteProduct(productId: string): boolean {
    const data = this.getData();
    data.products = data.products.filter(p => p.id !== productId);
    this.saveData(data);
    return true;
  }

  // Add Debt / Cartera record
  public static saveDebt(debt: CommercialDebt): boolean {
    const data = this.getData();
    const idx = data.debts.findIndex(d => d.id === debt.id);
    if (idx >= 0) {
      data.debts[idx] = debt;
    } else {
      data.debts.unshift(debt);
    }
    this.saveData(data);
    return true;
  }

  // Register Abono to debt
  public static addAbono(debtId: string, amount: number, dateStr: string): boolean {
    const data = this.getData();
    const debt = data.debts.find(d => d.id === debtId);
    if (!debt) return false;

    debt.abonos.push({ dateStr, amount });
    debt.totalAbonado += amount;
    debt.pendingBalance = Math.max(0, debt.totalInitial - debt.totalAbonado);
    if (debt.pendingBalance === 0) {
      debt.status = 'PAGADO';
    }

    this.saveData(data);
    return true;
  }

  // Toggle Expense status for a specific month
  public static toggleExpenseMonth(expenseId: string, monthIndex: number): boolean {
    const data = this.getData();
    const exp = data.expenses.find(e => e.id === expenseId);
    if (!exp) return false;

    const current = exp.statusByMonth[monthIndex] || 'PENDIENTE';
    exp.statusByMonth[monthIndex] = current === 'PAGADO' ? 'PENDIENTE' : 'PAGADO';
    this.saveData(data);
    return true;
  }

  // Reset to default seed data from Excel
  public static resetToSeed(): boolean {
    localStorage.removeItem(this.STORAGE_KEY);
    this.getData();
    return true;
  }
}
