import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import ProductCardSeller from '../components/ProductCardSeller'

const allCategories = [
  'valorant', 'cs2', 'rust', 'league of legends', 'metin2',
  'apex legends', 'steam/epic', 'pubg mobile', 'mobile legends',
  'free fire', 'brawl stars', 'clash royale', 'wild rift',
  'rise of kingdoms', 'honor of kings', 'critical ops',
  'efootball', 'fc mobile', 'call of duty', 'overwatch 2',
  'rainbow six siege', 'genshin impact', 'standoff 2'
]

function SellerPanel() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [stats, setStats] = useState({ total: 0, active: 0, sold: 0, weekly: 0 })
  const [toast, setToast] = useState(null)
  const [showFilters, setShowFilters] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    checkUser()
  }, [])

  useEffect(() => {
    let filtered = [...products]

    if (categoryFilter) {
      filtered = filtered.filter(p => p.category === categoryFilter)
    }

    if (statusFilter) {
      filtered = filtered.filter(p => p.status === statusFilter)
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim()
      filtered = filtered.filter(p => 
        p.title?.toLowerCase().includes(term) ||
        p.description?.toLowerCase().includes(term)
      )
    }

    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        break
      case 'oldest':
        filtered.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
        break
      case 'price_high':
        filtered.sort((a, b) => b.price - a.price)
        break
      case 'price_low':
        filtered.sort((a, b) => a.price - b.price)
        break
      default:
        break
    }

    setFilteredProducts(filtered)
  }, [products, categoryFilter, statusFilter, searchTerm, sortBy])

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  async function checkUser() {
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    if (!currentUser) {
      navigate('/')
      return
    }

    const { data: profileData } = await supabase
      .from('users')
      .select('*')
      .eq('auth_id', currentUser.id)
      .single()

    if (!profileData || profileData.role !== 'seller') {
      navigate('/')
      return
    }

    setUser(currentUser)
    setProfile(profileData)
    await fetchProducts(currentUser.id)
    setLoading(false)
  }

  async function fetchProducts(userId) {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('seller_id', userId)
      .order('created_at', { ascending: false })

    if (!error && data) {
      setProducts(data)
      setFilteredProducts(data)

      const total = data.length
      const active = data.filter(p => p.status === 'active').length
      const sold = data.filter(p => p.status === 'sold').length
      
      const now = new Date()
      const weekAgo = new Date(now)
      weekAgo.setDate(now.getDate() - 7)
      const weekly = data.filter(p => new Date(p.created_at) > weekAgo).length

      setStats({ total, active, sold, weekly })
    }
  }

  const handleDelete = async (productId) => {
    if (window.confirm('Bu ilanı silmek istediğinize emin misiniz?')) {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId)

      if (!error) {
        setProducts(products.filter(p => p.id !== productId))
        showToast('İlan başarıyla silindi!', 'success')
      }
    }
  }

  const handleStatusChange = async (productId, newStatus) => {
    const { error } = await supabase
      .from('products')
      .update({ status: newStatus })
      .eq('id', productId)

    if (!error) {
      setProducts(products.map(p => p.id === productId ? { ...p, status: newStatus } : p))
      showToast('İlan durumu güncellendi!', 'success')
    }
  }

  const handleCopyProduct = async (product) => {
    const { data, error } = await supabase
      .from('products')
      .insert({
        title: product.title + ' (Kopya)',
        category: product.category,
        price: product.price,
        description: product.description || '',
        status: 'active',
        seller_id: user.id,
        image_url: product.image_url
      })
      .select()

    if (!error && data) {
      setProducts([...products, data[0]])
      showToast('İlan kopyalandı!', 'success')
    }
  }

  const displayCategory = (cat) => {
    if (!cat) return ''
    return cat.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
  }

  const clearFilters = () => {
    setCategoryFilter('')
    setStatusFilter('')
    setSearchTerm('')
    setSortBy('newest')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#22C55E] border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!user || !profile || profile.role !== 'seller') {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-4">
        <div className="glass-card p-6 sm:p-8 text-center border border-[#334155] max-w-md w-full rounded-xl">
          <svg className="w-12 h-12 sm:w-16 sm:h-16 text-[#FBBF24] mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <h2 className="text-lg sm:text-xl font-bold text-white mb-2">Satıcı Hesabı Gerekli</h2>
          <p className="text-gray-400 text-xs sm:text-sm mb-4">Bu sayfaya erişmek için satıcı hesabına sahip olmalısınız.</p>
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('openSellerApplication'))}
            className="text-[#22C55E] hover:text-[#16A34A] transition text-xs sm:text-sm flex items-center justify-center gap-1"
          >
            Satıcı olmak için başvur
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0F172A] pt-20 md:pt-24 pb-10 px-2 sm:px-3 md:px-4">
      <div className="max-w-7xl mx-auto">
        {/* Toast */}
        {toast && (
          <div className={`fixed top-24 left-1/2 transform -translate-x-1/2 z-50 px-4 sm:px-6 py-2 md:py-3 rounded-xl shadow-2xl text-xs md:text-sm font-semibold transition-all duration-300 ${
            toast.type === 'success' ? 'bg-[#22C55E] text-white' :
            toast.type === 'error' ? 'bg-[#EF4444] text-white' :
            'bg-[#38BDF8] text-black'
          }`}>
            {toast.message}
          </div>
        )}

        {/* Başlık */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 md:mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">Satıcı Paneli</h1>
            <p className="text-xs sm:text-sm text-gray-400">Hoş geldin, {profile.full_name || user.email?.split('@')[0]}</p>
          </div>
          <Link
            to="/ilan-ver"
            className="w-full sm:w-auto bg-[#22C55E] hover:bg-[#16A34A] text-white px-4 py-2 md:px-6 md:py-2.5 rounded-full text-xs md:text-sm font-semibold transition flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Yeni İlan Ekle
          </Link>
        </div>

        {/* İstatistikler */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 lg:gap-4 mb-4 md:mb-6">
          <div className="glass-card p-2.5 md:p-4 text-center border border-[#334155] hover:border-[#22C55E] transition rounded-lg">
            <p className="text-xl md:text-2xl lg:text-3xl font-bold text-white">{stats.total}</p>
            <p className="text-[10px] md:text-xs text-gray-400">Toplam İlan</p>
          </div>
          <div className="glass-card p-2.5 md:p-4 text-center border border-[#334155] hover:border-[#38BDF8] transition rounded-lg">
            <p className="text-xl md:text-2xl lg:text-3xl font-bold text-[#22C55E]">{stats.active}</p>
            <p className="text-[10px] md:text-xs text-gray-400">Aktif</p>
          </div>
          <div className="glass-card p-2.5 md:p-4 text-center border border-[#334155] hover:border-[#FBBF24] transition rounded-lg">
            <p className="text-xl md:text-2xl lg:text-3xl font-bold text-[#FBBF24]">{stats.sold}</p>
            <p className="text-[10px] md:text-xs text-gray-400">Satıldı</p>
          </div>
          <div className="glass-card p-2.5 md:p-4 text-center border border-[#334155] hover:border-[#A855F7] transition rounded-lg">
            <p className="text-xl md:text-2xl lg:text-3xl font-bold text-[#A855F7]">{stats.weekly}</p>
            <p className="text-[10px] md:text-xs text-gray-400">Bu Hafta</p>
          </div>
        </div>

        {/* Filtreler - Mobile açılır */}
        <div className="mb-4 md:mb-6">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="md:hidden w-full flex items-center justify-between bg-[#1E293B] border border-[#334155] rounded-lg px-3 py-2 text-white text-sm mb-3"
          >
            <span>Filtreler</span>
            <svg className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </button>

          <div className={`${showFilters ? 'block' : 'hidden'} md:block glass-card p-3 md:p-4 border border-[#334155] rounded-lg`}>
            <div className="flex flex-col md:flex-row gap-2 md:gap-3">
              {/* Arama */}
              <div className="flex-1">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="İlan ara..."
                  className="w-full bg-[#0F172A] border border-[#334155] rounded-lg px-3 py-2 text-xs md:text-sm text-white placeholder:text-[#6B7280] focus:outline-none focus:border-[#22C55E] transition"
                />
              </div>

              {/* Kategori */}
              <div className="w-full md:w-40">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full bg-[#0F172A] border border-[#334155] rounded-lg px-3 py-2 text-xs md:text-sm text-white focus:outline-none focus:border-[#22C55E] transition"
                >
                  <option value="">Kategoriler</option>
                  {allCategories.map((cat) => (
                    <option key={cat} value={cat}>{displayCategory(cat)}</option>
                  ))}
                </select>
              </div>

              {/* Durum */}
              <div className="w-full md:w-36">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full bg-[#0F172A] border border-[#334155] rounded-lg px-3 py-2 text-xs md:text-sm text-white focus:outline-none focus:border-[#22C55E] transition"
                >
                  <option value="">Durumlar</option>
                  <option value="active">Aktif</option>
                  <option value="sold">Satıldı</option>
                  <option value="deleted">Silindi</option>
                </select>
              </div>

              {/* Sıralama */}
              <div className="w-full md:w-36">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full bg-[#0F172A] border border-[#334155] rounded-lg px-3 py-2 text-xs md:text-sm text-white focus:outline-none focus:border-[#22C55E] transition"
                >
                  <option value="newest">En Yeni</option>
                  <option value="oldest">En Eski</option>
                  <option value="price_high">Fiyat ↓</option>
                  <option value="price_low">Fiyat ↑</option>
                </select>
              </div>

              {/* Temizle */}
              <button
                onClick={clearFilters}
                className="px-3 md:px-4 py-2 bg-[#334155] hover:bg-[#475569] text-white rounded-lg text-xs md:text-sm transition whitespace-nowrap"
              >
                Temizle
              </button>
            </div>
          </div>
        </div>

        {/* İlan Listesi */}
        {filteredProducts.length === 0 ? (
          <div className="glass-card p-6 md:p-8 lg:p-12 text-center border border-[#334155] rounded-lg">
            <svg className="w-10 h-10 md:w-12 md:h-12 lg:w-16 lg:h-16 text-gray-600 mx-auto mb-3 md:mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p className="text-gray-400 text-xs md:text-sm lg:text-base">
              {searchTerm || categoryFilter || statusFilter ? 'Filtrelere uygun ilan bulunamadı.' : 'Henüz ilanın yok.'}
            </p>
            <Link to="/ilan-ver" className="text-[#22C55E] text-xs md:text-sm hover:underline mt-2 inline-block">
              {searchTerm || categoryFilter || statusFilter ? 'Filtreleri temizle' : 'İlk ilanını ekle!'}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-3 lg:gap-4">
            {filteredProducts.map((product) => (
              <ProductCardSeller
                key={product.id}
                product={product}
                onDelete={handleDelete}
                onStatusChange={handleStatusChange}
                onCopy={handleCopyProduct}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default SellerPanel