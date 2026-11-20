import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  ArrowLeft, 
  ShieldCheck, 
  Lock, 
  ExternalLink 
} from 'lucide-react';
import { TikTokService } from '../../services/api';

function TikTokLogoIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .58.04.86.12V9.32a6.34 6.34 0 0 0-.86-.06 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V9.45a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.88z"/>
    </svg>
  );
}

export default function TikTokCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error' | 'no_code'>('idle');
  const [accountInfo, setAccountInfo] = useState<{ username?: string; displayName?: string; permissions?: string } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const executedRef = useRef(false);

  useEffect(() => {
    if (executedRef.current) return;

    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');
    const errorDesc = searchParams.get('error_description');

    // 1. Si TikTok retornó un error o el usuario canceló
    if (error) {
      executedRef.current = true;
      setStatus('error');
      setErrorMessage(
        errorDesc 
          ? `TikTok reportó: ${errorDesc} (${error})` 
          : `La autorización fue cancelada o rechazada en TikTok (${error}).`
      );
      return;
    }

    // 2. Si no hay código (alguien abrió /admin/tiktok/callback directamente)
    if (!code) {
      setStatus('no_code');
      return;
    }

    // 3. Si hay código, procesar intercambio OAuth 2.0 real con el backend una sola vez
    executedRef.current = true;
    processOAuth(code, state || 'GLOBAL');
  }, [searchParams]);

  const processOAuth = async (code: string, state: string) => {
    setStatus('processing');
    try {
      // Validación básica del state (por defecto 'GLOBAL' configurado en backend)
      const validState = state && state.trim().length > 0 ? state.trim() : 'GLOBAL';

      // Llamada al endpoint backend: POST /api/tiktok/admin/oauth/callback
      const result = await TikTokService.handleOAuthCallback(code, validState);

      setAccountInfo({
        username: result?.username || '@juandstore',
        displayName: result?.displayName || 'JUANDSTORE',
        permissions: result?.permissions || 'user.info.basic, video.list, video.publish, video.upload'
      });
      setStatus('success');

      // Redirigir a Control TikTok pestaña "Mi cuenta" después de 2 segundos
      setTimeout(() => {
        navigate('/admin/tiktok?tab=mi_cuenta');
      }, 2000);
    } catch (err: any) {
      console.error('Error en callback de TikTok OAuth:', err);
      setStatus('error');
      setErrorMessage(
        err?.message || 
        'No se pudo completar el intercambio de código con TikTok. Verifica que el Client Secret y Client Key estén configurados correctamente en JUANDSTORE.'
      );
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden text-center p-8 transition-all">
        
        {/* Encabezado con logo */}
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-black text-white dark:bg-white dark:text-black mb-6 shadow-md">
          <TikTokLogoIcon className="w-8 h-8" />
        </div>

        {/* ESTADO: Procesando autorización */}
        {status === 'processing' && (
          <div>
            <div className="flex justify-center mb-4">
              <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Completando autorización oficial
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Intercambiando código de autorización oficial con TikTok y guardando tokens seguros en el servidor...
            </p>
            <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Conexión cifrada OAuth 2.0 (Login Kit)</span>
            </div>
          </div>
        )}

        {/* ESTADO: Éxito */}
        {status === 'success' && (
          <div>
            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center text-emerald-500">
                <CheckCircle2 className="w-9 h-9" />
              </div>
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              ¡Cuenta de TikTok conectada!
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
              Has vinculado correctamente la cuenta:
            </p>
            <div className="inline-block px-4 py-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-emerald-600 dark:text-emerald-400 font-semibold mb-4 text-base">
              {accountInfo?.username || '@tu_cuenta'}
            </div>
            <p className="text-xs text-gray-400 mb-6">
              Redirigiendo automáticamente a Control TikTok en unos instantes...
            </p>
            <button
              onClick={() => navigate('/admin/tiktok?tab=mi_cuenta')}
              className="w-full py-2.5 px-4 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              <span>Continuar a Control TikTok</span>
            </button>
          </div>
        )}

        {/* ESTADO: Error */}
        {status === 'error' && (
          <div>
            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center text-red-500">
                <AlertCircle className="w-9 h-9" />
              </div>
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              No se pudo conectar la cuenta
            </h2>
            <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-sm p-4 rounded-xl mb-6 text-left border border-red-100 dark:border-red-800">
              {errorMessage}
            </div>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => navigate('/admin/tiktok?tab=mi_cuenta')}
                className="w-full py-2.5 px-4 bg-gray-900 dark:bg-gray-700 hover:bg-black text-white font-medium rounded-xl shadow transition-all flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Volver a Control TikTok</span>
              </button>
            </div>
          </div>
        )}

        {/* ESTADO: Acceso directo sin código (No hay código en URL) */}
        {status === 'no_code' && (
          <div>
            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-500">
                <Lock className="w-7 h-7" />
              </div>
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Callback OAuth 2.0 de TikTok
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 text-left">
              Esta URL (<code>/admin/tiktok/callback</code>) es el endpoint seguro de retorno configurado para <b>TikTok Login Kit</b>.
            </p>
            <div className="bg-gray-50 dark:bg-gray-700/40 p-4 rounded-xl text-xs text-gray-500 dark:text-gray-400 text-left mb-6 space-y-2 border border-gray-200 dark:border-gray-600">
              <p>• <b>Estado:</b> En espera de redirección de TikTok.</p>
              <p>• <b>Propósito:</b> Recibir y validar el código de autorización temporal (<code>code</code>) y vincular la cuenta oficial en JUANDSTORE sin exponer contraseñas.</p>
              <p>• Para iniciar la conexión con TikTok, ve a <b>Control TikTok &gt; Mi cuenta</b> y haz clic en <b>Conectar con TikTok</b>.</p>
            </div>
            <button
              onClick={() => navigate('/admin/tiktok?tab=mi_cuenta')}
              className="w-full py-2.5 px-4 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              <span>Ir a Control TikTok</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
