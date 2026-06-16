import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

function AuthModal({ isOpen, onClose, onSuccess }) {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [resetSent, setResetSent] = useState(false)

  if (!isOpen) return null

  const handleGoogleLogin = async () => {
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    })
    if (error) setError(error.message)
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
    else onClose()
    setLoading(false)
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    if (!agreed) { setError('Sözleşmeyi onaylamalısınız.'); setLoading(false); return }
    if (password !== confirmPassword) { setError('Şifreler eşleşmiyor.'); setLoading(false); return }
    const { error, data } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, phone } }
    })
    if (error) setError(error.message)
    else {
      if (data.user) {
        await supabase.from('users').insert([
          { auth_id: data.user.id, full_name: fullName, phone, role: 'buyer' }
        ])
      }
      onClose()
    }
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-300">
      <div className="bg-[#111827] rounded-2xl w-full max-w-md p-4 sm:p-6 shadow-2xl border border-[#1F2937] max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-white tracking-tight">
              {mode === 'login' && 'Hoş geldin'}
              {mode === 'register' && 'Hesap oluştur'}
              {mode === 'reset' && 'Şifreni sıfırla'}
            </h2>
            <p className="text-xs sm:text-sm text-[#6B7280] mt-0.5">
              {mode === 'login' && 'Devam etmek için giriş yap'}
              {mode === 'register' && 'Ücretsiz hesabını oluştur'}
              {mode === 'reset' && 'E-posta adresine bağlantı gönderelim'}
            </p>
          </div>
          <button onClick={onClose} className="text-[#6B7280] hover:text-white text-2xl leading-5 transition">&times;</button>
        </div>

        {mode === 'reset' && resetSent && (
          <div className="text-center space-y-4">
            <div className="w-12 h-12 mx-auto bg-[#1F2937] rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-[#10B981]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-sm text-[#9CA3AF]">Bağlantı gönderildi. E-postanı kontrol et.</p>
            <button onClick={() => { setMode('login'); setResetSent(false); }} className="text-sm text-[#10B981] hover:underline">Girişe dön</button>
          </div>
        )}

        {!(mode === 'reset' && resetSent) && (
          <>
            <form onSubmit={mode === 'login' ? handleLogin : handleRegister} className="space-y-3 sm:space-y-4">
              {mode !== 'reset' && (
                <input type="email" placeholder="E-posta" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-[#1F2937] border border-[#374151] rounded-xl px-4 py-2.5 text-white placeholder:text-[#6B7280] focus:outline-none focus:border-[#10B981] transition text-sm sm:text-base" required />
              )}
              {mode === 'reset' && (
                <input type="email" placeholder="E-posta adresin" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-[#1F2937] border border-[#374151] rounded-xl px-4 py-2.5 text-white placeholder:text-[#6B7280] focus:outline-none focus:border-[#10B981] transition text-sm sm:text-base" required />
              )}
              {mode !== 'reset' && (
                <input type="password" placeholder="Şifre" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-[#1F2937] border border-[#374151] rounded-xl px-4 py-2.5 text-white placeholder:text-[#6B7280] focus:outline-none focus:border-[#10B981] transition text-sm sm:text-base" required />
              )}
              {mode === 'register' && (
                <>
                  <input type="text" placeholder="Ad Soyad" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full bg-[#1F2937] border border-[#374151] rounded-xl px-4 py-2.5 text-white placeholder:text-[#6B7280] focus:outline-none focus:border-[#10B981] transition text-sm sm:text-base" required />
                  <input type="tel" placeholder="Telefon (isteğe bağlı)" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full bg-[#1F2937] border border-[#374151] rounded-xl px-4 py-2.5 text-white placeholder:text-[#6B7280] focus:outline-none focus:border-[#10B981] transition text-sm sm:text-base" />
                  <input type="password" placeholder="Şifre (tekrar)" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full bg-[#1F2937] border border-[#374151] rounded-xl px-4 py-2.5 text-white placeholder:text-[#6B7280] focus:outline-none focus:border-[#10B981] transition text-sm sm:text-base" required />
                  <label className="flex items-start gap-2 text-xs sm:text-sm text-[#9CA3AF]">
                    <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-1" />
                    <span><a href="#" className="text-[#10B981] hover:underline">Sözleşme</a> ve <a href="#" className="text-[#10B981] hover:underline">gizlilik</a> politikasını kabul ediyorum.</span>
                  </label>
                </>
              )}
              {error && <p className="text-sm text-red-500">{error}</p>}
              <button type="submit" disabled={loading} className="w-full bg-[#10B981] hover:bg-[#059669] text-white font-medium py-2.5 rounded-xl transition disabled:opacity-50 text-sm sm:text-base">
                {loading ? 'İşleniyor...' : mode === 'login' ? 'Giriş Yap' : mode === 'register' ? 'Hesap Oluştur' : 'Bağlantı Gönder'}
              </button>
            </form>

            {mode === 'login' && (
              <div className="mt-3 text-center">
                <button onClick={() => setMode('reset')} className="text-sm text-[#9CA3AF] hover:text-[#10B981] transition">Şifremi unuttum</button>
              </div>
            )}

            {mode !== 'reset' && (
              <>
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[#374151]"></div></div>
                  <div className="relative flex justify-center text-xs"><span className="bg-[#111827] px-3 text-[#6B7280]">veya</span></div>
                </div>

                <button onClick={handleGoogleLogin} disabled={loading} className="w-full flex items-center justify-center gap-2 bg-[#1F2937] hover:bg-[#374151] border border-[#374151] rounded-xl py-2.5 transition text-sm sm:text-base">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#EA4335" d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582l-3.339 3.339a4.27 4.27 0 0 0-3.017-1.19c-1.7 0-3.153 1.16-3.67 2.735L5.266 9.765z"/>
                    <path fill="#34A853" d="M16.44 15.245c-.717 1.14-1.935 1.96-3.44 1.96-1.93 0-3.588-1.23-4.217-2.955L5.266 15.76A7.094 7.094 0 0 0 12 20.545c1.89 0 3.55-.7 4.8-1.8l-2.36-2.36z"/>
                    <path fill="#4A90E2" d="M19.8 10.5c.2.8.3 1.7.3 2.5 0 2.5-1 4.7-2.6 6.3l-2.36-2.36c.87-.73 1.46-1.74 1.66-2.94H12v-3.5h7.8z"/>
                    <path fill="#FBBC05" d="M5.266 9.765A7.06 7.06 0 0 0 5 12c0 .97.2 1.9.54 2.76l3.54-2.76a4.27 4.27 0 0 1-.54-2.035l-3.54-2.76z"/>
                  </svg>
                  <span className="text-white">Google ile devam</span>
                </button>
              </>
            )}

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