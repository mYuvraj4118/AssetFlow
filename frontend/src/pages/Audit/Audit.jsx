import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import PageContainer from '../../components/layout/PageContainer';
import { Card, Button } from '../../components/common';
import { useNotification } from '../../hooks';
import { 
  initialAuditCycle, 
  initialAssetList, 
  departments 
} from './dummyData';
import {
  AuditHeader,
  AuditCycleCard,
  AuditProgressCard,
  AuditStatistics,
  AuditFilterBar,
  AuditTable,
  AuditSummaryBanner,
  CloseAuditButton
} from '../../components/workflows/audit';
import './Audit.css';

const Audit = () => {
  const { showNotification } = useNotification();

  // Core Data States
  const [cycle, setCycle] = useState(initialAuditCycle);
  const [assets, setAssets] = useState(initialAssetList);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('');

  // Verification Modal State
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [verifyStatus, setVerifyStatus] = useState('Verified');

  // Create Cycle Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newCycleName, setNewCycleName] = useState('');
  const [newCycleDept, setNewCycleDept] = useState('All');

  // Dynamic Statistics Calculations based on active asset state
  const totalCount = assets.length;
  const verifiedCount = assets.filter(a => a.verificationStatus === 'Verified').length;
  const missingCount = assets.filter(a => a.verificationStatus === 'Missing').length;
  const damagedCount = assets.filter(a => a.verificationStatus === 'Damaged').length;
  const auditedCount = totalCount - assets.filter(a => a.verificationStatus === 'Pending').length;
  const progressPercent = totalCount > 0 ? Math.round((auditedCount / totalCount) * 100) : 0;

  // Filter handlers
  const handleResetFilters = () => {
    setSearchQuery('');
    setDeptFilter('All');
    setStatusFilter('All');
    setDateFilter('');
  };

  // Row "Verify" button trigger
  const handleVerifyAsset = (asset) => {
    setSelectedAsset(asset);
    setVerifyStatus(asset.verificationStatus === 'Pending' ? 'Verified' : asset.verificationStatus);
    setIsVerifyModalOpen(true);
  };

  // Save Verification handler
  const handleSaveVerification = (e) => {
    e.preventDefault();
    if (!selectedAsset) return;

    setAssets(assets.map(a => a.assetTag === selectedAsset.assetTag ? {
      ...a,
      verificationStatus: verifyStatus,
      lastVerified: new Date().toISOString().split('T')[0]
    } : a));

    showNotification(`Asset ${selectedAsset.assetTag} verification updated to ${verifyStatus}.`, 'success');
    setIsVerifyModalOpen(false);
  };

  // Generate mock PDF Report
  const handleGenerateReport = () => {
    showNotification(`PDF Audit report generated for ${cycle.name}.`, 'success');
  };

  // Close Audit Cycle
  const handleCloseAudit = () => {
    if (cycle.status === 'Completed') {
      showNotification('This audit cycle is already completed.', 'warning');
      return;
    }
    
    setCycle({
      ...cycle,
      status: 'Completed'
    });
    
    showNotification(`Audit cycle "${cycle.name}" has been successfully closed. All asset states committed.`, 'success');
  };

  // Create New Audit Cycle
  const handleCreateCycleSubmit = (e) => {
    e.preventDefault();
    if (!newCycleName.trim()) return;

    // Reset status of all assets to Pending to simulate a clean cycle
    const resetAssets = assets.map(a => ({
      ...a,
      verificationStatus: 'Pending',
      lastVerified: null
    }));

    setCycle({
      id: `cycle-${Date.now()}`,
      name: newCycleName,
      quarter: 'Q4 2026',
      department: newCycleDept,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      assignedAuditors: ['Aditi Rao', 'Rohan Mehta'],
      status: 'In Progress'
    });

    setAssets(resetAssets);
    showNotification(`New Audit Cycle "${newCycleName}" initiated successfully.`, 'success');
    setIsCreateModalOpen(false);
  };

  // Filters logic
  const getFilteredAssets = () => {
    return assets.filter(a => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = 
        a.assetName.toLowerCase().includes(q) || 
        a.assetTag.toLowerCase().includes(q) || 
        a.expectedLocation.toLowerCase().includes(q) || 
        a.currentHolder.toLowerCase().includes(q);

      const matchesDept = deptFilter === 'All' || a.department === deptFilter;
      const matchesStatus = statusFilter === 'All' || a.verificationStatus === statusFilter;
      const matchesDate = !dateFilter || a.lastVerified === dateFilter;

      return matchesSearch && matchesDept && matchesStatus && matchesDate;
    });
  };

  const filteredAssets = getFilteredAssets();

  return (
    <PageContainer title="Audit & Verification">
      
      {/* 1. Header Section */}
      <AuditHeader onCreateNewAudit={() => setIsCreateModalOpen(true)} />

      {/* 2. Current Cycle Overview Metadata */}
      <AuditCycleCard cycle={cycle} />

      {/* 3. Progress Card */}
      <AuditProgressCard percentage={progressPercent} />

      {/* 4. Statistics grid boxes */}
      <AuditStatistics 
        total={totalCount}
        verified={verifiedCount}
        missing={missingCount}
        damaged={damagedCount}
      />

      {/* 5. Filters controls bar */}
      <AuditFilterBar 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        deptFilter={deptFilter}
        setDeptFilter={setDeptFilter}
        departments={departments}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        dateFilter={dateFilter}
        setDateFilter={setDateFilter}
        onReset={handleResetFilters}
      />

      {/* 6. Discrepancy Summary Alerts Banner */}
      {(missingCount > 0 || damagedCount > 0) && (
        <AuditSummaryBanner 
          flaggedCount={missingCount + damagedCount}
          discrepancyCount={missingCount}
          recommendedAction="Initiate missing hardware alerts to active custodians; schedule technician checkups for damaged nodes."
          onGenerateReport={handleGenerateReport}
        />
      )}

      {/* 7. Asset Verification Table */}
      <Card variant="flat" className="p-lg">
        <div className="d-flex justify-between align-center mb-md border-bottom pb-xs">
          <h3 className="text-heading font-semibold text-lg m-0">Asset Directory Verification</h3>
          <Badge variant="info">{filteredAssets.length} Records</Badge>
        </div>
        
        {filteredAssets.length === 0 ? (
          <EmptyState 
            title="No Assets Match Filters"
            description="Adjust your search keywords, active department filters, or status selections."
            actionButton={
              <Button variant="flat" onClick={handleResetFilters}>Reset Filters</Button>
            }
          />
        ) : (
          <AuditTable assets={filteredAssets} onVerify={handleVerifyAsset} />
        )}
      </Card>

      {/* 8. Close Audit Action Trigger */}
      {cycle.status !== 'Completed' && (
        <CloseAuditButton onCloseAudit={handleCloseAudit} />
      )}

      {/* Modal A: Verification Form Dialog */}
      {isVerifyModalOpen && selectedAsset && (
        <div 
          className="org-simulation-modal pos-fixed top-0 left-0 w-screen h-screen z-50 d-flex align-center justify-center p-md"
          style={{ backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(3px)' }}
        >
          <Card variant="flat" className="w-full max-w-sm p-lg animate-fade-in">
            <div className="d-flex justify-between align-center mb-md border-bottom pb-xs">
              <h3 className="text-heading font-semibold text-lg m-0">Verify Asset</h3>
              <button 
                className="nm-btn rounded-full p-xs d-flex align-center justify-center cursor-pointer"
                onClick={() => setIsVerifyModalOpen(false)}
                style={{ border: 'none', background: 'transparent' }}
              >
                <X size={16} className="text-muted" />
              </button>
            </div>

            <div className="audit-asset-details-box">
              <div className="audit-detail-row">
                <span className="audit-detail-label">Asset:</span>
                <span className="audit-detail-value">{selectedAsset.assetName}</span>
              </div>
              <div className="audit-detail-row">
                <span className="audit-detail-label">Tag ID:</span>
                <span className="audit-detail-value font-mono">{selectedAsset.assetTag}</span>
              </div>
              <div className="audit-detail-row">
                <span className="audit-detail-label">Expected Location:</span>
                <span className="audit-detail-value">{selectedAsset.expectedLocation}</span>
              </div>
              <div className="audit-detail-row">
                <span className="audit-detail-label">Current Holder:</span>
                <span className="audit-detail-value">{selectedAsset.currentHolder}</span>
              </div>
            </div>

            <form onSubmit={handleSaveVerification} className="d-flex flex-col gap-md">
              <div className="org-field-group">
                <label>Verification Status</label>
                <select
                  className="org-select"
                  value={verifyStatus}
                  onChange={(e) => setVerifyStatus(e.target.value)}
                >
                  <option value="Verified">Verified</option>
                  <option value="Missing">Missing</option>
                  <option value="Damaged">Damaged</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>

              <div className="d-flex justify-end gap-sm mt-md border-top pt-md">
                <Button variant="flat" onClick={() => setIsVerifyModalOpen(false)}>Cancel</Button>
                <Button variant="primary" type="submit">Save Verification</Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Modal B: Create New Audit Dialog */}
      {isCreateModalOpen && (
        <div 
          className="org-simulation-modal pos-fixed top-0 left-0 w-screen h-screen z-50 d-flex align-center justify-center p-md"
          style={{ backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(3px)' }}
        >
          <Card variant="flat" className="w-full max-w-sm p-lg animate-fade-in">
            <div className="d-flex justify-between align-center mb-md border-bottom pb-xs">
              <h3 className="text-heading font-semibold text-lg m-0">Create Audit Cycle</h3>
              <button 
                className="nm-btn rounded-full p-xs d-flex align-center justify-center cursor-pointer"
                onClick={() => setIsCreateModalOpen(false)}
                style={{ border: 'none', background: 'transparent' }}
              >
                <X size={16} className="text-muted" />
              </button>
            </div>

            <form onSubmit={handleCreateCycleSubmit} className="d-flex flex-col gap-md">
              <div className="org-field-group">
                <label>Cycle Name</label>
                <input 
                  type="text" 
                  className="nm-field" 
                  required
                  placeholder="e.g. Q4 Hardware Inventory Audit"
                  value={newCycleName}
                  onChange={(e) => setNewCycleName(e.target.value)}
                />
              </div>

              <div className="org-field-group">
                <label>Target Scope Department</label>
                <select 
                  className="org-select"
                  value={newCycleDept}
                  onChange={(e) => setNewCycleDept(e.target.value)}
                >
                  <option value="All Departments">All Departments</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Facilities">Facilities</option>
                  <option value="Operations">Operations</option>
                  <option value="Marketing">Marketing</option>
                </select>
              </div>

              <div className="d-flex justify-end gap-sm mt-md border-top pt-md">
                <Button variant="flat" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
                <Button variant="primary" type="submit">Create Cycle</Button>
              </div>
            </form>
          </Card>
        </div>
      )}

    </PageContainer>
  );
};

export default Audit;
