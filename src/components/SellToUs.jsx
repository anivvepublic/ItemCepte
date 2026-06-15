import { useState } from 'react'

function SellToUs() {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div 
      className="glass-card p-5 text-center cursor-pointer transition-all duration-300 hover:scale-105"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative inline-block mb-3">
        <div className="w-16 h-16 mx-auto bg-gradient-to-r from-[#FBBF24] to-[#F59E0B] rounded-full flex items-center justify-center shadow-lg">
          <svg className="w-8 h-8 text-[#0F172A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        {isHovered && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#22C55E] rounded-full animate-ping"></div>
        )}
      </div>
      
      <h3 className="text-xl font-bold text-white mb-2">Hesabını Bize Sat!</h3>
      <p className="text-sm text-gray-400 mb-4">
        Kullanmadığın hesapları değerinde nakite çevir. Hızlı, güvenli ve anında ödeme.
      </p>
      
      <button className="btn-secondary-glow w-full py-2.5 text-sm">
        Hemen Teklif Al
      </button>
      
      <p className="text-xs text-gray-500 mt-3">
        Ücretsiz değerlendirme • Anında ödeme • 7/24 destek
      </p>
    </div>
  )
}

export default SellToUs