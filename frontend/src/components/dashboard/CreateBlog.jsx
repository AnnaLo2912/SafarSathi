import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { auth } from '../../firebase'
import { getPlaceImage } from '../../services/unsplash'

const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001'

// Auto-detect holiday type from destination/story keywords
function detectHolidayType(destination, story) {
  const text = `${destination} ${story}`.toLowerCase()
  if (/beach|sea|ocean|goa|maldives|coast|waves|sand|surf/.test(text)) return 'beach'
  if (/mountain|trek|himalaya|manali|shimla|altitude|snow|peak|hill/.test(text)) return 'mountains'
  if (/fort|palace|temple|heritage|history|ancient|monument|rajasthan|jaipur|agra/.test(text)) return 'heritage'
  if (/adventure|rafting|camping|trek|bungee|zipline|wild|jungle|safari/.test(text)) return 'adventure'
  if (/food|eat|restaurant|cuisine|street food|taste|spice|dish|thali/.test(text)) return 'food'
  return 'heritage'
}

const TEMPLATES = {
  beach: {
    label: '🏖️ Beach Escape',
    gradient: 'from-cyan-400 via-blue-400 to-teal-500',
    bg: 'bg-gradient-to-br from-cyan-50 to-blue-50',
    accent: 'text-cyan-700',
    border: 'border-cyan-200',
    badge: 'bg-cyan-100 text-cyan-700',
    pattern: '〰️',
    headerBg: 'bg-gradient-to-r from-cyan-500 to-blue-500',
  },
  mountains: {
    label: '🏔️ Mountain Trek',
    gradient: 'from-slate-600 via-gray-700 to-stone-800',
    bg: 'bg-gradient-to-br from-slate-50 to-gray-100',
    accent: 'text-slate-700',
    border: 'border-slate-300',
    badge: 'bg-slate-100 text-slate-700',
    pattern: '▲',
    headerBg: 'bg-gradient-to-r from-slate-600 to-gray-700',
  },
  heritage: {
    label: '🏛️ Heritage Trail',
    gradient: 'from-amber-700 via-yellow-800 to-orange-900',
    bg: 'bg-gradient-to-br from-amber-50 to-yellow-50',
    accent: 'text-amber-800',
    border: 'border-amber-200',
    badge: 'bg-amber-100 text-amber-800',
    pattern: '✦',
    headerBg: 'bg-gradient-to-r from-amber-700 to-orange-800',
  },
  adventure: {
    label: '🧗 Adventure Rush',
    gradient: 'from-orange-500 via-red-500 to-rose-600',
    bg: 'bg-gradient-to-br from-orange-50 to-red-50',
    accent: 'text-orange-700',
    border: 'border-orange-200',
    badge: 'bg-orange-100 text-orange-700',
    pattern: '⚡',
    headerBg: 'bg-gradient-to-r from-orange-500 to-red-600',
  },
  food: {
    label: '🍜 Food Journey',
    gradient: 'from-yellow-500 via-orange-400 to-amber-500',
    bg: 'bg-gradient-to-br from-yellow-50 to-orange-50',
    accent: 'text-yellow-700',
    border: 'border-yellow-200',
    badge: 'bg-yellow-100 text-yellow-800',
    pattern: '◆',
    headerBg: 'bg-gradient-to-r from-yellow-500 to-orange-500',
  },
}

export default function CreateBlog({ onClose, onCreated }) {
  const { currentUser, userProfile } = useAuth()
  const [submitting, setSubmitting]  = useState(false)
  const [error,      setError]       = useState('')
  const [coverImg,   setCoverImg]    = useState(null)
  const [loadingImg, setLoadingImg]  = useState(false)

  const [form, setForm] = useState({
    title:       '',
    destination: '',
    duration:    '',
    travelDate:  '',
    story:       '',
    highlights:  ['', '', ''],
    tips:        ['', '', ''],
    budget:      '',
    rating:      5,
    holidayType: 'heritage',
  })

  // Auto-detect type as user types
  useEffect(() => {
    const detected = detectHolidayType(form.destination, form.story)
    setForm(prev => ({ ...prev, holidayType: detected }))
  }, [form.destination, form.story])

  // Fetch cover image when destination changes
  useEffect(() => {
    if (!form.destination) return
    let cancelled = false
    setLoadingImg(true)
    getPlaceImage(`${form.destination} travel ${form.holidayType}`)
      .then(url => { if (!cancelled) { setCoverImg(url); setLoadingImg(false) } })
      .catch(() => setLoadingImg(false))
    return () => { cancelled = true }
  }, [form.destination, form.holidayType])

  function update(field, value) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  function updateList(field, idx, value) {
    setForm(prev => {
      const arr = [...prev[field]]
      arr[idx] = value
      return { ...prev, [field]: arr }
    })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.title || !form.destination || !form.story) {
      setError('Title, destination and story are required')
      return
    }
    try {
      setSubmitting(true); setError('')
      const token = await auth.currentUser.getIdToken()
      const res   = await fetch(`${BACKEND_URL}/api/blogs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          ...form,
          coverImage:  coverImg || '',
          highlights:  form.highlights.filter(Boolean),
          tips:        form.tips.filter(Boolean),
        }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.message)
      onCreated?.()
    } catch (err) {
      setError(err.message || 'Failed to publish blog')
    } finally {
      setSubmitting(false)
    }
  }

  const t = TEMPLATES[form.holidayType] || TEMPLATES.heritage

  return (
    <div className="fixed inset-0 z-50 bg-black/60 overflow-y-auto">
      <div className="min-h-screen px-4 py-8 flex items-start justify-center">
        <div className="w-full max-w-5xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* ── LEFT: Form ── */}
            <div className="bg-white rounded-3xl p-8 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-playfair text-2xl text-charcoal font-bold">Share Your Story</h2>
                <button onClick={onClose} className="text-charcoal/40 hover:text-charcoal font-bold text-xl">✕</button>
              </div>

              {error && <div className="bg-red-50 text-red-600 font-garamond text-sm px-4 py-3 rounded-xl mb-4">❌ {error}</div>}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Title */}
                <div>
                  <label className="font-garamond text-xs uppercase tracking-widest text-charcoal/60 mb-1.5 block">Blog Title *</label>
                  <input type="text" placeholder="My Unforgettable Trip to Jaipur..." value={form.title}
                    onChange={e => update('title', e.target.value)} required
                    className="w-full bg-sand border border-sand focus:border-saffron focus:outline-none font-garamond text-base text-charcoal px-4 py-3 rounded-xl transition-colors" />
                </div>

                {/* Destination + Duration */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-garamond text-xs uppercase tracking-widest text-charcoal/60 mb-1.5 block">Destination *</label>
                    <input type="text" placeholder="e.g. Jaipur" value={form.destination}
                      onChange={e => update('destination', e.target.value)} required
                      className="w-full bg-sand border border-sand focus:border-saffron focus:outline-none font-garamond text-base text-charcoal px-4 py-3 rounded-xl transition-colors" />
                  </div>
                  <div>
                    <label className="font-garamond text-xs uppercase tracking-widest text-charcoal/60 mb-1.5 block">Duration</label>
                    <input type="text" placeholder="e.g. 5 days" value={form.duration}
                      onChange={e => update('duration', e.target.value)}
                      className="w-full bg-sand border border-sand focus:border-saffron focus:outline-none font-garamond text-base text-charcoal px-4 py-3 rounded-xl transition-colors" />
                  </div>
                </div>

                {/* Travel Date + Budget */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-garamond text-xs uppercase tracking-widest text-charcoal/60 mb-1.5 block">Travel Date</label>
                    <input type="text" placeholder="e.g. Dec 2024" value={form.travelDate}
                      onChange={e => update('travelDate', e.target.value)}
                      className="w-full bg-sand border border-sand focus:border-saffron focus:outline-none font-garamond text-base text-charcoal px-4 py-3 rounded-xl transition-colors" />
                  </div>
                  <div>
                    <label className="font-garamond text-xs uppercase tracking-widest text-charcoal/60 mb-1.5 block">Budget Spent</label>
                    <input type="text" placeholder="e.g. ₹15,000" value={form.budget}
                      onChange={e => update('budget', e.target.value)}
                      className="w-full bg-sand border border-sand focus:border-saffron focus:outline-none font-garamond text-base text-charcoal px-4 py-3 rounded-xl transition-colors" />
                  </div>
                </div>

                {/* Holiday type override */}
                <div>
                  <label className="font-garamond text-xs uppercase tracking-widest text-charcoal/60 mb-1.5 block">
                    Template <span className="text-charcoal/40 normal-case">(auto-detected)</span>
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {Object.entries(TEMPLATES).map(([key, tmpl]) => (
                      <button key={key} type="button" onClick={() => update('holidayType', key)}
                        className={`rounded-xl py-2 text-center font-garamond text-xs transition-all duration-200 border-2 ${
                          form.holidayType === key ? 'border-charcoal bg-charcoal text-white' : 'border-sand bg-sand hover:border-charcoal/30'
                        }`}>
                        {tmpl.label.split(' ')[0]}<br/>
                        <span className="text-xs opacity-70">{tmpl.label.split(' ').slice(1).join(' ')}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Story */}
                <div>
                  <label className="font-garamond text-xs uppercase tracking-widest text-charcoal/60 mb-1.5 block">Your Story *</label>
                  <textarea rows={5} placeholder="Tell us about your experience..."
                    value={form.story} onChange={e => update('story', e.target.value)} required
                    className="w-full bg-sand border border-sand focus:border-saffron focus:outline-none font-garamond text-base text-charcoal px-4 py-3 rounded-xl transition-colors resize-none" />
                </div>

                {/* Highlights */}
                <div>
                  <label className="font-garamond text-xs uppercase tracking-widest text-charcoal/60 mb-1.5 block">Top Highlights</label>
                  <div className="space-y-2">
                    {form.highlights.map((h, i) => (
                      <input key={i} type="text" placeholder={`Highlight ${i + 1}`} value={h}
                        onChange={e => updateList('highlights', i, e.target.value)}
                        className="w-full bg-sand border border-sand focus:border-saffron focus:outline-none font-garamond text-sm text-charcoal px-4 py-2.5 rounded-xl transition-colors" />
                    ))}
                  </div>
                </div>

                {/* Tips */}
                <div>
                  <label className="font-garamond text-xs uppercase tracking-widest text-charcoal/60 mb-1.5 block">Travel Tips</label>
                  <div className="space-y-2">
                    {form.tips.map((tip, i) => (
                      <input key={i} type="text" placeholder={`Tip ${i + 1}`} value={tip}
                        onChange={e => updateList('tips', i, e.target.value)}
                        className="w-full bg-sand border border-sand focus:border-saffron focus:outline-none font-garamond text-sm text-charcoal px-4 py-2.5 rounded-xl transition-colors" />
                    ))}
                  </div>
                </div>

                {/* Rating */}
                <div>
                  <label className="font-garamond text-xs uppercase tracking-widest text-charcoal/60 mb-1.5 block">Trip Rating</label>
                  <div className="flex gap-2">
                    {[1,2,3,4,5].map(n => (
                      <button key={n} type="button" onClick={() => update('rating', n)}
                        className={`text-2xl transition-all duration-150 ${n <= form.rating ? 'scale-110' : 'opacity-30'}`}>
                        ⭐
                      </button>
                    ))}
                  </div>
                </div>

                <button type="submit" disabled={submitting}
                  className="w-full bg-charcoal text-cream font-garamond text-sm uppercase tracking-widest py-4 rounded-2xl hover:bg-saffron hover:text-charcoal transition-all duration-300 disabled:opacity-50 mt-2">
                  {submitting ? 'Publishing...' : '✦ Publish Blog'}
                </button>
              </form>
            </div>

            {/* ── RIGHT: Live Template Preview ── */}
            <div className="lg:sticky lg:top-8 self-start">
              <p className="font-garamond text-xs uppercase tracking-widest text-charcoal/40 mb-3 text-center">Live Preview</p>
              <div className={`rounded-3xl overflow-hidden border ${t.border} ${t.bg} shadow-xl`}>

                {/* Cover */}
                <div className={`relative h-52 bg-gradient-to-br ${t.gradient}`}>
                  {loadingImg && <div className="absolute inset-0 flex items-center justify-center"><div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" /></div>}
                  {coverImg && !loadingImg && <img src={coverImg} alt="cover" className="w-full h-full object-cover opacity-70" />}
                  {!coverImg && !loadingImg && (
                    <div className="absolute inset-0 flex items-center justify-center text-7xl opacity-20 font-bold text-white">{t.pattern}</div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute top-3 left-3">
                    <span className={`font-garamond text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full bg-white/80 ${t.accent}`}>{t.label}</span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="font-playfair text-lg text-white font-bold leading-tight">
                      {form.title || 'Your Blog Title'}
                    </h3>
                    <p className="font-garamond text-sm text-white/80">📍 {form.destination || 'Destination'}</p>
                  </div>
                </div>

                {/* Preview body */}
                <div className="p-5">
                  <div className="flex flex-wrap gap-2 mb-4">
                    {form.duration   && <span className={`font-garamond text-xs px-2.5 py-1 rounded-full ${t.badge}`}>📅 {form.duration}</span>}
                    {form.travelDate && <span className={`font-garamond text-xs px-2.5 py-1 rounded-full ${t.badge}`}>🗓 {form.travelDate}</span>}
                    {form.budget     && <span className={`font-garamond text-xs px-2.5 py-1 rounded-full ${t.badge}`}>💰 {form.budget}</span>}
                    <span className={`font-garamond text-xs px-2.5 py-1 rounded-full ${t.badge}`}>{'⭐'.repeat(form.rating)}</span>
                  </div>

                  <p className="font-garamond text-sm text-charcoal/70 leading-relaxed line-clamp-4 mb-4">
                    {form.story || 'Your story will appear here...'}
                  </p>

                  {form.highlights.some(Boolean) && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {form.highlights.filter(Boolean).map((h, i) => (
                        <span key={i} className={`font-garamond text-xs px-2 py-1 rounded-full border ${t.border} ${t.accent}`}>{t.pattern} {h}</span>
                      ))}
                    </div>
                  )}

                  <div className={`flex items-center justify-between pt-3 border-t ${t.border}`}>
                    <div className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold bg-gradient-to-br ${t.gradient}`}>
                        {userProfile?.name?.[0]?.toUpperCase() || 'Y'}
                      </div>
                      <p className="font-playfair text-xs text-charcoal font-semibold">{userProfile?.name || 'You'}</p>
                    </div>
                    <div className="flex items-center gap-1 font-garamond text-sm text-charcoal/40">
                      🤍 <span>0</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}