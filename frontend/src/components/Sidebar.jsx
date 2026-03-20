import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { FiX, FiMenu, FiLogOut } from 'react-icons/fi'

export default function Sidebar({ tabs, activeTab, setActiveTab, isDashboard = 'tourist' }) {
  const [isOpen, setIsOpen] = useState(true)
  const navigate = useNavigate()
  const { logout } = useAuth()

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
          {tabs.map((tab) => (
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
              <span className="text-base flex-shrink-0 w-6 text-center">{tab.icon}</span>
              {isOpen && <span className="ml-4 truncate">{tab.label}</span>}
            </button>
          ))}
        </nav>

        {/* Footer - Logout Button */}
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

      {/* Main Content Area */}
      <div
        className={`transition-all duration-300 ${
          isOpen ? 'ml-64' : 'ml-20'
        }`}
      >
        {/* Toggle Button (Mobile Visible) */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden fixed bottom-6 right-6 z-40 bg-saffron text-charcoal rounded-full p-3 shadow-lg hover:bg-terracotta transition-colors"
          title="Toggle Sidebar"
        >
          {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </div>
    </>
  )
}
