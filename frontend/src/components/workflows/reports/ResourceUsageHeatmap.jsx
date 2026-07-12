import React from 'react';
import { Card, Badge } from '../../common';

const ResourceUsageHeatmap = ({ data }) => {
  if (!data) return null;

  const hours = ['09:00', '12:00', '15:00', '18:00'];

  const getHeatColor = (value) => {
    if (value >= 8) return 'rgba(170, 59, 255, 0.9)'; // Deep purple
    if (value >= 5) return 'rgba(170, 59, 255, 0.6)'; // Medium purple
    if (value >= 3) return 'rgba(170, 59, 255, 0.3)'; // Light purple
    return 'rgba(170, 59, 255, 0.1)'; // Very light purple
  };

  return (
    <Card variant="flat" className="report-chart-card p-lg">
      <div className="chart-title-wrapper d-flex justify-between align-center mb-md">
        <h4 className="chart-title">Resource Usage Heatmap</h4>
        <Badge variant="success">Booking Density</Badge>
      </div>

      <div className="d-flex flex-col gap-sm">
        {/* Heatmap Header */}
        <div className="grid grid-cols-5 gap-xs text-center font-bold text-xs-sz text-muted">
          <div>Day</div>
          {hours.map(h => <div key={h}>{h}</div>)}
        </div>

        {/* Heatmap Rows */}
        {data.map((row) => (
          <div key={row.day} className="grid grid-cols-5 gap-xs align-center text-center">
            <span className="font-bold text-xs-sz text-heading text-left">{row.day}</span>
            {hours.map((h) => {
              const val = row[h];
              return (
                <div
                  key={h}
                  className="rounded-sm d-flex align-center justify-center text-xs font-bold"
                  style={{
                    height: '42px',
                    backgroundColor: getHeatColor(val),
                    color: val >= 5 ? '#fff' : 'var(--color-text-main)',
                    boxShadow: 'var(--shadow-flat-in-sm)',
                    transition: 'all 0.2s ease',
                  }}
                  title={`Booking Density: ${val}/10`}
                  role="gridcell"
                  aria-label={`${row.day} at ${h}: ${val} booking density`}
                >
                  {val}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Heatmap Legend */}
      <div className="d-flex justify-center gap-md mt-md text-xs-sz text-muted font-semibold">
        <div className="d-flex align-center gap-xs">
          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: 'rgba(170, 59, 255, 0.1)' }}></div>
          <span>Low</span>
        </div>
        <div className="d-flex align-center gap-xs">
          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: 'rgba(170, 59, 255, 0.3)' }}></div>
          <span>Medium</span>
        </div>
        <div className="d-flex align-center gap-xs">
          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: 'rgba(170, 59, 255, 0.6)' }}></div>
          <span>High</span>
        </div>
        <div className="d-flex align-center gap-xs">
          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: 'rgba(170, 59, 255, 0.9)' }}></div>
          <span>Peak</span>
        </div>
      </div>
    </Card>
  );
};

export default ResourceUsageHeatmap;
