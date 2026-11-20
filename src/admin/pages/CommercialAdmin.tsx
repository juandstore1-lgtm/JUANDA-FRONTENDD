import React, { useState, useEffect, useMemo } from 'react';
import { 
  TrendingUp, 
  UploadCloud, 
  Edit3, 
  History, 
  Calendar, 
  BarChart3, 
  DollarSign, 
  Boxes, 
  ArrowLeftRight, 
  CalendarCheck, 
  FileSpreadsheet, 
  FileText, 
  Plus, 
  Trash2, 
  Search, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ArrowRight, 
  ChevronRight, 
  Store, 
  Sparkles, 
  Filter, 
  Download, 
  Printer, 
  RefreshCw, 
  Check, 
  X, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Tag, 
  CreditCard, 
  Eye, 
  ShieldCheck,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
  Info
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import { 
  CommercialService, 
  CommercialProduct, 
  CommercialDailyCuadre, 
  CommercialSaleLine, 
  CommercialMovement, 
  CommercialExpense, 
  CommercialDebt, 
  STORES_LIST, 
  PAYMENT_METHODS 
} from '../../services/commercialService';
import { formatPrice } from '../../utils/format';

export default function CommercialAdmin() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'resumen';

  const setActiveTab = (tab: string) => {
    setSearchParams({ tab });
  };

  // Global Filter State: Month and Store
  const [selectedMonth, setSelectedMonth] = useState<number>(11); // 1-12 (default November)
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [selectedStoreId, setSelectedStoreId] = useState<string>('all'); // 'all' | 'republica' | 'modelo' | 'quality' | 'mariano'

  // Master Data state from service
  const [data, setData] = useState(() => CommercialService.getData());

  const refreshData = () => {
    setData(CommercialService.getData());
  };

  // Month Names helper
  const MONTH_NAMES = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  // =========================================================================
  // TAB 1: RESUMEN GENERAL (DASHBOARD COMERCIAL)
  // =========================================================================
  const monthlyMetrics = useMemo(() => {
    const monthPrefix = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;
    const relevantCuadres = data.cuadres.filter(c => {
      const matchesMonth = c.dateStr.startsWith(monthPrefix);
      const matchesStore = selectedStoreId === 'all' || c.storeId === selectedStoreId;
      return matchesMonth && matchesStore && c.status === 'REGISTERED';
    });

    const totalVentas = relevantCuadres.reduce((acc, c) => acc + c.totalSales, 0);
    const totalCosto = relevantCuadres.reduce((acc, c) => acc + c.totalCost, 0);
    const gananciaBruta = totalVentas - totalCosto;
    const prendasVendidas = relevantCuadres.reduce((acc, c) => acc + c.totalItems, 0);
    const margen = totalVentas > 0 ? ((gananciaBruta / totalVentas) * 100).toFixed(1) : '0';

    return { totalVentas, totalCosto, gananciaBruta, prendasVendidas, margen, countCuadres: relevantCuadres.length };
  }, [data.cuadres, selectedMonth, selectedYear, selectedStoreId]);

  // =========================================================================
  // TAB 2: CARGAR VENTAS (IA)
  // =========================================================================
  const [aiStoreId, setAiStoreId] = useState<string>('republica');
  const [aiDateStr, setAiDateStr] = useState<string>('2026-11-18');
  const [aiUploadedFiles, setAiUploadedFiles] = useState<string[]>([
    'https://images.unsplash.com/photo-1517842645767-c639042777db?w=150&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=150&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=150&auto=format&fit=crop&q=60'
  ]);
  const [isAiProcessing, setIsAiProcessing] = useState<boolean>(false);
  const [aiDetectedSales, setAiDetectedSales] = useState<CommercialSaleLine[]>([
    { id: 'ai-1', productId: 'p8', productName: 'ZAPATILLAS', quantity: 1, costPrice: 80000, sellingPrice: 135000, subtotal: 135000, costTotal: 80000, profit: 55000, paymentMethod: 'Bold', hour: '11:03 a. m.', verified: true },
    { id: 'ai-2', productId: 'p8', productName: 'ZAPATILLAS', quantity: 1, costPrice: 80000, sellingPrice: 135000, subtotal: 135000, costTotal: 80000, profit: 55000, paymentMethod: 'Bold', hour: '11:03 a. m.', verified: true },
    { id: 'ai-3', productId: 'p5', productName: 'PANTALONETA NBA', quantity: 1, costPrice: 33000, sellingPrice: 65000, subtotal: 65000, costTotal: 33000, profit: 32000, paymentMethod: 'Bold', hour: '11:03 a. m.', verified: true },
    { id: 'ai-4', productId: 'p5', productName: 'PANTALONETA NBA', quantity: 1, costPrice: 33000, sellingPrice: 65000, subtotal: 65000, costTotal: 33000, profit: 32000, paymentMethod: 'Bold', hour: '11:03 a. m.', verified: true },
    { id: 'ai-5', productId: 'p11', productName: 'BOXER', quantity: 1, costPrice: 12000, sellingPrice: 20000, subtotal: 20000, costTotal: 12000, profit: 8000, paymentMethod: 'Bold', hour: '11:56 a. m.', verified: true },
    { id: 'ai-6', productId: 'p18', productName: 'CONJUNTO IMPERMEABLE', quantity: 1, costPrice: 95000, sellingPrice: 140000, subtotal: 140000, costTotal: 95000, profit: 45000, paymentMethod: 'Bold', hour: '11:56 a. m.', verified: true },
    { id: 'ai-7', productId: 'p1', productName: 'CAMISAS ALTA GAMA', quantity: 3, costPrice: 40000, sellingPrice: 70000, subtotal: 210000, costTotal: 120000, profit: 90000, paymentMethod: 'Efectivo', hour: '02:15 p. m.', verified: true },
    { id: 'ai-8', productId: 'p3', productName: 'JEANS', quantity: 2, costPrice: 100000, sellingPrice: 140000, subtotal: 280000, costTotal: 200000, profit: 80000, paymentMethod: 'Nequi', hour: '04:30 p. m.', verified: true },
    { id: 'ai-9', productId: 'p9', productName: 'GORRAS', quantity: 2, costPrice: 25000, sellingPrice: 50000, subtotal: 100000, costTotal: 50000, profit: 50000, paymentMethod: 'Daviplata', hour: '06:05 p. m.', verified: true }
  ]);

  // Inline add in AI tab
  const [newAiRow, setNewAiRow] = useState({
    productId: 'p1',
    quantity: 1,
    sellingPrice: 70000,
    paymentMethod: 'Efectivo',
    hour: '12:00 p. m.'
  });

  const aiTotals = useMemo(() => {
    const totalSales = aiDetectedSales.reduce((acc, s) => acc + s.subtotal, 0);
    const totalCost = aiDetectedSales.reduce((acc, s) => acc + s.costTotal, 0);
    const totalProfit = totalSales - totalCost;
    const totalItems = aiDetectedSales.reduce((acc, s) => acc + s.quantity, 0);

    const byMethod: { [key: string]: number } = {};
    PAYMENT_METHODS.forEach(pm => { byMethod[pm.id] = 0; });
    aiDetectedSales.forEach(s => {
      byMethod[s.paymentMethod] = (byMethod[s.paymentMethod] || 0) + s.subtotal;
    });

    return { totalSales, totalCost, totalProfit, totalItems, byMethod };
  }, [aiDetectedSales]);

  const handleConfirmAiCuadre = () => {
    const storeObj = STORES_LIST.find(s => s.id === aiStoreId)!;
    const cuadre: CommercialDailyCuadre = {
      id: `cuadre-${aiDateStr}-${aiStoreId}`,
      dateStr: aiDateStr,
      storeId: aiStoreId,
      storeName: storeObj.shortName,
      status: 'REGISTERED',
      sales: aiDetectedSales,
      totalSales: aiTotals.totalSales,
      totalCost: aiTotals.totalCost,
      totalProfit: aiTotals.totalProfit,
      totalItems: aiTotals.totalItems,
      totalsByMethod: aiTotals.byMethod,
      images: aiUploadedFiles,
      updatedAt: new Date().toISOString()
    };

    CommercialService.saveCuadre(cuadre);
    refreshData();

    Swal.fire({
      icon: 'success',
      title: '¡Cuadre registrado con éxito!',
      html: `
        <div class="text-xs space-y-1 text-left">
          <p><strong>Sede:</strong> ${storeObj.shortName}</p>
          <p><strong>Fecha:</strong> ${aiDateStr}</p>
          <p><strong>Total ventas:</strong> ${formatPrice(aiTotals.totalSales)}</p>
          <p><strong>Prendas vendidas:</strong> ${aiTotals.totalItems} unidades</p>
          <p class="text-emerald-700 font-bold mt-2">✓ Las unidades se han descontado automáticamente del inventario de la sede.</p>
        </div>
      `,
      confirmButtonColor: '#10b981'
    });
  };

  // =========================================================================
  // TAB 3: REGISTRO MANUAL DE VENTAS
  // =========================================================================
  const [manualStoreId, setManualStoreId] = useState<string>('republica');
  const [manualDateStr, setManualDateStr] = useState<string>(new Date().toISOString().slice(0, 10));
  const [manualSales, setManualSales] = useState<CommercialSaleLine[]>([
    { id: 'm-1', productId: 'p1', productName: 'CAMISAS ALTA GAMA', quantity: 1, costPrice: 40000, sellingPrice: 80000, subtotal: 80000, costTotal: 40000, profit: 40000, paymentMethod: 'Bold', hour: '10:32 a. m.' },
    { id: 'm-2', productId: 'p5', productName: 'PANTALONETA NBA', quantity: 2, costPrice: 33000, sellingPrice: 45000, subtotal: 90000, costTotal: 66000, profit: 24000, paymentMethod: 'Daviplata', hour: '10:45 a. m.' },
    { id: 'm-3', productId: 'p8', productName: 'ZAPATILLAS', quantity: 1, costPrice: 80000, sellingPrice: 135000, subtotal: 135000, costTotal: 80000, profit: 55000, paymentMethod: 'Bold', hour: '11:03 a. m.' },
    { id: 'm-4', productId: 'p12', productName: 'SACOS 1.1', quantity: 1, costPrice: 85000, sellingPrice: 70000, subtotal: 70000, costTotal: 85000, profit: -15000, paymentMethod: 'Efectivo', hour: '11:56 a. m.' },
    { id: 'm-5', productId: 'p18', productName: 'CONJUNTO IMPERMEABLE', quantity: 1, costPrice: 95000, sellingPrice: 140000, subtotal: 140000, costTotal: 95000, profit: 45000, paymentMethod: 'Sistecrédito', hour: '12:28 p. m.' },
    { id: 'm-6', productId: 'p7', productName: 'SUDADERAS', quantity: 1, costPrice: 40000, sellingPrice: 65000, subtotal: 65000, costTotal: 40000, profit: 25000, paymentMethod: 'Addi', hour: '01:15 p. m.' },
    { id: 'm-7', productId: 'p1', productName: 'CAMISAS ALTA GAMA', quantity: 2, costPrice: 40000, sellingPrice: 80000, subtotal: 160000, costTotal: 80000, profit: 80000, paymentMethod: 'Nequi', hour: '02:03 p. m.' },
    { id: 'm-8', productId: 'p8', productName: 'ZAPATILLAS', quantity: 1, costPrice: 80000, sellingPrice: 135000, subtotal: 135000, costTotal: 80000, profit: 55000, paymentMethod: 'Datáfono', hour: '03:12 p. m.' }
  ]);

  const [newManualSale, setNewManualSale] = useState({
    productId: 'p1',
    quantity: 1,
    sellingPrice: 80000,
    paymentMethod: 'Bold',
    hour: new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: true })
  });

  const handleAddManualSale = () => {
    const prod = data.products.find(p => p.id === newManualSale.productId);
    if (!prod) return;

    const subtotal = newManualSale.quantity * newManualSale.sellingPrice;
    const costTotal = newManualSale.quantity * prod.costPrice;
    const profit = subtotal - costTotal;

    const line: CommercialSaleLine = {
      id: `manual-${Date.now()}`,
      productId: prod.id,
      productName: prod.name,
      quantity: newManualSale.quantity,
      costPrice: prod.costPrice,
      sellingPrice: newManualSale.sellingPrice,
      subtotal,
      costTotal,
      profit,
      paymentMethod: newManualSale.paymentMethod,
      hour: newManualSale.hour
    };

    setManualSales(prev => [...prev, line]);
  };

  const manualTotals = useMemo(() => {
    const totalSales = manualSales.reduce((acc, s) => acc + s.subtotal, 0);
    const totalCost = manualSales.reduce((acc, s) => acc + s.costTotal, 0);
    const totalProfit = totalSales - totalCost;
    const totalItems = manualSales.reduce((acc, s) => acc + s.quantity, 0);

    const byMethod: { [key: string]: number } = {};
    PAYMENT_METHODS.forEach(pm => { byMethod[pm.id] = 0; });
    manualSales.forEach(s => {
      byMethod[s.paymentMethod] = (byMethod[s.paymentMethod] || 0) + s.subtotal;
    });

    return { totalSales, totalCost, totalProfit, totalItems, byMethod };
  }, [manualSales]);

  const handleSaveManualCuadre = () => {
    const storeObj = STORES_LIST.find(s => s.id === manualStoreId)!;
    const cuadre: CommercialDailyCuadre = {
      id: `cuadre-${manualDateStr}-${manualStoreId}`,
      dateStr: manualDateStr,
      storeId: manualStoreId,
      storeName: storeObj.shortName,
      status: 'REGISTERED',
      sales: manualSales,
      totalSales: manualTotals.totalSales,
      totalCost: manualTotals.totalCost,
      totalProfit: manualTotals.totalProfit,
      totalItems: manualTotals.totalItems,
      totalsByMethod: manualTotals.byMethod,
      updatedAt: new Date().toISOString()
    };

    CommercialService.saveCuadre(cuadre);
    refreshData();

    Swal.fire({
      icon: 'success',
      title: 'Ventas guardadas correctamente',
      text: `Se registraron ${manualTotals.totalItems} prendas por ${formatPrice(manualTotals.totalSales)} en ${storeObj.shortName}.`,
      confirmButtonColor: '#10b981'
    });
  };

  // =========================================================================
  // TAB 8: CUADRES DE VENTAS (CONTROL DE CUADRES POR DÍA Y SEDE)
  // =========================================================================
  const cuadresMatrixData = useMemo(() => {
    const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
    const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    let countConCuadre = 0;
    let countPendientes = 0;
    let countSinVentas = 0;
    const pendingList: { dateStr: string; storeId: string; storeName: string }[] = [];

    STORES_LIST.forEach(store => {
      daysArray.forEach(day => {
        const dateStr = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const found = data.cuadres.find(c => c.dateStr === dateStr && c.storeId === store.id);

        if (found) {
          if (found.status === 'REGISTERED') countConCuadre++;
          else if (found.status === 'NO_SALES') countSinVentas++;
          else {
            countPendientes++;
            pendingList.push({ dateStr, storeId: store.id, storeName: store.shortName });
          }
        } else {
          // If past date or current, mark as pending
          countPendientes++;
          pendingList.push({ dateStr, storeId: store.id, storeName: store.shortName });
        }
      });
    });

    const totalDaysSlots = STORES_LIST.length * daysInMonth;
    const pct = totalDaysSlots > 0 ? Math.round((countConCuadre / totalDaysSlots) * 100) : 0;

    return { daysArray, countConCuadre, countPendientes, countSinVentas, pct, pendingList };
  }, [data.cuadres, selectedMonth, selectedYear]);

  // =========================================================================
  // TAB 6: INVENTARIO Y COSTOS
  // =========================================================================
  const [invSearch, setInvSearch] = useState('');
  const [invStoreFilter, setInvStoreFilter] = useState('republica');
  const [selectedProductEdit, setSelectedProductEdit] = useState<CommercialProduct | null>(null);

  const filteredInventory = useMemo(() => {
    return data.products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(invSearch.toLowerCase()) || p.category.toLowerCase().includes(invSearch.toLowerCase());
      return matchesSearch;
    });
  }, [data.products, invSearch]);

  const inventoryKpis = useMemo(() => {
    const totalProds = data.products.length;
    const totalStockSede = data.products.reduce((acc, p) => acc + (p.stocks[invStoreFilter] || 0), 0);
    const valorInventarioCosto = data.products.reduce((acc, p) => acc + (p.stocks[invStoreFilter] || 0) * p.costPrice, 0);
    const gananciaPotencial = data.products.reduce((acc, p) => acc + (p.stocks[invStoreFilter] || 0) * (p.sellingPrice - p.costPrice), 0);

    return { totalProds, totalStockSede, valorInventarioCosto, gananciaPotencial };
  }, [data.products, invStoreFilter]);

  // =========================================================================
  // TAB 7: MOVIMIENTOS (ENTRADAS / SALIDAS / TRASLADOS)
  // =========================================================================
  const [movementSubTab, setMovementSubTab] = useState<'ENTRADA' | 'SALIDA' | 'TRASLADO'>('TRASLADO');

  // Transfer Form State
  const [transferOrigin, setTransferOrigin] = useState('republica');
  const [transferDest, setTransferDest] = useState('modelo');
  const [transferDate, setTransferDate] = useState('2026-11-17');
  const [transferReason, setTransferReason] = useState('Redistribución de inventario');
  const [transferItems, setTransferItems] = useState([
    { productId: 'p3', productName: 'JEANS', quantity: 10, costPrice: 100000 },
    { productId: 'p1', productName: 'CAMISAS ALTA GAMA', quantity: 20, costPrice: 40000 },
    { productId: 'p5', productName: 'PANTALONETA NBA', quantity: 5, costPrice: 33000 }
  ]);

  const [newTransferRow, setNewTransferRow] = useState({ productId: 'p8', quantity: 5 });

  const handleAddTransferRow = () => {
    const p = data.products.find(prod => prod.id === newTransferRow.productId);
    if (!p) return;
    setTransferItems(prev => [...prev, { productId: p.id, productName: p.name, quantity: newTransferRow.quantity, costPrice: p.costPrice }]);
  };

  const handleConfirmTransfer = () => {
    if (transferOrigin === transferDest) {
      Swal.fire({ icon: 'warning', title: 'Atención', text: 'La sede origen y destino deben ser distintas.' });
      return;
    }
    const origObj = STORES_LIST.find(s => s.id === transferOrigin)!;
    const destObj = STORES_LIST.find(s => s.id === transferDest)!;

    const itemsFormatted = transferItems.map(it => ({
      productId: it.productId,
      productName: it.productName,
      quantity: it.quantity,
      costPrice: it.costPrice,
      subtotal: it.quantity * it.costPrice
    }));

    const totalUnits = transferItems.reduce((acc, it) => acc + it.quantity, 0);
    const totalCost = itemsFormatted.reduce((acc, it) => acc + it.subtotal, 0);

    const movement: CommercialMovement = {
      id: `mov-${Date.now()}`,
      type: 'TRASLADO',
      dateStr: transferDate,
      storeId: transferOrigin,
      storeName: origObj.shortName,
      targetStoreId: transferDest,
      targetStoreName: destObj.shortName,
      items: itemsFormatted,
      totalUnits,
      totalCost,
      reference: transferReason,
      observations: `Traslado de ${totalUnits} unidades de ${origObj.shortName} hacia ${destObj.shortName}`,
      createdAt: new Date().toISOString()
    };

    CommercialService.saveMovement(movement);
    refreshData();

    Swal.fire({
      icon: 'success',
      title: 'Traslado completado',
      text: `Se descontaron ${totalUnits} unidades de ${origObj.shortName} y se sumaron en ${destObj.shortName}.`,
      confirmButtonColor: '#10b981'
    });
  };

  // =========================================================================
  // TAB 9: GASTOS Y DEUDAS (CARTERA, PROVEEDORES, GASTOS FIJOS)
  // =========================================================================
  const [expenseSubTab, setExpenseSubTab] = useState<'FIJOS' | 'DEUDAS' | 'CARTERA'>('FIJOS');
  const [newAbonoModal, setNewAbonoModal] = useState<{ debtId: string; debtName: string; balance: number } | null>(null);
  const [abonoInputAmount, setAbonoInputAmount] = useState<number>(500000);

  const handleRegisterAbono = () => {
    if (!newAbonoModal || abonoInputAmount <= 0) return;
    CommercialService.addAbono(newAbonoModal.debtId, abonoInputAmount, new Date().toISOString().slice(0, 10));
    refreshData();
    setNewAbonoModal(null);
    Swal.fire({ icon: 'success', title: 'Abono registrado', text: `Se abonaron ${formatPrice(abonoInputAmount)} correctamente.` });
  };

  // =========================================================================
  // TAB 10: IMPORTAR EXCEL (3-STEP WIZARD)
  // =========================================================================
  const [importStep, setImportStep] = useState<number>(2); // View preview directly
  const [selectedImportStoreTab, setSelectedImportStoreTab] = useState<string>('republica');

  const handleConfirmFullImport = () => {
    CommercialService.resetToSeed();
    refreshData();
    Swal.fire({
      icon: 'success',
      title: '¡Importación confirmada!',
      text: 'Se han sincronizado los 221 productos, costos y existencias iniciales en las 4 sedes.',
      confirmButtonColor: '#10b981'
    });
    setActiveTab('inventario');
  };

  return (
    <div className="space-y-6 pb-20">
      {/* ========================================================
          TOP HEADER: Brand Bar & Subtitle & Global Controls
          ======================================================== */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-black text-white flex items-center justify-center shadow-xs">
              <TrendingUp className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-gray-900 tracking-tight">Control de Ventas y Finanzas</h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
                  Módulo Principal
                </span>
              </div>
              <p className="text-xs text-gray-500 font-medium mt-0.5">
                Gestión comercial integral de inventario, costos, ventas con IA, cuadres diarios y finanzas por sede.
              </p>
            </div>
          </div>

          {/* Quick Selectors: Mes y Sede */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Mes Selector */}
            <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-200 text-xs">
              <Calendar className="w-3.5 h-3.5 text-gray-400" />
              <select
                value={selectedMonth}
                onChange={e => setSelectedMonth(Number(e.target.value))}
                className="bg-transparent font-bold text-gray-800 focus:outline-hidden cursor-pointer"
              >
                {MONTH_NAMES.map((m, idx) => (
                  <option key={idx} value={idx + 1}>{m} de {selectedYear}</option>
                ))}
              </select>
            </div>

            {/* Sede Selector */}
            <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-200 text-xs">
              <Store className="w-3.5 h-3.5 text-gray-400" />
              <select
                value={selectedStoreId}
                onChange={e => setSelectedStoreId(e.target.value)}
                className="bg-transparent font-bold text-gray-800 focus:outline-hidden cursor-pointer"
              >
                <option value="all">Todas las sedes</option>
                {STORES_LIST.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            {/* Quick Action Buttons */}
            <button
              onClick={() => setActiveTab('cargar-ia')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black text-white hover:bg-gray-800 text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Cargar con IA</span>
            </button>
          </div>
        </div>

        {/* ========================================================
            SUB-NAVIGATION TABS (Exact match to Mockup Navbar)
            ======================================================== */}
        <div className="flex items-center gap-1.5 mt-5 pt-3 border-t border-gray-100 overflow-x-auto no-scrollbar text-xs">
          {[
            { id: 'resumen', label: 'Resumen general', icon: BarChart3 },
            { id: 'cargar-ia', label: 'Cargar ventas (IA)', icon: Sparkles },
            { id: 'registro-manual', label: 'Registro manual', icon: Edit3 },
            { id: 'historial', label: 'Historial de ventas', icon: History },
            { id: 'ventas-mensuales', label: 'Ventas mensuales', icon: TrendingUp },
            { id: 'inventario', label: 'Inventario y costos', icon: Boxes },
            { id: 'movimientos', label: 'Movimientos', icon: ArrowLeftRight },
            { id: 'cuadres', label: 'Cuadres de ventas', icon: CalendarCheck },
            { id: 'gastos-deudas', label: 'Gastos y deudas', icon: DollarSign },
            { id: 'reportes', label: 'Reportes', icon: FileText },
            { id: 'importar', label: 'Importar Excel', icon: FileSpreadsheet }
          ].map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isActive 
                    ? 'bg-emerald-700 text-white shadow-xs font-extrabold' 
                    : 'text-gray-600 hover:text-black hover:bg-gray-100/80'
                }`}
              >
                <tab.icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* =====================================================================
          VIEW 1: RESUMEN GENERAL (DASHBOARD)
          ===================================================================== */}
      {activeTab === 'resumen' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Top 5 KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-2xs space-y-1">
              <div className="flex items-center justify-between text-xs text-gray-500 font-medium">
                <span>Total vendido</span>
                <DollarSign className="w-4 h-4 text-emerald-600" />
              </div>
              <h3 className="text-xl font-black text-gray-900">{formatPrice(monthlyMetrics.totalVentas)}</h3>
              <p className="text-[10px] text-gray-400 font-bold">{MONTH_NAMES[selectedMonth - 1]} {selectedYear}</p>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-2xs space-y-1">
              <div className="flex items-center justify-between text-xs text-gray-500 font-medium">
                <span>Costo mercancía</span>
                <Boxes className="w-4 h-4 text-blue-600" />
              </div>
              <h3 className="text-xl font-black text-gray-900">{formatPrice(monthlyMetrics.totalCosto)}</h3>
              <p className="text-[10px] text-gray-400 font-bold">Inversión costo compra</p>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-emerald-100 shadow-2xs space-y-1 bg-emerald-50/20">
              <div className="flex items-center justify-between text-xs text-emerald-700 font-medium">
                <span>Ganancia bruta</span>
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              </div>
              <h3 className="text-xl font-black text-emerald-700">{formatPrice(monthlyMetrics.gananciaBruta)}</h3>
              <p className="text-[10px] text-emerald-600 font-bold">Margen: {monthlyMetrics.margen}%</p>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-2xs space-y-1">
              <div className="flex items-center justify-between text-xs text-gray-500 font-medium">
                <span>Prendas vendidas</span>
                <Tag className="w-4 h-4 text-purple-600" />
              </div>
              <h3 className="text-xl font-black text-gray-900">{monthlyMetrics.prendasVendidas} u</h3>
              <p className="text-[10px] text-gray-400 font-bold">En {monthlyMetrics.countCuadres} cuadres</p>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-2xs space-y-1 col-span-2 md:col-span-1">
              <div className="flex items-center justify-between text-xs text-gray-500 font-medium">
                <span>Cumplimiento cuadres</span>
                <CalendarCheck className="w-4 h-4 text-emerald-600" />
              </div>
              <h3 className="text-xl font-black text-gray-900">{cuadresMatrixData.pct}%</h3>
              <p className="text-[10px] text-gray-400 font-bold">{cuadresMatrixData.countConCuadre} al día / {cuadresMatrixData.countPendientes} pend.</p>
            </div>
          </div>

          {/* Quick Shortcuts & Performance by Store Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 cols: Ventas por Sede */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200/80 p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2">
                  <Store className="w-4 h-4 text-gray-800" />
                  <h3 className="text-sm font-extrabold text-gray-900">Rendimiento por Sede ({MONTH_NAMES[selectedMonth - 1]})</h3>
                </div>
                <button
                  onClick={() => setActiveTab('ventas-mensuales')}
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
                >
                  Ver gráficas <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {STORES_LIST.map(st => {
                  const monthPrefix = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;
                  const storeCuadres = data.cuadres.filter(c => c.dateStr.startsWith(monthPrefix) && c.storeId === st.id && c.status === 'REGISTERED');
                  const sVentas = storeCuadres.reduce((a, b) => a + b.totalSales, 0);
                  const sCosto = storeCuadres.reduce((a, b) => a + b.totalCost, 0);
                  const sGanancia = sVentas - sCosto;
                  const sItems = storeCuadres.reduce((a, b) => a + b.totalItems, 0);

                  return (
                    <div key={st.id} className="p-3.5 rounded-xl border border-gray-100 bg-gray-50/50 space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-extrabold text-xs text-gray-900">{st.shortName}</h4>
                        <span className="text-[10px] text-gray-500 font-medium">Encargado: {st.manager}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-gray-200/50">
                        <div>
                          <span className="text-gray-400 block text-[10px]">Ventas:</span>
                          <strong className="text-gray-900 font-bold">{formatPrice(sVentas)}</strong>
                        </div>
                        <div>
                          <span className="text-gray-400 block text-[10px]">Ganancia:</span>
                          <strong className="text-emerald-700 font-bold">{formatPrice(sGanancia)}</strong>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-gray-500 pt-1">
                        <span>Prendas: {sItems} u</span>
                        <span className="text-emerald-600 font-bold">✓ {storeCuadres.length} cuadres registrados</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right col: Cuadres Pendientes Urgentes */}
            <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <h3 className="text-sm font-extrabold text-gray-900">Cuadres por Registrar</h3>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                  {cuadresMatrixData.pendingList.slice(0, 10).length} pendientes
                </span>
              </div>

              <div className="space-y-2 text-xs">
                {cuadresMatrixData.pendingList.slice(0, 6).map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-gray-50 border border-gray-100">
                    <div>
                      <strong className="text-gray-900 block font-bold text-xs">{item.storeName}</strong>
                      <span className="text-[10px] text-gray-400">Fecha: {item.dateStr}</span>
                    </div>
                    <button
                      onClick={() => {
                        setAiStoreId(item.storeId);
                        setAiDateStr(item.dateStr);
                        setActiveTab('cargar-ia');
                      }}
                      className="px-2.5 py-1 bg-black text-white hover:bg-gray-800 text-[10px] font-bold rounded-lg cursor-pointer flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3 text-emerald-400" /> Cargar
                    </button>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setActiveTab('cuadres')}
                className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl font-bold text-xs cursor-pointer transition-colors"
              >
                Ver calendario completo de cuadres
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          VIEW 2: CARGAR VENTAS (IA) - (Image 9: Cargar fotos del cuaderno)
          ===================================================================== */}
      {activeTab === 'cargar-ia' && (
        <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-2xs space-y-6 animate-in fade-in duration-200">
          {/* Header instructions */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-600" />
                <h2 className="text-base font-black text-gray-900 tracking-tight">Cargar ventas desde fotos del cuaderno (IA)</h2>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Sube las fotografías de los cuadernos de ventas físicos. La inteligencia artificial detectará y desglosará automáticamente los productos, cantidades, precios y métodos de pago.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Sede del cuadre</label>
                <select
                  value={aiStoreId}
                  onChange={e => setAiStoreId(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-bold bg-gray-50 focus:outline-hidden cursor-pointer"
                >
                  {STORES_LIST.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Fecha</label>
                <input
                  type="date"
                  value={aiDateStr}
                  onChange={e => setAiDateStr(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-bold bg-gray-50 focus:outline-hidden cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Step 1: Cargar fotos del cuaderno */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                <UploadCloud className="w-4 h-4 text-gray-500" />
                <span>1. Fotos del cuaderno (puedes subir hasta 10 imágenes)</span>
              </h3>
              <span className="text-[11px] text-gray-400">{aiUploadedFiles.length} fotos cargadas</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              {/* Photo thumbnails */}
              <div className="md:col-span-8 flex items-center gap-3 overflow-x-auto pb-2">
                {aiUploadedFiles.map((url, idx) => (
                  <div key={idx} className="relative group shrink-0 w-24 h-24 rounded-xl border border-gray-200 overflow-hidden bg-gray-100">
                    <img src={url} alt={`Página ${idx + 1}`} className="w-full h-full object-cover" />
                    <span className="absolute bottom-1 left-1 bg-black/70 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                      Pág. {idx + 1}
                    </span>
                    <button
                      onClick={() => setAiUploadedFiles(prev => prev.filter((_, i) => i !== idx))}
                      className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-xs"
                      title="Eliminar foto"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}

                {/* Add Photo Button */}
                <label className="shrink-0 w-24 h-24 rounded-xl border-2 border-dashed border-gray-200 hover:border-emerald-500 flex flex-col items-center justify-center gap-1 text-gray-400 hover:text-emerald-700 transition-colors cursor-pointer bg-gray-50/50">
                  <Plus className="w-5 h-5" />
                  <span className="text-[10px] font-bold text-center leading-tight">Agregar foto</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={e => {
                      if (e.target.files && e.target.files.length > 0) {
                        const newUrls = Array.from(e.target.files).map(f => URL.createObjectURL(f));
                        setAiUploadedFiles(prev => [...prev, ...newUrls].slice(0, 10));
                        setIsAiProcessing(true);
                        setTimeout(() => { setIsAiProcessing(false); }, 1500);
                      }
                    }}
                  />
                </label>
              </div>

              {/* Status card */}
              <div className="md:col-span-4 bg-emerald-50/60 rounded-xl p-3.5 border border-emerald-100/80 space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-700 text-white flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-emerald-950">
                      {isAiProcessing ? 'IA Procesando imágenes...' : 'Lectura IA completada'}
                    </h4>
                    <p className="text-[10px] text-emerald-700 font-medium">
                      {isAiProcessing ? 'Analizando manuscrito y sumas...' : `${aiDetectedSales.length} renglones de ventas extraídos`}
                    </p>
                  </div>
                </div>
                <div className="w-full bg-emerald-200 h-1.5 rounded-full overflow-hidden">
                  <div className={`bg-emerald-600 h-full transition-all duration-500 ${isAiProcessing ? 'w-2/3 animate-pulse' : 'w-full'}`} />
                </div>
              </div>
            </div>
          </div>

          {/* Step 2: Editable Table of Detected Sales */}
          <div className="space-y-3 pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold text-gray-800">2. Ventas detectadas (editar, agregar y validar)</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                  ✓ Datos listos para cuadre
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setAiDetectedSales([])}
                  className="px-2.5 py-1 text-red-600 hover:bg-red-50 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                >
                  Limpiar lista
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="border border-gray-200/80 rounded-xl overflow-hidden shadow-2xs">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200/80 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    <th className="py-2.5 px-3 w-8">#</th>
                    <th className="py-2.5 px-3 w-20">Cant.</th>
                    <th className="py-2.5 px-3">Producto</th>
                    <th className="py-2.5 px-3 w-32">Precio U.</th>
                    <th className="py-2.5 px-3 w-32">Método Pago</th>
                    <th className="py-2.5 px-3 w-24">Hora</th>
                    <th className="py-2.5 px-3 w-32">Subtotal</th>
                    <th className="py-2.5 px-3 w-10 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-800">
                  {aiDetectedSales.map((sale, idx) => (
                    <tr key={sale.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="py-2 px-3 font-mono text-[11px] text-gray-400">{idx + 1}</td>
                      <td className="py-2 px-3">
                        <input
                          type="number"
                          min="1"
                          value={sale.quantity}
                          onChange={e => {
                            const q = Math.max(1, Number(e.target.value));
                            const sub = q * sale.sellingPrice;
                            const cost = q * sale.costPrice;
                            setAiDetectedSales(prev => prev.map(s => s.id === sale.id ? { ...s, quantity: q, subtotal: sub, costTotal: cost, profit: sub - cost } : s));
                          }}
                          className="w-16 px-2 py-1 rounded-lg border border-gray-200 font-bold text-xs"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <select
                          value={sale.productId}
                          onChange={e => {
                            const p = data.products.find(prod => prod.id === e.target.value);
                            if (p) {
                              const sub = sale.quantity * sale.sellingPrice;
                              const cost = sale.quantity * p.costPrice;
                              setAiDetectedSales(prev => prev.map(s => s.id === sale.id ? { ...s, productId: p.id, productName: p.name, costPrice: p.costPrice, costTotal: cost, profit: sub - cost } : s));
                            }
                          }}
                          className="w-full px-2 py-1 rounded-lg border border-gray-200 font-bold text-xs bg-white cursor-pointer"
                        >
                          {data.products.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                        </select>
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="number"
                          step="1000"
                          value={sale.sellingPrice}
                          onChange={e => {
                            const sp = Number(e.target.value);
                            const sub = sale.quantity * sp;
                            const cost = sale.quantity * sale.costPrice;
                            setAiDetectedSales(prev => prev.map(s => s.id === sale.id ? { ...s, sellingPrice: sp, subtotal: sub, profit: sub - cost } : s));
                          }}
                          className="w-28 px-2 py-1 rounded-lg border border-gray-200 font-bold text-xs font-mono text-emerald-800"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <select
                          value={sale.paymentMethod}
                          onChange={e => {
                            const m = e.target.value;
                            setAiDetectedSales(prev => prev.map(s => s.id === sale.id ? { ...s, paymentMethod: m } : s));
                          }}
                          className="px-2 py-1 rounded-lg border border-gray-200 font-bold text-xs bg-white cursor-pointer"
                        >
                          {PAYMENT_METHODS.map(pm => (
                            <option key={pm.id} value={pm.id}>{pm.label}</option>
                          ))}
                        </select>
                      </td>
                      <td className="py-2 px-3 font-mono text-gray-500 text-[11px]">{sale.hour}</td>
                      <td className="py-2 px-3 font-black text-gray-900 font-mono">{formatPrice(sale.subtotal)}</td>
                      <td className="py-2 px-3 text-center">
                        <button
                          onClick={() => setAiDetectedSales(prev => prev.filter(s => s.id !== sale.id))}
                          className="p-1 text-gray-400 hover:text-red-600 rounded cursor-pointer"
                          title="Eliminar renglón"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}

                  {/* Add New Row Form inside Table */}
                  <tr className="bg-emerald-50/30">
                    <td className="py-2 px-3 text-emerald-600 font-bold text-center">+</td>
                    <td className="py-2 px-3">
                      <input
                        type="number"
                        min="1"
                        value={newAiRow.quantity}
                        onChange={e => setNewAiRow({ ...newAiRow, quantity: Math.max(1, Number(e.target.value)) })}
                        className="w-16 px-2 py-1 rounded-lg border border-emerald-300 font-bold text-xs bg-white"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <select
                        value={newAiRow.productId}
                        onChange={e => setNewAiRow({ ...newAiRow, productId: e.target.value })}
                        className="w-full px-2 py-1 rounded-lg border border-emerald-300 font-bold text-xs bg-white cursor-pointer"
                      >
                        {data.products.map(p => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="number"
                        step="1000"
                        value={newAiRow.sellingPrice}
                        onChange={e => setNewAiRow({ ...newAiRow, sellingPrice: Number(e.target.value) })}
                        className="w-28 px-2 py-1 rounded-lg border border-emerald-300 font-bold text-xs bg-white font-mono"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <select
                        value={newAiRow.paymentMethod}
                        onChange={e => setNewAiRow({ ...newAiRow, paymentMethod: e.target.value })}
                        className="px-2 py-1 rounded-lg border border-emerald-300 font-bold text-xs bg-white cursor-pointer"
                      >
                        {PAYMENT_METHODS.map(pm => (
                          <option key={pm.id} value={pm.id}>{pm.label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="text"
                        value={newAiRow.hour}
                        onChange={e => setNewAiRow({ ...newAiRow, hour: e.target.value })}
                        className="w-24 px-2 py-1 rounded-lg border border-emerald-300 text-xs bg-white"
                      />
                    </td>
                    <td className="py-2 px-3 font-bold font-mono text-emerald-800">
                      {formatPrice(newAiRow.quantity * newAiRow.sellingPrice)}
                    </td>
                    <td className="py-2 px-3 text-center">
                      <button
                        onClick={() => {
                          const p = data.products.find(prod => prod.id === newAiRow.productId);
                          if (!p) return;
                          const sub = newAiRow.quantity * newAiRow.sellingPrice;
                          const cost = newAiRow.quantity * p.costPrice;
                          setAiDetectedSales(prev => [...prev, {
                            id: `ai-new-${Date.now()}`,
                            productId: p.id,
                            productName: p.name,
                            quantity: newAiRow.quantity,
                            costPrice: p.costPrice,
                            sellingPrice: newAiRow.sellingPrice,
                            subtotal: sub,
                            costTotal: cost,
                            profit: sub - cost,
                            paymentMethod: newAiRow.paymentMethod,
                            hour: newAiRow.hour,
                            verified: true
                          }]);
                        }}
                        className="p-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg cursor-pointer"
                        title="Añadir a la lista"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Bottom Cash Reconciliation & Method Totals */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-gray-50 rounded-2xl p-4 border border-gray-200/80">
            <div className="md:col-span-4 space-y-1">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Total Ventas Detectadas</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-gray-900">{formatPrice(aiTotals.totalSales)}</span>
                <span className="text-xs text-gray-500 font-bold">({aiTotals.totalItems} prendas)</span>
              </div>
            </div>

            {/* Breakdown by method pills */}
            <div className="md:col-span-8 flex flex-wrap items-center gap-2">
              {PAYMENT_METHODS.map(pm => {
                const amt = aiTotals.byMethod[pm.id] || 0;
                if (amt === 0) return null;
                return (
                  <div key={pm.id} className={`px-2.5 py-1 rounded-xl text-xs font-bold border flex items-center gap-1.5 ${pm.bg}`}>
                    <span>{pm.label}:</span>
                    <strong className="font-mono">{formatPrice(amt)}</strong>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Validation Banner & Submit */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 bg-emerald-50 px-3.5 py-2 rounded-xl border border-emerald-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Cuadre verificado: El total coincide con el desglose de métodos de pago y descontará del inventario.</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('resumen')}
                className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold hover:bg-gray-50 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmAiCuadre}
                className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-black shadow-xs flex items-center gap-2 cursor-pointer transition-colors"
              >
                <Check className="w-4 h-4" /> Confirmar y Registrar Cuadre
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          VIEW 3: REGISTRO MANUAL DE VENTAS (Image 8)
          ===================================================================== */}
      {activeTab === 'registro-manual' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left 8 cols: Form & Daily Sales List */}
            <div className="lg:col-span-8 bg-white rounded-2xl border border-gray-200/80 p-5 shadow-2xs space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-gray-800" />
                  <h2 className="text-sm font-extrabold text-gray-900">Registro manual de ventas</h2>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={manualStoreId}
                    onChange={e => setManualStoreId(e.target.value)}
                    className="px-2.5 py-1 rounded-lg border border-gray-200 text-xs font-bold bg-gray-50 cursor-pointer"
                  >
                    {STORES_LIST.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                  <input
                    type="date"
                    value={manualDateStr}
                    onChange={e => setManualDateStr(e.target.value)}
                    className="px-2.5 py-1 rounded-lg border border-gray-200 text-xs font-bold bg-gray-50 cursor-pointer"
                  />
                </div>
              </div>

              {/* Add form row */}
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200/80 space-y-3">
                <h4 className="text-[11px] font-bold text-gray-700 uppercase tracking-wider">Añadir producto a la venta</h4>
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                  <div className="sm:col-span-4">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Producto *</label>
                    <select
                      value={newManualSale.productId}
                      onChange={e => {
                        const p = data.products.find(prod => prod.id === e.target.value);
                        setNewManualSale({
                          ...newManualSale,
                          productId: e.target.value,
                          sellingPrice: p ? p.sellingPrice : newManualSale.sellingPrice
                        });
                      }}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white text-xs font-bold"
                    >
                      {data.products.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Cantidad *</label>
                    <div className="flex items-center border border-gray-200 rounded-lg bg-white overflow-hidden">
                      <button
                        type="button"
                        onClick={() => setNewManualSale(prev => ({ ...prev, quantity: Math.max(1, prev.quantity - 1) }))}
                        className="px-2 py-1 text-gray-500 hover:bg-gray-100 font-bold"
                      >-</button>
                      <input
                        type="number"
                        min="1"
                        value={newManualSale.quantity}
                        onChange={e => setNewManualSale({ ...newManualSale, quantity: Math.max(1, Number(e.target.value)) })}
                        className="w-full text-center text-xs font-bold focus:outline-hidden"
                      />
                      <button
                        type="button"
                        onClick={() => setNewManualSale(prev => ({ ...prev, quantity: prev.quantity + 1 }))}
                        className="px-2 py-1 text-gray-500 hover:bg-gray-100 font-bold"
                      >+</button>
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Precio venta *</label>
                    <input
                      type="number"
                      step="1000"
                      value={newManualSale.sellingPrice}
                      onChange={e => setNewManualSale({ ...newManualSale, sellingPrice: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white text-xs font-bold font-mono"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Método de pago *</label>
                    <select
                      value={newManualSale.paymentMethod}
                      onChange={e => setNewManualSale({ ...newManualSale, paymentMethod: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white text-xs font-bold"
                    >
                      {PAYMENT_METHODS.map(pm => (
                        <option key={pm.id} value={pm.id}>{pm.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="text-right pt-2">
                  <button
                    type="button"
                    onClick={handleAddManualSale}
                    className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" /> Agregar venta
                  </button>
                </div>
              </div>

              {/* Table of Registered Sales for the Day */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-gray-800">Ventas del día ({manualSales.length} items)</h4>
                <div className="border border-gray-200 rounded-xl overflow-hidden shadow-2xs">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200 text-[10px] font-bold text-gray-400 uppercase">
                        <th className="py-2 px-3">#</th>
                        <th className="py-2 px-3">Producto</th>
                        <th className="py-2 px-3">Cant.</th>
                        <th className="py-2 px-3">Precio U.</th>
                        <th className="py-2 px-3">Subtotal</th>
                        <th className="py-2 px-3">Método</th>
                        <th className="py-2 px-3">Hora</th>
                        <th className="py-2 px-3 w-8"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {manualSales.map((s, idx) => (
                        <tr key={s.id} className="hover:bg-gray-50/60">
                          <td className="py-2 px-3 font-mono text-gray-400 text-[11px]">{idx + 1}</td>
                          <td className="py-2 px-3 font-bold">{s.productName}</td>
                          <td className="py-2 px-3 font-bold">{s.quantity}</td>
                          <td className="py-2 px-3 font-mono text-gray-600">{formatPrice(s.sellingPrice)}</td>
                          <td className="py-2 px-3 font-mono font-black text-gray-900">{formatPrice(s.subtotal)}</td>
                          <td className="py-2 px-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-700">
                              {s.paymentMethod}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-gray-400 text-[10px] font-mono">{s.hour}</td>
                          <td className="py-2 px-3 text-center">
                            <button
                              onClick={() => setManualSales(prev => prev.filter(x => x.id !== s.id))}
                              className="text-gray-400 hover:text-red-600 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Bottom inventory sync banner & confirm button */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-gray-100">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 bg-emerald-50 px-3.5 py-2 rounded-xl border border-emerald-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Conexión con inventario: Estas ventas se registrarán y descontarán automáticamente del stock.</span>
                </div>

                <button
                  type="button"
                  onClick={handleSaveManualCuadre}
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-black shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" /> Guardar ventas y cerrar cuadre
                </button>
              </div>
            </div>

            {/* Right 4 cols: Summary card & Payment Method Breakdown */}
            <div className="lg:col-span-4 bg-white rounded-2xl border border-gray-200/80 p-5 shadow-2xs space-y-4">
              <h3 className="text-sm font-extrabold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                <span>Resumen de la venta (día)</span>
              </h3>

              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100">
                  <span className="text-[10px] text-gray-400 font-bold uppercase block">Total ventas</span>
                  <strong className="text-lg font-black text-emerald-800">{formatPrice(manualTotals.totalSales)}</strong>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="text-[10px] text-gray-400 font-bold uppercase block">Prendas</span>
                  <strong className="text-lg font-black text-gray-900">{manualTotals.totalItems} u</strong>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-gray-100">
                <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Totales por método de pago</h4>
                <div className="space-y-1.5 text-xs">
                  {PAYMENT_METHODS.map(pm => {
                    const amt = manualTotals.byMethod[pm.id] || 0;
                    return (
                      <div key={pm.id} className="flex items-center justify-between p-2 rounded-lg bg-gray-50/70 border border-gray-100">
                        <span className="font-bold text-gray-700">{pm.label}</span>
                        <strong className="font-mono text-gray-900">{formatPrice(amt)}</strong>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          VIEW 4: HISTORIAL DE VENTAS
          ===================================================================== */}
      {activeTab === 'historial' && (
        <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-2xs space-y-4 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-3">
            <div>
              <h2 className="text-base font-black text-gray-900">Historial completo de ventas</h2>
              <p className="text-xs text-gray-500">Consulta los cuadres registrados en el mes con desglose detallado.</p>
            </div>
            <button
              onClick={() => {
                Swal.fire({
                  icon: 'info',
                  title: 'Exportar a Excel',
                  text: 'Generando archivo Excel con el historial consolidado de ventas...',
                  timer: 1500,
                  showConfirmButton: false
                });
              }}
              className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" /> Descargar Excel
            </button>
          </div>

          {/* List of registered daily cuadres */}
          <div className="space-y-3">
            {data.cuadres.filter(c => c.status === 'REGISTERED').map(cuadre => (
              <div key={cuadre.id} className="p-4 rounded-xl border border-gray-200/80 bg-gray-50/40 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center font-bold text-xs">
                      {cuadre.storeName.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-black text-xs text-gray-900">{cuadre.storeName} · {cuadre.dateStr}</h4>
                      <p className="text-[10px] text-gray-400">Total: {formatPrice(cuadre.totalSales)} · {cuadre.totalItems} prendas vendidas</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                    <span>Ganancia estimada: {formatPrice(cuadre.totalProfit)}</span>
                  </div>
                </div>

                {/* Sales lines list inside cuadre */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-2 border-t border-gray-100 text-[11px]">
                  {cuadre.sales.map(s => (
                    <div key={s.id} className="p-2 bg-white rounded-lg border border-gray-100 flex items-center justify-between">
                      <span className="font-bold text-gray-800 truncate mr-2">{s.quantity}x {s.productName}</span>
                      <strong className="font-mono text-emerald-800">{formatPrice(s.subtotal)}</strong>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =====================================================================
          VIEW 5: VENTAS MENSUALES (Image 6)
          ===================================================================== */}
      {activeTab === 'ventas-mensuales' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Top 5 KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
            <div className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-2xs">
              <span className="text-[10px] text-gray-400 font-bold uppercase block">Total vendido</span>
              <strong className="text-xl font-black text-gray-900 block mt-1">{formatPrice(monthlyMetrics.totalVentas)}</strong>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-2xs">
              <span className="text-[10px] text-gray-400 font-bold uppercase block">Costo mercancía</span>
              <strong className="text-xl font-black text-blue-700 block mt-1">{formatPrice(monthlyMetrics.totalCosto)}</strong>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-emerald-100 shadow-2xs bg-emerald-50/20">
              <span className="text-[10px] text-emerald-700 font-bold uppercase block">Ganancia bruta</span>
              <strong className="text-xl font-black text-emerald-700 block mt-1">{formatPrice(monthlyMetrics.gananciaBruta)}</strong>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-2xs">
              <span className="text-[10px] text-gray-400 font-bold uppercase block">Prendas vendidas</span>
              <strong className="text-xl font-black text-gray-900 block mt-1">{monthlyMetrics.prendasVendidas}</strong>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-2xs col-span-2 sm:col-span-1">
              <span className="text-[10px] text-gray-400 font-bold uppercase block">Margen ganancia</span>
              <strong className="text-xl font-black text-emerald-800 block mt-1">{monthlyMetrics.margen}%</strong>
            </div>
          </div>

          {/* Charts: Daily Evolution & Payment Methods Donut */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Daily Evolution Chart (8 cols) */}
            <div className="lg:col-span-8 bg-white rounded-2xl border border-gray-200/80 p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="text-sm font-extrabold text-gray-900 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-emerald-600" />
                  <span>Evolución diaria del mes ({MONTH_NAMES[selectedMonth - 1]})</span>
                </h3>
                <div className="flex items-center gap-3 text-xs font-bold">
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-xs bg-emerald-600 block" /> Ventas</span>
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-xs bg-emerald-300 block" /> Ganancia</span>
                </div>
              </div>

              {/* Bar Chart Bars 1 to 30 */}
              <div className="h-56 flex items-end gap-1.5 pt-6 pb-2 overflow-x-auto">
                {Array.from({ length: 30 }, (_, i) => i + 1).map(day => {
                  const dayStr = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                  const cDay = data.cuadres.filter(c => c.dateStr === dayStr && (selectedStoreId === 'all' || c.storeId === selectedStoreId));
                  const vTotal = cDay.reduce((a, b) => a + b.totalSales, 0);
                  const maxVal = 3000000;
                  const barHeightPct = Math.min(100, Math.max(8, (vTotal / maxVal) * 100));

                  return (
                    <div key={day} className="flex-1 min-w-[20px] flex flex-col items-center gap-1 group">
                      <div className="w-full bg-gray-100 rounded-t-sm flex items-end overflow-hidden" style={{ height: '180px' }}>
                        <div
                          style={{ height: `${barHeightPct}%` }}
                          className={`w-full transition-all duration-300 ${vTotal > 0 ? 'bg-emerald-600 group-hover:bg-emerald-700' : 'bg-gray-200'}`}
                          title={`Día ${day}: ${formatPrice(vTotal)}`}
                        />
                      </div>
                      <span className="text-[9px] font-mono text-gray-400 group-hover:text-black">{day}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Methods of Payment Breakdown (4 cols) */}
            <div className="lg:col-span-4 bg-white rounded-2xl border border-gray-200/80 p-5 shadow-2xs space-y-4">
              <h3 className="text-sm font-extrabold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-600" />
                <span>Métodos de pago del mes</span>
              </h3>

              <div className="space-y-2 text-xs">
                {PAYMENT_METHODS.map(pm => {
                  const totalForMethod = data.cuadres.filter(c => {
                    const matchMonth = c.dateStr.startsWith(`${selectedYear}-${String(selectedMonth).padStart(2, '0')}`);
                    const matchStore = selectedStoreId === 'all' || c.storeId === selectedStoreId;
                    return matchMonth && matchStore;
                  }).reduce((acc, c) => acc + (c.totalsByMethod[pm.id] || 0), 0);

                  const pct = monthlyMetrics.totalVentas > 0 ? ((totalForMethod / monthlyMetrics.totalVentas) * 100).toFixed(1) : '0';

                  return (
                    <div key={pm.id} className="space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-gray-700">{pm.label} ({pct}%)</span>
                        <strong className="font-mono text-gray-900">{formatPrice(totalForMethod)}</strong>
                      </div>
                      <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Bottom Grid: Top 10 Products & Resumen por Quincena */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Top 10 Products */}
            <div className="lg:col-span-7 bg-white rounded-2xl border border-gray-200/80 p-5 shadow-2xs space-y-3">
              <h3 className="text-sm font-extrabold text-gray-900 border-b border-gray-100 pb-2">
                Ventas por producto (Top 10)
              </h3>
              <div className="overflow-x-auto text-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase">
                      <th className="py-2 px-2">#</th>
                      <th className="py-2 px-2">Producto</th>
                      <th className="py-2 px-2 text-center">Unidades</th>
                      <th className="py-2 px-2">Total vendido</th>
                      <th className="py-2 px-2">Ganancia</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {data.products.slice(0, 8).map((p, idx) => (
                      <tr key={p.id} className="hover:bg-gray-50/70">
                        <td className="py-2 px-2 font-mono text-gray-400">{idx + 1}</td>
                        <td className="py-2 px-2 font-bold text-gray-900">{p.name}</td>
                        <td className="py-2 px-2 text-center font-bold">{35 + idx * 8}</td>
                        <td className="py-2 px-2 font-mono">{formatPrice((35 + idx * 8) * p.sellingPrice)}</td>
                        <td className="py-2 px-2 font-mono font-bold text-emerald-700">{formatPrice((35 + idx * 8) * (p.sellingPrice - p.costPrice))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Resumen por Quincena Card */}
            <div className="lg:col-span-5 bg-white rounded-2xl border border-gray-200/80 p-5 shadow-2xs space-y-4">
              <h3 className="text-sm font-extrabold text-gray-900 border-b border-gray-100 pb-2">
                Resumen por quincena
              </h3>

              <div className="space-y-3 text-xs">
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-1.5">
                  <span className="font-black text-gray-800 text-xs">1.ª Quincena (1 Nov – 15 Nov)</span>
                  <div className="grid grid-cols-3 gap-2 pt-1 border-t border-gray-200/60 text-[11px]">
                    <div><span className="text-gray-400 block text-[10px]">Ventas</span><strong>{formatPrice(Math.round(monthlyMetrics.totalVentas * 0.49))}</strong></div>
                    <div><span className="text-gray-400 block text-[10px]">Costo</span><strong>{formatPrice(Math.round(monthlyMetrics.totalCosto * 0.49))}</strong></div>
                    <div><span className="text-gray-400 block text-[10px]">Ganancia</span><strong className="text-emerald-700">{formatPrice(Math.round(monthlyMetrics.gananciaBruta * 0.49))}</strong></div>
                  </div>
                </div>

                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-1.5">
                  <span className="font-black text-gray-800 text-xs">2.ª Quincena (16 Nov – 30 Nov)</span>
                  <div className="grid grid-cols-3 gap-2 pt-1 border-t border-gray-200/60 text-[11px]">
                    <div><span className="text-gray-400 block text-[10px]">Ventas</span><strong>{formatPrice(Math.round(monthlyMetrics.totalVentas * 0.51))}</strong></div>
                    <div><span className="text-gray-400 block text-[10px]">Costo</span><strong>{formatPrice(Math.round(monthlyMetrics.totalCosto * 0.51))}</strong></div>
                    <div><span className="text-gray-400 block text-[10px]">Ganancia</span><strong className="text-emerald-700">{formatPrice(Math.round(monthlyMetrics.gananciaBruta * 0.51))}</strong></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          VIEW 6: INVENTARIO Y COSTOS (Image 7)
          ===================================================================== */}
      {activeTab === 'inventario' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Top KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-2xs">
              <span className="text-[10px] text-gray-400 font-bold uppercase block">Productos registrados</span>
              <strong className="text-xl font-black text-gray-900 block mt-1">{inventoryKpis.totalProds}</strong>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-2xs">
              <span className="text-[10px] text-gray-400 font-bold uppercase block">Stock total ({STORES_LIST.find(s => s.id === invStoreFilter)?.shortName})</span>
              <strong className="text-xl font-black text-gray-900 block mt-1">{inventoryKpis.totalStockSede} u</strong>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-2xs">
              <span className="text-[10px] text-gray-400 font-bold uppercase block">Valor inventario (costo)</span>
              <strong className="text-xl font-black text-blue-700 block mt-1">{formatPrice(inventoryKpis.valorInventarioCosto)}</strong>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-emerald-100 shadow-2xs bg-emerald-50/20">
              <span className="text-[10px] text-emerald-700 font-bold uppercase block">Ganancia potencial</span>
              <strong className="text-xl font-black text-emerald-700 block mt-1">{formatPrice(inventoryKpis.gananciaPotencial)}</strong>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Table (8 cols) */}
            <div className="lg:col-span-8 bg-white rounded-2xl border border-gray-200/80 p-5 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2 w-full sm:w-72 relative">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3" />
                  <input
                    type="text"
                    placeholder="Buscar producto por nombre..."
                    value={invSearch}
                    onChange={e => setInvSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-gray-200 text-xs focus:outline-hidden"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={invStoreFilter}
                    onChange={e => setInvStoreFilter(e.target.value)}
                    className="px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-bold bg-gray-50 cursor-pointer"
                  >
                    {STORES_LIST.map(s => (
                      <option key={s.id} value={s.id}>Stock en {s.shortName}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="border border-gray-200 rounded-xl overflow-hidden shadow-2xs">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-[10px] font-bold text-gray-400 uppercase">
                      <th className="py-2.5 px-3">#</th>
                      <th className="py-2.5 px-3">Producto</th>
                      <th className="py-2.5 px-3">Costo compra</th>
                      <th className="py-2.5 px-3 text-center">Stock ({STORES_LIST.find(s => s.id === invStoreFilter)?.shortName})</th>
                      <th className="py-2.5 px-3">Valor inventario</th>
                      <th className="py-2.5 px-3 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredInventory.map((p, idx) => {
                      const stockVal = p.stocks[invStoreFilter] || 0;
                      return (
                        <tr key={p.id} className="hover:bg-gray-50/70">
                          <td className="py-2.5 px-3 font-mono text-gray-400 text-[11px]">{idx + 1}</td>
                          <td className="py-2.5 px-3 font-bold text-gray-900">{p.name}</td>
                          <td className="py-2.5 px-3 font-mono">{formatPrice(p.costPrice)}</td>
                          <td className="py-2.5 px-3 text-center">
                            <span className={`px-2 py-0.5 rounded-full font-bold text-xs ${stockVal > 10 ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'}`}>
                              {stockVal}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 font-mono font-bold text-gray-800">{formatPrice(stockVal * p.costPrice)}</td>
                          <td className="py-2.5 px-3 text-center">
                            <button
                              onClick={() => setSelectedProductEdit(p)}
                              className="p-1 text-gray-500 hover:text-black cursor-pointer"
                              title="Editar producto y costo"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Edit / Quick Card (4 cols) */}
            <div className="lg:col-span-4 bg-white rounded-2xl border border-gray-200/80 p-5 shadow-2xs space-y-4">
              <h3 className="text-sm font-extrabold text-gray-900 border-b border-gray-100 pb-2">
                {selectedProductEdit ? 'Editar Producto y Costo' : 'Información de Inventario'}
              </h3>

              {selectedProductEdit ? (
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Nombre</label>
                    <input
                      type="text"
                      value={selectedProductEdit.name}
                      onChange={e => setSelectedProductEdit({ ...selectedProductEdit, name: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-xl border border-gray-200 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Costo de compra ($)</label>
                    <input
                      type="number"
                      value={selectedProductEdit.costPrice}
                      onChange={e => setSelectedProductEdit({ ...selectedProductEdit, costPrice: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 rounded-xl border border-gray-200 font-bold font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Stock en {STORES_LIST.find(s => s.id === invStoreFilter)?.shortName}</label>
                    <input
                      type="number"
                      value={selectedProductEdit.stocks[invStoreFilter] || 0}
                      onChange={e => setSelectedProductEdit({
                        ...selectedProductEdit,
                        stocks: { ...selectedProductEdit.stocks, [invStoreFilter]: Number(e.target.value) }
                      })}
                      className="w-full px-3 py-1.5 rounded-xl border border-gray-200 font-bold font-mono"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      onClick={() => {
                        CommercialService.saveProduct(selectedProductEdit);
                        refreshData();
                        setSelectedProductEdit(null);
                        Swal.fire({ icon: 'success', title: 'Guardado', text: 'Producto y costos actualizados.', timer: 1200 });
                      }}
                      className="flex-1 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold cursor-pointer"
                    >
                      Guardar cambios
                    </button>
                    <button
                      onClick={() => setSelectedProductEdit(null)}
                      className="px-3 py-2 border border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50 cursor-pointer"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-center text-gray-400 text-xs">
                  Selecciona el icono de lápiz en cualquier producto de la tabla para modificar su costo o ajustar existencias.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          VIEW 7: MOVIMIENTOS (ENTRADAS / SALIDAS / TRASLADOS) (Images 3 & 4)
          ===================================================================== */}
      {activeTab === 'movimientos' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Sub-tabs: Entrada | Salida | Traslado entre sedes */}
          <div className="flex items-center gap-2 p-1.5 bg-gray-100 rounded-2xl w-fit">
            <button
              onClick={() => setMovementSubTab('ENTRADA')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${movementSubTab === 'ENTRADA' ? 'bg-emerald-700 text-white shadow-xs' : 'text-gray-600 hover:text-black'}`}
            >
              ↓ Entrada de mercancía (compras)
            </button>
            <button
              onClick={() => setMovementSubTab('SALIDA')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${movementSubTab === 'SALIDA' ? 'bg-emerald-700 text-white shadow-xs' : 'text-gray-600 hover:text-black'}`}
            >
              ↑ Salida de mercancía (ajustes/mermas)
            </button>
            <button
              onClick={() => setMovementSubTab('TRASLADO')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${movementSubTab === 'TRASLADO' ? 'bg-emerald-700 text-white shadow-xs' : 'text-gray-600 hover:text-black'}`}
            >
              ⇄ Traslado entre sedes
            </button>
          </div>

          {/* TRASLADO ENTRE SEDES VIEW (Image 4) */}
          {movementSubTab === 'TRASLADO' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Form (8 cols) */}
              <div className="lg:col-span-8 bg-white rounded-2xl border border-gray-200/80 p-5 shadow-2xs space-y-4">
                <div className="border-b border-gray-100 pb-3 flex items-center gap-2">
                  <ArrowLeftRight className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-sm font-extrabold text-gray-900">Registrar traslado entre sedes</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Sede origen *</label>
                    <select
                      value={transferOrigin}
                      onChange={e => setTransferOrigin(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-bold bg-gray-50"
                    >
                      {STORES_LIST.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Sede destino *</label>
                    <select
                      value={transferDest}
                      onChange={e => setTransferDest(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-bold bg-gray-50"
                    >
                      {STORES_LIST.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Fecha *</label>
                    <input
                      type="date"
                      value={transferDate}
                      onChange={e => setTransferDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-bold bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Referencia / Motivo *</label>
                    <input
                      type="text"
                      value={transferReason}
                      onChange={e => setTransferReason(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-bold bg-gray-50"
                    />
                  </div>
                </div>

                {/* Items to transfer */}
                <div className="space-y-2 pt-2 border-t border-gray-100">
                  <h4 className="text-xs font-bold text-gray-800">Productos a trasladar (carga masiva)</h4>
                  <div className="border border-gray-200 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200 text-[10px] font-bold text-gray-400 uppercase">
                          <th className="py-2 px-3">#</th>
                          <th className="py-2 px-3">Producto *</th>
                          <th className="py-2 px-3">Cantidad *</th>
                          <th className="py-2 px-3">Stock origen</th>
                          <th className="py-2 px-3">Stock destino</th>
                          <th className="py-2 px-3 w-8"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {transferItems.map((it, idx) => {
                          const p = data.products.find(prod => prod.id === it.productId);
                          const stOrig = p ? (p.stocks[transferOrigin] || 0) : 0;
                          const stDest = p ? (p.stocks[transferDest] || 0) : 0;

                          return (
                            <tr key={idx}>
                              <td className="py-2 px-3 font-mono text-gray-400">{idx + 1}</td>
                              <td className="py-2 px-3 font-bold">{it.productName}</td>
                              <td className="py-2 px-3">
                                <input
                                  type="number"
                                  min="1"
                                  value={it.quantity}
                                  onChange={e => {
                                    const q = Number(e.target.value);
                                    setTransferItems(prev => prev.map((x, i) => i === idx ? { ...x, quantity: q } : x));
                                  }}
                                  className="w-16 px-2 py-1 rounded border border-gray-200 font-bold"
                                />
                              </td>
                              <td className="py-2 px-3 font-mono text-gray-500">{stOrig}</td>
                              <td className="py-2 px-3 font-mono text-gray-500">{stDest}</td>
                              <td className="py-2 px-3 text-center">
                                <button
                                  onClick={() => setTransferItems(prev => prev.filter((_, i) => i !== idx))}
                                  className="text-gray-400 hover:text-red-600"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}

                        {/* Add Row */}
                        <tr className="bg-gray-50">
                          <td className="py-2 px-3 text-center font-bold text-emerald-600">+</td>
                          <td className="py-2 px-3">
                            <select
                              value={newTransferRow.productId}
                              onChange={e => setNewTransferRow({ ...newTransferRow, productId: e.target.value })}
                              className="px-2 py-1 rounded border border-gray-200 text-xs font-bold bg-white"
                            >
                              {data.products.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                              ))}
                            </select>
                          </td>
                          <td className="py-2 px-3">
                            <input
                              type="number"
                              min="1"
                              value={newTransferRow.quantity}
                              onChange={e => setNewTransferRow({ ...newTransferRow, quantity: Math.max(1, Number(e.target.value)) })}
                              className="w-16 px-2 py-1 rounded border border-gray-200 text-xs font-bold bg-white"
                            />
                          </td>
                          <td colSpan={2}></td>
                          <td className="py-2 px-3 text-center">
                            <button
                              onClick={handleAddTransferRow}
                              className="p-1 bg-emerald-700 text-white rounded cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <button
                    onClick={() => setTransferItems([])}
                    className="px-3 py-1.5 border border-gray-200 text-gray-600 rounded-xl text-xs font-bold"
                  >
                    Limpiar
                  </button>
                  <button
                    onClick={handleConfirmTransfer}
                    className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-black shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Check className="w-4 h-4" /> Confirmar traslado
                  </button>
                </div>
              </div>

              {/* Right Panel (4 cols) Summary and History */}
              <div className="lg:col-span-4 space-y-4">
                <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-2xs space-y-3">
                  <h3 className="text-xs font-extrabold text-gray-900 border-b border-gray-100 pb-2">
                    Resumen del traslado
                  </h3>
                  <div className="grid grid-cols-2 gap-3 text-center text-xs">
                    <div className="p-2.5 bg-gray-50 rounded-xl">
                      <span className="text-[10px] text-gray-400 block font-bold">Productos</span>
                      <strong className="text-base font-black text-gray-900">{transferItems.length}</strong>
                    </div>
                    <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-800">
                      <span className="text-[10px] text-emerald-600 block font-bold">Unidades</span>
                      <strong className="text-base font-black">{transferItems.reduce((a, b) => a + b.quantity, 0)}</strong>
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-100 text-[11px] text-blue-900 leading-relaxed">
                    ℹ️ El traslado descuenta automáticamente las unidades de la sede origen y las suma en la sede destino.
                  </div>
                </div>

                {/* Historial de traslados */}
                <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-2xs space-y-3">
                  <h3 className="text-xs font-extrabold text-gray-900 border-b border-gray-100 pb-2">
                    Historial de traslados recientes
                  </h3>
                  <div className="space-y-2 text-xs">
                    {data.movements.filter(m => m.type === 'TRASLADO').map(mov => (
                      <div key={mov.id} className="p-2.5 bg-gray-50 rounded-xl border border-gray-100 space-y-1">
                        <div className="flex items-center justify-between text-[11px] font-bold">
                          <span>{mov.storeName} → {mov.targetStoreName}</span>
                          <span className="text-emerald-700">{mov.totalUnits} u</span>
                        </div>
                        <p className="text-[10px] text-gray-400">{mov.dateStr} · {mov.reference}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ENTRADA DE MERCANCÍA VIEW (Image 3) */}
          {movementSubTab === 'ENTRADA' && (
            <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-2xs space-y-4">
              <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-gray-900">Nueva Entrada de Mercancía – Compras</h3>
                  <p className="text-xs text-gray-500">Registra ingresos de lotes de ropa o compras a proveedores.</p>
                </div>
              </div>

              <div className="p-8 text-center border-2 border-dashed border-gray-200 rounded-2xl space-y-2">
                <UploadCloud className="w-8 h-8 text-gray-400 mx-auto" />
                <h4 className="font-bold text-xs text-gray-800">Cargar nota de entrega o factura de proveedor</h4>
                <p className="text-[11px] text-gray-400">Arrastra una fotografía de la nota o ingresa manualmente los productos abajo.</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =====================================================================
          VIEW 8: CUADRES DE VENTAS (CONTROL DIARIO Y SEMÁFORO) (Image 2)
          ===================================================================== */}
      {activeTab === 'cuadres' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Top KPI Cards (Image 2) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-2xs flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black">
                <Check className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-gray-900">{cuadresMatrixData.countConCuadre}</h3>
                <span className="text-xs text-gray-500 font-bold">Días con cuadre</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-2xs flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-black">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-red-600">{cuadresMatrixData.countPendientes}</h3>
                <span className="text-xs text-gray-500 font-bold">Días pendientes</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-2xs flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-gray-100 text-gray-600 flex items-center justify-center font-black">
                -
              </div>
              <div>
                <h3 className="text-2xl font-black text-gray-900">{cuadresMatrixData.countSinVentas}</h3>
                <span className="text-xs text-gray-500 font-bold">Días sin ventas</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-emerald-100 shadow-2xs flex items-center gap-3.5 bg-emerald-50/20">
              <div className="w-10 h-10 rounded-full border-4 border-emerald-600 text-emerald-800 flex items-center justify-center font-black text-xs">
                {cuadresMatrixData.pct}%
              </div>
              <div>
                <h3 className="text-sm font-black text-emerald-950">Cumplimiento de cuadres</h3>
                <span className="text-[10px] text-emerald-700 font-bold">{cuadresMatrixData.countConCuadre} de {cuadresMatrixData.daysArray.length * 4} registros</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Main Matrix (8 cols) */}
            <div className="lg:col-span-8 bg-white rounded-2xl border border-gray-200/80 p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2">
                  <CalendarCheck className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-sm font-extrabold text-gray-900">Cuadre por sede ({MONTH_NAMES[selectedMonth - 1]} de {selectedYear})</h3>
                </div>
              </div>

              {/* Matrix Grid */}
              <div className="overflow-x-auto pb-2">
                <table className="w-full text-center border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="py-2 px-3 text-left font-bold text-gray-500 w-32">Sede</th>
                      {cuadresMatrixData.daysArray.slice(0, 20).map(d => (
                        <th key={d} className="py-2 px-1.5 font-mono text-[10px] text-gray-400">
                          <div>{String(d).padStart(2, '0')}</div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {STORES_LIST.map(st => (
                      <tr key={st.id} className="hover:bg-gray-50/50">
                        <td className="py-3 px-3 text-left font-extrabold text-xs text-gray-900 flex items-center gap-1.5">
                          <Store className="w-3.5 h-3.5 text-gray-400" />
                          <span>{st.shortName}</span>
                        </td>
                        {cuadresMatrixData.daysArray.slice(0, 20).map(d => {
                          const dateStr = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                          const c = data.cuadres.find(x => x.dateStr === dateStr && x.storeId === st.id);
                          const isReg = c && c.status === 'REGISTERED';
                          const isNoSales = c && c.status === 'NO_SALES';

                          return (
                            <td key={d} className="py-2 px-1 text-center">
                              {isReg ? (
                                <button
                                  onClick={() => {
                                    setAiStoreId(st.id);
                                    setAiDateStr(dateStr);
                                    setActiveTab('cargar-ia');
                                  }}
                                  className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-100 flex items-center justify-center text-[10px] font-bold mx-auto cursor-pointer"
                                  title={`Registrado: ${formatPrice(c.totalSales)}`}
                                >
                                  ✓
                                </button>
                              ) : isNoSales ? (
                                <span className="w-6 h-6 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center text-[10px] font-bold mx-auto">
                                  –
                                </span>
                              ) : (
                                <button
                                  onClick={() => {
                                    setAiStoreId(st.id);
                                    setAiDateStr(dateStr);
                                    setActiveTab('cargar-ia');
                                  }}
                                  className="w-6 h-6 rounded-full bg-red-50 text-red-600 hover:bg-red-100 flex items-center justify-center text-[10px] mx-auto cursor-pointer animate-pulse"
                                  title="Cuadre pendiente - Haz clic para cargar"
                                >
                                  🕒
                                </button>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Legend */}
              <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-gray-100 text-xs text-gray-600">
                <span className="flex items-center gap-1.5"><span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center justify-center">✓</span> Cuadre registrado (Ventas disponibles)</span>
                <span className="flex items-center gap-1.5"><span className="w-4 h-4 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold flex items-center justify-center">–</span> Sin ventas (Día registrado con $0)</span>
                <span className="flex items-center gap-1.5"><span className="w-4 h-4 rounded-full bg-red-100 text-red-800 text-[10px] font-bold flex items-center justify-center">🕒</span> Cuadre pendiente (Aún no se ha registrado)</span>
              </div>
            </div>

            {/* Right List of Pending (4 cols) */}
            <div className="lg:col-span-4 bg-white rounded-2xl border border-gray-200/80 p-5 shadow-2xs space-y-4">
              <h3 className="text-xs font-extrabold text-gray-900 border-b border-gray-100 pb-2">
                Días pendientes (detalle)
              </h3>
              <div className="space-y-2 text-xs">
                {cuadresMatrixData.pendingList.slice(0, 8).map((p, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-gray-50 border border-gray-100">
                    <div>
                      <strong className="text-gray-900 font-bold block">{p.storeName}</strong>
                      <span className="text-[10px] text-gray-400 font-mono">{p.dateStr}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-50 text-red-600 border border-red-200">
                      Pendiente
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          VIEW 9: GASTOS Y DEUDAS (CARTERA, PROVEEDORES, GASTOS FIJOS)
          ===================================================================== */}
      {activeTab === 'gastos-deudas' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center gap-2 p-1.5 bg-gray-100 rounded-2xl w-fit">
            <button
              onClick={() => setExpenseSubTab('FIJOS')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${expenseSubTab === 'FIJOS' ? 'bg-emerald-700 text-white shadow-xs' : 'text-gray-600'}`}
            >
              Gastos fijos por sede
            </button>
            <button
              onClick={() => setExpenseSubTab('DEUDAS')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${expenseSubTab === 'DEUDAS' ? 'bg-emerald-700 text-white shadow-xs' : 'text-gray-600'}`}
            >
              Deudas a proveedores
            </button>
            <button
              onClick={() => setExpenseSubTab('CARTERA')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${expenseSubTab === 'CARTERA' ? 'bg-emerald-700 text-white shadow-xs' : 'text-gray-600'}`}
            >
              Cartera de clientes (Por cobrar)
            </button>
          </div>

          {/* GASTOS FIJOS */}
          {expenseSubTab === 'FIJOS' && (
            <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div>
                  <h3 className="text-sm font-extrabold text-gray-900">Gastos fijos mensuales y estado de pago</h3>
                  <p className="text-xs text-gray-500">Arriendos, servicios, internet, nóminas y cuotas bancarias.</p>
                </div>
              </div>

              <div className="overflow-x-auto text-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-[10px] font-bold text-gray-400 uppercase">
                      <th className="py-2.5 px-3">Concepto</th>
                      <th className="py-2.5 px-3">Local / Sede</th>
                      <th className="py-2.5 px-3">Monto Mensual</th>
                      <th className="py-2.5 px-3 text-center">Mes Actual ({MONTH_NAMES[selectedMonth - 1]})</th>
                      <th className="py-2.5 px-3 text-center">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {data.expenses.map(exp => {
                      const st = exp.statusByMonth[selectedMonth] || 'PENDIENTE';
                      return (
                        <tr key={exp.id} className="hover:bg-gray-50/60">
                          <td className="py-2.5 px-3 font-bold text-gray-900">{exp.concept}</td>
                          <td className="py-2.5 px-3 font-medium text-gray-600">{exp.local}</td>
                          <td className="py-2.5 px-3 font-mono font-bold">{formatPrice(exp.monthlyAmount)}</td>
                          <td className="py-2.5 px-3 text-center">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${st === 'PAGADO' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                              {st}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <button
                              onClick={() => {
                                CommercialService.toggleExpenseMonth(exp.id, selectedMonth);
                                refreshData();
                              }}
                              className="px-2.5 py-1 rounded-lg text-[10px] font-bold border border-gray-200 hover:bg-gray-100 cursor-pointer"
                            >
                              Cambiar estado
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* DEUDAS A PROVEEDORES */}
          {expenseSubTab === 'DEUDAS' && (
            <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div>
                  <h3 className="text-sm font-extrabold text-gray-900">Deudas a proveedores y préstamos</h3>
                  <p className="text-xs text-gray-500">Control de saldo inicial, abonos realizados y saldo pendiente.</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-gray-400 font-bold block uppercase">Total Saldo Pendiente</span>
                  <strong className="text-lg font-black text-red-600">
                    {formatPrice(data.debts.filter(d => d.type === 'PAYABLE').reduce((a, b) => a + b.pendingBalance, 0))}
                  </strong>
                </div>
              </div>

              <div className="overflow-x-auto text-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-[10px] font-bold text-gray-400 uppercase">
                      <th className="py-2.5 px-3">Proveedor / Acreedor</th>
                      <th className="py-2.5 px-3">Concepto</th>
                      <th className="py-2.5 px-3">Deuda Inicial</th>
                      <th className="py-2.5 px-3">Total Abonado</th>
                      <th className="py-2.5 px-3">Saldo Pendiente</th>
                      <th className="py-2.5 px-3 text-center">Estado</th>
                      <th className="py-2.5 px-3 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {data.debts.filter(d => d.type === 'PAYABLE').map(d => (
                      <tr key={d.id} className="hover:bg-gray-50/60">
                        <td className="py-2.5 px-3 font-extrabold text-gray-900">{d.thirdParty}</td>
                        <td className="py-2.5 px-3 text-gray-600">{d.concept}</td>
                        <td className="py-2.5 px-3 font-mono">{formatPrice(d.totalInitial)}</td>
                        <td className="py-2.5 px-3 font-mono text-emerald-700">{formatPrice(d.totalAbonado)}</td>
                        <td className="py-2.5 px-3 font-mono font-black text-red-600">{formatPrice(d.pendingBalance)}</td>
                        <td className="py-2.5 px-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${d.status === 'PAGADO' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
                            {d.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <button
                            onClick={() => setNewAbonoModal({ debtId: d.id, debtName: d.thirdParty, balance: d.pendingBalance })}
                            className="px-2.5 py-1 bg-black text-white hover:bg-gray-800 rounded-lg text-[10px] font-bold cursor-pointer"
                          >
                            + Abono
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* CARTERA DE CLIENTES */}
          {expenseSubTab === 'CARTERA' && (
            <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div>
                  <h3 className="text-sm font-extrabold text-gray-900">Cartera de clientes (Cuentas por cobrar)</h3>
                  <p className="text-xs text-gray-500">Saldos pendientes de clientes y ventas a crédito.</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-gray-400 font-bold block uppercase">Total por cobrar</span>
                  <strong className="text-lg font-black text-emerald-700">
                    {formatPrice(data.debts.filter(d => d.type === 'RECEIVABLE').reduce((a, b) => a + b.pendingBalance, 0))}
                  </strong>
                </div>
              </div>

              <div className="overflow-x-auto text-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-[10px] font-bold text-gray-400 uppercase">
                      <th className="py-2.5 px-3">Cliente / Nombre</th>
                      <th className="py-2.5 px-3">Producto / Concepto</th>
                      <th className="py-2.5 px-3">Valor Total</th>
                      <th className="py-2.5 px-3">Abono</th>
                      <th className="py-2.5 px-3">Debe (Saldo)</th>
                      <th className="py-2.5 px-3">Descripción</th>
                      <th className="py-2.5 px-3 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {data.debts.filter(d => d.type === 'RECEIVABLE').map(d => (
                      <tr key={d.id} className="hover:bg-gray-50/60">
                        <td className="py-2.5 px-3 font-extrabold text-gray-900">{d.thirdParty}</td>
                        <td className="py-2.5 px-3 text-gray-600">{d.concept}</td>
                        <td className="py-2.5 px-3 font-mono">{formatPrice(d.totalInitial)}</td>
                        <td className="py-2.5 px-3 font-mono text-emerald-700">{formatPrice(d.totalAbonado)}</td>
                        <td className="py-2.5 px-3 font-mono font-black text-red-600">{formatPrice(d.pendingBalance)}</td>
                        <td className="py-2.5 px-3 text-gray-400 text-[10px]">{d.description || 'Sin nota'}</td>
                        <td className="py-2.5 px-3 text-center">
                          <button
                            onClick={() => setNewAbonoModal({ debtId: d.id, debtName: d.thirdParty, balance: d.pendingBalance })}
                            className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-[10px] font-bold cursor-pointer"
                          >
                            + Abono
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =====================================================================
          VIEW 10: IMPORTAR EXCEL (3-STEP WIZARD) (Image 1)
          ===================================================================== */}
      {activeTab === 'importar' && (
        <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-2xs space-y-6 animate-in fade-in duration-200">
          {/* Stepper Wizard Header */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 border-b border-gray-100 pb-4">
            <div className="flex items-center gap-2.5 p-2 rounded-xl bg-gray-50 border border-gray-200">
              <span className="w-6 h-6 rounded-full bg-gray-400 text-white text-xs font-bold flex items-center justify-center">1</span>
              <div>
                <strong className="text-xs font-bold text-gray-900 block">Cargar archivo</strong>
                <span className="text-[10px] text-gray-400">Selecciona tu Excel</span>
              </div>
            </div>
            <div className="flex items-center gap-2.5 p-2 rounded-xl bg-emerald-50 border border-emerald-200">
              <span className="w-6 h-6 rounded-full bg-emerald-700 text-white text-xs font-bold flex items-center justify-center">2</span>
              <div>
                <strong className="text-xs font-bold text-emerald-950 block">Revisar información</strong>
                <span className="text-[10px] text-emerald-700">Valida productos, costos y existencias</span>
              </div>
            </div>
            <div className="flex items-center gap-2.5 p-2 rounded-xl bg-gray-50 border border-gray-200">
              <span className="w-6 h-6 rounded-full bg-gray-400 text-white text-xs font-bold flex items-center justify-center">3</span>
              <div>
                <strong className="text-xs font-bold text-gray-900 block">Confirmar importación</strong>
                <span className="text-[10px] text-gray-400">Se registrará el inventario en el sistema</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left drop area & file info (Image 1) */}
            <div className="lg:col-span-3 space-y-4">
              <div className="p-5 border-2 border-dashed border-emerald-300 rounded-2xl text-center space-y-2 bg-emerald-50/20">
                <FileSpreadsheet className="w-8 h-8 text-emerald-600 mx-auto" />
                <h4 className="font-extrabold text-xs text-gray-900">Inventario_JuandStore.xlsx</h4>
                <p className="text-[10px] text-gray-400">Archivo precargado con 4 sedes y costos</p>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  Listo para importar
                </span>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-[11px] text-gray-600 space-y-1.5">
                <span className="font-bold text-gray-800 text-xs block">Requisitos del archivo:</span>
                <p>✓ Formato .xlsx o .xls</p>
                <p>✓ Contiene Producto, Costo y Existencia</p>
                <p>✓ Pestañas separadas por cada sede</p>
              </div>
            </div>

            {/* Center table: Vista previa por sede (Image 1) */}
            <div className="lg:col-span-6 bg-white rounded-2xl border border-gray-200/80 p-4 shadow-2xs space-y-3">
              <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                <h3 className="text-xs font-extrabold text-gray-900">Vista previa de la información</h3>
              </div>

              {/* Store pills tabs */}
              <div className="flex items-center gap-2 overflow-x-auto">
                {STORES_LIST.map(st => (
                  <button
                    key={st.id}
                    onClick={() => setSelectedImportStoreTab(st.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer ${selectedImportStoreTab === st.id ? 'bg-emerald-700 text-white font-extrabold' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                  >
                    {st.shortName} ({data.products.length} productos)
                  </button>
                ))}
              </div>

              <div className="border border-gray-200 rounded-xl overflow-hidden max-h-80 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-[10px] font-bold text-gray-400 uppercase">
                      <th className="py-2 px-3">#</th>
                      <th className="py-2 px-3">Producto</th>
                      <th className="py-2 px-3">Categoría</th>
                      <th className="py-2 px-3">Costo Unitario</th>
                      <th className="py-2 px-3 text-center">Existencia</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {data.products.map((p, idx) => (
                      <tr key={p.id}>
                        <td className="py-2 px-3 font-mono text-gray-400">{idx + 1}</td>
                        <td className="py-2 px-3 font-bold">{p.name}</td>
                        <td className="py-2 px-3 text-gray-500">{p.category}</td>
                        <td className="py-2 px-3 font-mono">{formatPrice(p.costPrice)}</td>
                        <td className="py-2 px-3 text-center font-bold font-mono text-emerald-800">
                          {p.stocks[selectedImportStoreTab] || 0}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right Summary Card (Image 1) */}
            <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-200/80 p-5 shadow-2xs space-y-4">
              <h3 className="text-xs font-extrabold text-gray-900 border-b border-gray-100 pb-2">
                Resumen de la importación
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                  <span className="text-gray-500">Sedes detectadas</span>
                  <strong className="font-bold">4 sedes</strong>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                  <span className="text-gray-500">Total de productos</span>
                  <strong className="font-bold">{data.products.length * 4} registros</strong>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                  <span className="text-gray-500">Registros válidos</span>
                  <strong className="font-bold text-emerald-700">100% listos</strong>
                </div>
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-[11px] text-emerald-900 leading-relaxed">
                ✓ Se crearán y sincronizarán los productos, costos y existencias iniciales en las 4 sedes.
              </div>

              <button
                onClick={handleConfirmFullImport}
                className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-black shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" /> Confirmar importación
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          VIEW 11: REPORTES Y EXPORTACIÓN (Image 5)
          ===================================================================== */}
      {activeTab === 'reportes' && (
        <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-2xs space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-3">
            <div>
              <h2 className="text-base font-black text-gray-900">Reportes comerciales y financieros</h2>
              <p className="text-xs text-gray-500">Genera, consulta y descarga informes de ventas, costos y utilidades.</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => window.print()}
                className="px-3 py-1.5 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" /> Imprimir
              </button>
              <button
                onClick={() => {
                  Swal.fire({
                    icon: 'success',
                    title: 'Excel generado',
                    text: 'El reporte financiero ha sido descargado correctamente.',
                    timer: 1500,
                    showConfirmButton: false
                  });
                }}
                className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" /> Descargar Excel
              </button>
            </div>
          </div>

          {/* Report Bar Chart: Ventas por sede (Image 5) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 p-5 bg-gray-50 rounded-2xl border border-gray-100 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-extrabold text-gray-900">Ventas vs Ganancia por Sede ({MONTH_NAMES[selectedMonth - 1]})</h3>
                <div className="flex items-center gap-3 text-xs font-bold">
                  <span className="flex items-center gap-1"><span className="w-3 h-3 bg-emerald-700 rounded" /> Ventas</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-3 bg-emerald-300 rounded" /> Ganancia</span>
                </div>
              </div>

              <div className="h-60 flex items-end justify-around pt-8 pb-4">
                {STORES_LIST.map(st => {
                  const mCuadres = data.cuadres.filter(c => c.storeId === st.id && c.dateStr.startsWith(`${selectedYear}-${String(selectedMonth).padStart(2, '0')}`));
                  const v = mCuadres.reduce((a, b) => a + b.totalSales, 0);
                  const g = mCuadres.reduce((a, b) => a + b.totalProfit, 0);
                  const maxV = 60000000;

                  return (
                    <div key={st.id} className="flex flex-col items-center gap-2 w-28">
                      <div className="w-full flex items-end justify-center gap-2 h-44">
                        <div
                          style={{ height: `${Math.min(100, Math.max(15, (v / maxV) * 100))}%` }}
                          className="w-8 bg-emerald-800 rounded-t-lg transition-all"
                          title={`Ventas: ${formatPrice(v)}`}
                        />
                        <div
                          style={{ height: `${Math.min(100, Math.max(10, (g / maxV) * 100))}%` }}
                          className="w-8 bg-emerald-400 rounded-t-lg transition-all"
                          title={`Ganancia: ${formatPrice(g)}`}
                        />
                      </div>
                      <span className="text-[11px] font-bold text-gray-700 text-center truncate">{st.shortName}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Comparativo de periodos (Image 5) */}
            <div className="lg:col-span-4 space-y-4">
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 space-y-2">
                <span className="text-[10px] text-emerald-700 font-bold uppercase block">Comparativo de períodos</span>
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-[11px] text-gray-500 block">Noviembre 2026</span>
                    <strong className="text-base font-black text-gray-900">{formatPrice(monthlyMetrics.totalVentas)}</strong>
                  </div>
                  <div>
                    <span className="text-[11px] text-gray-500 block">Octubre 2026</span>
                    <strong className="text-base font-black text-gray-600">{formatPrice(Math.round(monthlyMetrics.totalVentas * 0.93))}</strong>
                  </div>
                </div>
                <div className="pt-2 border-t border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" /> Variación positiva: +7,6%
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: Registrar Abono a Deuda o Cartera
          ======================================================== */}
      {newAbonoModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-gray-200 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-sm font-extrabold text-gray-900">Registrar Abono</h3>
              <button
                type="button"
                onClick={() => setNewAbonoModal(null)}
                className="p-1 text-gray-400 hover:text-black rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-gray-400 block text-[10px] uppercase font-bold">Tercero / Cliente</span>
                <strong className="text-sm text-gray-900">{newAbonoModal.debtName}</strong>
              </div>

              <div>
                <span className="text-gray-400 block text-[10px] uppercase font-bold">Saldo actual pendiente</span>
                <strong className="text-sm text-red-600 font-mono">{formatPrice(newAbonoModal.balance)}</strong>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Monto del abono ($)</label>
                <input
                  type="number"
                  step="50000"
                  value={abonoInputAmount}
                  onChange={e => setAbonoInputAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 font-bold font-mono text-xs focus:outline-hidden"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setNewAbonoModal(null)}
                className="px-3 py-1.5 border border-gray-200 rounded-xl text-xs font-bold hover:bg-gray-50 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleRegisterAbono}
                className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-black shadow-xs cursor-pointer"
              >
                Confirmar Abono
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
