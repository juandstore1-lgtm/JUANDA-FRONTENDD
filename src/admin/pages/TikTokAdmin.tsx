import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
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
  Trash2,
  UploadCloud,
  Send,
  Save,
  Settings,
  HelpCircle,
  Film,
  Globe,
  Users,
  ShieldCheck,
  ChevronDown
} from 'lucide-react';
import { TikTokService } from '../../services/api';
import { 
  TikTokVideo, 
  TikTokScheduledVideo, 
  TikTokWeeklySchedule, 
  TikTokSummary
} from '../../types';
import Swal from 'sweetalert2';

// Icono oficial SVG de TikTok (nota musical)
function TikTokLogoIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .58.04.86.12V9.32a6.34 6.34 0 0 0-.86-.06 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V9.45a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.88z"/>
    </svg>
  );
}

export default function TikTokAdmin() {
  const [searchParams] = useSearchParams();
  const queryTab = searchParams.get('tab') as 'resumen' | 'mi_cuenta' | 'publicar' | 'programacion' | 'historial' | null;

  // Tab activo: 'resumen' | 'mi_cuenta' | 'publicar' | 'programacion' | 'historial'
  const [activeTab, setActiveTab] = useState<'resumen' | 'mi_cuenta' | 'publicar' | 'programacion' | 'historial'>(
    queryTab && ['resumen', 'mi_cuenta', 'publicar', 'programacion', 'historial'].includes(queryTab) ? queryTab : 'publicar'
  );

  useEffect(() => {
    if (queryTab && ['resumen', 'mi_cuenta', 'publicar', 'programacion', 'historial'].includes(queryTab)) {
      setActiveTab(queryTab);
    }
  }, [queryTab]);

  // Estado de la cuenta global conectada (100% oficial)
  const [globalAccount, setGlobalAccount] = useState<{
    connected: boolean;
    id?: number;
    username?: string;
    displayName?: string;
    avatarUrl?: string;
    accountId?: string;
    openId?: string;
    status: string;
    connectedAt?: string;
    permissions?: string;
    scope?: string;
    canPublishDirectly?: boolean;
    canUploadDraft?: boolean;
    canListVideos?: boolean;
    tokenExpiresAt?: string;
  } | null>(null);

  // Estados de datos
  const [summary, setSummary] = useState<TikTokSummary | null>(null);
  const [schedule, setSchedule] = useState<TikTokWeeklySchedule | null>(null);
  const [currentWeekStart, setCurrentWeekStart] = useState<string>(new Date().toISOString().split('T')[0]);
  const [historyVideos, setHistoryVideos] = useState<TikTokVideo[]>([]);
  const [historyTotal, setHistoryTotal] = useState(0);
  const [historyMetrics, setHistoryMetrics] = useState({ views: 0, likes: 0, comments: 0, shares: 0 });
  const [loading, setLoading] = useState(true);

  // Filtros de historial y resumen
  const [historySearch, setHistorySearch] = useState('');
  const [historyDateFrom, setHistoryDateFrom] = useState('');
  const [historyDateTo, setHistoryDateTo] = useState('');
  const [historyPage, setHistoryPage] = useState(0);

  // Modal de credenciales de desarrollador
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [oauthConfig, setOAuthConfig] = useState<{
    configured: boolean;
    clientKey: string | null;
    redirectUri: string;
    scopes: string[];
    requiredCredentials: Record<string, string>;
  } | null>(null);
  const [inputClientKey, setInputClientKey] = useState('');
  const [inputClientSecret, setInputClientSecret] = useState('');
  const [inputRedirectUri, setInputRedirectUri] = useState('https://www.juandstore.com/admin/tiktok/callback');

  // --- Formulario de Publicación de Video (Pantalla 2) ---
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [videoDuration, setVideoDuration] = useState<string>('0:00');
  const [description, setDescription] = useState(
    'Nueva colección disponible en JUANDSTORE 👕🔥\nEstilo, calidad y los mejores outfits para ti.'
  );
  const [hashtags, setHashtags] = useState<string[]>(['JUANDSTORE', 'ModaHombre', 'NuevaColección']);
  const [hashtagInput, setHashtagInput] = useState('');
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null);
  const [coverTimestampMs, setCoverTimestampMs] = useState<number>(1000);

  // Opciones de publicación
  const [privacyLevel, setPrivacyLevel] = useState<'PUBLIC_TO_EVERYONE' | 'MUTUAL_FOLLOW_FRIENDS' | 'SELF_ONLY'>('PUBLIC_TO_EVERYONE');
  const [allowComments, setAllowComments] = useState(true);
  const [allowDuet, setAllowDuet] = useState(true);
  const [allowStitch, setAllowStitch] = useState(true);
  const [publishMode, setPublishMode] = useState<'now' | 'schedule'>('now');
  const [scheduleDate, setScheduleDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [scheduleTime, setScheduleTime] = useState('18:30');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Referencias a inputs de archivos
  const videoInputRef = useRef<HTMLInputElement | null>(null);
  const coverInputRef = useRef<HTMLInputElement | null>(null);
  const videoPlayerRef = useRef<HTMLVideoElement | null>(null);

  // Inicialización de datos
  useEffect(() => {
    loadInitialData();
  }, []);

  // Carga según pestaña activa
  useEffect(() => {
    if (activeTab === 'resumen') loadSummary();
    if (activeTab === 'programacion') loadSchedule(currentWeekStart);
    if (activeTab === 'historial') loadHistory();
  }, [activeTab, currentWeekStart, historySearch, historyDateFrom, historyDateTo, historyPage]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadAccount(),
        loadOAuthConfig(),
        loadSummary(),
        loadSchedule(currentWeekStart),
        loadHistory()
      ]);
    } catch (e) {
      console.error('Error cargando datos iniciales de TikTok:', e);
    } finally {
      setLoading(false);
    }
  };

  const loadAccount = async () => {
    try {
      const acc = await TikTokService.getGlobalAccount();
      setGlobalAccount(acc);
      return acc;
    } catch (e) {
      console.error('Error cargando cuenta global de TikTok:', e);
      return null;
    }
  };

  const loadOAuthConfig = async () => {
    try {
      const cfg = await TikTokService.getOAuthConfig();
      setOAuthConfig(cfg);
      if (cfg.clientKey) setInputClientKey(cfg.clientKey);
      if (cfg.redirectUri) setInputRedirectUri(cfg.redirectUri);
    } catch (e) {
      console.error('Error cargando configuración OAuth:', e);
    }
  };

  const loadSummary = async () => {
    try {
      const sum = await TikTokService.getSummary('GLOBAL', 'ESTA_SEMANA');
      setSummary(sum);
    } catch (e) {
      console.error('Error cargando resumen:', e);
    }
  };

  const loadSchedule = async (weekStart?: string) => {
    try {
      const sched = await TikTokService.getWeeklySchedule('GLOBAL', weekStart);
      setSchedule(sched);
    } catch (e) {
      console.error('Error cargando programación semanal:', e);
    }
  };

  const loadHistory = async () => {
    try {
      const res = await TikTokService.getHistory({
        sede: 'GLOBAL',
        dateFrom: historyDateFrom,
        dateTo: historyDateTo,
        search: historySearch,
        page: historyPage,
        size: 10
      });
      setHistoryVideos(res.videos || []);
      setHistoryTotal(res.totalVideos || 0);
      setHistoryMetrics({
        views: res.totalViews || 0,
        likes: res.totalLikes || 0,
        comments: res.totalComments || 0,
        shares: res.totalShares || 0
      });
    } catch (e) {
      console.error('Error cargando historial de TikTok:', e);
    }
  };

  // --- Manejo del retorno OAuth 2.0 Oficial ---
  const handleOAuthCallback = async (code: string, state: string) => {
    // Limpiar query params de la URL sin recargar
    window.history.replaceState({}, document.title, window.location.pathname);

    Swal.fire({
      title: 'Completando vinculación con TikTok...',
      text: 'Intercambiando código de autorización oficial y registrando tokens seguros...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    try {
      await TikTokService.handleOAuthCallback(code, state || 'GLOBAL');
      const updatedAcc = await loadAccount();
      await loadSummary();
      await loadSchedule();
      await loadHistory();

      Swal.fire({
        icon: 'success',
        title: '¡Cuenta de TikTok vinculada con éxito!',
        html: `Tu cuenta <b>${updatedAcc?.username || '@tu_cuenta'}</b> ha sido autorizada mediante Login Kit OAuth 2.0 oficial.<br/><br/><span class="text-xs text-gray-500">Permisos otorgados: ${updatedAcc?.permissions || 'Básicos'}</span>`,
        confirmButtonColor: '#10b981'
      });
      setActiveTab('mi_cuenta');
    } catch (err: any) {
      Swal.fire({
        icon: 'error',
        title: 'Error de autorización en TikTok',
        text: err?.message || 'TikTok rechazó la solicitud o el código de autorización expiró.',
        confirmButtonColor: '#ef4444'
      });
    }
  };

  // Redireccionar al Login Oficial de TikTok (OAuth 2.0)
  const handleConnectWithTikTok = async () => {
    try {
      const { url } = await TikTokService.getAuthorizeUrl('GLOBAL');
      window.location.href = url;
    } catch (err: any) {
      Swal.fire({
        icon: 'warning',
        title: 'Configura tus credenciales de TikTok Developers',
        text: err?.message || 'Ingresa el Client Key y Client Secret de tu aplicación de TikTok para continuar.',
        showCancelButton: true,
        confirmButtonText: 'Configurar credenciales',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#10b981'
      }).then(res => {
        if (res.isConfirmed) {
          setIsConfigModalOpen(true);
        }
      });
    }
  };

  // Desconectar cuenta oficial
  const handleDisconnect = async () => {
    const confirm = await Swal.fire({
      title: '¿Desconectar cuenta de TikTok?',
      text: 'Se eliminarán los tokens de acceso del servidor. Deberás volver a autorizar en TikTok para publicar videos.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, desconectar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#ef4444'
    });

    if (confirm.isConfirmed) {
      try {
        await TikTokService.disconnectGlobalAccount();
        await loadAccount();
        Swal.fire({
          icon: 'success',
          title: 'Cuenta desconectada',
          text: 'La cuenta de TikTok ha sido desvinculada exitosamente.',
          timer: 2000,
          showConfirmButton: false
        });
      } catch (err: any) {
        Swal.fire({
          icon: 'error',
          title: 'Error al desconectar',
          text: err?.message || 'No se pudo desconectar la cuenta.'
        });
      }
    }
  };

  // Guardar credenciales de TikTok Developers
  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputClientKey.trim() || !inputClientSecret.trim()) {
      Swal.fire({ icon: 'warning', text: 'El Client Key y Client Secret son requeridos.' });
      return;
    }

    try {
      await TikTokService.saveOAuthConfig({
        clientKey: inputClientKey.trim(),
        clientSecret: inputClientSecret.trim(),
        redirectUri: inputRedirectUri.trim()
      });
      await loadOAuthConfig();
      setIsConfigModalOpen(false);
      Swal.fire({
        icon: 'success',
        title: 'Credenciales guardadas',
        text: 'Las credenciales de TikTok Developers fueron actualizadas correctamente.',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (err: any) {
      Swal.fire({
        icon: 'error',
        title: 'Error al guardar',
        text: err?.message || 'No se pudieron almacenar las credenciales.'
      });
    }
  };

  // --- Gestión de Archivo de Video y Preview ---
  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      Swal.fire({
        icon: 'warning',
        title: 'Formato no soportado',
        text: 'Por favor selecciona un archivo de video válido (.mp4 o .mov).'
      });
      return;
    }

    if (file.size > 500 * 1024 * 1024) {
      Swal.fire({
        icon: 'warning',
        title: 'Archivo demasiado grande',
        text: 'El tamaño máximo permitido por TikTok es de 500 MB.'
      });
      return;
    }

    // Revocar preview anterior si existía
    if (videoPreviewUrl) {
      URL.revokeObjectURL(videoPreviewUrl);
    }

    const previewUrl = URL.createObjectURL(file);
    setVideoFile(file);
    setVideoPreviewUrl(previewUrl);

    // Reset de portada para que tome el video nuevo
    setCoverPreviewUrl(null);
  };

  const handleRemoveVideo = () => {
    if (videoPreviewUrl) {
      URL.revokeObjectURL(videoPreviewUrl);
    }
    setVideoFile(null);
    setVideoPreviewUrl(null);
    setCoverPreviewUrl(null);
    if (videoInputRef.current) {
      videoInputRef.current.value = '';
    }
  };

  // Agregar hashtag chip
  const handleAddHashtag = () => {
    let tag = hashtagInput.trim().replace(/^#+/, '');
    if (!tag) return;
    if (!hashtags.includes(tag)) {
      setHashtags([...hashtags, tag]);
    }
    setHashtagInput('');
  };

  const handleRemoveHashtag = (tagToRemove: string) => {
    setHashtags(hashtags.filter(t => t !== tagToRemove));
  };

  // Capturar fotograma actual del video como portada
  const handleCaptureFrameAsCover = () => {
    const video = videoPlayerRef.current;
    if (!video) return;

    try {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 720;
      canvas.height = video.videoHeight || 1280;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setCoverPreviewUrl(dataUrl);
        setCoverTimestampMs(Math.round(video.currentTime * 1000) || 1000);
        Swal.fire({
          icon: 'success',
          title: 'Fotograma capturado',
          text: `Se seleccionó el fotograma en el segundo ${Math.round(video.currentTime)} como portada del video.`,
          timer: 1500,
          showConfirmButton: false
        });
      }
    } catch (e) {
      console.error('Error al capturar fotograma:', e);
    }
  };

  // Subir imagen personalizada para la portada
  const handleCoverImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      if (evt.target?.result) {
        setCoverPreviewUrl(evt.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  // --- Publicación Directa o Guardar Borrador (Pantalla 2) ---
  const handleSubmitPublish = async (isDraft: boolean = false) => {
    if (!globalAccount?.connected) {
      Swal.fire({
        icon: 'warning',
        title: 'Cuenta de TikTok requerida',
        text: 'Primero debes conectar tu cuenta de TikTok mediante Login Kit oficial.',
        confirmButtonText: 'Conectar cuenta',
        confirmButtonColor: '#10b981'
      }).then(res => {
        if (res.isConfirmed) setActiveTab('mi_cuenta');
      });
      return;
    }

    if (!videoFile) {
      Swal.fire({
        icon: 'warning',
        title: 'Video requerido',
        text: 'Por favor selecciona un video de tu computador para publicar en TikTok.'
      });
      return;
    }

    if (!description.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Descripción requerida',
        text: 'Ingresa una descripción para tu publicación de TikTok.'
      });
      return;
    }

    const formattedHashtags = hashtags.map(t => `#${t.replace(/^#+/, '')}`).join(' ');

    // Caso 1: Programar publicación
    if (publishMode === 'schedule' && !isDraft) {
      if (!scheduleDate || !scheduleTime) {
        Swal.fire({ icon: 'warning', text: 'Por favor define la fecha y hora para programar el video.' });
        return;
      }

      const scheduledAtIso = `${scheduleDate}T${scheduleTime}:00`;
      const scheduledDateObj = new Date(scheduledAtIso);
      if (scheduledDateObj.getTime() <= Date.now()) {
        Swal.fire({ icon: 'warning', text: 'La fecha y hora de programación debe ser en el futuro.' });
        return;
      }

      setIsSubmitting(true);
      Swal.fire({
        title: 'Programando publicación en TikTok...',
        text: 'Almacenando video y registrando tarea en el servidor de JUANDSTORE...',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
      });

      try {
        const formData = new FormData();
        formData.append('video', videoFile);
        formData.append('title', description.trim());
        formData.append('hashtags', formattedHashtags);
        formData.append('privacyLevel', privacyLevel);
        formData.append('allowComments', String(allowComments));
        formData.append('allowDuet', String(allowDuet));
        formData.append('allowStitch', String(allowStitch));
        formData.append('coverTimestampMs', String(coverTimestampMs));
        formData.append('scheduledAt', scheduledAtIso);
        formData.append('isDraft', 'false');

        await TikTokService.scheduleVideo(formData);
        await loadSchedule(currentWeekStart);

        Swal.fire({
          icon: 'success',
          title: '¡Video programado con éxito!',
          html: `Tu video se publicará automáticamente en TikTok el <b>${scheduleDate}</b> a las <b>${scheduleTime}</b>.<br/><br/><span class="text-xs text-gray-500">Puedes consultar la publicación en la pestaña "Programación semanal".</span>`,
          confirmButtonColor: '#10b981'
        });

        // Limpiar formulario
        handleRemoveVideo();
        setActiveTab('programacion');
      } catch (err: any) {
        Swal.fire({
          icon: 'error',
          title: 'Error al programar',
          text: err?.message || 'No se pudo programar el video en el servidor.',
          confirmButtonColor: '#ef4444'
        });
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // Caso 2: Publicación Inmediata (Directa o Borrador)
    setIsSubmitting(true);
    Swal.fire({
      title: isDraft ? 'Enviando borrador a TikTok...' : 'Publicando video en TikTok...',
      text: isDraft 
        ? 'Transmitiendo video a TikTok Inbox API...' 
        : 'Iniciando Content Posting API oficial y subiendo video a TikTok...',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading()
    });

    try {
      const formData = new FormData();
      formData.append('video', videoFile);
      formData.append('title', description.trim());
      formData.append('hashtags', formattedHashtags);
      formData.append('privacyLevel', privacyLevel);
      formData.append('allowComments', String(allowComments));
      formData.append('allowDuet', String(allowDuet));
      formData.append('allowStitch', String(allowStitch));
      formData.append('coverTimestampMs', String(coverTimestampMs));
      formData.append('isDraft', String(isDraft));

      const res = await TikTokService.publishVideo(formData);
      await loadHistory();
      await loadSummary();

      Swal.fire({
        icon: 'success',
        title: isDraft ? '¡Borrador enviado a TikTok!' : '¡Publicado con éxito en TikTok!',
        html: `
          <div class="text-left text-sm space-y-2">
            <p>${res.message}</p>
            <div class="bg-gray-100 p-2 rounded text-xs font-mono break-all text-gray-700">
              <b>Publish ID TikTok:</b> ${res.publishId || 'Generado'}
            </div>
            ${isDraft ? '<p class="text-xs text-amber-600">Abre tu app oficial de TikTok en el teléfono para revisar y publicar el borrador.</p>' : ''}
          </div>
        `,
        confirmButtonColor: '#10b981'
      });

      // Limpiar formulario y navegar al historial
      handleRemoveVideo();
      setActiveTab('historial');
    } catch (err: any) {
      // Manejo estricto de errores de la API oficial de TikTok
      Swal.fire({
        icon: 'error',
        title: 'TikTok rechazó la publicación',
        html: `
          <div class="text-left text-sm space-y-3">
            <p class="text-red-600 font-medium">${err?.message || 'Error desconocido al comunicar con TikTok.'}</p>
            <div class="bg-amber-50 border border-amber-200 p-3 rounded text-xs text-amber-800">
              <b>Nota de la integración oficial:</b><br/>
              Si TikTok indica que el permiso <code>video.publish</code> no está autorizado, tu app de TikTok Developers debe recibir aprobación para publicación directa o tu cuenta debe estar registrada como Tester en la consola de TikTok Developers.
            </div>
          </div>
        `,
        confirmButtonColor: '#ef4444'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Eliminar video programado
  const handleDeleteScheduled = async (id: number) => {
    const confirm = await Swal.fire({
      title: '¿Eliminar publicación programada?',
      text: 'Esta acción cancelará la publicación automática del video.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#ef4444'
    });

    if (confirm.isConfirmed) {
      try {
        await TikTokService.deleteScheduledVideo(id);
        await loadSchedule(currentWeekStart);
        Swal.fire({
          icon: 'success',
          title: 'Eliminado',
          text: 'La publicación programada fue cancelada correctamente.',
          timer: 1500,
          showConfirmButton: false
        });
      } catch (err: any) {
        Swal.fire({ icon: 'error', text: err?.message || 'No se pudo eliminar el video programado.' });
      }
    }
  };

  // Navegación de semanas en el calendario
  const handleWeekChange = (offsetDays: number) => {
    const current = new Date(currentWeekStart);
    current.setDate(current.getDate() + offsetDays);
    const newStart = current.toISOString().split('T')[0];
    setCurrentWeekStart(newStart);
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      
      {/* ============================================================ */}
      {/* HEADER SUPERIOR CON TITULO Y TABS                           */}
      {/* ============================================================ */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-black text-white rounded-xl flex items-center justify-center shadow-md">
            <TikTokLogoIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight">CONTROL TIKTOK</h1>
              <span className="px-2 py-0.5 text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
                Oficial OAuth 2.0
              </span>
            </div>
            <p className="text-xs md:text-sm text-gray-500 font-medium">
              Gestión de contenido y publicaciones en TikTok
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Badge Administrador Global */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg text-xs font-semibold text-gray-700 border border-gray-200">
            <User className="w-4 h-4 text-gray-500" />
            <span>Administrador Global</span>
          </div>

          {/* Botón Configuración de Credenciales */}
          <button
            onClick={() => setIsConfigModalOpen(true)}
            title="Configurar credenciales de TikTok Developers"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-lg text-xs font-semibold shadow-sm transition-colors"
          >
            <Settings className="w-4 h-4 text-gray-500" />
            <span>Credenciales API</span>
          </button>
        </div>
      </div>

      {/* TABS DE NAVEGACION (Matching Screenshot 2) */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('resumen')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs md:text-sm font-bold transition-all whitespace-nowrap ${
            activeTab === 'resumen'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Resumen</span>
        </button>

        <button
          onClick={() => setActiveTab('mi_cuenta')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs md:text-sm font-bold transition-all whitespace-nowrap ${
            activeTab === 'mi_cuenta'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Mi cuenta</span>
          {globalAccount?.connected && (
            <span className="w-2 h-2 rounded-full bg-emerald-300 ring-2 ring-white"></span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('publicar')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs md:text-sm font-bold transition-all whitespace-nowrap ${
            activeTab === 'publicar'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          <UploadCloud className="w-4 h-4" />
          <span>Publicar video</span>
        </button>

        <button
          onClick={() => setActiveTab('programacion')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs md:text-sm font-bold transition-all whitespace-nowrap ${
            activeTab === 'programacion'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Programación semanal</span>
        </button>

        <button
          onClick={() => setActiveTab('historial')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs md:text-sm font-bold transition-all whitespace-nowrap ${
            activeTab === 'historial'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Historial</span>
        </button>
      </div>

      {/* ============================================================ */}
      {/* PESTAÑA: MI CUENTA (Matching Screenshot 1)                   */}
      {/* ============================================================ */}
      {activeTab === 'mi_cuenta' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Banner explicativo con 3 pasos (Matching Image 1) */}
          <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-black rounded-2xl p-6 text-white shadow-lg">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-5 border-b border-gray-700/60">
              <div>
                <h2 className="text-lg md:text-xl font-black tracking-tight text-white flex items-center gap-2">
                  <span>Conexión de tu cuenta de TikTok (Real)</span>
                </h2>
                <p className="text-xs md:text-sm text-gray-300 mt-1">
                  Conecta tu cuenta oficial de TikTok a JUANDSTORE mediante la autorización oficial de TikTok (OAuth 2.0).
                </p>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 border border-emerald-400/40 rounded-full text-emerald-300 text-xs font-semibold whitespace-nowrap">
                <ShieldCheck className="w-4 h-4" />
                <span>Proceso oficial y seguro</span>
              </div>
            </div>

            {/* 3 Pasos Ilustrativos */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-800/80 border border-gray-700/60 rounded-xl p-4 flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-emerald-500 text-black font-black flex items-center justify-center shrink-0 text-sm">
                  1
                </div>
                <div>
                  <h3 className="text-xs md:text-sm font-bold text-white">Inicia la conexión</h3>
                  <p className="text-xs text-gray-300 mt-1 leading-relaxed">
                    En JUANDSTORE, ve a Control TikTok &gt; Mi cuenta y haz clic en "Conectar con TikTok".
                  </p>
                </div>
              </div>

              <div className="bg-gray-800/80 border border-gray-700/60 rounded-xl p-4 flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-emerald-500 text-black font-black flex items-center justify-center shrink-0 text-sm">
                  2
                </div>
                <div>
                  <h3 className="text-xs md:text-sm font-bold text-white">Autoriza en TikTok</h3>
                  <p className="text-xs text-gray-300 mt-1 leading-relaxed">
                    Serás redirigido a la página oficial de TikTok, inicia sesión y autoriza los permisos solicitados.
                  </p>
                </div>
              </div>

              <div className="bg-gray-800/80 border border-gray-700/60 rounded-xl p-4 flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-emerald-500 text-black font-black flex items-center justify-center shrink-0 text-sm">
                  3
                </div>
                <div>
                  <h3 className="text-xs md:text-sm font-bold text-white">Cuenta conectada</h3>
                  <p className="text-xs text-gray-300 mt-1 leading-relaxed">
                    Regresarás automáticamente a JUANDSTORE y verás tu cuenta vinculada.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Estado de la Cuenta: NO CONECTADA (Matching Image 1 Left Screen) */}
          {!globalAccount?.connected ? (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8">
              <div className="flex items-center justify-between pb-6 border-b border-gray-100">
                <div>
                  <h2 className="text-lg font-black text-gray-900">Mi cuenta de TikTok</h2>
                  <p className="text-xs md:text-sm text-gray-500 mt-0.5">
                    Conecta tu cuenta oficial para publicar y gestionar tu contenido.
                  </p>
                </div>
                <span className="px-3 py-1 text-xs font-bold rounded-full bg-gray-100 text-gray-600 border border-gray-200 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                  Sin conectar
                </span>
              </div>

              {/* Caja Central de Conexión TikTok */}
              <div className="py-12 px-4 max-w-md mx-auto text-center flex flex-col items-center">
                <div className="w-20 h-20 bg-black text-white rounded-3xl flex items-center justify-center shadow-xl mb-5 hover:scale-105 transition-transform">
                  <TikTokLogoIcon className="w-10 h-10" />
                </div>
                
                <h3 className="text-xl font-black text-gray-900 mb-2">Conecta tu cuenta de TikTok</h3>
                <p className="text-xs md:text-sm text-gray-500 mb-6 leading-relaxed">
                  Vincula tu cuenta oficial de forma segura con TikTok Login Kit. No almacenamos contraseñas dentro de JUANDSTORE.
                </p>

                <button
                  onClick={handleConnectWithTikTok}
                  className="w-full sm:w-auto px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2.5"
                >
                  <TikTokLogoIcon className="w-5 h-5 text-white" />
                  <span>Conectar con TikTok</span>
                </button>

                <p className="text-xs text-gray-400 mt-4 flex items-center justify-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Serás redirigido a TikTok para iniciar sesión y autorizar los permisos.</span>
                </p>

                <div className="mt-8 pt-6 border-t border-gray-100 w-full text-center">
                  <button
                    onClick={() => setIsConfigModalOpen(true)}
                    className="text-xs text-gray-500 hover:text-emerald-600 font-semibold inline-flex items-center gap-1 underline underline-offset-2"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    <span>Configurar Client Key y Secret de TikTok Developers</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Estado de la Cuenta: CONECTADA (Matching Image 1 Right Screen) */
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8">
              <div className="flex items-center justify-between pb-6 border-b border-gray-100">
                <div>
                  <h2 className="text-lg font-black text-gray-900">Mi cuenta de TikTok</h2>
                  <p className="text-xs md:text-sm text-gray-500 mt-0.5">
                    Cuenta vinculada para publicar y gestionar tu contenido.
                  </p>
                </div>
                <span className="px-3 py-1 text-xs font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5" />
                  Conectada
                </span>
              </div>

              {/* Ficha de Usuario Conectado */}
              <div className="py-6 max-w-xl mx-auto">
                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 space-y-6">
                  {/* Avatar y Nombre */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {globalAccount.avatarUrl ? (
                        <img
                          src={globalAccount.avatarUrl}
                          alt={globalAccount.username}
                          className="w-16 h-16 rounded-full object-cover ring-2 ring-emerald-500 shadow"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-black text-white flex items-center justify-center text-xl font-black shadow">
                          <TikTokLogoIcon className="w-8 h-8" />
                        </div>
                      )}
                      <div>
                        <h3 className="text-lg font-black text-gray-900">
                          {globalAccount.username || '@tu_cuenta'}
                        </h3>
                        <p className="text-xs text-gray-500 font-medium">
                          {globalAccount.displayName || 'Cuenta de TikTok'}
                        </p>
                      </div>
                    </div>
                    <div className="text-gray-400">
                      <MoreVertical className="w-5 h-5" />
                    </div>
                  </div>

                  {/* Detalles de la Conexión */}
                  <div className="space-y-3 pt-4 border-t border-gray-200/80 text-xs text-gray-700">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 flex items-center gap-1.5 font-medium">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        Conectada el:
                      </span>
                      <span className="font-bold text-gray-900">
                        {globalAccount.connectedAt ? new Date(globalAccount.connectedAt).toLocaleDateString('es-CO', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        }) : 'Recientemente'}
                      </span>
                    </div>

                    <div className="flex items-start justify-between gap-4">
                      <span className="text-gray-500 flex items-center gap-1.5 font-medium shrink-0">
                        <ShieldCheck className="w-4 h-4 text-gray-400" />
                        Permisos:
                      </span>
                      <span className="font-semibold text-gray-900 text-right">
                        {globalAccount.permissions || 'Perfil, carga y publicación de videos'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-gray-500 flex items-center gap-1.5 font-medium">
                        <Lock className="w-4 h-4 text-gray-400" />
                        Estado API:
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        globalAccount.canPublishDirectly
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {globalAccount.canPublishDirectly ? '✓ Publicación directa activa' : 'Borradores activos · video.publish en revisión'}
                      </span>
                    </div>
                  </div>

                  {/* Acciones de la cuenta */}
                  <div className="pt-4 border-t border-gray-200/80 flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={handleDisconnect}
                      className="flex-1 px-4 py-2.5 border border-red-200 text-red-600 hover:bg-red-50 font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-2"
                    >
                      <Unlink className="w-4 h-4" />
                      <span>Desconectar cuenta</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('publicar')}
                      className="flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-sm transition-colors flex items-center justify-center gap-2"
                    >
                      <UploadCloud className="w-4 h-4" />
                      <span>Publicar un video</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Banner Importante al pie */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-xs text-emerald-900 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Importante</p>
              <p className="text-emerald-800 mt-0.5 leading-relaxed">
                Esta es la forma real y segura de conectar tu cuenta. La publicación de videos depende de los permisos que otorgues y, en algunos casos, de la aprobación de TikTok según sus políticas de Content Posting API.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* PESTAÑA: PUBLICAR VIDEO (Matching Screenshot 2)              */}
      {/* ============================================================ */}
      {activeTab === 'publicar' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Header de la sección */}
          <div>
            <h2 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
              <UploadCloud className="w-6 h-6 text-emerald-600" />
              <span>Publicar video</span>
            </h2>
            <p className="text-xs md:text-sm text-gray-500 mt-0.5">
              Sube y publica tu contenido en TikTok desde JUANDSTORE.
            </p>
          </div>

          {/* Grid de 3 Columnas (Matching Screenshot 2) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* ---------------------------------------------------- */}
            {/* COLUMNA 1 (Izquierda): SUBE TU VIDEO Y PREVIEW       */}
            {/* ---------------------------------------------------- */}
            <div className="lg:col-span-4 bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <h3 className="text-sm font-black text-gray-900">Sube tu video</h3>
                {videoFile && (
                  <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                    {(videoFile.size / (1024 * 1024)).toFixed(1)} MB
                  </span>
                )}
              </div>

              {/* Input oculto de archivo */}
              <input
                ref={videoInputRef}
                type="file"
                accept="video/mp4,video/quicktime,.mp4,.mov"
                onChange={handleVideoSelect}
                className="hidden"
              />

              {/* Dropzone de subida */}
              {!videoPreviewUrl ? (
                <div
                  onClick={() => videoInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 hover:border-emerald-500 bg-gray-50 hover:bg-emerald-50/20 rounded-2xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[260px] group"
                >
                  <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <UploadCloud className="w-7 h-7" />
                  </div>
                  <p className="text-xs font-bold text-gray-800 mb-1">
                    Arrastra y suelta el archivo aquí o haz clic para seleccionarlo
                  </p>
                  <button
                    type="button"
                    className="mt-3 px-4 py-2 border border-emerald-500 text-emerald-700 bg-white hover:bg-emerald-50 rounded-lg text-xs font-bold shadow-sm transition-colors"
                  >
                    Seleccionar archivo
                  </button>
                  <div className="mt-5 text-[11px] text-gray-400 space-y-0.5">
                    <p>Formatos: MP4, MOV | Peso máximo: 500 MB</p>
                    <p>Duración recomendada: 5 s - 10 min</p>
                  </div>
                </div>
              ) : (
                /* Video Player Preview con botón papelera (Matching Image 2) */
                <div className="space-y-3">
                  <div className="relative rounded-2xl overflow-hidden bg-black aspect-[9/16] max-h-[460px] flex items-center justify-center group shadow-md">
                    <video
                      ref={videoPlayerRef}
                      src={videoPreviewUrl}
                      controls
                      playsInline
                      className="w-full h-full object-contain"
                    />

                    {/* Botón papelera en esquina superior derecha */}
                    <button
                      type="button"
                      onClick={handleRemoveVideo}
                      title="Quitar video"
                      className="absolute top-3 right-3 p-2 bg-black/70 hover:bg-red-600 text-white rounded-full backdrop-blur-sm transition-all shadow-md"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500 px-1">
                    <span className="truncate max-w-[200px] font-medium text-gray-700">
                      {videoFile?.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => videoInputRef.current?.click()}
                      className="text-emerald-600 font-bold hover:underline"
                    >
                      Cambiar video
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* ---------------------------------------------------- */}
            {/* COLUMNA 2 (Centro): DETALLES DEL VIDEO               */}
            {/* ---------------------------------------------------- */}
            <div className="lg:col-span-4 bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-5">
              <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
                <FileText className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-black text-gray-900">Detalles del video</h3>
              </div>

              {/* Descripción */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-800">
                    Descripción *
                  </label>
                  <span className="text-[11px] text-gray-400 font-medium">
                    {description.length} / 2.200
                  </span>
                </div>
                <textarea
                  rows={4}
                  maxLength={2200}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Escribe la descripción de tu video para TikTok..."
                  className="w-full text-xs text-gray-800 bg-gray-50 border border-gray-200 rounded-xl p-3 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none font-medium leading-relaxed"
                />
              </div>

              {/* Hashtags */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-800 flex items-center gap-1">
                  <span># Hashtags</span>
                </label>

                {/* Chips de Hashtags */}
                <div className="flex flex-wrap gap-1.5 min-h-[32px]">
                  {hashtags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-800 rounded-lg text-xs font-semibold border border-gray-200"
                    >
                      <span>#{tag}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveHashtag(tag)}
                        className="text-gray-400 hover:text-red-500 font-bold ml-0.5"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>

                {/* Input para agregar nuevo hashtag */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={hashtagInput}
                    onChange={(e) => setHashtagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddHashtag();
                      }
                    }}
                    placeholder="Agregar hashtag..."
                    className="flex-1 text-xs bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddHashtag}
                    className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Portada del video */}
              <div className="space-y-2 pt-2 border-t border-gray-100">
                <label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                  <Film className="w-3.5 h-3.5 text-gray-500" />
                  <span>Portada del video</span>
                </label>

                <div className="flex items-center gap-4">
                  {/* Thumbnail Preview */}
                  <div className="w-16 h-20 bg-black rounded-xl overflow-hidden flex items-center justify-center shrink-0 border border-gray-200 shadow-sm">
                    {coverPreviewUrl ? (
                      <img src={coverPreviewUrl} alt="Portada" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-white font-black text-xl">J</span>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    {/* Input oculto de imagen de portada */}
                    <input
                      ref={coverInputRef}
                      type="file"
                      accept="image/jpeg,image/png"
                      onChange={handleCoverImageSelect}
                      className="hidden"
                    />

                    <div className="flex flex-wrap gap-2">
                      {videoPreviewUrl && (
                        <button
                          type="button"
                          onClick={handleCaptureFrameAsCover}
                          className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-xs font-bold transition-colors"
                        >
                          Capturar fotograma
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => coverInputRef.current?.click()}
                        className="px-3 py-1.5 border border-emerald-500 text-emerald-700 bg-white hover:bg-emerald-50 rounded-lg text-xs font-bold shadow-sm transition-colors"
                      >
                        Seleccionar portada
                      </button>
                    </div>
                    <p className="text-[11px] text-gray-400">
                      Puedes elegir un fotograma del video o subir una imagen (.jpg / .png)
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* ---------------------------------------------------- */}
            {/* COLUMNA 3 (Derecha): CUENTA, PRIVACIDAD Y CALENDARIO */}
            {/* ---------------------------------------------------- */}
            <div className="lg:col-span-4 space-y-4">
              
              {/* Card 1: Cuenta de TikTok */}
              <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <TikTokLogoIcon className="w-4 h-4 text-black" />
                  <h3 className="text-xs font-black text-gray-900">Cuenta de TikTok</h3>
                </div>

                {globalAccount?.connected ? (
                  <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="flex items-center gap-3">
                      {globalAccount.avatarUrl ? (
                        <img
                          src={globalAccount.avatarUrl}
                          alt={globalAccount.username}
                          className="w-9 h-9 rounded-full object-cover ring-1 ring-emerald-500"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-black text-white font-black text-xs flex items-center justify-center">
                          J
                        </div>
                      )}
                      <div>
                        <p className="text-xs font-bold text-gray-900 leading-none">
                          {globalAccount.username || '@juandstore'}
                        </p>
                        <p className="text-[11px] text-gray-500 mt-1">
                          {globalAccount.displayName || 'JUANDSTORE'}
                        </p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      Conectada
                    </span>
                  </div>
                ) : (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between">
                    <div className="text-xs text-amber-800 font-semibold">
                      Sin cuenta vinculada
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab('mi_cuenta')}
                      className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg text-xs font-bold"
                    >
                      Conectar
                    </button>
                  </div>
                )}
              </div>

              {/* Card 2: Configuración de publicación */}
              <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm space-y-3.5">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                  <Settings className="w-4 h-4 text-gray-700" />
                  <h3 className="text-xs font-black text-gray-900">Configuración de publicación</h3>
                </div>

                {/* Privacidad */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-gray-400" />
                    Privacidad
                  </span>
                  <select
                    value={privacyLevel}
                    onChange={(e: any) => setPrivacyLevel(e.target.value)}
                    className="text-xs font-semibold bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="PUBLIC_TO_EVERYONE">🌐 Público</option>
                    <option value="MUTUAL_FOLLOW_FRIENDS">👥 Amigos</option>
                    <option value="SELF_ONLY">🔒 Solo yo</option>
                  </select>
                </div>

                {/* Permitir comentarios */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-700 font-medium flex items-center gap-1.5">
                    <MessageCircle className="w-3.5 h-3.5 text-gray-400" />
                    Permitir comentarios
                  </span>
                  <input
                    type="checkbox"
                    checked={allowComments}
                    onChange={(e) => setAllowComments(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 accent-emerald-600 cursor-pointer"
                  />
                </div>

                {/* Permitir dúos */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-700 font-medium flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-gray-400" />
                    Permitir dúos
                  </span>
                  <input
                    type="checkbox"
                    checked={allowDuet}
                    onChange={(e) => setAllowDuet(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 accent-emerald-600 cursor-pointer"
                  />
                </div>

                {/* Permitir pegado (Stitch) */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-700 font-medium flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-gray-400" />
                    Permitir pegado (Stitch)
                  </span>
                  <input
                    type="checkbox"
                    checked={allowStitch}
                    onChange={(e) => setAllowStitch(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 accent-emerald-600 cursor-pointer"
                  />
                </div>
              </div>

              {/* Card 3: ¿Cuándo quieres publicar? */}
              <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                  <Calendar className="w-4 h-4 text-gray-700" />
                  <h3 className="text-xs font-black text-gray-900">¿Cuándo quieres publicar?</h3>
                </div>

                {/* Opción 1: Publicar ahora */}
                <label
                  onClick={() => setPublishMode('now')}
                  className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    publishMode === 'now'
                      ? 'border-emerald-500 bg-emerald-50/30'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="publishMode"
                    checked={publishMode === 'now'}
                    onChange={() => setPublishMode('now')}
                    className="mt-0.5 text-emerald-600 accent-emerald-600"
                  />
                  <div>
                    <p className="text-xs font-bold text-gray-900">Publicar ahora</p>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      Se publicará inmediatamente en TikTok
                    </p>
                  </div>
                </label>

                {/* Opción 2: Programar publicación */}
                <label
                  onClick={() => setPublishMode('schedule')}
                  className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    publishMode === 'schedule'
                      ? 'border-emerald-500 bg-emerald-50/30'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="publishMode"
                    checked={publishMode === 'schedule'}
                    onChange={() => setPublishMode('schedule')}
                    className="mt-0.5 text-emerald-600 accent-emerald-600"
                  />
                  <div className="flex-1">
                    <p className="text-xs font-bold text-gray-900">Programar publicación</p>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      Elige una fecha y hora para publicarlo
                    </p>

                    {publishMode === 'schedule' && (
                      <div className="mt-3 grid grid-cols-2 gap-2 pt-2 border-t border-emerald-100">
                        <div>
                          <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">
                            Fecha
                          </label>
                          <input
                            type="date"
                            value={scheduleDate}
                            onChange={(e) => setScheduleDate(e.target.value)}
                            className="w-full text-xs bg-white border border-gray-200 rounded-lg p-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">
                            Hora
                          </label>
                          <input
                            type="time"
                            value={scheduleTime}
                            onChange={(e) => setScheduleTime(e.target.value)}
                            className="w-full text-xs bg-white border border-gray-200 rounded-lg p-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </label>
              </div>

            </div>
          </div>

          {/* ============================================================ */}
          {/* BARRA DE ACCIONES INFERIOR (Matching Screenshot 2)           */}
          {/* ============================================================ */}
          <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-gray-500 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                {publishMode === 'schedule'
                  ? 'El servidor de JUANDSTORE ejecutará la publicación a la fecha y hora seleccionada.'
                  : 'Publicación oficial mediante TikTok Content Posting API v2.'}
              </span>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              {/* Botón Guardar Borrador */}
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleSubmitPublish(true)}
                className="px-5 py-2.5 border border-gray-300 hover:bg-gray-100 text-gray-700 font-bold rounded-xl text-xs transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
              >
                <Save className="w-4 h-4 text-gray-500" />
                <span>Guardar borrador</span>
              </button>

              {/* Botón Publicar en TikTok / Programar */}
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleSubmitPublish(false)}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors flex items-center gap-2 shadow-md hover:shadow-lg disabled:opacity-50"
              >
                {publishMode === 'schedule' ? (
                  <>
                    <Calendar className="w-4 h-4 text-white" />
                    <span>Programar publicación</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 text-white" />
                    <span>Publicar en TikTok</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* PESTAÑA: PROGRAMACION SEMANAL (Calendario Lunes - Domingo)   */}
      {/* ============================================================ */}
      {activeTab === 'programacion' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Barra de Navegación de Semanas */}
          <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-gray-900">Programación semanal</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Semana: {schedule?.weekStart || currentWeekStart} al {schedule?.weekEnd || ''}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleWeekChange(-7)}
                className="p-2 border border-gray-200 hover:bg-gray-50 rounded-xl text-gray-700 text-xs font-bold transition-colors flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Semana anterior</span>
              </button>

              <button
                onClick={() => setCurrentWeekStart(new Date().toISOString().split('T')[0])}
                className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-700 text-xs font-bold transition-colors"
              >
                Hoy
              </button>

              <button
                onClick={() => handleWeekChange(7)}
                className="p-2 border border-gray-200 hover:bg-gray-50 rounded-xl text-gray-700 text-xs font-bold transition-colors flex items-center gap-1"
              >
                <span>Semana siguiente</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => setActiveTab('publicar')}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Programar video</span>
              </button>
            </div>
          </div>

          {/* Tarjetas KPI de Programación */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <p className="text-xs font-bold text-gray-500 uppercase">Videos programados</p>
              <p className="text-2xl font-black text-gray-900 mt-1">{schedule?.videosProgramados || 0}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <p className="text-xs font-bold text-gray-500 uppercase">Días con contenido</p>
              <p className="text-2xl font-black text-emerald-600 mt-1">{schedule?.diasConContenido || 0} / 7</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <p className="text-xs font-bold text-gray-500 uppercase">Promedio diario</p>
              <p className="text-2xl font-black text-gray-900 mt-1">{schedule?.promedioDiario || 0}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <p className="text-xs font-bold text-gray-500 uppercase">Actividad semanal</p>
              <p className="text-2xl font-black text-blue-600 mt-1">{schedule?.programacionActiva || 0}%</p>
            </div>
          </div>

          {/* Grilla Semanal: Lunes a Domingo */}
          <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
            {schedule?.days?.map((day) => (
              <div
                key={day.date}
                className="bg-white rounded-xl border border-gray-200 p-3 shadow-sm min-h-[220px] flex flex-col justify-between"
              >
                <div>
                  {/* Encabezado del día */}
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-100">
                    <span className="text-xs font-black text-gray-900 uppercase">
                      {day.dayName}
                    </span>
                    <span className="text-xs font-bold text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded">
                      {day.dayNumber}
                    </span>
                  </div>

                  {/* Lista de videos programados para ese día */}
                  <div className="space-y-2">
                    {day.videos?.length === 0 ? (
                      <p className="text-[11px] text-gray-400 italic text-center py-6">
                        Sin publicaciones
                      </p>
                    ) : (
                      day.videos?.map((vid) => (
                        <div
                          key={vid.id}
                          className="bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg p-2.5 transition-colors group relative"
                        >
                          <div className="flex items-start justify-between gap-1 mb-1">
                            <p className="text-xs font-bold text-gray-800 line-clamp-2 leading-tight">
                              {vid.title}
                            </p>
                            <button
                              onClick={() => handleDeleteScheduled(vid.id)}
                              title="Cancelar video"
                              className="text-gray-400 hover:text-red-500 transition-colors p-0.5 shrink-0"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="flex items-center justify-between text-[10px] text-gray-500 mt-2">
                            <span className="font-semibold text-gray-600">
                              {new Date(vid.scheduledAt).toLocaleTimeString('es-CO', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                            <span className={`px-1.5 py-0.5 rounded font-bold ${
                              vid.status === 'PUBLICADO'
                                ? 'bg-emerald-100 text-emerald-800'
                                : vid.status === 'ERROR'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {vid.status}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Botón rápido programar en este día */}
                <button
                  onClick={() => {
                    setScheduleDate(day.date);
                    setPublishMode('schedule');
                    setActiveTab('publicar');
                  }}
                  className="w-full mt-3 py-1 text-[11px] font-bold text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded border border-dashed border-gray-200 transition-colors"
                >
                  + Programar
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* PESTAÑA: HISTORIAL                                           */}
      {/* ============================================================ */}
      {activeTab === 'historial' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Tarjetas de Métricas Acumuladas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Eye className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase">Visualizaciones</p>
                <p className="text-xl font-black text-gray-900 mt-0.5">{historyMetrics.views.toLocaleString()}</p>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                <Heart className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase">Me gusta</p>
                <p className="text-xl font-black text-gray-900 mt-0.5">{historyMetrics.likes.toLocaleString()}</p>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase">Comentarios</p>
                <p className="text-xl font-black text-gray-900 mt-0.5">{historyMetrics.comments.toLocaleString()}</p>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Share2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase">Compartidos</p>
                <p className="text-xl font-black text-gray-900 mt-0.5">{historyMetrics.shares.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Filtros de Búsqueda */}
          <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                placeholder="Buscar por título o hashtag..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={loadHistory}
                className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Actualizar</span>
              </button>
            </div>
          </div>

          {/* Tabla / Tarjetas de Videos Publicados */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            {historyVideos.length === 0 ? (
              <div className="py-16 text-center text-gray-400 text-xs font-medium">
                No hay videos registrados en el historial. Publica un video desde JUANDSTORE para verlo aquí.
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {historyVideos.map((vid) => (
                  <div
                    key={vid.id}
                    className="p-4 hover:bg-gray-50/80 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4">
                      {/* Portada */}
                      <div className="w-14 h-18 bg-black rounded-lg overflow-hidden flex items-center justify-center shrink-0 border border-gray-200">
                        {vid.thumbnailUrl ? (
                          <img src={vid.thumbnailUrl} alt={vid.title} className="w-full h-full object-cover" />
                        ) : (
                          <TikTokLogoIcon className="w-6 h-6 text-white" />
                        )}
                      </div>

                      <div className="space-y-1">
                        <h4 className="text-xs md:text-sm font-bold text-gray-900 line-clamp-1">
                          {vid.title}
                        </h4>
                        <p className="text-[11px] text-gray-500 line-clamp-1">
                          {vid.description}
                        </p>
                        <div className="flex items-center gap-3 text-[11px] text-gray-400 pt-0.5">
                          <span>
                            {vid.publishedAt ? new Date(vid.publishedAt).toLocaleDateString('es-CO', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            }) : 'Reciente'}
                          </span>
                          <span>•</span>
                          <span>Duración: {vid.duration || '0:30'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Métricas del Video */}
                    <div className="flex items-center gap-6 text-xs text-gray-600 w-full sm:w-auto justify-between sm:justify-end">
                      <div className="flex items-center gap-1.5" title="Visualizaciones">
                        <Eye className="w-4 h-4 text-gray-400" />
                        <span className="font-bold">{(vid.viewCount || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-1.5" title="Me gusta">
                        <Heart className="w-4 h-4 text-red-500" />
                        <span className="font-bold">{(vid.likeCount || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-1.5" title="Comentarios">
                        <MessageCircle className="w-4 h-4 text-emerald-500" />
                        <span className="font-bold">{(vid.commentCount || 0).toLocaleString()}</span>
                      </div>
                      {vid.videoUrl && (
                        <a
                          href={vid.videoUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-[11px] font-bold text-gray-700 flex items-center gap-1"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Ver</span>
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* PESTAÑA: RESUMEN                                             */}
      {/* ============================================================ */}
      {activeTab === 'resumen' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Métricas Principales */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <p className="text-xs font-bold text-gray-500 uppercase">Videos publicados</p>
              <p className="text-3xl font-black text-gray-900 mt-2">{summary?.videosPublicados || 0}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <p className="text-xs font-bold text-gray-500 uppercase">Visualizaciones totales</p>
              <p className="text-3xl font-black text-blue-600 mt-2">{(summary?.visualizacionesAcumuladas || 0).toLocaleString()}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <p className="text-xs font-bold text-gray-500 uppercase">Me gusta totales</p>
              <p className="text-3xl font-black text-red-500 mt-2">{(summary?.meGusta || 0).toLocaleString()}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <p className="text-xs font-bold text-gray-500 uppercase">Comentarios totales</p>
              <p className="text-3xl font-black text-emerald-600 mt-2">{(summary?.comentarios || 0).toLocaleString()}</p>
            </div>
          </div>

          {/* Videos Recientes */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-sm font-black text-gray-900">Últimas publicaciones</h3>
              <button
                onClick={() => setActiveTab('historial')}
                className="text-xs text-emerald-600 font-bold hover:underline"
              >
                Ver historial completo →
              </button>
            </div>

            {summary?.recentVideos?.length === 0 ? (
              <p className="text-xs text-gray-400 py-6 text-center">
                Aún no hay videos registrados en TikTok.
              </p>
            ) : (
              <div className="space-y-3">
                {summary?.recentVideos?.map((vid) => (
                  <div
                    key={vid.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-black text-white flex items-center justify-center font-bold text-xs">
                        J
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-900 line-clamp-1">{vid.title}</p>
                        <p className="text-[11px] text-gray-500">
                          {vid.publishedAt ? new Date(vid.publishedAt).toLocaleDateString() : 'Reciente'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs font-semibold text-gray-600">
                      <span>{(vid.viewCount || 0).toLocaleString()} vistas</span>
                      <span className="text-red-500 font-bold">♥ {(vid.likeCount || 0).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: CONFIGURACION DE CREDENCIALES TIKTOK DEVELOPERS       */}
      {/* ============================================================ */}
      {isConfigModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-gray-800" />
                <h3 className="text-sm md:text-base font-black text-gray-900">
                  Credenciales de TikTok Developers
                </h3>
              </div>
              <button
                onClick={() => setIsConfigModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-gray-500 leading-relaxed">
              Ingresa el <b>Client Key</b> y <b>Client Secret</b> obtenidos desde tu consola en{' '}
              <a
                href="https://developers.tiktok.com"
                target="_blank"
                rel="noreferrer"
                className="text-emerald-600 font-bold hover:underline"
              >
                developers.tiktok.com
              </a>.
            </p>

            <form onSubmit={handleSaveConfig} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-800">
                  TikTok Client Key (App ID) *
                </label>
                <input
                  type="text"
                  required
                  value={inputClientKey}
                  onChange={(e) => setInputClientKey(e.target.value)}
                  placeholder="e.g. sbawl... o aw7g..."
                  className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl p-2.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-800">
                  TikTok Client Secret *
                </label>
                <input
                  type="password"
                  required
                  value={inputClientSecret}
                  onChange={(e) => setInputClientSecret(e.target.value)}
                  placeholder="••••••••••••••••••••••••"
                  className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl p-2.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-800">
                  Redirect URI registrada en tu app de TikTok
                </label>
                <input
                  type="text"
                  value={inputRedirectUri}
                  onChange={(e) => setInputRedirectUri(e.target.value)}
                  placeholder="http://localhost:3000/admin/tiktok/callback"
                  className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl p-2.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                />
                <p className="text-[11px] text-gray-400">
                  Asegúrate de registrar exactamente esta misma URL en las Redirect URIs de Login Kit en developers.tiktok.com.
                </p>
              </div>

              <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 text-[11px] text-gray-600 space-y-1">
                <p className="font-bold text-gray-800">Permisos requeridos en TikTok Developers:</p>
                <p>• <code>user.info.basic</code>: Perfil oficial del usuario</p>
                <p>• <code>video.list</code>: Historial de videos públicos</p>
                <p>• <code>video.publish</code>: Publicación directa de videos</p>
                <p>• <code>video.upload</code>: Carga de borradores al inbox</p>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsConfigModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl text-xs font-bold hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
                >
                  Guardar credenciales
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
