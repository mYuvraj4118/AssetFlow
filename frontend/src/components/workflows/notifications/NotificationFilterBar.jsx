import React from 'react';
import { RotateCcw } from 'lucide-react';
import { SearchBar, Button } from '../../common';

const NotificationFilterBar = ({
  searchQuery,
  setSearchQuery,
  priorityFilter,
  setPriorityFilter,
  priorities,
  statusFilter,
  setStatusFilter,
  statuses,
  dateFilter,
  setDateFilter,
  onReset
}) => {
  return (
    <div className="nm-flat p-md rounded-lg mb-lg d-flex flex-col gap-md">
      <div className="d-flex flex-col md:flex-row gap-md justify-between align-stretch md:align-center">
        <div className="flex-grow">
          <SearchBar
            placeholder="Search notifications..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="d-flex flex-wrap gap-sm align-center">
          <div className="org-field-group m-0" style={{ minWidth: '140px' }}>
            <select
              className="org-select"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              aria-label="Filter Priority"
            >
              {priorities.map(p => (
                <option key={p} value={p}>{p === 'All' ? 'All Priorities' : `${p} Priority`}</option>
              ))}
            </select>
          </div>

          <div className="org-field-group m-0" style={{ minWidth: '140px' }}>
            <select
              className="org-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Filter Read Status"
            >
              {statuses.map(s => (
                <option key={s} value={s}>{s === 'All' ? 'All Read States' : s}</option>
              ))}
            </select>
          </div>

          <div className="org-field-group m-0" style={{ minWidth: '160px' }}>
            <input
              type="date"
              className="nm-field"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              aria-label="Filter Notification Date"
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
    </div>
  );
};

export default NotificationFilterBar;
