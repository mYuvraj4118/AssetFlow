import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { Button } from '../../common';

const CloseAuditButton = ({ onCloseAudit }) => {
  return (
    <div className="d-flex justify-end mt-lg">
      <Button 
        variant="primary" 
        onClick={onCloseAudit} 
        icon={<ShieldCheck size={16} />}
        aria-label="Close Audit Cycle"
      >
        Close Audit Cycle
      </Button>
    </div>
  );
};

export default CloseAuditButton;
