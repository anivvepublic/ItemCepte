import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

// ... categoryImages aynı (değişmedi)

function ProductCard({ id, title, price, image_url, rating = 4.5, verified = true, category }) {
  const [imgError, setImgError] = useState(false)
  const navigate = useNavigate()

  // ... displayImage aynı

  const handleClick = () => navigate(`/product/${id}`)

  return (
    <div
      onClick={handleClick}
      className="glass-card p-2 sm:p-3 cursor-pointer transition-all duration-300 active:scale-[0.98]"
    >
      <div className="relative">
        <div className="aspect-square bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-lg md:rounded-xl flex items-center justify-center mb-2 md:mb-3 overflow-hidden">
          <img 
            src={imgError ? fallbackImage : displayImage} 
            alt={title} 
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
            onError={() => setImgError(true)}
          />
        </div>
        {price < 500 && (
          <div className="absolute top-1 right-1 md:top-2 md:right-2 bg-[#22C55E] text-white text-[10px] md:text-xs font-bold px-1.5 py-0.5 md:px-2 md:py-0.5 rounded-full">
            Fırsat
          </div>
        )}
      </div>

      <h3 className="font-semibold text-white text-xs sm:text-sm truncate">{title || "Premium Hesap"}</h3>
      
      <div className="flex items-center gap-1 mt-0.5">
        <div className="flex text-[#FBBF24] text-[10px] md:text-xs">
          {'★'.repeat(Math.floor(rating))}{'☆'.repeat(5 - Math.floor(rating))}
        </div>
        <span className="text-[10px] md:text-xs text-gray-400">{rating}</span>
      </div>

      <div className="flex items-center gap-1 mt-0.5">
        <span className="text-[10px] md:text-xs text-gray-500">ItemCepte</span>
        {verified && (
          <span className="text-[#22C55E] text-[10px] md:text-xs flex items-center gap-0.5">
            <svg className="w-2.5 h-2.5 md:w-3 md:h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Doğr.
          </span>
        )}
      </div>

      <div className="flex items-center justify-between mt-1 md:mt-2">
        <span className="text-[#22C55E] font-bold text-sm md:text-lg">{price} TL</span>
        <button 
          className="bg-[#22C55E] text-white text-[10px] md:text-xs px-2 py-1 md:px-3 md:py-1.5 rounded-full hover:bg-[#16A34A] transition active:scale-95"
          onClick={(e) => { e.stopPropagation(); navigate(`/product/${id}`) }}
        >
          Satın Al
        </button>
      </div>
    </div>
  )
}

export default ProductCard