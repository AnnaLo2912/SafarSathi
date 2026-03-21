import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { FiX, FiMenu, FiLogOut } from 'react-icons/fi'

export default function Sidebar({ tabs, activeTab, setActiveTab, isDashboard = 'tourist', onToggle }) {
  const [isOpen, setIsOpen] = useState(true)
  const navigate = useNavigate()
  const { logout } = useAuth()

  useEffect(() => {
    if (onToggle) onToggle(isOpen)
  }, [isOpen, onToggle])

  async function handleLogout() {
    await logout()
    navigate('/')
  }

  return (
    <>
      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-full z-50 bg-[#F5EFE6] border border-coral/35 shadow-[6px_0_24px_rgba(44,44,44,0.08)] transition-all duration-300 flex flex-col ${
          isOpen ? 'w-64' : 'w-20'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-6 border-b border-coral/20">
          {isOpen && (
            <div className="flex flex-col">
              <h1 className="font-playfair text-lg font-bold text-charcoal">
                SafarSathi
              </h1>
              <p className="text-xs text-saffron font-garamond italic">
                {isDashboard === 'guide' ? 'Guide' : 'Tourist'}
              </p>
            </div>
          )}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-charcoal text-xl hover:bg-sand rounded p-1 transition-colors"
          >
            {isOpen ? <FiX size={20} /> : <FiMenu size={20} />}
          </button>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex-1 overflow-y-auto px-2 py-6 space-y-1">
          {tabs.map((tab) => {
            const hasUnread = tab.badge > 0
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center justify-start px-4 py-3 rounded-lg font-garamond text-sm transition-all duration-300 cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-saffron text-charcoal font-semibold'
                    : 'text-charcoal hover:bg-sand/50'
                }`}
                title={!isOpen ? tab.label : ''}
              >
                {/* Icon with red dot */}
                <span className="relative flex-shrink-0 w-6 text-center text-base">
                  {tab.icon}
                  {hasUnread && (
                    <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-0.5 leading-none animate-pulse">
                      {tab.badge > 9 ? '9+' : tab.badge}
                    </span>
                  )}
                </span>

                {/* Label + badge count when sidebar is open */}
                {isOpen && (
                  <span className="ml-4 truncate flex items-center gap-2 flex-1">
                    {tab.label}
                    {hasUnread && (
                      <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                        {tab.badge > 9 ? '9+' : tab.badge}
                      </span>
                    )}
                  </span>
                )}
              </button>
            )
          })}
        </nav>

        {/* Footer - Logout */}
        <div className="border-t border-coral/20 p-3">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-4 py-3 rounded-lg font-garamond text-sm text-charcoal hover:bg-sand/50 transition-colors"
            title={!isOpen ? 'Logout' : ''}
          >
            <span className="text-lg flex-shrink-0"><FiLogOut size={18} /></span>
            {isOpen && <span>Logout</span>}
          </button>
        </div>
      </div>

      {/* Mobile Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed bottom-6 right-6 z-40 bg-saffron text-charcoal rounded-full p-3 shadow-lg hover:bg-terracotta transition-colors"
        title="Toggle Sidebar"
      >
        {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
      </button>
    </>
  )
}