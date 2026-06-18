import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import ProductCardSeller from '../components/ProductCardSeller'

function SellerPanel() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ total: 0, active: 0, sold: 0 })
  const navigate = useNavigate()

  useEffect(() => {
    checkUser()
  }, [])

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
      // Satıcı değilse yönlendir
      navigate('/')
      return
    }

    setUser(currentUser)
    setProfile(profileData)
    await fetchProducts(profileData.id)
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
      const total = data.length
      const active = data.filter(p => p.status === 'active').length
      const sold = data.filter(p => p.status === 'sold').length
      setStats({ total, active, sold })
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
        const newTotal = products.length - 1
        const newActive = products.filter(p => p.id !== productId && p.status === 'active').length
        const newSold = products.filter(p => p.id !== productId && p.status === 'sold').length
        setStats({ total: newTotal, active: newActive, sold: newSold })
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
      const total = products.length
      const active = products.filter(p => p.id === productId ? newStatus === 'active' : p.status === 'active').length
      const sold = products.filter(p => p.id === productId ? newStatus === 'sold' : p.status === 'sold').length
      setStats({ total, active, sold })
    }
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
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
        <div className="glass-card p-8 text-center border border-[#334155] max-w-md">
          <svg className="w-16 h-16 text-[#FBBF24] mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <h2 className="text-xl font-bold text-white mb-2">Satıcı Hesabı Gerekli</h2>
          <p className="text-gray-400 text-sm mb-4">Bu sayfaya erişmek için satıcı hesabına sahip olmalısınız.</p>
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('openSellerApplication'))}
            className="text-[#22C55E] hover:text-[#16A34A] transition text-sm flex items-center justify-center gap-1"
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
    <div className="min-h-screen bg-[#0F172A] pt-20 md:pt-24 pb-10">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        {/* Başlık */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">Satıcı Paneli</h1>
            <p className="text-sm text-gray-400">Hoş geldin, {profile.full_name || user.email?.split('@')[0]}</p>
          </div>
          <Link
            to="/ilan-ver"
            className="w-full sm:w-auto bg-[#22C55E] hover:bg-[#16A34A] text-white px-4 py-2 md:px-6 md:py-2.5 rounded-full text-sm font-semibold transition flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Yeni İlan Ekle
          </Link>
        </div>

        {/* İstatistik Kartları */}
        <div className="grid grid-cols-3 gap-3 md:gap-4 mb-6">
          <div className="glass-card p-3 md:p-4 text-center border border-[#334155] hover:border-[#22C55E] transition">
            <p className="text-2xl md:text-3xl font-bold text-white">{stats.total}</p>
            <p className="text-[10px] md:text-xs text-gray-400">Toplam İlan</p>
          </div>
          <div className="glass-card p-3 md:p-4 text-center border border-[#334155] hover:border-[#38BDF8] transition">
            <p className="text-2xl md:text-3xl font-bold text-[#22C55E]">{stats.active}</p>
            <p className="text-[10px] md:text-xs text-gray-400">Aktif</p>
          </div>
          <div className="glass-card p-3 md:p-4 text-center border border-[#334155] hover:border-[#FBBF24] transition">
            <p className="text-2xl md:text-3xl font-bold text-[#FBBF24]">{stats.sold}</p>
            <p className="text-[10px] md:text-xs text-gray-400">Satıldı</p>
          </div>
        </div>

        {/* İlan Listesi */}
        {products.length === 0 ? (
          <div className="glass-card p-8 md:p-12 text-center border border-[#334155]">
            <svg className="w-12 h-12 md:w-16 md:h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p className="text-gray-400 text-sm md:text-base">Henüz ilanın yok.</p>
            <Link to="/ilan-ver" className="text-[#22C55E] text-sm hover:underline mt-2 inline-block">
              İlk ilanını ekle!
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {products.map((product) => (
              <ProductCardSeller
                key={product.id}
                product={product}
                onDelete={handleDelete}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default SellerPanel