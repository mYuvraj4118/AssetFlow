import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Lightbulb, 
  CheckCircle, 
  Clock, 
  Award,
  AlertCircle
} from 'lucide-react';
import PageContainer from '../../components/layout/PageContainer';
import { Card, Badge } from '../../components/common';
import { useNotification } from '../../hooks';
import { 
  initialKPIs, 
  utilizationData, 
  departmentData, 
  maintenanceData, 
  heatmapData, 
  upcomingRetirement, 
  insights, 
  summary, 
  departments, 
  categories, 
  statuses 
} from './dummyData';
import {
  ReportsHeader,
  KPIGrid,
  AnalyticsFilters,
  AssetUtilizationChart,
  DepartmentAllocationChart,
  MaintenanceTrendChart,
  ResourceUsageHeatmap,
  UpcomingRetirementCard,
  ExportReportButton
} from '../../components/workflows/reports';
import './Reports.css';

const Reports = () => {
  const { showNotification } = useNotification();

  // Filter States
  const [dept, setDept] = useState('All');
  const [category, setCategory] = useState('All');
  const [status, setStatus] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  // Dynamic filter state modifications to simulate real database response changes
  const getFilteredKPIs = () => {
    let scale = 1.0;
    if (dept !== 'All') scale -= 0.3;
    if (category !== 'All') scale -= 0.2;
    if (status !== 'All') scale -= 0.1;

    return {
      totalAssets: Math.round(initialKPIs.totalAssets * scale),
      allocatedAssets: Math.round(initialKPIs.allocatedAssets * scale),
      availableAssets: Math.round(initialKPIs.availableAssets * scale),
      maintenanceAssets: Math.round(initialKPIs.maintenanceAssets * scale),
      activeBookings: Math.round(initialKPIs.activeBookings * scale),
      auditCompletion: initialKPIs.auditCompletion
    };
  };

  const getFilteredUtilization = () => {
    if (status === 'All') return utilizationData;
    return utilizationData.map(u => ({
      ...u,
      value: u.name === status ? u.value : Math.round(u.value * 0.2)
    }));
  };

  const getFilteredDepartment = () => {
    if (dept === 'All') return departmentData;
    return departmentData.map(d => ({
      ...d,
      count: d.name === dept ? d.count : Math.round(d.count * 0.1)
    }));
  };

  const filteredKPIs = getFilteredKPIs();
  const filteredUtilData = getFilteredUtilization();
  const filteredDeptData = getFilteredDepartment();

  const handleResetFilters = () => {
    setDept('All');
    setCategory('All');
    setStatus('All');
    setStartDate('');
    setEndDate('');
  };

  // Mock PDF summary export
  const handleExportReport = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      showNotification('Enterprise Analytics Report successfully exported to PDF.', 'success');
    }, 1500);
  };

  return (
    <PageContainer title="Reports & Analytics">
      
      {/* 1. Header Section */}
      <ReportsHeader onExport={handleExportReport} />

      {/* 2. Filters controls toolbar */}
      <AnalyticsFilters 
        dept={dept}
        setDept={setDept}
        departments={departments}
        category={category}
        setCategory={setCategory}
        categories={categories}
        status={status}
        setStatus={setStatus}
        statuses={statuses}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        onReset={handleResetFilters}
      />

      {/* 3. 6 Stat Metric Cards in a grid wrapper */}
      <KPIGrid kpis={filteredKPIs} />

      {/* 4. Charts Section (Pie, Bar, Area and Custom Heatmap) */}
      <div className="reports-charts-grid">
        <AssetUtilizationChart data={filteredUtilData} />
        <DepartmentAllocationChart data={filteredDeptData} />
        <MaintenanceTrendChart data={maintenanceData} />
        <ResourceUsageHeatmap data={heatmapData} />
      </div>

      {/* 5. Insights & Retirement Cards Split section */}
      <div className="insights-grid">
        
        {/* Analytics Insights Dashboard list */}
        <Card variant="flat" className="p-lg">
          <div className="chart-title-wrapper d-flex justify-between align-center mb-md border-bottom pb-xs">
            <h4 className="chart-title">Usage & Efficiency Insights</h4>
            <Badge variant="primary">System Logs</Badge>
          </div>

          <div className="insight-item-box">
            <div className="insight-row-metric">
              <div className="d-flex align-center gap-sm">
                <TrendingUp size={16} className="text-success" />
                <span className="text-sm font-semibold text-heading">Peak Utilization Asset</span>
              </div>
              <span className="text-sm font-bold text-success">{insights.mostUtilized}</span>
            </div>

            <div className="insight-row-metric">
              <div className="d-flex align-center gap-sm">
                <TrendingDown size={16} className="text-danger" />
                <span className="text-sm font-semibold text-heading">Lowest Utilized Asset</span>
              </div>
              <span className="text-sm font-bold text-danger">{insights.leastUtilized}</span>
            </div>

            <div className="insight-row-metric">
              <div className="d-flex align-center gap-sm">
                <AlertCircle size={16} className="text-warning" />
                <span className="text-sm font-semibold text-heading">Maintenance Load Alert</span>
              </div>
              <span className="text-sm font-bold text-warning">{insights.maintenanceFrequency}</span>
            </div>

            <div className="org-field-group m-0 mt-sm border-top pt-sm">
              <label className="text-xs uppercase font-bold text-muted mb-xs block">Department Efficiency Rankings</label>
              <div className="d-flex flex-col gap-xs">
                {insights.rankings.map((rank, index) => (
                  <div key={rank.name} className="d-flex justify-between align-center text-xs-sz py-xxs border-bottom">
                    <span className="text-heading font-semibold">#{index + 1} {rank.name}</span>
                    <span className="text-primary font-bold">{rank.rate}% utilization rate</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Retirement listing column */}
        <UpcomingRetirementCard assets={upcomingRetirement} />
      </div>

      {/* 6. Summary Section */}
      <Card variant="flat" className="p-lg mb-lg" style={{ borderLeft: '4px solid var(--color-primary)' }}>
        <div className="d-flex align-start gap-md">
          <Lightbulb size={24} className="text-primary mt-xs flex-shrink-0" />
          <div className="d-flex flex-col gap-sm">
            <h4 className="text-heading font-bold text-base-sz m-0 uppercase text-primary">Executive Summary & Recommendations</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
              <div className="d-flex flex-col gap-xxs">
                <span className="text-xs font-bold text-muted uppercase">Operational Highlights</span>
                <p className="text-xs-sz text-main m-0">{summary.highlights}</p>
              </div>

              <div className="d-flex flex-col gap-xxs">
                <span className="text-xs font-bold text-muted uppercase">Hardware Replacement Plan</span>
                <p className="text-xs-sz text-main m-0">{summary.recommendations}</p>
              </div>

              <div className="d-flex flex-col gap-xxs">
                <span className="text-xs font-bold text-muted uppercase">Audit Observations</span>
                <p className="text-xs-sz text-main m-0">{summary.operationalHighlight}</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* 7. Large Primary Action Button */}
      <ExportReportButton onExport={handleExportReport} disabled={isExporting} />

    </PageContainer>
  );
};

export default Reports;
