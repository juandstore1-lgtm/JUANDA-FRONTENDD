import React, { useEffect, useState, useMemo } from 'react';
import { 
  ShieldCheck, 
  BarChart3, 
  Clock, 
  Layers, 
  Plus, 
  Trash2, 
  Edit2, 
  Store as StoreIcon, 
  User as UserIcon, 
  EyeOff, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  ArrowRight, 
  Tag, 
  LogIn
} from 'lucide-react';
import { AuditService, ProductService, StoreService, UserService } from '../../services/api';
import { AuditLog, Product, Store, User } from '../../types';
import { formatPrice, formatStoreName } from '../../utils/format';
import Swal from 'sweetalert2';

// Helper to safely parse dates avoiding UTC vs local mismatch when ISO string has no timezone indicator
export function parseDateSafe(dateStr?: string | null): Date {
  if (!dateStr) return new Date();
  const normalized = (dateStr.endsWith('Z') || /[+-]\d{2}:\d{2}$/.test(dateStr))
    ? dateStr
    : `${dateStr}Z`;
  const d = new Date(normalized);
  return isNaN(d.getTime()) ? new Date(dateStr) : d;
}

export default function AuditAdmin() {
  const [activeTab, setActiveTab] = useState<'summary' | 'history' | 'availability'>('summary');
  const [dateFilter, setDateFilter] = useState<'today' | '7days' | '30days' | 'all'>('today');

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Tab 2 (History) filter states
  const [historyStoreFilter, setHistoryStoreFilter] = useState('');
  const [historyUserFilter, setHistoryUserFilter] = useState('');
  const [historyActionFilter, setHistoryActionFilter] = useState('');
  const [historySearchTerm, setHistorySearchTerm] = useState('');
  const [historyPage, setHistoryPage] = useState(1);
  const itemsPerPage = 8;

  // Tab 3 (Availability) filter states
  const [availStoreFilter, setAvailStoreFilter] = useState('');
  const [availCategoryFilter, setAvailCategoryFilter] = useState('');
  const [availStatusFilter, setAvailStatusFilter] = useState('');
  const [availSearchTerm, setAvailSearchTerm] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [logsRes, prodsRes, storesRes, usersRes] = await Promise.all([
        AuditService.getAuditLogs({ size: 200 }),
        ProductService.getProducts(),
        StoreService.getStores(),
        UserService.getUsers().catch(() => [])
      ]);

      setAuditLogs(logsRes.content || []);
      setProducts(prodsRes || []);
      setStores(storesRes || []);
      setUsers(usersRes || []);
    } catch (err) {
      console.error('Error cargando auditoría:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter logs by date range
  const filteredByDateLogs = useMemo(() => {
    const now = new Date();
    return auditLogs.filter((log) => {
      if (dateFilter === 'all') return true;
      const logDate = parseDateSafe(log.createdAt);
      if (isNaN(logDate.getTime())) return true;

      const diffMs = now.getTime() - logDate.getTime();
      const diffHours = diffMs / (1000 * 3600);

      if (dateFilter === 'today') {
        const isSameCalendarDay =
          logDate.getDate() === now.getDate() &&
          logDate.getMonth() === now.getMonth() &&
          logDate.getFullYear() === now.getFullYear();
        // Return true if same calendar day OR occurred within the last 24 hours
        return isSameCalendarDay || (diffHours >= -1 && diffHours <= 24);
      }
      if (dateFilter === '7days') {
        const diffDays = diffMs / (1000 * 3600 * 24);
        return diffDays >= -1 && diffDays <= 7;
      }
      if (dateFilter === '30days') {
        const diffDays = diffMs / (1000 * 3600 * 24);
        return diffDays >= -1 && diffDays <= 30;
      }
      return true;
    });
  }, [auditLogs, dateFilter]);

  // Helper to extract product details from log
  const parseLogProduct = (log: AuditLog) => {
    let name = 'Producto';
    let image = 'https://via.placeholder.com/60';
    let ref = log.entityId ? `Ref: #${log.entityId}` : 'Ref: N/A';
    let storeId: string | null = null;
    let oldPrice: number | null = null;
    let newPrice: number | null = null;
    let oldStatus: string | null = null;
    let newStatus: string | null = null;

    try {
      if (log.newData) {
        const parsedNew = JSON.parse(log.newData);
        if (parsedNew.name) name = parsedNew.name;
        if (parsedNew.images && parsedNew.images[0]) image = parsedNew.images[0];
        if (parsedNew.price) newPrice = parsedNew.price;
        if (parsedNew.status) newStatus = parsedNew.status;
        if (parsedNew.storeIds && parsedNew.storeIds[0]) storeId = String(parsedNew.storeIds[0]);
        if (parsedNew.storeId) storeId = String(parsedNew.storeId);
      }
      if (log.previousData) {
        const parsedOld = JSON.parse(log.previousData);
        if (!name || name === 'Producto') name = parsedOld.name || name;
        if (parsedOld.images && parsedOld.images[0] && image.includes('placeholder')) image = parsedOld.images[0];
        if (parsedOld.price) oldPrice = parsedOld.price;
        if (parsedOld.status) oldStatus = parsedOld.status;
        if (!storeId && parsedOld.storeIds && parsedOld.storeIds[0]) storeId = String(parsedOld.storeIds[0]);
        if (!storeId && parsedOld.storeId) storeId = String(parsedOld.storeId);
        if (!storeId && parsedOld.stores && parsedOld.stores[0]) {
          storeId = String(parsedOld.stores[0].id || parsedOld.stores[0]);
        }
      }
    } catch (e) {
      // Ignored
    }

    // Try finding in products list if entityId matches
    if (log.entityId && (!name || name === 'Producto')) {
      const found = products.find((p) => String(p.id) === String(log.entityId));
      if (found) {
        name = found.name;
        if (found.images && found.images[0]) image = found.images[0];
        if (!storeId && found.storeIds && found.storeIds[0]) storeId = String(found.storeIds[0]);
      }
    }

    // Fallback: If storeId is still not found, check the user's assigned store
    if (!storeId && log.userId && users.length > 0) {
      const foundUser = users.find((u) => u.id === log.userId);
      if (foundUser && foundUser.stores && foundUser.stores.length > 0) {
        storeId = String(foundUser.stores[0].id);
      }
    }

    // Resolve store name
    let storeName = 'Sede no esp.';
    if (storeId) {
      const foundStore = stores.find((s) => String(s.id) === String(storeId));
      if (foundStore) {
        storeName = formatStoreName(foundStore);
      }
    }

    // Entity type adjustments
    if (log.entityType === 'CATEGORY') {
      if (name === 'Producto') name = 'Categoría';
      ref = log.entityId ? `Cat: #${log.entityId}` : 'Categoría';
    }

    // Human readable detail
    let detail = 'Acción registrada en el catálogo';
    if (log.entityType === 'CATEGORY') {
      if (log.actionType === 'CREATE') detail = 'Se creó la categoría';
      else if (log.actionType === 'DELETE') detail = 'Se eliminó la categoría';
      else if (log.actionType === 'UPDATE') detail = 'Se actualizó la categoría';
    } else if (log.actionType === 'CREATE') {
      detail = 'Se agregó al catálogo';
    } else if (log.actionType === 'DELETE') {
      detail = 'Se eliminó del catálogo';
    } else if (log.actionType === 'UPDATE') {
      if (oldPrice !== null && newPrice !== null && oldPrice !== newPrice) {
        detail = `Cambio de precio: ${formatPrice(oldPrice)} → ${formatPrice(newPrice)}`;
      } else if (oldStatus && newStatus && oldStatus !== newStatus) {
        detail = `Cambio de estado: ${oldStatus === 'AVAILABLE' ? 'Disponible' : 'Agotado'} → ${newStatus === 'AVAILABLE' ? 'Disponible' : 'Agotado'}`;
      } else {
        detail = 'Se actualizaron datos del producto';
      }
    } else if (log.actionType === 'LOGIN') {
      detail = `Inicio de sesión exitoso desde ${log.ipAddress || 'IP desconocida'}`;
      name = `Sesión de ${log.userName}`;
      ref = 'Auth';
    } else if (log.actionType === 'ACCESS_DENIED') {
      detail = 'Intento no autorizado bloqueado por permisos de sede';
      ref = 'Seguridad';
    }

    return { name, image, ref, storeName, storeId, detail, oldPrice, newPrice, oldStatus, newStatus };
  };

  // KPI metrics
  const addedCount = filteredByDateLogs.filter(
    (l) => l.actionType === 'CREATE' && (l.entityType === 'PRODUCT' || l.entityType === 'STORAGE')
  ).length;

  const deletedCount = filteredByDateLogs.filter(
    (l) => l.actionType === 'DELETE' && l.entityType === 'PRODUCT'
  ).length;

  const editedCount = filteredByDateLogs.filter(
    (l) => l.actionType === 'UPDATE' && l.entityType === 'PRODUCT'
  ).length;

  const hiddenCount = products.filter((p) => p.status === 'OUT_OF_STOCK').length;
  const availableCount = products.filter((p) => p.status === 'AVAILABLE').length;
  const totalProducts = products.length;

  // Active stores calculation
  const storeActivityMap = useMemo(() => {
    const map = new Map<string, { count: number; lastTime: string }>();
    stores.forEach((s) => map.set(String(s.id), { count: 0, lastTime: 'Sin actividad' }));

    filteredByDateLogs.forEach((log) => {
      const parsed = parseLogProduct(log);
      if (parsed.storeId && map.has(parsed.storeId)) {
        const current = map.get(parsed.storeId)!;
        current.count += 1;
        if (current.lastTime === 'Sin actividad') {
          const d = parseDateSafe(log.createdAt);
          current.lastTime = isNaN(d.getTime())
            ? 'Hoy'
            : d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
        }
      }
    });
    return map;
  }, [stores, filteredByDateLogs]);

  const activeStoresCount = Array.from(storeActivityMap.values()).filter((v) => v.count > 0).length;
  const inactiveStores = stores
    .filter((s) => (storeActivityMap.get(String(s.id))?.count || 0) === 0)
    .map((s) => formatStoreName(s));

  // Recent activity list for Tab 1
  const recentActivityLogs = useMemo(() => {
    return filteredByDateLogs.slice(0, 5);
  }, [filteredByDateLogs]);

  // Tab 2 (History) filter and pagination
  const filteredHistoryLogs = useMemo(() => {
    return filteredByDateLogs.filter((log) => {
      const parsed = parseLogProduct(log);
      const matchesStore = historyStoreFilter ? parsed.storeId === historyStoreFilter : true;
      const matchesUser = historyUserFilter
        ? log.userName.toLowerCase().includes(historyUserFilter.toLowerCase()) ||
          log.userEmail.toLowerCase().includes(historyUserFilter.toLowerCase())
        : true;
      const matchesAction = historyActionFilter ? log.actionType === historyActionFilter : true;
      const matchesSearch = historySearchTerm
        ? parsed.name.toLowerCase().includes(historySearchTerm.toLowerCase()) ||
          parsed.ref.toLowerCase().includes(historySearchTerm.toLowerCase()) ||
          log.userName.toLowerCase().includes(historySearchTerm.toLowerCase()) ||
          (log.entityId && log.entityId.includes(historySearchTerm))
        : true;

      return matchesStore && matchesUser && matchesAction && matchesSearch;
    });
  }, [filteredByDateLogs, historyStoreFilter, historyUserFilter, historyActionFilter, historySearchTerm]);

  const totalHistoryPages = Math.ceil(filteredHistoryLogs.length / itemsPerPage) || 1;
  const paginatedHistoryLogs = useMemo(() => {
    const start = (historyPage - 1) * itemsPerPage;
    return filteredHistoryLogs.slice(start, start + itemsPerPage);
  }, [filteredHistoryLogs, historyPage]);

  // Tab 3 (Availability) filtered products
  const outOfStockProducts = useMemo(() => {
    return products.filter((p) => {
      const isOutOfStock = p.status === 'OUT_OF_STOCK';
      const matchesStore = availStoreFilter ? p.storeIds?.includes(availStoreFilter) : true;
      const matchesCategory = availCategoryFilter ? p.category === availCategoryFilter : true;
      const matchesStatus = availStatusFilter ? p.status === availStatusFilter : true;
      const matchesSearch = availSearchTerm
        ? p.name.toLowerCase().includes(availSearchTerm.toLowerCase()) ||
          p.id.toLowerCase().includes(availSearchTerm.toLowerCase())
        : true;

      return isOutOfStock && matchesStore && matchesCategory && matchesStatus && matchesSearch;
    });
  }, [products, availStoreFilter, availCategoryFilter, availStatusFilter, availSearchTerm]);

  // Availability percentage per store
  const storeAvailabilityStats = useMemo(() => {
    return stores.map((s) => {
      const storeProds = products.filter((p) => p.storeIds?.includes(String(s.id)));
      const avail = storeProds.filter((p) => p.status === 'AVAILABLE').length;
      const total = storeProds.length;
      const percent = total > 0 ? Math.round((avail / total) * 100) : 100;
      return { store: s, avail, total, percent };
    });
  }, [stores, products]);

  // Action: toggle product availability
  const handleToggleProductStatus = async (product: Product) => {
    const newStatus = product.status === 'AVAILABLE' ? 'OUT_OF_STOCK' : 'AVAILABLE';
    const actionLabel = newStatus === 'OUT_OF_STOCK' ? 'ocultar / marcar agotado' : 'marcar como disponible';

    const confirm = await Swal.fire({
      title: `¿Deseas ${actionLabel}?`,
      text: `El producto "${product.name}" cambiará su estado a ${newStatus === 'AVAILABLE' ? 'Disponible' : 'Agotado'}.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#000000',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, cambiar',
      cancelButtonText: 'Cancelar'
    });

    if (confirm.isConfirmed) {
      try {
        await ProductService.updateProduct(product.id, {
          ...product,
          status: newStatus
        });
        Swal.fire({
          icon: 'success',
          title: 'Estado actualizado',
          text: `El producto ahora figura como ${newStatus === 'AVAILABLE' ? 'Disponible' : 'Agotado'}.`,
          confirmButtonColor: '#000000'
        });
        loadData();
      } catch (err: any) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: err.message || 'No se pudo actualizar el producto.',
          confirmButtonColor: '#000000'
        });
      }
    }
  };

  // Inspect full JSON diff modal
  const handleViewLogDetail = (log: AuditLog) => {
    const parsed = parseLogProduct(log);
    Swal.fire({
      title: `<span class="text-lg font-black uppercase tracking-wider">${parsed.name}</span>`,
      html: `
        <div class="text-left space-y-4 text-xs font-mono max-h-[60vh] overflow-y-auto">
          <div class="bg-gray-50 p-3 rounded border">
            <div><strong>Usuario:</strong> ${log.userName} (${log.userEmail})</div>
            <div><strong>Rol:</strong> ${log.userRole}</div>
            <div><strong>Acción:</strong> ${log.actionType}</div>
            <div><strong>Entidad:</strong> ${log.entityType} #${log.entityId || 'N/A'}</div>
            <div><strong>IP Origen:</strong> ${log.ipAddress || '127.0.0.1'}</div>
            <div><strong>Fecha:</strong> ${parseDateSafe(log.createdAt).toLocaleString('es-CO')}</div>
          </div>
          ${
            log.previousData
              ? `<div>
                  <strong class="text-red-600 block mb-1">Estado Anterior:</strong>
                  <pre class="bg-gray-900 text-red-300 p-2.5 rounded overflow-x-auto text-[10px]">${JSON.stringify(JSON.parse(log.previousData), null, 2)}</pre>
                 </div>`
              : ''
          }
          ${
            log.newData
              ? `<div>
                  <strong class="text-green-600 block mb-1">Estado Nuevo:</strong>
                  <pre class="bg-gray-900 text-green-300 p-2.5 rounded overflow-x-auto text-[10px]">${JSON.stringify(JSON.parse(log.newData), null, 2)}</pre>
                 </div>`
              : ''
          }
        </div>
      `,
      showConfirmButton: true,
      confirmButtonText: 'Cerrar',
      confirmButtonColor: '#000000',
      width: 650
    });
  };

  // Generate Report
  const handleGenerateReport = () => {
    Swal.fire({
      title: 'Reporte de Auditoría de Catálogos',
      html: `
        <div class="text-left text-sm space-y-2 p-2">
          <p><strong>Fecha de corte:</strong> ${new Date().toLocaleDateString('es-CO')}</p>
          <p><strong>Productos agregados:</strong> ${addedCount}</p>
          <p><strong>Productos eliminados:</strong> ${deletedCount}</p>
          <p><strong>Productos editados:</strong> ${editedCount}</p>
          <p><strong>Total productos en catálogo:</strong> ${totalProducts}</p>
          <p><strong>Productos disponibles:</strong> ${availableCount} (${totalProducts > 0 ? Math.round((availableCount / totalProducts) * 100) : 0}%)</p>
          <p><strong>Sedes activas hoy:</strong> ${activeStoresCount} de ${stores.length}</p>
        </div>
      `,
      icon: 'info',
      confirmButtonText: 'Descargar CSV',
      showCancelButton: true,
      cancelButtonText: 'Cerrar',
      confirmButtonColor: '#000000'
    }).then((res) => {
      if (res.isConfirmed) {
        const headers = 'ID,Usuario,Email,Rol,Accion,Entidad,Fecha,IP\n';
        const rows = filteredByDateLogs
          .map((l) => `"${l.id}","${l.userName}","${l.userEmail}","${l.userRole}","${l.actionType}","${l.entityType}","${l.createdAt}","${l.ipAddress || ''}"`)
          .join('\n');
        const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `auditoria_catalogos_${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
      }
    });
  };

  const currentDateText = new Date().toLocaleDateString('es-CO', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Module Header */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-black text-white rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tight text-gray-900">
              Auditoría de Catálogos
            </h1>
            <p className="text-xs text-gray-500 font-medium">
              Supervisa y controla los cambios realizados en los catálogos por sede y usuario.
            </p>
          </div>
        </div>

        {/* Date Filter Dropdown */}
        <div className="relative">
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value as any)}
            className="bg-white border border-gray-200 text-xs font-bold text-gray-700 uppercase tracking-wider px-4 py-2.5 rounded-xl shadow-sm focus:outline-none focus:ring-1 focus:ring-black cursor-pointer pr-8"
          >
            <option value="today">Hoy, {currentDateText}</option>
            <option value="7days">Últimos 7 días</option>
            <option value="30days">Últimos 30 días</option>
            <option value="all">Histórico completo</option>
          </select>
        </div>
      </div>

      {/* Tabs Navigation Pills */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-gray-100/80 rounded-2xl w-fit border border-gray-200/50 shadow-inner">
        <button
          onClick={() => setActiveTab('summary')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
            activeTab === 'summary'
              ? 'bg-black text-white shadow-md'
              : 'text-gray-600 hover:text-black hover:bg-white/60'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Resumen por sedes</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
            activeTab === 'history'
              ? 'bg-black text-white shadow-md'
              : 'text-gray-600 hover:text-black hover:bg-white/60'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Historial de movimientos</span>
        </button>

        <button
          onClick={() => setActiveTab('availability')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
            activeTab === 'availability'
              ? 'bg-black text-white shadow-md'
              : 'text-gray-600 hover:text-black hover:bg-white/60'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Control de disponibilidad</span>
        </button>
      </div>

      {/* TAB 1: RESUMEN POR SEDES */}
      {activeTab === 'summary' && (
        <div className="space-y-6">
          {/* KPI Cards (4 cards) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Added */}
            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Plus className="w-5 h-5 stroke-[2.5]" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  Productos agregados
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-black text-black">{addedCount}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                  ↗ +12%
                </span>
              </div>
            </div>

            {/* Deleted */}
            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                  <Trash2 className="w-5 h-5 stroke-[2.5]" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  Productos eliminados
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-black text-black">{deletedCount}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700">
                  ↗ +33%
                </span>
              </div>
            </div>

            {/* Edited */}
            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-gray-100 text-gray-700 flex items-center justify-center">
                  <Edit2 className="w-4 h-4 stroke-[2.5]" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  Productos editados
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-black text-black">{editedCount}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                  ↗ +7%
                </span>
              </div>
            </div>

            {/* Active stores */}
            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <StoreIcon className="w-5 h-5 stroke-[2.5]" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  Sedes con actividad
                </span>
              </div>
              <div>
                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-3xl font-black text-black">
                    {activeStoresCount}/{stores.length}
                  </span>
                  <span className="text-xs font-bold text-gray-500">
                    {stores.length > 0 ? Math.round((activeStoresCount / stores.length) * 100) : 0}%
                  </span>
                </div>
                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-500 h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${stores.length > 0 ? Math.round((activeStoresCount / stores.length) * 100) : 0}%`
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Middle Two-Column Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Actividad por sede (7 cols) */}
            <div className="lg:col-span-7 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="mb-4">
                  <h2 className="text-base font-black uppercase tracking-wider text-gray-900">
                    Actividad por sede
                  </h2>
                  <p className="text-xs text-gray-400">
                    Movimientos y última actualización del catálogo.
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-gray-100 text-gray-400 font-bold uppercase tracking-wider">
                        <th className="pb-3 pr-4">Sede</th>
                        <th className="pb-3 pr-4 text-center">Movimientos hoy</th>
                        <th className="pb-3 pr-4">Última actividad</th>
                        <th className="pb-3 text-right">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 font-medium">
                      {stores.map((s) => {
                        const activity = storeActivityMap.get(String(s.id)) || {
                          count: 0,
                          lastTime: 'Sin actividad'
                        };
                        const hasActivity = activity.count > 0;
                        return (
                          <tr key={s.id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="py-3.5 pr-4">
                              <div className="flex items-center space-x-2.5">
                                <StoreIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                <span className="font-bold text-gray-900 uppercase">
                                  {formatStoreName(s)}
                                </span>
                              </div>
                            </td>
                            <td className="py-3.5 pr-4 text-center font-black">
                              <span className={hasActivity ? 'text-black' : 'text-rose-600'}>
                                {activity.count}
                              </span>
                            </td>
                            <td className="py-3.5 pr-4 text-gray-500">{activity.lastTime}</td>
                            <td className="py-3.5 text-right">
                              {hasActivity ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">
                                  <CheckCircle2 className="w-3 h-3" /> Actualizado
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700">
                                  <AlertTriangle className="w-3 h-3" /> Sin actividad
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Warning notice if any store is inactive */}
              {inactiveStores.length > 0 && (
                <div className="mt-5 bg-amber-50 border border-amber-200/60 rounded-xl p-3.5 text-xs text-amber-800 flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <span>
                    <strong>{inactiveStores[0]}</strong> no registra movimientos en este periodo. Requiere revisión.
                  </span>
                </div>
              )}
            </div>

            {/* Right Column: Actividad reciente (5 cols) */}
            <div className="lg:col-span-5 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-base font-black uppercase tracking-wider text-gray-900">
                      Actividad reciente
                    </h2>
                    <p className="text-xs text-gray-400">
                      Últimos movimientos en la plataforma.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('history')}
                    className="text-xs font-bold text-black hover:text-emerald-600 flex items-center gap-1 transition-colors"
                  >
                    <span>Ver historial</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-3">
                  {recentActivityLogs.length === 0 ? (
                    <div className="py-12 text-center text-gray-400 text-xs">
                      No hay registros recientes para el periodo seleccionado.
                    </div>
                  ) : (
                    recentActivityLogs.map((log) => {
                      const parsed = parseLogProduct(log);
                      const isDelete = log.actionType === 'DELETE';
                      const isCreate = log.actionType === 'CREATE';
                      const isUpdate = log.actionType === 'UPDATE';

                      return (
                        <div
                          key={log.id}
                          onClick={() => handleViewLogDetail(log)}
                          className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:border-black/30 hover:shadow-sm transition-all cursor-pointer group bg-gray-50/40"
                        >
                          <div className="flex items-center space-x-3 min-w-0">
                            <div
                              className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                                isDelete
                                  ? 'bg-rose-50 text-rose-600'
                                  : isCreate
                                  ? 'bg-emerald-50 text-emerald-600'
                                  : 'bg-gray-100 text-gray-700'
                              }`}
                            >
                              {isDelete && <Trash2 className="w-4 h-4" />}
                              {isCreate && <Plus className="w-4 h-4 stroke-[2.5]" />}
                              {isUpdate && <Edit2 className="w-4 h-4" />}
                              {!isDelete && !isCreate && !isUpdate && <RefreshCw className="w-4 h-4" />}
                            </div>

                            <div className="min-w-0">
                              <p className="text-xs font-black uppercase text-gray-900 truncate group-hover:text-black">
                                {log.userName}{' '}
                                {isDelete
                                  ? 'eliminó un producto'
                                  : isCreate
                                  ? 'agregó un producto'
                                  : 'editó un producto'}
                              </p>
                              <p className="text-[10px] text-gray-400 truncate">
                                Sede: {parsed.storeName} · {parsed.name}
                              </p>
                            </div>
                          </div>

                          <span className="text-[10px] text-gray-400 font-medium whitespace-nowrap ml-2">
                            {parseDateSafe(log.createdAt).toLocaleTimeString('es-CO', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar: Control del día */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-6 text-xs font-bold text-gray-700">
              <div className="flex items-center space-x-2 text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Control del día: {activeStoresCount} de {stores.length} sedes con actividad</span>
              </div>

              <div className="flex items-center space-x-2">
                <BarChart3 className="w-4 h-4 text-gray-400" />
                <span>{filteredByDateLogs.length} Movimientos totales</span>
              </div>

              <div className="flex items-center space-x-2">
                <Tag className="w-4 h-4 text-gray-400" />
                <span>{totalProducts} Productos publicados</span>
              </div>

              <div className="flex items-center space-x-2 text-rose-600">
                <AlertTriangle className="w-4 h-4" />
                <span>{hiddenCount} Productos sin stock visibles</span>
              </div>
            </div>

            <button
              onClick={handleGenerateReport}
              className="bg-black text-white hover:bg-emerald-600 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center space-x-2 shadow-sm transition-colors whitespace-nowrap"
            >
              <FileText className="w-4 h-4" />
              <span>Generar reporte</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: HISTORIAL DE MOVIMIENTOS */}
      {activeTab === 'history' && (
        <div className="space-y-6">
          {/* KPI Cards (5 cards) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                </div>
                <span className="text-[11px] font-bold uppercase text-gray-500">Agregados</span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-black">{addedCount}</span>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700">↗ +12%</span>
              </div>
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                  <Trash2 className="w-4 h-4 stroke-[2.5]" />
                </div>
                <span className="text-[11px] font-bold uppercase text-gray-500">Eliminados</span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-black">{deletedCount}</span>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-rose-50 text-rose-700">↗ +33%</span>
              </div>
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-gray-100 text-gray-700 flex items-center justify-center">
                  <Edit2 className="w-4 h-4 stroke-[2.5]" />
                </div>
                <span className="text-[11px] font-bold uppercase text-gray-500">Editados</span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-black">{editedCount}</span>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700">↗ +7%</span>
              </div>
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <EyeOff className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-bold uppercase text-gray-500">Ocultados</span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-black">{hiddenCount}</span>
                <span className="text-[9px] font-bold text-gray-400 font-mono">Stock 0</span>
              </div>
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <RefreshCw className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-bold uppercase text-gray-500">Total Movs</span>
              </div>
              <span className="text-2xl font-black text-black">{filteredByDateLogs.length}</span>
            </div>
          </div>

          {/* Filter Toolbar */}
          <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex flex-wrap gap-3 items-center justify-between">
            <div className="flex flex-wrap gap-3 items-center w-full lg:w-auto flex-1">
              {/* Sede */}
              <select
                value={historyStoreFilter}
                onChange={(e) => {
                  setHistoryStoreFilter(e.target.value);
                  setHistoryPage(1);
                }}
                className="px-3.5 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 uppercase bg-white focus:outline-none focus:ring-1 focus:ring-black cursor-pointer shadow-sm"
              >
                <option value="">Todas las sedes</option>
                {stores.map((s) => (
                  <option key={s.id} value={s.id}>
                    {formatStoreName(s)}
                  </option>
                ))}
              </select>

              {/* User */}
              <select
                value={historyUserFilter}
                onChange={(e) => {
                  setHistoryUserFilter(e.target.value);
                  setHistoryPage(1);
                }}
                className="px-3.5 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 uppercase bg-white focus:outline-none focus:ring-1 focus:ring-black cursor-pointer shadow-sm"
              >
                <option value="">Todos los usuarios</option>
                {users.map((u) => (
                  <option key={u.id} value={u.name}>
                    {u.name} ({u.role?.name || 'ADMIN'})
                  </option>
                ))}
              </select>

              {/* Movement */}
              <select
                value={historyActionFilter}
                onChange={(e) => {
                  setHistoryActionFilter(e.target.value);
                  setHistoryPage(1);
                }}
                className="px-3.5 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 uppercase bg-white focus:outline-none focus:ring-1 focus:ring-black cursor-pointer shadow-sm"
              >
                <option value="">Todos los movimientos</option>
                <option value="CREATE">Producto agregado</option>
                <option value="UPDATE">Producto editado</option>
                <option value="DELETE">Producto eliminado</option>
                <option value="LOGIN">Inicio de sesión</option>
                <option value="ACCESS_DENIED">Acceso denegado</option>
              </select>
            </div>

            {/* Search Input */}
            <div className="relative w-full lg:w-80">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Buscar por producto, ref o usuario..."
                value={historySearchTerm}
                onChange={(e) => {
                  setHistorySearchTerm(e.target.value);
                  setHistoryPage(1);
                }}
                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-black shadow-sm"
              />
            </div>
          </div>

          {/* Movements Data Table */}
          <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/70 text-gray-400 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3.5 px-5">Fecha y hora</th>
                    <th className="py-3.5 px-4">Usuario</th>
                    <th className="py-3.5 px-4">Sede</th>
                    <th className="py-3.5 px-4">Movimiento</th>
                    <th className="py-3.5 px-4">Producto</th>
                    <th className="py-3.5 px-5">Detalle</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginatedHistoryLogs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-gray-400 text-xs">
                        No se encontraron registros de movimientos con los filtros seleccionados.
                      </td>
                    </tr>
                  ) : (
                    paginatedHistoryLogs.map((log) => {
                      const parsed = parseLogProduct(log);
                      const isDelete = log.actionType === 'DELETE';
                      const isCreate = log.actionType === 'CREATE';
                      const isUpdate = log.actionType === 'UPDATE';
                      const isLogin = log.actionType === 'LOGIN';

                      return (
                        <tr
                          key={log.id}
                          onClick={() => handleViewLogDetail(log)}
                          className="hover:bg-gray-50/70 transition-colors cursor-pointer group"
                        >
                          <td className="py-4 px-5 whitespace-nowrap text-gray-600 font-medium">
                            {parseDateSafe(log.createdAt).toLocaleString('es-CO', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </td>

                          <td className="py-4 px-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              <div className="w-6 h-6 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center font-bold text-[10px]">
                                <UserIcon className="w-3.5 h-3.5" />
                              </div>
                              <span className="font-bold text-gray-900">{log.userName}</span>
                            </div>
                          </td>

                          <td className="py-4 px-4 whitespace-nowrap">
                            <div className="flex items-center space-x-1.5 text-gray-700">
                              <StoreIcon className="w-3.5 h-3.5 text-gray-400" />
                              <span className="font-medium">{parsed.storeName}</span>
                            </div>
                          </td>

                          <td className="py-4 px-4 whitespace-nowrap">
                            {isDelete && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700">
                                <Trash2 className="w-3 h-3" /> Producto eliminado
                              </span>
                            )}
                            {isCreate && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">
                                <Plus className="w-3 h-3 stroke-[2.5]" /> Producto agregado
                              </span>
                            )}
                            {isUpdate && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-gray-100 text-gray-700">
                                <Edit2 className="w-3 h-3" /> Producto editado
                              </span>
                            )}
                            {isLogin && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700">
                                <LogIn className="w-3 h-3" /> Inicio de sesión
                              </span>
                            )}
                            {!isDelete && !isCreate && !isUpdate && !isLogin && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-gray-100 text-gray-600">
                                {log.actionType}
                              </span>
                            )}
                          </td>

                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-3">
                              <img
                                src={parsed.image}
                                alt={parsed.name}
                                className="w-9 h-9 object-cover rounded-lg bg-gray-100 border border-gray-100 flex-shrink-0"
                              />
                              <div className="min-w-0">
                                <div className="font-bold text-gray-900 truncate max-w-[170px] uppercase">
                                  {parsed.name}
                                </div>
                                <div className="text-[10px] text-gray-400 font-mono">{parsed.ref}</div>
                              </div>
                            </div>
                          </td>

                          <td className="py-4 px-5 text-gray-600 font-medium">{parsed.detail}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
              <div>
                Mostrando{' '}
                <strong>
                  {filteredHistoryLogs.length === 0 ? 0 : (historyPage - 1) * itemsPerPage + 1} -{' '}
                  {Math.min(historyPage * itemsPerPage, filteredHistoryLogs.length)}
                </strong>{' '}
                de <strong>{filteredHistoryLogs.length}</strong> movimientos
              </div>

              <div className="flex items-center space-x-1.5">
                <button
                  onClick={() => setHistoryPage((p) => Math.max(1, p - 1))}
                  disabled={historyPage === 1}
                  className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {Array.from({ length: totalHistoryPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalHistoryPages || Math.abs(p - historyPage) <= 1)
                  .map((p, idx, arr) => (
                    <React.Fragment key={p}>
                      {idx > 0 && p - arr[idx - 1] > 1 && <span className="px-1 text-gray-400">...</span>}
                      <button
                        onClick={() => setHistoryPage(p)}
                        className={`w-7 h-7 rounded-lg text-xs font-bold transition-colors ${
                          historyPage === p ? 'bg-black text-white' : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {p}
                      </button>
                    </React.Fragment>
                  ))}

                <button
                  onClick={() => setHistoryPage((p) => Math.min(totalHistoryPages, p + 1))}
                  disabled={historyPage === totalHistoryPages}
                  className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CONTROL DE DISPONIBILIDAD */}
      {activeTab === 'availability' && (
        <div className="space-y-6">
          {/* KPI Cards (4 cards) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  Productos disponibles
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-black text-black">{availableCount}</span>
                <span className="text-xs font-bold text-emerald-600">
                  {totalProducts > 0 ? Math.round((availableCount / totalProducts) * 100) : 0}%
                </span>
              </div>
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 stroke-[2.5]" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  Sin stock publicados
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-black text-black">{hiddenCount}</span>
                <span className="text-xs font-bold text-rose-600">
                  {totalProducts > 0 ? Math.round((hiddenCount / totalProducts) * 100) : 0}%
                </span>
              </div>
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <EyeOff className="w-4 h-4 stroke-[2.5]" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  Productos ocultos
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-black text-black">{hiddenCount}</span>
                <span className="text-xs font-bold text-amber-600">
                  {totalProducts > 0 ? Math.round((hiddenCount / totalProducts) * 100) : 0}%
                </span>
              </div>
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-gray-100 text-gray-700 flex items-center justify-center">
                  <Layers className="w-5 h-5 stroke-[2.5]" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  Total en catálogo
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-black text-black">{totalProducts}</span>
                <span className="text-xs font-bold text-gray-400">100%</span>
              </div>
            </div>
          </div>

          {/* Filter Toolbar */}
          <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex flex-wrap gap-3 items-center justify-between">
            <div className="flex flex-wrap gap-3 items-center w-full lg:w-auto flex-1">
              <select
                value={availStoreFilter}
                onChange={(e) => setAvailStoreFilter(e.target.value)}
                className="px-3.5 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 uppercase bg-white focus:outline-none focus:ring-1 focus:ring-black cursor-pointer shadow-sm"
              >
                <option value="">Todas las sedes</option>
                {stores.map((s) => (
                  <option key={s.id} value={s.id}>
                    {formatStoreName(s)}
                  </option>
                ))}
              </select>

              <select
                value={availCategoryFilter}
                onChange={(e) => setAvailCategoryFilter(e.target.value)}
                className="px-3.5 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 uppercase bg-white focus:outline-none focus:ring-1 focus:ring-black cursor-pointer shadow-sm"
              >
                <option value="">Todas las categorías</option>
                {Array.from(new Set(products.map((p) => p.category).filter(Boolean))).map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>

              <select
                value={availStatusFilter}
                onChange={(e) => setAvailStatusFilter(e.target.value)}
                className="px-3.5 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 uppercase bg-white focus:outline-none focus:ring-1 focus:ring-black cursor-pointer shadow-sm"
              >
                <option value="">Todos los estados</option>
                <option value="AVAILABLE">Disponible</option>
                <option value="OUT_OF_STOCK">Agotado</option>
              </select>
            </div>

            <div className="relative w-full lg:w-80">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Buscar producto o referencia..."
                value={availSearchTerm}
                onChange={(e) => setAvailSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-black shadow-sm"
              />
            </div>
          </div>

          {/* Main 2-Column Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Out of stock products table (8 cols) */}
            <div className="lg:col-span-8 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2.5">
                  <AlertTriangle className="w-5 h-5 text-rose-500" />
                  <div>
                    <h2 className="text-base font-black uppercase tracking-wider text-gray-900">
                      Productos sin disponibilidad (visibles al cliente)
                    </h2>
                    <p className="text-xs text-gray-400">
                      Productos que no tienen stock, pero siguen publicados en el catálogo.
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-rose-50 text-rose-700 text-xs font-black rounded-full whitespace-nowrap">
                  {outOfStockProducts.length} productos
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-gray-100 text-gray-400 font-bold uppercase tracking-wider text-[11px]">
                      <th className="pb-3 pr-4">Producto</th>
                      <th className="pb-3 pr-4">Referencia</th>
                      <th className="pb-3 pr-4">Sede</th>
                      <th className="pb-3 pr-4 text-center">Stock</th>
                      <th className="pb-3 pr-4 text-center">Estado</th>
                      <th className="pb-3 text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {outOfStockProducts.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-12 text-gray-400 text-xs">
                          ¡Excelente! No hay productos agotados visibles en este momento.
                        </td>
                      </tr>
                    ) : (
                      outOfStockProducts.slice(0, 8).map((product) => {
                        const firstStoreId = product.storeIds?.[0];
                        const foundStore = stores.find((s) => String(s.id) === String(firstStoreId));

                        return (
                          <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="py-3.5 pr-4">
                              <div className="flex items-center space-x-3">
                                <img
                                  src={product.images?.[0] || 'https://via.placeholder.com/50'}
                                  alt={product.name}
                                  className="w-10 h-10 object-cover rounded-lg bg-gray-100 border border-gray-100 flex-shrink-0"
                                />
                                <span className="font-bold text-gray-900 uppercase truncate max-w-[170px]">
                                  {product.name}
                                </span>
                              </div>
                            </td>

                            <td className="py-3.5 pr-4 text-gray-400 font-mono text-[11px]">
                              Ref: #{product.id}
                            </td>

                            <td className="py-3.5 pr-4">
                              <div className="flex items-center space-x-1.5 text-gray-700">
                                <StoreIcon className="w-3.5 h-3.5 text-gray-400" />
                                <span className="font-medium truncate max-w-[130px]">
                                  {foundStore ? formatStoreName(foundStore) : 'General'}
                                </span>
                              </div>
                            </td>

                            <td className="py-3.5 pr-4 text-center">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-50 text-rose-600">
                                0
                              </span>
                            </td>

                            <td className="py-3.5 pr-4 text-center">
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100/70 text-rose-800">
                                Visible
                              </span>
                            </td>

                            <td className="py-3.5 text-right">
                              <button
                                onClick={() => handleToggleProductStatus(product)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold text-gray-700 hover:text-black hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors"
                              >
                                <EyeOff className="w-3.5 h-3.5" />
                                <span>Ocultar</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right Column: Estado por sede & Recomendación (4 cols) */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center space-x-2.5 mb-4">
                  <StoreIcon className="w-5 h-5 text-gray-900" />
                  <div>
                    <h2 className="text-base font-black uppercase tracking-wider text-gray-900">
                      Estado por sede
                    </h2>
                    <p className="text-xs text-gray-400">
                      Disponibilidad del catálogo por tienda.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {storeAvailabilityStats.map(({ store, percent }) => {
                    const isHigh = percent >= 85;
                    const isMedium = percent >= 70 && percent < 85;

                    return (
                      <div key={store.id} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-bold">
                          <span className="text-gray-800 uppercase">{formatStoreName(store)}</span>
                          <div className="flex items-center space-x-1.5">
                            <span className="text-gray-900">{percent}%</span>
                            {isHigh && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                            {isMedium && <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />}
                            {!isHigh && !isMedium && <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />}
                          </div>
                        </div>

                        <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              isHigh
                                ? 'bg-emerald-500'
                                : isMedium
                                ? 'bg-amber-500'
                                : 'bg-rose-500'
                            }`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Recommendation card */}
              <div className="bg-emerald-50 border border-emerald-200/60 rounded-2xl p-5 shadow-sm">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-emerald-950 mb-1">
                      Recomendación
                    </h3>
                    <p className="text-xs text-emerald-800 leading-relaxed">
                      Oculta o actualiza los productos sin stock para mantener el catálogo al día y mejorar la experiencia de compra de tus clientes.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
