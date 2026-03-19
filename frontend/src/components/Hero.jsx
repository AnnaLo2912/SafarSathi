export default function Hero() {
  return (
    <section className="relative w-full h-screen overflow-hidden pt-20">
      {/* Background Image */}
      <img
        src="https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=1600&q=80"
        alt="Taj Mahal India"
        className="absolute inset-0 w-full h-full object-cover object-center"
      />

      {/* Dark Gradient Overlay */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)',
        }}
      />

      {/* Badge - Top Left */}
      <div className="absolute top-28 left-8 md:left-20">
        <div className="bg-cream/90 text-charcoal text-xs font-garamond uppercase tracking-widest px-4 py-2 rounded-full">
          ✦ AI-Powered Safety Platform
        </div>
      </div>

      {/* Content Layer */}
      <div className="absolute inset-0 flex flex-col justify-end pb-20 px-8 md:px-20 max-w-7xl mx-auto">
        {/* Main Headline */}
        <div>
          <h1 className="font-playfair text-6xl md:text-8xl text-white italic font-bold leading-none">
            Explore India,
          </h1>
          <h1 className="font-playfair text-6xl md:text-8xl text-saffron italic font-bold leading-none mb-2">
            Fearlessly.
          </h1>
        </div>

        {/* Subtext */}
        <p className="font-garamond text-lg md:text-xl text-white/80 max-w-xl mt-6 mb-10">
          AI trip planning + 98ms panic alerts. Your verified guide network
          across India — always within reach.
        </p>

        {/* CTA Buttons */}
        <div className="flex gap-4">
          <button className="bg-saffron text-charcoal font-garamond text-base uppercase tracking-wider px-8 py-4 hover:bg-amber-500 transition-colors rounded">
            Plan My Trip →
          </button>
          <button className="border-2 border-terracotta text-terracotta font-garamond text-base uppercase tracking-wider px-8 py-4 hover:bg-terracotta hover:text-white transition-colors rounded">
            See SOS Demo
          </button>
        </div>
      </div>

      {/* Safety Score Card - Bottom Right */}
      <div className="absolute bottom-20 right-8 md:right-20">
        <div className="bg-cream/95 backdrop-blur-sm rounded-xl px-5 py-4 shadow-2xl">
          {/* Top - Pulsing indicator */}
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <p className="font-garamond text-xs text-charcoal/60 uppercase tracking-wider">
              Live Safety Score
            </p>
          </div>
          {/* Score */}
          <p className="font-playfair text-3xl font-bold text-charcoal mb-2">
            92 / 100
          </p>
          {/* Label */}
          <p className="font-garamond text-xs text-charcoal/50">
            🛡️ Rajasthan Region
          </p>
        </div>
      </div>

      {/* Scroll Indicator - Bottom Center */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
        <p className="font-garamond text-white/60 text-xs uppercase tracking-widest text-center">
          scroll
        </p>
        <div className="animate-bounce mt-1 text-white/60">↓</div>
      </div>
    </section>
  )
}
