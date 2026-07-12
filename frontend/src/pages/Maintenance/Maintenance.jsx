import React, { useState, useEffect } from 'react';
import {
  Wrench,
  ShieldAlert,
  AlertTriangle,
  AlertCircle,
  Plus,
  CheckCircle,
  Clock,
  Bell,
  X
} from 'lucide-react';
import {
  getMaintenanceRequests,
  createMaintenanceRequest,
  approveMaintenanceRequest,
  rejectMaintenanceRequest,
  assignTechnician,
  startMaintenance,
  resolveMaintenance,
} from '../../services/maintenanceService';
import PageContainer from '../../components/layout/PageContainer';
import { Card, Button, Badge, SearchBar, EmptyState, Loader, StatCard, Input } from '../../components/common';
import StatusBadge from '../../components/workflows/StatusBadge';
import WorkflowModal from '../../components/workflows/WorkflowModal';
import './Maintenance.css';


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
  const p = String(priority || '').toLowerCase();
  
  const getVariant = (val) => {
    switch (val) {
      case 'critical':
      case 'high':
        return 'danger';
      case 'medium':
        return 'warning';
      case 'low':
      default:
        return 'neutral';
    }
  };

  return (
    <Badge 
      variant={getVariant(p)} 
      inset={false} 
      className={className}
      style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}
    >
      {priority}
    </Badge>
  );
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
    <PageContainer title="Maintenance Management">
      {/* Toast Alert */}
      {toast && (
        <Card 
          variant="flat" 
          className="maintenance-toast p-md rounded-md d-flex justify-between align-center animate-fade-in"
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

      {/* Demo Sandbox Mode Banner */}
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
      <div className="maintenance-header-wrapper">
        <div className="maintenance-title-section">
          <p>
            File repair logs, approve tickets, assign specialized technicians, and verify resolutions.
          </p>
        </div>
        <Button 
          variant="primary" 
          onClick={() => setIsRequestOpen(true)}
          icon={<Plus size={18} />}
        >
          Raise Repair Ticket
        </Button>
      </div>

      {/* KPIs Grid */}
      <div className="maintenance-stats-grid">
        <StatCard
          title="Pending Approvals"
          value={countPending}
          icon={<ShieldAlert size={20} className="text-warning" />}
        />
        <StatCard
          title="Active Jobs"
          value={countActive}
          icon={<Wrench size={20} className="text-primary" />}
        />
        <StatCard
          title="Resolved Issues"
          value={countResolved}
          icon={<CheckCircle size={20} className="text-success" />}
        />
        <StatCard
          title="Critical Unresolved"
          value={countCritical}
          icon={<AlertTriangle size={20} className="text-danger" />}
        />
      </div>

      {/* Content Section */}
      <div className="d-flex flex-col gap-lg">
        
        {/* Filter Control panel */}
        <Card variant="flat" className="maintenance-filter-card">
          <div className="maintenance-filter-toolbar">
            
            {/* Search Input */}
            <div className="maintenance-search-wrapper">
              <SearchBar
                placeholder="Search asset, issue description, or tech..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="maintenance-selectors-row">
              
              {/* Status Selector */}
              <div className="maintenance-select-group">
                <span>Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="org-select"
                  style={{ width: 'auto', padding: 'var(--spacing-xs) var(--spacing-sm)', fontSize: 'var(--text-xs)', height: 'auto' }}
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
              <div className="maintenance-select-group">
                <span>Priority:</span>
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="org-select"
                  style={{ width: 'auto', padding: 'var(--spacing-xs) var(--spacing-sm)', fontSize: 'var(--text-xs)', height: 'auto' }}
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
        </Card>

        {/* Requests List */}
        {loading ? (
          <div className="py-xl">
            <Loader text="Loading repair tickets..." size="lg" />
          </div>
        ) : filteredRequests.length === 0 ? (
          <EmptyState
            title="No Maintenance Tickets Found"
            description="Check filters or raise a new repair log for damaged assets."
            icon={<AlertCircle size={36} className="text-primary" />}
            actionButton={
              <Button variant="primary" onClick={() => setIsRequestOpen(true)} icon={<Plus size={16} />}>
                Raise Ticket
              </Button>
            }
          />
        ) : (
          <div className="maintenance-ticket-grid">
            {filteredRequests.map((req) => (
              <div key={req.id} className="ticket-card">
                {/* Upper Details */}
                <div>
                  <div className="ticket-card-header">
                    <span className="ticket-card-id">
                      Ticket #{req.id.substring(req.id.length - 6).toUpperCase()}
                    </span>
                    <div className="d-flex align-center gap-xs">
                      <PriorityBadge priority={req.priority} />
                      <StatusBadge status={req.status} />
                    </div>
                  </div>

                  {/* Photo Display if available */}
                  {req.photo_url && (
                    <div className="ticket-card-image-box">
                      <img
                        src={req.photo_url}
                        alt="Asset damage"
                        onError={(e) => { e.target.style.display = 'none' }}
                      />
                    </div>
                  )}

                  <h3 className="ticket-card-title">
                    {req.issue}
                  </h3>
                  
                  <p className="ticket-card-asset">
                    {getAssetName(req.asset_id)}
                  </p>

                  <p className="ticket-card-desc">
                    {req.description}
                  </p>

                  {/* Workflow Log Details */}
                  <div className="ticket-card-details-box">
                    <p>
                      <strong>Raised By:</strong> {getEmployeeName(req.raised_by)}
                    </p>
                    {req.technician_id && (
                      <p>
                        <strong>Technician:</strong> {getTechnicianName(req.technician_id)}
                      </p>
                    )}
                    {req.approval_remarks && (
                      <p className="italic-note">
                        <strong>Approval remarks:</strong> "{req.approval_remarks}"
                      </p>
                    )}
                    {req.resolution_remarks && (
                      <p className="italic-note">
                        <strong>Resolution remarks:</strong> "{req.resolution_remarks}"
                      </p>
                    )}
                  </div>
                </div>

                {/* Workflow Buttons */}
                <div className="ticket-card-actions">
                  {req.status === 'Pending' && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        setSelectedRequest(req)
                        setIsApproveRejectOpen(true)
                      }}
                    >
                      Approve / Reject
                    </Button>
                  )}

                  {req.status === 'Approved' && (
                    <Button
                      variant="flat"
                      size="sm"
                      onClick={() => {
                        setSelectedRequest(req)
                        setIsAssignTechOpen(true)
                      }}
                      style={{ color: 'var(--color-primary-dark)' }}
                    >
                      Assign Technician
                    </Button>
                  )}

                  {req.status === 'Technician Assigned' && (
                    <Button
                      variant="flat"
                      size="sm"
                      onClick={() => handleStartWork(req)}
                      style={{ color: 'var(--color-info-dark)' }}
                    >
                      Start Work (In-Progress)
                    </Button>
                  )}

                  {req.status === 'In Progress' && (
                    <Button
                      variant="flat"
                      size="sm"
                      onClick={() => {
                        setSelectedRequest(req)
                        setIsResolveOpen(true)
                      }}
                      style={{ color: 'var(--color-success)' }}
                    >
                      Mark Resolved
                    </Button>
                  )}

                  {req.status === 'Resolved' && (
                    <span className="ticket-status-label resolved">
                      Resolved on {new Date(req.resolved_at).toLocaleDateString()}
                    </span>
                  )}

                  {req.status === 'Rejected' && (
                    <span className="ticket-status-label rejected">
                      Request Rejected
                    </span>
                  )}
                </div>
              </div>
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
        <form onSubmit={handleCreateRequest} className="d-flex flex-col gap-md">
          <div className="form-field-group">
            <label htmlFor="affected_asset_select">Select Affected Asset</label>
            <select
              id="affected_asset_select"
              value={requestForm.asset_id}
              onChange={(e) => setRequestForm({ ...requestForm, asset_id: e.target.value })}
              className="org-select"
            >
              {DUMMY_ASSETS.map((asset) => (
                <option key={asset.id} value={asset.id}>
                  {asset.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-field-group">
            <label htmlFor="reported_by_select">Reported By (Employee)</label>
            <select
              id="reported_by_select"
              value={requestForm.raised_by}
              onChange={(e) => setRequestForm({ ...requestForm, raised_by: e.target.value })}
              className="org-select"
            >
              {DUMMY_EMPLOYEES.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name}
                </option>
              ))}
            </select>
          </div>

          <Input
            id="issue"
            label="Issue Summary"
            placeholder="e.g. Screen Flickering, Battery Bulging..."
            required
            value={requestForm.issue}
            onChange={(e) => setRequestForm({ ...requestForm, issue: e.target.value })}
          />

          <div className="form-field-group">
            <label htmlFor="priority_select">Urgency / Priority</label>
            <select
              id="priority_select"
              value={requestForm.priority}
              onChange={(e) => setRequestForm({ ...requestForm, priority: e.target.value })}
              className="org-select"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
          </div>

          <div className="form-field-group">
            <label htmlFor="problem_description_textarea">Detailed Problem Description</label>
            <textarea
              id="problem_description_textarea"
              placeholder="Describe when the issue occurs and what symptoms you notice..."
              required
              value={requestForm.description}
              onChange={(e) => setRequestForm({ ...requestForm, description: e.target.value })}
              className="nm-field"
              rows={3}
            />
          </div>

          <Input
            id="photo_url"
            label="Damage Photo URL (Optional)"
            placeholder="e.g. https://domain.com/image.jpg"
            value={requestForm.photo_url}
            onChange={(e) => setRequestForm({ ...requestForm, photo_url: e.target.value })}
          />

          <div className="d-flex justify-end gap-sm mt-md">
            <Button variant="flat" onClick={() => setIsRequestOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Submit Ticket
            </Button>
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
          <form className="d-flex flex-col gap-md" onSubmit={(e) => e.preventDefault()}>
            <Card variant="flat" padding="sm" className="nm-inset text-muted" style={{ fontSize: 'var(--text-xs)' }}>
              <p>
                <strong>Asset:</strong> {getAssetName(selectedRequest.asset_id)}
              </p>
              <p className="mt-xs">
                <strong>Reported Issue:</strong> "{selectedRequest.issue}"
              </p>
            </Card>

            <div className="form-field-group">
              <label htmlFor="review_remarks_textarea">Review Remarks</label>
              <textarea
                id="review_remarks_textarea"
                placeholder="Provide comments for approval or reasons for rejection..."
                value={approvalForm.remarks}
                onChange={(e) => setApprovalForm({ remarks: e.target.value })}
                className="nm-field"
                rows={3}
              />
            </div>

            <div className="d-flex justify-end gap-sm mt-md">
              <Button variant="flat" onClick={() => setIsApproveRejectOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleReject}
                style={{ backgroundColor: 'var(--color-danger)', color: 'var(--color-text-inverse)' }}
              >
                Reject Ticket
              </Button>
              <Button
                onClick={handleApprove}
                style={{ backgroundColor: 'var(--color-success)', color: 'var(--color-text-inverse)' }}
              >
                Approve Ticket
              </Button>
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
          <form onSubmit={handleAssignTech} className="d-flex flex-col gap-md">
            <Card variant="flat" padding="sm" className="nm-inset text-muted" style={{ fontSize: 'var(--text-xs)' }}>
              <p>
                <strong>Asset:</strong> {getAssetName(selectedRequest.asset_id)}
              </p>
              <p className="mt-xs">
                <strong>Problem:</strong> "{selectedRequest.issue}"
              </p>
            </Card>

            <div className="form-field-group">
              <label htmlFor="tech_select">Select Technician</label>
              <select
                id="tech_select"
                value={techForm.technician_id}
                onChange={(e) => setTechForm({ technician_id: e.target.value })}
                className="org-select"
              >
                {DUMMY_TECHNICIANS.map((tech) => (
                  <option key={tech.id} value={tech.id}>
                    {tech.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="d-flex justify-end gap-sm mt-md">
              <Button variant="flat" onClick={() => setIsAssignTechOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Assign
              </Button>
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
          <form onSubmit={handleResolve} className="d-flex flex-col gap-md">
            <Card variant="flat" padding="sm" className="nm-inset text-muted" style={{ fontSize: 'var(--text-xs)' }}>
              <p>
                <strong>Asset:</strong> {getAssetName(selectedRequest.asset_id)}
              </p>
              <p className="mt-xs">
                <strong>Assigned Tech:</strong> {getTechnicianName(selectedRequest.technician_id)}
              </p>
            </Card>

            <div className="form-field-group">
              <label htmlFor="resolution_remarks_textarea">Resolution Action & Remarks</label>
              <textarea
                id="resolution_remarks_textarea"
                placeholder="Describe what repair actions were taken to resolve this problem..."
                required
                value={resolutionForm.remarks}
                onChange={(e) => setResolutionForm({ remarks: e.target.value })}
                className="nm-field"
                rows={3}
              />
            </div>

            <div className="d-flex justify-end gap-sm mt-md">
              <Button variant="flat" onClick={() => setIsResolveOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" style={{ backgroundColor: 'var(--color-success)', color: 'var(--color-text-inverse)' }}>
                Submit Resolution
              </Button>
            </div>
          </form>
        )}
      </WorkflowModal>
    </PageContainer>
  )
}
