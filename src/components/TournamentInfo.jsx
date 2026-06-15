const tournamentRanks = [
  "#1 Valoverse", "#2 FNC", "#3 Loud", "#4 DRX", "#5 Navi", "#6 Sentinels",
  "#7 KRU", "#8 EG", "#9 PRX", "#10 TL", "#11 C9", "#12 MIBR", "#13 ZETA",
  "#14 LEV", "#15 KC", "#16 RRQ", "#17 Bleed", "#18 T1", "#19 GE", "#20 DFM",
  "#21 ONS", "#22 Giants", "#23 Heretics", "#24 KOI", "#25 BBL", "#26 FUT",
  "#27 Vitality", "#28 Liquid", "#29 G2", "#30 NRG", "#31 100T", "#32 MOBR"
]

function TournamentInfo() {
  return (
    <div className="tournament-card p-4 sticky top-20">
      <h2 className="text-lg font-bold text-white mb-3 border-l-3 border-[#10B981] pl-2">
        VALORANT Tournament Info
      </h2>
      <div className="space-y-1 max-h-[70vh] overflow-y-auto pr-1 custom-scroll">
        {tournamentRanks.map((team, idx) => (
          <div key={idx} className="rank-row text-sm text-gray-300 flex justify-between">
            <span>{team}</span>
            <span className="text-gray-500">{idx + 1}. position</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default TournamentInfo