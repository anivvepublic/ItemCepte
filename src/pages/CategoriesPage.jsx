import { useNavigate } from 'react-router-dom'
import valorantImg from '../assets/game-covers/valorant.jpg'
import cs2Img from '../assets/game-covers/cs2.jpg'
import rustImg from '../assets/game-covers/rust.jpg'
import lolImg from '../assets/game-covers/lol.jpg'
import metin2Img from '../assets/game-covers/metin2.jpg'
import apexImg from '../assets/game-covers/apex.jpg'
import steamEpicImg from '../assets/game-covers/steam-epic.jpg'
import wildRiftImg from '../assets/game-covers/wild-rift.jpg'
import clashRoyaleImg from '../assets/game-covers/clash-royale.jpg'
import brawlStarsImg from '../assets/game-covers/brawl-stars.jpg'
import mlbbImg from '../assets/game-covers/mlbb.jpg'
import pubgMobileImg from '../assets/game-covers/pubg-mobile.jpg'
import freeFireImg from '../assets/game-covers/free-fire.jpg'
import criticalOpsImg from '../assets/game-covers/critical-ops.jpg'

function CategoriesPage() {
  const navigate = useNavigate()

  const pcGames = [
    { name: "VALORANT", image: valorantImg, slug: "valorant" },
    { name: "CS2", image: cs2Img, slug: "cs2" },
    { name: "Rust", image: rustImg, slug: "rust" },
    { name: "League of Legends", image: lolImg, slug: "league of legends" },
    { name: "Metin2", image: metin2Img, slug: "metin2" },
    { name: "Apex Legends", image: apexImg, slug: "apex legends" },
    { name: "Steam / Epic", image: steamEpicImg, slug: "steam/epic" },
  ]

  const mobileGames = [
    { name: "Wild Rift", image: wildRiftImg, slug: "wild rift" },
    { name: "Clash Royale", image: clashRoyaleImg, slug: "clash royale" },
    { name: "Brawl Stars", image: brawlStarsImg, slug: "brawl stars" },
    { name: "Mobile Legends", image: mlbbImg, slug: "mobile legends" },
    { name: "PUBG Mobile", image: pubgMobileImg, slug: "pubg mobile" },
    { name: "Free Fire", image: freeFireImg, slug: "free fire" },
    { name: "Critical Ops", image: criticalOpsImg, slug: "critical ops" },
  ]

  const handleCategoryClick = (slug) => {
    navigate(`/?category=${encodeURIComponent(slug)}`)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 pt-20 md:pt-24">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-[#38BDF8] hover:text-[#22C55E] transition mb-6 text-sm"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Geri
      </button>

      <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Kategoriler</h1>
      <p className="text-sm text-gray-400 mb-6 md:mb-8">Oyun seç, ilanları keşfet</p>

      <div className="mb-8 md:mb-10">
        <h2 className="text-lg md:text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-[#38BDF8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          PC Oyunları
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
          {pcGames.map((game) => (
            <div
              key={game.slug}
              onClick={() => handleCategoryClick(game.slug)}
              className="group relative bg-[#1E293B] rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(34,197,94,0.3)] border border-transparent hover:border-[#22C55E]"
            >
              <div className="aspect-square overflow-hidden">
                <img
                  src={game.image}
                  alt={game.name}
                  className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-transparent to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 p-2 md:p-3">
                <p className="text-white font-semibold text-xs md:text-sm truncate">{game.name}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-lg md:text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-[#38BDF8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          Mobil Oyunlar
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
          {mobileGames.map((game) => (
            <div
              key={game.slug}
              onClick={() => handleCategoryClick(game.slug)}
              className="group relative bg-[#1E293B] rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(34,197,94,0.3)] border border-transparent hover:border-[#22C55E]"
            >
              <div className="aspect-square overflow-hidden">
                <img
                  src={game.image}
                  alt={game.name}
                  className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-transparent to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 p-2 md:p-3">
                <p className="text-white font-semibold text-xs md:text-sm truncate">{game.name}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default CategoriesPage