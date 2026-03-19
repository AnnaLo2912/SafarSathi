import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'

export default function GuideDashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const [available, setAvailable] = useState(true)

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'bookings', label: 'Bookings', icon: '📅' },
    { id: 'alerts', label: 'Panic Alerts', icon: '🚨' },
    { id: 'map', label: 'Tourist Map', icon: '📍' },
    { id: 'chat', label: 'Messages', icon: '💬' },
    { id: 'earnings', label: 'Earnings', icon: '💰' },
    { id: 'profile', label: 'Profile', icon: '👤' }
  ]

  const { userProfile, logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/')
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-cream flex items-center justify-center pt-20">
      <div className="text-center">
        <div className="font-playfair text-5xl text-charcoal font-bold mb-4">
          🗺️ Guide Dashboard
        </div>
        <div className="font-garamond text-xl text-charcoal/60 mb-2">
          Welcome, {userProfile?.name}!
        </div>
        <div className="font-garamond text-sm text-charcoal/40 mb-3">
          Certificate Status:
          <span className={`ml-2 px-3 py-1 rounded-full text-xs font-semibold ${
            userProfile?.certificateStatus === 'approved' 
              ? 'bg-green-100 text-green-700' 
              : 'bg-amber-100 text-amber-700'
          }`}>
            {userProfile?.certificateStatus === 'approved' 
              ? '✓ Approved' 
              : '⏳ Pending Approval'}
          </span>
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
    </>
  )
}
