import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

function ChatList({ userId }) {
  const [conversations, setConversations] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    if (userId) {
      fetchConversations()
      const channel = supabase
        .channel('chat-list')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `or(receiver_id.eq.${userId},sender_id.eq.${userId})`
          },
          () => {
            fetchConversations()
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }
  }, [userId])

  async function fetchConversations() {
    setLoading(true)

    // 1. Tüm mesajları çek (JOIN yok, sadece raw data)
    const { data: allMessages, error } = await supabase
      .from('messages')
      .select('*')
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Mesaj çekme hatası:', error)
      setConversations([])
      setLoading(false)
      return
    }

    if (!allMessages || allMessages.length === 0) {
      setConversations([])
      setLoading(false)
      return
    }

    // 2. Benzersiz konuşmaları grupla (otherUserId + productId)
    const conversationMap = {}
    
    for (const msg of allMessages) {
      const otherUserId = msg.sender_id === userId ? msg.receiver_id : msg.sender_id
      if (!otherUserId) continue
      
      const productId = msg.product_id
      const uniqueKey = `${otherUserId}-${productId}`
      
      if (!conversationMap[uniqueKey] || new Date(msg.created_at) > new Date(conversationMap[uniqueKey].lastMessageTime)) {
        // Karşıdaki kullanıcı adını al
        let otherUserName = 'Kullanıcı'
        let otherUserAvatar = null
        
        const { data: userData } = await supabase
          .from('users')
          .select('full_name, username, avatar_url')
          .eq('auth_id', otherUserId)
          .single()
        
        if (userData) {
          otherUserName = userData.full_name || userData.username || 'Kullanıcı'
          otherUserAvatar = userData.avatar_url || null
        }

        // Ürün adını al
        let productTitle = 'Ürün'
        const { data: productData } = await supabase
          .from('products')
          .select('title')
          .eq('id', productId)
          .single()
        
        if (productData) {
          productTitle = productData.title || 'Ürün'
        }

        conversationMap[uniqueKey] = {
          id: uniqueKey,
          otherUserId: otherUserId,
          otherUserName: otherUserName,
          otherUserAvatar: otherUserAvatar,
          productId: productId,
          productTitle: productTitle,
          lastMessage: msg.message,
          lastMessageTime: msg.created_at,
          isUnread: msg.receiver_id === userId && !msg.is_read,
          senderId: msg.sender_id
        }
      }
    }

    const sortedConversations = Object.values(conversationMap).sort(
      (a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime)
    )

    setConversations(sortedConversations)
    setLoading(false)
  }

  const getInitials = (name) => {
    if (!name) return 'U'
    return name.charAt(0).toUpperCase()
  }

  const formatTime = (date) => {
    const d = new Date(date)
    const now = new Date()
    const diff = now - d
    if (diff < 60000) return 'şimdi'
    if (diff < 3600000) return `${Math.floor(diff / 60000)} dk`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} sa`
    return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-16 bg-[#1E293B] rounded-xl"></div>
          </div>
        ))}
      </div>
    )
  }

  if (conversations.length === 0) {
    return (
      <div className="text-center py-12">
        <svg className="w-12 h-12 text-gray-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <p className="text-gray-400 text-sm">Henüz mesajınız yok.</p>
        <p className="text-gray-500 text-xs mt-1">Bir ilana soru sorarak sohbet başlatın.</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {conversations.map((conv) => (
        <div
          key={conv.id}
          onClick={() => navigate(`/chat/${conv.otherUserId}/${conv.productId}`)}
          className={`glass-card p-3 cursor-pointer hover:border-[#22C55E] transition flex items-center gap-3 ${
            conv.isUnread ? 'border-[#22C55E] bg-[#22C55E]/5' : 'border-[#334155]'
          }`}
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#22C55E] to-[#38BDF8] flex items-center justify-center text-white font-bold flex-shrink-0 overflow-hidden">
            {conv.otherUserAvatar ? (
              <img src={conv.otherUserAvatar} alt={conv.otherUserName} className="w-full h-full object-cover" />
            ) : (
              getInitials(conv.otherUserName)
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <p className={`font-semibold text-sm truncate ${conv.isUnread ? 'text-white' : 'text-gray-300'}`}>
                {conv.productTitle}
              </p>
              <p className="text-[10px] text-gray-500 flex-shrink-0">
                {formatTime(conv.lastMessageTime)}
              </p>
            </div>
            <div className="flex items-center justify-between">
              <p className={`text-xs truncate ${conv.isUnread ? 'text-white font-medium' : 'text-gray-400'}`}>
                {conv.senderId === userId ? 'Sen: ' : ''}{conv.lastMessage}
              </p>
              <p className="text-[10px] text-gray-500 ml-2 flex-shrink-0">
                {conv.otherUserName}
              </p>
            </div>
          </div>
          {conv.isUnread && (
            <div className="w-2.5 h-2.5 bg-[#22C55E] rounded-full flex-shrink-0 animate-pulse"></div>
          )}
        </div>
      ))}
    </div>
  )
}

export default ChatList