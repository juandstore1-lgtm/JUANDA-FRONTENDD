import AnimatedSection from "../components/AnimatedSection";
import { Check, TrendingUp, Sparkles, Image as ImageIcon, Users, Truck, MessageCircle } from "lucide-react";

export default function Wholesale() {
  const benefits = [
    { 
      title: "ACCESO A DIFUSIÓN", 
      desc: "Ingresa a nuestra difusión de whatsapp para visualizar todos nuestros productos a precio mayoristaVisualiza todos nuestros productos y precios mayoristas directamente en WhatsApp.", 
      icon: <Sparkles className="w-5 h-5 text-white" /> 
    },
    { 
      title: "ENVÍOS A TODO COLOMBIA", 
      desc: "Despachamos a cualquier ciudad del país de forma rápida y segura.", 
      icon: <ImageIcon className="w-5 h-5 text-white" /> 
    },
    { 
      title: "Asesoría VIP", 
      desc: "Acompañamiento y seguimiento personalizado de ventas.", 
      icon: <Users className="w-5 h-5 text-white" /> 
    }
  ];

  return (
    <div className="pt-32 pb-32 w-full min-h-screen bg-[#050505] relative overflow-hidden flex flex-col items-center">
      {/* Background Effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[400px] bg-white/5 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="w-full max-w-[1200px] mx-auto px-6 md:px-12 relative z-10">
        
        {/* Header Section */}
        <AnimatedSection className="text-center max-w-4xl mx-auto mb-20">
          <div className="inline-block border border-white/20 bg-white/5 backdrop-blur-md px-4 py-1.5 rounded-full mb-6">
            <span className="text-xs font-bold uppercase tracking-widest text-white/80">Proveedor Oficial</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none mb-8 text-chrome">
            Línea <span className="text-white">Mayorista.</span>
          </h1>
          <p className="text-white/60 text-base md:text-lg leading-relaxed max-w-2xl mx-auto">
Únete a nuestra comunidad JDQ STORE. Somos proveedores a nivel nacional con excelentes precios mayoristas. ¡Contáctanos y haz crecer tu negocio!          </p>
        </AnimatedSection>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-24">
          {benefits.map((benefit, i) => (
            <AnimatedSection key={i} delay={i * 0.1}>
              <div className="bg-[#111] border border-white/10 hover:border-white/30 transition-colors p-8 rounded-2xl h-full flex flex-col">
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-6 border border-white/10">
                  {benefit.icon}
                </div>
                <h3 className="text-lg font-black uppercase tracking-widest text-white mb-3">{benefit.title}</h3>
                <p className="text-sm text-white/50 leading-relaxed">{benefit.desc}</p>
              </div>
            </AnimatedSection>
          ))}
        </div>

        {/* Call to Action Section */}
        <AnimatedSection delay={0.4}>
          <div className="relative overflow-hidden bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border border-white/10 rounded-3xl p-10 md:p-16 text-center max-w-4xl mx-auto shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/10 blur-[80px] rounded-full pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 blur-[80px] rounded-full pointer-events-none"></div>
            
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-white mb-4">¿Listo para empezar?</h2>
              
              <div className="flex items-center justify-center gap-3 text-sm text-white/60 mb-10">
                <Check className="w-4 h-4 text-[#39ff14]" />
                <span>Compra inicial mínima de 12 prendas surtidas</span>
                <span className="hidden md:inline text-white/20">|</span>

              </div>
              
              <a 
                href="https://wa.me/573012690047" 
                target="_blank" 
                rel="noreferrer" 
                className="inline-flex items-center justify-center gap-3 bg-white text-black px-10 py-5 rounded-full text-sm font-black uppercase tracking-widest hover:bg-gray-200 transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(255,255,255,0.3)]"
              >
                <MessageCircle className="w-5 h-5" />
                Contactar Asesor VIP
              </a>
            </div>
          </div>
        </AnimatedSection>

      </div>
    </div>
  );
}
