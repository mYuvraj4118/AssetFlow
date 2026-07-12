import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '../../common';

const AuditHeader = ({ onCreateNewAudit }) => {
  return (
    <div className="d-flex justify-between align-center mb-lg flex-wrap gap-md">
      <div>
        <h1 className="text-heading font-bold text-3xl m-0">Audit Management</h1>
        <p className="text-muted m-0 mt-xs">Track audit cycles, verify enterprise assets, and resolve discrepancies.</p>
      </div>
      <Button 
        variant="primary" 
        onClick={onCreateNewAudit} 
        icon={<Plus size={16} />}
        aria-label="Create New Audit"
      >
        Create New Audit
      </Button>
    </div>
  );
};

export default AuditHeader;
