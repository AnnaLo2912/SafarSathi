import { useEffect, useMemo, useState } from 'react'
import { FiClock, FiMapPin, FiToggleLeft, FiToggleRight, FiUser } from 'react-icons/fi'
import { useAuth } from '../../context/AuthContext'
import { getBookings, toggleGuideAvailability } from '../../services/bookingService'

const badgeByStatus = {
  pending: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  completed: 'bg-gray-100 text-gray-700',
}

export default function GuideOverview() {
  const { userProfile } = useAuth()
  const [available, setAvailable] = useState(false)
  const [busy, setBusy] = useState(false)
  const [bookings, setBookings] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    setAvailable(Boolean(userProfile?.availability))
  }, [userProfile?.availability])

  useEffect(() => {
    loadBookings()
  }, [])

  async function loadBookings() {
    try {
      const data = await getBookings('guide')
      setBookings(data.bookings || [])
    } catch (err) {
      setError(err.message || 'Could not load bookings')
    }
  }

  async function handleToggleAvailability() {
    if (busy) return

    const nextValue = !available
    setBusy(true)
    setError('')

    try {
      await toggleGuideAvailability({
        availability: nextValue,
        location: userProfile?.location || 'Not set',
        name: userProfile?.name || 'Local Guide',
        rating: 4.8,
        price: Number(userProfile?.guidePrice) || 1500,
      })
      setAvailable(nextValue)
    } catch (err) {
      setError(err.message || 'Could not update availability')
    } finally {
      setBusy(false)
    }
  }

  const stats = useMemo(() => {
    const pending = bookings.filter((b) => b.status === 'pending').length
    const confirmed = bookings.filter((b) => b.status === 'confirmed').length
    const completed = bookings.filter((b) => b.status === 'completed').length

    return { pending, confirmed, completed }
  }, [bookings])

  const nextConfirmed = bookings.find((booking) => booking.status === 'confirmed')

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-playfair text-3xl text-charcoal font-semibold">Guide Availability</h2>
            <p className="font-garamond text-charcoal/70 mt-1">
              {available ? 'You are Available for bookings' : 'You are Offline'}
            </p>
          </div>

          <button
            onClick={handleToggleAvailability}
            disabled={busy}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-white transition-colors ${
              available ? 'bg-green-600 hover:bg-green-700' : 'bg-slate-500 hover:bg-slate-600'
            } ${busy ? 'opacity-60 cursor-not-allowed' : ''}`}
          >
            {available ? <FiToggleRight size={20} /> : <FiToggleLeft size={20} />}
            {available ? 'Set Offline' : 'Set Available'}
          </button>
        </div>

        {error ? (
          <p className="mt-3 text-sm text-red-600 font-garamond">{error}</p>
        ) : null}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl shadow-sm p-5 border border-slate-100">
          <p className="font-garamond text-sm text-charcoal/60">Pending Requests</p>
          <p className="font-playfair text-3xl text-charcoal font-semibold mt-1">{stats.pending}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-5 border border-slate-100">
          <p className="font-garamond text-sm text-charcoal/60">Upcoming Confirmed</p>
          <p className="font-playfair text-3xl text-charcoal font-semibold mt-1">{stats.confirmed}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-5 border border-slate-100">
          <p className="font-garamond text-sm text-charcoal/60">Completed Trips</p>
          <p className="font-playfair text-3xl text-charcoal font-semibold mt-1">{stats.completed}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100">
        <h3 className="font-playfair text-2xl text-charcoal font-semibold mb-4">Next Confirmed Booking</h3>

        {!nextConfirmed ? (
          <p className="text-charcoal/60 font-garamond">No confirmed bookings yet.</p>
        ) : (
          <div className="rounded-xl border border-slate-100 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="space-y-2">
                <p className="font-playfair text-xl text-charcoal flex items-center gap-2">
                  <FiUser size={16} /> {nextConfirmed.touristName}
                </p>
                <p className="font-garamond text-charcoal/70 flex items-center gap-2">
                  <FiClock size={15} /> {nextConfirmed.date} at {nextConfirmed.time}
                </p>
                <p className="font-garamond text-charcoal/70 flex items-center gap-2">
                  <FiMapPin size={15} /> {nextConfirmed.location}
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs uppercase tracking-wide font-garamond ${badgeByStatus[nextConfirmed.status]}`}>
                {nextConfirmed.status}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
