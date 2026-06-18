import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function ProductCardSeller({ product, onDelete, onStatusChange }) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({
    title: product.title,
    price: product.price,
    description: product.description || '',
    status: product.status
  })
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
      // Sayfayı yenilemeden güncelle
      window.location.reload()
    }
    setIsDeleting(false)
  }

  const fallbackImage = "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=300&fit=crop"

  return (
    <div className="glass-card p-3 md:p-4 border border-[#334155] hover:border-[#22C55E]/30 transition group">
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

      {/* Düzenleme Formu (Toggle) */}
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
        <div className="flex items-center gap-2 mt-3 pt-2 border-t border-[#334155]">
          <button
            onClick={() => navigate(`/product/${product.id}`)}
            className="text-xs text-[#38BDF8] hover:text-[#22C55E] transition"
          >
            Görüntüle
          </button>
          <button
            onClick={() => setIsEditing(true)}
            className="text-xs text-[#FBBF24] hover:text-[#F59E0B] transition ml-auto"
          >
            Düzenle
          </button>
          <button
            onClick={handleDelete}
            className="text-xs text-red-400 hover:text-red-300 transition"
          >
            Sil
          </button>
        </div>
      )}
    </div>
  )
}

export default ProductCardSeller