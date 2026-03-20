export default function Hero() {
  return (
    <section className="w-full py-16 lg:py-24 px-8" style={{ backgroundColor: '#FAF9F6' }}>
      <div className="w-full mx-auto">
        {/* Hero Card with Image and Text Overlay */}
        <div className="relative rounded-3xl overflow-hidden h-96 md:h-[500px] lg:h-[600px] shadow-2xl">
          {/* Background Image */}
          <img
            src="/hero.jpg"
            alt="India landscape"
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

          {/* Content Layer */}
          <div className="absolute inset-0 flex flex-col justify-end pb-12 px-8 md:px-16">
            {/* Main Headline */}
            <div className="mb-6">
              <h1 className="font-playfair text-5xl md:text-7xl italic font-bold leading-none" style={{ color: '#F4D35E' }}>
                Explore India,
              </h1>
              <h1 className="font-playfair text-5xl md:text-7xl italic font-bold leading-none" style={{ color: '#F4D35E' }}>
                Fearlessly.
              </h1>
            </div>

            {/* Subtext */}
            <p className="font-garamond text-base md:text-lg max-w-xl mb-8" style={{ color: '#F4D35E' }}>
              AI trip planning + 98ms panic alerts. Your verified guide network
              across India, always within reach.
            </p>

            {/* CTA Buttons */}
            <div className="flex gap-4">
              <button className="font-garamond text-base uppercase tracking-wider px-8 py-4 transition-colors rounded" style={{ backgroundColor: 'rgb(255, 252, 153)', color: '#2D2D2D' }}>
                Plan My Trip →
              </button>
              <button className="border-2 font-garamond text-base uppercase tracking-wider px-8 py-4 transition-colors rounded" style={{ borderColor: 'rgb(255, 252, 153)', color: 'rgb(255, 252, 153)' }}>
                See SOS Demo
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
