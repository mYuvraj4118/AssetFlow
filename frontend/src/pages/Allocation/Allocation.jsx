import React, { useState, useEffect } from 'react';
import {
  Share2,
  Clock,
  ArrowLeftRight,
  CheckCircle,
  Plus,
  AlertCircle,
  Bell,
  X
} from 'lucide-react';
import {
  getAllocations,
  createAllocation,
  requestReturn,
  approveReturn,
  getTransfers,
  createTransfer,
  approveTransfer,
  rejectTransfer,
} from '../../services/allocationService';
import PageContainer from '../../components/layout/PageContainer';
import { Card, Button, Badge, SearchBar, EmptyState, Loader, StatCard, Input } from '../../components/common';
import StatusBadge from '../../components/workflows/StatusBadge';
import WorkflowModal from '../../components/workflows/WorkflowModal';
import './Allocation.css';


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
    <PageContainer title="Asset Allocation & Transfers">
      {/* Toast Notification */}
      {toast && (
        <Card 
          variant="flat" 
          className="allocation-toast p-md rounded-md d-flex justify-between align-center animate-fade-in"
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

      {/* Demo Mode Banner */}
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
      <div className="allocation-header-wrapper">
        <div className="allocation-title-section">
          <p>
            Dispatch items, manage current custodians, book returns, and direct direct transfers.
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => setIsAllocateOpen(true)}
          icon={<Plus size={18} />}
        >
          Allocate New Asset
        </Button>
      </div>

      {/* KPI Cards Grid */}
      <div className="allocation-stats-grid">
        <StatCard
          title="Active Dispatches"
          value={totalAllocated}
          icon={<Share2 size={20} className="text-primary" />}
        />
        <StatCard
          title="Return Requests"
          value={pendingReturns}
          icon={<Clock size={20} className="text-warning" />}
        />
        <StatCard
          title="Pending Transfers"
          value={pendingTransfers}
          icon={<ArrowLeftRight size={20} className="text-info" />}
        />
        <StatCard
          title="Returned Assets"
          value={totalCompleted}
          icon={<CheckCircle size={20} className="text-success" />}
        />
      </div>

      {/* Main Allocations Section */}
      <div className="allocation-grid">
        
        {/* Allocations Table + Filters */}
        <div className="d-flex flex-col gap-lg">
          <Card variant="flat" className="p-lg">
            <div className="allocation-toolbar">
              <h2 className="text-heading font-semibold text-lg-sz m-0">
                Active Allocations
              </h2>
              {/* Search input using common SearchBar */}
              <div className="allocation-search-wrapper">
                <SearchBar
                  placeholder="Search asset or employee..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Filter Badges */}
            <div className="allocation-filters-row mb-md">
              {['All', 'Active', 'Return Requested', 'Returned'].map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setStatusFilter(status)}
                  className={`allocation-filter-btn ${statusFilter === status ? 'active' : ''}`}
                >
                  {status}
                </button>
              ))}
            </div>

            {/* Table Container */}
            {loading ? (
              <div className="py-xl">
                <Loader text="Fetching allocations..." size="lg" />
              </div>
            ) : filteredAllocations.length === 0 ? (
              <EmptyState
                title="No Allocations Found"
                description="Try checking other filters or register a new asset allocation."
                icon={<AlertCircle size={36} className="text-primary" />}
                actionButton={
                  <Button variant="primary" onClick={() => setIsAllocateOpen(true)} icon={<Plus size={16} />}>
                    Allocate Asset
                  </Button>
                }
              />
            ) : (
              <div className="allocation-table-wrapper">
                <table className="allocation-table">
                  <thead>
                    <tr>
                      <th>Asset</th>
                      <th>Custodian</th>
                      <th>Allocation Date</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAllocations.map((alloc) => (
                      <tr key={alloc.id}>
                        <td className="font-semibold text-heading">
                          {getAssetName(alloc.asset_id)}
                        </td>
                        <td>
                          {getEmployeeName(alloc.employee_id)}
                        </td>
                        <td style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                          {new Date(alloc.allocation_date).toLocaleDateString()}
                        </td>
                        <td>
                          <StatusBadge status={alloc.status} />
                        </td>
                        <td>
                          <div className="d-flex justify-end gap-xs">
                            {alloc.status === 'Active' && (
                              <>
                                <Button
                                  variant="flat"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedAllocation(alloc);
                                    setIsTransferOpen(true);
                                  }}
                                >
                                  Transfer
                                </Button>
                                <Button
                                  variant="flat"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedAllocation(alloc);
                                    setIsReturnRequestOpen(true);
                                  }}
                                  style={{ color: 'var(--color-warning-dark)' }}
                                >
                                  Request Return
                                </Button>
                              </>
                            )}
                            {alloc.status === 'Return Requested' && (
                              <Button
                                variant="flat"
                                size="sm"
                                onClick={() => {
                                  setSelectedAllocation(alloc);
                                  setIsReturnApprovalOpen(true);
                                }}
                                style={{ color: 'var(--color-success)' }}
                              >
                                Approve Return
                              </Button>
                            )}
                            {alloc.status === 'Returned' && (
                              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
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
          </Card>
        </div>

        {/* Transfers Column Section */}
        <div className="d-flex flex-col gap-lg">
          <Card variant="flat" className="p-lg d-flex flex-col">
            <h2 className="text-heading font-semibold text-lg-sz m-0 mb-sm">
              Direct Custody Transfers
            </h2>
            <p className="text-muted" style={{ fontSize: 'var(--text-xs)', marginBottom: 'var(--spacing-md)' }}>
              Track requests for shifting ownership of active assets directly between employees.
            </p>

            <div className="transfer-list-container">
              {transfers.length === 0 ? (
                <EmptyState
                  title="No Transfers"
                  description="No custody transfer logs yet."
                  padding="sm"
                />
              ) : (
                transfers.map((transfer) => (
                  <div key={transfer.id} className="transfer-item-card">
                    <div className="transfer-item-header">
                      <span className="transfer-item-title">
                        {getAssetName(transfer.asset_id)}
                      </span>
                      <StatusBadge status={transfer.status} />
                    </div>

                    <div className="transfer-item-details">
                      <p><strong>From:</strong> {getEmployeeName(transfer.from_employee_id)}</p>
                      <p><strong>To:</strong> {getEmployeeName(transfer.to_employee_id)}</p>
                      <p className="transfer-item-reason">"{transfer.reason}"</p>
                    </div>

                    {transfer.status === 'Pending' && (
                      <div className="d-flex gap-sm">
                        <Button
                          variant="flat"
                          size="sm"
                          style={{ color: 'var(--color-success)', flex: 1 }}
                          onClick={() => handleApproveTransfer(transfer)}
                        >
                          Approve
                        </Button>
                        <Button
                          variant="flat"
                          size="sm"
                          style={{ color: 'var(--color-danger)', flex: 1 }}
                          onClick={() => handleRejectTransfer(transfer)}
                        >
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* ==================== WORKFLOW MODALS ==================== */}

      {/* 1. Allocate Asset Modal */}
      <WorkflowModal
        isOpen={isAllocateOpen}
        onClose={() => setIsAllocateOpen(false)}
        title="Create New Asset Allocation"
      >
        <form onSubmit={handleAllocate} className="d-flex flex-col gap-md">
          <div className="form-field-group">
            <label htmlFor="asset_select">Select Asset</label>
            <select
              id="asset_select"
              value={allocateForm.asset_id}
              onChange={(e) => setAllocateForm({ ...allocateForm, asset_id: e.target.value })}
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
            <label htmlFor="custodian_select">Select Custodian Employee</label>
            <select
              id="custodian_select"
              value={allocateForm.employee_id}
              onChange={(e) => setAllocateForm({ ...allocateForm, employee_id: e.target.value })}
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
            id="expected_return_date"
            label="Expected Return Date"
            type="date"
            value={allocateForm.expected_return_date}
            onChange={(e) => setAllocateForm({ ...allocateForm, expected_return_date: e.target.value })}
          />

          <div className="form-field-group">
            <label htmlFor="condition_select">Condition at Allocation</label>
            <select
              id="condition_select"
              value={allocateForm.condition_at_allocation}
              onChange={(e) => setAllocateForm({ ...allocateForm, condition_at_allocation: e.target.value })}
              className="org-select"
            >
              <option value="Excellent">Excellent</option>
              <option value="Good">Good</option>
              <option value="Fair">Fair</option>
              <option value="Damaged">Damaged</option>
            </select>
          </div>

          <div className="form-field-group">
            <label htmlFor="allocation_notes">Allocation Notes</label>
            <textarea
              id="allocation_notes"
              placeholder="Add reason, accessories included, or references..."
              value={allocateForm.allocation_notes}
              onChange={(e) => setAllocateForm({ ...allocateForm, allocation_notes: e.target.value })}
              className="nm-field"
              rows={3}
            />
          </div>

          <div className="d-flex justify-end gap-sm mt-md">
            <Button variant="flat" onClick={() => setIsAllocateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Confirm Allocation
            </Button>
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
          <form onSubmit={handleCreateTransfer} className="d-flex flex-col gap-md">
            <Card variant="flat" padding="sm" className="nm-inset text-muted" style={{ fontSize: 'var(--text-xs)' }}>
              <p>
                <strong>Asset:</strong> {getAssetName(selectedAllocation.asset_id)}
              </p>
              <p className="mt-xs">
                <strong>Current Custodian:</strong> {getEmployeeName(selectedAllocation.employee_id)}
              </p>
            </Card>

            <div className="form-field-group">
              <label htmlFor="to_employee_select">Transfer Ownership To</label>
              <select
                id="to_employee_select"
                value={transferForm.to_employee_id}
                onChange={(e) => setTransferForm({ ...transferForm, to_employee_id: e.target.value })}
                className="org-select"
              >
                {DUMMY_EMPLOYEES.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-field-group">
              <label htmlFor="reason_textarea">Reason for Transfer</label>
              <textarea
                id="reason_textarea"
                placeholder="Explain the hand-over reason..."
                required
                value={transferForm.reason}
                onChange={(e) => setTransferForm({ ...transferForm, reason: e.target.value })}
                className="nm-field"
                rows={3}
              />
            </div>

            <div className="d-flex justify-end gap-sm mt-md">
              <Button variant="flat" onClick={() => setIsTransferOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Submit Request
              </Button>
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
          <form onSubmit={handleRequestReturn} className="d-flex flex-col gap-md">
            <p className="text-muted" style={{ fontSize: 'var(--text-sm)' }}>
              Are you sure you want to flag <strong>{getAssetName(selectedAllocation.asset_id)}</strong> as returning to storage? This notifies the stock manager for review.
            </p>

            <div className="form-field-group">
              <label htmlFor="return_notes_textarea">Return Remarks / Notes</label>
              <textarea
                id="return_notes_textarea"
                placeholder="Why is it being returned? (e.g. Completed project, upgrading device...)"
                value={returnRequestForm.return_notes}
                onChange={(e) => setReturnRequestForm({ return_notes: e.target.value })}
                className="nm-field"
                rows={3}
              />
            </div>

            <div className="d-flex justify-end gap-sm mt-md">
              <Button variant="flat" onClick={() => setIsReturnRequestOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" style={{ backgroundColor: 'var(--color-warning)', color: 'var(--color-text-inverse)' }}>
                Submit Request
              </Button>
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
          <form onSubmit={handleApproveReturn} className="d-flex flex-col gap-md">
            <Card variant="flat" padding="sm" className="nm-inset text-muted" style={{ fontSize: 'var(--text-xs)' }}>
              <p>
                <strong>Asset:</strong> {getAssetName(selectedAllocation.asset_id)}
              </p>
              <p className="mt-xs">
                <strong>Returning From:</strong> {getEmployeeName(selectedAllocation.employee_id)}
              </p>
              {selectedAllocation.return_notes && (
                <p className="mt-xs italic text-main">
                  "Custodian note: {selectedAllocation.return_notes}"
                </p>
              )}
            </Card>

            <div className="form-field-group">
              <label htmlFor="return_condition_select">Condition on Receipt</label>
              <select
                id="return_condition_select"
                value={returnApprovalForm.condition_at_return}
                onChange={(e) => setReturnApprovalForm({ ...returnApprovalForm, condition_at_return: e.target.value })}
                className="org-select"
              >
                <option value="Excellent">Excellent</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
                <option value="Damaged">Damaged</option>
              </select>
            </div>

            <div className="form-field-group">
              <label htmlFor="approval_return_notes_textarea">Manager Final Remarks</label>
              <textarea
                id="approval_return_notes_textarea"
                placeholder="Assess condition, confirm accessories, storage bin, etc..."
                value={returnApprovalForm.return_notes}
                onChange={(e) => setReturnApprovalForm({ ...returnApprovalForm, return_notes: e.target.value })}
                className="nm-field"
                rows={3}
              />
            </div>

            <div className="d-flex justify-end gap-sm mt-md">
              <Button variant="flat" onClick={() => setIsReturnApprovalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" style={{ backgroundColor: 'var(--color-success)', color: 'var(--color-text-inverse)' }}>
                Confirm & Re-stock
              </Button>
            </div>
          </form>
        )}
      </WorkflowModal>
    </PageContainer>
  )
}
