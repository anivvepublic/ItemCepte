import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

function UserSearchModal({ isOpen, onClose, currentUserId }) {
  const [search, setSearch] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  if (!isOpen) return null

  const handleSearch = async () => {
    if (search.trim().length < 2) {
      setError('En az 2 karakter girin.')
      return
    }

    setLoading(true)
    setError('')
    setResults([])

    try {
      // Önce users tablosunda ara (sadece auth_id'si olanları)
      const { data, error: searchError } = await supabase
        .from('users')
        .select('auth_id, full_name, username, avatar_url, role')
        .neq('auth_id', currentUserId)
        .or(`username.ilike.%${search}%,full_name.ilike.%${search}%`)
        .limit(10)

      if (searchError) {
        console.error('Arama hatası:', searchError)
        setError('Arama sırasında hata oluştu.')
        setLoading(false)
        return
      }

      if (data && data.length > 0) {
        setResults(data)
      } else {
        setError('Kullanıcı bulunamadı.')
      }
    } catch (err) {
      console.error('Beklenmeyen hata:', err)
      setError('Bir hata oluştu.')
    }

    setLoading(false)
  }

  const handleUserClick = (userId) => {
    onClose()
    navigate(`/chat/${userId}/0`)
  }

  const getInitials = (name) => {
    if (!name) return 'U'
    return name.charAt(0).toUpperCase()
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#1E293B] rounded-2xl w-full max-w-md p-6 border border-[#334155] shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-white">Kullanıcı Ara</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">&times;</button>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setError('')
            }}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Kullanıcı adı veya isim ara..."
            className="flex-1 bg-[#0F172A] border border-[#334155] rounded-xl px-4 py-2.5 text-white placeholder:text-[#6B7280] focus:outline-none focus:border-[#22C55E] transition"
          />
          <button
            onClick={handleSearch}
            disabled={loading || search.trim().length < 2}
            className="bg-[#22C55E] hover:bg-[#16A34A] text-white px-4 py-2.5 rounded-xl transition disabled:opacity-50"
          >
            {loading ? '...' : 'Ara'}
          </button>
        </div>

        {error && <p className="text-sm text-red-500 mt-3">{error}</p>}

        {results.length > 0 && (
          <div className="mt-4 max-h-60 overflow-y-auto space-y-2">
            {results.map((user) => (
              <div
                key={user.auth_id}
                onClick={() => handleUserClick(user.auth_id)}
                className="glass-card p-3 cursor-pointer hover:border-[#22C55E] transition flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#22C55E] to-[#38BDF8] flex items-center justify-center text-white font-bold overflow-hidden flex-shrink-0">
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover" />
                  ) : (
                    getInitials(user.full_name || user.username || 'U')
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white text-sm truncate">
                    {user.full_name || user.username || 'Kullanıcı'}
                  </p>
                  <p className="text-xs text-gray-400 truncate">
                    {user.username ? `@${user.username}` : 'Kullanıcı adı yok'}
                  </p>
                </div>
                <span className="text-xs text-[#22C55E] bg-[#22C55E]/10 px-2 py-1 rounded-full">
                  {user.role === 'seller' ? 'Satıcı' : 'Alıcı'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default UserSearchModal