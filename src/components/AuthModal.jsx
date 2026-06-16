import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabaseClient'
import SellerApplicationForm from './SellerApplicationForm'

function AuthModal({ isOpen, onClose, onSuccess, initialMode }) {
  const [mode, setMode] = useState(initialMode || 'login')
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
  const [user, setUser] = useState(null)
  const modalRef = useRef(null)

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode || 'login')
      supabase.auth.getUser().then(({ data }) => {
        if (data.user) setUser(data.user)
      })
    }
  }, [isOpen, initialMode])

  // Dışarı tıklayınca kapat
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose()
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, onClose])

  if (!isOpen) return null

  // Google Login
  const handleGoogleLogin = async () => {
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    })
    if (error) setError(error.message)
    else {
      onClose()
      if (onSuccess) onSuccess()
    }
    setLoading(false)
  }

  // Şifre Sıfırlama
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

  // Giriş
  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(error.message)
    else {
      onClose()
      if (onSuccess) onSuccess()
    }
    setLoading(false)
  }

  // Kayıt
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
    onClose()
    if (onSuccess) onSuccess()
  }

  // Şifre güç kontrolü
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

  const passwordStrength = getPasswordStrength(password)
  const isPasswordValid = password.length >= 6 && /[A-Z]/.test(password)
  const isValidEmail = (email) => {
    const allowedDomains = ['gmail.com', 'outlook.com', 'hotmail.com', 'yahoo.com', 'icloud.com', 'protonmail.com']
    const domain = email.split('@')[1]
    return domain && allowedDomains.includes(domain.toLowerCase())
  }
  const isUsernameValid = username.length >= 3 && /^[a-zA-Z0-9_.-]+$/.test(username)

  // Reset Modu
  if (resetMode) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-300">
        <div className="bg-[#111827] rounded-2xl w-full max-w-md p-6 shadow-2xl border border-[#1F2937]">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-xl font-semibold text-white">Şifreni Sıfırla</h2>
              <p className="text-sm text-[#6B7280] mt-0.5">E-posta adresine bağlantı gönderelim</p>
            </div>
            <button onClick={() => { setResetMode(false); setError(''); }} className="text-[#6B7280] hover:text-white text-2xl leading-5 transition">&times;</button>
          </div>
          {resetSent ? (
            <div className="text-center space-y-4">
              <div className="w-12 h-12 mx-auto bg-[#1F2937] rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-[#10B981]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-sm text-[#9CA3AF]">Bağlantı gönderildi. E-postanı kontrol et.</p>
              <button onClick={() => { setResetMode(false); setResetSent(false); }} className="text-sm text-[#10B981] hover:underline">Girişe dön</button>
            </div>
          ) : (
            <form onSubmit={handleReset} className="space-y-4">
              <input
                type="email"
                placeholder="E-posta adresin"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#1F2937] border border-[#374151] rounded-xl px-4 py-2.5 text-white placeholder:text-[#6B7280] focus:outline-none focus:border-[#10B981] transition"
                required
              />
              {error && <p className="text-sm text-red-500">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#10B981] hover:bg-[#059669] text-white font-medium py-2.5 rounded-xl transition disabled:opacity-50"
              >
                {loading ? 'Gönderiliyor...' : 'Bağlantı Gönder'}
              </button>
              <button
                type="button"
                onClick={() => { setResetMode(false); setError(''); }}
                className="w-full text-center text-sm text-[#6B7280] hover:text-[#10B981] transition"
              >
                Giriş ekranına dön
              </button>
            </form>
          )}
        </div>
      </div>
    )
  }

  // Ana Modal
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-300">
      <div ref={modalRef} className="bg-[#111827] rounded-2xl w-full max-w-md p-6 shadow-2xl border border-[#1F2937] max-h-[90vh] overflow-y-auto">
        {/* Header - Kapatma butonu her zaman görünür */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-white">
            {mode === 'login' ? 'Giriş Yap' : mode === 'register' ? 'Kayıt Ol' : 'Satıcı Ol'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">&times;</button>
        </div>

        {/* Tab Bar */}
        <div className="flex gap-1 bg-[#1F2937] p-1 rounded-xl mb-4">
          <button
            onClick={() => { setMode('login'); setError(''); setResetMode(false); setResetSent(false) }}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition ${mode === 'login' ? 'bg-[#10B981] text-white' : 'text-[#6B7280] hover:text-white'}`}
          >
            Giriş
          </button>
          <button
            onClick={() => { setMode('register'); setError(''); setResetMode(false); setResetSent(false) }}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition ${mode === 'register' ? 'bg-[#10B981] text-white' : 'text-[#6B7280] hover:text-white'}`}
          >
            Kayıt
          </button>
          <button
            onClick={() => { setMode('seller'); setError(''); setResetMode(false); setResetSent(false) }}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition ${mode === 'seller' ? 'bg-[#FBBF24] text-black' : 'text-[#6B7280] hover:text-white'}`}
          >
            Satıcı Ol
          </button>
        </div>

        {/* SATICI BAŞVURU */}
        {mode === 'seller' && (
          <SellerApplicationForm 
            user={user} 
            onClose={() => {
              onClose()
              setMode('login')
            }} 
          />
        )}

        {/* GİRİŞ */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="email"
              placeholder="E-posta"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#1F2937] border border-[#374151] rounded-xl px-4 py-2.5 text-white placeholder:text-[#6B7280] focus:outline-none focus:border-[#10B981] transition"
              required
            />
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Şifre"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#1F2937] border border-[#374151] rounded-xl px-4 py-2.5 text-white placeholder:text-[#6B7280] focus:outline-none focus:border-[#10B981] transition pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-white"
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
                className="text-sm text-[#6B7280] hover:text-[#10B981] transition"
              >
                Şifremi unuttum
              </button>
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#10B981] hover:bg-[#059669] text-white font-medium py-2.5 rounded-xl transition disabled:opacity-50"
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
                placeholder="E-posta (ornek@gmail.com)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full bg-[#1F2937] border ${email && !isValidEmail(email) && email.length > 0 ? 'border-red-500' : 'border-[#374151]'} rounded-xl px-4 py-2.5 text-white placeholder:text-[#6B7280] focus:outline-none focus:border-[#10B981] transition`}
                required
              />
              {email && !isValidEmail(email) && email.length > 0 && (
                <p className="text-xs text-red-500 mt-1">Geçerli bir email domaini girin (gmail, outlook, hotmail, yahoo, icloud, protonmail)</p>
              )}
            </div>
            <input
              type="text"
              placeholder="Ad Soyad"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-[#1F2937] border border-[#374151] rounded-xl px-4 py-2.5 text-white placeholder:text-[#6B7280] focus:outline-none focus:border-[#10B981] transition"
              required
            />
            <div>
              <input
                type="text"
                placeholder="Kullanıcı Adı"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={`w-full bg-[#1F2937] border ${username && !isUsernameValid && username.length > 0 ? 'border-red-500' : 'border-[#374151]'} rounded-xl px-4 py-2.5 text-white placeholder:text-[#6B7280] focus:outline-none focus:border-[#10B981] transition`}
                required
              />
              <p className="text-xs text-[#6B7280] italic mt-1">* Kullanıcı adınız diğer kullanıcılar tarafından görünebilir. En az 3 karakter, harf/rakam/alt çizgi/tire kullanabilirsiniz.</p>
              {username && !isUsernameValid && username.length > 0 && (
                <p className="text-xs text-red-500 mt-1">Kullanıcı adı en az 3 karakter ve geçerli karakterler içermeli.</p>
              )}
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Şifre"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#1F2937] border border-[#374151] rounded-xl px-4 py-2.5 text-white placeholder:text-[#6B7280] focus:outline-none focus:border-[#10B981] transition pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-white"
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
                      className={`flex-1 rounded-full transition ${i < passwordStrength ? 'bg-[#10B981]' : 'bg-[#374151]'}`}
                    ></div>
                  ))}
                </div>
                <p className="text-xs text-[#6B7280]">
                  {passwordStrength < 3 ? 'Zayıf' : passwordStrength < 4 ? 'Orta' : 'Güçlü'}
                  {!isPasswordValid && ' (En az 6 karakter ve 1 büyük harf)'}
                </p>
              </div>
            )}
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Şifre (tekrar)"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-[#1F2937] border border-[#374151] rounded-xl px-4 py-2.5 text-white placeholder:text-[#6B7280] focus:outline-none focus:border-[#10B981] transition pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-white"
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
                id="terms"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-[#374151] bg-[#1F2937] text-[#10B981] focus:ring-[#10B981] focus:ring-offset-0"
              />
              <label htmlFor="terms" className="text-sm text-[#9CA3AF]">
                <a href="#" onClick={(e) => { e.preventDefault(); window.open('/sozlesme', '_blank'); }} className="text-[#10B981] hover:underline">
                  Kullanıcı Sözleşmesi
                </a>
                {' '}ve{' '}
                <a href="#" className="text-[#10B981] hover:underline">Gizlilik Politikası</a>
                {' '}koşullarını okudum, kabul ediyorum.
              </label>
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <button
              type="submit"
              disabled={loading || !agreed || !email || !fullName || !username || !password || !confirmPassword || !isUsernameValid || !isPasswordValid}
              className={`w-full font-medium py-2.5 rounded-xl transition ${
                loading || !agreed || !email || !fullName || !username || !password || !confirmPassword || !isUsernameValid || !isPasswordValid
                  ? 'bg-[#374151] text-[#6B7280] cursor-not-allowed'
                  : 'bg-[#10B981] hover:bg-[#059669] text-white'
              }`}
            >
              {loading ? 'Kaydediliyor...' : 'Hesap Oluştur'}
            </button>
          </form>
        )}

        {/* Google Divider ve Buton */}
        {mode !== 'seller' && (
          <>
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#374151]"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-[#111827] px-3 text-[#6B7280]">veya</span>
              </div>
            </div>

            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-[#1F2937] hover:bg-[#374151] border border-[#374151] rounded-xl py-2.5 transition disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582l-3.339 3.339a4.27 4.27 0 0 0-3.017-1.19c-1.7 0-3.153 1.16-3.67 2.735L5.266 9.765z"/>
                <path fill="#34A853" d="M16.44 15.245c-.717 1.14-1.935 1.96-3.44 1.96-1.93 0-3.588-1.23-4.217-2.955L5.266 15.76A7.094 7.094 0 0 0 12 20.545c1.89 0 3.55-.7 4.8-1.8l-2.36-2.36z"/>
                <path fill="#4A90E2" d="M19.8 10.5c.2.8.3 1.7.3 2.5 0 2.5-1 4.7-2.6 6.3l-2.36-2.36c.87-.73 1.46-1.74 1.66-2.94H12v-3.5h7.8z"/>
                <path fill="#FBBC05" d="M5.266 9.765A7.06 7.06 0 0 0 5 12c0 .97.2 1.9.54 2.76l3.54-2.76a4.27 4.27 0 0 1-.54-2.035l-3.54-2.76z"/>
              </svg>
              <span className="text-sm text-white">Google ile devam et</span>
            </button>

            {mode === 'login' && (
              <p className="text-center text-sm text-[#9CA3AF] mt-4">
                Hesabın yok mu? <button onClick={() => setMode('register')} className="text-[#10B981] hover:underline">Kayıt ol</button>
              </p>
            )}
            {mode === 'register' && (
              <p className="text-center text-sm text-[#9CA3AF] mt-4">
                Zaten hesabın var mı? <button onClick={() => setMode('login')} className="text-[#10B981] hover:underline">Giriş yap</button>
              </p>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default AuthModal