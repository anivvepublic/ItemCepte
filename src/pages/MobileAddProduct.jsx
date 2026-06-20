import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

// Tüm kategoriler - EMOJİ YOK, SADECE İSİM
const categories = [
  'VALORANT', 'CS2', 'Rust', 'League of Legends',
  'Metin2', 'Apex Legends', 'Steam/Epic', 'PUBG Mobile',
  'Mobile Legends', 'Free Fire', 'Brawl Stars', 'Clash Royale',
  'Wild Rift', 'Rise of Kingdoms', 'Honor of Kings', 'Critical Ops',
  'eFootball', 'FC Mobile'
]

// Kategori renkleri
const categoryColors = {
  'VALORANT': 'border-[#FD4556] hover:bg-[#FD4556]/10',
  'CS2': 'border-[#FBBF24] hover:bg-[#FBBF24]/10',
  'Rust': 'border-[#F97316] hover:bg-[#F97316]/10',
  'League of Legends': 'border-[#38BDF8] hover:bg-[#38BDF8]/10',
  'Metin2': 'border-[#A855F7] hover:bg-[#A855F7]/10',
  'Apex Legends': 'border-[#EF4444] hover:bg-[#EF4444]/10',
  'Steam/Epic': 'border-[#8B5CF6] hover:bg-[#8B5CF6]/10',
  'PUBG Mobile': 'border-[#F59E0B] hover:bg-[#F59E0B]/10',
  'Mobile Legends': 'border-[#EC4899] hover:bg-[#EC4899]/10',
  'Free Fire': 'border-[#F97316] hover:bg-[#F97316]/10',
  'Brawl Stars': 'border-[#22C55E] hover:bg-[#22C55E]/10',
  'Clash Royale': 'border-[#3B82F6] hover:bg-[#3B82F6]/10',
  'Wild Rift': 'border-[#06B6D4] hover:bg-[#06B6D4]/10',
  'Rise of Kingdoms': 'border-[#8B5CF6] hover:bg-[#8B5CF6]/10',
  'Honor of Kings': 'border-[#D946EF] hover:bg-[#D946EF]/10',
  'Critical Ops': 'border-[#EF4444] hover:bg-[#EF4444]/10',
  'eFootball': 'border-[#22C55E] hover:bg-[#22C55E]/10',
  'FC Mobile': 'border-[#3B82F6] hover:bg-[#3B82F6]/10'
}

function MobileAddProduct() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    price: '',
    description: '',
    status: 'active'
  })
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
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
    setSuccess(false)

    if (!formData.title.trim()) {
      setError('Başlık gerekli.')
      setSubmitting(false)
      return
    }

    if (!formData.category) {
      setError('Lütfen bir kategori seçin.')
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
        imageUrl = await uploadImage(imageFile, user.id)
      } catch (err) {
        setError('Resim yüklenemedi: ' + err.message)
        setSubmitting(false)
        return
      }
    }

    const { error: insertError } = await supabase
      .from('products')
      .insert({
        title: formData.title.trim(),
        category: formData.category,
        price: parseFloat(formData.price),
        description: formData.description.trim(),
        status: formData.status,
        seller_id: user.id,
        image_url: imageUrl
      })

    if (insertError) {
      setError('İlan eklenemedi: ' + insertError.message)
      setSubmitting(false)
      return
    }

    setSuccess(true)
    setSubmitting(false)
    setTimeout(() => {
      navigate('/satıcı-panel')
    }, 2000)
  }

  const selectCategory = (category) => {
    setFormData({ ...formData, category: category })
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
        <div className="text-center">
          <p className="text-gray-400">Satıcı hesabı gerekli.</p>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-20 h-20 bg-[#22C55E]/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-[#22C55E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">İlan Yayınlandı!</h2>
          <p className="text-gray-400">İlanınız başarıyla yayınlandı.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0F172A] pt-16 pb-24 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-white">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <h1 className="text-xl font-bold text-white">İlan Ver</h1>
        <div className="w-6"></div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Başlık */}
        <div>
          <label className="text-sm text-gray-400 block mb-1">Başlık</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Premium VALORANT Hesabı"
            className="w-full bg-[#1E293B] border border-[#334155] rounded-xl px-4 py-3 text-white placeholder:text-[#6B7280] focus:outline-none focus:border-[#22C55E] transition"
            required
          />
        </div>

        {/* Kategori - Grid */}
        <div>
          <label className="text-sm text-gray-400 block mb-2">Kategori Seç</label>
          <div className="grid grid-cols-3 gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => selectCategory(cat)}
                className={`p-3 rounded-xl border transition text-center ${
                  formData.category === cat
                    ? `border-[#22C55E] bg-[#22C55E]/10 text-[#22C55E]`
                    : `border-[#334155] bg-[#1E293B] text-gray-400 hover:text-white hover:border-[#38BDF8] ${categoryColors[cat] || ''}`
                }`}
              >
                <div className="text-xs font-medium truncate">{cat}</div>
              </button>
            ))}
          </div>
          {formData.category && (
            <p className="text-xs text-[#22C55E] mt-2">Seçili: {formData.category}</p>
          )}
        </div>

        {/* Fiyat */}
        <div>
          <label className="text-sm text-gray-400 block mb-1">Fiyat (TL)</label>
          <input
            type="number"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            placeholder="750"
            className="w-full bg-[#1E293B] border border-[#334155] rounded-xl px-4 py-3 text-white placeholder:text-[#6B7280] focus:outline-none focus:border-[#22C55E] transition"
            required
            min="1"
            step="1"
          />
        </div>

        {/* Durum */}
        <div>
          <label className="text-sm text-gray-400 block mb-1">Durum</label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            className="w-full bg-[#1E293B] border border-[#334155] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#22C55E] transition"
          >
            <option value="active">Aktif</option>
            <option value="sold">Satıldı</option>
            <option value="deleted">Silindi</option>
          </select>
        </div>

        {/* Açıklama */}
        <div>
          <label className="text-sm text-gray-400 block mb-1">Açıklama</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Hesap detayları, skinler, rank bilgisi..."
            rows={4}
            className="w-full bg-[#1E293B] border border-[#334155] rounded-xl px-4 py-3 text-white placeholder:text-[#6B7280] focus:outline-none focus:border-[#22C55E] transition resize-none"
          />
        </div>

        {/* Kapak Fotoğrafı */}
        <div>
          <label className="text-sm text-gray-400 block mb-1">Kapak Fotoğrafı</label>
          <div className="flex items-center gap-4">
            <label className="cursor-pointer bg-[#1E293B] hover:bg-[#334155] text-white px-4 py-3 rounded-xl text-sm transition border border-[#334155] hover:border-[#22C55E]">
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
          className="w-full bg-[#22C55E] hover:bg-[#16A34A] text-white font-semibold py-4 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed text-lg"
        >
          {submitting ? 'Yayınlanıyor...' : 'İlanı Yayınla'}
        </button>
      </form>
    </div>
  )
}

export default MobileAddProduct