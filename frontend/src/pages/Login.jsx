import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase'
import Navbar from '../components/Navbar'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { login, loginWithGoogle } = useAuth()
  const navigate = useNavigate()

  async function handleLogin(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const result = await login(email, password)
      // Fetch role from Firestore and redirect
      const userDoc = await getDoc(
        doc(db, 'users', result.user.uid)
      )
      const role = userDoc.data()?.role
      if (role === 'guide') {
        navigate('/guide-dashboard')
      } else {
        navigate('/tourist-dashboard')
      }
    } catch (err) {
      setError('Invalid email or password. Please try again.')
    }
    setLoading(false)
  }

  async function handleGoogleLogin() {
    setError('')
    setLoading(true)
    try {
      const result = await loginWithGoogle()
      const userDoc = await getDoc(
        doc(db, 'users', result.user.uid)
      )
      const role = userDoc.data()?.role
      if (role === 'guide') {
        navigate('/guide-dashboard')
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
          {/* Header */}
          <div className="mb-10">
            {/* Back to home */}
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-charcoal/50 hover:text-charcoal transition-colors cursor-pointer font-garamond text-sm mb-6"
            >
              ← Back to home
            </button>

            {/* Title */}
            <h2 className="font-playfair text-4xl text-charcoal font-bold mb-2">
              Welcome back.
            </h2>
            <p className="font-garamond text-base text-charcoal/60">
              Sign in to your SafarSathi account
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 font-garamond text-sm px-4 py-3 rounded-xl mb-6">
              {error}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email Field */}
            <div>
              <label className="font-garamond text-xs uppercase tracking-widest text-charcoal/60 mb-2 block">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-sand border border-sand focus:border-saffron focus:outline-none font-garamond text-base text-charcoal px-4 py-3 rounded-xl transition-colors"
                placeholder="you@example.com"
              />
            </div>

            {/* Password Field */}
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
              <div className="text-right mt-1">
                <button
                  type="button"
                  className="font-garamond text-xs text-saffron hover:text-terracotta cursor-pointer transition-colors"
                >
                  Forgot password?
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-charcoal text-cream font-garamond text-sm uppercase tracking-widest py-4 rounded-xl hover:bg-saffron hover:text-charcoal transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? 'Signing in...' : 'Sign In'}
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
            onClick={handleGoogleLogin}
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
            Continue with Google
          </button>

          {/* Signup Link */}
          <div className="text-center mt-8">
            <p className="font-garamond text-sm text-charcoal/60">
              Don't have an account?{' '}
              <Link
                to="/signup"
                className="text-saffron hover:text-terracotta transition-colors font-semibold"
              >
                Create one free
              </Link>
            </p>
          </div>
        </div>
      </div>
      </div>
    </>
  )
}
