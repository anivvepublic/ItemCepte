import { useState, useEffect, useRef, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import NotificationBell from './NotificationBell'

function Navbar({ user, onAuthClick, onLogout }) {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [balance, setBalance] = useState(0)
  const [avatarUrl, setAvatarUrl] = useState(null)
  const [userName, setUserName] = useState('')
  const [isSeller, setIsSeller] = useState(false)
  const searchRef = useRef(null)
  const profileRef = useRef(null)
  const debounceTimer = useRef(null)

  const handleLogoClick = () => {
    navigate('/')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Toast gösterimi
  const showToast = (message, type = 'info') => {
    // App.jsx'deki toast sistemini kullan
    window.dispatchEvent(new CustomEvent('showToast', { 
      detail: { message, type } 
    }))
  }

  useEffect(() => {
    if (user) {
      fetchUserData()
      checkSellerStatus()
      const channel = supabase
        .channel('profile-changes')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'users',
            filter: `auth_id=eq.${user.id}`
          },
          (payload) => {
            if (payload.new) {
              setAvatarUrl(payload.new.avatar_url || null)
              setUserName(payload.new.full_name || user.email?.split('@')[0] || 'Kullanıcı')
              if (payload.new.balance !== undefined) setBalance(payload.new.balance || 0)
              if (payload.new.role !== undefined) setIsSeller(payload.new.role === 'seller')
            }
          }
        )
        .subscribe()
      return () => { supabase.removeChannel(channel) }
    }
  }, [user])

  async function fetchUserData() {
    if (!user) return
    const { data, error } = await supabase
      .from('users')
      .select('avatar_url, full_name, balance')
      .eq('auth_id', user.id)
      .single()
    if (!error && data) {
      setAvatarUrl(data.avatar_url || null)
      setUserName(data.full_name || user.email?.split('@')[0] || 'Kullanıcı')
      setBalance(data.balance || 0)
    } else {
      setAvatarUrl(null)
      setUserName(user.email?.split('@')[0] || 'Kullanıcı')
    }
  }

  async function checkSellerStatus() {
    if (!user) return
    const { data, error } = await supabase
      .from('users')
      .select('role')
      .eq('auth_id', user.id)
      .single()
    if (!error && data) {
      setIsSeller(data.role === 'seller')
    }
  }

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        if (session?.user) fetchUserData()
        if (session?.user) checkSellerStatus()
      }
    })
    return () => listener?.subscription.unsubscribe()
  }, [])

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

  const fetchSuggestions = useCallback(async (query) => {
    if (query.length < 2) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }
    const { data: productsData } = await supabase
      .from('products')
      .select('id, title, category, price, image_url')
      .eq('status', 'active')
      .or(`title.ilike.%${query}%,category.ilike.%${query}%`)
      .limit(10)

    if (productsData && productsData.length > 0) {
      const categories = [...new Set(productsData.map(p => p.category))]
      const categorySuggestions = categories.slice(0, 3).map(cat => ({
        type: 'category',
        label: cat,
        category: cat
      }))
      const productSuggestions = productsData.slice(0, 5).map(p => ({
        type: 'product',
        label: p.title,
        id: p.id,
        category: p.category,
        price: p.price,
        image_url: p.image_url
      }))
      setSuggestions([...categorySuggestions, ...productSuggestions])
      setShowSuggestions(true)
    } else {
      const saved = localStorage.getItem('searchHistory')
      let history = []
      if (saved) { try { history = JSON.parse(saved).filter(h => h.toLowerCase().includes(query.toLowerCase())).slice(0, 3) } catch (e) {} }
      if (history.length > 0) {
        setSuggestions(history.map(h => ({ type: 'history', label: h })))
        setShowSuggestions(true)
      } else {
        setSuggestions([])
        setShowSuggestions(false)
      }
    }
  }, [])

  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current)
    debounceTimer.current = setTimeout(() => {
      fetchSuggestions(search)
    }, 400)
    return () => { if (debounceTimer.current) clearTimeout(debounceTimer.current) }
  }, [search, fetchSuggestions])

  const handleSearch = (e) => {
    e.preventDefault()
    if (search.trim().length < 2) return
    const saved = localStorage.getItem('searchHistory')
    let history = []
    if (saved) { try { history = JSON.parse(saved) } catch (e) {} }
    history = [search, ...history.filter(h => h !== search)].slice(0, 5)
    localStorage.setItem('searchHistory', JSON.stringify(history))
    setShowSuggestions(false)
    navigate(`/arama?q=${encodeURIComponent(search.trim())}`)
  }

  const handleSuggestionClick = (suggestion) => {
    setShowSuggestions(false)
    if (suggestion.type === 'category') {
      window.dispatchEvent(new CustomEvent('categorySearch', { detail: suggestion.category }))
      setSearch('')
      navigate('/')
    } else if (suggestion.type === 'product') {
      navigate(`/product/${suggestion.id}`)
    } else if (suggestion.type === 'history') {
      setSearch(suggestion.label)
      navigate(`/arama?q=${encodeURIComponent(suggestion.label)}`)
    }
  }

  const getInitials = () => {
    if (userName) return userName.charAt(0).toUpperCase()
    if (user?.email) return user.email.charAt(0).toUpperCase()
    return 'U'
  }

  // Buton tıklama işlemi
  const handleSellerAction = (target, actionName) => {
    if (!user) {
      // Giriş yapmamış → bu durum zaten buton gözükmediği için olmaz ama yine de
      showToast('Lütfen önce giriş yapın.', 'warning')
      onAuthClick()
      return
    }

    if (!isSeller) {
      showToast('Satıcı olmak için başvuru yapmanız gerekiyor.', 'info')
      window.dispatchEvent(new CustomEvent('openSellerApplication'))
      return
    }

    navigate(target)
  }

  return (
    <nav className="glass fixed top-0 left-0 right-0 z-50 px-3 py-2 md:px-6 md:py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-2">
        <button
          onClick={handleLogoClick}
          className="transition-all duration-300 hover:scale-105 text-base md:text-2xl font-black tracking-wider"
        >
          <span className="text-[#22C55E]">ITEM</span>
          <span className="text-[#38BDF8]">CEPTE</span>
        </button>

        <div className="relative w-full md:flex-1 md:max-w-lg order-last md:order-none mt-2 md:mt-0" ref={searchRef}>
          <form onSubmit={handleSearch} className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#38BDF8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true) }}
              placeholder="Oyun, skin, hesap ara..."
              className="input-modern w-full pl-9 pr-4 text-sm md:text-base transition-all duration-300"
            />
          </form>

          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-[#1E293B] border border-[#334155] rounded-xl overflow-hidden z-50 shadow-2xl max-h-60 overflow-y-auto">
              {suggestions.map((suggestion, idx) => (
                <div
                  key={idx}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="px-3 py-2 hover:bg-[#334155] cursor-pointer transition flex items-center gap-2 text-sm"
                >
                  {suggestion.type === 'category' && (
                    <svg className="w-4 h-4 text-[#38BDF8] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                  )}
                  {suggestion.type === 'product' && (
                    <div className="w-8 h-8 rounded-lg bg-[#0F172A] flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {suggestion.image_url ? (
                        <img src={suggestion.image_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                      )}
                    </div>
                  )}
                  <div className="flex-1 truncate">
                    <span className="text-sm text-white">{suggestion.label}</span>
                    {suggestion.type === 'product' && (
                      <span className="text-xs text-gray-500 ml-1">• {suggestion.price} TL</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 md:gap-3" ref={profileRef}>
          <Link to="/kategoriler" className="bg-[#1E293B] hover:bg-[#334155] text-white px-2 py-1 md:px-4 md:py-1.5 rounded-full text-xs md:text-sm transition flex items-center gap-1">
            <svg className="w-4 h-4 md:w-5 md:h-5 text-[#38BDF8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <span className="hidden sm:inline">Kategoriler</span>
            <span className="sm:hidden">K</span>
          </Link>

          {/* SADECE GİRİŞ YAPMIŞ KULLANICIYA GÖSTER */}
          {user && (
            <>
              <button
                onClick={() => handleSellerAction('/satıcı-panel', 'İlanlarım')}
                className="bg-[#1E293B] hover:bg-[#334155] text-white px-2 py-1 md:px-4 md:py-1.5 rounded-full text-xs md:text-sm transition flex items-center gap-1"
              >
                <svg className="w-4 h-4 md:w-5 md:h-5 text-[#38BDF8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <span className="hidden sm:inline">İlanlarım</span>
                <span className="sm:hidden">İlan</span>
              </button>

              <button
                onClick={() => handleSellerAction('/ilan-ver', 'İlan Ver')}
                className="bg-[#22C55E] hover:bg-[#16A34A] text-white px-2 py-1 md:px-4 md:py-1.5 rounded-full text-xs md:text-sm transition flex items-center gap-1"
              >
                <svg className="w-4 h-4 md:w-5 md:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="hidden sm:inline">İlan Ver</span>
                <span className="sm:hidden">+</span>
              </button>
            </>
          )}

          {user ? (
            <>
              <NotificationBell userId={user.id} />
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-1 md:gap-2 bg-[#1E293B] hover:bg-[#334155] rounded-full px-1.5 py-1 md:px-3 md:py-1.5 transition"
              >
                <div className="w-7 h-7 md:w-9 md:h-9 rounded-full bg-gradient-to-r from-[#22C55E] to-[#38BDF8] flex items-center justify-center text-xs md:text-sm font-bold overflow-hidden border-2 border-[#0F172A]">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    getInitials()
                  )}
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
                <div className="absolute right-0 top-full mt-2 w-56 md:w-64 bg-[#1E293B] border border-[#334155] rounded-xl shadow-2xl overflow-hidden z-50">
                  <div className="p-3 md:p-4 border-b border-[#334155]">
                    <p className="text-sm font-semibold text-white truncate">{userName || user.email?.split('@')[0]}</p>
                    <p className="text-xs text-gray-400 truncate">{user.email}</p>
                  </div>
                  <div className="p-3 md:p-4 border-b border-[#334155]">
                    <p className="text-xs text-gray-400">Güncel Bakiye</p>
                    <p className="text-xl md:text-2xl font-bold text-[#22C55E]">{balance} TL</p>
                  </div>
                  <div className="p-2">
                    <button onClick={() => { setShowProfileMenu(false); navigate('/profil') }} className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-[#334155] rounded-lg transition flex items-center gap-2">
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
                    <button onClick={() => { setShowProfileMenu(false); onLogout() }} className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-[#334155] rounded-lg transition flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Çıkış
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              <button onClick={onAuthClick} className="bg-[#1E293B] text-white px-2 py-1 md:px-5 md:py-1.5 rounded-full text-xs md:text-sm hover:bg-[#334155] transition">
                Giriş
              </button>
              <button onClick={onAuthClick} className="btn-primary-glow px-2 py-1 md:px-5 md:py-1.5 text-xs md:text-sm">
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