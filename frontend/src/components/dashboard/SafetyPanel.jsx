import { useState, useEffect } from 'react'
import { FiMapPin, FiShield, FiUser, FiPhone, FiPlus, FiTrash2, FiX, FiCheck } from 'react-icons/fi'
import { useAuth } from '../../context/AuthContext'
import { auth } from '../../firebase'

const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001'

async function getHeaders() {
  const token = await auth.currentUser?.getIdToken()
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
}

// ── Add Contact Modal ─────────────────────────────────────────
function AddContactModal({ onClose, onAdded }) {
  const [form,    setForm]    = useState({ name: '', phone: '', relation: 'Friend' })
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  async function submit(e) {
    e.preventDefault()
    if (!form.name || !form.phone) { setError('Name and phone required'); return }
    const digits = form.phone.replace(/\D/g, '')
    if (digits.length < 10) { setError('Enter a valid 10-digit Indian mobile number'); return }
    try {
      setLoading(true)
      const res  = await fetch(`${BACKEND_URL}/api/safety/contacts`, {
        method: 'POST', headers: await getHeaders(), body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.message)
      onAdded(data.contacts)
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-cream rounded-3xl p-8 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-playfair text-xl text-charcoal font-bold">Add Emergency Contact</h3>
          <button onClick={onClose} className="text-charcoal/40 hover:text-charcoal"><FiX size={20} /></button>
        </div>

        {error && <div className="bg-red-50 text-red-600 font-garamond text-sm px-4 py-3 rounded-xl mb-4">❌ {error}</div>}

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="font-garamond text-xs uppercase tracking-widest text-charcoal/60 mb-1.5 block">Full Name</label>
            <input type="text" placeholder="e.g. Mum" value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required
              className="w-full bg-sand border border-sand focus:border-saffron focus:outline-none font-garamond text-base text-charcoal px-4 py-3 rounded-xl transition-colors" />
          </div>
          <div>
            <label className="font-garamond text-xs uppercase tracking-widest text-charcoal/60 mb-1.5 block">Phone (with country code)</label>
            <input type="tel" placeholder="9876543210" value={form.phone}
              onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} required
              className="w-full bg-sand border border-sand focus:border-saffron focus:outline-none font-garamond text-base text-charcoal px-4 py-3 rounded-xl transition-colors" />
            <p className="font-garamond text-xs text-charcoal/40 mt-1">Indian 10-digit mobile number</p>
          </div>
          <div>
            <label className="font-garamond text-xs uppercase tracking-widest text-charcoal/60 mb-1.5 block">Relation</label>
            <select value={form.relation} onChange={e => setForm(p => ({ ...p, relation: e.target.value }))}
              className="w-full bg-sand border border-sand focus:border-saffron focus:outline-none font-garamond text-base text-charcoal px-4 py-3 rounded-xl transition-colors">
              {['Family', 'Friend', 'Partner', 'Colleague', 'Other'].map(r => <option key={r}>{r}</option>)}
            </select>
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-charcoal text-cream font-garamond text-sm uppercase tracking-widest py-4 rounded-xl hover:bg-saffron hover:text-charcoal transition-all duration-300 disabled:opacity-50">
            {loading ? 'Saving...' : '+ Add Contact'}
          </button>
        </form>
      </div>
    </div>
  )
}

// ── Main SafetyPanel ──────────────────────────────────────────
export default function SafetyPanel() {
  const { currentUser, userProfile } = useAuth()

  const [panicActive,    setPanicActive]    = useState(false)
  const [panicSent,      setPanicSent]      = useState(false)
  const [sosResult,      setSosResult]      = useState(null)
  const [countdown,      setCountdown]      = useState(3)
  const [location,       setLocation]       = useState(null)
  const [locationError,  setLocationError]  = useState('')
  const [networkStatus,  setNetworkStatus]  = useState('Online')
  const [contacts,       setContacts]       = useState([])
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [showAddContact, setShowAddContact] = useState(false)
  const [sosLoading,     setSosLoading]     = useState(false)
  const [userPhone,      setUserPhone]      = useState('')
  const [editingPhone,   setEditingPhone]   = useState(false)
  const [phoneInput,     setPhoneInput]     = useState('')

  // Get GPS
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => setLocation({
          lat:      pos.coords.latitude,
          lng:      pos.coords.longitude,
          latStr:   pos.coords.latitude.toFixed(4),
          lngStr:   pos.coords.longitude.toFixed(4),
          accuracy: pos.coords.accuracy.toFixed(0),
        }),
        () => setLocationError('Location access denied')
      )
    }
  }, [])

  // Network
  useEffect(() => {
    const update = () => setNetworkStatus(navigator.onLine ? 'Online' : 'Offline')
    window.addEventListener('online',  update)
    window.addEventListener('offline', update)
    return () => { window.removeEventListener('online', update); window.removeEventListener('offline', update) }
  }, [])

  // Load safety profile
  useEffect(() => {
    if (!currentUser) return
    loadProfile()
  }, [currentUser])

  async function loadProfile() {
    try {
      setLoadingProfile(true)
      const headers = await getHeaders()
      const res     = await fetch(`${BACKEND_URL}/api/safety/profile`, { headers })
      const data    = await res.json()
      if (data.success) {
        setContacts(data.profile.emergencyContacts || [])
        setUserPhone(data.profile.userPhone || '')
        setPhoneInput(data.profile.userPhone || '')
      }
    } catch (err) {
      console.error('Safety profile load error:', err)
    } finally {
      setLoadingProfile(false)
    }
  }

  async function deleteContact(contactId) {
    if (!window.confirm('Remove this contact?')) return
    try {
      const headers = await getHeaders()
      const res     = await fetch(`${BACKEND_URL}/api/safety/contacts/${contactId}`, { method: 'DELETE', headers })
      const data    = await res.json()
      if (data.success) setContacts(data.contacts)
    } catch (err) {
      console.error('Delete contact error:', err)
    }
  }

  async function savePhone() {
    try {
      const headers = await getHeaders()
      await fetch(`${BACKEND_URL}/api/safety/profile`, {
        method: 'PATCH', headers, body: JSON.stringify({ userPhone: phoneInput }),
      })
      setUserPhone(phoneInput)
      setEditingPhone(false)
    } catch (err) {
      console.error('Save phone error:', err)
    }
  }

  // Panic countdown
  useEffect(() => {
    if (!panicActive) return
    if (countdown === 0) {
      handleSendSOS()
      return
    }
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [panicActive, countdown])

  function triggerPanic() {
    if (!location) { alert('GPS location is required. Please allow location access.'); return }
    setPanicActive(true)
    setCountdown(3)
  }

  function cancelPanic() {
    setPanicActive(false)
    setCountdown(3)
  }

  async function handleSendSOS() {
    setPanicActive(false)
    setSosLoading(true)
    try {
      const headers = await getHeaders()
      const res     = await fetch(`${BACKEND_URL}/api/safety/sos`, {
        method: 'POST', headers,
        body: JSON.stringify({ lat: location.lat, lon: location.lng, accuracy: location.accuracy }),
      })
      const data = await res.json()
      setSosResult(data)
      setPanicSent(true)
    } catch (err) {
      console.error('SOS error:', err)
      setPanicSent(true)
      setSosResult({ success: false, message: 'Failed to send SOS. Call 112 immediately.' })
    } finally {
      setSosLoading(false)
    }
  }

  function resetPanic() {
    setPanicSent(false)
    setSosResult(null)
    setCountdown(3)
  }

  const totalAlerted = (sosResult?.sentTo?.length || 0) + (sosResult?.guidesAlerted?.length || 0)

  return (
    <div className="page-fade-in">
      {showAddContact && (
        <AddContactModal onClose={() => setShowAddContact(false)} onAdded={setContacts} />
      )}

      {/* Header */}
      <div className="mb-10">
        <div className="font-garamond text-xs uppercase tracking-widest text-terracotta mb-2">✦ Your Safety Hub</div>
        <h1 className="font-playfair text-4xl text-charcoal font-bold mb-1">Always protected,</h1>
        <h1 className="font-playfair text-4xl text-saffron italic font-bold">wherever you go.</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* LEFT COLUMN */}
        <div className="space-y-6">

          {/* Live Status */}
          <div className="bg-sand rounded-3xl p-6">
            <h2 className="font-playfair text-lg text-charcoal font-semibold mb-4">Live Status</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-cream flex items-center justify-center"><FiMapPin size={16} /></div>
                  <span className="font-garamond text-sm text-charcoal/70">GPS Location</span>
                </div>
                {location ? (
                  <div className="bg-green-100 text-green-700 font-garamond text-xs px-3 py-1 rounded-full flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    {location.latStr}, {location.lngStr}
                  </div>
                ) : locationError ? (
                  <div className="bg-red-100 text-red-600 font-garamond text-xs px-3 py-1 rounded-full">Access Denied</div>
                ) : (
                  <div className="bg-amber-100 text-amber-700 font-garamond text-xs px-3 py-1 rounded-full animate-pulse">Locating...</div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-cream flex items-center justify-center">📶</div>
                  <span className="font-garamond text-sm text-charcoal/70">Network</span>
                </div>
                <div className={`font-garamond text-xs px-3 py-1 rounded-full ${networkStatus === 'Online' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                  {networkStatus}
                </div>
              </div>
            </div>
          </div>

          {/* My Phone */}
          <div className="bg-sand rounded-3xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-playfair text-lg text-charcoal font-semibold">My Phone Number</h2>
              <button onClick={() => setEditingPhone(true)} className="font-garamond text-xs text-saffron underline">Edit</button>
            </div>
            {editingPhone ? (
              <div className="flex gap-2">
                <input type="tel" value={phoneInput} onChange={e => setPhoneInput(e.target.value)}
                  placeholder="+919876543210"
                  className="flex-1 bg-cream border border-cream focus:border-saffron focus:outline-none font-garamond text-base text-charcoal px-4 py-3 rounded-xl transition-colors" />
                <button onClick={savePhone} className="bg-charcoal text-cream px-4 py-3 rounded-xl hover:bg-saffron hover:text-charcoal transition-all">
                  <FiCheck size={18} />
                </button>
                <button onClick={() => setEditingPhone(false)} className="text-charcoal/40 px-3">
                  <FiX size={18} />
                </button>
              </div>
            ) : (
              <div className="bg-cream rounded-xl px-4 py-3 font-garamond text-base text-charcoal">
                {userPhone || <span className="text-charcoal/40 italic">Not set — add your number for SOS alerts</span>}
              </div>
            )}
          </div>

          {/* Emergency Contacts */}
          <div className="bg-sand rounded-3xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-playfair text-lg text-charcoal font-semibold">Emergency Contacts</h2>
              <button onClick={() => setShowAddContact(true)}
                className="flex items-center gap-1.5 bg-charcoal text-cream font-garamond text-xs px-3 py-2 rounded-xl hover:bg-saffron hover:text-charcoal transition-all">
                <FiPlus size={14} /> Add
              </button>
            </div>

            {loadingProfile ? (
              <div className="space-y-2">{[1,2].map(i => <div key={i} className="h-16 bg-cream rounded-xl animate-pulse" />)}</div>
            ) : contacts.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-3xl mb-2">📵</p>
                <p className="font-garamond text-sm text-charcoal/50">No emergency contacts yet</p>
                <p className="font-garamond text-xs text-charcoal/40 mt-1">Add contacts to receive SOS alerts</p>
              </div>
            ) : (
              <div className="space-y-3">
                {contacts.map(c => (
                  <div key={c._id} className="flex items-center justify-between bg-cream rounded-2xl px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-saffron/20 flex items-center justify-center font-playfair font-bold text-saffron text-sm">
                        {c.name[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-playfair text-sm text-charcoal font-semibold">{c.name}</p>
                        <p className="font-garamond text-xs text-charcoal/50">{c.phone} · {c.relation}</p>
                      </div>
                    </div>
                    <button onClick={() => deleteContact(c._id)} className="text-red-400 hover:text-red-600 p-2 transition-colors">
                      <FiTrash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Fixed emergency numbers */}
            <div className="mt-4 pt-4 border-t border-sand space-y-2">
              <p className="font-garamond text-xs uppercase tracking-widest text-charcoal/40 mb-2">India Emergency Numbers</p>
              {[
                { label: 'All Emergencies', number: '112', icon: '🚨' },
                { label: 'Ambulance',       number: '108', icon: '🏥' },
                { label: 'Police',          number: '100', icon: '👮' },
                { label: 'Tourist Helpline',number: '1800111363', icon: '🗺️' },
              ].map(c => (
                <div key={c.number} className="flex items-center justify-between bg-cream rounded-xl px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span>{c.icon}</span>
                    <span className="font-garamond text-sm text-charcoal/70">{c.label}</span>
                  </div>
                  <a href={`tel:${c.number}`} className="font-playfair text-base text-saffron font-bold hover:text-terracotta transition-colors">
                    {c.number}
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-6">

          {/* STATE 1: Normal panic button */}
          {!panicSent && !panicActive && !sosLoading && (
            <div className="bg-sand rounded-3xl p-8 text-center border-2 border-terracotta/20">
              <div className="font-garamond text-xs uppercase tracking-widest text-terracotta mb-2">SOS Panic Button</div>

              {contacts.length === 0 && (
                <div className="bg-amber-50 border border-amber-200 text-amber-700 font-garamond text-xs px-4 py-2 rounded-xl mb-4">
                  ⚠️ Add emergency contacts to receive SMS alerts when you press SOS
                </div>
              )}

              <p className="font-garamond text-sm text-charcoal/70 mb-8 max-w-xs mx-auto">
                Press SOS to instantly send your GPS location via SMS to your emergency contacts and booked guide.
              </p>

              {/* Big SOS button */}
              <div className="relative w-48 h-48 mx-auto mb-8">
                <div className="absolute inset-0 rounded-full bg-terracotta/20 animate-ping" />
                <div className="absolute inset-4 rounded-full bg-terracotta/15 animate-ping" style={{ animationDelay: '500ms' }} />
                <button onClick={triggerPanic}
                  className="relative w-48 h-48 rounded-full bg-terracotta flex flex-col items-center justify-center shadow-2xl hover:bg-red-600 active:scale-95 transition-all duration-150 border-4 border-red-400/50">
                  <div className="text-4xl mb-1 font-bold text-white">!</div>
                  <span className="font-playfair text-2xl font-bold text-white">SOS</span>
                  <span className="font-garamond text-xs text-white/80 uppercase tracking-widest">PANIC</span>
                </button>
              </div>

              <div className="font-garamond text-xs text-charcoal/50 mb-4">
                {location
                  ? `📍 GPS ready · Accuracy ${location.accuracy}m`
                  : locationError
                    ? '⚠️ Enable location for SOS to work'
                    : '📍 Getting your location...'}
              </div>

              {/* Alert preview */}
              <div className="bg-cream rounded-2xl p-4 text-left">
                <p className="font-garamond text-xs uppercase tracking-widest text-charcoal/40 mb-2">Who will be alerted:</p>
                <div className="space-y-1">
                  {contacts.map(c => (
                    <div key={c._id} className="flex items-center gap-2 font-garamond text-sm text-charcoal/70">
                      <FiPhone size={12} className="text-green-500" /> {c.name} ({c.relation})
                    </div>
                  ))}
                  <div className="flex items-center gap-2 font-garamond text-sm text-charcoal/70">
                    <FiUser size={12} className="text-blue-500" /> Your booked guide (if confirmed)
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STATE 2: Countdown */}
          {!panicSent && panicActive && (
            <div className="bg-sand rounded-3xl p-8 text-center border-2 border-terracotta/20">
              <div className="font-garamond text-sm text-charcoal/70 mb-4 uppercase tracking-widest">Sending Alert In...</div>
              <div className="font-playfair text-9xl text-terracotta font-bold animate-pulse">{countdown}</div>
              <div className="font-garamond text-base text-charcoal/60 mb-8">
                SMS will be sent to {contacts.length} contact{contacts.length !== 1 ? 's' : ''} + your guide
              </div>
              <button onClick={cancelPanic}
                className="border-2 border-charcoal/20 text-charcoal font-garamond text-sm uppercase tracking-wider px-10 py-4 rounded-full hover:bg-charcoal/5 transition-all">
                ✕ Cancel
              </button>
            </div>
          )}

          {/* STATE 2.5: Sending */}
          {sosLoading && (
            <div className="bg-sand rounded-3xl p-8 text-center border-2 border-terracotta/20">
              <div className="inline-block w-12 h-12 border-4 border-terracotta/30 border-t-terracotta rounded-full animate-spin mb-4" />
              <p className="font-playfair text-xl text-charcoal font-bold">Sending SOS...</p>
              <p className="font-garamond text-sm text-charcoal/60 mt-2">Alerting contacts via SMS</p>
            </div>
          )}

          {/* STATE 3: Sent */}
          {panicSent && !sosLoading && (
            <div className={`bg-sand rounded-3xl p-8 text-center border-2 ${sosResult?.success ? 'border-green-400/30' : 'border-red-400/30'}`}>
              <div className={`text-6xl mb-4`}>{sosResult?.success ? '✅' : '⚠️'}</div>
              <h2 className="font-playfair text-3xl text-charcoal font-bold mb-2">
                {sosResult?.success ? `Alert Sent to ${totalAlerted}!` : 'Alert Failed'}
              </h2>
              <p className="font-garamond text-base text-charcoal/70 mb-6">
                {sosResult?.success
                  ? `SMS sent to ${sosResult.sentTo?.length || 0} emergency contact${(sosResult.sentTo?.length || 0) !== 1 ? 's' : ''}${sosResult.guidesAlerted?.length ? ' and your guide' : ''}.`
                  : sosResult?.message || 'Call 112 immediately.'}
              </p>

              {/* Who was alerted */}
              {sosResult?.sentTo?.length > 0 && (
                <div className="bg-cream rounded-2xl p-4 mb-4 text-left">
                  <p className="font-garamond text-xs uppercase tracking-widest text-charcoal/40 mb-2">SMS Sent To:</p>
                  {sosResult.sentTo.map((c, i) => (
                    <div key={i} className={`flex items-center gap-2 font-garamond text-sm py-1 ${c.status === 'sent' ? 'text-green-600' : 'text-red-500'}`}>
                      {c.status === 'sent' ? '✓' : '✗'} {c.name} · {c.phone}
                    </div>
                  ))}
                  {sosResult.guidesAlerted?.map((g, i) => (
                    <div key={i} className="flex items-center gap-2 font-garamond text-sm py-1 text-blue-600">
                      ✓ Guide: {g.guideName}
                    </div>
                  ))}
                </div>
              )}

              {sosResult?.mapsLink && (
                <a href={sosResult.mapsLink} target="_blank" rel="noopener noreferrer"
                  className="block bg-blue-50 border border-blue-200 text-blue-600 font-garamond text-sm px-4 py-3 rounded-xl mb-4 hover:bg-blue-100 transition-colors">
                  📍 View your location on Maps
                </a>
              )}

              <div className="flex gap-3 justify-center">
                <a href="tel:112" className="bg-terracotta text-white font-garamond text-sm uppercase tracking-wider px-6 py-3 rounded-xl hover:bg-red-700 transition-all">
                  📞 Call 112
                </a>
                <button onClick={resetPanic}
                  className="border border-charcoal/20 text-charcoal/70 font-garamond text-xs uppercase tracking-wider px-6 py-3 rounded-xl hover:bg-charcoal/5 transition-all">
                  Clear Alert
                </button>
              </div>
            </div>
          )}

          {/* Safety Score */}
          <div className="bg-sand rounded-3xl p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="font-garamond text-xs uppercase tracking-widest text-charcoal/50 mb-1">Safety Score</div>
                <div className="font-playfair text-5xl text-charcoal font-bold">
                  {contacts.length > 0 && location ? '92' : contacts.length > 0 ? '75' : location ? '60' : '40'}
                </div>
                <div className="font-garamond text-sm text-charcoal/50">/ 100</div>
              </div>
              <div className="relative">
                <div className="w-20 h-20 rounded-full border-4 border-green-400 flex items-center justify-center bg-green-50">
                  <FiShield size={40} className="text-green-600" />
                  <div className="absolute inset-0 rounded-full border-2 border-green-300 animate-ping opacity-30" />
                </div>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              {location && <div className="bg-green-100 text-green-700 font-garamond text-xs px-3 py-1 rounded-full border border-green-200">✓ GPS Active</div>}
              {contacts.length > 0 && <div className="bg-green-100 text-green-700 font-garamond text-xs px-3 py-1 rounded-full border border-green-200">✓ {contacts.length} Contact{contacts.length > 1 ? 's' : ''} Added</div>}
              {!location && <div className="bg-red-100 text-red-600 font-garamond text-xs px-3 py-1 rounded-full border border-red-200">✗ GPS Off</div>}
              {contacts.length === 0 && <div className="bg-amber-100 text-amber-700 font-garamond text-xs px-3 py-1 rounded-full border border-amber-200">⚠️ No Contacts</div>}
              <div className="bg-cream font-garamond text-xs text-charcoal/60 px-3 py-1 rounded-full border border-sand">✓ Safe Zone</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}