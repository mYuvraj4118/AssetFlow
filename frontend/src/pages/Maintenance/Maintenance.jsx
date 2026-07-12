import React, { useState, useEffect } from 'react'
import {
  getMaintenanceRequests,
  createMaintenanceRequest,
  approveMaintenanceRequest,
  rejectMaintenanceRequest,
  assignTechnician,
  startMaintenance,
  resolveMaintenance,
} from '../../services/maintenanceService'
import NeoCard from '../../components/workflows/NeoCard'
import NeoButton from '../../components/workflows/NeoButton'
import NeoInput from '../../components/workflows/NeoInput'
import StatusBadge from '../../components/workflows/StatusBadge'
import WorkflowModal from '../../components/workflows/WorkflowModal'

const DUMMY_ASSETS = [
  { id: '65d12a1b9c8d7e6f0a1b2c34', name: 'MacBook Pro 16" (MBP-2024-001)' },
  { id: '65d12b2c9c8d7e6f0a1b2c35', name: 'Dell UltraSharp 27" Monitor (DEL-27-009)' },
  { id: '65d12c3d9c8d7e6f0a1b2c36', name: 'iPhone 15 Pro (IPH-15-054)' },
  { id: '65d12d4e9c8d7e6f0a1b2c37', name: 'iPad Pro 12.9" (IPD-12-003)' },
  { id: '65d12e5f9c8d7e6f0a1b2c38', name: 'Lenovo ThinkPad X1 (THK-99-012)' },
]

const DUMMY_EMPLOYEES = [
  { id: '65d13a1b9c8d7e6f0a1b2c38', name: 'Alice Smith (Engineering)' },
  { id: '65d13b2c9c8d7e6f0a1b2c39', name: 'Bob Jones (Design)' },
  { id: '65d13c3d9c8d7e6f0a1b2c40', name: 'Charlie Brown (Product)' },
  { id: '65d13d4e9c8d7e6f0a1b2c41', name: 'Diana Prince (Operations)' },
  { id: '65d13e5f9c8d7e6f0a1b2c42', name: 'Evan Wright (HR)' },
]

const DUMMY_TECHNICIANS = [
  { id: '65d13f9b9c8d7e6f0a1b2c45', name: 'John Doe (HVAC & Facilities)' },
  { id: '65d13f9b9c8d7e6f0a1b2c46', name: 'Sarah Connor (IT Hardware Specialist)' },
  { id: '65d13f9b9c8d7e6f0a1b2c47', name: 'Mike Miller (Electrician & Office Gear)' },
]

const CURRENT_USER_ID = '65d13f6a9c8d7e6f0a1b2c43' // Mock User

// Helper to get asset name by ID
const getAssetName = (id) => {
  const asset = DUMMY_ASSETS.find((a) => a.id === id)
  return asset ? asset.name : `Asset (${id.substring(0, 8)}...)`
}

// Helper to get employee name by ID
const getEmployeeName = (id) => {
  const emp = DUMMY_EMPLOYEES.find((e) => e.id === id)
  return emp ? emp.name : `Employee (${id.substring(0, 8)}...)`
}

// Helper to get technician name by ID
const getTechnicianName = (id) => {
  const tech = DUMMY_TECHNICIANS.find((t) => t.id === id)
  return tech ? tech.name : `Technician (${id?.substring(0, 8) || 'Unassigned'})`
}

// Priority Badge Component
function PriorityBadge({ priority, className = '' }) {
  const priorityStyles = {
    critical: 'bg-red-100 text-red-700 border border-red-200',
    high: 'bg-orange-100 text-orange-700 border border-orange-200',
    medium: 'bg-amber-100 text-amber-700 border border-amber-200',
    low: 'bg-slate-100 text-slate-700 border border-slate-200',
  }

  const p = String(priority || '').toLowerCase()
  const currentStyle = priorityStyles[p] || 'bg-slate-100 text-slate-700 border-slate-200'

  return (
    <span className={`inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider ${currentStyle} ${className}`}>
      {priority}
    </span>
  )
}

export default function Maintenance() {
  // Lists
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isDemoMode, setIsDemoMode] = useState(false)
  const [toast, setToast] = useState(null)

  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [priorityFilter, setPriorityFilter] = useState('All')

  // Modals
  const [isRequestOpen, setIsRequestOpen] = useState(false)
  const [isApproveRejectOpen, setIsApproveRejectOpen] = useState(false)
  const [isAssignTechOpen, setIsAssignTechOpen] = useState(false)
  const [isResolveOpen, setIsResolveOpen] = useState(false)

  // Selected item for actions
  const [selectedRequest, setSelectedRequest] = useState(null)

  // Forms
  const [requestForm, setRequestForm] = useState({
    asset_id: DUMMY_ASSETS[0].id,
    raised_by: DUMMY_EMPLOYEES[0].id,
    issue: '',
    priority: 'Medium',
    description: '',
    photo_url: '',
  })

  const [approvalForm, setApprovalForm] = useState({
    remarks: '',
  })

  const [techForm, setTechForm] = useState({
    technician_id: DUMMY_TECHNICIANS[0].id,
  })

  const [resolutionForm, setResolutionForm] = useState({
    remarks: '',
  })

  // Show auto-dismiss toast alerts
  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 4000)
  }

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      const allRequests = await getMaintenanceRequests()
      setRequests(allRequests)
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
    const mockRequests = [
      {
        id: '65d170019c8d7e6f0a1b2c60',
        asset_id: '65d12a1b9c8d7e6f0a1b2c34', // MBP 16
        raised_by: '65d13a1b9c8d7e6f0a1b2c38', // Alice
        issue: 'Frequent Screen Flicker',
        priority: 'High',
        description: 'The laptop display flickers black intermittently, especially when running multiple high-resolution graphics programs or connected to external screens.',
        photo_url: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=500',
        status: 'Pending',
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: '65d170029c8d7e6f0a1b2c61',
        asset_id: '65d12b2c9c8d7e6f0a1b2c35', // Dell 27
        raised_by: '65d13b2c9c8d7e6f0a1b2c39', // Bob
        issue: 'Power Port Loose',
        priority: 'Critical',
        description: 'The monitor turns off if the power cord is nudged. The port connection pins seem loose inside.',
        status: 'Approved',
        approved_by: CURRENT_USER_ID,
        approval_remarks: 'Approved for priority technician handling.',
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: '65d170039c8d7e6f0a1b2c62',
        asset_id: '65d12c3d9c8d7e6f0a1b2c36', // iPhone 15 Pro
        raised_by: '65d13c3d9c8d7e6f0a1b2c40', // Charlie
        issue: 'Battery Health Degradation',
        priority: 'Low',
        description: 'Battery health showing 74% and drains under normal usage within 3 hours. Needs battery replacement.',
        status: 'Technician Assigned',
        approved_by: CURRENT_USER_ID,
        technician_id: '65d13f9b9c8d7e6f0a1b2c46', // Sarah
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: '65d170049c8d7e6f0a1b2c63',
        asset_id: '65d12d4e9c8d7e6f0a1b2c37', // iPad Pro
        raised_by: '65d13d4e9c8d7e6f0a1b2c41', // Diana
        issue: 'Shattered Digitizer Glass',
        priority: 'Medium',
        description: 'Glass screen cracked on the bottom-right corner. The touch digitizer is still functional, but shards are coming loose.',
        status: 'In Progress',
        approved_by: CURRENT_USER_ID,
        technician_id: '65d13f9b9c8d7e6f0a1b2c47', // Mike
        created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: '65d170059c8d7e6f0a1b2c64',
        asset_id: '65d12e5f9c8d7e6f0a1b2c38', // ThinkPad
        raised_by: '65d13e5f9c8d7e6f0a1b2c42', // Evan
        issue: 'Sticky Keyboard Keys',
        priority: 'Low',
        description: 'Coffee spill occurred on keys J, K, and L. Keys stick when pressed down.',
        status: 'Resolved',
        approved_by: CURRENT_USER_ID,
        technician_id: '65d13f9b9c8d7e6f0a1b2c46', // Sarah
        resolution_remarks: 'Keys removed, contacts cleaned with isopropyl alcohol, and caps re-seated. Testing confirmed clean response.',
        created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        resolved_at: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ]

    setRequests(mockRequests)
  }

  useEffect(() => {
    loadData()
  }, [])

  // ==================== WORKFLOW ACTION HANDLERS ====================

  // 1. Create Maintenance Request
  const handleCreateRequest = async (e) => {
    e.preventDefault()
    if (!requestForm.issue.trim() || !requestForm.description.trim()) {
      showToast('Please fill in the issue and description fields.', 'danger')
      return
    }

    const payload = {
      ...requestForm,
      photo_url: requestForm.photo_url.trim() || null,
    }

    try {
      if (isDemoMode) {
        // Local simulation pre-checking: prevent multiple active requests for the same asset
        const activeExist = requests.find(
          (r) =>
            r.asset_id === payload.asset_id &&
            ['Pending', 'Approved', 'Technician Assigned', 'In Progress'].includes(r.status)
        )
        if (activeExist) {
          showToast('An active maintenance request already exists for this asset.', 'danger')
          return
        }

        const newReq = {
          id: `req_${Date.now()}`,
          ...payload,
          status: 'Pending',
          created_at: new Date().toISOString(),
        }
        setRequests([newReq, ...requests])
      } else {
        await createMaintenanceRequest(payload)
        await loadData()
      }
      showToast('Maintenance request raised successfully.')
      setIsRequestOpen(false)
      // Reset form
      setRequestForm({
        asset_id: DUMMY_ASSETS[0].id,
        raised_by: DUMMY_EMPLOYEES[0].id,
        issue: '',
        priority: 'Medium',
        description: '',
        photo_url: '',
      })
    } catch (err) {
      showToast(err.message, 'danger')
    }
  }

  // 2. Approve Request
  const handleApprove = async (e) => {
    e.preventDefault()
    if (!selectedRequest) return

    const payload = {
      approved_by: CURRENT_USER_ID,
      remarks: approvalForm.remarks || null,
    }

    try {
      if (isDemoMode) {
        setRequests(
          requests.map((r) =>
            r.id === selectedRequest.id
              ? {
                  ...r,
                  status: 'Approved',
                  approved_by: payload.approved_by,
                  approval_remarks: payload.remarks,
                  updated_at: new Date().toISOString(),
                }
              : r
          )
        )
      } else {
        await approveMaintenanceRequest(selectedRequest.id, payload)
        await loadData()
      }
      showToast('Maintenance request approved.')
      setIsApproveRejectOpen(false)
      setApprovalForm({ remarks: '' })
    } catch (err) {
      showToast(err.message, 'danger')
    }
  }

  // 3. Reject Request
  const handleReject = async (e) => {
    e.preventDefault()
    if (!selectedRequest) return

    if (!approvalForm.remarks.trim()) {
      showToast('Remarks are required for rejecting a request.', 'danger')
      return
    }

    const payload = {
      rejected_by: CURRENT_USER_ID,
      remarks: approvalForm.remarks,
    }

    try {
      if (isDemoMode) {
        setRequests(
          requests.map((r) =>
            r.id === selectedRequest.id
              ? {
                  ...r,
                  status: 'Rejected',
                  approved_by: payload.rejected_by,
                  approval_remarks: payload.remarks,
                  updated_at: new Date().toISOString(),
                }
              : r
          )
        )
      } else {
        await rejectMaintenanceRequest(selectedRequest.id, payload)
        await loadData()
      }
      showToast('Maintenance request rejected.', 'warning')
      setIsApproveRejectOpen(false)
      setApprovalForm({ remarks: '' })
    } catch (err) {
      showToast(err.message, 'danger')
    }
  }

  // 4. Assign Technician
  const handleAssignTech = async (e) => {
    e.preventDefault()
    if (!selectedRequest) return

    const payload = {
      technician_id: techForm.technician_id,
    }

    try {
      if (isDemoMode) {
        setRequests(
          requests.map((r) =>
            r.id === selectedRequest.id
              ? {
                  ...r,
                  status: 'Technician Assigned',
                  technician_id: payload.technician_id,
                  updated_at: new Date().toISOString(),
                }
              : r
          )
        )
      } else {
        await assignTechnician(selectedRequest.id, payload)
        await loadData()
      }
      showToast('Technician assigned successfully.')
      setIsAssignTechOpen(false)
    } catch (err) {
      showToast(err.message, 'danger')
    }
  }

  // 5. Start Work
  const handleStartWork = async (request) => {
    try {
      if (isDemoMode) {
        setRequests(
          requests.map((r) =>
            r.id === request.id
              ? { ...r, status: 'In Progress', updated_at: new Date().toISOString() }
              : r
          )
        )
      } else {
        await startMaintenance(request.id)
        await loadData()
      }
      showToast('Work started on this request.')
    } catch (err) {
      showToast(err.message, 'danger')
    }
  }

  // 6. Resolve Request
  const handleResolve = async (e) => {
    e.preventDefault()
    if (!selectedRequest) return

    if (!resolutionForm.remarks.trim()) {
      showToast('Resolution remarks are required.', 'danger')
      return
    }

    const payload = {
      resolved_by: CURRENT_USER_ID,
      remarks: resolutionForm.remarks,
    }

    try {
      if (isDemoMode) {
        setRequests(
          requests.map((r) =>
            r.id === selectedRequest.id
              ? {
                  ...r,
                  status: 'Resolved',
                  resolution_remarks: payload.remarks,
                  resolved_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                }
              : r
          )
        )
      } else {
        await resolveMaintenance(selectedRequest.id, payload)
        await loadData()
      }
      showToast('Request marked as resolved!')
      setIsResolveOpen(false)
      setResolutionForm({ remarks: '' })
    } catch (err) {
      showToast(err.message, 'danger')
    }
  }

  // ==================== FILTER & SEARCH ====================

  const filteredRequests = requests.filter((req) => {
    const assetName = getAssetName(req.asset_id).toLowerCase()
    const issue = (req.issue || '').toLowerCase()
    const techName = getTechnicianName(req.technician_id).toLowerCase()

    const matchesSearch =
      assetName.includes(searchQuery.toLowerCase()) ||
      issue.includes(searchQuery.toLowerCase()) ||
      techName.includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === 'All' || req.status === statusFilter
    const matchesPriority = priorityFilter === 'All' || req.priority === priorityFilter

    return matchesSearch && matchesStatus && matchesPriority
  })

  // ==================== KPI STATISTICS ====================

  const countPending = requests.filter((r) => r.status === 'Pending').length
  const countActive = requests.filter((r) => ['Approved', 'Technician Assigned', 'In Progress'].includes(r.status)).length
  const countResolved = requests.filter((r) => r.status === 'Resolved').length
  const countCritical = requests.filter((r) => r.priority === 'Critical' && r.status !== 'Resolved').length

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

      {/* Demo Sandbox Mode Banner */}
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
            Maintenance Management
          </h1>
          <p className="text-[#6b7280] text-sm mt-1">
            File repair logs, approve tickets, assign specialized technicians, and verify resolutions.
          </p>
        </div>
        <NeoButton variant="primary" onClick={() => setIsRequestOpen(true)} className="self-start md:self-auto">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          Raise Repair Ticket
        </NeoButton>
      </div>

      {/* KPIs Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <NeoCard className="neo-extruded flex items-center justify-between">
          <div>
            <span className="text-[#6b7280] text-xs font-bold uppercase tracking-wider block">Pending Approvals</span>
            <span className="text-3xl font-extrabold text-[#3d4852] font-display block mt-1">{countPending}</span>
          </div>
          <div className="p-3 bg-[#e0e5ec] rounded-xl shadow-[inset_2px_2px_5px_rgba(0,0,0,0.1),_inset_-2px_-2px_5px_rgba(255,255,255,0.7)] text-amber-500">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
        </NeoCard>

        <NeoCard className="neo-extruded flex items-center justify-between">
          <div>
            <span className="text-[#6b7280] text-xs font-bold uppercase tracking-wider block">Active Jobs</span>
            <span className="text-3xl font-extrabold text-[#3d4852] font-display block mt-1">{countActive}</span>
          </div>
          <div className="p-3 bg-[#e0e5ec] rounded-xl shadow-[inset_2px_2px_5px_rgba(0,0,0,0.1),_inset_-2px_-2px_5px_rgba(255,255,255,0.7)] text-[#6C63FF]">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
        </NeoCard>

        <NeoCard className="neo-extruded flex items-center justify-between">
          <div>
            <span className="text-[#6b7280] text-xs font-bold uppercase tracking-wider block">Resolved Issues</span>
            <span className="text-3xl font-extrabold text-[#3d4852] font-display block mt-1">{countResolved}</span>
          </div>
          <div className="p-3 bg-[#e0e5ec] rounded-xl shadow-[inset_2px_2px_5px_rgba(0,0,0,0.1),_inset_-2px_-2px_5px_rgba(255,255,255,0.7)] text-emerald-500">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </NeoCard>

        <NeoCard className="neo-extruded flex items-center justify-between">
          <div>
            <span className="text-[#6b7280] text-xs font-bold uppercase tracking-wider block">Critical Unresolved</span>
            <span className="text-3xl font-extrabold text-red-500 font-display block mt-1">{countCritical}</span>
          </div>
          <div className="p-3 bg-[#e0e5ec] rounded-xl shadow-[inset_2px_2px_5px_rgba(0,0,0,0.1),_inset_-2px_-2px_5px_rgba(255,255,255,0.7)] text-red-500">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        </NeoCard>
      </div>

      {/* Content Section */}
      <div className="flex flex-col gap-6">
        
        {/* Filter Control panel */}
        <NeoCard className="neo-extruded">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            
            {/* Search Input */}
            <div className="w-full lg:w-96 relative">
              <input
                type="text"
                placeholder="Search asset, issue description, or tech..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-transparent bg-[#e0e5ec] shadow-[inset_3px_3px_6px_var(--af-shadow-dark),_inset_-3px_-3px_6px_var(--af-shadow-light)] focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/30 text-[#3d4852]"
              />
              <svg className="absolute left-3.5 top-2.5 w-4 h-4 text-[#6b7280]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
              
              {/* Status Selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase text-[#6b7280]">Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-[#e0e5ec] text-[#6b7280] shadow-[2px_2px_5px_var(--af-shadow-dark),_-2px_-2px_5px_var(--af-shadow-light)] focus:outline-none"
                >
                  <option value="All">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Technician Assigned">Technician Assigned</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>

              {/* Priority Selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase text-[#6b7280]">Priority:</span>
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-[#e0e5ec] text-[#6b7280] shadow-[2px_2px_5px_var(--af-shadow-dark),_-2px_-2px_5px_var(--af-shadow-light)] focus:outline-none"
                >
                  <option value="All">All Priorities</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
            </div>

          </div>
        </NeoCard>

        {/* Requests List */}
        {loading ? (
          <div className="py-20 text-center">
            <div className="inline-block w-8 h-8 rounded-full border-4 border-slate-300 border-t-[#6C63FF] animate-spin mb-4" />
            <p className="text-sm text-[#6b7280]">Loading repair tickets...</p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="py-20 text-center rounded-2xl bg-[#e0e5ec] border border-dashed border-slate-350">
            <svg className="w-12 h-12 text-[#6b7280] mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h3 className="text-lg font-bold text-[#3d4852]">No Maintenance Tickets Found</h3>
            <p className="text-[#6b7280] text-sm mt-1 max-w-xs mx-auto">
              Check filters or raise a new repair log for damaged assets.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredRequests.map((req) => (
              <NeoCard
                key={req.id}
                className="neo-extruded flex flex-col justify-between hover:shadow-lg transition-all duration-300"
              >
                {/* Upper Details */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-xs text-[#6b7280] font-semibold">
                      Ticket #{req.id.substring(req.id.length - 6).toUpperCase()}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <PriorityBadge priority={req.priority} />
                      <StatusBadge status={req.status} className="scale-90" />
                    </div>
                  </div>

                  {/* Photo Display if available */}
                  {req.photo_url && (
                    <div className="mb-4 rounded-xl overflow-hidden shadow-inner max-h-[160px]">
                      <img
                        src={req.photo_url}
                        alt="Asset damage"
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.style.display = 'none' }}
                      />
                    </div>
                  )}

                  <h3 className="text-base font-bold text-slate-800 mb-1 leading-snug">
                    {req.issue}
                  </h3>
                  
                  <p className="text-xs text-indigo-650 font-bold mb-3 font-display">
                    {getAssetName(req.asset_id)}
                  </p>

                  <p className="text-xs text-[#6b7280] leading-relaxed mb-4">
                    {req.description}
                  </p>

                  {/* Workflow Log Details */}
                  <div className="bg-[#e0e5ec] p-3 rounded-xl shadow-[inset_1.5px_1.5px_3px_rgba(0,0,0,0.1),_inset_-1.5px_-1.5px_3px_rgba(255,255,255,0.7)] text-xs text-[#6b7280] flex flex-col gap-1.5 mb-5">
                    <p>
                      <strong>Raised By:</strong> {getEmployeeName(req.raised_by)}
                    </p>
                    {req.technician_id && (
                      <p>
                        <strong>Technician:</strong> {getTechnicianName(req.technician_id)}
                      </p>
                    )}
                    {req.approval_remarks && (
                      <p className="italic text-slate-700 mt-0.5">
                        <strong>Approval:</strong> "{req.approval_remarks}"
                      </p>
                    )}
                    {req.resolution_remarks && (
                      <p className="italic text-slate-700 mt-0.5">
                        <strong>Resolution:</strong> "{req.resolution_remarks}"
                      </p>
                    )}
                  </div>
                </div>

                {/* Workflow Buttons */}
                <div className="flex flex-col gap-2 pt-4 border-t border-slate-300">
                  {req.status === 'Pending' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedRequest(req)
                          setIsApproveRejectOpen(true)
                        }}
                        className="flex-1 px-3 py-2 rounded-lg text-xs font-semibold bg-[#6C63FF] hover:bg-[#5B54E8] text-white shadow-sm transition-colors text-center"
                      >
                        Approve / Reject
                      </button>
                    </div>
                  )}

                  {req.status === 'Approved' && (
                    <button
                      onClick={() => {
                        setSelectedRequest(req)
                        setIsAssignTechOpen(true)
                      }}
                      className="w-full px-3 py-2 rounded-lg text-xs font-semibold bg-[#e0e5ec] text-[#6C63FF] border border-transparent shadow-[2px_2px_4px_var(--af-shadow-dark),_-2px_-2px_4px_var(--af-shadow-light)] hover:shadow-sm active:scale-95 transition-all text-center"
                    >
                      Assign Technician
                    </button>
                  )}

                  {req.status === 'Technician Assigned' && (
                    <button
                      onClick={() => handleStartWork(req)}
                      className="w-full px-3 py-2 rounded-lg text-xs font-semibold bg-cyan-600 hover:bg-cyan-700 text-white shadow-sm transition-colors text-center"
                    >
                      Start Work (In-Progress)
                    </button>
                  )}

                  {req.status === 'In Progress' && (
                    <button
                      onClick={() => {
                        setSelectedRequest(req)
                        setIsResolveOpen(true)
                      }}
                      className="w-full px-3 py-2 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-colors text-center"
                    >
                      Mark Resolved
                    </button>
                  )}

                  {req.status === 'Resolved' && (
                    <span className="text-xs text-emerald-600 font-bold text-center italic py-1 bg-emerald-50 rounded-lg border border-emerald-100 block">
                      Resolved on {new Date(req.resolved_at).toLocaleDateString()}
                    </span>
                  )}

                  {req.status === 'Rejected' && (
                    <span className="text-xs text-red-600 font-bold text-center italic py-1 bg-red-50 rounded-lg border border-red-100 block">
                      Request Rejected
                    </span>
                  )}
                </div>
              </NeoCard>
            ))}
          </div>
        )}
      </div>

      {/* ==================== WORKFLOW MODALS ==================== */}

      {/* 1. Raise Repair Request Modal */}
      <WorkflowModal
        isOpen={isRequestOpen}
        onClose={() => setIsRequestOpen(false)}
        title="Raise Asset Repair Ticket"
      >
        <form onSubmit={handleCreateRequest} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Select Affected Asset
            </label>
            <select
              value={requestForm.asset_id}
              onChange={(e) => setRequestForm({ ...requestForm, asset_id: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:border-[#6C63FF] focus:ring-1 focus:ring-[#6C63FF]/50 shadow-inner"
            >
              {DUMMY_ASSETS.map((asset) => (
                <option key={asset.id} value={asset.id}>
                  {asset.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Reported By (Employee)
            </label>
            <select
              value={requestForm.raised_by}
              onChange={(e) => setRequestForm({ ...requestForm, raised_by: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:border-[#6C63FF] focus:ring-1 focus:ring-[#6C63FF]/50 shadow-inner"
            >
              {DUMMY_EMPLOYEES.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name}
                </option>
              ))}
            </select>
          </div>

          <NeoInput
            id="issue"
            label="Issue Summary"
            placeholder="e.g. Screen Flickering, Battery Bulging..."
            required
            value={requestForm.issue}
            onChange={(e) => setRequestForm({ ...requestForm, issue: e.target.value })}
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Urgency / Priority
            </label>
            <select
              value={requestForm.priority}
              onChange={(e) => setRequestForm({ ...requestForm, priority: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:border-[#6C63FF] focus:ring-1 focus:ring-[#6C63FF]/50 shadow-inner"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
          </div>

          <NeoInput
            id="description"
            label="Detailed Problem Description"
            type="textarea"
            placeholder="Describe when the issue occurs and what symptoms you notice..."
            required
            value={requestForm.description}
            onChange={(e) => setRequestForm({ ...requestForm, description: e.target.value })}
          />

          <NeoInput
            id="photo_url"
            label="Damage Photo URL (Optional)"
            placeholder="e.g. https://domain.com/image.jpg"
            value={requestForm.photo_url}
            onChange={(e) => setRequestForm({ ...requestForm, photo_url: e.target.value })}
          />

          <div className="flex justify-end gap-3 mt-4">
            <NeoButton variant="secondary" onClick={() => setIsRequestOpen(false)}>
              Cancel
            </NeoButton>
            <NeoButton type="submit" variant="primary">
              Submit Ticket
            </NeoButton>
          </div>
        </form>
      </WorkflowModal>

      {/* 2. Approve / Reject Modal */}
      <WorkflowModal
        isOpen={isApproveRejectOpen}
        onClose={() => setIsApproveRejectOpen(false)}
        title="Manager Action: Repair Ticket"
      >
        {selectedRequest && (
          <form className="flex flex-col gap-5">
            <div className="p-3 bg-slate-100 rounded-xl text-xs text-[#6b7280] border border-slate-200">
              <p>
                <strong>Asset:</strong> {getAssetName(selectedRequest.asset_id)}
              </p>
              <p className="mt-1">
                <strong>Reported Issue:</strong> "{selectedRequest.issue}"
              </p>
            </div>

            <NeoInput
              id="remarks"
              label="Review Remarks"
              type="textarea"
              placeholder="Provide comments for approval or reasons for rejection..."
              value={approvalForm.remarks}
              onChange={(e) => setApprovalForm({ remarks: e.target.value })}
            />

            <div className="flex justify-end gap-3 mt-4">
              <NeoButton variant="secondary" onClick={() => setIsApproveRejectOpen(false)}>
                Cancel
              </NeoButton>
              <NeoButton
                onClick={handleReject}
                className="bg-red-650 hover:bg-red-750 text-white shadow-none"
              >
                Reject Ticket
              </NeoButton>
              <NeoButton
                onClick={handleApprove}
                className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-none"
              >
                Approve Ticket
              </NeoButton>
            </div>
          </form>
        )}
      </WorkflowModal>

      {/* 3. Assign Technician Modal */}
      <WorkflowModal
        isOpen={isAssignTechOpen}
        onClose={() => setIsAssignTechOpen(false)}
        title="Assign Repair Technician"
      >
        {selectedRequest && (
          <form onSubmit={handleAssignTech} className="flex flex-col gap-5">
            <div className="p-3 bg-slate-100 rounded-xl text-xs text-[#6b7280] border border-slate-200">
              <p>
                <strong>Asset:</strong> {getAssetName(selectedRequest.asset_id)}
              </p>
              <p className="mt-1">
                <strong>Problem:</strong> "{selectedRequest.issue}"
              </p>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Select Technician
              </label>
              <select
                value={techForm.technician_id}
                onChange={(e) => setTechForm({ technician_id: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:border-[#6C63FF] focus:ring-1 focus:ring-[#6C63FF]/50 shadow-inner"
              >
                {DUMMY_TECHNICIANS.map((tech) => (
                  <option key={tech.id} value={tech.id}>
                    {tech.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <NeoButton variant="secondary" onClick={() => setIsAssignTechOpen(false)}>
                Cancel
              </NeoButton>
              <NeoButton type="submit" variant="primary">
                Assign
              </NeoButton>
            </div>
          </form>
        )}
      </WorkflowModal>

      {/* 4. Resolve Modal */}
      <WorkflowModal
        isOpen={isResolveOpen}
        onClose={() => setIsResolveOpen(false)}
        title="Resolve Repair Ticket"
      >
        {selectedRequest && (
          <form onSubmit={handleResolve} className="flex flex-col gap-5">
            <div className="p-3 bg-slate-100 rounded-xl text-xs text-[#6b7280] border border-slate-200">
              <p>
                <strong>Asset:</strong> {getAssetName(selectedRequest.asset_id)}
              </p>
              <p className="mt-1">
                <strong>Assigned Tech:</strong> {getTechnicianName(selectedRequest.technician_id)}
              </p>
            </div>

            <NeoInput
              id="resolution_remarks"
              label="Resolution Action & Remarks"
              type="textarea"
              placeholder="Describe what repair actions were taken to resolve this problem..."
              required
              value={resolutionForm.remarks}
              onChange={(e) => setResolutionForm({ remarks: e.target.value })}
            />

            <div className="flex justify-end gap-3 mt-4">
              <NeoButton variant="secondary" onClick={() => setIsResolveOpen(false)}>
                Cancel
              </NeoButton>
              <NeoButton type="submit" variant="primary" className="bg-emerald-600 hover:bg-emerald-700">
                Submit Resolution
              </NeoButton>
            </div>
          </form>
        )}
      </WorkflowModal>
    </div>
  )
}
