import React from 'react';
import { Download } from 'lucide-react';
import { Button } from '../../common';

const ReportsHeader = ({ onExport }) => {
  return (
    <div className="d-flex justify-between align-center mb-lg flex-wrap gap-md">
      <div>
        <h1 className="text-heading font-bold text-3xl m-0">Reports & Analytics</h1>
        <p className="text-muted m-0 mt-xs">Monitor organizational performance through real-time insights and enterprise analytics.</p>
      </div>
      <Button 
        variant="primary" 
        onClick={onExport} 
        icon={<Download size={16} />}
        aria-label="Export Report"
      >
        Export Report
      </Button>
    </div>
  );
};

export default ReportsHeader;
