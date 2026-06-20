import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import ProductCard from '../components/ProductCard'

function MobileHomePage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchProducts()
  }, [])

  async function fetchProducts() {
    setLoading(true)
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(12)

    if (!error && data) {
      setProducts(data)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#0F172A] pt-16 pb-24 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">
          <span className="text-[#22C55E]">Item</span>
          <span className="text-[#38BDF8]">Cepte</span>
        </h1>
        <button 
          onClick={() => navigate('/profil')}
          className="w-10 h-10 rounded-full bg-[#1E293B] border border-[#334155] flex items-center justify-center hover:border-[#22C55E] transition"
        >
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </button>
      </div>

      {/* Arama Çubuğu */}
      <div className="relative mb-6">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Oyun, skin, hesap ara..."
          className="w-full bg-[#1E293B] border border-[#334155] rounded-full px-4 py-3 pl-10 text-white placeholder:text-gray-500 focus:outline-none focus:border-[#22C55E] transition text-sm"
          onFocus={() => navigate('/arama')}
        />
      </div>

      {/* İlan Listesi - 2'li Grid */}
      {loading ? (
        <div className="grid grid-cols-2 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-[#1E293B] rounded-xl h-48 animate-pulse"></div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400">Henüz ilan yok.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {products.map((product) => (
            <ProductCard key={product.id} {...product} isItemCepte={product.seller_id === null} />
          ))}
        </div>
      )}

      {/* Alt Menü - SABİT NAVBAR */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#0F172A] border-t border-[#334155] px-4 py-2 flex justify-around items-center z-50">
        <button onClick={() => navigate('/')} className="flex flex-col items-center gap-0.5 text-[#22C55E]">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1h-2z" />
          </svg>
          <span className="text-[10px]">Ana Sayfa</span>
        </button>
        <button onClick={() => navigate('/kategoriler')} className="flex flex-col items-center gap-0.5 text-gray-400 hover:text-white">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          <span className="text-[10px]">Kategoriler</span>
        </button>
        <button onClick={() => navigate('/ilan-ver')} className="flex flex-col items-center gap-0.5 text-gray-400 hover:text-white">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span className="text-[10px]">İlan Ver</span>
        </button>
        <button onClick={() => navigate('/profil')} className="flex flex-col items-center gap-0.5 text-gray-400 hover:text-white">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className="text-[10px]">Profil</span>
        </button>
      </div>
    </div>
  )
}

export default MobileHomePage