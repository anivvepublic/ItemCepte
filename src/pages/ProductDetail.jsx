import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [similarProducts, setSimilarProducts] = useState([])
  const [showBuyModal, setShowBuyModal] = useState(false)

  useEffect(() => {
    fetchProduct()
  }, [id])

  async function fetchProduct() {
    setLoading(true)
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single()

    if (!error && data) {
      setProduct(data)
      fetchSimilarProducts(data.category, data.id)
    } else {
      navigate('/')
    }
    setLoading(false)
  }

  async function fetchSimilarProducts(category, currentId) {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('status', 'active')
      .eq('category', category)
      .neq('id', currentId)
      .limit(4)

    if (!error && data) {
      setSimilarProducts(data)
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-64 md:h-96 bg-[#1E293B] rounded-2xl mb-4 md:mb-6"></div>
          <div className="h-24 md:h-32 bg-[#1E293B] rounded-2xl"></div>
        </div>
      </div>
    )
  }

  if (!product) return null

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 md:py-8 pt-20 md:pt-24">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-[#38BDF8] hover:text-[#22C55E] transition mb-4 md:mb-6 text-xs md:text-sm"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Ana Sayfaya Dön
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <div className="lg:col-span-2">
          <div className="glass-card p-3 md:p-4 sticky top-24">
            <div className="aspect-video bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-xl flex items-center justify-center overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&h=600&fit=crop"
                alt={product.title}
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="grid grid-cols-3 gap-2 md:gap-3 mt-3 md:mt-4">
              <div className="text-center p-1.5 md:p-2 bg-[#0F172A] rounded-xl">
                <svg className="w-5 h-5 md:w-6 md:h-6 text-[#22C55E] mx-auto mb-0.5 md:mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-[10px] md:text-xs text-gray-400">Anında Teslimat</p>
              </div>
              <div className="text-center p-1.5 md:p-2 bg-[#0F172A] rounded-xl">
                <svg className="w-5 h-5 md:w-6 md:h-6 text-[#22C55E] mx-auto mb-0.5 md:mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <p className="text-[10px] md:text-xs text-gray-400">Güvenli Ödeme</p>
              </div>
              <div className="text-center p-1.5 md:p-2 bg-[#0F172A] rounded-xl">
                <svg className="w-5 h-5 md:w-6 md:h-6 text-[#22C55E] mx-auto mb-0.5 md:mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636L18.364 5.636m0 0a9 9 0 010 12.728m0-12.728a9 9 0 10-12.728 0M12 8v4l3 3" />
                </svg>
                <p className="text-[10px] md:text-xs text-gray-400">7/24 Destek</p>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="glass-card p-4 md:p-5 sticky top-24">
            <div className="mb-2 md:mb-3">
              <span className="text-[10px] md:text-xs text-[#38BDF8] bg-[#38BDF8]/10 px-2 py-0.5 md:px-2.5 md:py-1 rounded-full">
                {product.category}
              </span>
            </div>

            <h1 className="text-lg md:text-2xl font-bold text-white mb-2">{product.title}</h1>

            <div className="flex items-center gap-2 mb-3 md:mb-4">
              <div className="flex text-[#FBBF24] text-xs md:text-sm">
                {'★'.repeat(Math.floor(product.rating || 4.5))}{'☆'.repeat(5 - Math.floor(product.rating || 4.5))}
              </div>
              <span className="text-[10px] md:text-xs text-gray-400">({product.rating || 4.5})</span>
            </div>

            <div className="mb-3 md:mb-4">
              <span className="text-2xl md:text-3xl font-bold text-[#22C55E]">{product.price} TL</span>
            </div>

            <div className="mb-4 md:mb-5">
              <h3 className="text-xs md:text-sm font-semibold text-white mb-1 md:mb-2">Ürün Açıklaması</h3>
              <p className="text-xs md:text-sm text-gray-400 leading-relaxed">{product.description || "Premium hesap, anında teslimat. Satıcı tarafından doğrulanmıştır."}</p>
            </div>

            <div className="border-t border-[#334155] pt-3 md:pt-4 mb-4 md:mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-r from-[#22C55E] to-[#38BDF8] flex items-center justify-center">
                  <span className="text-white font-bold text-sm md:text-lg">İ</span>
                </div>
                <div>
                  <p className="font-semibold text-white text-sm md:text-base">ItemCepte</p>
                  <div className="flex items-center gap-1">
                    <svg className="w-3 h-3 text-[#22C55E]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-[10px] md:text-xs text-[#22C55E]">Doğrulanmış Satıcı</span>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowBuyModal(true)}
              className="w-full btn-primary-glow py-2.5 md:py-3 text-sm md:text-lg"
            >
              Hemen Satın Al
            </button>
          </div>
        </div>
      </div>

      {similarProducts.length > 0 && (
        <div className="mt-8 md:mt-12">
          <h2 className="text-base md:text-xl font-bold text-white border-l-4 border-[#38BDF8] pl-2 md:pl-3 mb-4 md:mb-5">
            Benzer İlanlar
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {similarProducts.map((item) => (
              <div
                key={item.id}
                onClick={() => navigate(`/product/${item.id}`)}
                className="glass-card p-2 md:p-3 cursor-pointer hover:scale-105 transition"
              >
                <div className="aspect-square bg-[#1E293B] rounded-lg mb-1 md:mb-2 flex items-center justify-center">
                  <svg className="w-6 h-6 md:w-8 md:h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <h3 className="font-semibold text-white text-xs md:text-sm truncate">{item.title}</h3>
                <p className="text-[#22C55E] font-bold text-xs md:text-sm mt-0.5 md:mt-1">{item.price} TL</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {showBuyModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1E293B] rounded-2xl w-full max-w-md p-5 md:p-6 border border-[#334155]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg md:text-xl font-bold text-white">Satın Alma</h2>
              <button onClick={() => setShowBuyModal(false)} className="text-gray-400 hover:text-white text-2xl">&times;</button>
            </div>
            <p className="text-gray-300 text-center mb-4 text-sm md:text-base">
              <span className="font-bold text-[#22C55E]">{product.title}</span> ürününü satın almak üzeresiniz.
            </p>
            <p className="text-center text-xl md:text-2xl font-bold text-[#22C55E] mb-4">{product.price} TL</p>
            <button
              onClick={() => {
                alert('Ödeme sistemi yakında!')
                setShowBuyModal(false)
              }}
              className="w-full btn-primary-glow py-2 text-sm md:text-base"
            >
              Ödemeye Geç
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProductDetail