import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

function SellerApplicationForm({ user, onClose }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({
    full_name: '',
    tc_no: '',
    birth_date: '',
    phone: '',
    email: '',
    id_front: null,
    id_back: null,
    agreed: false
  })

  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400">Lütfen önce giriş yapın veya kayıt olun.</p>
        <button 
          onClick={() => window.dispatchEvent(new CustomEvent('openAuthModal', { detail: 'login' }))}
          className="mt-4 bg-[#22C55E] text-white px-4 py-2 rounded-lg text-sm"
        >
          Giriş Yap
        </button>
      </div>
    )
  }

  const validateForm = () => {
    if (!formData.full_name || formData.full_name.split(' ').length < 2) {
      setError('Lütfen ad ve soyadınızı girin.')
      return false
    }
    if (!/^[0-9]{11}$/.test(formData.tc_no)) {
      setError('TC Kimlik No 11 haneli ve sadece sayı olmalıdır.')
      return false
    }
    if (formData.birth_date) {
      const birth = new Date(formData.birth_date)
      const today = new Date()
      const age = today.getFullYear() - birth.getFullYear()
      const monthDiff = today.getMonth() - birth.getMonth()
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        if (age - 1 < 18) { setError('18 yaşından büyük olmalısınız.'); return false }
      } else if (age < 18) { setError('18 yaşından büyük olmalısınız.'); return false }
    } else { setError('Lütfen doğum tarihinizi girin.'); return false }
    if (!/^[0-9]{10}$/.test(formData.phone.replace(/\s/g, ''))) {
      setError('Geçerli bir telefon numarası girin (5xx xxx xx xx).')
      return false
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Geçerli bir e-posta adresi girin.')
      return false
    }
    if (!formData.id_front) { setError('Kimlik ön yüz fotoğrafını yükleyin.'); return false }
    if (!formData.id_back) { setError('Kimlik arka yüz fotoğrafını yükleyin.'); return false }
    if (!formData.agreed) { setError('Bilgilendirme metnini okuduğunuzu onaylayın.'); return false }
    return true
  }

  const handleFileChange = (e, type) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { setError('Dosya boyutu 5MB\'dan küçük olmalıdır.'); return }
    if (!['image/jpeg', 'image/png'].includes(file.type)) { setError('Sadece JPG veya PNG formatı kabul edilir.'); return }
    setFormData({ ...formData, [type]: file })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!user) {
      setError('Lütfen önce giriş yapın.')
      setLoading(false)
      return
    }

    if (!validateForm()) {
      setLoading(false)
      return
    }

    try {
      const uploadFile = async (file, fileName) => {
        const fileExt = file.name.split('.').pop()
        const filePath = `${user.id}/${fileName}.${fileExt}`
        const { error: uploadError } = await supabase.storage
          .from('seller_documents')
          .upload(filePath, file, { upsert: true, cacheControl: '3600' })
        if (uploadError) throw new Error(`Dosya yükleme hatası: ${uploadError.message}`)
        const { data: urlData } = supabase.storage.from('seller_documents').getPublicUrl(filePath)
        return urlData.publicUrl
      }

      const idFrontUrl = await uploadFile(formData.id_front, 'id_front')
      const idBackUrl = await uploadFile(formData.id_back, 'id_back')

      const { error: insertError } = await supabase
        .from('seller_applications')
        .insert({
          auth_id: user.id,
          full_name: formData.full_name,
          tc_no: formData.tc_no,
          birth_date: formData.birth_date,
          phone: formData.phone.replace(/\s/g, ''),
          email: formData.email,
          id_front_url: idFrontUrl,
          id_back_url: idBackUrl,
          status: 'pending'
        })

      if (insertError) throw new Error(`Başvuru kaydedilemedi: ${insertError.message}`)

      setSuccess(true)
      setLoading(false)
      setTimeout(() => { if (onClose) onClose() }, 4000)

    } catch (err) {
      setError(err.message || 'Bir hata oluştu.')
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-[#22C55E]/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-[#22C55E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Başvurunuz Alındı!</h3>
        <p className="text-gray-400 text-sm">Bilgileriniz incelendikten sonra size WhatsApp ve E-posta üzerinden ulaşılacaktır.</p>
        <p className="text-gray-500 text-xs mt-4">Bu pencere otomatik kapanacak...</p>
      </div>
    )
  }

  return (
    <div className="max-h-[80vh] overflow-y-auto px-1">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm text-gray-400 block mb-1">Ad Soyad</label>
          <input
            type="text"
            placeholder="Adınız ve soyadınız"
            value={formData.full_name}
            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            className="w-full bg-[#0F172A] border border-[#334155] rounded-xl px-4 py-2.5 text-white placeholder:text-[#6B7280] focus:outline-none focus:border-[#22C55E] transition"
            required
          />
        </div>

        <div>
          <label className="text-sm text-gray-400 block mb-1">TC Kimlik No</label>
          <input
            type="text"
            placeholder="11 haneli TC kimlik numaranız"
            value={formData.tc_no}
            onChange={(e) => { const val = e.target.value.replace(/\D/g, '').slice(0, 11); setFormData({ ...formData, tc_no: val }) }}
            className="w-full bg-[#0F172A] border border-[#334155] rounded-xl px-4 py-2.5 text-white placeholder:text-[#6B7280] focus:outline-none focus:border-[#22C55E] transition"
            required
          />
        </div>

        <div>
          <label className="text-sm text-gray-400 block mb-1">Doğum Tarihi</label>
          <input
            type="date"
            value={formData.birth_date}
            onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
            max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
            className="w-full bg-[#0F172A] border border-[#334155] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#22C55E] transition"
            required
          />
          <p className="text-xs text-gray-500 mt-1">18 yaşından büyük olmalısınız.</p>
        </div>

        <div>
          <label className="text-sm text-gray-400 block mb-1">Telefon Numarası</label>
          <input
            type="tel"
            placeholder="5xx xxx xx xx"
            value={formData.phone}
            onChange={(e) => { const val = e.target.value.replace(/\D/g, '').slice(0, 10); setFormData({ ...formData, phone: val }) }}
            className="w-full bg-[#0F172A] border border-[#334155] rounded-xl px-4 py-2.5 text-white placeholder:text-[#6B7280] focus:outline-none focus:border-[#22C55E] transition"
            required
          />
        </div>

        <div>
          <label className="text-sm text-gray-400 block mb-1">E-posta Adresi</label>
          <input
            type="email"
            placeholder="ornek@mail.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full bg-[#0F172A] border border-[#334155] rounded-xl px-4 py-2.5 text-white placeholder:text-[#6B7280] focus:outline-none focus:border-[#22C55E] transition"
            required
          />
        </div>

        <div>
          <label className="text-sm text-gray-400 block mb-1">Kimlik Ön Yüz Fotoğrafı</label>
          <input
            type="file"
            accept="image/jpeg,image/png"
            onChange={(e) => handleFileChange(e, 'id_front')}
            className="w-full bg-[#0F172A] border border-[#334155] rounded-xl px-4 py-2.5 text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-[#22C55E] file:text-white hover:file:bg-[#16A34A] cursor-pointer"
            required
          />
          {formData.id_front && <p className="text-xs text-[#22C55E] mt-1">✓ {formData.id_front.name}</p>}
        </div>

        <div>
          <label className="text-sm text-gray-400 block mb-1">Kimlik Arka Yüz Fotoğrafı</label>
          <input
            type="file"
            accept="image/jpeg,image/png"
            onChange={(e) => handleFileChange(e, 'id_back')}
            className="w-full bg-[#0F172A] border border-[#334155] rounded-xl px-4 py-2.5 text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-[#22C55E] file:text-white hover:file:bg-[#16A34A] cursor-pointer"
            required
          />
          {formData.id_back && <p className="text-xs text-[#22C55E] mt-1">✓ {formData.id_back.name}</p>}
        </div>

        <div className="bg-[#0F172A] rounded-xl p-4 border border-[#334155]">
          <p className="text-xs text-gray-400 leading-relaxed">
            📌 Bize ilettiğiniz bu bilgiler, tarafımızca incelendikten sonra <span className="text-[#22C55E]">onaylanırsa</span>, 
            size <span className="text-[#22C55E]">WhatsApp</span> üzerinden ulaşacağız ve vermiş olduğunuz e-posta adresinize 
            <span className="text-white"> hesap bilgilerinizi</span> (kullanıcı adı ve şifre) göndereceğiz.
            <br /><br />
            Hesabınız onaylandıktan sonra <span className="text-[#22C55E]">Satıcı Paneli</span>'ne erişim sağlayabilir, 
            profilinizi özelleştirebilir, ilanlarınızı yönetebilir ve size özel avantajlardan yararlanabilirsiniz.
          </p>
        </div>

        <div className="flex items-start gap-2">
          <input
            type="checkbox"
            id="agreed"
            checked={formData.agreed}
            onChange={(e) => setFormData({ ...formData, agreed: e.target.checked })}
            className="mt-1 w-4 h-4 rounded border-[#334155] bg-[#0F172A] text-[#22C55E] focus:ring-[#22C55E]"
          />
          <label htmlFor="agreed" className="text-xs text-gray-400">
            Bilgilerimin doğru olduğunu ve bu koşulları kabul ettiğimi onaylıyorum.
          </label>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={loading || !formData.agreed}
          className={`w-full font-medium py-2.5 rounded-xl transition ${
            loading || !formData.agreed
              ? 'bg-[#374151] text-[#6B7280] cursor-not-allowed'
              : 'bg-[#22C55E] hover:bg-[#16A34A] text-white'
          }`}
        >
          {loading ? 'Gönderiliyor...' : 'Başvur'}
        </button>
      </form>
    </div>
  )
}

export default SellerApplicationForm