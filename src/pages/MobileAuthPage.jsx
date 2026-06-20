import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

function MobileAuthPage({ onSuccess }) {
  const [mode, setMode] = useState('login') // login, register, seller
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [username, setUsername] = useState('')
  const [phone, setPhone] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [resetMode, setResetMode] = useState(false)
  const [resetSent, setResetSent] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  
  // Satıcı başvuru state'leri
  const [sellerForm, setSellerForm] = useState({
    full_name: '',
    tc_no: '',
    birth_date: '',
    phone: '',
    email: '',
    id_front: null,
    id_back: null,
    agreed: false
  })
  const [sellerLoading, setSellerLoading] = useState(false)
  const [sellerSuccess, setSellerSuccess] = useState(false)
  
  const navigate = useNavigate()

  const handleGoogleLogin = async () => {
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    })
    if (error) setError(error.message)
    else {
      if (onSuccess) onSuccess()
      navigate('/')
    }
    setLoading(false)
  }

  const handleReset = async () => {
    if (!email) return setError('E-posta adresinizi girin.')
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/reset-password',
    })
    if (error) setError(error.message)
    else setResetSent(true)
    setLoading(false)
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(error.message)
    else {
      if (onSuccess) onSuccess()
      navigate('/')
    }
    setLoading(false)
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!agreed) {
      setError('Sözleşmeyi onaylamalısınız.')
      setLoading(false)
      return
    }
    if (password !== confirmPassword) {
      setError('Şifreler eşleşmiyor.')
      setLoading(false)
      return
    }
    if (password.length < 6 || !/[A-Z]/.test(password)) {
      setError('Şifre en az 6 karakter ve 1 büyük harf içermeli.')
      setLoading(false)
      return
    }

    const { error, data } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, username: username } }
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    if (data.user) {
      const { error: insertError } = await supabase
        .from('users')
        .insert([
          {
            auth_id: data.user.id,
            full_name: fullName,
            username: username,
            phone: phone,
            email: email,
            role: 'buyer'
          }
        ])
      if (insertError) {
        console.error('User insert error:', insertError)
        setError('Kayıt sırasında bir hata oluştu.')
        setLoading(false)
        return
      }
    }

    setLoading(false)
    setSuccessMessage('Hesabınız başarıyla oluşturuldu!')
    setTimeout(() => {
      setMode('login')
      setSuccessMessage('')
    }, 2000)
  }

  // SATICI BAŞVURU
  const handleSellerFileChange = (e, type) => {
    const file = e.target.files[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      setError('Dosya boyutu 5MB\'dan küçük olmalıdır.')
      return
    }

    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      setError('Sadece JPG veya PNG formatı kabul edilir.')
      return
    }

    setSellerForm({ ...sellerForm, [type]: file })
    setError('')
  }

  const handleSellerSubmit = async (e) => {
    e.preventDefault()
    setSellerLoading(true)
    setError('')
    setSellerSuccess(false)

    // Validasyonlar
    if (!sellerForm.full_name || sellerForm.full_name.split(' ').length < 2) {
      setError('Lütfen ad ve soyadınızı girin.')
      setSellerLoading(false)
      return
    }
    if (!/^[0-9]{11}$/.test(sellerForm.tc_no)) {
      setError('TC Kimlik No 11 haneli ve sadece sayı olmalıdır.')
      setSellerLoading(false)
      return
    }
    if (sellerForm.birth_date) {
      const birth = new Date(sellerForm.birth_date)
      const today = new Date()
      const age = today.getFullYear() - birth.getFullYear()
      const monthDiff = today.getMonth() - birth.getMonth()
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        if (age - 1 < 18) { setError('18 yaşından büyük olmalısınız.'); setSellerLoading(false); return }
      } else if (age < 18) { setError('18 yaşından büyük olmalısınız.'); setSellerLoading(false); return }
    } else { setError('Lütfen doğum tarihinizi girin.'); setSellerLoading(false); return }
    if (!/^[0-9]{10}$/.test(sellerForm.phone.replace(/\s/g, ''))) {
      setError('Geçerli bir telefon numarası girin (5xx xxx xx xx).')
      setSellerLoading(false)
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sellerForm.email)) {
      setError('Geçerli bir e-posta adresi girin.')
      setSellerLoading(false)
      return
    }
    if (!sellerForm.id_front) { setError('Kimlik ön yüz fotoğrafını yükleyin.'); setSellerLoading(false); return }
    if (!sellerForm.id_back) { setError('Kimlik arka yüz fotoğrafını yükleyin.'); setSellerLoading(false); return }
    if (!sellerForm.agreed) { setError('Bilgilendirme metnini okuduğunuzu onaylayın.'); setSellerLoading(false); return }

    try {
      // Önce oturum açmış mı kontrol et
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      if (!currentUser) {
        setError('Lütfen önce giriş yapın veya kayıt olun.')
        setSellerLoading(false)
        return
      }

      const uploadFile = async (file, fileName) => {
        const fileExt = file.name.split('.').pop()
        const filePath = `${currentUser.id}/${fileName}.${fileExt}`
        const { error: uploadError } = await supabase.storage
          .from('seller_documents')
          .upload(filePath, file, { upsert: true, cacheControl: '3600' })
        if (uploadError) throw new Error(`Dosya yükleme hatası: ${uploadError.message}`)
        const { data: urlData } = supabase.storage.from('seller_documents').getPublicUrl(filePath)
        return urlData.publicUrl
      }

      const idFrontUrl = await uploadFile(sellerForm.id_front, 'id_front')
      const idBackUrl = await uploadFile(sellerForm.id_back, 'id_back')

      const { error: insertError } = await supabase
        .from('seller_applications')
        .insert({
          auth_id: currentUser.id,
          full_name: sellerForm.full_name,
          tc_no: sellerForm.tc_no,
          birth_date: sellerForm.birth_date,
          phone: sellerForm.phone.replace(/\s/g, ''),
          email: sellerForm.email,
          id_front_url: idFrontUrl,
          id_back_url: idBackUrl,
          status: 'pending'
        })

      if (insertError) throw new Error(`Başvuru kaydedilemedi: ${insertError.message}`)

      setSellerSuccess(true)
      setSellerLoading(false)
      setTimeout(() => {
        setMode('login')
        setSellerSuccess(false)
      }, 3000)

    } catch (err) {
      setError(err.message || 'Bir hata oluştu.')
      setSellerLoading(false)
    }
  }

  const isValidEmail = (email) => {
    const allowedDomains = ['gmail.com', 'outlook.com', 'hotmail.com', 'yahoo.com', 'icloud.com', 'protonmail.com']
    const domain = email.split('@')[1]
    return domain && allowedDomains.includes(domain.toLowerCase())
  }

  const isUsernameValid = username.length >= 3 && /^[a-zA-Z0-9_.-]+$/.test(username)
  const isPasswordValid = password.length >= 6 && /[A-Z]/.test(password)

  const getPasswordStrength = (pwd) => {
    let score = 0
    if (pwd.length >= 6) score += 1
    if (pwd.length >= 10) score += 1
    if (/[A-Z]/.test(pwd)) score += 1
    if (/[a-z]/.test(pwd)) score += 1
    if (/[0-9]/.test(pwd)) score += 1
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1
    return Math.min(score, 5)
  }

  if (resetMode) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center px-4">
        <div className="bg-[#1E293B] rounded-2xl w-full max-w-md p-6 border border-[#334155]">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-white">Şifreni Sıfırla</h2>
            <button onClick={() => { setResetMode(false); setError(''); }} className="text-gray-400 hover:text-white text-2xl">&times;</button>
          </div>
          {resetSent ? (
            <div className="text-center space-y-4">
              <div className="w-12 h-12 bg-[#22C55E]/20 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-6 h-6 text-[#22C55E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-gray-400 text-sm">Bağlantı gönderildi. E-postanı kontrol et.</p>
              <button onClick={() => { setResetMode(false); setResetSent(false); }} className="text-[#22C55E] text-sm hover:underline">Girişe dön</button>
            </div>
          ) : (
            <form onSubmit={handleReset} className="space-y-4">
              <input
                type="email"
                placeholder="E-posta adresin"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#0F172A] border border-[#334155] rounded-xl px-4 py-3 text-white placeholder:text-[#6B7280] focus:outline-none focus:border-[#22C55E] transition"
                required
              />
              {error && <p className="text-sm text-red-500">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#22C55E] hover:bg-[#16A34A] text-white font-semibold py-3 rounded-xl transition disabled:opacity-50"
              >
                {loading ? 'Gönderiliyor...' : 'Bağlantı Gönder'}
              </button>
              <button
                type="button"
                onClick={() => { setResetMode(false); setError(''); }}
                className="w-full text-center text-sm text-gray-400 hover:text-white transition"
              >
                Giriş ekranına dön
              </button>
            </form>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center px-4 py-8">
      <div className="bg-[#1E293B] rounded-2xl w-full max-w-md p-6 border border-[#334155]">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-white">
            <span className="text-[#22C55E]">Item</span>
            <span className="text-[#38BDF8]">Cepte</span>
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            {mode === 'login' && 'Hesabına giriş yap'}
            {mode === 'register' && 'Yeni hesap oluştur'}
            {mode === 'seller' && 'Satıcı başvurusu yap'}
          </p>
        </div>

        {successMessage && (
          <div className="bg-[#22C55E]/20 border border-[#22C55E]/30 rounded-xl p-3 mb-4">
            <p className="text-[#22C55E] text-sm text-center">{successMessage}</p>
          </div>
        )}

        {sellerSuccess && (
          <div className="bg-[#22C55E]/20 border border-[#22C55E]/30 rounded-xl p-3 mb-4">
            <p className="text-[#22C55E] text-sm text-center">Başvurunuz alındı! En kısa sürede değerlendirilecektir.</p>
          </div>
        )}

        {/* Tab Bar */}
        <div className="flex gap-1 bg-[#0F172A] p-1 rounded-xl mb-4">
          <button
            onClick={() => { setMode('login'); setError(''); setSuccessMessage(''); setSellerSuccess(false) }}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition ${
              mode === 'login' ? 'bg-[#22C55E] text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            Giriş
          </button>
          <button
            onClick={() => { setMode('register'); setError(''); setSuccessMessage(''); setSellerSuccess(false) }}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition ${
              mode === 'register' ? 'bg-[#22C55E] text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            Kayıt
          </button>
          <button
            onClick={() => { setMode('seller'); setError(''); setSuccessMessage(''); setSellerSuccess(false) }}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition ${
              mode === 'seller' ? 'bg-[#FBBF24] text-black' : 'text-gray-400 hover:text-white'
            }`}
          >
            Satıcı Ol
          </button>
        </div>

        {/* GİRİŞ */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="email"
              placeholder="E-posta adresin"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#0F172A] border border-[#334155] rounded-xl px-4 py-3 text-white placeholder:text-[#6B7280] focus:outline-none focus:border-[#22C55E] transition"
              required
            />
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Şifre"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#0F172A] border border-[#334155] rounded-xl px-4 py-3 text-white placeholder:text-[#6B7280] focus:outline-none focus:border-[#22C55E] transition pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            <div className="text-right">
              <button
                type="button"
                onClick={() => setResetMode(true)}
                className="text-sm text-gray-400 hover:text-[#22C55E] transition"
              >
                Şifremi unuttum
              </button>
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#22C55E] hover:bg-[#16A34A] text-white font-semibold py-3 rounded-xl transition disabled:opacity-50"
            >
              {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
            </button>
          </form>
        )}

        {/* KAYIT */}
        {mode === 'register' && (
          <form onSubmit={handleRegister} className="space-y-3">
            <div>
              <input
                type="email"
                placeholder="E-posta adresin"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full bg-[#0F172A] border ${email && !isValidEmail(email) && email.length > 0 ? 'border-red-500' : 'border-[#334155]'} rounded-xl px-4 py-3 text-white placeholder:text-[#6B7280] focus:outline-none focus:border-[#22C55E] transition`}
                required
              />
              {email && !isValidEmail(email) && email.length > 0 && (
                <p className="text-xs text-red-500 mt-1">Geçerli bir email domaini girin</p>
              )}
            </div>

            <input
              type="text"
              placeholder="Ad Soyad"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-[#0F172A] border border-[#334155] rounded-xl px-4 py-3 text-white placeholder:text-[#6B7280] focus:outline-none focus:border-[#22C55E] transition"
              required
            />

            <div>
              <input
                type="text"
                placeholder="Kullanıcı Adı"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={`w-full bg-[#0F172A] border ${username && !isUsernameValid && username.length > 0 ? 'border-red-500' : 'border-[#334155]'} rounded-xl px-4 py-3 text-white placeholder:text-[#6B7280] focus:outline-none focus:border-[#22C55E] transition`}
                required
              />
              <p className="text-xs text-gray-500 mt-1">En az 3 karakter, harf/rakam/alt çizgi/tire</p>
              {username && !isUsernameValid && username.length > 0 && (
                <p className="text-xs text-red-500 mt-1">Geçersiz kullanıcı adı</p>
              )}
            </div>

            <input
              type="tel"
              placeholder="Telefon (isteğe bağlı)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-[#0F172A] border border-[#334155] rounded-xl px-4 py-3 text-white placeholder:text-[#6B7280] focus:outline-none focus:border-[#22C55E] transition"
            />

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Şifre"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#0F172A] border border-[#334155] rounded-xl px-4 py-3 text-white placeholder:text-[#6B7280] focus:outline-none focus:border-[#22C55E] transition pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>

            {password.length > 0 && (
              <div className="space-y-1">
                <div className="flex gap-1 h-1.5">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className={`flex-1 rounded-full transition ${i < getPasswordStrength(password) ? 'bg-[#22C55E]' : 'bg-[#334155]'}`}
                    ></div>
                  ))}
                </div>
                <p className="text-xs text-gray-500">
                  {getPasswordStrength(password) < 3 ? 'Zayıf' : getPasswordStrength(password) < 4 ? 'Orta' : 'Güçlü'}
                  {!isPasswordValid && ' (6 karakter + 1 büyük harf)'}
                </p>
              </div>
            )}

            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Şifre (tekrar)"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-[#0F172A] border border-[#334155] rounded-xl px-4 py-3 text-white placeholder:text-[#6B7280] focus:outline-none focus:border-[#22C55E] transition pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showConfirmPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>

            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="terms-mobile"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-[#334155] bg-[#0F172A] text-[#22C55E] focus:ring-[#22C55E]"
              />
              <label htmlFor="terms-mobile" className="text-xs text-gray-400">
                <a href="#" onClick={(e) => { e.preventDefault(); window.open('/sozlesme', '_blank'); }} className="text-[#38BDF8] hover:underline">
                  Kullanıcı Sözleşmesi
                </a>
                {' '}ve{' '}
                <a href="#" className="text-[#38BDF8] hover:underline">Gizlilik Politikası</a>
                {' '}koşullarını kabul ediyorum.
              </label>
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <button
              type="submit"
              disabled={loading || !agreed || !email || !fullName || !username || !password || !confirmPassword || !isUsernameValid || !isPasswordValid}
              className={`w-full font-semibold py-3 rounded-xl transition ${
                loading || !agreed || !email || !fullName || !username || !password || !confirmPassword || !isUsernameValid || !isPasswordValid
                  ? 'bg-[#334155] text-gray-500 cursor-not-allowed'
                  : 'bg-[#22C55E] hover:bg-[#16A34A] text-white'
              }`}
            >
              {loading ? 'Kaydediliyor...' : 'Hesap Oluştur'}
            </button>
          </form>
        )}

        {/* SATICI BAŞVURU */}
        {mode === 'seller' && (
          <form onSubmit={handleSellerSubmit} className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
            <div>
              <label className="text-sm text-gray-400 block mb-1">Ad Soyad</label>
              <input
                type="text"
                placeholder="Adınız ve soyadınız"
                value={sellerForm.full_name}
                onChange={(e) => setSellerForm({ ...sellerForm, full_name: e.target.value })}
                className="w-full bg-[#0F172A] border border-[#334155] rounded-xl px-4 py-3 text-white placeholder:text-[#6B7280] focus:outline-none focus:border-[#22C55E] transition"
                required
              />
            </div>

            <div>
              <label className="text-sm text-gray-400 block mb-1">TC Kimlik No</label>
              <input
                type="text"
                placeholder="11 haneli TC kimlik numaranız"
                value={sellerForm.tc_no}
                onChange={(e) => { const val = e.target.value.replace(/\D/g, '').slice(0, 11); setSellerForm({ ...sellerForm, tc_no: val }) }}
                className="w-full bg-[#0F172A] border border-[#334155] rounded-xl px-4 py-3 text-white placeholder:text-[#6B7280] focus:outline-none focus:border-[#22C55E] transition"
                required
              />
            </div>

            <div>
              <label className="text-sm text-gray-400 block mb-1">Doğum Tarihi</label>
              <input
                type="date"
                value={sellerForm.birth_date}
                onChange={(e) => setSellerForm({ ...sellerForm, birth_date: e.target.value })}
                max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                className="w-full bg-[#0F172A] border border-[#334155] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#22C55E] transition"
                required
              />
              <p className="text-xs text-gray-500 mt-1">18 yaşından büyük olmalısınız.</p>
            </div>

            <div>
              <label className="text-sm text-gray-400 block mb-1">Telefon Numarası</label>
              <input
                type="tel"
                placeholder="5xx xxx xx xx"
                value={sellerForm.phone}
                onChange={(e) => { const val = e.target.value.replace(/\D/g, '').slice(0, 10); setSellerForm({ ...sellerForm, phone: val }) }}
                className="w-full bg-[#0F172A] border border-[#334155] rounded-xl px-4 py-3 text-white placeholder:text-[#6B7280] focus:outline-none focus:border-[#22C55E] transition"
                required
              />
            </div>

            <div>
              <label className="text-sm text-gray-400 block mb-1">E-posta Adresi</label>
              <input
                type="email"
                placeholder="ornek@mail.com"
                value={sellerForm.email}
                onChange={(e) => setSellerForm({ ...sellerForm, email: e.target.value })}
                className="w-full bg-[#0F172A] border border-[#334155] rounded-xl px-4 py-3 text-white placeholder:text-[#6B7280] focus:outline-none focus:border-[#22C55E] transition"
                required
              />
            </div>

            <div>
              <label className="text-sm text-gray-400 block mb-1">Kimlik Ön Yüz Fotoğrafı</label>
              <input
                type="file"
                accept="image/jpeg,image/png"
                onChange={(e) => handleSellerFileChange(e, 'id_front')}
                className="w-full bg-[#0F172A] border border-[#334155] rounded-xl px-4 py-3 text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-[#22C55E] file:text-white hover:file:bg-[#16A34A] cursor-pointer"
                required
              />
              {sellerForm.id_front && <p className="text-xs text-[#22C55E] mt-1">✓ {sellerForm.id_front.name}</p>}
            </div>

            <div>
              <label className="text-sm text-gray-400 block mb-1">Kimlik Arka Yüz Fotoğrafı</label>
              <input
                type="file"
                accept="image/jpeg,image/png"
                onChange={(e) => handleSellerFileChange(e, 'id_back')}
                className="w-full bg-[#0F172A] border border-[#334155] rounded-xl px-4 py-3 text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-[#22C55E] file:text-white hover:file:bg-[#16A34A] cursor-pointer"
                required
              />
              {sellerForm.id_back && <p className="text-xs text-[#22C55E] mt-1">✓ {sellerForm.id_back.name}</p>}
            </div>

            <div className="bg-[#0F172A] rounded-xl p-3 border border-[#334155]">
              <p className="text-xs text-gray-400 leading-relaxed">
                Bize ilettiğiniz bu bilgiler, tarafımızca incelendikten sonra <span className="text-[#22C55E]">onaylanırsa</span>, 
                size <span className="text-[#22C55E]">WhatsApp</span> üzerinden ulaşacağız ve vermiş olduğunuz e-posta adresinize 
                hesap bilgilerinizi göndereceğiz.
              </p>
            </div>

            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="seller-terms"
                checked={sellerForm.agreed}
                onChange={(e) => setSellerForm({ ...sellerForm, agreed: e.target.checked })}
                className="mt-1 w-4 h-4 rounded border-[#334155] bg-[#0F172A] text-[#22C55E] focus:ring-[#22C55E]"
              />
              <label htmlFor="seller-terms" className="text-xs text-gray-400">
                Bilgilerimin doğru olduğunu ve bu koşulları kabul ettiğimi onaylıyorum.
              </label>
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <button
              type="submit"
              disabled={sellerLoading || !sellerForm.agreed}
              className={`w-full font-semibold py-3 rounded-xl transition ${
                sellerLoading || !sellerForm.agreed
                  ? 'bg-[#334155] text-gray-500 cursor-not-allowed'
                  : 'bg-[#FBBF24] hover:bg-[#F59E0B] text-black'
              }`}
            >
              {sellerLoading ? 'Gönderiliyor...' : 'Başvur'}
            </button>
          </form>
        )}

        {/* Google Divider - Sadece login/register'da göster */}
        {mode !== 'seller' && (
          <>
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#334155]"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-[#1E293B] px-3 text-gray-500">veya</span>
              </div>
            </div>

            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-[#0F172A] hover:bg-[#1E293B] border border-[#334155] rounded-xl py-3 transition disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582l-3.339 3.339a4.27 4.27 0 0 0-3.017-1.19c-1.7 0-3.153 1.16-3.67 2.735L5.266 9.765z"/>
                <path fill="#34A853" d="M16.44 15.245c-.717 1.14-1.935 1.96-3.44 1.96-1.93 0-3.588-1.23-4.217-2.955L5.266 15.76A7.094 7.094 0 0 0 12 20.545c1.89 0 3.55-.7 4.8-1.8l-2.36-2.36z"/>
                <path fill="#4A90E2" d="M19.8 10.5c.2.8.3 1.7.3 2.5 0 2.5-1 4.7-2.6 6.3l-2.36-2.36c.87-.73 1.46-1.74 1.66-2.94H12v-3.5h7.8z"/>
                <path fill="#FBBC05" d="M5.266 9.765A7.06 7.06 0 0 0 5 12c0 .97.2 1.9.54 2.76l3.54-2.76a4.27 4.27 0 0 1-.54-2.035l-3.54-2.76z"/>
              </svg>
              <span className="text-sm text-white">Google ile devam et</span>
            </button>
          </>
        )}

        {/* Alt yazı */}
        <p className="text-center text-sm text-gray-400 mt-4">
          {mode === 'login' && (
            <>Hesabın yok mu? <button onClick={() => { setMode('register'); setError(''); setSuccessMessage('') }} className="text-[#22C55E] hover:underline">Kayıt ol</button></>
          )}
          {mode === 'register' && (
            <>Zaten hesabın var mı? <button onClick={() => { setMode('login'); setError(''); setSuccessMessage('') }} className="text-[#22C55E] hover:underline">Giriş yap</button></>
          )}
          {mode === 'seller' && (
            <>Zaten hesabın var mı? <button onClick={() => { setMode('login'); setError(''); setSuccessMessage(''); setSellerSuccess(false) }} className="text-[#22C55E] hover:underline">Giriş yap</button></>
          )}
        </p>
      </div>
    </div>
  )
}

export default MobileAuthPage