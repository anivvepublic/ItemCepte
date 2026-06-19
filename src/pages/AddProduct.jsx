import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

// TÜM KATEGORİLER (küçük harf, alfabetik sırada)
const categories = [
  'apex legends',
  'brawl stars',
  'call of duty',
  'call of duty mobile',
  'clash royale',
  'critical ops',
  'cs2',
  'efootball',
  'epic games',
  'fc mobile',
  'free fire',
  'genshin impact',
  'honor of kings',
  'league of legends',
  'metin2',
  'mobile legends',
  'overwatch 2',
  'pubg mobile',
  'rainbow six siege',
  'rise of kingdoms',
  'rust',
  'standoff 2',
  'steam',
  'steam/epic',
  'valorant',
  'wild rift'
]

function AddProduct() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [formData, setFormData] = useState({
    title: '',
    category: categories[0],
    price: '',
    description: '',
    status: 'active'
  })
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [error, setError] = useState('')
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
      navigate('/')
      return
    }

    setUser(currentUser)
    setProfile(profileData)
    setLoading(false)
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      setError('Dosya boyutu 5MB\'dan küçük olmalıdır.')
      return
    }

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Sadece JPG, PNG veya WebP formatı kabul edilir.')
      return
    }

    setImageFile(file)
    const reader = new FileReader()
    reader.onload = (e) => setImagePreview(e.target.result)
    reader.readAsDataURL(file)
    setError('')
  }

  const uploadImage = async (file, userId) => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}/${Date.now()}.${fileExt}`
    const filePath = fileName

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      console.error('Yükleme hatası:', uploadError)
      throw new Error(uploadError.message)
    }

    const { data: urlData } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath)

    return urlData.publicUrl
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    setUploadProgress(10)

    if (!formData.title.trim()) {
      setError('Başlık gerekli.')
      setSubmitting(false)
      return
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      setError('Geçerli bir fiyat girin.')
      setSubmitting(false)
      return
    }

    let imageUrl = null

    if (imageFile) {
      try {
        setUploadProgress(30)
        imageUrl = await uploadImage(imageFile, user.id)
        setUploadProgress(70)
      } catch (err) {
        setError('Resim yüklenemedi: ' + err.message)
        setSubmitting(false)
        setUploadProgress(0)
        return
      }
    }

    setUploadProgress(80)

    // seller_id: user.id (auth.users'daki id)
    const { error: insertError } = await supabase
      .from('products')
      .insert({
        title: formData.title.trim(),
        category: formData.category,
        price: parseFloat(formData.price),
        description: formData.description.trim(),
        status: formData.status,
        seller_id: user.id,  // BURASI ÇOK ÖNEMLİ
        image_url: imageUrl
      })

    if (insertError) {
      setError('İlan eklenemedi: ' + insertError.message)
      setSubmitting(false)
      setUploadProgress(0)
      return
    }

    setUploadProgress(100)
    setTimeout(() => {
      navigate('/satıcı-panel')
    }, 500)
  }

  const displayCategory = (cat) => {
    return cat.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
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
          <p className="text-gray-400 text-sm mb-4">İlan eklemek için satıcı hesabına sahip olmalısınız.</p>
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('openSellerApplication'))}
            className="text-[#38BDF8] hover:text-[#22C55E] transition text-sm flex items-center justify-center gap-1"
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
      <div className="max-w-3xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <button
          onClick={() => navigate('/satıcı-panel')}
          className="flex items-center gap-2 text-[#38BDF8] hover:text-[#22C55E] transition mb-4 text-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Satıcı Paneline Dön
        </button>

        <div className="glass-card p-4 md:p-6 border border-[#334155]">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-6">Yeni İlan Ekle</h1>

          {submitting && uploadProgress > 0 && uploadProgress < 100 && (
            <div className="mb-4">
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>İlan yayınlanıyor...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-[#1E293B] rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-[#22C55E] h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 block mb-1">Başlık</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="VALORANT Premium Hesap"
                className="w-full bg-[#0F172A] border border-[#334155] rounded-xl px-4 py-2.5 text-white placeholder:text-[#6B7280] focus:outline-none focus:border-[#22C55E] transition"
                required
              />
            </div>

            <div>
              <label className="text-sm text-gray-400 block mb-1">Kategori</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-[#0F172A] border border-[#334155] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#22C55E] transition"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{displayCategory(cat)}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm text-gray-400 block mb-1">Fiyat (TL)</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="750"
                className="w-full bg-[#0F172A] border border-[#334155] rounded-xl px-4 py-2.5 text-white placeholder:text-[#6B7280] focus:outline-none focus:border-[#22C55E] transition"
                required
                min="1"
                step="1"
              />
            </div>

            <div>
              <label className="text-sm text-gray-400 block mb-1">Durum</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full bg-[#0F172A] border border-[#334155] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#22C55E] transition"
              >
                <option value="active">Aktif</option>
                <option value="sold">Satıldı</option>
                <option value="deleted">Silindi</option>
              </select>
            </div>

            <div>
              <label className="text-sm text-gray-400 block mb-1">Açıklama</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Hesap detayları, skinler, rank bilgisi..."
                rows={4}
                className="w-full bg-[#0F172A] border border-[#334155] rounded-xl px-4 py-2.5 text-white placeholder:text-[#6B7280] focus:outline-none focus:border-[#22C55E] transition resize-none"
              />
            </div>

            <div>
              <label className="text-sm text-gray-400 block mb-1">Kapak Fotoğrafı (isteğe bağlı)</label>
              <div className="flex flex-wrap items-center gap-4">
                <label className="cursor-pointer bg-[#1E293B] hover:bg-[#334155] text-white px-4 py-2 rounded-xl text-sm transition border border-[#334155] hover:border-[#22C55E]">
                  <span>Fotoğraf Seç</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
                {imagePreview && (
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-[#334155]">
                    <img src={imagePreview} alt="Önizleme" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => { setImageFile(null); setImagePreview(null) }}
                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>
              <p className="text-[10px] text-gray-500 mt-1">JPG, PNG, WebP • Max 5MB</p>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-[#22C55E] hover:bg-[#16A34A] text-white font-semibold py-3 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Yayınlanıyor...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Yayınla
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default AddProduct