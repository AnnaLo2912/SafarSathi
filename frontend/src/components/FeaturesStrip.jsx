export default function FeaturesStrip() {
  const features = [
    {
      number: '01',
      title: 'Panic in 98ms',
      desc: 'Triple-press your power button. GPS broadcasts instantly to every verified guide within 1km. No login. No delay.',
    },
    {
      number: '02',
      title: 'AI Itineraries',
      desc: "Type 'Jaipur 3 nights $150' and get a complete day-wise plan with hotels, timings, photos, and budget breakdown.",
    },
    {
      number: '03',
      title: 'Dual Currency',
      desc: 'Pay hotels in USD via Stripe. Top up INR wallet via Razorpay. Scan UPI QR codes for street food in seconds.',
    },
    {
      number: '04',
      title: 'Verified Guides',
      desc: 'Every guide is government-certified with OCR verification. Live tracking, chat, and earnings dashboard included.',
    },
  ]

  return (
    <section className="py-8" style={{ backgroundColor: '#FAF9F6' }}>
      <div className="w-full rounded-t-[5rem] px-12 py-10" style={{ backgroundColor: '#1033a6' }}>
        {/* Section Header */}
        <div className="text-center mb-12">
          <p className="font-garamond text-xs uppercase tracking-widest text-white/70 mb-4">
            ✦ What SafarSathi Does
          </p>
          <h2 className="font-playfair text-4xl md:text-5xl text-white font-bold">
            Everything you need,
          </h2>
          <h2 className="font-playfair text-4xl md:text-5xl text-white italic font-bold">
            nothing you don't.
          </h2>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex flex-col items-center text-center group cursor-pointer"
              style={{ backgroundColor: 'rgb(255, 252, 153)', borderRadius: '1rem', padding: '1.5rem' }}
            >
              {/* Number */}
              <p className="font-playfair text-6xl md:text-7xl font-bold leading-none mb-4 transition-colors duration-300" style={{ color: '#2C2C2C' }}>
                {feature.number}
              </p>

              {/* Title */}
              <h3 className="font-playfair text-lg font-semibold mb-3 transition-colors duration-300" style={{ color: '#2C2C2C' }}>
                {feature.title}
              </h3>

              {/* Description */}
              <p className="font-garamond text-sm leading-relaxed transition-colors duration-300" style={{ color: '#2C2C2C' }}>
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
