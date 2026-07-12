import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { Card, Badge } from '../../common';

const MaintenanceTrendChart = ({ data }) => {
  if (!data) return null;

  return (
    <Card variant="flat" className="report-chart-card p-lg">
      <div className="chart-title-wrapper d-flex justify-between align-center">
        <h4 className="chart-title">Maintenance Trends</h4>
        <Badge variant="warning">YTD Expenditure</Badge>
      </div>
      <div className="chart-container-box">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="month" tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }} />
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
            <Area type="monotone" dataKey="cost" name="Cost ($)" stroke="var(--color-primary)" fillOpacity={1} fill="url(#colorCost)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default MaintenanceTrendChart;
