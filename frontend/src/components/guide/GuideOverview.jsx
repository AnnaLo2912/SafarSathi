import { useState } from 'react'
import { FiDollarSign, FiPackage, FiMapPin, FiShield, FiZap, FiClock, FiMessageCircle, FiCalendar, FiTrendingUp } from 'react-icons/fi'

const stats = [
  {
    label: "Earnings",
    value: "₹6,000",
    sub: "This week",
    icon: <FiDollarSign size={20} />,
    color: "text-saffron"
  },
  {
    label: "Active Tourists",
    value: "3",
    sub: "On trip now",
    icon: <FiPackage size={20} />,
    color: "text-deepblue"
  },
  {
    label: "Response Time",
    value: "98ms",
    sub: "Avg. response",
    icon: <FiZap size={20} />,
    color: "text-terracotta"
  },
  {
    label: "Rating",
    value: "4.9",
    sub: "From 127 reviews",
    icon: <FiTrendingUp size={20} />,
    color: "text-green-600"
  }
]

const upcomingBookings = [
  {
    id: 1,
    tourist: "Sarah Mitchell",
    country: "USA",
    avatar: "S",
    avatarBg: "bg-saffron",
    date: "Today",
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
    country: "UK",
    avatar: "J",
    avatarBg: "bg-deepblue",
    date: "Tomorrow",
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
    country: "Japan",
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
    rating: 5,
    text: "Absolutely wonderful! Knowledge of history is unmatched."
  },
  {
    tourist: "Carlos M.",
    rating: 5,
    text: "Best guide experience. Hidden gems we'd never find alone."
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

export default function GuideOverview({ available, setAvailable }) {
  const nextBooking = upcomingBookings[0]

  return (
    <div className="page-fade-in">
      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* 1. HEADER */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <div className="flex items-center justify-between mb-12 gap-6 flex-wrap">
        <div>
          <p className="font-garamond text-xs uppercase tracking-widest text-rain mb-2">
            Guide Control Center
          </p>
          <h1 className="font-playfair text-3xl text-charcoal font-bold">
            Good morning, Rajesh
          </h1>
        </div>

        {/* Online/Offline Toggle */}
        <div className="flex items-center gap-4 bg-cream border border-coral rounded-2xl px-5 py-3 shadow-sm">
          <div>
            <p className="font-garamond text-xs uppercase tracking-wider text-charcoal/70">
              Status
            </p>
            <p className="font-playfair text-base font-semibold text-charcoal mt-0.5">
              {available ? "🟢 Online" : "⚪ Offline"}
            </p>
          </div>
          <button
            onClick={() => setAvailable(!available)}
            className={`w-12 h-6 rounded-full relative transition-all duration-300 shrink-0 ${
              available ? "bg-green-500" : "bg-charcoal/20"
            }`}
          >
            <div
              className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-md transition-all duration-300 ${
                available ? "left-7" : "left-1"
              }`}
            />
          </button>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* 2. PRIMARY ACTION PANEL - NEXT BOOKING (MOST IMPORTANT) */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <div className="bg-cream border-2 border-coral rounded-2xl p-6 mb-8 shadow-md">
        <p className="font-garamond text-xs uppercase tracking-widest text-coral mb-3">
          ▸ Next Booking
        </p>

        {nextBooking ? (
          <div className="space-y-4">
            {/* Tourist & Location */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-playfair text-xl text-charcoal font-bold">
                  {nextBooking.tourist}
                </p>
                <p className="font-garamond text-sm text-charcoal/60 mt-0.5">
                  {nextBooking.country}
                </p>
              </div>
              <span className={`font-garamond text-xs px-3 py-1.5 rounded-full whitespace-nowrap shrink-0 ${nextBooking.statusColor}`}>
                ✓ Confirmed
              </span>
            </div>

            {/* Location & Time */}
            <div className="bg-cream rounded-xl p-3 space-y-2">
              <div className="flex items-start gap-3">
                <FiMapPin size={16} className="text-coral mt-0.5 shrink-0" />
                <div>
                  <p className="font-garamond text-xs text-charcoal/50 uppercase tracking-wider">
                    Location
                  </p>
                  <p className="font-playfair text-sm text-charcoal font-semibold mt-0.5">
                    {nextBooking.location}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <FiClock size={16} className="text-coral mt-0.5 shrink-0" />
                <div>
                  <p className="font-garamond text-xs text-charcoal/50 uppercase tracking-wider">
                    Time
                  </p>
                  <p className="font-playfair text-sm text-charcoal font-semibold mt-0.5">
                    {nextBooking.date} at {nextBooking.time}
                  </p>
                </div>
              </div>
            </div>

            {/* Amount & Duration */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-cream rounded-xl p-3 text-center">
                <p className="font-garamond text-xs text-charcoal/50 uppercase tracking-wider mb-1">
                  Duration
                </p>
                <p className="font-playfair text-base text-charcoal font-bold">
                  {nextBooking.duration}
                </p>
              </div>
              <div className="bg-cream rounded-xl p-3 text-center">
                <p className="font-garamond text-xs text-charcoal/50 uppercase tracking-wider mb-1">
                  Amount
                </p>
                <p className="font-playfair text-base text-charcoal font-bold text-saffron">
                  {nextBooking.amount}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button className="bg-coral text-white font-garamond text-xs font-semibold py-2.5 rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center gap-2">
                <FiMessageCircle size={14} /> Chat
              </button>
              <button className="border border-coral text-coral font-garamond text-xs font-semibold py-2.5 rounded-lg hover:bg-coral/5 transition-colors flex items-center justify-center gap-2">
                <FiMapPin size={14} /> Route
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="font-garamond text-charcoal/60">No upcoming bookings</p>
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* 3. KEY STATS ROW - 4 Equal Cards */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-cream border border-coral rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className={`${stat.color} mb-4`}>{stat.icon}</div>
            <p className="font-garamond text-xs uppercase tracking-wider text-charcoal/60 mb-2">
              {stat.label}
            </p>
            <p className="font-playfair text-2xl text-charcoal font-bold mb-1">
              {stat.value}
            </p>
            <p className="font-garamond text-xs text-charcoal/50">
              {stat.sub}
            </p>
          </div>
        ))}
      </div>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* 4. MAIN CONTENT - 2 Column Layout (70% / 30%) */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN - 70% */}
        <div className="lg:col-span-2 space-y-10">
          {/* UPCOMING BOOKINGS */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-playfair text-2xl text-charcoal font-bold">
                All Bookings
              </h2>
              <span className="font-garamond text-xs text-charcoal/50 bg-cream px-3 py-1.5 rounded-full">
                {upcomingBookings.length} total
              </span>
            </div>

            <div className="space-y-4">
              {upcomingBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="bg-cream border border-coral rounded-2xl p-5 hover:border-coral/80 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    {/* Avatar & Tourist Info */}
                    <div className="flex items-start gap-4 flex-1">
                      <div
                        className={`w-12 h-12 rounded-full shrink-0 flex items-center justify-center text-white font-playfair font-bold text-lg ${booking.avatarBg}`}
                      >
                        {booking.avatar}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-playfair text-base text-charcoal font-semibold">
                            {booking.tourist}
                          </p>
                          <p className="font-garamond text-xs text-charcoal/50">
                            ({booking.country})
                          </p>
                        </div>

                        <p className="font-garamond text-sm text-charcoal/70 mb-2 flex items-center gap-2">
                          <FiMapPin size={14} className="text-charcoal/50" />
                          {booking.location}
                        </p>

                        <div className="flex items-center gap-3 text-xs text-charcoal/60 font-garamond">
                          <span>{booking.date}</span>
                          <span className="text-charcoal/30">·</span>
                          <span>{booking.time}</span>
                          <span className="text-charcoal/30">·</span>
                          <span>{booking.duration}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Amount & Status */}
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <p className="font-playfair text-lg text-charcoal font-bold">
                        {booking.amount}
                      </p>
                      <span className={`font-garamond text-xs px-2.5 py-1.5 rounded-lg whitespace-nowrap ${booking.statusColor}`}>
                        {booking.status === "confirmed" ? "Confirmed" : "Pending"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN - 30% (SIDEBAR) */}
        <div className="lg:col-span-1 space-y-6">
          {/* ALERTS CARD */}
          <div className="bg-cream border border-coral rounded-2xl p-6 shadow-sm">
            <h3 className="font-playfair text-lg text-charcoal font-bold mb-4">
              Safety Status
            </h3>

            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
              <div className="flex justify-center mb-3">
                <FiShield size={32} className="text-green-600" />
              </div>
              <p className="font-playfair text-base text-charcoal font-semibold mb-1">
                All Clear
              </p>
              <p className="font-garamond text-xs text-charcoal/60">
                No panic alerts in your area
              </p>
            </div>

            <div className="mt-4 bg-white rounded-xl p-3 flex items-center justify-between">
              <p className="font-garamond text-xs text-charcoal/60">Alert Radius</p>
              <p className="font-playfair font-semibold text-charcoal">1 km</p>
            </div>
          </div>

          {/* RECENT REVIEWS */}
          <div className="bg-cream border border-coral rounded-2xl p-6 shadow-sm">
            <h3 className="font-playfair text-lg text-charcoal font-bold mb-4">
              Recent Reviews
            </h3>

            <div className="space-y-4">
              {recentReviews.map((review, idx) => (
                <div key={idx} className="bg-white rounded-xl p-4">
                  <div className="flex items-start justify-between mb-2">
                    <p className="font-playfair text-sm text-charcoal font-semibold">
                      {review.tourist}
                    </p>
                    <p className="text-xs text-saffron">
                      {"⭐".repeat(review.rating)}
                    </p>
                  </div>
                  <p className="font-garamond text-xs text-charcoal/70 leading-relaxed">
                    "{review.text}"
                  </p>
                </div>
              ))}
            </div>

            <button className="w-full mt-4 font-garamond text-xs text-coral hover:text-coral/80 transition-colors uppercase tracking-wider font-semibold">
              View all 127 →
            </button>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* 5. QUICK ACTIONS - Bottom */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <div className="mt-16 pt-10 border-t border-coral">
        <h3 className="font-playfair text-lg text-charcoal font-bold mb-6">
          Quick Actions
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: <FiCalendar size={24} />, label: "Calendar" },
            { icon: <FiMessageCircle size={24} />, label: "Messages" },
            { icon: <FiMapPin size={24} />, label: "Tourist Map" },
            { icon: <FiDollarSign size={24} />, label: "Earnings" }
          ].map((action, idx) => (
            <button
              key={idx}
              className="bg-cream border border-coral rounded-2xl p-5 text-center hover:bg-coral hover:text-white hover:shadow-md transition-all group"
            >
              <div className="flex justify-center mb-3 text-coral group-hover:text-white transition-colors">
                {action.icon}
              </div>
              <p className="font-garamond text-xs uppercase tracking-wider text-charcoal group-hover:text-white transition-colors">
                {action.label}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
