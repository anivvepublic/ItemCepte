import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import HomePage from './pages/HomePage'
import ProductDetail from './pages/ProductDetail'
import CategoriesPage from './pages/CategoriesPage'
import TermsPage from './pages/TermsPage'
import ProfilePage from './pages/ProfilePage'
import SearchPage from './pages/SearchPage'
import AuthModal from './components/AuthModal'
import DeviceDetector from './components/DeviceDetector'
import { supabase } from './lib/supabaseClient'

function AppContent() {
  const navigate = useNavigate()
  const [authOpen, setAuthOpen] = useState(false)
  const [user, setUser] = useState(null)
  const [toast, setToast] = useState(null)
  const [loading, setLoading] = useState(true)
  const [authMode, setAuthMode] = useState('login')

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        showToast('success', `Hoş geldin, ${session.user.user_metadata?.full_name || session.user.email?.split('@')[0]}!`)
      }
    })
    return () => listener?.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    const handleOpenSeller = () => {
      setAuthMode('seller')
      setAuthOpen(true)
    }
    window.addEventListener('openSellerApplication', handleOpenSeller)
    return () => window.removeEventListener('openSellerApplication', handleOpenSeller)
  }, [])

  const showToast = (type, message) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 3000)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    showToast('info', 'Çıkış yapıldı.')
    navigate('/')
  }

  const handleAuthSuccess = () => {
    showToast('success', 'İşlem başarıyla tamamlandı!')
  }

  const openAuth = (mode = 'login') => {
    setAuthMode(mode)
    setAuthOpen(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 md:w-16 md:h-16 border-4 border-[#22C55E] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-400 mt-4 text-sm md:text-base">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Navbar user={user} onAuthClick={() => openAuth('login')} onLogout={handleLogout} />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/kategoriler" element={<CategoriesPage />} />
        <Route path="/sozlesme" element={<TermsPage />} />
        <Route path="/profil" element={<ProfilePage onLogout={handleLogout} />} />
        <Route path="/arama" element={<SearchPage />} />
      </Routes>
      <AuthModal 
        isOpen={authOpen} 
        onClose={() => { setAuthOpen(false); setAuthMode('login') }} 
        onSuccess={handleAuthSuccess}
        initialMode={authMode}
      />
      {toast && (
        <div className={`fixed bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 md:px-5 md:py-3 rounded-xl shadow-2xl text-xs md:text-sm font-medium transition-all duration-300 max-w-[90vw] text-center ${
          toast.type === 'success' ? 'bg-[#22C55E] text-white' : 
          toast.type === 'info' ? 'bg-[#38BDF8] text-black' : 'bg-red-500 text-white'
        }`}>
          {toast.message}
        </div>
      )}
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#0F172A]">
        <DeviceDetector />
        <AppContent />
      </div>
    </BrowserRouter>
  )
}

export default App