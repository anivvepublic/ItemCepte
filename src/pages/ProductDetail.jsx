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
          <div className="h-96 bg-[#1E293B] rounded-2xl mb-6"></div>
          <div className="h-32 bg-[#1E293B] rounded-2xl"></div>
        </div>
      </div>
    )
  }

  if (!product) return null

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Üst navigasyon */}
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-2 text-[#38BDF8] hover:text-[#22C55E] transition mb-6"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Ana Sayfaya Dön
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sol: Görsel */}
        <div className="lg:col-span-2">
          <div className="glass-card p-4 sticky top-24">
            <div className="aspect-video bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-xl flex items-center justify-center overflow-hidden">
              <img
                src={`https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&h=600&fit=crop`}
                alt={product.title}
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Güvenlik Badge'leri */}
            <div className="grid grid-cols-3 gap-3 mt-4">
              <div className="text-center p-2 bg-[#0F172A] rounded-xl">
                <svg className="w-6 h-6 text-[#22C55E] mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-xs text-gray-400">Anında Teslimat</p>
              </div>
              <div className="text-center p-2 bg-[#0F172A] rounded-xl">
                <svg className="w-6 h-6 text-[#22C55E] mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <p className="text-xs text-gray-400">Güvenli Ödeme</p>
              </div>
              <div className="text-center p-2 bg-[#0F172A] rounded-xl">
                <svg className="w-6 h-6 text-[#22C55E] mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636L18.364 5.636m0 0a9 9 0 010 12.728m0-12.728a9 9 0 10-12.728 0M12 8v4l3 3" />
                </svg>
                <p className="text-xs text-gray-400">7/24 Destek</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sağ: Bilgiler */}
        <div className="lg:col-span-1">
          <div className="glass-card p-5 sticky top-24">
            {/* Kategori etiketi */}
            <div className="mb-3">
              <span className="text-xs text-[#38BDF8] bg-[#38BDF8]/10 px-2 py-1 rounded-full">
                {product.category}
              </span>
            </div>

            {/* Başlık */}
            <h1 className="text-2xl font-bold text-white mb-2">{product.title}</h1>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex text-[#FBBF24] text-sm">
                {'★'.repeat(Math.floor(product.rating || 4.5))}{'☆'.repeat(5 - Math.floor(product.rating || 4.5))}
              </div>
              <span className="text-xs text-gray-400">({product.rating || 4.5})</span>
            </div>

            {/* Fiyat */}
            <div className="mb-4">
              <span className="text-3xl font-bold text-[#22C55E]">{product.price} TL</span>
            </div>

            {/* Açıklama */}
            <div className="mb-5">
              <h3 className="text-sm font-semibold text-white mb-2">Ürün Açıklaması</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{product.description || "Premium hesap, anında teslimat. Satıcı tarafından doğrulanmıştır."}</p>
            </div>

            {/* Satıcı Bilgisi */}
            <div className="border-t border-[#334155] pt-4 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#22C55E] to-[#38BDF8] flex items-center justify-center">
                  <span className="text-white font-bold text-lg">İ</span>
                </div>
                <div>
                  <p className="font-semibold text-white">ItemCepte</p>
                  <div className="flex items-center gap-1">
                    <svg className="w-3 h-3 text-[#22C55E]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-xs text-[#22C55E]">Doğrulanmış Satıcı</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Satın Al Butonu */}
            <button
              onClick={() => setShowBuyModal(true)}
              className="w-full btn-primary-glow py-3 text-lg"
            >
              Hemen Satın Al
            </button>
          </div>
        </div>
      </div>

      {/* Benzer İlanlar */}
      {similarProducts.length > 0 && (
        <div className="mt-12">
          <h2 className="text-xl font-bold text-white border-l-4 border-[#38BDF8] pl-3 mb-5">
            Benzer İlanlar
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {similarProducts.map((item) => (
              <div
                key={item.id}
                onClick={() => navigate(`/product/${item.id}`)}
                className="glass-card p-3 cursor-pointer hover:scale-105 transition"
              >
                <div className="aspect-square bg-[#1E293B] rounded-lg mb-2 flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <h3 className="font-semibold text-white text-sm truncate">{item.title}</h3>
                <p className="text-[#22C55E] font-bold text-sm mt-1">{item.price} TL</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Satın Al Modal'ı */}
      {showBuyModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1E293B] rounded-2xl w-full max-w-md p-6 border border-[#334155]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Satın Alma</h2>
              <button onClick={() => setShowBuyModal(false)} className="text-gray-400 hover:text-white text-2xl">&times;</button>
            </div>
            <p className="text-gray-300 text-center mb-4">
              <span className="font-bold text-[#22C55E]">{product.title}</span> ürününü satın almak üzeresiniz.
            </p>
            <p className="text-center text-2xl font-bold text-[#22C55E] mb-4">{product.price} TL</p>
            <button
              onClick={() => {
                alert('Ödeme sistemi yakında!')
                setShowBuyModal(false)
              }}
              className="w-full btn-primary-glow py-2"
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