import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import TripPlanner from '../components/dashboard/TripPlanner'
import SafetyPanel from '../components/dashboard/SafetyPanel'
import WalletPanel from '../components/dashboard/WalletPanel'
import GuidesPanel from '../components/dashboard/GuidesPanel'
import MyTrips     from '../components/dashboard/MyTrips'

export default function TouristDashboard() {
  const [activeTab, setActiveTab] = useState('planner')

  const tabs = [
    { id: 'planner', label: 'Trip Planner', icon: '🗺️' },
    { id: 'mytrips', label: 'My Trips',     icon: '📋' },
    { id: 'safety',  label: 'Safety',       icon: '🚨' },
    { id: 'wallet',  label: 'Wallet',       icon: '💳' },
    { id: 'guides',  label: 'My Guides',    icon: '🧭' },
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
      <div className="min-h-screen bg-cream pt-20">

        {/* DESKTOP TAB NAVIGATION */}
        <div className="hidden md:flex items-center justify-center gap-1 bg-sand rounded-full px-2 py-2 mx-auto w-fit mt-6 mb-6">
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

        {/* MAIN CONTENT AREA */}
        <main className="max-w-7xl mx-auto px-6 py-10 pb-24 md:pb-10">
          {activeTab === 'planner' && <TripPlanner />}
          {activeTab === 'mytrips' && <MyTrips />}
          {activeTab === 'safety'  && <SafetyPanel />}
          {activeTab === 'wallet'  && <WalletPanel />}
          {activeTab === 'guides'  && <GuidesPanel />}
        </main>

        {/* MOBILE TAB BAR */}
        <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-cream border-t border-sand flex items-center justify-around px-4 py-3">
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

      </div>
    </>
  )
}