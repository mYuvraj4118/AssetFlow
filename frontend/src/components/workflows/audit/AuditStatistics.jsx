import React from 'react';
import { Package, ShieldCheck, AlertCircle, AlertTriangle } from 'lucide-react';
import { StatCard } from '../../common';

const AuditStatistics = ({ total, verified, missing, damaged }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-md mb-lg">
      <StatCard
        title="Total Assets"
        value={total}
        icon={<Package size={20} className="text-primary" />}
      />
      <StatCard
        title="Verified Assets"
        value={verified}
        icon={<ShieldCheck size={20} className="text-success" />}
      />
      <StatCard
        title="Missing Assets"
        value={missing}
        icon={<AlertCircle size={20} className="text-danger" />}
      />
      <StatCard
        title="Damaged Assets"
        value={damaged}
        icon={<AlertTriangle size={20} className="text-warning" />}
      />
    </div>
  );
};

export default AuditStatistics;
