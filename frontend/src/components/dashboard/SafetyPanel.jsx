import { useState, useEffect } from 'react'

export default function SafetyPanel() {
  const [panicActive, setPanicActive] = useState(false)
  const [panicSent, setPanicSent] = useState(false)
  const [countdown, setCountdown] = useState(3)
  const [location, setLocation] = useState(null)
  const [locationError, setLocationError] = useState('')
  const [batteryLevel, setBatteryLevel] = useState(87)
  const [networkStatus, setNetworkStatus] = useState('WiFi')

  // Get GPS location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) =>
          setLocation({
            lat: pos.coords.latitude.toFixed(4),
            lng: pos.coords.longitude.toFixed(4),
            accuracy: pos.coords.accuracy.toFixed(0)
          }),
        () => setLocationError('Location access denied')
      )
    }
  }, [])

  // Network status
  useEffect(() => {
    const update = () => setNetworkStatus(navigator.onLine ? 'Online' : 'Offline')
    window.addEventListener('online', update)
    window.addEventListener('offline', update)
    return () => {
      window.removeEventListener('online', update)
      window.removeEventListener('offline', update)
    }
  }, [])

  // Panic countdown logic
  useEffect(() => {
    if (!panicActive) return
    if (countdown === 0) {
      setPanicSent(true)
      setPanicActive(false)
      setCountdown(3)
      return
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [panicActive, countdown])

  function triggerPanic() {
    setPanicActive(true)
    setCountdown(3)
  }

  function cancelPanic() {
    setPanicActive(false)
    setCountdown(3)
  }

  function resetPanic() {
    setPanicSent(false)
  }

  const nearbyGuides = [
    {
      name: 'Rajesh Kumar',
      distance: '250m',
      rating: '4.9',
      status: 'available',
      avatar: 'R',
      avatarBg: 'bg-saffron',
      responseTime: '~2 min'
    },
    {
      name: 'Priya Nair',
      distance: '480m',
      rating: '4.8',
      status: 'available',
      avatar: 'P',
      avatarBg: 'bg-deepblue',
      responseTime: '~4 min'
    },
    {
      name: 'Arjun Sharma',
      distance: '1.1km',
      rating: '5.0',
      status: 'on-trip',
      avatar: 'A',
      avatarBg: 'bg-terracotta',
      responseTime: '~8 min'
    }
  ]

  return (
    <div className="page-fade-in">
      {/* SECTION HEADER */}
      <div className="mb-10">
        <div className="font-garamond text-xs uppercase tracking-widest text-terracotta mb-2">
          ✦ Your Safety Hub
        </div>
        <h1 className="font-playfair text-4xl text-charcoal font-bold mb-1">
          Always protected,
        </h1>
        <h1 className="font-playfair text-4xl text-saffron italic font-bold">
          wherever you go.
        </h1>
      </div>

      {/* TWO COLUMN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* LEFT COLUMN */}
        <div>
          {/* STATUS BAR CARD */}
          <div className="bg-sand rounded-3xl p-6 mb-6">
            <h2 className="font-playfair text-lg text-charcoal font-semibold mb-4">
              Live Status
            </h2>

            <div className="space-y-3">
              {/* GPS Row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-cream flex items-center justify-center text-sm">
                    📍
                  </div>
                  <span className="font-garamond text-sm text-charcoal/70">
                    GPS Location
                  </span>
                </div>
                <div>
                  {location ? (
                    <div className="bg-green-100 text-green-700 font-garamond text-xs px-3 py-1 rounded-full flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                      <span>
                        {location.lat}, {location.lng}
                      </span>
                    </div>
                  ) : locationError ? (
                    <div className="bg-red-100 text-red-600 font-garamond text-xs px-3 py-1 rounded-full">
                      Access Denied
                    </div>
                  ) : (
                    <div className="bg-amber-100 text-amber-700 font-garamond text-xs px-3 py-1 rounded-full animate-pulse">
                      Locating...
                    </div>
                  )}
                </div>
              </div>

              {/* Network Row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-cream flex items-center justify-center text-sm">
                    📶
                  </div>
                  <span className="font-garamond text-sm text-charcoal/70">
                    Network
                  </span>
                </div>
                <div className="bg-green-100 text-green-700 font-garamond text-xs px-3 py-1 rounded-full">
                  {networkStatus}
                </div>
              </div>

              {/* Battery Row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-cream flex items-center justify-center text-sm">
                    🔋
                  </div>
                  <span className="font-garamond text-sm text-charcoal/70">
                    Battery
                  </span>
                </div>
                <div
                  className={`font-garamond text-xs px-3 py-1 rounded-full ${
                    batteryLevel > 50
                      ? 'bg-green-100 text-green-700'
                      : batteryLevel > 20
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-red-100 text-red-600'
                  }`}
                >
                  {batteryLevel}%
                </div>
              </div>
            </div>
          </div>

          {/* SAFETY SCORE CARD */}
          <div className="bg-sand rounded-3xl p-6 mb-6 flex items-center justify-between">
            <div>
              <div className="font-garamond text-xs uppercase tracking-widest text-charcoal/50 mb-1">
                AI Safety Score
              </div>
              <div className="font-playfair text-5xl text-charcoal font-bold">92</div>
              <div className="font-garamond text-sm text-charcoal/50">
                / 100 — Low Risk Area
              </div>
            </div>

            <div className="relative">
              <div className="w-20 h-20 rounded-full border-4 border-green-400 flex items-center justify-center bg-green-50 relative">
                <span className="text-3xl">🛡️</span>
                <div className="absolute inset-0 rounded-full border-2 border-green-300 animate-ping opacity-30"></div>
              </div>

              <div className="flex gap-2 mt-4 flex-wrap justify-center absolute top-full left-0 right-0 mt-4 min-w-max">
                <div className="bg-cream font-garamond text-xs text-charcoal/60 px-3 py-1 rounded-full border border-sand whitespace-nowrap">
                  ✓ Safe Zone
                </div>
                <div className="bg-cream font-garamond text-xs text-charcoal/60 px-3 py-1 rounded-full border border-sand whitespace-nowrap">
                  ✓ Guide Nearby
                </div>
                <div className="bg-cream font-garamond text-xs text-charcoal/60 px-3 py-1 rounded-full border border-sand whitespace-nowrap">
                  ✓ GPS Active
                </div>
              </div>
            </div>
          </div>

          {/* EMERGENCY CONTACTS CARD */}
          <div className="bg-sand rounded-3xl p-6">
            <h2 className="font-playfair text-lg text-charcoal font-semibold mb-4">
              Emergency Contacts
            </h2>

            <div className="space-y-3">
              {/* Contact 1 */}
              <div className="flex items-center justify-between bg-cream rounded-xl px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="text-lg">🚨</span>
                  <div>
                    <div className="font-playfair text-sm text-charcoal font-semibold">
                      India Emergency
                    </div>
                    <div className="font-garamond text-xs text-charcoal/50">
                      Police / Fire / Medical
                    </div>
                  </div>
                </div>
                <div className="font-playfair text-lg text-saffron font-bold">112</div>
              </div>

              {/* Contact 2 */}
              <div className="flex items-center justify-between bg-cream rounded-xl px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="text-lg">🏥</span>
                  <div>
                    <div className="font-playfair text-sm text-charcoal font-semibold">
                      Ambulance
                    </div>
                    <div className="font-garamond text-xs text-charcoal/50">
                      24hr Response
                    </div>
                  </div>
                </div>
                <div className="font-playfair text-lg text-saffron font-bold">108</div>
              </div>

              {/* Contact 3 */}
              <div className="flex items-center justify-between bg-cream rounded-xl px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="text-lg">👮</span>
                  <div>
                    <div className="font-playfair text-sm text-charcoal font-semibold">
                      Police
                    </div>
                    <div className="font-garamond text-xs text-charcoal/50">
                      Non-emergency
                    </div>
                  </div>
                </div>
                <div className="font-playfair text-lg text-saffron font-bold">100</div>
              </div>

              {/* Add Contact Button */}
              <button className="w-full mt-4 border-2 border-dashed border-sand text-charcoal/40 font-garamond text-sm py-3 rounded-xl hover:border-saffron hover:text-saffron transition-all duration-300 text-center cursor-pointer">
                + Add personal emergency contact
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div>
          {/* PANIC BUTTON SECTION */}

          {/* STATE 1: Normal */}
          {!panicSent && !panicActive && (
            <div className="bg-sand rounded-3xl p-8 text-center mb-6 relative overflow-hidden border-2 border-terracotta/20">
              <div className="relative z-10">
                <div className="font-garamond text-xs uppercase tracking-widest text-terracotta mb-4">
                  Panic Button
                </div>

                <div className="font-garamond text-sm text-charcoal/70 mb-8 max-w-xs mx-auto">
                  Press and hold for 3 seconds to send your GPS to all nearby guides and
                  emergency contacts.
                </div>

                {/* THE BIG BUTTON */}
                <div className="relative w-48 h-48 mx-auto mb-8">
                  <div className="absolute inset-0 rounded-full bg-terracotta/20 animate-ping"></div>
                  <div
                    className="absolute inset-4 rounded-full bg-terracotta/15 animate-ping"
                    style={{ animationDelay: '500ms' }}
                  ></div>

                  <button
                    onClick={triggerPanic}
                    className="relative w-48 h-48 rounded-full bg-terracotta flex flex-col items-center justify-center cursor-pointer shadow-2xl hover:bg-red-600 active:scale-95 transition-all duration-150 border-4 border-red-400/50"
                  >
                    <div className="text-4xl mb-2 font-bold text-white">!</div>
                    <span className="font-playfair text-2xl font-bold text-white">SOS</span>
                    <span className="font-garamond text-xs text-white/80 uppercase tracking-widest">
                      PANIC
                    </span>
                  </button>
                </div>

                <div className="font-garamond text-xs text-charcoal/50 mb-6">
                  Also works with triple power button press
                </div>

                <div className="bg-cream rounded-xl px-4 py-3 font-garamond text-xs text-charcoal/60 text-center border border-sand">
                  Install SafarSathi as an app for power button panic detection
                </div>
              </div>
            </div>
          )}

          {/* STATE 2: Counting Down */}
          {!panicSent && panicActive && (
            <div className="bg-sand rounded-3xl p-8 text-center mb-6 border-2 border-terracotta/20">
              <div className="font-garamond text-sm text-charcoal/70 mb-4 uppercase tracking-widest">
                Sending Alert In...
              </div>

              <div className="font-playfair text-9xl text-terracotta font-bold animate-pulse">
                {countdown}
              </div>

              <div className="font-garamond text-base text-charcoal/60 mb-8">
                Broadcasting your GPS location to 3 nearby guides
              </div>

              <button
                onClick={cancelPanic}
                className="border-2 border-charcoal/20 text-charcoal font-garamond text-sm uppercase tracking-wider px-10 py-4 rounded-full hover:bg-charcoal/5 transition-all duration-300 cursor-pointer"
              >
                X Cancel
              </button>
            </div>
          )}

          {/* STATE 3: Alert Sent */}
          {panicSent && (
            <div className="bg-sand rounded-3xl p-8 text-center mb-6 border-2 border-green-400/30">
              <div className="text-6xl mb-4">✓</div>

              <h2 className="font-playfair text-3xl text-charcoal font-bold mb-2">Alert Sent!</h2>

              <p className="font-garamond text-base text-charcoal/70 mb-6">
                3 guides notified. Help is on the way.
              </p>

              {/* Response Card */}
              <div className="bg-cream rounded-2xl p-4 mb-6 flex items-center gap-4 text-left border border-green-400/20">
                <div className="w-12 h-12 rounded-full bg-saffron flex items-center justify-center font-playfair font-bold text-white text-lg shrink-0">
                  R
                </div>
                <div>
                  <div className="font-playfair text-charcoal font-semibold">Rajesh Kumar</div>
                  <div className="flex items-center gap-1 mt-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></div>
                    <span className="font-garamond text-xs text-green-600">
                      Responding — 250m away
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={resetPanic}
                className="border border-charcoal/20 text-charcoal/70 font-garamond text-xs uppercase tracking-wider px-6 py-3 rounded-full hover:bg-charcoal/5 transition-all cursor-pointer"
              >
                Clear Alert
              </button>
            </div>
          )}

          {/* NEARBY GUIDES CARD */}
          <div className="bg-sand rounded-3xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-playfair text-lg text-charcoal font-semibold">
                Nearby Verified Guides
              </h2>
              <div className="bg-green-100 text-green-700 font-garamond text-xs px-3 py-1 rounded-full flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                <span>Live</span>
              </div>
            </div>

            <div className="space-y-3">
              {nearbyGuides.map((guide, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between bg-cream rounded-2xl px-4 py-4 border border-sand"
                >
                  {/* Left: Avatar + Info */}
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-playfair font-bold ${guide.avatarBg}`}
                    >
                      {guide.avatar}
                    </div>
                    <div>
                      <div className="font-playfair text-sm text-charcoal font-semibold">
                        {guide.name}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="font-garamond text-xs text-charcoal/50">
                          📍 {guide.distance}
                        </span>
                        <span className="font-garamond text-xs text-charcoal/50">·</span>
                        <span className="font-garamond text-xs text-charcoal/50">
                          ⭐ {guide.rating}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Status + Response Time */}
                  <div className="flex flex-col items-end gap-1">
                    <div
                      className={`font-garamond text-xs px-2 py-0.5 rounded-full ${
                        guide.status === 'available'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      ● {guide.status === 'available' ? 'Available' : 'On Trip'}
                    </div>
                    <span className="font-garamond text-xs text-charcoal/40">
                      {guide.responseTime}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
