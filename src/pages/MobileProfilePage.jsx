import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

function MobileProfilePage({ onLogout }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editMode, setEditMode] = useState(false)
  const [activeTab, setActiveTab] = useState('profil') // profil, ilanlarim
  const [userProducts, setUserProducts] = useState([])
  const [productsLoading, setProductsLoading] = useState(false)
  const [formData, setFormData] = useState({
    full_name: '',
    username: '',
    phone: '',
    bio: '',
    location: '',
    website: ''
  })
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    fetchProfile()
  }, [])

  async function fetchProfile() {
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    if (!currentUser) {
      navigate('/')
      return
    }
    setUser(currentUser)

    const { data: profileData } = await supabase
      .from('users')
      .select('*')
      .eq('auth_id', currentUser.id)
      .single()

    setProfile(profileData)
    setFormData({
      full_name: profileData?.full_name || '',
      username: profileData?.username || '',
      phone: profileData?.phone || '',
      bio: profileData?.bio || '',
      location: profileData?.location || '',
      website: profileData?.website || ''
    })

    // İlanları çek
    if (profileData?.role === 'seller') {
      await fetchUserProducts(profileData.id)
    }

    setLoading(false)
  }

  async function fetchUserProducts(userId) {
    setProductsLoading(true)
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('seller_id', userId)
      .order('created_at', { ascending: false })

    if (!error && data) {
      setUserProducts(data)
    }
    setProductsLoading(false)
  }

  const handleSave = async () => {
    setSaving(true)
    const { error } = await supabase
      .from('users')
      .update({
        full_name: formData.full_name,
        username: formData.username,
        phone: formData.phone,
        bio: formData.bio,
        location: formData.location,
        website: formData.website
      })
      .eq('auth_id', user.id)

    if (!error) {
      setProfile({ ...profile, ...formData })
      setEditMode(false)
      showToast('Bilgiler güncellendi!', 'success')
    } else {
      showToast('Güncelleme hatası!', 'error')
    }
    setSaving(false)
  }

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    if (onLogout) onLogout()
    navigate('/')
  }

  const getInitials = (name) => {
    if (!name) return 'U'
    return name.charAt(0).toUpperCase()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#22C55E] border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400">Profil bulunamadı.</p>
        </div>
      </div>
    )
  }

  const isSeller = profile.role === 'seller'

  return (
    <div className="min-h-screen bg-[#0F172A] pt-16 pb-24 px-4">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-20 left-1/2 transform -translate-x-1/2 z-50 px-4 py-2 rounded-xl shadow-2xl text-sm font-semibold transition-all duration-300 ${
          toast.type === 'success' ? 'bg-[#22C55E] text-white' :
          toast.type === 'error' ? 'bg-[#EF4444] text-white' :
          'bg-[#38BDF8] text-black'
        }`}>
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        {editMode ? (
          <button onClick={() => setEditMode(false)} className="text-gray-400 hover:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
        ) : (
          <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
        )}
        <h1 className="text-xl font-bold text-white">
          {editMode ? 'Profili Düzenle' : 'Profilim'}
        </h1>
        <div className="w-6"></div>
      </div>

      {!editMode ? (
        <>
          {/* Profil Kartı */}
          <div className="bg-[#1E293B] rounded-2xl p-6 border border-[#334155] mb-6">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-[#22C55E] to-[#38BDF8] flex items-center justify-center text-3xl font-bold text-white">
                {getInitials(profile.full_name)}
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{profile.full_name || 'İsimsiz'}</h2>
                <p className="text-sm text-gray-400">@{profile.username || 'kullanici'}</p>
                <div className="flex items-center gap-2 mt-1">
                  {isSeller ? (
                    <span className="text-xs bg-[#22C55E]/20 text-[#22C55E] px-2 py-0.5 rounded-full">Satıcı</span>
                  ) : (
                    <span className="text-xs bg-[#38BDF8]/20 text-[#38BDF8] px-2 py-0.5 rounded-full">Alıcı</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-[#0F172A] p-1 rounded-xl mb-4">
            <button
              onClick={() => setActiveTab('profil')}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition ${
                activeTab === 'profil' ? 'bg-[#22C55E] text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              Profil
            </button>
            <button
              onClick={() => setActiveTab('ilanlarim')}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition ${
                activeTab === 'ilanlarim' ? 'bg-[#22C55E] text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              İlanlarım
            </button>
          </div>

          {/* TAB: Profil */}
          {activeTab === 'profil' && (
            <>
              {/* İstatistikler */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="bg-[#1E293B] rounded-xl p-3 text-center border border-[#334155]">
                  <p className="text-xl font-bold text-white">{userProducts.length}</p>
                  <p className="text-[10px] text-gray-400">İlan</p>
                </div>
                <div className="bg-[#1E293B] rounded-xl p-3 text-center border border-[#334155]">
                  <p className="text-xl font-bold text-[#22C55E]">{profile.balance || 0} TL</p>
                  <p className="text-[10px] text-gray-400">Bakiye</p>
                </div>
                <div className="bg-[#1E293B] rounded-xl p-3 text-center border border-[#334155]">
                  <p className="text-xl font-bold text-[#FBBF24]">4.8</p>
                  <p className="text-[10px] text-gray-400">Puan</p>
                </div>
              </div>

              {/* Menü */}
              <div className="space-y-2">
                <button 
                  onClick={() => setEditMode(true)}
                  className="w-full bg-[#1E293B] rounded-xl p-4 border border-[#334155] flex items-center gap-3 hover:border-[#22C55E] transition"
                >
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="text-white text-sm flex-1 text-left">Bilgilerimi Düzenle</span>
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                <button 
                  onClick={() => alert('Bakiye yükleme sayfası yakında!')}
                  className="w-full bg-[#1E293B] rounded-xl p-4 border border-[#334155] flex items-center gap-3 hover:border-[#22C55E] transition"
                >
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-1.5 6M17 13l1.5 6M9 21h6M12 21v-6" />
                  </svg>
                  <span className="text-white text-sm flex-1 text-left">Bakiye Yükle</span>
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                {!isSeller && (
                  <button 
                    onClick={() => window.dispatchEvent(new CustomEvent('openSellerApplication'))}
                    className="w-full bg-[#1E293B] rounded-xl p-4 border border-[#334155] flex items-center gap-3 hover:border-[#FBBF24] transition"
                  >
                    <svg className="w-5 h-5 text-[#FBBF24]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <span className="text-white text-sm flex-1 text-left">Satıcı Ol</span>
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                )}

                <button
                  onClick={handleLogout}
                  className="w-full bg-[#1E293B] rounded-xl p-4 border border-[#EF4444]/20 flex items-center gap-3 hover:border-[#EF4444] transition"
                >
                  <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span className="text-red-400 text-sm flex-1 text-left">Çıkış Yap</span>
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </>
          )}

          {/* TAB: İlanlarım */}
          {activeTab === 'ilanlarim' && (
            <div>
              {productsLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="bg-[#1E293B] rounded-xl h-32 animate-pulse"></div>
                  ))}
                </div>
              ) : userProducts.length === 0 ? (
                <div className="bg-[#1E293B] rounded-2xl p-8 text-center border border-[#334155]">
                  <svg className="w-12 h-12 text-gray-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  <p className="text-gray-400 text-sm">Henüz ilanın yok.</p>
                  {isSeller && (
                    <button 
                      onClick={() => navigate('/ilan-ver')}
                      className="text-[#22C55E] text-sm hover:underline mt-2"
                    >
                      İlk ilanını ekle!
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {userProducts.map((product) => (
                    <div 
                      key={product.id}
                      onClick={() => navigate(`/product/${product.id}`)}
                      className="bg-[#1E293B] rounded-xl p-4 border border-[#334155] flex items-center gap-4 hover:border-[#22C55E] transition cursor-pointer"
                    >
                      <div className="w-16 h-16 rounded-lg bg-[#0F172A] flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {product.image_url ? (
                          <img src={product.image_url} alt={product.title} className="w-full h-full object-cover" />
                        ) : (
                          <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-white text-sm truncate">{product.title}</h3>
                        <p className="text-xs text-gray-400">{product.category}</p>
                        <p className="text-[#22C55E] font-bold text-sm mt-1">{product.price} TL</p>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        product.status === 'active' ? 'bg-[#22C55E]/20 text-[#22C55E]' :
                        product.status === 'sold' ? 'bg-[#FBBF24]/20 text-[#FBBF24]' :
                        'bg-[#EF4444]/20 text-[#EF4444]'
                      }`}>
                        {product.status === 'active' ? 'Aktif' :
                         product.status === 'sold' ? 'Satıldı' : 'Silindi'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      ) : (
        /* DÜZENLEME EKRANI */
        <div className="bg-[#1E293B] rounded-2xl p-6 border border-[#334155]">
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 block mb-1">Ad Soyad</label>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="w-full bg-[#0F172A] border border-[#334155] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#22C55E] transition"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 block mb-1">Kullanıcı Adı</label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full bg-[#0F172A] border border-[#334155] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#22C55E] transition"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 block mb-1">Telefon</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-[#0F172A] border border-[#334155] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#22C55E] transition"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 block mb-1">Bio</label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows={3}
                className="w-full bg-[#0F172A] border border-[#334155] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#22C55E] transition resize-none"
                placeholder="Kendini tanıt..."
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 block mb-1">Konum</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full bg-[#0F172A] border border-[#334155] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#22C55E] transition"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 block mb-1">Web Sitesi</label>
              <input
                type="text"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="w-full bg-[#0F172A] border border-[#334155] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#22C55E] transition"
              />
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full bg-[#22C55E] hover:bg-[#16A34A] text-white font-semibold py-3 rounded-xl transition disabled:opacity-50"
            >
              {saving ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
            <button
              onClick={() => setEditMode(false)}
              className="w-full bg-[#334155] hover:bg-[#475569] text-white font-semibold py-3 rounded-xl transition"
            >
              İptal
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default MobileProfilePage