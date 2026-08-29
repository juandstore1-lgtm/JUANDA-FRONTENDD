import AnimatedSection from "../components/AnimatedSection";

export default function About() {
  return (
    <div className="pt-32 pb-24 w-full">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        
        {/* Header */}
        <AnimatedSection className="mb-20">
          <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none mb-6">
            <span
              style={{
                background: "linear-gradient(180deg,#ffffff 0%,#d4d4d4 18%,#ffffff 32%,#7a7a7a 50%,#ececec 66%,#8a8a8a 82%,#f5f5f5 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                display: "inline",
              }}
            >
              Nuestra
            </span>
            <br />
            <span
              style={{
                background: "linear-gradient(180deg,#ffffff 0%,#cfcfcf 15%,#ffffff 28%,#777777 48%,#eeeeee 64%,#888888 80%,#f7f7f7 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                display: "inline",
              }}
            >
              Historia.
            </span>
          </h1>
          <p className="text-white/40 text-sm md:text-base max-w-2xl leading-relaxed">
            Nacimos en el asfalto. JDQSTORE no es solo una marca de ropa, es un movimiento que fusiona la estética minimalista con la funcionalidad urbana extrema.
          </p>
        </AnimatedSection>

        {/* Image Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-24">
          <AnimatedSection delay={0.1}>
            <div className="bg-gray-100 aspect-[4/5] relative group overflow-hidden">
              <img src="https://images.unsplash.com/photo-1492288991661-058aa541ff43?q=80&w=1974&auto=format&fit=crop" alt="Brand Story" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            </div>
          </AnimatedSection>
          <AnimatedSection delay={0.2} className="hidden md:block">
            <div className="bg-gray-100 aspect-[4/5] relative group overflow-hidden">
              <img src="https://images.unsplash.com/photo-1543076447-215ad9ba6923?q=80&w=1974&auto=format&fit=crop" alt="Details" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            </div>
          </AnimatedSection>
        </div>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24">
          <AnimatedSection>
            <h3 className="text-sm font-bold uppercase tracking-widest text-red-600 mb-4">Misión</h3>
            <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter mb-6">Redefinir el estilo urbano.</h2>
            <p className="text-white/40 text-sm leading-relaxed">
              Proporcionar prendas de alta calidad, duraderas y con un diseño atemporal. Cada pieza está pensada para resistir el ritmo de la ciudad mientras mantiene una estética limpia y sofisticada.
            </p>
          </AnimatedSection>
          <AnimatedSection delay={0.2}>
            <h3 className="text-sm font-bold uppercase tracking-widest text-red-600 mb-4">Visión</h3>
            <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter mb-6">Cultura Global.</h2>
            <p className="text-white/40 text-sm leading-relaxed">
              Convertirnos en el referente principal de la moda urbana minimalista a nivel global, creando espacios donde la comunidad creativa pueda converger y expresarse.
            </p>
          </AnimatedSection>
        </div>

      </div>
    </div>
  );
}
