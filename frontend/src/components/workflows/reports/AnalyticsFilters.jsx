import React from 'react';
import { RotateCcw } from 'lucide-react';
import { Card, Button } from '../../common';

const AnalyticsFilters = ({
  dept, setDept, departments,
  category, setCategory, categories,
  status, setStatus, statuses,
  startDate, setStartDate,
  endDate, setEndDate,
  onReset
}) => {
  return (
    <Card variant="flat" className="p-lg mb-lg">
      <div className="reports-toolbar-content">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-md align-end w-full">
          <div className="org-field-group m-0">
            <label>Department</label>
            <select
              className="org-select"
              value={dept}
              onChange={(e) => setDept(e.target.value)}
              aria-label="Filter Department"
            >
              {departments.map(d => (
                <option key={d} value={d}>{d === 'All' ? 'All Departments' : d}</option>
              ))}
            </select>
          </div>

          <div className="org-field-group m-0">
            <label>Category</label>
            <select
              className="org-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              aria-label="Filter Category"
            >
              {categories.map(c => (
                <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>
              ))}
            </select>
          </div>

          <div className="org-field-group m-0">
            <label>Asset Status</label>
            <select
              className="org-select"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              aria-label="Filter Asset Status"
            >
              {statuses.map(s => (
                <option key={s} value={s}>{s === 'All' ? 'All Statuses' : s}</option>
              ))}
            </select>
          </div>

          <div className="org-field-group m-0">
            <label>Start Date</label>
            <input
              type="date"
              className="nm-field"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              aria-label="Start Date Filter"
            />
          </div>

          <div className="org-field-group m-0">
            <label>End Date</label>
            <input
              type="date"
              className="nm-field"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              aria-label="End Date Filter"
            />
          </div>
        </div>
        <div className="d-flex justify-end mt-md border-top pt-md">
          <Button 
            variant="flat" 
            onClick={onReset} 
            icon={<RotateCcw size={14} />}
            aria-label="Reset Filters"
          >
            Reset Filters
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default AnalyticsFilters;
