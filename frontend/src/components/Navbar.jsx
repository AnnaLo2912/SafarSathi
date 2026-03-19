import { useState, useEffect } from 'react'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

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

  return (
    <>
      <nav
        className={`fixed w-full top-0 z-50 bg-cream border-b border-sand transition-shadow duration-300 ${
          scrolled ? 'shadow-md' : ''
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
            <button className="bg-terracotta text-white text-xs font-bold px-4 py-2 rounded-full hover:bg-red-700 transition-colors">
              🚨 SOS
            </button>
            <button className="hidden sm:block border border-charcoal text-charcoal text-xs px-4 py-2 rounded-full ml-3 hover:bg-charcoal hover:text-cream transition-colors">
              Login
            </button>

            {/* Mobile Hamburger Menu */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-charcoal text-2xl ml-4"
            >
              ☰
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="fixed w-full top-20 z-40 bg-cream px-6 py-4 md:hidden">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => scrollTo(link.id)}
              className="block w-full text-left font-garamond text-sm uppercase tracking-widest text-charcoal hover:text-terracotta transition-colors py-2"
            >
              {link.label}
            </button>
          ))}
          <button className="w-full mt-4 border border-charcoal text-charcoal text-xs px-4 py-2 rounded-full hover:bg-charcoal hover:text-cream transition-colors">
            Login
          </button>
        </div>
      )}
    </>
  )
}
