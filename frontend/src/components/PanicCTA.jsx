import { useState } from 'react'
import { FiAlertCircle } from 'react-icons/fi'

export default function PanicCTA() {
  const [triggered, setTriggered] = useState(false)

  const handlePanicDemo = () => {
    setTriggered(true)
    setTimeout(() => setTriggered(false), 3000)
  }

  return (
    <section className="bg-deepblue py-24 px-6 overflow-hidden relative">
      {/* Radial Gradient Overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 20% 50%, rgba(200,75,49,0.15) 0%, transparent 60%)',
        }}
      />

      {/* Inner Layout */}
      <div className="max-w-6xl mx-auto relative z-10 flex flex-col lg:flex-row items-center gap-16">
        {/* LEFT SIDE */}
        <div className="flex-1">
          {/* Overline */}
          <p className="font-garamond text-xs uppercase tracking-widest text-terracotta/80 mb-4">
            ✦ Safety First
          </p>

          {/* Headline */}
          <h2 className="font-playfair text-5xl md:text-6xl text-cream font-bold italic leading-tight mb-0">
            In an emergency,
          </h2>
          <h2 className="font-playfair text-5xl md:text-6xl text-saffron font-bold italic leading-tight mb-8">
            help is 98ms away.
          </h2>

          {/* Divider */}
          <div className="w-16 h-0.5 bg-saffron my-8" />

          {/* Description */}
          <p className="font-garamond text-xl text-cream leading-relaxed max-w-lg mb-10">
            Triple-press your power button. Your GPS broadcasts to every
            verified guide within 1km. No login required. No delay. No
            exceptions.
          </p>

          {/* Stat Pills */}
          <div className="flex flex-wrap gap-4 mb-10">
            <div className="border border-white/50 rounded-full px-5 py-2 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <p className="font-garamond text-cream text-sm">
                98ms Response
              </p>
            </div>
            <div className="border border-white/50 rounded-full px-5 py-2 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-saffron" />
              <p className="font-garamond text-cream text-sm">
                1km Radius Alert
              </p>
            </div>
            <div className="border border-white/50 rounded-full px-5 py-2 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-terracotta" />
              <p className="font-garamond text-cream text-sm">
                No Login Needed
              </p>
            </div>
          </div>

          {/* Panic Demo Button */}
          <div className="inline-block relative">
            {/* Pulsing rings - only show when not triggered */}
            {!triggered && (
              <>
                <div className="absolute inset-0 rounded-none bg-terracotta/30 animate-ping" />
                <div
                  className="absolute -inset-2 rounded-none bg-terracotta/20 animate-ping"
                  style={{ animationDelay: '300ms' }}
                />
              </>
            )}

            {/* Button */}
            <button
              onClick={handlePanicDemo}
              className={`relative z-10 font-garamond text-lg uppercase tracking-widest px-12 py-5 rounded-full transition-all duration-300 cursor-pointer border-2 shadow-2xl flex items-center gap-2 ${
                triggered
                  ? 'bg-green-600 border-green-600 text-white'
                  : 'bg-black border-black text-white hover:bg-gray-900 hover:shadow-xl'
              }`}
            >
              {triggered ? '✓ Demo Alert Sent!' : <><FiAlertCircle size={24} /> Test Panic Demo</>}
            </button>
          </div>

          {/* Toast Notification */}
          {triggered && (
            <p className="font-garamond text-sm text-green-400/90 mt-4">
              Demo sent! In real use, 3 nearby guides would be notified
              instantly.
            </p>
          )}
        </div>

        {/* RIGHT SIDE */}
        <div className="flex-1 flex justify-center">
          {/* Mock Phone Alert Card */}
          <div className="bg-cream rounded-3xl shadow-2xl overflow-hidden w-72 border-4 border-white/10">
            {/* Red Alert Header */}
            <div className="bg-terracotta px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FiAlertCircle size={20} />
                <p className="font-playfair text-white text-lg font-bold">ALERT SENT</p>
              </div>
              <div className="w-3 h-3 rounded-full bg-white animate-pulse" />
            </div>

            {/* Card Body */}
            <div className="px-6 py-6 bg-cream">
              {/* Guide Info */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-saffron flex items-center justify-center text-white font-playfair font-bold text-lg">
                  R
                </div>
                <div>
                  <p className="font-playfair text-charcoal font-semibold text-base">
                    Rajesh Kumar
                  </p>
                  <p className="font-garamond text-charcoal/60 text-xs">
                    ⭐ 4.9 · Licensed Guide
                  </p>
                </div>
              </div>

              {/* Distance Badge */}
              <div className="bg-green-100 text-green-700 font-garamond text-sm px-4 py-2 rounded-full inline-flex items-center gap-2 mb-4">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span>250m away — responding now</span>
              </div>

              {/* Message Box */}
              <div className="bg-sand rounded-xl px-4 py-3 mb-4">
                <p className="font-garamond text-charcoal text-sm leading-relaxed">
                  I see your location. Stay where you are, I'm coming to you.
                  Call 112 if urgent.
                </p>
              </div>

              {/* Bottom Bar */}
              <div className="flex justify-between items-center pt-4 border-t border-sand">
                <div className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  LIVE
                </div>
                <button className="border border-terracotta text-terracotta font-garamond text-xs px-3 py-1 rounded-full hover:bg-terracotta hover:text-white transition-colors">
                  112 India
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
