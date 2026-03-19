import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import TripPlanner from '../components/dashboard/TripPlanner'
import SafetyPanel from '../components/dashboard/SafetyPanel'
import WalletPanel from '../components/dashboard/WalletPanel'
import GuidesPanel from '../components/dashboard/GuidesPanel'

export default function TouristDashboard() {
  const [activeTab, setActiveTab] = useState('planner')

  const tabs = [
    { id: 'planner', label: 'Trip Planner', icon: '🗺️' },
    { id: 'safety', label: 'Safety', icon: '🚨' },
    { id: 'wallet', label: 'Wallet', icon: '💳' },
    { id: 'guides', label: 'My Guides', icon: '🧭' },
  ]

  const { userProfile, logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* TOP NAVBAR */}
      <nav className="bg-cream border-b border-sand sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* LEFT - Logo */}
          <div
            onClick={() => navigate('/')}
            className="flex-shrink-0 cursor-pointer"
          >
            <h1 className="font-playfair text-2xl font-bold text-charcoal">
              SafarSathi
            </h1>
            <p className="font-garamond text-xs italic text-saffron block">
              सुरक्षित यात्रा
            </p>
          </div>

          {/* CENTER - Tab Navigation (Hidden on Mobile) */}
          <div className="hidden md:flex items-center gap-1 bg-sand rounded-full px-2 py-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-2 rounded-full font-garamond text-sm transition-all duration-300 cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-cream text-charcoal shadow-sm font-semibold'
                    : 'text-charcoal/50 hover:text-charcoal'
                }`}
              >
                <span>{tab.icon}</span>
                <span className="hidden xl:inline">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* RIGHT - User Area */}
          <div className="flex items-center gap-4">
            {/* Welcome Text (Hidden on Mobile) */}
            <div className="hidden sm:block font-garamond text-sm text-charcoal/60">
              👋 {userProfile?.name || 'Traveller'}
            </div>

            {/* Wallet Badge */}
            <div className="bg-sand border border-sand rounded-full px-4 py-2 flex items-center gap-2 font-garamond text-sm text-charcoal">
              <span>💳</span>
              <span>${userProfile?.walletUSD || '0'}</span>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="border border-sand text-charcoal/50 font-garamond text-xs uppercase tracking-wider px-4 py-2 rounded-full hover:border-terracotta hover:text-terracotta transition-all duration-300"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* MOBILE TAB BAR */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-cream border-t border-sand flex items-center justify-around px-4 py-3">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${
              activeTab === tab.id ? 'text-saffron' : 'text-charcoal/40'
            }`}
          >
            <span className="text-xl">{tab.icon}</span>
            <span className="font-garamond text-xs">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* MAIN CONTENT AREA */}
      <main className="max-w-7xl mx-auto px-6 py-10 pb-24 md:pb-10">
        {activeTab === 'planner' && <TripPlanner />}
        {activeTab === 'safety' && <SafetyPanel />}
        {activeTab === 'wallet' && <WalletPanel />}
        {activeTab === 'guides' && <GuidesPanel />}
      </main>
    </div>
  )
}
