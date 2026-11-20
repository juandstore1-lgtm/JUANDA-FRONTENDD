import React, { useEffect, useState, useMemo } from 'react';
import { 
  ShieldCheck, 
  BarChart3, 
  Clock,
  Calendar,
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
  ChevronLeft, 
  ChevronRight, 
  Search, 
  Download, 
  Eye, 
  Settings, 
  Bell, 
  RotateCcw, 
  Zap, 
  Target, 
  X,
  Info,
  FileText,
  ArrowRight,
  Package,
  ChevronsLeft,
  ChevronsRight,
  AlertCircle,
  Tag,
  Folder
} from 'lucide-react';
import { AuditService, ProductService, StoreService, UserService } from '../../services/api';
import { AuditLog, Product, Store, User, AuditAlert, AuditAlertSettings } from '../../types';
import { formatPrice, formatStoreName } from '../../utils/format';
import Swal from 'sweetalert2';

// Helper to safely parse dates avoiding UTC vs local mismatch
export function parseDateSafe(dateStr?: string | null): Date {
  if (!dateStr) return new Date();
  const normalized = (dateStr.endsWith('Z') || /[+-]\d{2}:\d{2}$/.test(dateStr))
    ? dateStr
    : `${dateStr}Z`;
  const d = new Date(normalized);
  return isNaN(d.getTime()) ? new Date(dateStr) : d;
}

export default function AuditAdmin() {
  // Navigation Tabs: 'general' | 'movements' | 'store_activity' | 'daily_tracking' | 'alerts' | 'change_history'
  const [activeTab, setActiveTab] = useState<'general' | 'movements' | 'store_activity' | 'daily_tracking' | 'alerts' | 'change_history'>('general');

  // Filters State - Default to '7days' to reflect all recent movements from the database
  const [selectedSupervisorId, setSelectedSupervisorId] = useState<string>('all');
  const [dateRangeMode, setDateRangeMode] = useState<'today' | 'yesterday' | '7days' | '30days' | 'all' | 'specific_date' | 'custom'>('7days');
  const [selectedSpecificDate, setSelectedSpecificDate] = useState<string>('');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedMovementAction, setSelectedMovementAction] = useState<'ALL' | 'CREATE' | 'UPDATE' | 'DELETE'>('ALL');
  const [alertTypeFilter, setAlertTypeFilter] = useState<string>('all');
  const [storeActivitySubView, setStoreActivitySubView] = useState<'summary' | 'detail'>('summary');
  const [movementEvolutionMode, setMovementEvolutionMode] = useState<'day' | 'week'>('day');

  // Historial de Cambios tab state
  const [historySelectedStore, setHistorySelectedStore] = useState<string>('all');
  const [historySelectedUser, setHistorySelectedUser] = useState<string>('all');
  const [historySelectedType, setHistorySelectedType] = useState<string>('ALL');
  const [historySearchTerm, setHistorySearchTerm] = useState<string>('');
  const [historySelectedLogId, setHistorySelectedLogId] = useState<number | string | null>(null);
  const [historyCurrentPage, setHistoryCurrentPage] = useState<number>(1);

  // Calendar matrix navigation (Tab 4)
  const [calendarMonth, setCalendarMonth] = useState<Date>(new Date());
  const [selectedCalendarDayStr, setSelectedCalendarDayStr] = useState<string>(new Date().toISOString().slice(0, 10));

  // Live Data State
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Helper to get responsible user name for a store
  const getStoreManagerName = (store?: Store | { id?: string | number; name?: string; barrio?: string } | null): string => {
    if (!store) return '';
    const sId = String(store.id);
    const assignedUser = users.find(u => 
      u.storeIds?.some(id => String(id) === sId) ||
      (store.barrio && (u.name?.toUpperCase().includes(store.barrio.toUpperCase()) || u.email?.toUpperCase().includes(store.barrio.toUpperCase()))) ||
      (store.name && (u.name?.toUpperCase().includes(store.name.toUpperCase()) || u.email?.toUpperCase().includes(store.name.toUpperCase())))
    );
    if (assignedUser) return assignedUser.name;

    // Direct fallback for well-known locations
    const b = (((store as any).barrio || '') + ' ' + (store.name || '')).toUpperCase();
    if (b.includes('MODELO')) return 'JULIANA';
    if (b.includes('MARIANO')) return 'PAOLA';
    if (b.includes('ISRAEL')) return 'YEFERSON';
    if (b.includes('VILLA')) return 'Daniela';
    return '';
  };

  // User supervision options: each option targets EXACTLY one user and their store
  const supervisorOptions = useMemo(() => {
    const list: { id: string; userId: number; userName: string; storeName: string; label: string }[] = [];

    stores.forEach(store => {
      const sId = String(store.id);
      const assigned = users.find(u => u.storeIds?.some(id => String(id) === sId));
      let uName = assigned ? assigned.name : '';
      let uId = assigned ? assigned.id : null;
      if (!uName) {
        const b = (((store.barrio || '') + ' ' + (store.name || '')).toUpperCase());
        if (b.includes('MODELO')) { uName = 'JULIANA'; uId = 5; }
        else if (b.includes('MARIANO')) { uName = 'PAOLA'; uId = 3; }
        else if (b.includes('ISRAEL')) { uName = 'YEFERSON'; uId = 4; }
        else if (b.includes('VILLA')) { uName = 'Daniela'; uId = 2; }
      }
      if (uId) {
        const sName = formatStoreName(store);
        list.push({
          id: String(uId),
          userId: Number(uId),
          userName: uName,
          storeName: sName,
          label: `${sName} · ${uName}`
        });
      }
    });

    // Global Admin
    const adminUser = users.find(u => u.roleName === 'GLOBAL_ADMIN' || String(u.id) === '1');
    list.push({
      id: '1',
      userId: 1,
      userName: adminUser ? adminUser.name : 'Administrador',
      storeName: 'Administrador Global',
      label: 'Administrador (Acciones Globales)'
    });

    return list;
  }, [users, stores]);

  // Modals state
  const [selectedLogDetail, setSelectedLogDetail] = useState<AuditLog | null>(null);
  const [selectedAlertDetail, setSelectedAlertDetail] = useState<AuditAlert | null>(null);
  const [isAlertSettingsOpen, setIsAlertSettingsOpen] = useState(false);

  // Alert Settings with localStorage persistence
  const [alertSettings, setAlertSettings] = useState<AuditAlertSettings>(() => {
    try {
      const saved = localStorage.getItem('catalog_audit_alert_settings');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      dailyTarget: 5,
      inactiveDaysThreshold: 3,
      massEditThreshold: 8,
      massDeleteThreshold: 5
    };
  });

  // Reviewed Alerts state with localStorage persistence
  const [reviewedAlertIds, setReviewedAlertIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('catalog_audit_reviewed_alerts');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });

  // Load real data from PostgreSQL
  const loadData = async () => {
    setLoading(true);
    try {
      const [logsRes, prodsRes, storesRes, usersRes] = await Promise.all([
        AuditService.getAuditLogs({ size: 1000 }),
        ProductService.getProducts(),
        StoreService.getStores(),
        UserService.getUsers().catch(() => [])
      ]);

      setAuditLogs(logsRes.content || []);
      setProducts(prodsRes || []);
      setStores(storesRes || []);
      setUsers(usersRes || []);
    } catch (err) {
      console.error('Error cargando auditoría de catálogos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Helper to accurately extract product and store details from an AuditLog
  const parseLogProduct = (log: AuditLog) => {
    let name = 'Producto';
    let image = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=120&auto=format&fit=crop&q=60';
    let ref = log.entityId ? `#${log.entityId}` : 'N/A';
    let storeId: string | null = log.storeId ? String(log.storeId) : null;
    let storeName: string = log.storeName || '';
    let oldPrice: number | null = null;
    let newPrice: number | null = null;
    let oldStatus: string | null = null;
    let newStatus: string | null = null;
    let oldDescription: string | null = null;
    let newDescription: string | null = null;
    let category: string = 'Calzado';
    let parsedNewObj: any = null;
    let parsedOldObj: any = null;

    try {
      if (log.newData) {
        const parsedNew = typeof log.newData === 'string' ? JSON.parse(log.newData) : log.newData;
        parsedNewObj = parsedNew;
        if (parsedNew.name) name = parsedNew.name;
        if (parsedNew.images && parsedNew.images[0]) image = parsedNew.images[0];
        if (parsedNew.price !== undefined && parsedNew.price !== null) newPrice = Number(parsedNew.price);
        if (parsedNew.description) newDescription = parsedNew.description;
        if (parsedNew.status) newStatus = parsedNew.status;
        if (parsedNew.category?.name) category = parsedNew.category.name;
        else if (parsedNew.categoryName) category = parsedNew.categoryName;
        if (!storeId && parsedNew.storeIds && parsedNew.storeIds.length > 0) storeId = String(parsedNew.storeIds[0]);
        if (!storeId && parsedNew.storeId) storeId = String(parsedNew.storeId);
      }
      if (log.previousData) {
        const parsedOld = typeof log.previousData === 'string' ? JSON.parse(log.previousData) : log.previousData;
        parsedOldObj = parsedOld;
        if (!name || name === 'Producto') name = parsedOld.name || name;
        if (parsedOld.images && parsedOld.images[0] && image.includes('unsplash')) image = parsedOld.images[0];
        if (parsedOld.price !== undefined && parsedOld.price !== null) oldPrice = Number(parsedOld.price);
        if (parsedOld.description) oldDescription = parsedOld.description;
        if (parsedOld.status) oldStatus = parsedOld.status;
        if (parsedOld.category?.name) category = parsedOld.category.name;
        else if (parsedOld.categoryName) category = parsedOld.categoryName;
        if (!storeId && parsedOld.storeIds && parsedOld.storeIds.length > 0) storeId = String(parsedOld.storeIds[0]);
        if (!storeId && parsedOld.storeId) storeId = String(parsedOld.storeId);
        if (!storeId && parsedOld.stores && parsedOld.stores.length > 0) {
          storeId = String(parsedOld.stores[0].id || parsedOld.stores[0]);
        }
      }
    } catch (e) {}

    // ALWAYS cross-reference with products table to resolve store, name, images, category, and description
    if (log.entityId) {
      const found = products.find((p) => String(p.id) === String(log.entityId));
      if (found) {
        if (!name || name === 'Producto') name = found.name;
        if (found.images && found.images[0]) image = found.images[0];
        if (found.category?.name) category = found.category.name;
        if (newPrice === null && found.price !== undefined) newPrice = Number(found.price);
        if (!newDescription && found.description) newDescription = found.description;
        if (!newStatus && found.status) newStatus = found.status;
        if (!storeId && found.storeIds && found.storeIds.length > 0) {
          storeId = String(found.storeIds[0]);
        }
      }
    }

    // CRITICAL: Cross-reference with user's assigned store from users list (checking both storeIds and stores)
    if (!storeId && (log.userId || log.userEmail || log.userName) && users.length > 0) {
      const foundUser = users.find((u) => 
        (log.userId && String(u.id) === String(log.userId)) ||
        (log.userEmail && u.email && u.email.toLowerCase() === log.userEmail.toLowerCase()) ||
        (log.userName && u.name && u.name.toLowerCase() === log.userName.toLowerCase())
      );
      if (foundUser) {
        if (foundUser.storeIds && foundUser.storeIds.length > 0) {
          storeId = String(foundUser.storeIds[0]);
        } else if ((foundUser as any).stores && (foundUser as any).stores.length > 0) {
          storeId = String((foundUser as any).stores[0].id || (foundUser as any).stores[0]);
        }
      }
    }

    // Direct fallback for known managers / barrios in user name or email
    if (!storeId) {
      const uStr = `${log.userName || ''} ${log.userEmail || ''}`.toUpperCase();
      if (uStr.includes('MODELO') || uStr.includes('JULIANA')) {
        const found = stores.find(s => (s.barrio || s.name).toUpperCase().includes('MODELO'));
        if (found) storeId = String(found.id);
      } else if (uStr.includes('MARIANO') || uStr.includes('PAOLA')) {
        const found = stores.find(s => (s.barrio || s.name).toUpperCase().includes('MARIANO'));
        if (found) storeId = String(found.id);
      } else if (uStr.includes('ISRAEL') || uStr.includes('YEFERSON')) {
        const found = stores.find(s => (s.barrio || s.name).toUpperCase().includes('ISRAEL'));
        if (found) storeId = String(found.id);
      } else if (uStr.includes('VILLA') || uStr.includes('DANIELA')) {
        const found = stores.find(s => (s.barrio || s.name).toUpperCase().includes('VILLA'));
        if (found) storeId = String(found.id);
      }
    }

    // Resolve accurate store name
    if (storeId) {
      const foundStore = stores.find((s) => String(s.id) === String(storeId));
      if (foundStore) {
        storeName = formatStoreName(foundStore);
      } else {
        storeName = `Sede #${storeId}`;
      }
    }
    if (!storeName) storeName = 'Todas las sedes';

    // Real change detection (strictly genuine user modifications, 0 fake stock, 0 fake system changes)
    const priceChanged = oldPrice !== null && newPrice !== null && oldPrice !== newPrice;
    const statusChanged = oldStatus !== null && newStatus !== null && oldStatus !== newStatus;
    const nameChanged = Boolean(parsedOldObj?.name && parsedNewObj?.name && parsedOldObj.name !== parsedNewObj.name);
    const descChanged = Boolean(oldDescription && newDescription && oldDescription.trim() !== newDescription.trim());
    const categoryChanged = Boolean(
      (parsedOldObj?.category?.name || parsedOldObj?.categoryName) &&
      (parsedNewObj?.category?.name || parsedNewObj?.categoryName) &&
      (parsedOldObj?.category?.name || parsedOldObj?.categoryName) !== (parsedNewObj?.category?.name || parsedNewObj?.categoryName)
    );

    // Detailed description text
    let detail = 'Actualización en catálogo';
    if (log.actionType === 'CREATE') {
      detail = 'Se publicó el producto en catálogo';
    } else if (log.actionType === 'DELETE') {
      detail = 'Se eliminó el producto del catálogo';
    } else if (log.actionType === 'UPDATE') {
      if (priceChanged && statusChanged) {
        detail = `Cambio de precio (${formatPrice(oldPrice!)} → ${formatPrice(newPrice!)}) y disponibilidad`;
      } else if (priceChanged) {
        detail = `Cambio de precio: ${formatPrice(oldPrice!)} → ${formatPrice(newPrice!)}`;
      } else if (statusChanged) {
        detail = `Cambio de disponibilidad: ${oldStatus === 'AVAILABLE' ? 'Disponible' : 'Agotado'} → ${newStatus === 'AVAILABLE' ? 'Disponible' : 'Agotado'}`;
      } else if (nameChanged) {
        detail = `Cambio de nombre: ${parsedOldObj.name} → ${parsedNewObj.name}`;
      } else if (descChanged) {
        detail = 'Se actualizó la descripción del producto';
      } else if (categoryChanged) {
        detail = 'Se actualizó la categoría del producto';
      } else {
        detail = 'Edición de producto guardada por usuario';
      }
    }

    return { 
      name, 
      image, 
      ref, 
      storeName, 
      storeId, 
      detail, 
      oldPrice, 
      newPrice, 
      priceChanged,
      oldStatus, 
      newStatus,
      statusChanged,
      oldDescription, 
      newDescription,
      descChanged,
      nameChanged,
      categoryChanged,
      category,
      parsedOld: parsedOldObj,
      parsedNew: parsedNewObj
    };
  };

  // Date range filter predicate
  const isDateInRange = (date: Date): boolean => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const targetDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    if (dateRangeMode === 'today') {
      return targetDay.getTime() === todayStart.getTime();
    }
    if (dateRangeMode === 'yesterday') {
      const yesterdayStart = new Date(todayStart);
      yesterdayStart.setDate(yesterdayStart.getDate() - 1);
      return targetDay.getTime() === yesterdayStart.getTime();
    }
    if (dateRangeMode === '7days') {
      const past7 = new Date(todayStart);
      past7.setDate(past7.getDate() - 6);
      return targetDay >= past7 && targetDay <= now;
    }
    if (dateRangeMode === '30days') {
      const past30 = new Date(todayStart);
      past30.setDate(past30.getDate() - 29);
      return targetDay >= past30 && targetDay <= now;
    }
    if (dateRangeMode === 'specific_date') {
      if (!selectedSpecificDate) return true;
      const [y, m, d] = selectedSpecificDate.split('-').map(Number);
      return targetDay.getFullYear() === y && (targetDay.getMonth() + 1) === m && targetDay.getDate() === d;
    }
    if (dateRangeMode === 'all') {
      return true;
    }
    if (dateRangeMode === 'custom') {
      if (!customStartDate && !customEndDate) return true;
      if (customStartDate && customEndDate) {
        const [sy, sm, sd] = customStartDate.split('-').map(Number);
        const start = new Date(sy, sm - 1, sd, 0, 0, 0, 0);
        const [ey, em, ed] = customEndDate.split('-').map(Number);
        const end = new Date(ey, em - 1, ed, 23, 59, 59, 999);
        return date >= start && date <= end;
      }
      if (customStartDate) {
        const [sy, sm, sd] = customStartDate.split('-').map(Number);
        const start = new Date(sy, sm - 1, sd, 0, 0, 0, 0);
        return date >= start;
      }
      if (customEndDate) {
        const [ey, em, ed] = customEndDate.split('-').map(Number);
        const end = new Date(ey, em - 1, ed, 23, 59, 59, 999);
        return date <= end;
      }
      return true;
    }
    return true;
  };

  // Base catalog logs: strictly only movements for publicar (CREATE), modificar (UPDATE), eliminar (DELETE) on catalog products
  const baseCatalogLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      // 1. Strictly only allow Publicar (CREATE), Modificar (UPDATE), or Eliminar (DELETE)
      if (log.actionType !== 'CREATE' && log.actionType !== 'UPDATE' && log.actionType !== 'DELETE') {
        return false;
      }

      // 2. Strictly PRODUCT entity only (or empty/null for legacy catalog items)
      // Completely excludes RECRUITMENT_*, TIKTOK_*, USER, SEDE, direct STORAGE uploads, etc.
      if (log.entityType && log.entityType !== 'PRODUCT') {
        return false;
      }

      const logDate = parseDateSafe(log.createdAt);
      if (!isDateInRange(logDate)) return false;

      const parsed = parseLogProduct(log);

      // 3. STRICT FILTER BY USER (SUPERVISIÓN INDIVIDUAL DE CADA USUARIO)
      if (selectedSupervisorId !== 'all') {
        const targetOption = supervisorOptions.find(o => o.id === selectedSupervisorId);
        const targetUser = users.find(u => String(u.id) === selectedSupervisorId);

        const targetId = Number(selectedSupervisorId);
        const targetName = (targetOption?.userName || targetUser?.name || '').toLowerCase().trim();
        const targetEmail = (targetUser?.email || '').toLowerCase().trim();

        const matchesId = log.userId && Number(log.userId) === targetId;
        const matchesName = targetName && log.userName && log.userName.toLowerCase().trim() === targetName;
        const matchesEmail = targetEmail && log.userEmail && log.userEmail.toLowerCase().trim() === targetEmail;

        if (!matchesId && !matchesName && !matchesEmail) {
          return false;
        }
      }

      // 4. Search term
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchesProduct = parsed.name.toLowerCase().includes(term);
        const matchesRef = parsed.ref.toLowerCase().includes(term);
        const matchesUser = log.userName ? log.userName.toLowerCase().includes(term) : false;
        const matchesStore = parsed.storeName ? parsed.storeName.toLowerCase().includes(term) : false;
        const matchesDetail = parsed.detail ? parsed.detail.toLowerCase().includes(term) : false;
        if (!matchesProduct && !matchesRef && !matchesUser && !matchesStore && !matchesDetail) {
          return false;
        }
      }

      return true;
    });
  }, [auditLogs, dateRangeMode, selectedSpecificDate, customStartDate, customEndDate, selectedSupervisorId, supervisorOptions, searchTerm, products, stores, users]);

  // Overall metric counts calculated directly from real DB records
  const publishedCount = useMemo(() => {
    return baseCatalogLogs.filter(l => l.actionType === 'CREATE').length;
  }, [baseCatalogLogs]);

  const editedCount = useMemo(() => {
    return baseCatalogLogs.filter(l => l.actionType === 'UPDATE').length;
  }, [baseCatalogLogs]);

  const deletedCount = useMemo(() => {
    return baseCatalogLogs.filter(l => l.actionType === 'DELETE').length;
  }, [baseCatalogLogs]);

  const hiddenCount = useMemo(() => {
    return products.filter(p => {
      const isOut = p.status === 'OUT_OF_STOCK';
      if (!isOut) return false;
      if (selectedSupervisorId !== 'all') {
        const targetOption = supervisorOptions.find(o => o.id === selectedSupervisorId);
        const store = stores.find(s => formatStoreName(s) === targetOption?.storeName || (targetOption?.storeName && targetOption.storeName.includes(s.barrio || '')));
        if (store) {
          const sId = String(store.id);
          return p.storeIds?.some(id => String(id) === sId) || p.stores?.some(s => String(s.id) === sId);
        }
      }
      return true;
    }).length;
  }, [products, selectedSupervisorId, supervisorOptions, stores]);

  const totalMovementsCount = publishedCount + editedCount + deletedCount;

  // Filtered logs displayed in table (allows user to filter by action: ALL, CREATE, UPDATE, DELETE)
  const filteredLogs = useMemo(() => {
    if (selectedMovementAction === 'ALL') {
      return baseCatalogLogs;
    }
    return baseCatalogLogs.filter(l => l.actionType === selectedMovementAction);
  }, [baseCatalogLogs, selectedMovementAction]);

  // Base logs for Historial de Cambios (strictly edited products only)
  const historyBaseLogs = useMemo(() => {
    return auditLogs.filter(log => {
      // Must be strictly UPDATE (productos editados)
      if (log.actionType !== 'UPDATE') {
        return false;
      }
      if (log.entityType && log.entityType !== 'PRODUCT') {
        return false;
      }

      const logDate = parseDateSafe(log.createdAt);
      if (!isDateInRange(logDate)) return false;

      const parsed = parseLogProduct(log);

      // Sede filter
      if (historySelectedStore !== 'all') {
        const matchesStore = parsed.storeId === historySelectedStore ||
          (parsed.storeName && parsed.storeName.toLowerCase().includes(historySelectedStore.toLowerCase()));
        if (!matchesStore) return false;
      }

      // User filter
      if (historySelectedUser !== 'all') {
        const matchesUser = (log.userId && String(log.userId) === historySelectedUser) ||
          (log.userName && log.userName.toLowerCase().trim() === historySelectedUser.toLowerCase().trim());
        if (!matchesUser) return false;
      }

      return true;
    });
  }, [auditLogs, dateRangeMode, selectedSpecificDate, customStartDate, customEndDate, historySelectedStore, historySelectedUser, products, stores, users]);

  // Real KPIs for Historial de Cambios (reflecting real edit counts from genuine user actions)
  const historyKpis = useMemo(() => {
    const totalEdited = historyBaseLogs.length;

    const priceChanges = historyBaseLogs.filter(l => {
      const p = parseLogProduct(l);
      return p.priceChanged;
    }).length;

    const statusChanges = historyBaseLogs.filter(l => {
      const p = parseLogProduct(l);
      return p.statusChanged || p.newStatus === 'OUT_OF_STOCK' || p.oldStatus === 'OUT_OF_STOCK';
    }).length;

    const descChanges = historyBaseLogs.filter(l => {
      const p = parseLogProduct(l);
      return p.descChanged;
    }).length;

    return { totalEdited, priceChanges, statusChanges, descChanges };
  }, [historyBaseLogs]);

  // Logs filtered specifically for Historial de Cambios (Tab 6)
  const historyLogs = useMemo(() => {
    return historyBaseLogs.filter(log => {
      const parsed = parseLogProduct(log);

      // Change type filter
      if (historySelectedType !== 'ALL') {
        if (historySelectedType === 'PRICE') {
          if (!parsed.priceChanged) return false;
        } else if (historySelectedType === 'STATUS') {
          if (!parsed.statusChanged && parsed.newStatus !== 'OUT_OF_STOCK' && parsed.oldStatus !== 'OUT_OF_STOCK') return false;
        } else if (historySelectedType === 'DESCRIPTION') {
          if (!parsed.descChanged) return false;
        }
      }

      // Search term
      if (historySearchTerm.trim()) {
        const term = historySearchTerm.toLowerCase();
        const matchesProduct = parsed.name.toLowerCase().includes(term);
        const matchesRef = parsed.ref.toLowerCase().includes(term);
        const matchesUser = log.userName ? log.userName.toLowerCase().includes(term) : false;
        const matchesStore = parsed.storeName ? parsed.storeName.toLowerCase().includes(term) : false;
        if (!matchesProduct && !matchesRef && !matchesUser && !matchesStore) {
          return false;
        }
      }

      return true;
    });
  }, [historyBaseLogs, historySelectedType, historySearchTerm, products, stores, users]);

  const historyItemsPerPage = 5;
  const totalHistoryItems = historyLogs.length;
  const totalHistoryPages = Math.max(1, Math.ceil(totalHistoryItems / historyItemsPerPage));
  const paginatedHistoryLogs = useMemo(() => {
    const startIndex = (historyCurrentPage - 1) * historyItemsPerPage;
    return historyLogs.slice(startIndex, startIndex + historyItemsPerPage);
  }, [historyLogs, historyCurrentPage, historyItemsPerPage]);

  // Selected Log for detail panel
  const currentDetailLog = useMemo(() => {
    if (historySelectedLogId) {
      const found = historyLogs.find(l => String(l.id) === String(historySelectedLogId));
      if (found) return found;
    }
    return paginatedHistoryLogs[0] || historyLogs[0] || null;
  }, [historyLogs, paginatedHistoryLogs, historySelectedLogId]);

  // Pagination page numbers generator helper
  const getPaginationNumbers = (current: number, total: number): (number | string)[] => {
    if (total <= 5) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    if (current <= 3) {
      return [1, 2, 3, '...', total];
    }
    if (current >= total - 2) {
      return [1, '...', total - 2, total - 1, total];
    }
    return [1, '...', current - 1, current, current + 1, '...', total];
  };

  // Real trend calculations vs previous period (100% dynamic math, NO hardcoded values)
  const trends = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    let periodDays = 7;
    if (dateRangeMode === 'today' || dateRangeMode === 'yesterday' || dateRangeMode === 'specific_date') periodDays = 1;
    else if (dateRangeMode === '30days') periodDays = 30;

    const prevStart = new Date(todayStart);
    prevStart.setDate(prevStart.getDate() - (periodDays * 2));
    const prevEnd = new Date(todayStart);
    prevEnd.setDate(prevEnd.getDate() - periodDays);

    const prevLogs = auditLogs.filter(log => {
      if (log.actionType !== 'CREATE' && log.actionType !== 'UPDATE' && log.actionType !== 'DELETE') return false;
      if (log.entityType && log.entityType !== 'PRODUCT') return false;
      const d = parseDateSafe(log.createdAt);
      return d >= prevStart && d < prevEnd;
    });

    const prevPub = prevLogs.filter(l => l.actionType === 'CREATE').length;
    const prevEdt = prevLogs.filter(l => l.actionType === 'UPDATE').length;
    const prevDel = prevLogs.filter(l => l.actionType === 'DELETE').length;
    const prevTot = prevPub + prevEdt + prevDel;

    const calcPct = (curr: number, prev: number) => {
      if (prev === 0) return curr > 0 ? '+100%' : '0%';
      const diff = Math.round(((curr - prev) / prev) * 100);
      return diff > 0 ? `+${diff}%` : `${diff}%`;
    };

    return {
      published: calcPct(publishedCount, prevPub),
      edited: calcPct(editedCount, prevEdt),
      deleted: calcPct(deletedCount, prevDel),
      total: calcPct(totalMovementsCount, prevTot)
    };
  }, [auditLogs, dateRangeMode, publishedCount, editedCount, deletedCount, totalMovementsCount]);

  // Real store activity statistics across ALL stores in the database
  const storeStatsList = useMemo(() => {
    const now = new Date();
    return stores.map(store => {
      const storeIdStr = String(store.id);
      const storeName = formatStoreName(store);
      const managerName = getStoreManagerName(store);

      // Find user ID for this store
      const assigned = users.find(u => u.storeIds?.some(id => String(id) === storeIdStr));
      let uId: number | null = assigned ? Number(assigned.id) : null;
      if (!uId) {
        const b = (((store.barrio || '') + ' ' + (store.name || '')).toUpperCase());
        if (b.includes('MODELO')) uId = 5;
        else if (b.includes('MARIANO')) uId = 3;
        else if (b.includes('ISRAEL')) uId = 4;
        else if (b.includes('VILLA')) uId = 2;
      }

      // Find all logs for this user/store ever (STRICTLY by user to avoid mixing stores, and strictly catalog PRODUCT actions)
      const allStoreLogs = auditLogs.filter(log => {
        if (log.actionType !== 'CREATE' && log.actionType !== 'UPDATE' && log.actionType !== 'DELETE') return false;
        if (log.entityType && log.entityType !== 'PRODUCT') return false;

        const matchesUserId = uId !== null && log.userId && Number(log.userId) === uId;
        const matchesUserName = managerName && log.userName && log.userName.toLowerCase().trim() === managerName.toLowerCase().trim();
        return matchesUserId || matchesUserName;
      });

      // Filtered logs in selected range
      const storeLogsInRange = allStoreLogs.filter(log => {
        const logDate = parseDateSafe(log.createdAt);
        return isDateInRange(logDate);
      });

      const published = storeLogsInRange.filter(l => l.actionType === 'CREATE').length;
      const edited = storeLogsInRange.filter(l => l.actionType === 'UPDATE').length;
      const deleted = storeLogsInRange.filter(l => l.actionType === 'DELETE').length;
      const hidden = products.filter(p => p.status === 'OUT_OF_STOCK' && (
        p.storeIds?.some(id => String(id) === storeIdStr) || 
        p.stores?.some(s => String(s.id) === storeIdStr)
      )).length;
      const total = published + edited + deleted;

      // Find latest log timestamp
      let latestDate: Date | null = null;
      if (allStoreLogs.length > 0) {
        latestDate = parseDateSafe(allStoreLogs[0].createdAt);
      }

      // Calculate days without changes
      let daysWithoutChanges = 0;
      let lastUpdateFormatted = 'Sin actividad';

      if (latestDate) {
        const diffMs = now.getTime() - latestDate.getTime();
        daysWithoutChanges = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));

        const isToday = now.toDateString() === latestDate.toDateString();
        const yesterday = new Date(now);
        yesterday.setDate(now.getDate() - 1);
        const isYesterday = yesterday.toDateString() === latestDate.toDateString();

        const timeStr = latestDate.toLocaleTimeString('es-CO', { hour: 'numeric', minute: '2-digit', hour12: true });

        if (isToday) {
          lastUpdateFormatted = `Hoy, ${timeStr}`;
        } else if (isYesterday) {
          lastUpdateFormatted = `Ayer, ${timeStr}`;
        } else {
          lastUpdateFormatted = `${latestDate.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })}, ${timeStr}`;
        }
      }

      // Status determination
      let status: 'Activa' | 'En seguimiento' | 'Inactiva' = 'Activa';
      if (daysWithoutChanges >= alertSettings.inactiveDaysThreshold || allStoreLogs.length === 0) {
        status = 'Inactiva';
      } else if (daysWithoutChanges >= 1) {
        status = 'En seguimiento';
      }

      // Compliance percentage
      const targetMovements = alertSettings.dailyTarget;
      const compliance = total >= targetMovements ? 100 : Math.min(100, Math.round((total / Math.max(1, targetMovements)) * 100));

      // Today vs yesterday movements
      const todayLogs = allStoreLogs.filter(l => {
        const d = parseDateSafe(l.createdAt);
        return d.toDateString() === now.toDateString();
      });
      const yesterdayDate = new Date(now);
      yesterdayDate.setDate(now.getDate() - 1);
      const yesterdayLogs = allStoreLogs.filter(l => {
        const d = parseDateSafe(l.createdAt);
        return d.toDateString() === yesterdayDate.toDateString();
      });

      const todayCount = todayLogs.length;
      const yesterdayCount = yesterdayLogs.length;
      const pctVsYesterday = yesterdayCount > 0 
        ? Math.round(((todayCount - yesterdayCount) / yesterdayCount) * 100) 
        : (todayCount > 0 ? 100 : 0);

      return {
        store,
        storeIdStr,
        storeName,
        managerName,
        assignedUserId: uId,
        published,
        edited,
        deleted,
        hidden,
        total,
        daysWithoutChanges,
        lastUpdateFormatted,
        latestDate,
        status,
        compliance,
        todayCount,
        yesterdayCount,
        pctVsYesterday
      };
    });
  }, [stores, auditLogs, filteredLogs, products, alertSettings]);

  // Stores with activity today
  const activeStoresTodayCount = useMemo(() => {
    return storeStatsList.filter(s => s.todayCount > 0).length;
  }, [storeStatsList]);

  const inactiveStoresCount = storeStatsList.length - activeStoresTodayCount;
  const globalCompliancePct = storeStatsList.length > 0
    ? Math.round((activeStoresTodayCount / storeStatsList.length) * 100)
    : 0;

  // Stores with >= inactiveDaysThreshold days without updates
  const storesWithoutUpdates = useMemo(() => {
    return storeStatsList.filter(s => s.daysWithoutChanges >= alertSettings.inactiveDaysThreshold || s.lastUpdateFormatted === 'Sin actividad');
  }, [storeStatsList, alertSettings]);

  // Selected user / store stats (for Tab 2 Movimientos)
  const currentSelectedStoreStats = useMemo(() => {
    if (selectedSupervisorId === 'all') {
      return storeStatsList[0] || null;
    }
    const targetOption = supervisorOptions.find(o => o.id === selectedSupervisorId);
    if (!targetOption) return storeStatsList[0] || null;

    const matched = storeStatsList.find(s => 
      (s.assignedUserId && String(s.assignedUserId) === selectedSupervisorId) ||
      (s.managerName && s.managerName.toLowerCase().trim() === targetOption.userName.toLowerCase().trim())
    );
    return matched || storeStatsList[0] || null;
  }, [storeStatsList, selectedSupervisorId, supervisorOptions]);

  const currentSupervisorOption = useMemo(() => {
    if (selectedSupervisorId === 'all') return null;
    return supervisorOptions.find(o => o.id === selectedSupervisorId) || null;
  }, [supervisorOptions, selectedSupervisorId]);

  // Real timeline points for "Evolución de movimientos" (SVG Area / Line Chart)
  const timelineData = useMemo(() => {
    const daysCount = 7;
    const now = new Date();
    const points: { dateLabel: string; count: number; dateStr: string }[] = [];

    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      const dateLabel = d.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' });

      const dayLogs = filteredLogs.filter(log => {
        const logDate = parseDateSafe(log.createdAt);
        return logDate.toISOString().slice(0, 10) === dateStr;
      });

      points.push({ dateLabel, count: dayLogs.length, dateStr });
    }

    const maxCount = Math.max(...points.map(p => p.count), 5);
    return { points, maxCount };
  }, [filteredLogs]);

  // Multi-line chart data per real store (Tab 3)
  const storeTimelineData = useMemo(() => {
    const daysCount = 7;
    const now = new Date();
    const dates: string[] = [];
    const dateLabels: string[] = [];

    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      dates.push(d.toISOString().slice(0, 10));
      dateLabels.push(d.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' }));
    }

    const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

    const storeLines = storeStatsList.map((stat, sIdx) => {
      const counts = dates.map(dateStr => {
        return auditLogs.filter(log => {
          const parsed = parseLogProduct(log);
          const isStore = parsed.storeId === stat.storeIdStr || parsed.storeName.toLowerCase() === stat.storeName.toLowerCase();
          if (!isStore) return false;
          return parseDateSafe(log.createdAt).toISOString().slice(0, 10) === dateStr;
        }).length;
      });

      return {
        storeName: stat.storeName,
        color: colors[sIdx % colors.length],
        counts
      };
    });

    const allCounts = storeLines.flatMap(s => s.counts);
    const maxVal = Math.max(...allCounts, 5);

    return { dateLabels, storeLines, maxVal };
  }, [storeStatsList, auditLogs]);

  // Generate dynamic alerts based on real DB status
  const dynamicAlerts = useMemo<AuditAlert[]>(() => {
    const list: AuditAlert[] = [];

    // 1. Sin actualización (Crítica): Stores with >= inactiveDaysThreshold days without movements
    storeStatsList.forEach(s => {
      if (s.daysWithoutChanges >= alertSettings.inactiveDaysThreshold || s.lastUpdateFormatted === 'Sin actividad') {
        list.push({
          id: `alert-inactive-${s.storeIdStr}`,
          alertType: 'SIN_ACTUALIZACION',
          title: 'Sin actualización',
          description: `Lleva ${s.daysWithoutChanges} días sin realizar movimientos · Última actividad: ${s.lastUpdateFormatted}`,
          sedeId: s.storeIdStr,
          sedeName: s.storeName,
          severity: 'CRITICA',
          status: reviewedAlertIds.includes(`alert-inactive-${s.storeIdStr}`) ? 'REVISADA' : 'PENDIENTE',
          createdAt: s.latestDate ? s.latestDate.toISOString() : new Date().toISOString()
        });
      }
    });

    // 2. Baja actividad (Seguimiento): Store with low activity vs target
    storeStatsList.forEach(s => {
      if (s.todayCount > 0 && s.todayCount < alertSettings.dailyTarget) {
        list.push({
          id: `alert-low-${s.storeIdStr}`,
          alertType: 'BAJA_ACTIVIDAD',
          title: 'Baja actividad',
          description: `Solo ${s.todayCount} ${s.todayCount === 1 ? 'movimiento' : 'movimientos'} en las últimas 24 horas · Meta diaria: ${alertSettings.dailyTarget} movimientos`,
          sedeId: s.storeIdStr,
          sedeName: s.storeName,
          severity: 'SEGUIMIENTO',
          status: reviewedAlertIds.includes(`alert-low-${s.storeIdStr}`) ? 'REVISADA' : 'PENDIENTE',
          createdAt: new Date().toISOString()
        });
      } else if (s.todayCount === 0 && s.daysWithoutChanges < alertSettings.inactiveDaysThreshold) {
        list.push({
          id: `alert-nocomply-${s.storeIdStr}`,
          alertType: 'SIN_CUMPLIMIENTO',
          title: 'Sin cumplimiento',
          description: `No alcanzó la meta diaria de actualización · Realizó 0 de ${alertSettings.dailyTarget} movimientos hoy`,
          sedeId: s.storeIdStr,
          sedeName: s.storeName,
          severity: 'SEGUIMIENTO',
          status: reviewedAlertIds.includes(`alert-nocomply-${s.storeIdStr}`) ? 'REVISADA' : 'PENDIENTE',
          createdAt: new Date().toISOString()
        });
      }
    });

    // 3. Mass deletions / edits detection in real logs
    const recentDeletionsByStore = new Map<string, number>();
    const recentEditsByStore = new Map<string, number>();

    filteredLogs.forEach(log => {
      const parsed = parseLogProduct(log);
      const storeKey = parsed.storeName || 'General';
      if (log.actionType === 'DELETE') {
        recentDeletionsByStore.set(storeKey, (recentDeletionsByStore.get(storeKey) || 0) + 1);
      } else if (log.actionType === 'UPDATE') {
        recentEditsByStore.set(storeKey, (recentEditsByStore.get(storeKey) || 0) + 1);
      }
    });

    recentDeletionsByStore.forEach((count, sName) => {
      if (count >= alertSettings.massDeleteThreshold) {
        list.push({
          id: `alert-massdel-${sName}`,
          alertType: 'ELIMINACION_MASIVA',
          title: 'Eliminación masiva',
          description: `Se eliminaron ${count} productos del catálogo · Revisa si fue un ajuste autorizado`,
          sedeName: sName,
          severity: 'INFORMATIVA',
          status: reviewedAlertIds.includes(`alert-massdel-${sName}`) ? 'REVISADA' : 'PENDIENTE',
          createdAt: new Date().toISOString()
        });
      }
    });

    recentEditsByStore.forEach((count, sName) => {
      if (count >= alertSettings.massEditThreshold) {
        list.push({
          id: `alert-massedit-${sName}`,
          alertType: 'EDICION_MASIVA',
          title: 'Edición masiva',
          description: `Se editaron ${count} productos · Cambios en precio y descripción`,
          sedeName: sName,
          severity: 'INFORMATIVA',
          status: reviewedAlertIds.includes(`alert-massedit-${sName}`) ? 'REVISADA' : 'PENDIENTE',
          createdAt: new Date().toISOString()
        });
      }
    });

    return list;
  }, [storeStatsList, alertSettings, reviewedAlertIds, filteredLogs]);

  // Filtered alerts
  const filteredAlerts = useMemo(() => {
    return dynamicAlerts.filter(alert => {
      if (selectedSupervisorId !== 'all') {
        const targetOption = supervisorOptions.find(o => o.id === selectedSupervisorId);
        if (alert.sedeName && targetOption && !targetOption.storeName.toLowerCase().includes(alert.sedeName.toLowerCase())) {
          return false;
        }
      }
      if (alertTypeFilter !== 'all') {
        if (alert.alertType !== alertTypeFilter) return false;
      }
      return true;
    });
  }, [dynamicAlerts, selectedSupervisorId, supervisorOptions, alertTypeFilter]);

  // Alert KPI counts
  const criticalAlertsCount = dynamicAlerts.filter(a => a.severity === 'CRITICA' && a.status === 'PENDIENTE').length;
  const followUpAlertsCount = dynamicAlerts.filter(a => a.severity === 'SEGUIMIENTO' && a.status === 'PENDIENTE').length;
  const infoAlertsCount = dynamicAlerts.filter(a => a.severity === 'INFORMATIVA' && a.status === 'PENDIENTE').length;
  const normalStoresCount = storeStatsList.filter(s => s.status === 'Activa').length;

  // Toggle Alert Reviewed Status
  const handleToggleAlertStatus = (alertId: string) => {
    setReviewedAlertIds(prev => {
      let updated: string[];
      if (prev.includes(alertId)) {
        updated = prev.filter(id => id !== alertId);
      } else {
        updated = [...prev, alertId];
      }
      try {
        localStorage.setItem('catalog_audit_reviewed_alerts', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  // Calendar matrix days calculation (Tab 4)
  const calendarDays = useMemo(() => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const numDays = new Date(year, month + 1, 0).getDate();

    const daysArr: { dateStr: string; dayNum: number; dayName: string; isToday: boolean }[] = [];
    const now = new Date();

    const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

    for (let day = 1; day <= numDays; day++) {
      const d = new Date(year, month, day);
      const dayName = dayNames[d.getDay()];
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const isToday = now.getFullYear() === year && now.getMonth() === month && now.getDate() === day;
      daysArr.push({ dateStr, dayNum: day, dayName, isToday });
    }
    return daysArr;
  }, [calendarMonth]);

  // Activity map per store per day: Map<storeId, Set<dateStr>>
  const storeDailyActivityMap = useMemo(() => {
    const map = new Map<string, Set<string>>();
    stores.forEach(s => map.set(String(s.id), new Set<string>()));

    auditLogs.forEach(log => {
      const parsed = parseLogProduct(log);
      if (parsed.storeId && map.has(parsed.storeId)) {
        const d = parseDateSafe(log.createdAt);
        const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        map.get(parsed.storeId)!.add(dateStr);
      }
    });
    return map;
  }, [stores, auditLogs]);

  // Selected calendar day logs (Tab 4 bottom table)
  const selectedDayLogs = useMemo(() => {
    return auditLogs.filter(log => {
      if (log.actionType !== 'CREATE' && log.actionType !== 'UPDATE' && log.actionType !== 'DELETE') return false;
      if (log.entityType && log.entityType !== 'PRODUCT') return false;

      const d = parseDateSafe(log.createdAt);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      if (dateStr !== selectedCalendarDayStr) return false;
      if (selectedSupervisorId !== 'all') {
        const targetOption = supervisorOptions.find(o => o.id === selectedSupervisorId);
        const matchesId = log.userId && String(log.userId) === selectedSupervisorId;
        const matchesName = targetOption && log.userName && log.userName.toLowerCase().trim() === targetOption.userName.toLowerCase().trim();
        return matchesId || matchesName;
      }
      return true;
    });
  }, [auditLogs, selectedCalendarDayStr, selectedSupervisorId, supervisorOptions]);

  // Selected calendar day summary metrics
  const selectedDayMetrics = useMemo(() => {
    const pub = selectedDayLogs.filter(l => l.actionType === 'CREATE').length;
    const edt = selectedDayLogs.filter(l => l.actionType === 'UPDATE').length;
    const del = selectedDayLogs.filter(l => l.actionType === 'DELETE').length;
    const hid = 0;
    const total = pub + edt + del;
    return { pub, edt, del, hid, total };
  }, [selectedDayLogs]);

  // Save Alert Settings
  const handleSaveAlertSettings = (newSettings: AuditAlertSettings) => {
    setAlertSettings(newSettings);
    try {
      localStorage.setItem('catalog_audit_alert_settings', JSON.stringify(newSettings));
    } catch (e) {}
    setIsAlertSettingsOpen(false);
    Swal.fire({
      icon: 'success',
      title: 'Configuración guardada',
      text: 'Los umbrales de alerta han sido actualizados.',
      confirmButtonColor: '#10b981'
    });
  };

  // Export report to CSV/Excel
  const handleExportReport = () => {
    Swal.fire({
      title: 'Exportar Reporte de Auditoría',
      html: `
        <div class="text-left text-xs space-y-2 text-gray-700">
          <p><strong>Rango seleccionado:</strong> ${dateRangeMode.toUpperCase()}</p>
          <p><strong>Total movimientos incluidos:</strong> ${filteredLogs.length}</p>
          <p><strong>Publicados:</strong> ${publishedCount} | <strong>Editados:</strong> ${editedCount} | <strong>Eliminados:</strong> ${deletedCount}</p>
          <p><strong>Sedes analizadas:</strong> ${stores.length}</p>
          <p><strong>Cumplimiento promedio:</strong> ${globalCompliancePct}%</p>
        </div>
      `,
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: 'Descargar CSV',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#000000'
    }).then((res) => {
      if (res.isConfirmed) {
        const headers = 'ID,Fecha y Hora,Sede,Usuario,Email,Rol,Accion,Entidad,Referencia,Detalle\n';
        const rows = filteredLogs.map(log => {
          const parsed = parseLogProduct(log);
          const dateStr = parseDateSafe(log.createdAt).toLocaleString('es-CO');
          return `"${log.id}","${dateStr}","${parsed.storeName}","${log.userName}","${log.userEmail}","${log.userRole}","${log.actionType}","${log.entityType}","${parsed.ref}","${parsed.detail.replace(/"/g, '""')}"`;
        }).join('\n');

        const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `auditoria_catalogos_${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
      }
    });
  };

  // Full detailed diff modal
  const handleOpenLogModal = (log: AuditLog) => {
    setSelectedLogDetail(log);
  };

  // Donut SVG circumference helper
  const circumference = 88;
  const pubDash = totalMovementsCount > 0 ? (publishedCount / totalMovementsCount) * circumference : 0;
  const edtDash = totalMovementsCount > 0 ? (editedCount / totalMovementsCount) * circumference : 0;
  const delDash = totalMovementsCount > 0 ? (deletedCount / totalMovementsCount) * circumference : 0;
  const hidDash = totalMovementsCount > 0 ? (hiddenCount / totalMovementsCount) * circumference : 0;

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* 1. Header (Common across all tabs) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-11 h-11 bg-black text-white rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm">
            <ShieldCheck className="w-6 h-6 stroke-[2]" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
              Auditoría de Catálogos
            </h1>
            <p className="text-xs text-gray-500 font-medium">
              Supervisa y controla los cambios realizados en los catálogos por sede y usuario.
            </p>
          </div>
        </div>

        <button
          onClick={handleExportReport}
          type="button"
          className="px-4 py-2 bg-white hover:bg-gray-50 text-gray-800 border border-gray-200 text-xs font-bold rounded-xl flex items-center gap-2 shadow-2xs transition-all cursor-pointer"
        >
          <Download className="w-4 h-4 text-gray-600" />
          Exportar reporte
        </button>
      </div>

      {/* 2. Tabs Navigation Bar (5 official tabs) */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        <button
          type="button"
          onClick={() => setActiveTab('general')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'general'
              ? 'bg-black text-white shadow-xs'
              : 'bg-white text-gray-600 hover:text-gray-900 border border-gray-200/80 hover:bg-gray-50'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          Resumen general
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('movements')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'movements'
              ? 'bg-black text-white shadow-xs'
              : 'bg-white text-gray-600 hover:text-gray-900 border border-gray-200/80 hover:bg-gray-50'
          }`}
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Movimientos
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('store_activity')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'store_activity'
              ? 'bg-black text-white shadow-xs'
              : 'bg-white text-gray-600 hover:text-gray-900 border border-gray-200/80 hover:bg-gray-50'
          }`}
        >
          <StoreIcon className="w-3.5 h-3.5" />
          Actividad por sede
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('daily_tracking')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'daily_tracking'
              ? 'bg-black text-white shadow-xs'
              : 'bg-white text-gray-600 hover:text-gray-900 border border-gray-200/80 hover:bg-gray-50'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          Seguimiento diario
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('alerts')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'alerts'
              ? 'bg-black text-white shadow-xs'
              : 'bg-white text-gray-600 hover:text-gray-900 border border-gray-200/80 hover:bg-gray-50'
          }`}
        >
          <Bell className="w-3.5 h-3.5" />
          Alertas
          {criticalAlertsCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-red-600 text-white text-[9px] font-black flex items-center justify-center">
              {criticalAlertsCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('change_history')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'change_history'
              ? 'bg-black text-white shadow-xs'
              : 'bg-white text-gray-600 hover:text-gray-900 border border-gray-200/80 hover:bg-gray-50'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          Historial de cambios
        </button>
      </div>

      {/* ========================================================
          TAB 1: RESUMEN GENERAL (Image 2)
          ======================================================== */}
      {activeTab === 'general' && (
        <div className="space-y-6">
          {/* Top Filters Bar */}
          <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-2xs space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Rango de fecha</label>
                  <div className="relative">
                    <select
                      value={dateRangeMode}
                      onChange={e => {
                        const val = e.target.value as any;
                        setDateRangeMode(val);
                        if (val === 'specific_date' && !selectedSpecificDate) {
                          setSelectedSpecificDate(new Date().toISOString().slice(0, 10));
                        }
                      }}
                      className="pl-8 pr-8 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 cursor-pointer focus:outline-none focus:ring-1 focus:ring-black"
                    >
                      <option value="7days">Últimos 7 días</option>
                      <option value="today">Hoy, {new Date().toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })}</option>
                      <option value="yesterday">Ayer</option>
                      <option value="30days">Últimos 30 días</option>
                      <option value="specific_date">📅 Seleccionar fecha del mes...</option>
                      <option value="custom">📆 Rango personalizado</option>
                      <option value="all">Histórico completo (Todo)</option>
                    </select>
                    <Calendar className="w-3.5 h-3.5 text-gray-500 absolute left-2.5 top-2.5 pointer-events-none" />
                  </div>
                </div>

                {/* Input for Specific Date of the Month */}
                {dateRangeMode === 'specific_date' && (
                  <div className="animate-in fade-in duration-200">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Fecha a consultar</label>
                    <div className="flex items-center gap-1.5">
                      <div className="relative">
                        <input
                          type="date"
                          value={selectedSpecificDate}
                          onChange={e => setSelectedSpecificDate(e.target.value)}
                          className="pl-8 pr-3 py-1.5 bg-gray-50 border border-emerald-300 ring-2 ring-emerald-500/20 rounded-xl text-xs font-bold text-gray-900 cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                        <Calendar className="w-3.5 h-3.5 text-emerald-600 absolute left-2.5 top-2.5 pointer-events-none" />
                      </div>
                      <button
                        type="button"
                        onClick={() => {}}
                        className="px-3 py-1.5 bg-black hover:bg-gray-800 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                      >
                        <Search className="w-3 h-3" />
                        Buscar
                      </button>
                    </div>
                  </div>
                )}

                {/* Inputs for Custom Date Range */}
                {dateRangeMode === 'custom' && (
                  <div className="animate-in fade-in duration-200 flex items-center gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Desde</label>
                      <input
                        type="date"
                        value={customStartDate}
                        onChange={e => setCustomStartDate(e.target.value)}
                        className="px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 cursor-pointer focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Hasta</label>
                      <input
                        type="date"
                        value={customEndDate}
                        onChange={e => setCustomEndDate(e.target.value)}
                        className="px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 cursor-pointer focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Supervisar Usuario / Sede</label>
                  <div className="relative">
                    <select
                      value={selectedSupervisorId}
                      onChange={e => setSelectedSupervisorId(e.target.value)}
                      className="pl-8 pr-8 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 cursor-pointer focus:outline-none focus:ring-1 focus:ring-black"
                    >
                      <option value="all">Todos los usuarios y sedes</option>
                      {supervisorOptions.map(opt => (
                        <option key={opt.id} value={opt.id}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    <StoreIcon className="w-3.5 h-3.5 text-gray-500 absolute left-2.5 top-2.5 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setDateRangeMode(dateRangeMode === 'specific_date' ? '7days' : 'specific_date');
                    if (!selectedSpecificDate) setSelectedSpecificDate(new Date().toISOString().slice(0, 10));
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    dateRangeMode === 'specific_date'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  Seleccionar fecha
                </button>

                <button
                  onClick={loadData}
                  type="button"
                  className="px-3.5 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                  Actualizar
                </button>
              </div>
            </div>

            {/* If specific date is active, show banner */}
            {dateRangeMode === 'specific_date' && selectedSpecificDate && (
              <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200/80 rounded-xl px-3 py-2 text-xs text-emerald-900 font-medium">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    Consultando movimientos del día: <strong className="font-extrabold text-emerald-950">
                      {new Date(selectedSpecificDate + 'T00:00:00').toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </strong>
                  </span>
                  <span className="bg-emerald-200/70 text-emerald-900 text-[10px] font-black px-2 py-0.5 rounded-full">
                    {baseCatalogLogs.length} movimientos de catálogo encontrados
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setDateRangeMode('7days');
                    setSelectedSpecificDate('');
                  }}
                  className="text-emerald-700 hover:text-emerald-900 text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                  Quitar filtro de día
                </button>
              </div>
            )}
          </div>

          {/* 5 KPI Cards + Compliance Rate Card (100% real math from DB) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
            {/* Publicados */}
            <div className="bg-emerald-50/50 border border-emerald-100/80 rounded-2xl p-4 flex flex-col justify-between">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-base mb-2">
                +
              </div>
              <span className="text-[11px] font-bold text-gray-600">Publicados</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-2xl font-black text-gray-900">{publishedCount}</span>
                <span className="text-[10px] font-bold text-emerald-700 flex items-center">
                  ↑ {trends.published}
                </span>
              </div>
            </div>

            {/* Editados */}
            <div className="bg-blue-50/50 border border-blue-100/80 rounded-2xl p-4 flex flex-col justify-between">
              <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center mb-2">
                <Edit2 className="w-3.5 h-3.5" />
              </div>
              <span className="text-[11px] font-bold text-gray-600">Editados</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-2xl font-black text-gray-900">{editedCount}</span>
                <span className="text-[10px] font-bold text-blue-700 flex items-center">
                  ↑ {trends.edited}
                </span>
              </div>
            </div>

            {/* Eliminados */}
            <div className="bg-red-50/50 border border-red-100/80 rounded-2xl p-4 flex flex-col justify-between">
              <div className="w-7 h-7 rounded-lg bg-red-100 text-red-700 flex items-center justify-center mb-2">
                <Trash2 className="w-3.5 h-3.5" />
              </div>
              <span className="text-[11px] font-bold text-gray-600">Eliminados</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-2xl font-black text-gray-900">{deletedCount}</span>
                <span className="text-[10px] font-bold text-red-700 flex items-center">
                  {trends.deleted.startsWith('-') ? `↓ ${trends.deleted}` : `↑ ${trends.deleted}`}
                </span>
              </div>
            </div>

            {/* Ocultados */}
            <div className="bg-amber-50/50 border border-amber-100/80 rounded-2xl p-4 flex flex-col justify-between">
              <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center mb-2">
                <EyeOff className="w-3.5 h-3.5" />
              </div>
              <span className="text-[11px] font-bold text-gray-600">Ocultados</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-2xl font-black text-gray-900">{hiddenCount}</span>
                <span className="text-[10px] font-bold text-gray-500">
                  = 0%
                </span>
              </div>
            </div>

            {/* Total movimientos */}
            <div className="bg-purple-50/50 border border-purple-100/80 rounded-2xl p-4 flex flex-col justify-between">
              <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center mb-2">
                <Layers className="w-3.5 h-3.5" />
              </div>
              <span className="text-[11px] font-bold text-gray-600">Total movimientos</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-2xl font-black text-gray-900">{totalMovementsCount}</span>
                <span className="text-[10px] font-bold text-purple-700 flex items-center">
                  ↑ {trends.total}
                </span>
              </div>
            </div>

            {/* Cumplimiento de actualización */}
            <div className="bg-white border border-gray-200/80 rounded-2xl p-4 flex flex-col justify-between">
              <div className="flex items-center gap-1.5 text-emerald-700 text-xs font-bold mb-1">
                <Target className="w-4 h-4" />
                <span>Cumplimiento</span>
              </div>
              <div className="my-1">
                <span className="text-2xl font-black text-gray-900">{globalCompliancePct}%</span>
                <div className="w-full bg-gray-100 h-2 rounded-full mt-1.5 overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${globalCompliancePct}%` }}></div>
                </div>
              </div>
              <span className="text-[10px] text-gray-500 font-medium">
                {activeStoresTodayCount} de {stores.length} sedes con actividad hoy
              </span>
            </div>
          </div>

          {/* Middle Row: Left: Real Evolution & Donut (7 cols) | Right: Inactive stores & Latest movements (5 cols) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left Box: Evolución de movimientos + Donut (7 cols) */}
            <div className="lg:col-span-7 bg-white rounded-2xl p-5 border border-gray-200/80 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-gray-700" />
                  <h3 className="text-xs font-extrabold text-gray-900 uppercase tracking-wider">Evolución de movimientos</h3>
                </div>
                <select
                  value={movementEvolutionMode}
                  onChange={e => setMovementEvolutionMode(e.target.value as any)}
                  className="text-xs border border-gray-200 rounded-lg px-2.5 py-1 bg-gray-50 font-bold text-gray-700 cursor-pointer"
                >
                  <option value="day">Por día</option>
                  <option value="week">Por semana</option>
                </select>
              </div>

              {/* Real Smooth Line Chart Graphic generated from DB logs */}
              <div className="h-44 w-full relative pt-2">
                {(() => {
                  const pts = timelineData.points;
                  const maxVal = timelineData.maxCount;
                  const w = 500;
                  const h = 110;
                  const padX = 25;
                  const padY = 20;

                  const coords = pts.map((p, idx) => {
                    const x = padX + (idx / Math.max(1, pts.length - 1)) * (w - padX * 2);
                    const y = h - padY - (p.count / maxVal) * (h - padY * 2);
                    return { x, y, ...p };
                  });

                  // Build SVG path string
                  let pathD = '';
                  if (coords.length > 0) {
                    pathD = `M ${coords[0].x} ${coords[0].y}`;
                    for (let i = 1; i < coords.length; i++) {
                      const prev = coords[i - 1];
                      const curr = coords[i];
                      const cx = (prev.x + curr.x) / 2;
                      pathD += ` C ${cx} ${prev.y}, ${cx} ${curr.y}, ${curr.x} ${curr.y}`;
                    }
                  }

                  const areaD = coords.length > 0
                    ? `${pathD} L ${coords[coords.length - 1].x} ${h} L ${coords[0].x} ${h} Z`
                    : '';

                  return (
                    <>
                      <svg className="w-full h-full overflow-visible" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="curveGradientReal" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                            <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>

                        {/* Guide lines */}
                        <line x1="0" y1="20" x2={w} y2="20" stroke="#f3f4f6" strokeWidth="1" strokeDasharray="3 3" />
                        <line x1="0" y1="60" x2={w} y2="60" stroke="#f3f4f6" strokeWidth="1" strokeDasharray="3 3" />
                        <line x1="0" y1="100" x2={w} y2="100" stroke="#f3f4f6" strokeWidth="1" strokeDasharray="3 3" />

                        {/* Area */}
                        {areaD && <path d={areaD} fill="url(#curveGradientReal)" />}
                        {/* Line */}
                        {pathD && <path d={pathD} fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />}

                        {/* Dots */}
                        {coords.map((c, i) => (
                          <g key={i}>
                            <circle cx={c.x} cy={c.y} r="3.5" fill="#ffffff" stroke="#10b981" strokeWidth="2" />
                            <text x={c.x} y={c.y - 7} textAnchor="middle" fontSize="9" fontWeight="bold" fill="#374151">
                              {c.count > 0 ? c.count : ''}
                            </text>
                          </g>
                        ))}
                      </svg>

                      {/* Real X-Axis Date Labels */}
                      <div className="flex justify-between text-[10px] text-gray-400 font-medium px-2 mt-2">
                        {coords.map((c, i) => (
                          <span key={i}>{c.dateLabel}</span>
                        ))}
                      </div>
                    </>
                  );
                })()}
              </div>

              {/* Real Donut Chart & Legends */}
              <div className="pt-3 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-around gap-4">
                <div className="relative w-32 h-32 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="14" fill="transparent" stroke="#f3f4f6" strokeWidth="4.5"></circle>
                    {totalMovementsCount > 0 && (
                      <>
                        <circle
                          cx="18" cy="18" r="14" fill="transparent" stroke="#10b981" strokeWidth="4.5"
                          strokeDasharray={`${pubDash} ${circumference}`} strokeDashoffset="0"
                        ></circle>
                        <circle
                          cx="18" cy="18" r="14" fill="transparent" stroke="#3b82f6" strokeWidth="4.5"
                          strokeDasharray={`${edtDash} ${circumference}`} strokeDashoffset={String(-pubDash)}
                        ></circle>
                        <circle
                          cx="18" cy="18" r="14" fill="transparent" stroke="#ef4444" strokeWidth="4.5"
                          strokeDasharray={`${delDash} ${circumference}`} strokeDashoffset={String(-(pubDash + edtDash))}
                        ></circle>
                        <circle
                          cx="18" cy="18" r="14" fill="transparent" stroke="#f59e0b" strokeWidth="4.5"
                          strokeDasharray={`${hidDash} ${circumference}`} strokeDashoffset={String(-(pubDash + edtDash + delDash))}
                        ></circle>
                      </>
                    )}
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center text-center">
                    <span className="text-sm font-black text-gray-900">{totalMovementsCount}</span>
                    <span className="text-[9px] text-gray-400 font-bold uppercase">Movimientos</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    <span className="text-gray-600 font-medium">Publicados:</span>
                    <strong className="text-gray-900">
                      {totalMovementsCount > 0 ? Math.round((publishedCount / totalMovementsCount) * 100) : 0}% ({publishedCount})
                    </strong>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                    <span className="text-gray-600 font-medium">Editados:</span>
                    <strong className="text-gray-900">
                      {totalMovementsCount > 0 ? Math.round((editedCount / totalMovementsCount) * 100) : 0}% ({editedCount})
                    </strong>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                    <span className="text-gray-600 font-medium">Eliminados:</span>
                    <strong className="text-gray-900">
                      {totalMovementsCount > 0 ? Math.round((deletedCount / totalMovementsCount) * 100) : 0}% ({deletedCount})
                    </strong>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                    <span className="text-gray-600 font-medium">Ocultados:</span>
                    <strong className="text-gray-900">
                      {totalMovementsCount > 0 ? Math.round((hiddenCount / totalMovementsCount) * 100) : 0}% ({hiddenCount})
                    </strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Sedes sin actualizar & Últimos movimientos global (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              {/* Card: Sedes sin actualizar */}
              <div 
                onClick={() => setActiveTab('alerts')}
                className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-2xs flex items-center justify-between cursor-pointer hover:border-gray-300 transition-all"
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-500 mt-0.5">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-gray-700 block">Sedes sin actualizar</span>
                    <span className="text-xl font-black text-red-600 block mt-0.5">
                      {storesWithoutUpdates.length} {storesWithoutUpdates.length === 1 ? 'sede' : 'sedes'}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      con {alertSettings.inactiveDaysThreshold} días o más sin movimientos
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>

              {/* Card: Últimos movimientos (global en vivo de la BD) */}
              <div className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-2xs space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-900 uppercase tracking-wider">
                  <RefreshCw className="w-3.5 h-3.5 text-gray-600" />
                  <span>Últimos movimientos (global)</span>
                </div>

                <div className="space-y-2.5 pt-1">
                  {filteredLogs.slice(0, 4).map((log, idx) => {
                    const parsed = parseLogProduct(log);
                    const logDate = parseDateSafe(log.createdAt);
                    const isToday = new Date().toDateString() === logDate.toDateString();
                    const isYesterday = new Date(Date.now() - 86400000).toDateString() === logDate.toDateString();
                    const timeStr = logDate.toLocaleTimeString('es-CO', { hour: 'numeric', minute: '2-digit', hour12: true });
                    const dateDisplay = isToday ? `Hoy, ${timeStr}` : isYesterday ? `Ayer, ${timeStr}` : `${logDate.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })}, ${timeStr}`;

                    return (
                      <div
                        key={idx}
                        onClick={() => handleOpenLogModal(log)}
                        className="p-2 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-between gap-3 cursor-pointer border border-transparent hover:border-gray-100"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                            log.actionType === 'CREATE' ? 'bg-emerald-100 text-emerald-700' :
                            log.actionType === 'UPDATE' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {log.actionType === 'CREATE' && <span className="font-bold text-xs">+</span>}
                            {log.actionType === 'UPDATE' && <Edit2 className="w-3 h-3" />}
                            {log.actionType === 'DELETE' && <Trash2 className="w-3 h-3" />}
                          </div>
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-gray-900 block truncate">
                              {log.userName ? `${log.userName.toUpperCase()} ` : ''}
                              {log.actionType === 'CREATE' ? 'agregó un producto' : log.actionType === 'UPDATE' ? 'editó un producto' : 'eliminó un producto'}
                            </span>
                            <span className="text-[10px] text-gray-400 block truncate">
                              {parsed.storeName} · {dateDisplay}
                            </span>
                          </div>
                        </div>

                        <img
                          src={parsed.image}
                          alt={parsed.name}
                          className="w-8 h-8 rounded-lg object-cover border border-gray-100 shrink-0"
                          onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                        />
                      </div>
                    );
                  })}

                  {filteredLogs.length === 0 && (
                    <div className="text-center py-6 text-gray-400 text-xs">
                      No hay movimientos registrados en este período.
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-gray-100 text-right">
                  <button
                    onClick={() => setActiveTab('movements')}
                    type="button"
                    className="text-xs font-bold text-gray-800 hover:text-black inline-flex items-center gap-1 cursor-pointer"
                  >
                    Ver historial completo →
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Table: Actividad por sede (100% de la Base de Datos) */}
          <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <StoreIcon className="w-4 h-4 text-gray-700" />
                <h3 className="text-xs font-extrabold text-gray-900 uppercase tracking-wider">Actividad por sede</h3>
              </div>
              <button
                onClick={() => setActiveTab('store_activity')}
                type="button"
                className="text-xs font-bold text-gray-700 hover:text-black inline-flex items-center gap-1 cursor-pointer"
              >
                Ver detalle por sede →
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-100 text-[10px] text-gray-400 uppercase tracking-wider font-bold">
                    <th className="py-2.5 px-3">Sede</th>
                    <th className="py-2.5 px-3">Última actualización</th>
                    <th className="py-2.5 px-3 text-center">Publicados</th>
                    <th className="py-2.5 px-3 text-center">Editados</th>
                    <th className="py-2.5 px-3 text-center">Eliminados</th>
                    <th className="py-2.5 px-3 text-center">Total</th>
                    <th className="py-2.5 px-3 text-center">Días sin actualizar</th>
                    <th className="py-2.5 px-3 text-center">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {storeStatsList.map((stat, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2 font-bold text-gray-900">
                          <StoreIcon className="w-3.5 h-3.5 text-gray-400" />
                          <span>{stat.storeName}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-gray-600 font-medium">
                        {stat.lastUpdateFormatted}
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-gray-800">{stat.published}</td>
                      <td className="py-3 px-3 text-center font-bold text-gray-800">{stat.edited}</td>
                      <td className="py-3 px-3 text-center font-bold text-gray-800">{stat.deleted}</td>
                      <td className="py-3 px-3 text-center font-extrabold text-gray-900">{stat.total}</td>
                      <td className="py-3 px-3 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          stat.daysWithoutChanges === 0
                            ? 'bg-emerald-50 text-emerald-800'
                            : stat.daysWithoutChanges <= 2
                            ? 'bg-amber-50 text-amber-800'
                            : 'bg-red-50 text-red-800'
                        }`}>
                          {stat.daysWithoutChanges} {stat.daysWithoutChanges === 1 ? 'día' : 'días'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          stat.status === 'Activa'
                            ? 'bg-emerald-100 text-emerald-800'
                            : stat.status === 'En seguimiento'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {stat.status === 'Activa' && '✓ Activa'}
                          {stat.status === 'En seguimiento' && 'En seguimiento'}
                          {stat.status === 'Inactiva' && '⊘ Inactiva'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 2: MOVIMIENTOS (Image 1)
          ======================================================== */}
      {activeTab === 'movements' && (
        <div className="space-y-6">
          {/* Top Filters Bar */}
          <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-2xs space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Supervisar Usuario / Sede</label>
                  <div className="relative">
                    <select
                      value={selectedSupervisorId}
                      onChange={e => setSelectedSupervisorId(e.target.value)}
                      className="pl-8 pr-8 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 cursor-pointer focus:outline-none"
                    >
                      <option value="all">Todos los usuarios y sedes</option>
                      {supervisorOptions.map(opt => (
                        <option key={opt.id} value={opt.id}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    <StoreIcon className="w-3.5 h-3.5 text-gray-500 absolute left-2.5 top-2.5 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Rango de fecha</label>
                  <div className="relative">
                    <select
                      value={dateRangeMode}
                      onChange={e => {
                        const val = e.target.value as any;
                        setDateRangeMode(val);
                        if (val === 'specific_date' && !selectedSpecificDate) {
                          setSelectedSpecificDate(new Date().toISOString().slice(0, 10));
                        }
                      }}
                      className="pl-8 pr-8 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 cursor-pointer focus:outline-none"
                    >
                      <option value="7days">Últimos 7 días</option>
                      <option value="today">Hoy, {new Date().toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })}</option>
                      <option value="yesterday">Ayer</option>
                      <option value="30days">Últimos 30 días</option>
                      <option value="specific_date">📅 Seleccionar fecha del mes...</option>
                      <option value="custom">📆 Rango personalizado</option>
                      <option value="all">Histórico completo (Todo)</option>
                    </select>
                    <Calendar className="w-3.5 h-3.5 text-gray-500 absolute left-2.5 top-2.5 pointer-events-none" />
                  </div>
                </div>

                {/* Input for Specific Date of the Month */}
                {dateRangeMode === 'specific_date' && (
                  <div className="animate-in fade-in duration-200">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Fecha del mes a buscar</label>
                    <div className="flex items-center gap-1.5">
                      <div className="relative">
                        <input
                          type="date"
                          value={selectedSpecificDate}
                          onChange={e => setSelectedSpecificDate(e.target.value)}
                          className="pl-8 pr-3 py-1.5 bg-gray-50 border border-emerald-300 ring-2 ring-emerald-500/20 rounded-xl text-xs font-bold text-gray-900 cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                        <Calendar className="w-3.5 h-3.5 text-emerald-600 absolute left-2.5 top-2.5 pointer-events-none" />
                      </div>
                      <button
                        type="button"
                        onClick={() => {}}
                        className="px-3 py-1.5 bg-black hover:bg-gray-800 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                      >
                        <Search className="w-3 h-3" />
                        Buscar
                      </button>
                    </div>
                  </div>
                )}

                {/* Inputs for Custom Date Range */}
                {dateRangeMode === 'custom' && (
                  <div className="animate-in fade-in duration-200 flex items-center gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Desde</label>
                      <input
                        type="date"
                        value={customStartDate}
                        onChange={e => setCustomStartDate(e.target.value)}
                        className="px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 cursor-pointer focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Hasta</label>
                      <input
                        type="date"
                        value={customEndDate}
                        onChange={e => setCustomEndDate(e.target.value)}
                        className="px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 cursor-pointer focus:outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Filter Pills */}
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { id: 'today', label: 'Hoy' },
                  { id: 'yesterday', label: 'Ayer' },
                  { id: '7days', label: 'Últimos 7 días' },
                  { id: '30days', label: 'Últimos 30 días' },
                  { id: 'specific_date', label: '📅 Seleccionar fecha' },
                  { id: 'all', label: 'Todo' }
                ].map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setDateRangeMode(p.id as any);
                      if (p.id === 'specific_date' && !selectedSpecificDate) {
                        setSelectedSpecificDate(new Date().toISOString().slice(0, 10));
                      }
                    }}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                      dateRangeMode === p.id
                        ? 'bg-black text-white shadow-xs'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => {
                    setSelectedSupervisorId('all');
                    setDateRangeMode('7days');
                    setSelectedSpecificDate('');
                    setCustomStartDate('');
                    setCustomEndDate('');
                    setSearchTerm('');
                    setSelectedMovementAction('ALL');
                  }}
                  className="px-3 py-1 bg-white hover:bg-gray-100 text-gray-600 border border-gray-200 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors ml-2"
                >
                  <RotateCcw className="w-3 h-3" />
                  Limpiar filtros
                </button>
              </div>
            </div>

            {/* If specific date is active, show banner with the searched day */}
            {dateRangeMode === 'specific_date' && selectedSpecificDate && (
              <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200/80 rounded-xl px-3 py-2 text-xs text-emerald-900 font-medium">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    Consultando movimientos del día: <strong className="font-extrabold text-emerald-950">
                      {new Date(selectedSpecificDate + 'T00:00:00').toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </strong>
                  </span>
                  <span className="bg-emerald-200/70 text-emerald-900 text-[10px] font-black px-2 py-0.5 rounded-full">
                    {baseCatalogLogs.length} movimientos de catálogo encontrados
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setDateRangeMode('7days');
                    setSelectedSpecificDate('');
                  }}
                  className="text-emerald-700 hover:text-emerald-900 text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                  Quitar filtro de día
                </button>
              </div>
            )}
          </div>

          {/* Sede Info Header Cards Row */}
          {currentSelectedStoreStats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {/* Card 1: Sede Status */}
              <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-2xs flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                    <StoreIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-gray-900">
                      {selectedSupervisorId === 'all' 
                        ? 'Todos los usuarios y sedes' 
                        : (selectedSupervisorId === '1' 
                            ? 'Administrador (Global)' 
                            : `Usuario: ${currentSupervisorOption?.userName} (${currentSupervisorOption?.storeName})`
                          )
                      }
                    </h3>
                    <p className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      {selectedSupervisorId === 'all'
                        ? `${activeStoresTodayCount} de ${stores.length} sedes activas hoy`
                        : `Supervisando movimientos exclusivos de ${currentSupervisorOption?.userName || 'usuario'}`
                      }
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-gray-400 block font-bold uppercase">Estado del catálogo</span>
                  <span className={`inline-block mt-0.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    currentSelectedStoreStats.status === 'Activa'
                      ? 'bg-emerald-100 text-emerald-800'
                      : currentSelectedStoreStats.status === 'En seguimiento'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {currentSelectedStoreStats.status === 'Activa' ? '✓ Actualizado' : currentSelectedStoreStats.status}
                  </span>
                </div>
              </div>

              {/* Card 2: Tiempo sin cambios */}
              <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-2xs flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-600 shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Tiempo sin cambios</span>
                  <strong className="text-lg font-black text-gray-900 block mt-0.5">
                    {currentSelectedStoreStats.daysWithoutChanges} {currentSelectedStoreStats.daysWithoutChanges === 1 ? 'día' : 'días'}
                  </strong>
                  <span className="text-[10px] text-gray-500">
                    {currentSelectedStoreStats.daysWithoutChanges === 0 ? 'Se realizaron movimientos hoy.' : 'Sin movimientos recientes.'}
                  </span>
                </div>
              </div>

              {/* Card 3: Movimientos de hoy */}
              <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-2xs flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-700 shrink-0">
                    <RefreshCw className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Movimientos de hoy</span>
                    <strong className="text-lg font-black text-gray-900 block mt-0.5">
                      {currentSelectedStoreStats.todayCount} movimientos
                    </strong>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                    {currentSelectedStoreStats.pctVsYesterday >= 0 ? `↑ +${currentSelectedStoreStats.pctVsYesterday}%` : `↓ ${currentSelectedStoreStats.pctVsYesterday}%`}
                  </span>
                  <span className="text-[10px] text-gray-400 block mt-0.5">vs. ayer ({currentSelectedStoreStats.yesterdayCount})</span>
                </div>
              </div>
            </div>
          )}

          {/* Sede Metric Breakdown Row + Real Donut + Seguimiento */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
            {/* 3 metric cards (5 cols) */}
            <div className="md:col-span-5 grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setSelectedMovementAction(selectedMovementAction === 'CREATE' ? 'ALL' : 'CREATE')}
                className={`border rounded-2xl p-3 flex flex-col justify-between text-left transition-all cursor-pointer ${
                  selectedMovementAction === 'CREATE'
                    ? 'bg-emerald-100/90 border-emerald-400 ring-2 ring-emerald-500/30 shadow-xs'
                    : 'bg-emerald-50/60 border-emerald-100 hover:border-emerald-200'
                }`}
              >
                <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm mb-1">+</div>
                <span className="text-[10px] font-bold text-gray-600">Publicados</span>
                <span className="text-xl font-black text-gray-900">{publishedCount}</span>
                <span className="text-[9px] font-bold text-emerald-700">↑ {trends.published}</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedMovementAction(selectedMovementAction === 'UPDATE' ? 'ALL' : 'UPDATE')}
                className={`border rounded-2xl p-3 flex flex-col justify-between text-left transition-all cursor-pointer ${
                  selectedMovementAction === 'UPDATE'
                    ? 'bg-blue-100/90 border-blue-400 ring-2 ring-blue-500/30 shadow-xs'
                    : 'bg-blue-50/60 border-blue-100 hover:border-blue-200'
                }`}
              >
                <div className="w-6 h-6 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center mb-1">
                  <Edit2 className="w-3 h-3" />
                </div>
                <span className="text-[10px] font-bold text-gray-600">Modificados</span>
                <span className="text-xl font-black text-gray-900">{editedCount}</span>
                <span className="text-[9px] font-bold text-blue-700">↑ {trends.edited}</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedMovementAction(selectedMovementAction === 'DELETE' ? 'ALL' : 'DELETE')}
                className={`border rounded-2xl p-3 flex flex-col justify-between text-left transition-all cursor-pointer ${
                  selectedMovementAction === 'DELETE'
                    ? 'bg-red-100/90 border-red-400 ring-2 ring-red-500/30 shadow-xs'
                    : 'bg-red-50/60 border-red-100 hover:border-red-200'
                }`}
              >
                <div className="w-6 h-6 rounded-lg bg-red-100 text-red-800 flex items-center justify-center mb-1">
                  <Trash2 className="w-3 h-3" />
                </div>
                <span className="text-[10px] font-bold text-gray-600">Eliminados</span>
                <span className="text-xl font-black text-gray-900">{deletedCount}</span>
                <span className="text-[9px] font-bold text-red-700">↓ {trends.deleted}</span>
              </button>
            </div>

            {/* Real Donut Chart (4 cols) */}
            <div className="md:col-span-4 bg-white border border-gray-200/80 rounded-2xl p-3.5 shadow-2xs flex items-center justify-around">
              <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="14" fill="transparent" stroke="#f3f4f6" strokeWidth="4"></circle>
                  {totalMovementsCount > 0 && (
                    <>
                      <circle cx="18" cy="18" r="14" fill="transparent" stroke="#10b981" strokeWidth="4" strokeDasharray={`${pubDash} ${circumference}`} strokeDashoffset="0"></circle>
                      <circle cx="18" cy="18" r="14" fill="transparent" stroke="#3b82f6" strokeWidth="4" strokeDasharray={`${edtDash} ${circumference}`} strokeDashoffset={String(-pubDash)}></circle>
                      <circle cx="18" cy="18" r="14" fill="transparent" stroke="#ef4444" strokeWidth="4" strokeDasharray={`${delDash} ${circumference}`} strokeDashoffset={String(-(pubDash + edtDash))}></circle>
                    </>
                  )}
                </svg>
                <div className="absolute text-center">
                  <span className="text-xs font-black text-gray-900">{totalMovementsCount}</span>
                </div>
              </div>

              <div className="space-y-1 text-[11px]">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span className="text-gray-600">Publicados</span>
                  <strong className="text-gray-900">
                    {totalMovementsCount > 0 ? Math.round((publishedCount / totalMovementsCount) * 100) : 0}% ({publishedCount})
                  </strong>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2 rounded-full bg-blue-500"></span>
                  <span className="text-gray-600">Editados</span>
                  <strong className="text-gray-900">
                    {totalMovementsCount > 0 ? Math.round((editedCount / totalMovementsCount) * 100) : 0}% ({editedCount})
                  </strong>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-500"></span>
                  <span className="text-gray-600">Eliminados</span>
                  <strong className="text-gray-900">
                    {totalMovementsCount > 0 ? Math.round((deletedCount / totalMovementsCount) * 100) : 0}% ({deletedCount})
                  </strong>
                </div>
              </div>
            </div>

            {/* Seguimiento de actualización (3 cols) */}
            <div className="md:col-span-3 bg-white border border-gray-200/80 rounded-2xl p-4 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-gray-900">
                <Calendar className="w-4 h-4 text-emerald-600" />
                <span>Seguimiento de actualización</span>
              </div>
              <p className="text-[11px] text-gray-600 leading-relaxed mt-1">
                La sede {currentSelectedStoreStats ? currentSelectedStoreStats.storeName : 'seleccionada'} registra un total de {currentSelectedStoreStats ? currentSelectedStoreStats.total : 0} movimientos en este período.
              </p>
            </div>
          </div>

          {/* Table: Detalle de movimientos */}
          <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-2xs space-y-4">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-wider mr-2">
                  Detalle de movimientos
                </h3>
                {/* Movement Filter Pills: Publicar, Modificar, Eliminar */}
                <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setSelectedMovementAction('ALL')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      selectedMovementAction === 'ALL'
                        ? 'bg-white text-gray-900 shadow-xs'
                        : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    Todos ({baseCatalogLogs.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedMovementAction('CREATE')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                      selectedMovementAction === 'CREATE'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-emerald-700 hover:bg-emerald-50'
                    }`}
                  >
                    + Publicados ({publishedCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedMovementAction('UPDATE')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                      selectedMovementAction === 'UPDATE'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-blue-700 hover:bg-blue-50'
                    }`}
                  >
                    ✏️ Modificados ({editedCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedMovementAction('DELETE')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                      selectedMovementAction === 'DELETE'
                        ? 'bg-red-600 text-white shadow-xs'
                        : 'text-red-700 hover:bg-red-50'
                    }`}
                  >
                    🗑️ Eliminados ({deletedCount})
                  </button>
                </div>
              </div>

              <div className="relative w-full lg:w-80">
                <input
                  type="text"
                  placeholder="Buscar por producto, usuario o referencia..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-black"
                />
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5 pointer-events-none" />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-100 text-[10px] text-gray-400 uppercase tracking-wider font-bold">
                    <th className="py-2.5 px-3">Fecha y Hora ⇅</th>
                    <th className="py-2.5 px-3">Usuario</th>
                    <th className="py-2.5 px-3">Movimiento</th>
                    <th className="py-2.5 px-3">Producto</th>
                    <th className="py-2.5 px-3">Referencia</th>
                    <th className="py-2.5 px-3">Detalle</th>
                    <th className="py-2.5 px-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredLogs.map((log) => {
                    const parsed = parseLogProduct(log);
                    const logDate = parseDateSafe(log.createdAt);
                    const isToday = new Date().toDateString() === logDate.toDateString();
                    const isYesterday = new Date(Date.now() - 86400000).toDateString() === logDate.toDateString();
                    const timeStr = logDate.toLocaleTimeString('es-CO', { hour: 'numeric', minute: '2-digit', hour12: true });
                    const dateDisplay = isToday ? `Hoy, ${timeStr}` : isYesterday ? `Ayer, ${timeStr}` : `${logDate.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })}, ${timeStr}`;

                    return (
                      <tr key={log.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="py-3 px-3 text-gray-600 font-medium whitespace-nowrap">
                          {dateDisplay}
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          <div className="flex items-center gap-1.5 font-bold text-gray-800 uppercase text-[11px]">
                            <UserIcon className="w-3.5 h-3.5 text-gray-400" />
                            <span>{log.userName}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            log.actionType === 'CREATE' ? 'bg-emerald-100 text-emerald-800' :
                            log.actionType === 'UPDATE' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {log.actionType === 'CREATE' && '+ Publicado'}
                            {log.actionType === 'UPDATE' && '✏️ Editado'}
                            {log.actionType === 'DELETE' && '🗑️ Eliminado'}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={parsed.image}
                              alt={parsed.name}
                              className="w-9 h-9 rounded-lg object-cover border border-gray-100 shrink-0"
                              onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                            />
                            <span className="font-extrabold text-gray-900 uppercase text-[11px] line-clamp-1">
                              {parsed.name}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-3 font-mono font-bold text-gray-500 whitespace-nowrap">
                          {parsed.ref}
                        </td>
                        <td className="py-3 px-3 text-gray-600 text-[11px] max-w-xs truncate font-medium">
                          {parsed.detail}
                        </td>
                        <td className="py-3 px-3 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => handleOpenLogModal(log)}
                              className="p-1.5 text-gray-400 hover:text-black rounded-lg hover:bg-gray-100 cursor-pointer"
                              title="Ver detalle del movimiento"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenLogModal(log)}
                              className="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 cursor-pointer"
                              title="Ver cambios"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenLogModal(log)}
                              className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 cursor-pointer"
                              title="Auditoría"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {filteredLogs.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-gray-400">
                        <div className="flex flex-col items-center justify-center space-y-2">
                          <Layers className="w-8 h-8 text-gray-300" />
                          <p className="text-xs font-bold text-gray-600">No se encontraron movimientos</p>
                          <p className="text-[11px] text-gray-400">
                            {selectedMovementAction !== 'ALL'
                              ? `No hay movimientos de tipo "${selectedMovementAction === 'CREATE' ? 'Publicados' : selectedMovementAction === 'UPDATE' ? 'Modificados' : 'Eliminados'}" con los filtros seleccionados.`
                              : 'No hay movimientos de publicación, modificación o eliminación registrados para este período o usuario.'}
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 3: ACTIVIDAD POR SEDE (Image 3)
          ======================================================== */}
      {activeTab === 'store_activity' && (
        <div className="space-y-6">
          {/* Top Filters Bar */}
          <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-2xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Supervisar Usuario / Sede</label>
                <div className="relative">
                  <select
                    value={selectedSupervisorId}
                    onChange={e => setSelectedSupervisorId(e.target.value)}
                    className="pl-8 pr-8 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 cursor-pointer focus:outline-none"
                  >
                    <option value="all">Todos los usuarios y sedes</option>
                    {supervisorOptions.map(opt => (
                      <option key={opt.id} value={opt.id}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <StoreIcon className="w-3.5 h-3.5 text-gray-500 absolute left-2.5 top-2.5 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Rango de fecha</label>
                <div className="relative">
                  <select
                    value={dateRangeMode}
                    onChange={e => {
                      const val = e.target.value as any;
                      setDateRangeMode(val);
                      if (val === 'specific_date' && !selectedSpecificDate) {
                        setSelectedSpecificDate(new Date().toISOString().slice(0, 10));
                      }
                    }}
                    className="pl-8 pr-8 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 cursor-pointer focus:outline-none"
                  >
                    <option value="7days">Últimos 7 días</option>
                    <option value="today">Hoy</option>
                    <option value="yesterday">Ayer</option>
                    <option value="30days">Últimos 30 días</option>
                    <option value="specific_date">📅 Seleccionar fecha del mes...</option>
                    <option value="all">Histórico completo</option>
                  </select>
                  <Calendar className="w-3.5 h-3.5 text-gray-500 absolute left-2.5 top-2.5 pointer-events-none" />
                </div>
              </div>

              {/* Specific Date input if selected */}
              {dateRangeMode === 'specific_date' && (
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Fecha del mes</label>
                  <div className="relative">
                    <input
                      type="date"
                      value={selectedSpecificDate}
                      onChange={e => setSelectedSpecificDate(e.target.value)}
                      className="pl-8 pr-3 py-1.5 bg-gray-50 border border-emerald-300 ring-2 ring-emerald-500/20 rounded-xl text-xs font-bold text-gray-900 cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <Calendar className="w-3.5 h-3.5 text-emerald-600 absolute left-2.5 top-2.5 pointer-events-none" />
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={loadData}
              type="button"
              className="px-3.5 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Actualizar
            </button>
          </div>

          {/* Top Split: Left Table Actividad por sede (8 cols) | Right Card: Cumplimiento por sede (4 cols) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left Table (8 cols) */}
            <div className="lg:col-span-8 bg-white rounded-2xl p-5 border border-gray-200/80 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <StoreIcon className="w-4 h-4 text-gray-800" />
                    <h3 className="text-sm font-extrabold text-gray-900">Actividad por sede</h3>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-0.5">Resumen de movimientos del catálogo en el período seleccionado.</p>
                </div>

                <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setStoreActivitySubView('summary')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      storeActivitySubView === 'summary' ? 'bg-black text-white shadow-2xs' : 'text-gray-600 hover:text-black'
                    }`}
                  >
                    Resumen
                  </button>
                  <button
                    type="button"
                    onClick={() => setStoreActivitySubView('detail')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      storeActivitySubView === 'detail' ? 'bg-black text-white shadow-2xs' : 'text-gray-600 hover:text-black'
                    }`}
                  >
                    Detalle por sede
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-gray-100 text-[10px] text-gray-400 uppercase tracking-wider font-bold">
                      <th className="py-2.5 px-3">Sede</th>
                      <th className="py-2.5 px-3">Última actualización</th>
                      <th className="py-2.5 px-3 text-center">Publicados</th>
                      <th className="py-2.5 px-3 text-center">Editados</th>
                      <th className="py-2.5 px-3 text-center">Eliminados</th>
                      <th className="py-2.5 px-3 text-center">Ocultados</th>
                      <th className="py-2.5 px-3 text-center">Total</th>
                      <th className="py-2.5 px-3 text-center">Días sin actualizar</th>
                      <th className="py-2.5 px-3 text-center">Estado</th>
                      <th className="py-2.5 px-3 text-right"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {storeStatsList.map((stat, idx) => (
                      <tr key={idx} className="hover:bg-gray-50/80 transition-colors">
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2 font-bold text-gray-900">
                            <StoreIcon className="w-3.5 h-3.5 text-gray-400" />
                            <span>{stat.storeName}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-gray-600 font-medium">
                          {stat.lastUpdateFormatted}
                        </td>
                        <td className="py-3 px-3 text-center font-bold text-gray-800">{stat.published}</td>
                        <td className="py-3 px-3 text-center font-bold text-gray-800">{stat.edited}</td>
                        <td className="py-3 px-3 text-center font-bold text-gray-800">{stat.deleted}</td>
                        <td className="py-3 px-3 text-center font-bold text-gray-800">{stat.hidden}</td>
                        <td className="py-3 px-3 text-center font-extrabold text-gray-900">{stat.total}</td>
                        <td className="py-3 px-3 text-center">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            stat.daysWithoutChanges === 0
                              ? 'bg-emerald-50 text-emerald-800'
                              : stat.daysWithoutChanges <= 2
                              ? 'bg-amber-50 text-amber-800'
                              : 'bg-red-50 text-red-800'
                          }`}>
                            {stat.daysWithoutChanges} {stat.daysWithoutChanges === 1 ? 'día' : 'días'}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            stat.status === 'Activa'
                              ? 'bg-emerald-100 text-emerald-800'
                              : stat.status === 'En seguimiento'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {stat.status === 'Activa' && '✓ Activa'}
                            {stat.status === 'En seguimiento' && 'En seguimiento'}
                            {stat.status === 'Inactiva' && '⊘ Inactiva'}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedSupervisorId(stat.assignedUserId ? String(stat.assignedUserId) : stat.storeIdStr);
                              setActiveTab('movements');
                            }}
                            className="p-1.5 text-gray-400 hover:text-black rounded-lg hover:bg-gray-100 cursor-pointer"
                            title="Ver movimientos de esta sede"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right Card: Cumplimiento por sede (4 cols) */}
            <div className="lg:col-span-4 bg-white rounded-2xl p-5 border border-gray-200/80 shadow-2xs space-y-4">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-emerald-600" />
                <h3 className="text-xs font-extrabold text-gray-900 uppercase tracking-wider">Cumplimiento por sede</h3>
              </div>

              <div className="space-y-4 pt-1">
                {storeStatsList.map((stat, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-gray-800">{stat.storeName}</span>
                      <strong className="text-gray-900">{stat.compliance}%</strong>
                    </div>
                    <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          stat.compliance >= 80 ? 'bg-emerald-500' : stat.compliance >= 50 ? 'bg-amber-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${stat.compliance}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Split: Evolución de actividad por sede (8 cols) | Sedes sin actividad (4 cols) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Real Multi-line chart per Store (8 cols) */}
            <div className="lg:col-span-8 bg-white rounded-2xl p-5 border border-gray-200/80 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-gray-700" />
                    <h3 className="text-xs font-extrabold text-gray-900 uppercase tracking-wider">Evolución de actividad por sede</h3>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-0.5">Total de movimientos por sede en los últimos 7 días.</p>
                </div>

                <span className="text-xs font-bold text-gray-500 px-2.5 py-1 bg-gray-50 border border-gray-200 rounded-lg">
                  Últimos 7 días
                </span>
              </div>

              {/* Real Multi-line SVG chart */}
              <div className="h-48 w-full relative pt-2">
                {(() => {
                  const { dateLabels, storeLines, maxVal } = storeTimelineData;
                  const w = 500;
                  const h = 120;
                  const padX = 25;
                  const padY = 20;

                  return (
                    <>
                      <svg className="w-full h-full overflow-visible" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
                        {/* Grid lines */}
                        <line x1="0" y1="20" x2={w} y2="20" stroke="#f3f4f6" strokeWidth="1" strokeDasharray="3 3" />
                        <line x1="0" y1="60" x2={w} y2="60" stroke="#f3f4f6" strokeWidth="1" strokeDasharray="3 3" />
                        <line x1="0" y1="100" x2={w} y2="100" stroke="#f3f4f6" strokeWidth="1" strokeDasharray="3 3" />

                        {/* Each Store's Dynamic Line */}
                        {storeLines.map((sLine, sIdx) => {
                          const pts = sLine.counts.map((count, dIdx) => {
                            const x = padX + (dIdx / Math.max(1, dateLabels.length - 1)) * (w - padX * 2);
                            const y = h - padY - (count / maxVal) * (h - padY * 2);
                            return { x, y, count };
                          });

                          let lineD = '';
                          if (pts.length > 0) {
                            lineD = `M ${pts[0].x} ${pts[0].y}`;
                            for (let i = 1; i < pts.length; i++) {
                              const prev = pts[i - 1];
                              const curr = pts[i];
                              const cx = (prev.x + curr.x) / 2;
                              lineD += ` C ${cx} ${prev.y}, ${cx} ${curr.y}, ${curr.x} ${curr.y}`;
                            }
                          }

                          return (
                            <g key={sIdx}>
                              <path d={lineD} fill="none" stroke={sLine.color} strokeWidth="2.5" strokeLinecap="round" />
                              {pts.map((p, pIdx) => (
                                <circle key={pIdx} cx={p.x} cy={p.y} r="3" fill="#ffffff" stroke={sLine.color} strokeWidth="2" />
                              ))}
                            </g>
                          );
                        })}
                      </svg>

                      {/* X-axis labels */}
                      <div className="flex justify-between text-[10px] text-gray-400 font-medium px-2 mt-2">
                        {dateLabels.map((lbl, idx) => (
                          <span key={idx}>{lbl}</span>
                        ))}
                      </div>
                    </>
                  );
                })()}
              </div>

              {/* Legend with matching REAL store names & colors from DB */}
              <div className="pt-2 border-t border-gray-100 flex flex-wrap items-center justify-center gap-4 text-xs">
                {storeTimelineData.storeLines.map((sLine, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 font-bold text-gray-800">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: sLine.color }}></span>
                    <span>{sLine.storeName}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Card: Sedes sin actividad (4 cols) */}
            <div className="lg:col-span-4 bg-white rounded-2xl p-5 border border-gray-200/80 shadow-2xs space-y-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-700" />
                <div>
                  <h3 className="text-xs font-extrabold text-gray-900 uppercase tracking-wider">Sedes sin actividad</h3>
                  <p className="text-[10px] text-gray-400">Sedes que no han realizado movimientos en el catálogo.</p>
                </div>
              </div>

              <div className="space-y-2.5 pt-2">
                {storesWithoutUpdates.map((stat, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setSelectedSupervisorId(stat.assignedUserId ? String(stat.assignedUserId) : stat.storeIdStr);
                      setActiveTab('movements');
                    }}
                    className="p-3 bg-red-50/50 border border-red-100 rounded-xl flex items-center justify-between cursor-pointer hover:bg-red-50 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <StoreIcon className="w-4 h-4 text-red-700" />
                      <strong className="text-xs text-gray-900">{stat.storeName}</strong>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800">
                        {stat.daysWithoutChanges} días sin actualizar
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-red-500" />
                    </div>
                  </div>
                ))}

                {storesWithoutUpdates.length === 0 && (
                  <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-center">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto mb-1" />
                    <span className="text-xs font-bold text-emerald-900">¡Todas las sedes están al día!</span>
                    <p className="text-[10px] text-emerald-700 mt-0.5">No hay sedes con más de {alertSettings.inactiveDaysThreshold} días sin movimientos.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 4: SEGUIMIENTO DIARIO (Image 4)
          ======================================================== */}
      {activeTab === 'daily_tracking' && (
        <div className="space-y-6">
          {/* Top Filters Bar */}
          <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-2xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Supervisar Usuario / Sede</label>
                <div className="relative">
                  <select
                    value={selectedSupervisorId}
                    onChange={e => setSelectedSupervisorId(e.target.value)}
                    className="pl-8 pr-8 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 cursor-pointer focus:outline-none"
                  >
                    <option value="all">Todos los usuarios y sedes</option>
                    {supervisorOptions.map(opt => (
                      <option key={opt.id} value={opt.id}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <StoreIcon className="w-3.5 h-3.5 text-gray-500 absolute left-2.5 top-2.5 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Rango de fecha</label>
                <div className="relative">
                  <select
                    value={dateRangeMode}
                    onChange={e => {
                      const val = e.target.value as any;
                      setDateRangeMode(val);
                      if (val === 'specific_date' && !selectedSpecificDate) {
                        setSelectedSpecificDate(new Date().toISOString().slice(0, 10));
                      }
                    }}
                    className="pl-8 pr-8 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 cursor-pointer focus:outline-none"
                  >
                    <option value="7days">Últimos 7 días</option>
                    <option value="today">Hoy</option>
                    <option value="yesterday">Ayer</option>
                    <option value="30days">Últimos 30 días</option>
                    <option value="specific_date">📅 Seleccionar fecha del mes...</option>
                    <option value="all">Histórico completo</option>
                  </select>
                  <Calendar className="w-3.5 h-3.5 text-gray-500 absolute left-2.5 top-2.5 pointer-events-none" />
                </div>
              </div>

              {/* Specific Date input if selected */}
              {dateRangeMode === 'specific_date' && (
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Fecha del mes</label>
                  <div className="relative">
                    <input
                      type="date"
                      value={selectedSpecificDate}
                      onChange={e => setSelectedSpecificDate(e.target.value)}
                      className="pl-8 pr-3 py-1.5 bg-gray-50 border border-emerald-300 ring-2 ring-emerald-500/20 rounded-xl text-xs font-bold text-gray-900 cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <Calendar className="w-3.5 h-3.5 text-emerald-600 absolute left-2.5 top-2.5 pointer-events-none" />
                  </div>
                </div>
              )}
            </div>

            {/* Quick Pills */}
            <div className="flex items-center gap-1.5">
              {[
                { id: 'today', label: 'Hoy' },
                { id: 'yesterday', label: 'Ayer' },
                { id: '7days', label: 'Últimos 7 días' },
                { id: '30days', label: 'Últimos 30 días' }
              ].map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setDateRangeMode(p.id as any)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold cursor-pointer ${
                    dateRangeMode === p.id ? 'bg-black text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {p.label}
                </button>
              ))}

              <button
                onClick={loadData}
                type="button"
                className="px-3.5 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer ml-2"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Actualizar
              </button>
            </div>
          </div>

          {/* 4 Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="bg-emerald-50/60 border border-emerald-100 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-gray-600 block">Sedes con actividad hoy</span>
                <strong className="text-2xl font-black text-gray-900 block mt-0.5">{activeStoresTodayCount} de {stores.length}</strong>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                <Layers className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-red-50/60 border border-red-100 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-gray-600 block">Sedes sin actividad hoy</span>
                <strong className="text-2xl font-black text-red-600 block mt-0.5">{inactiveStoresCount}</strong>
              </div>
              <div className="w-10 h-10 rounded-xl bg-red-100 text-red-800 flex items-center justify-center">
                <Calendar className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-blue-50/60 border border-blue-100 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-gray-600 block">Total de movimientos hoy</span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <strong className="text-2xl font-black text-gray-900">{storeStatsList.reduce((acc, s) => acc + s.todayCount, 0)}</strong>
                  <span className="text-[10px] font-bold text-emerald-700">↑ {trends.total}</span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center">
                <Zap className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white border border-gray-200/80 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-gray-600 block">Cumplimiento diario</span>
                <strong className="text-2xl font-black text-gray-900 block mt-0.5">{globalCompliancePct}%</strong>
                <div className="w-24 bg-gray-100 h-1.5 rounded-full overflow-hidden mt-1">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${globalCompliancePct}%` }}></div>
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                <Target className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Middle Split: Calendario de seguimiento Matrix (8 cols) | Right Side Cards (4 cols) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Calendario de seguimiento (8 cols) */}
            <div className="lg:col-span-8 bg-white rounded-2xl p-5 border border-gray-200/80 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-800" />
                    <h3 className="text-xs font-extrabold text-gray-900 uppercase tracking-wider">Calendario de seguimiento</h3>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-0.5">Actividad de las sedes por día.</p>
                </div>

                {/* Month Navigator */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const prev = new Date(calendarMonth);
                      prev.setMonth(prev.getMonth() - 1);
                      setCalendarMonth(prev);
                    }}
                    className="p-1 rounded-lg hover:bg-gray-100 text-gray-600 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-extrabold text-gray-900 px-2 py-0.5 bg-gray-50 border border-gray-200 rounded-lg capitalize">
                    {calendarMonth.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' })}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const next = new Date(calendarMonth);
                      next.setMonth(next.getMonth() + 1);
                      setCalendarMonth(next);
                    }}
                    className="p-1 rounded-lg hover:bg-gray-100 text-gray-600 cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Real Matrix Table */}
              <div className="overflow-x-auto pb-2">
                <table className="w-full text-center text-xs">
                  <thead>
                    <tr className="border-b border-gray-100 text-[10px] text-gray-400 uppercase font-bold">
                      <th className="py-2 px-3 text-left">Sede</th>
                      {calendarDays.map((day, idx) => (
                        <th
                          key={idx}
                          onClick={() => setSelectedCalendarDayStr(day.dateStr)}
                          className={`py-2 px-1.5 cursor-pointer rounded-t-lg transition-colors min-w-[28px] ${
                            selectedCalendarDayStr === day.dateStr ? 'bg-emerald-50 text-emerald-900 font-black' : ''
                          }`}
                        >
                          <div className="text-[9px] text-gray-400">{day.dayName}</div>
                          <div>{day.dayNum}</div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {storeStatsList.map((stat, sIdx) => {
                      const activeDates = storeDailyActivityMap.get(stat.storeIdStr) || new Set();

                      return (
                        <tr key={sIdx} className="hover:bg-gray-50/60 transition-colors">
                          <td className="py-2.5 px-3 text-left font-bold text-gray-900 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <StoreIcon className="w-3.5 h-3.5 text-gray-400" />
                              <span>{stat.storeName}</span>
                            </div>
                          </td>

                          {calendarDays.map((day, dIdx) => {
                            const hasActivity = activeDates.has(day.dateStr) || (day.isToday && stat.todayCount > 0);
                            const isColSelected = selectedCalendarDayStr === day.dateStr;

                            return (
                              <td
                                key={dIdx}
                                onClick={() => setSelectedCalendarDayStr(day.dateStr)}
                                className={`py-2.5 px-1.5 cursor-pointer transition-colors min-w-[28px] ${
                                  isColSelected ? 'bg-emerald-50/60' : ''
                                }`}
                              >
                                {hasActivity ? (
                                  <div className="w-5 h-5 mx-auto rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-[10px] shadow-2xs">
                                    ✓
                                  </div>
                                ) : (
                                  <div className="w-5 h-5 mx-auto rounded-full bg-gray-100 text-gray-400 flex items-center justify-center text-xs font-bold">
                                    -
                                  </div>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Legend */}
              <div className="pt-2 border-t border-gray-100 flex items-center gap-6 text-[11px] text-gray-600 font-medium">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold">✓</div>
                  <span>Con actividad (realizó movimientos)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center text-xs font-bold">-</div>
                  <span>Sin actividad (sin movimientos)</span>
                </div>
              </div>
            </div>

            {/* Right Side Cards (4 cols) */}
            <div className="lg:col-span-4 space-y-4">
              {/* Card 1: Resumen del día (Calculado de la Base de Datos para el día seleccionado) */}
              <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-2xs space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-900">
                  <Calendar className="w-4 h-4 text-emerald-600" />
                  <div>
                    <span className="block uppercase tracking-wider">Resumen del día</span>
                    <span className="text-[10px] text-gray-400 font-normal">{selectedCalendarDayStr}</span>
                  </div>
                </div>

                <div className="space-y-2 text-xs pt-1">
                  <div className="flex justify-between items-center text-gray-700">
                    <span className="flex items-center gap-1.5"><span className="text-emerald-600 font-bold">+</span> Publicados</span>
                    <strong className="text-gray-900">{selectedDayMetrics.pub}</strong>
                  </div>
                  <div className="flex justify-between items-center text-gray-700">
                    <span className="flex items-center gap-1.5"><Edit2 className="w-3 h-3 text-blue-600" /> Editados</span>
                    <strong className="text-gray-900">{selectedDayMetrics.edt}</strong>
                  </div>
                  <div className="flex justify-between items-center text-gray-700">
                    <span className="flex items-center gap-1.5"><Trash2 className="w-3 h-3 text-red-600" /> Eliminados</span>
                    <strong className="text-gray-900">{selectedDayMetrics.del}</strong>
                  </div>
                  <div className="flex justify-between items-center text-gray-700">
                    <span className="flex items-center gap-1.5"><EyeOff className="w-3 h-3 text-amber-600" /> Ocultados</span>
                    <strong className="text-gray-900">{selectedDayMetrics.hid}</strong>
                  </div>

                  <div className="pt-2 border-t border-gray-100 flex justify-between items-center font-bold text-gray-900">
                    <span>Total de movimientos</span>
                    <span className="text-base font-black text-gray-900">{selectedDayMetrics.total}</span>
                  </div>
                </div>
              </div>

              {/* Card 2: Sedes sin actualización */}
              <div className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-2xs space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-900">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <div>
                    <span className="block uppercase tracking-wider">Sedes sin actualización</span>
                    <span className="text-[10px] text-gray-400 font-normal">Sedes que no han realizado movimientos.</span>
                  </div>
                </div>

                <div className="pt-1 space-y-1.5">
                  {storesWithoutUpdates.map((stat, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        setSelectedSupervisorId(stat.assignedUserId ? String(stat.assignedUserId) : stat.storeIdStr);
                        setActiveTab('movements');
                      }}
                      className="p-2.5 bg-red-50 rounded-xl flex items-center justify-between cursor-pointer"
                    >
                      <div className="flex items-center gap-2 text-xs font-bold text-gray-900">
                        <StoreIcon className="w-3.5 h-3.5 text-red-600" />
                        <span>{stat.storeName}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] font-bold text-red-800">
                        <span className="px-2 py-0.5 rounded-full bg-red-100">{stat.daysWithoutChanges} días sin actividad</span>
                        <ChevronRight className="w-3 h-3" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card 3: Próximas alertas */}
              <div className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-2xs space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-900">
                  <Bell className="w-4 h-4 text-amber-600" />
                  <span className="uppercase tracking-wider">Próximas alertas</span>
                </div>

                {storesWithoutUpdates.length > 0 ? (
                  <div 
                    onClick={() => setActiveTab('alerts')}
                    className="p-2.5 bg-amber-50 rounded-xl flex items-center justify-between cursor-pointer hover:bg-amber-100/60 transition-colors"
                  >
                    <div>
                      <strong className="text-xs text-amber-900 block">Meta diaria no cumplida</strong>
                      <span className="text-[10px] text-amber-700">{storesWithoutUpdates[0].storeName} - {storesWithoutUpdates[0].daysWithoutChanges} días sin actualizar</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-amber-700" />
                  </div>
                ) : (
                  <p className="text-[11px] text-gray-400 italic">No hay alertas pendientes.</p>
                )}
              </div>
            </div>
          </div>

          {/* Bottom Table: Detalle de actividad del día */}
          <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-2xs space-y-3">
            <div>
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-gray-700" />
                <h3 className="text-xs font-extrabold text-gray-900 uppercase tracking-wider">Detalle de actividad del día</h3>
              </div>
              <p className="text-[11px] text-gray-400 mt-0.5">Movimientos registrados en la base de datos para {selectedCalendarDayStr}.</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-100 text-[10px] text-gray-400 uppercase tracking-wider font-bold">
                    <th className="py-2.5 px-3">Hora</th>
                    <th className="py-2.5 px-3">Sede</th>
                    <th className="py-2.5 px-3">Usuario</th>
                    <th className="py-2.5 px-3">Movimiento</th>
                    <th className="py-2.5 px-3">Producto</th>
                    <th className="py-2.5 px-3">Detalle</th>
                    <th className="py-2.5 px-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {selectedDayLogs.map((log) => {
                    const parsed = parseLogProduct(log);
                    const logDate = parseDateSafe(log.createdAt);
                    const timeStr = logDate.toLocaleTimeString('es-CO', { hour: 'numeric', minute: '2-digit', hour12: true });

                    return (
                      <tr key={log.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="py-3 px-3 text-gray-600 font-medium whitespace-nowrap">{timeStr}</td>
                        <td className="py-3 px-3 whitespace-nowrap font-bold text-gray-800">
                          <div className="flex items-center gap-1.5">
                            <StoreIcon className="w-3.5 h-3.5 text-gray-400" />
                            <span>{parsed.storeName}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          <div className="flex items-center gap-1 font-bold text-gray-800 uppercase text-[11px]">
                            <UserIcon className="w-3.5 h-3.5 text-gray-400" />
                            <span>{log.userName}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            log.actionType === 'CREATE' ? 'bg-emerald-100 text-emerald-800' :
                            log.actionType === 'UPDATE' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {log.actionType === 'CREATE' && '+ Publicado'}
                            {log.actionType === 'UPDATE' && '✏️ Editado'}
                            {log.actionType === 'DELETE' && '🗑️ Eliminado'}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <img
                              src={parsed.image}
                              alt={parsed.name}
                              className="w-7 h-7 rounded-lg object-cover border border-gray-100 shrink-0"
                            />
                            <span className="font-bold text-gray-900 text-[11px] truncate max-w-[180px]">{parsed.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-gray-600 text-[11px]">{parsed.detail}</td>
                        <td className="py-3 px-3 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => handleOpenLogModal(log)}
                              className="p-1.5 text-gray-400 hover:text-black rounded-lg hover:bg-gray-100 cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenLogModal(log)}
                              className="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenLogModal(log)}
                              className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {selectedDayLogs.length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-gray-400">
                        No se registraron movimientos en la base de datos para este día.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 5: ALERTAS (Image 5)
          ======================================================== */}
      {activeTab === 'alerts' && (
        <div className="space-y-6">
          {/* Top Filters Bar */}
          <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-2xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Supervisar Usuario / Sede</label>
                <div className="relative">
                  <select
                    value={selectedSupervisorId}
                    onChange={e => setSelectedSupervisorId(e.target.value)}
                    className="pl-8 pr-8 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 cursor-pointer focus:outline-none"
                  >
                    <option value="all">Todos los usuarios y sedes</option>
                    {supervisorOptions.map(opt => (
                      <option key={opt.id} value={opt.id}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <StoreIcon className="w-3.5 h-3.5 text-gray-500 absolute left-2.5 top-2.5 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Tipo de alerta</label>
                <div className="relative">
                  <select
                    value={alertTypeFilter}
                    onChange={e => setAlertTypeFilter(e.target.value)}
                    className="pl-8 pr-8 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 cursor-pointer focus:outline-none"
                  >
                    <option value="all">Todas</option>
                    <option value="SIN_ACTUALIZACION">Sin actualización</option>
                    <option value="BAJA_ACTIVIDAD">Baja actividad</option>
                    <option value="ELIMINACION_MASIVA">Eliminación masiva</option>
                    <option value="EDICION_MASIVA">Edición masiva</option>
                    <option value="SIN_CUMPLIMIENTO">Sin cumplimiento</option>
                  </select>
                  <Bell className="w-3.5 h-3.5 text-gray-500 absolute left-2.5 top-2.5 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Rango de fecha</label>
                <div className="relative">
                  <select
                    value={dateRangeMode}
                    onChange={e => {
                      const val = e.target.value as any;
                      setDateRangeMode(val);
                      if (val === 'specific_date' && !selectedSpecificDate) {
                        setSelectedSpecificDate(new Date().toISOString().slice(0, 10));
                      }
                    }}
                    className="pl-8 pr-8 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 cursor-pointer focus:outline-none"
                  >
                    <option value="7days">Últimos 7 días</option>
                    <option value="today">Hoy</option>
                    <option value="yesterday">Ayer</option>
                    <option value="30days">Últimos 30 días</option>
                    <option value="specific_date">📅 Seleccionar fecha del mes...</option>
                    <option value="all">Histórico completo</option>
                  </select>
                  <Calendar className="w-3.5 h-3.5 text-gray-500 absolute left-2.5 top-2.5 pointer-events-none" />
                </div>
              </div>

              {/* Specific Date input if selected */}
              {dateRangeMode === 'specific_date' && (
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Fecha del mes</label>
                  <div className="relative">
                    <input
                      type="date"
                      value={selectedSpecificDate}
                      onChange={e => setSelectedSpecificDate(e.target.value)}
                      className="pl-8 pr-3 py-1.5 bg-gray-50 border border-emerald-300 ring-2 ring-emerald-500/20 rounded-xl text-xs font-bold text-gray-900 cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <Calendar className="w-3.5 h-3.5 text-emerald-600 absolute left-2.5 top-2.5 pointer-events-none" />
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={loadData}
              type="button"
              className="px-3.5 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer ml-auto"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Actualizar
            </button>
          </div>

          {/* 4 Alert KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="bg-red-50/60 border border-red-100 rounded-2xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-gray-700 block">Alertas críticas</span>
                <strong className="text-2xl font-black text-red-600 block leading-tight">{criticalAlertsCount}</strong>
                <span className="text-[10px] text-gray-400">Requiere atención inmediata</span>
              </div>
            </div>

            <div className="bg-amber-50/60 border border-amber-100 rounded-2xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-gray-700 block">Alertas de seguimiento</span>
                <strong className="text-2xl font-black text-amber-700 block leading-tight">{followUpAlertsCount}</strong>
                <span className="text-[10px] text-gray-400">Actividad irregular o baja</span>
              </div>
            </div>

            <div className="bg-blue-50/60 border border-blue-100 rounded-2xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                <Info className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-gray-700 block">Alertas informativas</span>
                <strong className="text-2xl font-black text-blue-700 block leading-tight">{infoAlertsCount}</strong>
                <span className="text-[10px] text-gray-400">Cambios relevantes en el catálogo</span>
              </div>
            </div>

            <div className="bg-emerald-50/60 border border-emerald-100 rounded-2xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-gray-700 block">Sedes sin alertas</span>
                <strong className="text-2xl font-black text-emerald-800 block leading-tight">{normalStoresCount}</strong>
                <span className="text-[10px] text-gray-400">Operación normal</span>
              </div>
            </div>
          </div>

          {/* Middle Split: Listado de alertas (8 cols) | Resumen de alertas & Config (4 cols) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Listado de alertas (8 cols) */}
            <div className="lg:col-span-8 bg-white rounded-2xl p-5 border border-gray-200/80 shadow-2xs space-y-3">
              <div>
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gray-800" />
                  <h3 className="text-xs font-extrabold text-gray-900 uppercase tracking-wider">Listado de alertas</h3>
                </div>
                <p className="text-[11px] text-gray-400 mt-0.5">Eventos que requieren tu revisión y seguimiento.</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-gray-100 text-[10px] text-gray-400 uppercase tracking-wider font-bold">
                      <th className="py-2.5 px-3">Fecha y Hora</th>
                      <th className="py-2.5 px-3">Sede</th>
                      <th className="py-2.5 px-3">Tipo de alerta</th>
                      <th className="py-2.5 px-3">Descripción</th>
                      <th className="py-2.5 px-3 text-center">Estado</th>
                      <th className="py-2.5 px-3 text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredAlerts.map((alert) => {
                      const alertDate = parseDateSafe(alert.createdAt);
                      const isToday = new Date().toDateString() === alertDate.toDateString();
                      const timeStr = alertDate.toLocaleTimeString('es-CO', { hour: 'numeric', minute: '2-digit', hour12: true });
                      const dateDisplay = isToday ? `Hoy, ${timeStr}` : `${alertDate.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })}, ${timeStr}`;

                      return (
                        <tr key={alert.id} className="hover:bg-gray-50/80 transition-colors">
                          <td className="py-3 px-3 text-gray-600 font-medium whitespace-nowrap">{dateDisplay}</td>
                          <td className="py-3 px-3 whitespace-nowrap font-bold text-gray-900">
                            <div className="flex items-center gap-1.5">
                              <StoreIcon className="w-3.5 h-3.5 text-gray-400" />
                              <span>{alert.sedeName}</span>
                            </div>
                          </td>
                          <td className="py-3 px-3 whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              alert.alertType === 'SIN_ACTUALIZACION' ? 'bg-red-100 text-red-800' :
                              alert.alertType === 'BAJA_ACTIVIDAD' || alert.alertType === 'SIN_CUMPLIMIENTO' ? 'bg-amber-100 text-amber-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {alert.alertType === 'SIN_ACTUALIZACION' && '🔔 Sin actualización'}
                              {alert.alertType === 'BAJA_ACTIVIDAD' && '⚠️ Baja actividad'}
                              {alert.alertType === 'ELIMINACION_MASIVA' && 'ℹ️ Eliminación masiva'}
                              {alert.alertType === 'EDICION_MASIVA' && 'ℹ️ Edición masiva'}
                              {alert.alertType === 'SIN_CUMPLIMIENTO' && '⚠️ Sin cumplimiento'}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-gray-700 text-[11px] max-w-xs font-medium">
                            {alert.description}
                          </td>
                          <td className="py-3 px-3 text-center whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => handleToggleAlertStatus(String(alert.id))}
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition-colors ${
                                alert.status === 'REVISADA'
                                  ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                  : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                              }`}
                              title="Haz clic para alternar estado"
                            >
                              {alert.status === 'REVISADA' ? 'Revisada' : 'Pendiente'}
                            </button>
                          </td>
                          <td className="py-3 px-3 text-right whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => setSelectedAlertDetail(alert)}
                              className="px-2.5 py-1 text-gray-600 hover:text-black hover:bg-gray-100 rounded-lg text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              Ver detalle
                            </button>
                          </td>
                        </tr>
                      );
                    })}

                    {filteredAlerts.length === 0 && (
                      <tr>
                        <td colSpan={6} className="text-center py-10 text-gray-400 text-xs">
                          No hay alertas activas en el período seleccionado.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right Side Cards (4 cols) */}
            <div className="lg:col-span-4 space-y-4">
              {/* Card 1: Resumen de alertas (7 días) Real Donut */}
              <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-2xs space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-900">
                  <BarChart3 className="w-4 h-4 text-gray-700" />
                  <span className="uppercase tracking-wider">Resumen de alertas (7 días)</span>
                </div>

                <div className="flex items-center justify-around pt-1">
                  <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
                    {(() => {
                      const totAlerts = dynamicAlerts.length;
                      const cDash = totAlerts > 0 ? (criticalAlertsCount / totAlerts) * circumference : 0;
                      const fDash = totAlerts > 0 ? (followUpAlertsCount / totAlerts) * circumference : 0;
                      const iDash = totAlerts > 0 ? (infoAlertsCount / totAlerts) * circumference : 0;

                      return (
                        <>
                          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                            <circle cx="18" cy="18" r="14" fill="transparent" stroke="#f3f4f6" strokeWidth="4.5"></circle>
                            {totAlerts > 0 && (
                              <>
                                <circle cx="18" cy="18" r="14" fill="transparent" stroke="#ef4444" strokeWidth="4.5" strokeDasharray={`${cDash} ${circumference}`} strokeDashoffset="0"></circle>
                                <circle cx="18" cy="18" r="14" fill="transparent" stroke="#f59e0b" strokeWidth="4.5" strokeDasharray={`${fDash} ${circumference}`} strokeDashoffset={String(-cDash)}></circle>
                                <circle cx="18" cy="18" r="14" fill="transparent" stroke="#3b82f6" strokeWidth="4.5" strokeDasharray={`${iDash} ${circumference}`} strokeDashoffset={String(-(cDash + fDash))}></circle>
                              </>
                            )}
                          </svg>
                          <div className="absolute text-center">
                            <span className="text-base font-black text-gray-900">{totAlerts}</span>
                            <span className="text-[8px] text-gray-400 block uppercase font-bold">Alertas</span>
                          </div>
                        </>
                      );
                    })()}
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                      <span className="text-gray-600">Sin actualización</span>
                      <strong className="text-gray-900">{criticalAlertsCount}</strong>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                      <span className="text-gray-600">Baja actividad</span>
                      <strong className="text-gray-900">{followUpAlertsCount}</strong>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                      <span className="text-gray-600">Informativas</span>
                      <strong className="text-gray-900">{infoAlertsCount}</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 2: Sedes en riesgo */}
              <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-2xs space-y-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <div>
                    <h4 className="text-xs font-extrabold text-gray-900 uppercase tracking-wider">Sedes en riesgo</h4>
                    <p className="text-[10px] text-gray-400">Sedes que requieren seguimiento prioritario.</p>
                  </div>
                </div>

                <div className="space-y-2 pt-1">
                  {storesWithoutUpdates.map((stat, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        setSelectedSupervisorId(stat.assignedUserId ? String(stat.assignedUserId) : stat.storeIdStr);
                        setActiveTab('movements');
                      }}
                      className="p-3 bg-red-50/60 rounded-xl flex items-center justify-between cursor-pointer hover:bg-red-100/60 transition-colors"
                    >
                      <div className="flex items-center gap-2 text-xs font-bold text-gray-900">
                        <StoreIcon className="w-3.5 h-3.5 text-red-700" />
                        <span>{stat.storeName}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800">
                        {stat.daysWithoutChanges} días sin actividad &gt;
                      </span>
                    </div>
                  ))}

                  {storeStatsList.filter(s => s.todayCount > 0 && s.todayCount < alertSettings.dailyTarget).map((stat, idx) => (
                    <div
                      key={`low-${idx}`}
                      onClick={() => {
                        setSelectedSupervisorId(stat.assignedUserId ? String(stat.assignedUserId) : stat.storeIdStr);
                        setActiveTab('movements');
                      }}
                      className="p-3 bg-amber-50/60 rounded-xl flex items-center justify-between cursor-pointer hover:bg-amber-100/60 transition-colors"
                    >
                      <div className="flex items-center gap-2 text-xs font-bold text-gray-900">
                        <StoreIcon className="w-3.5 h-3.5 text-amber-700" />
                        <span>{stat.storeName}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                        ⚠️ Baja actividad &gt;
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card 3: Configuración de alertas */}
              <div
                onClick={() => setIsAlertSettingsOpen(true)}
                className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-2xs flex items-center justify-between cursor-pointer hover:border-gray-400 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-700">
                    <Settings className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-gray-900">Configuración de alertas</h4>
                    <p className="text-[10px] text-gray-400">Define las reglas y umbrales de notificación.</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 6: HISTORIAL DE CAMBIOS (Image EE438FDB)
          ======================================================== */}
      {activeTab === 'change_history' && (
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-800 shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-gray-900">Historial de cambios</h2>
              <p className="text-xs text-gray-500">Consulta el detalle de todas las modificaciones realizadas en los productos.</p>
            </div>
          </div>

          {/* Top Filters Bar */}
          <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-2xs space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-3">
                {/* Sede Filter */}
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Sede</label>
                  <div className="relative">
                    <select
                      value={historySelectedStore}
                      onChange={e => {
                        setHistorySelectedStore(e.target.value);
                        setHistoryCurrentPage(1);
                      }}
                      className="pl-8 pr-8 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 cursor-pointer focus:outline-none"
                    >
                      <option value="all">Todas las sedes</option>
                      {stores.map(store => (
                        <option key={store.id} value={String(store.id)}>
                          {formatStoreName(store)}
                        </option>
                      ))}
                    </select>
                    <StoreIcon className="w-3.5 h-3.5 text-gray-500 absolute left-2.5 top-2.5 pointer-events-none" />
                  </div>
                </div>

                {/* Usuario Filter */}
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Usuario</label>
                  <div className="relative">
                    <select
                      value={historySelectedUser}
                      onChange={e => {
                        setHistorySelectedUser(e.target.value);
                        setHistoryCurrentPage(1);
                      }}
                      className="pl-8 pr-8 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 cursor-pointer focus:outline-none"
                    >
                      <option value="all">Todos los usuarios</option>
                      {users.map(u => (
                        <option key={u.id} value={String(u.id)}>
                          {u.name || u.email}
                        </option>
                      ))}
                    </select>
                    <UserIcon className="w-3.5 h-3.5 text-gray-500 absolute left-2.5 top-2.5 pointer-events-none" />
                  </div>
                </div>

                {/* Tipo de cambio Filter */}
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Tipo de cambio</label>
                  <div className="relative">
                    <select
                      value={historySelectedType}
                      onChange={e => {
                        setHistorySelectedType(e.target.value);
                        setHistoryCurrentPage(1);
                      }}
                      className="pl-8 pr-8 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 cursor-pointer focus:outline-none"
                    >
                      <option value="ALL">Todos los cambios</option>
                      <option value="PRICE">Cambios de precio</option>
                      <option value="STATUS">Cambios de disponibilidad</option>
                      <option value="DESCRIPTION">Cambios de descripción</option>
                    </select>
                    <Layers className="w-3.5 h-3.5 text-gray-500 absolute left-2.5 top-2.5 pointer-events-none" />
                  </div>
                </div>

                {/* Rango de fecha Filter */}
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Rango de fecha</label>
                  <div className="relative">
                    <select
                      value={dateRangeMode}
                      onChange={e => {
                        const val = e.target.value as any;
                        setDateRangeMode(val);
                        setHistoryCurrentPage(1);
                        if (val === 'specific_date' && !selectedSpecificDate) {
                          setSelectedSpecificDate(new Date().toISOString().slice(0, 10));
                        }
                      }}
                      className="pl-8 pr-8 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 cursor-pointer focus:outline-none"
                    >
                      <option value="7days">Últimos 7 días</option>
                      <option value="today">Hoy</option>
                      <option value="yesterday">Ayer</option>
                      <option value="30days">Últimos 30 días</option>
                      <option value="specific_date">📅 Seleccionar fecha del mes...</option>
                      <option value="all">Histórico completo</option>
                    </select>
                    <Calendar className="w-3.5 h-3.5 text-gray-500 absolute left-2.5 top-2.5 pointer-events-none" />
                  </div>
                </div>

                {/* Specific Date input if selected */}
                {dateRangeMode === 'specific_date' && (
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Fecha del mes</label>
                    <div className="relative">
                      <input
                        type="date"
                        value={selectedSpecificDate}
                        onChange={e => {
                          setSelectedSpecificDate(e.target.value);
                          setHistoryCurrentPage(1);
                        }}
                        className="pl-8 pr-3 py-1.5 bg-gray-50 border border-emerald-300 ring-2 ring-emerald-500/20 rounded-xl text-xs font-bold text-gray-900 cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                      <Calendar className="w-3.5 h-3.5 text-emerald-600 absolute left-2.5 top-2.5 pointer-events-none" />
                    </div>
                  </div>
                )}
              </div>

              {/* Buscador */}
              <div className="w-full sm:w-auto">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Buscar</label>
                <div className="relative min-w-[260px]">
                  <input
                    type="text"
                    value={historySearchTerm}
                    onChange={e => {
                      setHistorySearchTerm(e.target.value);
                      setHistoryCurrentPage(1);
                    }}
                    placeholder="Buscar producto por nombre o ref..."
                    className="w-full pl-8 pr-4 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black"
                  />
                  <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* 5 KPI Metric Cards - Exclusivo para Cambios / Productos Editados */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
            {/* 1. Productos editados */}
            <div className="bg-white rounded-2xl p-4 border border-blue-100/80 shadow-2xs space-y-1">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                  <Edit2 className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded-md">
                  ↑ {trends.edited}
                </span>
              </div>
              <p className="text-[11px] font-bold text-gray-500 pt-1">Productos editados</p>
              <h3 className="text-2xl font-black text-gray-900">{historyKpis.totalEdited}</h3>
            </div>

            {/* 2. Cambios de precio */}
            <div className="bg-white rounded-2xl p-4 border border-emerald-100/80 shadow-2xs space-y-1">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 font-extrabold text-sm">
                  $
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md">
                  Precios
                </span>
              </div>
              <p className="text-[11px] font-bold text-gray-500 pt-1">Cambios de precio</p>
              <h3 className="text-2xl font-black text-gray-900">{historyKpis.priceChanges}</h3>
            </div>

            {/* 3. Cambios de disponibilidad */}
            <div className="bg-white rounded-2xl p-4 border border-purple-100/80 shadow-2xs space-y-1">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
                  <AlertCircle className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded-md">
                  Estado
                </span>
              </div>
              <p className="text-[11px] font-bold text-gray-500 pt-1">Cambios disponibilidad</p>
              <h3 className="text-2xl font-black text-gray-900">{historyKpis.statusChanges}</h3>
            </div>

            {/* 4. Cambios de descripción */}
            <div className="bg-white rounded-2xl p-4 border border-amber-100/80 shadow-2xs space-y-1">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
                  <FileText className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-md">
                  Detalles
                </span>
              </div>
              <p className="text-[11px] font-bold text-gray-500 pt-1">Cambios de descripción</p>
              <h3 className="text-2xl font-black text-gray-900">{historyKpis.descChanges}</h3>
            </div>

            {/* 5. Total de cambios */}
            <div className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-2xs space-y-1 col-span-2 sm:col-span-1">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-800">
                  <Layers className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold text-gray-700 bg-gray-100 px-1.5 py-0.5 rounded-md">
                  Total
                </span>
              </div>
              <p className="text-[11px] font-bold text-gray-500 pt-1">Total de cambios</p>
              <h3 className="text-2xl font-black text-gray-900">{historyKpis.totalEdited}</h3>
            </div>
          </div>

          {/* Master-Detail Split Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* ==========================================
                LEFT COLUMN: Movimientos registrados (7 cols)
                ========================================== */}
            <div className="lg:col-span-7 bg-white rounded-2xl border border-gray-200/80 p-5 shadow-2xs space-y-4">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-gray-800" />
                <h3 className="font-extrabold text-sm text-gray-900">Movimientos registrados</h3>
              </div>

              {/* Table Column Headers */}
              <div className="grid grid-cols-[105px,1fr,90px,95px,90px,20px] items-center text-[10px] font-bold text-gray-400 uppercase tracking-wider pb-2 border-b border-gray-100 px-2">
                <div className="flex items-center gap-1">
                  <span>Fecha y hora</span>
                  <span>↓</span>
                </div>
                <div>Producto</div>
                <div>Movimiento</div>
                <div>Usuario</div>
                <div>Sede</div>
                <div></div>
              </div>

              {/* Rows List */}
              {paginatedHistoryLogs.length === 0 ? (
                <div className="p-8 text-center text-gray-400 text-xs font-medium">
                  No se encontraron movimientos registrados con los filtros seleccionados.
                </div>
              ) : (
                <div className="space-y-1">
                  {paginatedHistoryLogs.map((log) => {
                    const isSelected = currentDetailLog && String(currentDetailLog.id) === String(log.id);
                    const parsed = parseLogProduct(log);
                    const logDate = parseDateSafe(log.createdAt);
                    const timeFormatted = logDate.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' }) + ', ' +
                      logDate.toLocaleTimeString('es-CO', { hour: 'numeric', minute: '2-digit', hour12: true });

                    return (
                      <div
                        key={log.id}
                        onClick={() => setHistorySelectedLogId(log.id)}
                        className={`grid grid-cols-[105px,1fr,90px,95px,90px,20px] items-center p-2.5 rounded-xl transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-50/70 border border-emerald-300 shadow-2xs'
                            : 'hover:bg-gray-50 border border-transparent'
                        }`}
                      >
                        {/* Fecha y hora */}
                        <div className="text-[11px] font-semibold text-gray-600 pr-1">
                          {timeFormatted}
                        </div>

                        {/* Producto */}
                        <div className="flex items-center gap-2 min-w-0 pr-2">
                          <img
                            src={parsed.image}
                            alt={parsed.name}
                            className="w-8 h-8 rounded-lg object-cover border border-gray-200 shrink-0"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=120&auto=format&fit=crop&q=60';
                            }}
                          />
                          <span className="font-extrabold text-xs text-gray-900 truncate uppercase">
                            {parsed.name}
                          </span>
                        </div>

                        {/* Movimiento Badge */}
                        <div className="pr-1">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200/60">
                            <Edit2 className="w-2.5 h-2.5" /> Editado
                          </span>
                        </div>

                        {/* Usuario */}
                        <div className="flex items-center gap-1 text-[11px] font-medium text-gray-700 truncate pr-1">
                          <UserIcon className="w-3 h-3 text-gray-400 shrink-0" />
                          <span className="truncate">{log.userName || 'Usuario'}</span>
                        </div>

                        {/* Sede */}
                        <div className="flex items-center gap-1 text-[11px] font-medium text-gray-700 truncate pr-1">
                          <StoreIcon className="w-3 h-3 text-gray-400 shrink-0" />
                          <span className="truncate">
                            {parsed.storeName.replace("JUAN'D STORE - ", '').replace('QUALITY STORE - ', '')}
                          </span>
                        </div>

                        {/* Chevron right */}
                        <div className="text-gray-400 text-right">
                          <ChevronRight className="w-4 h-4" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Table Footer & Pagination */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
                <span className="font-medium text-[11px]">
                  Mostrando {paginatedHistoryLogs.length} de {totalHistoryItems} movimientos
                </span>

                <div className="flex items-center gap-1">
                  {/* First page */}
                  <button
                    type="button"
                    onClick={() => setHistoryCurrentPage(1)}
                    disabled={historyCurrentPage === 1}
                    className="p-1 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:pointer-events-none cursor-pointer text-gray-600"
                    title="Primera página"
                  >
                    <ChevronsLeft className="w-4 h-4" />
                  </button>

                  {/* Prev page */}
                  <button
                    type="button"
                    onClick={() => setHistoryCurrentPage(p => Math.max(1, p - 1))}
                    disabled={historyCurrentPage === 1}
                    className="p-1 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:pointer-events-none cursor-pointer text-gray-600"
                    title="Página anterior"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {/* Page Numbers */}
                  {getPaginationNumbers(historyCurrentPage, totalHistoryPages).map((item, idx) => {
                    if (item === '...') {
                      return <span key={`ellipsis-${idx}`} className="px-1 text-gray-400 font-bold">...</span>;
                    }
                    const pageNum = Number(item);
                    const isActive = pageNum === historyCurrentPage;

                    return (
                      <button
                        key={pageNum}
                        type="button"
                        onClick={() => setHistoryCurrentPage(pageNum)}
                        className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          isActive
                            ? 'bg-emerald-600 text-white shadow-2xs'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  {/* Next page */}
                  <button
                    type="button"
                    onClick={() => setHistoryCurrentPage(p => Math.min(totalHistoryPages, p + 1))}
                    disabled={historyCurrentPage === totalHistoryPages}
                    className="p-1 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:pointer-events-none cursor-pointer text-gray-600"
                    title="Página siguiente"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  {/* Last page */}
                  <button
                    type="button"
                    onClick={() => setHistoryCurrentPage(totalHistoryPages)}
                    disabled={historyCurrentPage === totalHistoryPages}
                    className="p-1 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:pointer-events-none cursor-pointer text-gray-600"
                    title="Última página"
                  >
                    <ChevronsRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* ==========================================
                RIGHT COLUMN: Detalle del cambio (5 cols)
                ========================================== */}
            <div className="lg:col-span-5">
              {currentDetailLog ? (() => {
                const detailParsed = parseLogProduct(currentDetailLog);
                const detailDate = parseDateSafe(currentDetailLog.createdAt);
                const formattedDetailDate = detailDate.toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' }) + ', ' +
                  detailDate.toLocaleTimeString('es-CO', { hour: 'numeric', minute: '2-digit', hour12: true });

                // Genuine comparison values for edited product (0 fake stock, 0 fake price changes)
                const currentPriceVal = detailParsed.newPrice ?? detailParsed.oldPrice ?? 0;
                const oldPriceVal = detailParsed.oldPrice ?? currentPriceVal;
                const hasPriceChange = detailParsed.priceChanged && detailParsed.oldPrice !== null && detailParsed.newPrice !== null;

                const oldStatusLabel = detailParsed.oldStatus === 'OUT_OF_STOCK' ? 'Agotado' : 'Disponible';
                const newStatusLabel = detailParsed.newStatus === 'OUT_OF_STOCK' ? 'Agotado' : 'Disponible';
                const hasStatusChange = detailParsed.statusChanged;

                const oldDescDisplay = detailParsed.oldDescription || 'Sin descripción previa registrada';
                const newDescDisplay = detailParsed.newDescription || detailParsed.oldDescription || 'Información verificada en catálogo';

                const hasAnyFieldChange = detailParsed.priceChanged || detailParsed.statusChanged || detailParsed.nameChanged || detailParsed.categoryChanged || detailParsed.descChanged;

                return (
                  <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-2xs space-y-4">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                      <div className="flex items-center gap-2">
                        <Edit2 className="w-4 h-4 text-gray-800" />
                        <h3 className="text-sm font-extrabold text-gray-900">Detalle del cambio</h3>
                      </div>
                      <div>
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60 flex items-center gap-1">
                          ✓ Editado
                        </span>
                      </div>
                    </div>

                    {/* Product Summary Card */}
                    <div className="flex items-start gap-3.5">
                      <img
                        src={detailParsed.image}
                        alt={detailParsed.name}
                        className="w-14 h-14 rounded-xl object-cover border border-gray-100 shrink-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=120&auto=format&fit=crop&q=60';
                        }}
                      />
                      <div className="min-w-0 flex-1">
                        <h4 className="font-black text-sm text-gray-900 uppercase tracking-tight truncate">
                          {detailParsed.name}
                        </h4>
                        <p className="text-[11px] text-gray-500 font-medium">
                          Ref: {detailParsed.ref} <span className="mx-1">|</span> Categoría: {detailParsed.category}
                        </p>

                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-[11px] text-gray-600">
                          <span className="flex items-center gap-1">
                            <StoreIcon className="w-3 h-3 text-gray-400" />
                            Sede: <strong className="text-gray-800">{detailParsed.storeName}</strong>
                          </span>
                          <span className="flex items-center gap-1">
                            <UserIcon className="w-3 h-3 text-gray-400" />
                            Usuario: <strong className="text-gray-800">{currentDetailLog.userName || 'Admin'}</strong>
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-gray-400" />
                            Fecha: <strong className="text-gray-800">{formattedDetailDate}</strong>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Comparación de cambios */}
                    <div className="space-y-2.5 pt-2 border-t border-gray-100">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-gray-800">
                        <RefreshCw className="w-3.5 h-3.5 text-gray-600" />
                        <span>Comparación de cambios</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-[1fr,auto,1fr] gap-3 items-center">
                        {/* Box: Antes del cambio */}
                        <div className="bg-red-50/40 rounded-xl p-3 border border-red-100 space-y-2 text-xs">
                          <span className="text-[11px] font-bold text-red-600 block">Antes del cambio</span>
                          <div className="flex items-center gap-2">
                            <img
                              src={detailParsed.image}
                              alt="Antes"
                              className="w-10 h-10 rounded-lg object-cover border border-red-200/60 opacity-80 shrink-0"
                            />
                            <div className="min-w-0">
                              <p className="text-[11px] text-gray-700">
                                Precio:{' '}
                                {hasPriceChange ? (
                                  <strong className="text-xs line-through text-red-600 font-bold">
                                    {formatPrice(oldPriceVal)}
                                  </strong>
                                ) : (
                                  <span className="font-semibold text-gray-700">
                                    {formatPrice(oldPriceVal)}
                                  </span>
                                )}
                              </p>
                              <p className="text-[11px] text-gray-700">
                                Estado:{' '}
                                <span className={`font-semibold ${detailParsed.oldStatus === 'OUT_OF_STOCK' ? 'text-red-600' : 'text-gray-700'}`}>
                                  {oldStatusLabel}
                                </span>
                              </p>
                            </div>
                          </div>
                          <p className="text-[10px] text-gray-500 line-clamp-2 leading-relaxed">
                            <strong className="text-gray-600 font-bold">Descripción: </strong>{oldDescDisplay}
                          </p>
                        </div>

                        {/* Circular Green Connector Arrow */}
                        <div className="flex justify-center py-1 sm:py-0">
                          <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs shrink-0">
                            <ArrowRight className="w-3.5 h-3.5" />
                          </div>
                        </div>

                        {/* Box: Después del cambio */}
                        <div className="bg-emerald-50/40 rounded-xl p-3 border border-emerald-100 space-y-2 text-xs">
                          <span className="text-[11px] font-bold text-emerald-700 block">Después del cambio</span>
                          <div className="flex items-center gap-2">
                            <img
                              src={detailParsed.image}
                              alt="Después"
                              className="w-10 h-10 rounded-lg object-cover border border-emerald-200/60 shrink-0"
                            />
                            <div className="min-w-0">
                              <p className="text-[11px] text-gray-700">
                                Precio:{' '}
                                <strong className={`text-xs ${hasPriceChange ? 'text-emerald-700 font-extrabold' : 'text-gray-800 font-bold'}`}>
                                  {formatPrice(currentPriceVal)}
                                </strong>
                              </p>
                              <p className="text-[11px] text-gray-700">
                                Estado:{' '}
                                <strong className={`font-bold ${detailParsed.newStatus === 'OUT_OF_STOCK' ? 'text-red-600' : 'text-emerald-700'}`}>
                                  {newStatusLabel}
                                </strong>
                              </p>
                            </div>
                          </div>
                          <p className="text-[10px] text-gray-600 line-clamp-2 leading-relaxed">
                            <strong className="text-gray-700 font-bold">Descripción: </strong>{newDescDisplay}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Campos modificados (strictly genuine modifications, 0 fake stock, 0 fake edits) */}
                    <div className="space-y-2 pt-2 border-t border-gray-100">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-gray-800">
                        <Layers className="w-3.5 h-3.5 text-gray-600" />
                        <span>Campos modificados</span>
                      </div>

                      <div className="space-y-1.5 text-xs text-gray-700">
                        {/* Precio (only if actually changed) */}
                        {detailParsed.priceChanged && (
                          <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50 border border-gray-100">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-gray-500 w-4 text-center">$</span>
                              <span className="font-semibold">Precio</span>
                            </div>
                            <div className="font-bold text-[11px]">
                              <span className="text-gray-500 line-through">{formatPrice(detailParsed.oldPrice!)}</span>
                              <span className="mx-1.5 text-gray-400">→</span>
                              <span className="text-emerald-700">{formatPrice(detailParsed.newPrice!)}</span>
                            </div>
                          </div>
                        )}

                        {/* Disponibilidad (only if status changed) */}
                        {hasStatusChange && (
                          <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50 border border-gray-100">
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="w-3.5 h-3.5 text-gray-500" />
                              <span className="font-semibold">Disponibilidad</span>
                            </div>
                            <div className="font-bold text-[11px]">
                              <span className="text-gray-500">{oldStatusLabel}</span>
                              <span className="mx-1.5 text-gray-400">→</span>
                              <span className={detailParsed.newStatus === 'OUT_OF_STOCK' ? 'text-red-600' : 'text-emerald-700'}>
                                {newStatusLabel}
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Nombre (only if changed) */}
                        {detailParsed.nameChanged && (
                          <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50 border border-gray-100">
                            <div className="flex items-center gap-2">
                              <Tag className="w-3.5 h-3.5 text-gray-500" />
                              <span className="font-semibold">Nombre</span>
                            </div>
                            <div className="font-bold text-[11px] text-right truncate max-w-[200px]">
                              <span className="text-gray-500">{detailParsed.parsedOld?.name}</span>
                              <span className="mx-1.5 text-gray-400">→</span>
                              <span className="text-emerald-700">{detailParsed.parsedNew?.name}</span>
                            </div>
                          </div>
                        )}

                        {/* Categoría (only if changed) */}
                        {detailParsed.categoryChanged && (
                          <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50 border border-gray-100">
                            <div className="flex items-center gap-2">
                              <Folder className="w-3.5 h-3.5 text-gray-500" />
                              <span className="font-semibold">Categoría</span>
                            </div>
                            <div className="font-bold text-[11px]">
                              <span className="text-gray-500">{detailParsed.parsedOld?.category?.name || 'Anterior'}</span>
                              <span className="mx-1.5 text-gray-400">→</span>
                              <span className="text-emerald-700">{detailParsed.parsedNew?.category?.name || 'Nueva'}</span>
                            </div>
                          </div>
                        )}

                        {/* Descripción (only if changed) */}
                        {detailParsed.descChanged && (
                          <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50 border border-gray-100">
                            <div className="flex items-center gap-2">
                              <FileText className="w-3.5 h-3.5 text-gray-500" />
                              <span className="font-semibold">Descripción</span>
                            </div>
                            <div className="font-medium text-[11px] text-gray-600 max-w-[240px] truncate text-right">
                              Se actualizó la descripción del producto
                            </div>
                          </div>
                        )}

                        {/* Note when user saved without changing price/status/name/desc/category (e.g. photos/sizes/re-save) */}
                        {!hasAnyFieldChange && (
                          <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 text-center space-y-0.5">
                            <p className="text-[11px] font-bold text-gray-700">
                              Edición guardada por {currentDetailLog.userName || 'el usuario'}
                            </p>
                            <p className="text-[10px] text-gray-500">
                              Actualización de fotos, tallas o verificación de catálogo (sin modificación de precio ni disponibilidad).
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })() : (
                <div className="bg-white rounded-2xl border border-gray-200/80 p-8 text-center text-gray-500">
                  <Package className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                  <p className="font-bold text-xs">No hay movimientos seleccionados</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">Selecciona un movimiento de la lista para ver el desglose detallado.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: Detalle de Movimiento / Auditoría
          ======================================================== */}
      {selectedLogDetail && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-gray-200 max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-gray-900">Detalle de Auditoría</h3>
                  <span className="text-[10px] text-gray-400 font-mono">Registro #{selectedLogDetail.id}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLogDetail(null)}
                className="p-1 text-gray-400 hover:text-black rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {(() => {
              const parsed = parseLogProduct(selectedLogDetail);
              const logDate = parseDateSafe(selectedLogDetail.createdAt);

              return (
                <div className="space-y-4 text-xs">
                  {/* Summary Card */}
                  <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-3">
                    <img
                      src={parsed.image}
                      alt={parsed.name}
                      className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                    />
                    <div>
                      <h4 className="font-extrabold text-gray-900 text-sm">{parsed.name}</h4>
                      <p className="text-[11px] text-gray-500">{parsed.ref} · Sede: {parsed.storeName}</p>
                      <p className="text-[11px] font-bold text-emerald-800 mt-0.5">{parsed.detail}</p>
                    </div>
                  </div>

                  {/* Metadata Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 bg-gray-50 rounded-xl text-gray-700">
                    <div>
                      <span className="text-gray-400 text-[10px] block font-bold">Usuario</span>
                      <strong>{selectedLogDetail.userName}</strong>
                      <span className="text-[10px] text-gray-500 block truncate">{selectedLogDetail.userEmail}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 text-[10px] block font-bold">Rol</span>
                      <strong>{selectedLogDetail.userRole}</strong>
                    </div>
                    <div>
                      <span className="text-gray-400 text-[10px] block font-bold">Acción</span>
                      <strong className="text-emerald-700">{selectedLogDetail.actionType}</strong>
                    </div>
                    <div>
                      <span className="text-gray-400 text-[10px] block font-bold">Fecha y Hora</span>
                      <strong>{logDate.toLocaleString('es-CO')}</strong>
                    </div>
                    <div>
                      <span className="text-gray-400 text-[10px] block font-bold">Dirección IP</span>
                      <strong className="font-mono">{selectedLogDetail.ipAddress || '127.0.0.1'}</strong>
                    </div>
                    <div>
                      <span className="text-gray-400 text-[10px] block font-bold">Entidad</span>
                      <strong>{selectedLogDetail.entityType} #{selectedLogDetail.entityId || 'N/A'}</strong>
                    </div>
                  </div>

                  {/* JSON Diff if available */}
                  {selectedLogDetail.previousData && (
                    <div>
                      <span className="font-bold text-red-600 block mb-1">Estado anterior:</span>
                      <pre className="bg-gray-900 text-red-300 p-3 rounded-xl overflow-x-auto text-[10px] font-mono max-h-40">
                        {JSON.stringify(JSON.parse(selectedLogDetail.previousData), null, 2)}
                      </pre>
                    </div>
                  )}

                  {selectedLogDetail.newData && (
                    <div>
                      <span className="font-bold text-emerald-600 block mb-1">Estado nuevo:</span>
                      <pre className="bg-gray-900 text-emerald-300 p-3 rounded-xl overflow-x-auto text-[10px] font-mono max-h-40">
                        {JSON.stringify(JSON.parse(selectedLogDetail.newData), null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              );
            })()}

            <div className="pt-3 border-t border-gray-100 text-right">
              <button
                type="button"
                onClick={() => setSelectedLogDetail(null)}
                className="px-4 py-2 bg-black hover:bg-gray-800 text-white font-bold rounded-xl text-xs cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: Detalle de Alerta
          ======================================================== */}
      {selectedAlertDetail && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-amber-600" />
                <h3 className="text-sm font-extrabold text-gray-900">Detalle de la Alerta</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAlertDetail(null)}
                className="p-1 text-gray-400 hover:text-black rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-gray-700">
              <div>
                <span className="text-[10px] font-bold text-gray-400 block uppercase">Tipo de alerta</span>
                <strong className="text-sm text-gray-900">{selectedAlertDetail.title}</strong>
              </div>
              <div>
                <span className="text-[10px] font-bold text-gray-400 block uppercase">Sede afectada</span>
                <strong className="text-gray-900">{selectedAlertDetail.sedeName}</strong>
              </div>
              <div>
                <span className="text-[10px] font-bold text-gray-400 block uppercase">Detalle del evento</span>
                <p className="mt-1 p-2.5 bg-gray-50 rounded-xl border border-gray-100 leading-relaxed font-medium">
                  {selectedAlertDetail.description}
                </p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-gray-400 block uppercase">Severidad</span>
                <span className={`inline-block mt-0.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  selectedAlertDetail.severity === 'CRITICA' ? 'bg-red-100 text-red-800' :
                  selectedAlertDetail.severity === 'SEGUIMIENTO' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {selectedAlertDetail.severity}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-gray-400 block uppercase">Estado actual</span>
                <span className={`inline-block mt-0.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  selectedAlertDetail.status === 'REVISADA' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {selectedAlertDetail.status === 'REVISADA' ? 'Revisada' : 'Pendiente de revisión'}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  handleToggleAlertStatus(String(selectedAlertDetail.id));
                  setSelectedAlertDetail(null);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  selectedAlertDetail.status === 'REVISADA'
                    ? 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                    : 'bg-emerald-600 text-white hover:bg-emerald-700'
                }`}
              >
                {selectedAlertDetail.status === 'REVISADA' ? 'Marcar como Pendiente' : 'Marcar como Revisada'}
              </button>

              <button
                type="button"
                onClick={() => setSelectedAlertDetail(null)}
                className="px-4 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: Configuración de Alertas
          ======================================================== */}
      {isAlertSettingsOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-gray-800" />
                <div>
                  <h3 className="text-sm font-extrabold text-gray-900">Configuración de Alertas</h3>
                  <p className="text-[10px] text-gray-400">Define las reglas y umbrales de notificación.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAlertSettingsOpen(false)}
                className="p-1 text-gray-400 hover:text-black rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const newSettings: AuditAlertSettings = {
                  dailyTarget: Number((form.elements.namedItem('dailyTarget') as HTMLInputElement).value) || 5,
                  inactiveDaysThreshold: Number((form.elements.namedItem('inactiveDaysThreshold') as HTMLInputElement).value) || 3,
                  massEditThreshold: Number((form.elements.namedItem('massEditThreshold') as HTMLInputElement).value) || 8,
                  massDeleteThreshold: Number((form.elements.namedItem('massDeleteThreshold') as HTMLInputElement).value) || 5
                };
                handleSaveAlertSettings(newSettings);
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block font-bold text-gray-800 mb-1">
                  Meta diaria de movimientos por sede
                </label>
                <p className="text-[10px] text-gray-500 mb-1.5">Mínimo de publicaciones/ediciones esperadas por sede al día.</p>
                <input
                  type="number"
                  name="dailyTarget"
                  defaultValue={alertSettings.dailyTarget}
                  min={1}
                  max={100}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-800 mb-1">
                  Días sin actividad para Alerta Crítica
                </label>
                <p className="text-[10px] text-gray-500 mb-1.5">Cantidad de días consecutivos sin cambios para marcar una sede como inactiva.</p>
                <input
                  type="number"
                  name="inactiveDaysThreshold"
                  defaultValue={alertSettings.inactiveDaysThreshold}
                  min={1}
                  max={30}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-800 mb-1">
                  Umbral de edición masiva
                </label>
                <p className="text-[10px] text-gray-500 mb-1.5">Cantidad de productos editados en el período para generar alerta informativa.</p>
                <input
                  type="number"
                  name="massEditThreshold"
                  defaultValue={alertSettings.massEditThreshold}
                  min={2}
                  max={100}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-800 mb-1">
                  Umbral de eliminación masiva
                </label>
                <p className="text-[10px] text-gray-500 mb-1.5">Cantidad de productos eliminados para requerir revisión prioritaria.</p>
                <input
                  type="number"
                  name="massDeleteThreshold"
                  defaultValue={alertSettings.massDeleteThreshold}
                  min={2}
                  max={50}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-bold"
                />
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAlertSettingsOpen(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-black hover:bg-gray-800 text-white font-bold rounded-xl text-xs cursor-pointer"
                >
                  Guardar configuración
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
