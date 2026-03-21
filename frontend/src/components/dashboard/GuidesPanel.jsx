import { useEffect, useMemo, useState } from 'react'
import { FiClock, FiMapPin, FiStar, FiMap, FiChevronDown, FiX } from 'react-icons/fi'
import { useAuth } from '../../context/AuthContext'
import {
  createBookingRequest, getAvailableGuides,
  getBookings, getMyTripsForSharing, cancelBooking,
} from '../../services/bookingService'

const statusStyles = {
  pending:   'bg-amber-100 text-amber-700',
  confirmed: 'bg-green-100 text-green-700',
  rejected:  'bg-red-100 text-red-700',
  completed: 'bg-gray-100 text-gray-700',
  cancelled: 'bg-red-50 text-red-400',
}

const initialForm = { date: '', time: '', duration: '', location: '', notes: '', tripId: '' }

function BookingCard({ booking, onCancel, onOpenChat }) {
  const canCancel = booking.status === 'pending' || booking.status === 'confirmed'

  return (
    <article className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h4 className="font-playfair text-lg text-charcoal">{booking.guideName}</h4>
        <span className={`px-3 py-1 rounded-full text-xs uppercase tracking-wide font-garamond ${statusStyles[booking.status]}`}>
          {booking.status}
        </span>
      </div>
      <div className="mt-3 space-y-1 text-sm font-garamond text-charcoal/70">
        <p className="flex items-center gap-2"><FiClock size={14} /> {booking.date} at {booking.time}</p>
        <p className="flex items-center gap-2"><FiMapPin size={14} /> {booking.location}</p>
        <p>Duration: {booking.duration} &nbsp;·&nbsp; Price: INR {booking.price}</p>
      </div>

      {booking.sharedItinerary?.destination && (
        <div className="mt-3 bg-sand rounded-xl px-4 py-2 flex items-center gap-2">
          <FiMap size={14} className="text-saffron shrink-0" />
          <div>
            <p className="font-garamond text-xs text-charcoal/50 uppercase tracking-widest">Shared Itinerary</p>
            <p className="font-playfair text-sm text-charcoal font-semibold capitalize">
              {booking.sharedItinerary.destination} · {booking.sharedItinerary.nights} nights
            </p>
          </div>
        </div>
      )}

      {booking.status === 'pending' && (
        <p className="mt-3 text-sm text-amber-700 font-garamond">Waiting for guide confirmation</p>
      )}
      {booking.status === 'rejected' && (
        <p className="mt-3 text-sm text-red-600 font-garamond">Request declined</p>
      )}
      {booking.status === 'confirmed' && (
        <div className="mt-3 flex items-center gap-3 flex-wrap">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <p className="font-garamond text-sm text-green-600">Chat is now open!</p>
          <button
            onClick={() => onOpenChat?.()}
            className="font-garamond text-xs text-white bg-charcoal px-3 py-1.5 rounded-lg hover:bg-saffron hover:text-charcoal transition-all duration-200"
          >
            Open Chat →
          </button>
        </div>
      )}

      {/* Cancel button — only for pending or confirmed */}
      {canCancel && (
        <button
          onClick={() => onCancel?.(booking._id)}
          className="mt-3 w-full flex items-center justify-center gap-2 border border-red-200 text-red-500 font-garamond text-xs uppercase tracking-wider py-2 rounded-xl hover:bg-red-50 hover:border-red-400 transition-all duration-200"
        >
          <FiX size={14} /> Cancel Booking
        </button>
      )}
    </article>
  )
}

export default function GuidesPanel({ onOpenChat }) {
  const { userProfile } = useAuth()
  const [guides,        setGuides]       = useState([])
  const [bookings,      setBookings]     = useState([])
  const [myTrips,       setMyTrips]      = useState([])
  const [loading,       setLoading]      = useState(true)
  const [error,         setError]        = useState('')
  const [selectedGuide, setSelectedGuide]= useState(null)
  const [form,          setForm]         = useState(initialForm)
  const [submitting,    setSubmitting]   = useState(false)
  const [tripDropOpen,  setTripDropOpen] = useState(false)

  useEffect(() => { loadData() }, [])

  async function loadData() {
    try {
      setLoading(true); setError('')
      const [guidesData, bookingsData, tripsData] = await Promise.all([
        getAvailableGuides(),
        getBookings('tourist'),
        getMyTripsForSharing().catch(() => ({ trips: [] })),
      ])
      setGuides(guidesData.guides || [])
      setBookings(bookingsData.bookings || [])
      setMyTrips((tripsData.trips || []).filter(t => t.status === 'saved'))
    } catch (err) {
      setError(err.message || 'Unable to load')
    } finally {
      setLoading(false)
    }
  }

  function openBookingForm(guide) { setSelectedGuide(guide); setForm(initialForm); setTripDropOpen(false) }
  function closeBookingForm()     { setSelectedGuide(null);  setForm(initialForm); setTripDropOpen(false) }
  function onFormChange(e)        { const { name, value } = e.target; setForm(p => ({ ...p, [name]: value })) }
  function selectTrip(trip)       { setForm(p => ({ ...p, tripId: trip._id })); setTripDropOpen(false) }

  async function handleCancel(bookingId) {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return
    try {
      setError('')
      await cancelBooking(bookingId)
      await loadData()
    } catch (err) {
      setError(err.message || 'Could not cancel booking')
    }
  }

  async function submitBooking(e) {
    e.preventDefault()
    if (!selectedGuide) return
    try {
      setSubmitting(true); setError('')
      await createBookingRequest({
        guide_id:    selectedGuide.user_id,
        guideName:   selectedGuide.name,
        touristName: userProfile?.name || 'Tourist',
        date: form.date, time: form.time,
        duration: form.duration, location: form.location, notes: form.notes,
        price:   Number(selectedGuide.price) || 1500,
        tripId:  form.tripId || undefined,
      })
      closeBookingForm()
      await loadData()
    } catch (err) {
      setError(err.message || 'Could not create booking')
    } finally {
      setSubmitting(false)
    }
  }

  const selectedTrip    = myTrips.find(t => t._id === form.tripId)
  const pendingBookings   = useMemo(() => bookings.filter(b => b.status === 'pending'),   [bookings])
  const confirmedBookings = useMemo(() => bookings.filter(b => b.status === 'confirmed'), [bookings])
  const rejectedBookings  = useMemo(() => bookings.filter(b => b.status === 'rejected'),  [bookings])
  const completedBookings = useMemo(() => bookings.filter(b => b.status === 'completed'), [bookings])

  return (
    <div className="space-y-8">
      {/* Find Guides */}
      <section className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100">
        <h2 className="font-playfair text-3xl text-charcoal font-semibold">Find Guides</h2>
        <p className="font-garamond text-charcoal/60 mt-1">Showing only guides with availability ON.</p>
        {loading && <p className="mt-4 text-charcoal/60 font-garamond">Loading guides...</p>}
        {error   && <p className="mt-4 text-red-600 font-garamond">{error}</p>}
        {!loading && guides.length === 0 && <p className="mt-4 text-charcoal/60 font-garamond">No available guides right now.</p>}
        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          {guides.map(guide => (
            <article key={guide._id} className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-playfair text-xl text-charcoal">{guide.name}</h3>
                  <p className="text-sm font-garamond text-charcoal/65 mt-0.5">{guide.location || 'Location not set'}</p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs uppercase tracking-wide font-garamond bg-green-100 text-green-700">Available</span>
              </div>
              <div className="mt-3 flex items-center gap-4 text-sm font-garamond text-charcoal/75">
                <p className="inline-flex items-center gap-1"><FiStar size={14} /> {guide.rating?.toFixed(1) || '4.5'}</p>
                <p>INR {guide.price}/trip</p>
              </div>
              <button onClick={() => openBookingForm(guide)}
                className="mt-4 px-4 py-2 rounded-lg bg-terracotta text-white hover:opacity-90 font-garamond text-sm">
                Book Guide
              </button>
            </article>
          ))}
        </div>
      </section>

      {/* My Bookings */}
      <section className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100">
        <h2 className="font-playfair text-2xl text-charcoal font-semibold">My Bookings</h2>
        <div className="mt-5 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[
            { label: 'Pending',   list: pendingBookings   },
            { label: 'Confirmed', list: confirmedBookings },
            { label: 'Rejected',  list: rejectedBookings  },
            { label: 'Completed', list: completedBookings },
          ].map(({ label, list }) => (
            <div key={label}>
              <h3 className="font-playfair text-xl text-charcoal mb-3">{label}</h3>
              <div className="space-y-3">
                {list.length === 0
                  ? <p className="text-charcoal/60 font-garamond text-sm">No {label.toLowerCase()} bookings.</p>
                  : list.map(b => (
                      <BookingCard
                        key={b._id}
                        booking={b}
                        onCancel={handleCancel}
                        onOpenChat={onOpenChat}
                      />
                    ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Booking Modal */}
      {selectedGuide && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-white rounded-2xl shadow-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-playfair text-2xl text-charcoal">Book {selectedGuide.name}</h3>
              <button onClick={closeBookingForm} className="text-charcoal/50 hover:text-charcoal text-xl font-bold">✕</button>
            </div>

            <form onSubmit={submitBooking} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="space-y-1">
                  <span className="font-garamond text-sm text-charcoal/70">Date</span>
                  <input required type="date" name="date" value={form.date} onChange={onFormChange}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 font-garamond text-sm" />
                </label>
                <label className="space-y-1">
                  <span className="font-garamond text-sm text-charcoal/70">Time Slot</span>
                  <input required type="text" name="time" placeholder="9:00 AM - 1:00 PM" value={form.time} onChange={onFormChange}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 font-garamond text-sm" />
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="space-y-1">
                  <span className="font-garamond text-sm text-charcoal/70">Duration</span>
                  <input required type="text" name="duration" placeholder="4 hours" value={form.duration} onChange={onFormChange}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 font-garamond text-sm" />
                </label>
                <label className="space-y-1">
                  <span className="font-garamond text-sm text-charcoal/70">Location</span>
                  <input required type="text" name="location" placeholder="Amber Fort" value={form.location} onChange={onFormChange}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 font-garamond text-sm" />
                </label>
              </div>

              {/* Itinerary Picker */}
              <div className="space-y-2">
                <span className="font-garamond text-sm text-charcoal/70 flex items-center gap-2">
                  <FiMap size={14} className="text-saffron" /> Share Itinerary with Guide
                  <span className="text-charcoal/40 text-xs">(optional)</span>
                </span>
                {myTrips.length === 0 ? (
                  <p className="font-garamond text-xs text-charcoal/40 italic bg-sand rounded-lg px-3 py-2">
                    No saved trips yet. Save a trip from Trip Planner to share it here.
                  </p>
                ) : (
                  <div className="relative">
                    <button type="button" onClick={() => setTripDropOpen(p => !p)}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2.5 font-garamond text-sm text-left flex items-center justify-between hover:border-saffron transition-colors">
                      <span className={selectedTrip ? 'text-charcoal' : 'text-charcoal/40'}>
                        {selectedTrip ? `${selectedTrip.destination} · ${selectedTrip.duration} nights` : 'Select a saved trip...'}
                      </span>
                      <FiChevronDown size={16} className={`transition-transform duration-200 ${tripDropOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {tripDropOpen && (
                      <div className="absolute z-20 w-full mt-1 bg-white rounded-xl border border-slate-200 shadow-lg overflow-hidden">
                        <div onClick={() => { setForm(p => ({ ...p, tripId: '' })); setTripDropOpen(false) }}
                          className="px-4 py-2.5 font-garamond text-sm text-charcoal/50 hover:bg-sand cursor-pointer border-b border-slate-100">
                          No itinerary
                        </div>
                        {myTrips.map(trip => (
                          <div key={trip._id} onClick={() => selectTrip(trip)}
                            className={`px-4 py-3 cursor-pointer hover:bg-sand transition-colors border-b border-slate-50 last:border-0 ${form.tripId === trip._id ? 'bg-saffron/10' : ''}`}>
                            <p className="font-playfair text-sm text-charcoal font-semibold capitalize">{trip.destination}</p>
                            <p className="font-garamond text-xs text-charcoal/50 mt-0.5">
                              {trip.duration} nights · ${trip.budget}
                              {trip.startDate && ` · ${new Date(trip.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {selectedTrip && (
                  <div className="bg-sand rounded-xl p-4">
                    <p className="font-garamond text-xs uppercase tracking-widest text-charcoal/40 mb-2">Preview</p>
                    <p className="font-playfair text-base text-charcoal font-bold capitalize mb-1">{selectedTrip.destination}</p>
                    {selectedTrip.summary && (
                      <p className="font-garamond text-xs text-charcoal/60 italic mb-2 line-clamp-2">"{selectedTrip.summary}"</p>
                    )}
                    {selectedTrip.highlights?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {selectedTrip.highlights.slice(0, 4).map((h, i) => (
                          <span key={i} className="bg-cream font-garamond text-xs text-charcoal/60 px-2 py-0.5 rounded-full">✦ {h}</span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <label className="space-y-1 block">
                <span className="font-garamond text-sm text-charcoal/70">Notes (optional)</span>
                <textarea name="notes" rows={3} value={form.notes} onChange={onFormChange}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 font-garamond text-sm"
                  placeholder="Any preferences or travel details" />
              </label>

              <button type="submit" disabled={submitting}
                className="w-full rounded-lg bg-terracotta text-white py-2.5 hover:opacity-90 disabled:opacity-60 font-garamond text-sm uppercase tracking-widest">
                {submitting ? 'Requesting...' : '✦ Request Booking'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}