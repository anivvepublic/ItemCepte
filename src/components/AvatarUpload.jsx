import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

function AvatarUpload({ userId, currentPhoto, size = 'md' }) {
  const [uploading, setUploading] = useState(false)
  const [photo, setPhoto] = useState(currentPhoto)

  const sizeClasses = {
    sm: 'w-12 h-12 text-sm',
    md: 'w-20 h-20 text-xl',
    lg: 'w-24 h-24 text-2xl'
  }

  const handleUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setUploading(true)

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${userId}-${Date.now()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(filePath, file, {
          upsert: true,
          cacheControl: '3600'
        })

      if (uploadError) {
        console.error('Yükleme hatası:', uploadError)
        alert('Yükleme hatası: ' + uploadError.message)
        setUploading(false)
        return
      }

      const { data: urlData } = supabase.storage
        .from('profiles')
        .getPublicUrl(filePath)

      const avatarUrl = urlData.publicUrl

      const { error: updateError } = await supabase
        .from('users')
        .update({ avatar_url: avatarUrl })
        .eq('auth_id', userId)

      if (updateError) {
        console.error('Profil güncelleme hatası:', updateError)
        alert('Profil güncelleme hatası: ' + updateError.message)
      } else {
        setPhoto(avatarUrl)
        alert('Profil fotoğrafı başarıyla güncellendi!')
      }
    } catch (error) {
      console.error('Beklenmeyen hata:', error)
      alert('Beklenmeyen bir hata oluştu.')
    }

    setUploading(false)
  }

  const getInitials = () => {
    return userId?.charAt(0).toUpperCase() || 'U'
  }

  return (
    <div className="relative group">
      <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-r from-[#22C55E] to-[#38BDF8] flex items-center justify-center text-white font-bold shadow-xl border-2 border-[#0F172A] overflow-hidden hover:shadow-[0_0_30px_rgba(34,197,94,0.2)] transition`}>
        {photo ? (
          <img src={photo} alt="Avatar" className="w-full h-full object-cover" />
        ) : (
          getInitials()
        )}
      </div>
      <label 
        htmlFor="avatar-upload" 
        className="absolute -bottom-1 -right-1 bg-[#1E293B] hover:bg-[#334155] rounded-full p-1.5 border border-[#334155] cursor-pointer transition group-hover:border-[#22C55E] hover:shadow-[0_0_15px_rgba(34,197,94,0.15)]"
      >
        <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
        <input 
          id="avatar-upload" 
          type="file" 
          accept="image/*" 
          className="hidden" 
          onChange={handleUpload}
          disabled={uploading}
        />
      </label>
      {uploading && (
        <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-[#22C55E] border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  )
}

export default AvatarUpload