export default function FeaturesStrip() {
  const features = [
    {
      number: '01',
      icon: '🚨',
      title: 'Panic in 98ms',
      description:
        'Triple-press your power button. GPS broadcasts instantly to every verified guide within 1km. No login. No delay.',
      delay: '0ms',
    },
    {
      number: '02',
      icon: '🗺️',
      title: 'AI Itineraries',
      description:
        "Type 'Jaipur 3 nights $150' and get a complete day-wise plan with hotels, timings, photos, and budget breakdown.",
      delay: '100ms',
    },
    {
      number: '03',
      icon: '💳',
      title: 'Dual Currency',
      description:
        'Pay hotels in USD via Stripe. Top up INR wallet via Razorpay. Scan UPI QR codes for street food in seconds.',
      delay: '200ms',
    },
    {
      number: '04',
      icon: '🧭',
      title: 'Verified Guides',
      description:
        'Every guide is government-certified with OCR verification. Live tracking, chat, and earnings dashboard included.',
      delay: '300ms',
    },
  ]

  return (
    <section className="bg-sand py-20 px-6">
      {/* Section Header */}
      <div className="text-center mb-16 max-w-4xl mx-auto">
        <p className="font-garamond text-xs uppercase tracking-widest text-terracotta mb-3">
          ✦ What SafarSathi Does
        </p>
        <h2 className="font-playfair text-4xl md:text-5xl text-charcoal font-bold">
          Everything you need,{' '}
          <span className="italic text-saffron">nothing you don't.</span>
        </h2>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0">
        {features.map((feature, index) => (
          <div
            key={index}
            className="fade-up border-r border-sand/60 last:border-r-0 px-8 py-10 group cursor-pointer border-l-4 border-l-transparent hover:border-l-terracotta transition-all duration-300 bg-cream hover:bg-white transition-colors duration-300"
            style={{ animationDelay: feature.delay }}
          >
            {/* Number */}
            <p className="font-playfair text-7xl font-bold text-charcoal/10 leading-none mb-4 group-hover:text-terracotta/20 transition-colors">
              {feature.number}
            </p>

            {/* Icon + Title */}
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">{feature.icon}</span>
              <h3 className="font-playfair text-xl text-charcoal font-semibold">
                {feature.title}
              </h3>
            </div>

            {/* Description */}
            <p className="font-garamond text-base text-charcoal/70 leading-relaxed">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
