import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import Sidebar from '../components/Sidebar'
import GuideOverview from '../components/guide/GuideOverview'
import BookingsPanel from '../components/guide/BookingsPanel'
import PanicAlerts from '../components/guide/PanicAlerts'
import EarningsPanel from '../components/guide/EarningsPanel'
import ProfilePanel from '../components/guide/ProfilePanel'
import ChatPanel from '../components/guide/ChatPanel'
import { FiBarChart2, FiCalendar, FiAlertCircle, FiMapPin, FiMessageCircle, FiDollarSign, FiUser } from 'react-icons/fi'

export default function GuideDashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const [available, setAvailable] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)

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
        onToggle={setSidebarOpen}
      />

      {/* Main Content */}
      <div className={`${sidebarOpen ? 'ml-64' : 'ml-20'} pl-6 md:pl-10 pr-4 md:pr-6 py-6 transition-all duration-300`}>
        <div className="w-full">
          {/* Content Area */}
          <div className="pb-24 md:pb-10">
            {activeTab === 'overview' && <GuideOverview available={available} setAvailable={setAvailable} />}
            {activeTab === 'bookings' && <BookingsPanel />}
            {activeTab === 'alerts' && <PanicAlerts />}
            {activeTab === 'map' && (
              <div className="text-center py-16">
                <p className="font-playfair text-2xl text-charcoal">Tourist Map. Coming Soon</p>
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