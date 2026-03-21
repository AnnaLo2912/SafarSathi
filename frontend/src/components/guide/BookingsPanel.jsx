import { useEffect, useMemo, useState } from 'react'
import { FiCheck, FiClock, FiMapPin, FiMessageCircle, FiX, FiMap, FiDollarSign, FiPackage } from 'react-icons/fi'
import { getBookings, updateBookingStatus } from '../../services/bookingService'

const statusBadge = {
  pending:   'bg-amber-100 text-amber-700',
  confirmed: 'bg-green-100 text-green-700',
  rejected:  'bg-red-100 text-red-700',
  completed: 'bg-gray-100 text-gray-700',
}

// ── Itinerary Detail Modal ────────────────────────────────────
function ItineraryModal({ booking, onClose }) {
  const it = booking?.sharedItinerary
  if (!it?.destination) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/60 overflow-y-auto">
      <div className="min-h-screen px-4 py-8 flex items-start justify-center">
        <div className="bg-cream rounded-3xl w-full max-w-3xl relative">

          {/* Close */}
          <button onClick={onClose}
            className="absolute top-4 right-4 z-10 bg-sand text-charcoal font-garamond text-sm px-4 py-2 rounded-full hover:bg-charcoal hover:text-cream transition-all flex items-center gap-2">
            <FiX size={16} /> Close
          </button>

          {/* Hero */}
          <div className="bg-charcoal rounded-t-3xl px-8 py-10">
            <div className="font-garamond text-xs uppercase tracking-widest text-saffron mb-2">
              ✦ Tourist's Itinerary
            </div>
            <h2 className="font-playfair text-3xl text-white font-bold capitalize mb-3">
              {it.destination}
            </h2>
            <div className="flex flex-wrap gap-4 font-garamond text-sm text-white/60">
              {it.nights    && <span>📅 {it.nights} nights / {it.nights + 1} days</span>}
              {it.budget    && <span className="flex items-center gap-1"><FiDollarSign size={14} /> ${it.budget} budget</span>}
              {it.startDate && <span>🗓 From {new Date(it.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>}
            </div>
          </div>

          <div className="p-8 space-y-6">
            {/* Summary */}
            {it.summary && (
              <div className="bg-sand rounded-2xl p-5">
                <p className="font-garamond text-base text-charcoal/80 leading-relaxed italic">
                  "{it.summary}"
                </p>
              </div>
            )}

            {/* Highlights */}
            {it.highlights?.length > 0 && (
              <div>
                <h3 className="font-playfair text-lg text-charcoal font-bold mb-3">✦ Highlights</h3>
                <div className="flex flex-wrap gap-2">
                  {it.highlights.map((h, i) => (
                    <span key={i} className="bg-sand font-garamond text-sm text-charcoal/70 px-4 py-2 rounded-full">
                      ✦ {h}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Day Plans */}
            {it.dayPlans?.length > 0 && (
              <div>
                <h3 className="font-playfair text-xl text-charcoal font-bold mb-4">🗓 Day-wise Plan</h3>
                <div className="space-y-3">
                  {it.dayPlans.map((day) => (
                    <div key={day.day} className="bg-sand rounded-2xl overflow-hidden">
                      <div className={`px-5 py-3 flex items-center justify-between ${
                        day.day % 3 === 1 ? 'bg-saffron' : day.day % 3 === 2 ? 'bg-terracotta' : 'bg-deepblue'
                      }`}>
                        <div>
                          <div className="font-garamond text-xs uppercase tracking-widest text-white/70">Day {day.day}</div>
                          <h4 className="font-playfair text-base text-white font-bold">{day.title}</h4>
                        </div>
                        {day.dayTotal > 0 && (
                          <div className="font-playfair text-base text-white font-bold">${day.dayTotal}</div>
                        )}
                      </div>
                      {day.attractions?.length > 0 && (
                        <div className="p-4 space-y-2">
                          {day.attractions.map((a, i) => (
                            <div key={i} className="bg-cream rounded-xl px-4 py-3 flex items-start justify-between gap-2">
                              <div>
                                <p className="font-playfair text-sm text-charcoal font-semibold">{a.name}</p>
                                {a.timing && <p className="font-garamond text-xs text-charcoal/50 mt-0.5">🕐 {a.timing}</p>}
                                {a.tips   && <p className="font-garamond text-xs text-saffron mt-1 italic">💡 {a.tips}</p>}
                              </div>
                              <div className="font-playfair text-sm text-saffron font-bold shrink-0">
                                {a.entryFee > 0 ? `$${a.entryFee}` : 'Free'}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tourist info */}
            <div className="bg-sand rounded-2xl p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-charcoal flex items-center justify-center text-white font-playfair font-bold text-lg shrink-0">
                {booking.touristName?.[0]?.toUpperCase()}
              </div>
              <div>
                <p className="font-garamond text-xs uppercase tracking-widest text-charcoal/40 mb-0.5">Tourist</p>
                <p className="font-playfair text-base text-charcoal font-semibold">{booking.touristName}</p>
                <p className="font-garamond text-xs text-charcoal/50">{booking.date} · {booking.location}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function BookingMeta({ booking }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm font-garamond text-charcoal/75">
      <p><span className="text-charcoal/50">Date:</span> {booking.date}</p>
      <p><span className="text-charcoal/50">Time:</span> {booking.time}</p>
      <p><span className="text-charcoal/50">Duration:</span> {booking.duration}</p>
      <p className="col-span-2 md:col-span-1"><span className="text-charcoal/50">Location:</span> {booking.location}</p>
      <p><span className="text-charcoal/50">Price:</span> INR {booking.price}</p>
      {booking.notes && <p><span className="text-charcoal/50">Notes:</span> {booking.notes}</p>}
    </div>
  )
}

export default function BookingsPanel({ onOpenChat }) {
  const [bookings,      setBookings]      = useState([])
  const [loading,       setLoading]       = useState(true)
  const [error,         setError]         = useState('')
  const [mutatingId,    setMutatingId]    = useState('')
  const [viewItinerary, setViewItinerary] = useState(null)

  useEffect(() => { loadBookings() }, [])

  async function loadBookings() {
    try {
      setLoading(true); setError('')
      const data = await getBookings('guide')
      setBookings(data.bookings || [])
    } catch (err) {
      setError(err.message || 'Unable to load bookings')
    } finally {
      setLoading(false)
    }
  }

  async function handleStatusAction(bookingId, action) {
    try {
      setMutatingId(bookingId)
      await updateBookingStatus(bookingId, action)
      await loadBookings()
    } catch (err) {
      setError(err.message || 'Unable to update booking')
    } finally {
      setMutatingId('')
    }
  }

  const pendingRequests  = useMemo(() => bookings.filter(b => b.status === 'pending'),   [bookings])
  const upcomingBookings = useMemo(() => bookings.filter(b => b.status === 'confirmed'), [bookings])
  const historyBookings  = useMemo(() => bookings.filter(b => b.status === 'rejected' || b.status === 'completed'), [bookings])

  return (
    <div className="space-y-8">
      {/* Itinerary Modal */}
      {viewItinerary && (
        <ItineraryModal booking={viewItinerary} onClose={() => setViewItinerary(null)} />
      )}

      {/* Pending Requests */}
      <section className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100">
        <h2 className="font-playfair text-2xl text-charcoal font-semibold">Booking Requests</h2>
        <p className="font-garamond text-charcoal/60 mt-1">Accept or reject requests from tourists.</p>
        {loading && <p className="mt-4 text-charcoal/60 font-garamond">Loading requests...</p>}
        {error   && <p className="mt-4 text-red-600 font-garamond">{error}</p>}
        {!loading && pendingRequests.length === 0 && (
          <p className="mt-4 text-charcoal/60 font-garamond">No pending requests.</p>
        )}
        <div className="mt-5 space-y-4">
          {pendingRequests.map(booking => (
            <article key={booking._id} className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                <h3 className="font-playfair text-xl text-charcoal">{booking.touristName}</h3>
                <span className={`px-3 py-1 rounded-full text-xs uppercase tracking-wide font-garamond ${statusBadge.pending}`}>
                  Pending
                </span>
              </div>
              <BookingMeta booking={booking} />

              {/* Itinerary badge */}
              {booking.sharedItinerary?.destination && (
                <div className="mt-3 bg-sand rounded-xl px-4 py-2.5 flex items-center gap-2">
                  <FiMap size={14} className="text-saffron shrink-0" />
                  <div className="flex-1">
                    <p className="font-garamond text-xs text-charcoal/50 uppercase tracking-widest">Shared Itinerary</p>
                    <p className="font-playfair text-sm text-charcoal font-semibold capitalize">
                      {booking.sharedItinerary.destination} · {booking.sharedItinerary.nights} nights
                    </p>
                  </div>
                  <button onClick={() => setViewItinerary(booking)}
                    className="font-garamond text-xs text-saffron underline hover:text-charcoal transition-colors">
                    View Details →
                  </button>
                </div>
              )}

              <div className="mt-4 flex flex-wrap gap-3">
                <button onClick={() => handleStatusAction(booking._id, 'accept')} disabled={mutatingId === booking._id}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-60 font-garamond text-sm">
                  <FiCheck size={15} /> Accept
                </button>
                <button onClick={() => handleStatusAction(booking._id, 'reject')} disabled={mutatingId === booking._id}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-60 font-garamond text-sm">
                  <FiX size={15} /> Reject
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Upcoming (Confirmed) */}
      <section className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100">
        <h2 className="font-playfair text-2xl text-charcoal font-semibold">Upcoming Bookings</h2>
        <p className="font-garamond text-charcoal/60 mt-1">Confirmed bookings ready to serve.</p>
        {upcomingBookings.length === 0 ? (
          <p className="mt-4 text-charcoal/60 font-garamond">No upcoming confirmed bookings.</p>
        ) : (
          <div className="mt-5 space-y-4">
            {upcomingBookings.map(booking => (
              <article key={booking._id} className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
                <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                  <div>
                    <h3 className="font-playfair text-xl text-charcoal">{booking.touristName}</h3>
                    <p className="font-garamond text-charcoal/70 flex items-center gap-2 mt-1">
                      <FiClock size={15} /> {booking.date} at {booking.time}
                    </p>
                    <p className="font-garamond text-charcoal/70 flex items-center gap-2 mt-1">
                      <FiMapPin size={15} /> {booking.location}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs uppercase tracking-wide font-garamond ${statusBadge.confirmed}`}>
                    Confirmed
                  </span>
                </div>

                {/* Itinerary badge */}
                {booking.sharedItinerary?.destination && (
                  <div className="mb-4 bg-sand rounded-xl px-4 py-2.5 flex items-center gap-2">
                    <FiMap size={14} className="text-saffron shrink-0" />
                    <div className="flex-1">
                      <p className="font-garamond text-xs text-charcoal/50 uppercase tracking-widest">Tourist's Itinerary</p>
                      <p className="font-playfair text-sm text-charcoal font-semibold capitalize">
                        {booking.sharedItinerary.destination} · {booking.sharedItinerary.nights} nights
                      </p>
                    </div>
                    <button onClick={() => setViewItinerary(booking)}
                      className="font-garamond text-xs text-saffron underline hover:text-charcoal transition-colors">
                      View Full Plan →
                    </button>
                  </div>
                )}

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => onOpenChat?.()}
                    className="px-4 py-2 rounded-lg bg-charcoal text-white inline-flex items-center gap-2 font-garamond text-sm hover:bg-saffron hover:text-charcoal transition-all duration-300">
                    <FiMessageCircle size={15} /> Open Chat
                  </button>
                  <button onClick={() => handleStatusAction(booking._id, 'complete')} disabled={mutatingId === booking._id}
                    className="px-4 py-2 rounded-lg bg-terracotta text-white hover:opacity-90 disabled:opacity-60 font-garamond text-sm">
                    Mark Complete
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* History */}
      <section className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100">
        <h2 className="font-playfair text-2xl text-charcoal font-semibold">Status Updates</h2>
        <p className="font-garamond text-charcoal/60 mt-1">Rejected and completed records.</p>
        {historyBookings.length === 0 ? (
          <p className="mt-4 text-charcoal/60 font-garamond">No completed or rejected bookings yet.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {historyBookings.map(booking => (
              <div key={booking._id} className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 flex items-center justify-between gap-3">
                <div>
                  <p className="font-playfair text-lg text-charcoal">{booking.touristName}</p>
                  <p className="font-garamond text-charcoal/60 text-sm">{booking.date} • {booking.location}</p>
                </div>
                <div className="flex items-center gap-3">
                  {booking.sharedItinerary?.destination && (
                    <button onClick={() => setViewItinerary(booking)}
                      className="font-garamond text-xs text-saffron underline">
                      View Itinerary
                    </button>
                  )}
                  <span className={`px-3 py-1 rounded-full text-xs uppercase tracking-wide font-garamond ${statusBadge[booking.status]}`}>
                    {booking.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}