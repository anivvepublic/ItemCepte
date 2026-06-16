function InfoField({ icon, label, value, onChange, editMode = false, multiline = false, disabled = false, publicValue = null }) {
  const getIcon = () => {
    switch (icon) {
      case 'user': return (
        <svg className="w-4 h-4 text-[#38BDF8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
      case 'at-symbol': return (
        <svg className="w-4 h-4 text-[#38BDF8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
        </svg>
      )
      case 'phone': return (
        <svg className="w-4 h-4 text-[#38BDF8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      )
      case 'envelope': return (
        <svg className="w-4 h-4 text-[#38BDF8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      )
      case 'globe': return (
        <svg className="w-4 h-4 text-[#38BDF8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9" />
        </svg>
      )
      case 'pencil': return (
        <svg className="w-4 h-4 text-[#38BDF8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
      )
      default: return null
    }
  }

  const isHidden = publicValue !== null && !publicValue && !editMode

  if (editMode) {
    return (
      <div className="flex items-center gap-2">
        <span className="flex-shrink-0">{getIcon()}</span>
        <div className="flex-1">
          <label className="text-[10px] text-gray-400">{label}</label>
          {multiline ? (
            <textarea
              value={value}
              onChange={(e) => onChange(e.target.value)}
              rows={2}
              disabled={disabled}
              className="w-full bg-[#0F172A] border border-[#334155] rounded-lg px-2 py-1 text-white text-xs focus:outline-none focus:border-[#22C55E] disabled:opacity-50"
            />
          ) : (
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              disabled={disabled}
              className="w-full bg-[#0F172A] border border-[#334155] rounded-lg px-2 py-1 text-white text-xs focus:outline-none focus:border-[#22C55E] disabled:opacity-50"
            />
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 py-0.5">
      <span className="flex-shrink-0">{getIcon()}</span>
      <div className="flex-1">
        <p className="text-[10px] text-gray-400">{label}</p>
        <p className="text-sm text-white">
          {isHidden ? 'Gizli' : (value || '-')}
        </p>
      </div>
    </div>
  )
}

export default InfoField