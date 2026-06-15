import { useState, useEffect } from 'react'
import HeroSection from '../components/HeroSection'
import CategorySidebar from '../components/CategorySidebar'
import ProductGrid from '../components/ProductGrid'
import SellToUs from '../components/SellToUs'
import { supabase } from '../lib/supabaseClient'

function HomePage() {
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [categoryLoading, setCategoryLoading] = useState(false)

  useEffect(() => {
    fetchAllProducts()
  }, [])

  useEffect(() => {
    if (selectedCategory) {
      fetchProductsByCategory(selectedCategory)
    } else {
      setFilteredProducts(products)
    }
  }, [selectedCategory])

  useEffect(() => {
    const handleCategorySearch = (event) => {
      setSelectedCategory(event.detail)
      setTimeout(() => {
        const productsSection = document.getElementById('products-section')
        if (productsSection) {
          productsSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }, 100)
    }
    window.addEventListener('categorySearch', handleCategorySearch)
    return () => window.removeEventListener('categorySearch', handleCategorySearch)
  }, [])

  async function fetchAllProducts() {
    setLoading(true)
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(12)

    if (!error && data) {
      setProducts(data)
      setFilteredProducts(data)
    }
    setLoading(false)
  }

  async function fetchProductsByCategory(category) {
    setCategoryLoading(true)
    // Küçük harf sorgusu
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('status', 'active')
      .eq('category', category.toLowerCase())
      .order('created_at', { ascending: false })

    if (!error && data) {
      setFilteredProducts(data)
    } else {
      setFilteredProducts([])
    }
    setCategoryLoading(false)
  }

  return (
    <div>
      <HeroSection />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-3">
            <CategorySidebar onSelectCategory={setSelectedCategory} />
          </div>
          <div className="lg:col-span-6" id="products-section">
            <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
              <h2 className="text-xl font-bold text-white border-l-4 border-[#38BDF8] pl-3">
                {selectedCategory ? `${selectedCategory} İlanları` : "Öne Çıkan İlanlar"}
              </h2>
              {selectedCategory && (
                <button
                  onClick={() => setSelectedCategory(null)}
                  className="text-sm text-[#38BDF8] hover:text-[#22C55E] transition flex items-center gap-1"
                >
                  Tümünü Göster
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            <ProductGrid products={filteredProducts} loading={loading || categoryLoading} />
          </div>
          <div className="lg:col-span-3">
            <SellToUs />
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomePage