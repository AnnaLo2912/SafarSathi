import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import Sidebar from '../components/Sidebar'
import TripPlanner from '../components/dashboard/TripPlanner'
import SafetyPanel from '../components/dashboard/SafetyPanel'
import WalletPanel from '../components/dashboard/WalletPanel'
import GuidesPanel from '../components/dashboard/GuidesPanel'
import MyTrips from '../components/dashboard/MyTrips'
import ChatPanel from '../components/guide/ChatPanel'
import BlogsPage from '../components/dashboard/BlogsPage'
import { FiMap, FiList, FiAlertCircle, FiCreditCard, FiCompass, FiMessageCircle, FiBookOpen } from 'react-icons/fi'

export default function TouristDashboard() {
  const [activeTab,  setActiveTab]  = useState('planner')
  const [chatUnread, setChatUnread] = useState(0)
  const { userProfile } = useAuth()

  const tabs = [
    { id: 'planner',  label: 'Trip Planner', icon: <FiMap           size={20} /> },
    { id: 'mytrips',  label: 'My Trips',     icon: <FiList          size={20} /> },
    { id: 'blogs',    label: 'Blogs',        icon: <FiBookOpen      size={20} /> },
    { id: 'safety',   label: 'Safety',       icon: <FiAlertCircle   size={20} /> },
    { id: 'wallet',   label: 'Wallet',       icon: <FiCreditCard    size={20} /> },
    { id: 'guides',   label: 'My Guides',    icon: <FiCompass       size={20} /> },
    { id: 'chat',     label: 'Messages',     icon: <FiMessageCircle size={20} />, badge: chatUnread },
  ]

  return (
    <div className="min-h-screen bg-cream">
      <Sidebar
        tabs={tabs}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isDashboard="tourist"
      />

      <div className="md:ml-64 ml-20 transition-all duration-300 p-6 md:p-10">
        <div className="max-w-6xl mx-auto">
          <div className="pb-24 md:pb-10">
            {activeTab === 'planner' && <TripPlanner />}
            {activeTab === 'mytrips' && <MyTrips />}
            {activeTab === 'blogs'   && <BlogsPage />}
            {activeTab === 'safety'  && <SafetyPanel />}
            {activeTab === 'wallet'  && <WalletPanel />}
            {activeTab === 'guides'  && <GuidesPanel onOpenChat={() => setActiveTab('chat')} />}

            {/* ChatPanel always mounted to track unread */}
            <div className={activeTab === 'chat' ? '' : 'hidden'}>
              <ChatPanel isGuide={false} onUnreadChange={setChatUnread} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}