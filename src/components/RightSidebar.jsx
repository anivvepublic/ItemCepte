import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

function RightSidebar() {
  const [stats, setStats] = useState({ totalOrders: 0, positiveFeedback: 98.5 })
  const [recentActivities, setRecentActivities] = useState([])

  useEffect(() => {
    fetchStats()
    fetchRecentActivities()
  }, [])

  async function fetchStats() {
    // Son 30 gündeki başarılı işlemler
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    const { count, error } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'completed')
      .gte('created_at', thirtyDaysAgo.toISOString())
    
    if (!error && count) {
      setStats(prev => ({ ...prev, totalOrders: count }))
      // Pozitif feedback = başarılı işlem / toplam işlem * 100
      const { count: total } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', thirtyDaysAgo.toISOString())
      
      if (total && total > 0) {
        setStats(prev => ({ ...prev, positiveFeedback: ((count / total) * 100).toFixed(1) }))
      }
    }
  }

  async function fetchRecentActivities() {
    const { data, error } = await supabase
      .from('orders')
      .select('*, products(title)')
      .eq('status', 'completed')
      .order('created_at', { ascending: false })
      .limit(5)
    
    if (!error && data) {
      const activities = data.map(order => ({
        text: `${order.buyer_id?.slice(0, 8)} ürün satın aldı: ${order.products?.title || "Ürün"}`,
        time: new Date(order.created_at).toLocaleTimeString('tr-TR')
      }))
      setRecentActivities(activities)
    } else {
      setRecentActivities([
        { text: "Örnek aktivite - Sistem hazır", time: "Az önce" }
      ])
    }
  }

  return (
    <div className="space-y-4">
      <div className="glass-card p-4">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-[#22C55E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          Güvenlik İstatistikleri
        </h3>
        
        <div className="p-3 bg-[#0F172A]/50 rounded-xl">
          <p className="text-sm text-[#94A3B8]">Başarılı İşlem Oranı</p>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-3xl font-bold text-[#22C55E]">{stats.positiveFeedback}</span>
            <span className="text-sm text-gray-400">%</span>
          </div>
          <div className="w-full bg-[#334155] rounded-full h-2 mt-2">
            <div className="bg-[#22C55E] h-2 rounded-full" style={{ width: `${stats.positiveFeedback}%` }}></div>
          </div>
          <p className="text-xs text-[#94A3B8] mt-2">Son 30 günde {stats.totalOrders} başarılı işlem</p>
        </div>
      </div>

      <div className="glass-card p-4">
        <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
          <svg className="w-5 h-5 text-[#38BDF8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Anlık Aktivite
        </h3>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {recentActivities.map((activity, idx) => (
            <div key={idx} className="text-xs text-gray-400 border-b border-[#1E293B] pb-2">
              <span className="text-[#22C55E]">●</span> {activity.text}
              <span className="block text-right text-[#38BDF8] mt-1">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-card p-4">
        <div className="flex items-center gap-3 mb-3">
          <svg className="w-8 h-8 text-[#22C55E]" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M2.166 4.999A10 10 0 0010 2a10 10 0 007.834 4.999A10 10 0 0010 18a10 10 0 00-7.834-13.001z" clipRule="evenodd" />
          </svg>
          <div>
            <p className="text-xs text-gray-400">SSL Güvenli Bağlantı</p>
            <p className="text-xs text-gray-500">256-bit şifreleme</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <svg className="w-8 h-8 text-[#38BDF8]" fill="currentColor" viewBox="0 0 20 20">
            <path d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm0 2h12v8H4V6z" />
            <path d="M6 8h8v2H6z" />
          </svg>
          <div>
            <p className="text-xs text-gray-400">3D Secure Ödeme</p>
            <p className="text-xs text-gray-500">Visa / Mastercard</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RightSidebar