import useScrollReveal from '../hooks/useScrollReveal'

export default function HowItWorks() {
  const rows = [
    {
      step: '01',
      title: 'Arrive. Activate. Relax.',
      image:
        'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80',
      accentColor: 'border-saffron',
      lineColor: 'bg-saffron',
      description:
        'The moment you land, SafarSathi is ready. No account needed — just open the app and your panic button is live. GPS is always broadcasting to guides near you.',
      pills: ['No Login Required', 'Instant GPS', 'Always On'],
    },
    {
      step: '02',
      title: 'Ask AI. Get your perfect plan.',
      image:
        'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80',
      accentColor: 'border-terracotta',
      lineColor: 'bg-terracotta',
      description:
        "Type anything — 'Agra 2 days $100' or 'Rajasthan road trip 10 days' — and Gemini AI builds you a complete itinerary with hotels, timings, photos, and live prices.",
      pills: ['Gemini 1.5 Flash', 'Day-wise Plans', 'Budget Aware'],
    },
    {
      step: '03',
      title: 'Meet your guide. Explore freely.',
      image:
        'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800&q=80',
      accentColor: 'border-deepblue',
      lineColor: 'bg-deepblue',
      description:
        'Browse government-verified guides, chat before booking, pay securely in USD or INR. Your guide tracks your route and responds to panic alerts in under 100ms.',
      pills: ['Govt. Certified', 'Live Chat', 'USD + INR'],
    },
  ]

  return (
    <section className="bg-cream py-24 px-6 overflow-hidden">
      {/* Section Header */}
      <div className="text-center mb-20 max-w-3xl mx-auto">
        <p className="font-garamond text-xs uppercase tracking-widest text-terracotta mb-3">
          ✦ The Journey
        </p>
        <h2 className="font-playfair text-4xl md:text-5xl text-charcoal font-bold">
          Your trip, from landing
          <br />
          <span className="italic text-saffron">to lasting memory.</span>
        </h2>
        <p className="font-garamond text-lg text-charcoal/60 max-w-xl mx-auto text-center mt-4">
          Three simple steps that keep you safe, planned, and connected.
        </p>
      </div>

      {/* Rows */}
      {rows.map((row, index) => (
        <HowItWorksRow key={index} row={row} isReverse={index % 2 === 1} />
      ))}
    </section>
  )
}

function HowItWorksRow({ row, isReverse }) {
  const [ref, isVisible] = useScrollReveal()

  return (
    <div
      ref={ref}
      className={`max-w-6xl mx-auto flex flex-col ${
        isReverse ? 'md:flex-row-reverse' : 'md:flex-row'
      } items-center gap-12 mb-28 last:mb-0 transition-all duration-700 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}
    >
      {/* IMAGE SIDE */}
      <div className="flex-1">
        <div className="relative rounded-2xl overflow-hidden shadow-2xl aspect-[4/3]">
          <img
            src={row.image}
            alt={row.title}
            className="w-full h-full object-cover"
          />
          {/* Decorative accent square */}
          <div
            className={`absolute -bottom-4 -right-4 w-24 h-24 border-4 rounded-lg ${row.accentColor}`}
          />
        </div>
      </div>

      {/* TEXT SIDE */}
      <div className="flex-1">
        {/* Step badge */}
        <span className="inline-block font-garamond text-xs uppercase tracking-widest bg-sand px-4 py-2 rounded-full text-charcoal/60 mb-4">
          Step {row.step}
        </span>

        {/* Title */}
        <h3 className="font-playfair text-3xl md:text-4xl text-charcoal font-bold mb-4 leading-tight">
          {row.title}
        </h3>

        {/* Accent line */}
        <div className={`w-12 h-1 mb-6 ${row.lineColor}`} />

        {/* Description */}
        <p className="font-garamond text-lg text-charcoal/70 leading-relaxed mb-6">
          {row.description}
        </p>

        {/* Feature pills */}
        <div className="flex flex-wrap gap-2">
          {row.pills.map((pill, idx) => (
            <span
              key={idx}
              className="bg-sand font-garamond text-xs px-3 py-1 rounded-full text-charcoal/70"
            >
              {pill}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
