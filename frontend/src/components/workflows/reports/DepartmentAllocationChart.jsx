import React from 'react';
import { ResponsiveContainer, BarChart, Bar, Cell, XAxis, YAxis, Tooltip } from 'recharts';
import { Card, Badge } from '../../common';

const DepartmentAllocationChart = ({ data }) => {
  if (!data) return null;

  return (
    <Card variant="flat" className="report-chart-card p-lg">
      <div className="chart-title-wrapper d-flex justify-between align-center">
        <h4 className="chart-title">Department Allocation</h4>
        <Badge variant="primary">Top Allocated</Badge>
      </div>
      <div className="chart-container-box">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <XAxis dataKey="name" tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }} />
            <YAxis tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--color-bg-surface)',
                borderColor: 'var(--color-border)',
                borderRadius: 'var(--radius-sm)',
                boxShadow: 'var(--shadow-flat-out-sm)',
                color: 'var(--color-text-main)'
              }}
            />
            <Bar dataKey="count" name="Total Assets" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={index % 2 === 0 ? 'var(--color-primary)' : 'var(--color-primary-light)'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default DepartmentAllocationChart;
