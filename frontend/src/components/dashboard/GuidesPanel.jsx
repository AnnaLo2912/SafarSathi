import { useState } from 'react'
import { FiMapPin } from 'react-icons/fi'

export default function GuidesPanel() {
  const [activeGuide, setActiveGuide] = useState(null)
  const [chatOpen, setChatOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'guide',
      text: 'Namaste! I am Rajesh, your verified guide for Jaipur. How can I help you plan your visit?',
      time: '10:00 AM'
    },
    {
      id: 2,
      sender: 'tourist',
      text: 'Hi Rajesh! I want to visit Amber Fort tomorrow morning. What time should we meet?',
      time: '10:02 AM'
    },
    {
      id: 3,
      sender: 'guide',
      text: 'Perfect choice! I suggest we meet at 7:30 AM at the fort entrance. Early morning is less crowded and the light is beautiful for photos.',
      time: '10:03 AM'
    },
    {
      id: 4,
      sender: 'tourist',
      text: 'That sounds great! Should I book elephants for the ride up?',
      time: '10:05 AM'
    },
    {
      id: 5,
      sender: 'guide',
      text: 'I would recommend the jeep instead — more comfortable and better for the environment. I can arrange it for ₹300. Shall I book it for us?',
      time: '10:06 AM'
    }
  ])

  const bookedGuides = [
    {
      id: 1,
      name: 'Rajesh Kumar',
      location: 'Jaipur, Rajasthan',
      license: 'License #RJ1234',
      rating: '4.9',
      reviews: 127,
      avatar: 'R',
      avatarBg: 'bg-saffron',
      status: 'active',
      statusLabel: 'On Your Trip',
      statusColor: 'bg-green-100 text-green-700',
      tripDate: 'Today — Mar 19',
      tripDuration: '3 days',
      totalPaid: '₹6,000',
      speciality: 'Heritage & Forts',
      languages: ['English', 'Hindi', 'French'],
      phone: '+91 98765 43210',
      nextMeeting: 'Tomorrow, 7:30 AM — Amber Fort',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80'
    },
    {
      id: 2,
      name: 'Priya Nair',
      location: 'Kochi, Kerala',
      license: 'License #KL5678',
      rating: '4.8',
      reviews: 89,
      avatar: 'P',
      avatarBg: 'bg-deepblue',
      status: 'upcoming',
      statusLabel: 'Upcoming',
      statusColor: 'bg-blue-100 text-blue-700',
      tripDate: 'Mar 25 — Mar 30',
      tripDuration: '5 days',
      totalPaid: '₹9,000',
      speciality: 'Backwaters & Culture',
      languages: ['English', 'Malayalam', 'German'],
      phone: '+91 87654 32109',
      nextMeeting: 'Mar 25, 9:00 AM — Kochi Airport',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80'
    }
  ]

  const availableGuides = [
    {
      id: 3,
      name: 'Arjun Sharma',
      location: 'Varanasi, UP',
      license: 'License #UP9012',
      rating: '5.0',
      reviews: 64,
      avatar: 'A',
      avatarBg: 'bg-terracotta',
      available: true,
      rate: '₹1,500/day',
      speciality: 'Spiritual & Ghats',
      languages: ['English', 'Hindi', 'Spanish'],
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80'
    },
    {
      id: 4,
      name: 'Meera Pillai',
      location: 'Agra, UP',
      license: 'License #UP3456',
      rating: '4.7',
      reviews: 43,
      avatar: 'M',
      avatarBg: 'bg-deepblue',
      available: true,
      rate: '₹1,800/day',
      speciality: 'Mughal Heritage',
      languages: ['English', 'Hindi', 'Japanese'],
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80'
    }
  ]

  function sendMessage() {
    if (!message.trim()) return
    const newMsg = {
      id: messages.length + 1,
      sender: 'tourist',
      text: message,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
    setMessages([...messages, newMsg])
    setMessage('')

    // Mock guide reply after 1.5s
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          sender: 'guide',
          text: 'Got your message! I will get back to you shortly. Thanks!',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ])
    }, 1500)
  }

  return (
    <div className="page-fade-in">
      {/* SECTION HEADER */}
      <div className="mb-10">
        <div className="font-garamond text-xs uppercase tracking-widest text-terracotta mb-2">
          ✦ Your Guide Network
        </div>
        <h1 className="font-playfair text-4xl text-charcoal font-bold mb-1">
          Travel with
        </h1>
        <h1 className="font-playfair text-4xl text-saffron italic font-bold">
          trusted hands.
        </h1>
      </div>

      {/* MAIN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT + CENTER (lg:col-span-2) */}
        <div className="lg:col-span-2">
          {/* MY BOOKED GUIDES */}
          <div className="mb-8">
            <h2 className="font-playfair text-xl text-charcoal font-semibold mb-4">
              My Booked Guides
            </h2>

            {bookedGuides.map((guide) => (
              <div
                key={guide.id}
                className="mb-4 last:mb-0 bg-sand rounded-3xl overflow-hidden border border-sand hover:border-saffron/30 transition-all duration-300 grid grid-cols-1 md:grid-cols-3"
              >
                {/* LEFT — Image */}
                <div className="relative h-48 md:h-auto">
                  <img
                    src={guide.image}
                    alt={guide.name}
                    className="absolute inset-0 w-full h-full object-cover"
                  />

                  {/* Status Badge */}
                  <div
                    className={`absolute top-4 left-4 font-garamond text-xs font-bold px-3 py-1 rounded-full ${guide.statusColor}`}
                  >
                    {guide.statusLabel}
                  </div>
                </div>

                {/* RIGHT — Details */}
                <div className="md:col-span-2 p-6">
                  {/* Top Row */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-playfair text-xl text-charcoal font-bold mb-0.5">
                        {guide.name}
                      </h3>
                      <p className="font-garamond text-sm text-charcoal/60">
                        {guide.location}
                      </p>
                      <p className="font-garamond text-xs text-terracotta/70 mt-0.5">
                        {guide.license}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-playfair text-lg text-charcoal font-bold">
                        {guide.totalPaid}
                      </p>
                      <p className="font-garamond text-xs text-charcoal/50">
                        {guide.tripDuration}
                      </p>
                    </div>
                  </div>

                  {/* Info Pills */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <div className="bg-cream font-garamond text-xs text-charcoal/70 px-3 py-1 rounded-full border border-sand">
                      ⭐ {guide.rating} ({guide.reviews} reviews)
                    </div>
                    <div className="bg-cream font-garamond text-xs text-charcoal/70 px-3 py-1 rounded-full border border-sand">
                      📅 {guide.tripDate}
                    </div>
                    <div className="bg-cream font-garamond text-xs text-charcoal/70 px-3 py-1 rounded-full border border-sand">
                      ✦ {guide.speciality}
                    </div>
                  </div>

                  {/* Next Meeting */}
                  <div className="bg-cream rounded-xl px-4 py-3 mb-4 flex items-center gap-3">
                    <FiMapPin size={18} />
                    <div>
                      <p className="font-garamond text-xs text-charcoal/50 uppercase tracking-wider mb-0.5">
                        Next Meeting
                      </p>
                      <p className="font-playfair text-sm text-charcoal font-semibold">
                        {guide.nextMeeting}
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setActiveGuide(guide)
                        setChatOpen(true)
                      }}
                      className="bg-charcoal text-cream font-garamond text-xs uppercase tracking-wider px-5 py-2.5 rounded-xl hover:bg-saffron hover:text-charcoal transition-all duration-300"
                    >
                      💬 Open Chat
                    </button>
                    <button className="border border-sand text-charcoal/60 font-garamond text-xs uppercase tracking-wider px-5 py-2.5 rounded-xl hover:border-saffron hover:text-saffron transition-all duration-300">
                      📞 {guide.phone}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* AVAILABLE GUIDES */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-playfair text-xl text-charcoal font-semibold">
                Book a New Guide
              </h2>
              <span className="font-garamond text-xs text-charcoal/40 uppercase tracking-wider">
                All government verified
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableGuides.map((guide) => (
                <div
                  key={guide.id}
                  className="bg-sand rounded-3xl p-6 border border-sand hover:border-saffron/40 hover:shadow-lg transition-all duration-300"
                >
                  {/* Top Row */}
                  <div className="flex items-center gap-4 mb-4">
                    <div
                      className={`w-14 h-14 rounded-full flex items-center justify-center text-white font-playfair font-bold text-xl shrink-0 ${guide.avatarBg}`}
                    >
                      {guide.avatar}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-playfair text-lg text-charcoal font-bold">
                        {guide.name}
                      </h3>
                      <p className="font-garamond text-sm text-charcoal/60">
                        {guide.location}
                      </p>
                      <p className="font-garamond text-xs text-terracotta/70 mt-0.5">
                        {guide.license}
                      </p>
                    </div>
                  </div>

                  {/* Details Row */}
                  <div className="flex items-center gap-3 mb-3 flex-wrap">
                    <span className="font-garamond text-sm text-charcoal/70">
                      ⭐ {guide.rating}
                    </span>
                    <span className="font-garamond text-sm text-charcoal/40">·</span>
                    <span className="font-garamond text-sm text-charcoal/70">
                      {guide.speciality}
                    </span>
                  </div>

                  {/* Languages */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {guide.languages.map((lang) => (
                      <div
                        key={lang}
                        className="bg-cream font-garamond text-xs text-charcoal/60 px-2 py-1 rounded-full border border-sand"
                      >
                        {lang}
                      </div>
                    ))}
                  </div>

                  {/* Bottom Row */}
                  <div className="flex items-center justify-between">
                    <p className="font-playfair text-xl text-charcoal font-bold">
                      {guide.rate}
                    </p>
                    <button className="bg-charcoal text-cream font-garamond text-xs uppercase tracking-wider px-5 py-2.5 rounded-xl hover:bg-saffron hover:text-charcoal transition-all duration-300">
                      Book Now →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT (lg:col-span-1) */}
        <div className="lg:col-span-1">
          {/* CHAT PANEL */}
          <div className="bg-sand rounded-3xl overflow-hidden flex flex-col border border-sand" style={{ height: '600px' }}>
            {!chatOpen ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <div className="text-6xl mb-4">💬</div>
                <h3 className="font-playfair text-2xl text-charcoal font-bold mb-2">
                  Guide Chat
                </h3>
                <p className="font-garamond text-base text-charcoal/60 max-w-xs mb-4">
                  Open a chat with your booked guide to coordinate your trip.
                </p>
                <p className="font-garamond text-sm text-charcoal/40">
                  ← Select a guide to chat
                </p>
              </div>
            ) : (
              <>
                {/* Chat Header */}
                <div className="bg-cream px-5 py-4 border-b border-sand flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-playfair font-bold ${activeGuide?.avatarBg}`}
                    >
                      {activeGuide?.avatar}
                    </div>
                    <div>
                      <p className="font-playfair text-base text-charcoal font-semibold">
                        {activeGuide?.name}
                      </p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                        <span className="font-garamond text-xs text-green-600">Online</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setChatOpen(false)}
                    className="text-charcoal/40 hover:text-charcoal cursor-pointer text-xl"
                  >
                    ×
                  </button>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender === 'tourist' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                          msg.sender === 'tourist'
                            ? 'bg-charcoal text-cream rounded-tr-sm'
                            : 'bg-cream text-charcoal rounded-tl-sm border border-sand'
                        }`}
                      >
                        <p className="font-garamond text-sm leading-relaxed">
                          {msg.text}
                        </p>
                        <p
                          className={`font-garamond text-xs mt-1 ${
                            msg.sender === 'tourist'
                              ? 'text-white/40 text-right'
                              : 'text-charcoal/40'
                          }`}
                        >
                          {msg.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Chat Input Area */}
                <div className="bg-cream border-t border-sand px-4 py-3 flex items-center gap-3">
                  <input
                    type="text"
                    placeholder="Type a message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') sendMessage()
                    }}
                    className="flex-1 bg-sand border border-sand focus:border-saffron focus:outline-none font-garamond text-sm text-charcoal px-4 py-3 rounded-xl transition-colors"
                  />
                  <button
                    onClick={sendMessage}
                    className="w-10 h-10 rounded-full bg-charcoal flex items-center justify-center hover:bg-saffron transition-all duration-300 cursor-pointer shrink-0"
                  >
                    <span className="text-white text-sm">→</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
