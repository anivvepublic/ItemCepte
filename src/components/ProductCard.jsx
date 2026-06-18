import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

// SADECE ITEMCEPTE İLANLARINDA KULLANILACAK KATEGORİ FOTOĞRAFLARI
const categoryImages = {
  'valorant': '/images/valorant-cover.jpg',
  'cs2': '/images/cs2-cover.jpg',
  'steam': '/images/steam-cover.jpg',
  'epic games': '/images/epic-cover.jpg',
  'steam/epic': '/images/steam-cover.jpg',
  'rust': '/images/rust-cover.jpg',
  'pubg mobile': '/images/pubg-cover.jpg',
  'brawl stars': '/images/brawl-cover.jpg',
  'league of legends': '/images/lol-cover.jpg',
  'lol': '/images/lol-cover.jpg',
}

function ProductCard({ 
  id, 
  title, 
  price, 
  image_url, 
  category, 
  seller_name = 'ItemCepte', 
  seller_avatar = null,
  isItemCepte = false
}) {
  const [imgError, setImgError] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const navigate = useNavigate()

  const fallbackImage = "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=300&fit=crop"

  let displayImage = fallbackImage

  if (image_url) {
    displayImage = image_url
  } else if (isItemCepte && category) {
    const categoryKey = category.toLowerCase()
    displayImage = categoryImages[categoryKey] || fallbackImage
  }

  const handleClick = () => navigate(`/product/${id}`)

  return (
    <div
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative bg-[#111827] rounded-xl overflow-hidden cursor-pointer transition-all duration-300 border border-[#1F2937] hover:border-[#22C55E] hover:shadow-[0_0_30px_rgba(34,197,94,0.1)] hover:-translate-y-1 active:scale-[0.98]"
    >
      {/* Kapak Fotoğrafı - İLK HALİ object-cover */}
      <div className="aspect-[4/3] overflow-hidden bg-[#0F172A]">
        <img
          src={imgError ? fallbackImage : displayImage}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={() => setImgError(true)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#111827] via-[#111827]/30 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300 pointer-events-none"></div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-[#111827] via-[#111827]/95 to-transparent">
        <div className="flex items-center gap-2 mb-1.5">
          <div className="w-5 h-5 rounded-full bg-gradient-to-r from-[#22C55E] to-[#38BDF8] flex items-center justify-center text-[8px] font-bold text-white overflow-hidden flex-shrink-0 border border-[#1F2937]">
            {seller_avatar ? (
              <img src={seller_avatar} alt={seller_name} className="w-full h-full object-cover" />
            ) : (
              (seller_name || 'U').charAt(0).toUpperCase()
            )}
          </div>
          <span className="text-[10px] text-gray-300 truncate">{seller_name}</span>
          {isItemCepte && (
            <span className="text-[8px] text-[#A855F7] bg-[#A855F7]/15 px-1.5 py-0.5 rounded-full border border-[#A855F7]/20">
              ItemCepte
            </span>
          )}
        </div>

        {category && (
          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-[#38BDF8]/30 bg-[#0F172A]/50 text-[9px] font-medium text-[#38BDF8] mb-1">
            <span className="w-1 h-1 rounded-full bg-[#38BDF8]"></span>
            {category}
          </div>
        )}

        <h3 className="text-white font-semibold text-xs sm:text-sm truncate leading-tight">
          {title || "Premium Hesap"}
        </h3>

        <div className="flex items-center justify-between mt-1.5">
          <span className="text-[#22C55E] font-bold text-sm sm:text-base">{price} TL</span>
          <button
            className="bg-[#22C55E] hover:bg-[#16A34A] text-white text-[10px] sm:text-xs px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg transition-all duration-300 active:scale-95 shadow-lg shadow-[#22C55E]/20 opacity-70 group-hover:opacity-100"
            onClick={(e) => { e.stopPropagation(); navigate(`/product/${id}`) }}
          >
            Satın Al
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProductCard