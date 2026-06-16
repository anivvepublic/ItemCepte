function TimelineItem({ type, text, time, isLast }) {
  const getIcon = () => {
    switch (type) {
      case 'order': return (
        <svg className="w-4 h-4 text-[#22C55E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-1.5 6M17 13l1.5 6M9 21h6M12 21v-6" />
        </svg>
      )
      case 'product': return (
        <svg className="w-4 h-4 text-[#38BDF8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      )
      default: return (
        <svg className="w-4 h-4 text-[#FBBF24]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
      )
    }
  }

  const getColor = () => {
    switch (type) {
      case 'order': return '#22C55E'
      case 'product': return '#38BDF8'
      default: return '#FBBF24'
    }
  }

  return (
    <div className={`relative ${!isLast ? 'pb-4' : ''}`}>
      <div className="absolute -left-[1.85rem] mt-1">
        <div 
          className="w-3 h-3 rounded-full border-2 border-[#0F172A] shadow-lg"
          style={{ backgroundColor: getColor() }}
        ></div>
      </div>
      <div className="glass-card p-3 hover:shadow-[0_0_20px_rgba(34,197,94,0.1)] transition border border-[#334155] hover:border-[#22C55E]">
        <div className="flex items-center gap-2">
          <span>{getIcon()}</span>
          <span className="text-sm text-white flex-1">{text}</span>
          <span className="text-xs text-gray-500 flex-shrink-0">{time}</span>
        </div>
      </div>
    </div>
  )
}

export default TimelineItem