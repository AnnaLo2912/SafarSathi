export default function Destinations() {
  const destinations = [
    {
      city: 'Jaipur',
      state: 'Rajasthan',
      badge: '3N from $120',
      tag: 'Most Popular',
      tagColor: 'bg-saffron',
      image:
        'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=600&q=80',
    },
    {
      city: 'Agra',
      state: 'Uttar Pradesh',
      badge: '2N from $95',
      tag: 'Heritage',
      tagColor: 'bg-deepblue',
      image:
        'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=600&q=80',
    },
    {
      city: 'Varanasi',
      state: 'Uttar Pradesh',
      badge: '3N from $80',
      tag: 'Spiritual',
      tagColor: 'bg-terracotta',
      image:
        'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=600&q=80',
    },
    {
      city: 'Mumbai',
      state: 'Maharashtra',
      badge: '4N from $150',
      tag: 'City Life',
      tagColor: 'bg-charcoal',
      image:
        'https://images.unsplash.com/photo-1529253355930-ddbe423a2ac7?w=600&q=80',
    },
    {
      city: 'Goa',
      state: 'Goa',
      badge: '5N from $180',
      tag: 'Beaches',
      tagColor: 'bg-saffron',
      image:
        'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=600&q=80',
    },
    {
      city: 'Kerala',
      state: "God's Own Country",
      badge: '6N from $200',
      tag: 'Nature',
      tagColor: 'bg-green-700',
      image:
        'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=600&q=80',
    },
  ]

  return (
    <section className="bg-sand py-24 px-6">
      {/* Section Header */}
      <div className="text-center mb-16 max-w-3xl mx-auto">
        <p className="font-garamond text-xs uppercase tracking-widest text-terracotta mb-3">
          ✦ Popular Destinations
        </p>
        <h2 className="font-playfair text-4xl md:text-5xl text-charcoal font-bold">
          Explore India's Icons
        </h2>
        <h2 className="font-playfair text-4xl md:text-5xl text-saffron italic font-bold">
          AI-planned for your budget.
        </h2>
        <p className="font-garamond text-lg text-charcoal/60 max-w-lg mx-auto mt-4">
          Every itinerary is generated fresh by Gemini AI — tailored to your
          dates, budget, and travel style.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto mb-16">
        {destinations.map((dest, index) => (
          <div
            key={index}
            className="relative overflow-hidden rounded-2xl cursor-pointer aspect-[3/4] group"
          >
            {/* Background Image */}
            <img
              src={dest.image}
              alt={dest.city}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />

            {/* Dark Gradient Overlay */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(to top, rgba(0,0,0,0.80) 0%, rgba(0,0,0,0.20) 50%, transparent 100%)',
              }}
            />

            {/* Tag Badge - Top Left */}
            <div
              className={`absolute top-4 left-4 text-white text-xs font-garamond uppercase tracking-wider px-3 py-1 rounded-full ${dest.tagColor}`}
            >
              {dest.tag}
            </div>

            {/* Bottom Content Area */}
            <div className="absolute bottom-0 left-0 right-0 p-6">
              {/* City Name */}
              <h3 className="font-playfair text-3xl text-white font-bold leading-tight mb-1">
                {dest.city}
              </h3>

              {/* State Name */}
              <p className="font-garamond text-white/70 text-sm mb-3 uppercase tracking-wider">
                {dest.state}
              </p>

              {/* Bottom Row */}
              <div className="flex items-center justify-between">
                {/* Budget Badge */}
                <div className="bg-white/20 backdrop-blur-sm text-white font-garamond text-xs px-3 py-1 rounded-full">
                  {dest.badge}
                </div>

                {/* Plan Trip Button */}
                <button className="bg-saffron text-charcoal font-garamond text-xs uppercase tracking-wider px-4 py-2 rounded-full font-semibold opacity-0 translate-y-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
                  Plan Trip →
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom CTA */}
      <div className="text-center">
        <p className="font-garamond text-charcoal/60 text-base mb-4">
          Don't see your destination? AI can plan anywhere in India.
        </p>
        <button className="border-2 border-charcoal text-charcoal font-garamond text-sm uppercase tracking-widest px-10 py-4 hover:bg-charcoal hover:text-cream transition-all duration-300 inline-block rounded">
          Explore All Destinations →
        </button>
      </div>
    </section>
  )
}
