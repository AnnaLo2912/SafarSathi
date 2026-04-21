import { useEffect, useMemo, useState } from 'react'
import { FiCheckCircle, FiClock, FiMapPin, FiToggleLeft, FiToggleRight, FiUpload, FiUser, FiXCircle } from 'react-icons/fi'
import { useAuth } from '../../context/AuthContext'
import {
  getBookings,
  getReviewForBooking,
  getVerificationStatus,
  toggleGuideAvailability,
  uploadCertificateForVerification,
} from '../../services/bookingService'

const badgeByStatus = {
  pending: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  completed: 'bg-gray-100 text-gray-700',
}

const STAR_COLOR = '#D96C54'

function RatingStars({ rating = 0 }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`Rating ${rating} out of 5`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className="text-sm leading-none"
          style={{ color: star <= rating ? STAR_COLOR : '#D1D5DB' }}
          aria-hidden="true"
        >
          ★
        </span>
      ))}
    </div>
  )
}

export default function GuideOverview() {
  const { currentUser, userProfile } = useAuth()
  const [available, setAvailable] = useState(false)
  const [verificationStatus, setVerificationStatus] = useState('not_submitted')
  const [isVerified, setIsVerified] = useState(false)
  const [verificationBusy, setVerificationBusy] = useState(false)
  const [certificateFile, setCertificateFile] = useState(null)
  const [examUrl, setExamUrl] = useState('https://iitf.gov.in/login/index.php')
  const [ocrResult, setOcrResult] = useState(null)
  const [busy, setBusy] = useState(false)
  const [bookings, setBookings] = useState([])
  const [avgRating, setAvgRating] = useState(0)
  const [totalReviews, setTotalReviews] = useState(0)
  const [allReviews, setAllReviews] = useState([])
  const [recentReviews, setRecentReviews] = useState([])
  const [error, setError] = useState('')
  const [verifyError, setVerifyError] = useState('')

  useEffect(() => {
    setAvailable(Boolean(userProfile?.availability))
  }, [userProfile?.availability])

  useEffect(() => {
    loadBookings()
    loadVerificationState()
  }, [])

  useEffect(() => {
    const guideUserId = currentUser?.uid || userProfile?.uid
    if (!guideUserId) return undefined

    loadReviewSummary()
    const intervalId = window.setInterval(() => {
      loadReviewSummary()
    }, 20000)

    return () => window.clearInterval(intervalId)
  }, [currentUser?.uid, userProfile?.uid])

  async function loadBookings() {
    try {
      const data = await getBookings('guide')
      setBookings(data.bookings || [])
    } catch (err) {
      setError(err.message || 'Could not load bookings')
    }
  }

  async function loadVerificationState() {
    try {
      const data = await getVerificationStatus()
      const guide = data.guide || {}
      setIsVerified(Boolean(guide.is_verified))
      setVerificationStatus(guide.verification_status || 'not_submitted')
      setAvailable(Boolean(guide.availability))
      setOcrResult(guide.ocr_last_result || null)
    } catch (err) {
      setVerifyError(err.message || 'Could not load verification status')
    }
  }

  async function loadReviewSummary() {
    const guideUserId = currentUser?.uid || userProfile?.uid
    if (!guideUserId) return

    try {
      const bookingsData = await getBookings('guide')
      const completedBookings = (bookingsData.bookings || []).filter(
        (booking) => booking.status === 'completed'
      )

      const reviewEntries = await Promise.all(
        completedBookings.map(async (booking) => {
          try {
            const data = await getReviewForBooking(booking._id)
            if (!data.review) return null
            return {
              ...data.review,
              tourist_name: booking.touristName || 'Tourist',
              booking_date: booking.date || null,
              booking_time: booking.time || null,
            }
          } catch {
            return null
          }
        })
      )

      const reviewRows = reviewEntries
        .filter(Boolean)
        .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))

      const derivedTotal = reviewRows.length
      const derivedAvg = derivedTotal > 0
        ? reviewRows.reduce((sum, item) => sum + Number(item.rating || 0), 0) / derivedTotal
        : 0

      setAllReviews(reviewRows)
      setAvgRating(derivedAvg)
      setTotalReviews(derivedTotal)
      setRecentReviews(reviewRows.slice(0, 3))
    } catch {
      setAllReviews([])
      setAvgRating(0)
      setTotalReviews(0)
      setRecentReviews([])
    }
  }

  async function handleUploadVerification() {
    if (verificationBusy) return
    if (!certificateFile) {
      setVerifyError('Please select a certificate file before uploading.')
      return
    }

    setVerificationBusy(true)
    setVerifyError('')

    try {
      const response = await uploadCertificateForVerification(
        certificateFile,
        userProfile?.name || ''
      )
      setExamUrl(response.iitf_exam_url || examUrl)
      setVerificationStatus(response.verification_status || 'not_submitted')
      setIsVerified(Boolean(response.is_verified))
      setOcrResult({
        extracted_name: response.extracted_name,
        extracted_enrollment_no: response.extracted_enrollment_no,
        confidence: response.confidence,
        match_result: response.match_result,
      })
      if (!response.is_verified) {
        setAvailable(false)
      }
    } catch (err) {
      const message = err?.message || 'Could not verify certificate. Please try again.'
      if (message.toLowerCase().includes('fetch')) {
        setVerifyError('Could not connect to backend. Confirm server is running and refresh this page.')
      } else {
        setVerifyError(message)
      }
    } finally {
      setVerificationBusy(false)
    }
  }

  async function handleToggleAvailability() {
    if (busy) return

    if (!isVerified) {
      setError('Please verify your IITF certification to go online.')
      return
    }

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

  const displayTotalReviews = allReviews.length > 0 ? allReviews.length : totalReviews
  const displayAvgRating = displayTotalReviews > 0
    ? (allReviews.length > 0
        ? allReviews.reduce((sum, item) => sum + Number(item.rating || 0), 0) / allReviews.length
        : avgRating)
    : 0

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
            disabled={busy || !isVerified}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-white transition-colors ${
              available ? 'bg-green-600 hover:bg-green-700' : 'bg-slate-500 hover:bg-slate-600'
            } ${busy || !isVerified ? 'opacity-60 cursor-not-allowed' : ''}`}
          >
            {available ? <FiToggleRight size={20} /> : <FiToggleLeft size={20} />}
            {available ? 'Set Offline' : 'Set Available'}
          </button>
        </div>

        {error ? (
          <p className="mt-3 text-sm text-red-600 font-garamond">{error}</p>
        ) : null}
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-playfair text-2xl text-charcoal font-semibold">IITF Verification</h3>
            <p className="font-garamond text-charcoal/70 mt-1">Upload IITF certificate to get verified.</p>
          </div>
          {verificationStatus === 'verified' ? (
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-semibold">
              <FiCheckCircle /> Verified Guide
            </span>
          ) : null}
        </div>

        {verificationStatus === 'processing' ? (
          <p className="text-amber-700 font-garamond">Verifying your certificate...</p>
        ) : null}

        {verificationStatus === 'rejected' ? (
          <div className="rounded-xl border border-red-100 bg-red-50 p-4">
            <p className="text-red-700 font-garamond flex items-center gap-2">
              <FiXCircle /> Certificate not recognized.
            </p>
            <a
              href={examUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center mt-3 px-4 py-2 rounded-lg bg-saffron text-charcoal font-semibold hover:bg-terracotta transition-colors"
            >
              Verify yourself via IITF Exam
            </a>
          </div>
        ) : null}

        {verificationStatus !== 'verified' ? (
          <div className="rounded-xl border border-slate-200 p-4 space-y-3">
            <input
              type="file"
              accept=".jpg,.jpeg,.png,.pdf"
              onChange={(event) => setCertificateFile(event.target.files?.[0] || null)}
              className="w-full text-sm font-garamond"
            />
            <button
              onClick={handleUploadVerification}
              disabled={!certificateFile || verificationBusy}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-charcoal text-white transition-colors ${
                !certificateFile || verificationBusy ? 'opacity-60 cursor-not-allowed' : 'hover:bg-charcoal/90'
              }`}
            >
              <FiUpload /> {verificationBusy ? 'Uploading...' : 'Upload Certificate'}
            </button>
          </div>
        ) : null}

        {ocrResult ? (
          <div className="rounded-xl bg-slate-50 p-4 border border-slate-100 text-sm font-garamond text-charcoal/80 space-y-1">
            <p>Extracted Name: {ocrResult.extracted_name || 'N/A'}</p>
            <p>Extracted Enrollment No: {ocrResult.extracted_enrollment_no || 'N/A'}</p>
            <p>Confidence: {typeof ocrResult.confidence === 'number' ? ocrResult.confidence : 'N/A'}</p>
            <p>Match Result: {ocrResult.match_result || 'N/A'}</p>
          </div>
        ) : null}

        {verifyError ? <p className="text-sm text-red-600 font-garamond">{verifyError}</p> : null}
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

      <div className="bg-white rounded-2xl shadow-sm p-5 border border-slate-100">
        <p className="font-garamond text-sm text-charcoal/60">Tourist Rating</p>
        <p className="font-playfair text-3xl text-charcoal font-semibold mt-1">
          {displayTotalReviews > 0 ? `${displayAvgRating.toFixed(1)} ⭐` : '0.0 ⭐'}
        </p>
        <p className="font-garamond text-sm text-charcoal/60 mt-1">{displayTotalReviews} reviews</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-5 border border-slate-100">
        <h3 className="font-playfair text-xl text-charcoal font-semibold">Recent Tourist Reviews</h3>
        {recentReviews.length === 0 ? (
          <p className="font-garamond text-sm text-charcoal/60 mt-2">No reviews yet for completed bookings.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {recentReviews.map((review) => (
              <div key={review._id} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-playfair text-base text-charcoal font-semibold">
                    {review.tourist_name || 'Tourist'}
                  </p>
                  <RatingStars rating={review.rating} />
                </div>
                <p className="font-garamond text-sm text-charcoal/70 mt-1 line-clamp-2">
                  {review.review_text || 'No written review'}
                </p>
              </div>
            ))}
          </div>
        )}
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
