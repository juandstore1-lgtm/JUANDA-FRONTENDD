// Service for Control Comercial (Ventas, Finanzas, Inventario, Costos y Cuadres)
export interface CommercialProduct {
  id: string;
  name: string; // 1 solo nombre (Categoría / Producto)
  costPrice: number; // Costo de compra
  stocks: { [storeKey: string]: number }; // republica | modelo | quality | mariano
}

export interface CommercialSaleLine {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  costPrice: number;
  sellingPrice: number; // Se coloca ÚNICAMENTE al registrar la venta
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
  storeId: string; // origen en traslado, o sede de entrada/salida
  storeName: string;
  targetStoreId?: string; // destino en traslado
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
  abonos: { dateStr: string; amount: number; notes?: string }[];
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

// 4 SEDES FÍSICAS INDEPENDIENTES
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

// TODOS LOS PRODUCTOS EXTRAÍDOS DIRECTAMENTE DEL EXCEL Sistema_Contable_2.0_(5).xlsx
// Con 1 solo nombre (Categoría/Producto), su costo de compra y sus existencias reales por sede.
const INITIAL_PRODUCTS: CommercialProduct[] = [
  { id: "p-1", name: "CAMISAS ALTA GAMA", costPrice: 40000, stocks: { republica: 149, modelo: 194, quality: 181, mariano: 196 } },
  { id: "p-2", name: "CAMISAS FB", costPrice: 25000, stocks: { republica: 0, modelo: 0, quality: 0, mariano: 0 } },
  { id: "p-3", name: "PETOS", costPrice: 35000, stocks: { republica: 0, modelo: 0, quality: 0, mariano: 0 } },
  { id: "p-4", name: "ESQUELETO FB", costPrice: 30000, stocks: { republica: 0, modelo: 7, quality: 0, mariano: 0 } },
  { id: "p-5", name: "JEANS", costPrice: 100000, stocks: { republica: 43, modelo: 45, quality: 47, mariano: 49 } },
  { id: "p-6", name: "MOCHOS", costPrice: 90000, stocks: { republica: 35, modelo: 40, quality: 25, mariano: 7 } },
  { id: "p-7", name: "PAVAS", costPrice: 25000, stocks: { republica: 0, modelo: 0, quality: 0, mariano: 0 } },
  { id: "p-8", name: "PANTALONETA NBA", costPrice: 33000, stocks: { republica: 43, modelo: 23, quality: 38, mariano: 21 } },
  { id: "p-9", name: "PANTALONETA 1.1", costPrice: 42000, stocks: { republica: 16, modelo: 10, quality: 38, mariano: 0 } },
  { id: "p-10", name: "MEDIAS", costPrice: 2250, stocks: { republica: 0, modelo: 0, quality: 78, mariano: 45 } },
  { id: "p-11", name: "SUDADERAS", costPrice: 40000, stocks: { republica: 33, modelo: 33, quality: 19, mariano: 36 } },
  { id: "p-12", name: "CHANCLAS", costPrice: 40000, stocks: { republica: 7, modelo: 5, quality: 12, mariano: 0 } },
  { id: "p-13", name: "ZAPATILLAS", costPrice: 80000, stocks: { republica: 51, modelo: 48, quality: 45, mariano: 18 } },
  { id: "p-14", name: "GORRAS", costPrice: 25000, stocks: { republica: 45, modelo: 52, quality: 54, mariano: 63 } },
  { id: "p-15", name: "RELOJS", costPrice: 50000, stocks: { republica: 11, modelo: 10, quality: 8, mariano: 9 } },
  { id: "p-16", name: "BOXER", costPrice: 12000, stocks: { republica: 41, modelo: 58, quality: 45, mariano: 37 } },
  { id: "p-17", name: "SACOS 1.1", costPrice: 85000, stocks: { republica: 3, modelo: 6, quality: 7, mariano: 6 } },
  { id: "p-18", name: "SACOS SIN CAPUCHA 1.1", costPrice: 60000, stocks: { republica: 1, modelo: 2, quality: 2, mariano: 0 } },
  { id: "p-19", name: "BILLETERAS", costPrice: 25000, stocks: { republica: 5, modelo: 5, quality: 9, mariano: 10 } },
  { id: "p-20", name: "POLOS", costPrice: 38000, stocks: { republica: 45, modelo: 55, quality: 27, mariano: 17 } },
  { id: "p-21", name: "JOGGER", costPrice: 80000, stocks: { republica: 0, modelo: 0, quality: 0, mariano: 0 } },
  { id: "p-22", name: "CANGUROS", costPrice: 35000, stocks: { republica: 4, modelo: 3, quality: 1, mariano: 5 } },
  { id: "p-23", name: "LOCIONES", costPrice: 35000, stocks: { republica: 10, modelo: 8, quality: 5, mariano: 10 } },
  { id: "p-24", name: "CONJUNTO SACO Y SUD ALGODON FB", costPrice: 75000, stocks: { republica: 0, modelo: 0, quality: 0, mariano: 0 } },
  { id: "p-25", name: "CONJUNTO SACO Y SUD ALGODON 1.1", costPrice: 105000, stocks: { republica: 3, modelo: 0, quality: 0, mariano: 0 } },
  { id: "p-26", name: "CONJUNTO IMPERMEABLE", costPrice: 95000, stocks: { republica: 0, modelo: 0, quality: 0, mariano: 12 } },
  { id: "p-27", name: "CONJUNTOS TIPO ORIGINAL 1.1", costPrice: 90000, stocks: { republica: 6, modelo: 18, quality: 10, mariano: 16 } },
  { id: "p-28", name: "CORREAS", costPrice: 20000, stocks: { republica: 8, modelo: 10, quality: 7, mariano: 13 } },
  { id: "p-29", name: "CARRIEL 1.1", costPrice: 50000, stocks: { republica: 4, modelo: 4, quality: 4, mariano: 7 } },
  { id: "p-30", name: "CAMISA DE LA SELECCION COLOMBIA", costPrice: 32000, stocks: { republica: 0, modelo: 0, quality: 21, mariano: 0 } },
  { id: "p-31", name: "CHAQUETAS", costPrice: 60000, stocks: { republica: 0, modelo: 1, quality: 0, mariano: 0 } },
  { id: "p-32", name: "CAMISA DEPORTIVAS", costPrice: 30000, stocks: { republica: 0, modelo: 0, quality: 0, mariano: 0 } },
  { id: "p-33", name: "GAFAS GRANDES", costPrice: 25000, stocks: { republica: 2, modelo: 2, quality: 2, mariano: 0 } },
  { id: "p-34", name: "GAFAS PEQUEÑAS", costPrice: 20000, stocks: { republica: 2, modelo: 5, quality: 3, mariano: 9 } },
  { id: "p-35", name: "MALETIN 1.1", costPrice: 35000, stocks: { republica: 3, modelo: 3, quality: 5, mariano: 0 } },
  { id: "p-36", name: "MALETIN FB", costPrice: 20000, stocks: { republica: 1, modelo: 0, quality: 0, mariano: 0 } },
  { id: "p-37", name: "ESQUELETO DEPORTIVO", costPrice: 25000, stocks: { republica: 0, modelo: 0, quality: 0, mariano: 0 } },
  { id: "p-38", name: "PANTALONETA DEPORTIVA", costPrice: 33000, stocks: { republica: 8, modelo: 13, quality: 4, mariano: 0 } },
  { id: "p-39", name: "CHANCLAS MIND", costPrice: 75000, stocks: { republica: 0, modelo: 0, quality: 0, mariano: 3 } },
  { id: "p-40", name: "GORRAS ORIGINALES", costPrice: 95000, stocks: { republica: 0, modelo: 0, quality: 0, mariano: 0 } },
  { id: "p-41", name: "SACOS FB", costPrice: 35000, stocks: { republica: 5, modelo: 9, quality: 6, mariano: 0 } },
  { id: "p-42", name: "CAMISA PROMOCION", costPrice: 12000, stocks: { republica: 148, modelo: 0, quality: 0, mariano: 0 } },
  { id: "p-43", name: "MEDIAS CAJA", costPrice: 28000, stocks: { republica: 0, modelo: 0, quality: 0, mariano: 0 } }
];

// Gastos fijos reales del negocio
const INITIAL_EXPENSES: CommercialExpense[] = [
  { id: 'e1', concept: 'Arriendo Local República', local: 'JUAND REPUBLICA', monthlyAmount: 1800000, category: 'FIJO', statusByMonth: { 11: 'PAGADO', 12: 'PENDIENTE' } },
  { id: 'e2', concept: 'Servicios Públicos República', local: 'JUAND REPUBLICA', monthlyAmount: 350000, category: 'FIJO', statusByMonth: { 11: 'PAGADO', 12: 'PENDIENTE' } },
  { id: 'e3', concept: 'Internet Fibra República', local: 'JUAND REPUBLICA', monthlyAmount: 85000, category: 'FIJO', statusByMonth: { 11: 'PAGADO', 12: 'PENDIENTE' } },
  { id: 'e4', concept: 'Arriendo Local Ciudad Modelo', local: 'JUAND C.MODELO', monthlyAmount: 1600000, category: 'FIJO', statusByMonth: { 11: 'PAGADO', 12: 'PENDIENTE' } },
  { id: 'e5', concept: 'Servicios Públicos Ciudad Modelo', local: 'JUAND C.MODELO', monthlyAmount: 320000, category: 'FIJO', statusByMonth: { 11: 'PAGADO', 12: 'PENDIENTE' } },
  { id: 'e6', concept: 'Internet Fibra Ciudad Modelo', local: 'JUAND C.MODELO', monthlyAmount: 85000, category: 'FIJO', statusByMonth: { 11: 'PAGADO', 12: 'PENDIENTE' } },
  { id: 'e7', concept: 'Arriendo Local Quality Store', local: 'QUALITY', monthlyAmount: 2200000, category: 'FIJO', statusByMonth: { 11: 'PAGADO', 12: 'PENDIENTE' } },
  { id: 'e8', concept: 'Servicios Públicos Quality', local: 'QUALITY', monthlyAmount: 420000, category: 'FIJO', statusByMonth: { 11: 'PAGADO', 12: 'PENDIENTE' } },
  { id: 'e9', concept: 'Internet Fibra Quality', local: 'QUALITY', monthlyAmount: 90000, category: 'FIJO', statusByMonth: { 11: 'PAGADO', 12: 'PENDIENTE' } },
  { id: 'e10', concept: 'Arriendo Sede Mariano Ramos', local: 'Q. SEDE MARIANO', monthlyAmount: 1500000, category: 'FIJO', statusByMonth: { 11: 'PAGADO', 12: 'PENDIENTE' } },
  { id: 'e11', concept: 'Servicios Públicos Mariano', local: 'Q. SEDE MARIANO', monthlyAmount: 280000, category: 'FIJO', statusByMonth: { 11: 'PAGADO', 12: 'PENDIENTE' } },
  { id: 'e12', concept: 'Internet Fibra Mariano', local: 'Q. SEDE MARIANO', monthlyAmount: 85000, category: 'FIJO', statusByMonth: { 11: 'PAGADO', 12: 'PENDIENTE' } },
  { id: 'e13', concept: 'Nómina Fija Vendedores (4 sedes)', local: 'Global', monthlyAmount: 5600000, category: 'FIJO', statusByMonth: { 11: 'PAGADO', 12: 'PENDIENTE' } },
  { id: 'e14', concept: 'Cuota Crédito Mundo Mujer 30M', local: 'Global', monthlyAmount: 2100000, category: 'FIJO', statusByMonth: { 11: 'PAGADO', 12: 'PENDIENTE' } },
  { id: 'e15', concept: 'Cuota Crédito Mundo Mujer 9M', local: 'Global', monthlyAmount: 1074000, category: 'FIJO', statusByMonth: { 11: 'PAGADO', 12: 'PENDIENTE' } }
];

// Deudas con proveedores y Cartera de clientes
const INITIAL_DEBTS: CommercialDebt[] = [
  { id: 'd1', dateStr: '2026-11-01', thirdParty: 'Open Mind', concept: 'Lote Camisas y Buzos importados', totalInitial: 4850000, abonos: [{ dateStr: '2026-11-10', amount: 1500000 }], totalAbonado: 1500000, pendingBalance: 3350000, status: 'PENDIENTE', type: 'PAYABLE' },
  { id: 'd2', dateStr: '2026-11-03', thirdParty: 'Pedro Liliana', concept: 'Surtido Jeans licrados', totalInitial: 3200000, abonos: [{ dateStr: '2026-11-12', amount: 1000000 }], totalAbonado: 1000000, pendingBalance: 2200000, status: 'PENDIENTE', type: 'PAYABLE' },
  { id: 'd3', dateStr: '2026-11-05', thirdParty: 'Juliana Impacto', concept: 'Lote Pantalonetas NBA', totalInitial: 2400000, abonos: [{ dateStr: '2026-11-14', amount: 800000 }], totalAbonado: 800000, pendingBalance: 1600000, status: 'PENDIENTE', type: 'PAYABLE' },
  { id: 'd4', dateStr: '2026-11-06', thirdParty: 'Kevin Peluda', concept: 'Confección Mochos y Pavas', totalInitial: 1800000, abonos: [{ dateStr: '2026-11-15', amount: 600000 }], totalAbonado: 600000, pendingBalance: 1200000, status: 'PENDIENTE', type: 'PAYABLE' },
  { id: 'd5', dateStr: '2026-11-08', thirdParty: 'Lina', concept: 'Remesas y accesorios', totalInitial: 1500000, abonos: [], totalAbonado: 0, pendingBalance: 1500000, status: 'PENDIENTE', type: 'PAYABLE' },
  // Cartera Clientes
  { id: 'c1', dateStr: '2026-11-02', thirdParty: 'Vargas', concept: 'Crédito prendas personales', totalInitial: 850000, abonos: [{ dateStr: '2026-11-11', amount: 300000 }], totalAbonado: 300000, pendingBalance: 550000, status: 'PENDIENTE', type: 'RECEIVABLE' },
  { id: 'c2', dateStr: '2026-11-04', thirdParty: 'Lofty', concept: 'Venta mayorista consignación', totalInitial: 1400000, abonos: [{ dateStr: '2026-11-13', amount: 500000 }], totalAbonado: 500000, pendingBalance: 900000, status: 'PENDIENTE', type: 'RECEIVABLE' },
  { id: 'c3', dateStr: '2026-11-07', thirdParty: 'Adrian', concept: 'Crédito calzado', totalInitial: 420000, abonos: [], totalAbonado: 0, pendingBalance: 420000, status: 'PENDIENTE', type: 'RECEIVABLE' },
  { id: 'c4', dateStr: '2026-11-09', thirdParty: 'Don Gumer', concept: 'Crédito ropa hombre', totalInitial: 680000, abonos: [{ dateStr: '2026-11-16', amount: 200000 }], totalAbonado: 200000, pendingBalance: 480000, status: 'PENDIENTE', type: 'RECEIVABLE' }
];

export class CommercialService {
  private static STORAGE_KEY = 'juand_commercial_system_v5';

  // Obtener datos maestros comerciales
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
        const parsed = JSON.parse(saved);
        if (parsed.products && Array.isArray(parsed.products)) {
          parsed.products.forEach((p: any) => {
            if (!p.stocks) p.stocks = { republica: 0, modelo: 0, quality: 0, mariano: 0 };
            STORES_LIST.forEach(s => {
              if (typeof p.stocks[s.id] !== 'number') p.stocks[s.id] = 0;
            });
            delete p.sellingPrice;
            delete p.category;
          });
        }
        return parsed;
      }
    } catch (e) {
      console.warn('Could not parse commercial storage, using clean initial data:', e);
    }

    const initial = {
      products: INITIAL_PRODUCTS,
      cuadres: [] as CommercialDailyCuadre[],
      movements: [] as CommercialMovement[],
      expenses: INITIAL_EXPENSES,
      debts: INITIAL_DEBTS
    };

    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(initial));
    } catch (e) {}

    return initial;
  }

  // Guardar estado completo
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

  // Guardar Cierre de Ventas diario con descuento automático de inventario de esa sede
  public static saveCuadre(newCuadre: CommercialDailyCuadre): boolean {
    const data = this.getData();
    const existingIndex = data.cuadres.findIndex(c => c.dateStr === newCuadre.dateStr && c.storeId === newCuadre.storeId);

    // Revertir inventario anterior si se está editando un cuadre existente
    if (existingIndex >= 0) {
      const oldCuadre = data.cuadres[existingIndex];
      if (oldCuadre.sales && Array.isArray(oldCuadre.sales)) {
        oldCuadre.sales.forEach(oldSale => {
          const prod = data.products.find(p => p.id === oldSale.productId || p.name.toUpperCase() === oldSale.productName.toUpperCase());
          if (prod && prod.stocks) {
            prod.stocks[oldCuadre.storeId] = (prod.stocks[oldCuadre.storeId] || 0) + oldSale.quantity;
          }
        });
      }
    }

    // Descontar inventario de la sede según las ventas
    if (newCuadre.status === 'REGISTERED' && newCuadre.sales && Array.isArray(newCuadre.sales)) {
      newCuadre.sales.forEach(sale => {
        const prod = data.products.find(p => p.id === sale.productId || p.name.toUpperCase() === sale.productName.toUpperCase());
        if (prod && prod.stocks) {
          if (!prod.stocks[newCuadre.storeId]) prod.stocks[newCuadre.storeId] = 0;
          prod.stocks[newCuadre.storeId] = Math.max(0, prod.stocks[newCuadre.storeId] - sale.quantity);
        }
      });
    }

    if (existingIndex >= 0) {
      data.cuadres[existingIndex] = newCuadre;
    } else {
      data.cuadres.unshift(newCuadre);
    }

    this.saveData(data);
    return true;
  }

  // Eliminar un cuadre con reversión de stock
  public static deleteCuadre(cuadreId: string, revertStock: boolean = true): boolean {
    const data = this.getData();
    const cuadre = data.cuadres.find(c => c.id === cuadreId);
    if (!cuadre) return false;

    if (revertStock && cuadre.status === 'REGISTERED' && cuadre.sales) {
      cuadre.sales.forEach(sale => {
        const prod = data.products.find(p => p.id === sale.productId || p.name.toUpperCase() === sale.productName.toUpperCase());
        if (prod && prod.stocks) {
          prod.stocks[cuadre.storeId] = (prod.stocks[cuadre.storeId] || 0) + sale.quantity;
        }
      });
    }

    data.cuadres = data.cuadres.filter(c => c.id !== cuadreId);
    this.saveData(data);
    return true;
  }

  // Registrar un día sin ventas ($0 / cerrado) para una sede
  public static markNoSalesDay(dateStr: string, storeId: string): boolean {
    const store = STORES_LIST.find(s => s.id === storeId);
    const storeName = store ? store.shortName : storeId;

    const cuadre: CommercialDailyCuadre = {
      id: `cuadre-${dateStr}-${storeId}`,
      dateStr,
      storeId,
      storeName,
      status: 'NO_SALES',
      sales: [],
      totalSales: 0,
      totalCost: 0,
      totalProfit: 0,
      totalItems: 0,
      totalsByMethod: { Bold: 0, Efectivo: 0, Nequi: 0, Daviplata: 0, Datáfono: 0, Sistecrédito: 0, Addi: 0 },
      updatedAt: new Date().toISOString()
    };

    return this.saveCuadre(cuadre);
  }

  // Registrar movimiento de inventario (Entrada, Salida, Traslado entre sedes)
  public static saveMovement(movement: CommercialMovement): boolean {
    const data = this.getData();

    movement.items.forEach(item => {
      const prod = data.products.find(p => p.id === item.productId || p.name.toUpperCase() === item.productName.toUpperCase());
      if (prod && prod.stocks) {
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

  public static deleteMovement(movementId: string): boolean {
    const data = this.getData();
    const mov = data.movements.find(m => m.id === movementId);
    if (mov) {
      mov.items.forEach(item => {
        const prod = data.products.find(p => p.id === item.productId || p.name.toUpperCase() === item.productName.toUpperCase());
        if (prod && prod.stocks) {
          if (mov.type === 'ENTRADA') {
            prod.stocks[mov.storeId] = Math.max(0, (prod.stocks[mov.storeId] || 0) - item.quantity);
          } else if (mov.type === 'SALIDA') {
            prod.stocks[mov.storeId] = (prod.stocks[mov.storeId] || 0) + item.quantity;
          } else if (mov.type === 'TRASLADO' && mov.targetStoreId) {
            prod.stocks[mov.storeId] = (prod.stocks[mov.storeId] || 0) + item.quantity;
            prod.stocks[mov.targetStoreId] = Math.max(0, (prod.stocks[mov.targetStoreId] || 0) - item.quantity);
          }
        }
      });
      data.movements = data.movements.filter(m => m.id !== movementId);
      this.saveData(data);
      return true;
    }
    return false;
  }

  // Crear o editar producto (solo nombre único de categoría/producto, costo y stock en las 4 sedes)
  public static saveProduct(product: CommercialProduct): boolean {
    const data = this.getData();
    if (!product.stocks) {
      product.stocks = { republica: 0, modelo: 0, quality: 0, mariano: 0 };
    }
    const idx = data.products.findIndex(p => p.id === product.id);
    if (idx >= 0) {
      data.products[idx] = product;
    } else {
      data.products.unshift(product);
    }
    this.saveData(data);
    return true;
  }

  // Eliminar producto
  public static deleteProduct(productId: string): boolean {
    const data = this.getData();
    data.products = data.products.filter(p => p.id !== productId);
    this.saveData(data);
    return true;
  }

  // Actualizar stock de un producto para una sede específica
  public static updateStoreStock(productId: string, storeId: string, newStock: number): boolean {
    const data = this.getData();
    const prod = data.products.find(p => p.id === productId);
    if (!prod) return false;
    if (!prod.stocks) prod.stocks = { republica: 0, modelo: 0, quality: 0, mariano: 0 };
    prod.stocks[storeId] = Math.max(0, newStock);
    this.saveData(data);
    return true;
  }

  // Deudas y Cartera
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

  public static deleteDebt(debtId: string): boolean {
    const data = this.getData();
    data.debts = data.debts.filter(d => d.id !== debtId);
    this.saveData(data);
    return true;
  }

  public static addAbono(debtId: string, amount: number, dateStr: string, notes?: string): boolean {
    const data = this.getData();
    const debt = data.debts.find(d => d.id === debtId);
    if (!debt) return false;

    if (!debt.abonos) debt.abonos = [];
    debt.abonos.push({ dateStr, amount, notes });
    debt.totalAbonado += amount;
    debt.pendingBalance = Math.max(0, debt.totalInitial - debt.totalAbonado);
    if (debt.pendingBalance === 0) {
      debt.status = 'PAGADO';
    }

    this.saveData(data);
    return true;
  }

  // Gastos fijos
  public static saveExpense(expense: CommercialExpense): boolean {
    const data = this.getData();
    const idx = data.expenses.findIndex(e => e.id === expense.id);
    if (idx >= 0) {
      data.expenses[idx] = expense;
    } else {
      data.expenses.unshift(expense);
    }
    this.saveData(data);
    return true;
  }

  public static deleteExpense(expenseId: string): boolean {
    const data = this.getData();
    data.expenses = data.expenses.filter(e => e.id !== expenseId);
    this.saveData(data);
    return true;
  }

  public static toggleExpenseMonth(expenseId: string, monthIndex: number): boolean {
    const data = this.getData();
    const expense = data.expenses.find(e => e.id === expenseId);
    if (!expense) return false;

    if (!expense.statusByMonth) expense.statusByMonth = {};
    const curr = expense.statusByMonth[monthIndex] || 'PENDIENTE';
    expense.statusByMonth[monthIndex] = curr === 'PAGADO' ? 'PENDIENTE' : 'PAGADO';
    this.saveData(data);
    return true;
  }

  // Reiniciar datos a limpio
  public static resetData(): void {
    const initial = {
      products: INITIAL_PRODUCTS,
      cuadres: [],
      movements: [],
      expenses: INITIAL_EXPENSES,
      debts: INITIAL_DEBTS
    };
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(initial));
    } catch (e) {}
  }
}
