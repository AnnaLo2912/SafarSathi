import { useEffect, useMemo, useState } from 'react'
import { FiClock, FiMapPin, FiMessageCircle, FiStar } from 'react-icons/fi'
import { useAuth } from '../../context/AuthContext'
import {
  createBookingRequest,
  getAvailableGuides,
  getBookings,
} from '../../services/bookingService'

const statusStyles = {
  pending: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  completed: 'bg-gray-100 text-gray-700',
}

const initialForm = {
  date: '',
  time: '',
  duration: '',
  location: '',
  notes: '',
}

function BookingCard({ booking }) {
  return (
    <article className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h4 className="font-playfair text-lg text-charcoal">{booking.guideName}</h4>
        <span className={`px-3 py-1 rounded-full text-xs uppercase tracking-wide font-garamond ${statusStyles[booking.status]}`}>
          {booking.status}
        </span>
      </div>

      <div className="mt-3 space-y-1 text-sm font-garamond text-charcoal/70">
        <p className="flex items-center gap-2">
          <FiClock size={14} /> {booking.date} at {booking.time}
        </p>
        <p className="flex items-center gap-2">
          <FiMapPin size={14} /> {booking.location}
        </p>
        <p>Duration: {booking.duration}</p>
        <p>Price: INR {booking.price}</p>
      </div>

      {booking.status === 'pending' ? (
        <p className="mt-3 text-sm text-amber-700 font-garamond">Waiting for guide confirmation</p>
      ) : null}
      {booking.status === 'rejected' ? (
        <p className="mt-3 text-sm text-red-600 font-garamond">Request declined</p>
      ) : null}
      {booking.status === 'confirmed' ? (
        <button className="mt-3 inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-charcoal text-white text-sm">
          <FiMessageCircle size={14} /> Open Chat
        </button>
      ) : null}
    </article>
  )
}

export default function GuidesPanel() {
  const { userProfile } = useAuth()
  const [guides, setGuides] = useState([])
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedGuide, setSelectedGuide] = useState(null)
  const [form, setForm] = useState(initialForm)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      setLoading(true)
      setError('')
      const [guidesData, bookingsData] = await Promise.all([
        getAvailableGuides(),
        getBookings('tourist'),
      ])
      setGuides(guidesData.guides || [])
      setBookings(bookingsData.bookings || [])
    } catch (err) {
      setError(err.message || 'Unable to load guides or bookings')
    } finally {
      setLoading(false)
    }
  }

  function openBookingForm(guide) {
    setSelectedGuide(guide)
    setForm(initialForm)
  }

  function closeBookingForm() {
    setSelectedGuide(null)
    setForm(initialForm)
  }

  function onFormChange(event) {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  async function submitBooking(event) {
    event.preventDefault()

    if (!selectedGuide) return

    try {
      setSubmitting(true)
      setError('')
      await createBookingRequest({
        guide_id: selectedGuide.user_id,
        guideName: selectedGuide.name,
        touristName: userProfile?.name || 'Tourist',
        date: form.date,
        time: form.time,
        duration: form.duration,
        location: form.location,
        notes: form.notes,
        price: Number(selectedGuide.price) || 1500,
      })

      closeBookingForm()
      await loadData()
    } catch (err) {
      setError(err.message || 'Could not create booking request')
    } finally {
      setSubmitting(false)
    }
  }

  const pendingBookings = useMemo(
    () => bookings.filter((booking) => booking.status === 'pending'),
    [bookings]
  )
  const confirmedBookings = useMemo(
    () => bookings.filter((booking) => booking.status === 'confirmed'),
    [bookings]
  )
  const rejectedBookings = useMemo(
    () => bookings.filter((booking) => booking.status === 'rejected'),
    [bookings]
  )
  const completedBookings = useMemo(
    () => bookings.filter((booking) => booking.status === 'completed'),
    [bookings]
  )

  return (
    <div className="space-y-8">
      <section className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100">
        <h2 className="font-playfair text-3xl text-charcoal font-semibold">Find Guides</h2>
        <p className="font-garamond text-charcoal/60 mt-1">
          Showing only guides with availability ON.
        </p>

        {loading ? <p className="mt-4 text-charcoal/60">Loading guides...</p> : null}
        {error ? <p className="mt-4 text-red-600">{error}</p> : null}

        {!loading && guides.length === 0 ? (
          <p className="mt-4 text-charcoal/60 font-garamond">No available guides right now.</p>
        ) : null}

        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          {guides.map((guide) => (
            <article key={guide._id} className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-playfair text-xl text-charcoal">{guide.name}</h3>
                  <p className="text-sm font-garamond text-charcoal/65 mt-0.5">{guide.location || 'Location not set'}</p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs uppercase tracking-wide font-garamond bg-green-100 text-green-700">
                  Available now
                </span>
              </div>

              <div className="mt-3 flex items-center gap-4 text-sm font-garamond text-charcoal/75">
                <p className="inline-flex items-center gap-1">
                  <FiStar size={14} /> {guide.rating?.toFixed(1) || '4.5'}
                </p>
                <p>INR {guide.price}/trip</p>
              </div>

              <button
                onClick={() => openBookingForm(guide)}
                className="mt-4 px-4 py-2 rounded-lg bg-[#D96C54] text-white hover:opacity-90"
              >
                Book Guide
              </button>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100">
        <h2 className="font-playfair text-2xl text-charcoal font-semibold">My Bookings</h2>
        <p className="font-garamond text-charcoal/60 mt-1">Request, approval, and completion lifecycle.</p>

        <div className="mt-5 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="font-playfair text-xl text-charcoal mb-3">Pending</h3>
            <div className="space-y-3">
              {pendingBookings.length === 0 ? <p className="text-charcoal/60">No pending requests.</p> : null}
              {pendingBookings.map((booking) => <BookingCard key={booking._id} booking={booking} />)}
            </div>
          </div>

          <div>
            <h3 className="font-playfair text-xl text-charcoal mb-3">Confirmed</h3>
            <div className="space-y-3">
              {confirmedBookings.length === 0 ? <p className="text-charcoal/60">No confirmed bookings.</p> : null}
              {confirmedBookings.map((booking) => <BookingCard key={booking._id} booking={booking} />)}
            </div>
          </div>

          <div>
            <h3 className="font-playfair text-xl text-charcoal mb-3">Rejected</h3>
            <div className="space-y-3">
              {rejectedBookings.length === 0 ? <p className="text-charcoal/60">No rejected bookings.</p> : null}
              {rejectedBookings.map((booking) => <BookingCard key={booking._id} booking={booking} />)}
            </div>
          </div>

          <div>
            <h3 className="font-playfair text-xl text-charcoal mb-3">Completed</h3>
            <div className="space-y-3">
              {completedBookings.length === 0 ? <p className="text-charcoal/60">No completed bookings.</p> : null}
              {completedBookings.map((booking) => <BookingCard key={booking._id} booking={booking} />)}
            </div>
          </div>
        </div>
      </section>

      {selectedGuide ? (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <h3 className="font-playfair text-2xl text-charcoal">Book {selectedGuide.name}</h3>
              <button onClick={closeBookingForm} className="text-charcoal/50 hover:text-charcoal text-xl">x</button>
            </div>

            <form onSubmit={submitBooking} className="mt-5 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="space-y-1">
                  <span className="text-sm text-charcoal/70">Date</span>
                  <input
                    required
                    type="date"
                    name="date"
                    value={form.date}
                    onChange={onFormChange}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2"
                  />
                </label>
                <label className="space-y-1">
                  <span className="text-sm text-charcoal/70">Time Slot</span>
                  <input
                    required
                    type="text"
                    name="time"
                    placeholder="9:00 AM - 1:00 PM"
                    value={form.time}
                    onChange={onFormChange}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2"
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="space-y-1">
                  <span className="text-sm text-charcoal/70">Duration</span>
                  <input
                    required
                    type="text"
                    name="duration"
                    placeholder="4 hours"
                    value={form.duration}
                    onChange={onFormChange}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2"
                  />
                </label>
                <label className="space-y-1">
                  <span className="text-sm text-charcoal/70">Location</span>
                  <input
                    required
                    type="text"
                    name="location"
                    placeholder="Amber Fort"
                    value={form.location}
                    onChange={onFormChange}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2"
                  />
                </label>
              </div>

              <label className="space-y-1 block">
                <span className="text-sm text-charcoal/70">Notes (optional)</span>
                <textarea
                  name="notes"
                  rows={3}
                  value={form.notes}
                  onChange={onFormChange}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2"
                  placeholder="Any preferences or travel details"
                />
              </label>

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-lg bg-[#D96C54] text-white py-2.5 hover:opacity-90 disabled:opacity-60"
              >
                {submitting ? 'Requesting...' : 'Request Booking'}
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  )
}
