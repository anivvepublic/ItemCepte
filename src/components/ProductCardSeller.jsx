import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

function ProductCardSeller({ product, onDelete, onStatusChange, onCopy }) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({
    title: product.title,
    price: product.price,
    description: product.description || '',
    status: product.status
  })
  const [toast, setToast] = useState(null)
  const navigate = useNavigate()

  const statusColors = {
    active: 'text-[#22C55E] bg-[#22C55E]/10',
    sold: 'text-[#FBBF24] bg-[#FBBF24]/10',
    deleted: 'text-[#EF4444] bg-[#EF4444]/10'
  }

  const statusLabels = {
    active: 'Aktif',
    sold: 'Satıldı',
    deleted: 'Silindi'
  }

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleDelete = () => {
    if (window.confirm('Bu ilanı silmek istediğinize emin misiniz?')) {
      onDelete(product.id)
    }
  }

  const handleEdit = async () => {
    setIsDeleting(true)
    const { error } = await supabase
      .from('products')
      .update({
        title: editData.title,
        price: parseFloat(editData.price),
        description: editData.description,
        status: editData.status
      })
      .eq('id', product.id)

    if (!error) {
      onStatusChange(product.id, editData.status)
      setIsEditing(false)
      showToast('İlan başarıyla güncellendi!', 'success')
      window.location.reload()
    } else {
      showToast('Güncelleme sırasında hata oluştu!', 'error')
    }
    setIsDeleting(false)
  }

  // 🔗 Paylaş (link kopyala)
  const handleShare = () => {
    const url = `${window.location.origin}/product/${product.id}`
    navigator.clipboard.writeText(url).then(() => {
      showToast('İlan linki kopyalandı!', 'success')
    }).catch(() => {
      showToast('Link kopyalanamadı!', 'error')
    })
  }

  // 📋 Kopyala (yeni ilan oluştur)
  const handleCopy = async () => {
    if (!onCopy) {
      // Eğer onCopy prop'u yoksa direkt Supabase'e ekle
      try {
        const { data, error } = await supabase
          .from('products')
          .insert({
            title: product.title + ' (Kopya)',
            category: product.category,
            price: product.price,
            description: product.description || '',
            status: 'active',
            seller_id: product.seller_id,
            image_url: product.image_url
          })
          .select()

        if (error) throw error
        showToast('İlan kopyalandı!', 'success')
        // Sayfayı yenile
        setTimeout(() => window.location.reload(), 1000)
      } catch (err) {
        showToast('Kopyalama sırasında hata oluştu!', 'error')
      }
    } else {
      onCopy(product)
    }
  }

  const fallbackImage = "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=300&fit=crop"

  return (
    <div className="glass-card p-3 md:p-4 border border-[#334155] hover:border-[#22C55E]/30 transition group relative">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-24 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-xl shadow-2xl text-sm font-semibold transition-all duration-300 ${
          toast.type === 'success' ? 'bg-[#22C55E] text-white' :
          toast.type === 'error' ? 'bg-[#EF4444] text-white' :
          'bg-[#38BDF8] text-black'
        }`}>
          {toast.message}
        </div>
      )}

      {/* Resim */}
      <div className="aspect-[4/3] rounded-lg overflow-hidden bg-[#0F172A] mb-3">
        <img
          src={product.image_url || fallbackImage}
          alt={product.title}
          className="w-full h-full object-cover transition group-hover:scale-105"
        />
      </div>

      {/* Başlık ve Durum */}
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-white text-sm truncate">{product.title}</h3>
        <span className={`text-[10px] px-2 py-0.5 rounded-full ${statusColors[product.status] || 'text-gray-400 bg-gray-400/10'} flex-shrink-0`}>
          {statusLabels[product.status] || product.status}
        </span>
      </div>

      {/* Kategori ve Fiyat */}
      <div className="flex items-center justify-between mt-1">
        <span className="text-xs text-gray-400">{product.category}</span>
        <span className="text-[#22C55E] font-bold text-sm">{product.price} TL</span>
      </div>

      {/* Açıklama */}
      {product.description && (
        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{product.description}</p>
      )}

      {/* Görüntülenme */}
      <div className="flex items-center gap-1 mt-1 text-[10px] text-gray-500">
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
        {product.view_count || 0} görüntülenme
      </div>

      {/* Düzenleme Formu */}
      {isEditing && (
        <div className="mt-3 p-3 bg-[#0F172A] rounded-lg space-y-2">
          <input
            type="text"
            value={editData.title}
            onChange={(e) => setEditData({ ...editData, title: e.target.value })}
            className="w-full bg-[#1E293B] border border-[#334155] rounded-lg px-3 py-1.5 text-white text-sm"
          />
          <input
            type="number"
            value={editData.price}
            onChange={(e) => setEditData({ ...editData, price: e.target.value })}
            className="w-full bg-[#1E293B] border border-[#334155] rounded-lg px-3 py-1.5 text-white text-sm"
          />
          <textarea
            value={editData.description}
            onChange={(e) => setEditData({ ...editData, description: e.target.value })}
            rows={2}
            className="w-full bg-[#1E293B] border border-[#334155] rounded-lg px-3 py-1.5 text-white text-sm resize-none"
          />
          <select
            value={editData.status}
            onChange={(e) => setEditData({ ...editData, status: e.target.value })}
            className="w-full bg-[#1E293B] border border-[#334155] rounded-lg px-3 py-1.5 text-white text-sm"
          >
            <option value="active">Aktif</option>
            <option value="sold">Satıldı</option>
            <option value="deleted">Silindi</option>
          </select>
          <div className="flex gap-2">
            <button
              onClick={handleEdit}
              disabled={isDeleting}
              className="flex-1 bg-[#22C55E] hover:bg-[#16A34A] text-white text-xs py-1.5 rounded-lg transition"
            >
              {isDeleting ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="flex-1 bg-[#334155] hover:bg-[#475569] text-white text-xs py-1.5 rounded-lg transition"
            >
              İptal
            </button>
          </div>
        </div>
      )}

      {/* Aksiyon Butonları */}
      {!isEditing && (
        <div className="flex items-center gap-1 mt-3 pt-2 border-t border-[#334155] flex-wrap">
          <button
            onClick={() => navigate(`/product/${product.id}`)}
            className="text-xs text-[#38BDF8] hover:text-[#22C55E] transition px-2 py-1"
          >
            Görüntüle
          </button>
          <button
            onClick={() => setIsEditing(true)}
            className="text-xs text-[#FBBF24] hover:text-[#F59E0B] transition px-2 py-1"
          >
            Düzenle
          </button>
          <button
            onClick={handleDelete}
            className="text-xs text-red-400 hover:text-red-300 transition px-2 py-1"
          >
            Sil
          </button>
          <button
            onClick={handleShare}
            className="text-xs text-[#38BDF8] hover:text-[#22C55E] transition px-2 py-1 flex items-center gap-1"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            Paylaş
          </button>
          <button
            onClick={handleCopy}
            className="text-xs text-gray-400 hover:text-white transition px-2 py-1 flex items-center gap-1"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
            </svg>
            Kopyala
          </button>
        </div>
      )}
    </div>
  )
}

export default ProductCardSeller