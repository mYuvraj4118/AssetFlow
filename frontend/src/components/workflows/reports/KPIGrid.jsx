import React from 'react';
import { Package, CheckCircle2, ShieldCheck, Wrench, Calendar, ClipboardCheck } from 'lucide-react';
import KPIStatCard from './KPIStatCard';

const KPIGrid = ({ kpis }) => {
  if (!kpis) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-md mb-lg">
      <KPIStatCard
        title="Total Assets"
        value={kpis.totalAssets}
        icon={<Package size={20} className="text-primary" />}
      />
      <KPIStatCard
        title="Allocated Assets"
        value={kpis.allocatedAssets}
        icon={<CheckCircle2 size={20} className="text-info" />}
      />
      <KPIStatCard
        title="Available Assets"
        value={kpis.availableAssets}
        icon={<ShieldCheck size={20} className="text-success" />}
      />
      <KPIStatCard
        title="Under Maintenance"
        value={kpis.maintenanceAssets}
        icon={<Wrench size={20} className="text-warning" />}
      />
      <KPIStatCard
        title="Active Bookings"
        value={kpis.activeBookings}
        icon={<Calendar size={20} className="text-primary" />}
      />
      <KPIStatCard
        title="Audit Completion"
        value={`${kpis.auditCompletion}%`}
        icon={<ClipboardCheck size={20} className="text-primary" />}
      />
    </div>
  );
};

export default KPIGrid;
