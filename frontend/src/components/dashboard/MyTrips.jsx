import { useEffect, useState } from 'react'
import { auth } from '../../firebase'
import { FiDollarSign, FiX, FiUser, FiPackage, FiBriefcase, FiAward, FiHome } from 'react-icons/fi'
import { getPlaceImage } from '../../services/unsplash'

const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001'

// ── Unsplash Image Hook ───────────────────────────────────────
function useUnsplashImage(query, enabled = true) {
  const [imgUrl, setImgUrl] = useState(null)
  const [imgLoading, setImgLoading] = useState(false)

  useEffect(() => {
    if (!query || !enabled) return
    let cancelled = false
    setImgLoading(true)
    getPlaceImage(query).then((url) => {
      if (!cancelled) {
        setImgUrl(url)
        setImgLoading(false)
      }
    })
    return () => { cancelled = true }
  }, [query, enabled])

  return { imgUrl, imgLoading }
}

// ── Blurred Hero Image ────────────────────────────────────────
function HeroImage({ query, children, className = '' }) {
  const { imgUrl } = useUnsplashImage(query)

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Background image */}
      {imgUrl && (
        <img
          src={imgUrl}
          alt={query}
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        />
      )}
      {/* Dark overlay for text legibility */}
      <div className="absolute inset-0 bg-charcoal/70" />
      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  )
}

// ── Hotel Card with Unsplash Image ────────────────────────────
function HotelCard({ hotel, destination }) {
  const query = `${hotel.name} hotel ${destination}`
  const { imgUrl, imgLoading } = useUnsplashImage(query)

  return (
    <div className="bg-sand rounded-2xl overflow-hidden">
      {/* Hotel Image */}
      <div className="relative h-36 bg-charcoal/20">
        {imgLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin text-2xl">🏨</div>
          </div>
        )}
        {imgUrl && (
          <img
            src={imgUrl}
            alt={hotel.name}
            className="w-full h-full object-cover"
          />
        )}
        {!imgUrl && !imgLoading && (
          <div className="absolute inset-0 flex items-center justify-center text-4xl opacity-30">
            🏨
          </div>
        )}
        {/* Stars overlay */}
        <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm px-2 py-1 rounded-full">
          <span className="font-garamond text-xs text-yellow-300">
            {'⭐'.repeat(Math.min(hotel.stars || 3, 5))}
          </span>
        </div>
      </div>

      <div className="p-5">
        <h4 className="font-playfair text-lg text-charcoal font-bold mb-1">{hotel.name}</h4>
        <div className="font-playfair text-2xl text-charcoal font-bold mb-1">
          ${hotel.pricePerNight}
          <span className="font-garamond text-sm text-charcoal/50 font-normal">/night</span>
        </div>
        {hotel.priceINR && (
          <div className="font-garamond text-sm text-charcoal/50 mb-3">
            ₹{hotel.priceINR?.toLocaleString('en-IN')}/night
          </div>
        )}
        <div className="flex flex-wrap gap-1.5">
          {hotel.amenities?.map((a, ai) => (
            <span key={ai} className="bg-cream font-garamond text-xs text-charcoal/60 px-2 py-1 rounded-full">
              {a}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Attraction Card with Unsplash Image ───────────────────────
function AttractionCard({ attraction, destination }) {
  const query = `${attraction.name} ${destination}`
  const { imgUrl } = useUnsplashImage(query)

  return (
    <div className="bg-cream rounded-xl overflow-hidden flex flex-col">
      {/* Image with overlaid badges — fixed height */}
      <div className="relative shrink-0">
        {imgUrl ? (
          <div className="h-48 overflow-hidden">
            <img
              src={imgUrl}
              alt={attraction.name}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            />
          </div>
        ) : (
          <div className="h-48 bg-sand animate-pulse flex items-center justify-center text-5xl opacity-20">
            🏛️
          </div>
        )}
        {attraction.timing && (
          <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm text-white font-garamond text-sm px-3 py-1.5 rounded-full">
            🕐 {attraction.timing}
          </div>
        )}
        <div className={`absolute top-3 right-3 bg-black/60 backdrop-blur-sm font-playfair text-sm font-bold px-3 py-1.5 rounded-full ${attraction.entryFee > 0 ? 'text-yellow-300' : 'text-green-300'}`}>
          {attraction.entryFee > 0 ? `$${attraction.entryFee}` : 'Free'}
        </div>
      </div>

      {/* Text content */}
      <div className="px-5 py-5 flex flex-col flex-1">
        {/* Name */}
        <h5 className="font-playfair text-lg text-charcoal font-bold leading-snug mb-1">
          {attraction.name}
        </h5>
        {attraction.entryFeeINR > 0 && (
          <div className="font-garamond text-base text-charcoal/60 font-semibold mb-3">
            ₹{attraction.entryFeeINR}
          </div>
        )}

        {/* Category + duration */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          {attraction.category && (
            <span className="font-garamond text-sm font-semibold text-charcoal/70 bg-sand px-3 py-1 rounded-full">
              {attraction.category}
            </span>
          )}
          <span className="font-garamond text-sm text-charcoal/50">⏱ 1-2 hrs</span>
        </div>

        {/* Description + Tip — flex-1 pushes Maps button to bottom */}
        <div className="flex-1 space-y-3">
          {attraction.description && (
            <p className="font-garamond text-sm text-charcoal/70 leading-relaxed">
              {attraction.description}
            </p>
          )}
          {attraction.tips && (
            <div className="font-garamond text-sm text-charcoal/65 italic bg-sand rounded-xl px-4 py-3 leading-relaxed">
              💡 {attraction.tips}
            </div>
          )}
        </div>

        {/* Google Maps button — always at bottom */}
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(attraction.name + ' ' + destination)}`}
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

// ── Trip Card with Unsplash Image ─────────────────────────────
function TripCard({ trip, onViewDetails, onDelete }) {
  const { imgUrl } = useUnsplashImage(trip.destination)

  return (
    <div className="bg-sand rounded-3xl overflow-hidden border border-sand hover:border-saffron/40 hover:shadow-lg transition-all duration-300">
      {/* Card Image */}
      <div className="relative h-44 bg-charcoal overflow-hidden">
        {imgUrl ? (
          <img
            src={imgUrl}
            alt={trip.destination}
            className="w-full h-full object-cover opacity-80 hover:opacity-100 hover:scale-105 transition-all duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl opacity-20">
            🌏
          </div>
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-transparent to-transparent" />

        {/* Status badge */}
        <div className={`absolute top-3 right-3 font-garamond text-xs px-3 py-1 rounded-full backdrop-blur-sm
          ${trip.status === 'saved'
            ? 'bg-green-500/30 text-green-300 border border-green-400/30'
            : 'bg-saffron/30 text-saffron border border-saffron/30'
          }`}
        >
          {trip.status === 'saved' ? '✅ Saved' : '📝 Draft'}
        </div>

        {/* Destination name on image */}
        <div className="absolute bottom-3 left-5">
          <h3 className="font-playfair text-xl text-white font-bold capitalize drop-shadow-lg">
            {trip.destination}
          </h3>
          <div className="flex items-center gap-3 font-garamond text-xs text-white/60">
            <span>📅 {trip.duration} nights</span>
            <span className="flex items-center gap-1">
              <FiDollarSign size={12} /> ${trip.budget}
            </span>
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-6">
        <div className="flex items-center gap-2 mb-3">
          <span>
            {trip.tripStyle === 'budget' ? <FiPackage size={18} /> : trip.tripStyle === 'comfort' ? <FiHome size={18} /> : <FiAward size={18} />}
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
            onClick={() => onViewDetails(trip)}
            className="flex-1 bg-charcoal text-cream font-garamond text-xs uppercase tracking-wider py-3 rounded-xl hover:bg-saffron hover:text-charcoal transition-all duration-300"
          >
            View Full Itinerary
          </button>
          <button
            onClick={() => onDelete(trip._id)}
            className="px-4 py-3 border border-red-200 text-red-400 font-garamond text-xs rounded-xl hover:bg-red-50 transition-all duration-300"
            title="Delete trip"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Live weather hook — re-fetches on modal open ─────────────
function useLiveWeather(lat, lon, startDate, duration) {
  const [weather,     setWeather]     = useState(null)  // null = loading
  const [weatherType, setWeatherType] = useState(null)  // 'forecast' | 'historical'

  useEffect(() => {
    if (!lat || !lon) return
    let cancelled = false

    async function fetchWeather() {
      try {
        const interpretCode = (code) => {
          if (code <= 3)  return 'Sunny/Clear'
          if (code <= 67) return 'Rainy/Drizzle'
          if (code <= 77) return 'Snowy'
          return 'Thunderstorm'
        }

        const today     = new Date(); today.setHours(0,0,0,0)
        const tripStart = startDate ? new Date(startDate) : null
        if (tripStart) tripStart.setHours(0,0,0,0)
        const daysUntil = tripStart ? Math.ceil((tripStart - today) / 86400000) : -1
        const days      = duration || 3

        let url, type

        if (!tripStart || daysUntil < 0) {
          // Trip already started or no date — live forecast for today
          url  = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto&forecast_days=${Math.min(days + 1, 16)}`
          type = 'forecast'
        } else if (daysUntil <= 14) {
          // Within 2 weeks — real forecast sliced to travel days
          url  = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto&forecast_days=${Math.min(daysUntil + days + 1, 16)}`
          type = 'forecast'
        } else {
          // Too far ahead — same period last year
          const s = new Date(tripStart); s.setFullYear(s.getFullYear() - 1)
          const e = new Date(s); e.setDate(e.getDate() + days)
          const fmt = (d) => d.toISOString().split('T')[0]
          url  = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto&start_date=${fmt(s)}&end_date=${fmt(e)}`
          type = 'historical'
        }

        const res   = await fetch(url)
        const data  = await res.json()
        const daily = data.daily

        let result = daily.time.map((_, i) => {
          const actualDate = tripStart ? new Date(tripStart) : new Date()
          actualDate.setDate(actualDate.getDate() + i)
          return {
            date:      actualDate.toISOString(),
            tempMax:   daily.temperature_2m_max[i],
            tempMin:   daily.temperature_2m_min[i],
            condition: interpretCode(daily.weathercode[i]),
            type,
          }
        })

        // For live forecast, filter to only travel days
        if (type === 'forecast' && tripStart && daysUntil >= 0 && daysUntil <= 14) {
          result = result.filter((_, i) => i >= daysUntil).slice(0, days + 1)
        } else {
          result = result.slice(0, days + 1)
        }

        if (!cancelled) {
          setWeather(result)
          setWeatherType(type)
        }
      } catch (err) {
        console.error('Live weather fetch error:', err)
        if (!cancelled) setWeather([]) // empty on error — fallback to stored
      }
    }

    fetchWeather()
    return () => { cancelled = true }
  }, [lat, lon, startDate, duration])

  return { weather, weatherType }
}

// ── Full Trip Detail Modal ────────────────────────────────────
function TripDetailModal({ trip, onClose }) {
  if (!trip) return null

  // Re-fetch weather live every time modal opens
  const { weather: liveWeather, weatherType } = useLiveWeather(
    trip.lat,
    trip.lon,
    trip.startDate,
    trip.duration
  )

  // Use live weather if available, fall back to stored weather
  const displayWeather = liveWeather ?? trip.weather ?? []
  const isLoading      = liveWeather === null && (trip.lat && trip.lon)

  return (
    <div className="fixed inset-0 z-50 bg-black/60 overflow-y-auto">
      <div className="min-h-screen px-4 py-8 flex items-start justify-center">
        <div className="bg-cream rounded-3xl w-full max-w-4xl relative">

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 bg-sand text-charcoal font-garamond text-sm px-4 py-2 rounded-full hover:bg-charcoal hover:text-cream transition-all flex items-center gap-2"
          >
            <FiX size={16} /> Close
          </button>

          {/* Hero with Unsplash background */}
          <HeroImage query={`${trip.destination} travel landscape`} className="rounded-t-3xl px-8 py-10">
            <div className="font-garamond text-xs uppercase tracking-widest text-saffron mb-2">
              ✦ Saved Itinerary
            </div>
            <h2 className="font-playfair text-4xl text-white font-bold capitalize mb-3">
              {trip.destination}
            </h2>
            <div className="flex flex-wrap gap-4 font-garamond text-sm text-white/70">
              <span>📅 {trip.duration} nights / {trip.duration + 1} days</span>
              <span className="flex items-center gap-1"><FiDollarSign size={14} /> ${trip.budget} budget</span>
              <span className="flex items-center gap-1"><FiUser size={14} /> {trip.travelers || 1} traveler{trip.travelers > 1 ? 's' : ''}</span>
              <span className="capitalize flex items-center gap-2">
                {trip.tripStyle === 'budget' ? <FiPackage size={16} /> : trip.tripStyle === 'comfort' ? <FiHome size={16} /> : <FiAward size={16} />}
                {trip.tripStyle}
              </span>
            </div>
          </HeroImage>

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

            {/* Weather — live re-fetched on open */}
            {(displayWeather.length > 0 || isLoading) && (
              <div>
                <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
                  <h3 className="font-playfair text-xl text-charcoal font-bold">
                    🌤 Weather Forecast
                  </h3>
                  {isLoading && (
                    <div className="font-garamond text-xs text-charcoal/40 bg-sand px-4 py-2 rounded-full animate-pulse">
                      Fetching latest weather...
                    </div>
                  )}
                  {!isLoading && weatherType === 'forecast' && (
                    <div className="font-garamond text-xs text-green-600 bg-green-50 px-4 py-2 rounded-full border border-green-200">
                      ✅ Live forecast for your travel dates
                    </div>
                  )}
                  {!isLoading && weatherType === 'historical' && (
                    <div className="font-garamond text-xs text-charcoal/50 bg-sand px-4 py-2 rounded-full border border-sand">
                      📊 Based on last year's data — actual may vary
                    </div>
                  )}
                </div>

                {isLoading ? (
                  <div className="flex gap-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="bg-sand rounded-2xl p-4 text-center min-w-[100px] animate-pulse">
                        <div className="h-3 bg-charcoal/10 rounded mb-3 mx-2" />
                        <div className="text-3xl mb-2 opacity-20">🌤</div>
                        <div className="h-4 bg-charcoal/10 rounded mb-1 mx-4" />
                        <div className="h-3 bg-charcoal/10 rounded mx-6" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex gap-4 overflow-x-auto pb-2">
                    {displayWeather.map((w, i) => (
                      <div key={i} className="bg-sand rounded-2xl p-4 text-center min-w-[100px]">
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
                )}
              </div>
            )}

            {/* Day Plans */}
            {trip.dayPlans?.length > 0 && (
              <div>
                <h3 className="font-playfair text-2xl text-charcoal font-bold mb-6">
                  🗓 Day-wise Itinerary
                </h3>
                <div className="space-y-4">
                  {trip.dayPlans.map((day) => {
                    // Compute actual date for this day if startDate exists
                    let dayDate = null
                    if (trip.startDate) {
                      const d = new Date(trip.startDate)
                      d.setDate(d.getDate() + (day.day - 1))
                      dayDate = d.toLocaleDateString('en-IN', {
                        weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
                      })
                    }

                    return (
                    <div key={day.day} className="bg-sand rounded-2xl overflow-hidden">
                      {/* Day Header */}
                      <div className={`px-6 py-4 flex items-center justify-between
                        ${day.day % 3 === 1 ? 'bg-saffron' : day.day % 3 === 2 ? 'bg-terracotta' : 'bg-deepblue'}`}
                      >
                        <div>
                          <div className="font-garamond text-xs uppercase tracking-widest text-white/70">
                            Day {day.day}{dayDate ? ` · ${dayDate}` : ''}
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

                      {/* Attractions — hotel-style grid, equal height */}
                      <div className="p-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 items-stretch">
                          {day.attractions?.map((a, idx) => (
                            <AttractionCard
                              key={idx}
                              attraction={a}
                              destination={trip.destination}
                            />
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
                    ) // end return
                  })} {/* end dayPlans.map */}
                </div>
              </div>
            )}

            {/* Hotel Options — now with images */}
            {trip.hotelOptions?.length > 0 && (
              <div>
                <h3 className="font-playfair text-2xl text-charcoal font-bold mb-6 flex items-center gap-2">
                  <FiHome size={24} /> Hotel Options
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {trip.hotelOptions.map((h, i) => (
                    <HotelCard key={i} hotel={h} destination={trip.destination} />
                  ))}
                </div>
              </div>
            )}

            {/* Budget Breakdown */}
            {trip.budgetBreakdown && (
              <div className="bg-sand rounded-2xl p-6">
                <h3 className="font-playfair text-xl text-charcoal font-bold mb-5 flex items-center gap-2">
                  <FiDollarSign size={18} /> Budget Breakdown
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
                <h3 className="font-playfair text-xl text-charcoal font-bold mb-5 flex items-center gap-2">
                  <FiPackage size={20} /> Packing List
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
    try {
      const token = await auth.currentUser.getIdToken()
      const response = await fetch(`${BACKEND_URL}/api/trips/${trip._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      if (data.success) {
        setSelectedTrip(data.trip)
      } else {
        setSelectedTrip(trip)
      }
    } catch {
      setSelectedTrip(trip)
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
            <TripCard
              key={trip._id}
              trip={trip}
              onViewDetails={handleViewDetails}
              onDelete={handleDelete}
            />
          ))}
        </div>
      </div>
    </>
  )
}