import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Search, 
  Plus, 
  ClipboardCheck, 
  AlertTriangle, 
  CheckCircle2, 
  X, 
  Clock, 
  User, 
  MapPin,
  RefreshCw
} from 'lucide-react';
import PageContainer from '../../components/layout/PageContainer';
import { Card, Button, Badge, SearchBar, EmptyState } from '../../components/common';
import { AUDIT_CYCLES, AUDIT_RECORDS, AUDITORS } from '../../constants/auditConstants';
import './Audit.css';

const Audit = () => {
  // Page states
  const [records, setRecords] = useState(AUDIT_RECORDS);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  // Verification dialog modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [verificationStatus, setVerificationStatus] = useState('Verified');
  const [notes, setNotes] = useState('');
  const [auditor, setAuditor] = useState(AUDITORS[0]);

  // Recalculate statistics dynamically based on local state updates
  const activeCycle = AUDIT_CYCLES[0]; // Current annual cycle
  const totalAssets = activeCycle.totalAssets;
  const verifiedCount = records.filter(r => r.status === 'Verified').length;
  const discrepancyCount = records.filter(r => r.status === 'Discrepancy').length;
  const auditedCount = verifiedCount + discrepancyCount;
  const progressPercent = Math.min(Math.round((auditedCount / totalAssets) * 100), 100);

  // Search filter implementation
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  // Row Verify Button click
  const handleVerifyClick = (record) => {
    setSelectedRecord(record);
    setVerificationStatus(record.status === 'Pending' ? 'Verified' : record.status);
    setNotes(record.notes);
    setAuditor(record.assignedAuditor || AUDITORS[0]);
    setIsModalOpen(true);
  };

  // Verification Form Submit
  const handleVerifySubmit = (e) => {
    e.preventDefault();
    if (!selectedRecord) return;

    setRecords(records.map(r => r.id === selectedRecord.id ? {
      ...r,
      status: verificationStatus,
      notes: notes,
      assignedAuditor: auditor,
      lastAuditDate: new Date().toISOString().split('T')[0]
    } : r));

    setIsModalOpen(false);
  };

  // Clear filters
  const handleClearFilters = () => {
    setSearchQuery('');
    setStatusFilter('All');
  };

  // Filter lists based on Search Query and Status Tabs
  const getFilteredRecords = () => {
    const q = searchQuery.toLowerCase().trim();
    return records.filter(r => {
      const matchesSearch = 
        r.assetName.toLowerCase().includes(q) ||
        r.assetId.toLowerCase().includes(q) ||
        r.expectedLocation.toLowerCase().includes(q) ||
        r.assignedAuditor.toLowerCase().includes(q);
        
      const matchesStatus = statusFilter === 'All' || r.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  };

  const filteredRecords = getFilteredRecords();

  return (
    <PageContainer title="Audit & Verification">
      
      {/* 1. Active Audit Cycle Progress Panel */}
      <Card variant="flat" className="audit-progress-card p-lg">
        <div className="d-flex justify-between align-center border-bottom pb-sm mb-md">
          <div className="d-flex align-center gap-xs">
            <ClipboardCheck className="text-primary animate-pulse" size={22} />
            <h3 className="text-heading font-semibold text-lg-sz m-0">{activeCycle.name}</h3>
          </div>
          <Badge variant="success" inset={false}>Active Cycle</Badge>
        </div>

        <div className="audit-progress-details">
          <div className="audit-progress-text">
            <span>Audit Completion Progress ({auditedCount} / {totalAssets} Assets Audited)</span>
            <span className="text-primary">{progressPercent}%</span>
          </div>
          <div className="audit-progress-bar-track">
            <div className="audit-progress-bar-fill" style={{ width: `${progressPercent}%` }}></div>
          </div>
          
          <div className="d-flex justify-between flex-wrap gap-md mt-sm pt-sm" style={{ borderTop: '1px solid var(--color-border)' }}>
            <div className="d-flex align-center gap-sm">
              <span className="text-xs-sz text-muted">Verified:</span>
              <span className="text-sm-sz font-bold text-success">{verifiedCount}</span>
            </div>
            <div className="d-flex align-center gap-sm">
              <span className="text-xs-sz text-muted">Discrepancies:</span>
              <span className="text-sm-sz font-bold text-danger">{discrepancyCount}</span>
            </div>
            <div className="d-flex align-center gap-sm">
              <span className="text-xs-sz text-muted">Pending Audit:</span>
              <span className="text-sm-sz font-bold text-warning">{totalAssets - auditedCount}</span>
            </div>
            <div className="d-flex align-center gap-sm">
              <span className="text-xs-sz text-muted">Timeline:</span>
              <span className="text-sm-sz font-bold text-heading">Until {activeCycle.endDate}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* 2. Audit Directory & Controls */}
      <div className="audit-toolbar">
        <div className="audit-search-box">
          <SearchBar 
            placeholder="Search expected location, asset ID or name..."
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>
        
        {/* Status filters */}
        <div className="org-tabs-container m-0">
          {['All', 'Verified', 'Discrepancy', 'Pending'].map((status) => (
            <button
              key={status}
              className={`org-tab-btn ${statusFilter === status ? 'active' : ''}`}
              onClick={() => setStatusFilter(status)}
            >
              {status} ({records.filter(r => status === 'All' || r.status === status).length})
            </button>
          ))}
        </div>
      </div>

      {/* 3. Table list */}
      <Card variant="flat" className="org-table-card p-lg">
        {searchQuery && filteredRecords.length === 0 ? (
          <EmptyState
            title="No Audits Match Search"
            description={`We couldn't find any audit logs matching "${searchQuery}".`}
            icon={<AlertTriangle size={36} className="text-warning" />}
            actionButton={
              <Button variant="flat" onClick={handleClearSearch}>
                Clear Search
              </Button>
            }
          />
        ) : filteredRecords.length === 0 ? (
          <EmptyState
            title="No Records Found"
            description="There are no active records matching the selected status."
            icon={<ShieldCheck size={36} className="text-primary" />}
            actionButton={
              <Button variant="flat" onClick={handleClearFilters}>
                Reset Filter
              </Button>
            }
          />
        ) : (
          <div className="org-table-responsive-wrapper">
            <table className="org-table">
              <thead>
                <tr>
                  <th>Asset</th>
                  <th>Expected Location</th>
                  <th>Auditor</th>
                  <th>Last Audit</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <div className="d-flex flex-col">
                        <span className="font-semibold text-heading">{r.assetName}</span>
                        <span className="text-xs-sz text-muted">{r.assetId}</span>
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-center gap-xs">
                        <MapPin size={12} className="text-muted" />
                        <span>{r.expectedLocation}</span>
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-center gap-xs">
                        <User size={12} className="text-muted" />
                        <span>{r.assignedAuditor || '-'}</span>
                      </div>
                    </td>
                    <td>{r.lastAuditDate || 'Never'}</td>
                    <td>
                      <Badge 
                        variant={r.status === 'Verified' ? 'success' : r.status === 'Discrepancy' ? 'danger' : 'warning'} 
                        inset={r.status === 'Pending'}
                      >
                        {r.status}
                      </Badge>
                    </td>
                    <td>
                      <Button 
                        variant={r.status === 'Pending' ? 'primary' : 'flat'} 
                        size="sm" 
                        onClick={() => handleVerifyClick(r)}
                        icon={<CheckCircle2 size={12} />}
                      >
                        {r.status === 'Pending' ? 'Audit' : 'Re-verify'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* 4. Verification Form Modal */}
      {isModalOpen && selectedRecord && (
        <div 
          className="org-simulation-modal pos-fixed top-0 left-0 w-screen h-screen z-50 d-flex align-center justify-center p-md"
          style={{ backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(3px)' }}
        >
          <Card variant="flat" className="w-full max-w-md p-lg">
            <div className="d-flex justify-between align-center mb-md border-bottom pb-sm">
              <h3 className="text-heading font-semibold text-lg-sz m-0">Verify Asset Status</h3>
              <button 
                className="nm-btn rounded-full p-xs d-flex align-center justify-center cursor-pointer"
                onClick={() => setIsModalOpen(false)}
                style={{ border: 'none', background: 'transparent' }}
              >
                <X size={16} className="text-muted" />
              </button>
            </div>

            <div className="audit-asset-details-box">
              <div className="audit-detail-row">
                <span className="audit-detail-label">Asset:</span>
                <span className="audit-detail-value">{selectedRecord.assetName}</span>
              </div>
              <div className="audit-detail-row">
                <span className="audit-detail-label">Asset ID:</span>
                <span className="audit-detail-value font-mono">{selectedRecord.assetId}</span>
              </div>
              <div className="audit-detail-row">
                <span className="audit-detail-label">Department:</span>
                <span className="audit-detail-value">{selectedRecord.department}</span>
              </div>
              <div className="audit-detail-row">
                <span className="audit-detail-label">Expected Location:</span>
                <span className="audit-detail-value">{selectedRecord.expectedLocation}</span>
              </div>
            </div>

            <form onSubmit={handleVerifySubmit} className="d-flex flex-col gap-sm">
              <div className="org-field-group">
                <label>Verification Status</label>
                <select
                  className="org-select"
                  value={verificationStatus}
                  onChange={(e) => setVerificationStatus(e.target.value)}
                >
                  <option value="Verified">Verified (Asset Located & Checked)</option>
                  <option value="Discrepancy">Discrepancy (Missing/Misplaced/Damaged)</option>
                  <option value="Pending">Pending Audit</option>
                </select>
              </div>

              <div className="org-field-group">
                <label>Assigned Auditor</label>
                <select
                  className="org-select"
                  value={auditor}
                  onChange={(e) => setAuditor(e.target.value)}
                >
                  {AUDITORS.map((a) => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </div>

              <div className="org-field-group">
                <label>Verification Notes / Observations</label>
                <textarea
                  className="nm-field"
                  placeholder="e.g. Scanned successfully, looks in clean working condition."
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  style={{ resize: 'none', fontFamily: 'inherit' }}
                />
              </div>

              <div className="d-flex justify-end gap-sm mt-md border-top pt-md">
                <Button variant="flat" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Save Verification
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </PageContainer>
  );
};

export default Audit;
