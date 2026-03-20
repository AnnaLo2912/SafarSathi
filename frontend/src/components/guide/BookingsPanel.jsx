import { useMemo, useState } from 'react'
import {
  FiCalendar,
  FiChevronLeft,
  FiChevronRight,
  FiClock,
  FiMapPin,
  FiMessageCircle,
  FiPhone,
  FiSearch,
  FiNavigation,
  FiList,
  FiGrid,
} from 'react-icons/fi'

const bookings = [
  {
    id: 1,
    tourist: 'Sarah Mitchell',
    country: 'USA',
    location: 'Amber Fort, Jaipur',
    dateLabel: 'Today',
    time: '7:30 AM',
    duration: 'Full Day',
    price: 'INR 2,000',
    status: 'confirmed',
    dayGroup: 'today',
  },
  {
    id: 2,
    tourist: 'James Whitfield',
    country: 'UK',
    location: 'City Palace + Hawa Mahal',
    dateLabel: 'Tomorrow',
    time: '9:00 AM',
    duration: 'Half Day',
    price: 'INR 1,200',
    status: 'confirmed',
    dayGroup: 'tomorrow',
  },
  {
    id: 3,
    tourist: 'Yuki Tanaka',
    country: 'Japan',
    location: 'Nahargarh Fort + Bazaar',
    dateLabel: 'Mar 22',
    time: '8:00 AM',
    duration: 'Full Day',
    price: 'INR 2,000',
    status: 'pending',
    dayGroup: 'upcoming',
  },
  {
    id: 4,
    tourist: 'Mila Petrova',
    country: 'Bulgaria',
    location: 'Jal Mahal + Old Market Walk',
    dateLabel: 'Mar 24',
    time: '10:30 AM',
    duration: '2 Hours',
    price: 'INR 900',
    status: 'completed',
    dayGroup: 'upcoming',
  },
]

const statusPillClasses = {
  confirmed: 'bg-green-100 text-green-700',
  pending: 'bg-amber-100 text-amber-700',
  completed: 'bg-gray-100 text-gray-600',
}

const daySections = [
  { key: 'today', title: 'TODAY' },
  { key: 'tomorrow', title: 'TOMORROW' },
  { key: 'upcoming', title: 'UPCOMING' },
]

export default function BookingsPanel() {
  const [searchValue, setSearchValue] = useState('')
  const [dateFilter, setDateFilter] = useState('this-week')
  const [statusFilter, setStatusFilter] = useState('all')
  const [viewMode, setViewMode] = useState('list')
  const today = new Date()
  const [calendarMonth, setCalendarMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  )

  const dateFilterOptions = [
    { key: 'today', label: 'Today' },
    { key: 'tomorrow', label: 'Tomorrow' },
    { key: 'this-week', label: 'This Week' },
  ]

  const statusFilterOptions = [
    { key: 'all', label: 'All' },
    { key: 'confirmed', label: 'Confirmed' },
    { key: 'pending', label: 'Pending' },
    { key: 'completed', label: 'Completed' },
  ]

  const visibleBookings = useMemo(() => {
    return bookings.filter((booking) => {
      const matchesSearch =
        booking.tourist.toLowerCase().includes(searchValue.toLowerCase()) ||
        booking.country.toLowerCase().includes(searchValue.toLowerCase())

      const matchesDate =
        dateFilter === 'this-week' ? true : booking.dayGroup === dateFilter

      const matchesStatus =
        statusFilter === 'all' ? true : booking.status === statusFilter

      return matchesSearch && matchesDate && matchesStatus
    })
  }, [dateFilter, searchValue, statusFilter])

  const groupedBookings = useMemo(() => {
    return daySections.map((section) => ({
      ...section,
      items: visibleBookings.filter((booking) => booking.dayGroup === section.key),
    }))
  }, [visibleBookings])

  const calendarBookingsByDate = useMemo(() => {
    const monthMap = {
      jan: 0,
      feb: 1,
      mar: 2,
      apr: 3,
      may: 4,
      jun: 5,
      jul: 6,
      aug: 7,
      sep: 8,
      oct: 9,
      nov: 10,
      dec: 11,
    }

    const normalizeBookingDate = (booking) => {
      const base = new Date(today.getFullYear(), today.getMonth(), today.getDate())

      if (booking.dateLabel.toLowerCase() === 'today') {
        return base
      }

      if (booking.dateLabel.toLowerCase() === 'tomorrow') {
        const next = new Date(base)
        next.setDate(base.getDate() + 1)
        return next
      }

      const shortDateMatch = booking.dateLabel.match(/^([A-Za-z]{3})\s+(\d{1,2})$/)
      if (shortDateMatch) {
        const monthShort = shortDateMatch[1].toLowerCase()
        const dayNumber = Number(shortDateMatch[2])
        const monthIndex = monthMap[monthShort]
        if (monthIndex !== undefined) {
          return new Date(base.getFullYear(), monthIndex, dayNumber)
        }
      }

      return base
    }

    return visibleBookings.reduce((acc, booking) => {
      const normalizedDate = normalizeBookingDate(booking)
      const key = normalizedDate.toISOString().split('T')[0]
      if (!acc[key]) acc[key] = []
      acc[key].push(booking)
      return acc
    }, {})
  }, [visibleBookings, today])

  const calendarCells = useMemo(() => {
    const year = calendarMonth.getFullYear()
    const month = calendarMonth.getMonth()
    const firstDay = new Date(year, month, 1)
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const mondayOffset = (firstDay.getDay() + 6) % 7

    const cells = []

    for (let i = 0; i < mondayOffset; i += 1) {
      cells.push({ empty: true, key: `empty-start-${i}` })
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      const date = new Date(year, month, day)
      const key = date.toISOString().split('T')[0]
      cells.push({ empty: false, key, date })
    }

    const trailing = (7 - (cells.length % 7)) % 7
    for (let i = 0; i < trailing; i += 1) {
      cells.push({ empty: true, key: `empty-end-${i}` })
    }

    return cells
  }, [calendarMonth])

  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#E6DFD5] rounded-xl p-6 md:p-7 shadow-sm space-y-5">
        <div className="grid grid-cols-[minmax(260px,1fr)_auto_auto] items-center gap-8">
          <div className="relative justify-self-start w-full">
            <FiSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A8B2AE]" />
            <input
              type="text"
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder="Search tourist name"
              className="w-full rounded-full border border-[#E6DFD5] bg-white pl-10 pr-4 py-3 text-sm text-[#2F2F2F] placeholder:text-[#A8B2AE] outline-none focus:border-[#D96C54]"
            />
          </div>

          <div className="flex items-center justify-center gap-3 justify-self-center">
            {dateFilterOptions.map((option) => (
              <button
                key={option.key}
                onClick={() => setDateFilter(option.key)}
                className={`px-4 py-2.5 rounded-lg border text-xs font-garamond uppercase tracking-wide whitespace-nowrap transition-all ${
                  dateFilter === option.key
                    ? 'bg-[#D96C54] border-[#D96C54] text-white'
                    : 'bg-transparent border-[#E6DFD5] text-[#2F2F2F] hover:border-[#D96C54]'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-end gap-3 flex-wrap justify-self-end max-w-[420px]">
            {statusFilterOptions.map((option) => (
              <button
                key={option.key}
                onClick={() => setStatusFilter(option.key)}
                className={`px-4 py-2.5 rounded-lg border text-xs font-garamond uppercase tracking-wide whitespace-nowrap transition-all ${
                  statusFilter === option.key
                    ? 'bg-[#8A9A8A] border-[#8A9A8A] text-white'
                    : 'bg-transparent border-[#E6DFD5] text-[#2F2F2F] hover:border-[#8A9A8A]'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="pt-1 flex items-center gap-2">
          <button
            onClick={() => setViewMode('list')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-sm transition-all ${
              viewMode === 'list'
                ? 'bg-[#A8B2AE] border-[#A8B2AE] text-white'
                : 'bg-white border-[#E6DFD5] text-[#2F2F2F] hover:border-[#A8B2AE]'
            }`}
          >
            <FiList size={16} /> List View
          </button>
          <button
            onClick={() => setViewMode('calendar')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-sm transition-all ${
              viewMode === 'calendar'
                ? 'bg-[#A8B2AE] border-[#A8B2AE] text-white'
                : 'bg-white border-[#E6DFD5] text-[#2F2F2F] hover:border-[#A8B2AE]'
            }`}
          >
            <FiGrid size={16} /> Calendar View
          </button>
        </div>
      </div>

      {viewMode === 'calendar' ? (
        <div className="bg-white border border-[#E8B7A6] rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-playfair text-2xl text-[#2F2F2F] font-semibold">
              {calendarMonth.toLocaleDateString(undefined, {
                month: 'long',
                year: 'numeric',
              })}
            </h3>

            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  setCalendarMonth(
                    new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1)
                  )
                }
                className="w-9 h-9 rounded-lg border border-[#E8B7A6] text-[#2F2F2F] hover:border-[#8A9A8A] transition-colors inline-flex items-center justify-center"
                aria-label="Previous month"
              >
                <FiChevronLeft size={16} />
              </button>
              <button
                onClick={() =>
                  setCalendarMonth(
                    new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1)
                  )
                }
                className="w-9 h-9 rounded-lg border border-[#E8B7A6] text-[#2F2F2F] hover:border-[#8A9A8A] transition-colors inline-flex items-center justify-center"
                aria-label="Next month"
              >
                <FiChevronRight size={16} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 mb-2">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((label) => (
              <div
                key={label}
                className="text-center text-xs font-garamond uppercase tracking-wider text-[#A8B2AE] py-1"
              >
                {label}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {calendarCells.map((cell) => {
              if (cell.empty) {
                return <div key={cell.key} className="min-h-[120px]" />
              }

              const dateKey = cell.key
              const cellBookings = calendarBookingsByDate[dateKey] || []
              const isToday =
                cell.date.getFullYear() === today.getFullYear() &&
                cell.date.getMonth() === today.getMonth() &&
                cell.date.getDate() === today.getDate()

              return (
                <div
                  key={cell.key}
                  className={`min-h-[120px] rounded-xl border p-2.5 transition-colors hover:bg-[#E8B7A6] ${
                    isToday ? 'border-[#8A9A8A] bg-[#E8B7A6]' : 'border-[#A8B2AE] bg-white'
                  }`}
                >
                  <p className="text-xs font-semibold text-[#2F2F2F] mb-2">{cell.date.getDate()}</p>

                  <div className="space-y-1.5">
                    {cellBookings.slice(0, 2).map((booking) => (
                      <div key={booking.id} className="rounded-md bg-[#E8B7A6] px-2 py-1">
                        <p className="text-[10px] text-[#A8B2AE] leading-none">{booking.time}</p>
                        <p className="text-[11px] text-[#2F2F2F] leading-tight truncate">{booking.tourist}</p>
                      </div>
                    ))}

                    {cellBookings.length > 2 && (
                      <p className="text-[11px] text-[#A8B2AE] font-medium">
                        +{cellBookings.length - 2} more
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
          <div className="xl:col-span-2 space-y-6">
            {groupedBookings.map((section) => (
              <div key={section.key} className="space-y-3">
                <h3 className="font-playfair text-2xl text-[#2F2F2F] font-semibold">{section.title}</h3>
                {section.items.length === 0 ? (
                  <div className="bg-white border border-[#F5EFE6] rounded-2xl px-5 py-4 text-sm text-[#A8B2AE]">
                    No bookings in this section.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {section.items.map((booking) => (
                      <article
                        key={booking.id}
                        className="bg-white border border-[#F5EFE6] rounded-2xl p-5 shadow-[0_2px_10px_rgba(47,47,47,0.04)]"
                      >
                        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
                          <div className="space-y-3">
                            <div>
                              <h4 className="font-playfair text-2xl leading-tight text-[#2F2F2F] font-semibold">
                                {booking.tourist}{' '}
                                <span className="font-garamond text-base text-[#A8B2AE]">({booking.country})</span>
                              </h4>
                            </div>

                            <p className="text-[#2F2F2F] text-base flex items-center gap-2">
                              <FiMapPin size={15} className="text-[#A8B2AE]" />
                              {booking.location}
                            </p>

                            <div className="flex flex-wrap items-center gap-4 text-sm text-[#A8B2AE]">
                              <span className="inline-flex items-center gap-2">
                                <FiCalendar size={14} /> {booking.dateLabel}
                              </span>
                              <span className="inline-flex items-center gap-2">
                                <FiClock size={14} /> {booking.time}
                              </span>
                              <span>{booking.duration}</span>
                            </div>
                          </div>

                          <div className="lg:text-right space-y-3 min-w-[180px]">
                            <p className="font-playfair text-3xl text-[#2F2F2F] font-semibold">{booking.price}</p>
                            <span
                              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-garamond uppercase tracking-wide ${statusPillClasses[booking.status]}`}
                            >
                              {booking.status}
                            </span>

                            <div className="flex flex-wrap lg:justify-end gap-2 pt-1">
                              <button className="inline-flex items-center gap-2 rounded-lg bg-[#D96C54] border border-[#D96C54] px-3 py-2 text-white text-sm hover:scale-[1.02] transition-transform">
                                <FiMessageCircle size={15} /> Open Chat
                              </button>
                              <button className="inline-flex items-center gap-2 rounded-lg bg-transparent border border-[#D96C54] px-3 py-2 text-[#D96C54] text-sm hover:scale-[1.02] transition-transform">
                                <FiNavigation size={15} /> View Details
                              </button>
                            </div>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <aside className="bg-white border border-[#F5EFE6] rounded-2xl p-5 shadow-sm sticky top-6">
            <h4 className="font-playfair text-xl text-[#2F2F2F] font-semibold mb-3">Mini Map Preview</h4>
            <div className="h-44 rounded-xl border border-[#F5EFE6] bg-[#F5EFE6] flex items-center justify-center mb-4">
              <p className="text-[#A8B2AE] text-sm">Route Snapshot</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button className="rounded-lg border border-[#D96C54] text-[#D96C54] py-2.5 text-sm hover:bg-[#D96C54] hover:text-white transition-colors">
                Route
              </button>
              <button className="inline-flex items-center justify-center gap-1 rounded-lg border border-[#D96C54] text-[#D96C54] py-2.5 text-sm hover:bg-[#D96C54] hover:text-white transition-colors">
                <FiPhone size={14} /> Call
              </button>
            </div>
          </aside>
        </div>
      )}
    </div>
  )
}
