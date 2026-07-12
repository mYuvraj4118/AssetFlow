import React from 'react';
import { AlertCircle, FileText } from 'lucide-react';
import { Card, Button } from '../../common';

const AuditSummaryBanner = ({ flaggedCount, discrepancyCount, recommendedAction, onGenerateReport }) => {
  return (
    <Card variant="flat" className="p-lg mb-lg" style={{ borderLeft: '4px solid var(--color-warning)' }}>
      <div className="d-flex flex-col md:flex-row gap-lg justify-between align-start md:align-center">
        <div className="d-flex align-start gap-md flex-grow">
          <AlertCircle size={24} className="text-warning flex-shrink-0 mt-xs" />
          <div className="d-flex flex-col gap-xs">
            <h4 className="text-heading font-bold text-base-sz m-0 uppercase text-warning">Audit Discrepancy Alert</h4>
            <p className="text-sm-sz text-main m-0">
              There are currently <strong>{flaggedCount}</strong> flagged assets and <strong>{discrepancyCount}</strong> discrepancies recorded. 
            </p>
            <p className="text-xs-sz text-muted m-0">
              <strong>Recommendation:</strong> {recommendedAction}
            </p>
          </div>
        </div>
        <div className="flex-shrink-0">
          <Button 
            variant="flat" 
            onClick={onGenerateReport} 
            icon={<FileText size={16} />}
            aria-label="Generate PDF Report"
          >
            Generate PDF Report
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default AuditSummaryBanner;
