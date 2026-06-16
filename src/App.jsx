import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import HomePage from './pages/HomePage'
import ProductDetail from './pages/ProductDetail'
import AuthModal from './components/AuthModal'
import DeviceDetector from './components/DeviceDetector'
import { supabase } from './lib/supabaseClient'

function App() {
  const [authOpen, setAuthOpen] = useState(false)
  const [user, setUser] = useState(null)
  const [toast, setToast] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        setToast({ type: 'success', message: `Hoş geldin, ${session.user.user_metadata?.full_name || session.user.email?.split('@')[0]}!` })
        setTimeout(() => setToast(null), 3000)
      }
    })
    return () => listener?.subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setToast({ type: 'info', message: 'Çıkış yapıldı.' })
    setTimeout(() => setToast(null), 3000)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#22C55E] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-400 mt-4">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#0F172A]">
        <DeviceDetector />
        <Navbar user={user} onAuthClick={() => setAuthOpen(true)} onLogout={handleLogout} />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/product/:id" element={<ProductDetail />} />
        </Routes>
        <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
        {toast && (
          <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-2xl text-sm font-medium transition-all duration-300 ${
            toast.type === 'success' ? 'bg-[#22C55E] text-white' : 
            toast.type === 'info' ? 'bg-[#38BDF8] text-black' : 'bg-red-500 text-white'
          }`}>
            {toast.message}
          </div>
        )}
      </div>
    </BrowserRouter>
  )
}

export default App