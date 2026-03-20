import { useState } from 'react'
import { FiDollarSign } from 'react-icons/fi'

const earningsData = {
  week: {
    total: "₹6,000",
    trips: 3,
    avgPerTrip: "₹2,000",
    growth: "+12%",
    bars: [
      { day: "Mon", amount: 0, height: 0 },
      { day: "Tue", amount: 2000, height: 60 },
      { day: "Wed", amount: 0, height: 0 },
      { day: "Thu", amount: 2000, height: 60 },
      { day: "Fri", amount: 0, height: 0 },
      { day: "Sat", amount: 2000, height: 60 },
      { day: "Sun", amount: 0, height: 0 },
    ]
  },
  month: {
    total: "₹24,500",
    trips: 13,
    avgPerTrip: "₹1,885",
    growth: "+8%",
    bars: [
      { day: "W1", amount: 6000, height: 50 },
      { day: "W2", amount: 8500, height: 70 },
      { day: "W3", amount: 4000, height: 33 },
      { day: "W4", amount: 6000, height: 50 },
    ]
  },
  year: {
    total: "₹2,18,000",
    trips: 109,
    avgPerTrip: "₹2,000",
    growth: "+23%",
    bars: [
      { day: "Apr", amount: 18000, height: 55 },
      { day: "May", amount: 22000, height: 67 },
      { day: "Jun", amount: 15000, height: 46 },
      { day: "Jul", amount: 12000, height: 37 },
      { day: "Aug", amount: 19000, height: 58 },
      { day: "Sep", amount: 24000, height: 73 },
      { day: "Oct", amount: 28000, height: 85 },
      { day: "Nov", amount: 26000, height: 79 },
      { day: "Dec", amount: 20000, height: 61 },
      { day: "Jan", amount: 16000, height: 49 },
      { day: "Feb", amount: 18000, height: 55 },
      { day: "Mar", amount: 20000, height: 61 },
    ]
  }
}

const transactions = [
  {
    id: 1,
    tourist: "Sarah Mitchell",
    country: "🇺🇸",
    avatar: "S",
    avatarBg: "bg-saffron",
    service: "Full Day Tour — Amber Fort",
    date: "Today, Mar 19",
    amount: "₹2,000",
    status: "paid",
    method: "Razorpay"
  },
  {
    id: 2,
    tourist: "James Whitfield",
    country: "🇬🇧",
    avatar: "J",
    avatarBg: "bg-deepblue",
    service: "Half Day — City Palace",
    date: "Mar 17",
    amount: "₹1,200",
    status: "paid",
    method: "Stripe"
  },
  {
    id: 3,
    tourist: "Yuki Tanaka",
    country: "🇯🇵",
    avatar: "Y",
    avatarBg: "bg-terracotta",
    service: "Full Day — Nahargarh Fort",
    date: "Mar 15",
    amount: "₹2,000",
    status: "paid",
    method: "UPI"
  },
  {
    id: 4,
    tourist: "Emma Richter",
    country: "🇩🇪",
    avatar: "E",
    avatarBg: "bg-green-600",
    service: "Full Day — Heritage Walk",
    date: "Mar 12",
    amount: "₹2,000",
    status: "paid",
    method: "Razorpay"
  },
  {
    id: 5,
    tourist: "Carlos Mendez",
    country: "🇧🇷",
    avatar: "C",
    avatarBg: "bg-deepblue",
    service: "2 Day Package — Jaipur",
    date: "Mar 10",
    amount: "₹4,000",
    status: "paid",
    method: "Stripe"
  }
]

const payoutInfo = {
  pending: "₹6,000",
  nextPayout: "Mar 22, 2026",
  bank: "SBI ••••4521",
  totalEarned: "₹2,18,000",
  totalTrips: 109
}

export default function EarningsPanel() {
  const [period, setPeriod] = useState('week')
  const data = earningsData[period]

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

      {/* CHART + PAYOUT ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* LEFT - Bar Chart */}
        <div className="lg:col-span-2 bg-sand rounded-3xl p-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-playfair text-xl text-charcoal font-bold">
              Earnings Breakdown
            </h2>
            <p className="font-garamond text-xs text-charcoal/40 uppercase tracking-wider">
              {period === 'week'
                ? 'Daily'
                : period === 'month'
                ? 'Weekly'
                : 'Monthly'}
            </p>
          </div>

          {/* Chart */}
          <div className="relative h-48 mb-4">
            {/* Y-axis Labels */}
            <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between pr-2 font-garamond text-xs text-charcoal/30">
              <span>₹3K</span>
              <span>₹2K</span>
              <span>₹1K</span>
              <span>₹0</span>
            </div>

            {/* Grid Lines */}
            <div className="absolute inset-0 ml-8 flex flex-col justify-between pointer-events-none">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="w-full h-px bg-sand/60" />
              ))}
            </div>

            {/* Bars Container */}
            <div className="ml-8 h-full flex items-end justify-around gap-2">
              {data.bars.map((bar) => (
                <div key={bar.day} className="flex flex-col items-center gap-2 flex-1">
                  <div
                    className={`w-full rounded-t-xl transition-all duration-700 cursor-pointer ${
                      bar.amount > 0
                        ? 'bg-saffron hover:bg-amber-500'
                        : 'bg-sand/80'
                    }`}
                    style={{ height: bar.height + '%' }}
                  />
                  <p className="font-garamond text-xs text-charcoal/50">
                    {bar.day}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT - Payout Info */}
        <div className="bg-deepblue rounded-3xl p-6">
          <p className="font-playfair text-xl text-white font-semibold mb-6">
            Payout Details
          </p>

          <div className="space-y-4">
            {/* Pending */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <p className="font-garamond text-sm text-white/60">
                Pending Payout
              </p>
              <p className="font-playfair text-xl text-saffron font-bold">
                {payoutInfo.pending}
              </p>
            </div>

            {/* Next Payout */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <p className="font-garamond text-sm text-white/60">
                Next Payout Date
              </p>
              <p className="font-playfair text-base text-white font-semibold">
                {payoutInfo.nextPayout}
              </p>
            </div>

            {/* Bank */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <p className="font-garamond text-sm text-white/60">
                Bank Account
              </p>
              <p className="font-garamond text-sm text-white/80">
                {payoutInfo.bank}
              </p>
            </div>

            {/* Total Earned */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <p className="font-garamond text-sm text-white/60">
                Total Earned (All Time)
              </p>
              <p className="font-playfair text-base text-white font-semibold">
                {payoutInfo.totalEarned}
              </p>
            </div>

            {/* Total Trips */}
            <div className="flex items-center justify-between pb-4">
              <p className="font-garamond text-sm text-white/60">
                Total Trips
              </p>
              <p className="font-playfair text-base text-white font-semibold">
                {payoutInfo.totalTrips} trips
              </p>
            </div>
          </div>

          {/* Buttons */}
          <button className="w-full mt-6 bg-saffron text-charcoal font-garamond text-sm uppercase tracking-widest py-4 rounded-2xl hover:bg-amber-500 transition-all duration-300">
            Request Early Payout →
          </button>
          <button className="w-full mt-3 border border-white/20 text-white/60 font-garamond text-xs uppercase tracking-wider py-3 rounded-2xl hover:bg-white/10 transition-all duration-300">
            Update Bank Details
          </button>
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
