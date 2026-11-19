import React from "react";
import AnimatedSection from "../components/AnimatedSection";
import { ShieldCheck, Lock, Eye, Trash2, Mail, Phone, Globe, ExternalLink, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";

export default function Privacy() {
  return (
    <div className="pt-28 md:pt-36 pb-24 w-full bg-black text-white min-h-screen">
      <div className="max-w-4xl mx-auto px-6 md:px-10">
        
        {/* Header */}
        <AnimatedSection className="mb-12 border-b border-white/10 pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 border border-white/15 rounded-full text-xs font-semibold tracking-wider uppercase text-zinc-300 mb-4">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Protección de Datos Personales</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-white mb-3">
            Política de Privacidad
          </h1>
          <p className="text-zinc-400 text-xs md:text-sm">
            Última actualización: 19 de noviembre de 2026 · JUANDSTORE (JDQ STORE)
          </p>
        </AnimatedSection>

        {/* Content */}
        <div className="space-y-10 text-zinc-300 text-sm md:text-base leading-relaxed font-light">
          
          {/* Sección 1: Responsable */}
          <AnimatedSection className="space-y-3">
            <h2 className="text-lg md:text-xl font-bold uppercase tracking-tight text-white flex items-center gap-2.5">
              <span className="text-emerald-400 font-mono text-sm">01.</span>
              <span>Responsable del Tratamiento de Datos</span>
            </h2>
            <p>
              En <strong>JUANDSTORE</strong> (comercialmente reconocida como JUANDSTORE / JUAN'D STORE / JDQ STORE) respetamos y protegemos la privacidad de nuestros clientes, usuarios y colaboradores. Esta Política de Privacidad describe cómo recolectamos, almacenamos, utilizamos y protegemos la información personal tratada a través de nuestro sitio web <strong>https://www.juandstore.com</strong>.
            </p>
            <div className="bg-zinc-900 border border-white/15 rounded-xl p-5 space-y-2.5 text-xs md:text-sm">
              <p><strong>Razón / Nombre comercial:</strong> JUANDSTORE · JDQ STORE</p>
              <p><strong>Domicilio:</strong> Cali, Valle del Cauca, Colombia</p>
              <p><strong>Correo electrónico de privacidad:</strong> juandstore1@gmail.com</p>
              <p><strong>Línea de contacto / WhatsApp:</strong> +57 301 269 0047</p>
            </div>
          </AnimatedSection>

          {/* Sección 2: Marco Legal */}
          <AnimatedSection className="space-y-3">
            <h2 className="text-lg md:text-xl font-bold uppercase tracking-tight text-white flex items-center gap-2.5">
              <span className="text-emerald-400 font-mono text-sm">02.</span>
              <span>Marco Legal (Habeas Data)</span>
            </h2>
            <p>
              Esta política se rige en estricto cumplimiento de la <strong>Ley Estatutaria 1581 de 2012</strong> de la República de Colombia, el <strong>Decreto 1377 de 2013</strong> y las demás normas complementarias sobre Protección de Datos Personales, garantizando el derecho constitucional de Habeas Data a conocer, actualizar, rectificar y suprimir datos personales.
            </p>
          </AnimatedSection>

          {/* Sección 3: Datos Recopilados */}
          <AnimatedSection className="space-y-3">
            <h2 className="text-lg md:text-xl font-bold uppercase tracking-tight text-white flex items-center gap-2.5">
              <span className="text-emerald-400 font-mono text-sm">03.</span>
              <span>Datos Personales Recopilados y Finalidad</span>
            </h2>
            <p>
              JUANDSTORE recopila únicamente la información necesaria para prestar nuestros servicios y coordinar nuestras actividades comerciales:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-zinc-400 text-xs md:text-sm">
              <li>
                <strong>Atención al cliente y pedidos:</strong> Nombre, número de teléfono y correo electrónico proporcionados voluntariamente por el usuario para coordinar envíos, apartados o compras vía WhatsApp.
              </li>
              <li>
                <strong>Concursos, rifas y dinámicas:</strong> Nombres, datos de contacto y número de identificación para registrar la participación y verificar ganadores de premios y sorteos oficiales.
              </li>
              <li>
                <strong>Módulo "Trabaja con nosotros":</strong> Información curricular, experiencia laboral y datos de contacto remitidos para convocatorias y selección de personal.
              </li>
            </ul>
          </AnimatedSection>

          {/* Sección 4: Integración con TikTok (Requerido por TikTok Developers) */}
          <AnimatedSection className="space-y-4 bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-2 text-emerald-400 font-bold uppercase text-xs tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>Integración Oficial con TikTok Developers</span>
            </div>
            
            <h2 className="text-lg md:text-xl font-bold uppercase tracking-tight text-white">
              04. Tratamiento de Datos de la API de TikTok
            </h2>

            <p className="text-xs md:text-sm text-zinc-300">
              JUANDSTORE implementa las herramientas oficiales para desarrolladores de TikTok (Login Kit y Content Posting API). A continuación se detalla cómo se gestionan los datos obtenidos mediante la API de TikTok:
            </p>

            <div className="space-y-3 text-xs md:text-sm">
              <div className="bg-black/50 border border-white/10 p-4 rounded-xl space-y-1.5">
                <p className="font-bold text-white flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Permisos solicitados (Scopes OAuth 2.0):</span>
                </p>
                <ul className="list-disc pl-5 space-y-1 text-zinc-400 text-xs">
                  <li><code>user.info.basic</code>: Consultar nombre de usuario, nombre en pantalla y foto de perfil público.</li>
                  <li><code>video.list</code>: Consultar videos públicos para visualización y métricas en el panel interno.</li>
                  <li><code>video.publish</code>: Publicar videos directamente en la cuenta oficial de TikTok autorizada.</li>
                  <li><code>video.upload</code>: Enviar videos como borradores privados a la bandeja de entrada de TikTok.</li>
                </ul>
              </div>

              <div className="bg-black/50 border border-white/10 p-4 rounded-xl space-y-1.5">
                <p className="font-bold text-white flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-emerald-400" />
                  <span>Seguridad de autenticación:</span>
                </p>
                <p className="text-zinc-400 text-xs leading-relaxed">
                  JUANDSTORE <strong>nunca tiene acceso ni almacena contraseñas</strong> de TikTok. La autenticación se realiza de forma directa en la plataforma oficial de TikTok. Únicamente se reciben y almacenan de forma segura tokens temporales de acceso (OAuth 2.0).
                </p>
              </div>

              <div className="bg-black/50 border border-white/10 p-4 rounded-xl space-y-1.5">
                <p className="font-bold text-white flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-emerald-400" />
                  <span>No venta ni compartición de datos:</span>
                </p>
                <p className="text-zinc-400 text-xs leading-relaxed">
                  JUANDSTORE <strong>no vende, no comercializa, no transfiere ni alquila</strong> ningún dato personal o proveniente de TikTok con empresas terceras, plataformas de publicidad ni corredores de datos.
                </p>
              </div>

              <div className="bg-black/50 border border-white/10 p-4 rounded-xl space-y-1.5">
                <p className="font-bold text-white flex items-center gap-1.5">
                  <Trash2 className="w-4 h-4 text-emerald-400" />
                  <span>Retención y eliminación de datos de TikTok:</span>
                </p>
                <p className="text-zinc-400 text-xs leading-relaxed">
                  Los datos de la cuenta vinculada se mantienen solo mientras dure la conexión. El usuario puede desvincular su cuenta en cualquier momento haciendo clic en <strong>«Desconectar cuenta»</strong> en el panel de TikTok de JUANDSTORE, eliminando de forma inmediata todos los tokens de acceso del servidor. También puede revocar el acceso desde la configuración de su propia cuenta de TikTok en la sección <em>Aplicaciones autorizadas</em>.
                </p>
              </div>
            </div>
          </AnimatedSection>

          {/* Sección 5: Derechos */}
          <AnimatedSection className="space-y-3">
            <h2 className="text-lg md:text-xl font-bold uppercase tracking-tight text-white flex items-center gap-2.5">
              <span className="text-emerald-400 font-mono text-sm">05.</span>
              <span>Derechos del Titular de los Datos</span>
            </h2>
            <p>
              De acuerdo con la legislación aplicable, como titular de los datos personales tienes derecho a:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-zinc-400 text-xs md:text-sm">
              <li>Conocer, actualizar y rectificar tus datos personales frente al Responsable del Tratamiento.</li>
              <li>Solicitar prueba de la autorización otorgada.</li>
              <li>Ser informado sobre el uso que se le ha dado a tus datos.</li>
              <li>Presentar ante la Superintendencia de Industria y Comercio quejas por infracciones a la ley.</li>
              <li>Revocar la autorización y/o solicitar la supresión de tus datos en cualquier momento.</li>
            </ul>
          </AnimatedSection>

          {/* Sección 6: Procedimiento de Solicitudes */}
          <AnimatedSection className="space-y-3">
            <h2 className="text-lg md:text-xl font-bold uppercase tracking-tight text-white flex items-center gap-2.5">
              <span className="text-emerald-400 font-mono text-sm">06.</span>
              <span>Procedimiento para Consultas o Eliminación de Datos</span>
            </h2>
            <p>
              Para ejercer cualquiera de tus derechos o solicitar la supresión permanente de tus datos de nuestros sistemas, envía un mensaje con tu nombre completo y la descripción de tu solicitud a:
            </p>
            <div className="bg-zinc-900 border border-white/15 rounded-xl p-4 flex items-center gap-3 text-xs md:text-sm">
              <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
              <span><strong>Correo de contacto:</strong> juandstore1@gmail.com</span>
            </div>
            <p className="text-xs text-zinc-400">
              Las consultas y solicitudes serán atendidas en un plazo máximo de quince (15) días hábiles conforme a los términos de la Ley 1581 de 2012.
            </p>
          </AnimatedSection>

          {/* Sección 7: Cambios */}
          <AnimatedSection className="space-y-3 border-t border-white/10 pt-8">
            <h2 className="text-lg md:text-xl font-bold uppercase tracking-tight text-white flex items-center gap-2.5">
              <span className="text-emerald-400 font-mono text-sm">07.</span>
              <span>Vigencia y Actualizaciones</span>
            </h2>
            <p className="text-xs md:text-sm text-zinc-400 leading-relaxed">
              La presente Política de Privacidad rige a partir de su publicación en el sitio web y permanecerá vigente mientras JUANDSTORE desarrolle sus actividades comerciales. Cualquier cambio sustancial será publicado directamente en esta sección.
            </p>
          </AnimatedSection>

        </div>

        {/* Footer nav */}
        <div className="mt-16 pt-8 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs text-zinc-400">
          <Link to="/terminos" className="text-emerald-400 hover:underline font-semibold">
            ← Ver Términos y Condiciones
          </Link>
          <Link to="/" className="hover:text-white transition-colors">
            Volver al inicio
          </Link>
        </div>

      </div>
    </div>
  );
}
