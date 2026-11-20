// Service for Control Comercial (Ventas, Finanzas, Inventario, Costos y Cuadres)
export interface CommercialProduct {
  id: string;
  name: string;
  category: string;
  costPrice: number;
  sellingPrice: number;
  stocks: { [storeKey: string]: number }; // republica | modelo | quality | mariano
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

// Catálogo base con 4 inventarios independientes por sede (del Excel del negocio)
const INITIAL_PRODUCTS: CommercialProduct[] = [
  { id: 'p1', name: 'CAMISAS ALTA GAMA', category: 'Camisas', costPrice: 40000, sellingPrice: 70000, stocks: { republica: 45, modelo: 38, quality: 50, mariano: 42 } },
  { id: 'p2', name: 'CAMISAS FB', category: 'Camisas', costPrice: 25000, sellingPrice: 55000, stocks: { republica: 16, modelo: 11, quality: 20, mariano: 22 } },
  { id: 'p3', name: 'JEANS', category: 'Pantalones', costPrice: 100000, sellingPrice: 140000, stocks: { republica: 18, modelo: 18, quality: 20, mariano: 20 } },
  { id: 'p4', name: 'PETOS', category: 'Camisetas', costPrice: 35000, sellingPrice: 65000, stocks: { republica: 27, modelo: 24, quality: 30, mariano: 28 } },
  { id: 'p5', name: 'PANTALONETA NBA', category: 'Pantalonetas', costPrice: 33000, sellingPrice: 65000, stocks: { republica: 21, modelo: 19, quality: 25, mariano: 22 } },
  { id: 'p6', name: 'PANTALONETA 1.1', category: 'Pantalonetas', costPrice: 32000, sellingPrice: 60000, stocks: { republica: 24, modelo: 20, quality: 28, mariano: 25 } },
  { id: 'p7', name: 'ESQUELETO FB', category: 'Camisetas', costPrice: 30000, sellingPrice: 55000, stocks: { republica: 18, modelo: 15, quality: 22, mariano: 19 } },
  { id: 'p8', name: 'ZAPATILLAS / TENIS', category: 'Calzado', costPrice: 80000, sellingPrice: 150000, stocks: { republica: 16, modelo: 14, quality: 18, mariano: 15 } },
  { id: 'p9', name: 'GORRAS', category: 'Accesorios', costPrice: 25000, sellingPrice: 50000, stocks: { republica: 40, modelo: 35, quality: 45, mariano: 38 } },
  { id: 'p10', name: 'MEDIAS (CAJA)', category: 'Accesorios', costPrice: 15000, sellingPrice: 30000, stocks: { republica: 60, modelo: 55, quality: 70, mariano: 65 } },
  { id: 'p11', name: 'MOCHOS', category: 'Pantalones', costPrice: 95000, sellingPrice: 135000, stocks: { republica: 14, modelo: 12, quality: 16, mariano: 15 } },
  { id: 'p12', name: 'PAVAS', category: 'Accesorios', costPrice: 25000, sellingPrice: 45000, stocks: { republica: 33, modelo: 28, quality: 35, mariano: 30 } },
  { id: 'p13', name: 'CONJUNTO IMPERMEABLE', category: 'Conjuntos', costPrice: 110000, sellingPrice: 160000, stocks: { republica: 12, modelo: 10, quality: 15, mariano: 12 } },
  { id: 'p14', name: 'BUZO 1.1', category: 'Buzos', costPrice: 65000, sellingPrice: 100000, stocks: { republica: 20, modelo: 18, quality: 22, mariano: 20 } },
  { id: 'p15', name: 'SUDADERA', category: 'Pantalones', costPrice: 55000, sellingPrice: 85000, stocks: { republica: 15, modelo: 14, quality: 18, mariano: 16 } }
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
  private static STORAGE_KEY = 'juand_commercial_system_v3';

  // Get all commercial master data
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
        // Ensure products have stocks for all 4 stores
        if (parsed.products && Array.isArray(parsed.products)) {
          parsed.products.forEach((p: CommercialProduct) => {
            if (!p.stocks) p.stocks = { republica: 0, modelo: 0, quality: 0, mariano: 0 };
            STORES_LIST.forEach(s => {
              if (typeof p.stocks[s.id] !== 'number') p.stocks[s.id] = 0;
            });
          });
        }
        return parsed;
      }
    } catch (e) {
      console.warn('Could not parse commercial storage, using clean initial data:', e);
    }

    // Clean initial state: Cuadres and movements start EMPTY so data is 100% dynamic based on user entry!
    const initial = {
      products: INITIAL_PRODUCTS,
      cuadres: [] as CommercialDailyCuadre[], // Totalmente dinámico: solo lo que el usuario ingrese
      movements: [] as CommercialMovement[], // Totalmente dinámico
      expenses: INITIAL_EXPENSES,
      debts: INITIAL_DEBTS
    };

    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(initial));
    } catch (e) {}

    return initial;
  }

  // Save full state
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

  // Guardar Cierre de Ventas diario con descuento automático de inventario de esa sede específica
  public static saveCuadre(newCuadre: CommercialDailyCuadre): boolean {
    const data = this.getData();
    const existingIndex = data.cuadres.findIndex(c => c.dateStr === newCuadre.dateStr && c.storeId === newCuadre.storeId);

    // Si ya existía un cuadre para esa sede y fecha, primero revertimos las cantidades previas de su inventario
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

    // Descontar del inventario de la sede del nuevo cuadre
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

  // Eliminar un cuadre con opción de revertir el stock a la sede
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
          // Entrada a la sede especificada
          prod.stocks[movement.storeId] = (prod.stocks[movement.storeId] || 0) + item.quantity;
        } else if (movement.type === 'SALIDA') {
          // Salida de la sede especificada
          prod.stocks[movement.storeId] = Math.max(0, (prod.stocks[movement.storeId] || 0) - item.quantity);
        } else if (movement.type === 'TRASLADO' && movement.targetStoreId) {
          // Traslado: Descuenta en origen y suma en destino
          prod.stocks[movement.storeId] = Math.max(0, (prod.stocks[movement.storeId] || 0) - item.quantity);
          prod.stocks[movement.targetStoreId] = (prod.stocks[movement.targetStoreId] || 0) + item.quantity;
        }
      }
    });

    data.movements.unshift(movement);
    this.saveData(data);
    return true;
  }

  // Eliminar un movimiento
  public static deleteMovement(movementId: string): boolean {
    const data = this.getData();
    data.movements = data.movements.filter(m => m.id !== movementId);
    this.saveData(data);
    return true;
  }

  // Crear o editar producto con sus 4 inventarios independientes
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

  // Reiniciar datos a limpio (por si el usuario desea empezar completamente desde cero)
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
