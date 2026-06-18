import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import ChatDetail from '../components/ChatDetail'

function ChatPage() {
  const { userId: otherUserId, productId } = useParams()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUser(data.user)
      } else {
        navigate('/')
      }
      setLoading(false)
    })
  }, [navigate])

  // product_id 0 ise null olarak gönder (direkt mesaj)
  const actualProductId = productId === '0' ? null : productId

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#22C55E] border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!user || !otherUserId) {
    return null
  }

  return (
    <div className="min-h-screen bg-[#0F172A] pt-20 md:pt-24 pb-10">
      <div className="max-w-3xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-[#38BDF8] hover:text-[#22C55E] transition mb-4 text-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Geri
        </button>

        <div className="glass-card p-4 h-[70vh] flex flex-col">
          <ChatDetail
            currentUserId={user.id}
            otherUserId={otherUserId}
            productId={actualProductId}
          />
        </div>
      </div>
    </div>
  )
}

export default ChatPage