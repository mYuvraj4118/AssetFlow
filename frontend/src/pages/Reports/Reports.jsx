import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  FileText, 
  Calendar, 
  Building2, 
  TrendingUp, 
  Activity,
  BarChart4
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend,
  AreaChart, 
  Area,
  CartesianGrid
} from 'recharts';
import PageContainer from '../../components/layout/PageContainer';
import { Card, Button, Badge } from '../../components/common';
import { useNotification } from '../../hooks';
import { 
  ASSET_UTILIZATION_DATA, 
  MAINTENANCE_TRENDS_DATA, 
  DEPARTMENT_DISTRIBUTION_DATA, 
  BOOKING_REPORTS_DATA 
} from '../../constants/reportConstants';
import './Reports.css';

const Reports = () => {
  const { showNotification } = useNotification();
  
  // Filter states
  const [department, setDepartment] = useState('All');
  const [timeRange, setTimeRange] = useState('Last 30 Days');
  const [isExporting, setIsExporting] = useState(false);

  // Mock Export CSV
  const handleExportCSV = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      showNotification('CSV Report exported successfully. Download started.', 'success');
    }, 1500);
  };

  // Mock Export PDF
  const handleExportPDF = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      showNotification('PDF Summary report generated and saved.', 'success');
    }, 1800);
  };

  return (
    <PageContainer title="Reports & Analytics">
      
      {/* 1. Filtering Controls Card */}
      <Card variant="flat" className="reports-toolbar-card p-lg">
        <div className="reports-toolbar-content">
          <div className="reports-filters-group">
            <div className="org-field-group reports-filter-select m-0">
              <label>Filter Department</label>
              <select 
                className="org-select"
                value={department} 
                onChange={(e) => setDepartment(e.target.value)}
              >
                <option value="All">All Departments</option>
                <option value="Engineering">Engineering</option>
                <option value="Facilities">Facilities</option>
                <option value="Operations">Operations</option>
                <option value="Marketing">Marketing</option>
              </select>
            </div>

            <div className="org-field-group reports-filter-select m-0">
              <label>Time Range</label>
              <select 
                className="org-select"
                value={timeRange} 
                onChange={(e) => setTimeRange(e.target.value)}
              >
                <option value="Last 7 Days">Last 7 Days</option>
                <option value="Last 30 Days">Last 30 Days</option>
                <option value="Last 90 Days">Last 90 Days</option>
                <option value="Year to Date">Year to Date</option>
              </select>
            </div>
          </div>

          <div className="d-flex gap-sm">
            <Button 
              variant="flat" 
              onClick={handleExportCSV}
              disabled={isExporting}
              icon={<FileSpreadsheet size={16} />}
            >
              Export CSV
            </Button>
            <Button 
              variant="primary" 
              onClick={handleExportPDF}
              disabled={isExporting}
              icon={<FileText size={16} />}
            >
              Export PDF
            </Button>
          </div>
        </div>
      </Card>

      {/* 2. Analytical Charts Grid */}
      <div className="reports-charts-grid">
        
        {/* Chart A: Asset Utilization (Pie) */}
        <Card variant="flat" className="report-chart-card p-lg">
          <div className="chart-title-wrapper d-flex justify-between align-center">
            <h4 className="chart-title">Asset Utilization</h4>
            <Badge variant="info">Live Distribution</Badge>
          </div>
          <div className="chart-container-box">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={ASSET_UTILIZATION_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {ASSET_UTILIZATION_DATA.map((entry, index) => (
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

        {/* Chart B: Maintenance Expenditures (Area) */}
        <Card variant="flat" className="report-chart-card p-lg">
          <div className="chart-title-wrapper d-flex justify-between align-center">
            <h4 className="chart-title">Maintenance Budget Costs</h4>
            <Badge variant="warning">YTD Trend</Badge>
          </div>
          <div className="chart-container-box">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MAINTENANCE_TRENDS_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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

        {/* Chart C: Asset Distribution by Department (Bar) */}
        <Card variant="flat" className="report-chart-card p-lg">
          <div className="chart-title-wrapper d-flex justify-between align-center">
            <h4 className="chart-title">Department Assets Count</h4>
            <Badge variant="primary">Top Allocated</Badge>
          </div>
          <div className="chart-container-box">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={DEPARTMENT_DISTRIBUTION_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                  {DEPARTMENT_DISTRIBUTION_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? 'var(--color-primary)' : 'var(--color-primary-light)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Chart D: Shared Resource Booking Utilizations (Bar) */}
        <Card variant="flat" className="report-chart-card p-lg">
          <div className="chart-title-wrapper d-flex justify-between align-center">
            <h4 className="chart-title">Shared Resources Hours</h4>
            <Badge variant="success">Bookings Summary</Badge>
          </div>
          <div className="chart-container-box">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={BOOKING_REPORTS_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                <Bar dataKey="hours" name="Booked Hours" fill="var(--color-success)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

      </div>
    </PageContainer>
  );
};

export default Reports;
