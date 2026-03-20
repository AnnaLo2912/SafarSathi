import { FloatingNav } from './ui/FloatingNav'

export default function Navbar() {
  const navItems = [
    { name: "Home", link: "#home", icon: "🏠" },
    { name: "Destinations", link: "#destinations", icon: "🗺️" },
    { name: "Travel Guide", link: "#how-it-works", icon: "✦" },
    { name: "Safety", link: "#safety", icon: "🚨" },
    { name: "Contact", link: "#guides", icon: "📞" },
  ]

  return <FloatingNav navItems={navItems} />
}
