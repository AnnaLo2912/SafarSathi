import { useState, useEffect } from 'react'
import { FiMapPin, FiShield } from 'react-icons/fi'

const resolvedAlerts = [
  {
    id: 2,
    tourist: "James W.",
    location: "City Palace",
    time: "Yesterday 3:45 PM",
    responseTime: "1m 12s",
    resolvedBy: "You"
  },
  {
    id: 3,
    tourist: "Yuki T.",
    location: "Hawa Mahal",
    time: "Mar 17, 11:20 AM",
    responseTime: "0m 58s",
    resolvedBy: "You"
  },
  {
    id: 4,
    tourist: "Emma R.",
    location: "Johari Bazaar",
    time: "Mar 15, 2:10 PM",
    responseTime: "1m 32s",
    resolvedBy: "You"
  }
]

export default function PanicAlerts() {
  const [alerts, setAlerts] = useState([
    {
      id: 1,
      tourist: "Sarah Mitchell",
      country: "🇺🇸 USA",
      avatar: "S",
      location: "Amber Fort, Jaipur",
      coords: "26.9855° N, 75.8513° E",
      distance: "250m",
      time: "2 mins ago",
      status: "active",
      phone: "+1 555 234 5678",
      message: "Feels unsafe near east gate",
      responded: false
    }
  ])

  const [activeAlert, setActiveAlert] = useState(null)
  const [responding, setResponding] = useState(false)
  const [responded, setResponded] = useState(false)
  const [flash, setFlash] = useState(true)

  // FLASH EFFECT
  useEffect(() => {
    if (alerts.some(a => a.status === 'active' && !a.responded)) {
      const interval = setInterval(() => {
        setFlash(f => !f)
      }, 800)
      return () => clearInterval(interval)
    }
  }, [alerts])

  function handleRespond(alertId) {
    setResponding(true)
    setTimeout(() => {
      setAlerts(prev => prev.map(a => 
        a.id === alertId 
          ? { ...a, responded: true } 
          : a
      ))
      setResponding(false)
      setResponded(true)
    }, 1500)
  }

  function dismissAlert(alertId) {
    setAlerts(prev => prev.map(a =>
      a.id === alertId
        ? { ...a, status: 'resolved' }
        : a
    ))
    setActiveAlert(null)
    setResponded(false)
  }

  const activeAlerts = alerts.filter(a => a.status === 'active')
  const hasActive = activeAlerts.length > 0

  return (
    <div className="page-fade-in">
      {/* HEADER ROW */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <p className="font-garamond text-xs uppercase tracking-widest text-terracotta mb-2">
            ✦ Emergency Response
          </p>
          <h1 className="font-playfair text-4xl text-charcoal font-bold">
            Panic Alerts
          </h1>
        </div>

        {/* Live Indicator */}
        <div className="bg-deepblue rounded-2xl px-5 py-3 flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-terracotta animate-pulse" />
          <div>
            <p className="font-playfair text-base text-white font-semibold">
              Monitoring Live
            </p>
            <p className="font-garamond text-xs text-white/50 mt-0.5">
              1km radius · 98ms response
            </p>
          </div>
        </div>
      </div>

      {/* ACTIVE ALERTS SECTION */}
      {hasActive ? (
        <>
          {/* FLASHING ALERT BANNER */}
          <div
            className={`transition-all duration-300 rounded-3xl p-6 mb-6 flex items-center justify-between flex-wrap gap-4 ${
              flash ? 'bg-terracotta' : 'bg-red-800'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-3xl animate-bounce">
                🚨
              </div>
              <div>
                <p className="font-playfair text-2xl text-white font-bold mb-1">
                  ACTIVE PANIC ALERT
                </p>
                <p className="font-garamond text-base text-white/80">
                  {activeAlerts.length} tourist{activeAlerts.length !== 1 ? 's' : ''} needs immediate help
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveAlert(activeAlerts[0])}
              className="bg-white text-terracotta font-garamond text-sm font-bold uppercase tracking-wider px-8 py-4 rounded-2xl hover:bg-cream transition-all duration-300"
            >
              Respond Now →
            </button>
          </div>

          {/* ALERT DETAIL CARD */}
          {activeAlert && (
            <div className="bg-deepblue rounded-3xl p-8 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* LEFT */}
                <div>
                  {/* Header */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-full bg-saffron flex items-center justify-center font-playfair text-2xl font-bold text-white">
                      {activeAlert.avatar}
                    </div>
                    <div>
                      <p className="font-playfair text-2xl text-white font-bold">
                        {activeAlert.tourist}
                      </p>
                      <p className="font-garamond text-sm text-white/60 mt-1">
                        {activeAlert.country} · {activeAlert.phone}
                      </p>
                    </div>
                  </div>

                  {/* Info Rows */}
                  <div className="space-y-4">
                    {/* Location */}
                    <div className="flex items-start gap-3">
                      <FiMapPin size={18} className="mt-1" />
                      <div>
                        <p className="font-garamond text-xs text-white/40 uppercase tracking-wider mb-0.5">
                          Location
                        </p>
                        <p className="font-garamond text-sm text-white/80">
                          {activeAlert.location}
                        </p>
                      </div>
                    </div>

                    {/* Coordinates */}
                    <div className="flex items-start gap-3">
                      <span className="text-lg mt-1">🌐</span>
                      <div>
                        <p className="font-garamond text-xs text-white/40 uppercase tracking-wider mb-0.5">
                          Coordinates
                        </p>
                        <p className="font-garamond text-sm text-white/80">
                          {activeAlert.coords}
                        </p>
                      </div>
                    </div>

                    {/* Distance */}
                    <div className="flex items-start gap-3">
                      <span className="text-lg mt-1">📏</span>
                      <div>
                        <p className="font-garamond text-xs text-white/40 uppercase tracking-wider mb-0.5">
                          Distance from you
                        </p>
                        <p className="font-garamond text-sm text-white/80">
                          {activeAlert.distance}
                        </p>
                      </div>
                    </div>

                    {/* Time */}
                    <div className="flex items-start gap-3">
                      <span className="text-lg mt-1">⏱️</span>
                      <div>
                        <p className="font-garamond text-xs text-white/40 uppercase tracking-wider mb-0.5">
                          Alert sent
                        </p>
                        <p className="font-garamond text-sm text-white/80">
                          {activeAlert.time}
                        </p>
                      </div>
                    </div>

                    {/* Message */}
                    <div className="flex items-start gap-3">
                      <span className="text-lg mt-1">💬</span>
                      <div>
                        <p className="font-garamond text-xs text-white/40 uppercase tracking-wider mb-0.5">
                          Message
                        </p>
                        <p className="font-garamond text-sm text-white/80">
                          {activeAlert.message}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* RIGHT */}
                <div className="bg-white/10 rounded-2xl p-6">
                  {!responded ? (
                    <>
                      <p className="font-playfair text-xl text-white font-semibold mb-2">
                        Respond to Alert
                      </p>
                      <p className="font-garamond text-sm text-white/60 mb-6">
                        Confirming response will notify the tourist that help is coming
                        and share your live location.
                      </p>

                      <button
                        onClick={() => handleRespond(activeAlert.id)}
                        disabled={responding}
                        className="w-full mb-3 bg-terracotta text-white font-garamond text-base uppercase tracking-widest py-5 rounded-2xl hover:bg-red-600 transition-all duration-300 disabled:opacity-50"
                      >
                        {responding ? "Notifying tourist..." : "🚨 I'm Responding"}
                      </button>

                      <button className="w-full border-2 border-white/30 text-white font-garamond text-sm uppercase tracking-wider py-4 rounded-2xl hover:bg-white/10 transition-all duration-300">
                        📞 Call {activeAlert.tourist.split(' ')[0]}
                      </button>
                    </>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-5xl mb-4">✅</p>
                      <p className="font-playfair text-xl text-white font-bold mb-2">
                        Tourist Notified!
                      </p>
                      <p className="font-garamond text-sm text-white/70 mb-6">
                        {activeAlert.tourist.split(' ')[0]} knows you're on your way.
                        Your location is being shared live.
                      </p>

                      <div className="bg-white/10 rounded-xl px-4 py-3 mb-6 flex items-center justify-between">
                        <p className="font-garamond text-sm text-white/60">
                          Estimated arrival
                        </p>
                        <p className="font-playfair text-lg text-white font-bold">
                          ~3 minutes
                        </p>
                      </div>

                      <button
                        onClick={() => dismissAlert(activeAlert.id)}
                        className="w-full bg-green-500 text-white font-garamond text-sm uppercase tracking-widest py-4 rounded-2xl hover:bg-green-600 transition-all duration-300"
                      >
                        ✓ Mark as Resolved
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        /* ALL CLEAR STATE */
        <div className="bg-sand rounded-3xl p-12 text-center mb-6">
          <div className="text-6xl mb-4 flex justify-center">
            <FiShield size={60} />
          </div>
          <p className="font-playfair text-3xl text-charcoal font-bold mb-3">
            All Clear
          </p>
          <p className="font-garamond text-lg text-charcoal/60 max-w-md mx-auto mb-6">
            No active panic alerts in your area. You'll receive an instant notification
            if a tourist needs help.
          </p>

          <div className="flex justify-center gap-8 flex-wrap mt-6">
            {/* Stat 1 */}
            <div className="bg-cream rounded-2xl px-6 py-4 text-center">
              <p className="font-playfair text-2xl text-charcoal font-bold">
                98ms
              </p>
              <p className="font-garamond text-xs text-charcoal/50 uppercase tracking-wider mt-1">
                Avg Response
              </p>
            </div>

            {/* Stat 2 */}
            <div className="bg-cream rounded-2xl px-6 py-4 text-center">
              <p className="font-playfair text-2xl text-charcoal font-bold">
                1km
              </p>
              <p className="font-garamond text-xs text-charcoal/50 uppercase tracking-wider mt-1">
                Alert Radius
              </p>
            </div>

            {/* Stat 3 */}
            <div className="bg-cream rounded-2xl px-6 py-4 text-center">
              <p className="font-playfair text-2xl text-charcoal font-bold">
                100%
              </p>
              <p className="font-garamond text-xs text-charcoal/50 uppercase tracking-wider mt-1">
                Resolution Rate
              </p>
            </div>
          </div>
        </div>
      )}

      {/* RESOLVED ALERTS HISTORY */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-playfair text-2xl text-charcoal font-bold">
            Alert History
          </h2>
          <p className="font-garamond text-xs text-charcoal/40 uppercase tracking-wider">
            Last 30 days
          </p>
        </div>

        {/* Table */}
        <div className="bg-sand rounded-3xl overflow-hidden">
          {/* Header */}
          <div className="bg-cream px-6 py-4 grid grid-cols-4 gap-4">
            <p className="font-garamond text-xs uppercase tracking-widest text-charcoal/40">
              Tourist
            </p>
            <p className="font-garamond text-xs uppercase tracking-widest text-charcoal/40">
              Location
            </p>
            <p className="font-garamond text-xs uppercase tracking-widest text-charcoal/40">
              Response Time
            </p>
            <p className="font-garamond text-xs uppercase tracking-widest text-charcoal/40">
              Time
            </p>
          </div>

          {/* Rows */}
          {resolvedAlerts.map((alert, idx) => (
            <div
              key={alert.id}
              className={`grid grid-cols-4 gap-4 px-6 py-4 ${
                idx !== resolvedAlerts.length - 1 ? 'border-b border-sand' : ''
              }`}
            >
              <div className="font-garamond text-sm text-charcoal font-semibold">
                {alert.tourist}
              </div>
              <div className="font-garamond text-sm text-charcoal/70">
                {alert.location}
              </div>
              <div className="font-garamond text-sm text-green-600 font-semibold">
                {alert.responseTime}
              </div>
              <div className="font-garamond text-sm text-charcoal/50">
                {alert.time}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
