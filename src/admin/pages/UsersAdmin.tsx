import React, { useEffect, useState, useMemo } from 'react';
import { UserService, StoreService } from '../../services/api';
import { User, Store, UserStatus, DocumentType, UserRoleName } from '../../types';
import { 
  Plus, Edit2, Trash2, X, Search, Shield, 
  Mail, Phone, Calendar, Clock, CheckCircle2, 
  XCircle, AlertTriangle, Eye, EyeOff, RefreshCw, 
  FileText, Check, Lock, Building2, Sparkles, 
  Copy, UserCheck, UserX, User as UserIcon, ShieldAlert,
  MapPin, Hash, IdCard
} from 'lucide-react';
import Swal from 'sweetalert2';
import { formatStoreName } from '../../utils/format';

const DOCUMENT_TYPES: { value: DocumentType; label: string }[] = [
  { value: 'CC', label: 'Cédula de Ciudadanía (CC)' },
  { value: 'CE', label: 'Cédula de Extranjería (CE)' },
  { value: 'PASAPORTE', label: 'Pasaporte' },
  { value: 'PPT', label: 'Permiso de Protección Temporal (PPT)' },
  { value: 'TI', label: 'Tarjeta de Identidad (TI)' },
];

const ROLES: { value: UserRoleName; label: string; desc: string }[] = [
  { value: 'STORE_ADMIN', label: 'Administrador de Sede', desc: 'Gestiona inventario, catálogo, reclutamiento y gastos de su sede asignada.' },
  { value: 'GLOBAL_ADMIN', label: 'Administrador Global', desc: 'Control total de la plataforma, todas las sedes, auditoría y configuraciones.' },
  { value: 'VENDEDOR', label: 'Vendedor / Asesor Comercial', desc: 'Acceso a consulta de catálogo y ventas de la sede.' },
];

const STATUS_CONFIG: Record<UserStatus, { label: string; bg: string; text: string; border: string; dot: string; icon: any }> = {
  ACTIVO: {
    label: 'Activo',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    dot: 'bg-emerald-500',
    icon: CheckCircle2
  },
  INACTIVO: {
    label: 'Inactivo',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    dot: 'bg-amber-500',
    icon: AlertTriangle
  },
  SUSPENDIDO: {
    label: 'Suspendido',
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-200',
    dot: 'bg-rose-500',
    icon: XCircle
  }
};

export default function UsersAdmin() {
  const [users, setUsers] = useState<User[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Filtros y búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [storeFilter, setStoreFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modales
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedUserDetail, setSelectedUserDetail] = useState<User | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Formulario con los 13 campos del requerimiento
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    documentType: 'CC' as DocumentType,
    documentNumber: '',
    phone: '',
    email: '',
    username: '',
    password: '',
    roleName: 'STORE_ADMIN' as UserRoleName,
    storeIds: [] as string[],
    status: 'ACTIVO' as UserStatus,
    createdAt: '',
    lastLogin: ''
  });

  const loadData = async () => {
    setRefreshing(true);
    try {
      const [u, s] = await Promise.all([UserService.getUsers(), StoreService.getStores()]);
      setUsers(u);
      setStores(s);
    } catch (err) {
      console.error('Error cargando usuarios y sedes:', err);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Generar ID único automático
  const generateNewUserId = () => {
    const nextNum = users.length + 1001;
    return `ADM-${nextNum}`;
  };

  // Generar contraseña aleatoria segura
  const generateSecurePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%&*';
    let result = 'Jd#';
    for (let i = 0; i < 7; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ ...prev, password: result }));
    setShowPassword(true);
  };

  // Sugerir usuario a partir del nombre o sede
  const suggestUsername = () => {
    if (formData.name.trim()) {
      const clean = formData.name.toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]/g, '.');
      const parts = clean.split('.').filter(Boolean);
      const suggested = parts.length > 1 ? `${parts[0]}.${parts[1]}` : parts[0];
      setFormData(prev => ({ ...prev, username: suggested }));
    } else if (formData.storeIds.length > 0) {
      const store = stores.find(s => s.id === formData.storeIds[0]);
      if (store) {
        const cleanStore = store.name.toLowerCase().includes('republica') ? 'republica'
          : store.name.toLowerCase().includes('modelo') ? 'ciudadmodelo'
          : store.name.toLowerCase().includes('colombia') ? 'villacolombia'
          : store.name.toLowerCase().includes('mariano') ? 'marianoramos'
          : 'sede';
        setFormData(prev => ({ ...prev, username: `admin.${cleanStore}` }));
      }
    }
  };

  const openModal = (user?: User) => {
    setShowPassword(false);
    if (user) {
      setEditingId(user.id);
      setFormData({
        id: user.id,
        name: user.name || '',
        documentType: (user.documentType || 'CC') as DocumentType,
        documentNumber: user.documentNumber || '',
        phone: user.phone || '',
        email: user.email || '',
        username: user.username || user.email?.split('@')[0] || '',
        password: '',
        roleName: (user.role?.name || 'STORE_ADMIN') as UserRoleName,
        storeIds: user.storeIds || [],
        status: (user.status || (user.isActive ? 'ACTIVO' : 'INACTIVO')) as UserStatus,
        createdAt: user.createdAt || '',
        lastLogin: user.lastLogin || ''
      });
    } else {
      setEditingId(null);
      setFormData({
        id: generateNewUserId(),
        name: '',
        documentType: 'CC',
        documentNumber: '',
        phone: '',
        email: '',
        username: '',
        password: '',
        roleName: 'STORE_ADMIN',
        storeIds: stores.length > 0 ? [stores[0].id] : ['1'],
        status: 'ACTIVO',
        createdAt: new Date().toISOString(),
        lastLogin: 'Sin accesos registrados'
      });
    }
    setIsModalOpen(true);
  };

  const openDetailModal = (user: User) => {
    setSelectedUserDetail(user);
    setIsDetailModalOpen(true);
  };

  const handleStoreToggle = (storeId: string) => {
    setFormData(prev => ({
      ...prev,
      storeIds: prev.storeIds.includes(storeId)
        ? prev.storeIds.filter(id => id !== storeId)
        : [...prev.storeIds, storeId]
    }));
  };

  const handleSelectSingleStore = (storeId: string) => {
    setFormData(prev => ({
      ...prev,
      storeIds: [storeId]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      Swal.fire({ icon: 'warning', title: 'Falta información', text: 'Por favor ingresa el nombre completo.' });
      return;
    }
    if (!formData.email.trim()) {
      Swal.fire({ icon: 'warning', title: 'Falta información', text: 'Por favor ingresa el correo electrónico.' });
      return;
    }
    if (!editingId && !formData.password.trim()) {
      Swal.fire({ icon: 'warning', title: 'Contraseña requerida', text: 'Debes asignar una contraseña al nuevo usuario.' });
      return;
    }
    if (formData.roleName === 'STORE_ADMIN' && formData.storeIds.length === 0) {
      Swal.fire({ icon: 'warning', title: 'Sede requerida', text: 'Un Administrador de Sede debe tener al menos una sede asignada.' });
      return;
    }

    setLoading(true);

    const storeNames = formData.roleName === 'GLOBAL_ADMIN'
      ? ['Todas las sedes (Global)']
      : formData.storeIds.map(id => {
          const s = stores.find(st => String(st.id) === String(id));
          return s ? formatStoreName(s) : `Sede ${id}`;
        });

    const userData: User = {
      id: editingId || formData.id || generateNewUserId(),
      name: formData.name.trim(),
      documentType: formData.documentType,
      documentNumber: formData.documentNumber.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim().toLowerCase(),
      username: formData.username.trim() || formData.email.split('@')[0],
      password: formData.password || undefined,
      role: {
        id: formData.roleName === 'GLOBAL_ADMIN' ? 'r1' : 'r2',
        name: formData.roleName
      },
      storeIds: formData.roleName === 'GLOBAL_ADMIN' ? [] : formData.storeIds,
      assignedStoreNames: storeNames,
      status: formData.status,
      isActive: formData.status === 'ACTIVO',
      createdAt: editingId ? (formData.createdAt || new Date().toISOString()) : new Date().toISOString(),
      lastLogin: formData.lastLogin || 'Sin accesos registrados'
    };

    try {
      if (editingId) {
        await UserService.updateUser(editingId, userData);
        Swal.fire({
          icon: 'success',
          title: 'Usuario Actualizado',
          text: `Los datos del administrador ${userData.name} han sido actualizados exitosamente.`,
          confirmButtonColor: '#000000'
        });
      } else {
        await UserService.createUser(userData);
        Swal.fire({
          icon: 'success',
          title: 'Usuario Registrado',
          text: `El administrador ${userData.name} ha sido registrado correctamente con ID ${userData.id}.`,
          confirmButtonColor: '#000000'
        });
      }
      setIsModalOpen(false);
      loadData();
    } catch (error: any) {
      console.error(error);
      Swal.fire({
        icon: 'error',
        title: 'Error al Guardar',
        text: error.message || 'Ocurrió un error inesperado al guardar el usuario.',
        confirmButtonColor: '#000000'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleQuickStatusChange = async (user: User, newStatus: UserStatus) => {
    try {
      await UserService.updateUser(user.id, {
        status: newStatus,
        isActive: newStatus === 'ACTIVO'
      });
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: `Estado cambiado a ${STATUS_CONFIG[newStatus].label}`,
        showConfirmButton: false,
        timer: 2000
      });
      loadData();
    } catch (err: any) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo actualizar el estado del usuario.'
      });
    }
  };

  const handleDelete = async (user: User) => {
    const result = await Swal.fire({
      title: `¿Eliminar a ${user.name}?`,
      text: `Se revocará el acceso de usuario "${user.username || user.email}" y se borrará su registro del sistema.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#000000',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar usuario',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await UserService.deleteUser(user.id);
        loadData();
        Swal.fire({
          icon: 'success',
          title: 'Usuario Eliminado',
          text: 'El registro ha sido removido del sistema.',
          confirmButtonColor: '#000000'
        });
      } catch (err: any) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: err.message || 'No se pudo eliminar el usuario.',
          confirmButtonColor: '#000000'
        });
      }
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: `${label} copiado al portapapeles`,
      showConfirmButton: false,
      timer: 1500
    });
  };

  const formatDateTime = (isoString?: string) => {
    if (!isoString || isoString === 'Sin accesos registrados') return 'Sin accesos registrados';
    try {
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return isoString;
      return new Intl.DateTimeFormat('es-CO', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }).format(d);
    } catch {
      return isoString;
    }
  };

  const getStoreNames = (storeIds?: string[]) => {
    if (!storeIds || storeIds.length === 0) return 'Sin sede asignada';
    return storeIds
      .map(id => {
        const found = stores.find(s => String(s.id) === String(id));
        return found ? formatStoreName(found) : `Sede ${id}`;
      })
      .join(', ');
  };

  // Filtrado reactivo
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const q = searchTerm.toLowerCase().trim();
      const matchSearch = !q || (
        user.name?.toLowerCase().includes(q) ||
        user.email?.toLowerCase().includes(q) ||
        user.username?.toLowerCase().includes(q) ||
        user.documentNumber?.toLowerCase().includes(q) ||
        user.id?.toLowerCase().includes(q) ||
        user.phone?.includes(q) ||
        getStoreNames(user.storeIds).toLowerCase().includes(q)
      );

      const matchRole = roleFilter === 'ALL' || user.role?.name === roleFilter;
      const userStatus = user.status || (user.isActive ? 'ACTIVO' : 'INACTIVO');
      const matchStatus = statusFilter === 'ALL' || userStatus === statusFilter;
      const matchStore = storeFilter === 'ALL' || (
        user.role?.name === 'GLOBAL_ADMIN' ||
        (user.storeIds && user.storeIds.some(id => String(id) === String(storeFilter)))
      );

      return matchSearch && matchRole && matchStatus && matchStore;
    });
  }, [users, stores, searchTerm, roleFilter, statusFilter, storeFilter]);

  // Métricas
  const stats = useMemo(() => {
    const total = users.length;
    const storeAdmins = users.filter(u => u.role?.name === 'STORE_ADMIN').length;
    const globalAdmins = users.filter(u => u.role?.name === 'GLOBAL_ADMIN').length;
    const active = users.filter(u => (u.status || (u.isActive ? 'ACTIVO' : 'INACTIVO')) === 'ACTIVO').length;
    const inactive = users.filter(u => (u.status || (u.isActive ? 'ACTIVO' : 'INACTIVO')) === 'INACTIVO').length;
    const suspended = users.filter(u => (u.status || (u.isActive ? 'ACTIVO' : 'INACTIVO')) === 'SUSPENDIDO').length;
    return { total, storeAdmins, globalAdmins, active, inactive, suspended };
  }, [users]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100 pb-6">
        <div>
          <div className="flex items-center space-x-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center font-black">
              <Shield className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-gray-900">
                Usuarios & Administradores
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 font-medium">
                Gestión de credenciales, roles, sedes y datos de identificación para Juan'D Store & Quality Store.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3 w-full md:w-auto">
          <button
            onClick={loadData}
            disabled={refreshing}
            className="p-2.5 border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors rounded-lg flex items-center justify-center"
            title="Refrescar usuarios"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-black' : ''}`} />
          </button>
          
          <button 
            onClick={() => openModal()}
            className="flex-1 md:flex-none bg-black text-white px-5 py-3 text-xs font-bold uppercase tracking-wider hover:bg-emerald-600 transition-colors rounded-lg shadow-sm flex items-center justify-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Administrador</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="bg-white border border-gray-100 p-4 rounded-xl shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Total Usuarios</p>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black text-gray-900">{stats.total}</span>
            <span className="text-xs font-bold text-gray-500">Registrados</span>
          </div>
        </div>

        <div className="bg-white border border-gray-100 p-4 rounded-xl shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-wider text-blue-600">Admin Sede</p>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black text-blue-600">{stats.storeAdmins}</span>
            <span className="text-xs font-bold text-gray-400">Puntos físicos</span>
          </div>
        </div>

        <div className="bg-white border border-gray-100 p-4 rounded-xl shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-wider text-purple-600">Admin Global</p>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black text-purple-600">{stats.globalAdmins}</span>
            <span className="text-xs font-bold text-gray-400">Superadmins</span>
          </div>
        </div>

        <div className="bg-emerald-50/60 border border-emerald-100 p-4 rounded-xl shadow-sm">
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">Activos</p>
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black text-emerald-700">{stats.active}</span>
            <span className="text-xs font-bold text-emerald-600">Habilitados</span>
          </div>
        </div>

        <div className="bg-amber-50/60 border border-amber-100 p-4 rounded-xl shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-wider text-amber-800">Inactivos</p>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black text-amber-700">{stats.inactive}</span>
            <span className="text-xs font-bold text-amber-600">Pausados</span>
          </div>
        </div>

        <div className="bg-rose-50/60 border border-rose-100 p-4 rounded-xl shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-wider text-rose-800">Suspendidos</p>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black text-rose-700">{stats.suspended}</span>
            <span className="text-xs font-bold text-rose-600">Bloqueados</span>
          </div>
        </div>
      </div>

      {/* Barra de Filtros */}
      <div className="bg-white border border-gray-100 p-4 rounded-xl shadow-sm space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Buscador */}
          <div className="relative md:col-span-2">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre, documento, usuario, correo o sede..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-xs sm:text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')} 
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filtro por Rol */}
          <div>
            <select
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value)}
              className="w-full px-3 py-2.5 text-xs sm:text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-black focus:border-black bg-white"
            >
              <option value="ALL">Todos los roles</option>
              <option value="STORE_ADMIN">Administrador de Sede</option>
              <option value="GLOBAL_ADMIN">Administrador Global</option>
              <option value="VENDEDOR">Vendedor / Comercial</option>
            </select>
          </div>

          {/* Filtro por Estado */}
          <div>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2.5 text-xs sm:text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-black focus:border-black bg-white"
            >
              <option value="ALL">Todos los estados</option>
              <option value="ACTIVO">Activos</option>
              <option value="INACTIVO">Inactivos</option>
              <option value="SUSPENDIDO">Suspendidos</option>
            </select>
          </div>
        </div>

        {/* Filtro por Sede específico */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-50 text-xs">
          <span className="text-gray-500 font-bold uppercase tracking-wider text-[11px] mr-1">Filtrar Sede:</span>
          <button
            onClick={() => setStoreFilter('ALL')}
            className={`px-3 py-1 rounded-full font-bold transition-all ${
              storeFilter === 'ALL' ? 'bg-black text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Todas
          </button>
          {stores.map(store => (
            <button
              key={store.id}
              onClick={() => setStoreFilter(store.id)}
              className={`px-3 py-1 rounded-full font-bold transition-all ${
                storeFilter === store.id ? 'bg-black text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {store.name.replace("JUAN'D STORE - ", "").replace("QUALITY STORE - ", "")}
            </button>
          ))}
          {(searchTerm || roleFilter !== 'ALL' || statusFilter !== 'ALL' || storeFilter !== 'ALL') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setRoleFilter('ALL');
                setStatusFilter('ALL');
                setStoreFilter('ALL');
              }}
              className="ml-auto text-xs font-bold text-red-600 hover:underline"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      </div>

      {/* Tabla de Usuarios */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100 text-[11px] font-bold uppercase tracking-wider text-gray-500">
                <th className="px-5 py-3.5">ID / Usuario</th>
                <th className="px-5 py-3.5">Nombre & Documento</th>
                <th className="px-5 py-3.5">Contacto</th>
                <th className="px-5 py-3.5">Rol & Sede Asignada</th>
                <th className="px-5 py-3.5">Estado</th>
                <th className="px-5 py-3.5">Creación / Último Acceso</th>
                <th className="px-5 py-3.5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                    <UserX className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                    <p className="font-bold text-gray-700">No se encontraron usuarios</p>
                    <p className="text-xs text-gray-400 mt-1">Prueba cambiando los filtros de búsqueda o agrega un nuevo usuario.</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const currentStatus = (user.status || (user.isActive ? 'ACTIVO' : 'INACTIVO')) as UserStatus;
                  const statusInfo = STATUS_CONFIG[currentStatus] || STATUS_CONFIG.ACTIVO;
                  const StatusIcon = statusInfo.icon;
                  const isStoreAdmin = user.role?.name === 'STORE_ADMIN';
                  const isGlobalAdmin = user.role?.name === 'GLOBAL_ADMIN';

                  return (
                    <tr key={user.id} className="hover:bg-gray-50/70 transition-colors">
                      {/* ID & Username */}
                      <td className="px-5 py-4">
                        <div className="flex items-center space-x-3">
                          <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-black text-xs ${
                            isGlobalAdmin ? 'bg-purple-100 text-purple-700' : 'bg-gray-900 text-white'
                          }`}>
                            {user.name ? user.name.slice(0, 2).toUpperCase() : 'US'}
                          </div>
                          <div>
                            <div className="font-mono text-xs font-bold text-gray-900 bg-gray-100 px-1.5 py-0.5 rounded inline-block">
                              {user.id}
                            </div>
                            <div className="text-xs text-gray-500 font-medium mt-0.5">
                              @{user.username || user.email?.split('@')[0]}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Nombre & Documento */}
                      <td className="px-5 py-4">
                        <div className="font-bold text-gray-900 text-sm">{user.name}</div>
                        <div className="text-xs text-gray-500 flex items-center space-x-1.5 mt-0.5">
                          <span className="font-semibold text-gray-700">
                            {user.documentType || 'CC'}:
                          </span>
                          <span>{user.documentNumber || 'Sin registrar'}</span>
                        </div>
                      </td>

                      {/* Contacto */}
                      <td className="px-5 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-1.5 text-xs text-gray-700 font-medium">
                            <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                            <span className="truncate max-w-[180px]">{user.email}</span>
                          </div>
                          {user.phone ? (
                            <a
                              href={`https://wa.me/57${user.phone.replace(/[^0-9]/g, '')}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center space-x-1.5 text-xs text-emerald-700 hover:text-emerald-900 font-medium hover:underline"
                              title="Contactar por WhatsApp"
                            >
                              <Phone className="w-3 h-3 text-emerald-600 shrink-0" />
                              <span>{user.phone}</span>
                            </a>
                          ) : (
                            <span className="text-[11px] text-gray-400">Sin teléfono</span>
                          )}
                        </div>
                      </td>

                      {/* Rol & Sede */}
                      <td className="px-5 py-4">
                        <div className="space-y-1">
                          <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-black uppercase tracking-wider rounded ${
                            isGlobalAdmin
                              ? 'bg-purple-100 text-purple-800 border border-purple-200'
                              : 'bg-blue-50 text-blue-800 border border-blue-200'
                          }`}>
                            {isGlobalAdmin ? 'Administrador Global' : 'Administrador de Sede'}
                          </span>
                          <div className="text-xs font-semibold text-gray-800 flex items-start space-x-1">
                            <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                            <span className="line-clamp-1">
                              {isGlobalAdmin ? 'Todas las sedes' : getStoreNames(user.storeIds)}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Estado */}
                      <td className="px-5 py-4">
                        <div className="flex flex-col space-y-1.5">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${statusInfo.bg} ${statusInfo.text} ${statusInfo.border} w-fit`}>
                            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${statusInfo.dot}`}></span>
                            {statusInfo.label}
                          </span>
                          
                          {/* Selector rápido de estado */}
                          <div className="flex items-center space-x-1 text-[10px] text-gray-400">
                            {currentStatus !== 'ACTIVO' && (
                              <button
                                onClick={() => handleQuickStatusChange(user, 'ACTIVO')}
                                className="text-emerald-700 hover:underline font-bold"
                              >
                                Activar
                              </button>
                            )}
                            {currentStatus !== 'INACTIVO' && (
                              <>
                                {currentStatus !== 'ACTIVO' && <span>•</span>}
                                <button
                                  onClick={() => handleQuickStatusChange(user, 'INACTIVO')}
                                  className="text-amber-700 hover:underline font-bold"
                                >
                                  Pausar
                                </button>
                              </>
                            )}
                            {currentStatus !== 'SUSPENDIDO' && (
                              <>
                                <span>•</span>
                                <button
                                  onClick={() => handleQuickStatusChange(user, 'SUSPENDIDO')}
                                  className="text-rose-600 hover:underline font-bold"
                                >
                                  Suspender
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Auditoría: Creado y Último Acceso */}
                      <td className="px-5 py-4 text-xs text-gray-600">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-1.5 text-gray-700 font-medium">
                            <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                            <span>{formatDateTime(user.lastLogin)}</span>
                          </div>
                          <div className="text-[11px] text-gray-400 flex items-center space-x-1">
                            <Calendar className="w-3 h-3 text-gray-300 shrink-0" />
                            <span>Alta: {formatDateTime(user.createdAt)}</span>
                          </div>
                        </div>
                      </td>

                      {/* Acciones */}
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            onClick={() => openDetailModal(user)}
                            className="p-1.5 text-gray-500 hover:text-black hover:bg-gray-100 rounded transition-colors"
                            title="Ver ficha completa"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openModal(user)}
                            className="p-1.5 text-gray-500 hover:text-black hover:bg-gray-100 rounded transition-colors"
                            title="Editar usuario"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(user)}
                            className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                            title="Eliminar usuario"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: Crear / Editar Usuario con los 13 campos */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden my-8 border border-gray-100">
            {/* Header Modal */}
            <div className="bg-gray-900 text-white px-6 py-4 flex justify-between items-center">
              <div>
                <h2 className="text-base sm:text-lg font-black uppercase tracking-wider flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-emerald-400" />
                  <span>{editingId ? 'Editar Administrador / Usuario' : 'Registrar Nuevo Administrador'}</span>
                </h2>
                <p className="text-xs text-gray-400">
                  {editingId 
                    ? `Modificando credenciales y sede asignada de ${formData.name}`
                    : 'Ingresa los 13 datos requeridos para la ficha del administrador de sede.'}
                </p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
              
              {/* ID de Usuario (automático) */}
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Hash className="w-4 h-4 text-gray-500" />
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600">
                      1. ID de Usuario (Generado automáticamente)
                    </label>
                    <span className="font-mono font-bold text-sm text-gray-900">{formData.id}</span>
                  </div>
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                  Sistema Auto-ID
                </span>
              </div>

              {/* SECCIÓN: Identificación Personal */}
              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-gray-500 border-b border-gray-100 pb-1">
                  Datos de Identificación del Administrador
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Nombre completo */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                      2. Nombre Completo (Nombres y apellidos) *
                    </label>
                    <input 
                      type="text" 
                      required 
                      placeholder="Ej. Yeferson Alexis Muñoz"
                      value={formData.name} 
                      onChange={e => setFormData({ ...formData, name: e.target.value })} 
                      className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black" 
                    />
                  </div>

                  {/* Tipo de Documento */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                      3. Tipo de Documento *
                    </label>
                    <select
                      value={formData.documentType}
                      onChange={e => setFormData({ ...formData, documentType: e.target.value as DocumentType })}
                      className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black bg-white"
                    >
                      {DOCUMENT_TYPES.map(doc => (
                        <option key={doc.value} value={doc.value}>{doc.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Número de Documento */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                      4. Número de Documento *
                    </label>
                    <input 
                      type="text" 
                      required 
                      placeholder="Ej. 1144098234"
                      value={formData.documentNumber} 
                      onChange={e => setFormData({ ...formData, documentNumber: e.target.value })} 
                      className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black" 
                    />
                  </div>
                </div>
              </div>

              {/* SECCIÓN: Contacto */}
              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-gray-500 border-b border-gray-100 pb-1">
                  Datos de Contacto
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Celular */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                      5. Celular / Teléfono de contacto *
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input 
                        type="tel" 
                        required 
                        placeholder="Ej. 3157891234"
                        value={formData.phone} 
                        onChange={e => setFormData({ ...formData, phone: e.target.value })} 
                        className="w-full pl-9 pr-3.5 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black" 
                      />
                    </div>
                  </div>

                  {/* Correo Electrónico */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                      6. Correo Electrónico (Personal o corporativo) *
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input 
                        type="email" 
                        required 
                        placeholder="ejemplo@juandstore.com"
                        value={formData.email} 
                        onChange={e => setFormData({ ...formData, email: e.target.value })} 
                        className="w-full pl-9 pr-3.5 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black" 
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* SECCIÓN: Credenciales de Inicio de Sesión */}
              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-gray-500 border-b border-gray-100 pb-1">
                  Credenciales de Acceso al Sistema
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Usuario */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs font-bold uppercase tracking-wider text-gray-700">
                        7. Usuario (Para login) *
                      </label>
                      <button
                        type="button"
                        onClick={suggestUsername}
                        className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>Sugerir</span>
                      </button>
                    </div>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">@</span>
                      <input 
                        type="text" 
                        required 
                        placeholder="admin.republica"
                        value={formData.username} 
                        onChange={e => setFormData({ ...formData, username: e.target.value })} 
                        className="w-full pl-8 pr-3.5 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black" 
                      />
                    </div>
                  </div>

                  {/* Contraseña */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs font-bold uppercase tracking-wider text-gray-700">
                        8. Contraseña *
                      </label>
                      <button
                        type="button"
                        onClick={generateSecurePassword}
                        className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 flex items-center space-x-1"
                      >
                        <Lock className="w-3 h-3" />
                        <span>Generar segura</span>
                      </button>
                    </div>
                    <div className="relative">
                      <input 
                        type={showPassword ? "text" : "password"} 
                        required={!editingId} 
                        placeholder={editingId ? "Dejar en blanco para conservar actual" : "Contraseña segura"}
                        value={formData.password} 
                        onChange={e => setFormData({ ...formData, password: e.target.value })} 
                        className="w-full pl-3.5 pr-10 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black" 
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {editingId && (
                      <p className="text-[10px] text-gray-400 mt-1">
                        Solo escribe aquí si deseas cambiar la contraseña del usuario.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* SECCIÓN: Rol y Sede Asignada */}
              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-gray-500 border-b border-gray-100 pb-1">
                  Rol y Asignación de Sede
                </h3>

                <div className="space-y-3">
                  {/* Rol */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                      9. Rol del Usuario *
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {ROLES.slice(0, 2).map(r => (
                        <label
                          key={r.value}
                          className={`p-3 rounded-xl border cursor-pointer flex flex-col transition-all ${
                            formData.roleName === r.value 
                              ? 'border-black bg-gray-50 ring-1 ring-black' 
                              : 'border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs uppercase tracking-wider text-gray-900">{r.label}</span>
                            <input
                              type="radio"
                              name="roleSelection"
                              value={r.value}
                              checked={formData.roleName === r.value}
                              onChange={() => setFormData({ ...formData, roleName: r.value })}
                              className="text-black focus:ring-black"
                            />
                          </div>
                          <p className="text-[11px] text-gray-500 mt-1">{r.desc}</p>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Sede Asignada */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                      10. Sede Asignada (República, Villa Colombia, Ciudad Modelo, Mariano Ramos) *
                    </label>
                    
                    {formData.roleName === 'GLOBAL_ADMIN' ? (
                      <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl flex items-center space-x-2 text-purple-900">
                        <Shield className="w-4 h-4 text-purple-600 shrink-0" />
                        <span className="text-xs font-bold">
                          Como Administrador Global, este usuario tiene acceso irrestricto a todas las sedes del sistema.
                        </span>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {stores.map(store => {
                            const isSelected = formData.storeIds.includes(store.id);
                            return (
                              <div
                                key={store.id}
                                onClick={() => handleStoreToggle(store.id)}
                                className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                                  isSelected 
                                    ? 'border-emerald-600 bg-emerald-50/50 ring-1 ring-emerald-600' 
                                    : 'border-gray-200 hover:bg-gray-50'
                                }`}
                              >
                                <div className="flex items-center space-x-2.5">
                                  <MapPin className={`w-4 h-4 ${isSelected ? 'text-emerald-700' : 'text-gray-400'}`} />
                                  <div>
                                    <div className="text-xs font-bold text-gray-900">{formatStoreName(store)}</div>
                                    <div className="text-[10px] text-gray-500">{store.address || 'Sede física en Cali'}</div>
                                  </div>
                                </div>
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => {}} // Manejado por onClick del contenedor
                                  className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                                />
                              </div>
                            );
                          })}
                        </div>
                        {stores.length === 0 && (
                          <p className="text-xs text-gray-500 italic">Cargando sedes de Juan'D Store...</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* SECCIÓN: Estado del Usuario */}
              <div className="space-y-3">
                <h3 className="text-xs font-black uppercase tracking-widest text-gray-500 border-b border-gray-100 pb-1">
                  11. Estado del Administrador (Activo, Inactivo o Suspendido) *
                </h3>

                <div className="grid grid-cols-3 gap-3">
                  {(['ACTIVO', 'INACTIVO', 'SUSPENDIDO'] as UserStatus[]).map((st) => {
                    const info = STATUS_CONFIG[st];
                    const isSelected = formData.status === st;
                    return (
                      <label
                        key={st}
                        className={`p-3 rounded-xl border cursor-pointer flex flex-col items-center justify-center text-center transition-all ${
                          isSelected
                            ? `${info.bg} ${info.border} ring-2 ring-black`
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="statusRadio"
                          value={st}
                          checked={isSelected}
                          onChange={() => setFormData({ ...formData, status: st })}
                          className="sr-only"
                        />
                        <span className={`w-2 h-2 rounded-full mb-1.5 ${info.dot}`}></span>
                        <span className={`text-xs font-bold ${isSelected ? info.text : 'text-gray-700'}`}>
                          {info.label}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* SECCIÓN: Auditoría (Creación y Último Acceso) */}
              <div className="bg-gray-50 rounded-xl p-3 border border-gray-200 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-gray-600">
                <div>
                  <span className="block font-bold text-gray-500 text-[10px] uppercase">
                    12. Fecha de Creación
                  </span>
                  <span className="font-medium text-gray-800">
                    {editingId ? formatDateTime(formData.createdAt) : 'Se registrará automáticamente al guardar'}
                  </span>
                </div>
                <div>
                  <span className="block font-bold text-gray-500 text-[10px] uppercase">
                    13. Último Acceso al Sistema
                  </span>
                  <span className="font-medium text-gray-800">
                    {formatDateTime(formData.lastLogin)}
                  </span>
                </div>
              </div>

              {/* Botones de acción del Modal */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-100">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  className="px-5 py-2.5 border border-gray-300 text-xs font-bold uppercase tracking-wider text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={loading} 
                  className="bg-black text-white px-6 py-2.5 text-xs font-bold uppercase tracking-wider hover:bg-emerald-600 disabled:opacity-50 rounded-lg transition-colors shadow-sm flex items-center space-x-2"
                >
                  {loading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingId ? 'Guardar Cambios' : 'Registrar Administrador'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Ficha Detallada del Administrador (Visualización Completa de los 13 campos) */}
      {isDetailModalOpen && selectedUserDetail && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden border border-gray-100 my-8">
            {/* Header Ficha */}
            <div className="bg-gradient-to-r from-gray-900 via-black to-gray-900 text-white p-6 relative">
              <button 
                onClick={() => setIsDetailModalOpen(false)} 
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-400 flex items-center justify-center text-xl font-black">
                  {selectedUserDetail.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-white/10 text-emerald-300">
                      {selectedUserDetail.id}
                    </span>
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                      selectedUserDetail.role?.name === 'GLOBAL_ADMIN' ? 'bg-purple-500 text-white' : 'bg-blue-600 text-white'
                    }`}>
                      {selectedUserDetail.role?.name === 'GLOBAL_ADMIN' ? 'Admin Global' : 'Admin de Sede'}
                    </span>
                  </div>
                  <h2 className="text-xl font-black mt-1 text-white">{selectedUserDetail.name}</h2>
                  <p className="text-xs text-gray-300">@{selectedUserDetail.username || selectedUserDetail.email?.split('@')[0]}</p>
                </div>
              </div>
            </div>

            {/* Contenido con los 13 campos estructurados */}
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="text-xs font-bold uppercase tracking-widest text-gray-400">
                Ficha Técnica del Administrador de Sede
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* 1. ID */}
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <span className="block text-gray-500 text-[10px] font-bold uppercase">1. ID de Usuario</span>
                  <div className="flex items-center justify-between mt-0.5">
                    <span className="font-mono font-bold text-gray-900">{selectedUserDetail.id}</span>
                    <button onClick={() => copyToClipboard(selectedUserDetail.id, 'ID')} className="text-gray-400 hover:text-black">
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* 2. Nombre */}
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <span className="block text-gray-500 text-[10px] font-bold uppercase">2. Nombre Completo</span>
                  <span className="font-bold text-gray-900 mt-0.5 block">{selectedUserDetail.name}</span>
                </div>

                {/* 3 & 4. Documento */}
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <span className="block text-gray-500 text-[10px] font-bold uppercase">3 & 4. Identificación</span>
                  <span className="font-bold text-gray-900 mt-0.5 block">
                    {selectedUserDetail.documentType || 'CC'} {selectedUserDetail.documentNumber || 'No registrado'}
                  </span>
                </div>

                {/* 5. Celular */}
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <span className="block text-gray-500 text-[10px] font-bold uppercase">5. Celular / Teléfono</span>
                  {selectedUserDetail.phone ? (
                    <a 
                      href={`https://wa.me/57${selectedUserDetail.phone.replace(/[^0-9]/g, '')}`} 
                      target="_blank" 
                      rel="noreferrer"
                      className="font-bold text-emerald-700 hover:underline flex items-center space-x-1 mt-0.5"
                    >
                      <span>{selectedUserDetail.phone}</span>
                      <Phone className="w-3 h-3" />
                    </a>
                  ) : (
                    <span className="text-gray-400 mt-0.5 block">Sin registrar</span>
                  )}
                </div>

                {/* 6. Correo */}
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 sm:col-span-2">
                  <span className="block text-gray-500 text-[10px] font-bold uppercase">6. Correo Electrónico</span>
                  <div className="flex items-center justify-between mt-0.5">
                    <span className="font-medium text-gray-900">{selectedUserDetail.email}</span>
                    <button onClick={() => copyToClipboard(selectedUserDetail.email || '', 'Correo')} className="text-gray-400 hover:text-black">
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* 7. Usuario */}
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <span className="block text-gray-500 text-[10px] font-bold uppercase">7. Usuario (Login)</span>
                  <span className="font-mono font-bold text-gray-900 mt-0.5 block">
                    @{selectedUserDetail.username || selectedUserDetail.email?.split('@')[0]}
                  </span>
                </div>

                {/* 8. Contraseña */}
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <span className="block text-gray-500 text-[10px] font-bold uppercase">8. Contraseña</span>
                  <span className="font-mono text-gray-500 mt-0.5 block">•••••••• (Protegida)</span>
                </div>

                {/* 9. Rol */}
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <span className="block text-gray-500 text-[10px] font-bold uppercase">9. Rol</span>
                  <span className="font-bold text-gray-900 mt-0.5 block">
                    {selectedUserDetail.role?.name === 'GLOBAL_ADMIN' ? 'Administrador Global' : 'Administrador de Sede'}
                  </span>
                </div>

                {/* 10. Sede Asignada */}
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <span className="block text-gray-500 text-[10px] font-bold uppercase">10. Sede Asignada</span>
                  <span className="font-bold text-emerald-800 mt-0.5 block flex items-center space-x-1">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    <span>{selectedUserDetail.role?.name === 'GLOBAL_ADMIN' ? 'Todas las sedes' : getStoreNames(selectedUserDetail.storeIds)}</span>
                  </span>
                </div>

                {/* 11. Estado */}
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 sm:col-span-2">
                  <span className="block text-gray-500 text-[10px] font-bold uppercase">11. Estado del Administrador</span>
                  <div className="mt-1">
                    {(() => {
                      const st = (selectedUserDetail.status || (selectedUserDetail.isActive ? 'ACTIVO' : 'INACTIVO')) as UserStatus;
                      const cfg = STATUS_CONFIG[st];
                      return (
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                          <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${cfg.dot}`}></span>
                          {cfg.label} - {st === 'ACTIVO' ? 'Acceso habilitado' : st === 'INACTIVO' ? 'Acceso pausado' : 'Acceso suspendido'}
                        </span>
                      );
                    })()}
                  </div>
                </div>

                {/* 12. Creación */}
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <span className="block text-gray-500 text-[10px] font-bold uppercase">12. Fecha de Creación</span>
                  <span className="font-medium text-gray-800 mt-0.5 block">
                    {formatDateTime(selectedUserDetail.createdAt)}
                  </span>
                </div>

                {/* 13. Último Acceso */}
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <span className="block text-gray-500 text-[10px] font-bold uppercase">13. Último Acceso</span>
                  <span className="font-medium text-gray-800 mt-0.5 block">
                    {formatDateTime(selectedUserDetail.lastLogin)}
                  </span>
                </div>
              </div>

              {/* Botón de acción */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsDetailModalOpen(false);
                    openModal(selectedUserDetail);
                  }}
                  className="bg-black text-white px-5 py-2 text-xs font-bold uppercase tracking-wider hover:bg-emerald-600 rounded-lg transition-colors flex items-center space-x-1.5"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Editar este usuario</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsDetailModalOpen(false)}
                  className="px-5 py-2 border border-gray-300 text-xs font-bold uppercase tracking-wider text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
