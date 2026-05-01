import { useState } from 'react'
import Sidebar from '../components/Sidebar'
import GuideOverview from '../components/guide/GuideOverview'
import BookingsPanel from '../components/guide/BookingsPanel'
import PanicAlerts from '../components/guide/PanicAlerts'
import EarningsPanel from '../components/guide/EarningsPanel'
import ProfilePanel from '../components/guide/ProfilePanel'
import ChatPanel from '../components/guide/ChatPanel'
import { FiBarChart2, FiCalendar, FiAlertCircle, FiMessageCircle, FiDollarSign, FiUser } from 'react-icons/fi'

export default function GuideDashboard() {
  const [activeTab,    setActiveTab]    = useState('overview')
  const [sidebarOpen,  setSidebarOpen]  = useState(true)
  const [chatUnread,   setChatUnread]   = useState(0)

  const tabs = [
    { id: 'overview',  label: 'Overview',     icon: <FiBarChart2    size={20} /> },
    { id: 'bookings',  label: 'Bookings',     icon: <FiCalendar     size={20} /> },
    { id: 'alerts',    label: 'Panic Alerts', icon: <FiAlertCircle  size={20} /> },
    { id: 'chat',      label: chatUnread > 0 ? `Messages (${chatUnread})` : 'Messages', icon: <FiMessageCircle size={20} /> },
    { id: 'earnings',  label: 'Earnings',     icon: <FiDollarSign   size={20} /> },
    { id: 'profile',   label: 'Profile',      icon: <FiUser         size={20} /> },
  ]

  return (
    <div className="min-h-screen bg-cream">
      <Sidebar
        tabs={tabs}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isDashboard="guide"
        onToggle={setSidebarOpen}
      />

      <div className={`${sidebarOpen ? 'ml-64' : 'ml-20'} pl-6 md:pl-10 pr-4 md:pr-6 py-6 transition-all duration-300`}>
        <div className="w-full">
          <div className="pb-24 md:pb-10">
            {activeTab === 'overview'  && <GuideOverview />}
            {activeTab === 'bookings'  && (
              <BookingsPanel onOpenChat={() => setActiveTab('chat')} />
            )}
            {activeTab === 'alerts'    && <PanicAlerts />}
            {activeTab === 'earnings'  && <EarningsPanel />}
            {activeTab === 'profile'   && <ProfilePanel />}

            {/* ChatPanel always mounted to track unread, hidden when not active */}
            <div className={activeTab === 'chat' ? '' : 'hidden'}>
              <ChatPanel isGuide={true} onUnreadChange={setChatUnread} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}