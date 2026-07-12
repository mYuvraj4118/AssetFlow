import React from 'react';
import Card from '../Card';
import './StatCard.css';

const StatCard = ({
  title,
  value,
  icon = null,
  trend = null, // { value: '+12%', isPositive: true }
  className = '',
  ...props
}) => {
  return (
    <Card variant="flat" className={`nm-stat-card ${className}`} {...props}>
      <div className="stat-card-header d-flex justify-between align-center mb-sm">
        <span className="stat-card-title text-muted text-xs-sz font-bold uppercase">{title}</span>
        {icon && <div className="stat-card-icon-wrapper nm-inset rounded-md">{icon}</div>}
      </div>
      <div className="stat-card-body d-flex align-end justify-between">
        <h2 className="stat-card-value text-heading font-bold text-2xl-sz m-0">{value}</h2>
        {trend && (
          <span className={`stat-card-trend text-xs-sz font-bold ${trend.isPositive ? 'text-success' : 'text-danger'}`}>
            {trend.value}
          </span>
        )}
      </div>
    </Card>
  );
};

export default StatCard;
