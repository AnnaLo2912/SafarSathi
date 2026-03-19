import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import GuideOverview from '../components/guide/GuideOverview'
import PanicAlerts from '../components/guide/PanicAlerts'
import EarningsPanel from '../components/guide/EarningsPanel'
import ProfilePanel from '../components/guide/ProfilePanel'
import ChatPanel from '../components/guide/ChatPanel'

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
      <div className="min-h-screen bg-cream pt-32 pb-10 px-6">
        {/* TOP NAVBAR - Desktop */}
        <div className="hidden md:flex sticky top-24 bg-cream z-40 items-center justify-between mb-8 pb-4 border-b border-sand">
          {/* Logo & Tabs */}
          <div className="flex items-center gap-8">
            <div className="font-playfair text-2xl text-charcoal font-bold">
              🧭 SafarSathi Guide
            </div>
            <div className="flex items-center gap-1 bg-sand rounded-2xl p-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-xl text-sm font-garamond transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'bg-saffron text-charcoal font-semibold'
                      : 'text-charcoal/50 hover:text-charcoal/70'
                  }`}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Right side: Availability, Certificate, Name, Logout */}
          <div className="flex items-center gap-6">
            {/* Availability Toggle */}
            <div className="flex items-center gap-3">
              <span className="font-garamond text-xs text-charcoal/60 uppercase tracking-wider">
                {available ? 'Online' : 'Offline'}
              </span>
              <button
                onClick={() => setAvailable(!available)}
                className={`w-10 h-5 rounded-full relative transition-all duration-300 ${
                  available ? 'bg-green-500' : 'bg-charcoal/20'
                }`}
              >
                <div
                  className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-md transition-all duration-300 ${
                    available ? 'left-5' : 'left-0.5'
                  }`}
                />
              </button>
            </div>

            {/* Certificate Badge */}
            <span className={`font-garamond text-xs px-3 py-1.5 rounded-full ${
              userProfile?.certificateStatus === 'approved'
                ? 'bg-green-100 text-green-700'
                : 'bg-amber-100 text-amber-700'
            }`}>
              {userProfile?.certificateStatus === 'approved' ? '✓ Verified' : '⏳ Pending'}
            </span>

            {/* Guide Name */}
            <span className="font-playfair text-sm text-charcoal/60 truncate max-w-xs">
              {userProfile?.name || 'Guide'}
            </span>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="font-garamond text-xs uppercase tracking-widest text-charcoal/50 border border-sand px-4 py-2 rounded-lg hover:text-charcoal hover:border-charcoal/20 transition-all duration-300"
            >
              Logout
            </button>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="max-w-7xl mx-auto">
          {activeTab === 'overview' && <GuideOverview available={available} setAvailable={setAvailable} />}
          {activeTab === 'bookings' && (
            <div className="text-center py-16">
              <p className="font-playfair text-2xl text-charcoal">Bookings — Coming Soon</p>
            </div>
          )}
          {activeTab === 'alerts' && <PanicAlerts />}
          {activeTab === 'map' && (
            <div className="text-center py-16">
              <p className="font-playfair text-2xl text-charcoal">Tourist Map — Coming Soon</p>
            </div>
          )}
          {activeTab === 'chat' && <ChatPanel />}
          {activeTab === 'earnings' && <EarningsPanel />}
          {activeTab === 'profile' && <ProfilePanel />}
        </div>

        {/* MOBILE BOTTOM TAB BAR */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-cream border-t border-sand z-40 flex overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-shrink-0 flex-1 py-3 px-2 text-center transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-charcoal/10 text-charcoal'
                  : 'text-charcoal/40'
              }`}
            >
              <div className="text-xl">{tab.icon}</div>
              <div className="font-garamond text-xs mt-0.5">{tab.label}</div>
            </button>
          ))}
        </div>
      </div>
    </>
  )
}
