import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function TouristDashboard() {
  const { userProfile, logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center">
      <div className="text-center">
        <div className="font-playfair text-5xl text-charcoal font-bold mb-4">
          🧳 Tourist Dashboard
        </div>
        <div className="font-garamond text-xl text-charcoal/60 mb-2">
          Welcome, {userProfile?.name}!
        </div>
        <div className="font-garamond text-sm text-charcoal/40 mb-8">
          Full dashboard coming soon.
        </div>
        <button
          onClick={handleLogout}
          className="bg-charcoal text-cream font-garamond text-sm uppercase tracking-widest px-8 py-3 rounded-xl hover:bg-terracotta transition-all duration-300"
        >
          Logout
        </button>
      </div>
    </div>
  )
}
