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
  Info,
  Layers,
  RotateCcw
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

  // Filtros globales: Mes, Año y Sede (para reportes y análisis)
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState<number>(now.getMonth() + 1); // 1-12
  const [selectedYear, setSelectedYear] = useState<number>(now.getFullYear());
  const [selectedStoreId, setSelectedStoreId] = useState<string>('all'); // 'all' | 'republica' | 'modelo' | 'quality' | 'mariano'

  // Master Data state from service
  const [data, setData] = useState(() => CommercialService.getData());

  const refreshData = () => {
    setData(CommercialService.getData());
  };

  // Nombres de meses en español
  const MONTH_NAMES = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  // =========================================================================
  // TAB 1: RESUMEN GENERAL (DASHBOARD DINÁMICO)
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
    const margenPct = totalVentas > 0 ? ((gananciaBruta / totalVentas) * 100).toFixed(1) : '0';

    return { totalVentas, totalCosto, gananciaBruta, prendasVendidas, margenPct, countCuadres: relevantCuadres.length };
  }, [data.cuadres, selectedMonth, selectedYear, selectedStoreId]);

  // =========================================================================
  // TAB 2: CARGAR VENTAS CON IA (LECTURA DE FOTO DE LIBRETA POR SEDE)
  // =========================================================================
  const [aiStoreId, setAiStoreId] = useState<string>('republica');
  const [aiDateStr, setAiDateStr] = useState<string>(now.toISOString().split('T')[0]);
  const [aiImages, setAiImages] = useState<string[]>([]);
  const [aiIsProcessing, setAiIsProcessing] = useState<boolean>(false);
  const [aiVerifiedSales, setAiVerifiedSales] = useState<CommercialSaleLine[]>([]);

  const handleSimulateAiRead = () => {
    if (aiImages.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Fotos requeridas',
        text: 'Por favor sube al menos una fotografía de la libreta de ventas de la sede.',
        confirmButtonColor: '#007A33'
      });
      return;
    }

    setAiIsProcessing(true);
    setTimeout(() => {
      setAiIsProcessing(false);
      const sample1 = data.products[0];
      const sample2 = data.products[4] || sample1; // Jeans
      const sample3 = data.products[7] || sample1; // Pantaloneta NBA

      const detected: CommercialSaleLine[] = [
        {
          id: `ai-${Date.now()}-1`,
          productId: sample1?.id || 'p-1',
          productName: sample1?.name || 'CAMISAS ALTA GAMA',
          quantity: 2,
          costPrice: sample1?.costPrice || 40000,
          sellingPrice: 70000,
          subtotal: 140000,
          costTotal: 2 * (sample1?.costPrice || 40000),
          profit: 140000 - (2 * (sample1?.costPrice || 40000)),
          paymentMethod: 'Bold',
          hour: '11:15 a. m.',
          verified: true
        },
        {
          id: `ai-${Date.now()}-2`,
          productId: sample2?.id || 'p-5',
          productName: sample2?.name || 'JEANS',
          quantity: 1,
          costPrice: sample2?.costPrice || 100000,
          sellingPrice: 140000,
          subtotal: 140000,
          costTotal: sample2?.costPrice || 100000,
          profit: 40000,
          paymentMethod: 'Efectivo',
          hour: '12:30 p. m.',
          verified: true
        },
        {
          id: `ai-${Date.now()}-3`,
          productId: sample3?.id || 'p-8',
          productName: sample3?.name || 'PANTALONETA NBA',
          quantity: 2,
          costPrice: sample3?.costPrice || 33000,
          sellingPrice: 65000,
          subtotal: 130000,
          costTotal: 2 * (sample3?.costPrice || 33000),
          profit: 130000 - (2 * (sample3?.costPrice || 33000)),
          paymentMethod: 'Nequi',
          hour: '03:45 p. m.',
          verified: true
        }
      ];

      setAiVerifiedSales(detected);
      Swal.fire({
        icon: 'success',
        title: 'Lectura con IA completada',
        text: `Se detectaron ${detected.length} partidas de venta en la libreta. Verifica antes de confirmar el cierre.`,
        confirmButtonColor: '#007A33'
      });
    }, 1200);
  };

  const aiTotals = useMemo(() => {
    const totalSales = aiVerifiedSales.reduce((acc, s) => acc + s.subtotal, 0);
    const totalCost = aiVerifiedSales.reduce((acc, s) => acc + s.costTotal, 0);
    const totalProfit = totalSales - totalCost;
    const totalItems = aiVerifiedSales.reduce((acc, s) => acc + s.quantity, 0);

    const byMethod: { [key: string]: number } = {};
    PAYMENT_METHODS.forEach(pm => { byMethod[pm.id] = 0; });
    aiVerifiedSales.forEach(s => {
      byMethod[s.paymentMethod] = (byMethod[s.paymentMethod] || 0) + s.subtotal;
    });

    return { totalSales, totalCost, totalProfit, totalItems, byMethod };
  }, [aiVerifiedSales]);

  const handleSaveAiCuadre = () => {
    if (aiVerifiedSales.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'No hay ventas para guardar',
        text: 'Debes escanear o agregar al menos una venta antes de cerrar el cuadre.',
        confirmButtonColor: '#007A33'
      });
      return;
    }

    const storeObj = STORES_LIST.find(s => s.id === aiStoreId)!;
    const cuadre: CommercialDailyCuadre = {
      id: `cuadre-${aiDateStr}-${aiStoreId}`,
      dateStr: aiDateStr,
      storeId: aiStoreId,
      storeName: storeObj.shortName,
      status: 'REGISTERED',
      sales: aiVerifiedSales,
      totalSales: aiTotals.totalSales,
      totalCost: aiTotals.totalCost,
      totalProfit: aiTotals.totalProfit,
      totalItems: aiTotals.totalItems,
      totalsByMethod: aiTotals.byMethod,
      images: aiImages,
      updatedAt: new Date().toISOString()
    };

    CommercialService.saveCuadre(cuadre);
    refreshData();

    Swal.fire({
      icon: 'success',
      title: '¡Cierre de Ventas Registrado!',
      html: `
        <p class="text-sm">Se guardó el cuadre oficial de <b>${storeObj.shortName}</b> para el <b>${aiDateStr}</b>.</p>
        <p class="text-xs text-emerald-700 font-bold mt-2">Total ventas: ${formatPrice(aiTotals.totalSales)} (${aiTotals.totalItems} prendas)</p>
        <p class="text-[11px] text-gray-500 mt-1">El stock se ha descontado automáticamente del inventario de esta sede.</p>
      `,
      confirmButtonColor: '#007A33'
    });

    setAiVerifiedSales([]);
    setAiImages([]);
  };

  // =========================================================================
  // TAB 3: REGISTRO MANUAL DE VENTAS (EL PRECIO DE VENTA SE INGRESA AL VENDER)
  // =========================================================================
  const [manualStoreId, setManualStoreId] = useState<string>('republica');
  const [manualDateStr, setManualDateStr] = useState<string>(now.toISOString().split('T')[0]);
  const [manualSales, setManualSales] = useState<CommercialSaleLine[]>([]);

  const [newManualSale, setNewManualSale] = useState({
    productId: '',
    quantity: 1,
    sellingPrice: '' as string | number, // Se digita al momento de vender
    paymentMethod: 'Bold',
    hour: new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: true })
  });

  useEffect(() => {
    if (data.products.length > 0 && !newManualSale.productId) {
      setNewManualSale(prev => ({
        ...prev,
        productId: data.products[0].id
      }));
    }
  }, [data.products, newManualSale.productId]);

  useEffect(() => {
    const existing = data.cuadres.find(c => c.dateStr === manualDateStr && c.storeId === manualStoreId);
    if (existing && existing.sales && existing.sales.length > 0) {
      setManualSales(existing.sales);
    } else {
      setManualSales([]);
    }
  }, [manualDateStr, manualStoreId, data.cuadres]);

  const handleAddManualSale = () => {
    const prod = data.products.find(p => p.id === newManualSale.productId);
    if (!prod) return;

    const priceNum = Number(newManualSale.sellingPrice);
    if (!priceNum || priceNum <= 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Precio de venta requerido',
        text: 'Por favor ingresa el precio al que vendiste la prenda.',
        confirmButtonColor: '#007A33'
      });
      return;
    }

    const currentStock = prod.stocks[manualStoreId] || 0;
    if (currentStock < newManualSale.quantity) {
      Swal.fire({
        icon: 'warning',
        title: 'Stock bajo en sede',
        text: `En ${STORES_LIST.find(s => s.id === manualStoreId)?.shortName} solo quedan ${currentStock} unidades de ${prod.name}. ¿Deseas continuar?`,
        showCancelButton: true,
        confirmButtonText: 'Sí, continuar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#007A33'
      }).then(res => {
        if (res.isConfirmed) {
          executeAddManualSale(prod, priceNum);
        }
      });
      return;
    }

    executeAddManualSale(prod, priceNum);
  };

  const executeAddManualSale = (prod: CommercialProduct, priceNum: number) => {
    const subtotal = newManualSale.quantity * priceNum;
    const costTotal = newManualSale.quantity * prod.costPrice;
    const profit = subtotal - costTotal;

    const line: CommercialSaleLine = {
      id: `manual-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      productId: prod.id,
      productName: prod.name,
      quantity: newManualSale.quantity,
      costPrice: prod.costPrice,
      sellingPrice: priceNum,
      subtotal,
      costTotal,
      profit,
      paymentMethod: newManualSale.paymentMethod,
      hour: newManualSale.hour,
      verified: true
    };

    setManualSales(prev => [...prev, line]);
    setNewManualSale(prev => ({ ...prev, sellingPrice: '' }));
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

    if (manualSales.length === 0) {
      Swal.fire({
        icon: 'question',
        title: '¿No hubo ventas este día?',
        text: `No has anotado ventas en ${storeObj.shortName} para el ${manualDateStr}. ¿Deseas marcar este día como "Día sin ventas ($0)"?`,
        showCancelButton: true,
        confirmButtonText: 'Sí, marcar sin ventas',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#eab308'
      }).then(res => {
        if (res.isConfirmed) {
          CommercialService.markNoSalesDay(manualDateStr, manualStoreId);
          refreshData();
          Swal.fire({
            icon: 'info',
            title: 'Día registrado sin ventas',
            text: `Se marcó el día ${manualDateStr} para ${storeObj.shortName} con $0 de venta.`,
            confirmButtonColor: '#007A33'
          });
        }
      });
      return;
    }

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
      title: '¡Cierre de Ventas Guardado!',
      html: `
        <p class="text-sm">El cierre de ventas de <b>${storeObj.shortName}</b> para el <b>${manualDateStr}</b> quedó registrado correctamente.</p>
        <p class="text-xs text-emerald-700 font-bold mt-2">Total vendido: ${formatPrice(manualTotals.totalSales)} (${manualTotals.totalItems} prendas)</p>
        <p class="text-[11px] text-gray-500 mt-1">El stock de ${storeObj.shortName} se actualizó automáticamente.</p>
      `,
      confirmButtonColor: '#007A33'
    });
  };

  const handleMarkNoSalesDirectly = () => {
    const storeObj = STORES_LIST.find(s => s.id === manualStoreId)!;
    CommercialService.markNoSalesDay(manualDateStr, manualStoreId);
    refreshData();
    setManualSales([]);
    Swal.fire({
      icon: 'info',
      title: 'Día registrado sin ventas',
      text: `Se marcó el día ${manualDateStr} para ${storeObj.shortName} como cerrado / sin ventas ($0).`,
      confirmButtonColor: '#007A33'
    });
  };

  // =========================================================================
  // TAB 4: CUADRES DE VENTAS (CONTROL DE CUADRES POR DÍA Y SEDE)
  // =========================================================================
  const cuadresMatrixData = useMemo(() => {
    const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
    const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    const isCurrentMonth = selectedYear === now.getFullYear() && selectedMonth === (now.getMonth() + 1);
    const isPastMonth = selectedYear < now.getFullYear() || (selectedYear === now.getFullYear() && selectedMonth < (now.getMonth() + 1));
    const currentDay = now.getDate();

    let countConCuadre = 0;
    let countPendientes = 0;
    let countSinVentas = 0;
    const pendingList: { dateStr: string; storeId: string; storeName: string; day: number }[] = [];

    STORES_LIST.forEach(store => {
      daysArray.forEach(day => {
        const dateStr = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const found = data.cuadres.find(c => c.dateStr === dateStr && c.storeId === store.id);

        const isPastOrToday = isPastMonth || (isCurrentMonth && day <= currentDay);

        if (found) {
          if (found.status === 'REGISTERED') countConCuadre++;
          else if (found.status === 'NO_SALES') countSinVentas++;
          else if (isPastOrToday) {
            countPendientes++;
            pendingList.push({ dateStr, storeId: store.id, storeName: store.shortName, day });
          }
        } else if (isPastOrToday) {
          countPendientes++;
          pendingList.push({ dateStr, storeId: store.id, storeName: store.shortName, day });
        }
      });
    });

    const totalCalculated = countConCuadre + countPendientes + countSinVentas;
    const pct = totalCalculated > 0 ? Math.round(((countConCuadre + countSinVentas) / totalCalculated) * 100) : 100;

    return { daysArray, countConCuadre, countPendientes, countSinVentas, pct, pendingList, isCurrentMonth, currentDay };
  }, [data.cuadres, selectedMonth, selectedYear]);

  const handleOpenPendingCuadre = (storeId: string, dateStr: string) => {
    setManualStoreId(storeId);
    setManualDateStr(dateStr);
    setActiveTab('registro-manual');
  };

  // =========================================================================
  // TAB 6: 4 INVENTARIOS POR SEDE (SOLO 1 NOMBRE: CATEGORÍA/PRODUCTO, SIN PRECIO VENTA)
  // =========================================================================
  const [invStoreFilter, setInvStoreFilter] = useState<'republica' | 'modelo' | 'quality' | 'mariano' | 'all'>('republica');
  const [invSearch, setInvSearch] = useState('');
  const [selectedProductEdit, setSelectedProductEdit] = useState<CommercialProduct | null>(null);
  const [isNewProductModalOpen, setIsNewProductModalOpen] = useState(false);

  // Formulario nuevo producto: Solo 1 Nombre/Categoría, Costo de compra y Stock en las 4 sedes
  const [newProductForm, setNewProductForm] = useState({
    name: '',
    costPrice: 0,
    stockRepublica: 0,
    stockModelo: 0,
    stockQuality: 0,
    stockMariano: 0
  });

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductForm.name.trim()) return;

    const prod: CommercialProduct = {
      id: `prod-${Date.now()}`,
      name: newProductForm.name.trim().toUpperCase(),
      costPrice: Number(newProductForm.costPrice),
      stocks: {
        republica: Number(newProductForm.stockRepublica),
        modelo: Number(newProductForm.stockModelo),
        quality: Number(newProductForm.stockQuality),
        mariano: Number(newProductForm.stockMariano)
      }
    };

    CommercialService.saveProduct(prod);
    refreshData();
    setIsNewProductModalOpen(false);
    setNewProductForm({
      name: '',
      costPrice: 0,
      stockRepublica: 0,
      stockModelo: 0,
      stockQuality: 0,
      stockMariano: 0
    });

    Swal.fire({
      icon: 'success',
      title: 'Producto creado en inventario',
      text: `Se agregó ${prod.name} con existencias independientes para las 4 sedes.`,
      timer: 1500,
      showConfirmButton: false
    });
  };

  const handleDeleteProduct = (productId: string, productName: string) => {
    Swal.fire({
      title: '¿Eliminar del inventario?',
      text: `Se eliminará ${productName} del inventario de todas las sedes.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#dc2626'
    }).then(res => {
      if (res.isConfirmed) {
        CommercialService.deleteProduct(productId);
        refreshData();
        if (selectedProductEdit?.id === productId) setSelectedProductEdit(null);
      }
    });
  };

  const filteredInventory = useMemo(() => {
    return data.products.filter(p => {
      return p.name.toLowerCase().includes(invSearch.toLowerCase());
    });
  }, [data.products, invSearch]);

  const inventoryKpis = useMemo(() => {
    if (invStoreFilter === 'all') {
      const totalProds = data.products.length;
      let totalStockSede = 0;
      let valorInventarioCosto = 0;

      data.products.forEach(p => {
        STORES_LIST.forEach(s => {
          const st = p.stocks[s.id] || 0;
          totalStockSede += st;
          valorInventarioCosto += st * p.costPrice;
        });
      });

      const costoPromedio = totalStockSede > 0 ? Math.round(valorInventarioCosto / totalStockSede) : 0;
      return { totalProds, totalStockSede, valorInventarioCosto, costoPromedio };
    } else {
      const prodsWithStock = data.products.filter(p => (p.stocks[invStoreFilter] || 0) > 0).length;
      const totalStockSede = data.products.reduce((acc, p) => acc + (p.stocks[invStoreFilter] || 0), 0);
      const valorInventarioCosto = data.products.reduce((acc, p) => acc + (p.stocks[invStoreFilter] || 0) * p.costPrice, 0);
      const costoPromedio = totalStockSede > 0 ? Math.round(valorInventarioCosto / totalStockSede) : 0;

      return { totalProds: prodsWithStock || data.products.length, totalStockSede, valorInventarioCosto, costoPromedio };
    }
  }, [data.products, invStoreFilter]);

  // =========================================================================
  // TAB 7: MOVIMIENTOS (TRASLADOS ENTRE SEDES)
  // =========================================================================
  const [movementSubTab, setMovementSubTab] = useState<'ENTRADA' | 'SALIDA' | 'TRASLADO'>('TRASLADO');
  const [transferOrigin, setTransferOrigin] = useState<string>('republica');
  const [transferDest, setTransferDest] = useState<string>('modelo');
  const [transferDateStr, setTransferDateStr] = useState<string>(now.toISOString().split('T')[0]);
  const [transferRef, setTransferRef] = useState<string>('Redistribución de inventario');
  const [transferItems, setTransferItems] = useState<{ productId: string; quantity: number }[]>([]);

  const handleAddTransferItem = () => {
    const available = data.products[0];
    if (available) {
      setTransferItems(prev => [...prev, { productId: available.id, quantity: 5 }]);
    }
  };

  const handleConfirmTransfer = () => {
    if (transferOrigin === transferDest) {
      Swal.fire({ icon: 'warning', title: 'Sedes iguales', text: 'La sede origen y destino deben ser distintas.' });
      return;
    }
    if (transferItems.length === 0) {
      Swal.fire({ icon: 'warning', title: 'Sin productos', text: 'Agrega al menos una prenda para trasladar.' });
      return;
    }

    const originStore = STORES_LIST.find(s => s.id === transferOrigin)!;
    const destStore = STORES_LIST.find(s => s.id === transferDest)!;

    const items: { productId: string; productName: string; quantity: number; costPrice: number; subtotal: number }[] = [];
    let totalUnits = 0;
    let totalCost = 0;

    for (const ti of transferItems) {
      const prod = data.products.find(p => p.id === ti.productId);
      if (prod) {
        const originStock = prod.stocks[transferOrigin] || 0;
        if (originStock < ti.quantity) {
          Swal.fire({
            icon: 'error',
            title: 'Stock insuficiente',
            text: `En ${originStore.shortName} solo hay ${originStock} unidades de ${prod.name}. No se pueden trasladar ${ti.quantity}.`
          });
          return;
        }
        const costSub = ti.quantity * prod.costPrice;
        items.push({
          productId: prod.id,
          productName: prod.name,
          quantity: ti.quantity,
          costPrice: prod.costPrice,
          subtotal: costSub
        });
        totalUnits += ti.quantity;
        totalCost += costSub;
      }
    }

    const movement: CommercialMovement = {
      id: `mov-${Date.now()}`,
      type: 'TRASLADO',
      dateStr: transferDateStr,
      storeId: transferOrigin,
      storeName: originStore.shortName,
      targetStoreId: transferDest,
      targetStoreName: destStore.shortName,
      items,
      totalUnits,
      totalCost,
      reference: transferRef,
      observations: `Traslado confirmado de ${originStore.shortName} a ${destStore.shortName}`,
      createdAt: new Date().toISOString()
    };

    CommercialService.saveMovement(movement);
    refreshData();
    setTransferItems([]);

    Swal.fire({
      icon: 'success',
      title: '¡Traslado Exitoso!',
      html: `
        <p class="text-sm">Se trasladaron <b>${totalUnits} prendas</b> de <b>${originStore.shortName}</b> a <b>${destStore.shortName}</b>.</p>
        <p class="text-xs text-gray-500 mt-2">Los inventarios de ambas sedes se actualizaron al instante.</p>
      `,
      confirmButtonColor: '#007A33'
    });
  };

  // =========================================================================
  // TAB 5: VENTAS MENSUALES (100% DINÁMICO DESDE CUADRES REALES)
  // =========================================================================
  const monthlyDetailedAnalytics = useMemo(() => {
    const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
    const monthPrefix = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;

    const monthlyCuadres = data.cuadres.filter(c => {
      const matchMonth = c.dateStr.startsWith(monthPrefix);
      const matchStore = selectedStoreId === 'all' || c.storeId === selectedStoreId;
      return matchMonth && matchStore && c.status === 'REGISTERED';
    });

    const dailyEvolution = Array.from({ length: daysInMonth }, (_, i) => {
      const dayNum = i + 1;
      const dayDateStr = `${monthPrefix}-${String(dayNum).padStart(2, '0')}`;
      const dayCuadres = monthlyCuadres.filter(c => c.dateStr === dayDateStr);
      const sales = dayCuadres.reduce((acc, c) => acc + c.totalSales, 0);
      const profit = dayCuadres.reduce((acc, c) => acc + c.totalProfit, 0);
      return { day: dayNum, dateStr: dayDateStr, sales, profit };
    });

    const maxDaySale = Math.max(...dailyEvolution.map(d => d.sales), 1);

    const methodsSummary: { [method: string]: number } = {};
    PAYMENT_METHODS.forEach(pm => { methodsSummary[pm.id] = 0; });
    monthlyCuadres.forEach(c => {
      if (c.totalsByMethod) {
        Object.entries(c.totalsByMethod).forEach(([k, v]) => {
          methodsSummary[k] = (methodsSummary[k] || 0) + Number(v);
        });
      }
    });

    const totalVentasMonth = monthlyCuadres.reduce((acc, c) => acc + c.totalSales, 0);

    const productSalesMap: { [pId: string]: { name: string; units: number; sales: number; cost: number; profit: number } } = {};
    monthlyCuadres.forEach(c => {
      c.sales?.forEach(s => {
        if (!productSalesMap[s.productId]) {
          productSalesMap[s.productId] = { name: s.productName, units: 0, sales: 0, cost: 0, profit: 0 };
        }
        productSalesMap[s.productId].units += s.quantity;
        productSalesMap[s.productId].sales += s.subtotal;
        productSalesMap[s.productId].cost += s.costTotal;
        productSalesMap[s.productId].profit += s.profit;
      });
    });

    const topProducts = Object.values(productSalesMap)
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 10);

    const q1Cuadres = monthlyCuadres.filter(c => {
      const day = parseInt(c.dateStr.split('-')[2]);
      return day <= 15;
    });
    const q2Cuadres = monthlyCuadres.filter(c => {
      const day = parseInt(c.dateStr.split('-')[2]);
      return day > 15;
    });

    const q1Sales = q1Cuadres.reduce((acc, c) => acc + c.totalSales, 0);
    const q1Cost = q1Cuadres.reduce((acc, c) => acc + c.totalCost, 0);
    const q1Profit = q1Sales - q1Cost;
    const q1Margin = q1Sales > 0 ? ((q1Profit / q1Sales) * 100).toFixed(1) : '0';

    const q2Sales = q2Cuadres.reduce((acc, c) => acc + c.totalSales, 0);
    const q2Cost = q2Cuadres.reduce((acc, c) => acc + c.totalCost, 0);
    const q2Profit = q2Sales - q2Cost;
    const q2Margin = q2Sales > 0 ? ((q2Profit / q2Sales) * 100).toFixed(1) : '0';

    return {
      dailyEvolution,
      maxDaySale,
      methodsSummary,
      totalVentasMonth,
      topProducts,
      q1: { sales: q1Sales, cost: q1Cost, profit: q1Profit, margin: q1Margin, cuadresCount: q1Cuadres.length },
      q2: { sales: q2Sales, cost: q2Cost, profit: q2Profit, margin: q2Margin, cuadresCount: q2Cuadres.length }
    };
  }, [data.cuadres, selectedMonth, selectedYear, selectedStoreId]);

  // =========================================================================
  // TAB 9: GASTOS Y DEUDAS
  // =========================================================================
  const [newExpenseConcept, setNewExpenseConcept] = useState('');
  const [newExpenseLocal, setNewExpenseLocal] = useState('Global');
  const [newExpenseAmount, setNewExpenseAmount] = useState<number>(0);

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpenseConcept.trim() || newExpenseAmount <= 0) return;

    const exp: CommercialExpense = {
      id: `exp-${Date.now()}`,
      concept: newExpenseConcept.trim(),
      local: newExpenseLocal,
      monthlyAmount: Number(newExpenseAmount),
      category: 'FIJO',
      statusByMonth: { [selectedMonth]: 'PENDIENTE' }
    };

    CommercialService.saveExpense(exp);
    refreshData();
    setNewExpenseConcept('');
    setNewExpenseAmount(0);
  };

  const handleToggleExpense = (id: string) => {
    CommercialService.toggleExpenseMonth(id, selectedMonth);
    refreshData();
  };

  const [selectedDebtForAbono, setSelectedDebtForAbono] = useState<CommercialDebt | null>(null);
  const [abonoAmount, setAbonoAmount] = useState<number>(0);
  const [abonoNotes, setAbonoNotes] = useState<string>('');

  const handleSaveAbono = () => {
    if (!selectedDebtForAbono || abonoAmount <= 0) return;
    CommercialService.addAbono(selectedDebtForAbono.id, abonoAmount, now.toISOString().split('T')[0], abonoNotes);
    refreshData();
    setSelectedDebtForAbono(null);
    setAbonoAmount(0);
    setAbonoNotes('');
    Swal.fire({ icon: 'success', title: 'Abono registrado', text: 'El saldo pendiente se recalculó en tiempo real.' });
  };

  const handleResetToClean = () => {
    Swal.fire({
      title: '¿Limpiar ventas y cuadres?',
      text: 'Esto borrará los cuadres y movimientos registrados para dejar el historial en blanco. El inventario de las 4 sedes se mantendrá con todos los productos.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, limpiar cuadres',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#dc2626'
    }).then(res => {
      if (res.isConfirmed) {
        CommercialService.resetData();
        refreshData();
        Swal.fire({ icon: 'success', title: 'Limpieza completada', text: 'Los cuadres e historiales están limpios para tu registro diario.' });
      }
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* =====================================================================
          HEADER PRINCIPAL: CONTROL DE VENTAS Y FINANZAS
          ===================================================================== */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-black text-white flex items-center justify-center shadow-xs">
              <TrendingUp className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black tracking-tight text-gray-900">Control de Ventas y Finanzas</h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  4 Sedes Activas
                </span>
              </div>
              <p className="text-xs text-gray-500 font-medium">
                Inventarios independientes por sede con los 43 productos reales del Excel, registro de venta con precio manual, y cierres de ventas.
              </p>
            </div>
          </div>

          {/* Selectores de Período y Filtro de Sede */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 bg-gray-50/80 text-xs font-bold">
              <Calendar className="w-3.5 h-3.5 text-gray-500" />
              <select 
                value={selectedMonth} 
                onChange={e => setSelectedMonth(Number(e.target.value))}
                className="bg-transparent font-bold cursor-pointer focus:outline-hidden"
              >
                {MONTH_NAMES.map((m, idx) => (
                  <option key={m} value={idx + 1}>{m}</option>
                ))}
              </select>
              <select 
                value={selectedYear} 
                onChange={e => setSelectedYear(Number(e.target.value))}
                className="bg-transparent font-bold cursor-pointer focus:outline-hidden"
              >
                <option value={2026}>2026</option>
                <option value={2025}>2025</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 bg-gray-50/80 text-xs font-bold">
              <Store className="w-3.5 h-3.5 text-emerald-600" />
              <select 
                value={selectedStoreId} 
                onChange={e => setSelectedStoreId(e.target.value)}
                className="bg-transparent font-bold cursor-pointer focus:outline-hidden"
              >
                <option value="all">Todas las sedes (Consolidado)</option>
                {STORES_LIST.map(st => (
                  <option key={st.id} value={st.id}>{st.shortName}</option>
                ))}
              </select>
            </div>

            <button
              onClick={handleResetToClean}
              className="p-2 text-gray-400 hover:text-red-600 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
              title="Limpiar datos de prueba"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Barra de pestañas horizontal */}
        <div className="flex items-center gap-1.5 mt-5 pt-3 border-t border-gray-100 overflow-x-auto custom-scrollbar text-xs">
          {[
            { id: 'resumen', label: 'Resumen general', icon: TrendingUp },
            { id: 'cargar-ia', label: 'Cargar ventas (IA)', icon: Sparkles },
            { id: 'registro-manual', label: 'Anotar ventas / Cierre', icon: Edit3 },
            { id: 'historial', label: 'Historial de ventas', icon: History },
            { id: 'ventas-mensuales', label: 'Ventas mensuales', icon: BarChart3 },
            { id: 'inventario', label: '4 Inventarios (Por Sede)', icon: Boxes },
            { id: 'movimientos', label: 'Movimientos (Traslados)', icon: ArrowLeftRight },
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
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
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
          VISTA 1: RESUMEN GENERAL (DASHBOARD)
          ===================================================================== */}
      {activeTab === 'resumen' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
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
              <p className="text-[10px] text-gray-400 font-bold">Costo real de compra</p>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-emerald-100 shadow-2xs space-y-1 bg-emerald-50/20">
              <div className="flex items-center justify-between text-xs text-emerald-700 font-medium">
                <span>Ganancia bruta</span>
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              </div>
              <h3 className="text-xl font-black text-emerald-700">{formatPrice(monthlyMetrics.gananciaBruta)}</h3>
              <p className="text-[10px] text-emerald-600/80 font-bold">Venta real - Costo</p>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-2xs space-y-1">
              <div className="flex items-center justify-between text-xs text-gray-500 font-medium">
                <span>Prendas vendidas</span>
                <Tag className="w-4 h-4 text-amber-600" />
              </div>
              <h3 className="text-xl font-black text-gray-900">{monthlyMetrics.prendasVendidas} u</h3>
              <p className="text-[10px] text-gray-400 font-bold">{monthlyMetrics.countCuadres} cierres registrados</p>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-2xs space-y-1 col-span-2 md:col-span-1">
              <div className="flex items-center justify-between text-xs text-gray-500 font-medium">
                <span>Margen obtenido</span>
                <span className="text-[10px] font-bold text-emerald-600">ROI</span>
              </div>
              <h3 className="text-xl font-black text-emerald-700">{monthlyMetrics.margenPct}%</h3>
              <p className="text-[10px] text-gray-400 font-bold">Sobre ventas reales</p>
            </div>
          </div>

          {/* Estado de las 4 Sedes */}
          <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-gray-900">Rendimiento por Sede ({MONTH_NAMES[selectedMonth - 1]})</h3>
                <p className="text-xs text-gray-500">Cada sede opera con su propio inventario y sus propios cierres diarios.</p>
              </div>
              <button
                onClick={() => setActiveTab('ventas-mensuales')}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
              >
                Ver gráficas mensuales <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {STORES_LIST.map(st => {
                const monthPrefix = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;
                const storeCuadres = data.cuadres.filter(c => c.dateStr.startsWith(monthPrefix) && c.storeId === st.id && c.status === 'REGISTERED');
                const sVentas = storeCuadres.reduce((a, b) => a + b.totalSales, 0);
                const sCosto = storeCuadres.reduce((a, b) => a + b.totalCost, 0);
                const sGanancia = sVentas - sCosto;
                const sItems = storeCuadres.reduce((a, b) => a + b.totalItems, 0);
                const storeStockTotal = data.products.reduce((acc, p) => acc + (p.stocks[st.id] || 0), 0);

                return (
                  <div key={st.id} className="p-4 rounded-xl border border-gray-200/80 bg-gray-50/50 space-y-3 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between pb-2 border-b border-gray-200/60">
                        <h4 className="font-black text-xs text-gray-900 truncate">{st.shortName}</h4>
                        <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100/60 px-2 py-0.5 rounded-full">
                          {storeStockTotal} u en stock
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-500 font-medium mt-1">Encargado(a): {st.manager}</p>

                      <div className="grid grid-cols-2 gap-2 text-xs pt-3">
                        <div>
                          <span className="text-[10px] text-gray-400 block font-medium">Ventas</span>
                          <strong className="text-gray-900 font-bold">{formatPrice(sVentas)}</strong>
                        </div>
                        <div>
                          <span className="text-[10px] text-emerald-700 block font-medium">Ganancia</span>
                          <strong className="text-emerald-700 font-bold">{formatPrice(sGanancia)}</strong>
                        </div>
                        <div>
                          <span className="text-[10px] text-gray-400 block font-medium">Prendas vendidas</span>
                          <strong className="text-gray-800 font-bold">{sItems} u</strong>
                        </div>
                        <div>
                          <span className="text-[10px] text-gray-400 block font-medium">Cierres del mes</span>
                          <strong className="text-gray-800 font-bold">{storeCuadres.length}</strong>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setManualStoreId(st.id);
                        setActiveTab('registro-manual');
                      }}
                      className="w-full py-2 bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1 mt-2"
                    >
                      <Plus className="w-3.5 h-3.5" /> Anotar Venta / Cierre
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          VISTA 2: CARGAR VENTAS CON IA
          ===================================================================== */}
      {activeTab === 'cargar-ia' && (
        <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-2xs space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-600" />
                <h2 className="text-base font-black text-gray-900">Cargar ventas con IA (Foto de libreta)</h2>
              </div>
              <p className="text-xs text-gray-500">
                Sube las fotografías de los cuadernos de ventas físicas. La IA detectará los precios anotados y descontará el stock de la sede.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 bg-gray-50 text-xs font-bold">
                <Store className="w-3.5 h-3.5 text-emerald-600" />
                <select
                  value={aiStoreId}
                  onChange={e => setAiStoreId(e.target.value)}
                  className="bg-transparent font-bold cursor-pointer focus:outline-hidden"
                >
                  {STORES_LIST.map(st => (
                    <option key={st.id} value={st.id}>{st.shortName}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 bg-gray-50 text-xs font-bold">
                <Calendar className="w-3.5 h-3.5 text-gray-500" />
                <input
                  type="date"
                  value={aiDateStr}
                  onChange={e => setAiDateStr(e.target.value)}
                  className="bg-transparent font-bold cursor-pointer focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-4 space-y-3">
              <label className="block text-xs font-bold text-gray-700">Fotografías de libreta (hasta 10)</label>
              <div 
                onClick={() => {
                  setAiImages(prev => [...prev, `https://images.unsplash.com/photo-1544717305-2782549b5136?w=400&q=80`]);
                }}
                className="border-2 border-dashed border-gray-300 hover:border-emerald-500 rounded-2xl p-6 text-center cursor-pointer bg-gray-50/50 hover:bg-emerald-50/20 transition-all"
              >
                <UploadCloud className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-xs font-bold text-gray-700">Arrastra o haz clic para subir</p>
                <p className="text-[10px] text-gray-400 mt-1">PNG, JPG, HEIC de cuadernos</p>
              </div>

              {aiImages.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-gray-600">
                    <span>{aiImages.length} fotos cargadas</span>
                    <button onClick={() => setAiImages([])} className="text-red-500 hover:underline text-[11px]">Limpiar</button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {aiImages.map((img, i) => (
                      <div key={i} className="relative rounded-lg overflow-hidden border border-gray-200 h-20 bg-gray-100">
                        <img src={img} alt="Libreta" className="w-full h-full object-cover" />
                        <span className="absolute bottom-1 right-1 bg-black/70 text-white text-[9px] px-1 rounded font-mono">#{i + 1}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={handleSimulateAiRead}
                    disabled={aiIsProcessing}
                    className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {aiIsProcessing ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" /> Procesando con IA...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" /> Escanear Libreta con IA
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            <div className="md:col-span-8 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-gray-800">
                  Partidas detectadas en {STORES_LIST.find(s => s.id === aiStoreId)?.shortName} ({aiVerifiedSales.length} items)
                </h3>
                {aiVerifiedSales.length > 0 && (
                  <button
                    onClick={() => {
                      const prod = data.products[0];
                      if (prod) {
                        setAiVerifiedSales(prev => [
                          ...prev,
                          {
                            id: `ai-manual-${Date.now()}`,
                            productId: prod.id,
                            productName: prod.name,
                            quantity: 1,
                            costPrice: prod.costPrice,
                            sellingPrice: 50000,
                            subtotal: 50000,
                            costTotal: prod.costPrice,
                            profit: 50000 - prod.costPrice,
                            paymentMethod: 'Efectivo',
                            hour: '12:00 m.',
                            verified: true
                          }
                        ]);
                      }
                    }}
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Agregar fila
                  </button>
                )}
              </div>

              {aiVerifiedSales.length === 0 ? (
                <div className="p-8 border border-dashed border-gray-200 rounded-2xl text-center text-gray-400 space-y-2">
                  <FileText className="w-8 h-8 mx-auto text-gray-300" />
                  <p className="text-xs font-medium">Sube una fotografía de la libreta y haz clic en "Escanear Libreta con IA" para validar las ventas.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="border border-gray-200 rounded-xl overflow-hidden shadow-2xs">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200 text-[10px] font-bold text-gray-400 uppercase">
                          <th className="py-2.5 px-3">#</th>
                          <th className="py-2.5 px-3">Producto / Categoría</th>
                          <th className="py-2.5 px-3">Cant.</th>
                          <th className="py-2.5 px-3">Precio venta anotado</th>
                          <th className="py-2.5 px-3">Subtotal</th>
                          <th className="py-2.5 px-3">Método pago</th>
                          <th className="py-2.5 px-3 w-8"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {aiVerifiedSales.map((item, idx) => (
                          <tr key={item.id} className="hover:bg-gray-50/60">
                            <td className="py-2 px-3 font-mono text-gray-400 text-[11px]">{idx + 1}</td>
                            <td className="py-2 px-3">
                              <select
                                value={item.productId}
                                onChange={e => {
                                  const p = data.products.find(x => x.id === e.target.value);
                                  if (p) {
                                    setAiVerifiedSales(prev => prev.map((s, i) => i === idx ? {
                                      ...s,
                                      productId: p.id,
                                      productName: p.name,
                                      costPrice: p.costPrice,
                                      costTotal: s.quantity * p.costPrice,
                                      profit: s.subtotal - (s.quantity * p.costPrice)
                                    } : s));
                                  }
                                }}
                                className="w-full font-bold text-gray-900 border-none bg-transparent focus:outline-hidden"
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
                                value={item.quantity}
                                onChange={e => {
                                  const q = Math.max(1, Number(e.target.value));
                                  setAiVerifiedSales(prev => prev.map((s, i) => i === idx ? {
                                    ...s,
                                    quantity: q,
                                    subtotal: q * s.sellingPrice,
                                    costTotal: q * s.costPrice,
                                    profit: (q * s.sellingPrice) - (q * s.costPrice)
                                  } : s));
                                }}
                                className="w-12 px-1.5 py-0.5 border border-gray-200 rounded font-bold text-center"
                              />
                            </td>
                            <td className="py-2 px-3">
                              <input
                                type="number"
                                step="1000"
                                value={item.sellingPrice}
                                onChange={e => {
                                  const sp = Number(e.target.value);
                                  setAiVerifiedSales(prev => prev.map((s, i) => i === idx ? {
                                    ...s,
                                    sellingPrice: sp,
                                    subtotal: s.quantity * sp,
                                    profit: (s.quantity * sp) - s.costTotal
                                  } : s));
                                }}
                                className="w-24 px-1.5 py-0.5 border border-gray-200 rounded font-mono text-xs font-bold"
                              />
                            </td>
                            <td className="py-2 px-3 font-mono font-bold text-gray-900">{formatPrice(item.subtotal)}</td>
                            <td className="py-2 px-3">
                              <select
                                value={item.paymentMethod}
                                onChange={e => {
                                  const pm = e.target.value;
                                  setAiVerifiedSales(prev => prev.map((s, i) => i === idx ? { ...s, paymentMethod: pm } : s));
                                }}
                                className="px-2 py-0.5 rounded text-xs font-bold border border-gray-200 bg-white"
                              >
                                {PAYMENT_METHODS.map(pm => (
                                  <option key={pm.id} value={pm.id}>{pm.label}</option>
                                ))}
                              </select>
                            </td>
                            <td className="py-2 px-3 text-center">
                              <button
                                onClick={() => setAiVerifiedSales(prev => prev.filter((_, i) => i !== idx))}
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

                  <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-bold text-emerald-950">
                        Total {aiTotals.totalItems} prendas por {formatPrice(aiTotals.totalSales)}
                      </p>
                      <p className="text-[10px] text-gray-500">
                        Al confirmar, se guardará el cierre de {STORES_LIST.find(s => s.id === aiStoreId)?.shortName} y se descontará el stock de esta sede.
                      </p>
                    </div>

                    <button
                      onClick={handleSaveAiCuadre}
                      className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-black shadow-xs flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                    >
                      <Check className="w-4 h-4" /> Confirmar Cierre de Ventas
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          VISTA 3: REGISTRO MANUAL DE VENTAS (PRECIO DE VENTA SE DEFINE AQUÍ)
          ===================================================================== */}
      {activeTab === 'registro-manual' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
              <div>
                <h2 className="text-base font-black text-gray-900">Anotar ventas y Cierre diario</h2>
                <p className="text-xs text-gray-500">
                  Selecciona la prenda, digita el <b>precio de venta al que se vendió</b> y el medio de pago. Al cerrar, se descuenta de esa sede.
                </p>
              </div>

              {/* Selector de Sede y Fecha */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2 border-emerald-600 bg-emerald-50 text-xs font-black text-emerald-900">
                  <Store className="w-4 h-4 text-emerald-700" />
                  <select
                    value={manualStoreId}
                    onChange={e => setManualStoreId(e.target.value)}
                    className="bg-transparent font-black cursor-pointer focus:outline-hidden"
                  >
                    {STORES_LIST.map(st => (
                      <option key={st.id} value={st.id}>{st.shortName}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 bg-gray-50 text-xs font-bold">
                  <Calendar className="w-3.5 h-3.5 text-gray-500" />
                  <input
                    type="date"
                    value={manualDateStr}
                    onChange={e => setManualDateStr(e.target.value)}
                    className="bg-transparent font-bold cursor-pointer focus:outline-hidden"
                  />
                </div>
              </div>
            </div>

            {/* Formulario rápido para anotar una venta */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-3 items-end">
              <div className="sm:col-span-5">
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">
                  Producto / Categoría (Stock en {STORES_LIST.find(s => s.id === manualStoreId)?.shortName}) *
                </label>
                <select
                  value={newManualSale.productId}
                  onChange={e => setNewManualSale({ ...newManualSale, productId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-xs font-bold cursor-pointer"
                >
                  {data.products.map(p => {
                    const stock = p.stocks[manualStoreId] || 0;
                    return (
                      <option key={p.id} value={p.id}>
                        {p.name} · ({stock} u en {STORES_LIST.find(s => s.id === manualStoreId)?.shortName}) - Costo: {formatPrice(p.costPrice)}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Cantidad *</label>
                <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-white">
                  <button
                    type="button"
                    onClick={() => setNewManualSale({ ...newManualSale, quantity: Math.max(1, newManualSale.quantity - 1) })}
                    className="px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 font-bold text-xs"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    value={newManualSale.quantity}
                    onChange={e => setNewManualSale({ ...newManualSale, quantity: Math.max(1, Number(e.target.value)) })}
                    className="w-full text-center text-xs font-bold focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => setNewManualSale({ ...newManualSale, quantity: newManualSale.quantity + 1 })}
                    className="px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 font-bold text-xs"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[10px] font-black text-emerald-800 uppercase mb-1">
                  Precio de venta ($) *
                </label>
                <input
                  type="number"
                  step="1000"
                  placeholder="Ej: 75000"
                  value={newManualSale.sellingPrice}
                  onChange={e => setNewManualSale({ ...newManualSale, sellingPrice: e.target.value })}
                  className="w-full px-2.5 py-2 rounded-xl border-2 border-emerald-500 bg-emerald-50/20 text-xs font-black font-mono text-emerald-950 focus:outline-hidden"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Método de pago *</label>
                <div className="flex items-center gap-2">
                  <select
                    value={newManualSale.paymentMethod}
                    onChange={e => setNewManualSale({ ...newManualSale, paymentMethod: e.target.value })}
                    className="w-full px-2.5 py-2 rounded-xl border border-gray-200 bg-white text-xs font-bold cursor-pointer"
                  >
                    {PAYMENT_METHODS.map(pm => (
                      <option key={pm.id} value={pm.id}>{pm.label}</option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={handleAddManualSale}
                    className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-black cursor-pointer inline-flex items-center gap-1 shrink-0 shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" /> Anotar
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-8 bg-white rounded-2xl border border-gray-200/80 p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                <h3 className="text-xs font-extrabold text-gray-900">
                  Ventas del día en {STORES_LIST.find(s => s.id === manualStoreId)?.shortName} ({manualSales.length} items)
                </h3>
                {manualSales.length > 0 && (
                  <button 
                    onClick={() => setManualSales([])}
                    className="text-[11px] font-bold text-gray-400 hover:text-red-600"
                  >
                    Vaciar lista
                  </button>
                )}
              </div>

              {manualSales.length === 0 ? (
                <div className="p-8 border border-dashed border-gray-200 rounded-2xl text-center text-gray-400 space-y-2">
                  <Edit3 className="w-8 h-8 mx-auto text-gray-300" />
                  <p className="text-xs font-medium">Aún no hay ventas anotadas para este cierre.</p>
                  <p className="text-[11px] text-gray-400">Selecciona la prenda, digita el precio de venta y haz clic en "Anotar".</p>
                  <button
                    onClick={handleMarkNoSalesDirectly}
                    className="mt-2 px-3 py-1.5 border border-amber-300 text-amber-800 bg-amber-50 rounded-xl text-xs font-bold hover:bg-amber-100 transition-colors cursor-pointer"
                  >
                    Marcar Día Sin Ventas ($0)
                  </button>
                </div>
              ) : (
                <div className="border border-gray-200 rounded-xl overflow-hidden shadow-2xs">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200 text-[10px] font-bold text-gray-400 uppercase">
                        <th className="py-2 px-3">#</th>
                        <th className="py-2 px-3">Producto / Categoría</th>
                        <th className="py-2 px-3 text-center">Cant.</th>
                        <th className="py-2 px-3">Precio Venta</th>
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
                          <td className="py-2 px-3 font-bold text-gray-900">{s.productName}</td>
                          <td className="py-2 px-3 text-center font-bold">{s.quantity}</td>
                          <td className="py-2 px-3 font-mono font-bold text-emerald-800">{formatPrice(s.sellingPrice)}</td>
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
              )}

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-gray-100">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 bg-emerald-50 px-3.5 py-2 rounded-xl border border-emerald-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    Conexión con inventario: Estas ventas descontarán automáticamente del stock de <b>{STORES_LIST.find(s => s.id === manualStoreId)?.shortName}</b>.
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleSaveManualCuadre}
                  className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-black shadow-xs flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  <Check className="w-4 h-4" /> Realizar Cierre de Ventas
                </button>
              </div>
            </div>

            <div className="lg:col-span-4 bg-white rounded-2xl border border-gray-200/80 p-5 shadow-2xs space-y-4">
              <h3 className="text-sm font-extrabold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                <span>Cuadre de Caja ({STORES_LIST.find(s => s.id === manualStoreId)?.shortName})</span>
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
                <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Desglose por medio de pago</h4>
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
          VISTA 4: HISTORIAL DE VENTAS
          ===================================================================== */}
      {activeTab === 'historial' && (
        <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-2xs space-y-4 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-3">
            <div>
              <h2 className="text-base font-black text-gray-900">Historial completo de cierres</h2>
              <p className="text-xs text-gray-500">Consulta los cuadres registrados en el mes con desglose detallado.</p>
            </div>
            <button
              onClick={() => {
                Swal.fire({
                  icon: 'info',
                  title: 'Descargar reporte',
                  text: 'Generando archivo Excel con el historial consolidado de cierres...',
                  timer: 1500,
                  showConfirmButton: false
                });
              }}
              className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" /> Descargar Excel
            </button>
          </div>

          <div className="space-y-3">
            {data.cuadres.length === 0 ? (
              <div className="p-10 text-center text-gray-400 space-y-2">
                <History className="w-8 h-8 mx-auto text-gray-300" />
                <p className="text-xs font-medium">Aún no hay cuadres registrados en el sistema.</p>
                <p className="text-[11px] text-gray-400">Ve a "Anotar ventas / Cierre" o "Cargar ventas (IA)" para hacer el primer cierre de ventas.</p>
              </div>
            ) : (
              data.cuadres.filter(c => selectedStoreId === 'all' || c.storeId === selectedStoreId).map(cuadre => (
                <div key={cuadre.id} className="p-4 rounded-xl border border-gray-200/80 bg-gray-50/40 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center font-bold text-xs">
                        {cuadre.storeName.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-black text-xs text-gray-900">{cuadre.storeName} · {cuadre.dateStr}</h4>
                        <p className="text-[10px] text-gray-400">
                          {cuadre.status === 'NO_SALES' 
                            ? 'Día registrado sin ventas ($0)' 
                            : `Total: ${formatPrice(cuadre.totalSales)} · ${cuadre.totalItems} prendas vendidas`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {cuadre.status === 'REGISTERED' && (
                        <span className="text-xs font-bold text-emerald-700">
                          Ganancia: {formatPrice(cuadre.totalProfit)}
                        </span>
                      )}
                      <button
                        onClick={() => {
                          Swal.fire({
                            title: '¿Eliminar este cierre?',
                            text: 'Se revertirá el stock de las prendas vendidas a la sede.',
                            icon: 'warning',
                            showCancelButton: true,
                            confirmButtonText: 'Sí, eliminar',
                            cancelButtonText: 'Cancelar',
                            confirmButtonColor: '#dc2626'
                          }).then(res => {
                            if (res.isConfirmed) {
                              CommercialService.deleteCuadre(cuadre.id, true);
                              refreshData();
                            }
                          });
                        }}
                        className="p-1 text-gray-400 hover:text-red-600 cursor-pointer"
                        title="Eliminar cuadre y revertir stock"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {cuadre.sales && cuadre.sales.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-2 border-t border-gray-100 text-[11px]">
                      {cuadre.sales.map(s => (
                        <div key={s.id} className="p-2 bg-white rounded-lg border border-gray-100 flex items-center justify-between">
                          <span className="font-bold text-gray-800 truncate mr-2">{s.quantity}x {s.productName}</span>
                          <strong className="font-mono text-emerald-800">{formatPrice(s.subtotal)}</strong>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* =====================================================================
          VISTA 5: VENTAS MENSUALES (100% DINÁMICO)
          ===================================================================== */}
      {activeTab === 'ventas-mensuales' && (
        <div className="space-y-6 animate-in fade-in duration-200">
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
              <strong className="text-xl font-black text-gray-900 block mt-1">{monthlyMetrics.prendasVendidas} u</strong>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-2xs col-span-2 sm:col-span-1">
              <span className="text-[10px] text-gray-400 font-bold uppercase block">Margen ganancia</span>
              <strong className="text-xl font-black text-emerald-700 block mt-1">{monthlyMetrics.margenPct}%</strong>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 bg-white rounded-2xl border border-gray-200/80 p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                <div>
                  <h3 className="text-sm font-extrabold text-gray-900">Evolución diaria del mes</h3>
                  <p className="text-xs text-gray-400">Ventas y ganancias registradas en cada día del mes.</p>
                </div>
                <div className="flex items-center gap-3 text-xs font-bold">
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-700"></span> Ventas</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-300"></span> Ganancia</span>
                </div>
              </div>

              <div className="h-56 flex items-end gap-1.5 pt-4 pb-2 px-1 overflow-x-auto custom-scrollbar">
                {monthlyDetailedAnalytics.dailyEvolution.map(d => {
                  const barHeight = d.sales > 0 
                    ? Math.max(12, Math.round((d.sales / monthlyDetailedAnalytics.maxDaySale) * 100)) 
                    : 0;

                  return (
                    <div key={d.day} className="flex-1 min-w-[18px] flex flex-col items-center justify-end h-full group relative">
                      {d.sales > 0 && (
                        <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white text-[9px] px-1.5 py-0.5 rounded whitespace-nowrap z-10 pointer-events-none">
                          Día {d.day}: {formatPrice(d.sales)}
                        </div>
                      )}
                      {d.sales > 0 ? (
                        <div 
                          style={{ height: `${barHeight}%` }} 
                          className="w-full bg-emerald-700 hover:bg-emerald-800 rounded-t-sm transition-all"
                        />
                      ) : (
                        <div className="w-full h-1 bg-gray-100 rounded-full" />
                      )}
                      <span className="text-[9px] font-mono text-gray-400 mt-1">{d.day}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="lg:col-span-4 bg-white rounded-2xl border border-gray-200/80 p-5 shadow-2xs space-y-4">
              <h3 className="text-sm font-extrabold text-gray-900 border-b border-gray-100 pb-2">
                Métodos de pago del mes
              </h3>
              <div className="space-y-2">
                {PAYMENT_METHODS.map(pm => {
                  const amt = monthlyDetailedAnalytics.methodsSummary[pm.id] || 0;
                  const pct = monthlyDetailedAnalytics.totalVentasMonth > 0 
                    ? ((amt / monthlyDetailedAnalytics.totalVentasMonth) * 100).toFixed(1) 
                    : '0';

                  return (
                    <div key={pm.id} className="p-2 rounded-xl border border-gray-100 bg-gray-50/50 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: pm.color }} />
                        <span className="font-bold text-gray-700">{pm.label}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-bold text-gray-900 block">{formatPrice(amt)}</span>
                        <span className="text-[10px] text-gray-400">{pct}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 bg-white rounded-2xl border border-gray-200/80 p-5 shadow-2xs space-y-3">
              <h3 className="text-sm font-extrabold text-gray-900 border-b border-gray-100 pb-2">
                Ventas por producto (Top 10)
              </h3>
              {monthlyDetailedAnalytics.topProducts.length === 0 ? (
                <p className="text-xs text-gray-400 py-6 text-center">No hay ventas registradas aún en este período.</p>
              ) : (
                <div className="border border-gray-200 rounded-xl overflow-hidden shadow-2xs">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200 text-[10px] font-bold text-gray-400 uppercase">
                        <th className="py-2 px-3">#</th>
                        <th className="py-2 px-3">Producto</th>
                        <th className="py-2 px-3 text-center">Uds</th>
                        <th className="py-2 px-3">Total vendido</th>
                        <th className="py-2 px-3">Ganancia</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {monthlyDetailedAnalytics.topProducts.map((tp, idx) => (
                        <tr key={idx} className="hover:bg-gray-50/60">
                          <td className="py-2 px-3 font-mono text-gray-400 text-[11px]">{idx + 1}</td>
                          <td className="py-2 px-3 font-bold text-gray-900">{tp.name}</td>
                          <td className="py-2 px-3 text-center font-bold">{tp.units}</td>
                          <td className="py-2 px-3 font-mono">{formatPrice(tp.sales)}</td>
                          <td className="py-2 px-3 font-mono font-bold text-emerald-700">{formatPrice(tp.profit)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="lg:col-span-5 bg-white rounded-2xl border border-gray-200/80 p-5 shadow-2xs space-y-3">
              <h3 className="text-sm font-extrabold text-gray-900 border-b border-gray-100 pb-2">
                Resumen financiero por quincena
              </h3>
              <div className="space-y-3">
                <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-100 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-gray-800 text-xs">1.ª Quincena (1 – 15 {MONTH_NAMES[selectedMonth - 1]})</span>
                    <span className="text-[10px] text-gray-400 font-bold">{monthlyDetailedAnalytics.q1.cuadresCount} cierres</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 pt-1 border-t border-gray-200/60 text-[11px]">
                    <div><span className="text-gray-400 block text-[10px]">Ventas</span><strong>{formatPrice(monthlyDetailedAnalytics.q1.sales)}</strong></div>
                    <div><span className="text-gray-400 block text-[10px]">Costo</span><strong>{formatPrice(monthlyDetailedAnalytics.q1.cost)}</strong></div>
                    <div><span className="text-gray-400 block text-[10px]">Ganancia</span><strong className="text-emerald-700">{formatPrice(monthlyDetailedAnalytics.q1.profit)}</strong></div>
                  </div>
                </div>

                <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-100 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-gray-800 text-xs">2.ª Quincena (16 – fin de mes)</span>
                    <span className="text-[10px] text-gray-400 font-bold">{monthlyDetailedAnalytics.q2.cuadresCount} cierres</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 pt-1 border-t border-gray-200/60 text-[11px]">
                    <div><span className="text-gray-400 block text-[10px]">Ventas</span><strong>{formatPrice(monthlyDetailedAnalytics.q2.sales)}</strong></div>
                    <div><span className="text-gray-400 block text-[10px]">Costo</span><strong>{formatPrice(monthlyDetailedAnalytics.q2.cost)}</strong></div>
                    <div><span className="text-gray-400 block text-[10px]">Ganancia</span><strong className="text-emerald-700">{formatPrice(monthlyDetailedAnalytics.q2.profit)}</strong></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          VISTA 6: 4 INVENTARIOS POR SEDE (SOLO 1 NOMBRE: CATEGORÍA/PRODUCTO, SIN PRECIO VENTA)
          ===================================================================== */}
      {activeTab === 'inventario' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-gray-200/80 p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Inventario de la Sede</span>
              <div className="flex flex-wrap items-center gap-1.5 mt-1">
                {STORES_LIST.map(st => (
                  <button
                    key={st.id}
                    onClick={() => setInvStoreFilter(st.id as any)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      invStoreFilter === st.id 
                        ? 'bg-emerald-700 text-white shadow-xs' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Inventario {st.shortName}
                  </button>
                ))}
                <button
                  onClick={() => setInvStoreFilter('all')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    invStoreFilter === 'all' 
                      ? 'bg-black text-white shadow-xs' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Consolidado (Todas)
                </button>
              </div>
            </div>

            <button
              onClick={() => setIsNewProductModalOpen(true)}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" /> Crear Producto
            </button>
          </div>

          {/* Top KPIs de inventario: Solo existencias y costos de compra */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-2xs">
              <span className="text-[10px] text-gray-400 font-bold uppercase block">Referencias activas</span>
              <strong className="text-xl font-black text-gray-900 block mt-1">{inventoryKpis.totalProds}</strong>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-2xs">
              <span className="text-[10px] text-gray-400 font-bold uppercase block">
                Stock total ({invStoreFilter === 'all' ? 'Todas las sedes' : STORES_LIST.find(s => s.id === invStoreFilter)?.shortName})
              </span>
              <strong className="text-xl font-black text-gray-900 block mt-1">{inventoryKpis.totalStockSede} u</strong>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-2xs">
              <span className="text-[10px] text-gray-400 font-bold uppercase block">Valor inventario (costo compra)</span>
              <strong className="text-xl font-black text-blue-700 block mt-1">{formatPrice(inventoryKpis.valorInventarioCosto)}</strong>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-2xs">
              <span className="text-[10px] text-gray-400 font-bold uppercase block">Costo promedio por prenda</span>
              <strong className="text-xl font-black text-gray-800 block mt-1">{formatPrice(inventoryKpis.costoPromedio)}</strong>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Tabla de Inventario (SOLO 1 NOMBRE: PRODUCTO/CATEGORÍA, SIN CATEGORÍA NI PRECIO VENTA) */}
            <div className="lg:col-span-8 bg-white rounded-2xl border border-gray-200/80 p-5 shadow-2xs space-y-4">
              <div className="flex items-center gap-2 relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3" />
                <input
                  type="text"
                  placeholder="Buscar por nombre de producto / categoría..."
                  value={invSearch}
                  onChange={e => setInvSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-hidden"
                />
              </div>

              <div className="border border-gray-200 rounded-xl overflow-hidden shadow-2xs">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-[10px] font-bold text-gray-400 uppercase">
                      <th className="py-2.5 px-3">#</th>
                      <th className="py-2.5 px-3">Producto / Categoría</th>
                      <th className="py-2.5 px-3">Costo de compra</th>
                      {invStoreFilter === 'all' ? (
                        <>
                          <th className="py-2.5 px-2 text-center">Rep.</th>
                          <th className="py-2.5 px-2 text-center">Mod.</th>
                          <th className="py-2.5 px-2 text-center">Qual.</th>
                          <th className="py-2.5 px-2 text-center">Mar.</th>
                          <th className="py-2.5 px-2 text-center">Total Stock</th>
                          <th className="py-2.5 px-3">Valoración costo</th>
                        </>
                      ) : (
                        <>
                          <th className="py-2.5 px-3 text-center">Stock ({STORES_LIST.find(s => s.id === invStoreFilter)?.shortName})</th>
                          <th className="py-2.5 px-3">Valoración costo</th>
                        </>
                      )}
                      <th className="py-2.5 px-3 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredInventory.map((p, idx) => {
                      const stockVal = invStoreFilter === 'all' ? 0 : (p.stocks[invStoreFilter] || 0);
                      const totalAll = STORES_LIST.reduce((acc, s) => acc + (p.stocks[s.id] || 0), 0);

                      return (
                        <tr key={p.id} className="hover:bg-gray-50/70">
                          <td className="py-2.5 px-3 font-mono text-gray-400 text-[11px]">{idx + 1}</td>
                          <td className="py-2.5 px-3 font-bold text-gray-900">{p.name}</td>
                          <td className="py-2.5 px-3 font-mono font-bold text-gray-700">{formatPrice(p.costPrice)}</td>
                          {invStoreFilter === 'all' ? (
                            <>
                              <td className="py-2.5 px-2 text-center font-bold text-gray-700">{p.stocks.republica || 0}</td>
                              <td className="py-2.5 px-2 text-center font-bold text-gray-700">{p.stocks.modelo || 0}</td>
                              <td className="py-2.5 px-2 text-center font-bold text-gray-700">{p.stocks.quality || 0}</td>
                              <td className="py-2.5 px-2 text-center font-bold text-gray-700">{p.stocks.mariano || 0}</td>
                              <td className="py-2.5 px-2 text-center font-black text-emerald-800">{totalAll}</td>
                              <td className="py-2.5 px-3 font-mono font-bold text-gray-800">{formatPrice(totalAll * p.costPrice)}</td>
                            </>
                          ) : (
                            <>
                              <td className="py-2.5 px-3 text-center">
                                <span className={`px-2 py-0.5 rounded-full font-bold text-xs ${stockVal > 10 ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'}`}>
                                  {stockVal}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 font-mono font-bold text-gray-800">{formatPrice(stockVal * p.costPrice)}</td>
                            </>
                          )}
                          <td className="py-2.5 px-3 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => setSelectedProductEdit(p)}
                                className="p-1 text-gray-500 hover:text-black cursor-pointer"
                                title="Editar costo y stock"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(p.id, p.name)}
                                className="p-1 text-gray-400 hover:text-red-600 cursor-pointer"
                                title="Eliminar producto"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Panel de edición rápida de costo y stock (1 solo nombre) */}
            <div className="lg:col-span-4 bg-white rounded-2xl border border-gray-200/80 p-5 shadow-2xs space-y-4">
              <h3 className="text-sm font-extrabold text-gray-900 border-b border-gray-100 pb-2">
                {selectedProductEdit ? `Editar: ${selectedProductEdit.name}` : 'Ajustar Inventario'}
              </h3>

              {selectedProductEdit ? (
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Nombre / Categoría</label>
                    <input
                      type="text"
                      value={selectedProductEdit.name}
                      onChange={e => setSelectedProductEdit({ ...selectedProductEdit, name: e.target.value.toUpperCase() })}
                      className="w-full px-3 py-1.5 rounded-xl border border-gray-200 font-bold uppercase"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Costo de compra ($) *</label>
                    <input
                      type="number"
                      value={selectedProductEdit.costPrice}
                      onChange={e => setSelectedProductEdit({ ...selectedProductEdit, costPrice: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 rounded-xl border border-gray-200 font-bold font-mono"
                    />
                  </div>

                  {/* Stock en las 4 sedes */}
                  <div className="space-y-2 pt-2 border-t border-gray-100">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Stock en las 4 Sedes</span>
                    <div className="grid grid-cols-2 gap-2">
                      {STORES_LIST.map(st => (
                        <div key={st.id} className="p-2 rounded-lg bg-gray-50 border border-gray-100">
                          <label className="text-[10px] font-bold text-gray-600 block">{st.shortName}</label>
                          <input
                            type="number"
                            value={selectedProductEdit.stocks[st.id] || 0}
                            onChange={e => setSelectedProductEdit({
                              ...selectedProductEdit,
                              stocks: { ...selectedProductEdit.stocks, [st.id]: Number(e.target.value) }
                            })}
                            className="w-full mt-1 px-2 py-1 bg-white rounded border border-gray-200 font-mono font-bold text-center"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      onClick={() => {
                        CommercialService.saveProduct(selectedProductEdit);
                        refreshData();
                        setSelectedProductEdit(null);
                        Swal.fire({ icon: 'success', title: 'Guardado', text: 'Inventario y costos actualizados.', timer: 1200 });
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
                  Selecciona el lápiz en cualquier producto para modificar su costo de compra o existencias en cada una de las 4 sedes.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal para Crear Producto (SOLO 1 NOMBRE: CATEGORÍA/PRODUCTO Y COSTO) */}
      {isNewProductModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-black text-gray-900">Crear Nuevo Producto en Inventario</h3>
              <button onClick={() => setIsNewProductModalOpen(false)} className="text-gray-400 hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Nombre del producto / categoría *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: HOODIE OVERSIZE"
                  value={newProductForm.name}
                  onChange={e => setNewProductForm({ ...newProductForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 font-bold uppercase"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Costo de compra ($) *</label>
                <input
                  type="number"
                  required
                  placeholder="Ej: 35000"
                  value={newProductForm.costPrice || ''}
                  onChange={e => setNewProductForm({ ...newProductForm, costPrice: Number(e.target.value) })}
                  className="w-full px-2.5 py-2 rounded-xl border border-gray-200 font-mono font-bold"
                />
              </div>

              {/* Stock inicial en las 4 sedes */}
              <div className="space-y-2 pt-2 border-t border-gray-100">
                <span className="text-[10px] font-bold text-gray-600 uppercase tracking-wider block">Stock Inicial en las 4 Sedes</span>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 rounded-lg bg-gray-50 border border-gray-100">
                    <label className="text-[10px] font-bold text-gray-600 block">Sede República</label>
                    <input
                      type="number"
                      min="0"
                      value={newProductForm.stockRepublica}
                      onChange={e => setNewProductForm({ ...newProductForm, stockRepublica: Number(e.target.value) })}
                      className="w-full mt-1 px-2 py-1 bg-white rounded border border-gray-200 font-mono font-bold text-center"
                    />
                  </div>
                  <div className="p-2 rounded-lg bg-gray-50 border border-gray-100">
                    <label className="text-[10px] font-bold text-gray-600 block">Sede Ciudad Modelo</label>
                    <input
                      type="number"
                      min="0"
                      value={newProductForm.stockModelo}
                      onChange={e => setNewProductForm({ ...newProductForm, stockModelo: Number(e.target.value) })}
                      className="w-full mt-1 px-2 py-1 bg-white rounded border border-gray-200 font-mono font-bold text-center"
                    />
                  </div>
                  <div className="p-2 rounded-lg bg-gray-50 border border-gray-100">
                    <label className="text-[10px] font-bold text-gray-600 block">Sede Quality Store</label>
                    <input
                      type="number"
                      min="0"
                      value={newProductForm.stockQuality}
                      onChange={e => setNewProductForm({ ...newProductForm, stockQuality: Number(e.target.value) })}
                      className="w-full mt-1 px-2 py-1 bg-white rounded border border-gray-200 font-mono font-bold text-center"
                    />
                  </div>
                  <div className="p-2 rounded-lg bg-gray-50 border border-gray-100">
                    <label className="text-[10px] font-bold text-gray-600 block">Sede Mariano Ramos</label>
                    <input
                      type="number"
                      min="0"
                      value={newProductForm.stockMariano}
                      onChange={e => setNewProductForm({ ...newProductForm, stockMariano: Number(e.target.value) })}
                      className="w-full mt-1 px-2 py-1 bg-white rounded border border-gray-200 font-mono font-bold text-center"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsNewProductModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold"
                >
                  Crear Producto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          VISTA 7: MOVIMIENTOS Y TRASLADOS
          ===================================================================== */}
      {activeTab === 'movimientos' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-gray-200/80 p-2 shadow-2xs flex items-center gap-2">
            <button
              onClick={() => setMovementSubTab('TRASLADO')}
              className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                movementSubTab === 'TRASLADO' 
                  ? 'bg-emerald-700 text-white shadow-xs' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <ArrowLeftRight className="w-4 h-4" /> Traslado entre sedes
            </button>
            <button
              onClick={() => setMovementSubTab('ENTRADA')}
              className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                movementSubTab === 'ENTRADA' 
                  ? 'bg-emerald-700 text-white shadow-xs' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <ArrowDownLeft className="w-4 h-4" /> Entrada de mercancía
            </button>
            <button
              onClick={() => setMovementSubTab('SALIDA')}
              className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                movementSubTab === 'SALIDA' 
                  ? 'bg-emerald-700 text-white shadow-xs' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <ArrowUpRight className="w-4 h-4" /> Salida / Bajas
            </button>
          </div>

          {movementSubTab === 'TRASLADO' && (
            <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-2xs space-y-5">
              <div className="border-b border-gray-100 pb-3">
                <h3 className="text-sm font-extrabold text-gray-900">Registrar traslado entre sedes</h3>
                <p className="text-xs text-gray-500">
                  Mueve mercancía de una tienda a otra. El sistema descuenta automáticamente las unidades en la sede origen y las suma en la sede destino.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Sede origen *</label>
                  <select
                    value={transferOrigin}
                    onChange={e => setTransferOrigin(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 font-bold bg-white"
                  >
                    {STORES_LIST.map(st => (
                      <option key={st.id} value={st.id}>{st.shortName}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Sede destino *</label>
                  <select
                    value={transferDest}
                    onChange={e => setTransferDest(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 font-bold bg-white"
                  >
                    {STORES_LIST.filter(s => s.id !== transferOrigin).map(st => (
                      <option key={st.id} value={st.id}>{st.shortName}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Fecha *</label>
                  <input
                    type="date"
                    value={transferDateStr}
                    onChange={e => setTransferDateStr(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 font-bold bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Referencia / Motivo</label>
                  <input
                    type="text"
                    value={transferRef}
                    onChange={e => setTransferRef(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 font-bold bg-white"
                  />
                </div>
              </div>

              <div className="space-y-3 pt-3 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-gray-800">Prendas a trasladar</h4>
                  <button
                    onClick={handleAddTransferItem}
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Agregar producto
                  </button>
                </div>

                {transferItems.length === 0 ? (
                  <div className="p-6 border border-dashed border-gray-200 rounded-xl text-center text-gray-400 text-xs">
                    Haz clic en "+ Agregar producto" para seleccionar las prendas que saldrán de {STORES_LIST.find(s => s.id === transferOrigin)?.shortName}.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {transferItems.map((item, idx) => {
                      const prod = data.products.find(p => p.id === item.productId);
                      const originStock = prod ? (prod.stocks[transferOrigin] || 0) : 0;
                      const destStock = prod ? (prod.stocks[transferDest] || 0) : 0;

                      return (
                        <div key={idx} className="p-3 rounded-xl border border-gray-200 bg-gray-50/50 grid grid-cols-12 gap-3 items-center text-xs">
                          <div className="col-span-6">
                            <select
                              value={item.productId}
                              onChange={e => {
                                const newId = e.target.value;
                                setTransferItems(prev => prev.map((x, i) => i === idx ? { ...x, productId: newId } : x));
                              }}
                              className="w-full font-bold bg-white px-2.5 py-1.5 rounded-lg border border-gray-200"
                            >
                              {data.products.map(p => (
                                <option key={p.id} value={p.id}>{p.name} (Stock Origen: {p.stocks[transferOrigin] || 0})</option>
                              ))}
                            </select>
                          </div>

                          <div className="col-span-2">
                            <input
                              type="number"
                              min="1"
                              max={originStock}
                              value={item.quantity}
                              onChange={e => {
                                const q = Math.max(1, Number(e.target.value));
                                setTransferItems(prev => prev.map((x, i) => i === idx ? { ...x, quantity: q } : x));
                              }}
                              className="w-full px-2 py-1.5 border border-gray-200 rounded-lg bg-white font-mono font-bold text-center"
                            />
                          </div>

                          <div className="col-span-3 text-[11px] text-gray-500">
                            <span>Origen: {originStock} → <b>{Math.max(0, originStock - item.quantity)}</b></span><br/>
                            <span>Destino: {destStock} → <b>{destStock + item.quantity}</b></span>
                          </div>

                          <div className="col-span-1 text-right">
                            <button
                              onClick={() => setTransferItems(prev => prev.filter((_, i) => i !== idx))}
                              className="text-gray-400 hover:text-red-600"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}

                    <div className="pt-3 flex justify-end">
                      <button
                        onClick={handleConfirmTransfer}
                        className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-black shadow-xs flex items-center gap-2 cursor-pointer"
                      >
                        <ArrowLeftRight className="w-4 h-4" /> Confirmar Traslado
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* =====================================================================
          VISTA 8: CONTROL DE CUADRES PENDIENTES
          ===================================================================== */}
      {activeTab === 'cuadres' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-2xs">
              <span className="text-[10px] text-gray-400 font-bold uppercase block">Días con cuadre registrado</span>
              <strong className="text-xl font-black text-emerald-700 block mt-1">{cuadresMatrixData.countConCuadre}</strong>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-red-100 bg-red-50/20 shadow-2xs">
              <span className="text-[10px] text-red-600 font-bold uppercase block">Días pendientes</span>
              <strong className="text-xl font-black text-red-600 block mt-1">{cuadresMatrixData.countPendientes}</strong>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-2xs">
              <span className="text-[10px] text-gray-400 font-bold uppercase block">Días sin ventas ($0)</span>
              <strong className="text-xl font-black text-amber-600 block mt-1">{cuadresMatrixData.countSinVentas}</strong>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-emerald-100 bg-emerald-50/20 shadow-2xs">
              <span className="text-[10px] text-emerald-700 font-bold uppercase block">Cumplimiento de cuadres</span>
              <strong className="text-xl font-black text-emerald-800 block mt-1">{cuadresMatrixData.pct}%</strong>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-8 bg-white rounded-2xl border border-gray-200/80 p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                <div>
                  <h3 className="text-sm font-extrabold text-gray-900">Cuadre por sede ({MONTH_NAMES[selectedMonth - 1]} {selectedYear})</h3>
                  <p className="text-xs text-gray-400">Seguimiento diario de cierres en las 4 tiendas físicas.</p>
                </div>
                <div className="flex items-center gap-3 text-[11px] font-bold">
                  <span className="flex items-center gap-1 text-emerald-700">✓ Registrado</span>
                  <span className="flex items-center gap-1 text-amber-600">– Sin ventas</span>
                  <span className="flex items-center gap-1 text-red-600">🕒 Pendiente</span>
                </div>
              </div>

              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-center border-collapse text-[11px]">
                  <thead>
                    <tr className="border-b border-gray-100 text-gray-400 text-[10px] font-bold">
                      <th className="text-left py-2 px-3 font-bold text-gray-700 w-32">Sede</th>
                      {cuadresMatrixData.daysArray.map(day => (
                        <th key={day} className="py-2 px-1 min-w-[24px] font-mono">{String(day).padStart(2, '0')}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {STORES_LIST.map(st => (
                      <tr key={st.id} className="hover:bg-gray-50/60">
                        <td className="text-left py-3 px-3 font-bold text-gray-900 truncate">{st.shortName}</td>
                        {cuadresMatrixData.daysArray.map(day => {
                          const dateStr = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                          const found = data.cuadres.find(c => c.dateStr === dateStr && c.storeId === st.id);
                          const isPastOrToday = cuadresMatrixData.isCurrentMonth ? day <= cuadresMatrixData.currentDay : true;

                          if (found && found.status === 'REGISTERED') {
                            return (
                              <td key={day} className="py-2 px-1">
                                <span 
                                  title={`${st.shortName} · ${dateStr}: ${formatPrice(found.totalSales)}`}
                                  className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold inline-flex items-center justify-center text-[10px]"
                                >
                                  ✓
                                </span>
                              </td>
                            );
                          } else if (found && found.status === 'NO_SALES') {
                            return (
                              <td key={day} className="py-2 px-1">
                                <span 
                                  title={`${st.shortName} · ${dateStr}: Sin ventas ($0)`}
                                  className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 font-bold inline-flex items-center justify-center text-[10px]"
                                >
                                  –
                                </span>
                              </td>
                            );
                          } else if (isPastOrToday) {
                            return (
                              <td key={day} className="py-2 px-1">
                                <button
                                  onClick={() => handleOpenPendingCuadre(st.id, dateStr)}
                                  title={`Pendiente: Cargar ventas para ${st.shortName} del ${dateStr}`}
                                  className="w-5 h-5 rounded-full bg-red-100 text-red-600 font-bold inline-flex items-center justify-center text-[10px] hover:bg-red-200 cursor-pointer"
                                >
                                  🕒
                                </button>
                              </td>
                            );
                          } else {
                            return (
                              <td key={day} className="py-2 px-1 text-gray-200">·</td>
                            );
                          }
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="lg:col-span-4 bg-white rounded-2xl border border-gray-200/80 p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                <h3 className="text-sm font-extrabold text-gray-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-red-600" />
                  <span>Días pendientes de cierre</span>
                </h3>
                <span className="text-xs font-bold text-red-600">{cuadresMatrixData.pendingList.length}</span>
              </div>

              {cuadresMatrixData.pendingList.length === 0 ? (
                <div className="p-6 text-center text-emerald-700 bg-emerald-50/50 rounded-xl border border-emerald-100 text-xs font-bold space-y-1">
                  <CheckCircle2 className="w-6 h-6 mx-auto text-emerald-600" />
                  <p>¡Al día! No hay cuadres pendientes en ninguna de las 4 sedes.</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
                  {cuadresMatrixData.pendingList.map((p, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl border border-red-100 bg-red-50/30 flex items-center justify-between text-xs">
                      <div>
                        <strong className="text-gray-900 block">{p.storeName}</strong>
                        <span className="text-[10px] text-gray-500 font-mono">{p.dateStr}</span>
                      </div>
                      <button
                        onClick={() => handleOpenPendingCuadre(p.storeId, p.dateStr)}
                        className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-[10px] font-bold cursor-pointer"
                      >
                        Cargar cuadre
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          VISTA 9: GASTOS Y DEUDAS
          ===================================================================== */}
      {activeTab === 'gastos-deudas' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-6 bg-white rounded-2xl border border-gray-200/80 p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                <h3 className="text-sm font-extrabold text-gray-900">Gastos Fijos ({MONTH_NAMES[selectedMonth - 1]})</h3>
                <span className="text-xs font-bold text-gray-500">
                  Total: {formatPrice(data.expenses.reduce((a, b) => a + b.monthlyAmount, 0))}
                </span>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
                {data.expenses.map(exp => {
                  const isPaid = exp.statusByMonth?.[selectedMonth] === 'PAGADO';
                  return (
                    <div key={exp.id} className="p-2.5 rounded-xl border border-gray-100 bg-gray-50/50 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-gray-900 block">{exp.concept}</span>
                        <span className="text-[10px] text-gray-400">{exp.local} · {formatPrice(exp.monthlyAmount)}</span>
                      </div>
                      <button
                        onClick={() => handleToggleExpense(exp.id)}
                        className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                          isPaid ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {isPaid ? 'PAGADO' : 'PENDIENTE'}
                      </button>
                    </div>
                  );
                })}
              </div>

              <form onSubmit={handleAddExpense} className="pt-3 border-t border-gray-100 grid grid-cols-12 gap-2 text-xs">
                <input
                  type="text"
                  placeholder="Concepto del gasto..."
                  value={newExpenseConcept}
                  onChange={e => setNewExpenseConcept(e.target.value)}
                  className="col-span-6 px-2.5 py-1.5 rounded-xl border border-gray-200 font-bold"
                />
                <input
                  type="number"
                  placeholder="Monto ($)"
                  value={newExpenseAmount || ''}
                  onChange={e => setNewExpenseAmount(Number(e.target.value))}
                  className="col-span-4 px-2.5 py-1.5 rounded-xl border border-gray-200 font-mono font-bold"
                />
                <button
                  type="submit"
                  className="col-span-2 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold"
                >
                  <Plus className="w-4 h-4 mx-auto" />
                </button>
              </form>
            </div>

            <div className="lg:col-span-6 bg-white rounded-2xl border border-gray-200/80 p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                <h3 className="text-sm font-extrabold text-gray-900">Deudas con Proveedores y Cartera</h3>
                <span className="text-xs font-bold text-red-600">
                  Saldo pendiente: {formatPrice(data.debts.reduce((a, b) => a + b.pendingBalance, 0))}
                </span>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
                {data.debts.map(debt => (
                  <div key={debt.id} className="p-3 rounded-xl border border-gray-200 bg-gray-50/50 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-gray-900">{debt.thirdParty}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${debt.status === 'PAGADO' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                        {debt.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500">{debt.concept}</p>
                    <div className="flex items-center justify-between pt-1 border-t border-gray-200/60 font-mono text-[11px]">
                      <span>Inicial: {formatPrice(debt.totalInitial)}</span>
                      <span>Abonado: <b className="text-emerald-700">{formatPrice(debt.totalAbonado)}</b></span>
                      <span>Saldo: <b className="text-red-600">{formatPrice(debt.pendingBalance)}</b></span>
                    </div>
                    {debt.pendingBalance > 0 && (
                      <button
                        onClick={() => {
                          setSelectedDebtForAbono(debt);
                          setAbonoAmount(0);
                        }}
                        className="w-full mt-1 py-1 bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-200 rounded text-[10px] font-bold cursor-pointer"
                      >
                        + Registrar Abono
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal para Abonos */}
      {selectedDebtForAbono && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-xl">
            <h3 className="text-sm font-black text-gray-900">
              Registrar Abono: {selectedDebtForAbono.thirdParty}
            </h3>
            <p className="text-xs text-gray-500">Saldo pendiente: {formatPrice(selectedDebtForAbono.pendingBalance)}</p>

            <div className="space-y-2 text-xs">
              <label className="block text-[10px] font-bold text-gray-400 uppercase">Valor del Abono ($) *</label>
              <input
                type="number"
                max={selectedDebtForAbono.pendingBalance}
                value={abonoAmount}
                onChange={e => setAbonoAmount(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 font-bold font-mono"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedDebtForAbono(null)}
                className="px-3 py-1.5 border border-gray-200 rounded-xl font-bold text-gray-600"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveAbono}
                className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold"
              >
                Confirmar Abono
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          VISTA 10: REPORTES
          ===================================================================== */}
      {activeTab === 'reportes' && (
        <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-2xs space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <h2 className="text-base font-black text-gray-900">Reportes comerciales y comparativos</h2>
              <p className="text-xs text-gray-500">Desempeño consolidado de ventas, costos y ganancias entre sedes.</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => Swal.fire({ icon: 'info', title: 'Exportar Excel', text: 'Descargando consolidado comercial...' })}
                className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" /> Descargar Excel
              </button>
              <button
                onClick={() => window.print()}
                className="px-3 py-1.5 border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" /> Imprimir
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {STORES_LIST.map(st => {
              const monthPrefix = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;
              const sCuadres = data.cuadres.filter(c => c.dateStr.startsWith(monthPrefix) && c.storeId === st.id && c.status === 'REGISTERED');
              const ventas = sCuadres.reduce((a, b) => a + b.totalSales, 0);
              const costo = sCuadres.reduce((a, b) => a + b.totalCost, 0);
              const ganancia = ventas - costo;

              return (
                <div key={st.id} className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 space-y-2">
                  <h4 className="font-extrabold text-xs text-gray-900">{st.shortName}</h4>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between text-gray-600"><span>Ventas:</span><b className="font-mono">{formatPrice(ventas)}</b></div>
                    <div className="flex justify-between text-gray-600"><span>Costo:</span><b className="font-mono">{formatPrice(costo)}</b></div>
                    <div className="flex justify-between text-emerald-700"><span>Ganancia:</span><b className="font-mono">{formatPrice(ganancia)}</b></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =====================================================================
          VISTA 11: IMPORTAR EXCEL
          ===================================================================== */}
      {activeTab === 'importar' && (
        <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-2xs space-y-6 animate-in fade-in duration-200">
          <div className="border-b border-gray-100 pb-3">
            <h2 className="text-base font-black text-gray-900">Importación inicial desde Excel</h2>
            <p className="text-xs text-gray-500">Carga los productos, costos de compra y existencias de tus 4 sedes en una sola vez.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            <div className="md:col-span-4 p-5 rounded-2xl border border-gray-200 bg-gray-50/50 space-y-3">
              <UploadCloud className="w-8 h-8 text-emerald-600 mx-auto" />
              <h4 className="text-xs font-bold text-center text-gray-800">Sube tu archivo de Excel</h4>
              <p className="text-[10px] text-gray-400 text-center">Formatos .xlsx o .csv con pestañas por sede.</p>
              <button
                onClick={() => {
                  Swal.fire({
                    icon: 'success',
                    title: 'Excel Reconocido',
                    text: 'Se detectaron las 4 sedes y 43 productos del inventario con sus costos de compra y existencias exactas.',
                    confirmButtonColor: '#007A33'
                  });
                }}
                className="w-full py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Seleccionar Excel
              </button>
            </div>

            <div className="md:col-span-8 p-5 rounded-2xl border border-gray-200 space-y-3">
              <h4 className="text-xs font-bold text-gray-800">Vista previa del archivo cargado</h4>
              <p className="text-xs text-gray-500">43 productos con inventarios independientes por sede sincronizados desde el archivo contable.</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                {STORES_LIST.map(st => (
                  <div key={st.id} className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <strong className="block text-gray-900">{st.shortName}</strong>
                    <span className="text-[10px] text-emerald-700 font-bold">43 referencias</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
