import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabaseClient'

function Navbar({ user, onAuthClick, onLogout }) {
  const [search, setSearch] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [balance, setBalance] = useState(0)
  const searchRef = useRef(null)
  const profileRef = useRef(null)

  useEffect(() => {
    if (user) {
      fetchUserBalance()
    }
  }, [user])

  async function fetchUserBalance() {
    const { data, error } = await supabase
      .from('users')
      .select('balance')
      .eq('auth_id', user.id)
      .single()
    
    if (!error && data) {
      setBalance(data.balance || 0)
    } else {
      setBalance(0)
    }
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false)
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (search.length < 2) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    const fetchSuggestions = async () => {
      const { data: productsData } = await supabase
        .from('products')
        .select('category')
        .eq('status', 'active')
        .ilike('category', `%${search}%`)
        .limit(10)

      const dbCategories = productsData ? [...new Set(productsData.map(p => p.category))] : []
      setSuggestions(dbCategories.slice(0, 8))
      setShowSuggestions(dbCategories.length > 0)
    }
    fetchSuggestions()
  }, [search])

  const handleSuggestionClick = (category) => {
    setSearch(category)
    setShowSuggestions(false)
    window.dispatchEvent(new CustomEvent('categorySearch', { detail: category }))
  }

  const getInitials = (email) => {
    return email?.charAt(0).toUpperCase() || 'U'
  }

  return (
    <nav className="glass fixed top-0 left-0 right-0 z-50 px-6 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-3">
        {/* Logo */}
        <div className="relative group cursor-pointer transition-all duration-300 hover:scale-105">
          <div className="bg-gradient-to-r from-[#0F172A] to-[#1E293B] rounded-2xl px-6 py-2.5 border border-[#22C55E]/40 shadow-2xl shadow-[#22C55E]/20">
            <div className="flex items-center gap-2">
              <svg className="w-6 h-6 text-[#22C55E] drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
              </svg>
              <span className="text-2xl font-black tracking-wider bg-gradient-to-r from-[#22C55E] via-[#38BDF8] to-[#22C55E] bg-clip-text text-transparent drop-shadow-md">
                ITEMCEPTE
              </span>
            </div>
          </div>
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-16 h-0.5 bg-gradient-to-r from-[#22C55E] to-[#38BDF8] rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
        </div>

        {/* Arama Çubuğu */}
        <div className="relative flex-1 max-w-md" ref={searchRef}>
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#38BDF8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            placeholder="Valorant, Mobile, CS2 ara..."
            className="input-modern w-full pl-9 text-sm"
          />
          
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-[#1E293B] border border-[#334155] rounded-xl overflow-hidden z-50 shadow-2xl">
              {suggestions.map((suggestion, idx) => (
                <div
                  key={idx}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="px-4 py-2 hover:bg-[#334155] cursor-pointer transition flex items-center gap-2"
                >
                  <svg className="w-4 h-4 text-[#38BDF8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <span className="text-sm text-white">{suggestion}</span>
                  <span className="text-xs text-gray-500 ml-auto">Kategori</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Profil / Bakiye / Giriş Butonları */}
        <div className="flex gap-3 items-center" ref={profileRef}>
          {user ? (
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-3 bg-[#1E293B] hover:bg-[#334155] rounded-full px-3 py-1.5 transition"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#22C55E] to-[#38BDF8] flex items-center justify-center text-sm font-bold">
                  {getInitials(user.email)}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-xs text-gray-400">Bakiye</p>
                  <p className="text-sm font-semibold text-[#22C55E]">{balance} TL</p>
                </div>
                <svg className={`w-4 h-4 text-gray-400 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-[#1E293B] border border-[#334155] rounded-xl shadow-2xl overflow-hidden z-50">
                  <div className="p-4 border-b border-[#334155]">
                    <p className="text-sm font-semibold text-white">{user.user_metadata?.full_name || user.email?.split('@')[0]}</p>
                    <p className="text-xs text-gray-400 truncate">{user.email}</p>
                  </div>
                  <div className="p-4 border-b border-[#334155]">
                    <p className="text-xs text-gray-400">Güncel Bakiye</p>
                    <p className="text-2xl font-bold text-[#22C55E]">{balance} TL</p>
                  </div>
                  <div className="p-2">
                    <button className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-[#334155] rounded-lg transition flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Profilim
                    </button>
                    <button className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-[#334155] rounded-lg transition flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-1.5 6M17 13l1.5 6M9 21h6M12 21v-6" />
                      </svg>
                      Bakiye Yükle
                    </button>
                    <hr className="my-2 border-[#334155]" />
                    <button
                      onClick={onLogout}
                      className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-[#334155] rounded-lg transition flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Çıkış Yap
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <button onClick={onAuthClick} className="bg-[#1E293B] text-white px-5 py-1.5 rounded-full text-sm hover:bg-[#334155] transition">
                Giriş
              </button>
              <button onClick={onAuthClick} className="btn-primary-glow px-5 py-1.5 text-sm">
                Kayıt Ol
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar