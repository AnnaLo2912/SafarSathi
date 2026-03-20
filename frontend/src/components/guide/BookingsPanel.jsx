import { useEffect, useMemo, useState } from 'react'
import { FiCheck, FiClock, FiMapPin, FiMessageCircle, FiX } from 'react-icons/fi'
import { getBookings, updateBookingStatus } from '../../services/bookingService'

const statusBadge = {
  pending: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  completed: 'bg-gray-100 text-gray-700',
}

function BookingMeta({ booking }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm font-garamond text-charcoal/75">
      <p>
        <span className="text-charcoal/50">Date:</span> {booking.date}
      </p>
      <p>
        <span className="text-charcoal/50">Time:</span> {booking.time}
      </p>
      <p>
        <span className="text-charcoal/50">Duration:</span> {booking.duration}
      </p>
      <p className="col-span-2 md:col-span-1">
        <span className="text-charcoal/50">Location:</span> {booking.location}
      </p>
      <p>
        <span className="text-charcoal/50">Price:</span> INR {booking.price}
      </p>
      {booking.notes ? (
        <p>
          <span className="text-charcoal/50">Notes:</span> {booking.notes}
        </p>
      ) : null}
    </div>
  )
}

export default function BookingsPanel() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [mutatingId, setMutatingId] = useState('')

  useEffect(() => {
    loadBookings()
  }, [])

  async function loadBookings() {
    try {
      setLoading(true)
      setError('')
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

  const pendingRequests = useMemo(
    () => bookings.filter((booking) => booking.status === 'pending'),
    [bookings]
  )

  const upcomingBookings = useMemo(
    () => bookings.filter((booking) => booking.status === 'confirmed'),
    [bookings]
  )

  const historyBookings = useMemo(
    () => bookings.filter((booking) => booking.status === 'rejected' || booking.status === 'completed'),
    [bookings]
  )

  return (
    <div className="space-y-8">
      <section className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100">
        <h2 className="font-playfair text-2xl text-charcoal font-semibold">Booking Requests</h2>
        <p className="font-garamond text-charcoal/60 mt-1">
          Accept or reject requests from tourists.
        </p>

        {loading ? <p className="mt-4 text-charcoal/60">Loading requests...</p> : null}
        {error ? <p className="mt-4 text-red-600">{error}</p> : null}

        {!loading && pendingRequests.length === 0 ? (
          <p className="mt-4 text-charcoal/60 font-garamond">No pending requests.</p>
        ) : null}

        <div className="mt-5 space-y-4">
          {pendingRequests.map((booking) => (
            <article key={booking._id} className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                <h3 className="font-playfair text-xl text-charcoal">{booking.touristName}</h3>
                <span className={`px-3 py-1 rounded-full text-xs uppercase tracking-wide font-garamond ${statusBadge[booking.status]}`}>
                  Pending
                </span>
              </div>

              <BookingMeta booking={booking} />

              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  onClick={() => handleStatusAction(booking._id, 'accept')}
                  disabled={mutatingId === booking._id}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-60"
                >
                  <FiCheck size={15} /> Accept
                </button>
                <button
                  onClick={() => handleStatusAction(booking._id, 'reject')}
                  disabled={mutatingId === booking._id}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
                >
                  <FiX size={15} /> Reject
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100">
        <h2 className="font-playfair text-2xl text-charcoal font-semibold">Upcoming Bookings</h2>
        <p className="font-garamond text-charcoal/60 mt-1">Confirmed bookings ready to serve.</p>

        {upcomingBookings.length === 0 ? (
          <p className="mt-4 text-charcoal/60 font-garamond">No upcoming confirmed bookings.</p>
        ) : (
          <div className="mt-5 space-y-4">
            {upcomingBookings.map((booking) => (
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

                <div className="mt-4 flex flex-wrap gap-3">
                  <button className="px-4 py-2 rounded-lg bg-charcoal text-white inline-flex items-center gap-2">
                    <FiMessageCircle size={15} /> Open Chat
                  </button>
                  <button className="px-4 py-2 rounded-lg border border-charcoal/30 text-charcoal">View Details</button>
                  <button
                    onClick={() => handleStatusAction(booking._id, 'complete')}
                    disabled={mutatingId === booking._id}
                    className="px-4 py-2 rounded-lg bg-[#D96C54] text-white hover:opacity-90 disabled:opacity-60"
                  >
                    Mark Complete
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100">
        <h2 className="font-playfair text-2xl text-charcoal font-semibold">Status Updates</h2>
        <p className="font-garamond text-charcoal/60 mt-1">Rejected and completed records.</p>

        {historyBookings.length === 0 ? (
          <p className="mt-4 text-charcoal/60 font-garamond">No completed or rejected bookings yet.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {historyBookings.map((booking) => (
              <div key={booking._id} className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 flex items-center justify-between gap-3">
                <div>
                  <p className="font-playfair text-lg text-charcoal">{booking.touristName}</p>
                  <p className="font-garamond text-charcoal/60 text-sm">{booking.date} • {booking.location}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs uppercase tracking-wide font-garamond ${statusBadge[booking.status]}`}>
                  {booking.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
