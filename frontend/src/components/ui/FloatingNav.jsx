"use client";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";
import { useAuth } from "../../context/AuthContext";

export const FloatingNav = ({ navItems, className }) => {
  const navigate  = useNavigate();
  const { currentUser, userRole, logout } = useAuth()
  const [visible,     setVisible]     = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  React.useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY < 50) {
        setVisible(true);
      } else if (currentScrollY < lastScrollY) {
        setVisible(true);
      } else {
        setVisible(false);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  // Smooth scroll to section — works from any page including /login
  function handleNavClick(e, link) {
    if (!link.startsWith('#')) return
    e.preventDefault()
    const id = link.replace('#', '')

    // If not on homepage, navigate there first then scroll
    if (window.location.pathname !== '/') {
      navigate('/')
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
      }, 400)
      return
    }

    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  async function handleLogout() {
    await logout()
    navigate('/')
    // Force scroll to top after logout
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100)
  }

  function handleDashboard() {
    navigate(userRole === 'guide' ? '/guide-dashboard' : '/tourist-dashboard')
  }

  return (
    <motion.div
      initial={{ opacity: 1, y: -100 }}
      animate={{ y: visible ? 0 : -100, opacity: visible ? 1 : 0 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "flex max-w-fit fixed top-6 inset-x-0 mx-auto z-[5000] items-center justify-center",
        className
      )}
    >
      <div
        className="flex items-center justify-center gap-2 rounded-full border border-sand/60 px-2 py-1.5 shadow-lg shadow-black/5 backdrop-blur-md"
        style={{ backgroundColor: 'rgb(53, 54, 53)' }}
      >
        {navItems.map((navItem, idx) => (
          <a
            key={`link=${idx}`}
            href={navItem.link}
            onClick={(e) => handleNavClick(e, navItem.link)}
            className="relative flex items-center gap-1 rounded-full px-4 py-2 text-sm font-bold font-serif text-white transition-colors hover:bg-sand hover:text-charcoal uppercase tracking-widest text-xs"
          >
            <span className="block sm:hidden">{navItem.icon}</span>
            <span className="hidden sm:block text-xs">{navItem.name}</span>
          </a>
        ))}

        <div className="h-5 w-px bg-sand" />

        {currentUser ? (
          /* Logged in — show Dashboard + Logout */
          <div className="flex items-center gap-2">
            <button
              onClick={handleDashboard}
              className="relative rounded-full border border-charcoal text-charcoal font-bold font-serif px-4 py-2 text-xs transition-all bg-[rgb(255,252,153)] hover:bg-[rgb(255,252,204)] uppercase tracking-wider"
            >
              Dashboard
            </button>
            <button
              onClick={handleLogout}
              className="relative rounded-full border border-white/30 text-white/70 font-serif px-4 py-2 text-xs transition-all hover:bg-white/10 uppercase tracking-wider"
            >
              Logout
            </button>
          </div>
        ) : (
          /* Not logged in — show Login */
          <button
            onClick={() => navigate('/login')}
            className="relative rounded-full border border-charcoal text-charcoal font-bold font-serif px-4 py-2 text-xs transition-all bg-[rgb(255,252,153)] hover:bg-[rgb(255,252,204)] uppercase tracking-wider"
          >
            Login
          </button>
        )}
      </div>
    </motion.div>
  );
};CDATASection.apply