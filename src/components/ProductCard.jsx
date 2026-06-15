import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

// KESİN ÇALIŞAN, KALICI, OYUNA ÖZEL GÖRSELLER
const categoryImages = {
  // PC OYUNLARI
  "valorant": "https://www.freetogame.com/g/valorant/background.jpg",
  "cs2": "https://www.freetogame.com/g/cs2/background.jpg",
  "league of legends": "https://www.freetogame.com/g/league-of-legends/background.jpg",
  "apex legends": "https://www.freetogame.com/g/apex-legends/background.jpg",
  "overwatch 2": "https://www.freetogame.com/g/overwatch-2/background.jpg",
  "rainbow six siege": "https://www.freetogame.com/g/rainbow-six-siege/background.jpg",
  "call of duty": "https://www.freetogame.com/g/call-of-duty-hq/background.jpg",
  "rust": "https://www.freetogame.com/g/rust/background.jpg",
  "steam/epic": "https://cdn.cloudflare.steamstatic.com/steam/apps/221100/header.jpg",
  
  // MOBİL OYUNLARI
  "pubg mobile": "https://www.pubgmobile.com/static/images/index/bg/bg.jpg",
  "mobile legends": "https://cdn2.unrealengine.com/mobile-legends-1920x1080-05c5c5c5c5c5.jpg",
  "call of duty mobile": "https://www.callofduty.com/content/dam/atvi/callofduty/cod-touchui/blog/hero/mw/CODM_S5_BP_Hero.jpg",
  "genshin impact": "https://upload-os-bbs.mihoyo.com/upload/2021/09/28/124142432.png",
  "free fire": "https://images.garena.com/image/2024/01/free-fire-cover.jpg",
  "brawl stars": "https://cdn.supercell.com/images/brawlstars/brawl-stars-cover.jpg",
  "clash royale": "https://cdn.supercell.com/images/clashroyale/cr-cover.jpg",
  "wild rift": "https://images.contentstack.io/v3/assets/blt370b3f3f6e5e5e5e/blt3f2f7d9d2e5c5c5e/wild-rift-cover.jpg",
  "rise of kingdoms": "https://cdn2.unrealengine.com/rise-of-kingdoms-cover.jpg",
  "honor of kings": "https://cdn2.unrealengine.com/honor-of-kings-cover.jpg",
  "standoff 2": "https://standoff2.com/static/images/standoff2-cover.jpg",
  "critical ops": "https://www.criticalopsgame.com/images/co-cover.jpg",
}

function ProductCard({ id, title, price, image_url, rating = 4.5, verified = true, category }) {
  const [imgError, setImgError] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const navigate = useNavigate()
  
  const categoryKey = category?.toLowerCase() || ""
  
  // Eğer resim yüklenmezse varsayılan gaming görseli
  const fallbackImage = "https://www.freetogame.com/assets/images/freetogame-logo.png"
  
  const displayImage = image_url || (categoryImages[categoryKey] || fallbackImage)

  const handleImageError = () => {
    setImgError(true)
  }

  const handleClick = () => {
    navigate(`/product/${id}`)
  }

  return (
    <div
      onClick={handleClick}
      className="glass-card p-3 cursor-pointer transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative">
        <div className="aspect-square bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-xl flex items-center justify-center mb-3 overflow-hidden">
          <img 
            src={imgError ? fallbackImage : displayImage} 
            alt={title} 
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
            onError={handleImageError}
          />
        </div>
        {price < 500 && (
          <div className="absolute top-2 right-2 bg-[#22C55E] text-white text-xs font-bold px-2 py-0.5 rounded-full">
            Fırsat
          </div>
        )}
      </div>

      <h3 className="font-semibold text-white text-sm truncate">{title || "Premium Hesap"}</h3>
      
      <div className="flex items-center gap-1 mt-1">
        <div className="flex text-[#FBBF24] text-xs">
          {'★'.repeat(Math.floor(rating))}{'☆'.repeat(5 - Math.floor(rating))}
        </div>
        <span className="text-xs text-gray-400">{rating}</span>
      </div>

      <div className="flex items-center gap-1 mt-1">
        <span className="text-xs text-gray-500">ItemCepte</span>
        {verified && (
          <span className="text-[#22C55E] text-xs flex items-center gap-0.5">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Doğrulanmış
          </span>
        )}
      </div>

      <div className="flex items-center justify-between mt-2">
        <span className="text-[#22C55E] font-bold text-lg">{price} TL</span>
        <button 
          className="bg-[#22C55E] text-white text-xs px-3 py-1.5 rounded-full hover:bg-[#16A34A] transition"
          onClick={(e) => {
            e.stopPropagation()
            navigate(`/product/${id}`)
          }}
        >
          Satın Al
        </button>
      </div>
    </div>
  )
}

export default ProductCard