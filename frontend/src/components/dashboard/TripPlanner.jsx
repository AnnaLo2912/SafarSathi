import { useState } from 'react'

export default function TripPlanner() {
  const [query, setQuery] = useState('')
  const [nights, setNights] = useState('3')
  const [budget, setBudget] = useState('150')
  const [loading, setLoading] = useState(false)
  const [itinerary, setItinerary] = useState(null)

  const mockItinerary = {
    destination: "Jaipur",
    duration: "3 Nights / 4 Days",
    totalBudget: "$150",
    bestTime: "Oct – March",
    weather: "25°C, Sunny",
    heroImage: "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=1200&q=80",
    highlights: ["Pink City", "Amber Fort", "Hawa Mahal", "Local Cuisine"],
    days: [
      {
        day: 1,
        title: "Arrival & the Pink City",
        theme: "Heritage & Culture",
        themeColor: "bg-saffron",
        image: "https://images.unsplash.com/photo-1477587458883-47145ed6979c?w=600&q=80",
        activities: [
          { time: "09:00 AM", name: "Amber Fort", type: "Sightseeing", cost: "$5", duration: "2-3 hrs", tip: "Hire a local guide for ₹200 inside" },
          { time: "12:30 PM", name: "Lunch at Lassiwala", type: "Food", cost: "$3", duration: "45 mins", tip: "Try the iconic Jaipur lassi" },
          { time: "03:00 PM", name: "Hawa Mahal", type: "Sightseeing", cost: "$2", duration: "1 hr", tip: "Best photos from the café across the street" },
          { time: "07:00 PM", name: "Chokhi Dhani Dinner", type: "Cultural", cost: "$12", duration: "3 hrs", tip: "Book in advance on weekends" }
        ]
      },
      {
        day: 2,
        title: "Palaces & Bazaars",
        theme: "Shopping & Royalty",
        themeColor: "bg-terracotta",
        image: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=600&q=80",
        activities: [
          { time: "08:00 AM", name: "City Palace", type: "Sightseeing", cost: "$8", duration: "2 hrs", tip: "Museum inside is worth it" },
          { time: "11:00 AM", name: "Jantar Mantar", type: "Heritage", cost: "$4", duration: "1 hr", tip: "UNESCO World Heritage Site" },
          { time: "02:00 PM", name: "Johari Bazaar Shopping", type: "Shopping", cost: "$20", duration: "2 hrs", tip: "Bargain for at least 30% off" },
          { time: "07:00 PM", name: "Rooftop dinner, Old City", type: "Food", cost: "$10", duration: "1.5 hrs", tip: "Amazing fort views at night" }
        ]
      },
      {
        day: 3,
        title: "Day Trip & Relaxation",
        theme: "Nature & Leisure",
        themeColor: "bg-deepblue",
        image: "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=600&q=80",
        activities: [
          { time: "07:00 AM", name: "Nahargarh Fort Sunrise", type: "Sightseeing", cost: "$3", duration: "2 hrs", tip: "Best sunrise view in Jaipur" },
          { time: "10:00 AM", name: "Jal Mahal Photo Stop", type: "Sightseeing", cost: "Free", duration: "30 mins", tip: "Can't enter but photos are stunning" },
          { time: "01:00 PM", name: "Spice Market & Lunch", type: "Food", cost: "$6", duration: "1.5 hrs", tip: "Buy saffron and masala here" },
          { time: "04:00 PM", name: "Spa & Wellness", type: "Leisure", cost: "$25", duration: "2 hrs", tip: "Several Ayurvedic spas in the area" }
        ]
      }
    ],
    hotels: [
      {
        name: "ITC Rajputana",
        stars: 5,
        price: "$95/night",
        location: "MI Road, Central Jaipur",
        image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=80",
        perks: ["Pool", "Spa", "Heritage View", "Free Breakfast"],
        badge: "Best Value",
        badgeColor: "bg-saffron"
      },
      {
        name: "Taj Rambagh Palace",
        stars: 5,
        price: "$120/night",
        location: "Bhawani Singh Road",
        image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=400&q=80",
        perks: ["Palace Grounds", "Fine Dining", "Polo Field", "Butler"],
        badge: "Luxury Pick",
        badgeColor: "bg-terracotta"
      },
      {
        name: "Pearl Palace Heritage",
        stars: 3,
        price: "$35/night",
        location: "Hari Kishan Somani Marg",
        image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&q=80",
        perks: ["Rooftop Café", "Free WiFi", "City Center", "AC Rooms"],
        badge: "Budget Pick",
        badgeColor: "bg-green-600"
      }
    ],
    budgetBreakdown: [
      { category: "Accommodation", amount: "$105", percentage: 70, color: "bg-saffron" },
      { category: "Food & Drinks", amount: "$21", percentage: 14, color: "bg-terracotta" },
      { category: "Sightseeing", amount: "$15", percentage: 10, color: "bg-deepblue" },
      { category: "Shopping", amount: "$9", percentage: 6, color: "bg-charcoal" }
    ]
  }

  function handleGenerate(e) {
    e.preventDefault()
    if (!query) return
    setLoading(true)
    setItinerary(null)
    // Simulate AI response delay
    setTimeout(() => {
      setItinerary(mockItinerary)
      setLoading(false)
    }, 2000)
  }

  // STATE A: No itinerary yet
  if (!itinerary && !loading) {
    return (
      <div className="py-16">
        {/* Top Label */}
        <div className="text-center mb-3">
          <span className="font-garamond text-xs uppercase tracking-widest text-terracotta">
            ✦ Powered by Gemini AI
          </span>
        </div>

        {/* Headline */}
        <div className="text-center mb-2">
          <h2 className="font-playfair text-5xl md:text-6xl text-charcoal font-bold italic">
            Plan your perfect
          </h2>
        </div>

        <div className="text-center mb-10">
          <h2 className="font-playfair text-5xl md:text-6xl text-saffron font-bold italic">
            Indian journey.
          </h2>
        </div>

        {/* Trip Form Card */}
        <div className="bg-sand rounded-3xl p-8 md:p-10 max-w-2xl mx-auto shadow-sm">
          <form onSubmit={handleGenerate} className="space-y-5">
            <h3 className="font-playfair text-2xl text-charcoal font-semibold mb-6">
              Where do you want to go?
            </h3>

            {/* Destination Field */}
            <div>
              <label className="font-garamond text-xs uppercase tracking-widest text-charcoal/60 mb-2 block">
                Destination
              </label>
              <input
                type="text"
                placeholder="e.g. Jaipur, Varanasi, Kerala..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-cream border border-cream focus:border-saffron focus:outline-none font-garamond text-lg text-charcoal px-5 py-4 rounded-2xl transition-colors"
              />
            </div>

            {/* Two Column: Nights & Budget */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-garamond text-xs uppercase tracking-widest text-charcoal/60 mb-2 block">
                  Number of Nights
                </label>
                <select
                  value={nights}
                  onChange={(e) => setNights(e.target.value)}
                  className="w-full bg-cream border border-cream focus:border-saffron focus:outline-none font-garamond text-lg text-charcoal px-5 py-4 rounded-2xl transition-colors"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 10, 14].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-garamond text-xs uppercase tracking-widest text-charcoal/60 mb-2 block">
                  Budget (USD)
                </label>
                <input
                  type="number"
                  min="50"
                  max="5000"
                  placeholder="e.g. 150"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full bg-cream border border-cream focus:border-saffron focus:outline-none font-garamond text-lg text-charcoal px-5 py-4 rounded-2xl transition-colors"
                />
              </div>
            </div>

            {/* Quick Suggestion Pills */}
            <div>
              <span className="font-garamond text-xs text-charcoal/50 mb-2 block">
                Popular trips:
              </span>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: "🏯 Jaipur 3N", dest: "Jaipur" },
                  { label: "🕌 Agra 2N", dest: "Agra" },
                  { label: "🛕 Varanasi 4N", dest: "Varanasi" },
                  { label: "🏖️ Goa 5N", dest: "Goa" },
                  { label: "🌿 Kerala 6N", dest: "Kerala" }
                ].map((pill) => (
                  <button
                    key={pill.dest}
                    type="button"
                    onClick={() => setQuery(pill.dest)}
                    className="bg-cream border border-sand font-garamond text-xs text-charcoal/70 px-4 py-2 rounded-full cursor-pointer hover:border-saffron hover:text-saffron transition-all duration-200"
                  >
                    {pill.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <button
              type="submit"
              className="w-full bg-charcoal text-cream font-garamond text-base uppercase tracking-widest py-5 rounded-2xl hover:bg-saffron hover:text-charcoal transition-all duration-300 mt-4"
            >
              ✦ Generate My Itinerary
            </button>
          </form>
        </div>

        {/* Trust Badges */}
        <div className="flex justify-center gap-8 mt-8">
          <div className="flex items-center gap-2 font-garamond text-sm text-charcoal/50">
            <span>⚡</span>
            <span>Ready in 3 seconds</span>
          </div>
          <div className="flex items-center gap-2 font-garamond text-sm text-charcoal/50">
            <span>📸</span>
            <span>Photos included</span>
          </div>
          <div className="flex items-center gap-2 font-garamond text-sm text-charcoal/50">
            <span>💰</span>
            <span>Budget optimized</span>
          </div>
        </div>
      </div>
    )
  }

  // STATE B: Loading
  if (loading) {
    return (
      <div className="py-24 text-center">
        {/* Pulsing Logo */}
        <div className="font-playfair text-5xl text-charcoal font-bold animate-pulse mb-6">
          SafarSathi
        </div>

        {/* Loading Text */}
        <div className="font-garamond text-lg text-charcoal/60 mb-2">
          Crafting your perfect itinerary...
        </div>

        {/* Subtext */}
        <div className="font-garamond text-sm text-charcoal/40 mb-8">
          Gemini AI is planning your trip to {query}
        </div>

        {/* Progress Dots */}
        <div className="flex justify-center gap-3 mt-8">
          <div
            className="w-3 h-3 rounded-full bg-saffron animate-bounce"
            style={{ animationDelay: '0ms' }}
          ></div>
          <div
            className="w-3 h-3 rounded-full bg-saffron animate-bounce"
            style={{ animationDelay: '150ms' }}
          ></div>
          <div
            className="w-3 h-3 rounded-full bg-saffron animate-bounce"
            style={{ animationDelay: '300ms' }}
          ></div>
        </div>
      </div>
    )
  }

  // STATE C: Itinerary loaded (full display)
  return (
    <div className="page-fade-in">
      {/* SECTION 1 — HERO BANNER */}
      <div className="relative rounded-3xl overflow-hidden h-72 md:h-96 mb-10">
        {/* Background Image */}
        <img
          src={itinerary.heroImage}
          alt={itinerary.destination}
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Gradient Overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to right, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)'
          }}
        ></div>

        {/* Content */}
        <div className="absolute inset-0 flex items-end p-8 md:p-12">
          <div className="flex-1">
            <div className="font-garamond text-xs uppercase tracking-widest text-saffron mb-2">
              ✦ Your AI Itinerary
            </div>
            <h1 className="font-playfair text-5xl md:text-6xl text-white font-bold italic mb-1">
              {itinerary.destination}
            </h1>
            <div className="flex items-center gap-4 font-garamond text-base text-white/80 mb-4">
              <span>{itinerary.duration}</span>
              <span>·</span>
              <span>Budget: {itinerary.totalBudget}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {itinerary.highlights.map((highlight, idx) => (
                <div
                  key={idx}
                  className="bg-white/20 backdrop-blur-sm text-white font-garamond text-xs px-3 py-1 rounded-full"
                >
                  {highlight}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Weather Card - Top Right */}
        <div className="absolute top-6 right-6 bg-cream/95 backdrop-blur-sm rounded-2xl px-5 py-4 shadow-xl text-right">
          <div className="font-playfair text-2xl text-charcoal font-bold">
            {itinerary.weather}
          </div>
          <div className="font-garamond text-xs text-charcoal/50 uppercase tracking-wider mt-1">
            Best: {itinerary.bestTime}
          </div>
        </div>

        {/* Back Button - Top Left */}
        <button
          onClick={() => setItinerary(null)}
          className="absolute top-6 left-6 bg-white/20 backdrop-blur-sm text-white font-garamond text-xs uppercase tracking-wider px-4 py-2 rounded-full cursor-pointer hover:bg-white/30 transition-all"
        >
          ← New Trip
        </button>
      </div>

      {/* SECTION 2 — DAY BY DAY ITINERARY */}
      <div className="mb-12">
        <div className="mb-8">
          <div className="font-garamond text-xs uppercase tracking-widest text-terracotta mb-2">
            ✦ Day by Day
          </div>
          <h2 className="font-playfair text-3xl text-charcoal font-bold">
            Your Journey Unfolds
          </h2>
        </div>

        {itinerary.days.map((day) => (
          <div
            key={day.day}
            className="bg-sand rounded-3xl overflow-hidden border border-sand hover:border-saffron/30 transition-all duration-300 mb-8 grid grid-cols-1 md:grid-cols-3"
          >
            {/* LEFT — Day Image */}
            <div className="relative h-48 md:h-full min-h-48">
              <img
                src={day.image}
                alt={day.title}
                className="absolute inset-0 w-full h-full object-cover"
              />

              {/* Day Badge */}
              <div className="absolute top-4 left-4 bg-cream/95 backdrop-blur-sm rounded-xl px-4 py-2">
                <div className="font-playfair text-lg font-bold text-charcoal">
                  Day {day.day}
                </div>
                <div className="font-garamond text-xs text-charcoal/60">
                  {day.title}
                </div>
              </div>

              {/* Theme Badge */}
              <div
                className={`absolute bottom-4 left-4 text-white font-garamond text-xs uppercase tracking-wider px-3 py-1 rounded-full ${day.themeColor}`}
              >
                {day.theme}
              </div>
            </div>

            {/* RIGHT — Activities */}
            <div className="md:col-span-2 p-6 md:p-8">
              <div className="font-garamond text-xs uppercase tracking-widest text-charcoal/40 mb-4">
                Schedule
              </div>

              {day.activities.map((activity, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-4 mb-5 last:mb-0 pb-5 last:pb-0 border-b border-sand/80 last:border-0"
                >
                  {/* Time */}
                  <div className="w-20 shrink-0 font-garamond text-xs text-charcoal/50 uppercase tracking-wider pt-1">
                    {activity.time}
                  </div>

                  {/* Timeline Dot */}
                  <div className="flex flex-col items-center pt-1 mr-2">
                    <div className="w-2 h-2 rounded-full bg-saffron shrink-0"></div>
                    <div className="w-px flex-1 bg-sand mt-1"></div>
                  </div>

                  {/* Activity Details */}
                  <div className="flex-1">
                    {/* Name & Cost */}
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="font-playfair text-base text-charcoal font-semibold">
                        {activity.name}
                      </div>
                      <div className="bg-cream font-garamond text-xs text-charcoal/70 px-3 py-1 rounded-full border border-sand whitespace-nowrap">
                        {activity.cost}
                      </div>
                    </div>

                    {/* Type & Duration */}
                    <div className="flex items-center gap-3 mt-1 mb-1">
                      <span className="font-garamond text-xs text-charcoal/50 uppercase tracking-wider">
                        {activity.type}
                      </span>
                      <span className="w-1 h-1 rounded-full bg-charcoal/20"></span>
                      <span className="font-garamond text-xs text-charcoal/50">
                        {activity.duration}
                      </span>
                    </div>

                    {/* Tip */}
                    <div className="flex items-start gap-2 mt-2">
                      <span className="text-xs">💡</span>
                      <span className="font-garamond text-xs text-charcoal/60 italic">
                        {activity.tip}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* SECTION 3 — HOTEL COMPARISON */}
      <div className="mt-12 mb-12">
        <div className="mb-8">
          <div className="font-garamond text-xs uppercase tracking-widest text-terracotta mb-2">
            ✦ Where to Stay
          </div>
          <h2 className="font-playfair text-3xl text-charcoal font-bold">
            Hotel Comparison
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {itinerary.hotels.map((hotel, idx) => (
            <div
              key={idx}
              className="bg-sand rounded-3xl overflow-hidden border border-sand hover:border-saffron/40 hover:shadow-xl transition-all duration-300 group flex flex-col"
            >
              {/* Image */}
              <div className="relative h-44 overflow-hidden">
                <img
                  src={hotel.image}
                  alt={hotel.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className={`absolute top-3 left-3 text-white font-garamond text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full ${hotel.badgeColor}`}>
                  {hotel.badge}
                </div>
              </div>

              {/* Body */}
              <div className="p-6 flex flex-col flex-1">
                {/* Name & Stars */}
                <div className="flex items-start justify-between mb-1">
                  <h3 className="font-playfair text-xl text-charcoal font-bold">
                    {hotel.name}
                  </h3>
                  <div className="font-garamond text-sm text-saffron whitespace-nowrap">
                    {'⭐'.repeat(hotel.stars)}
                  </div>
                </div>

                {/* Location */}
                <div className="font-garamond text-sm text-charcoal/60 mb-3">
                  📍 {hotel.location}
                </div>

                {/* Price */}
                <div className="mb-4">
                  <div className="font-playfair text-2xl text-charcoal font-bold">
                    {hotel.price}
                  </div>
                  <span className="font-garamond text-xs text-charcoal/50">per night</span>
                </div>

                {/* Perks */}
                <div className="flex flex-wrap gap-2 mb-5">
                  {hotel.perks.map((perk, pidx) => (
                    <div
                      key={pidx}
                      className="bg-cream font-garamond text-xs text-charcoal/70 px-3 py-1 rounded-full border border-sand"
                    >
                      {perk}
                    </div>
                  ))}
                </div>

                {/* Book Button */}
                <button className="w-full mt-auto bg-charcoal text-cream font-garamond text-xs uppercase tracking-widest py-3 rounded-xl hover:bg-saffron hover:text-charcoal transition-all duration-300 text-center">
                  Book This Hotel →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 4 — BUDGET BREAKDOWN */}
      <div className="mt-12 bg-sand rounded-3xl p-8 md:p-10 mb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* LEFT — Budget Bars */}
          <div>
            <div className="mb-6">
              <div className="font-garamond text-xs uppercase tracking-widest text-terracotta mb-2">
                ✦ Budget Breakdown
              </div>
              <h3 className="font-playfair text-3xl text-charcoal font-bold">
                {itinerary.totalBudget} total
              </h3>
            </div>

            {itinerary.budgetBreakdown.map((item, idx) => (
              <div key={idx} className="mb-5 last:mb-0">
                {/* Category & Amount */}
                <div className="flex justify-between mb-2">
                  <span className="font-garamond text-sm text-charcoal/70">
                    {item.category}
                  </span>
                  <span className="font-playfair text-base text-charcoal font-semibold">
                    {item.amount}
                  </span>
                </div>
                {/* Progress Bar */}
                <div className="w-full bg-cream rounded-full h-2">
                  <div
                    className={`${item.color} h-2 rounded-full transition-all duration-700`}
                    style={{ width: item.percentage + '%' }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          {/* RIGHT — Summary Card */}
          <div className="bg-cream rounded-2xl p-6">
            <h3 className="font-playfair text-xl text-charcoal font-semibold mb-6">
              Trip Summary
            </h3>

            <div className="space-y-4">
              {/* Row 1 */}
              <div className="flex justify-between items-center pb-4 border-b border-sand">
                <span className="font-garamond text-sm text-charcoal/60">Destination</span>
                <span className="font-playfair text-base text-charcoal font-semibold">
                  {itinerary.destination}
                </span>
              </div>

              {/* Row 2 */}
              <div className="flex justify-between items-center pb-4 border-b border-sand">
                <span className="font-garamond text-sm text-charcoal/60">Duration</span>
                <span className="font-playfair text-base text-charcoal font-semibold">
                  {itinerary.duration}
                </span>
              </div>

              {/* Row 3 */}
              <div className="flex justify-between items-center pb-4 border-b border-sand">
                <span className="font-garamond text-sm text-charcoal/60">Best Time</span>
                <span className="font-playfair text-base text-charcoal font-semibold">
                  {itinerary.bestTime}
                </span>
              </div>

              {/* Row 4 */}
              <div className="flex justify-between items-center pb-4 border-b border-sand">
                <span className="font-garamond text-sm text-charcoal/60">Weather</span>
                <span className="font-playfair text-base text-charcoal font-semibold">
                  {itinerary.weather}
                </span>
              </div>

              {/* Row 5 — Total */}
              <div className="flex justify-between items-center pt-2">
                <span className="font-garamond text-base text-charcoal/80 font-semibold">
                  Total Budget
                </span>
                <span className="font-playfair text-2xl text-saffron font-bold">
                  {itinerary.totalBudget}
                </span>
              </div>

              {/* Save Button */}
              <button className="w-full mt-6 bg-charcoal text-cream font-garamond text-sm uppercase tracking-widest py-4 rounded-xl hover:bg-saffron hover:text-charcoal transition-all duration-300">
                ✦ Save This Itinerary
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM ACTION BAR */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-sand rounded-2xl px-8 py-6">
        <div>
          <h3 className="font-playfair text-xl text-charcoal font-semibold">
            Love this itinerary?
          </h3>
          <p className="font-garamond text-sm text-charcoal/60">
            Book a verified guide to bring it to life.
          </p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button className="flex-1 md:flex-none bg-saffron text-charcoal font-garamond text-sm uppercase tracking-wider px-8 py-3 rounded-xl hover:bg-amber-500 transition-all duration-300">
            Book a Guide →
          </button>
          <button
            onClick={() => setItinerary(null)}
            className="flex-1 md:flex-none border border-charcoal text-charcoal font-garamond text-sm uppercase tracking-wider px-8 py-3 rounded-xl hover:bg-charcoal hover:text-cream transition-all duration-300"
          >
            ← Plan Another
          </button>
        </div>
      </div>
    </div>
  )
}
