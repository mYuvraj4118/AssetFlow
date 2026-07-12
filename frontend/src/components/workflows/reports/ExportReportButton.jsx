import React from 'react';
import { Download } from 'lucide-react';
import { Button } from '../../common';

const ExportReportButton = ({ onExport, disabled }) => {
  return (
    <div className="d-flex justify-center mt-lg">
      <Button 
        variant="primary" 
        size="lg" 
        onClick={onExport} 
        disabled={disabled}
        icon={<Download size={18} />}
        aria-label="Export Full Report Summary"
        style={{ width: '100%', maxWidth: '320px' }}
      >
        Export Full Report Summary
      </Button>
    </div>
  );
};

export default ExportReportButton;
