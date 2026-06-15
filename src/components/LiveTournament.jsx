import { useState, useEffect } from 'react'
import { getUpcomingMatches } from '../lib/pandascore'

function LiveTournament() {
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchMatches() {
      const data = await getUpcomingMatches()
      if (data && data.length > 0) {
        setMatches(data.slice(0, 4))
      } else {
        setMatches([
          { name: "Lower bracket quarterfinal 2", opponents: [{ name: "XLG" }, { name: "LEV" }] },
          { name: "Lower bracket quarterfinal 1", opponents: [{ name: "VIT" }, { name: "FUT" }] },
          { name: "GEN.A vs OSG", opponents: [{ name: "GEN.A" }, { name: "OSG" }] },
          { name: "Upper bracket semifinal 1", opponents: [{ name: "555" }, { name: "4" }] },
        ])
      }
      setLoading(false)
    }
    fetchMatches()
    const interval = setInterval(fetchMatches, 60000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="glass-card p-4">
        <div className="animate-pulse text-center text-gray-400">Turnuva bilgileri yükleniyor...</div>
      </div>
    )
  }

  return (
    <div className="glass-card p-4">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-sm font-bold text-[#38BDF8] uppercase tracking-wider">CANLI TURNUVALAR</span>
      </div>
      
      <div className="space-y-3">
        {matches.map((match, idx) => (
          <div key={idx} className="border-b border-[#334155] last:border-0 pb-3 last:pb-0">
            <div className="flex items-center justify-between">
              <div className="text-center flex-1">
                <p className="text-md font-bold text-white">{match.opponents?.[0]?.name || "Takım 1"}</p>
              </div>
              <div className="text-center px-3">
                <div className="w-8 h-8 rounded-full bg-[#22C55E]/20 flex items-center justify-center">
                  <span className="text-[#22C55E] font-bold text-xs">VS</span>
                </div>
              </div>
              <div className="text-center flex-1">
                <p className="text-md font-bold text-white">{match.opponents?.[1]?.name || "Takım 2"}</p>
              </div>
            </div>
            <div className="text-center mt-2">
              <span className="text-xs text-[#38BDF8] bg-[#38BDF8]/10 px-2 py-0.5 rounded-full">{match.name || "VALORANT Turnuvası"}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default LiveTournament