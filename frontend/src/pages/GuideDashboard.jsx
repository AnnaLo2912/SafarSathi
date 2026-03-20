import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import Sidebar from '../components/Sidebar'
import GuideOverview from '../components/guide/GuideOverview'
import PanicAlerts from '../components/guide/PanicAlerts'
import EarningsPanel from '../components/guide/EarningsPanel'
import ProfilePanel from '../components/guide/ProfilePanel'
import ChatPanel from '../components/guide/ChatPanel'
import { FiBarChart2, FiCalendar, FiAlertCircle, FiMapPin, FiMessageCircle, FiDollarSign, FiUser } from 'react-icons/fi'

export default function GuideDashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const [available, setAvailable] = useState(true)

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <FiBarChart2 size={20} /> },
    { id: 'bookings', label: 'Bookings', icon: <FiCalendar size={20} /> },
    { id: 'alerts', label: 'Panic Alerts', icon: <FiAlertCircle size={20} /> },
    { id: 'map', label: 'Tourist Map', icon: <FiMapPin size={20} /> },
    { id: 'chat', label: 'Messages', icon: <FiMessageCircle size={20} /> },
    { id: 'earnings', label: 'Earnings', icon: <FiDollarSign size={20} /> },
    { id: 'profile', label: 'Profile', icon: <FiUser size={20} /> }
  ]

  const { userProfile } = useAuth()

  return (
    <div className="min-h-screen bg-cream">
      <Sidebar
        tabs={tabs}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isDashboard="guide"
      />

      {/* Main Content */}
      <div className="md:ml-64 ml-20 transition-all duration-300 p-6 md:p-10">
        <div className="max-w-6xl mx-auto">
          {/* Top Info Bar */}
          <div className="hidden md:flex items-center justify-between mb-8 pb-6 border-b border-sand">
            <div className="flex items-center gap-4">
              <div className="font-playfair text-2xl font-bold text-charcoal">
                {userProfile?.name || 'Guide'}
              </div>
              <span className={`font-garamond text-xs px-3 py-1.5 rounded-full ${
                userProfile?.certificateStatus === 'approved'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-amber-100 text-amber-700'
              }`}>
                {userProfile?.certificateStatus === 'approved' ? '✓ Verified' : '⏳ Pending'}
              </span>
            </div>

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
          </div>

          {/* Content Area */}
          <div className="pb-24 md:pb-10">
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
        </div>
      </div>
    </div>
  )
}