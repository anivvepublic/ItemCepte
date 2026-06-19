import { useState, useEffect } from 'react'

function DeviceDetector() {
  const [device, setDevice] = useState('pc')
  const [showBanner, setShowBanner] = useState(true)

  useEffect(() => {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera
    const isMobile = /android|iphone|ipad|ipod|blackberry|windows phone|opera mini|iemobile/i.test(userAgent)
    const isTablet = /ipad|android(?!.*mobile)|tablet/i.test(userAgent)
    
    if (isTablet) {
      setDevice('tablet')
    } else if (isMobile) {
      setDevice('mobile')
    } else {
      setDevice('pc')
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowBanner(false)
    }, 5000)
    return () => clearTimeout(timer)
  }, [])

  // Cihaz bilgisini localStorage'a kaydet
  useEffect(() => {
    localStorage.setItem('deviceType', device)
  }, [device])

  if (device === 'pc' || !showBanner) return null

  return (
    <div className="fixed top-16 left-0 right-0 z-40 px-4">
      <div className="max-w-3xl mx-auto bg-[#1E293B] border border-[#22C55E]/30 rounded-2xl p-3 shadow-2xl shadow-[#22C55E]/10 transition-all duration-500 animate-fadeInUp">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#22C55E]/20 flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-[#22C55E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold text-white">
              {device === 'mobile' ? '📱 Mobil Cihaz' : '📟 Tablet'}
            </p>
            <p className="text-[10px] text-gray-400">
              {device === 'mobile' 
                ? 'Size özel mobil optimizasyon aktif. Keyifli alışverişler!' 
                : 'Tablet için özel görünüm aktif.'}
            </p>
          </div>
          <button 
            onClick={() => setShowBanner(false)}
            className="text-gray-500 hover:text-white transition text-lg"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  )
}

export default DeviceDetector