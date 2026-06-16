import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import ProductCard from '../components/ProductCard'

function SearchPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const query = searchParams.get('q') || ''
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [filteredProducts, setFilteredProducts] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('')
  const [categories, setCategories] = useState([])
  const [priceRange, setPriceRange] = useState({ min: '', max: '' })
  const [sortBy, setSortBy] = useState('newest')

  useEffect(() => {
    if (query) {
      fetchSearchResults()
    }
  }, [query])

  useEffect(() => {
    let filtered = [...products]
    
    if (selectedCategory) {
      filtered = filtered.filter(p => p.category === selectedCategory)
    }
    
    if (priceRange.min) {
      filtered = filtered.filter(p => p.price >= parseInt(priceRange.min))
    }
    if (priceRange.max) {
      filtered = filtered.filter(p => p.price <= parseInt(priceRange.max))
    }

    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        break
      case 'price_low':
        filtered.sort((a, b) => a.price - b.price)
        break
      case 'price_high':
        filtered.sort((a, b) => b.price - a.price)
        break
      case 'rating':
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0))
        break
      default:
        break
    }

    setFilteredProducts(filtered)
  }, [products, selectedCategory, priceRange, sortBy])

  async function fetchSearchResults() {
    setLoading(true)
    
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('status', 'active')
      .or(`title.ilike.%${query}%,category.ilike.%${query}%`)
      .order('created_at', { ascending: false })
      .limit(50)

    if (!error && data) {
      setProducts(data)
      setFilteredProducts(data)
      const uniqueCategories = [...new Set(data.map(p => p.category))]
      setCategories(uniqueCategories)
    } else {
      setProducts([])
      setFilteredProducts([])
    }
    setLoading(false)
  }

  const clearFilters = () => {
    setSelectedCategory('')
    setPriceRange({ min: '', max: '' })
    setSortBy('newest')
  }

  return (
    <div className="min-h-screen bg-[#0F172A] pt-20 md:pt-24 pb-10">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="mb-4 md:mb-6">
          <button 
            onClick={() => navigate(-1)}
            className="text-[#38BDF8] hover:text-[#22C55E] transition flex items-center gap-1 text-xs md:text-sm mb-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Geri
          </button>
          <h1 className="text-lg md:text-2xl font-bold text-white">
            "{query}" için arama sonuçları
          </h1>
          <p className="text-xs md:text-sm text-gray-400 mt-1">
            {filteredProducts.length} ilan bulundu
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">
          <div className="md:col-span-1">
            <div className="glass-card p-3 md:p-4 sticky top-24">
              <h3 className="text-xs md:text-sm font-semibold text-white mb-3 md:mb-4">Filtreler</h3>
              
              {categories.length > 0 && (
                <div className="mb-3 md:mb-4">
                  <label className="text-[10px] md:text-xs text-gray-400 block mb-1">Kategori</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full bg-[#0F172A] border border-[#334155] rounded-lg px-2 py-1.5 md:px-3 md:py-2 text-xs md:text-sm text-white focus:outline-none focus:border-[#22C55E]"
                  >
                    <option value="">Tümü</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="mb-3 md:mb-4">
                <label className="text-[10px] md:text-xs text-gray-400 block mb-1">Fiyat Aralığı</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={priceRange.min}
                    onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                    className="w-1/2 bg-[#0F172A] border border-[#334155] rounded-lg px-2 py-1.5 md:px-3 md:py-2 text-xs md:text-sm text-white focus:outline-none focus:border-[#22C55E]"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                    className="w-1/2 bg-[#0F172A] border border-[#334155] rounded-lg px-2 py-1.5 md:px-3 md:py-2 text-xs md:text-sm text-white focus:outline-none focus:border-[#22C55E]"
                  />
                </div>
              </div>

              <div className="mb-3 md:mb-4">
                <label className="text-[10px] md:text-xs text-gray-400 block mb-1">Sırala</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full bg-[#0F172A] border border-[#334155] rounded-lg px-2 py-1.5 md:px-3 md:py-2 text-xs md:text-sm text-white focus:outline-none focus:border-[#22C55E]"
                >
                  <option value="newest">En Yeni</option>
                  <option value="price_low">Fiyat: Düşükten Yükseğe</option>
                  <option value="price_high">Fiyat: Yüksekten Düşüğe</option>
                  <option value="rating">En Yüksek Puan</option>
                </select>
              </div>

              <button
                onClick={clearFilters}
                className="w-full bg-[#1E293B] hover:bg-[#334155] text-white text-xs md:text-sm py-1.5 md:py-2 rounded-lg transition"
              >
                Filtreleri Temizle
              </button>
            </div>
          </div>

          <div className="md:col-span-3">
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="glass-card h-56 md:h-64 animate-pulse"></div>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="glass-card p-8 md:p-12 text-center">
                <svg className="w-12 h-12 md:w-16 md:h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <p className="text-gray-400 text-sm md:text-base">Aradığın kriterlerde ilan bulunamadı.</p>
                <p className="text-gray-500 text-xs md:text-sm mt-1">Farklı anahtar kelimelerle tekrar dene.</p>
                <button onClick={() => navigate('/')} className="btn-primary-glow mt-4 px-4 py-1.5 md:px-6 md:py-2 text-xs md:text-sm">
                  Ana Sayfaya Dön
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} {...product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SearchPage