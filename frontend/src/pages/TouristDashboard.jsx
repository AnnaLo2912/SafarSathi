import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import Sidebar from '../components/Sidebar'
import TripPlanner from '../components/dashboard/TripPlanner'
import SafetyPanel from '../components/dashboard/SafetyPanel'
import WalletPanel from '../components/dashboard/WalletPanel'
import GuidesPanel from '../components/dashboard/GuidesPanel'
import MyTrips from '../components/dashboard/MyTrips'
import { FiMap, FiList, FiAlertCircle, FiCreditCard, FiCompass } from 'react-icons/fi'

export default function TouristDashboard() {
  const [activeTab, setActiveTab] = useState('planner')

  const tabs = [
    { id: 'planner', label: 'Trip Planner', icon: <FiMap size={20} /> },
    { id: 'mytrips', label: 'My Trips', icon: <FiList size={20} /> },
    { id: 'safety', label: 'Safety', icon: <FiAlertCircle size={20} /> },
    { id: 'wallet', label: 'Wallet', icon: <FiCreditCard size={20} /> },
    { id: 'guides', label: 'My Guides', icon: <FiCompass size={20} /> },
  ]

  const { userProfile } = useAuth()

  return (
    <div className="min-h-screen bg-cream">
      <Sidebar
        tabs={tabs}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isDashboard="tourist"
      />

      {/* Main Content */}
      <div className="md:ml-64 ml-20 transition-all duration-300 p-6 md:p-10">
        <div className="max-w-6xl mx-auto">
          {/* Content Area */}
          <div className="pb-24 md:pb-10">
            {activeTab === 'planner' && <TripPlanner />}
            {activeTab === 'mytrips' && <MyTrips />}
            {activeTab === 'safety' && <SafetyPanel />}
            {activeTab === 'wallet' && <WalletPanel />}
            {activeTab === 'guides' && <GuidesPanel />}
          </div>
        </div>
      </div>
    </div>
  )
}