import React from 'react';
import { Card } from '../../common';

const AuditProgressCard = ({ percentage }) => {
  return (
    <Card variant="flat" className="p-lg mb-lg">
      <div className="audit-progress-text d-flex justify-between align-center mb-xs">
        <span className="font-semibold text-heading text-sm-sz">Audit Cycle Progress</span>
        <span className="text-primary font-bold text-sm-sz">{percentage}% Completed</span>
      </div>
      <div className="audit-progress-bar-track">
        <div 
          className="audit-progress-bar-fill" 
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={percentage}
          aria-valuemin="0"
          aria-valuemax="100"
        ></div>
      </div>
    </Card>
  );
};

export default AuditProgressCard;
