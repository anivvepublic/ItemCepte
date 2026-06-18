import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import LiveTournament from './LiveTournament'

const pcGames = [
  "VALORANT", "CS2", "League of Legends", "Apex Legends",
  "Overwatch 2", "Rainbow Six Siege", "Call of Duty", "Rust"
]

const mobileGames = [
  "PUBG Mobile", "Mobile Legends", "Free Fire",
  "Brawl Stars", "Clash Royale", "Wild Rift", "Rise of Kingdoms", "Honor of Kings",
  "Critical Ops",
  "eFootball", "FC Mobile"
]

function CategorySidebar({ onSelectCategory }) {
  const [isPcOpen, setIsPcOpen] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [categoryCounts, setCategoryCounts] = useState({})
  const [activeIlanCount, setActiveIlanCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAllCounts()
    fetchActiveIlanCount()
  }, [])

  async function fetchAllCounts() {
    const counts = {}
    
    for (const game of pcGames) {
      const { count, error } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active')
        .eq('category', game)
      if (!error) counts[game] = count || 0
    }
    
    const { count: steamCount } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')
      .eq('category', 'Steam/Epic')
    counts['Steam/Epic'] = steamCount || 0

    for (const game of mobileGames) {
      const { count, error } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active')
        .eq('category', game)
      if (!error) counts[game] = count || 0
    }

    setCategoryCounts(counts)
    setLoading(false)
  }

  async function fetchActiveIlanCount() {
    const { count, error } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')
    if (!error) setActiveIlanCount(count || 0)
  }

  const handleCategoryClick = (category) => {
    if (onSelectCategory) {
      onSelectCategory(category)
      setTimeout(() => {
        const productsSection = document.getElementById('products-section')
        if (productsSection) {
          productsSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }, 100)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="glass-card p-4">
          <div className="animate-pulse text-center text-gray-400">Kategoriler yükleniyor...</div>
        </div>
      </div>
    )
  }

  const visiblePcGames = pcGames.filter(game => (categoryCounts[game] || 0) > 0)
  const visibleMobileGames = mobileGames.filter(game => (categoryCounts[game] || 0) > 0)
  const showSteam = (categoryCounts['Steam/Epic'] || 0) > 0

  const pcTotal = visiblePcGames.reduce((sum, game) => sum + (categoryCounts[game] || 0), 0) + (showSteam ? (categoryCounts['Steam/Epic'] || 0) : 0)
  const mobileTotal = visibleMobileGames.reduce((sum, game) => sum + (categoryCounts[game] || 0), 0)

  return (
    <div className="space-y-4">
      <LiveTournament />

      <div className="glass-card p-4">
        <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
          <svg className="w-5 h-5 text-[#38BDF8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18M3 12h18M3 17h18" />
          </svg>
          Kategoriler
        </h3>

        {pcTotal > 0 && (
          <div className="mb-3">
            <button
              onClick={() => setIsPcOpen(!isPcOpen)}
              className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-[#1E293B] transition group"
            >
              <div className="flex items-center gap-2">
                <svg className={`w-4 h-4 text-[#38BDF8] transition-transform ${isPcOpen ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <span className="text-sm font-semibold text-white">PC Hesapları</span>
              </div>
              <span className="text-xs text-[#22C55E] bg-[#22C55E]/10 px-2 py-0.5 rounded-full">{pcTotal}</span>
            </button>
            
            {isPcOpen && (
              <div className="ml-6 mt-1 space-y-1 border-l border-[#334155] pl-2">
                {visiblePcGames.map((game) => (
                  <div
                    key={game}
                    onClick={() => handleCategoryClick(game)}
                    className="flex items-center justify-between p-1.5 rounded-lg hover:bg-[#1E293B] cursor-pointer transition text-sm"
                  >
                    <span className="text-gray-300 hover:text-white">{game}</span>
                    <span className="text-xs text-[#22C55E] bg-[#22C55E]/10 px-1.5 py-0.5 rounded-full">
                      {categoryCounts[game] || 0}
                    </span>
                  </div>
                ))}
                {showSteam && (
                  <div
                    onClick={() => handleCategoryClick('Steam/Epic')}
                    className="flex items-center justify-between p-1.5 rounded-lg hover:bg-[#1E293B] cursor-pointer transition text-sm"
                  >
                    <span className="text-gray-300 hover:text-white">Steam / Epic Hesapları</span>
                    <span className="text-xs text-[#22C55E] bg-[#22C55E]/10 px-1.5 py-0.5 rounded-full">
                      {categoryCounts['Steam/Epic'] || 0}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {mobileTotal > 0 && (
          <div className="mb-3">
            <button
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-[#1E293B] transition group"
            >
              <div className="flex items-center gap-2">
                <svg className={`w-4 h-4 text-[#38BDF8] transition-transform ${isMobileOpen ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <span className="text-sm font-semibold text-white">Mobil Hesapları</span>
              </div>
              <span className="text-xs text-[#22C55E] bg-[#22C55E]/10 px-2 py-0.5 rounded-full">{mobileTotal}</span>
            </button>
            
            {isMobileOpen && (
              <div className="ml-6 mt-1 space-y-1 border-l border-[#334155] pl-2">
                {visibleMobileGames.map((game) => (
                  <div
                    key={game}
                    onClick={() => handleCategoryClick(game)}
                    className="flex items-center justify-between p-1.5 rounded-lg hover:bg-[#1E293B] cursor-pointer transition text-sm"
                  >
                    <span className="text-gray-300 hover:text-white">{game}</span>
                    <span className="text-xs text-[#22C55E] bg-[#22C55E]/10 px-1.5 py-0.5 rounded-full">
                      {categoryCounts[game] || 0}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="glass-card p-4 text-center">
        <div className="text-2xl font-bold text-[#22C55E]">+{activeIlanCount}</div>
        <div className="text-xs text-gray-400">Toplam Aktif İlan</div>
      </div>
    </div>
  )
}

export default CategorySidebar