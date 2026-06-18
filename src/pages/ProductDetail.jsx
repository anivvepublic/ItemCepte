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
  const [activeTab, setActiveTab] = useState('ozellikler')
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [sellerProfile, setSellerProfile] = useState(null)

  const galleryImages = [
    'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=800&h=600&fit=crop',
  ]

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
      if (data.seller_id) {
        await fetchSellerProfile(data.seller_id)
      }
      fetchSimilarProducts(data.category, data.id)
    } else {
      navigate('/')
    }
    setLoading(false)
  }

  async function fetchSellerProfile(sellerId) {
    const { data, error } = await supabase
      .from('users')
      .select('full_name, username, avatar_url, created_at, total_sales')
      .eq('auth_id', sellerId)
      .single()

    if (!error && data) {
      setSellerProfile(data)
    }
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

  const isItemCepte = product?.seller_id === null

  const formatDate = (date) => {
    if (!date) return 'Yeni üye'
    const d = new Date(date)
    return d.getFullYear()
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 pt-20 md:pt-24">
        <div className="animate-pulse">
          <div className="h-64 md:h-96 bg-[#1E293B] rounded-2xl mb-4 md:mb-6"></div>
          <div className="h-24 md:h-32 bg-[#1E293B] rounded-2xl"></div>
        </div>
      </div>
    )
  }

  if (!product) return null

  return (
    <div className="min-h-screen bg-[#0F172A] pt-20 md:pt-24 pb-10">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        {/* Geri Butonu */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-[#38BDF8] hover:text-[#22C55E] transition mb-4 text-xs md:text-sm group"
        >
          <svg className="w-4 h-4 group-hover:-translate-x-1 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Geri
        </button>

        <div className="flex flex-col lg:flex-row gap-6 md:gap-8">
          {/* SOL: Galeri + Detaylar + Benzer İlanlar */}
          <div className="flex-1 lg:w-3/5">
            {/* Galeri */}
            <div className="glass-card p-2 md:p-3 border border-[#334155] hover:border-[#38BDF8]/30 transition">
              <div className="relative aspect-video rounded-xl overflow-hidden bg-[#0F172A]">
                <img
                  src={galleryImages[currentImageIndex] || galleryImages[0]}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 pointer-events-none rounded-xl border border-[#38BDF8]/20 shadow-[0_0_30px_rgba(56,189,248,0.1)]"></div>
                
                <div className="absolute top-3 right-3 bg-[#EF4444]/90 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg">
                  Son 2 adet kaldı!
                </div>

                <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-sm text-white text-[10px] px-2.5 py-1 rounded-full flex items-center gap-1.5">
                  <svg className="w-3 h-3 text-[#38BDF8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  5 kişi son 1 saatte inceledi
                </div>
              </div>

              {galleryImages.length > 1 && (
                <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                  {galleryImages.map((img, idx) => (
                    <div
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden cursor-pointer border-2 transition flex-shrink-0 ${
                        currentImageIndex === idx ? 'border-[#38BDF8] shadow-[0_0_15px_rgba(56,189,248,0.3)]' : 'border-[#334155] hover:border-[#38BDF8]/50'
                      }`}
                    >
                      <img src={img} alt={`Görsel ${idx + 1}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Detay Sekmeleri */}
            <div className="mt-6">
              <div className="flex gap-1 md:gap-2 border-b border-[#334155] overflow-x-auto">
                {['ozellikler', 'teslimat', 'sss', 'iade'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3 py-2 md:px-4 md:py-2.5 text-xs md:text-sm font-medium transition whitespace-nowrap border-b-2 ${
                      activeTab === tab
                        ? 'text-[#38BDF8] border-[#38BDF8] bg-[#38BDF8]/5'
                        : 'text-gray-400 border-transparent hover:text-white'
                    }`}
                  >
                    {tab === 'ozellikler' && (
                      <>
                        <svg className="inline w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        Özellikler
                      </>
                    )}
                    {tab === 'teslimat' && (
                      <>
                        <svg className="inline w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                        </svg>
                        Teslimat
                      </>
                    )}
                    {tab === 'sss' && (
                      <>
                        <svg className="inline w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        SSS
                      </>
                    )}
                    {tab === 'iade' && (
                      <>
                        <svg className="inline w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        İptal / İade
                      </>
                    )}
                  </button>
                ))}
              </div>

              <div className="p-3 md:p-4 bg-[#1E293B]/30 rounded-xl mt-3 border border-[#334155] min-h-[120px]">
                {activeTab === 'ozellikler' && (
                  <div className="space-y-2 text-sm text-gray-300">
                    <p>{product.description || 'Premium hesap, anında teslimat. Satıcı tarafından doğrulanmıştır.'}</p>
                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-400 mt-2">
                      <li>Tam doğrulanmış hesap</li>
                      <li>100+ nadir skin</li>
                      <li>5000+ oyun içi para</li>
                      <li>Yüksek rank (Platinum 3)</li>
                    </ul>
                  </div>
                )}
                {activeTab === 'teslimat' && (
                  <div className="space-y-2 text-sm text-gray-300">
                    <p><span className="text-white font-medium">Anında Teslimat:</span> Ödeme onaylandıktan sonra hesap bilgileri <span className="text-[#22C55E]">5 dakika</span> içinde gönderilir.</p>
                    <p>Teslimat, kayıtlı e-posta adresinize yapılır.</p>
                    <p>Teslimat sırasında yaşanacak sorunlarda <span className="text-[#38BDF8]">7/24 destek</span> ekibimiz yanınızda.</p>
                  </div>
                )}
                {activeTab === 'sss' && (
                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="text-white font-medium">Hesap güvenli mi?</p>
                      <p className="text-gray-400">Evet, tüm hesaplar satıcılar tarafından doğrulanmıştır. ItemCepte garantisiyle alışveriş yaparsınız.</p>
                    </div>
                    <div>
                      <p className="text-white font-medium">İade mümkün mü?</p>
                      <p className="text-gray-400">Teslimat sonrası 7 gün içinde iade talep edebilirsiniz. Detaylar iade politikasında.</p>
                    </div>
                    <div>
                      <p className="text-white font-medium">Nasıl iletişime geçerim?</p>
                      <p className="text-gray-400">Satıcıya "Sor" butonuyla mesaj gönderebilirsiniz. Veya destek@itemcepte.com</p>
                    </div>
                  </div>
                )}
                {activeTab === 'iade' && (
                  <div className="space-y-2 text-sm text-gray-300">
                    <p className="text-white font-medium">İptal ve İade Koşulları</p>
                    <ul className="list-disc list-inside space-y-1 text-gray-400 text-sm">
                      <li>Ürün teslim edilmeden önce iptal mümkündür.</li>
                      <li>Teslimat sonrası <span className="text-white">7 gün</span> içinde iade talebi oluşturulabilir.</li>
                      <li>İade onaylandığında ücret <span className="text-[#22C55E]">3 iş günü</span> içinde hesabınıza yatırılır.</li>
                      <li>Hesap bilgileri teslim alındıktan sonra değiştirilmişse iade kabul edilmez.</li>
                      <li>İade sürecinde <span className="text-[#38BDF8]">7/24</span> destek ekibimiz size yardımcı olur.</li>
                    </ul>
                    <p className="text-xs text-gray-500 mt-2">* İade politikası ItemCepte tarafından belirlenmiştir.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Benzer İlanlar */}
            {similarProducts.length > 0 && (
              <div className="mt-8 md:mt-10">
                <h2 className="text-base md:text-xl font-bold text-white border-l-4 border-[#38BDF8] pl-2 md:pl-3 mb-4 md:mb-5">
                  Benzer İlanlar
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                  {similarProducts.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => navigate(`/product/${item.id}`)}
                      className="glass-card p-2 md:p-3 cursor-pointer hover:scale-105 transition hover:border-[#38BDF8] group"
                    >
                      <div className="aspect-square bg-[#1E293B] rounded-lg mb-1 md:mb-2 flex items-center justify-center relative overflow-hidden">
                        <img
                          src="https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=300&fit=crop"
                          alt={item.title}
                          className="w-full h-full object-cover transition group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-transparent to-transparent"></div>
                      </div>
                      <h3 className="font-semibold text-white text-xs md:text-sm truncate">{item.title}</h3>
                      <p className="text-[#22C55E] font-bold text-xs md:text-sm mt-0.5 md:mt-1">{item.price} TL</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* SAĞ: Sabit Satın Alma Kartı - STICKY FIX */}
          <div className="lg:w-2/5">
            <div className="glass-card p-4 md:p-5 border border-[#334155] hover:border-[#38BDF8]/30 transition-all shadow-[0_0_30px_rgba(56,189,248,0.03)] sticky top-24">
              <div className="absolute inset-0 pointer-events-none rounded-2xl border border-[#38BDF8]/10 shadow-[0_0_40px_rgba(56,189,248,0.05)]"></div>

              <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] text-[#38BDF8] bg-[#38BDF8]/10 px-2 py-0.5 rounded-full">
                  {product.category}
                </span>
                {isItemCepte && (
                  <span className="text-[10px] text-[#A855F7] bg-[#A855F7]/10 px-2 py-0.5 rounded-full border border-[#A855F7]/30 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#A855F7] animate-pulse"></span>
                    ItemCepte
                  </span>
                )}
              </div>

              <h1 className="text-xl md:text-2xl font-bold text-white mb-2">{product.title}</h1>

              {/* Satıcı Bilgileri */}
              <div className="flex items-center gap-3 mb-4 p-3 bg-[#0F172A] rounded-xl">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#22C55E] to-[#38BDF8] flex items-center justify-center text-white font-bold text-sm overflow-hidden">
                  {sellerProfile?.avatar_url ? (
                    <img src={sellerProfile.avatar_url} alt={sellerProfile.full_name} className="w-full h-full object-cover" />
                  ) : (
                    isItemCepte ? 'İ' : (sellerProfile?.full_name?.charAt(0) || 'S')
                  )}
                </div>
                <div>
                  <p className="font-semibold text-white text-sm">{isItemCepte ? 'ItemCepte' : (sellerProfile?.full_name || 'Satıcı')}</p>
                  <div className="flex items-center gap-3 text-[10px] text-gray-400">
                    <span className="flex items-center gap-1">
                      <svg className="w-3 h-3 text-[#38BDF8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-1.5 6M17 13l1.5 6M9 21h6M12 21v-6" />
                      </svg>
                      {sellerProfile?.total_sales || '0'} Satış
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <svg className="w-3 h-3 text-[#F1F5F9]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {formatDate(sellerProfile?.created_at)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Fiyat */}
              <div className="mb-4">
                <span className="text-3xl md:text-4xl font-bold text-[#22C55E]">{product.price * quantity} TL</span>
                <span className="text-xs text-gray-400 ml-2">+ KDV</span>
              </div>

              {/* Miktar Seçici */}
              <div className="flex items-center gap-3 mb-4">
                <span className="text-xs text-gray-400">Adet:</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-8 rounded-full bg-[#1E293B] hover:bg-[#334155] text-white transition flex items-center justify-center"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  </button>
                  <span className="text-white text-sm w-6 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(5, quantity + 1))}
                    className="w-8 h-8 rounded-full bg-[#1E293B] hover:bg-[#334155] text-white transition flex items-center justify-center"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Satın Al Butonu */}
              <button
                onClick={() => setShowBuyModal(true)}
                className="w-full btn-primary-glow py-3 md:py-4 text-sm md:text-lg relative overflow-hidden group"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  Hemen Satın Al
                  <svg className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-[#22C55E]/20 to-[#38BDF8]/20 opacity-0 group-hover:opacity-100 transition duration-500"></div>
              </button>

              {/* İptal / İade Bilgilendirme */}
              <div className="mt-3 p-2 bg-[#0F172A] rounded-lg border border-[#334155]">
                <p className="text-[9px] text-gray-400 text-center">
                  <span className="text-[#38BDF8]">↩️</span> Teslimat sonrası 7 gün içinde iade imkanı. Detaylar için{" "}
                  <button
                    onClick={() => setActiveTab('iade')}
                    className="text-[#22C55E] hover:underline"
                  >
                    "İade" sekmesine
                  </button>
                  {" "}bakın.
                </p>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 text-center text-[10px] text-gray-400">
                <div className="p-2 bg-[#0F172A] rounded-lg flex flex-col items-center gap-1">
                  <svg className="w-4 h-4 text-[#22C55E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Güvenli Ödeme
                </div>
                <div className="p-2 bg-[#0F172A] rounded-lg flex flex-col items-center gap-1">
                  <svg className="w-4 h-4 text-[#38BDF8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  7 Gün İade
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Satın Alma Modal */}
      {showBuyModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1E293B] rounded-2xl w-full max-w-md p-5 md:p-6 border border-[#334155] shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg md:text-xl font-bold text-white">Satın Alma</h2>
              <button onClick={() => setShowBuyModal(false)} className="text-gray-400 hover:text-white text-2xl">&times;</button>
            </div>
            <p className="text-gray-300 text-center mb-4 text-sm md:text-base">
              <span className="font-bold text-[#22C55E]">{product.title}</span> ürününü satın almak üzeresiniz.
            </p>
            <p className="text-center text-xl md:text-2xl font-bold text-[#22C55E] mb-4">{product.price * quantity} TL</p>
            <button
              onClick={() => {
                alert('Ödeme sistemi yakında!')
                setShowBuyModal(false)
              }}
              className="w-full btn-primary-glow py-2 text-sm md:text-base"
            >
              Ödemeye Geç
            </button>
            <p className="text-center text-[10px] text-gray-500 mt-3">7 gün iade garantisi • Güvenli ödeme</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProductDetail