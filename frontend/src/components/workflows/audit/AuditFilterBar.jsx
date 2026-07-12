import React from 'react';
import { RotateCcw } from 'lucide-react';
import { SearchBar, Button } from '../../common';

const AuditFilterBar = ({
  searchQuery,
  setSearchQuery,
  deptFilter,
  setDeptFilter,
  departments,
  statusFilter,
  setStatusFilter,
  dateFilter,
  setDateFilter,
  onReset
}) => {
  return (
    <div className="nm-flat p-md rounded-lg mb-lg d-flex flex-col gap-md">
      <div className="d-flex flex-col md:flex-row gap-md justify-between align-stretch md:align-center">
        <div className="flex-grow">
          <SearchBar
            placeholder="Search by tag, asset name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="d-flex flex-wrap gap-sm align-center">
          <div className="org-field-group m-0" style={{ minWidth: '150px' }}>
            <select
              className="org-select"
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              aria-label="Filter Department"
            >
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept === 'All' ? 'All Departments' : dept}
                </option>
              ))}
            </select>
          </div>

          <div className="org-field-group m-0" style={{ minWidth: '160px' }}>
            <input
              type="date"
              className="nm-field"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              aria-label="Filter Last Verified Date"
            />
          </div>

          <Button 
            variant="flat" 
            onClick={onReset} 
            icon={<RotateCcw size={14} />}
            aria-label="Reset Filters"
          >
            Reset
          </Button>
        </div>
      </div>
      
      {/* Status tabs inside the filter bar */}
      <div className="org-tabs-container m-0 border-top pt-sm">
        {['All', 'Verified', 'Pending', 'Missing', 'Damaged'].map((status) => (
          <button
            key={status}
            className={`org-tab-btn ${statusFilter === status ? 'active' : ''}`}
            onClick={() => setStatusFilter(status)}
          >
            {status}
          </button>
        ))}
      </div>
    </div>
  );
};

export default AuditFilterBar;
