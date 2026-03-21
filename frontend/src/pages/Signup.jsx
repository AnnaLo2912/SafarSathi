import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { FiPackage, FiMap, FiAlertTriangle } from 'react-icons/fi'

export default function Signup() {
  const [step, setStep] = useState(1) // 1: role select, 2: form
  const [role, setRole] = useState('') // 'tourist' or 'guide'
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { signup, loginWithGoogle, currentUser, userRole, completeOnboarding } = useAuth()
  const navigate = useNavigate()
  const isMissingProfile = Boolean(currentUser && !userRole)

  async function handleSignup(e) {
    e.preventDefault()
    setError('')

    if (!role) {
      return setError('Please select your role first.')
    }

    if (isMissingProfile) {
      setLoading(true)
      try {
        await completeOnboarding(role, name || currentUser?.displayName || '')
        if (role === 'guide') {
          navigate('/certificate-upload')
        } else {
          navigate('/tourist-dashboard')
        }
      } catch (err) {
        setError(err.message || 'Could not complete onboarding. Please try again.')
      }
      setLoading(false)
      return
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return setError('Please enter a valid email address.')
    }
    
    if (password !== confirmPassword) {
      return setError('Passwords do not match.')
    }
    if (password.length < 6) {
      return setError('Password must be at least 6 characters.')
    }
    setLoading(true)
    try {
      await signup(email, password, role, name)
      if (role === 'guide') {
        navigate('/certificate-upload')
      } else {
        navigate('/tourist-dashboard')
      }
    } catch (err) {
      // Better error messages for common Firebase errors
      if (err.code === 'auth/email-already-in-use') {
        setError('An account with this email already exists. Please sign in with this email to continue onboarding.')
      } else if (err.code === 'auth/invalid-email') {
        setError('Please enter a valid email address.')
      } else if (err.code === 'auth/weak-password') {
        setError('Password should be at least 6 characters.')
      } else if (err.message?.includes('400')) {
        setError('Invalid email or password. Please check and try again.')
      } else {
        setError(err.message || 'Failed to create account. Please try again.')
      }
    }
    setLoading(false)
  }

  async function handleGoogleSignup() {
    setError('')
    setLoading(true)
    try {
      await loginWithGoogle(role)
      if (role === 'guide') {
        navigate('/certificate-upload')
      } else {
        navigate('/tourist-dashboard')
      }
    } catch (err) {
      setError('Google sign-in failed. Please try again.')
    }
    setLoading(false)
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-cream flex pt-20">
      {/* LEFT PANEL */}
      <div className="hidden lg:flex lg:w-1/2 bg-deepblue relative overflow-hidden">
        {/* Background Image */}
        <img
          src="https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800&q=80"
          alt="Travel background"
          className="absolute inset-0 w-full h-full object-cover opacity-40"
        />

        {/* Gradient Overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to top, rgba(27,58,92,0.95) 0%, rgba(27,58,92,0.5) 100%)'
          }}
        />

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-12 z-10">
          {/* Logo */}
          <h1 className="font-playfair text-4xl font-bold text-white mb-2">
            SafarSathi
          </h1>

          {/* Quote */}
          <blockquote className="font-playfair text-2xl text-white italic leading-relaxed mb-4">
            "Every journey begins with a single step. Take yours safely."
          </blockquote>
          <p className="font-garamond text-sm text-white/50">
            SafarSathi Promise
          </p>

          {/* Feature Pills */}
          <div className="flex flex-col gap-3 mt-8">
            <div className="flex items-center gap-3">
              <span className="text-saffron text-lg">🚨</span>
              <span className="font-garamond text-sm text-white/80">
                Panic alerts in 98ms without login
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-saffron text-lg">🗺️</span>
              <span className="font-garamond text-sm text-white/80">
                AI itineraries for any budget
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-saffron text-lg">🧭</span>
              <span className="font-garamond text-sm text-white/80">
                Government-verified guide network
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-8 py-12">
        <div className="w-full max-w-md">
          {/* STEP 1 ROLE SELECTION */}
          {step === 1 && (
            <>
              {isMissingProfile && (
                <div className="bg-amber-50 border border-amber-200 text-amber-800 font-garamond text-sm px-4 py-3 rounded-xl mb-6">
                  Account profile not found. Please complete onboarding again.
                </div>
              )}

              {/* Header */}
              <div className="mb-10">
                <button
                  onClick={() => navigate('/')}
                  className="flex items-center gap-2 text-charcoal/50 hover:text-charcoal transition-colors cursor-pointer font-garamond text-sm mb-6"
                >
                  ← Back to home
                </button>

                <h2 className="font-playfair text-4xl text-charcoal font-bold mb-2">
                  Join SafarSathi.
                </h2>
                <p className="font-garamond text-base text-charcoal/60">
                  First, tell us who you are.
                </p>
              </div>

              {/* Role Cards */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                {/* Tourist Card */}
                <div
                  onClick={() => setRole('tourist')}
                  className={`relative border-2 rounded-2xl p-6 cursor-pointer transition-all duration-300 text-center ${
                    role === 'tourist'
                      ? 'border-saffron bg-saffron/10'
                      : 'border-sand bg-sand hover:border-saffron'
                  }`}
                >
                  {role === 'tourist' && (
                    <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-saffron text-white flex items-center justify-center text-xs font-bold">
                      ✓
                    </div>
                  )}
                  <div className="text-4xl mb-3"><FiPackage size={40} /></div>
                  <h3 className="font-playfair text-xl text-charcoal font-bold mb-2">
                    Tourist
                  </h3>
                  <p className="font-garamond text-sm text-charcoal/60">
                    I'm traveling to India and need safety + planning
                  </p>
                </div>

                {/* Guide Card */}
                <div
                  onClick={() => setRole('guide')}
                  className={`relative border-2 rounded-2xl p-6 cursor-pointer transition-all duration-300 text-center ${
                    role === 'guide'
                      ? 'border-deepblue bg-deepblue/10'
                      : 'border-sand bg-sand hover:border-deepblue'
                  }`}
                >
                  {role === 'guide' && (
                    <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-deepblue text-white flex items-center justify-center text-xs font-bold">
                      ✓
                    </div>
                  )}
                  <div className="text-4xl mb-3"><FiMap size={40} /></div>
                  <h3 className="font-playfair text-xl text-charcoal font-bold mb-2">
                    Guide
                  </h3>
                  <p className="font-garamond text-sm text-charcoal/60">
                    I'm a certified local guide wanting to earn
                  </p>
                </div>
              </div>

              {/* Guide Warning */}
              {role === 'guide' && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-6 flex items-start gap-3">
                  <FiAlertTriangle className="text-amber-500 flex-shrink-0 mt-0.5" size={20} />
                  <p className="font-garamond text-sm text-amber-700">
                    You'll need to upload your government guide certificate after signup for approval.
                  </p>
                </div>
              )}

              {/* Continue Button */}
              <button
                disabled={!role}
                onClick={() => setStep(2)}
                className="w-full bg-charcoal text-cream font-garamond text-sm uppercase tracking-widest py-4 rounded-xl hover:bg-saffron hover:text-charcoal transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue →
              </button>

              {/* Login Link */}
              <div className="text-center mt-6">
                <p className="font-garamond text-sm text-charcoal/60">
                  Already have an account?{' '}
                  <Link
                    to="/login"
                    className="text-saffron hover:text-terracotta transition-colors font-semibold"
                  >
                    Sign in
                  </Link>
                </p>
              </div>
            </>
          )}

          {/* STEP 2 SIGNUP FORM */}
          {step === 2 && (
            <>
              {isMissingProfile && (
                <div className="bg-amber-50 border border-amber-200 text-amber-800 font-garamond text-sm px-4 py-3 rounded-xl mb-6">
                  Account profile not found. Please complete onboarding again.
                </div>
              )}

              {/* Header */}
              <div className="mb-8">
                <button
                  onClick={() => setStep(1)}
                  className="flex items-center gap-2 text-charcoal/50 hover:text-charcoal transition-colors cursor-pointer font-garamond text-sm mb-6"
                >
                  ← Change role
                </button>

                {/* Role Badge */}
                <div className="inline-flex items-center gap-2 bg-sand px-4 py-2 rounded-full font-garamond text-sm text-charcoal/70 mb-4">
                <div className="flex items-center gap-2">
                  {role === 'tourist' ? <FiPackage size={18} /> : <FiMap size={18} />}
                  <span>
                    {role === 'tourist' ? 'Signing up as Tourist' : 'Signing up as Guide'}
                  </span>
                </div>
                </div>

                <h2 className="font-playfair text-4xl text-charcoal font-bold mb-1">
                  Create account.
                </h2>
                <p className="font-garamond text-base text-charcoal/60">
                  Fill in your details below.
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 font-garamond text-sm px-4 py-3 rounded-xl mb-6">
                  {error}
                </div>
              )}

              {/* Signup Form */}
              <form onSubmit={handleSignup} className="space-y-4">
                {/* Full Name */}
                <div>
                  <label className="font-garamond text-xs uppercase tracking-widest text-charcoal/60 mb-2 block">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-sand border border-sand focus:border-saffron focus:outline-none font-garamond text-base text-charcoal px-4 py-3 rounded-xl transition-colors"
                    placeholder="Your full name"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="font-garamond text-xs uppercase tracking-widest text-charcoal/60 mb-2 block">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={isMissingProfile ? (currentUser?.email || '') : email}
                    onChange={(e) => setEmail(e.target.value)}
                    readOnly={isMissingProfile}
                    className="w-full bg-sand border border-sand focus:border-saffron focus:outline-none font-garamond text-base text-charcoal px-4 py-3 rounded-xl transition-colors"
                    placeholder="you@example.com"
                  />
                </div>

                {!isMissingProfile && (
                  <>
                    {/* Password */}
                    <div>
                      <label className="font-garamond text-xs uppercase tracking-widest text-charcoal/60 mb-2 block">
                        Password
                      </label>
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-sand border border-sand focus:border-saffron focus:outline-none font-garamond text-base text-charcoal px-4 py-3 rounded-xl transition-colors"
                        placeholder="••••••••"
                      />
                      <p className="font-garamond text-xs text-charcoal/40 mt-1">
                        Minimum 6 characters
                      </p>
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <label className="font-garamond text-xs uppercase tracking-widest text-charcoal/60 mb-2 block">
                        Confirm Password
                      </label>
                      <input
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full bg-sand border border-sand focus:border-saffron focus:outline-none font-garamond text-base text-charcoal px-4 py-3 rounded-xl transition-colors"
                        placeholder="••••••••"
                      />
                    </div>
                  </>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-charcoal text-cream font-garamond text-sm uppercase tracking-widest py-4 rounded-xl hover:bg-saffron hover:text-charcoal transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                >
                  {loading
                    ? 'Creating account...'
                    : isMissingProfile
                    ? role === 'guide'
                      ? 'Complete Onboarding & Upload Certificate →'
                      : 'Complete Onboarding →'
                    : role === 'guide'
                    ? 'Create Account & Upload Certificate →'
                    : 'Create Account →'}
                </button>
              </form>

              {/* Divider */}
              <div className="my-6 flex items-center gap-4">
                <div className="flex-1 h-px bg-sand" />
                <span className="font-garamond text-xs text-charcoal/40">or</span>
                <div className="flex-1 h-px bg-sand" />
              </div>

              {/* Google Button */}
              <button
                onClick={handleGoogleSignup}
                disabled={loading}
                className="w-full border-2 border-sand bg-white flex items-center justify-center gap-3 font-garamond text-sm text-charcoal py-4 rounded-xl hover:border-saffron transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Sign up with Google
              </button>

              {/* Login Link */}
              <div className="text-center mt-6">
                <p className="font-garamond text-sm text-charcoal/60">
                  Already have an account?{' '}
                  <Link
                    to="/login"
                    className="text-saffron hover:text-terracotta transition-colors font-semibold"
                  >
                    Sign in
                  </Link>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
      </div>
    </>
  )
}
