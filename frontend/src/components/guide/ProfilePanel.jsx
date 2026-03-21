import { useEffect, useState } from 'react'
import { FiMapPin } from 'react-icons/fi'
import { useAuth } from '../../context/AuthContext'
import { deactivateGuideAccountData, getVerificationStatus } from '../../services/bookingService'
import { useNavigate } from 'react-router-dom'

export default function ProfilePanel() {
  const { userProfile, updateUserProfile, deleteGuideAccount } = useAuth()
  const navigate = useNavigate()
  const [editing, setEditing] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [verificationStatus, setVerificationStatus] = useState('not_submitted')
  const [isVerified, setIsVerified] = useState(false)
  const [verifiedAt, setVerifiedAt] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const [form, setForm] = useState({
    name: userProfile?.name || '',
    email: userProfile?.email || '',
    phone: userProfile?.phone || '',
    location: userProfile?.location || '',
    bio: userProfile?.bio || '',
    speciality: userProfile?.speciality || '',
    experience: userProfile?.experience || '',
    rate: String(userProfile?.guidePrice || ''),
    languages: Array.isArray(userProfile?.languages) ? userProfile.languages : [],
    license: userProfile?.license || ''
  })

  const [newLanguage, setNewLanguage] = useState('')

  useEffect(() => {
    setForm({
      name: userProfile?.name || '',
      email: userProfile?.email || '',
      phone: userProfile?.phone || '',
      location: userProfile?.location || '',
      bio: userProfile?.bio || '',
      speciality: userProfile?.speciality || '',
      experience: userProfile?.experience || '',
      rate: String(userProfile?.guidePrice || ''),
      languages: Array.isArray(userProfile?.languages) ? userProfile.languages : [],
      license: userProfile?.license || '',
    })
  }, [userProfile])

  useEffect(() => {
    async function loadVerification() {
      try {
        const data = await getVerificationStatus()
        setVerificationStatus(data?.guide?.verification_status || 'not_submitted')
        setIsVerified(Boolean(data?.guide?.is_verified))
        setVerifiedAt(data?.guide?.verified_at || null)
      } catch {
        setVerificationStatus('not_submitted')
        setIsVerified(false)
      }
    }

    loadVerification()
  }, [])

  async function handleSave() {
    if (saving) return

    setSaving(true)
    setError('')
    try {
      await updateUserProfile({
        name: form.name.trim(),
        phone: form.phone.trim(),
        location: form.location.trim(),
        bio: form.bio.trim(),
        speciality: form.speciality.trim(),
        experience: form.experience.trim(),
        guidePrice: Number(form.rate) || 0,
        languages: form.languages,
        license: form.license.trim(),
        updatedAt: new Date().toISOString(),
      })

      setSaved(true)
      setEditing(false)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setError(err.message || 'Could not save profile')
    } finally {
      setSaving(false)
    }
  }

  function handleChange(field, value) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  function handleCancel() {
    setForm({
      name: userProfile?.name || '',
      email: userProfile?.email || '',
      phone: userProfile?.phone || '',
      location: userProfile?.location || '',
      bio: userProfile?.bio || '',
      speciality: userProfile?.speciality || '',
      experience: userProfile?.experience || '',
      rate: String(userProfile?.guidePrice || ''),
      languages: Array.isArray(userProfile?.languages) ? userProfile.languages : [],
      license: userProfile?.license || '',
    })
    setEditing(false)
    setError('')
  }

  function addLanguage() {
    if (!newLanguage.trim()) return
    if (form.languages.includes(newLanguage)) return
    setForm(prev => ({
      ...prev,
      languages: [...prev.languages, newLanguage]
    }))
    setNewLanguage('')
  }

  function removeLanguage(lang) {
    setForm(prev => ({
      ...prev,
      languages: prev.languages.filter(l => l !== lang)
    }))
  }

  async function handleDeactivate() {
    const ok = window.confirm('Deactivate your guide account now? You will be taken offline and redirected to login.')
    if (!ok) return

    try {
      await deactivateGuideAccountData()
      await updateUserProfile({
        isDeactivated: true,
        deactivatedAt: new Date().toISOString(),
      })
      window.location.replace('/login?deactivated=1')
    } catch (err) {
      setError(err.message || 'Could not deactivate account')
    }
  }

  async function handleDeleteAccount() {
    if (deleting) return

    const ok = window.confirm('Delete your guide account permanently? This will remove your guide profile, bookings, and verification records from the platform database.')
    if (!ok) return

    setDeleting(true)
    setError('')
    try {
      await deleteGuideAccount()
      window.location.replace('/login')
    } catch (err) {
      const message = err.message || 'Could not delete account'
      if (message.toLowerCase().includes('requires-recent-login')) {
        setError('For security, please login again and then retry deleting your account.')
      } else {
        setError(message)
      }
    } finally {
      setDeleting(false)
    }
  }

  const isApproved = isVerified || verificationStatus === 'verified'

  return (
    <div className="page-fade-in">
      {/* HEADER */}
      <div className="flex items-start justify-between mb-10 flex-wrap gap-4">
        <div>
          <p className="font-garamond text-xs uppercase tracking-widest text-terracotta mb-2">
            ✦ Your Profile
          </p>
          <h1 className="font-playfair text-4xl text-charcoal font-bold">
            Guide Profile
          </h1>
          <p className="font-playfair text-4xl text-saffron italic font-bold">
            & Settings.
          </p>
        </div>

        {/* Edit/Save Button */}
        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="border-2 border-charcoal text-charcoal font-garamond text-sm uppercase tracking-wider px-6 py-3 rounded-xl hover:bg-charcoal hover:text-cream transition-all duration-300 cursor-pointer"
          >
            ✏️ Edit Profile
          </button>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={handleCancel}
              className="border border-sand text-charcoal/50 font-garamond text-sm uppercase tracking-wider px-6 py-3 rounded-xl hover:border-charcoal hover:text-charcoal transition-all duration-300 cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-saffron text-charcoal font-garamond text-sm uppercase tracking-widest px-6 py-3 rounded-xl hover:bg-amber-500 transition-all duration-300 cursor-pointer"
            >
              {saving ? 'Saving...' : 'Save Changes →'}
            </button>
          </div>
        )}
      </div>

      {/* Saved Toast */}
      {saved && (
        <div className="fixed top-6 right-6 z-50 bg-green-500 text-white font-garamond text-sm px-6 py-3 rounded-2xl shadow-xl flex items-center gap-2 animate-fadeIn">
          <span>✓</span>
          <span>Profile saved successfully!</span>
        </div>
      )}

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN */}
        <div className="lg:col-span-1">
          {/* PROFILE CARD */}
          <div className="bg-sand rounded-3xl p-8 mb-6 text-center">
            {/* Avatar */}
            <div className="mx-auto mb-4 relative w-28 h-28">
              <div className="absolute inset-0 rounded-full bg-saffron flex items-center justify-center font-playfair text-5xl font-bold text-white">
                {(form.name?.[0] || 'G').toUpperCase()}
              </div>
              <div className="absolute bottom-1 right-1 w-9 h-9 rounded-full bg-charcoal flex items-center justify-center text-white text-sm cursor-pointer border-2 border-cream">
                📷
              </div>
            </div>

            {/* Name */}
            <h2 className="font-playfair text-2xl text-charcoal font-bold mb-1">
              {form.name || 'Guide'}
            </h2>

            {/* Location */}
            <p className="font-garamond text-sm text-charcoal/60 mb-3 flex items-center gap-2">
              <FiMapPin size={14} /> {form.location || 'Location not set'}
            </p>

            {/* Rating */}
            <div className="flex items-center justify-center gap-3 mb-4">
              <p className="font-playfair text-lg text-charcoal font-bold">
                ⭐ 4.9
              </p>
              <div className="w-px h-4 bg-charcoal/20" />
              <p className="font-garamond text-sm text-charcoal/50">
                127 reviews
              </p>
            </div>

            {/* Speciality Badge */}
            <div className="inline-block bg-cream border border-sand font-garamond text-xs text-charcoal/70 uppercase tracking-wider px-4 py-2 rounded-full mb-4">
              ✦ {form.speciality}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-sand">
              <div className="text-center">
                <p className="font-playfair text-xl text-charcoal font-bold">
                  340
                </p>
                <p className="font-garamond text-xs text-charcoal/40 mt-0.5">
                  Trips
                </p>
              </div>
              <div className="text-center">
                <p className="font-playfair text-xl text-charcoal font-bold">
                  {form.experience}
                </p>
                <p className="font-garamond text-xs text-charcoal/40 mt-0.5">
                  Experience
                </p>
              </div>
              <div className="text-center">
                <p className="font-playfair text-xl text-charcoal font-bold">
                  ₹{form.rate || 0}
                </p>
                <p className="font-garamond text-xs text-charcoal/40 mt-0.5">
                  Per Day
                </p>
              </div>
            </div>
          </div>

          {/* CERTIFICATE STATUS */}
          <div className="bg-sand rounded-3xl p-6">
            <p className="font-playfair text-lg text-charcoal font-semibold mb-4">
              Certificate Status
            </p>

            {isApproved ? (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">✅</span>
                  <div>
                    <p className="font-playfair text-base text-green-800 font-semibold">
                      Verified Guide
                    </p>
                    <p className="font-garamond text-xs text-green-600 mt-0.5">
                      {form.license || 'IITF Verified'}
                    </p>
                  </div>
                </div>
                {verifiedAt ? (
                  <p className="font-garamond text-xs text-green-700 mb-2">
                    Verified on {new Date(verifiedAt).toLocaleDateString()}
                  </p>
                ) : null}
                <p className="font-garamond text-sm text-green-700">
                  Your certificate has been verified by SafarSathi. You are visible to all
                  tourists.
                </p>
              </div>
            ) : (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">⏳</span>
                  <div>
                    <p className="font-playfair text-base text-amber-800 font-semibold">
                      {verificationStatus === 'rejected' ? 'Rejected' : 'Under Review'}
                    </p>
                    <p className="font-garamond text-xs text-amber-600 mt-0.5">
                      {verificationStatus === 'rejected' ? 'Name/enrollment mismatch detected' : 'Submitted · Awaiting approval'}
                    </p>
                  </div>
                </div>
                <p className="font-garamond text-sm text-amber-700 mb-4">
                  {verificationStatus === 'rejected'
                    ? 'Please upload your own IITF certificate again from the verification section.'
                    : 'Your certificate is being reviewed. This usually takes under 24 hours.'}
                </p>
                <button
                  onClick={() => navigate('/certificate-upload')}
                  className="w-full border border-amber-400 text-amber-700 font-garamond text-xs uppercase tracking-wider py-3 rounded-xl hover:bg-amber-100 transition-all duration-300 text-center cursor-pointer"
                >
                  Re-upload Certificate →
                </button>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="lg:col-span-2">
          {/* PERSONAL INFO */}
          <div className="bg-sand rounded-3xl p-8 mb-6">
            <h3 className="font-playfair text-xl text-charcoal font-semibold mb-6">
              Personal Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Full Name */}
              <div>
                <label className="font-garamond text-xs uppercase tracking-widest text-charcoal/60 mb-2 block">
                  Full Name
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  readOnly={!editing}
                  className={`w-full font-garamond text-base text-charcoal px-4 py-3 rounded-xl transition-colors ${
                    editing
                      ? 'bg-cream border border-cream focus:border-saffron focus:outline-none'
                      : 'bg-cream/50 border border-transparent'
                  }`}
                />
              </div>

              {/* Email */}
              <div>
                <label className="font-garamond text-xs uppercase tracking-widest text-charcoal/60 mb-2 block">
                  Email Address
                </label>
                <input
                  type="email"
                  value={form.email}
                  readOnly
                  className={`w-full font-garamond text-base text-charcoal px-4 py-3 rounded-xl transition-colors ${
                    'bg-cream/50 border border-transparent'
                  }`}
                />
              </div>

              {/* Phone */}
              <div>
                <label className="font-garamond text-xs uppercase tracking-widest text-charcoal/60 mb-2 block">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  readOnly={!editing}
                  className={`w-full font-garamond text-base text-charcoal px-4 py-3 rounded-xl transition-colors ${
                    editing
                      ? 'bg-cream border border-cream focus:border-saffron focus:outline-none'
                      : 'bg-cream/50 border border-transparent'
                  }`}
                />
              </div>

              {/* Location */}
              <div>
                <label className="font-garamond text-xs uppercase tracking-widest text-charcoal/60 mb-2 block">
                  Location
                </label>
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) => handleChange('location', e.target.value)}
                  readOnly={!editing}
                  className={`w-full font-garamond text-base text-charcoal px-4 py-3 rounded-xl transition-colors ${
                    editing
                      ? 'bg-cream border border-cream focus:border-saffron focus:outline-none'
                      : 'bg-cream/50 border border-transparent'
                  }`}
                />
              </div>

              {/* Speciality */}
              <div>
                <label className="font-garamond text-xs uppercase tracking-widest text-charcoal/60 mb-2 block">
                  Speciality
                </label>
                <input
                  type="text"
                  value={form.speciality}
                  onChange={(e) => handleChange('speciality', e.target.value)}
                  readOnly={!editing}
                  className={`w-full font-garamond text-base text-charcoal px-4 py-3 rounded-xl transition-colors ${
                    editing
                      ? 'bg-cream border border-cream focus:border-saffron focus:outline-none'
                      : 'bg-cream/50 border border-transparent'
                  }`}
                />
              </div>

              {/* Experience */}
              <div>
                <label className="font-garamond text-xs uppercase tracking-widest text-charcoal/60 mb-2 block">
                  Years of Experience
                </label>
                <input
                  type="text"
                  value={form.experience}
                  onChange={(e) => handleChange('experience', e.target.value)}
                  readOnly={!editing}
                  className={`w-full font-garamond text-base text-charcoal px-4 py-3 rounded-xl transition-colors ${
                    editing
                      ? 'bg-cream border border-cream focus:border-saffron focus:outline-none'
                      : 'bg-cream/50 border border-transparent'
                  }`}
                />
              </div>

              {/* Rate */}
              <div className="md:col-span-2">
                <label className="font-garamond text-xs uppercase tracking-widest text-charcoal/60 mb-2 block">
                  Daily Rate (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-garamond text-base text-charcoal/50">
                    ₹
                  </span>
                  <input
                    type="text"
                    value={form.rate}
                    onChange={(e) => handleChange('rate', e.target.value)}
                    readOnly={!editing}
                    className={`w-full font-garamond text-base text-charcoal pl-8 px-4 py-3 rounded-xl transition-colors ${
                      editing
                        ? 'bg-cream border border-cream focus:border-saffron focus:outline-none'
                        : 'bg-cream/50 border border-transparent'
                    }`}
                  />
                </div>
              </div>

              {/* Bio */}
              <div className="md:col-span-2">
                <label className="font-garamond text-xs uppercase tracking-widest text-charcoal/60 mb-2 block">
                  About You
                </label>
                <textarea
                  rows="4"
                  value={form.bio}
                  onChange={(e) => handleChange('bio', e.target.value)}
                  readOnly={!editing}
                  className={`w-full font-garamond text-base text-charcoal px-4 py-3 rounded-xl transition-colors resize-none ${
                    editing
                      ? 'bg-cream border border-cream focus:border-saffron focus:outline-none'
                      : 'bg-cream/50 border border-transparent'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* LANGUAGES */}
          <div className="bg-sand rounded-3xl p-8 mb-6">
            <h3 className="font-playfair text-xl text-charcoal font-semibold mb-2">
              Languages Spoken
            </h3>
            <p className="font-garamond text-sm text-charcoal/60 mb-5">
              Tourists filter guides by language. Add all languages you speak.
            </p>

            {/* Current Languages */}
            <div className="flex flex-wrap gap-3 mb-5">
              {form.languages.map((lang) => (
                <div
                  key={lang}
                  className="flex items-center gap-2 bg-cream border border-sand font-garamond text-sm text-charcoal/70 px-4 py-2 rounded-full"
                >
                  {lang}
                  {editing && (
                    <button
                      onClick={() => removeLanguage(lang)}
                      className="w-4 h-4 rounded-full bg-charcoal/10 flex items-center justify-center text-charcoal/50 hover:bg-terracotta/20 hover:text-terracotta cursor-pointer text-xs ml-1"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Add Language */}
            {editing && (
              <div className="flex gap-3">
                <input
                  type="text"
                  value={newLanguage}
                  onChange={(e) => setNewLanguage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addLanguage()}
                  placeholder="Add a language..."
                  className="flex-1 bg-cream border border-sand focus:border-saffron focus:outline-none font-garamond text-sm text-charcoal px-4 py-3 rounded-xl"
                />
                <button
                  onClick={addLanguage}
                  className="bg-charcoal text-cream font-garamond text-sm px-5 py-3 rounded-xl hover:bg-saffron hover:text-charcoal transition-all duration-300"
                >
                  Add
                </button>
              </div>
            )}
          </div>

          {error ? (
            <div className="bg-red-50 border border-red-100 rounded-2xl p-4 mb-6">
              <p className="font-garamond text-sm text-red-700">{error}</p>
            </div>
          ) : null}

          {/* DANGER ZONE */}
          <div className="bg-red-50 border border-red-100 rounded-3xl p-6">
            <h3 className="font-playfair text-lg text-red-800 font-semibold mb-1">
              Account Settings
            </h3>
            <p className="font-garamond text-sm text-red-600/70 mb-5">
              Permanent actions — proceed with caution
            </p>

            <div className="space-y-3">
              {/* Deactivate */}
              <div className="flex items-center justify-between bg-white rounded-xl px-5 py-4">
                <div>
                  <p className="font-playfair text-sm text-charcoal font-semibold">
                    Deactivate Account
                  </p>
                  <p className="font-garamond text-xs text-charcoal/50 mt-0.5">
                    Temporarily hide your profile
                  </p>
                </div>
                <button
                  onClick={handleDeactivate}
                  className="border border-charcoal/20 text-charcoal/50 font-garamond text-xs uppercase tracking-wider px-4 py-2 rounded-xl hover:border-charcoal hover:text-charcoal transition-all cursor-pointer"
                >
                  Deactivate
                </button>
              </div>
              {/* Delete */}
              <div className="flex items-center justify-between bg-white rounded-xl px-5 py-4">
                <div>
                  <p className="font-playfair text-sm text-red-700 font-semibold">
                    Delete Account
                  </p>
                  <p className="font-garamond text-xs text-red-500/70 mt-0.5">
                    Permanently delete all your data
                  </p>
                </div>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleting}
                  className="border border-red-200 text-red-400 font-garamond text-xs uppercase tracking-wider px-4 py-2 rounded-xl hover:border-red-500 hover:text-red-600 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
