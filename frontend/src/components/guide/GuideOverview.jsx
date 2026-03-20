import { useState } from 'react'
import { FiDollarSign, FiPackage, FiMapPin, FiShield, FiZap } from 'react-icons/fi'

const stats = [
  {
    label: "This Week",
    value: "₹6,000",
    sub: "3 trips completed",
    icon: "dollar",
    color: "bg-saffron",
    trend: "+12% vs last week"
  },
  {
    label: "Active Tourists",
    value: "3",
    sub: "On trip right now",
    icon: "package",
    color: "bg-deepblue",
    trend: "2 more upcoming"
  },
  {
    label: "Response Rate",
    value: "98ms",
    sub: "Panic alert speed",
    icon: "zap",
    color: "bg-terracotta",
    trend: "Top 5% of guides"
  },
  {
    label: "Your Rating",
    value: "4.9",
    sub: "From 127 reviews",
    icon: "⭐",
    color: "bg-green-600",
    trend: "↑ 0.1 this month"
  }
]

const upcomingBookings = [
  {
    id: 1,
    tourist: "Sarah Mitchell",
    country: "🇺🇸 USA",
    avatar: "S",
    avatarBg: "bg-saffron",
    date: "Today — Mar 19",
    time: "7:30 AM",
    location: "Amber Fort, Jaipur",
    duration: "Full Day",
    amount: "₹2,000",
    status: "confirmed",
    statusColor: "bg-green-100 text-green-700"
  },
  {
    id: 2,
    tourist: "James Whitfield",
    country: "🇬🇧 UK",
    avatar: "J",
    avatarBg: "bg-deepblue",
    date: "Tomorrow — Mar 20",
    time: "9:00 AM",
    location: "City Palace + Hawa Mahal",
    duration: "Half Day",
    amount: "₹1,200",
    status: "confirmed",
    statusColor: "bg-green-100 text-green-700"
  },
  {
    id: 3,
    tourist: "Yuki Tanaka",
    country: "🇯🇵 Japan",
    avatar: "Y",
    avatarBg: "bg-terracotta",
    date: "Mar 22",
    time: "8:00 AM",
    location: "Nahargarh Fort + Bazaar",
    duration: "Full Day",
    amount: "₹2,000",
    status: "pending",
    statusColor: "bg-amber-100 text-amber-700"
  }
]

const recentReviews = [
  {
    tourist: "Emma R.",
    country: "🇩🇪",
    rating: 5,
    text: "Rajesh was absolutely wonderful! His knowledge of Jaipur's history is unmatched. Highly recommend!",
    date: "Mar 17"
  },
  {
    tourist: "Carlos M.",
    country: "🇧🇷",
    rating: 5,
    text: "Best guide experience in India. Took us to hidden gems we would never have found alone.",
    date: "Mar 14"
  }
]

function getStatIcon(iconName) {
  const iconMap = {
    dollar: <FiDollarSign size={24} />,
    package: <FiPackage size={24} />,
    zap: <FiZap size={24} />
  }
  return iconMap[iconName] || null
}

function getActionIcon(iconName) {
  const iconMap = {
    'calendar': <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v2h16V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5H2v8a2 2 0 002 2h12a2 2 0 002-2V7H6z"/></svg>,
    'chat': <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5z"/></svg>,
    'map-pin': <FiMapPin size={24} />,
    'dollar-sign': <FiDollarSign size={24} />
  }
  return iconMap[iconName] || null
}

export default function GuideOverview({ available, setAvailable }) {
  return (
    <div className="page-fade-in">
      {/* HEADER ROW */}
      <div className="flex items-start justify-between mb-10 flex-wrap gap-4">
        <div>
          <p className="font-garamond text-xs uppercase tracking-widest text-terracotta mb-2">
            ✦ Guide Dashboard
          </p>
          <h1 className="font-playfair text-4xl text-charcoal font-bold">
            Good morning,
          </h1>
          <p className="font-playfair text-4xl text-saffron italic font-bold">
            Rajesh. 🙏
          </p>
        </div>

        {/* Availability Card */}
        <div className="bg-sand rounded-2xl px-6 py-4 flex items-center gap-4">
          <div>
            <p className="font-playfair text-base text-charcoal font-semibold">
              {available ? "You're Available" : "You're Offline"}
            </p>
            <p className="font-garamond text-xs text-charcoal/50 mt-0.5">
              {available 
                ? "Tourists can book you now" 
                : "You won't receive new bookings"}
            </p>
          </div>

          {/* Toggle */}
          <button
            onClick={() => setAvailable(!available)}
            className={`w-14 h-7 rounded-full relative transition-all duration-300 ${
              available ? "bg-green-500" : "bg-charcoal/20"
            }`}
          >
            <div
              className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-md transition-all duration-300 ${
                available ? "left-8" : "left-1"
              }`}
            />
          </button>
        </div>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-sand rounded-3xl p-6 relative overflow-hidden hover:shadow-lg transition-all duration-300"
          >
            <div
              className={`absolute -right-4 -top-4 w-20 h-20 rounded-full opacity-10 ${stat.color}`}
            />

            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white text-xl ${stat.color}`}>
                {getStatIcon(stat.icon)}
              </div>
              <p className="font-garamond text-xs text-charcoal/40 uppercase tracking-wider">
                {stat.label}
              </p>
            </div>

            <p className="font-playfair text-4xl text-charcoal font-bold mb-1">
              {stat.value}
            </p>
            <p className="font-garamond text-sm text-charcoal/60 mb-3">
              {stat.sub}
            </p>
            <p className="font-garamond text-xs text-green-600 flex items-center gap-1">
              ↑ {stat.trend}
            </p>
          </div>
        ))}
      </div>

      {/* TWO COLUMN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN */}
        <div className="lg:col-span-2">
          {/* UPCOMING BOOKINGS */}
          <div className="mb-10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-playfair text-2xl text-charcoal font-bold">
                Upcoming Bookings
              </h2>
              <span className="bg-saffron/20 text-saffron font-garamond text-xs px-3 py-1 rounded-full">
                {upcomingBookings.length} scheduled
              </span>
            </div>

            <div className="space-y-4">
              {upcomingBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="bg-sand rounded-2xl p-5 border border-sand hover:border-saffron/30 transition-all duration-300 flex items-center gap-4 flex-wrap md:flex-nowrap"
                >
                  {/* Avatar */}
                  <div
                    className={`w-12 h-12 rounded-full shrink-0 flex items-center justify-center text-white font-playfair font-bold text-lg ${booking.avatarBg}`}
                  >
                    {booking.avatar}
                  </div>

                  {/* Tourist Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-playfair text-base text-charcoal font-semibold">
                        {booking.tourist}
                      </p>
                      <p className="font-garamond text-xs text-charcoal/50">
                        {booking.country}
                      </p>
                    </div>
                      <p className="font-garamond text-sm text-charcoal/60 mt-0.5 flex items-center gap-2">
                        <FiMapPin size={14} /> {booking.location}
                    </p>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      <p className="font-garamond text-xs text-charcoal/50">
                        📅 {booking.date} · {booking.time}
                      </p>
                      <span>·</span>
                      <p className="font-garamond text-xs text-charcoal/50">
                        {booking.duration}
                      </p>
                    </div>
                  </div>

                  {/* Right Side */}
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <p className="font-playfair text-lg text-charcoal font-bold">
                      {booking.amount}
                    </p>
                    <span className={`font-garamond text-xs px-3 py-1 rounded-full ${booking.statusColor}`}>
                      {booking.status === "confirmed" ? "✓ Confirmed" : "⏳ Pending"}
                    </span>
                    <p className="font-garamond text-xs text-charcoal/40 cursor-pointer hover:text-saffron transition-colors">
                      View details →
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* QUICK ACTIONS */}
          <div>
            <h2 className="font-playfair text-2xl text-charcoal font-bold mb-4">
              Quick Actions
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { emoji: "📅", label: "View Calendar" },
                { emoji: "💬", label: "Open Chats" },
                { emoji: "📍", label: "Tourist Map" },
                { emoji: "💰", label: "Earnings" }
              ].map((action, idx) => (
                <button
                  key={idx}
                  className="bg-sand rounded-2xl p-4 text-center cursor-pointer border border-sand hover:border-saffron/40 hover:shadow-md transition-all duration-300"
                >
                  <p className="text-2xl mb-2 flex justify-center">{getActionIcon(action.emoji)}</p>
                  <p className="font-garamond text-xs text-charcoal/70 uppercase tracking-wider">
                    {action.label}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="lg:col-span-1">
          {/* PANIC ALERT PREVIEW */}
          <div className="bg-deepblue rounded-3xl p-6 mb-6 relative overflow-hidden">
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "radial-gradient(circle at 80% 20%, rgba(200,75,49,0.3) 0%, transparent 60%)"
              }}
            />

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-playfair text-lg text-white font-semibold">
                  Panic Alerts
                </h3>
                <span className="bg-green-500/20 text-green-400 font-garamond text-xs px-3 py-1 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  Monitoring
                </span>
              </div>

              {/* No Alerts State */}
              <div className="text-center py-6">
                <div className="flex justify-center mb-3">
                  <FiShield size={40} />
                </div>
                <p className="font-playfair text-base text-white/80 mb-1">All Clear</p>
                <p className="font-garamond text-sm text-white/50">
                  No panic alerts in your area. You'll be notified instantly if a
                  tourist needs help.
                </p>
              </div>

              {/* Alert Radius */}
              <div className="bg-white/10 rounded-xl px-4 py-3 mt-4 flex items-center justify-between">
                <p className="font-garamond text-xs text-white/60">Alert radius</p>
                <p className="font-playfair text-base text-white font-semibold">1 km</p>
              </div>
            </div>
          </div>

          {/* RECENT REVIEWS */}
          <div className="bg-sand rounded-3xl p-6">
            <h3 className="font-playfair text-lg text-charcoal font-semibold mb-5">
              Recent Reviews
            </h3>

            <div className="space-y-4">
              {recentReviews.map((review, idx) => (
                <div key={idx} className="bg-cream rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <p className="font-playfair text-sm text-charcoal font-semibold">
                        {review.tourist} {review.country}
                      </p>
                    </div>
                    <p className="font-garamond text-xs text-charcoal/40">
                      {review.date}
                    </p>
                  </div>
                  <p className="font-garamond text-sm text-saffron mb-2">
                    {"⭐".repeat(review.rating)}
                  </p>
                  <p className="font-garamond text-sm text-charcoal/70 italic leading-relaxed">
                    "{review.text}"
                  </p>
                </div>
              ))}
            </div>

            <div className="text-center mt-4">
              <p className="font-garamond text-xs text-saffron uppercase tracking-wider cursor-pointer hover:text-terracotta transition-colors">
                View all 127 reviews →
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
