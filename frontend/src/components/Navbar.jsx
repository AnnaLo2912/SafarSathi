import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { FiAlertCircle, FiMap, FiPackage, FiMenu } from 'react-icons/fi'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const navigate = useNavigate()
  const { currentUser, userRole, logout } = useAuth()

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      
      // Show navbar only if at the very top
      if (currentScrollY < 50) {
        setIsVisible(true)
      } 
      // Hide navbar if scrolling down past threshold
      else if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setIsVisible(false)
      }
      
      setScrolled(currentScrollY > 50)
      setLastScrollY(currentScrollY)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY])

  const navLinks = [
    { label: 'Home', id: 'home' },
    { label: 'Destinations', id: 'destinations' },
    { label: 'Travel Guide', id: 'guides' },
    { label: 'Safety', id: 'safety' },
    { label: 'Contact', id: 'contact' },
  ]

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    setMobileMenuOpen(false)
  }

  async function handleLogout() {
    await logout()
    navigate('/')
  }

  return (
    <>
      <nav
        className={`sticky w-full top-0 z-50 bg-cream border-b border-sand transition-all duration-300 ${
          scrolled ? 'shadow-lg' : 'shadow-sm'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* LEFT - Logo Block */}
          <div className="flex-shrink-0">
            <h1 className="font-playfair text-2xl font-bold text-charcoal">
              SafarSathi
            </h1>
            <p className="font-garamond text-xs italic text-saffron">
              सुरक्षित यात्रा
            </p>
          </div>

          {/* CENTER - Nav Links (Hidden on Mobile) */}
          <div className="hidden md:flex items-center flex-1 justify-center">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => scrollTo(link.id)}
                className="font-garamond text-sm uppercase tracking-widest text-charcoal hover:text-terracotta transition-colors cursor-pointer mx-4"
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* RIGHT - Buttons */}
          <div className="flex items-center gap-2">
            <button className="bg-terracotta text-white text-xs font-bold px-4 py-2 rounded-full hover:bg-red-700 transition-colors flex items-center gap-2">
              <FiAlertCircle size={16} /> SOS
            </button>
            
            {currentUser ? (
              <>
                <button 
                  onClick={() => navigate(userRole === 'guide' ? '/guide-dashboard' : '/tourist-dashboard')}
                  className="hidden sm:block bg-saffron text-charcoal text-xs font-bold px-4 py-2 rounded-full hover:bg-amber-500 transition-colors cursor-pointer flex items-center gap-2"
                >
                  {userRole === 'guide' ? <><FiMap size={16} /> Dashboard</> : <><FiPackage size={16} /> Dashboard</>}
                </button>
                <button 
                  onClick={handleLogout}
                  className="hidden sm:block border border-charcoal text-charcoal text-xs px-4 py-2 rounded-full ml-2 hover:bg-charcoal hover:text-cream transition-colors cursor-pointer"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={() => navigate('/signup')}
                  className="hidden sm:block bg-saffron text-charcoal text-xs font-bold px-4 py-2 rounded-full hover:bg-amber-500 transition-colors cursor-pointer"
                >
                  Sign Up
                </button>
                <button 
                  onClick={() => navigate('/login')}
                  className="hidden sm:block border border-charcoal text-charcoal text-xs px-4 py-2 rounded-full ml-2 hover:bg-charcoal hover:text-cream transition-colors cursor-pointer"
                >
                  Login
                </button>
              </>
            )}

            {/* Mobile Hamburger Menu */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-charcoal text-2xl ml-4"
            >
              <FiMenu size={24} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="fixed w-full top-16 left-0 z-40 bg-cream px-6 py-4 md:hidden border-b border-sand shadow-md">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => scrollTo(link.id)}
              className="block w-full text-left font-garamond text-sm uppercase tracking-widest text-charcoal hover:text-terracotta transition-colors py-2"
            >
              {link.label}
            </button>
          ))}
          
          {currentUser ? (
            <>
              <button 
                onClick={() => {
                  navigate(userRole === 'guide' ? '/guide-dashboard' : '/tourist-dashboard')
                  setMobileMenuOpen(false)
                }}
                className="w-full mt-4 bg-saffron text-charcoal text-xs font-bold px-4 py-2 rounded-full hover:bg-amber-500 transition-colors cursor-pointer"
              >
                {userRole === 'guide' ? <><FiMap size={16} /> Dashboard</> : <><FiPackage size={16} /> Dashboard</>}
              </button>
              <button 
                onClick={() => {
                  handleLogout()
                  setMobileMenuOpen(false)
                }}
                className="w-full mt-2 border border-charcoal text-charcoal text-xs px-4 py-2 rounded-full hover:bg-charcoal hover:text-cream transition-colors cursor-pointer"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={() => {
                  navigate('/signup')
                  setMobileMenuOpen(false)
                }}
                className="w-full mt-4 bg-saffron text-charcoal text-xs font-bold px-4 py-2 rounded-full hover:bg-amber-500 transition-colors cursor-pointer"
              >
                Sign Up
              </button>
              <button 
                onClick={() => {
                  navigate('/login')
                  setMobileMenuOpen(false)
                }}
                className="w-full mt-2 border border-charcoal text-charcoal text-xs px-4 py-2 rounded-full hover:bg-charcoal hover:text-cream transition-colors cursor-pointer"
              >
                Login
              </button>
            </>
          )}
        </div>
      )}
    </>
  )
}
