function HeroSection() {
  const scrollToProducts = () => {
    const productsSection = document.getElementById('products-section')
    if (productsSection) {
      productsSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <div className="relative pt-20 sm:pt-24 pb-12 md:pb-16 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#0F172A] via-[#1E1B4B] to-[#0F172A] animate-pulse-slow"></div>
      
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-[#22C55E] rounded-full opacity-30 animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-4xl mx-auto text-center px-4">
        <div className="animate-fadeInUp">
          <div className="inline-flex items-center gap-2 bg-[#22C55E]/10 backdrop-blur-sm rounded-full px-3 py-1 md:px-4 md:py-1.5 mb-4 md:mb-6 border border-[#22C55E]/30">
            <span className="w-2 h-2 bg-[#22C55E] rounded-full animate-pulse"></span>
            <span className="text-[10px] md:text-xs text-[#22C55E] font-medium">Güvenli Ödeme & Hızlı Teslimat</span>
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold mb-3 md:mb-4 leading-tight">
            <span className="bg-gradient-to-r from-[#22C55E] via-[#38BDF8] to-[#22C55E] bg-clip-text text-transparent">
              Oyun Dünyasının
            </span>
            <br className="hidden sm:block" />
            <span className="neon-text text-2xl sm:text-3xl md:text-5xl lg:text-6xl">En Güvenilir Adresi</span>
          </h1>
          
          <p className="text-sm md:text-lg text-[#94A3B8] mb-6 md:mb-8 max-w-2xl mx-auto px-2">
            Binlerce ürün, anında teslimat ve %100 güvenli ödeme sistemi.
            Şimdi katıl, fırsatları kaçırma!
          </p>
          
          <button 
            onClick={scrollToProducts}
            className="btn-primary-glow text-sm md:text-lg px-6 py-2.5 md:px-8 md:py-3 group"
          >
            <span className="flex items-center gap-2">
              Hemen Alışverişe Başla
              <svg className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default HeroSection