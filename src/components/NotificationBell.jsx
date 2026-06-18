import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

function NotificationBell({ userId }) {
  const [unreadCount, setUnreadCount] = useState(0)
  const [showDropdown, setShowDropdown] = useState(false)
  const [notifications, setNotifications] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    if (userId) {
      fetchUnreadCount()
      const channel = supabase
        .channel('notifications')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `receiver_id=eq.${userId}`
          },
          () => {
            fetchUnreadCount()
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }
  }, [userId])

  async function fetchUnreadCount() {
    const { count } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('receiver_id', userId)
      .eq('is_read', false)

    setUnreadCount(count || 0)

    if (count > 0) {
      const { data } = await supabase
        .from('messages')
        .select('*, products(title), sender:sender_id(full_name, username, avatar_url)')
        .eq('receiver_id', userId)
        .eq('is_read', false)
        .order('created_at', { ascending: false })
        .limit(5)

      if (data) {
        setNotifications(data)
      }
    } else {
      setNotifications([])
    }
  }

  const handleToggle = () => {
    setShowDropdown(!showDropdown)
    if (showDropdown) {
      supabase
        .from('messages')
        .update({ is_read: true })
        .eq('receiver_id', userId)
        .eq('is_read', false)
        .then(() => {
          setUnreadCount(0)
        })
    }
  }

  const getSenderName = (msg) => {
    if (msg.sender?.full_name) return msg.sender.full_name
    if (msg.sender?.username) return msg.sender.username
    return 'Bilinmeyen'
  }

  const getInitials = (name) => {
    if (!name) return 'U'
    return name.charAt(0).toUpperCase()
  }

  return (
    <div className="relative">
      <button
        onClick={handleToggle}
        className="relative p-1.5 md:p-2 rounded-full hover:bg-[#1E293B] transition"
      >
        <svg className="w-5 h-5 md:w-6 md:h-6 text-gray-400 hover:text-white transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#22C55E] text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="absolute right-0 top-full mt-2 w-72 md:w-80 bg-[#1E293B] border border-[#334155] rounded-xl shadow-2xl overflow-hidden z-50 max-h-80 overflow-y-auto">
          <div className="p-3 border-b border-[#334155] flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Bildirimler</h3>
            <button
              onClick={() => { setShowDropdown(false); navigate('/mesajlar') }}
              className="text-xs text-[#38BDF8] hover:text-[#22C55E] transition"
            >
              Tümü
            </button>
          </div>
          {notifications.length === 0 ? (
            <div className="p-4 text-center">
              <p className="text-gray-400 text-sm">Yeni bildirim yok</p>
            </div>
          ) : (
            notifications.map((notif) => {
              const senderName = getSenderName(notif)
              return (
                <div
                  key={notif.id}
                  className="p-3 hover:bg-[#334155] cursor-pointer transition border-b border-[#334155] last:border-0 flex items-center gap-3"
                  onClick={() => {
                    setShowDropdown(false)
                    navigate(`/chat/${notif.sender_id}/${notif.product_id}`)
                  }}
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#22C55E] to-[#38BDF8] flex items-center justify-center text-white font-bold text-xs overflow-hidden flex-shrink-0">
                    {notif.sender?.avatar_url ? (
                      <img src={notif.sender.avatar_url} alt={senderName} className="w-full h-full object-cover" />
                    ) : (
                      getInitials(senderName)
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">
                      <span className="font-medium">{senderName}</span>
                      {' '}sana mesaj gönderdi
                    </p>
                    <p className="text-xs text-gray-400 truncate">{notif.message}</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">
                      {new Date(notif.created_at).toLocaleDateString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}

export default NotificationBell