import { useState } from 'react'

export default function ChatPanel() {
  const [activeChat, setActiveChat] = useState(null)
  const [message, setMessage] = useState('')
  const [conversations, setConversations] = useState([
    {
      id: 1,
      tourist: "Sarah Mitchell",
      country: "🇺🇸",
      avatar: "S",
      avatarBg: "bg-saffron",
      lastMessage: "What time should we meet at Amber Fort tomorrow?",
      time: "2 min ago",
      unread: 2,
      online: true,
      trip: "Jaipur Full Day — Mar 20",
      messages: [
        { id: 1, sender: 'tourist', text: 'Namaste Rajesh! Really excited for tomorrow.', time: '9:00 AM' },
        { id: 2, sender: 'guide', text: 'Namaste Sarah! I am equally excited. Jaipur will not disappoint!', time: '9:02 AM' },
        { id: 3, sender: 'tourist', text: 'Should I wear anything specific to the fort?', time: '9:05 AM' },
        { id: 4, sender: 'guide', text: 'Comfortable shoes are a must as we will walk a lot. Light clothing is fine. I will bring water for us!', time: '9:07 AM' },
        { id: 5, sender: 'tourist', text: 'What time should we meet at Amber Fort tomorrow?', time: '10:30 AM' },
      ]
    },
    {
      id: 2,
      tourist: "James Whitfield",
      country: "🇬🇧",
      avatar: "J",
      avatarBg: "bg-deepblue",
      lastMessage: "Perfect, see you at City Palace!",
      time: "1 hr ago",
      unread: 0,
      online: true,
      trip: "Half Day — City Palace, Mar 21",
      messages: [
        { id: 1, sender: 'guide', text: 'Hello James! Looking forward to showing you City Palace tomorrow.', time: '8:00 AM' },
        { id: 2, sender: 'tourist', text: 'Brilliant! What is the best way to get there?', time: '8:15 AM' },
        { id: 3, sender: 'guide', text: 'I suggest taking an auto rickshaw from your hotel. Should cost around ₹80-100.', time: '8:17 AM' },
        { id: 4, sender: 'tourist', text: 'Perfect, see you at City Palace!', time: '9:00 AM' },
      ]
    },
    {
      id: 3,
      tourist: "Yuki Tanaka",
      country: "🇯🇵",
      avatar: "Y",
      avatarBg: "bg-terracotta",
      lastMessage: "Can we add Jantar Mantar to the itinerary?",
      time: "3 hr ago",
      unread: 1,
      online: false,
      trip: "Full Day — Nahargarh, Mar 22",
      messages: [
        { id: 1, sender: 'tourist', text: 'Hello! I read about Jantar Mantar. Can we add it?', time: '7:00 AM' },
        { id: 2, sender: 'guide', text: 'Absolutely! It is very close to City Palace. We can fit it in between 11 AM and 12 PM.', time: '7:05 AM' },
        { id: 3, sender: 'tourist', text: 'Can we add Jantar Mantar to the itinerary?', time: '7:30 AM' },
      ]
    }
  ])

  function sendMessage() {
    if (!message.trim() || !activeChat) return

    const now = new Date()
    const timeStr = now.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    })

    const newMsg = {
      id: Date.now(),
      sender: 'guide',
      text: message,
      time: timeStr
    }

    setConversations(prev =>
      prev.map(conv =>
        conv.id === activeChat.id
          ? {
              ...conv,
              messages: [...conv.messages, newMsg],
              lastMessage: message,
              time: 'Just now',
              unread: 0
            }
          : conv
      )
    )

    setActiveChat(prev => ({
      ...prev,
      messages: [...prev.messages, newMsg]
    }))

    setMessage('')

    // Mock tourist reply after 2s
    setTimeout(() => {
      const reply = {
        id: Date.now() + 1,
        sender: 'tourist',
        text: 'Thank you Rajesh! 🙏',
        time: now.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit'
        })
      }

      setConversations(prev =>
        prev.map(conv =>
          conv.id === activeChat.id
            ? {
                ...conv,
                messages: [...conv.messages, reply],
                lastMessage: reply.text,
                time: 'Just now'
              }
            : conv
        )
      )

      setActiveChat(prev => ({
        ...prev,
        messages: [...prev.messages, reply]
      }))
    }, 2000)
  }

  function openChat(conv) {
    // Mark as read
    setConversations(prev =>
      prev.map(c => (c.id === conv.id ? { ...c, unread: 0 } : c))
    )
    setActiveChat(conv)
  }

  const totalUnread = conversations.reduce((sum, c) => sum + c.unread, 0)

  return (
    <div className="page-fade-in">
      {/* HEADER */}
      <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
        <div>
          <p className="font-garamond text-xs uppercase tracking-widest text-terracotta mb-2">
            ✦ Tourist Messages
          </p>
          <h1 className="font-playfair text-4xl text-charcoal font-bold">
            Live Conversations.
          </h1>
        </div>

        {totalUnread > 0 && (
          <div className="bg-terracotta text-white font-playfair text-base font-bold px-5 py-3 rounded-2xl flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            {totalUnread} unread
          </div>
        )}
      </div>

      {/* MAIN SPLIT LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" style={{ height: '70vh' }}>
        {/* LEFT - Conversation List */}
        <div className="lg:col-span-1 bg-sand rounded-3xl overflow-hidden flex flex-col h-full">
          {/* Header */}
          <div className="px-5 py-4 border-b border-sand flex items-center justify-between">
            <p className="font-playfair text-lg text-charcoal font-bold">
              Messages
            </p>
            <p className="font-garamond text-xs text-charcoal/40">
              {conversations.length} tourists
            </p>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto">
            {conversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => openChat(conv)}
                className={`flex items-start gap-3 px-5 py-4 border-b border-sand/60 last:border-0 cursor-pointer transition-all duration-200 ${
                  activeChat?.id === conv.id ? 'bg-cream' : 'hover:bg-cream/60'
                }`}
              >
                {/* Avatar */}
                <div className="relative shrink-0">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-playfair font-bold text-lg ${conv.avatarBg}`}
                  >
                    {conv.avatar}
                  </div>
                  <div
                    className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-sand ${
                      conv.online ? 'bg-green-500' : 'bg-charcoal/20'
                    }`}
                  />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <p className="font-playfair text-sm text-charcoal font-semibold truncate">
                      {conv.tourist} {conv.country}
                    </p>
                    <p className="font-garamond text-xs text-charcoal/40 shrink-0">
                      {conv.time}
                    </p>
                  </div>
                  <p className="font-garamond text-xs text-charcoal/60 truncate mb-1">
                    {conv.lastMessage}
                  </p>
                  <p className="font-garamond text-xs text-charcoal/40 truncate">
                    📅 {conv.trip}
                  </p>
                </div>

                {/* Unread Badge */}
                {conv.unread > 0 && (
                  <div className="w-5 h-5 rounded-full bg-terracotta text-white font-garamond text-xs flex items-center justify-center shrink-0 mt-1">
                    {conv.unread}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT - Active Chat */}
        <div className="lg:col-span-2 bg-sand rounded-3xl overflow-hidden flex flex-col h-full">
          {!activeChat ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <p className="text-6xl mb-4">💬</p>
              <p className="font-playfair text-2xl text-charcoal font-bold mb-2">
                Select a Conversation
              </p>
              <p className="font-garamond text-base text-charcoal/60 max-w-sm">
                Choose a tourist from the list to view and respond to their messages.
              </p>

              {totalUnread > 0 && (
                <div className="mt-6 bg-terracotta/10 border border-terracotta/20 rounded-2xl px-6 py-4">
                  <p className="font-garamond text-sm text-terracotta">
                    You have {totalUnread} unread messages waiting.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div className="bg-cream px-6 py-4 border-b border-sand flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-11 h-11 rounded-full flex items-center justify-center text-white font-playfair font-bold text-lg ${activeChat.avatarBg}`}
                  >
                    {activeChat.avatar}
                  </div>
                  <div>
                    <p className="font-playfair text-base text-charcoal font-semibold">
                      {activeChat.tourist} {activeChat.country}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {activeChat.online ? (
                        <>
                          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                          <p className="font-garamond text-xs text-green-600">Online now</p>
                        </>
                      ) : (
                        <p className="font-garamond text-xs text-charcoal/40">Offline</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-sand font-garamond text-xs text-charcoal/60 px-4 py-2 rounded-full">
                  📅 {activeChat.trip}
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-5 space-y-3 flex flex-col">
                {activeChat.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender === 'guide' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.sender === 'tourist' && (
                      <div className="flex items-end gap-2">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-white font-garamond text-xs font-bold shrink-0 ${activeChat.avatarBg}`}
                        >
                          {activeChat.avatar}
                        </div>
                        <div className="bg-cream border border-sand rounded-2xl rounded-bl-sm px-4 py-3 max-w-[75%]">
                          <p className="font-garamond text-sm text-charcoal leading-relaxed">
                            {msg.text}
                          </p>
                          <p className="font-garamond text-xs text-charcoal/40 mt-1">
                            {msg.time}
                          </p>
                        </div>
                      </div>
                    )}

                    {msg.sender === 'guide' && (
                      <div className="bg-deepblue text-white rounded-2xl rounded-br-sm px-4 py-3 max-w-[75%]">
                        <p className="font-garamond text-sm leading-relaxed">
                          {msg.text}
                        </p>
                        <p className="font-garamond text-xs text-white/40 mt-1 text-right">
                          {msg.time}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Chat Input */}
              <div className="bg-cream border-t border-sand px-4 py-4">
                {/* Quick Replies */}
                <div className="flex gap-2 mb-3">
                  {[
                    "I'm on my way! 🚶",
                    "See you at 8 AM ✓",
                    "Namaste! 🙏"
                  ].map((pill) => (
                    <button
                      key={pill}
                      onClick={() => setMessage(pill)}
                      className="bg-sand border border-sand font-garamond text-xs text-charcoal/60 px-3 py-1.5 rounded-full cursor-pointer hover:border-saffron hover:text-saffron transition-all duration-200"
                    >
                      {pill}
                    </button>
                  ))}
                </div>

                {/* Input Row */}
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Reply to tourist..."
                    className="flex-1 bg-sand border border-sand focus:border-saffron focus:outline-none font-garamond text-sm text-charcoal px-4 py-3 rounded-xl transition-colors"
                  />
                  <button
                    onClick={sendMessage}
                    className="w-11 h-11 rounded-full bg-deepblue flex items-center justify-center text-white hover:bg-saffron hover:text-charcoal transition-all duration-300 cursor-pointer shrink-0"
                  >
                    →
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
