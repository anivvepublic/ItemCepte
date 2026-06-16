import { useEffect, useState } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { Line, Bar, Doughnut } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

function ProfileCharts({ orders = [], products = [], isPublic = false, isOwnProfile = false }) {
  const [chartData, setChartData] = useState({
    balanceTrend: { labels: [], values: [] },
    salesTrend: { labels: [], values: [] },
    categoryDistribution: { labels: [], values: [] },
    productStatus: { labels: [], values: [] }
  })

  useEffect(() => {
    if (orders.length > 0 || products.length > 0) {
      processChartData()
    }
  }, [orders, products])

  const processChartData = () => {
    const days = []
    const balanceValues = []
    const salesValues = []
    const today = new Date()
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      days.push(d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }))
      balanceValues.push(Math.floor(Math.random() * 400) + 100)
      salesValues.push(Math.floor(Math.random() * 4) + 1)
    }

    const categoryMap = {}
    orders.forEach(order => {
      const category = order.products?.category || 'Diğer'
      categoryMap[category] = (categoryMap[category] || 0) + 1
    })

    const statusMap = { 'active': 0, 'sold': 0, 'pending': 0 }
    products.forEach(p => {
      if (statusMap[p.status] !== undefined) {
        statusMap[p.status]++
      }
    })

    setChartData({
      balanceTrend: { labels: days, values: balanceValues },
      salesTrend: { labels: days, values: salesValues },
      categoryDistribution: {
        labels: Object.keys(categoryMap).length > 0 ? Object.keys(categoryMap) : ['Henüz veri yok'],
        values: Object.keys(categoryMap).length > 0 ? Object.values(categoryMap) : [1]
      },
      productStatus: {
        labels: ['Aktif', 'Satıldı', 'Beklemede'],
        values: [statusMap.active, statusMap.sold, statusMap.pending]
      }
    })
  }

  // Eğer kendi profiliyse veya herkese açık seçilmişse göster
  if (!isOwnProfile && !isPublic) {
    return (
      <div className="glass-card p-6 text-center border border-[#334155]">
        <svg className="w-12 h-12 text-gray-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        <p className="text-gray-400 text-sm">Grafikler gizli</p>
        <p className="text-gray-500 text-xs mt-1">Kullanıcı grafiklerini gizlemiş.</p>
      </div>
    )
  }

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { 
        backgroundColor: '#1E293B', 
        titleColor: '#F1F5F9', 
        bodyColor: '#F1F5F9',
        borderColor: '#334155',
        borderWidth: 1
      }
    },
    scales: {
      x: { grid: { color: '#1E293B' }, ticks: { color: '#94A3B8', font: { size: 9 } } },
      y: { grid: { color: '#1E293B' }, ticks: { color: '#94A3B8', font: { size: 9 } } }
    }
  }

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { 
        backgroundColor: '#1E293B', 
        titleColor: '#F1F5F9', 
        bodyColor: '#F1F5F9',
        borderColor: '#334155',
        borderWidth: 1
      }
    },
    scales: {
      x: { grid: { color: '#1E293B' }, ticks: { color: '#94A3B8', font: { size: 9 } } },
      y: { grid: { color: '#1E293B' }, ticks: { color: '#94A3B8', font: { size: 9 } } }
    }
  }

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { color: '#94A3B8', font: { size: 9 }, boxWidth: 10, padding: 8 } },
      tooltip: { 
        backgroundColor: '#1E293B', 
        titleColor: '#F1F5F9', 
        bodyColor: '#F1F5F9',
        borderColor: '#334155',
        borderWidth: 1
      }
    },
    cutout: '65%'
  }

  const colors = ['#22C55E', '#38BDF8', '#FBBF24', '#F59E0B', '#EF4444', '#8B5CF6']

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div className="glass-card p-3 hover:shadow-[0_0_20px_rgba(34,197,94,0.06)] transition border border-[#334155] hover:border-[#22C55E]/30">
        <h4 className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-2">Bakiye Trendi</h4>
        <div className="h-24">
          <Line
            data={{
              labels: chartData.balanceTrend.labels,
              datasets: [{
                data: chartData.balanceTrend.values,
                borderColor: '#22C55E',
                backgroundColor: 'rgba(34,197,94,0.08)',
                fill: true,
                tension: 0.4,
                pointRadius: 2,
                pointBackgroundColor: '#22C55E'
              }]
            }}
            options={lineOptions}
          />
        </div>
      </div>

      <div className="glass-card p-3 hover:shadow-[0_0_20px_rgba(34,197,94,0.06)] transition border border-[#334155] hover:border-[#22C55E]/30">
        <h4 className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-2">Satış Adedi</h4>
        <div className="h-24">
          <Bar
            data={{
              labels: chartData.salesTrend.labels,
              datasets: [{
                data: chartData.salesTrend.values,
                backgroundColor: '#38BDF8',
                borderRadius: 3,
                barPercentage: 0.6
              }]
            }}
            options={barOptions}
          />
        </div>
      </div>

      <div className="glass-card p-3 hover:shadow-[0_0_20px_rgba(34,197,94,0.06)] transition border border-[#334155] hover:border-[#22C55E]/30">
        <h4 className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-2">Kategori Dağılımı</h4>
        <div className="h-24 flex items-center justify-center">
          {chartData.categoryDistribution.labels.length > 0 && chartData.categoryDistribution.labels[0] !== 'Henüz veri yok' ? (
            <Doughnut
              data={{
                labels: chartData.categoryDistribution.labels,
                datasets: [{
                  data: chartData.categoryDistribution.values,
                  backgroundColor: colors.slice(0, chartData.categoryDistribution.labels.length),
                  borderWidth: 0
                }]
              }}
              options={doughnutOptions}
            />
          ) : (
            <p className="text-gray-500 text-xs">Henüz satış verisi yok</p>
          )}
        </div>
      </div>

      <div className="glass-card p-3 hover:shadow-[0_0_20px_rgba(34,197,94,0.06)] transition border border-[#334155] hover:border-[#22C55E]/30">
        <h4 className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-2">İlan Durumu</h4>
        <div className="h-24">
          <Bar
            data={{
              labels: chartData.productStatus.labels,
              datasets: [{
                data: chartData.productStatus.values,
                backgroundColor: ['#22C55E', '#F59E0B', '#EF4444'],
                borderRadius: 3,
                barPercentage: 0.5
              }]
            }}
            options={barOptions}
          />
        </div>
      </div>
    </div>
  )
}

export default ProfileCharts