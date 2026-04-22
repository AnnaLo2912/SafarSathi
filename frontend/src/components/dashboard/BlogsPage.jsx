import { useEffect, useState } from 'react'
import { useAuth } from  '../../context/AuthContext'
import { auth } from '../../firebase'
import CreateBlog from '../../components/dashboard/CreateBlog'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001'

// ── Template configs ──────────────────────────────────────────
const TEMPLATES = {
  beach: {
    label: '🏖️ Beach Escape',
    gradient: 'from-cyan-400 via-blue-400 to-teal-500',
    bg:       'bg-gradient-to-br from-cyan-50 to-blue-50',
    accent:   'text-cyan-600',
    border:   'border-cyan-200',
    badge:    'bg-cyan-100 text-cyan-700',
    pattern:  '〰️',
  },
  mountains: {
    label: '🏔️ Mountain Trek',
    gradient: 'from-slate-600 via-gray-700 to-stone-800',
    bg:       'bg-gradient-to-br from-slate-50 to-gray-100',
    accent:   'text-slate-700',
    border:   'border-slate-300',
    badge:    'bg-slate-100 text-slate-700',
    pattern:  '▲',
  },
  heritage: {
    label: '🏛️ Heritage Trail',
    gradient: 'from-amber-700 via-yellow-800 to-orange-900',
    bg:       'bg-gradient-to-br from-amber-50 to-yellow-50',
    accent:   'text-amber-800',
    border:   'border-amber-200',
    badge:    'bg-amber-100 text-amber-800',
    pattern:  '✦',
  },
  adventure: {
    label: '🧗 Adventure Rush',
    gradient: 'from-orange-500 via-red-500 to-rose-600',
    bg:       'bg-gradient-to-br from-orange-50 to-red-50',
    accent:   'text-orange-700',
    border:   'border-orange-200',
    badge:    'bg-orange-100 text-orange-700',
    pattern:  '⚡',
  },
  food: {
    label: '🍜 Food Journey',
    gradient: 'from-yellow-500 via-orange-400 to-amber-500',
    bg:       'bg-gradient-to-br from-yellow-50 to-orange-50',
    accent:   'text-yellow-700',
    border:   'border-yellow-200',
    badge:    'bg-yellow-100 text-yellow-800',
    pattern:  '◆',
  },
}

// ── Blog Card ─────────────────────────────────────────────────
function BlogCard({ blog, currentUid, onLike }) {
  const t       = TEMPLATES[blog.holidayType] || TEMPLATES.heritage
  const liked   = currentUid && blog.likes?.includes(currentUid)
  const stars   = '⭐'.repeat(blog.rating || 5)

  return (
    <div className={`rounded-3xl overflow-hidden border ${t.border} ${t.bg} shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col`}>
      {/* Hero image or gradient header */}
      <div className={`relative h-48 bg-gradient-to-br ${t.gradient} overflow-hidden`}>
        {blog.coverImage ? (
          <img src={blog.coverImage} alt={blog.title} className="w-full h-full object-cover opacity-80" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl opacity-20 font-bold text-white">
            {t.pattern}
          </div>
        )}
        {/* Type badge */}
        <div className="absolute top-3 left-3">
          <span className={`font-garamond text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full backdrop-blur-sm bg-white/80 ${t.accent}`}>
            {t.label}
          </span>
        </div>
        {/* Rating */}
        <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-sm px-2 py-1 rounded-full">
          <span className="text-xs">{stars}</span>
        </div>
        {/* Destination overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
          <h3 className="font-playfair text-xl text-white font-bold leading-tight">{blog.title}</h3>
          <p className="font-garamond text-sm text-white/80">📍 {blog.destination}</p>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        {/* Meta */}
        <div className="flex items-center gap-3 mb-3 flex-wrap">
          {blog.duration && (
            <span className={`font-garamond text-xs px-2.5 py-1 rounded-full ${t.badge}`}>📅 {blog.duration}</span>
          )}
          {blog.travelDate && (
            <span className={`font-garamond text-xs px-2.5 py-1 rounded-full ${t.badge}`}>🗓 {blog.travelDate}</span>
          )}
          {blog.budget && (
            <span className={`font-garamond text-xs px-2.5 py-1 rounded-full ${t.badge}`}>💰 {blog.budget}</span>
          )}
        </div>

        {/* Story preview */}
        <p className="font-garamond text-sm text-charcoal/70 leading-relaxed line-clamp-3 mb-4 flex-1">
          {blog.story}
        </p>

        {/* Highlights */}
        {blog.highlights?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {blog.highlights.slice(0, 3).map((h, i) => (
              <span key={i} className={`font-garamond text-xs px-2.5 py-1 rounded-full border ${t.border} ${t.accent}`}>
                {t.pattern} {h}
              </span>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-charcoal/10">
          <div className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold bg-gradient-to-br ${t.gradient}`}>
              {blog.authorName?.[0]?.toUpperCase()}
            </div>
            <div>
              <p className="font-playfair text-xs text-charcoal font-semibold">{blog.authorName}</p>
              <p className="font-garamond text-xs text-charcoal/40">
                {new Date(blog.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            </div>
          </div>

          {/* Like button */}
          <button
            onClick={() => onLike(blog._id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-garamond text-sm font-semibold transition-all duration-200 ${
              liked
                ? 'bg-red-100 text-red-500 border border-red-200'
                : 'bg-white border border-charcoal/10 text-charcoal/50 hover:border-red-200 hover:text-red-400'
            }`}
          >
            <span className={`text-base transition-transform duration-200 ${liked ? 'scale-125' : ''}`}>
              {liked ? '❤️' : '🤍'}
            </span>
            <span>{blog.likeCount || 0}</span>
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Full Blog View Modal ──────────────────────────────────────
function BlogModal({ blog, onClose, currentUid, onLike }) {
  if (!blog) return null
  const t     = TEMPLATES[blog.holidayType] || TEMPLATES.heritage
  const liked = currentUid && blog.likes?.includes(currentUid)

  return (
    <div className="fixed inset-0 z-50 bg-black/60 overflow-y-auto">
      <div className="min-h-screen px-4 py-8 flex items-start justify-center">
        <div className={`w-full max-w-3xl rounded-3xl overflow-hidden ${t.bg} border ${t.border} shadow-2xl`}>

          {/* Hero */}
          <div className={`relative h-64 bg-gradient-to-br ${t.gradient}`}>
            {blog.coverImage && (
              <img src={blog.coverImage} alt={blog.title} className="w-full h-full object-cover opacity-70" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            <button onClick={onClose}
              className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full font-garamond text-sm hover:bg-white/30 transition-all">
              ✕ Close
            </button>
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <span className={`font-garamond text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full bg-white/80 ${t.accent} mb-3 inline-block`}>
                {t.label}
              </span>
              <h2 className="font-playfair text-3xl text-white font-bold">{blog.title}</h2>
              <p className="font-garamond text-white/80 mt-1">📍 {blog.destination}</p>
            </div>
          </div>

          <div className="p-8">
            {/* Meta pills */}
            <div className="flex flex-wrap gap-2 mb-6">
              {blog.duration   && <span className={`font-garamond text-sm px-3 py-1.5 rounded-full ${t.badge}`}>📅 {blog.duration}</span>}
              {blog.travelDate && <span className={`font-garamond text-sm px-3 py-1.5 rounded-full ${t.badge}`}>🗓 {blog.travelDate}</span>}
              {blog.budget     && <span className={`font-garamond text-sm px-3 py-1.5 rounded-full ${t.badge}`}>💰 {blog.budget}</span>}
              <span className={`font-garamond text-sm px-3 py-1.5 rounded-full ${t.badge}`}>{'⭐'.repeat(blog.rating || 5)}</span>
            </div>

            {/* Story */}
            <div className="mb-6">
              <h3 className={`font-playfair text-xl font-bold mb-3 ${t.accent}`}>The Story</h3>
              <p className="font-garamond text-base text-charcoal/80 leading-relaxed whitespace-pre-line">{blog.story}</p>
            </div>

            {/* Highlights */}
            {blog.highlights?.length > 0 && (
              <div className="mb-6">
                <h3 className={`font-playfair text-xl font-bold mb-3 ${t.accent}`}>{t.pattern} Highlights</h3>
                <div className="space-y-2">
                  {blog.highlights.map((h, i) => (
                    <div key={i} className="flex items-start gap-3 font-garamond text-base text-charcoal/70">
                      <span className={t.accent}>{t.pattern}</span> {h}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tips */}
            {blog.tips?.length > 0 && (
              <div className="mb-6">
                <h3 className={`font-playfair text-xl font-bold mb-3 ${t.accent}`}>💡 Travel Tips</h3>
                <div className="space-y-2">
                  {blog.tips.map((tip, i) => (
                    <div key={i} className="flex items-start gap-3 font-garamond text-base text-charcoal/70">
                      <span className="text-saffron">→</span> {tip}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Author + Like */}
            <div className={`flex items-center justify-between pt-5 border-t ${t.border}`}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold bg-gradient-to-br ${t.gradient}`}>
                  {blog.authorName?.[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="font-playfair text-base text-charcoal font-semibold">{blog.authorName}</p>
                  <p className="font-garamond text-xs text-charcoal/40">
                    {new Date(blog.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
              </div>
              <button onClick={() => onLike(blog._id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-garamond text-base font-semibold transition-all duration-200 ${
                  liked ? 'bg-red-100 text-red-500 border border-red-200' : `bg-white border ${t.border} ${t.accent} hover:border-red-200`
                }`}>
                <span className="text-xl">{liked ? '❤️' : '🤍'}</span>
                {blog.likeCount || 0} likes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Main BlogsPage ────────────────────────────────────────────
export default function BlogsPage() {
  const { currentUser } = useAuth()
  const [blogs,        setBlogs]        = useState([])
  const [loading,      setLoading]      = useState(true)
  const [filter,       setFilter]       = useState('all')
  const [sort,         setSort]         = useState('newest')
  const [showCreate,   setShowCreate]   = useState(false)
  const [selectedBlog, setSelectedBlog] = useState(null)
  const [error,        setError]        = useState('')

  useEffect(() => { fetchBlogs() }, [filter, sort])

  async function fetchBlogs() {
    try {
      setLoading(true)
      const url = `${BACKEND_URL}/api/blogs?type=${filter}&sort=${sort}&limit=12`
      const res  = await fetch(url)
      const data = await res.json()
      if (data.success) setBlogs(data.blogs)
    } catch (err) {
      setError('Failed to load blogs')
    } finally {
      setLoading(false)
    }
  }

  async function handleLike(blogId) {
    if (!currentUser) { alert('Please login to like posts!'); return }
    try {
      const token = await auth.currentUser.getIdToken()
      const res   = await fetch(`${BACKEND_URL}/api/blogs/${blogId}/like`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.success) {
        setBlogs(prev => prev.map(b =>
          b._id === blogId
            ? { ...b, likeCount: data.likeCount, likes: data.liked
                ? [...(b.likes || []), currentUser.uid]
                : (b.likes || []).filter(id => id !== currentUser.uid)
              }
            : b
        ))
        if (selectedBlog?._id === blogId) {
          setSelectedBlog(prev => ({
            ...prev,
            likeCount: data.likeCount,
            likes: data.liked
              ? [...(prev.likes || []), currentUser.uid]
              : (prev.likes || []).filter(id => id !== currentUser.uid),
          }))
        }
      }
    } catch { /* silent */ }
  }

  function handleBlogCreated() {
    setShowCreate(false)
    fetchBlogs()
  }

  return (
    <div className="py-8">
      {/* Modals */}
      {showCreate   && <CreateBlog onClose={() => setShowCreate(false)} onCreated={handleBlogCreated} />}
      {selectedBlog && <BlogModal blog={selectedBlog} onClose={() => setSelectedBlog(null)} currentUid={currentUser?.uid} onLike={handleLike} />}

      {/* Header */}
      <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
        <div>
          <p className="font-garamond text-xs uppercase tracking-widest text-terracotta mb-1">✦ Community Stories</p>
          <h1 className="font-playfair text-4xl text-charcoal font-bold">Travel Blogs</h1>
          <p className="font-garamond text-base text-charcoal/60 mt-1">Real experiences from real travellers</p>
        </div>
        {currentUser && (
          <button onClick={() => setShowCreate(true)}
            className="bg-charcoal text-cream font-garamond text-sm uppercase tracking-widest px-6 py-3 rounded-2xl hover:bg-saffron hover:text-charcoal transition-all duration-300">
            ✦ Share Your Story
          </button>
        )}
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3 mb-8">
        {/* Type filters */}
        <div className="flex gap-2 flex-wrap">
          {[
            { key: 'all',       label: '🌏 All'            },
            { key: 'beach',     label: '🏖️ Beach'          },
            { key: 'mountains', label: '🏔️ Mountains'      },
            { key: 'heritage',  label: '🏛️ Heritage'       },
            { key: 'adventure', label: '🧗 Adventure'      },
            { key: 'food',      label: '🍜 Food'           },
          ].map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              className={`font-garamond text-sm px-4 py-2 rounded-full transition-all duration-200 ${
                filter === f.key ? 'bg-charcoal text-cream' : 'bg-sand text-charcoal/70 hover:bg-charcoal/10'
              }`}>
              {f.label}
            </button>
          ))}
        </div>

        <div className="ml-auto flex gap-2">
          {[{ key: 'newest', label: '🕐 Newest' }, { key: 'popular', label: '🔥 Popular' }].map(s => (
            <button key={s.key} onClick={() => setSort(s.key)}
              className={`font-garamond text-sm px-4 py-2 rounded-full transition-all duration-200 ${
                sort === s.key ? 'bg-saffron text-charcoal' : 'bg-sand text-charcoal/70 hover:bg-saffron/30'
              }`}>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && <p className="text-red-500 font-garamond mb-4">{error}</p>}

      {/* Loading */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-sand rounded-3xl h-80 animate-pulse" />
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && blogs.length === 0 && (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">📖</div>
          <h3 className="font-playfair text-2xl text-charcoal font-bold mb-2">No blogs yet</h3>
          <p className="font-garamond text-charcoal/60 mb-6">Be the first to share your travel story!</p>
          {currentUser && (
            <button onClick={() => setShowCreate(true)}
              className="bg-saffron text-charcoal font-garamond text-sm uppercase tracking-widest px-6 py-3 rounded-2xl hover:bg-amber-400 transition-all">
              ✦ Write First Blog
            </button>
          )}
        </div>
      )}

      {/* Blog grid */}
      {!loading && blogs.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogs.map(blog => (
            <div key={blog._id} onClick={() => setSelectedBlog(blog)} className="cursor-pointer">
              <BlogCard
                blog={blog}
                currentUid={currentUser?.uid}
                onLike={(id) => { handleLike(id) }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Login nudge */}
      {!currentUser && (
        <div className="mt-12 bg-sand rounded-3xl p-8 text-center">
          <p className="font-playfair text-xl text-charcoal font-bold mb-2">Have a travel story?</p>
          <p className="font-garamond text-charcoal/60 mb-4">Login to share your experience with the SafarSathi community</p>
          <a href="/login" className="bg-charcoal text-cream font-garamond text-sm uppercase tracking-widest px-6 py-3 rounded-2xl hover:bg-saffron hover:text-charcoal transition-all">
            Login to Post
          </a>
        </div>
      )}
    </div>
  )
}