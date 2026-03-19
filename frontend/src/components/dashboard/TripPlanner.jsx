import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { auth } from '../../firebase'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001'

export default function TripPlanner() {
  const [query,     setQuery]     = useState('')
  const [nights,    setNights]    = useState('3')
  const [budget,    setBudget]    = useState('150')
  const [travelers, setTravelers] = useState('1')
  const [tripStyle, setTripStyle] = useState('budget')
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState(null)
  const [itinerary, setItinerary] = useState(null)
  const [rawTrip,   setRawTrip]   = useState(null)
  const [saved,     setSaved]     = useState(false)

  const { currentUser } = useAuth()

  // ── Call Backend ──────────────────────────────────────────────
  async function handleGenerate(e) {
    e.preventDefault()
    if (!query.trim()) return

    setLoading(true)
    setError(null)
    setItinerary(null)
    setSaved(false)

    try {
      // Get Firebase token if user is logged in
      let token = null
      if (currentUser) {
        token = await auth.currentUser.getIdToken()
      }

      const response = await fetch(`${BACKEND_URL}/api/trips/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({
          destination: query,
          duration:    parseInt(nights),
          budget:      parseFloat(budget),
          travelers:   parseInt(travelers),
          tripStyle,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to generate itinerary')
      }

      // Store raw trip
      setRawTrip(data.trip)

      // Map backend data → frontend display format
      const trip = data.trip
      setItinerary({
        destination:  trip.destination,
        duration:     `${trip.duration} Nights / ${trip.duration + 1} Days`,
        totalBudget:  `$${trip.budget}`,
        summary:      trip.summary,
        highlights:   trip.highlights || [],
        bestTime:     'Oct – March',
        weather:      trip.weather?.length > 0
          ? `${Math.round(trip.weather[0].tempMax)}°C, ${trip.weather[0].condition}`
          : 'Check local forecast',
        weatherFull:  trip.weather || [],
        heroImage:    'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=1200&q=80',

        days: (trip.dayPlans || []).map((day) => ({
          day:        day.day,
          title:      day.title,
          theme:      'Culture & Exploration',
          themeColor: ['bg-saffron', 'bg-terracotta', 'bg-deepblue'][(day.day - 1) % 3],
          image:      'https://images.unsplash.com/photo-1477587458883-47145ed6979c?w=600&q=80',
          activities: (day.attractions || []).map((a) => ({
            time:     a.timing   || '10:00 AM',
            name:     a.name,
            type:     a.category || 'Sightseeing',
            cost:     a.entryFee > 0 ? `$${a.entryFee}` : 'Free',
            costINR:  a.entryFeeINR > 0 ? `₹${a.entryFeeINR}` : 'Free',
            duration: '1-2 hrs',
            tip:      a.tips || '',
          })),
          meals:     day.meals,
          transport: day.transport,
          dayTotal:  day.dayTotal,
        })),

        hotels: (trip.hotelOptions || []).map((h, i) => ({
          name:     h.name,
          stars:    h.stars   || 3,
          price:    `$${h.pricePerNight}/night`,
          priceINR: h.priceINR ? `₹${h.priceINR.toLocaleString('en-IN')}/night` : '',
          rating:   h.rating  || 4.0,
          location: trip.destination,
          image:    'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=80',
          perks:    h.amenities || [],
          badge:      i === 0 ? 'Best Value' : i === 1 ? 'Luxury Pick' : 'Budget Pick',
          badgeColor: i === 0 ? 'bg-saffron'  : i === 1 ? 'bg-terracotta' : 'bg-green-600',
        })),

        budgetBreakdown: trip.budgetBreakdown ? [
          { category: 'Accommodation', amount: `$${trip.budgetBreakdown.accommodation}`, percentage: Math.round((trip.budgetBreakdown.accommodation / trip.budgetBreakdown.total) * 100), color: 'bg-saffron'    },
          { category: 'Food & Drinks', amount: `$${trip.budgetBreakdown.food}`,          percentage: Math.round((trip.budgetBreakdown.food          / trip.budgetBreakdown.total) * 100), color: 'bg-terracotta' },
          { category: 'Transport',     amount: `$${trip.budgetBreakdown.transport}`,     percentage: Math.round((trip.budgetBreakdown.transport     / trip.budgetBreakdown.total) * 100), color: 'bg-deepblue'   },
          { category: 'Sightseeing',   amount: `$${trip.budgetBreakdown.attractions}`,   percentage: Math.round((trip.budgetBreakdown.attractions   / trip.budgetBreakdown.total) * 100), color: 'bg-charcoal'   },
        ] : [],

        packingList: trip.packingList || [],
        travelTips:  trip.travelTips  || [],
        tripId:      trip._id,
      })

    } catch (err) {
      console.error('Trip generation error:', err)
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // ── Save Trip ─────────────────────────────────────────────────
  async function handleSaveTrip() {
    if (!rawTrip?._id) return
    if (!currentUser) {
      alert('Please login to save your trip!')
      return
    }

    try {
      const token = await auth.currentUser.getIdToken()
      const response = await fetch(`${BACKEND_URL}/api/trips/${rawTrip._id}/save`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      if (data.success) {
        setSaved(true)
      }
    } catch (err) {
      alert('Failed to save trip. Please try again.')
    }
  }

  // ────────────────────────────────────────────────────────────
  // STATE A — Empty form
  // ────────────────────────────────────────────────────────────
  if (!itinerary && !loading) {
    return (
      <div className="py-16">
        <div className="text-center mb-3">
          <span className="font-garamond text-xs uppercase tracking-widest text-terracotta">
            ✦ Powered by Gemini AI
          </span>
        </div>

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

        {/* Error */}
        {error && (
          <div className="max-w-2xl mx-auto mb-6 bg-red-50 border border-red-200 text-red-600 font-garamond text-sm px-4 py-3 rounded-xl">
            ❌ {error}
          </div>
        )}

        {/* Form */}
        <div className="bg-sand rounded-3xl p-8 md:p-10 max-w-2xl mx-auto shadow-sm">
          <form onSubmit={handleGenerate} className="space-y-5">
            <h3 className="font-playfair text-2xl text-charcoal font-semibold mb-6">
              Where do you want to go?
            </h3>

            {/* Destination */}
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
                required
              />
            </div>

            {/* Nights + Budget */}
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
                    <option key={n} value={n}>{n} night{n > 1 ? 's' : ''}</option>
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
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full bg-cream border border-cream focus:border-saffron focus:outline-none font-garamond text-lg text-charcoal px-5 py-4 rounded-2xl transition-colors"
                />
              </div>
            </div>

            {/* Travelers + Trip Style */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-garamond text-xs uppercase tracking-widest text-charcoal/60 mb-2 block">
                  Travelers
                </label>
                <select
                  value={travelers}
                  onChange={(e) => setTravelers(e.target.value)}
                  className="w-full bg-cream border border-cream focus:border-saffron focus:outline-none font-garamond text-lg text-charcoal px-5 py-4 rounded-2xl transition-colors"
                >
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <option key={n} value={n}>{n} {n === 1 ? 'person' : 'people'}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-garamond text-xs uppercase tracking-widest text-charcoal/60 mb-2 block">
                  Trip Style
                </label>
                <select
                  value={tripStyle}
                  onChange={(e) => setTripStyle(e.target.value)}
                  className="w-full bg-cream border border-cream focus:border-saffron focus:outline-none font-garamond text-lg text-charcoal px-5 py-4 rounded-2xl transition-colors"
                >
                  <option value="budget">🎒 Budget</option>
                  <option value="comfort">🏨 Comfort</option>
                  <option value="luxury">👑 Luxury</option>
                </select>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={!query.trim()}
              className="w-full bg-charcoal text-cream font-garamond text-sm uppercase tracking-widest py-5 rounded-2xl hover:bg-saffron hover:text-charcoal transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
            >
              ✦ Generate My Itinerary
            </button>

            {!currentUser && (
              <p className="text-center font-garamond text-xs text-charcoal/40">
                💡 Login to save your itineraries
              </p>
            )}
          </form>
        </div>
      </div>
    )
  }

  // ────────────────────────────────────────────────────────────
  // STATE B — Loading
  // ────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="py-32 text-center">
        <div className="inline-block animate-spin text-6xl mb-6">🌏</div>
        <h2 className="font-playfair text-3xl text-charcoal font-bold mb-3">
          Crafting your perfect journey...
        </h2>
        <p className="font-garamond text-base text-charcoal/60 mb-8">
          Gemini AI is planning {query} · {nights} nights · ${budget}
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {[
            'Researching attractions...',
            'Finding best hotels...',
            'Checking weather...',
            'Calculating budget...',
          ].map((msg, i) => (
            <div
              key={i}
              className="bg-sand font-garamond text-xs text-charcoal/50 px-4 py-2 rounded-full animate-pulse"
              style={{ animationDelay: `${i * 0.3}s` }}
            >
              {msg}
            </div>
          ))}
        </div>
      </div>
    )
  }

  // ────────────────────────────────────────────────────────────
  // STATE C — Show Itinerary
  // ────────────────────────────────────────────────────────────
  return (
    <div>
      {/* HERO */}
      <div className="relative rounded-3xl overflow-hidden mb-10 h-72 md:h-96">
        <img
          src={itinerary.heroImage}
          alt={itinerary.destination}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="font-garamond text-xs uppercase tracking-widest text-saffron mb-2">
            ✦ AI Generated Itinerary
          </div>
          <h2 className="font-playfair text-4xl md:text-5xl text-white font-bold mb-3">
            {itinerary.destination}
          </h2>
          <div className="flex flex-wrap items-center gap-4 font-garamond text-sm text-white/70">
            <span>📅 {itinerary.duration}</span>
            <span>💰 {itinerary.totalBudget} budget</span>
            <span>🌤 {itinerary.weather}</span>
          </div>
        </div>
      </div>

      {/* SUMMARY */}
      {itinerary.summary && (
        <div className="bg-sand rounded-2xl p-6 mb-8">
          <p className="font-garamond text-base text-charcoal/80 leading-relaxed italic">
            "{itinerary.summary}"
          </p>
        </div>
      )}

      {/* HIGHLIGHTS */}
      {itinerary.highlights?.length > 0 && (
        <div className="flex flex-wrap gap-3 mb-10">
          {itinerary.highlights.map((h, i) => (
            <span key={i} className="bg-sand font-garamond text-sm text-charcoal/70 px-4 py-2 rounded-full border border-sand">
              ✦ {h}
            </span>
          ))}
        </div>
      )}

      {/* DAY PLANS */}
      <div className="mb-12">
        <div className="font-garamond text-xs uppercase tracking-widest text-terracotta mb-2">
          ✦ Day by Day
        </div>
        <h3 className="font-playfair text-3xl text-charcoal font-bold mb-8">
          Your Itinerary
        </h3>

        <div className="space-y-6">
          {itinerary.days.map((day) => (
            <div key={day.day} className="bg-sand rounded-3xl overflow-hidden">
              {/* Day Header */}
              <div className={`${day.themeColor} px-8 py-4 flex items-center justify-between`}>
                <div>
                  <div className="font-garamond text-xs uppercase tracking-widest text-white/70">
                    Day {day.day}
                  </div>
                  <h4 className="font-playfair text-xl text-white font-bold">
                    {day.title}
                  </h4>
                </div>
                {day.dayTotal > 0 && (
                  <div className="text-right">
                    <div className="font-garamond text-xs text-white/60">Est. cost</div>
                    <div className="font-playfair text-lg text-white font-bold">
                      ${day.dayTotal}
                    </div>
                  </div>
                )}
              </div>

              {/* Activities */}
              <div className="p-6 space-y-4">
                {day.activities.map((act, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="font-garamond text-xs text-charcoal/40 w-20 shrink-0 pt-1">
                      {act.time}
                    </div>
                    <div className="flex-1 bg-cream rounded-2xl px-5 py-4">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h5 className="font-playfair text-base text-charcoal font-semibold">
                            {act.name}
                          </h5>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="font-garamond text-xs text-charcoal/50 bg-sand px-2 py-0.5 rounded-full">
                              {act.type}
                            </span>
                            <span className="font-garamond text-xs text-charcoal/50">
                              ⏱ {act.duration}
                            </span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="font-playfair text-base text-saffron font-bold">{act.cost}</div>
                          {act.costINR !== 'Free' && (
                            <div className="font-garamond text-xs text-charcoal/40">{act.costINR}</div>
                          )}
                        </div>
                      </div>
                      {act.tip && (
                        <div className="mt-2 font-garamond text-xs text-charcoal/50 italic">
                          💡 {act.tip}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Meals */}
                {day.meals && (
                  <div className="flex gap-3 mt-2 flex-wrap">
                    {['breakfast', 'lunch', 'dinner'].map((meal) =>
                      day.meals[meal] ? (
                        <div key={meal} className="bg-cream rounded-xl px-4 py-2 flex items-center gap-2">
                          <span className="text-sm">
                            {meal === 'breakfast' ? '🌅' : meal === 'lunch' ? '☀️' : '🌙'}
                          </span>
                          <div>
                            <div className="font-garamond text-xs capitalize text-charcoal/50">{meal}</div>
                            <div className="font-garamond text-sm text-charcoal">{day.meals[meal].name}</div>
                          </div>
                          <div className="font-garamond text-xs text-saffron ml-2">
                            ${day.meals[meal].cost}
                          </div>
                        </div>
                      ) : null
                    )}
                  </div>
                )}

                {/* Transport */}
                {day.transport?.mode && (
                  <div className="font-garamond text-xs text-charcoal/40 flex items-center gap-2">
                    🚗 Transport: {day.transport.mode}
                    {day.transport.costINR > 0 && ` · ₹${day.transport.costINR}`}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* WEATHER */}
      {itinerary.weatherFull?.length > 0 && (
        <div className="bg-sand rounded-3xl p-8 mb-10">
          <h3 className="font-playfair text-2xl text-charcoal font-bold mb-6">
            🌤 Weather Forecast
          </h3>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {itinerary.weatherFull.map((w, i) => (
              <div key={i} className="bg-cream rounded-2xl p-4 text-center min-w-[100px]">
                <div className="font-garamond text-xs text-charcoal/50 mb-2">
                  {new Date(w.date).toLocaleDateString('en', { weekday: 'short', day: 'numeric' })}
                </div>
                <div className="text-3xl mb-2">
                  {w.condition === 'Sunny/Clear' ? '☀️' : w.condition === 'Rainy/Drizzle' ? '🌧️' : w.condition === 'Snowy' ? '❄️' : '⛈️'}
                </div>
                <div className="font-playfair text-lg text-charcoal font-bold">
                  {Math.round(w.tempMax)}°C
                </div>
                <div className="font-garamond text-xs text-charcoal/40">
                  {Math.round(w.tempMin)}°C
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* HOTELS */}
      {itinerary.hotels?.length > 0 && (
        <div className="mb-12">
          <div className="font-garamond text-xs uppercase tracking-widest text-terracotta mb-2">
            ✦ Where to Stay
          </div>
          <h3 className="font-playfair text-3xl text-charcoal font-bold mb-8">
            Hotel Options
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {itinerary.hotels.map((hotel, idx) => (
              <div
                key={idx}
                className="bg-sand rounded-3xl overflow-hidden border border-sand hover:border-saffron/40 hover:shadow-xl transition-all duration-300 group flex flex-col"
              >
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
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="font-playfair text-xl text-charcoal font-bold">{hotel.name}</h3>
                    <div className="font-garamond text-sm text-saffron">{'⭐'.repeat(hotel.stars)}</div>
                  </div>
                  <div className="font-garamond text-sm text-charcoal/60 mb-3">📍 {hotel.location}</div>
                  <div className="mb-1">
                    <div className="font-playfair text-2xl text-charcoal font-bold">{hotel.price}</div>
                    {hotel.priceINR && (
                      <div className="font-garamond text-sm text-charcoal/50">{hotel.priceINR}</div>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 mb-5 mt-3">
                    {hotel.perks.map((perk, pidx) => (
                      <div key={pidx} className="bg-cream font-garamond text-xs text-charcoal/70 px-3 py-1 rounded-full border border-sand">
                        {perk}
                      </div>
                    ))}
                  </div>
                  <button className="w-full mt-auto bg-charcoal text-cream font-garamond text-xs uppercase tracking-widest py-3 rounded-xl hover:bg-saffron hover:text-charcoal transition-all duration-300">
                    Book This Hotel →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* BUDGET BREAKDOWN */}
      {itinerary.budgetBreakdown?.length > 0 && (
        <div className="mt-12 bg-sand rounded-3xl p-8 md:p-10 mb-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div>
              <div className="font-garamond text-xs uppercase tracking-widest text-terracotta mb-2">
                ✦ Budget Breakdown
              </div>
              <h3 className="font-playfair text-3xl text-charcoal font-bold mb-6">
                {itinerary.totalBudget} total
              </h3>
              {itinerary.budgetBreakdown.map((item, idx) => (
                <div key={idx} className="mb-5 last:mb-0">
                  <div className="flex justify-between mb-2">
                    <span className="font-garamond text-sm text-charcoal/70">{item.category}</span>
                    <span className="font-playfair text-base text-charcoal font-semibold">{item.amount}</span>
                  </div>
                  <div className="w-full bg-cream rounded-full h-2">
                    <div
                      className={`${item.color} h-2 rounded-full transition-all duration-700`}
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Trip Summary Card */}
            <div className="bg-cream rounded-2xl p-6">
              <h3 className="font-playfair text-xl text-charcoal font-semibold mb-6">Trip Summary</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-4 border-b border-sand">
                  <span className="font-garamond text-sm text-charcoal/60">Destination</span>
                  <span className="font-playfair text-base text-charcoal font-semibold">{itinerary.destination}</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-sand">
                  <span className="font-garamond text-sm text-charcoal/60">Duration</span>
                  <span className="font-playfair text-base text-charcoal font-semibold">{itinerary.duration}</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-sand">
                  <span className="font-garamond text-sm text-charcoal/60">Best Time</span>
                  <span className="font-playfair text-base text-charcoal font-semibold">{itinerary.bestTime}</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-sand">
                  <span className="font-garamond text-sm text-charcoal/60">Weather</span>
                  <span className="font-playfair text-base text-charcoal font-semibold">{itinerary.weather}</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="font-garamond text-base text-charcoal/80 font-semibold">Total Budget</span>
                  <span className="font-playfair text-2xl text-saffron font-bold">{itinerary.totalBudget}</span>
                </div>

                {/* Save Button */}
                <button
                  onClick={handleSaveTrip}
                  disabled={saved}
                  className={`w-full mt-6 font-garamond text-sm uppercase tracking-widest py-4 rounded-xl transition-all duration-300
                    ${saved
                      ? 'bg-green-600 text-white cursor-default'
                      : 'bg-charcoal text-cream hover:bg-saffron hover:text-charcoal'
                    }`}
                >
                  {saved ? '✅ Itinerary Saved!' : '✦ Save This Itinerary'}
                </button>

                {!currentUser && (
                  <p className="text-center font-garamond text-xs text-charcoal/40 mt-2">
                    Login to save your trip
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PACKING LIST */}
      {itinerary.packingList?.length > 0 && (
        <div className="bg-sand rounded-3xl p-8 mb-10">
          <h3 className="font-playfair text-2xl text-charcoal font-bold mb-6">🎒 Packing List</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {itinerary.packingList.map((item, i) => (
              <div key={i} className="flex items-start gap-2 font-garamond text-sm text-charcoal/70">
                <span className="text-saffron shrink-0 mt-0.5">✓</span>
                {item}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TRAVEL TIPS */}
      {itinerary.travelTips?.length > 0 && (
        <div className="bg-sand rounded-3xl p-8 mb-10">
          <h3 className="font-playfair text-2xl text-charcoal font-bold mb-6">💡 Travel Tips</h3>
          <div className="space-y-3">
            {itinerary.travelTips.map((tip, i) => (
              <div key={i} className="flex items-start gap-3 font-garamond text-sm text-charcoal/70">
                <span className="text-saffron shrink-0 mt-0.5">→</span>
                {tip}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* BOTTOM ACTION BAR */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-sand rounded-2xl px-8 py-6">
        <div>
          <h3 className="font-playfair text-xl text-charcoal font-semibold">Love this itinerary?</h3>
          <p className="font-garamond text-sm text-charcoal/60">Book a verified guide to bring it to life.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button className="flex-1 md:flex-none bg-saffron text-charcoal font-garamond text-sm uppercase tracking-wider px-8 py-3 rounded-xl hover:bg-amber-500 transition-all duration-300">
            Book a Guide →
          </button>
          <button
            onClick={() => { setItinerary(null); setRawTrip(null); setError(null); setSaved(false) }}
            className="flex-1 md:flex-none border border-charcoal text-charcoal font-garamond text-sm uppercase tracking-wider px-8 py-3 rounded-xl hover:bg-charcoal hover:text-cream transition-all duration-300"
          >
            ← Plan Another
          </button>
        </div>
      </div>
    </div>
  )
}








// import { useState } from 'react'

// export default function TripPlanner() {
//   const [query, setQuery] = useState('')
//   const [nights, setNights] = useState('3')
//   const [budget, setBudget] = useState('150')
//   const [loading, setLoading] = useState(false)
//   const [itinerary, setItinerary] = useState(null)

//   const mockItinerary = {
//     destination: "Jaipur",
//     duration: "3 Nights / 4 Days",
//     totalBudget: "$150",
//     bestTime: "Oct – March",
//     weather: "25°C, Sunny",
//     heroImage: "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=1200&q=80",
//     highlights: ["Pink City", "Amber Fort", "Hawa Mahal", "Local Cuisine"],
//     days: [
//       {
//         day: 1,
//         title: "Arrival & the Pink City",
//         theme: "Heritage & Culture",
//         themeColor: "bg-saffron",
//         image: "https://images.unsplash.com/photo-1477587458883-47145ed6979c?w=600&q=80",
//         activities: [
//           { time: "09:00 AM", name: "Amber Fort", type: "Sightseeing", cost: "$5", duration: "2-3 hrs", tip: "Hire a local guide for ₹200 inside" },
//           { time: "12:30 PM", name: "Lunch at Lassiwala", type: "Food", cost: "$3", duration: "45 mins", tip: "Try the iconic Jaipur lassi" },
//           { time: "03:00 PM", name: "Hawa Mahal", type: "Sightseeing", cost: "$2", duration: "1 hr", tip: "Best photos from the café across the street" },
//           { time: "07:00 PM", name: "Chokhi Dhani Dinner", type: "Cultural", cost: "$12", duration: "3 hrs", tip: "Book in advance on weekends" }
//         ]
//       },
//       {
//         day: 2,
//         title: "Palaces & Bazaars",
//         theme: "Shopping & Royalty",
//         themeColor: "bg-terracotta",
//         image: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=600&q=80",
//         activities: [
//           { time: "08:00 AM", name: "City Palace", type: "Sightseeing", cost: "$8", duration: "2 hrs", tip: "Museum inside is worth it" },
//           { time: "11:00 AM", name: "Jantar Mantar", type: "Heritage", cost: "$4", duration: "1 hr", tip: "UNESCO World Heritage Site" },
//           { time: "02:00 PM", name: "Johari Bazaar Shopping", type: "Shopping", cost: "$20", duration: "2 hrs", tip: "Bargain for at least 30% off" },
//           { time: "07:00 PM", name: "Rooftop dinner, Old City", type: "Food", cost: "$10", duration: "1.5 hrs", tip: "Amazing fort views at night" }
//         ]
//       },
//       {
//         day: 3,
//         title: "Day Trip & Relaxation",
//         theme: "Nature & Leisure",
//         themeColor: "bg-deepblue",
//         image: "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=600&q=80",
//         activities: [
//           { time: "07:00 AM", name: "Nahargarh Fort Sunrise", type: "Sightseeing", cost: "$3", duration: "2 hrs", tip: "Best sunrise view in Jaipur" },
//           { time: "10:00 AM", name: "Jal Mahal Photo Stop", type: "Sightseeing", cost: "Free", duration: "30 mins", tip: "Can't enter but photos are stunning" },
//           { time: "01:00 PM", name: "Spice Market & Lunch", type: "Food", cost: "$6", duration: "1.5 hrs", tip: "Buy saffron and masala here" },
//           { time: "04:00 PM", name: "Spa & Wellness", type: "Leisure", cost: "$25", duration: "2 hrs", tip: "Several Ayurvedic spas in the area" }
//         ]
//       }
//     ],
//     hotels: [
//       {
//         name: "ITC Rajputana",
//         stars: 5,
//         price: "$95/night",
//         location: "MI Road, Central Jaipur",
//         image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=80",
//         perks: ["Pool", "Spa", "Heritage View", "Free Breakfast"],
//         badge: "Best Value",
//         badgeColor: "bg-saffron"
//       },
//       {
//         name: "Taj Rambagh Palace",
//         stars: 5,
//         price: "$120/night",
//         location: "Bhawani Singh Road",
//         image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=400&q=80",
//         perks: ["Palace Grounds", "Fine Dining", "Polo Field", "Butler"],
//         badge: "Luxury Pick",
//         badgeColor: "bg-terracotta"
//       },
//       {
//         name: "Pearl Palace Heritage",
//         stars: 3,
//         price: "$35/night",
//         location: "Hari Kishan Somani Marg",
//         image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&q=80",
//         perks: ["Rooftop Café", "Free WiFi", "City Center", "AC Rooms"],
//         badge: "Budget Pick",
//         badgeColor: "bg-green-600"
//       }
//     ],
//     budgetBreakdown: [
//       { category: "Accommodation", amount: "$105", percentage: 70, color: "bg-saffron" },
//       { category: "Food & Drinks", amount: "$21", percentage: 14, color: "bg-terracotta" },
//       { category: "Sightseeing", amount: "$15", percentage: 10, color: "bg-deepblue" },
//       { category: "Shopping", amount: "$9", percentage: 6, color: "bg-charcoal" }
//     ]
//   }

//   function handleGenerate(e) {
//     e.preventDefault()
//     if (!query) return
//     setLoading(true)
//     setItinerary(null)
//     // Simulate AI response delay
//     setTimeout(() => {
//       setItinerary(mockItinerary)
//       setLoading(false)
//     }, 2000)
//   }

//   // STATE A: No itinerary yet
//   if (!itinerary && !loading) {
//     return (
//       <div className="py-16">
//         {/* Top Label */}
//         <div className="text-center mb-3">
//           <span className="font-garamond text-xs uppercase tracking-widest text-terracotta">
//             ✦ Powered by Gemini AI
//           </span>
//         </div>

//         {/* Headline */}
//         <div className="text-center mb-2">
//           <h2 className="font-playfair text-5xl md:text-6xl text-charcoal font-bold italic">
//             Plan your perfect
//           </h2>
//         </div>

//         <div className="text-center mb-10">
//           <h2 className="font-playfair text-5xl md:text-6xl text-saffron font-bold italic">
//             Indian journey.
//           </h2>
//         </div>

//         {/* Trip Form Card */}
//         <div className="bg-sand rounded-3xl p-8 md:p-10 max-w-2xl mx-auto shadow-sm">
//           <form onSubmit={handleGenerate} className="space-y-5">
//             <h3 className="font-playfair text-2xl text-charcoal font-semibold mb-6">
//               Where do you want to go?
//             </h3>

//             {/* Destination Field */}
//             <div>
//               <label className="font-garamond text-xs uppercase tracking-widest text-charcoal/60 mb-2 block">
//                 Destination
//               </label>
//               <input
//                 type="text"
//                 placeholder="e.g. Jaipur, Varanasi, Kerala..."
//                 value={query}
//                 onChange={(e) => setQuery(e.target.value)}
//                 className="w-full bg-cream border border-cream focus:border-saffron focus:outline-none font-garamond text-lg text-charcoal px-5 py-4 rounded-2xl transition-colors"
//               />
//             </div>

//             {/* Two Column: Nights & Budget */}
//             <div className="grid grid-cols-2 gap-4">
//               <div>
//                 <label className="font-garamond text-xs uppercase tracking-widest text-charcoal/60 mb-2 block">
//                   Number of Nights
//                 </label>
//                 <select
//                   value={nights}
//                   onChange={(e) => setNights(e.target.value)}
//                   className="w-full bg-cream border border-cream focus:border-saffron focus:outline-none font-garamond text-lg text-charcoal px-5 py-4 rounded-2xl transition-colors"
//                 >
//                   {[1, 2, 3, 4, 5, 6, 7, 10, 14].map((n) => (
//                     <option key={n} value={n}>
//                       {n}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               <div>
//                 <label className="font-garamond text-xs uppercase tracking-widest text-charcoal/60 mb-2 block">
//                   Budget (USD)
//                 </label>
//                 <input
//                   type="number"
//                   min="50"
//                   max="5000"
//                   placeholder="e.g. 150"
//                   value={budget}
//                   onChange={(e) => setBudget(e.target.value)}
//                   className="w-full bg-cream border border-cream focus:border-saffron focus:outline-none font-garamond text-lg text-charcoal px-5 py-4 rounded-2xl transition-colors"
//                 />
//               </div>
//             </div>

//             {/* Quick Suggestion Pills */}
//             <div>
//               <span className="font-garamond text-xs text-charcoal/50 mb-2 block">
//                 Popular trips:
//               </span>
//               <div className="flex flex-wrap gap-2">
//                 {[
//                   { label: "🏯 Jaipur 3N", dest: "Jaipur" },
//                   { label: "🕌 Agra 2N", dest: "Agra" },
//                   { label: "🛕 Varanasi 4N", dest: "Varanasi" },
//                   { label: "🏖️ Goa 5N", dest: "Goa" },
//                   { label: "🌿 Kerala 6N", dest: "Kerala" }
//                 ].map((pill) => (
//                   <button
//                     key={pill.dest}
//                     type="button"
//                     onClick={() => setQuery(pill.dest)}
//                     className="bg-cream border border-sand font-garamond text-xs text-charcoal/70 px-4 py-2 rounded-full cursor-pointer hover:border-saffron hover:text-saffron transition-all duration-200"
//                   >
//                     {pill.label}
//                   </button>
//                 ))}
//               </div>
//             </div>

//             {/* Generate Button */}
//             <button
//               type="submit"
//               className="w-full bg-charcoal text-cream font-garamond text-base uppercase tracking-widest py-5 rounded-2xl hover:bg-saffron hover:text-charcoal transition-all duration-300 mt-4"
//             >
//               ✦ Generate My Itinerary
//             </button>
//           </form>
//         </div>

//         {/* Trust Badges */}
//         <div className="flex justify-center gap-8 mt-8">
//           <div className="flex items-center gap-2 font-garamond text-sm text-charcoal/50">
//             <span>⚡</span>
//             <span>Ready in 3 seconds</span>
//           </div>
//           <div className="flex items-center gap-2 font-garamond text-sm text-charcoal/50">
//             <span>📸</span>
//             <span>Photos included</span>
//           </div>
//           <div className="flex items-center gap-2 font-garamond text-sm text-charcoal/50">
//             <span>💰</span>
//             <span>Budget optimized</span>
//           </div>
//         </div>
//       </div>
//     )
//   }

//   // STATE B: Loading
//   if (loading) {
//     return (
//       <div className="py-24 text-center">
//         {/* Pulsing Logo */}
//         <div className="font-playfair text-5xl text-charcoal font-bold animate-pulse mb-6">
//           SafarSathi
//         </div>

//         {/* Loading Text */}
//         <div className="font-garamond text-lg text-charcoal/60 mb-2">
//           Crafting your perfect itinerary...
//         </div>

//         {/* Subtext */}
//         <div className="font-garamond text-sm text-charcoal/40 mb-8">
//           Gemini AI is planning your trip to {query}
//         </div>

//         {/* Progress Dots */}
//         <div className="flex justify-center gap-3 mt-8">
//           <div
//             className="w-3 h-3 rounded-full bg-saffron animate-bounce"
//             style={{ animationDelay: '0ms' }}
//           ></div>
//           <div
//             className="w-3 h-3 rounded-full bg-saffron animate-bounce"
//             style={{ animationDelay: '150ms' }}
//           ></div>
//           <div
//             className="w-3 h-3 rounded-full bg-saffron animate-bounce"
//             style={{ animationDelay: '300ms' }}
//           ></div>
//         </div>
//       </div>
//     )
//   }

//   // STATE C: Itinerary loaded (full display)
//   return (
//     <div className="page-fade-in">
//       {/* SECTION 1 — HERO BANNER */}
//       <div className="relative rounded-3xl overflow-hidden h-72 md:h-96 mb-10">
//         {/* Background Image */}
//         <img
//           src={itinerary.heroImage}
//           alt={itinerary.destination}
//           className="absolute inset-0 w-full h-full object-cover"
//         />

//         {/* Gradient Overlay */}
//         <div
//           className="absolute inset-0"
//           style={{
//             background: 'linear-gradient(to right, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)'
//           }}
//         ></div>

//         {/* Content */}
//         <div className="absolute inset-0 flex items-end p-8 md:p-12">
//           <div className="flex-1">
//             <div className="font-garamond text-xs uppercase tracking-widest text-saffron mb-2">
//               ✦ Your AI Itinerary
//             </div>
//             <h1 className="font-playfair text-5xl md:text-6xl text-white font-bold italic mb-1">
//               {itinerary.destination}
//             </h1>
//             <div className="flex items-center gap-4 font-garamond text-base text-white/80 mb-4">
//               <span>{itinerary.duration}</span>
//               <span>·</span>
//               <span>Budget: {itinerary.totalBudget}</span>
//             </div>
//             <div className="flex flex-wrap gap-2">
//               {itinerary.highlights.map((highlight, idx) => (
//                 <div
//                   key={idx}
//                   className="bg-white/20 backdrop-blur-sm text-white font-garamond text-xs px-3 py-1 rounded-full"
//                 >
//                   {highlight}
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>

//         {/* Weather Card - Top Right */}
//         <div className="absolute top-6 right-6 bg-cream/95 backdrop-blur-sm rounded-2xl px-5 py-4 shadow-xl text-right">
//           <div className="font-playfair text-2xl text-charcoal font-bold">
//             {itinerary.weather}
//           </div>
//           <div className="font-garamond text-xs text-charcoal/50 uppercase tracking-wider mt-1">
//             Best: {itinerary.bestTime}
//           </div>
//         </div>

//         {/* Back Button - Top Left */}
//         <button
//           onClick={() => setItinerary(null)}
//           className="absolute top-6 left-6 bg-white/20 backdrop-blur-sm text-white font-garamond text-xs uppercase tracking-wider px-4 py-2 rounded-full cursor-pointer hover:bg-white/30 transition-all"
//         >
//           ← New Trip
//         </button>
//       </div>

//       {/* SECTION 2 — DAY BY DAY ITINERARY */}
//       <div className="mb-12">
//         <div className="mb-8">
//           <div className="font-garamond text-xs uppercase tracking-widest text-terracotta mb-2">
//             ✦ Day by Day
//           </div>
//           <h2 className="font-playfair text-3xl text-charcoal font-bold">
//             Your Journey Unfolds
//           </h2>
//         </div>

//         {itinerary.days.map((day) => (
//           <div
//             key={day.day}
//             className="bg-sand rounded-3xl overflow-hidden border border-sand hover:border-saffron/30 transition-all duration-300 mb-8 grid grid-cols-1 md:grid-cols-3"
//           >
//             {/* LEFT — Day Image */}
//             <div className="relative h-48 md:h-full min-h-48">
//               <img
//                 src={day.image}
//                 alt={day.title}
//                 className="absolute inset-0 w-full h-full object-cover"
//               />

//               {/* Day Badge */}
//               <div className="absolute top-4 left-4 bg-cream/95 backdrop-blur-sm rounded-xl px-4 py-2">
//                 <div className="font-playfair text-lg font-bold text-charcoal">
//                   Day {day.day}
//                 </div>
//                 <div className="font-garamond text-xs text-charcoal/60">
//                   {day.title}
//                 </div>
//               </div>

//               {/* Theme Badge */}
//               <div
//                 className={`absolute bottom-4 left-4 text-white font-garamond text-xs uppercase tracking-wider px-3 py-1 rounded-full ${day.themeColor}`}
//               >
//                 {day.theme}
//               </div>
//             </div>

//             {/* RIGHT — Activities */}
//             <div className="md:col-span-2 p-6 md:p-8">
//               <div className="font-garamond text-xs uppercase tracking-widest text-charcoal/40 mb-4">
//                 Schedule
//               </div>

//               {day.activities.map((activity, idx) => (
//                 <div
//                   key={idx}
//                   className="flex items-start gap-4 mb-5 last:mb-0 pb-5 last:pb-0 border-b border-sand/80 last:border-0"
//                 >
//                   {/* Time */}
//                   <div className="w-20 shrink-0 font-garamond text-xs text-charcoal/50 uppercase tracking-wider pt-1">
//                     {activity.time}
//                   </div>

//                   {/* Timeline Dot */}
//                   <div className="flex flex-col items-center pt-1 mr-2">
//                     <div className="w-2 h-2 rounded-full bg-saffron shrink-0"></div>
//                     <div className="w-px flex-1 bg-sand mt-1"></div>
//                   </div>

//                   {/* Activity Details */}
//                   <div className="flex-1">
//                     {/* Name & Cost */}
//                     <div className="flex items-start justify-between gap-2 mb-1">
//                       <div className="font-playfair text-base text-charcoal font-semibold">
//                         {activity.name}
//                       </div>
//                       <div className="bg-cream font-garamond text-xs text-charcoal/70 px-3 py-1 rounded-full border border-sand whitespace-nowrap">
//                         {activity.cost}
//                       </div>
//                     </div>

//                     {/* Type & Duration */}
//                     <div className="flex items-center gap-3 mt-1 mb-1">
//                       <span className="font-garamond text-xs text-charcoal/50 uppercase tracking-wider">
//                         {activity.type}
//                       </span>
//                       <span className="w-1 h-1 rounded-full bg-charcoal/20"></span>
//                       <span className="font-garamond text-xs text-charcoal/50">
//                         {activity.duration}
//                       </span>
//                     </div>

//                     {/* Tip */}
//                     <div className="flex items-start gap-2 mt-2">
//                       <span className="text-xs">💡</span>
//                       <span className="font-garamond text-xs text-charcoal/60 italic">
//                         {activity.tip}
//                       </span>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* SECTION 3 — HOTEL COMPARISON */}
//       <div className="mt-12 mb-12">
//         <div className="mb-8">
//           <div className="font-garamond text-xs uppercase tracking-widest text-terracotta mb-2">
//             ✦ Where to Stay
//           </div>
//           <h2 className="font-playfair text-3xl text-charcoal font-bold">
//             Hotel Comparison
//           </h2>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//           {itinerary.hotels.map((hotel, idx) => (
//             <div
//               key={idx}
//               className="bg-sand rounded-3xl overflow-hidden border border-sand hover:border-saffron/40 hover:shadow-xl transition-all duration-300 group flex flex-col"
//             >
//               {/* Image */}
//               <div className="relative h-44 overflow-hidden">
//                 <img
//                   src={hotel.image}
//                   alt={hotel.name}
//                   className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
//                 />
//                 <div className={`absolute top-3 left-3 text-white font-garamond text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full ${hotel.badgeColor}`}>
//                   {hotel.badge}
//                 </div>
//               </div>

//               {/* Body */}
//               <div className="p-6 flex flex-col flex-1">
//                 {/* Name & Stars */}
//                 <div className="flex items-start justify-between mb-1">
//                   <h3 className="font-playfair text-xl text-charcoal font-bold">
//                     {hotel.name}
//                   </h3>
//                   <div className="font-garamond text-sm text-saffron whitespace-nowrap">
//                     {'⭐'.repeat(hotel.stars)}
//                   </div>
//                 </div>

//                 {/* Location */}
//                 <div className="font-garamond text-sm text-charcoal/60 mb-3">
//                   📍 {hotel.location}
//                 </div>

//                 {/* Price */}
//                 <div className="mb-4">
//                   <div className="font-playfair text-2xl text-charcoal font-bold">
//                     {hotel.price}
//                   </div>
//                   <span className="font-garamond text-xs text-charcoal/50">per night</span>
//                 </div>

//                 {/* Perks */}
//                 <div className="flex flex-wrap gap-2 mb-5">
//                   {hotel.perks.map((perk, pidx) => (
//                     <div
//                       key={pidx}
//                       className="bg-cream font-garamond text-xs text-charcoal/70 px-3 py-1 rounded-full border border-sand"
//                     >
//                       {perk}
//                     </div>
//                   ))}
//                 </div>

//                 {/* Book Button */}
//                 <button className="w-full mt-auto bg-charcoal text-cream font-garamond text-xs uppercase tracking-widest py-3 rounded-xl hover:bg-saffron hover:text-charcoal transition-all duration-300 text-center">
//                   Book This Hotel →
//                 </button>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* SECTION 4 — BUDGET BREAKDOWN */}
//       <div className="mt-12 bg-sand rounded-3xl p-8 md:p-10 mb-10">
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
//           {/* LEFT — Budget Bars */}
//           <div>
//             <div className="mb-6">
//               <div className="font-garamond text-xs uppercase tracking-widest text-terracotta mb-2">
//                 ✦ Budget Breakdown
//               </div>
//               <h3 className="font-playfair text-3xl text-charcoal font-bold">
//                 {itinerary.totalBudget} total
//               </h3>
//             </div>

//             {itinerary.budgetBreakdown.map((item, idx) => (
//               <div key={idx} className="mb-5 last:mb-0">
//                 {/* Category & Amount */}
//                 <div className="flex justify-between mb-2">
//                   <span className="font-garamond text-sm text-charcoal/70">
//                     {item.category}
//                   </span>
//                   <span className="font-playfair text-base text-charcoal font-semibold">
//                     {item.amount}
//                   </span>
//                 </div>
//                 {/* Progress Bar */}
//                 <div className="w-full bg-cream rounded-full h-2">
//                   <div
//                     className={`${item.color} h-2 rounded-full transition-all duration-700`}
//                     style={{ width: item.percentage + '%' }}
//                   ></div>
//                 </div>
//               </div>
//             ))}
//           </div>

//           {/* RIGHT — Summary Card */}
//           <div className="bg-cream rounded-2xl p-6">
//             <h3 className="font-playfair text-xl text-charcoal font-semibold mb-6">
//               Trip Summary
//             </h3>

//             <div className="space-y-4">
//               {/* Row 1 */}
//               <div className="flex justify-between items-center pb-4 border-b border-sand">
//                 <span className="font-garamond text-sm text-charcoal/60">Destination</span>
//                 <span className="font-playfair text-base text-charcoal font-semibold">
//                   {itinerary.destination}
//                 </span>
//               </div>

//               {/* Row 2 */}
//               <div className="flex justify-between items-center pb-4 border-b border-sand">
//                 <span className="font-garamond text-sm text-charcoal/60">Duration</span>
//                 <span className="font-playfair text-base text-charcoal font-semibold">
//                   {itinerary.duration}
//                 </span>
//               </div>

//               {/* Row 3 */}
//               <div className="flex justify-between items-center pb-4 border-b border-sand">
//                 <span className="font-garamond text-sm text-charcoal/60">Best Time</span>
//                 <span className="font-playfair text-base text-charcoal font-semibold">
//                   {itinerary.bestTime}
//                 </span>
//               </div>

//               {/* Row 4 */}
//               <div className="flex justify-between items-center pb-4 border-b border-sand">
//                 <span className="font-garamond text-sm text-charcoal/60">Weather</span>
//                 <span className="font-playfair text-base text-charcoal font-semibold">
//                   {itinerary.weather}
//                 </span>
//               </div>

//               {/* Row 5 — Total */}
//               <div className="flex justify-between items-center pt-2">
//                 <span className="font-garamond text-base text-charcoal/80 font-semibold">
//                   Total Budget
//                 </span>
//                 <span className="font-playfair text-2xl text-saffron font-bold">
//                   {itinerary.totalBudget}
//                 </span>
//               </div>

//               {/* Save Button */}
//               <button className="w-full mt-6 bg-charcoal text-cream font-garamond text-sm uppercase tracking-widest py-4 rounded-xl hover:bg-saffron hover:text-charcoal transition-all duration-300">
//                 ✦ Save This Itinerary
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* BOTTOM ACTION BAR */}
//       <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-sand rounded-2xl px-8 py-6">
//         <div>
//           <h3 className="font-playfair text-xl text-charcoal font-semibold">
//             Love this itinerary?
//           </h3>
//           <p className="font-garamond text-sm text-charcoal/60">
//             Book a verified guide to bring it to life.
//           </p>
//         </div>
//         <div className="flex gap-3 w-full md:w-auto">
//           <button className="flex-1 md:flex-none bg-saffron text-charcoal font-garamond text-sm uppercase tracking-wider px-8 py-3 rounded-xl hover:bg-amber-500 transition-all duration-300">
//             Book a Guide →
//           </button>
//           <button
//             onClick={() => setItinerary(null)}
//             className="flex-1 md:flex-none border border-charcoal text-charcoal font-garamond text-sm uppercase tracking-wider px-8 py-3 rounded-xl hover:bg-charcoal hover:text-cream transition-all duration-300"
//           >
//             ← Plan Another
//           </button>
//         </div>
//       </div>
//     </div>
//   )
// }
