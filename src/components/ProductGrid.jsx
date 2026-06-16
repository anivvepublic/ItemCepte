import ProductCard from './ProductCard'

function ProductGrid({ products, loading }) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-5">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="glass-card h-56 md:h-72 animate-pulse"></div>
        ))}
      </div>
    )
  }

  if (!products || products.length === 0) {
    return (
      <div className="glass-card p-8 md:p-12 text-center">
        <svg className="w-12 h-12 md:w-16 md:h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
        <p className="text-gray-400">Henüz ilan yok.</p>
        <p className="text-gray-500 text-sm mt-1">İlk ilanı sen ekle!</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-5">
      {products.map((product) => (
        <div key={product.id} className="animate-fadeInUp">
          <ProductCard {...product} />
        </div>
      ))}
    </div>
  )
}

export default ProductGrid