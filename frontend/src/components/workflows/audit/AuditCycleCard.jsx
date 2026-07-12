import React from 'react';
import { Calendar, User, ShieldCheck } from 'lucide-react';
import { Card, Badge } from '../../common';

const AuditCycleCard = ({ cycle }) => {
  if (!cycle) return null;

  return (
    <Card variant="flat" className="p-lg mb-lg">
      <div className="d-flex justify-between align-center mb-md border-bottom pb-xs">
        <h3 className="text-heading font-semibold text-lg m-0">{cycle.name}</h3>
        <Badge variant={cycle.status === 'Completed' ? 'success' : 'primary'}>
          {cycle.status}
        </Badge>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-md">
        <div className="d-flex align-center gap-xs">
          <Calendar size={16} className="text-primary flex-shrink-0" />
          <div className="d-flex flex-col">
            <span className="text-xs-sz text-muted uppercase">Duration</span>
            <span className="text-sm-sz font-bold text-heading">{cycle.startDate} to {cycle.endDate}</span>
          </div>
        </div>

        <div className="d-flex align-center gap-xs">
          <ShieldCheck size={16} className="text-primary flex-shrink-0" />
          <div className="d-flex flex-col">
            <span className="text-xs-sz text-muted uppercase">Scope</span>
            <span className="text-sm-sz font-bold text-heading">{cycle.department}</span>
          </div>
        </div>

        <div className="d-flex align-center gap-xs">
          <User size={16} className="text-primary flex-shrink-0" />
          <div className="d-flex flex-col">
            <span className="text-xs-sz text-muted uppercase">Auditors</span>
            <span className="text-sm-sz font-bold text-heading">
              {cycle.assignedAuditors ? cycle.assignedAuditors.join(', ') : 'None'}
            </span>
          </div>
        </div>

        <div className="d-flex align-center gap-xs">
          <div className="d-flex flex-col">
            <span className="text-xs-sz text-muted uppercase">Current Quarter</span>
            <span className="text-sm-sz font-bold text-heading">{cycle.quarter}</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default AuditCycleCard;
