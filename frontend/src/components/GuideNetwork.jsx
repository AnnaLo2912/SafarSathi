export default function GuideNetwork() {
  const guides = [
    {
      name: 'Rajesh Kumar',
      location: 'Jaipur, Rajasthan',
      license: 'License #RJ1234',
      rating: '4.9',
      reviews: 127,
      trips: 340,
      languages: ['English', 'Hindi', 'French'],
      speciality: 'Heritage & Forts',
      rate: '₹2,000/day',
      avatar: 'R',
      avatarBg: 'bg-saffron',
      available: true,
    },
    {
      name: 'Priya Nair',
      location: 'Kochi, Kerala',
      license: 'License #KL5678',
      rating: '4.8',
      reviews: 89,
      trips: 210,
      languages: ['English', 'Malayalam', 'German'],
      speciality: 'Backwaters & Culture',
      rate: '₹1,800/day',
      avatar: 'P',
      avatarBg: 'bg-deepblue',
      available: true,
    },
    {
      name: 'Arjun Sharma',
      location: 'Varanasi, UP',
      license: 'License #UP9012',
      rating: '5.0',
      reviews: 64,
      trips: 180,
      languages: ['English', 'Hindi', 'Spanish'],
      speciality: 'Spiritual & Ghats',
      rate: '₹1,500/day',
      avatar: 'A',
      avatarBg: 'bg-terracotta',
      available: false,
    },
  ]

  return (
    <section className="bg-cream py-24 px-6">
      {/* Section Header */}
      <div className="text-center mb-16 max-w-3xl mx-auto">
        <p className="font-garamond text-xs uppercase tracking-widest text-terracotta mb-3">
          ✦ The Guide Network
        </p>
        <h2 className="font-playfair text-4xl md:text-5xl text-charcoal font-bold">
          Real people.
        </h2>
        <h2 className="font-playfair text-4xl md:text-5xl text-saffron italic font-bold">
          Government certified.
        </h2>
        <p className="font-garamond text-lg text-charcoal/60 max-w-lg mx-auto mt-4">
          Every guide on SafarSathi is verified by OCR certificate scanning. No
          fake profiles. No unverified strangers.
        </p>
      </div>

      {/* Guides Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto mb-12">
        {guides.map((guide, index) => (
          <GuideCard key={index} guide={guide} />
        ))}
      </div>

      {/* Bottom Trust Bar */}
      <div className="bg-sand rounded-2xl max-w-6xl mx-auto px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="font-playfair text-xl text-charcoal font-semibold mb-2">
            Want to become a verified guide?
          </h3>
          <p className="font-garamond text-sm text-charcoal/60">
            Upload your government certificate and get approved in 24 hours.
          </p>
        </div>
        <button className="border-2 border-saffron text-saffron font-garamond text-sm uppercase tracking-widest px-8 py-3 rounded-full hover:bg-saffron hover:text-charcoal transition-all duration-300 whitespace-nowrap">
          Apply as Guide →
        </button>
      </div>
    </section>
  )
}

function GuideCard({ guide }) {
  return (
    <div className="bg-sand rounded-2xl p-8 border border-sand hover:border-saffron/40 hover:shadow-xl transition-all duration-300 group relative overflow-hidden">
      {/* Decorative corner accent */}
      <div
        className="absolute top-0 right-0 w-20 h-20 opacity-5 group-hover:opacity-10 transition-opacity duration-300"
        style={{
          background:
            'radial-gradient(circle, #E8B7A6 0%, transparent 70%)',
        }}
      />

      {/* TOP ROW - Avatar + Name + Availability */}
      <div className="flex items-start justify-between mb-6 relative z-10">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div
            className={`w-14 h-14 rounded-full flex items-center justify-center text-white font-playfair font-bold text-xl ${guide.avatarBg}`}
          >
            {guide.avatar}
          </div>

          {/* Name Block */}
          <div>
            <h3 className="font-playfair text-lg text-charcoal font-semibold">
              {guide.name}
            </h3>
            <p className="font-garamond text-sm text-charcoal/60 mt-0.5">
              {guide.location}
            </p>
            <p className="font-garamond text-xs text-terracotta/70 mt-0.5">
              {guide.license}
            </p>
          </div>
        </div>

        {/* Availability Badge */}
        {guide.available ? (
          <div className="bg-green-100 text-green-700 text-xs font-garamond px-3 py-1 rounded-full flex items-center gap-1 whitespace-nowrap">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            Available
          </div>
        ) : (
          <div className="bg-sand text-charcoal/40 text-xs font-garamond px-3 py-1 rounded-full whitespace-nowrap">
            On Trip
          </div>
        )}
      </div>

      {/* RATING ROW */}
      <div className="flex items-center gap-4 mb-4 relative z-10">
        <div className="flex items-center gap-1">
          <span>⭐</span>
          <p className="font-playfair text-lg font-bold text-charcoal">
            {guide.rating}
          </p>
        </div>
        <p className="font-garamond text-sm text-charcoal/50">
          ({guide.reviews} reviews)
        </p>
        <div className="w-px h-4 bg-charcoal/20" />
        <p className="font-garamond text-sm text-charcoal/50">
          {guide.trips} trips
        </p>
      </div>

      {/* SPECIALITY TAG */}
      <div className="inline-block bg-cream font-garamond text-xs uppercase tracking-wider text-charcoal/70 px-3 py-1 rounded-full border border-sand mb-4 relative z-10">
        ✦ {guide.speciality}
      </div>

      {/* LANGUAGES */}
      <div className="mb-6 relative z-10">
        <span className="font-garamond text-xs text-charcoal/40 uppercase tracking-wider block mb-2">
          Speaks
        </span>
        <div className="flex flex-wrap gap-2">
          {guide.languages.map((lang, idx) => (
            <span
              key={idx}
              className="bg-cream text-charcoal/70 font-garamond text-xs px-3 py-1 rounded-full border border-sand"
            >
              {lang}
            </span>
          ))}
        </div>
      </div>

      {/* BOTTOM ROW - Rate + Book Button */}
      <div className="flex items-center justify-between pt-6 border-t border-sand/80 relative z-10">
        <div>
          <p className="font-garamond text-xs text-charcoal/40 uppercase tracking-wider">
            Rate
          </p>
          <p className="font-playfair text-xl text-charcoal font-bold mt-1">
            {guide.rate}
          </p>
        </div>
        <button className="bg-charcoal text-cream font-garamond text-xs uppercase tracking-wider px-6 py-3 rounded-full hover:bg-saffron hover:text-charcoal transition-all duration-300">
          Book Guide →
        </button>
      </div>
    </div>
  )
}
