import React, { useState, useEffect } from 'react';
import {
  Clock,
  Compass,
  CheckCircle,
  AlertCircle,
  CalendarCheck,
  Calendar,
  XCircle,
  Plus,
  Bell,
  X
} from 'lucide-react';
import {
  getAllBookings,
  createBooking,
  rescheduleBooking,
  cancelBooking,
} from '../../services/bookingService';
import PageContainer from '../../components/layout/PageContainer';
import { Card, Button, Badge, SearchBar, EmptyState, Loader, Input, StatCard } from '../../components/common';
import StatusBadge from '../../components/workflows/StatusBadge';
import WorkflowModal from '../../components/workflows/WorkflowModal';
import './ResourceBooking.css';


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
    <PageContainer title="Shared Resource Booking">
      {/* Toast Alert */}
      {toast && (
        <Card 
          variant="flat" 
          className="booking-toast p-md rounded-md d-flex justify-between align-center animate-fade-in"
          style={{ 
            borderLeft: `4px solid var(--color-${toast.type === 'danger' ? 'danger' : toast.type === 'warning' ? 'warning' : 'success'})`,
            background: 'var(--color-bg-surface)'
          }}
        >
          <div className="d-flex align-center gap-sm">
            <Bell className={`animate-pulse text-${toast.type === 'danger' ? 'danger' : toast.type === 'warning' ? 'warning' : 'success'}`} size={18} />
            <span className="text-sm-sz font-semibold text-main">{toast.message}</span>
          </div>
          <button 
            type="button"
            className="nm-btn rounded-full p-xs d-flex align-center justify-center cursor-pointer"
            onClick={() => setToast(null)}
            style={{ border: 'none', background: 'transparent' }}
          >
            <X size={14} className="text-muted" />
          </button>
        </Card>
      )}

      {/* Demo Sandbox Alert */}
      {isDemoMode && (
        <Card variant="flat" className="demo-banner-card p-md mb-lg d-flex justify-between align-center flex-wrap gap-md">
          <div className="d-flex align-center gap-sm">
            <AlertCircle className="text-warning animate-pulse" size={20} />
            <span className="text-sm-sz text-main font-medium">
              Running in <strong>Demo Sandbox Mode</strong>. Connect backend API to save persistent changes.
            </span>
          </div>
          <Button
            variant="flat"
            size="sm"
            onClick={loadData}
            style={{ color: 'var(--color-warning-dark)' }}
          >
            Retry API Connection
          </Button>
        </Card>
      )}

      {/* Header Description & Action Toolbar */}
      <div className="booking-header-wrapper">
        <div className="booking-title-section">
          <p>
            Check availability schedules, book conference rooms, test labs, and vehicles instantly.
          </p>
        </div>
        <Button 
          variant="primary" 
          onClick={() => setIsBookOpen(true)}
          icon={<Plus size={18} />}
        >
          Book Resource
        </Button>
      </div>

      {/* KPIs Grid */}
      <div className="booking-stats-grid">
        <StatCard
          title="Upcoming Slots"
          value={countUpcoming}
          icon={<Clock size={20} className="text-info" />}
        />
        <StatCard
          title="Ongoing Meetings"
          value={countOngoing}
          icon={<Compass size={20} className="text-primary" />}
        />
        <StatCard
          title="Completed"
          value={countCompleted}
          icon={<CheckCircle size={20} className="text-success" />}
        />
        <StatCard
          title="Cancelled"
          value={countCancelled}
          icon={<XCircle size={20} className="text-danger" />}
        />
      </div>

      {/* Main Grid */}
      <div className="booking-grid">
        
        {/* Left Side: Booking Timeline Feed */}
        <div className="d-flex flex-col gap-lg">
          <Card variant="flat" className="p-lg">
            <div className="booking-toolbar">
              <h2 className="text-heading font-semibold text-lg-sz m-0">
                Booking Schedule Log
              </h2>

              <div className="booking-search-wrapper">
                <SearchBar
                  placeholder="Search purpose or user..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Quick Filters */}
            <div className="booking-filters-row mb-md" style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: 'var(--spacing-sm)' }}>
              {['All', 'Upcoming', 'Ongoing', 'Completed', 'Cancelled'].map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setStatusFilter(status)}
                  className={`booking-filter-btn ${statusFilter === status ? 'active' : ''}`}
                >
                  {status}
                </button>
              ))}

              <div className="booking-divider" />

              <select
                value={timelineResourceFilter}
                onChange={(e) => setTimelineResourceFilter(e.target.value)}
                className="org-select"
                style={{ width: 'auto', padding: 'var(--spacing-xs) var(--spacing-sm)', fontSize: 'var(--text-xs)', height: 'auto' }}
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
              <div className="py-xl">
                <Loader text="Loading resource schedule..." size="lg" />
              </div>
            ) : filteredBookings.length === 0 ? (
              <EmptyState
                title="No Bookings Logged"
                description="Try checking other filters or book a new resource."
                icon={<CalendarCheck size={36} className="text-primary" />}
                actionButton={
                  <Button variant="primary" onClick={() => setIsBookOpen(true)} icon={<Plus size={16} />}>
                    Book Resource
                  </Button>
                }
              />
            ) : (
              <div className="booking-log-list">
                {filteredBookings.map((book) => {
                  const sTime = new Date(book.start_time)
                  const eTime = new Date(book.end_time)
                  const dateString = sTime.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })
                  const timespanString = `${sTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${eTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`

                  return (
                    <div key={book.id} className="booking-log-item">
                      <div style={{ flex: 1 }}>
                        <div className="d-flex align-center gap-sm flex-wrap mb-xs">
                          <h3 className="text-heading font-semibold text-sm-sz m-0">
                            {getResourceName(book.resource_id)}
                          </h3>
                          <StatusBadge status={book.status} />
                        </div>

                        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', margin: '0 0 var(--spacing-xxs) 0' }}>
                          <strong>Booked For:</strong> {getEmployeeName(book.employee_id)}
                        </p>

                        <p className="text-main font-semibold" style={{ fontSize: 'var(--text-sm)', margin: 'var(--spacing-xxs) 0' }}>
                          "{book.purpose}"
                        </p>

                        <div className="booking-log-meta-group">
                          <span className="booking-log-meta-item">
                            <Calendar size={14} className="text-muted" />
                            {dateString}
                          </span>
                          <span className="booking-log-meta-item">
                            <Clock size={14} className="text-primary" />
                            <strong>{timespanString}</strong>
                          </span>
                        </div>
                      </div>

                      {/* Timeline Actions */}
                      <div className="d-flex gap-sm sm-flex-col" style={{ alignSelf: 'stretch', justifyContent: 'flex-end' }}>
                        {(book.status === 'Upcoming' || book.status === 'Ongoing') && (
                          <>
                            <Button
                              variant="flat"
                              size="sm"
                              onClick={() => {
                                setSelectedBooking(book)
                                setRescheduleForm({
                                  start_time: formatToLocalDatetime(book.start_time),
                                  end_time: formatToLocalDatetime(book.end_time),
                                })
                                setIsRescheduleOpen(true)
                              }}
                              style={{ color: 'var(--color-primary-dark)' }}
                            >
                              Reschedule
                            </Button>
                            <Button
                              variant="flat"
                              size="sm"
                              onClick={() => {
                                setSelectedBooking(book)
                                setIsCancelConfirmOpen(true)
                              }}
                              style={{ color: 'var(--color-danger)' }}
                            >
                              Cancel
                            </Button>
                          </>
                        )}
                        {book.status === 'Cancelled' && (
                          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-danger)', fontStyle: 'italic' }}>
                            Cancelled
                          </span>
                        )}
                        {book.status === 'Completed' && (
                          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-success)', fontStyle: 'italic' }}>
                            Meeting Ended
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </Card>
        </div>

        {/* Right Side: Quick Availability Schedule Check */}
        <div className="d-flex flex-col gap-lg">
          <Card variant="flat" className="p-lg">
            <h2 className="text-heading font-semibold text-lg-sz m-0 mb-sm">
              Real-time Availability Checker
            </h2>
            <p className="text-muted" style={{ fontSize: 'var(--text-xs)', marginBottom: 'var(--spacing-md)' }}>
              Select a resource to review its current hourly bookings and find conflicts.
            </p>

            <div className="form-field-group mb-md">
              <label htmlFor="checker_resource_select">Choose Resource</label>
              <select
                id="checker_resource_select"
                value={checkerResource}
                onChange={(e) => setCheckerResource(e.target.value)}
                className="org-select"
              >
                {DUMMY_RESOURCES.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Hourly schedule list for selected resource */}
            <div className="checker-list">
              {resourceSpecificBookings.length === 0 ? (
                <EmptyState
                  title="Fully Open"
                  description="No bookings scheduled."
                  padding="sm"
                />
              ) : (
                resourceSpecificBookings.map((b) => {
                  const s = new Date(b.start_time)
                  const e = new Date(b.end_time)
                  return (
                    <div key={b.id} className="checker-item">
                      <div className="checker-item-header">
                        <span className="font-bold text-heading">
                          {s.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {e.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <StatusBadge status={b.status} style={{ transform: 'scale(0.8)', transformOrigin: 'right center' }} />
                      </div>
                      <p style={{ margin: 'var(--spacing-3xs) 0 0 0', color: 'var(--color-text-muted)' }}>
                        <strong>Date:</strong> {s.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </p>
                      <p style={{ margin: 'var(--spacing-3xs) 0 0 0', color: 'var(--color-text-muted)' }} className="truncate">
                        <strong>User:</strong> {getEmployeeName(b.employee_id)}
                      </p>
                    </div>
                  )
                })
              )}
            </div>
          </Card>
        </div>

      </div>

      {/* ==================== WORKFLOW MODALS ==================== */}

      {/* 1. Book Resource Modal */}
      <WorkflowModal
        isOpen={isBookOpen}
        onClose={() => setIsBookOpen(false)}
        title="Schedule / Book Resource"
      >
        <form onSubmit={handleCreateBooking} className="d-flex flex-col gap-md">
          <div className="form-field-group">
            <label htmlFor="book_resource_select">Select Resource</label>
            <select
              id="book_resource_select"
              value={bookForm.resource_id}
              onChange={(e) => setBookForm({ ...bookForm, resource_id: e.target.value })}
              className="org-select"
            >
              {DUMMY_RESOURCES.map((res) => (
                <option key={res.id} value={res.id}>
                  [{res.type}] {res.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-field-group">
            <label htmlFor="book_employee_select">Booked For (Employee)</label>
            <select
              id="book_employee_select"
              value={bookForm.employee_id}
              onChange={(e) => setBookForm({ ...bookForm, employee_id: e.target.value })}
              className="org-select"
            >
              {DUMMY_EMPLOYEES.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name}
                </option>
              ))}
            </select>
          </div>

          <div className="d-grid grid-cols-2 gap-sm">
            <Input
              id="start_time"
              label="Start Date & Time"
              type="datetime-local"
              required
              value={bookForm.start_time}
              onChange={(e) => setBookForm({ ...bookForm, start_time: e.target.value })}
            />

            <Input
              id="end_time"
              label="End Date & Time"
              type="datetime-local"
              required
              value={bookForm.end_time}
              onChange={(e) => setBookForm({ ...bookForm, end_time: e.target.value })}
            />
          </div>

          <div className="form-field-group">
            <label htmlFor="purpose_textarea">Booking Purpose</label>
            <textarea
              id="purpose_textarea"
              placeholder="Add meeting agenda or deployment notes..."
              required
              value={bookForm.purpose}
              onChange={(e) => setBookForm({ ...bookForm, purpose: e.target.value })}
              className="nm-field"
              rows={3}
            />
          </div>

          <div className="d-flex justify-end gap-sm mt-md">
            <Button variant="flat" onClick={() => setIsBookOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Confirm Booking
            </Button>
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
          <form onSubmit={handleReschedule} className="d-flex flex-col gap-md">
            <Card variant="flat" padding="sm" className="nm-inset text-muted" style={{ fontSize: 'var(--text-xs)' }}>
              <p>
                <strong>Resource:</strong> {getResourceName(selectedBooking.resource_id)}
              </p>
              <p className="mt-xs">
                <strong>Purpose:</strong> "{selectedBooking.purpose}"
              </p>
            </Card>

            <div className="d-grid grid-cols-2 gap-sm">
              <Input
                id="resched_start_time"
                label="New Start Time"
                type="datetime-local"
                required
                value={rescheduleForm.start_time}
                onChange={(e) => setRescheduleForm({ ...rescheduleForm, start_time: e.target.value })}
              />

              <Input
                id="resched_end_time"
                label="New End Time"
                type="datetime-local"
                required
                value={rescheduleForm.end_time}
                onChange={(e) => setRescheduleForm({ ...rescheduleForm, end_time: e.target.value })}
              />
            </div>

            <div className="d-flex justify-end gap-sm mt-md">
              <Button variant="flat" onClick={() => setIsRescheduleOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Save Changes
              </Button>
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
          <div className="d-flex flex-col gap-md">
            <p className="text-muted" style={{ fontSize: 'var(--text-sm)' }}>
              Are you sure you want to cancel the booking for{' '}
              <strong>{getResourceName(selectedBooking.resource_id)}</strong> by{' '}
              <strong>{getEmployeeName(selectedBooking.employee_id)}</strong>?
            </p>

            <Card variant="flat" padding="sm" className="nm-inset text-danger" style={{ fontSize: 'var(--text-xs)', borderLeft: '3px solid var(--color-danger)' }}>
              <p>
                <strong>Timeslot:</strong>{' '}
                {new Date(selectedBooking.start_time).toLocaleString()} -{' '}
                {new Date(selectedBooking.end_time).toLocaleString()}
              </p>
              <p className="mt-xs">
                <strong>Agenda:</strong> "{selectedBooking.purpose}"
              </p>
            </Card>

            <div className="d-flex justify-end gap-sm mt-md">
              <Button variant="flat" onClick={() => setIsCancelConfirmOpen(false)}>
                Go Back
              </Button>
              <Button variant="danger" onClick={handleCancelBooking}>
                Yes, Cancel Slot
              </Button>
            </div>
          </div>
        )}
      </WorkflowModal>
    </PageContainer>
  )
}
