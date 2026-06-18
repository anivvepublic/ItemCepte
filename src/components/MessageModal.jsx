import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

function MessageModal({ isOpen, onClose, receiverId, productId, productTitle, currentUserId }) {
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  if (!isOpen) return null

  const handleSend = async () => {
    if (!message.trim()) {
      setError('Lütfen bir mesaj yazın.')
      return
    }

    setLoading(true)
    setError('')

    const { error: sendError } = await supabase
      .from('messages')
      .insert({
        sender_id: currentUserId,
        receiver_id: receiverId,
        product_id: productId,
        message: message.trim()
      })

    if (sendError) {
      setError('Mesaj gönderilemedi: ' + sendError.message)
    } else {
      setSuccess(true)
      setMessage('')
      setTimeout(() => {
        onClose()
        setSuccess(false)
      }, 1500)
    }
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#1E293B] rounded-2xl w-full max-w-md p-6 border border-[#334155] shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-white">Satıcıya Sor</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">&times;</button>
        </div>

        {success ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-[#22C55E]/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-[#22C55E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-white font-medium">Mesaj gönderildi!</p>
            <p className="text-gray-400 text-sm">Satıcı size en kısa sürede dönecektir.</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-400 mb-4">
              <span className="text-white font-medium">{productTitle}</span> ilanı hakkında satıcıya sormak istediklerinizi yazın.
            </p>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Mesajınızı yazın..."
              rows={4}
              className="w-full bg-[#0F172A] border border-[#334155] rounded-xl px-4 py-3 text-white placeholder:text-[#6B7280] focus:outline-none focus:border-[#22C55E] transition resize-none"
            />
            {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
            <div className="flex gap-3 mt-4">
              <button
                onClick={onClose}
                className="flex-1 bg-[#334155] hover:bg-[#475569] text-white py-2.5 rounded-xl transition"
              >
                Vazgeç
              </button>
              <button
                onClick={handleSend}
                disabled={loading || !message.trim()}
                className="flex-1 bg-[#22C55E] hover:bg-[#16A34A] text-white font-medium py-2.5 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Gönderiliyor...' : 'Gönder'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default MessageModal