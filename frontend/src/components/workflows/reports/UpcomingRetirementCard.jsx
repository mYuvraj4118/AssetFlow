import React from 'react';
import { Calendar } from 'lucide-react';
import { Card, Badge } from '../../common';

const UpcomingRetirementCard = ({ assets }) => {
  if (!assets || assets.length === 0) return null;

  return (
    <Card variant="flat" className="p-lg">
      <div className="chart-title-wrapper d-flex justify-between align-center mb-md border-bottom pb-xs">
        <h4 className="chart-title">Upcoming Asset Retirement</h4>
        <Badge variant="danger">Attention Needed</Badge>
      </div>

      <div className="d-flex flex-col gap-sm">
        {assets.map((asset) => (
          <div 
            key={asset.tag} 
            className="d-flex justify-between align-center p-sm rounded-md nm-inset"
            style={{ backgroundColor: 'var(--color-bg-base)' }}
          >
            <div className="d-flex flex-col">
              <span className="font-semibold text-heading text-sm-sz">{asset.name}</span>
              <span className="text-xs-sz text-muted">{asset.tag} • {asset.department}</span>
            </div>
            <div className="d-flex align-center gap-xs text-xs-sz text-danger font-bold">
              <Calendar size={12} />
              <span>{asset.retireDate}</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default UpcomingRetirementCard;
