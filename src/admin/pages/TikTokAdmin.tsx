import React, { useState, useEffect, useMemo } from 'react';
import { 
  Play, 
  Eye, 
  Heart, 
  MessageCircle, 
  Share2, 
  Calendar, 
  Clock, 
  Link as LinkIcon, 
  BarChart3, 
  ExternalLink, 
  RefreshCw, 
  Search, 
  Download, 
  Check, 
  X, 
  Plus, 
  Store as StoreIcon, 
  AlertCircle, 
  CheckCircle2, 
  Lock, 
  Bell, 
  User, 
  Video as VideoIcon, 
  FileText,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Unlink,
  Sparkles,
  Trash2
} from 'lucide-react';
import { TikTokService, StoreService } from '../../services/api';
import { 
  TikTokAccountStatus, 
  TikTokVideo, 
  TikTokScheduledVideo, 
  TikTokWeeklySchedule, 
  TikTokSummary,
  Store 
} from '../../types';
import Swal from 'sweetalert2';

// Custom TikTok musical note SVG
function TikTokLogoIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .58.04.86.12V9.32a6.34 6.34 0 0 0-.86-.06 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V9.45a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.88z"/>
    </svg>
  );
}

export default function TikTokAdmin() {
  const [activeTab, setActiveTab] = useState<'resumen' | 'cuentas' | 'programacion' | 'historial'>('cuentas');
  
  // Data states (100% dynamic from DB)
  const [accounts, setAccounts] = useState<TikTokAccountStatus[]>([]);
  const [summary, setSummary] = useState<TikTokSummary | null>(null);
  const [schedule, setSchedule] = useState<TikTokWeeklySchedule | null>(null);
  const [historyVideos, setHistoryVideos] = useState<TikTokVideo[]>([]);
  const [historyTotal, setHistoryTotal] = useState(0);
  const [historyMetrics, setHistoryMetrics] = useState({ views: 0, likes: 0, comments: 0, shares: 0 });
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedSedeFilter, setSelectedSedeFilter] = useState('TODAS');
  const [summaryPeriod, setSummaryPeriod] = useState('ESTA_SEMANA');
  const [scheduleViewMode, setScheduleViewMode] = useState<'semanal' | 'lista'>('semanal');
  const [historyDateFrom, setHistoryDateFrom] = useState('');
  const [historyDateTo, setHistoryDateTo] = useState('');
  const [historyContentType, setHistoryContentType] = useState('TODOS');
  const [historySearch, setHistorySearch] = useState('');
  const [historyPage, setHistoryPage] = useState(0);

  // Check if current sede filter has a connected TikTok account
  const isSedeLinked = useMemo(() => {
    if (selectedSedeFilter === 'TODAS') {
      return accounts.some(a => a.connected);
    }
    return accounts.some(a => (a.sedeName?.toLowerCase() === selectedSedeFilter.toLowerCase()) && a.connected);
  }, [selectedSedeFilter, accounts]);

  // Link Modal States
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkStep, setLinkStep] = useState<1 | 2 | 3>(1);
  const [linkSubStep, setLinkSubStep] = useState<'login' | 'authorize' | 'success'>('login');
  const [selectedLinkSede, setSelectedLinkSede] = useState<string>('');
  const [customUsername, setCustomUsername] = useState('');
  const [linkingAccountData, setLinkingAccountData] = useState<{
    sedeName: string;
    username: string;
    displayName: string;
    accountId: string;
    avatarUrl: string;
    connectedAt: string;
  } | null>(null);

  // OAuth Config State
  const [oauthConfig, setOAuthConfig] = useState<{
    configured: boolean;
    clientKey: string | null;
    redirectUri: string;
    scopes: string[];
    requiredCredentials: Record<string, string>;
  } | null>(null);

  // Add Scheduled Video Modal State
  const [isAddScheduleModalOpen, setIsAddScheduleModalOpen] = useState(false);
  const [newSchedule, setNewSchedule] = useState({
    sedeName: '',
    title: '',
    scheduledAt: '',
    duration: '0:24',
    topic: 'Colección',
    thumbnailUrl: 'https://pub-63cfe435c9854d2e85c789dd3e2f6e52.r2.dev/sedes/1_3f46edff.jpg',
    notes: ''
  });

  // Note Modal
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [noteTargetDate, setNoteTargetDate] = useState('');
  const [noteContent, setNoteContent] = useState('');

  // Video Preview Modal
  const [previewVideo, setPreviewVideo] = useState<TikTokVideo | null>(null);

  // Load initial data and OAuth configuration
  useEffect(() => {
    loadAllData();
    loadOAuthConfig();

    // Check for OAuth 2.0 callback code and state in URL
    const query = new URLSearchParams(window.location.search);
    const code = query.get('code');
    const state = query.get('state');
    if (code) {
      handleOAuthCodeReturn(code, state || '');
    }
  }, []);

  // Reload when filters change
  useEffect(() => {
    if (activeTab === 'resumen') loadSummary();
    if (activeTab === 'programacion') loadSchedule();
    if (activeTab === 'historial') loadHistory();
  }, [activeTab, selectedSedeFilter, summaryPeriod, historyDateFrom, historyDateTo, historyContentType, historySearch, historyPage]);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [accs, sts] = await Promise.all([
        TikTokService.getAccounts().catch(() => []),
        StoreService.getStores().catch(() => [])
      ]);
      setAccounts(accs);
      setStores(sts);
      if (sts.length > 0 && !selectedLinkSede) {
        setSelectedLinkSede(sts[0].barrio || sts[0].name);
      }
      await Promise.all([loadSummary(), loadSchedule(), loadHistory()]);
    } catch (err) {
      console.error('Error cargando módulo TikTok:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadAccounts = async () => {
    try {
      const accs = await TikTokService.getAccounts();
      setAccounts(accs);
    } catch (err) {
      console.error('Error cargando cuentas:', err);
    }
  };

  const loadSummary = async () => {
    try {
      const sum = await TikTokService.getSummary(selectedSedeFilter, summaryPeriod);
      setSummary(sum);
    } catch (err) {
      console.error('Error cargando resumen:', err);
    }
  };

  const loadSchedule = async () => {
    try {
      const sched = await TikTokService.getWeeklySchedule(selectedSedeFilter);
      setSchedule(sched);
    } catch (err) {
      console.error('Error cargando programación semanal:', err);
    }
  };

  const loadHistory = async () => {
    try {
      const res = await TikTokService.getHistory({
        sede: selectedSedeFilter,
        dateFrom: historyDateFrom,
        dateTo: historyDateTo,
        search: historySearch,
        contentType: historyContentType,
        page: historyPage,
        size: 5
      });
      setHistoryVideos(res.videos);
      setHistoryTotal(res.totalVideos);
      setHistoryMetrics({
        views: res.totalViews,
        likes: res.totalLikes,
        comments: res.totalComments,
        shares: res.totalShares
      });
    } catch (err) {
      console.error('Error cargando historial:', err);
    }
  };

  // --- OAuth Operations ---
  const loadOAuthConfig = async () => {
    try {
      const cfg = await TikTokService.getOAuthConfig();
      setOAuthConfig(cfg);
    } catch (e) {
      console.error('Error cargando configuración OAuth:', e);
    }
  };

  const handleOAuthCodeReturn = async (code: string, state: string) => {
    window.history.replaceState({}, document.title, window.location.pathname);
    Swal.fire({
      title: 'Completando autorización con TikTok...',
      text: 'Intercambiando código OAuth 2.0 y sincronizando perfil...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    try {
      const sede = decodeURIComponent(state) || 'Villa Colombia';
      await TikTokService.handleOAuthCallback(code, sede);
      await loadAccounts();
      await loadSummary();
      await loadSchedule();
      await loadHistory();
      Swal.fire({
        icon: 'success',
        title: '¡Cuenta vinculada con éxito!',
        text: `La cuenta de TikTok ha sido vinculada oficialmente mediante OAuth 2.0 a la sede ${sede}.`,
        confirmButtonColor: '#10b981'
      });
    } catch (err: any) {
      Swal.fire({
        icon: 'error',
        title: 'Error de autorización OAuth',
        text: err?.message || 'No se pudo completar el intercambio del código de autorización con TikTok.',
        confirmButtonColor: '#ef4444'
      });
    }
  };

  const handleStartOfficialOAuth = async () => {
    try {
      const { url } = await TikTokService.getAuthorizeUrl(selectedLinkSede);
      window.location.href = url;
    } catch (err: any) {
      Swal.fire({
        icon: 'warning',
        title: 'Configuración requerida',
        text: err?.message || 'Configura TIKTOK_CLIENT_KEY y TIKTOK_CLIENT_SECRET para usar el login oficial de TikTok.',
        confirmButtonColor: '#10b981'
      });
    }
  };

  const handleVerifyAndLinkByHandle = async () => {
    if (!customUsername || !customUsername.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Usuario requerido',
        text: 'Por favor ingresa el nombre de usuario de TikTok (ej. @juand.store).',
        confirmButtonColor: '#10b981'
      });
      return;
    }

    const cleanUsername = customUsername.trim().startsWith('@')
      ? customUsername.trim()
      : `@${customUsername.trim()}`;

    Swal.fire({
      title: 'Validando con TikTok...',
      text: `Consultando los servidores oficiales de TikTok para verificar la cuenta ${cleanUsername}...`,
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    try {
      const result = await TikTokService.validateAccount(cleanUsername);
      Swal.close();
      setCustomUsername(result.username);

      setLinkingAccountData({
        sedeName: selectedLinkSede,
        username: result.username,
        displayName: result.displayName,
        accountId: `73${Math.floor(100000000000 + Math.random() * 900000000000)}`,
        avatarUrl: 'https://pub-63cfe435c9854d2e85c789dd3e2f6e52.r2.dev/sedes/1_3f46edff.jpg',
        connectedAt: new Date().toLocaleString('es-CO', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        })
      });

      setLinkSubStep('authorize');
    } catch (err: any) {
      Swal.fire({
        icon: 'error',
        title: 'Cuenta no encontrada en TikTok',
        text: err?.message || `La cuenta ${cleanUsername} no existe en TikTok. No se puede vincular una cuenta inexistente.`,
        confirmButtonColor: '#ef4444'
      });
    }
  };

  // --- Modal Flow Operations ---
  const openLinkModal = (preselectedSede?: string) => {
    if (preselectedSede) {
      setSelectedLinkSede(preselectedSede);
    } else if (stores.length > 0) {
      setSelectedLinkSede(stores[0].barrio || stores[0].name);
    }
    setLinkStep(1);
    setLinkSubStep('login');
    setCustomUsername('');
    setLinkingAccountData(null);
    setIsLinkModalOpen(true);
  };

  const proceedToStep2 = () => {
    if (!selectedLinkSede) {
      Swal.fire({ icon: 'warning', title: 'Selecciona una sede', text: 'Por favor selecciona la sede que deseas vincular.' });
      return;
    }
    setCustomUsername('');
    setLinkStep(2);
    setLinkSubStep('login');
  };

  // --- Programación Semanal Operations ---
  const openAddScheduleModal = (defaultDate?: string) => {
    const targetDate = defaultDate ? `${defaultDate}T10:00` : new Date().toISOString().slice(0, 16);
    setNewSchedule({
      sedeName: selectedSedeFilter !== 'TODAS' ? selectedSedeFilter : (stores[0]?.barrio || stores[0]?.name || 'Villa Colombia'),
      title: '',
      scheduledAt: targetDate,
      duration: '0:24',
      topic: 'Colección',
      thumbnailUrl: 'https://pub-63cfe435c9854d2e85c789dd3e2f6e52.r2.dev/sedes/1_3f46edff.jpg',
      notes: ''
    });
    setIsAddScheduleModalOpen(true);
  };

  const handleCreateScheduledVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSchedule.title || !newSchedule.title.trim()) {
      Swal.fire({ icon: 'warning', title: 'Título requerido', text: 'Ingresa el título de la publicación.' });
      return;
    }
    if (!newSchedule.scheduledAt) {
      Swal.fire({ icon: 'warning', title: 'Fecha requerida', text: 'Ingresa la fecha y hora de programación.' });
      return;
    }

    try {
      await TikTokService.addScheduledVideo({
        sedeName: newSchedule.sedeName,
        title: newSchedule.title.trim(),
        scheduledAt: newSchedule.scheduledAt,
        duration: newSchedule.duration || '0:24',
        topic: newSchedule.topic || 'Colección',
        thumbnailUrl: newSchedule.thumbnailUrl,
        notes: newSchedule.notes,
        status: 'PROGRAMADO'
      });

      setIsAddScheduleModalOpen(false);
      await loadSchedule();
      Swal.fire({
        icon: 'success',
        title: '¡Publicación programada!',
        text: `La publicación "${newSchedule.title}" se registró en el calendario de la sede ${newSchedule.sedeName}.`,
        confirmButtonColor: '#10b981'
      });
    } catch (err: any) {
      Swal.fire({
        icon: 'error',
        title: 'Error al programar',
        text: err?.message || 'No se pudo guardar la publicación en el servidor.',
        confirmButtonColor: '#ef4444'
      });
    }
  };

  const handleDeleteScheduledVideo = async (id: number, title: string) => {
    const confirm = await Swal.fire({
      title: '¿Eliminar publicación?',
      text: `¿Deseas eliminar la publicación programada "${title}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#ef4444'
    });

    if (confirm.isConfirmed) {
      try {
        await TikTokService.deleteScheduledVideo(id);
        await loadSchedule();
        Swal.fire({
          icon: 'success',
          title: 'Eliminado',
          text: 'La publicación programada ha sido eliminada.',
          confirmButtonColor: '#10b981'
        });
      } catch (err: any) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: err?.message || 'No se pudo eliminar la publicación.'
        });
      }
    }
  };

  const handleOAuthAuthorize = () => {
    if (!linkingAccountData) return;
    setLinkSubStep('success');
  };

  const proceedToStep3 = () => {
    setLinkStep(3);
  };

  const handleFinalizeConnection = async () => {
    if (!linkingAccountData) return;
    try {
      const storeMatch = stores.find(s => (s.barrio || s.name) === linkingAccountData.sedeName);
      await TikTokService.linkAccount({
        sedeId: storeMatch?.id ? Number(storeMatch.id) : undefined,
        sedeName: linkingAccountData.sedeName,
        username: linkingAccountData.username,
        displayName: linkingAccountData.displayName,
        accountId: linkingAccountData.accountId,
        avatarUrl: linkingAccountData.avatarUrl,
        accessToken: `act_${Date.now()}_tiktok_oauth`
      });

      await loadAccounts();
      await loadSummary();
      await loadSchedule();
      await loadHistory();

      setIsLinkModalOpen(false);
      Swal.fire({
        icon: 'success',
        title: '¡Cuenta vinculada exitosamente!',
        text: `La cuenta de TikTok para la sede ${linkingAccountData.sedeName} ha sido vinculada en la base de datos.`,
        confirmButtonColor: '#10b981'
      });
    } catch (err: any) {
      Swal.fire({
        icon: 'error',
        title: 'Error al vincular',
        text: err?.message || 'No se pudo guardar la vinculación en el servidor.',
        confirmButtonColor: '#ef4444'
      });
    }
  };

  const handleDisconnect = async (accountId: number, sedeName: string) => {
    const res = await Swal.fire({
      title: '¿Desconectar cuenta?',
      text: `Se desvinculará la cuenta de TikTok de la sede ${sedeName}.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, desconectar',
      cancelButtonText: 'Cancelar'
    });
    if (res.isConfirmed) {
      try {
        await TikTokService.disconnectAccount(accountId);
        await loadAccounts();
        await loadSummary();
        await loadSchedule();
        await loadHistory();
        Swal.fire({ icon: 'success', title: 'Desconectada', text: 'La cuenta ha sido desvinculada.', confirmButtonColor: '#10b981' });
      } catch {
        Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo desvincular la cuenta.', confirmButtonColor: '#ef4444' });
      }
    }
  };

  // --- Day Note Save ---
  const openNoteModal = (dateStr: string, currentNote?: string) => {
    setNoteTargetDate(dateStr);
    setNoteContent(currentNote || '');
    setIsNoteModalOpen(true);
  };

  const handleSaveNote = async () => {
    if (!selectedSedeFilter || selectedSedeFilter === 'TODAS') {
      Swal.fire({ icon: 'warning', title: 'Selecciona una sede', text: 'Para asignar una nota diaria, selecciona una sede específica en el filtro superior.' });
      return;
    }
    try {
      await TikTokService.saveDayNote({
        sedeName: selectedSedeFilter,
        date: noteTargetDate,
        note: noteContent
      });
      setIsNoteModalOpen(false);
      await loadSchedule();
      Swal.fire({ icon: 'success', title: 'Nota guardada', timer: 1200, showConfirmButton: false });
    } catch {
      Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo guardar la nota.' });
    }
  };

  // --- Export CSV ---
  const exportHistoryCSV = () => {
    if (historyVideos.length === 0) {
      Swal.fire({ icon: 'info', title: 'Sin publicaciones', text: 'No hay videos en el historial para exportar.' });
      return;
    }
    const headers = ['Video', 'Sede', 'Fecha', 'Visualizaciones', 'Me gusta', 'Comentarios', 'Compartidos'];
    const rows = historyVideos.map(v => [
      `"${v.title.replace(/"/g, '""')}"`,
      `"${v.sedeName}"`,
      `"${v.publishedAt}"`,
      v.viewCount,
      v.likeCount,
      v.commentCount,
      v.shareCount
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `reporte_tiktok_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Format numbers (e.g. 312480 -> "312.480")
  const formatNum = (val?: number) => {
    if (val === undefined || val === null) return '0';
    return val.toLocaleString('es-CO');
  };

  return (
    <div className="min-h-screen bg-gray-50/60 pb-24">
      {/* Top Header Bar Matching Screenshots */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center font-bold shadow-xs">
              <TikTokLogoIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                CONTROL TIKTOK
              </h1>
              <p className="text-xs text-gray-500">
                {activeTab === 'resumen' && 'Supervisión de contenido por sede • Solo lectura'}
                {activeTab === 'cuentas' && 'Supervisión de cuentas • Solo lectura'}
                {activeTab === 'programacion' && 'Supervisión de contenido por sede • Solo lectura'}
                {activeTab === 'historial' && 'Supervisión de contenido por sede • Solo lectura'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3.5 py-1.5 bg-gray-100 border border-gray-200 text-gray-700 text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-2xs">
              <Lock className="w-3.5 h-3.5 text-gray-500" />
              Administrador Global
            </div>
            <div className="relative p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 cursor-pointer">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span>
            </div>
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-700">
              <User className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* 4 Tabs Matching Screenshots */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-1 overflow-x-auto border-t border-gray-100 py-2 scrollbar-none">
          {[
            { id: 'resumen', label: 'Resumen', icon: BarChart3 },
            { id: 'cuentas', label: 'Cuentas vinculadas', icon: LinkIcon },
            { id: 'programacion', label: 'Programación semanal', icon: Calendar },
            { id: 'historial', label: 'Historial', icon: Clock }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-6">

        {/* ========================================================================= */}
        {/* TAB 1: CUENTAS VINCULADAS (Images 1 & 3) */}
        {/* ========================================================================= */}
        {activeTab === 'cuentas' && (
          <div className="space-y-6">
            {/* Header Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <LinkIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-extrabold text-gray-900">Cuentas de TikTok por sede</h2>
                    <p className="text-xs text-gray-500">Conecta y administra las cuentas oficiales de cada sede.</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => openLinkModal()}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  Vincular cuenta
                </button>
              </div>

              {/* Sedes Table / List */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 text-gray-400 uppercase text-[10px] tracking-wider border-y border-gray-100">
                    <tr>
                      <th className="py-3 px-4">Sede</th>
                      <th className="py-3 px-4">Cuenta vinculada</th>
                      <th className="py-3 px-4">Estado</th>
                      <th className="py-3 px-4 text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-700">
                    {accounts.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-gray-400">
                          No se encontraron sedes configuradas.
                        </td>
                      </tr>
                    ) : (
                      accounts.map((acc, idx) => (
                        <tr key={idx} className="hover:bg-gray-50/70 transition-colors">
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                                <StoreIcon className="w-4 h-4" />
                              </div>
                              <span className="font-extrabold text-gray-900 text-sm">
                                {acc.sedeName}
                              </span>
                            </div>
                          </td>

                          <td className="py-4 px-4">
                            {acc.connected ? (
                              <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-full bg-black text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                                  <TikTokLogoIcon className="w-3.5 h-3.5" />
                                </div>
                                <div>
                                  <strong className="block text-gray-900">{acc.username}</strong>
                                  <span className="text-[10px] text-gray-400 block">{acc.displayName}</span>
                                </div>
                              </div>
                            ) : (
                              <span className="text-gray-400 italic text-[11px]">Ninguna cuenta vinculada</span>
                            )}
                          </td>

                          <td className="py-4 px-4">
                            {acc.connected ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                Conectada
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-gray-100 text-gray-600">
                                <Unlink className="w-3.5 h-3.5 text-gray-400" />
                                Sin vincular
                              </span>
                            )}
                          </td>

                          <td className="py-4 px-4 text-right">
                            {acc.connected ? (
                              <button
                                type="button"
                                onClick={() => handleDisconnect(acc.accountId!, acc.sedeName)}
                                className="px-3 py-1.5 bg-white hover:bg-red-50 border border-gray-200 hover:border-red-200 text-gray-600 hover:text-red-600 text-xs font-semibold rounded-lg shadow-2xs transition-colors cursor-pointer"
                              >
                                Desconectar
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => openLinkModal(acc.sedeName)}
                                className="px-3.5 py-1.5 bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 text-xs font-bold rounded-lg shadow-2xs flex items-center gap-1.5 ml-auto transition-colors cursor-pointer"
                              >
                                <LinkIcon className="w-3.5 h-3.5 text-gray-500" />
                                Vincular
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bottom Banner: Programación futura notice */}
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-gray-900">Programación futura: No disponible mediante API pública</h4>
                  <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">
                    TikTok no ofrece actualmente un acceso oficial para consultar automáticamente los videos programados en TikTok Studio.
                  </p>
                </div>
              </div>

              <a
                href="https://www.tiktok.com/tiktokstudio"
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 text-xs font-bold rounded-xl shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 self-start sm:self-auto"
              >
                <ExternalLink className="w-3.5 h-3.5 text-gray-500" />
                Consultar en TikTok Studio
              </a>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: RESUMEN (Image 4) */}
        {/* ========================================================================= */}
        {activeTab === 'resumen' && (
          <div className="space-y-6">
            {/* Header + Filters */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-gray-900">Resumen general</h2>
                <p className="text-xs text-gray-500">Rendimiento de videos publicados en TikTok por sede.</p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* Sede selector */}
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-gray-500">Sede:</span>
                  <div className="relative">
                    <select
                      value={selectedSedeFilter}
                      onChange={e => setSelectedSedeFilter(e.target.value)}
                      className="pl-8 pr-4 py-1.5 text-xs font-bold border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    >
                      <option value="TODAS">Todas las sedes</option>
                      {stores.map(s => (
                        <option key={s.id} value={s.barrio || s.name}>{s.barrio || s.name}</option>
                      ))}
                    </select>
                    <StoreIcon className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5 pointer-events-none" />
                  </div>
                </div>

                {/* Period selector */}
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-gray-500">Período de publicación:</span>
                  <div className="relative">
                    <select
                      value={summaryPeriod}
                      onChange={e => setSummaryPeriod(e.target.value)}
                      className="pl-8 pr-4 py-1.5 text-xs font-bold border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    >
                      <option value="ESTA_SEMANA">Esta semana</option>
                      <option value="ESTE_MES">Este mes</option>
                      <option value="ULTIMOS_30_DIAS">Últimos 30 días</option>
                      <option value="HISTORICO">Todo el histórico</option>
                    </select>
                    <Calendar className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

            {/* 5 Metric Cards Matching Image 4 */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <Play className="w-5 h-5 fill-emerald-600 text-emerald-600" />
                </div>
                <div>
                  <span className="text-xl font-black text-gray-900 block">
                    {formatNum(summary?.videosPublicados || 0)}
                  </span>
                  <span className="text-[11px] text-gray-500 font-semibold block">Videos publicados</span>
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <Eye className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xl font-black text-gray-900 block">
                    {formatNum(summary?.visualizacionesAcumuladas || 0)}
                  </span>
                  <span className="text-[11px] text-gray-500 font-semibold block">Visualizaciones acumuladas</span>
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <Heart className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xl font-black text-gray-900 block">
                    {formatNum(summary?.meGusta || 0)}
                  </span>
                  <span className="text-[11px] text-gray-500 font-semibold block">Me gusta</span>
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xl font-black text-gray-900 block">
                    {formatNum(summary?.comentarios || 0)}
                  </span>
                  <span className="text-[11px] text-gray-500 font-semibold block">Comentarios</span>
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <Share2 className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xl font-black text-gray-900 block">
                    {formatNum(summary?.compartidos || 0)}
                  </span>
                  <span className="text-[11px] text-gray-500 font-semibold block">Compartidos</span>
                </div>
              </div>
            </div>

            {/* Visualizations Row (3 Columns: Bar Chart + Donut Chart + Info Card) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              {/* Col 1: Visualizaciones por sede (5 cols) */}
              <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-extrabold text-gray-900">Visualizaciones por sede</h4>
                  <p className="text-[11px] text-gray-400">Comparativo de visualizaciones acumuladas en el período.</p>
                </div>

                <div className="mt-6 space-y-3">
                  {(!summary?.viewsBySede || summary.viewsBySede.length === 0 || summary.visualizacionesAcumuladas === 0) ? (
                    <div className="py-10 text-center text-xs text-gray-400">
                      No hay visualizaciones registradas en este período.
                    </div>
                  ) : (
                    summary.viewsBySede.map((item, idx) => {
                      const maxViews = Math.max(...summary.viewsBySede.map(i => i.views), 1);
                      const barPct = Math.round((item.views / maxViews) * 100);
                      return (
                        <div key={idx} className="space-y-1">
                          <div className="flex items-center justify-between text-xs font-semibold">
                            <span className="text-gray-700">{item.sede}</span>
                            <span className="text-gray-900 font-bold">{formatNum(item.views)}</span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                            <div
                              style={{ width: `${Math.max(4, barPct)}%` }}
                              className="bg-emerald-600 h-full rounded-full transition-all"
                            ></div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Col 2: Distribución de visualizaciones Donut (4 cols) */}
              <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-extrabold text-gray-900">Distribución de visualizaciones</h4>
                  <p className="text-[11px] text-gray-400">Porcentaje de visualizaciones por sede.</p>
                </div>

                <div className="flex items-center gap-4 py-3 my-auto">
                  <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      <circle
                        cx="18"
                        cy="18"
                        r="15.9155"
                        className="text-gray-100"
                        strokeWidth="3.8"
                        stroke="currentColor"
                        fill="none"
                      />
                      {(summary?.visualizacionesAcumuladas || 0) > 0 && (
                        <circle
                          cx="18"
                          cy="18"
                          r="15.9155"
                          className="text-emerald-600"
                          strokeDasharray="75, 100"
                          strokeWidth="3.8"
                          stroke="currentColor"
                          fill="none"
                        />
                      )}
                    </svg>
                    <div className="absolute flex flex-col items-center">
                      <span className="text-sm font-black text-gray-900 text-center leading-tight">
                        {formatNum(summary?.visualizacionesAcumuladas || 0)}
                      </span>
                      <span className="text-[8px] text-gray-400 font-bold uppercase">Visualizaciones</span>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-gray-700">
                    {summary?.viewsBySede && summary.viewsBySede.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${
                          idx === 0 ? 'bg-emerald-700' : idx === 1 ? 'bg-emerald-500' : idx === 2 ? 'bg-emerald-400' : 'bg-emerald-300'
                        }`}></span>
                        <span className="truncate max-w-[110px]">{item.sede}: <strong>{item.percentage}%</strong></span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Col 3: Importante card (3 cols) */}
              <div className="lg:col-span-3 bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs flex flex-col justify-center">
                <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 text-emerald-800 font-extrabold text-xs">
                    <AlertCircle className="w-4 h-4 text-emerald-600" />
                    <span>Importante</span>
                  </div>
                  <p className="text-[11px] text-emerald-950 leading-relaxed">
                    Datos ilustrativos • métricas acumuladas actuales de videos publicados en el período; no son vistas generadas durante el período.
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom Table: Últimos videos publicados */}
            <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-gray-900 flex items-center gap-2">
                    <Play className="w-4 h-4 text-emerald-600" />
                    Últimos videos publicados
                  </h3>
                  <p className="text-[11px] text-gray-400">Videos de la(s) sede(s) seleccionada(s) en el período.</p>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab('historial')}
                  className="text-xs font-bold text-gray-600 hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
                >
                  Ver todos →
                </button>
              </div>

              {(!summary?.recentVideos || summary.recentVideos.length === 0) ? (
                <div className="py-12 text-center text-gray-400 text-xs border-2 border-dashed border-gray-100 rounded-xl">
                  No hay videos publicados registrados para esta consulta.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50 text-gray-400 uppercase text-[10px] tracking-wider border-y border-gray-100">
                      <tr>
                        <th className="py-2.5 px-3">Video</th>
                        <th className="py-2.5 px-3">Sede</th>
                        <th className="py-2.5 px-3">Fecha de publicación</th>
                        <th className="py-2.5 px-3">Visualizaciones</th>
                        <th className="py-2.5 px-3">Me gusta</th>
                        <th className="py-2.5 px-3">Comentarios</th>
                        <th className="py-2.5 px-3">Compartidos</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-gray-700">
                      {summary.recentVideos.map((v) => (
                        <tr key={v.id} className="hover:bg-gray-50/70 transition-colors">
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-3">
                              <div className="relative w-12 h-14 rounded-lg bg-gray-900 overflow-hidden shrink-0">
                                {v.thumbnailUrl ? (
                                  <img src={v.thumbnailUrl} alt={v.title} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-gray-600">
                                    <Play className="w-5 h-5" />
                                  </div>
                                )}
                                <span className="absolute bottom-1 right-1 bg-black/80 text-white text-[8px] font-bold px-1 rounded">
                                  {v.duration || '0:24'}
                                </span>
                              </div>
                              <div>
                                <strong className="block text-gray-900 text-xs">{v.title}</strong>
                                {v.hashtags && (
                                  <span className="text-[10px] text-gray-400 block truncate max-w-[200px]">
                                    {v.hashtags}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-3 font-semibold text-gray-800">{v.sedeName}</td>

                          <td className="py-3 px-3 text-gray-500">
                            {v.publishedAt ? new Date(v.publishedAt).toLocaleDateString('es-CO', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                              hour: 'numeric',
                              minute: '2-digit'
                            }) : 'Reciente'}
                          </td>

                          <td className="py-3 px-3 font-bold text-gray-900">
                            <span className="flex items-center gap-1">
                              <Eye className="w-3.5 h-3.5 text-gray-400" />
                              {formatNum(v.viewCount)}
                            </span>
                          </td>

                          <td className="py-3 px-3 text-gray-700">
                            <span className="flex items-center gap-1">
                              <Heart className="w-3.5 h-3.5 text-gray-400" />
                              {formatNum(v.likeCount)}
                            </span>
                          </td>

                          <td className="py-3 px-3 text-gray-700">
                            <span className="flex items-center gap-1">
                              <MessageCircle className="w-3.5 h-3.5 text-gray-400" />
                              {formatNum(v.commentCount)}
                            </span>
                          </td>

                          <td className="py-3 px-3 text-gray-700">
                            <span className="flex items-center gap-1">
                              <Share2 className="w-3.5 h-3.5 text-gray-400" />
                              {formatNum(v.shareCount)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: PROGRAMACIÓN SEMANAL - TIKTOK STUDIO (Image 5) */}
        {/* ========================================================================= */}
        {activeTab === 'programacion' && (
          <div className="space-y-6">
            {/* Header + Filters */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-gray-900">Programación semanal</h2>
                <p className="text-xs text-gray-500">Consulta la programación de publicaciones por sede en TikTok Studio.</p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* Sede selector */}
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-gray-500">Sede:</span>
                  <div className="relative">
                    <select
                      value={selectedSedeFilter}
                      onChange={e => setSelectedSedeFilter(e.target.value)}
                      className="pl-8 pr-4 py-1.5 text-xs font-bold border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    >
                      <option value="TODAS">Todas las sedes</option>
                      {stores.map(s => (
                        <option key={s.id} value={s.barrio || s.name}>{s.barrio || s.name}</option>
                      ))}
                    </select>
                    <StoreIcon className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5 pointer-events-none" />
                  </div>
                </div>

                {/* Semana */}
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-gray-500">Semana:</span>
                  <div className="relative">
                    <select
                      className="pl-8 pr-4 py-1.5 text-xs font-bold border border-gray-300 rounded-xl bg-white"
                      disabled
                    >
                      <option>{schedule?.weekStart ? `${schedule.weekStart} – ${schedule.weekEnd}` : 'Semana actual'}</option>
                    </select>
                    <Calendar className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5 pointer-events-none" />
                  </div>
                </div>

                {/* View Toggles */}
                <div className="flex items-center bg-gray-100 p-1 rounded-xl border border-gray-200">
                  <button
                    type="button"
                    onClick={() => setScheduleViewMode('semanal')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-all ${
                      scheduleViewMode === 'semanal'
                        ? 'bg-emerald-600 text-white shadow-2xs'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    Vista semanal
                  </button>
                  <button
                    type="button"
                    onClick={() => setScheduleViewMode('lista')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-all ${
                      scheduleViewMode === 'lista'
                        ? 'bg-emerald-600 text-white shadow-2xs'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Vista lista
                  </button>
                </div>

                {/* Programar video button */}
                <button
                  type="button"
                  onClick={() => openAddScheduleModal()}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Programar video
                </button>

                {/* Abrir TikTok Studio button */}
                <a
                  href="https://www.tiktok.com/tiktokstudio"
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-1.5 bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 text-xs font-bold rounded-xl shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-gray-500" />
                  Abrir TikTok Studio
                </a>
              </div>
            </div>

            {/* Banner if Sede is not linked */}
            {!isSedeLinked && (
              <div className="bg-amber-50/90 border border-amber-200 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
                <div className="flex items-start sm:items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                    <Unlink className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-amber-900">
                      {selectedSedeFilter === 'TODAS'
                        ? 'No hay cuentas de TikTok vinculadas en las sedes'
                        : `La sede ${selectedSedeFilter} no tiene una cuenta de TikTok vinculada`}
                    </h3>
                    <p className="text-[11px] text-amber-700 mt-0.5">
                      Las programaciones de TikTok Studio solo se sincronizan y visualizan cuando se vincula una cuenta oficial de TikTok para esta sede.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => openLinkModal(selectedSedeFilter !== 'TODAS' ? selectedSedeFilter : undefined)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-2xs flex items-center gap-1.5 shrink-0 cursor-pointer transition-all"
                >
                  <LinkIcon className="w-3.5 h-3.5" />
                  {selectedSedeFilter !== 'TODAS' ? `Vincular cuenta de ${selectedSedeFilter}` : 'Vincular cuenta'}
                </button>
              </div>
            )}

            {/* 4 Metric Cards Matching Image 5 */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <Play className="w-5 h-5 fill-emerald-600 text-emerald-600" />
                </div>
                <div>
                  <span className="text-2xl font-black text-gray-900 block">
                    {isSedeLinked ? (schedule?.videosProgramados || 0) : 0}
                  </span>
                  <span className="text-[11px] text-gray-500 font-semibold block">Videos programados</span>
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-2xl font-black text-gray-900 block">
                    {isSedeLinked ? (schedule?.diasConContenido || 0) : 0}
                  </span>
                  <span className="text-[11px] text-gray-500 font-semibold block">Días con contenido</span>
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <VideoIcon className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-2xl font-black text-gray-900 block">
                    {isSedeLinked ? (schedule?.promedioDiario?.toLocaleString('es-CO', { minimumFractionDigits: 1 }) || '0,0') : '0,0'}
                  </span>
                  <span className="text-[11px] text-gray-500 font-semibold block">Promedio diario</span>
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-2xl font-black text-gray-900 block">
                    {isSedeLinked ? (schedule?.programacionActiva || 0) : 0}%
                  </span>
                  <span className="text-[11px] text-gray-500 font-semibold block">Programación activa</span>
                </div>
              </div>
            </div>

            {/* Weekly Grid (7 Columns) Matching Image 5 */}
            {scheduleViewMode === 'semanal' ? (
              <div className="grid grid-cols-1 md:grid-cols-7 gap-3 items-start overflow-x-auto pb-4">
                {schedule?.days.map((day, idx) => (
                  <div key={idx} className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden flex flex-col min-w-[150px]">
                    {/* Day Column Header */}
                    <div className="p-3 text-center border-b border-gray-100 bg-gray-50/60">
                      <strong className="block text-xs font-black text-gray-900">{day.dayName}</strong>
                      <span className="text-[10px] text-gray-400">{day.dayNumber} nov</span>
                    </div>

                    {/* Day Scheduled Videos List */}
                    <div className="p-2.5 space-y-2.5 flex-1 min-h-[220px]">
                      {(!isSedeLinked || day.videos.length === 0) ? (
                        <div className="py-8 text-center text-gray-300 text-[11px] flex flex-col items-center justify-center h-full">
                          <span>+ Sin más publicaciones programadas</span>
                        </div>
                      ) : (
                        day.videos.map((vid) => (
                          <div key={vid.id} className="p-2 rounded-xl border border-gray-100 bg-gray-50/50 space-y-1.5 shadow-2xs">
                            <div className="relative w-full h-24 rounded-lg bg-gray-900 overflow-hidden">
                              {vid.thumbnailUrl ? (
                                <img src={vid.thumbnailUrl} alt={vid.title} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-600">
                                  <Play className="w-6 h-6" />
                                </div>
                              )}
                              <span className="absolute bottom-1 right-1 bg-black/80 text-white text-[8px] font-bold px-1 rounded">
                                {vid.duration || '0:24'}
                              </span>
                            </div>

                            <div>
                              <div className="flex items-center gap-1 text-[10px] text-gray-500 font-semibold">
                                <Clock className="w-3 h-3 text-gray-400" />
                                {vid.scheduledAt ? new Date(vid.scheduledAt).toLocaleTimeString('es-CO', {
                                  hour: 'numeric',
                                  minute: '2-digit'
                                }) : '10:00 a. m.'}
                              </div>
                              <strong className="block text-xs text-gray-900 truncate mt-0.5">{vid.title}</strong>
                            </div>

                            <div className="flex items-center justify-between pt-1">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-extrabold bg-emerald-100 text-emerald-800">
                                <Check className="w-3 h-3 text-emerald-600" />
                                Programado
                              </span>
                              <button
                                type="button"
                                title="Eliminar publicación programada"
                                onClick={() => handleDeleteScheduledVideo(vid.id, vid.title)}
                                className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))
                      )}

                      {/* Display note if exists */}
                      {isSedeLinked && day.note && (
                        <div className="p-2 rounded-lg bg-amber-50 border border-amber-200 text-[10px] text-amber-900 font-medium">
                          📝 {day.note}
                        </div>
                      )}
                    </div>

                    {/* Day actions */}
                    <div className="p-2 border-t border-gray-100 bg-white space-y-1">
                      <button
                        type="button"
                        disabled={!isSedeLinked}
                        onClick={() => openAddScheduleModal(day.date)}
                        className={`w-full py-1 text-center text-[11px] rounded-lg transition-colors font-bold ${
                          isSedeLinked
                            ? 'text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 cursor-pointer'
                            : 'text-gray-300 cursor-not-allowed'
                        }`}
                      >
                        + Programar
                      </button>
                      <button
                        type="button"
                        disabled={!isSedeLinked}
                        onClick={() => {
                          if (!isSedeLinked) {
                            Swal.fire({
                              icon: 'warning',
                              title: 'Sede sin vincular',
                              text: 'Debes vincular una cuenta oficial de TikTok en esta sede antes de asignar notas de programación.',
                              confirmButtonColor: '#10b981'
                            });
                            return;
                          }
                          openNoteModal(day.date, day.note);
                        }}
                        className={`w-full py-1 text-center text-[11px] rounded-lg transition-colors font-semibold ${
                          isSedeLinked
                            ? 'text-gray-500 hover:text-emerald-700 hover:bg-gray-50 cursor-pointer'
                            : 'text-gray-300 cursor-not-allowed'
                        }`}
                      >
                        + Nota
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* List View */
              <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-2xs">
                <h4 className="text-sm font-extrabold text-gray-900 mb-3">Lista de publicaciones programadas</h4>
                {!isSedeLinked ? (
                  <p className="text-xs text-amber-700 py-8 text-center bg-amber-50 rounded-xl">
                    Esta sede no tiene cuenta de TikTok vinculada. Conecta una cuenta en &quot;Cuentas vinculadas&quot; para consultar la programación.
                  </p>
                ) : schedule?.days.every(d => d.videos.length === 0) ? (
                  <p className="text-xs text-gray-400 py-8 text-center">No hay publicaciones programadas en TikTok Studio para esta semana.</p>
                ) : (
                  <div className="divide-y divide-gray-100 text-xs">
                    {schedule?.days.flatMap(d => d.videos).map(v => (
                      <div key={v.id} className="py-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gray-900 overflow-hidden shrink-0">
                            {v.thumbnailUrl ? (
                              <img src={v.thumbnailUrl} alt={v.title} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-600">
                                <Play className="w-4 h-4" />
                              </div>
                            )}
                          </div>
                          <div>
                            <strong className="block text-gray-900">{v.title}</strong>
                            <span className="text-[10px] text-gray-400">{v.sedeName} • {v.scheduledAt}</span>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          Programado
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Bottom Banner with Refresh Sync */}
            <div className="bg-white border border-gray-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center gap-2.5 text-xs text-gray-600">
                <AlertCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  <strong>Importante:</strong> La programación se obtiene de TikTok Studio. Los cambios pueden tardar algunos minutos en actualizarse en el sistema.
                </span>
              </div>

              <button
                type="button"
                onClick={async () => {
                  try {
                    await TikTokService.syncScheduled(selectedSedeFilter);
                    await loadSchedule();
                    Swal.fire({ icon: 'success', title: 'Programación actualizada', timer: 1200, showConfirmButton: false });
                  } catch {
                    Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo sincronizar la programación.' });
                  }
                }}
                className="px-4 py-2 bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 text-xs font-bold rounded-xl shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
              >
                <RefreshCw className="w-3.5 h-3.5 text-gray-600" />
                Actualizar programación
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: HISTORIAL (Image 6) */}
        {/* ========================================================================= */}
        {activeTab === 'historial' && (
          <div className="space-y-6">
            {/* Header + Export */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-gray-900">Historial de publicaciones</h2>
                <p className="text-xs text-gray-500">Consulta el registro de videos publicados por sede.</p>
              </div>

              <button
                type="button"
                onClick={exportHistoryCSV}
                className="px-4 py-2 bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 text-xs font-bold rounded-xl shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-gray-600" />
                Exportar reporte
              </button>
            </div>

            {/* Filter Bar Matching Image 6 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs">
              {/* Sede */}
              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">Sede</label>
                <div className="relative">
                  <select
                    value={selectedSedeFilter}
                    onChange={e => setSelectedSedeFilter(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-300 rounded-lg bg-white"
                  >
                    <option value="TODAS">Todas las sedes</option>
                    {stores.map(s => (
                      <option key={s.id} value={s.barrio || s.name}>{s.barrio || s.name}</option>
                    ))}
                  </select>
                  <StoreIcon className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5 pointer-events-none" />
                </div>
              </div>

              {/* Rango de fechas */}
              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">Rango de fechas</label>
                <div className="grid grid-cols-2 gap-1.5">
                  <input
                    type="date"
                    value={historyDateFrom}
                    onChange={e => setHistoryDateFrom(e.target.value)}
                    className="px-2 py-1 text-[11px] border border-gray-300 rounded-lg"
                    title="Desde"
                  />
                  <input
                    type="date"
                    value={historyDateTo}
                    onChange={e => setHistoryDateTo(e.target.value)}
                    className="px-2 py-1 text-[11px] border border-gray-300 rounded-lg"
                    title="Hasta"
                  />
                </div>
              </div>

              {/* Tipo de contenido */}
              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">Tipo de contenido</label>
                <div className="relative">
                  <select
                    value={historyContentType}
                    onChange={e => setHistoryContentType(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-300 rounded-lg bg-white"
                  >
                    <option value="TODOS">Todos</option>
                    <option value="Video">Video</option>
                    <option value="Short">Short</option>
                    <option value="Carousel">Carousel</option>
                  </select>
                  <Play className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5 pointer-events-none" />
                </div>
              </div>

              {/* Search */}
              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">Búsqueda</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Buscar video, descripción o hashtag..."
                    value={historySearch}
                    onChange={e => setHistorySearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                  <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* 5 Metric Cards Matching Image 6 */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <Play className="w-5 h-5 fill-emerald-600 text-emerald-600" />
                </div>
                <div>
                  <span className="text-xl font-black text-gray-900 block">{formatNum(historyTotal)}</span>
                  <span className="text-[11px] text-gray-500 font-semibold block">Videos publicados</span>
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <Eye className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xl font-black text-gray-900 block">{formatNum(historyMetrics.views)}</span>
                  <span className="text-[11px] text-gray-500 font-semibold block">Visualizaciones</span>
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <Heart className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xl font-black text-gray-900 block">{formatNum(historyMetrics.likes)}</span>
                  <span className="text-[11px] text-gray-500 font-semibold block">Me gusta</span>
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xl font-black text-gray-900 block">{formatNum(historyMetrics.comments)}</span>
                  <span className="text-[11px] text-gray-500 font-semibold block">Comentarios</span>
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <Share2 className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xl font-black text-gray-900 block">{formatNum(historyMetrics.shares)}</span>
                  <span className="text-[11px] text-gray-500 font-semibold block">Compartidos</span>
                </div>
              </div>
            </div>

            {/* History Table Matching Image 6 */}
            <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-2xs space-y-4">
              {historyVideos.length === 0 ? (
                <div className="py-16 text-center text-gray-400 text-xs border-2 border-dashed border-gray-100 rounded-xl space-y-2">
                  <Play className="w-10 h-10 text-gray-300 mx-auto" />
                  <p className="font-bold text-gray-700 text-sm">No se encontraron publicaciones</p>
                  <p className="text-gray-400 max-w-sm mx-auto">
                    Los videos publicados en las cuentas conectadas de TikTok aparecerán aquí de forma automática.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50 text-gray-400 uppercase text-[10px] tracking-wider border-y border-gray-100">
                      <tr>
                        <th className="py-3 px-3">Video</th>
                        <th className="py-3 px-3">Sede</th>
                        <th className="py-3 px-3">Fecha y hora de publicación ↓</th>
                        <th className="py-3 px-3">Visualizaciones</th>
                        <th className="py-3 px-3">Me gusta</th>
                        <th className="py-3 px-3">Comentarios</th>
                        <th className="py-3 px-3">Compartidos</th>
                        <th className="py-3 px-3 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-gray-700">
                      {historyVideos.map((v) => (
                        <tr key={v.id} className="hover:bg-gray-50/70 transition-colors">
                          <td className="py-3.5 px-3">
                            <div className="flex items-center gap-3">
                              <div className="relative w-12 h-14 rounded-lg bg-gray-900 overflow-hidden shrink-0">
                                {v.thumbnailUrl ? (
                                  <img src={v.thumbnailUrl} alt={v.title} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-gray-600">
                                    <Play className="w-5 h-5" />
                                  </div>
                                )}
                                <span className="absolute bottom-1 right-1 bg-black/80 text-white text-[8px] font-bold px-1 rounded">
                                  {v.duration || '0:24'}
                                </span>
                              </div>
                              <div>
                                <strong className="block text-gray-900 text-xs">{v.title}</strong>
                                {v.hashtags && (
                                  <span className="text-[10px] text-emerald-700 block truncate max-w-[220px]">
                                    {v.hashtags}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-3">
                            <span className="flex items-center gap-1.5 font-bold text-gray-800">
                              <StoreIcon className="w-3.5 h-3.5 text-emerald-600" />
                              {v.sedeName}
                            </span>
                          </td>

                          <td className="py-3.5 px-3 text-gray-600">
                            {v.publishedAt ? new Date(v.publishedAt).toLocaleDateString('es-CO', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                              hour: 'numeric',
                              minute: '2-digit'
                            }) : 'Reciente'}
                          </td>

                          <td className="py-3.5 px-3 font-bold text-gray-900">
                            <span className="flex items-center gap-1">
                              <Eye className="w-3.5 h-3.5 text-gray-400" />
                              {formatNum(v.viewCount)}
                            </span>
                          </td>

                          <td className="py-3.5 px-3 text-gray-700">
                            <span className="flex items-center gap-1">
                              <Heart className="w-3.5 h-3.5 text-gray-400" />
                              {formatNum(v.likeCount)}
                            </span>
                          </td>

                          <td className="py-3.5 px-3 text-gray-700">
                            <span className="flex items-center gap-1">
                              <MessageCircle className="w-3.5 h-3.5 text-gray-400" />
                              {formatNum(v.commentCount)}
                            </span>
                          </td>

                          <td className="py-3.5 px-3 text-gray-700">
                            <span className="flex items-center gap-1">
                              <Share2 className="w-3.5 h-3.5 text-gray-400" />
                              {formatNum(v.shareCount)}
                            </span>
                          </td>

                          <td className="py-3.5 px-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                type="button"
                                onClick={() => setPreviewVideo(v)}
                                className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                                title="Ver video"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  if (v.videoUrl) {
                                    window.open(v.videoUrl, '_blank');
                                  } else {
                                    Swal.fire({
                                      icon: 'info',
                                      title: v.title,
                                      text: `Sede: ${v.sedeName} • Vistas: ${formatNum(v.viewCount)} • Likes: ${formatNum(v.likeCount)}`
                                    });
                                  }
                                }}
                                className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg cursor-pointer"
                                title="Opciones"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination */}
              {historyTotal > 0 && (
                <div className="flex items-center justify-between pt-3 border-t border-gray-100 text-xs text-gray-500">
                  <span>
                    Mostrando {historyVideos.length > 0 ? historyPage * 5 + 1 : 0} – {Math.min((historyPage + 1) * 5, historyTotal)} de {historyTotal} publicaciones
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={historyPage === 0}
                      onClick={() => setHistoryPage(prev => Math.max(0, prev - 1))}
                      className="p-1 rounded-md border border-gray-200 text-gray-500 disabled:opacity-40 cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="px-2 py-0.5 rounded bg-emerald-600 text-white font-bold">
                      {historyPage + 1}
                    </span>
                    <button
                      type="button"
                      disabled={(historyPage + 1) * 5 >= historyTotal}
                      onClick={() => setHistoryPage(prev => prev + 1)}
                      className="p-1 rounded-md border border-gray-200 text-gray-500 disabled:opacity-40 cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      {/* ========================================================================= */}
      {/* 3-STEP TIKTOK OAUTH MODAL (Matching Images 1, 2, 3) */}
      {/* ========================================================================= */}
      {isLinkModalOpen && (
        <div className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-gray-100 my-auto animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center font-bold">
                  <TikTokLogoIcon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-gray-900">Vincular cuenta de TikTok</h3>
                  <p className="text-[11px] text-gray-400">Conecta una cuenta oficial para consultar su información.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsLinkModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Stepper (3 Steps) */}
            <div className="px-6 py-3 bg-gray-50/80 border-b border-gray-100">
              <div className="flex items-center justify-between text-xs">
                {/* Step 1 */}
                <div className="flex flex-col items-center">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold transition-all ${
                    linkStep > 1
                      ? 'bg-emerald-600 text-white'
                      : linkStep === 1
                      ? 'bg-emerald-600 text-white ring-4 ring-emerald-100'
                      : 'bg-gray-200 text-gray-500'
                  }`}>
                    {linkStep > 1 ? <Check className="w-3.5 h-3.5" /> : '1'}
                  </div>
                  <span className={`text-[10px] mt-1 font-semibold ${
                    linkStep === 1 ? 'text-emerald-700' : 'text-gray-400'
                  }`}>
                    Seleccionar sede
                  </span>
                </div>

                <div className="flex-1 h-0.5 bg-gray-200 mx-2 -mt-3"></div>

                {/* Step 2 */}
                <div className="flex flex-col items-center">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold transition-all ${
                    linkStep > 2
                      ? 'bg-emerald-600 text-white'
                      : linkStep === 2
                      ? 'bg-emerald-600 text-white ring-4 ring-emerald-100'
                      : 'bg-gray-200 text-gray-500'
                  }`}>
                    {linkStep > 2 ? <Check className="w-3.5 h-3.5" /> : '2'}
                  </div>
                  <span className={`text-[10px] mt-1 font-semibold ${
                    linkStep === 2 ? 'text-emerald-700' : 'text-gray-400'
                  }`}>
                    Autorizar en TikTok
                  </span>
                </div>

                <div className="flex-1 h-0.5 bg-gray-200 mx-2 -mt-3"></div>

                {/* Step 3 */}
                <div className="flex flex-col items-center">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold transition-all ${
                    linkStep === 3
                      ? 'bg-emerald-600 text-white ring-4 ring-emerald-100'
                      : 'bg-gray-200 text-gray-500'
                  }`}>
                    {linkStep === 3 ? '3' : '3'}
                  </div>
                  <span className={`text-[10px] mt-1 font-semibold ${
                    linkStep === 3 ? 'text-emerald-700' : 'text-gray-400'
                  }`}>
                    Confirmación
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {/* STEP 1: Seleccionar sede (Matching Image 1) */}
              {linkStep === 1 && (
                <div className="space-y-5 text-xs">
                  <div>
                    <h4 className="font-extrabold text-sm text-gray-900">1. Seleccionar sede</h4>
                    <p className="text-gray-500 text-[11px] mt-0.5">Elige la sede a la que se vinculará la cuenta de TikTok.</p>
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1.5">Sede *</label>
                    <div className="relative">
                      <select
                        value={selectedLinkSede}
                        onChange={e => setSelectedLinkSede(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-xl bg-white font-bold text-gray-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      >
                        {stores.map(s => (
                          <option key={s.id} value={s.barrio || s.name}>
                            {s.barrio || s.name} ({s.name})
                          </option>
                        ))}
                      </select>
                      <StoreIcon className="w-4 h-4 text-emerald-600 absolute left-3 top-3 pointer-events-none" />
                    </div>
                  </div>

                  <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <p className="text-[11px] text-emerald-950 leading-relaxed">
                      TikTok solicitará autorización para consultar el perfil y los videos públicos. Esta conexión <strong>NO permite leer videos futuros programados en TikTok Studio</strong>.
                    </p>
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-2.5">
                    <button
                      type="button"
                      onClick={() => setIsLinkModalOpen(false)}
                      className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900 cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={proceedToStep2}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      <TikTokLogoIcon className="w-4 h-4 text-white" />
                      Continuar con TikTok
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: Autorizar en TikTok (Matching Image 2) */}
              {linkStep === 2 && (
                <div className="space-y-4">
                  {/* Sub-step A: TikTok OAuth 2.0 Authorization & Direct Linking (No Passwords) */}
                  {linkSubStep === 'login' && (
                    <div className="max-w-md mx-auto p-5 border border-gray-200 rounded-2xl bg-white space-y-4 text-center">
                      <div className="flex items-center justify-center gap-2 text-gray-900 font-black text-xl">
                        <TikTokLogoIcon className="w-6 h-6 text-black" />
                        <span>TikTok OAuth 2.0</span>
                      </div>
                      <div>
                        <h4 className="font-extrabold text-sm text-gray-900">
                          Vincular sede: <span className="text-emerald-700 font-black">{selectedLinkSede}</span>
                        </h4>
                        <p className="text-[11px] text-gray-500 mt-1">
                          Conexión oficial por OAuth 2.0. Cada sede administra su propia cuenta de TikTok sin solicitar contraseñas.
                        </p>
                      </div>

                      {/* Mode 1: Official OAuth 2.0 if configured */}
                      {oauthConfig?.configured ? (
                        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2.5 text-left">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>Aplicación TikTok Developers conectada</span>
                          </div>
                          <p className="text-[11px] text-emerald-950 leading-relaxed">
                            Se abrirá la ventana de inicio de sesión oficial de TikTok para autorizar los permisos de perfil y videos.
                          </p>
                          <button
                            type="button"
                            onClick={handleStartOfficialOAuth}
                            className="w-full py-2.5 bg-[#fe2c55] hover:bg-[#e0264b] text-white font-bold text-xs rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
                          >
                            <TikTokLogoIcon className="w-4 h-4 text-white" />
                            Autorizar en TikTok (OAuth 2.0 Oficial)
                          </button>
                        </div>
                      ) : (
                        <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-left space-y-2">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                            <span>Configuración de TikTok Developers</span>
                          </div>
                          <p className="text-[11px] text-amber-800 leading-relaxed">
                            Para iniciar el flujo OAuth 2.0 automático con TikTok Login Kit, agrega estas variables en tu servidor:
                          </p>
                          <div className="bg-white p-2.5 rounded-lg text-[10px] font-mono text-gray-800 space-y-0.5 border border-amber-200">
                            <div><strong>TIKTOK_CLIENT_KEY</strong> = Client Key de tu App</div>
                            <div><strong>TIKTOK_CLIENT_SECRET</strong> = Client Secret</div>
                            <div><strong>TIKTOK_REDIRECT_URI</strong> = {oauthConfig?.redirectUri || 'http://localhost:3000/admin/tiktok/callback'}</div>
                          </div>
                        </div>
                      )}

                      {/* Mode 2: Direct Account Verification (Always available, verified with TikTok live API) */}
                      <div className="pt-3 border-t border-gray-100 text-left space-y-2">
                        <label className="block text-xs font-bold text-gray-800">
                          Vinculación por cuenta oficial de TikTok (Verificación en vivo)
                        </label>
                        <p className="text-[11px] text-gray-500 leading-relaxed">
                          Ingresa el usuario oficial de la sede. El sistema valida su existencia directamente contra la API oficial de TikTok:
                        </p>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="Ej. @juand.store"
                            value={customUsername}
                            onChange={e => setCustomUsername(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') handleVerifyAndLinkByHandle(); }}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={handleVerifyAndLinkByHandle}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors cursor-pointer shrink-0"
                          >
                            Verificar y vincular
                          </button>
                        </div>
                      </div>

                      <div className="pt-2 flex items-center justify-between text-xs border-t border-gray-100">
                        <button
                          type="button"
                          onClick={() => setLinkStep(1)}
                          className="text-gray-500 hover:text-gray-700 font-semibold cursor-pointer"
                        >
                          ← Cambiar de sede
                        </button>
                        <a
                          href="https://www.tiktok.com/login"
                          target="_blank"
                          rel="noreferrer"
                          className="text-gray-500 hover:text-gray-700 flex items-center gap-1 font-semibold"
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-gray-500" />
                          tiktok.com
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Sub-step B: TikTok Permission Authorization (Screen 2 of Image 2) */}
                  {linkSubStep === 'authorize' && (
                    <div className="max-w-sm mx-auto p-4 border border-gray-200 rounded-2xl bg-white space-y-4 text-center">
                      <div className="flex items-center justify-between text-xs text-gray-500 pb-2 border-b border-gray-100">
                        <div className="flex items-center gap-1 font-bold text-gray-900">
                          <TikTokLogoIcon className="w-4 h-4" />
                          <span>{linkingAccountData?.username || customUsername || 'TikTok'}</span>
                        </div>
                        <div className="w-6 h-6 rounded-full bg-black text-white text-[9px] flex items-center justify-center font-bold">
                          {customUsername ? customUsername.replace('@', '').substring(0, 2).toUpperCase() : 'JD'}
                        </div>
                      </div>

                      {/* Dual logos */}
                      <div className="flex items-center justify-center gap-3 py-2">
                        <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center">
                          <TikTokLogoIcon className="w-5 h-5" />
                        </div>
                        <span className="text-gray-400 font-bold">⇄</span>
                        <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center text-[10px] font-black">
                          JUAN'D
                        </div>
                      </div>

                      <div>
                        <h4 className="font-extrabold text-sm text-gray-900">
                          Autorizar a Control TikTok – JUAND'STORE
                        </h4>
                        <p className="text-[10px] text-gray-500 mt-1">
                          Control TikTok – JUAND'STORE solicita permiso para acceder a la siguiente información de tu cuenta verificada de TikTok <strong>{linkingAccountData?.username}</strong>:
                        </p>
                      </div>

                      {/* Verified Badge from TikTok */}
                      <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-left space-y-0.5">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Cuenta real verificada en TikTok</span>
                        </div>
                        <p className="text-[10px] text-emerald-800">
                          Perfil: <strong>{linkingAccountData?.displayName}</strong> ({linkingAccountData?.username})
                        </p>
                      </div>

                      <div className="space-y-2 text-left text-xs bg-gray-50 p-3 rounded-xl border border-gray-100">
                        <div className="flex items-start gap-2.5">
                          <User className="w-4 h-4 text-gray-500 shrink-0 mt-0.5" />
                          <div>
                            <strong className="block text-gray-900 text-[11px]">Leer información básica del perfil</strong>
                            <p className="text-[10px] text-gray-500">Nombre de usuario, foto de perfil y ID de la cuenta.</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-2.5 pt-2 border-t border-gray-200/60">
                          <VideoIcon className="w-4 h-4 text-gray-500 shrink-0 mt-0.5" />
                          <div>
                            <strong className="block text-gray-900 text-[11px]">Leer tus videos públicos</strong>
                            <p className="text-[10px] text-gray-500">Consultar las publicaciones ya realizadas en TikTok.</p>
                          </div>
                        </div>
                      </div>

                      <p className="text-[9px] text-gray-400 leading-tight">
                        Al autorizar, aceptas la Política de privacidad y los Términos de servicio de Control TikTok - JUAND'STORE.
                      </p>

                      <div className="flex items-center justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setLinkSubStep('login')}
                          className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          onClick={handleOAuthAuthorize}
                          className="px-6 py-2 bg-[#fe2c55] hover:bg-[#e0264b] text-white font-bold text-xs rounded-lg shadow-sm transition-colors cursor-pointer"
                        >
                          Autorizar
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Sub-step C: Success Screen inside TikTok (Screen 3 of Image 2) */}
                  {linkSubStep === 'success' && (
                    <div className="max-w-sm mx-auto p-6 border border-gray-200 rounded-2xl bg-white space-y-4 text-center">
                      <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                        <Check className="w-8 h-8" />
                      </div>

                      <div>
                        <h4 className="font-extrabold text-base text-gray-900">¡Cuenta vinculada!</h4>
                        <p className="text-xs text-gray-500 mt-1">
                          La cuenta de TikTok se conectó correctamente con la sede {linkingAccountData?.sedeName}.
                        </p>
                      </div>

                      <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <TikTokLogoIcon className="w-4 h-4 text-black" />
                          <div className="text-left">
                            <strong className="block text-xs text-gray-900">{linkingAccountData?.username}</strong>
                            <span className="text-[10px] text-gray-400">{linkingAccountData?.displayName}</span>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-800">
                          ✓ Conectada
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={proceedToStep3}
                        className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors cursor-pointer"
                      >
                        Volver a Cuentas vinculadas
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 3: Confirmación (Matching Image 3) */}
              {linkStep === 3 && linkingAccountData && (
                <div className="space-y-4 text-xs">
                  {/* Green Banner */}
                  <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-extrabold text-xs text-emerald-950">¡Conexión autorizada!</h4>
                      <p className="text-[11px] text-emerald-900 mt-0.5">
                        La cuenta de TikTok se vinculó correctamente con la sede seleccionada.
                      </p>
                    </div>
                  </div>

                  {/* Account Card */}
                  <div className="p-4 rounded-xl border border-gray-200 bg-white shadow-2xs space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-11 h-11 rounded-xl bg-black text-white flex items-center justify-center font-bold text-xs">
                            JD
                          </div>
                          <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-black text-white flex items-center justify-center text-[8px]">
                            <TikTokLogoIcon className="w-2.5 h-2.5" />
                          </span>
                        </div>
                        <div>
                          <strong className="block text-xs font-black text-gray-900">{linkingAccountData.username}</strong>
                          <span className="text-[11px] text-gray-500 block">{linkingAccountData.displayName}</span>
                          <span className="text-[10px] text-gray-400">ID de cuenta: {linkingAccountData.accountId}</span>
                        </div>
                      </div>

                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        <Check className="w-3 h-3 text-emerald-600" />
                        Conectada
                      </span>
                    </div>

                    <div className="pt-2 border-t border-gray-100 space-y-1.5 text-[11px]">
                      <div className="flex items-center justify-between text-gray-600">
                        <span className="text-gray-400 flex items-center gap-1">
                          <StoreIcon className="w-3 h-3" /> Sede:
                        </span>
                        <strong className="text-gray-900">{linkingAccountData.sedeName}</strong>
                      </div>
                      <div className="flex items-center justify-between text-gray-600">
                        <span className="text-gray-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> Fecha de vinculación:
                        </span>
                        <strong className="text-gray-900">{linkingAccountData.connectedAt}</strong>
                      </div>
                      <div className="flex items-center justify-between text-gray-600">
                        <span className="text-gray-400 flex items-center gap-1">
                          <FileText className="w-3 h-3" /> Permisos otorgados:
                        </span>
                        <strong className="text-gray-900">Lectura de perfil y videos públicos</strong>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-2.5">
                    <button
                      type="button"
                      onClick={() => setIsLinkModalOpen(false)}
                      className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900 cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={handleFinalizeConnection}
                      className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm cursor-pointer transition-colors"
                    >
                      Finalizar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: AGREGAR NOTA DIARIA EN PROGRAMACIÓN */}
      {/* ========================================================================= */}
      {isNoteModalOpen && (
        <div className="fixed inset-0 z-[130] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
                📝 Nota de programación
              </h3>
              <button
                type="button"
                onClick={() => setIsNoteModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div>
                <span className="text-gray-400 block text-[11px]">Sede:</span>
                <strong className="text-gray-900 text-sm">{selectedSedeFilter}</strong>
              </div>
              <div>
                <span className="text-gray-400 block text-[11px]">Fecha seleccionada:</span>
                <strong className="text-gray-900">{noteTargetDate}</strong>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Nota / Instrucciones de publicación</label>
                <textarea
                  rows={3}
                  placeholder="Ej. Publicar video de nueva colección a las 10:00 a. m. y conjunto exclusivo a las 6:00 p. m...."
                  value={noteContent}
                  onChange={e => setNoteContent(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNoteModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSaveNote}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm cursor-pointer"
                >
                  Guardar nota
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: PROGRAMAR NUEVO VIDEO / PUBLICACIÓN EN LA BASE DE DATOS */}
      {/* ========================================================================= */}
      {isAddScheduleModalOpen && (
        <div className="fixed inset-0 z-[130] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-200 my-auto">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-gray-900">Programar publicación de TikTok</h3>
                  <p className="text-[11px] text-gray-400">Planifica videos en el calendario de supervisión de la sede.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddScheduleModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer p-1 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateScheduledVideo} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Sede *</label>
                  <select
                    value={newSchedule.sedeName}
                    onChange={e => setNewSchedule({ ...newSchedule, sedeName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl bg-white font-bold text-gray-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    required
                  >
                    {stores.map(s => (
                      <option key={s.id} value={s.barrio || s.name}>
                        {s.barrio || s.name} ({s.name})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Fecha y hora programada *</label>
                  <input
                    type="datetime-local"
                    value={newSchedule.scheduledAt}
                    onChange={e => setNewSchedule({ ...newSchedule, scheduledAt: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-gray-800 font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Título de la publicación / Campaña *</label>
                <input
                  type="text"
                  placeholder="Ej. Nueva colección 🔥, Jeans premium, Polos básicos..."
                  value={newSchedule.title}
                  onChange={e => setNewSchedule({ ...newSchedule, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Tema / Categoría</label>
                  <input
                    type="text"
                    placeholder="Ej. Ropa Masculina, Calzado, Gorras..."
                    value={newSchedule.topic}
                    onChange={e => setNewSchedule({ ...newSchedule, topic: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Duración estimada</label>
                  <input
                    type="text"
                    placeholder="Ej. 0:24, 0:30, 0:18"
                    value={newSchedule.duration}
                    onChange={e => setNewSchedule({ ...newSchedule, duration: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">URL de miniatura / Portada (Opcional)</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={newSchedule.thumbnailUrl}
                  onChange={e => setNewSchedule({ ...newSchedule, thumbnailUrl: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Notas internas / Hashtags</label>
                <textarea
                  rows={2}
                  placeholder="Ej. #NuevaColeccion #ModaHombre #JuandStore - Verificar alistamiento de prendas en tienda"
                  value={newSchedule.notes}
                  onChange={e => setNewSchedule({ ...newSchedule, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl text-[11px] text-emerald-950 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  Esta publicación se registrará en el calendario de supervisión de la sede y se actualizará automáticamente en los reportes semanales.
                </span>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddScheduleModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm cursor-pointer transition-colors flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  Guardar publicación
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: PREVIEW DE VIDEO */}
      {/* ========================================================================= */}
      {previewVideo && (
        <div className="fixed inset-0 z-[130] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between bg-black text-white">
              <span className="text-xs font-extrabold flex items-center gap-1.5">
                <TikTokLogoIcon className="w-4 h-4" /> {previewVideo.title}
              </span>
              <button
                type="button"
                onClick={() => setPreviewVideo(null)}
                className="text-gray-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-3 text-xs">
              <div className="relative w-full h-64 bg-gray-900 rounded-xl overflow-hidden flex items-center justify-center">
                {previewVideo.thumbnailUrl ? (
                  <img src={previewVideo.thumbnailUrl} alt={previewVideo.title} className="w-full h-full object-cover" />
                ) : (
                  <Play className="w-12 h-12 text-white/50" />
                )}
                <span className="absolute bottom-2 right-2 bg-black/80 text-white text-xs font-bold px-2 py-0.5 rounded">
                  {previewVideo.duration || '0:24'}
                </span>
              </div>

              <div>
                <strong className="block text-sm text-gray-900">{previewVideo.title}</strong>
                <p className="text-[11px] text-gray-500 mt-1">{previewVideo.description || 'Publicación oficial en TikTok.'}</p>
                {previewVideo.hashtags && (
                  <p className="text-[11px] text-emerald-700 font-bold mt-1">{previewVideo.hashtags}</p>
                )}
              </div>

              <div className="grid grid-cols-4 gap-2 pt-2 border-t border-gray-100 text-center">
                <div className="p-2 bg-gray-50 rounded-lg">
                  <span className="text-[10px] text-gray-400 block">Vistas</span>
                  <strong className="text-xs text-gray-900">{formatNum(previewVideo.viewCount)}</strong>
                </div>
                <div className="p-2 bg-gray-50 rounded-lg">
                  <span className="text-[10px] text-gray-400 block">Likes</span>
                  <strong className="text-xs text-gray-900">{formatNum(previewVideo.likeCount)}</strong>
                </div>
                <div className="p-2 bg-gray-50 rounded-lg">
                  <span className="text-[10px] text-gray-400 block">Comentarios</span>
                  <strong className="text-xs text-gray-900">{formatNum(previewVideo.commentCount)}</strong>
                </div>
                <div className="p-2 bg-gray-50 rounded-lg">
                  <span className="text-[10px] text-gray-400 block">Shares</span>
                  <strong className="text-xs text-gray-900">{formatNum(previewVideo.shareCount)}</strong>
                </div>
              </div>

              {previewVideo.videoUrl && (
                <a
                  href={previewVideo.videoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2 bg-black hover:bg-gray-800 text-white font-bold text-xs rounded-xl shadow-sm flex items-center justify-center gap-1.5 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Abrir en TikTok
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
