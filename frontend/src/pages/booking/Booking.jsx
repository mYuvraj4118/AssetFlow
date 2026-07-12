import React, { useState, useEffect } from 'react'
import {
  getAllBookings,
  createBooking,
  rescheduleBooking,
  cancelBooking,
} from '../../services/bookingService'
import NeoCard from '../../components/workflows/NeoCard'
import NeoButton from '../../components/workflows/NeoButton'
import NeoInput from '../../components/workflows/NeoInput'
import StatusBadge from '../../components/workflows/StatusBadge'
import WorkflowModal from '../../components/workflows/WorkflowModal'

// Pre-defined dummy resources and employees for testing
const DUMMY_RESOURCES = [
  { id: '65d12f7b9c8d7e6f0a1b2c51', name: 'Conference Room A (1st Floor)', type: 'Room' },
  { id: '65d12f7b9c8d7e6f0a1b2c52', name: 'Training Lab B (2nd Floor)', type: 'Room' },
  { id: '65d12f7b9c8d7e6f0a1b2c53', name: 'Creative Space C (Penthouse)', type: 'Room' },
  { id: '65d12f7b9c8d7e6f0a1b2c54', name: '4K Portable Projector (Epson-4K)', type: 'Equipment' },
  { id: '65d12f7b9c8d7e6f0a1b2c55', name: 'Company Shuttle Car (Tesla Model Y)', type: 'Vehicle' },
]

const DUMMY_EMPLOYEES = [
  { id: '65d13a1b9c8d7e6f0a1b2c38', name: 'Alice Smith (Engineering)' },
  { id: '65d13b2c9c8d7e6f0a1b2c39', name: 'Bob Jones (Design)' },
  { id: '65d13c3d9c8d7e6f0a1b2c40', name: 'Charlie Brown (Product)' },
  { id: '65d13d4e9c8d7e6f0a1b2c41', name: 'Diana Prince (Operations)' },
  { id: '65d13e5f9c8d7e6f0a1b2c42', name: 'Evan Wright (HR)' },
]

const CURRENT_USER_ID = '65d13f6a9c8d7e6f0a1b2c43' // Mock User

// Helper to get resource name by ID
const getResourceName = (id) => {
  const res = DUMMY_RESOURCES.find((r) => r.id === id)
  return res ? res.name : `Resource (${id.substring(0, 8)}...)`
}

// Helper to get employee name by ID
const getEmployeeName = (id) => {
  const emp = DUMMY_EMPLOYEES.find((e) => e.id === id)
  return emp ? emp.name : `Employee (${id.substring(0, 8)}...)`
}

// Helper to format date string to datetime-local input format (YYYY-MM-DDThh:mm)
const formatToLocalDatetime = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  const pad = (num) => String(num).padStart(2, '0')
  const year = date.getFullYear()
  const month = pad(date.getMonth() + 1)
  const day = pad(date.getDate())
  const hours = pad(date.getHours())
  const minutes = pad(date.getMinutes())
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

export default function Booking() {
  // Main states
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isDemoMode, setIsDemoMode] = useState(false)
  const [toast, setToast] = useState(null)

  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [timelineResourceFilter, setTimelineResourceFilter] = useState('All')

  // Modal Control
  const [isBookOpen, setIsBookOpen] = useState(false)
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false)
  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false)

  // Selected for action
  const [selectedBooking, setSelectedBooking] = useState(null)

  // Forms
  const [bookForm, setBookForm] = useState({
    resource_id: DUMMY_RESOURCES[0].id,
    employee_id: DUMMY_EMPLOYEES[0].id,
    start_time: '',
    end_time: '',
    purpose: '',
  })

  const [rescheduleForm, setRescheduleForm] = useState({
    start_time: '',
    end_time: '',
  })

  // Show Toast Message
  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 4000)
  }

  // Load Bookings from API
  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      const allBookings = await getAllBookings()
      setBookings(allBookings)
      setIsDemoMode(false)
    } catch (err) {
      console.warn('Backend API connection failed, loading local demo data...', err.message)
      loadDemoData()
    } finally {
      setLoading(false)
    }
  }

  // Fallback demo data
  const loadDemoData = () => {
    setIsDemoMode(true)
    // Setup initial mock bookings with dynamic timestamps so they always appear relevant
    const now = new Date()
    const buildTime = (hoursOffset) => {
      const d = new Date(now)
      d.setHours(d.getHours() + hoursOffset)
      d.setMinutes(0)
      d.setSeconds(0)
      d.setMilliseconds(0)
      return d.toISOString()
    }

    const mockBookings = [
      {
        id: '65d160019c8d7e6f0a1b2c56',
        resource_id: '65d12f7b9c8d7e6f0a1b2c51', // Conf Room A
        employee_id: '65d13a1b9c8d7e6f0a1b2c38', // Alice
        start_time: buildTime(2), // In 2 hours
        end_time: buildTime(4),
        purpose: 'FastAPI Backend Core Architecture Sync',
        status: 'Upcoming',
        created_at: new Date().toISOString(),
      },
      {
        id: '65d160029c8d7e6f0a1b2c57',
        resource_id: '65d12f7b9c8d7e6f0a1b2c52', // Training Lab B
        employee_id: '65d13b2c9c8d7e6f0a1b2c39', // Bob
        start_time: buildTime(-1), // Started 1 hour ago
        end_time: buildTime(2), // Ends in 2 hours
        purpose: 'Vite & Tailwind UI System Live Pairing',
        status: 'Ongoing',
        created_at: new Date().toISOString(),
      },
      {
        id: '65d160039c8d7e6f0a1b2c58',
        resource_id: '65d12f7b9c8d7e6f0a1b2c55', // Tesla Model Y
        employee_id: '65d13c3d9c8d7e6f0a1b2c40', // Charlie
        start_time: buildTime(-24), // Yesterday
        end_time: buildTime(-20),
        purpose: 'Offsite hardware vendor evaluation trip.',
        status: 'Completed',
        created_at: new Date().toISOString(),
      },
      {
        id: '65d160049c8d7e6f0a1b2c59',
        resource_id: '65d12f7b9c8d7e6f0a1b2c54', // Epson Projector
        employee_id: '65d13d4e9c8d7e6f0a1b2c41', // Diana
        start_time: buildTime(5),
        end_time: buildTime(8),
        purpose: 'Product launch deck dry run.',
        status: 'Cancelled',
        created_at: new Date().toISOString(),
        cancelled_at: new Date().toISOString(),
      },
    ]

    setBookings(mockBookings)
  }

  useEffect(() => {
    loadData()
  }, [])

  // ==================== OVERLAP UX LOGIC ====================

  // Check if a proposed time range overlaps with any existing booking for that resource
  const checkOverlapConflict = (resourceId, start, end, excludeId = null) => {
    const pStart = new Date(start)
    const pEnd = new Date(end)

    return bookings.find((b) => {
      // Ignore cancelled bookings and different resources
      if (b.status === 'Cancelled' || b.resource_id !== resourceId) return false
      // Exclude self when rescheduling
      if (excludeId && b.id === excludeId) return false

      const bStart = new Date(b.start_time)
      const bEnd = new Date(b.end_time)

      // Overlap formula: start1 < end2 AND end1 > start2
      return bStart < pEnd && bEnd > pStart
    })
  }

  // ==================== ACTIONS ====================

  // 1. Submit New Booking
  const handleCreateBooking = async (e) => {
    e.preventDefault()

    const { resource_id, employee_id, start_time, end_time, purpose } = bookForm

    if (!start_time || !end_time || !purpose.trim()) {
      showToast('All fields are required.', 'danger')
      return
    }

    const start = new Date(start_time)
    const end = new Date(end_time)
    const now = new Date()

    // 1. Basic Date Validation
    if (start <= now) {
      showToast('Booking start time must be in the future.', 'danger')
      return
    }

    if (end <= start) {
      showToast('End time must be strictly after the start time.', 'danger')
      return
    }

    // 2. Client-side Overlap Pre-check
    const conflictingBooking = checkOverlapConflict(resource_id, start_time, end_time)
    if (conflictingBooking) {
      showToast(
        `Time Conflict! Already booked by ${getEmployeeName(conflictingBooking.employee_id)} for: ${new Date(
          conflictingBooking.start_time
        ).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(
          conflictingBooking.end_time
        ).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        'danger'
      )
      return
    }

    const payload = {
      resource_id,
      employee_id,
      start_time: start.toISOString(),
      end_time: end.toISOString(),
      purpose,
    }

    try {
      if (isDemoMode) {
        const newBooking = {
          id: `demo_book_${Date.now()}`,
          ...payload,
          status: 'Upcoming',
          created_at: new Date().toISOString(),
        }
        setBookings([newBooking, ...bookings])
      } else {
        await createBooking(payload)
        await loadData()
      }
      showToast('Resource booked successfully!')
      setIsBookOpen(false)
      // Reset form
      setBookForm({
        resource_id: DUMMY_RESOURCES[0].id,
        employee_id: DUMMY_EMPLOYEES[0].id,
        start_time: '',
        end_time: '',
        purpose: '',
      })
    } catch (err) {
      showToast(err.message, 'danger')
    }
  }

  // 2. Reschedule Booking
  const handleReschedule = async (e) => {
    e.preventDefault()
    if (!selectedBooking) return

    const { start_time, end_time } = rescheduleForm

    if (!start_time || !end_time) {
      showToast('Please select both start and end times.', 'danger')
      return
    }

    const start = new Date(start_time)
    const end = new Date(end_time)
    const now = new Date()

    if (start <= now) {
      showToast('Rescheduled start time must be in the future.', 'danger')
      return
    }

    if (end <= start) {
      showToast('End time must be after start time.', 'danger')
      return
    }

    // Overlap check excluding current booking
    const conflict = checkOverlapConflict(selectedBooking.resource_id, start_time, end_time, selectedBooking.id)
    if (conflict) {
      showToast(
        `Time Conflict! Already booked by ${getEmployeeName(conflict.employee_id)} for: ${new Date(
          conflict.start_time
        ).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(
          conflict.end_time
        ).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        'danger'
      )
      return
    }

    const payload = {
      start_time: start.toISOString(),
      end_time: end.toISOString(),
    }

    try {
      if (isDemoMode) {
        setBookings(
          bookings.map((b) =>
            b.id === selectedBooking.id
              ? {
                  ...b,
                  start_time: payload.start_time,
                  end_time: payload.end_time,
                  updated_at: new Date().toISOString(),
                }
              : b
          )
        )
      } else {
        await rescheduleBooking(selectedBooking.id, payload)
        await loadData()
      }
      showToast('Booking rescheduled successfully!')
      setIsRescheduleOpen(false)
    } catch (err) {
      showToast(err.message, 'danger')
    }
  }

  // 3. Cancel Booking
  const handleCancelBooking = async () => {
    if (!selectedBooking) return

    try {
      if (isDemoMode) {
        setBookings(
          bookings.map((b) =>
            b.id === selectedBooking.id
              ? { ...b, status: 'Cancelled', cancelled_at: new Date().toISOString() }
              : b
          )
        )
      } else {
        await cancelBooking(selectedBooking.id)
        await loadData()
      }
      showToast('Booking cancelled successfully.', 'warning')
      setIsCancelConfirmOpen(false)
    } catch (err) {
      showToast(err.message, 'danger')
    }
  }

  // ==================== SEARCH AND FILTER ====================

  const filteredBookings = bookings.filter((book) => {
    const resourceName = getResourceName(book.resource_id).toLowerCase()
    const employeeName = getEmployeeName(book.employee_id).toLowerCase()
    const purpose = (book.purpose || '').toLowerCase()

    const matchesSearch =
      resourceName.includes(searchQuery.toLowerCase()) ||
      employeeName.includes(searchQuery.toLowerCase()) ||
      purpose.includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === 'All' || book.status === statusFilter

    const matchesResource = timelineResourceFilter === 'All' || book.resource_id === timelineResourceFilter

    return matchesSearch && matchesStatus && matchesResource
  })

  // Get active schedule list for the right sidebar checker
  const [checkerResource, setCheckerResource] = useState(DUMMY_RESOURCES[0].id)
  const resourceSpecificBookings = bookings
    .filter((b) => b.resource_id === checkerResource && b.status !== 'Cancelled')
    .sort((a, b) => new Date(a.start_time) - new Date(b.start_time))

  // ==================== KPI COUNTS ====================

  const countUpcoming = bookings.filter((b) => b.status === 'Upcoming').length
  const countOngoing = bookings.filter((b) => b.status === 'Ongoing').length
  const countCompleted = bookings.filter((b) => b.status === 'Completed').length
  const countCancelled = bookings.filter((b) => b.status === 'Cancelled').length

  return (
    <div className="min-h-screen bg-[#e0e5ec] p-6 md:p-10 font-body relative text-[#3d4852]">
      {/* Toast Alert */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-55 px-5 py-3.5 rounded-xl font-semibold text-sm border shadow-lg transition-all duration-300 transform translate-y-0 ${
            toast.type === 'danger'
              ? 'bg-red-50 text-red-700 border-red-200'
              : toast.type === 'warning'
              ? 'bg-amber-50 text-amber-700 border-amber-200'
              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-current animate-ping" />
            {toast.message}
          </div>
        </div>
      )}

      {/* Demo Sandbox Alert */}
      {isDemoMode && (
        <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 shadow-sm">
          <div className="flex items-center gap-2.5">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
            </span>
            <p className="text-sm font-medium">
              Running in <strong>Demo Sandbox Mode</strong>. Connect backend API to save persistent changes.
            </p>
          </div>
          <NeoButton
            variant="secondary"
            onClick={loadData}
            className="text-xs py-1.5 px-3 bg-amber-100/50 hover:bg-amber-200/50 border border-amber-200 text-amber-800 shadow-none hover:translate-y-0"
          >
            Retry API Connection
          </NeoButton>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[#3d4852] font-display">
            Shared Resource Booking
          </h1>
          <p className="text-[#6b7280] text-sm mt-1">
            Check availability schedules, book conference rooms, test labs, and vehicles instantly.
          </p>
        </div>
        <NeoButton variant="primary" onClick={() => setIsBookOpen(true)} className="self-start md:self-auto">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Book Resource
        </NeoButton>
      </div>

      {/* KPIs Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <NeoCard className="neo-extruded flex items-center justify-between">
          <div>
            <span className="text-[#6b7280] text-xs font-bold uppercase tracking-wider block">Upcoming Slots</span>
            <span className="text-3xl font-extrabold text-[#3d4852] font-display block mt-1">{countUpcoming}</span>
          </div>
          <div className="p-3 bg-[#e0e5ec] rounded-xl shadow-[inset_2px_2px_5px_rgba(0,0,0,0.1),_inset_-2px_-2px_5px_rgba(255,255,255,0.7)] text-indigo-600">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </NeoCard>

        <NeoCard className="neo-extruded flex items-center justify-between">
          <div>
            <span className="text-[#6b7280] text-xs font-bold uppercase tracking-wider block">Ongoing Meetings</span>
            <span className="text-3xl font-extrabold text-[#3d4852] font-display block mt-1">{countOngoing}</span>
          </div>
          <div className="p-3 bg-[#e0e5ec] rounded-xl shadow-[inset_2px_2px_5px_rgba(0,0,0,0.1),_inset_-2px_-2px_5px_rgba(255,255,255,0.7)] text-purple-600">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </div>
        </NeoCard>

        <NeoCard className="neo-extruded flex items-center justify-between">
          <div>
            <span className="text-[#6b7280] text-xs font-bold uppercase tracking-wider block">Completed</span>
            <span className="text-3xl font-extrabold text-[#3d4852] font-display block mt-1">{countCompleted}</span>
          </div>
          <div className="p-3 bg-[#e0e5ec] rounded-xl shadow-[inset_2px_2px_5px_rgba(0,0,0,0.1),_inset_-2px_-2px_5px_rgba(255,255,255,0.7)] text-emerald-500">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        </NeoCard>

        <NeoCard className="neo-extruded flex items-center justify-between">
          <div>
            <span className="text-[#6b7280] text-xs font-bold uppercase tracking-wider block">Cancelled</span>
            <span className="text-3xl font-extrabold text-[#3d4852] font-display block mt-1">{countCancelled}</span>
          </div>
          <div className="p-3 bg-[#e0e5ec] rounded-xl shadow-[inset_2px_2px_5px_rgba(0,0,0,0.1),_inset_-2px_-2px_5px_rgba(255,255,255,0.7)] text-red-500">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </NeoCard>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Booking Timeline Feed */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <NeoCard className="neo-extruded flex-1">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
              <h2 className="text-xl font-bold text-[#3d4852] font-display self-start">
                Booking Schedule Log
              </h2>

              <div className="w-full sm:w-64 relative">
                <input
                  type="text"
                  placeholder="Search purpose or user..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-transparent bg-[#e0e5ec] shadow-[inset_3px_3px_6px_var(--af-shadow-dark),_inset_-3px_-3px_6px_var(--af-shadow-light)] focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/30 text-[#3d4852]"
                />
                <svg className="absolute left-3.5 top-2.5 w-4 h-4 text-[#6b7280]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Quick Filters */}
            <div className="flex flex-wrap gap-2 mb-6 border-b border-slate-300 pb-4">
              {['All', 'Upcoming', 'Ongoing', 'Completed', 'Cancelled'].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wider transition-all duration-200 ${
                    statusFilter === status
                      ? 'bg-[#6C63FF] text-white shadow-[inset_2px_2px_4px_rgba(0,0,0,0.2)]'
                      : 'bg-[#e0e5ec] text-[#6b7280] shadow-[2px_2px_5px_var(--af-shadow-dark),_-2px_-2px_5px_var(--af-shadow-light)] hover:text-[#3d4852]'
                  }`}
                >
                  {status}
                </button>
              ))}

              <div className="h-6 w-px bg-slate-350 mx-2 hidden sm:block" />

              <select
                value={timelineResourceFilter}
                onChange={(e) => setTimelineResourceFilter(e.target.value)}
                className="px-2 py-1 text-xs font-semibold rounded-lg bg-[#e0e5ec] text-[#6b7280] shadow-[2px_2px_5px_var(--af-shadow-dark),_-2px_-2px_5px_var(--af-shadow-light)] focus:outline-none"
              >
                <option value="All">All Resources</option>
                {DUMMY_RESOURCES.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Bookings Feed */}
            {loading ? (
              <div className="py-20 text-center">
                <div className="inline-block w-8 h-8 rounded-full border-4 border-slate-300 border-t-[#6C63FF] animate-spin mb-4" />
                <p className="text-sm text-[#6b7280]">Loading resource schedule...</p>
              </div>
            ) : filteredBookings.length === 0 ? (
              <div className="py-20 text-center rounded-2xl bg-[#e0e5ec] border border-dashed border-slate-350">
                <svg className="w-12 h-12 text-[#6b7280] mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <h3 className="text-lg font-bold text-[#3d4852]">No Bookings Logged</h3>
                <p className="text-[#6b7280] text-sm mt-1 max-w-xs mx-auto">
                  Try checking other filters or book a new resource.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-5">
                {filteredBookings.map((book) => {
                  const sTime = new Date(book.start_time)
                  const eTime = new Date(book.end_time)
                  const dateString = sTime.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })
                  const timespanString = `${sTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${eTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`

                  return (
                    <div
                      key={book.id}
                      className="p-5 rounded-2xl bg-[#e0e5ec] border border-slate-200/50 shadow-[4px_4px_8px_var(--af-shadow-dark),_-4px_-4px_8px_var(--af-shadow-light)] flex flex-col sm:flex-row items-start justify-between gap-4 hover:shadow-lg transition-shadow"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2.5 flex-wrap mb-2.5">
                          <h3 className="text-sm font-bold text-slate-800">
                            {getResourceName(book.resource_id)}
                          </h3>
                          <StatusBadge status={book.status} className="scale-90" />
                        </div>

                        <p className="text-xs text-[#6b7280] mb-2">
                          <strong>Booked For:</strong> {getEmployeeName(book.employee_id)}
                        </p>

                        <p className="text-sm font-semibold text-slate-700 mb-1">
                          "{book.purpose}"
                        </p>

                        <div className="flex items-center gap-4 text-xs text-[#6b7280] mt-3">
                          <span className="flex items-center gap-1.5">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {dateString}
                          </span>
                          <span className="flex items-center gap-1.5 font-medium text-slate-700">
                            <svg className="w-4 h-4 text-[#6C63FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {timespanString}
                          </span>
                        </div>
                      </div>

                      {/* Timeline Actions */}
                      <div className="self-stretch sm:self-auto flex sm:flex-col justify-end gap-2.5">
                        {(book.status === 'Upcoming' || book.status === 'Ongoing') && (
                          <>
                            <button
                              onClick={() => {
                                setSelectedBooking(book)
                                setRescheduleForm({
                                  start_time: formatToLocalDatetime(book.start_time),
                                  end_time: formatToLocalDatetime(book.end_time),
                                })
                                setIsRescheduleOpen(true)
                              }}
                              className="flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#e0e5ec] text-[#6C63FF] border border-transparent shadow-[2px_2px_4px_var(--af-shadow-dark),_-2px_-2px_4px_var(--af-shadow-light)] hover:shadow-sm active:scale-95 transition-all text-center"
                            >
                              Reschedule
                            </button>
                            <button
                              onClick={() => {
                                setSelectedBooking(book)
                                setIsCancelConfirmOpen(true)
                              }}
                              className="flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#e0e5ec] text-red-650 border border-transparent shadow-[2px_2px_4px_var(--af-shadow-dark),_-2px_-2px_4px_var(--af-shadow-light)] hover:shadow-sm active:scale-95 transition-all text-center"
                            >
                              Cancel
                            </button>
                          </>
                        )}
                        {book.status === 'Cancelled' && (
                          <span className="text-xs text-red-500 italic mt-auto">
                            Cancelled
                          </span>
                        )}
                        {book.status === 'Completed' && (
                          <span className="text-xs text-emerald-600 italic mt-auto">
                            Meeting Ended
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </NeoCard>
        </div>

        {/* Right Side: Quick Availability Schedule Check */}
        <div className="flex flex-col gap-6">
          <NeoCard className="neo-extruded">
            <h2 className="text-lg font-bold text-[#3d4852] font-display mb-4">
              Real-time Availability Checker
            </h2>
            <p className="text-xs text-[#6b7280] mb-5">
              Select a resource to review its current hourly bookings and find conflicts.
            </p>

            <div className="flex flex-col gap-2 mb-6">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Choose Resource
              </label>
              <select
                value={checkerResource}
                onChange={(e) => setCheckerResource(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:border-[#6C63FF] focus:ring-1 focus:ring-[#6C63FF]/50 shadow-inner text-sm"
              >
                {DUMMY_RESOURCES.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Hourly schedule list for selected resource */}
            <div className="flex flex-col gap-3 max-h-[400px] overflow-y-auto pr-1">
              {resourceSpecificBookings.length === 0 ? (
                <div className="py-10 text-center border border-dashed border-slate-350 rounded-xl">
                  <p className="text-xs text-[#6b7280]">Fully open! No bookings scheduled.</p>
                </div>
              ) : (
                resourceSpecificBookings.map((b) => {
                  const s = new Date(b.start_time)
                  const e = new Date(b.end_time)
                  return (
                    <div
                      key={b.id}
                      className="p-3 bg-[#e0e5ec] border border-slate-200/50 rounded-xl shadow-[inset_2px_2px_4px_var(--af-shadow-dark),_inset_-2px_-2px_4px_var(--af-shadow-light)] text-xs"
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-slate-700">
                          {s.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {e.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <StatusBadge status={b.status} className="scale-75 origin-right" />
                      </div>
                      <p className="text-[#6b7280]">
                        <strong>Date:</strong> {s.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </p>
                      <p className="text-[#6b7280] font-medium truncate mt-0.5">
                        <strong>User:</strong> {getEmployeeName(b.employee_id)}
                      </p>
                    </div>
                  )
                })
              )}
            </div>
          </NeoCard>
        </div>

      </div>

      {/* ==================== WORKFLOW MODALS ==================== */}

      {/* 1. Book Resource Modal */}
      <WorkflowModal
        isOpen={isBookOpen}
        onClose={() => setIsBookOpen(false)}
        title="Schedule / Book Resource"
      >
        <form onSubmit={handleCreateBooking} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Select Resource
            </label>
            <select
              value={bookForm.resource_id}
              onChange={(e) => setBookForm({ ...bookForm, resource_id: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:border-[#6C63FF] focus:ring-1 focus:ring-[#6C63FF]/50 shadow-inner"
            >
              {DUMMY_RESOURCES.map((res) => (
                <option key={res.id} value={res.id}>
                  [{res.type}] {res.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Booked For (Employee)
            </label>
            <select
              value={bookForm.employee_id}
              onChange={(e) => setBookForm({ ...bookForm, employee_id: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:border-[#6C63FF] focus:ring-1 focus:ring-[#6C63FF]/50 shadow-inner"
            >
              {DUMMY_EMPLOYEES.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <NeoInput
              id="start_time"
              label="Start Date & Time"
              type="datetime-local"
              required
              value={bookForm.start_time}
              onChange={(e) => setBookForm({ ...bookForm, start_time: e.target.value })}
            />

            <NeoInput
              id="end_time"
              label="End Date & Time"
              type="datetime-local"
              required
              value={bookForm.end_time}
              onChange={(e) => setBookForm({ ...bookForm, end_time: e.target.value })}
            />
          </div>

          <NeoInput
            id="purpose"
            label="Booking Purpose"
            type="textarea"
            placeholder="Add meeting agenda or deployment notes..."
            required
            value={bookForm.purpose}
            onChange={(e) => setBookForm({ ...bookForm, purpose: e.target.value })}
          />

          <div className="flex justify-end gap-3 mt-4">
            <NeoButton variant="secondary" onClick={() => setIsBookOpen(false)}>
              Cancel
            </NeoButton>
            <NeoButton type="submit" variant="primary">
              Confirm Booking
            </NeoButton>
          </div>
        </form>
      </WorkflowModal>

      {/* 2. Reschedule Modal */}
      <WorkflowModal
        isOpen={isRescheduleOpen}
        onClose={() => setIsRescheduleOpen(false)}
        title="Reschedule Booking"
      >
        {selectedBooking && (
          <form onSubmit={handleReschedule} className="flex flex-col gap-5">
            <div className="p-3 bg-slate-100 rounded-xl text-xs text-[#6b7280] border border-slate-200">
              <p>
                <strong>Resource:</strong> {getResourceName(selectedBooking.resource_id)}
              </p>
              <p className="mt-1">
                <strong>Purpose:</strong> "{selectedBooking.purpose}"
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <NeoInput
                id="resched_start_time"
                label="New Start Time"
                type="datetime-local"
                required
                value={rescheduleForm.start_time}
                onChange={(e) => setRescheduleForm({ ...rescheduleForm, start_time: e.target.value })}
              />

              <NeoInput
                id="resched_end_time"
                label="New End Time"
                type="datetime-local"
                required
                value={rescheduleForm.end_time}
                onChange={(e) => setRescheduleForm({ ...rescheduleForm, end_time: e.target.value })}
              />
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <NeoButton variant="secondary" onClick={() => setIsRescheduleOpen(false)}>
                Cancel
              </NeoButton>
              <NeoButton type="submit" variant="primary">
                Save Changes
              </NeoButton>
            </div>
          </form>
        )}
      </WorkflowModal>

      {/* 3. Cancel Confirmation Modal */}
      <WorkflowModal
        isOpen={isCancelConfirmOpen}
        onClose={() => setIsCancelConfirmOpen(false)}
        title="Cancel Booking Slot"
      >
        {selectedBooking && (
          <div className="flex flex-col gap-5">
            <p className="text-sm text-[#6b7280]">
              Are you sure you want to cancel the booking for{' '}
              <strong>{getResourceName(selectedBooking.resource_id)}</strong> by{' '}
              <strong>{getEmployeeName(selectedBooking.employee_id)}</strong>?
            </p>

            <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs border border-red-200">
              <p>
                <strong>Timeslot:</strong>{' '}
                {new Date(selectedBooking.start_time).toLocaleString()} -{' '}
                {new Date(selectedBooking.end_time).toLocaleString()}
              </p>
              <p className="mt-1">
                <strong>Agenda:</strong> "{selectedBooking.purpose}"
              </p>
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <NeoButton variant="secondary" onClick={() => setIsCancelConfirmOpen(false)}>
                Go Back
              </NeoButton>
              <NeoButton variant="danger" onClick={handleCancelBooking}>
                Yes, Cancel Slot
              </NeoButton>
            </div>
          </div>
        )}
      </WorkflowModal>
    </div>
  )
}
