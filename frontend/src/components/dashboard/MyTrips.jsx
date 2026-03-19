import { useEffect, useState } from 'react'
import { auth } from '../../firebase'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'

// ── Full Trip Detail Modal ────────────────────────────────────
function TripDetailModal({ trip, onClose }) {
  if (!trip) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/60 overflow-y-auto">
      <div className="min-h-screen px-4 py-8 flex items-start justify-center">
        <div className="bg-cream rounded-3xl w-full max-w-4xl relative">

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 bg-sand text-charcoal font-garamond text-sm px-4 py-2 rounded-full hover:bg-charcoal hover:text-cream transition-all"
          >
            ✕ Close
          </button>

          {/* Hero */}
          <div className="bg-charcoal rounded-t-3xl px-8 py-10">
            <div className="font-garamond text-xs uppercase tracking-widest text-saffron mb-2">
              ✦ Saved Itinerary
            </div>
            <h2 className="font-playfair text-4xl text-white font-bold capitalize mb-3">
              {trip.destination}
            </h2>
            <div className="flex flex-wrap gap-4 font-garamond text-sm text-white/60">
              <span>📅 {trip.duration} nights / {trip.duration + 1} days</span>
              <span>💰 ${trip.budget} budget</span>
              <span>👥 {trip.travelers || 1} traveler{trip.travelers > 1 ? 's' : ''}</span>
              <span className="capitalize">
                {trip.tripStyle === 'budget' ? '🎒' : trip.tripStyle === 'comfort' ? '🏨' : '👑'} {trip.tripStyle}
              </span>
            </div>
          </div>

          <div className="p-8 space-y-8">

            {/* Summary */}
            {trip.summary && (
              <div className="bg-sand rounded-2xl p-6">
                <p className="font-garamond text-base text-charcoal/80 leading-relaxed italic">
                  "{trip.summary}"
                </p>
              </div>
            )}

            {/* Highlights */}
            {trip.highlights?.length > 0 && (
              <div>
                <h3 className="font-playfair text-xl text-charcoal font-bold mb-4">
                  ✦ Highlights
                </h3>
                <div className="flex flex-wrap gap-2">
                  {trip.highlights.map((h, i) => (
                    <span key={i} className="bg-sand font-garamond text-sm text-charcoal/70 px-4 py-2 rounded-full">
                      ✦ {h}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Weather */}
            {trip.weather?.length > 0 && (
              <div>
                <h3 className="font-playfair text-xl text-charcoal font-bold mb-4">
                  🌤 Weather Forecast
                </h3>
                <div className="flex gap-4 overflow-x-auto pb-2">
                  {trip.weather.map((w, i) => (
                    <div key={i} className="bg-sand rounded-2xl p-4 text-center min-w-[100px]">
                      <div className="font-garamond text-xs text-charcoal/50 mb-2">
                        {new Date(w.date).toLocaleDateString('en', { weekday: 'short', day: 'numeric' })}
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

            {/* Day Plans */}
            {trip.dayPlans?.length > 0 && (
              <div>
                <h3 className="font-playfair text-2xl text-charcoal font-bold mb-6">
                  🗓 Day-wise Itinerary
                </h3>
                <div className="space-y-4">
                  {trip.dayPlans.map((day) => (
                    <div key={day.day} className="bg-sand rounded-2xl overflow-hidden">
                      {/* Day Header */}
                      <div className={`px-6 py-4 flex items-center justify-between
                        ${day.day % 3 === 1 ? 'bg-saffron' : day.day % 3 === 2 ? 'bg-terracotta' : 'bg-deepblue'}`}
                      >
                        <div>
                          <div className="font-garamond text-xs uppercase tracking-widest text-white/70">
                            Day {day.day}
                          </div>
                          <h4 className="font-playfair text-lg text-white font-bold">
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

                      {/* Attractions */}
                      <div className="p-5 space-y-3">
                        {day.attractions?.map((a, idx) => (
                          <div key={idx} className="bg-cream rounded-xl px-5 py-4">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h5 className="font-playfair text-base text-charcoal font-semibold">
                                  {a.name}
                                </h5>
                                <div className="flex items-center gap-2 mt-1">
                                  {a.timing && (
                                    <span className="font-garamond text-xs text-charcoal/50">
                                      🕐 {a.timing}
                                    </span>
                                  )}
                                  {a.category && (
                                    <span className="font-garamond text-xs text-charcoal/50 bg-sand px-2 py-0.5 rounded-full">
                                      {a.category}
                                    </span>
                                  )}
                                </div>
                                {a.description && (
                                  <p className="font-garamond text-xs text-charcoal/60 mt-1 leading-relaxed">
                                    {a.description}
                                  </p>
                                )}
                                {a.tips && (
                                  <p className="font-garamond text-xs text-saffron mt-1 italic">
                                    💡 {a.tips}
                                  </p>
                                )}
                              </div>
                              <div className="text-right shrink-0">
                                <div className="font-playfair text-base text-saffron font-bold">
                                  {a.entryFee > 0 ? `$${a.entryFee}` : 'Free'}
                                </div>
                                {a.entryFeeINR > 0 && (
                                  <div className="font-garamond text-xs text-charcoal/40">
                                    ₹{a.entryFeeINR}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}

                        {/* Meals */}
                        {day.meals && (
                          <div className="flex gap-3 flex-wrap mt-2">
                            {['breakfast', 'lunch', 'dinner'].map((meal) =>
                              day.meals[meal] ? (
                                <div key={meal} className="bg-cream rounded-xl px-4 py-2 flex items-center gap-2">
                                  <span>{meal === 'breakfast' ? '🌅' : meal === 'lunch' ? '☀️' : '🌙'}</span>
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
                            🚗 {day.transport.mode}
                            {day.transport.costINR > 0 && ` · ₹${day.transport.costINR}`}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Hotel Options */}
            {trip.hotelOptions?.length > 0 && (
              <div>
                <h3 className="font-playfair text-2xl text-charcoal font-bold mb-6">
                  🏨 Hotel Options
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {trip.hotelOptions.map((h, i) => (
                    <div key={i} className="bg-sand rounded-2xl p-5">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-playfair text-lg text-charcoal font-bold">{h.name}</h4>
                        <span className="font-garamond text-sm text-saffron">
                          {'⭐'.repeat(Math.min(h.stars || 3, 5))}
                        </span>
                      </div>
                      <div className="font-playfair text-2xl text-charcoal font-bold mb-1">
                        ${h.pricePerNight}
                        <span className="font-garamond text-sm text-charcoal/50 font-normal">/night</span>
                      </div>
                      {h.priceINR && (
                        <div className="font-garamond text-sm text-charcoal/50 mb-3">
                          ₹{h.priceINR?.toLocaleString('en-IN')}/night
                        </div>
                      )}
                      <div className="flex flex-wrap gap-1.5">
                        {h.amenities?.map((a, ai) => (
                          <span key={ai} className="bg-cream font-garamond text-xs text-charcoal/60 px-2 py-1 rounded-full">
                            {a}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Budget Breakdown */}
            {trip.budgetBreakdown && (
              <div className="bg-sand rounded-2xl p-6">
                <h3 className="font-playfair text-xl text-charcoal font-bold mb-5">
                  💰 Budget Breakdown
                </h3>
                <div className="space-y-4">
                  {[
                    { label: 'Accommodation', value: trip.budgetBreakdown.accommodation, color: 'bg-saffron'    },
                    { label: 'Food',          value: trip.budgetBreakdown.food,          color: 'bg-terracotta' },
                    { label: 'Transport',     value: trip.budgetBreakdown.transport,     color: 'bg-deepblue'   },
                    { label: 'Attractions',   value: trip.budgetBreakdown.attractions,   color: 'bg-charcoal'   },
                    { label: 'Misc',          value: trip.budgetBreakdown.miscellaneous, color: 'bg-sand'       },
                  ].map((item) => (
                    <div key={item.label}>
                      <div className="flex justify-between mb-1">
                        <span className="font-garamond text-sm text-charcoal/70">{item.label}</span>
                        <span className="font-playfair text-sm text-charcoal font-semibold">${item.value}</span>
                      </div>
                      <div className="w-full bg-cream rounded-full h-2">
                        <div
                          className={`${item.color} h-2 rounded-full`}
                          style={{ width: `${Math.round((item.value / trip.budgetBreakdown.total) * 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                  <div className="flex justify-between pt-3 border-t border-cream">
                    <span className="font-garamond text-base text-charcoal font-semibold">Total</span>
                    <span className="font-playfair text-xl text-saffron font-bold">
                      ${trip.budgetBreakdown.total}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Packing List */}
            {trip.packingList?.length > 0 && (
              <div className="bg-sand rounded-2xl p-6">
                <h3 className="font-playfair text-xl text-charcoal font-bold mb-5">
                  🎒 Packing List
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {trip.packingList.map((item, i) => (
                    <div key={i} className="flex items-start gap-2 font-garamond text-sm text-charcoal/70">
                      <span className="text-saffron shrink-0 mt-0.5">✓</span>
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Travel Tips */}
            {trip.travelTips?.length > 0 && (
              <div className="bg-sand rounded-2xl p-6">
                <h3 className="font-playfair text-xl text-charcoal font-bold mb-5">
                  💡 Travel Tips
                </h3>
                <div className="space-y-3">
                  {trip.travelTips.map((tip, i) => (
                    <div key={i} className="flex items-start gap-3 font-garamond text-sm text-charcoal/70">
                      <span className="text-saffron shrink-0 mt-0.5">→</span>
                      {tip}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Close Button Bottom */}
            <button
              onClick={onClose}
              className="w-full bg-charcoal text-cream font-garamond text-sm uppercase tracking-widest py-4 rounded-2xl hover:bg-saffron hover:text-charcoal transition-all duration-300"
            >
              ← Back to My Trips
            </button>

          </div>
        </div>
      </div>
    </div>
  )
}

// ── Main MyTrips Component ────────────────────────────────────
export default function MyTrips() {
  const [trips,        setTrips]        = useState([])
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState(null)
  const [selectedTrip, setSelectedTrip] = useState(null)

  useEffect(() => {
    fetchMyTrips()
  }, [])

  async function fetchMyTrips() {
    try {
      setLoading(true)
      setError(null)
      const token = await auth.currentUser.getIdToken()
      const response = await fetch(`${BACKEND_URL}/api/trips/my`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      console.log('My trips:', data)
      if (data.success) {
        setTrips(data.trips)
      } else {
        setError(data.message || 'Failed to load trips')
      }
    } catch (err) {
      console.error(err)
      setError('Failed to load trips. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleViewDetails(trip) {
    // Fetch full trip details from backend
    try {
      const token = await auth.currentUser.getIdToken()
      const response = await fetch(`${BACKEND_URL}/api/trips/${trip._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      if (data.success) {
        setSelectedTrip(data.trip)
      } else {
        setSelectedTrip(trip) // fallback to card data
      }
    } catch {
      setSelectedTrip(trip) // fallback
    }
  }

  async function handleDelete(tripId) {
    if (!window.confirm('Delete this trip?')) return
    try {
      const token = await auth.currentUser.getIdToken()
      const response = await fetch(`${BACKEND_URL}/api/trips/${tripId}`, {
        method:  'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      if (data.success) {
        setTrips((prev) => prev.filter((t) => t._id !== tripId))
        if (selectedTrip?._id === tripId) setSelectedTrip(null)
      }
    } catch {
      alert('Failed to delete trip')
    }
  }

  // ── Loading ─────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="inline-block animate-spin text-5xl mb-4">🌏</div>
        <p className="font-garamond text-charcoal/60 text-lg">Loading your trips...</p>
      </div>
    )
  }

  // ── Error ───────────────────────────────────────────────────
  if (error) {
    return (
      <div className="py-20 text-center">
        <div className="text-5xl mb-4">😕</div>
        <p className="font-garamond text-red-500 mb-4">{error}</p>
        <button onClick={fetchMyTrips} className="font-garamond text-sm text-saffron underline">
          Try again
        </button>
      </div>
    )
  }

  // ── Empty ───────────────────────────────────────────────────
  if (trips.length === 0) {
    return (
      <div className="py-20 text-center">
        <div className="text-6xl mb-4">🗺️</div>
        <h3 className="font-playfair text-2xl text-charcoal font-bold mb-2">
          No saved trips yet
        </h3>
        <p className="font-garamond text-charcoal/60 mb-6">
          Go to Trip Planner, generate an itinerary and save it!
        </p>
      </div>
    )
  }

  // ── Trips Grid ──────────────────────────────────────────────
  return (
    <>
      {/* Full Detail Modal */}
      {selectedTrip && (
        <TripDetailModal
          trip={selectedTrip}
          onClose={() => setSelectedTrip(null)}
        />
      )}

      <div className="py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="font-garamond text-xs uppercase tracking-widest text-terracotta mb-1">
              ✦ Your Journeys
            </div>
            <h2 className="font-playfair text-3xl text-charcoal font-bold">
              My Saved Trips
            </h2>
          </div>
          <div className="bg-sand font-garamond text-sm text-charcoal/60 px-4 py-2 rounded-full">
            {trips.length} trip{trips.length !== 1 ? 's' : ''} saved
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trips.map((trip) => (
            <div
              key={trip._id}
              className="bg-sand rounded-3xl overflow-hidden border border-sand hover:border-saffron/40 hover:shadow-lg transition-all duration-300"
            >
              {/* Card Header */}
              <div className="bg-charcoal px-6 py-5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-playfair text-xl text-white font-bold capitalize mb-1">
                      {trip.destination}
                    </h3>
                    <div className="flex items-center gap-3 font-garamond text-xs text-white/50">
                      <span>📅 {trip.duration} nights</span>
                      <span>💰 ${trip.budget}</span>
                    </div>
                  </div>
                  <div className={`font-garamond text-xs px-3 py-1 rounded-full shrink-0
                    ${trip.status === 'saved'
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-saffron/20 text-saffron'
                    }`}
                  >
                    {trip.status === 'saved' ? '✅ Saved' : '📝 Draft'}
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">
                    {trip.tripStyle === 'budget' ? '🎒' : trip.tripStyle === 'comfort' ? '🏨' : '👑'}
                  </span>
                  <span className="font-garamond text-sm text-charcoal/60 capitalize">
                    {trip.tripStyle} trip
                  </span>
                </div>

                {trip.summary && (
                  <p className="font-garamond text-sm text-charcoal/70 leading-relaxed mb-4 line-clamp-2">
                    {trip.summary}
                  </p>
                )}

                {trip.highlights?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {trip.highlights.slice(0, 3).map((h, i) => (
                      <span key={i} className="bg-cream font-garamond text-xs text-charcoal/60 px-3 py-1 rounded-full">
                        {h}
                      </span>
                    ))}
                  </div>
                )}

                <div className="font-garamond text-xs text-charcoal/40 mb-5">
                  🕐 {new Date(trip.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric', month: 'short', year: 'numeric'
                  })}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleViewDetails(trip)}
                    className="flex-1 bg-charcoal text-cream font-garamond text-xs uppercase tracking-wider py-3 rounded-xl hover:bg-saffron hover:text-charcoal transition-all duration-300"
                  >
                    View Full Itinerary
                  </button>
                  <button
                    onClick={() => handleDelete(trip._id)}
                    className="px-4 py-3 border border-red-200 text-red-400 font-garamond text-xs rounded-xl hover:bg-red-50 transition-all duration-300"
                    title="Delete trip"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}