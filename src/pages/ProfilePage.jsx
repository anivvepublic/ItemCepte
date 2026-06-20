import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import AvatarUpload from '../components/AvatarUpload'
import StatCard from '../components/StatCard'
import InfoField from '../components/InfoField'
import TimelineItem from '../components/TimelineItem'
import ProfileCharts from '../components/ProfileCharts'

function ProfilePage({ onLogout }) {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [userProducts, setUserProducts] = useState([])
  const [userOrders, setUserOrders] = useState([])
  const [activities, setActivities] = useState([])
  const [editMode, setEditMode] = useState(false)
  const [chartsPublic, setChartsPublic] = useState(false)
  const [formData, setFormData] = useState({
    full_name: '',
    username: '',
    phone: '',
    email: '',
    bio: '',
    website: '',
    phone_public: false,
    email_public: false
  })
  const [rating] = useState(0)
  const [balance, setBalance] = useState(0)
  const [saveError, setSaveError] = useState(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        navigate('/')
      }
    })
  }, [navigate])

  useEffect(() => {
    fetchUserAndProfile()
  }, [])

  async function fetchUserAndProfile() {
    setLoading(true)
    setSaveError(null)
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    setUser(currentUser)

    if (!currentUser) {
      navigate('/')
      setLoading(false)
      return
    }

    const { data: profileData, error } = await supabase
      .from('users')
      .select('*')
      .eq('auth_id', currentUser.id)
      .single()
    
    if (error) {
      console.error('Profil çekme hatası:', error)
      setLoading(false)
      return
    }

    if (profileData) {
      setProfile(profileData)
      setBalance(profileData.balance || 0)
      setChartsPublic(profileData.charts_public || false)
      setFormData({
        full_name: profileData.full_name || '',
        username: profileData.username || '',
        phone: profileData.phone || '',
        email: currentUser.email || '',
        bio: profileData.bio || '',
        website: profileData.website || '',
        phone_public: profileData.phone_public || false,
        email_public: profileData.email_public || false
      })

      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('seller_id', profileData.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(6)
      
      if (!productsError) setUserProducts(products || [])

      const { data: allProducts } = await supabase
        .from('products')
        .select('*')
        .eq('seller_id', profileData.id)
      setUserProducts(prev => [...prev, ...(allProducts || [])])

      const { data: orders } = await supabase
        .from('orders')
        .select('*, products(title, category)')
        .eq('buyer_id', profileData.id)
        .order('created_at', { ascending: false })
        .limit(10)
      if (orders) setUserOrders(orders)

      await fetchActivities(profileData.id)
    }
    setLoading(false)
  }

  async function fetchActivities(userId) {
    try {
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('*, products(title)')
        .eq('buyer_id', userId)
        .order('created_at', { ascending: false })
        .limit(5)

      if (!ordersError && orders) {
        const orderActivities = orders.map(order => ({
          id: `order-${order.id}`,
          type: 'order',
          text: `"${order.products?.title || 'Ürün'}" satın aldı`,
          time: new Date(order.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
        }))
        setActivities(prev => [...prev, ...orderActivities])
      }

      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('seller_id', userId)
        .order('created_at', { ascending: false })
        .limit(5)

      if (!productsError && products) {
        const productActivities = products.map(p => ({
          id: `product-${p.id}`,
          type: 'product',
          text: `"${p.title}" ilanını ekledi`,
          time: new Date(p.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
        }))
        setActivities(prev => [...prev, ...productActivities])
      }

    } catch (error) {
      console.error('Aktivite çekme hatası:', error)
    }
  }

  const handleSaveProfile = async () => {
    setSaveError(null)
    const { error } = await supabase
      .from('users')
      .update({
        full_name: formData.full_name,
        username: formData.username,
        phone: formData.phone,
        bio: formData.bio,
        website: formData.website,
        phone_public: formData.phone_public,
        email_public: formData.email_public,
        charts_public: chartsPublic
      })
      .eq('auth_id', user.id)

    if (error) {
      console.error('Güncelleme hatası:', error)
      setSaveError('Güncelleme sırasında hata oluştu: ' + error.message)
    } else {
      setProfile({ ...profile, ...formData })
      setEditMode(false)
      setSaveError(null)
      alert('Profil başarıyla güncellendi!')
    }
  }

  const getMemberSince = (date) => {
    if (!date) return 'Yeni üye'
    const d = new Date(date)
    const now = new Date()
    const diff = now - d
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    if (days < 30) return `${days} gün önce katıldı`
    if (days < 365) return `${Math.floor(days / 30)} ay önce katıldı`
    return `${Math.floor(days / 365)} yıl önce katıldı`
  }

  const formatDate = (date) => {
    if (!date) return 'Yeni üye'
    const d = new Date(date)
    return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  const openSellerApplication = () => {
    window.dispatchEvent(new CustomEvent('openSellerApplication'))
  }

  const handleLogoutClick = async () => {
    if (onLogout) {
      await onLogout()
    }
    navigate('/')
  }

  // Satıcı mı kontrol et
  const isSeller = profile?.role === 'seller'

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
        <div className="w-12 h-12 md:w-16 md:h-16 border-4 border-[#22C55E] border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-gray-400 text-xs sm:text-sm md:text-base">Profil bulunamadı. Lütfen giriş yapın.</p>
          <button onClick={() => navigate('/')} className="btn-primary-glow mt-4 text-xs sm:text-sm md:text-base">
            Ana Sayfaya Dön
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0F172A] pt-20 md:pt-24 pb-10 px-2 sm:px-3 md:px-4">
      <div className="max-w-7xl mx-auto">
        {/* Üst Profil Alanı */}
        <div className="relative flex flex-col md:flex-row items-center md:items-start gap-3 md:gap-6 mb-6 md:mb-8">
          <AvatarUpload 
            userId={user.id}
            currentPhoto={profile.avatar_url}
            size="lg"
          />

          <div className="flex-1 text-center md:text-left">
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white">
              {profile.username || 'kullanici'}
            </h1>
            <p className="text-sm md:text-base lg:text-lg text-gray-400">{profile.full_name || 'İsimsiz Kullanıcı'}</p>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mt-2">
              {profile.role === 'seller' && (
                <span className="bg-[#22C55E]/20 text-[#22C55E] text-[10px] sm:text-xs md:text-sm px-2 py-0.5 md:px-3 md:py-1 rounded-full">Satıcı</span>
              )}
              {profile.role === 'buyer' && (
                <span className="bg-[#38BDF8]/20 text-[#38BDF8] text-[10px] sm:text-xs md:text-sm px-2 py-0.5 md:px-3 md:py-1 rounded-full">Alıcı</span>
              )}
              <span className="text-[10px] sm:text-xs md:text-sm text-gray-500">{getMemberSince(profile.created_at)}</span>
            </div>
            {profile.bio && (
              <p className="text-xs sm:text-sm text-gray-400 mt-2 md:mt-3 max-w-lg">{profile.bio}</p>
            )}
          </div>

          <div className="flex-shrink-0 flex flex-col gap-2 w-full md:w-auto">
            {profile.role !== 'seller' && (
              <button
                onClick={openSellerApplication}
                className="bg-[#FBBF24] hover:bg-[#F59E0B] text-black font-semibold px-4 py-2 md:px-5 md:py-2.5 rounded-full text-xs md:text-sm transition shadow-lg shadow-[#FBBF24]/20 w-full md:w-auto"
              >
                Satıcı Ol
              </button>
            )}
            
            <button 
              onClick={() => alert('Bakiye yükleme ekranı yakında!')}
              className="glass-card px-3 py-2 md:px-4 md:py-2.5 flex items-center justify-center md:justify-start gap-2 hover:border-[#22C55E] transition group hover:shadow-[0_0_20px_rgba(34,197,94,0.1)]"
            >
              <svg className="w-4 h-4 md:w-5 md:h-5 text-[#FBBF24]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c.5 0 1-.448 1-1v-3c0-.552-.5-1-1-1s-1 .448-1 1v3c0 .552.5 1 1 1z" />
              </svg>
              <div className="hidden md:block">
                <p className="text-xs text-gray-400">Bakiye</p>
                <p className="text-sm md:text-base font-bold text-[#22C55E]">{balance} TL</p>
              </div>
              <svg className="w-4 h-4 text-gray-400 group-hover:text-white transition hidden md:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* İstatistikler */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 mb-4 md:mb-6">
          <StatCard value={userProducts.length} label="Aktif İlan" icon="product" color="#22C55E" />
          <StatCard value={balance} label="Bakiye" icon="wallet" color="#38BDF8" prefix="₺" />
          <StatCard value={rating} label="Puan" icon="star" color="#FBBF24" />
          <StatCard value={formatDate(profile.created_at)} label="Üyelik" icon="calendar" color="#F1F5F9" />
        </div>

        {/* GRAFİKLER - SADECE SATICI GÖREBİLİR */}
        <div className="mb-4 md:mb-6">
          {isSeller ? (
            <>
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-3 gap-2">
                <h3 className="text-xs md:text-sm font-semibold text-white">İstatistikler</h3>
                <label className="flex items-center gap-2 text-[10px] md:text-xs text-gray-400">
                  <input
                    type="checkbox"
                    checked={chartsPublic}
                    onChange={(e) => setChartsPublic(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-[#334155] bg-[#0F172A] text-[#22C55E] focus:ring-[#22C55E]"
                  />
                  Grafikleri herkese açık yap
                </label>
              </div>
              <ProfileCharts 
                orders={userOrders} 
                products={userProducts} 
                isPublic={chartsPublic} 
                isOwnProfile={true} 
              />
            </>
          ) : (
            <div className="glass-card p-6 md:p-8 lg:p-12 text-center border border-[#334155] rounded-lg">
              <div className="flex flex-col items-center justify-center gap-4">
                <svg className="w-10 h-10 md:w-12 md:h-12 lg:w-16 lg:h-16 text-[#38BDF8]/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <div>
                  <p className="text-gray-400 text-xs md:text-sm lg:text-base font-medium">İstatistikler Kilitli</p>
                  <p className="text-gray-500 text-[10px] md:text-xs lg:text-sm mt-1 max-w-md">
                    İstatistiklere erişmek için satıcı hesabına sahip olmalısınız.
                  </p>
                  <button
                    onClick={openSellerApplication}
                    className="mt-3 md:mt-4 bg-[#FBBF24] hover:bg-[#F59E0B] text-black font-semibold px-4 py-2 rounded-full text-xs md:text-sm transition shadow-lg shadow-[#FBBF24]/20"
                  >
                    Satıcı Ol
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bilgi Kartları */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mb-4 md:mb-6">
          {/* Kişisel Bilgiler */}
          <div className="glass-card p-3 md:p-4 hover:shadow-[0_0_25px_rgba(34,197,94,0.08)] transition border border-[#334155] hover:border-[#22C55E]/40 rounded-lg">
            <h3 className="text-[10px] md:text-xs font-semibold text-gray-400 mb-2 md:mb-3 flex items-center gap-2 uppercase tracking-wider">
              <svg className="w-3 h-3 md:w-4 md:h-4 text-[#38BDF8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Kişisel Bilgiler
            </h3>
            {editMode ? (
              <div className="space-y-2">
                <InfoField icon="user" label="Ad Soyad" value={formData.full_name} onChange={(val) => setFormData({ ...formData, full_name: val })} editMode />
                <InfoField icon="at-symbol" label="Kullanıcı Adı" value={formData.username} onChange={(val) => setFormData({ ...formData, username: val })} editMode />
                <InfoField icon="globe" label="Web Sitesi" value={formData.website} onChange={(val) => setFormData({ ...formData, website: val })} editMode />
                <InfoField icon="pencil" label="Bio" value={formData.bio} onChange={(val) => setFormData({ ...formData, bio: val })} editMode multiline />
                {saveError && <p className="text-red-500 text-[10px] md:text-xs">{saveError}</p>}
                <button onClick={handleSaveProfile} className="w-full bg-[#22C55E] hover:bg-[#16A34A] text-white font-medium py-1.5 rounded-lg text-xs md:text-sm transition">
                  Kaydet
                </button>
              </div>
            ) : (
              <div className="space-y-1.5">
                <InfoField icon="user" label="Ad Soyad" value={profile.full_name || '-'} />
                <InfoField icon="at-symbol" label="Kullanıcı Adı" value={profile.username || '-'} />
                <InfoField icon="globe" label="Web Sitesi" value={profile.website || '-'} />
                {profile.bio && <InfoField icon="pencil" label="Bio" value={profile.bio} />}
                <button onClick={() => setEditMode(true)} className="text-[10px] md:text-xs text-[#38BDF8] hover:text-[#22C55E] transition mt-1">
                  Düzenle
                </button>
              </div>
            )}
          </div>

          {/* İletişim Bilgileri */}
          <div className="glass-card p-3 md:p-4 hover:shadow-[0_0_25px_rgba(34,197,94,0.08)] transition border border-[#334155] hover:border-[#22C55E]/40 rounded-lg">
            <h3 className="text-[10px] md:text-xs font-semibold text-gray-400 mb-2 md:mb-3 flex items-center gap-2 uppercase tracking-wider">
              <svg className="w-3 h-3 md:w-4 md:h-4 text-[#38BDF8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              İletişim
            </h3>
            {editMode ? (
              <div className="space-y-2">
                <InfoField icon="phone" label="Telefon" value={formData.phone} onChange={(val) => setFormData({ ...formData, phone: val })} editMode />
                <InfoField icon="envelope" label="E-posta" value={formData.email} onChange={(val) => setFormData({ ...formData, email: val })} editMode disabled />
                <div className="flex items-center gap-2 mt-1">
                  <label className="text-[10px] md:text-xs text-gray-400">Telefonu herkese açık yap</label>
                  <input
                    type="checkbox"
                    checked={formData.phone_public}
                    onChange={(e) => setFormData({ ...formData, phone_public: e.target.checked })}
                    className="w-3.5 h-3.5 rounded border-[#334155] bg-[#0F172A] text-[#22C55E] focus:ring-[#22C55E]"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-[10px] md:text-xs text-gray-400">E-postayı herkese açık yap</label>
                  <input
                    type="checkbox"
                    checked={formData.email_public}
                    onChange={(e) => setFormData({ ...formData, email_public: e.target.checked })}
                    className="w-3.5 h-3.5 rounded border-[#334155] bg-[#0F172A] text-[#22C55E] focus:ring-[#22C55E]"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-1.5">
                <InfoField icon="phone" label="Telefon" value={profile.phone || '-'} publicValue={profile.phone_public} />
                <InfoField icon="envelope" label="E-posta" value={user?.email || '-'} publicValue={profile.email_public} />
                <div className="mt-2 text-[10px] md:text-xs text-gray-500 space-y-0.5">
                  <p>{profile.phone_public ? 'Telefon herkese açık' : 'Telefon gizli'}</p>
                  <p>{profile.email_public ? 'E-posta herkese açık' : 'E-posta gizli'}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* İlanlarım ve Aktiviteler */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4">
          <div className="glass-card p-3 md:p-4 hover:shadow-[0_0_25px_rgba(34,197,94,0.08)] transition border border-[#334155] hover:border-[#22C55E]/40 rounded-lg">
            <h3 className="text-[10px] md:text-xs font-semibold text-gray-400 mb-2 md:mb-3 flex items-center gap-2 uppercase tracking-wider">
              <svg className="w-3 h-3 md:w-4 md:h-4 text-[#22C55E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V7a2 2 0 012-2h6a2 2 0 012 2v2M7 20h10a2 2 0 002-2v-6H5v6a2 2 0 002 2z" />
              </svg>
              İlanlarım
            </h3>
            {userProducts.length === 0 ? (
              <div className="text-center py-3 md:py-4">
                <p className="text-gray-400 text-[10px] md:text-xs lg:text-sm">Henüz ilanın yok.</p>
                {isSeller ? (
                  <button className="text-[#22C55E] text-[10px] md:text-xs hover:underline mt-1">İlk ilanını ekle!</button>
                ) : (
                  <p className="text-gray-500 text-[10px] md:text-xs mt-1">Satıcı olarak ilan ekleyebilirsin.</p>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {userProducts.slice(0, 6).map((product) => (
                  <div 
                    key={product.id} 
                    className="bg-[#0F172A] rounded-lg p-1.5 border border-[#334155] hover:border-[#22C55E] transition hover:shadow-[0_0_15px_rgba(34,197,94,0.1)] cursor-pointer"
                    onClick={() => navigate(`/product/${product.id}`)}
                  >
                    <div className="aspect-square bg-[#1E293B] rounded-lg mb-1 flex items-center justify-center">
                      <svg className="w-4 h-4 md:w-5 md:h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                    <h4 className="text-white text-[10px] md:text-xs font-medium truncate">{product.title}</h4>
                    <p className="text-[#22C55E] text-[10px] md:text-xs font-bold">{product.price} TL</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="glass-card p-3 md:p-4 hover:shadow-[0_0_25px_rgba(34,197,94,0.08)] transition border border-[#334155] hover:border-[#22C55E]/40 rounded-lg">
            <h3 className="text-[10px] md:text-xs font-semibold text-gray-400 mb-2 md:mb-3 flex items-center gap-2 uppercase tracking-wider">
              <svg className="w-3 h-3 md:w-4 md:h-4 text-[#FBBF24]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Son Aktiviteler
            </h3>
            <div className="relative pl-4 md:pl-6 border-l-2 border-[#334155] space-y-2 md:space-y-3 max-h-64 overflow-y-auto pr-2">
              {activities.length === 0 ? (
                <p className="text-gray-400 text-[10px] md:text-xs lg:text-sm text-center py-3 md:py-4">Henüz aktivite yok</p>
              ) : (
                activities.slice(0, 6).map((activity, index) => (
                  <TimelineItem 
                    key={activity.id}
                    type={activity.type}
                    text={activity.text}
                    time={activity.time}
                    isLast={index === activities.slice(0, 6).length - 1}
                  />
                ))
              )}
            </div>
          </div>
        </div>

        {/* Çıkış Butonu */}
        <div className="mt-6 md:mt-8 text-center">
          <button
            onClick={handleLogoutClick}
            className="text-red-400 hover:text-red-300 text-xs md:text-sm transition border border-red-400/30 hover:border-red-400/60 px-3 md:px-6 py-1.5 md:py-2 rounded-full"
          >
            Çıkış Yap
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage