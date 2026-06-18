import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabaseClient'

function ChatDetail({ currentUserId, otherUserId, productId }) {
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [otherUser, setOtherUser] = useState(null)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    if (currentUserId && otherUserId) {
      fetchMessages()
      fetchOtherUser()
      markAsRead()
    }
  }, [currentUserId, otherUserId, productId])

  useEffect(() => {
    if (!currentUserId || !otherUserId) return

    let filter = `and(sender_id.eq.${currentUserId},receiver_id.eq.${otherUserId})`
    if (productId) {
      filter = `and(product_id.eq.${productId},or(sender_id.eq.${currentUserId},receiver_id.eq.${currentUserId}))`
    }

    const channel = supabase
      .channel(`chat-${currentUserId}-${otherUserId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: filter
        },
        (payload) => {
          const newMsg = payload.new
          if (
            (newMsg.sender_id === currentUserId && newMsg.receiver_id === otherUserId) ||
            (newMsg.sender_id === otherUserId && newMsg.receiver_id === currentUserId)
          ) {
            setMessages(prev => [...prev, newMsg])
            if (newMsg.sender_id !== currentUserId) {
              markAsRead()
            }
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [currentUserId, otherUserId, productId])

  async function fetchMessages() {
    setLoading(true)

    let query = supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${currentUserId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${currentUserId})`)

    if (productId) {
      query = query.eq('product_id', productId)
    } else {
      query = query.is('product_id', null)
    }

    const { data, error } = await query.order('created_at', { ascending: true })

    if (!error && data) {
      setMessages(data)
    } else {
      console.error('Mesaj çekme hatası:', error)
    }
    setLoading(false)
  }

  async function fetchOtherUser() {
    const { data, error } = await supabase
      .from('users')
      .select('full_name, username, avatar_url')
      .eq('auth_id', otherUserId)
      .single()
    if (!error && data) {
      setOtherUser(data)
    }
  }

  async function markAsRead() {
    let query = supabase
      .from('messages')
      .update({ is_read: true })
      .eq('sender_id', otherUserId)
      .eq('receiver_id', currentUserId)
      .eq('is_read', false)

    if (productId) {
      query = query.eq('product_id', productId)
    } else {
      query = query.is('product_id', null)
    }

    await query
  }

  async function sendMessage() {
    if (!newMessage.trim() || sending) return

    setSending(true)
    
    const messageData = {
      sender_id: currentUserId,
      receiver_id: otherUserId,
      message: newMessage.trim()
    }

    if (productId) {
      messageData.product_id = productId
    }

    const { error } = await supabase
      .from('messages')
      .insert(messageData)

    if (error) {
      console.error('Mesaj gönderme hatası:', error)
      alert('Mesaj gönderilemedi: ' + error.message)
    } else {
      setNewMessage('')
    }
    setSending(false)
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const getInitials = (name) => {
    if (!name) return 'U'
    return name.charAt(0).toUpperCase()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-[#22C55E] border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="glass-card p-3 mb-3 flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-gradient-to-r from-[#22C55E] to-[#38BDF8] flex items-center justify-center text-white font-bold overflow-hidden">
          {otherUser?.avatar_url ? (
            <img src={otherUser.avatar_url} alt={otherUser.full_name} className="w-full h-full object-cover" />
          ) : (
            getInitials(otherUser?.full_name || otherUser?.username || 'U')
          )}
        </div>
        <div>
          <p className="font-semibold text-white text-sm">{otherUser?.full_name || otherUser?.username || 'Kullanıcı'}</p>
          <p className="text-[10px] text-[#22C55E]">Çevrimiçi</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 mb-3 max-h-[60vh] pr-1">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400 text-sm">Henüz mesaj yok.</p>
            <p className="text-gray-500 text-xs mt-1">İlk mesajı sen gönder!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isOwn = msg.sender_id === currentUserId
            return (
              <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[80%] px-4 py-2.5 rounded-2xl ${
                    isOwn
                      ? 'bg-[#22C55E] text-white rounded-br-none'
                      : 'bg-[#1E293B] text-white rounded-bl-none border border-[#334155]'
                  }`}
                >
                  <p className="text-sm break-words">{msg.message}</p>
                  <p className={`text-[10px] mt-1 ${isOwn ? 'text-green-200' : 'text-gray-400'}`}>
                    {new Date(msg.created_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                    {isOwn && ' ✓'}
                  </p>
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Mesajını yaz..."
          className="flex-1 bg-[#0F172A] border border-[#334155] rounded-xl px-4 py-2.5 text-white placeholder:text-[#6B7280] focus:outline-none focus:border-[#22C55E] transition text-sm"
        />
        <button
          onClick={sendMessage}
          disabled={!newMessage.trim() || sending}
          className="bg-[#22C55E] hover:bg-[#16A34A] text-white px-4 py-2.5 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {sending ? (
            <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          )}
        </button>
      </div>
    </div>
  )
}

export default ChatDetail