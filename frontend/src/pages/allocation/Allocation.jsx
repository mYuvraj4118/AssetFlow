import React, { useState, useEffect } from 'react'
import {
  getAllocations,
  createAllocation,
  requestReturn,
  approveReturn,
  getTransfers,
  createTransfer,
  approveTransfer,
  rejectTransfer,
} from '../../services/allocationService'
import NeoCard from '../../components/workflows/NeoCard'
import NeoButton from '../../components/workflows/NeoButton'
import NeoInput from '../../components/workflows/NeoInput'
import StatusBadge from '../../components/workflows/StatusBadge'
import WorkflowModal from '../../components/workflows/WorkflowModal'

// Pre-defined dummy assets and employees for dropdown selections to make testing easier
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

const CURRENT_USER_ID = '65d13f6a9c8d7e6f0a1b2c43' // Mock Logged-in Admin/User

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

export default function Allocation() {
  // Main state lists
  const [allocations, setAllocations] = useState([])
  const [transfers, setTransfers] = useState([])

  // UI status states
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isDemoMode, setIsDemoMode] = useState(false)
  const [toast, setToast] = useState(null)

  // Search & Filter states
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')

  // Modal control states
  const [isAllocateOpen, setIsAllocateOpen] = useState(false)
  const [isTransferOpen, setIsTransferOpen] = useState(false)
  const [isReturnRequestOpen, setIsReturnRequestOpen] = useState(false)
  const [isReturnApprovalOpen, setIsReturnApprovalOpen] = useState(false)

  // Selected records for action flows
  const [selectedAllocation, setSelectedAllocation] = useState(null)

  // Form states
  const [allocateForm, setAllocateForm] = useState({
    asset_id: DUMMY_ASSETS[0].id,
    employee_id: DUMMY_EMPLOYEES[0].id,
    expected_return_date: '',
    condition_at_allocation: 'Excellent',
    allocation_notes: '',
  })

  const [transferForm, setTransferForm] = useState({
    to_employee_id: DUMMY_EMPLOYEES[1].id,
    reason: '',
  })

  const [returnRequestForm, setReturnRequestForm] = useState({
    return_notes: '',
  })

  const [returnApprovalForm, setReturnApprovalForm] = useState({
    condition_at_return: 'Good',
    return_notes: '',
  })

  // Show auto-dismiss toast alerts
  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 4000)
  }

  // Load backend allocations and transfers
  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      const allAllocations = await getAllocations()
      const allTransfers = await getTransfers()
      setAllocations(allAllocations)
      setTransfers(allTransfers)
      setIsDemoMode(false)
    } catch (err) {
      console.warn('Backend API connection failed, loading local demo data...', err.message)
      loadDemoData()
    } finally {
      setLoading(false)
    }
  }

  // Fallback interactive mock data
  const loadDemoData = () => {
    setIsDemoMode(true)
    // Setup initial mock allocations
    const mockAllocations = [
      {
        id: '65d140019c8d7e6f0a1b2c44',
        asset_id: '65d12a1b9c8d7e6f0a1b2c34',
        employee_id: '65d13a1b9c8d7e6f0a1b2c38',
        allocated_by: CURRENT_USER_ID,
        status: 'Active',
        allocation_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        expected_return_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        condition_at_allocation: 'Excellent',
        allocation_notes: 'Standard engineering deployment.',
      },
      {
        id: '65d140029c8d7e6f0a1b2c45',
        asset_id: '65d12b2c9c8d7e6f0a1b2c35',
        employee_id: '65d13b2c9c8d7e6f0a1b2c39',
        allocated_by: CURRENT_USER_ID,
        status: 'Return Requested',
        allocation_date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
        expected_return_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        condition_at_allocation: 'Good',
        allocation_notes: 'Design department extra display.',
        return_notes: 'Finished project, no longer needed.',
      },
      {
        id: '65d140039c8d7e6f0a1b2c46',
        asset_id: '65d12c3d9c8d7e6f0a1b2c36',
        employee_id: '65d13c3d9c8d7e6f0a1b2c40',
        allocated_by: CURRENT_USER_ID,
        status: 'Returned',
        allocation_date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        expected_return_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        actual_return_date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
        condition_at_allocation: 'Excellent',
        condition_at_return: 'Good',
        allocation_notes: 'Temporary testing device.',
        return_notes: 'Returned device after QA run.',
      },
    ]

    // Setup initial mock transfers
    const mockTransfers = [
      {
        id: '65d150019c8d7e6f0a1b2c47',
        asset_id: '65d12a1b9c8d7e6f0a1b2c34',
        from_employee_id: '65d13a1b9c8d7e6f0a1b2c38',
        to_employee_id: '65d13d4e9c8d7e6f0a1b2c41',
        requested_by: '65d13a1b9c8d7e6f0a1b2c38',
        reason: 'Asset handed over directly to Diana for site operations.',
        status: 'Pending',
        created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ]

    setAllocations(mockAllocations)
    setTransfers(mockTransfers)
  }

  useEffect(() => {
    loadData()
  }, [])

  // ==================== WORKFLOW HANDLERS ====================

  // 1. Allocate Asset
  const handleAllocate = async (e) => {
    e.preventDefault()
    // Validation
    if (!allocateForm.asset_id || !allocateForm.employee_id) {
      showToast('Please select an asset and employee.', 'danger')
      return
    }

    const payload = {
      ...allocateForm,
      allocated_by: CURRENT_USER_ID,
      expected_return_date: allocateForm.expected_return_date
        ? new Date(allocateForm.expected_return_date).toISOString()
        : null,
    }

    try {
      if (isDemoMode) {
        // Add to local mock state
        const newAlloc = {
          id: `demo_${Date.now()}`,
          ...payload,
          status: 'Active',
          allocation_date: new Date().toISOString(),
        }
        setAllocations([newAlloc, ...allocations])
      } else {
        await createAllocation(payload)
        await loadData()
      }
      showToast('Asset allocated successfully!')
      setIsAllocateOpen(false)
      // Reset form
      setAllocateForm({
        asset_id: DUMMY_ASSETS[0].id,
        employee_id: DUMMY_EMPLOYEES[0].id,
        expected_return_date: '',
        condition_at_allocation: 'Excellent',
        allocation_notes: '',
      })
    } catch (err) {
      showToast(err.message, 'danger')
    }
  }

  // 2. Request Return
  const handleRequestReturn = async (e) => {
    e.preventDefault()
    if (!selectedAllocation) return

    const payload = {
      requested_by: CURRENT_USER_ID,
      return_notes: returnRequestForm.return_notes,
    }

    try {
      if (isDemoMode) {
        setAllocations(
          allocations.map((a) =>
            a.id === selectedAllocation.id
              ? { ...a, status: 'Return Requested', return_notes: payload.return_notes }
              : a
          )
        )
      } else {
        await requestReturn(selectedAllocation.id, payload)
        await loadData()
      }
      showToast('Return requested successfully.')
      setIsReturnRequestOpen(false)
      setReturnRequestForm({ return_notes: '' })
    } catch (err) {
      showToast(err.message, 'danger')
    }
  }

  // 3. Approve Return
  const handleApproveReturn = async (e) => {
    e.preventDefault()
    if (!selectedAllocation) return

    const payload = {
      approved_by: CURRENT_USER_ID,
      condition_at_return: returnApprovalForm.condition_at_return,
      return_notes: returnApprovalForm.return_notes,
    }

    try {
      if (isDemoMode) {
        setAllocations(
          allocations.map((a) =>
            a.id === selectedAllocation.id
              ? {
                  ...a,
                  status: 'Returned',
                  actual_return_date: new Date().toISOString(),
                  condition_at_return: payload.condition_at_return,
                  return_notes: payload.return_notes,
                }
              : a
          )
        )
      } else {
        await approveReturn(selectedAllocation.id, payload)
        await loadData()
      }
      showToast('Asset return approved and finalized.')
      setIsReturnApprovalOpen(false)
      setReturnApprovalForm({ condition_at_return: 'Good', return_notes: '' })
    } catch (err) {
      showToast(err.message, 'danger')
    }
  }

  // 4. Request Transfer
  const handleCreateTransfer = async (e) => {
    e.preventDefault()
    if (!selectedAllocation) return

    const payload = {
      asset_id: selectedAllocation.asset_id,
      from_employee_id: selectedAllocation.employee_id,
      to_employee_id: transferForm.to_employee_id,
      requested_by: CURRENT_USER_ID,
      reason: transferForm.reason,
    }

    if (payload.from_employee_id === payload.to_employee_id) {
      showToast('New holder must be different from current holder.', 'danger')
      return
    }

    try {
      if (isDemoMode) {
        const newTrans = {
          id: `trans_${Date.now()}`,
          ...payload,
          status: 'Pending',
          created_at: new Date().toISOString(),
        }
        setTransfers([newTrans, ...transfers])
      } else {
        await createTransfer(payload)
        await loadData()
      }
      showToast('Asset transfer request submitted successfully.')
      setIsTransferOpen(false)
      setTransferForm({ to_employee_id: DUMMY_EMPLOYEES[1].id, reason: '' })
    } catch (err) {
      showToast(err.message, 'danger')
    }
  }

  // 5. Approve Transfer
  const handleApproveTransfer = async (transfer) => {
    const payload = {
      approved_by: CURRENT_USER_ID,
      remarks: 'Transfer approved by administrator.',
    }

    try {
      if (isDemoMode) {
        // Complete transfer request
        setTransfers(
          transfers.map((t) =>
            t.id === transfer.id
              ? { ...t, status: 'Completed', approved_by: payload.approved_by, completed_at: new Date().toISOString() }
              : t
          )
        )
        // Also update allocation holder details
        setAllocations(
          allocations.map((a) =>
            a.asset_id === transfer.asset_id && a.status === 'Active'
              ? { ...a, employee_id: transfer.to_employee_id, updated_at: new Date().toISOString() }
              : a
          )
        )
      } else {
        await approveTransfer(transfer.id, payload)
        await loadData()
      }
      showToast('Transfer request approved.')
    } catch (err) {
      showToast(err.message, 'danger')
    }
  }

  // 6. Reject Transfer
  const handleRejectTransfer = async (transfer) => {
    const payload = {
      rejected_by: CURRENT_USER_ID,
      remarks: 'Transfer request rejected.',
    }

    try {
      if (isDemoMode) {
        setTransfers(
          transfers.map((t) =>
            t.id === transfer.id
              ? { ...t, status: 'Rejected', approved_by: payload.rejected_by }
              : t
          )
        )
      } else {
        await rejectTransfer(transfer.id, payload)
        await loadData()
      }
      showToast('Transfer request rejected.', 'warning')
    } catch (err) {
      showToast(err.message, 'danger')
    }
  }

  // ==================== SEARCH AND FILTER ====================

  const filteredAllocations = allocations.filter((alloc) => {
    const assetName = getAssetName(alloc.asset_id).toLowerCase()
    const employeeName = getEmployeeName(alloc.employee_id).toLowerCase()
    const matchesSearch =
      assetName.includes(searchQuery.toLowerCase()) ||
      employeeName.includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === 'All' || alloc.status === statusFilter

    return matchesSearch && matchesStatus
  })

  // ==================== KPI COMPUTATIONS ====================

  const totalAllocated = allocations.filter((a) => a.status === 'Active').length
  const pendingReturns = allocations.filter((a) => a.status === 'Return Requested').length
  const pendingTransfers = transfers.filter((t) => t.status === 'Pending').length
  const totalCompleted = allocations.filter((a) => a.status === 'Returned').length

  return (
    <div className="min-h-screen bg-[#e0e5ec] p-6 md:p-10 font-body relative text-[#3d4852]">
      {/* Toast Notification */}
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

      {/* Demo Mode Banner */}
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

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[#3d4852] font-display">
            Asset Allocations & Transfers
          </h1>
          <p className="text-[#6b7280] text-sm mt-1">
            Dispatch items, manage current custodians, book returns, and direct direct transfers.
          </p>
        </div>
        <NeoButton
          variant="primary"
          onClick={() => setIsAllocateOpen(true)}
          className="self-start md:self-auto"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Allocate New Asset
        </NeoButton>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <NeoCard className="neo-extruded flex items-center justify-between">
          <div>
            <span className="text-[#6b7280] text-xs font-bold uppercase tracking-wider block">Active Dispatches</span>
            <span className="text-3xl font-extrabold text-[#3d4852] font-display block mt-1">{totalAllocated}</span>
          </div>
          <div className="p-3 bg-[#e0e5ec] rounded-xl shadow-[inset_2px_2px_5px_rgba(0,0,0,0.1),_inset_-2px_-2px_5px_rgba(255,255,255,0.7)] text-[#6C63FF]">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </div>
        </NeoCard>

        <NeoCard className="neo-extruded flex items-center justify-between">
          <div>
            <span className="text-[#6b7280] text-xs font-bold uppercase tracking-wider block">Return Requests</span>
            <span className="text-3xl font-extrabold text-[#3d4852] font-display block mt-1">{pendingReturns}</span>
          </div>
          <div className="p-3 bg-[#e0e5ec] rounded-xl shadow-[inset_2px_2px_5px_rgba(0,0,0,0.1),_inset_-2px_-2px_5px_rgba(255,255,255,0.7)] text-amber-500">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 15v-6a4 4 0 00-4-4H4m0 0l4-4m-4 4l4 4m12 12H10" />
            </svg>
          </div>
        </NeoCard>

        <NeoCard className="neo-extruded flex items-center justify-between">
          <div>
            <span className="text-[#6b7280] text-xs font-bold uppercase tracking-wider block">Pending Transfers</span>
            <span className="text-3xl font-extrabold text-[#3d4852] font-display block mt-1">{pendingTransfers}</span>
          </div>
          <div className="p-3 bg-[#e0e5ec] rounded-xl shadow-[inset_2px_2px_5px_rgba(0,0,0,0.1),_inset_-2px_-2px_5px_rgba(255,255,255,0.7)] text-blue-500">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </NeoCard>

        <NeoCard className="neo-extruded flex items-center justify-between">
          <div>
            <span className="text-[#6b7280] text-xs font-bold uppercase tracking-wider block">Returned Assets</span>
            <span className="text-3xl font-extrabold text-[#3d4852] font-display block mt-1">{totalCompleted}</span>
          </div>
          <div className="p-3 bg-[#e0e5ec] rounded-xl shadow-[inset_2px_2px_5px_rgba(0,0,0,0.1),_inset_-2px_-2px_5px_rgba(255,255,255,0.7)] text-emerald-500">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </NeoCard>
      </div>

      {/* Main Allocations Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-10">
        
        {/* Allocations Table + Filters */}
        <div className="xl:col-span-2 flex flex-col gap-6">
          <NeoCard className="neo-extruded flex-1">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
              <h2 className="text-xl font-bold text-[#3d4852] font-display self-start">
                Active Allocations
              </h2>
              {/* Search input with inset neumorphism */}
              <div className="w-full sm:w-72 relative">
                <input
                  type="text"
                  placeholder="Search asset or employee..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-transparent bg-[#e0e5ec] shadow-[inset_3px_3px_6px_var(--af-shadow-dark),_inset_-3px_-3px_6px_var(--af-shadow-light)] focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/30 text-[#3d4852]"
                />
                <svg
                  className="absolute left-3.5 top-2.5 w-4 h-4 text-[#6b7280]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Filter Badges */}
            <div className="flex flex-wrap gap-2 mb-6">
              {['All', 'Active', 'Return Requested', 'Returned'].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold tracking-wider transition-all duration-200 ${
                    statusFilter === status
                      ? 'bg-[#6C63FF] text-white shadow-[inset_2px_2px_4px_rgba(0,0,0,0.2)]'
                      : 'bg-[#e0e5ec] text-[#6b7280] shadow-[2px_2px_5px_var(--af-shadow-dark),_-2px_-2px_5px_var(--af-shadow-light)] hover:text-[#3d4852]'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>

            {/* Table Container */}
            {loading ? (
              <div className="py-20 text-center">
                <div className="inline-block w-8 h-8 rounded-full border-4 border-slate-300 border-t-[#6C63FF] animate-spin mb-4" />
                <p className="text-sm text-[#6b7280] font-medium">Fetching allocations...</p>
              </div>
            ) : filteredAllocations.length === 0 ? (
              <div className="py-20 text-center rounded-2xl bg-[#e0e5ec] border border-dashed border-slate-350">
                <svg className="w-12 h-12 text-[#6b7280] mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                <h3 className="text-lg font-bold text-[#3d4852]">No Allocations Found</h3>
                <p className="text-[#6b7280] text-sm mt-1 max-w-xs mx-auto">
                  Try checking other filters or register a new asset allocation.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-300 text-xs font-bold uppercase tracking-wider text-[#6b7280]">
                      <th className="py-3 px-4">Asset</th>
                      <th className="py-3 px-4">Custodian</th>
                      <th className="py-3 px-4">Allocation Date</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-300 text-sm">
                    {filteredAllocations.map((alloc) => (
                      <tr key={alloc.id} className="hover:bg-slate-100/30 transition-colors">
                        <td className="py-4 px-4 font-semibold text-[#3d4852]">
                          {getAssetName(alloc.asset_id)}
                        </td>
                        <td className="py-4 px-4 text-slate-600">
                          {getEmployeeName(alloc.employee_id)}
                        </td>
                        <td className="py-4 px-4 text-xs text-[#6b7280]">
                          {new Date(alloc.allocation_date).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-4">
                          <StatusBadge status={alloc.status} />
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="inline-flex gap-2">
                            {alloc.status === 'Active' && (
                              <>
                                <button
                                  onClick={() => {
                                    setSelectedAllocation(alloc)
                                    setIsTransferOpen(true)
                                  }}
                                  className="px-3 py-1 rounded-lg text-xs font-semibold bg-[#e0e5ec] text-[#6C63FF] border border-transparent shadow-[2px_2px_4px_var(--af-shadow-dark),_-2px_-2px_4px_var(--af-shadow-light)] hover:shadow-sm active:scale-95 transition-all"
                                >
                                  Transfer
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedAllocation(alloc)
                                    setIsReturnRequestOpen(true)
                                  }}
                                  className="px-3 py-1 rounded-lg text-xs font-semibold bg-[#e0e5ec] text-amber-600 border border-transparent shadow-[2px_2px_4px_var(--af-shadow-dark),_-2px_-2px_4px_var(--af-shadow-light)] hover:shadow-sm active:scale-95 transition-all"
                                >
                                  Request Return
                                </button>
                              </>
                            )}
                            {alloc.status === 'Return Requested' && (
                              <button
                                onClick={() => {
                                  setSelectedAllocation(alloc)
                                  setIsReturnApprovalOpen(true)
                                }}
                                className="px-3 py-1 rounded-lg text-xs font-semibold bg-[#e0e5ec] text-emerald-600 border border-transparent shadow-[2px_2px_4px_var(--af-shadow-dark),_-2px_-2px_4px_var(--af-shadow-light)] hover:shadow-sm active:scale-95 transition-all"
                              >
                                Approve Return
                              </button>
                            )}
                            {alloc.status === 'Returned' && (
                              <span className="text-xs text-[#6b7280] italic">
                                Returned on {new Date(alloc.actual_return_date).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </NeoCard>
        </div>

        {/* Transfers Column Section */}
        <div className="flex flex-col gap-6">
          <NeoCard className="neo-extruded flex flex-col">
            <h2 className="text-xl font-bold text-[#3d4852] font-display mb-4">
              Direct Custody Transfers
            </h2>
            <p className="text-[#6b7280] text-xs mb-6">
              Track requests for shifting ownership of active assets directly between employees.
            </p>

            <div className="flex flex-col gap-4 overflow-y-auto max-h-[500px] pr-2">
              {transfers.length === 0 ? (
                <div className="py-12 text-center border border-dashed border-slate-350 rounded-xl">
                  <p className="text-xs text-[#6b7280]">No custody transfer logs yet.</p>
                </div>
              ) : (
                transfers.map((transfer) => (
                  <div
                    key={transfer.id}
                    className="p-4 rounded-xl bg-[#e0e5ec] border border-slate-200/50 shadow-[3px_3px_6px_var(--af-shadow-dark),_-3px_-3px_6px_var(--af-shadow-light)]"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-slate-800">
                        {getAssetName(transfer.asset_id)}
                      </span>
                      <StatusBadge status={transfer.status} className="scale-90" />
                    </div>

                    <div className="text-xs text-[#6b7280] mb-3">
                      <p>
                        <strong>From:</strong> {getEmployeeName(transfer.from_employee_id)}
                      </p>
                      <p>
                        <strong>To:</strong> {getEmployeeName(transfer.to_employee_id)}
                      </p>
                      <p className="mt-1 italic text-slate-700">"{transfer.reason}"</p>
                    </div>

                    {transfer.status === 'Pending' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApproveTransfer(transfer)}
                          className="flex-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm transition-colors text-center"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleRejectTransfer(transfer)}
                          className="flex-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#e0e5ec] text-red-600 border border-transparent shadow-[2px_2px_4px_var(--af-shadow-dark),_-2px_-2px_4px_var(--af-shadow-light)] hover:bg-red-50 hover:text-red-750 transition-colors text-center"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </NeoCard>
        </div>
      </div>

      {/* ==================== WORKFLOW MODALS ==================== */}

      {/* 1. Allocate Asset Modal */}
      <WorkflowModal
        isOpen={isAllocateOpen}
        onClose={() => setIsAllocateOpen(false)}
        title="Create New Asset Allocation"
      >
        <form onSubmit={handleAllocate} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Select Asset
            </label>
            <select
              value={allocateForm.asset_id}
              onChange={(e) => setAllocateForm({ ...allocateForm, asset_id: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 transition-all focus:outline-none focus:border-[#6C63FF] focus:ring-1 focus:ring-[#6C63FF]/50 shadow-inner"
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
              Select Custodian Employee
            </label>
            <select
              value={allocateForm.employee_id}
              onChange={(e) => setAllocateForm({ ...allocateForm, employee_id: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 transition-all focus:outline-none focus:border-[#6C63FF] focus:ring-1 focus:ring-[#6C63FF]/50 shadow-inner"
            >
              {DUMMY_EMPLOYEES.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name}
                </option>
              ))}
            </select>
          </div>

          <NeoInput
            id="expected_return_date"
            label="Expected Return Date"
            type="date"
            value={allocateForm.expected_return_date}
            onChange={(e) => setAllocateForm({ ...allocateForm, expected_return_date: e.target.value })}
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Condition at Allocation
            </label>
            <select
              value={allocateForm.condition_at_allocation}
              onChange={(e) => setAllocateForm({ ...allocateForm, condition_at_allocation: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 transition-all focus:outline-none focus:border-[#6C63FF] focus:ring-1 focus:ring-[#6C63FF]/50 shadow-inner"
            >
              <option value="Excellent">Excellent</option>
              <option value="Good">Good</option>
              <option value="Fair">Fair</option>
              <option value="Damaged">Damaged</option>
            </select>
          </div>

          <NeoInput
            id="allocation_notes"
            label="Allocation Notes"
            type="textarea"
            placeholder="Add reason, accessories included, or references..."
            value={allocateForm.allocation_notes}
            onChange={(e) => setAllocateForm({ ...allocateForm, allocation_notes: e.target.value })}
          />

          <div className="flex justify-end gap-3 mt-4">
            <NeoButton variant="secondary" onClick={() => setIsAllocateOpen(false)}>
              Cancel
            </NeoButton>
            <NeoButton type="submit" variant="primary">
              Confirm Allocation
            </NeoButton>
          </div>
        </form>
      </WorkflowModal>

      {/* 2. Direct Custody Transfer Modal */}
      <WorkflowModal
        isOpen={isTransferOpen}
        onClose={() => setIsTransferOpen(false)}
        title="Direct Custody Transfer Request"
      >
        {selectedAllocation && (
          <form onSubmit={handleCreateTransfer} className="flex flex-col gap-5">
            <div className="p-3 bg-slate-100 rounded-xl text-xs text-[#6b7280] border border-slate-200">
              <p>
                <strong>Asset:</strong> {getAssetName(selectedAllocation.asset_id)}
              </p>
              <p className="mt-1">
                <strong>Current Custodian:</strong> {getEmployeeName(selectedAllocation.employee_id)}
              </p>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Transfer Ownership To
              </label>
              <select
                value={transferForm.to_employee_id}
                onChange={(e) => setTransferForm({ ...transferForm, to_employee_id: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 transition-all focus:outline-none focus:border-[#6C63FF] focus:ring-1 focus:ring-[#6C63FF]/50 shadow-inner"
              >
                {DUMMY_EMPLOYEES.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name}
                  </option>
                ))}
              </select>
            </div>

            <NeoInput
              id="reason"
              label="Reason for Transfer"
              type="textarea"
              placeholder="Explain the hand-over reason..."
              required
              value={transferForm.reason}
              onChange={(e) => setTransferForm({ ...transferForm, reason: e.target.value })}
            />

            <div className="flex justify-end gap-3 mt-4">
              <NeoButton variant="secondary" onClick={() => setIsTransferOpen(false)}>
                Cancel
              </NeoButton>
              <NeoButton type="submit" variant="primary">
                Submit Request
              </NeoButton>
            </div>
          </form>
        )}
      </WorkflowModal>

      {/* 3. Return Request Modal */}
      <WorkflowModal
        isOpen={isReturnRequestOpen}
        onClose={() => setIsReturnRequestOpen(false)}
        title="Request Return to Storage"
      >
        {selectedAllocation && (
          <form onSubmit={handleRequestReturn} className="flex flex-col gap-5">
            <p className="text-sm text-[#6b7280]">
              Are you sure you want to flag <strong>{getAssetName(selectedAllocation.asset_id)}</strong> as returning to storage? This notifies the stock manager for review.
            </p>

            <NeoInput
              id="return_notes"
              label="Return Remarks / Notes"
              type="textarea"
              placeholder="Why is it being returned? (e.g. Completed project, upgrading device...)"
              value={returnRequestForm.return_notes}
              onChange={(e) => setReturnRequestForm({ return_notes: e.target.value })}
            />

            <div className="flex justify-end gap-3 mt-4">
              <NeoButton variant="secondary" onClick={() => setIsReturnRequestOpen(false)}>
                Cancel
              </NeoButton>
              <NeoButton type="submit" variant="primary" className="bg-amber-600 hover:bg-amber-700">
                Submit Request
              </NeoButton>
            </div>
          </form>
        )}
      </WorkflowModal>

      {/* 4. Return Approval Modal */}
      <WorkflowModal
        isOpen={isReturnApprovalOpen}
        onClose={() => setIsReturnApprovalOpen(false)}
        title="Approve & Finalize Asset Return"
      >
        {selectedAllocation && (
          <form onSubmit={handleApproveReturn} className="flex flex-col gap-5">
            <div className="p-3 bg-slate-100 rounded-xl text-xs text-[#6b7280] border border-slate-200">
              <p>
                <strong>Asset:</strong> {getAssetName(selectedAllocation.asset_id)}
              </p>
              <p className="mt-1">
                <strong>Returning From:</strong> {getEmployeeName(selectedAllocation.employee_id)}
              </p>
              {selectedAllocation.return_notes && (
                <p className="mt-1.5 italic text-slate-700">
                  "Custodian note: {selectedAllocation.return_notes}"
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Condition on Receipt
              </label>
              <select
                value={returnApprovalForm.condition_at_return}
                onChange={(e) => setReturnApprovalForm({ ...returnApprovalForm, condition_at_return: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 transition-all focus:outline-none focus:border-[#6C63FF] focus:ring-1 focus:ring-[#6C63FF]/50 shadow-inner"
              >
                <option value="Excellent">Excellent</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
                <option value="Damaged">Damaged</option>
              </select>
            </div>

            <NeoInput
              id="approval_return_notes"
              label="Manager Final Remarks"
              type="textarea"
              placeholder="Assess condition, confirm accessories, storage bin, etc..."
              value={returnApprovalForm.return_notes}
              onChange={(e) => setReturnApprovalForm({ ...returnApprovalForm, return_notes: e.target.value })}
            />

            <div className="flex justify-end gap-3 mt-4">
              <NeoButton variant="secondary" onClick={() => setIsReturnApprovalOpen(false)}>
                Cancel
              </NeoButton>
              <NeoButton type="submit" variant="primary" className="bg-emerald-600 hover:bg-emerald-700">
                Confirm & Re-stock
              </NeoButton>
            </div>
          </form>
        )}
      </WorkflowModal>
    </div>
  )
}
