import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import FeaturesStrip from './components/FeaturesStrip'
import HowItWorks from './components/HowItWorks'
import PanicCTA from './components/PanicCTA'
import Destinations from './components/Destinations'
import GuideNetwork from './components/GuideNetwork'
import Footer from './components/Footer'
import Login from './pages/Login'
import Signup from './pages/Signup'
import CertificateUpload from './pages/CertificateUpload'
import ProtectedRoute from './components/ProtectedRoute'
import TouristDashboard from './pages/TouristDashboard'
import GuideDashboard from './pages/GuideDashboard'

function HomePage() {
  return (
    <div className="bg-cream font-garamond page-fade-in">
      <Navbar />
      <div className="pt-20">
        <div id="home">
          <Hero />
        </div>
      <div id="features">
        <FeaturesStrip />
      </div>
      <div id="how-it-works">
        <HowItWorks />
      </div>
      <div id="safety">
        <PanicCTA />
      </div>
      <div id="destinations">
        <Destinations />
      </div>
      <div id="guides">
        <GuideNetwork />
      </div>
      <div id="contact">
        <Footer />
      </div>
      </div>

      {/* Floating SOS Button */}
      <div className="group fixed bottom-6 right-6 z-50 flex flex-col items-center">
        <div className="bg-charcoal text-white font-garamond text-xs px-3 py-2 rounded-lg whitespace-nowrap mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          Panic Alert
        </div>
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-terracotta/30 animate-ping pointer-events-none"></div>
          <button className="relative w-16 h-16 rounded-full bg-terracotta text-white flex flex-col items-center justify-center shadow-2xl hover:bg-red-700 transition-all duration-300 cursor-pointer border-2 border-white/20">
            <span className="text-xl leading-none">🚨</span>
            <span className="font-garamond text-xs font-bold uppercase tracking-wider mt-0.5">
              SOS
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route 
          path="/certificate-upload" 
          element={
            <ProtectedRoute allowedRole="guide">
              <CertificateUpload />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/tourist-dashboard" 
          element={
            <ProtectedRoute allowedRole="tourist">
              <TouristDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/guide-dashboard" 
          element={<GuideDashboard />} 
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}
