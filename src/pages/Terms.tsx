import React from "react";
import AnimatedSection from "../components/AnimatedSection";
import { ShieldCheck, FileText, Lock, Globe, Mail, Phone, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

export default function Terms() {
  return (
    <div className="pt-28 md:pt-36 pb-24 w-full bg-black text-white min-h-screen">
      <div className="max-w-4xl mx-auto px-6 md:px-10">
        
        {/* Header */}
        <AnimatedSection className="mb-12 border-b border-white/10 pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 border border-white/15 rounded-full text-xs font-semibold tracking-wider uppercase text-zinc-300 mb-4">
            <FileText className="w-3.5 h-3.5 text-emerald-400" />
            <span>Documento Legal Oficial</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-white mb-3">
            Términos y Condiciones
          </h1>
          <p className="text-zinc-400 text-xs md:text-sm">
            Última actualización: 19 de noviembre de 2026 · JUANDSTORE (JDQ STORE)
          </p>
        </AnimatedSection>

        {/* Content */}
        <div className="space-y-10 text-zinc-300 text-sm md:text-base leading-relaxed font-light">
          
          {/* Sección 1 */}
          <AnimatedSection className="space-y-3">
            <h2 className="text-lg md:text-xl font-bold uppercase tracking-tight text-white flex items-center gap-2.5">
              <span className="text-emerald-400 font-mono text-sm">01.</span>
              <span>Información General y Aceptación</span>
            </h2>
            <p>
              Bienvenido a <strong>JUANDSTORE</strong> (operado comercialmente como JUANDSTORE / JUAN'D STORE / JDQ STORE), plataforma de catálogo digital, moda masculina y canales de atención con sede en Cali, Colombia.
            </p>
            <p>
              El acceso, navegación y uso del sitio web oficial <strong>https://www.juandstore.com</strong>, así como de sus catálogos virtuales, promociones, dinámicas comerciales y servicios vinculados, implica la aceptación plena e incondicional de los presentes Términos y Condiciones de Uso. Si el usuario no está de acuerdo con alguna de las disposiciones aquí establecidas, deberá abstenerse de utilizar este sitio.
            </p>
          </AnimatedSection>

          {/* Sección 2 */}
          <AnimatedSection className="space-y-3">
            <h2 className="text-lg md:text-xl font-bold uppercase tracking-tight text-white flex items-center gap-2.5">
              <span className="text-emerald-400 font-mono text-sm">02.</span>
              <span>Catálogo, Precios y Disponibilidad</span>
            </h2>
            <p>
              JUANDSTORE exhibe en su sitio web prendas de vestir, calzado y accesorios masculinos de alta calidad. Los precios publicados en el catálogo están expresados en pesos colombianos (COP).
            </p>
            <ul className="list-disc pl-5 space-y-2 text-zinc-400 text-xs md:text-sm">
              <li>
                <strong>Disponibilidad de stock:</strong> Las existencias y tallas pueden variar según cada una de nuestras sedes físicas (Villa Colombia, Mariano Ramos, República de Israel y Ciudad Modelo).
              </li>
              <li>
                <strong>Atención de pedidos:</strong> La confirmación de pedidos, apartados y ventas se gestiona directamente a través de nuestros canales oficiales de WhatsApp y puntos físicos.
              </li>
              <li>
                <strong>Exactitud de imágenes:</strong> Nos esforzamos por presentar los colores y texturas de las prendas de la forma más precisa posible, aunque pueden presentarse variaciones menores según la pantalla del dispositivo.
              </li>
            </ul>
          </AnimatedSection>

          {/* Sección 3 - TikTok Integration */}
          <AnimatedSection className="space-y-3 bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="text-lg md:text-xl font-bold uppercase tracking-tight text-white flex items-center gap-2.5">
              <span className="text-emerald-400 font-mono text-sm">03.</span>
              <span>Integración Oficial con TikTok y Plataformas Externas</span>
            </h2>
            <p>
              JUANDSTORE integra herramientas oficiales para desarrolladores provistas por TikTok (incluyendo <strong>TikTok Login Kit</strong> y <strong>TikTok Content Posting API</strong>) con el fin de gestionar, programar y publicar contenido audiovisual de la marca, catálogos de novedades y promociones oficiales.
            </p>
            <div className="space-y-2 text-xs md:text-sm text-zinc-300">
              <p>
                • <strong>Sin solicitud de contraseñas:</strong> JUANDSTORE nunca solicitará, recolectará ni almacenará contraseñas o claves privadas de cuentas de TikTok. Toda autenticación se realiza de manera cifrada directamente en los servidores oficiales de TikTok mediante el protocolo estándar OAuth 2.0.
              </p>
              <p>
                • <strong>Permisos solicitados:</strong> La plataforma solicita exclusivamente los permisos aprobados por el usuario (información básica del perfil, consulta de videos públicos y publicación de videos o borradores de la marca).
              </p>
              <p>
                • <strong>Cumplimiento de normas:</strong> El uso de funciones conectadas con TikTok se rige adicionalmente por los <a href="https://www.tiktok.com/legal/terms-of-service" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline inline-flex items-center gap-0.5">Términos de Servicio de TikTok <ExternalLink className="w-3 h-3" /></a> y sus Normas de la Comunidad.
              </p>
            </div>
          </AnimatedSection>

          {/* Sección 4 */}
          <AnimatedSection className="space-y-3">
            <h2 className="text-lg md:text-xl font-bold uppercase tracking-tight text-white flex items-center gap-2.5">
              <span className="text-emerald-400 font-mono text-sm">04.</span>
              <span>Propiedad Intelectual</span>
            </h2>
            <p>
              Todas las marcas comerciales, logotipos, nombres comerciales, fotografías de producto, contenidos audiovisuales, diseños y código fuente exhibidos en este sitio web son de propiedad exclusiva de JUANDSTORE o se encuentran debidamente autorizados por sus respectivos titulares.
            </p>
            <p className="text-xs md:text-sm text-zinc-400">
              Queda estrictamente prohibida la reproducción total o parcial, distribución, modificación o uso comercial de cualquier contenido de este sitio sin la previa autorización expresa y por escrito de JUANDSTORE.
            </p>
          </AnimatedSection>

          {/* Sección 5 */}
          <AnimatedSection className="space-y-3">
            <h2 className="text-lg md:text-xl font-bold uppercase tracking-tight text-white flex items-center gap-2.5">
              <span className="text-emerald-400 font-mono text-sm">05.</span>
              <span>Enlaces a Sitios de Terceros</span>
            </h2>
            <p>
              Nuestro sitio web contiene enlaces que dirigen a plataformas externas de terceros, tales como WhatsApp, Instagram y TikTok. JUANDSTORE no ejerce control sobre dichos sitios externos y no se hace responsable por sus contenidos, términos o políticas de tratamiento de datos personales.
            </p>
          </AnimatedSection>

          {/* Sección 6 */}
          <AnimatedSection className="space-y-3">
            <h2 className="text-lg md:text-xl font-bold uppercase tracking-tight text-white flex items-center gap-2.5">
              <span className="text-emerald-400 font-mono text-sm">06.</span>
              <span>Modificaciones a los Términos</span>
            </h2>
            <p>
              JUANDSTORE se reserva el derecho de actualizar, modificar o sustituir cualquier parte de estos Términos y Condiciones en cualquier momento. Las modificaciones entrarán en vigencia inmediatamente después de su publicación en esta página web. Se recomienda a los usuarios revisar periódicamente esta sección.
            </p>
          </AnimatedSection>

          {/* Sección 7 */}
          <AnimatedSection className="space-y-3 border-t border-white/10 pt-8">
            <h2 className="text-lg md:text-xl font-bold uppercase tracking-tight text-white flex items-center gap-2.5">
              <span className="text-emerald-400 font-mono text-sm">07.</span>
              <span>Contacto y Legislación Aplicable</span>
            </h2>
            <p>
              Los presentes Términos y Condiciones se rigen e interpretan de conformidad con las leyes de la <strong>República de Colombia</strong>. Cualquier inquietud, queja o reclamo relativo a estos términos podrá dirigirse a través de nuestros canales oficiales:
            </p>

            <div className="bg-zinc-900 border border-white/15 rounded-xl p-5 space-y-3 text-xs md:text-sm">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                <span><strong>Correo electrónico:</strong> juandstore1@gmail.com</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span><strong>Línea de atención / WhatsApp:</strong> +57 301 269 0047</span>
              </div>
              <div className="flex items-center gap-3">
                <Globe className="w-4 h-4 text-emerald-400 shrink-0" />
                <span><strong>Ubicación:</strong> Cali, Valle del Cauca, Colombia</span>
              </div>
            </div>
          </AnimatedSection>

        </div>

        {/* Footer nav */}
        <div className="mt-16 pt-8 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs text-zinc-400">
          <Link to="/privacidad" className="text-emerald-400 hover:underline font-semibold">
            Ver Política de Privacidad →
          </Link>
          <Link to="/" className="hover:text-white transition-colors">
            ← Volver al inicio
          </Link>
        </div>

      </div>
    </div>
  );
}
