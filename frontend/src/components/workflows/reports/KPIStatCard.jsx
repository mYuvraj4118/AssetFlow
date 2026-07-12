import React from 'react';
import { StatCard } from '../../common';

const KPIStatCard = ({ title, value, icon, trend }) => {
  return (
    <StatCard
      title={title}
      value={value}
      icon={icon}
      trend={trend}
    />
  );
};

export default KPIStatCard;
