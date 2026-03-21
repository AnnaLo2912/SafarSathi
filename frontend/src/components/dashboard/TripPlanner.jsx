import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { auth } from '../../firebase'
import { FiDollarSign, FiMapPin, FiPackage, FiBriefcase, FiAward } from 'react-icons/fi'
import { getPlaceImage } from '../../services/unsplash'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001'

// ── Reusable hook: fetch one Unsplash image ───────────────────
function useUnsplashImage(query, enabled = true) {
  const [imgUrl, setImgUrl] = useState(null)

  useEffect(() => {
    if (!query || !enabled) return
    let cancelled = false
    getPlaceImage(query).then((url) => {
      if (!cancelled && url) setImgUrl(url)
    })
    return () => { cancelled = true }
  }, [query, enabled])

  return imgUrl
}

// ── Hero banner image (destination) ──────────────────────────
function HeroBanner({ itinerary }) {
  const heroImg = useUnsplashImage(`${itinerary.destination} India travel landscape`)

  return (
    <div className="relative rounded-3xl overflow-hidden mb-10 h-72 md:h-96">
      {/* Image — dynamic or soft placeholder */}
      <div
        className="absolute inset-0 bg-charcoal transition-all duration-700"
        style={heroImg ? {
          backgroundImage: `url(${heroImg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        } : {}}
      />
      {/* Shimmer while loading */}
      {!heroImg && (
        <div className="absolute inset-0 bg-gradient-to-r from-charcoal via-charcoal/80 to-charcoal animate-pulse" />
      )}
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
          {itinerary.startDate && itinerary.endDate && (
            <span>🗓 {new Date(itinerary.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} → {itinerary.endDate}</span>
          )}
          <span className="flex items-center gap-2"><FiDollarSign size={16} /> {itinerary.totalBudget} budget</span>
          <span>🌤 {itinerary.weather}</span>
        </div>
      </div>
    </div>
  )
}

// ── Day card with dynamic day image ──────────────────────────
function DayCard({ day, destination }) {
  const dayImg = useUnsplashImage(`${day.title} ${destination}`)

  return (
    <div className="bg-sand rounded-3xl overflow-hidden">
      {/* Day Header */}
      <div className={`${day.themeColor} px-8 py-4 flex items-center justify-between`}>
        <div>
          <div className="font-garamond text-xs uppercase tracking-widest text-white/70">
            Day {day.day}{day.dayDate ? ` · ${day.dayDate}` : ''}
          </div>
          <h4 className="font-playfair text-xl text-white font-bold">
            {day.title}
          </h4>
        </div>
        {day.dayTotal > 0 && (
          <div className="text-right">
            <div className="font-garamond text-xs text-white/60">Est. cost</div>
            <div className="font-playfair text-lg text-white font-bold">${day.dayTotal}</div>
          </div>
        )}
      </div>

      {/* Day Image */}
      {dayImg && (
        <div className="h-40 overflow-hidden">
          <img
            src={dayImg}
            alt={day.title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
          />
        </div>
      )}
      {!dayImg && (
        <div className="h-40 bg-charcoal/10 animate-pulse flex items-center justify-center text-4xl opacity-20">
          🗺️
        </div>
      )}

      {/* Activities — hotel-style grid, equal height cards */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 items-stretch">
          {day.activities.map((act, idx) => (
            <ActivityRow key={idx} activity={act} destination={destination} />
          ))}
        </div>

        {/* Meals */}
        {day.meals && (
          <div className="mb-4">
            <div className="font-garamond text-xs uppercase tracking-widest text-charcoal/40 mb-3">🍽 Meals</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {['breakfast', 'lunch', 'dinner'].map((meal) =>
                day.meals[meal] ? (
                  <div key={meal} className="bg-cream rounded-2xl px-5 py-4 flex items-center gap-4">
                    <span className="text-2xl shrink-0">
                      {meal === 'breakfast' ? '🌅' : meal === 'lunch' ? '☀️' : '🌙'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="font-garamond text-xs uppercase tracking-widest text-charcoal/40 mb-0.5 capitalize">{meal}</div>
                      <div className="font-playfair text-base text-charcoal font-semibold truncate">{day.meals[meal].name}</div>
                    </div>
                    <div className="font-playfair text-base text-saffron font-bold shrink-0">
                      ${day.meals[meal].cost}
                    </div>
                  </div>
                ) : null
              )}
            </div>
          </div>
        )}

        {/* Transport */}
        {day.transport?.mode && (
          <div className="bg-cream rounded-2xl px-5 py-4 flex items-center gap-4">
            <span className="text-2xl shrink-0">🚗</span>
            <div className="flex-1">
              <div className="font-garamond text-xs uppercase tracking-widest text-charcoal/40 mb-0.5">Transport</div>
              <div className="font-playfair text-base text-charcoal font-semibold">{day.transport.mode}</div>
            </div>
            {day.transport.costINR > 0 && (
              <div className="font-playfair text-base text-charcoal/60 font-semibold shrink-0">
                ₹{day.transport.costINR}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Individual activity row with inline image ─────────────────
function ActivityRow({ activity, destination }) {
  const actImg = useUnsplashImage(`${activity.name} ${destination}`)

  return (
    <div className="bg-cream rounded-2xl overflow-hidden flex flex-col">
      {/* Image with overlaid badges — fixed height */}
      <div className="relative shrink-0">
        {actImg ? (
          <div className="h-48 overflow-hidden">
            <img
              src={actImg}
              alt={activity.name}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
            />
          </div>
        ) : (
          <div className="h-48 bg-sand animate-pulse flex items-center justify-center text-5xl opacity-20">
            🏛️
          </div>
        )}
        {/* Time badge */}
        <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm text-white font-garamond text-sm px-3 py-1.5 rounded-full">
          🕐 {activity.time}
        </div>
        {/* Cost badge */}
        <div className={`absolute top-3 right-3 bg-black/60 backdrop-blur-sm font-playfair text-sm font-bold px-3 py-1.5 rounded-full ${activity.cost === 'Free' ? 'text-green-300' : 'text-yellow-300'}`}>
          {activity.cost}
        </div>
      </div>

      {/* Text content — flex-1 so all cards stretch to same height */}
      <div className="px-5 py-5 flex flex-col flex-1">
        {/* Name */}
        <h5 className="font-playfair text-lg text-charcoal font-bold leading-snug mb-1">
          {activity.name}
        </h5>

        {/* INR cost */}
        {activity.costINR !== 'Free' && (
          <div className="font-garamond text-base text-charcoal/60 font-semibold mb-3">
            {activity.costINR}
          </div>
        )}

        {/* Category + duration */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <span className="font-garamond text-sm font-semibold text-charcoal/70 bg-sand px-3 py-1 rounded-full">
            {activity.type}
          </span>
          <span className="font-garamond text-sm text-charcoal/50 flex items-center gap-1">
            ⏱ {activity.duration}
          </span>
        </div>

        {/* Tip — flex-1 pushes Maps button to bottom */}
        <div className="flex-1">
          {activity.tip && (
            <div className="font-garamond text-sm text-charcoal/65 italic bg-sand rounded-xl px-4 py-3 leading-relaxed">
              💡 {activity.tip}
            </div>
          )}
        </div>

        {/* Google Maps button — always at bottom */}
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activity.name + ' ' + destination)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full mt-4 bg-white border-2 border-sand hover:border-blue-400 hover:bg-blue-50 text-charcoal font-garamond text-sm font-semibold py-2.5 rounded-xl transition-all duration-300 group"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#EA4335"/>
            <circle cx="12" cy="9" r="2.5" fill="white"/>
          </svg>
          <span className="group-hover:text-blue-600 transition-colors duration-200">View on Google Maps</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="opacity-40 group-hover:opacity-70 group-hover:translate-x-0.5 transition-all duration-200">
            <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </a>
      </div>
    </div>
  )
}

// ── Hotel card with dynamic image ────────────────────────────
function HotelCard({ hotel }) {
  const hotelImg = useUnsplashImage(`${hotel.name} hotel`)

  return (
    <div className="bg-sand rounded-3xl overflow-hidden border border-sand hover:border-saffron/40 hover:shadow-xl transition-all duration-300 group flex flex-col">
      <div className="relative h-44 overflow-hidden">
        {hotelImg ? (
          <img
            src={hotelImg}
            alt={hotel.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full bg-charcoal/10 animate-pulse flex items-center justify-center text-4xl opacity-20">
            🏨
          </div>
        )}
        <div className={`absolute top-3 left-3 text-white font-garamond text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full ${hotel.badgeColor}`}>
          {hotel.badge}
        </div>
      </div>

      <div className="p-6 flex flex-col flex-1">
        <div className="flex items-start justify-between mb-1">
          <h3 className="font-playfair text-xl text-charcoal font-bold">{hotel.name}</h3>
          <div className="font-garamond text-sm text-saffron">{'⭐'.repeat(hotel.stars)}</div>
        </div>
        <div className="font-garamond text-sm text-charcoal/60 mb-3 flex items-center gap-2">
          <FiMapPin size={16} /> {hotel.location}
        </div>
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
  )
}

// ── Main TripPlanner ──────────────────────────────────────────
export default function TripPlanner() {
  const [query,     setQuery]     = useState('')
  const [nights,    setNights]    = useState('3')
  const [budget,    setBudget]    = useState('150')
  const [travelers, setTravelers] = useState('1')
  const [tripStyle, setTripStyle] = useState('budget')
  const [startDate, setStartDate] = useState('')
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState(null)
  const [itinerary, setItinerary] = useState(null)
  const [rawTrip,   setRawTrip]   = useState(null)
  const [saved,     setSaved]     = useState(false)

  const { currentUser } = useAuth()

  // ── Call Backend ────────────────────────────────────────────
  async function handleGenerate(e) {
    e.preventDefault()
    if (!query.trim()) return

    setLoading(true)
    setError(null)
    setItinerary(null)
    setSaved(false)

    try {
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
          startDate:   startDate || undefined,
        }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.message || 'Failed to generate itinerary')

      setRawTrip(data.trip)

      const trip = data.trip
      setItinerary({
        destination: trip.destination,
        duration:    `${trip.duration} Nights / ${trip.duration + 1} Days`,
        totalBudget: `$${trip.budget}`,
        summary:     trip.summary,
        highlights:  trip.highlights || [],
        bestTime:    'Oct – March',
        startDate:   startDate || null,
        endDate:     startDate
          ? (() => { const d = new Date(startDate); d.setDate(d.getDate() + trip.duration); return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) })()
          : null,
        weather:     trip.weather?.length > 0
          ? `${Math.round(trip.weather[0].tempMax)}°C, ${trip.weather[0].condition}`
          : 'Check local forecast',
        weatherFull: trip.weather || [],

        days: (trip.dayPlans || []).map((day) => {
          // Compute actual date for each day if startDate provided
          let dayDate = null
          if (startDate) {
            const d = new Date(startDate)
            d.setDate(d.getDate() + (day.day - 1))
            dayDate = d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })
          }
          return {
            day:        day.day,
            dayDate,
            title:      day.title,
            theme:      'Culture & Exploration',
            themeColor: ['bg-saffron', 'bg-terracotta', 'bg-deepblue'][(day.day - 1) % 3],
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
          }
        }),

        hotels: (trip.hotelOptions || []).map((h, i) => ({
          name:       h.name,
          stars:      h.stars   || 3,
          price:      `$${h.pricePerNight}/night`,
          priceINR:   h.priceINR ? `₹${h.priceINR.toLocaleString('en-IN')}/night` : '',
          rating:     h.rating  || 4.0,
          location:   trip.destination,
          perks:      h.amenities || [],
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

  // ── Save Trip ───────────────────────────────────────────────
  async function handleSaveTrip() {
    if (!rawTrip?._id) return
    if (!currentUser) { alert('Please login to save your trip!'); return }

    try {
      const token = await auth.currentUser.getIdToken()
      const response = await fetch(`${BACKEND_URL}/api/trips/${rawTrip._id}/save`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      if (data.success) setSaved(true)
    } catch {
      alert('Failed to save trip. Please try again.')
    }
  }

  // ── STATE A: Empty form ─────────────────────────────────────
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

        {error && (
          <div className="max-w-2xl mx-auto mb-6 bg-red-50 border border-red-200 text-red-600 font-garamond text-sm px-4 py-3 rounded-xl">
            ❌ {error}
          </div>
        )}

        <div className="bg-sand rounded-3xl p-8 md:p-10 max-w-2xl mx-auto shadow-sm">
          <form onSubmit={handleGenerate} className="space-y-5">
            <h3 className="font-playfair text-2xl text-charcoal font-semibold mb-6">
              Where do you want to go?
            </h3>

            <div>
              <label className="font-garamond text-xs uppercase tracking-widest text-charcoal/60 mb-2 block">Destination</label>
              <input
                type="text"
                placeholder="e.g. Jaipur, Varanasi, Kerala..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-cream border border-cream focus:border-saffron focus:outline-none font-garamond text-lg text-charcoal px-5 py-4 rounded-2xl transition-colors"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-garamond text-xs uppercase tracking-widest text-charcoal/60 mb-2 block">Travel Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-cream border border-cream focus:border-saffron focus:outline-none font-garamond text-lg text-charcoal px-5 py-4 rounded-2xl transition-colors"
                />
              </div>
              <div>
                <label className="font-garamond text-xs uppercase tracking-widest text-charcoal/60 mb-2 block">Number of Nights</label>
                <select value={nights} onChange={(e) => setNights(e.target.value)}
                  className="w-full bg-cream border border-cream focus:border-saffron focus:outline-none font-garamond text-lg text-charcoal px-5 py-4 rounded-2xl transition-colors">
                  {[1,2,3,4,5,6,7,10,14].map((n) => (
                    <option key={n} value={n}>{n} night{n > 1 ? 's' : ''}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-garamond text-xs uppercase tracking-widest text-charcoal/60 mb-2 block">Budget (USD)</label>
                <input type="number" min="50" value={budget} onChange={(e) => setBudget(e.target.value)}
                  className="w-full bg-cream border border-cream focus:border-saffron focus:outline-none font-garamond text-lg text-charcoal px-5 py-4 rounded-2xl transition-colors" />
              </div>
              <div>
                <label className="font-garamond text-xs uppercase tracking-widest text-charcoal/60 mb-2 block">Travelers</label>
                <select value={travelers} onChange={(e) => setTravelers(e.target.value)}
                  className="w-full bg-cream border border-cream focus:border-saffron focus:outline-none font-garamond text-lg text-charcoal px-5 py-4 rounded-2xl transition-colors">
                  {[1,2,3,4,5,6].map((n) => (
                    <option key={n} value={n}>{n} {n === 1 ? 'person' : 'people'}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="font-garamond text-xs uppercase tracking-widest text-charcoal/60 mb-2 block">Trip Style</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'budget',  label: '🎒 Budget',  desc: 'Affordable & local' },
                  { value: 'comfort', label: '🏨 Comfort', desc: 'Mid-range & relaxed' },
                  { value: 'luxury',  label: '✨ Luxury',  desc: 'Premium & exclusive' },
                ].map((style) => (
                  <button
                    key={style.value}
                    type="button"
                    onClick={() => setTripStyle(style.value)}
                    className={`rounded-2xl px-4 py-3 text-left transition-all duration-200 border-2
                      ${tripStyle === style.value
                        ? 'border-saffron bg-saffron/10'
                        : 'border-sand bg-cream hover:border-saffron/40'
                      }`}
                  >
                    <div className="font-garamond text-sm font-semibold text-charcoal">{style.label}</div>
                    <div className="font-garamond text-xs text-charcoal/50 mt-0.5">{style.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <button type="submit" disabled={!query.trim()}
              className="w-full bg-charcoal text-cream font-garamond text-sm uppercase tracking-widest py-5 rounded-2xl hover:bg-saffron hover:text-charcoal transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mt-4">
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

  // ── STATE B: Loading ────────────────────────────────────────
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
          {['Researching attractions...','Finding best hotels...','Checking weather...','Calculating budget...'].map((msg, i) => (
            <div key={i} className="bg-sand font-garamond text-xs text-charcoal/50 px-4 py-2 rounded-full animate-pulse"
              style={{ animationDelay: `${i * 0.3}s` }}>
              {msg}
            </div>
          ))}
        </div>
      </div>
    )
  }

  // ── STATE C: Show Itinerary ─────────────────────────────────
  return (
    <div>
      {/* HERO — dynamic image */}
      <HeroBanner itinerary={itinerary} />

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

      {/* DAY PLANS — each day has its own image + activity images */}
      <div className="mb-12">
        <div className="font-garamond text-xs uppercase tracking-widest text-terracotta mb-2">✦ Day by Day</div>
        <h3 className="font-playfair text-3xl text-charcoal font-bold mb-8">Your Itinerary</h3>
        <div className="space-y-6">
          {itinerary.days.map((day) => (
            <DayCard key={day.day} day={day} destination={itinerary.destination} />
          ))}
        </div>
      </div>

      {/* WEATHER */}
      {itinerary.weatherFull?.length > 0 && (
        <div className="bg-sand rounded-3xl p-8 mb-10">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <h3 className="font-playfair text-2xl text-charcoal font-bold">🌤 Weather Forecast</h3>
            {itinerary.weatherFull[0]?.type === 'historical' && (
              <div className="font-garamond text-xs text-charcoal/50 bg-cream px-4 py-2 rounded-full border border-sand">
                📊 Based on last year's data — actual may vary
              </div>
            )}
            {itinerary.weatherFull[0]?.type === 'forecast' && itinerary.startDate && (
              <div className="font-garamond text-xs text-green-600 bg-green-50 px-4 py-2 rounded-full border border-green-200">
                ✅ Live forecast for your travel dates
              </div>
            )}
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {itinerary.weatherFull.map((w, i) => (
              <div key={i} className="bg-cream rounded-2xl p-4 text-center min-w-[100px]">
                <div className="font-garamond text-xs text-charcoal/50 mb-2">
                  {(() => {
                    const [y, m, d] = w.date.toString().split('T')[0].split('-')
                    return new Date(+y, +m - 1, +d).toLocaleDateString('en', { weekday: 'short', day: 'numeric', month: 'short' })
                  })()}
                </div>
                <div className="text-3xl mb-2">
                  {w.condition === 'Sunny/Clear' ? '☀️' : w.condition === 'Rainy/Drizzle' ? '🌧️' : w.condition === 'Snowy' ? '❄️' : '⛈️'}
                </div>
                <div className="font-playfair text-lg text-charcoal font-bold">{Math.round(w.tempMax)}°C</div>
                <div className="font-garamond text-xs text-charcoal/40">{Math.round(w.tempMin)}°C</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* HOTELS — dynamic images */}
      {itinerary.hotels?.length > 0 && (
        <div className="mb-12">
          <div className="font-garamond text-xs uppercase tracking-widest text-terracotta mb-2">✦ Where to Stay</div>
          <h3 className="font-playfair text-3xl text-charcoal font-bold mb-8">Hotel Options</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {itinerary.hotels.map((hotel, idx) => (
              <HotelCard key={idx} hotel={hotel} />
            ))}
          </div>
        </div>
      )}

      {/* BUDGET BREAKDOWN */}
      {itinerary.budgetBreakdown?.length > 0 && (
        <div className="mt-12 bg-sand rounded-3xl p-8 md:p-10 mb-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div>
              <div className="font-garamond text-xs uppercase tracking-widest text-terracotta mb-2">✦ Budget Breakdown</div>
              <h3 className="font-playfair text-3xl text-charcoal font-bold mb-6">{itinerary.totalBudget} total</h3>
              {itinerary.budgetBreakdown.map((item, idx) => (
                <div key={idx} className="mb-5 last:mb-0">
                  <div className="flex justify-between mb-2">
                    <span className="font-garamond text-sm text-charcoal/70">{item.category}</span>
                    <span className="font-playfair text-base text-charcoal font-semibold">{item.amount}</span>
                  </div>
                  <div className="w-full bg-cream rounded-full h-2">
                    <div className={`${item.color} h-2 rounded-full transition-all duration-700`}
                      style={{ width: `${item.percentage}%` }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-cream rounded-2xl p-6">
              <h3 className="font-playfair text-xl text-charcoal font-semibold mb-6">Trip Summary</h3>
              <div className="space-y-4">
                {[
                  { label: 'Destination', value: itinerary.destination },
                  { label: 'Duration',    value: itinerary.duration    },
                  { label: 'Best Time',   value: itinerary.bestTime    },
                  { label: 'Weather',     value: itinerary.weather     },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between items-center pb-4 border-b border-sand">
                    <span className="font-garamond text-sm text-charcoal/60">{label}</span>
                    <span className="font-playfair text-base text-charcoal font-semibold">{value}</span>
                  </div>
                ))}
                <div className="flex justify-between items-center pt-2">
                  <span className="font-garamond text-base text-charcoal/80 font-semibold">Total Budget</span>
                  <span className="font-playfair text-2xl text-saffron font-bold">{itinerary.totalBudget}</span>
                </div>

                <button onClick={handleSaveTrip} disabled={saved}
                  className={`w-full mt-6 font-garamond text-sm uppercase tracking-widest py-4 rounded-xl transition-all duration-300
                    ${saved ? 'bg-green-600 text-white cursor-default' : 'bg-charcoal text-cream hover:bg-saffron hover:text-charcoal'}`}>
                  {saved ? '✅ Itinerary Saved!' : '✦ Save This Itinerary'}
                </button>

                {!currentUser && (
                  <p className="text-center font-garamond text-xs text-charcoal/40 mt-2">Login to save your trip</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PACKING LIST */}
      {itinerary.packingList?.length > 0 && (
        <div className="bg-sand rounded-3xl p-8 mb-10">
          <h3 className="font-playfair text-2xl text-charcoal font-bold mb-6 flex items-center gap-2">
            <FiPackage size={24} /> Packing List
          </h3>
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
            onClick={() => { setItinerary(null); setRawTrip(null); setError(null); setSaved(false); setStartDate('') }}
            className="flex-1 md:flex-none border border-charcoal text-charcoal font-garamond text-sm uppercase tracking-wider px-8 py-3 rounded-xl hover:bg-charcoal hover:text-cream transition-all duration-300">
            ← Plan Another
          </button>
        </div>
      </div>
    </div>
  )
}