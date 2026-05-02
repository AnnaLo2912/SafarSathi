import { useState, useEffect, useMemo } from 'react'
import { FiDollarSign } from 'react-icons/fi'
import { getBookings } from '../../services/bookingService'

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
}

export default function EarningsPanel() {
  const [period, setPeriod] = useState('week')
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchBookings() {
      try {
        const data = await getBookings('guide')
        setBookings(data.bookings || [])
      } catch (err) {
        console.error("Failed to load bookings", err)
      } finally {
        setLoading(false)
      }
    }
    fetchBookings()
  }, [])

  const dynamicData = useMemo(() => {
    const now = new Date()
    const oneDay = 24 * 60 * 60 * 1000
    const completed = bookings.filter(b => b.status === 'completed')

    // Filter bookings
    const weekBookings = completed.filter(b => (now - new Date(b.updatedAt || b.date)) <= 7 * oneDay)
    const monthBookings = completed.filter(b => (now - new Date(b.updatedAt || b.date)) <= 30 * oneDay)
    const yearBookings = completed.filter(b => (now - new Date(b.updatedAt || b.date)) <= 365 * oneDay)

    const totalEarned = completed.reduce((sum, b) => sum + (b.price || 0), 0)
    const totalTrips = completed.length

    const generateStats = (filtered) => {
      const total = filtered.reduce((sum, b) => sum + (b.price || 0), 0)
      const trips = filtered.length
      const avg = trips > 0 ? total / trips : 0
      return { total, trips, avg }
    }

    const weekStats = generateStats(weekBookings)
    const monthStats = generateStats(monthBookings)
    const yearStats = generateStats(yearBookings)

    // TXNS
    const txns = [...completed]
      .sort((a,b) => new Date(b.updatedAt || b.date) - new Date(a.updatedAt || a.date))
      .slice(0, 5).map(b => ({
        id: b._id,
        tourist: b.touristName,
        country: "🌍",
        avatar: b.touristName?.[0] || 'U',
        avatarBg: 'bg-deepblue',
        service: b.location,
        date: new Date(b.updatedAt || b.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
        amount: formatCurrency(b.price || 0),
        status: 'paid',
        method: 'Wallet'
      }))

    return {
      week: {
        total: formatCurrency(weekStats.total),
        trips: weekStats.trips,
        avgPerTrip: formatCurrency(weekStats.avg),
        growth: "+0%"
      },
      month: {
        total: formatCurrency(monthStats.total),
        trips: monthStats.trips,
        avgPerTrip: formatCurrency(monthStats.avg),
        growth: "+0%"
      },
      year: {
        total: formatCurrency(yearStats.total),
        trips: yearStats.trips,
        avgPerTrip: formatCurrency(yearStats.avg),
        growth: "+0%"
      },
      transactions: txns
    }
  }, [bookings])

  const data = dynamicData[period]
  const transactions = dynamicData.transactions

  if (loading) {
    return <div className="page-fade-in p-8 text-charcoal/60 font-garamond">Loading earnings data...</div>
  }

  return (
    <div className="page-fade-in">
      {/* HEADER */}
      <div className="flex items-start justify-between mb-10 flex-wrap gap-4">
        <div>
          <p className="font-garamond text-xs uppercase tracking-widest text-terracotta mb-2">
            ✦ Your Earnings
          </p>
          <h1 className="font-playfair text-4xl text-charcoal font-bold">
            Money well
          </h1>
          <p className="font-playfair text-4xl text-saffron italic font-bold flex items-center gap-2">
            earned. <FiDollarSign size={24} />
          </p>
        </div>

        {/* Period Selector */}
        <div className="flex items-center bg-sand rounded-full p-1.5">
          {['week', 'month', 'year'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-5 py-2 rounded-full font-garamond text-sm cursor-pointer transition-all duration-200 ${
                period === p
                  ? 'bg-charcoal text-cream'
                  : 'text-charcoal/50 hover:text-charcoal'
              }`}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* TOP STATS ROW */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {/* Stat 1 - Total Earnings */}
        <div className="bg-deepblue rounded-3xl p-6 md:col-span-2 relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-white/5" />
          <div className="relative z-10">
            <p className="font-garamond text-xs uppercase tracking-widest text-white/50 mb-2">
              {period === 'week'
                ? 'This Week'
                : period === 'month'
                ? 'This Month'
                : 'This Year'}
            </p>
            <p className="font-playfair text-5xl text-white font-bold mb-2">
              {data.total}
            </p>
            <div className="flex items-center gap-3">
              <span className="bg-green-500/20 text-green-400 font-garamond text-sm px-3 py-1 rounded-full">
                {data.growth}
              </span>
              <span className="font-garamond text-sm text-white/50">
                vs last {period}
              </span>
            </div>
          </div>
        </div>

        {/* Stat 2 - Trips */}
        <div className="bg-sand rounded-3xl p-6">
          <p className="font-garamond text-xs uppercase tracking-widest text-charcoal/40 mb-2">
            Trips
          </p>
          <p className="font-playfair text-4xl text-charcoal font-bold mb-1">
            {data.trips}
          </p>
          <p className="font-garamond text-sm text-charcoal/50">
            completed
          </p>
        </div>

        {/* Stat 3 - Avg Per Trip */}
        <div className="bg-sand rounded-3xl p-6">
          <p className="font-garamond text-xs uppercase tracking-widest text-charcoal/40 mb-2">
            Avg Per Trip
          </p>
          <p className="font-playfair text-4xl text-charcoal font-bold mb-1">
            {data.avgPerTrip}
          </p>
          <p className="font-garamond text-sm text-charcoal/50">
            per booking
          </p>
        </div>
      </div>


      {/* TRANSACTION HISTORY */}
      <div className="bg-sand rounded-3xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-sand/80">
          <h2 className="font-playfair text-xl text-charcoal font-bold">
            Transaction History
          </h2>
          <p className="font-garamond text-xs text-charcoal/40 uppercase tracking-wider">
            {transactions.length} transactions
          </p>
        </div>

        {/* Rows */}
        {transactions.map((transaction, idx) => (
          <div
            key={transaction.id}
            className={`flex items-center gap-4 px-8 py-5 ${
              idx !== transactions.length - 1 ? 'border-b border-sand/60' : ''
            } hover:bg-cream/50 transition-colors`}
          >
            {/* Avatar */}
            <div
              className={`w-11 h-11 rounded-full shrink-0 flex items-center justify-center text-white font-playfair font-bold ${transaction.avatarBg}`}
            >
              {transaction.avatar}
            </div>

            {/* Middle */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-playfair text-sm text-charcoal font-semibold">
                  {transaction.tourist}
                </p>
                <p className="font-garamond text-xs text-charcoal/40">
                  {transaction.country}
                </p>
              </div>
              <p className="font-garamond text-sm text-charcoal/60 mt-0.5">
                {transaction.service}
              </p>
              <p className="font-garamond text-xs text-charcoal/40 mt-0.5">
                {transaction.date}
              </p>
            </div>

            {/* Right */}
            <div className="flex flex-col items-end gap-1 shrink-0">
              <p className="font-playfair text-lg text-charcoal font-bold">
                {transaction.amount}
              </p>
              <span className="bg-green-100 text-green-700 font-garamond text-xs px-3 py-0.5 rounded-full">
                ✓ {transaction.status}
              </span>
              <p className="font-garamond text-xs text-charcoal/40">
                {transaction.method}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
