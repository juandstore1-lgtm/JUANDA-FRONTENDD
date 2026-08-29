import AnimatedSection from "../components/AnimatedSection";
import { Mail, Phone, MapPin, Instagram, Facebook } from "lucide-react";

export default function Contact() {
  return (
    <div className="pt-32 pb-24 w-full">
      <div className="max-w-7xl mx-auto px-6 md:px-10 flex flex-col md:flex-row gap-16">
        
        {/* Info */}
        <div className="w-full md:w-5/12">
          <AnimatedSection>
            <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none mb-6 text-chrome">
              Hablemos.
            </h1>
            <p className="text-white/40 text-sm leading-relaxed mb-12">
              ¿Tienes alguna duda sobre tu pedido, quieres colaborar o simplemente decir hola? Estamos aquí.
            </p>

            <div className="space-y-8">
              <div className="flex items-start space-x-4">
                <Mail className="w-5 h-5 mt-1" />
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-widest mb-1">Email</h4>
                  <p className="text-white/40 text-sm">Juandstore1@gmail.com</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <Phone className="w-5 h-5 mt-1" />
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-widest mb-1">WhatsApp</h4>
                  <p className="text-white/40 text-sm">301 269 0047</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <MapPin className="w-5 h-5 mt-1" />
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-widest mb-1">Oficina Central</h4>
                  <p className="text-white/40 text-sm">Distrito Creativo, Edificio 4, Piso 2</p>
                </div>
              </div>
            </div>

            <div className="mt-12 pt-8 border-t border-gray-100 dark:border-gray-100 flex space-x-6">
              <a href="#" className="hover:text-red-600 transition-colors"><Instagram className="w-5 h-5" /></a>
              <a href="#" className="hover:text-red-600 transition-colors"><Facebook className="w-5 h-5" /></a>
            </div>
          </AnimatedSection>
        </div>

        {/* Form */}
        <div className="w-full md:w-7/12">
          <AnimatedSection delay={0.2}>
            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-white/40">Nombre</label>
                  <input type="text" className="w-full border-b border-black p-2 focus:outline-none focus:border-red-600 bg-transparent" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-white/40">Email</label>
                  <input type="email" className="w-full border-b border-black p-2 focus:outline-none focus:border-red-600 bg-transparent" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-white/40">Asunto</label>
                <input type="text" className="w-full border-b border-black p-2 focus:outline-none focus:border-red-600 bg-transparent" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-white/40">Mensaje</label>
                <textarea rows={4} className="w-full border-b border-black p-2 focus:outline-none focus:border-red-600 bg-transparent resize-none"></textarea>
              </div>
              <button className="bg-black dark:bg-black text-white dark:text-white px-8 py-4 text-xs font-bold uppercase tracking-widest hover:bg-red-600 transition-colors mt-4">
                Enviar Mensaje
              </button>
            </form>
          </AnimatedSection>
        </div>

      </div>
    </div>
  );
}
