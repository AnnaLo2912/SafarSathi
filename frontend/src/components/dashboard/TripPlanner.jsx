import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { auth } from '../../firebase'
import { FiDollarSign, FiMapPin, FiPackage, FiAward, FiHome, FiEdit3, FiZap } from 'react-icons/fi'
import { getPlaceImage } from '../../services/unsplash'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001'

// ── Currencies ────────────────────────────────────────────────
const CURRENCIES = [
  { code: 'USD', symbol: '$',  name: 'US Dollar'       },
  { code: 'EUR', symbol: '€',  name: 'Euro'             },
  { code: 'GBP', symbol: '£',  name: 'British Pound'    },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar'  },
  { code: 'JPY', symbol: '¥',  name: 'Japanese Yen'     },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
  { code: 'AED', symbol: 'د.إ',name: 'UAE Dirham'       },
  { code: 'INR', symbol: '₹',  name: 'Indian Rupee'     },
]

// ── Exchange rate fetcher ─────────────────────────────────────
async function fetchExchangeRate(fromCurrency) {
  if (fromCurrency === 'INR') return 1
  try {
    const res  = await fetch(`https://api.exchangerate-api.com/v4/latest/${fromCurrency}`)
    const data = await res.json()
    return data.rates?.INR || null
  } catch {
    // Fallback approximate rates if API fails
    const fallback = { USD: 83, EUR: 90, GBP: 105, AUD: 55, CAD: 62, JPY: 0.56, SGD: 62, AED: 22.6 }
    return fallback[fromCurrency] || 83
  }
}

// ── Reusable Unsplash hook ────────────────────────────────────
function useUnsplashImage(query, enabled = true) {
  const [imgUrl, setImgUrl] = useState(null)
  useEffect(() => {
    if (!query || !enabled) return
    let cancelled = false
    getPlaceImage(query).then(url => { if (!cancelled && url) setImgUrl(url) })
    return () => { cancelled = true }
  }, [query, enabled])
  return imgUrl
}

// ── Hero Banner ───────────────────────────────────────────────
function HeroBanner({ itinerary }) {
  const heroImg = useUnsplashImage(`${itinerary.destination} India travel landscape`)
  return (
    <div className="relative rounded-3xl overflow-hidden mb-10 h-72 md:h-96">
      <div className="absolute inset-0 bg-charcoal transition-all duration-700"
        style={heroImg ? { backgroundImage: `url(${heroImg})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}} />
      {!heroImg && <div className="absolute inset-0 bg-gradient-to-r from-charcoal via-charcoal/80 to-charcoal animate-pulse" />}
      <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-8">
        <div className="font-garamond text-xs uppercase tracking-widest text-saffron mb-2">✦ AI Generated Itinerary</div>
        <h2 className="font-playfair text-4xl md:text-5xl text-white font-bold mb-3">{itinerary.destination}</h2>
        <div className="flex flex-wrap items-center gap-4 font-garamond text-sm text-white/70">
          <span>📅 {itinerary.duration}</span>
          {itinerary.startDate && itinerary.endDate && (
            <span>🗓 {new Date(itinerary.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} → {itinerary.endDate}</span>
          )}
          <span className="flex items-center gap-2"><FiDollarSign size={16} /> {itinerary.totalBudget}</span>
          {itinerary.totalBudgetINR && itinerary.currency !== 'INR' && (
            <span className="text-saffron font-semibold">≈ ₹{itinerary.totalBudgetINR.toLocaleString('en-IN')}</span>
          )}
          <span>🌤 {itinerary.weather}</span>
        </div>
      </div>
    </div>
  )
}

// ── Day Card ──────────────────────────────────────────────────
function DayCard({ day, destination, currencySymbol, exchangeRate }) {
  const dayImg = useUnsplashImage(`${day.title} ${destination}`)
  return (
    <div className="bg-sand rounded-3xl overflow-hidden">
      <div className={`${day.themeColor} px-8 py-4 flex items-center justify-between`}>
        <div>
          <div className="font-garamond text-xs uppercase tracking-widest text-white/70">
            Day {day.day}{day.dayDate ? ` · ${day.dayDate}` : ''}
          </div>
          <h4 className="font-playfair text-xl text-white font-bold">{day.title}</h4>
        </div>
        {day.dayTotal > 0 && (
          <div className="text-right">
            <div className="font-garamond text-xs text-white/60">Est. cost</div>
            <div className="font-playfair text-lg text-white font-bold">
              {currencySymbol}{(day.dayTotal / (exchangeRate || 83)).toFixed(0)}
            </div>
            <div className="font-garamond text-xs text-white/50">₹{day.dayTotal}</div>
          </div>
        )}
      </div>

      {dayImg ? (
        <div className="h-40 overflow-hidden">
          <img src={dayImg} alt={day.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
        </div>
      ) : (
        <div className="h-40 bg-charcoal/10 animate-pulse flex items-center justify-center text-4xl opacity-20">🗺️</div>
      )}

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 items-stretch">
          {day.activities.map((act, idx) => (
            <ActivityRow key={idx} activity={act} destination={destination} currencySymbol={currencySymbol} exchangeRate={exchangeRate} />
          ))}
        </div>

        {day.meals && (
          <div className="mb-4">
            <div className="font-garamond text-xs uppercase tracking-widest text-charcoal/40 mb-3">🍽 Meals</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {['breakfast', 'lunch', 'dinner'].map(meal =>
                day.meals[meal] ? (
                  <div key={meal} className="bg-cream rounded-2xl px-5 py-4 flex items-center gap-4">
                    <span className="text-2xl shrink-0">{meal === 'breakfast' ? '🌅' : meal === 'lunch' ? '☀️' : '🌙'}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-garamond text-xs uppercase tracking-widest text-charcoal/40 mb-0.5 capitalize">{meal}</div>
                      <div className="font-playfair text-base text-charcoal font-semibold truncate">{day.meals[meal].name}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-playfair text-base text-saffron font-bold">
                        {currencySymbol === '₹'
                          ? `₹${Math.round((day.meals[meal].costINR || day.meals[meal].cost * 83))}`
                          : `${currencySymbol}${day.meals[meal].cost.toFixed(2)}`}
                      </div>
                      {currencySymbol !== '₹' && (
                        <div className="font-garamond text-xs text-charcoal/40">₹{Math.round(day.meals[meal].cost * (exchangeRate || 83))}</div>
                      )}
                    </div>
                  </div>
                ) : null
              )}
            </div>
          </div>
        )}

        {day.transport?.mode && (
          <div className="bg-cream rounded-2xl px-5 py-4 flex items-center gap-4">
            <span className="text-2xl shrink-0">🚗</span>
            <div className="flex-1">
              <div className="font-garamond text-xs uppercase tracking-widest text-charcoal/40 mb-0.5">Transport</div>
              <div className="font-playfair text-base text-charcoal font-semibold">{day.transport.mode}</div>
            </div>
            {day.transport.costINR > 0 && (
              <div className="text-right shrink-0">
                <div className="font-playfair text-base text-charcoal/60 font-semibold">₹{day.transport.costINR}</div>
                <div className="font-garamond text-xs text-charcoal/40">{currencySymbol}{(day.transport.costINR / (exchangeRate || 83)).toFixed(2)}</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Activity Row ──────────────────────────────────────────────
function ActivityRow({ activity, destination, currencySymbol, exchangeRate }) {
  const actImg = useUnsplashImage(`${activity.name} ${destination}`)
  return (
    <div className="bg-cream rounded-2xl overflow-hidden flex flex-col">
      <div className="relative shrink-0">
        {actImg ? (
          <div className="h-48 overflow-hidden">
            <img src={actImg} alt={activity.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
          </div>
        ) : (
          <div className="h-48 bg-sand animate-pulse flex items-center justify-center text-5xl opacity-20">🏛️</div>
        )}
        <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm text-white font-garamond text-sm px-3 py-1.5 rounded-full">
          🕐 {activity.time}
        </div>
        <div className={`absolute top-3 right-3 bg-black/60 backdrop-blur-sm font-playfair text-sm font-bold px-3 py-1.5 rounded-full ${activity.cost === 'Free' ? 'text-green-300' : 'text-yellow-300'}`}>
          {(() => {
            if (activity.cost === 'Free') return 'Free'
            const num = parseFloat(activity.cost.replace(/[^0-9.]/g, ''))
            if (!num || num === 0) return 'Free'
            // If INR currency, show INR directly without double conversion
            if (currencySymbol === '₹') return `₹${Math.round(num * (exchangeRate || 83))}`
            return `${currencySymbol}${(num).toFixed(1)}`
          })()}
        </div>
      </div>
      <div className="px-5 py-5 flex flex-col flex-1">
        <h5 className="font-playfair text-lg text-charcoal font-bold leading-snug mb-1">{activity.name}</h5>
        {activity.costINR !== 'Free' && (
          <div className="font-garamond text-base text-charcoal/60 font-semibold mb-3">{activity.costINR}</div>
        )}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <span className="font-garamond text-sm font-semibold text-charcoal/70 bg-sand px-3 py-1 rounded-full">{activity.type}</span>
          <span className="font-garamond text-sm text-charcoal/50 flex items-center gap-1">⏱ {activity.duration}</span>
        </div>
        <div className="flex-1">
          {activity.tip && (
            <div className="font-garamond text-sm text-charcoal/65 italic bg-sand rounded-xl px-4 py-3 leading-relaxed">💡 {activity.tip}</div>
          )}
        </div>
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activity.name + ' ' + destination)}`}
          target="_blank" rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full mt-4 bg-white border-2 border-sand hover:border-blue-400 hover:bg-blue-50 text-charcoal font-garamond text-sm font-semibold py-2.5 rounded-xl transition-all duration-300 group"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#EA4335"/><circle cx="12" cy="9" r="2.5" fill="white"/></svg>
          <span className="group-hover:text-blue-600 transition-colors">View on Google Maps</span>
        </a>
      </div>
    </div>
  )
}

// ── Hotel Card ────────────────────────────────────────────────
function HotelCard({ hotel, currencySymbol, exchangeRate }) {
  const hotelImg = useUnsplashImage(`${hotel.name} hotel`)

  // If user chose INR, show INR price directly; otherwise convert
  const priceDisplay = (() => {
    const inrVal = hotel.priceINR ? parseInt(hotel.priceINR.replace(/[^0-9]/g, '')) : null
    if (currencySymbol === '₹') {
      return inrVal ? `₹${inrVal.toLocaleString('en-IN')}` : hotel.price
    }
    if (inrVal) {
      return `${currencySymbol}${(inrVal / (exchangeRate || 83)).toFixed(0)}`
    }
    return hotel.price
  })()

  return (
    <div className="bg-sand rounded-3xl overflow-hidden border border-sand hover:border-saffron/40 hover:shadow-xl transition-all duration-300 group flex flex-col">
      <div className="relative h-44 overflow-hidden">
        {hotelImg ? (
          <img src={hotelImg} alt={hotel.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
        ) : (
          <div className="w-full h-full bg-charcoal/10 animate-pulse flex items-center justify-center text-4xl opacity-20">🏨</div>
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
        <div className="font-garamond text-sm text-charcoal/60 mb-3 flex items-center gap-2"><FiMapPin size={16} /> {hotel.location}</div>
        <div className="mb-1">
          <div className="font-playfair text-2xl text-charcoal font-bold">{priceDisplay}<span className="font-garamond text-sm text-charcoal/50 font-normal">/night</span></div>
          {hotel.priceINR && currencySymbol !== '₹' && <div className="font-garamond text-sm text-charcoal/50">{hotel.priceINR}/night</div>}
        </div>
        <div className="flex flex-wrap gap-2 mb-5 mt-3">
          {hotel.perks.map((perk, i) => (
            <div key={i} className="bg-cream font-garamond text-xs text-charcoal/70 px-3 py-1 rounded-full border border-sand">{perk}</div>
          ))}
        </div>
        <button className="w-full mt-auto bg-charcoal text-cream font-garamond text-xs uppercase tracking-widest py-3 rounded-xl hover:bg-saffron hover:text-charcoal transition-all duration-300">
          Book This Hotel →
        </button>
      </div>
    </div>
  )
}

// ── Custom Itinerary Builder with Save ───────────────────────
function CustomItineraryBuilder({ currentUser }) {
  const [destination, setDestination] = useState('')
  const [startDate,   setStartDate]   = useState('')
  const [days,        setDays]        = useState([{ id: 1, title: '', activities: [{ name: '', time: '', notes: '' }] }])
  const [saving,      setSaving]      = useState(false)
  const [saved,       setSaved]       = useState(false)
  const [error,       setError]       = useState('')

  function addDay() {
    setDays(prev => [...prev, { id: prev.length + 1, title: '', activities: [{ name: '', time: '', notes: '' }] }])
  }
  function removeDay(id) {
    setDays(prev => prev.filter(d => d.id !== id).map((d, i) => ({ ...d, id: i + 1 })))
  }
  function updateDay(id, field, value) {
    setDays(prev => prev.map(d => d.id === id ? { ...d, [field]: value } : d))
  }
  function addActivity(dayId) {
    setDays(prev => prev.map(d =>
      d.id === dayId ? { ...d, activities: [...d.activities, { name: '', time: '', notes: '' }] } : d
    ))
  }
  function removeActivity(dayId, idx) {
    setDays(prev => prev.map(d =>
      d.id === dayId ? { ...d, activities: d.activities.filter((_, i) => i !== idx) } : d
    ))
  }
  function updateActivity(dayId, idx, field, value) {
    setDays(prev => prev.map(d =>
      d.id === dayId ? { ...d, activities: d.activities.map((a, i) => i === idx ? { ...a, [field]: value } : a) } : d
    ))
  }

  async function handleSave() {
    if (!destination.trim()) { setError('Please enter a destination'); return }
    if (!currentUser) { setError('Please login to save'); return }
    try {
      setSaving(true); setError('')
      const token = await auth.currentUser.getIdToken()
      const res   = await fetch(`${BACKEND_URL}/api/trips/custom`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ destination, startDate: startDate || undefined, duration: days.length, dayPlans: days }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.message)
      setSaved(true)
    } catch (err) {
      setError(err.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-sand rounded-3xl p-6">
        <h3 className="font-playfair text-xl text-charcoal font-bold mb-4">Build Your Own Itinerary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="font-garamond text-xs uppercase tracking-widest text-charcoal/60 mb-2 block">Destination *</label>
            <input type="text" placeholder="e.g. Jaipur, Varanasi, Kerala..."
              value={destination} onChange={e => setDestination(e.target.value)}
              className="w-full bg-cream border border-cream focus:border-saffron focus:outline-none font-garamond text-lg text-charcoal px-5 py-4 rounded-2xl transition-colors" />
          </div>
          <div>
            <label className="font-garamond text-xs uppercase tracking-widest text-charcoal/60 mb-2 block">Start Date (optional)</label>
            <input type="date" value={startDate} min={new Date().toISOString().split('T')[0]}
              onChange={e => setStartDate(e.target.value)}
              className="w-full bg-cream border border-cream focus:border-saffron focus:outline-none font-garamond text-lg text-charcoal px-5 py-4 rounded-2xl transition-colors" />
          </div>
        </div>
      </div>

      {/* Days */}
      {days.map((day, dayIdx) => (
        <div key={day.id} className="bg-sand rounded-3xl overflow-hidden">
          <div className={`px-6 py-4 flex items-center justify-between ${['bg-saffron', 'bg-terracotta', 'bg-deepblue'][dayIdx % 3]}`}>
            <div className="flex-1">
              <div className="font-garamond text-xs uppercase tracking-widest text-white/70 mb-1">
                Day {day.id}{startDate ? ` · ${(() => { const d = new Date(startDate); d.setDate(d.getDate() + dayIdx); return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }) })()}` : ''}
              </div>
              <input type="text" placeholder="Day theme e.g. Heritage Walk"
                value={day.title} onChange={e => updateDay(day.id, 'title', e.target.value)}
                className="bg-transparent border-b border-white/30 text-white font-playfair text-xl font-bold placeholder:text-white/40 focus:outline-none focus:border-white w-full" />
            </div>
            {days.length > 1 && (
              <button onClick={() => removeDay(day.id)} className="text-white/60 hover:text-white ml-4 text-xl font-bold shrink-0">✕</button>
            )}
          </div>

          {destination && day.title && <DayImagePreview query={`${day.title} ${destination}`} />}

          <div className="p-6 space-y-3">
            {day.activities.map((act, actIdx) => (
              <div key={actIdx} className="bg-cream rounded-2xl p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                  <input type="text" placeholder="Activity name (e.g. Amber Fort)"
                    value={act.name} onChange={e => updateActivity(day.id, actIdx, 'name', e.target.value)}
                    className="md:col-span-2 bg-sand border border-sand focus:border-saffron focus:outline-none font-garamond text-sm text-charcoal px-4 py-2.5 rounded-xl transition-colors" />
                  <input type="text" placeholder="Time (e.g. 10:00 AM)"
                    value={act.time} onChange={e => updateActivity(day.id, actIdx, 'time', e.target.value)}
                    className="bg-sand border border-sand focus:border-saffron focus:outline-none font-garamond text-sm text-charcoal px-4 py-2.5 rounded-xl transition-colors" />
                </div>
                <div className="flex gap-3">
                  <input type="text" placeholder="Notes or tips..."
                    value={act.notes} onChange={e => updateActivity(day.id, actIdx, 'notes', e.target.value)}
                    className="flex-1 bg-sand border border-sand focus:border-saffron focus:outline-none font-garamond text-sm text-charcoal px-4 py-2.5 rounded-xl transition-colors" />
                  {day.activities.length > 1 && (
                    <button onClick={() => removeActivity(day.id, actIdx)} className="text-red-400 hover:text-red-600 px-3 font-bold text-lg">✕</button>
                  )}
                </div>
                {act.name && destination && (
                  <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(act.name + ' ' + destination)}`}
                    target="_blank" rel="noopener noreferrer"
                    className="mt-3 flex items-center gap-2 font-garamond text-xs text-blue-500 hover:text-blue-700">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#EA4335"/><circle cx="12" cy="9" r="2.5" fill="white"/></svg>
                    View on Google Maps
                  </a>
                )}
              </div>
            ))}
            <button onClick={() => addActivity(day.id)}
              className="w-full border-2 border-dashed border-sand hover:border-saffron font-garamond text-sm text-charcoal/50 hover:text-saffron py-3 rounded-2xl transition-all duration-200">
              + Add Activity
            </button>
          </div>
        </div>
      ))}

      <button onClick={addDay}
        className="w-full border-2 border-dashed border-sand hover:border-saffron font-garamond text-sm text-charcoal/50 hover:text-saffron py-4 rounded-3xl transition-all duration-200">
        + Add Day
      </button>

      {/* Error */}
      {error && <div className="bg-red-50 border border-red-200 text-red-600 font-garamond text-sm px-4 py-3 rounded-xl">❌ {error}</div>}

      {/* Save */}
      {currentUser ? (
        <button onClick={handleSave} disabled={saving || saved}
          className={`w-full font-garamond text-sm uppercase tracking-widest py-5 rounded-2xl transition-all duration-300 ${
            saved ? 'bg-green-600 text-white cursor-default' : 'bg-charcoal text-cream hover:bg-saffron hover:text-charcoal'
          } disabled:opacity-50`}>
          {saved ? '✅ Itinerary Saved to My Trips!' : saving ? 'Saving...' : '✦ Save My Itinerary'}
        </button>
      ) : (
        <div className="bg-sand rounded-2xl p-4 text-center">
          <p className="font-garamond text-sm text-charcoal/50">💡 <a href="/login" className="underline text-saffron">Login</a> to save your custom itinerary to My Trips</p>
        </div>
      )}
    </div>
  )
}

// Small component to preview day image in custom builder
function DayImagePreview({ query }) {
  const img = useUnsplashImage(query)
  if (!img) return null
  return (
    <div className="h-32 overflow-hidden">
      <img src={img} alt={query} className="w-full h-full object-cover" />
    </div>
  )
}

// ── Edit AI Itinerary Modal ───────────────────────────────────
function EditItineraryModal({ itinerary, rawTripId, currentUser, onClose, onSaved }) {
  const [days,    setDays]    = useState(
    itinerary.days.map(d => ({
      id:         d.day,
      title:      d.title,
      activities: d.activities.map(a => ({ name: a.name, time: a.time, notes: a.tip || '' })),
    }))
  )
  const [saving,  setSaving]  = useState(false)
  const [saved,   setSaved]   = useState(false)
  const [error,   setError]   = useState('')

  function updateDay(id, value)                { setDays(prev => prev.map(d => d.id === id ? { ...d, title: value } : d)) }
  function updateAct(dayId, idx, field, value) {
    setDays(prev => prev.map(d =>
      d.id === dayId ? { ...d, activities: d.activities.map((a, i) => i === idx ? { ...a, [field]: value } : a) } : d
    ))
  }
  function addAct(dayId) {
    setDays(prev => prev.map(d =>
      d.id === dayId ? { ...d, activities: [...d.activities, { name: '', time: '', notes: '' }] } : d
    ))
  }
  function removeAct(dayId, idx) {
    setDays(prev => prev.map(d =>
      d.id === dayId ? { ...d, activities: d.activities.filter((_, i) => i !== idx) } : d
    ))
  }

  async function handleSave() {
    if (!currentUser || !rawTripId) {
      setError('Save the itinerary first before editing')
      return
    }
    try {
      setSaving(true); setError('')
      const token = await auth.currentUser.getIdToken()
      const updatedDayPlans = days.map(d => ({
        day:   d.id,
        title: d.title,
        attractions: d.activities.map(a => ({ name: a.name, timing: a.time, tips: a.notes, entryFee: 0, entryFeeINR: 0 })),
      }))
      const res  = await fetch(`${BACKEND_URL}/api/trips/${rawTripId}/edit`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ dayPlans: updatedDayPlans }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.message)
      setSaved(true)
      // Map back to frontend format
      const updatedDays = days.map((d, i) => ({
        ...itinerary.days[i],
        day:   d.id,
        title: d.title,
        activities: d.activities.map(a => ({
          name:     a.name,
          time:     a.time,
          tip:      a.notes,
          type:     'Sightseeing',
          cost:     'Free',
          costINR:  'Free',
          duration: '1-2 hrs',
        })),
      }))
      setTimeout(() => onSaved(updatedDays), 800)
    } catch (err) {
      setError(err.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 overflow-y-auto">
      <div className="min-h-screen px-4 py-8 flex items-start justify-center">
        <div className="bg-cream rounded-3xl w-full max-w-3xl shadow-2xl">
          {/* Header */}
          <div className="bg-charcoal rounded-t-3xl px-8 py-6 flex items-center justify-between">
            <div>
              <p className="font-garamond text-xs uppercase tracking-widest text-saffron mb-1">✏️ Edit Mode</p>
              <h2 className="font-playfair text-2xl text-white font-bold capitalize">{itinerary.destination}</h2>
            </div>
            <button onClick={onClose} className="bg-white/10 text-white px-4 py-2 rounded-full font-garamond text-sm hover:bg-white/20 transition-all">✕ Cancel</button>
          </div>

          <div className="p-8 space-y-6">
            <p className="font-garamond text-sm text-charcoal/60">Edit day titles and activities. Changes will be saved to your trip.</p>

            {error && <div className="bg-red-50 border border-red-200 text-red-600 font-garamond text-sm px-4 py-3 rounded-xl">❌ {error}</div>}

            {days.map((day, dayIdx) => (
              <div key={day.id} className="bg-sand rounded-2xl overflow-hidden">
                {/* Day header */}
                <div className={`px-6 py-4 ${['bg-saffron', 'bg-terracotta', 'bg-deepblue'][dayIdx % 3]}`}>
                  <p className="font-garamond text-xs uppercase tracking-widest text-white/70 mb-1">Day {day.id}</p>
                  <input type="text" value={day.title} onChange={e => updateDay(day.id, e.target.value)}
                    className="bg-transparent border-b border-white/30 text-white font-playfair text-xl font-bold focus:outline-none focus:border-white w-full" />
                </div>

                {/* Activities */}
                <div className="p-5 space-y-3">
                  {day.activities.map((act, idx) => (
                    <div key={idx} className="bg-cream rounded-xl p-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-2">
                        <input type="text" placeholder="Activity name" value={act.name}
                          onChange={e => updateAct(day.id, idx, 'name', e.target.value)}
                          className="md:col-span-2 bg-sand border border-sand focus:border-saffron focus:outline-none font-garamond text-sm text-charcoal px-3 py-2.5 rounded-xl transition-colors" />
                        <input type="text" placeholder="Time" value={act.time}
                          onChange={e => updateAct(day.id, idx, 'time', e.target.value)}
                          className="bg-sand border border-sand focus:border-saffron focus:outline-none font-garamond text-sm text-charcoal px-3 py-2.5 rounded-xl transition-colors" />
                      </div>
                      <div className="flex gap-3">
                        <input type="text" placeholder="Tips or notes..." value={act.notes}
                          onChange={e => updateAct(day.id, idx, 'notes', e.target.value)}
                          className="flex-1 bg-sand border border-sand focus:border-saffron focus:outline-none font-garamond text-sm text-charcoal px-3 py-2.5 rounded-xl transition-colors" />
                        {day.activities.length > 1 && (
                          <button onClick={() => removeAct(day.id, idx)} className="text-red-400 hover:text-red-600 px-2 font-bold">✕</button>
                        )}
                      </div>
                    </div>
                  ))}
                  <button onClick={() => addAct(day.id)}
                    className="w-full border-2 border-dashed border-sand hover:border-saffron font-garamond text-sm text-charcoal/50 hover:text-saffron py-2.5 rounded-xl transition-all">
                    + Add Activity
                  </button>
                </div>
              </div>
            ))}

            <button onClick={handleSave} disabled={saving || saved}
              className={`w-full font-garamond text-sm uppercase tracking-widest py-4 rounded-2xl transition-all duration-300 ${
                saved ? 'bg-green-600 text-white' : 'bg-charcoal text-cream hover:bg-saffron hover:text-charcoal'
              } disabled:opacity-50`}>
              {saved ? '✅ Changes Saved!' : saving ? 'Saving...' : '✦ Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Main TripPlanner ──────────────────────────────────────────
export default function TripPlanner() {
  const [mode,      setMode]      = useState('ai') // 'ai' | 'custom'
  const [editMode,  setEditMode]  = useState(false)
  const [editDays,  setEditDays]  = useState([])
  const [query,     setQuery]     = useState('')
  const [nights,    setNights]    = useState('3')
  const [budget,    setBudget]    = useState('150')
  const [currency,  setCurrency]  = useState('USD')
  const [travelers, setTravelers] = useState('1')
  const [tripStyle, setTripStyle] = useState('budget')
  const [startDate, setStartDate] = useState('')
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState(null)
  const [itinerary, setItinerary] = useState(null)
  const [rawTrip,   setRawTrip]   = useState(null)
  const [saved,     setSaved]     = useState(false)
  const [exchangeRate, setExchangeRate] = useState(83) // INR per 1 unit of selected currency

  const { currentUser } = useAuth()

  const selectedCurrency = CURRENCIES.find(c => c.code === currency) || CURRENCIES[0]

  // Fetch exchange rate when currency changes
  useEffect(() => {
    fetchExchangeRate(currency).then(rate => { if (rate) setExchangeRate(rate) })
  }, [currency])

  // Budget in INR — if already INR, no conversion needed
  const budgetINR = currency === 'INR'
    ? Math.round(parseFloat(budget || 0))
    : Math.round(parseFloat(budget || 0) * exchangeRate)

  async function handleGenerate(e) {
    e.preventDefault()
    if (!query.trim()) return
    setLoading(true); setError(null); setItinerary(null); setSaved(false)

    try {
      let token = null
      if (currentUser) token = await auth.currentUser.getIdToken()

      const response = await fetch(`${BACKEND_URL}/api/trips/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({
          destination: query,
          duration:    parseInt(nights),
          budget:      budgetINR, // always send INR to backend
          travelers:   parseInt(travelers),
          tripStyle,
          startDate:   startDate || undefined,
          currency,
          exchangeRate,
        }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.message || 'Failed to generate itinerary')

      setRawTrip(data.trip)
      const trip = data.trip

      setItinerary({
        destination:    trip.destination,
        duration:       `${trip.duration} Nights / ${trip.duration + 1} Days`,
        totalBudget:    `${selectedCurrency.symbol}${budget}`,
        totalBudgetINR: budgetINR,
        currency,
        exchangeRate,
        currencySymbol: selectedCurrency.symbol,
        summary:        trip.summary,
        highlights:     trip.highlights || [],
        bestTime:       'Oct – March',
        startDate:      startDate || null,
        endDate:        startDate
          ? (() => { const d = new Date(startDate); d.setDate(d.getDate() + trip.duration); return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) })()
          : null,
        weather:     trip.weather?.length > 0
          ? `${Math.round(trip.weather[0].tempMax)}°C, ${trip.weather[0].condition}`
          : 'Check local forecast',
        weatherFull: trip.weather || [],

        days: (trip.dayPlans || []).map((day) => {
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
            themeColor: ['bg-saffron', 'bg-terracotta', 'bg-deepblue'][(day.day - 1) % 3],
            activities: (day.attractions || []).map(a => ({
              time:     a.timing   || '10:00 AM',
              name:     a.name,
              type:     a.category || 'Sightseeing',
              // Store USD cost; display logic in ActivityRow handles currency
              cost:     (!a.entryFee || a.entryFee === 0) ? 'Free' : `$${a.entryFee}`,
              costINR:  (!a.entryFeeINR || a.entryFeeINR === 0) ? 'Free' : `₹${a.entryFeeINR}`,
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
          stars:      h.stars || 3,
          price:      `${selectedCurrency.symbol}${(h.pricePerNight / exchangeRate * (currency === 'INR' ? 83 : 1)).toFixed(0)}`,
          priceINR:   h.priceINR ? `₹${h.priceINR.toLocaleString('en-IN')}` : null,
          location:   trip.destination,
          perks:      h.amenities || [],
          badge:      i === 0 ? 'Best Value' : i === 1 ? 'Luxury Pick' : 'Budget Pick',
          badgeColor: i === 0 ? 'bg-saffron'  : i === 1 ? 'bg-terracotta' : 'bg-green-600',
        })),

        budgetBreakdown: trip.budgetBreakdown ? [
          { category: 'Accommodation', amount: `₹${trip.budgetBreakdown.accommodation}`, amountCurr: `${selectedCurrency.symbol}${(trip.budgetBreakdown.accommodation / exchangeRate).toFixed(0)}`, percentage: Math.round((trip.budgetBreakdown.accommodation / trip.budgetBreakdown.total) * 100), color: 'bg-saffron'    },
          { category: 'Food & Drinks', amount: `₹${trip.budgetBreakdown.food}`,          amountCurr: `${selectedCurrency.symbol}${(trip.budgetBreakdown.food          / exchangeRate).toFixed(0)}`, percentage: Math.round((trip.budgetBreakdown.food          / trip.budgetBreakdown.total) * 100), color: 'bg-terracotta' },
          { category: 'Transport',     amount: `₹${trip.budgetBreakdown.transport}`,     amountCurr: `${selectedCurrency.symbol}${(trip.budgetBreakdown.transport     / exchangeRate).toFixed(0)}`, percentage: Math.round((trip.budgetBreakdown.transport     / trip.budgetBreakdown.total) * 100), color: 'bg-deepblue'   },
          { category: 'Sightseeing',   amount: `₹${trip.budgetBreakdown.attractions}`,   amountCurr: `${selectedCurrency.symbol}${(trip.budgetBreakdown.attractions   / exchangeRate).toFixed(0)}`, percentage: Math.round((trip.budgetBreakdown.attractions   / trip.budgetBreakdown.total) * 100), color: 'bg-charcoal'   },
        ] : [],

        packingList: trip.packingList || [],
        travelTips:  trip.travelTips  || [],
      })

    } catch (err) {
      setError(err.message || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  async function handleSaveTrip() {
    if (!rawTrip?._id) return
    if (!currentUser) { alert('Please login to save your trip!'); return }
    try {
      const token = await auth.currentUser.getIdToken()
      const res   = await fetch(`${BACKEND_URL}/api/trips/${rawTrip._id}/save`, {
        method: 'PUT', headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.success) setSaved(true)
    } catch { alert('Failed to save trip.') }
  }

  // ── STATE A: Form ───────────────────────────────────────────
  if (!itinerary && !loading) {
    return (
      <div className="py-16">
        <div className="text-center mb-3">
          <span className="font-garamond text-xs uppercase tracking-widest text-terracotta">✦ Powered by Gemini AI</span>
        </div>
        <div className="text-center mb-2">
          <h2 className="font-playfair text-5xl md:text-6xl text-charcoal font-bold italic">Plan your perfect</h2>
        </div>
        <div className="text-center mb-10">
          <h2 className="font-playfair text-5xl md:text-6xl text-saffron font-bold italic">Indian journey.</h2>
        </div>

        {/* Mode toggle */}
        <div className="flex justify-center mb-8">
          <div className="bg-sand rounded-2xl p-1.5 flex gap-1">
            <button onClick={() => setMode('ai')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-garamond text-sm font-semibold transition-all duration-200 ${mode === 'ai' ? 'bg-charcoal text-cream shadow-sm' : 'text-charcoal/60 hover:text-charcoal'}`}>
              <FiZap size={16} /> AI Generate
            </button>
            <button onClick={() => setMode('custom')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-garamond text-sm font-semibold transition-all duration-200 ${mode === 'custom' ? 'bg-charcoal text-cream shadow-sm' : 'text-charcoal/60 hover:text-charcoal'}`}>
              <FiEdit3 size={16} /> Build My Own
            </button>
          </div>
        </div>

        {mode === 'custom' ? (
          <div className="max-w-3xl mx-auto">
            <CustomItineraryBuilder currentUser={currentUser} />
          </div>
        ) : (
          <>
            {error && (
              <div className="max-w-2xl mx-auto mb-6 bg-red-50 border border-red-200 text-red-600 font-garamond text-sm px-4 py-3 rounded-xl">❌ {error}</div>
            )}

            <div className="bg-sand rounded-3xl p-8 md:p-10 max-w-2xl mx-auto shadow-sm">
              <form onSubmit={handleGenerate} className="space-y-5">
                <h3 className="font-playfair text-2xl text-charcoal font-semibold mb-6">Where do you want to go?</h3>

                {/* Destination */}
                <div>
                  <label className="font-garamond text-xs uppercase tracking-widest text-charcoal/60 mb-2 block">Destination</label>
                  <input type="text" placeholder="e.g. Jaipur, Varanasi, Kerala..."
                    value={query} onChange={e => setQuery(e.target.value)} required
                    className="w-full bg-cream border border-cream focus:border-saffron focus:outline-none font-garamond text-lg text-charcoal px-5 py-4 rounded-2xl transition-colors" />
                </div>

                {/* Date + Nights */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-garamond text-xs uppercase tracking-widest text-charcoal/60 mb-2 block">Travel Start Date</label>
                    <input type="date" value={startDate} min={new Date().toISOString().split('T')[0]}
                      onChange={e => setStartDate(e.target.value)}
                      className="w-full bg-cream border border-cream focus:border-saffron focus:outline-none font-garamond text-lg text-charcoal px-5 py-4 rounded-2xl transition-colors" />
                  </div>
                  <div>
                    <label className="font-garamond text-xs uppercase tracking-widest text-charcoal/60 mb-2 block">Number of Nights</label>
                    <select value={nights} onChange={e => setNights(e.target.value)}
                      className="w-full bg-cream border border-cream focus:border-saffron focus:outline-none font-garamond text-lg text-charcoal px-5 py-4 rounded-2xl transition-colors">
                      {[1,2,3,4,5,6,7,10,14].map(n => <option key={n} value={n}>{n} night{n > 1 ? 's' : ''}</option>)}
                    </select>
                  </div>
                </div>

                {/* Currency + Budget */}
                <div>
                  <label className="font-garamond text-xs uppercase tracking-widest text-charcoal/60 mb-2 block">Currency & Budget</label>
                  <div className="flex gap-3">
                    <select value={currency} onChange={e => setCurrency(e.target.value)}
                      className="bg-cream border border-cream focus:border-saffron focus:outline-none font-garamond text-base text-charcoal px-4 py-4 rounded-2xl transition-colors w-40 shrink-0">
                      {CURRENCIES.map(c => (
                        <option key={c.code} value={c.code}>{c.code} {c.symbol}</option>
                      ))}
                    </select>
                    <div className="flex-1 relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 font-playfair text-lg text-charcoal/50">{selectedCurrency.symbol}</span>
                      <input type="number" min="1" value={budget} onChange={e => setBudget(e.target.value)}
                        className="w-full bg-cream border border-cream focus:border-saffron focus:outline-none font-garamond text-lg text-charcoal pl-9 pr-5 py-4 rounded-2xl transition-colors" />
                    </div>
                  </div>
                  {/* INR conversion preview */}
                  {currency !== 'INR' && budget && (
                    <div className="mt-2 font-garamond text-sm text-charcoal/50 flex items-center gap-2">
                      <span>≈</span>
                      <span className="text-charcoal font-semibold">₹{budgetINR.toLocaleString('en-IN')}</span>
                      <span>at 1 {currency} = ₹{exchangeRate.toFixed(2)}</span>
                    </div>
                  )}
                </div>

                {/* Travelers */}
                <div>
                  <label className="font-garamond text-xs uppercase tracking-widest text-charcoal/60 mb-2 block">Travelers</label>
                  <select value={travelers} onChange={e => setTravelers(e.target.value)}
                    className="w-full bg-cream border border-cream focus:border-saffron focus:outline-none font-garamond text-lg text-charcoal px-5 py-4 rounded-2xl transition-colors">
                    {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n} {n === 1 ? 'person' : 'people'}</option>)}
                  </select>
                </div>

                {/* Trip Style */}
                <div>
                  <label className="font-garamond text-xs uppercase tracking-widest text-charcoal/60 mb-2 block">Trip Style</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: 'budget',  label: '🎒 Budget',  desc: 'Affordable & local'  },
                      { value: 'comfort', label: '🏨 Comfort', desc: 'Mid-range & relaxed'  },
                      { value: 'luxury',  label: '✨ Luxury',  desc: 'Premium & exclusive'  },
                    ].map(style => (
                      <button key={style.value} type="button" onClick={() => setTripStyle(style.value)}
                        className={`rounded-2xl px-4 py-3 text-left transition-all duration-200 border-2 ${tripStyle === style.value ? 'border-saffron bg-saffron/10' : 'border-sand bg-cream hover:border-saffron/40'}`}>
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
                  <p className="text-center font-garamond text-xs text-charcoal/40">💡 Login to save your itineraries</p>
                )}
              </form>
            </div>
          </>
        )}
      </div>
    )
  }

  // ── STATE B: Loading ────────────────────────────────────────
  if (loading) {
    return (
      <div className="py-32 text-center">
        <div className="inline-block animate-spin text-6xl mb-6">🌏</div>
        <h2 className="font-playfair text-3xl text-charcoal font-bold mb-3">Crafting your perfect journey...</h2>
        <p className="font-garamond text-base text-charcoal/60 mb-8">
          Gemini AI is planning {query} · {nights} nights · {selectedCurrency.symbol}{budget}
          {currency !== 'INR' && ` (₹${budgetINR.toLocaleString('en-IN')})`}
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {['Researching attractions...','Finding best hotels...','Checking weather...','Calculating budget...'].map((msg, i) => (
            <div key={i} className="bg-sand font-garamond text-xs text-charcoal/50 px-4 py-2 rounded-full animate-pulse" style={{ animationDelay: `${i * 0.3}s` }}>
              {msg}
            </div>
          ))}
        </div>
      </div>
    )
  }

  // ── STATE C: Itinerary ──────────────────────────────────────
  const cs = itinerary.currencySymbol || '$'
  const er = itinerary.exchangeRate   || 83

  return (
    <div>
      <HeroBanner itinerary={itinerary} />

      {itinerary.summary && (
        <div className="bg-sand rounded-2xl p-6 mb-8">
          <p className="font-garamond text-base text-charcoal/80 leading-relaxed italic">"{itinerary.summary}"</p>
        </div>
      )}

      {itinerary.highlights?.length > 0 && (
        <div className="flex flex-wrap gap-3 mb-10">
          {itinerary.highlights.map((h, i) => (
            <span key={i} className="bg-sand font-garamond text-sm text-charcoal/70 px-4 py-2 rounded-full border border-sand">✦ {h}</span>
          ))}
        </div>
      )}

      {/* Day Plans */}
      <div className="mb-12">
        <div className="font-garamond text-xs uppercase tracking-widest text-terracotta mb-2">✦ Day by Day</div>
        <h3 className="font-playfair text-3xl text-charcoal font-bold mb-8">Your Itinerary</h3>
        <div className="space-y-6">
          {itinerary.days.map(day => (
            <DayCard key={day.day} day={day} destination={itinerary.destination} currencySymbol={cs} exchangeRate={er} />
          ))}
        </div>
      </div>

      {/* Weather */}
      {itinerary.weatherFull?.length > 0 && (
        <div className="bg-sand rounded-3xl p-8 mb-10">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <h3 className="font-playfair text-2xl text-charcoal font-bold">🌤 Weather Forecast</h3>
            {itinerary.weatherFull[0]?.type === 'historical' && (
              <div className="font-garamond text-xs text-charcoal/50 bg-cream px-4 py-2 rounded-full border border-sand">📊 Based on last year's data</div>
            )}
            {itinerary.weatherFull[0]?.type === 'forecast' && itinerary.startDate && (
              <div className="font-garamond text-xs text-green-600 bg-green-50 px-4 py-2 rounded-full border border-green-200">✅ Live forecast</div>
            )}
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {itinerary.weatherFull.map((w, i) => (
              <div key={i} className="bg-cream rounded-2xl p-4 text-center min-w-[100px]">
                <div className="font-garamond text-xs text-charcoal/50 mb-2">
                  {(() => { const [y,m,d] = w.date.toString().split('T')[0].split('-'); return new Date(+y,+m-1,+d).toLocaleDateString('en',{weekday:'short',day:'numeric',month:'short'}) })()}
                </div>
                <div className="text-3xl mb-2">{w.condition === 'Sunny/Clear' ? '☀️' : w.condition === 'Rainy/Drizzle' ? '🌧️' : w.condition === 'Snowy' ? '❄️' : '⛈️'}</div>
                <div className="font-playfair text-lg text-charcoal font-bold">{Math.round(w.tempMax)}°C</div>
                <div className="font-garamond text-xs text-charcoal/40">{Math.round(w.tempMin)}°C</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Hotels */}
      {itinerary.hotels?.length > 0 && (
        <div className="mb-12">
          <div className="font-garamond text-xs uppercase tracking-widest text-terracotta mb-2">✦ Where to Stay</div>
          <h3 className="font-playfair text-3xl text-charcoal font-bold mb-8">Hotel Options</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {itinerary.hotels.map((hotel, idx) => (
              <HotelCard key={idx} hotel={hotel} currencySymbol={cs} exchangeRate={er} />
            ))}
          </div>
        </div>
      )}

      {/* Budget Breakdown */}
      {itinerary.budgetBreakdown?.length > 0 && (
        <div className="mt-12 bg-sand rounded-3xl p-8 md:p-10 mb-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div>
              <div className="font-garamond text-xs uppercase tracking-widest text-terracotta mb-2">✦ Budget Breakdown</div>
              <h3 className="font-playfair text-3xl text-charcoal font-bold mb-2">{itinerary.totalBudget} total</h3>
              {itinerary.currency !== 'INR' && (
                <p className="font-garamond text-base text-charcoal/50 mb-6">≈ ₹{itinerary.totalBudgetINR?.toLocaleString('en-IN')} INR</p>
              )}
              {itinerary.budgetBreakdown.map((item, idx) => (
                <div key={idx} className="mb-5 last:mb-0">
                  <div className="flex justify-between mb-2">
                    <span className="font-garamond text-sm text-charcoal/70">{item.category}</span>
                    <div className="text-right">
                      <span className="font-playfair text-base text-charcoal font-semibold">{item.amountCurr}</span>
                      <span className="font-garamond text-xs text-charcoal/40 ml-2">({item.amount})</span>
                    </div>
                  </div>
                  <div className="w-full bg-cream rounded-full h-2">
                    <div className={`${item.color} h-2 rounded-full transition-all duration-700`} style={{ width: `${item.percentage}%` }} />
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
                  <div className="text-right">
                    <div className="font-playfair text-2xl text-saffron font-bold">{itinerary.totalBudget}</div>
                    {itinerary.currency !== 'INR' && (
                      <div className="font-garamond text-sm text-charcoal/50">₹{itinerary.totalBudgetINR?.toLocaleString('en-IN')}</div>
                    )}
                  </div>
                </div>

                <button onClick={handleSaveTrip} disabled={saved}
                  className={`w-full mt-6 font-garamond text-sm uppercase tracking-widest py-4 rounded-xl transition-all duration-300
                    ${saved ? 'bg-green-600 text-white cursor-default' : 'bg-charcoal text-cream hover:bg-saffron hover:text-charcoal'}`}>
                  {saved ? '✅ Itinerary Saved!' : '✦ Save This Itinerary'}
                </button>
                {!currentUser && <p className="text-center font-garamond text-xs text-charcoal/40 mt-2">Login to save your trip</p>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Packing List */}
      {itinerary.packingList?.length > 0 && (
        <div className="bg-sand rounded-3xl p-8 mb-10">
          <h3 className="font-playfair text-2xl text-charcoal font-bold mb-6 flex items-center gap-2"><FiPackage size={24} /> Packing List</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {itinerary.packingList.map((item, i) => (
              <div key={i} className="flex items-start gap-2 font-garamond text-sm text-charcoal/70">
                <span className="text-saffron shrink-0 mt-0.5">✓</span>{item}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Travel Tips */}
      {itinerary.travelTips?.length > 0 && (
        <div className="bg-sand rounded-3xl p-8 mb-10">
          <h3 className="font-playfair text-2xl text-charcoal font-bold mb-6">💡 Travel Tips</h3>
          <div className="space-y-3">
            {itinerary.travelTips.map((tip, i) => (
              <div key={i} className="flex items-start gap-3 font-garamond text-sm text-charcoal/70">
                <span className="text-saffron shrink-0 mt-0.5">→</span>{tip}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Action Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-sand rounded-2xl px-8 py-6">
        <div>
          <h3 className="font-playfair text-xl text-charcoal font-semibold">Love this itinerary?</h3>
          <p className="font-garamond text-sm text-charcoal/60">Book a verified guide to bring it to life.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto flex-wrap">
          <button onClick={() => {
            setEditMode(true)
            setEditDays(itinerary.days.map(d => ({
              id: d.day, title: d.title,
              activities: d.activities.map(a => ({ name: a.name, time: a.time, notes: a.tip }))
            })))
          }}
            className="flex-1 md:flex-none border border-charcoal text-charcoal font-garamond text-sm uppercase tracking-wider px-6 py-3 rounded-xl hover:bg-charcoal hover:text-cream transition-all duration-300">
            ✏️ Edit Itinerary
          </button>
          <button className="flex-1 md:flex-none bg-saffron text-charcoal font-garamond text-sm uppercase tracking-wider px-8 py-3 rounded-xl hover:bg-amber-500 transition-all duration-300">
            Book a Guide →
          </button>
          <button onClick={() => { setItinerary(null); setRawTrip(null); setError(null); setSaved(false); setStartDate(''); setEditMode(false) }}
            className="flex-1 md:flex-none border border-charcoal/30 text-charcoal font-garamond text-sm uppercase tracking-wider px-6 py-3 rounded-xl hover:bg-charcoal hover:text-cream transition-all duration-300">
            ← Plan Another
          </button>
        </div>
      </div>

      {/* ── Edit Itinerary Modal ── */}
      {editMode && (
        <EditItineraryModal
          itinerary={itinerary}
          rawTripId={rawTrip?._id}
          currentUser={currentUser}
          onClose={() => setEditMode(false)}
          onSaved={(updatedDays) => {
            setItinerary(prev => ({ ...prev, days: updatedDays }))
            setEditMode(false)
          }}
        />
      )}
    </div>
  )
}