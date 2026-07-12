import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { Card, Badge } from '../../common';

const AssetUtilizationChart = ({ data }) => {
  if (!data) return null;

  return (
    <Card variant="flat" className="report-chart-card p-lg">
      <div className="chart-title-wrapper d-flex justify-between align-center">
        <h4 className="chart-title">Asset Pool Utilization</h4>
        <Badge variant="info">Live Distribution</Badge>
      </div>
      <div className="chart-container-box">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--color-bg-surface)',
                borderColor: 'var(--color-border)',
                borderRadius: 'var(--radius-sm)',
                boxShadow: 'var(--shadow-flat-out-sm)',
                color: 'var(--color-text-main)'
              }}
            />
            <Legend verticalAlign="bottom" height={36} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default AssetUtilizationChart;
