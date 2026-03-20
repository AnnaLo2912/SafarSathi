"use client";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

export const FloatingNav = ({ navItems, className }) => {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  React.useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Show when at top or scrolling up
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

  return (
    <motion.div
      initial={{ opacity: 1, y: -100 }}
      animate={{
        y: visible ? 0 : -100,
        opacity: visible ? 1 : 0,
      }}
      transition={{
        duration: 0.2,
      }}
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
            className="relative flex items-center gap-1 rounded-full px-4 py-2 text-sm font-bold font-serif text-white transition-colors hover:bg-sand hover:text-charcoal uppercase tracking-widest text-xs"
          >
            <span className="block sm:hidden">{navItem.icon}</span>
            <span className="hidden sm:block text-xs">{navItem.name}</span>
          </a>
        ))}
        <div className="h-5 w-px bg-sand" />
        <button 
          onClick={() => navigate('/login')}
          className="relative rounded-full border border-charcoal text-charcoal font-bold font-serif px-4 py-2 text-xs transition-all bg-[rgb(255,252,153)] hover:bg-[rgb(255,252,204)] hover:text-charcoal uppercase tracking-wider"
        >
          Login
        </button>
      </div>
    </motion.div>
  );
};
