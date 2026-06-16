import { useNavigate } from 'react-router-dom'

function TermsPage() {
  const navigate = useNavigate()

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 pt-24 md:pt-28">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-[#38BDF8] hover:text-[#22C55E] transition mb-6"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Geri Dön
      </button>

      <div className="bg-[#1E293B] rounded-2xl p-6 md:p-8 border border-[#334155]">
        <h1 className="text-3xl font-bold text-white mb-2">Kullanıcı Sözleşmesi</h1>
        <p className="text-sm text-[#6B7280] mb-6">Son güncelleme: 16 Haziran 2026</p>

        <div className="space-y-6 text-[#94A3B8] text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-white mb-2">1. Genel Kurallar</h2>
            <p><strong className="text-[#22C55E]">ItemCepte</strong> olarak kullanıcılarımıza güvenli ve şeffaf bir alışveriş ortamı sunmayı taahhüt ediyoruz.</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>18 yaşından küçük kullanıcılar kayıt olamaz.</li>
              <li>Her kullanıcı tek bir hesap açabilir.</li>
              <li>Sahte, yanıltıcı veya yasadışı içerikler kesinlikle yasaktır.</li>
              <li>Hesap paylaşımı ve devri yasaktır.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">2. Satıcı Yükümlülükleri</h2>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Satıcılar, sattıkları ürünlerin yasal olduğunu garanti eder.</li>
              <li>Ürün teslimatı, satış onayından sonra en geç 24 saat içinde yapılmalıdır.</li>
              <li>Satıcı hesabı açmak için kimlik doğrulama zorunludur.</li>
              <li>Satıcılar, ürün açıklamalarında eksiksiz ve doğru bilgi vermekle yükümlüdür.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">3. Alıcı Yükümlülükleri</h2>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Ödeme, sadece platform üzerinden yapılmalıdır.</li>
              <li>Ürün teslim alındıktan sonra 7 gün içinde iade talebi oluşturulabilir.</li>
              <li>Yanlış veya eksik bilgi verilmesi durumunda işlem iptal edilebilir.</li>
              <li>Alıcılar, satın aldıkları ürünleri 3. şahıslarla paylaşamaz.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">4. Güvenlik ve Gizlilik</h2>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Kişisel verileriniz KVKK kapsamında korunur.</li>
              <li>Ödeme bilgileriniz 3D Secure ile şifrelenir.</li>
              <li>Şifreleriniz asla paylaşılmaz veya saklanmaz.</li>
              <li>Kullanıcı verileri, yalnızca platform işleyişi için kullanılır.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">5. Yaptırımlar</h2>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Kuralları ihlal eden kullanıcılar uyarılır, tekrarı durumunda hesap askıya alınır.</li>
              <li>Dolandırıcılık tespit edilen hesaplar kalıcı olarak kapatılır ve yasal işlem başlatılır.</li>
              <li>Platformu kötüye kullanan kullanıcıların tüm hakları iptal edilir.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">6. Değişiklik Hakkı</h2>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>ItemCepte, sözleşme maddelerini önceden haber vermek koşuluyla değiştirme hakkını saklı tutar.</li>
              <li>Değişiklikler yayınlandığı tarihten itibaren geçerlidir.</li>
              <li>Kullanıcılar, değişiklikleri takip etmekle yükümlüdür.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">7. İletişim</h2>
            <p className="text-sm text-[#6B7280]">Her türlü soru, öneri ve şikayet için bize <a href="mailto:destek@itemcepte.com" className="text-[#22C55E] hover:underline">destek@itemcepte.com</a> adresinden ulaşabilirsiniz.</p>
          </section>

          <div className="bg-[#0F172A] rounded-xl p-4 border border-[#334155] mt-6">
            <p className="text-xs text-[#6B7280] text-center">
              Bu sözleşme, ItemCepte platformunu kullanan tüm kullanıcılar için bağlayıcıdır. 
              Kayıt olarak, bu sözleşmedeki tüm maddeleri kabul etmiş sayılırsınız.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TermsPage