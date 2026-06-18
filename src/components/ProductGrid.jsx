import ProductCard from './ProductCard'

function ProductGrid({ products, loading }) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-3 md:gap-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-[#1E293B] rounded-xl h-64 md:h-72 animate-pulse"></div>
        ))}
      </div>
    )
  }

  if (!products || products.length === 0) {
    return (
      <div className="bg-[#1E293B] rounded-2xl p-8 md:p-12 text-center border border-[#334155]">
        <svg className="w-12 h-12 md:w-16 md:h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
        <p className="text-gray-400 text-sm md:text-base">Henüz ilan yok.</p>
        <p className="text-gray-500 text-xs md:text-sm mt-1">İlk ilanı sen ekle!</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
      {products.map((product) => (
        <div key={product.id} className="animate-fadeInUp">
          <ProductCard 
            {...product} 
            isItemCepte={product.seller_id === null}
          />
        </div>
      ))}
    </div>
  )
}

export default ProductGrid