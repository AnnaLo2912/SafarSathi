import { useEffect, useRef, useState } from 'react'
import {
  collection, addDoc, onSnapshot, writeBatch, getDocs,
  orderBy, query, serverTimestamp, doc, setDoc
} from 'firebase/firestore'
import { db } from '../../firebase'
import { useAuth } from '../../context/AuthContext'
import { getBookings } from '../../services/bookingService'

// ── Helpers ───────────────────────────────────────────────────
function formatTime(ts) {
  if (!ts) return ''
  const d = ts.toDate ? ts.toDate() : new Date(ts)
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function formatDate(ts) {
  if (!ts) return ''
  const d = ts.toDate ? ts.toDate() : new Date(ts)
  const today = new Date()
  const diff  = Math.floor((today - d) / 86400000)
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Yesterday'
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

const COLORS = ['bg-saffron', 'bg-deepblue', 'bg-terracotta', 'bg-charcoal']
function avatarColor(str = '') {
  let h = 0
  for (const c of str) h = (h * 31 + c.charCodeAt(0)) % COLORS.length
  return COLORS[h]
}

// Deduplicate bookings — keep only one per unique other-person

// ── Message Bubble ────────────────────────────────────────────
function Bubble({ msg, isMine, avatarLetter, avatarBg, showAvatar }) {
  return (
    <div className={`flex items-end gap-2 mb-1 ${isMine ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar — only show for first message in a group */}
      <div className="w-7 shrink-0">
        {!isMine && showAvatar && (
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white font-playfair text-xs font-bold ${avatarBg}`}>
            {avatarLetter}
          </div>
        )}
      </div>

      <div className={`flex flex-col ${isMine ? 'items-end' : 'items-start'} max-w-[65%]`}>
        <div className={`px-4 py-2.5 rounded-2xl text-sm font-garamond leading-relaxed ${
          isMine
            ? 'bg-charcoal text-white rounded-br-none'
            : 'bg-white text-charcoal shadow-sm border border-sand/60 rounded-bl-none'
        }`}>
          {msg.text}
        </div>
        <span className="font-garamond text-xs text-charcoal/35 mt-1 px-1">
          {formatTime(msg.createdAt)}
          {isMine && <span className="ml-1 text-charcoal/25">✓✓</span>}
        </span>
      </div>
    </div>
  )
}

// ── Date Divider ──────────────────────────────────────────────
function DateDivider({ label }) {
  return (
    <div className="flex items-center gap-3 my-4">
      <div className="flex-1 h-px bg-sand" />
      <span className="font-garamond text-xs text-charcoal/40 bg-cream px-3 py-1 rounded-full border border-sand">
        {label}
      </span>
      <div className="flex-1 h-px bg-sand" />
    </div>
  )
}

// ── Conversation List Item ────────────────────────────────────
function ConvItem({ booking, active, onClick, unread, isGuide, lastMsg }) {
  const other = isGuide ? booking.touristName : booking.guideName
  const color  = avatarColor(other)

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3.5 transition-all duration-150 text-left border-b border-sand/40 last:border-0 ${
        active
          ? 'bg-charcoal/5 border-l-4 border-l-charcoal'
          : 'hover:bg-cream/80 border-l-4 border-l-transparent'
      }`}
    >
      {/* Avatar with online dot */}
      <div className="relative shrink-0">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-playfair font-bold text-lg shadow-sm ${color}`}>
          {other?.[0]?.toUpperCase()}
        </div>
        <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-white" />
        {unread > 0 && (
          <div className="absolute -top-1 -right-1 min-w-[20px] h-5 rounded-full bg-terracotta text-white font-garamond text-xs flex items-center justify-center px-1">
            {unread}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <p className={`font-playfair text-sm truncate ${active ? 'text-charcoal font-bold' : 'text-charcoal font-semibold'}`}>
            {other}
          </p>
          {lastMsg && (
            <span className="font-garamond text-xs text-charcoal/35 shrink-0 ml-2">
              {formatTime(lastMsg.createdAt)}
            </span>
          )}
        </div>
        <p className="font-garamond text-xs text-charcoal/50 truncate">
          {lastMsg ? lastMsg.text : `📍 ${booking.location} · ${booking.date}`}
        </p>
      </div>
    </button>
  )
}

// ── Main ──────────────────────────────────────────────────────
export default function ChatPanel({ isGuide = true, onUnreadChange }) {
  const { currentUser, userProfile } = useAuth()
  const [allBookings,   setAllBookings]   = useState([])
  const [activeBooking, setActiveBooking] = useState(null)
  const [messages,      setMessages]      = useState([])
  const [lastMsgMap,    setLastMsgMap]    = useState({})
  const [text,          setText]          = useState('')
  const [sending,       setSending]       = useState(false)
  const [unreadMap,     setUnreadMap]     = useState({})
  const [loadingChats,  setLoadingChats]  = useState(true)
  const messagesEndRef  = useRef(null)
  const inputRef        = useRef(null)
  const unsubRef        = useRef(null)

  // Load confirmed bookings — each booking = separate chat
  useEffect(() => {
    async function load() {
      try {
        setLoadingChats(true)
        const role = isGuide ? 'guide' : 'tourist'
        const data = await getBookings(role)
        const confirmed = (data.bookings || []).filter(b => b.status === 'confirmed')
        setAllBookings(confirmed)
      } catch (err) {
        console.error('Chat load error:', err)
      } finally {
        setLoadingChats(false)
      }
    }
    load()
  }, [isGuide])

  // Each booking is its own chat — no dedup
  const bookings = allBookings

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const allUnsubsRef = useRef({}) // background listeners for ALL chats

  // Background listeners for ALL confirmed bookings — tracks unread without opening
  useEffect(() => {
    if (!currentUser || allBookings.length === 0) return

    // Clean up old listeners
    Object.values(allUnsubsRef.current).forEach(fn => fn())
    allUnsubsRef.current = {}

    allBookings.forEach(booking => {
      const chatId  = booking._id
      const msgsRef = collection(db, 'chats', chatId, 'messages')
      const q       = query(msgsRef, orderBy('createdAt', 'asc'))

      const unsub = onSnapshot(q, snap => {
        const msgs = snap.docs.map(d => ({ id: d.id, ...d.data() }))

        // Track last message for sidebar preview
        if (msgs.length > 0) {
          setLastMsgMap(prev => ({ ...prev, [chatId]: msgs[msgs.length - 1] }))
        }

        // Unread = from other person, not in readBy
        const unread = msgs.filter(m =>
          m.senderId !== currentUser?.uid &&
          !(m.readBy || []).includes(currentUser?.uid)
        ).length
        setUnreadMap(prev => ({ ...prev, [chatId]: unread }))
      })

      allUnsubsRef.current[chatId] = unsub
    })

    return () => {
      Object.values(allUnsubsRef.current).forEach(fn => fn())
      allUnsubsRef.current = {}
    }
  }, [allBookings, currentUser])

  // Mark messages as read when a chat is opened
  async function markAsRead(chatId) {
    if (!currentUser) return
    try {
      const msgsRef = collection(db, 'chats', chatId, 'messages')
      const q       = query(msgsRef, orderBy('createdAt', 'asc'))
      const snap    = await getDocs(q)
      const batch   = writeBatch(db)
      let   changed = false
      snap.docs.forEach(d => {
        const data = d.data()
        if (data.senderId !== currentUser.uid && !(data.readBy || []).includes(currentUser.uid)) {
          batch.update(d.ref, { readBy: [...(data.readBy || []), currentUser.uid] })
          changed = true
        }
      })
      if (changed) await batch.commit()
      // Immediately clear unread count in UI
      setUnreadMap(prev => ({ ...prev, [chatId]: 0 }))
    } catch (err) {
      console.error('markAsRead error:', err)
    }
  }

  // Subscribe to active chat messages (for rendering only — no read marking here)
  useEffect(() => {
    if (unsubRef.current) { unsubRef.current(); unsubRef.current = null }
    if (!activeBooking) { setMessages([]); return }

    const chatId  = activeBooking._id
    const msgsRef = collection(db, 'chats', chatId, 'messages')
    const q       = query(msgsRef, orderBy('createdAt', 'asc'))

    setDoc(doc(db, 'chats', chatId), {
      bookingId:   chatId,
      touristId:   activeBooking.tourist_id,
      guideId:     activeBooking.guide_id,
      touristName: activeBooking.touristName,
      guideName:   activeBooking.guideName,
      location:    activeBooking.location,
      date:        activeBooking.date,
    }, { merge: true })

    // Just render messages — unread tracking handled by background listeners
    unsubRef.current = onSnapshot(q, snap => {
      const msgs = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      setMessages(msgs)
    })

    return () => { if (unsubRef.current) unsubRef.current() }
  }, [activeBooking, currentUser])

  async function sendMessage() {
    if (!text.trim() || !activeBooking || sending) return
    setSending(true)
    try {
      const chatId  = activeBooking._id
      const msgsRef = collection(db, 'chats', chatId, 'messages')
      await addDoc(msgsRef, {
        text:       text.trim(),
        senderId:   currentUser.uid,
        senderName: userProfile?.name || 'User',
        senderRole: isGuide ? 'guide' : 'tourist',
        createdAt:  serverTimestamp(),
      })
      setText('')
      inputRef.current?.focus()
    } catch (err) {
      console.error('Send error:', err)
    } finally {
      setSending(false)
    }
  }

  // Group messages by date and sender for cleaner rendering
  function groupMessages(msgs) {
    const groups = []
    let lastDate  = null
    let lastSender = null

    msgs.forEach((msg, i) => {
      const d    = msg.createdAt?.toDate ? msg.createdAt.toDate() : new Date()
      const date = d.toDateString()

      if (date !== lastDate) {
        groups.push({ type: 'date', label: formatDate(msg.createdAt), id: `date-${i}` })
        lastDate   = date
        lastSender = null
      }

      const showAvatar = msg.senderId !== currentUser?.uid && msg.senderId !== lastSender
      groups.push({ type: 'msg', msg, showAvatar, id: msg.id })
      lastSender = msg.senderId
    })

    return groups
  }

  const totalUnread = Object.values(unreadMap).reduce((a, b) => a + b, 0)

  // Notify parent dashboard of unread count for sidebar badge
  useEffect(() => {
    onUnreadChange?.(totalUnread)
  }, [totalUnread])
  const other       = activeBooking ? (isGuide ? activeBooking.touristName : activeBooking.guideName) : null
  const otherColor  = avatarColor(other || '')
  const grouped     = groupMessages(messages)

  const QUICK_REPLIES = [
    "I'm on my way! 🚶",
    "See you at 8 AM ✓",
    "Namaste! 🙏",
    "Running 5 min late 🙏",
  ]

  return (
    <div>
      {/* Page header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <p className="font-garamond text-xs uppercase tracking-widest text-terracotta mb-1">
            ✦ {isGuide ? 'Tourist Messages' : 'Guide Messages'}
          </p>
          <h1 className="font-playfair text-3xl text-charcoal font-bold">Live Conversations</h1>
        </div>
        {totalUnread > 0 && (
          <div className="bg-terracotta text-white font-garamond text-sm font-semibold px-4 py-2 rounded-full flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            {totalUnread} unread
          </div>
        )}
      </div>

      {/* Chat layout */}
      <div
        className="bg-white rounded-3xl shadow-sm border border-sand/60 overflow-hidden flex"
        style={{ height: '75vh' }}
      >
        {/* ── Sidebar ── */}
        <div className="w-80 shrink-0 border-r border-sand/60 flex flex-col bg-cream/40">
          {/* Sidebar header */}
          <div className="px-5 py-4 border-b border-sand/60 bg-white">
            <div className="flex items-center justify-between">
              <p className="font-playfair text-base text-charcoal font-bold">Chats</p>
              <span className="bg-sand font-garamond text-xs text-charcoal/50 px-3 py-1 rounded-full">
                {bookings.length} active
              </span>
            </div>
          </div>

          {/* Conversation list */}
          <div className="flex-1 overflow-y-auto">
            {loadingChats && (
              <div className="p-8 text-center">
                <div className="w-8 h-8 border-2 border-charcoal/20 border-t-charcoal rounded-full animate-spin mx-auto mb-3" />
                <p className="font-garamond text-sm text-charcoal/40">Loading chats...</p>
              </div>
            )}

            {!loadingChats && bookings.length === 0 && (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-sand rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
                  💬
                </div>
                <p className="font-playfair text-base text-charcoal font-semibold mb-1">No chats yet</p>
                <p className="font-garamond text-xs text-charcoal/50 leading-relaxed">
                  Chats open once a booking is confirmed.
                </p>
              </div>
            )}

            {bookings.map(b => (
              <ConvItem
                key={b._id}
                booking={b}
                active={activeBooking?._id === b._id}
                unread={unreadMap[b._id] || 0}
                isGuide={isGuide}
                lastMsg={lastMsgMap[b._id] || null}
                onClick={() => {
                  setActiveBooking(b)
                  markAsRead(b._id) // mark as read on open
                }}
              />
            ))}
          </div>
        </div>

        {/* ── Chat window ── */}
        <div className="flex-1 flex flex-col min-w-0">
          {!activeBooking ? (
            <div className="flex-1 flex flex-col items-center justify-center p-10 text-center bg-cream/20">
              <div className="w-20 h-20 bg-sand rounded-full flex items-center justify-center text-4xl mb-6 shadow-inner">
                💬
              </div>
              <p className="font-playfair text-xl text-charcoal font-bold mb-2">
                Select a conversation
              </p>
              <p className="font-garamond text-sm text-charcoal/50 max-w-xs leading-relaxed">
                Choose a chat from the left to start messaging in real time.
              </p>
            </div>
          ) : (
            <>
              {/* Chat header */}
              <div className="px-6 py-4 bg-white border-b border-sand/60 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-playfair font-bold ${otherColor}`}>
                    {other?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="font-playfair text-base text-charcoal font-bold leading-tight">{other}</p>
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                      <p className="font-garamond text-xs text-green-600">Online · Real-time</p>
                    </div>
                  </div>
                </div>

                {/* Trip info pill */}
                <div className="bg-sand rounded-full px-4 py-1.5 flex items-center gap-2">
                  <span className="text-sm">📅</span>
                  <div className="text-right">
                    <p className="font-garamond text-xs text-charcoal/70 font-semibold">{activeBooking.location}</p>
                    <p className="font-garamond text-xs text-charcoal/40">{activeBooking.date}</p>
                  </div>
                </div>
              </div>

              {/* Messages area */}
              <div className="flex-1 overflow-y-auto px-6 py-5 bg-cream/20">
                {messages.length === 0 && (
                  <div className="text-center mt-16">
                    <div className="text-5xl mb-3">👋</div>
                    <p className="font-playfair text-base text-charcoal font-semibold mb-1">Start the conversation</p>
                    <p className="font-garamond text-sm text-charcoal/40">Say hello to get started!</p>
                  </div>
                )}

                {grouped.map(item =>
                  item.type === 'date' ? (
                    <DateDivider key={item.id} label={item.label} />
                  ) : (
                    <Bubble
                      key={item.id}
                      msg={item.msg}
                      isMine={item.msg.senderId === currentUser?.uid}
                      showAvatar={item.showAvatar}
                      avatarLetter={other?.[0]?.toUpperCase()}
                      avatarBg={otherColor}
                    />
                  )
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input area */}
              <div className="bg-white border-t border-sand/60 px-5 py-4 shrink-0">
                {/* Quick replies */}
                <div className="flex gap-2 mb-3 overflow-x-auto pb-1 scrollbar-hide">
                  {QUICK_REPLIES.map(pill => (
                    <button
                      key={pill}
                      onClick={() => { setText(pill); inputRef.current?.focus() }}
                      className="shrink-0 bg-sand border border-sand/60 font-garamond text-xs text-charcoal/60 px-3 py-1.5 rounded-full hover:border-charcoal/30 hover:text-charcoal hover:bg-cream transition-all duration-150"
                    >
                      {pill}
                    </button>
                  ))}
                </div>

                {/* Input row */}
                <div className="flex items-center gap-3 bg-sand rounded-2xl px-4 py-2 border border-sand/60 focus-within:border-charcoal/30 transition-colors">
                  <input
                    ref={inputRef}
                    type="text"
                    value={text}
                    onChange={e => setText(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                    placeholder="Type a message..."
                    className="flex-1 bg-transparent font-garamond text-sm text-charcoal placeholder:text-charcoal/35 outline-none"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={sending || !text.trim()}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm transition-all duration-200 shrink-0 ${
                      text.trim()
                        ? 'bg-charcoal text-white hover:bg-saffron hover:text-charcoal'
                        : 'bg-sand/60 text-charcoal/25 cursor-not-allowed'
                    }`}
                  >
                    {sending ? (
                      <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    ) : '→'}
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