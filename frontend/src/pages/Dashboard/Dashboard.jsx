import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Share2, 
  Wrench, 
  CalendarCheck, 
  ArrowLeftRight, 
  Clock, 
  AlertTriangle,
  Plus,
  Calendar,
  Bell,
  CheckCircle,
  X,
  Mail,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import PageContainer from '../../components/layout/PageContainer';
import { Card, StatCard, Button, Badge } from '../../components/common';
import './Dashboard.css';

const Dashboard = () => {
  // Local state to simulate quick actions and alerts
  const [notification, setNotification] = useState(null);
  const [currentDate, setCurrentDate] = useState('');
  
  useEffect(() => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const today = new Date();
    setCurrentDate(today.toLocaleDateString('en-US', options));
  }, []);

  // Mock Data
  const kpis = [
    {
      id: 'available',
      title: 'Available Assets',
      value: '1,245',
      icon: <Package size={20} className="text-success" />,
      trend: { value: '+3.2%', isPositive: true }
    },
    {
      id: 'allocated',
      title: 'Allocated Assets',
      value: '842',
      icon: <Share2 size={20} className="text-primary" />,
      trend: { value: '+1.5%', isPositive: true }
    },
    {
      id: 'maintenance',
      title: 'In Maintenance',
      value: '27',
      icon: <Wrench size={20} className="text-warning" />,
      trend: { value: '-12.5%', isPositive: true } // Decrease is positive
    },
    {
      id: 'bookings',
      title: 'Active Bookings',
      value: '156',
      icon: <CalendarCheck size={20} className="text-info" />,
      trend: { value: '+8.4%', isPositive: true }
    },
    {
      id: 'transfers',
      title: 'Pending Transfers',
      value: '18',
      icon: <ArrowLeftRight size={20} className="text-warning" />,
      trend: { value: '+5.3%', isPositive: false } // Increase in pending transfers is negative
    },
    {
      id: 'returns',
      title: 'Upcoming Returns',
      value: '45',
      icon: <Clock size={20} className="text-primary" />,
      trend: { value: '8 today', isPositive: true }
    }
  ];

  const overdueItems = [
    {
      id: 'AF-0098',
      assetName: 'MacBook Pro 16" M3 Max',
      borrower: 'John Doe',
      dueDate: 'July 10, 2026',
      daysOverdue: 2,
      severity: 'danger'
    },
    {
      id: 'AF-0123',
      assetName: 'iPad Pro 11" Cellular',
      borrower: 'Sarah Smith',
      dueDate: 'July 08, 2026',
      daysOverdue: 4,
      severity: 'danger'
    },
    {
      id: 'AF-0045',
      assetName: 'Dell XPS 15 9530',
      borrower: 'David Miller',
      dueDate: 'July 11, 2026',
      daysOverdue: 1,
      severity: 'warning'
    }
  ];

  const recentActivities = [
    {
      id: 'act-1',
      type: 'success',
      message: 'Asset AF-0822 (Logitech MX Master 3) allocated to Alice Cooper',
      timestamp: '15 mins ago',
      detail: 'Workflow auto-approved by role policy.'
    },
    {
      id: 'act-2',
      type: 'warning',
      message: 'Asset AF-0311 (MacBook Air) reported in maintenance',
      timestamp: '2 hours ago',
      detail: 'Reason: Battery service recommended.'
    },
    {
      id: 'act-3',
      type: 'danger',
      message: 'Transfer request TR-1092 rejected',
      timestamp: '4 hours ago',
      detail: 'Rejected by Manager due to budget code mismatch.'
    },
    {
      id: 'act-4',
      type: 'info',
      message: 'New resource booking created for Conference Room C',
      timestamp: 'Yesterday',
      detail: 'Scheduled for July 15, 2026, at 14:00.'
    }
  ];

  const handleActionClick = (actionName) => {
    setNotification({
      type: 'success',
      message: `Simulated Action: "${actionName}" triggered successfully!`
    });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleAlertEmail = (borrower, assetName) => {
    setNotification({
      type: 'info',
      message: `Email reminder notification sent to ${borrower} for returning ${assetName}.`
    });
    setTimeout(() => setNotification(null), 4500);
  };

  return (
    <PageContainer title="Dashboard">
      {/* Simulation Notification Toast */}
      {notification && (
        <div className="nm-flat p-md rounded-md mb-lg d-flex justify-between align-center animate-fade-in" style={{ borderLeft: '4px solid var(--color-primary)' }}>
          <div className="d-flex align-center gap-sm">
            <Bell className="text-primary animate-pulse" size={18} />
            <span className="text-sm-sz font-semibold text-main">{notification.message}</span>
          </div>
          <button 
            className="nm-btn rounded-full p-xs d-flex align-center justify-center cursor-pointer"
            onClick={() => setNotification(null)}
            style={{ border: 'none', background: 'transparent' }}
          >
            <X size={14} className="text-muted" />
          </button>
        </div>
      )}

      {/* 1. Today's Overview Section */}
      <Card variant="flat" className="overview-card p-lg mb-lg">
        <div className="overview-banner">
          <div className="overview-welcome">
            <h2>Welcome back, System Admin</h2>
            <p>Asset management dashboard is healthy. You have 3 overdue items that require attention.</p>
          </div>
          <div className="overview-date-pill">
            <Calendar size={14} className="text-primary" />
            <span>{currentDate || 'Sunday, July 12, 2026'}</span>
          </div>
        </div>
      </Card>

      {/* 2. Six KPI StatCards Section */}
      <div className="kpi-grid">
        {kpis.map((kpi) => (
          <StatCard
            key={kpi.id}
            title={kpi.title}
            value={kpi.value}
            icon={kpi.icon}
            trend={kpi.trend}
          />
        ))}
      </div>

      {/* Main Dashboard Layout (Grid of 2 columns) */}
      <div className="dashboard-grid">
        
        {/* Left Side: Overdue Alerts & Activity Timeline */}
        <div className="dashboard-main-panel">
          
          {/* 3. Overdue Alert Card Section */}
          <Card variant="flat" className="p-lg">
            <div className="overdue-header">
              <div className="overdue-title-wrapper">
                <AlertTriangle className="text-danger" size={22} />
                <h3 className="overdue-title">Overdue Returns Alert</h3>
              </div>
              <Badge variant="danger" inset={false}>
                {overdueItems.length} Urgent
              </Badge>
            </div>
            
            <div className="overdue-list">
              {overdueItems.map((item) => (
                <div key={item.id} className="overdue-item">
                  <div className="overdue-details">
                    <span className="overdue-asset-name">{item.assetName}</span>
                    <span className="overdue-borrower">
                      <strong>ID:</strong> {item.id} • <strong>Borrower:</strong> {item.borrower}
                    </span>
                  </div>
                  
                  <div className="overdue-meta">
                    <span className={`overdue-days ${item.severity === 'danger' ? 'text-danger' : 'text-warning'}`}>
                      Overdue by {item.daysOverdue} {item.daysOverdue === 1 ? 'day' : 'days'}
                    </span>
                    <div className="d-flex gap-xs">
                      <Button 
                        variant="flat" 
                        size="sm" 
                        onClick={() => handleAlertEmail(item.borrower, item.assetName)}
                        icon={<Mail size={12} />}
                      >
                        Remind
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* 5. Recent Activity Timeline Section */}
          <Card variant="flat" className="p-lg">
            <h3 className="timeline-title">Recent Activity Timeline</h3>
            <div className="timeline-container">
              {recentActivities.map((act) => (
                <div key={act.id} className={`timeline-item ${act.type}`}>
                  <div className="timeline-node">
                    <span className="timeline-node-dot"></span>
                  </div>
                  <div className="timeline-header">
                    <p className="timeline-message font-semibold">{act.message}</p>
                    <span className="timeline-time">{act.timestamp}</span>
                  </div>
                  <span className="timeline-item-detail">{act.detail}</span>
                </div>
              ))}
            </div>
          </Card>
          
        </div>

        {/* Right Side: Quick Actions */}
        <div className="dashboard-sidebar-panel">
          
          {/* 4. Quick Actions Section */}
          <Card variant="flat" className="p-lg">
            <h3 className="quick-actions-title">Quick Actions</h3>
            <div className="quick-actions-grid">
              <button 
                className="quick-action-button" 
                onClick={() => handleActionClick('Add Asset')}
              >
                <div className="quick-action-icon-box">
                  <Plus size={18} />
                </div>
                <span className="quick-action-label">Add Asset</span>
              </button>

              <button 
                className="quick-action-button" 
                onClick={() => handleActionClick('New Allocation')}
              >
                <div className="quick-action-icon-box">
                  <Share2 size={18} />
                </div>
                <span className="quick-action-label">Allocate</span>
              </button>

              <button 
                className="quick-action-button" 
                onClick={() => handleActionClick('Create Booking')}
              >
                <div className="quick-action-icon-box">
                  <CalendarCheck size={18} />
                </div>
                <span className="quick-action-label">Book Room</span>
              </button>

              <button 
                className="quick-action-button" 
                onClick={() => handleActionClick('Report Issue')}
              >
                <div className="quick-action-icon-box">
                  <AlertTriangle size={18} />
                </div>
                <span className="quick-action-label">Report Issue</span>
              </button>
            </div>
          </Card>

          {/* Quick Metrics summary for advanced visual feel */}
          <Card variant="flat" className="p-lg d-flex flex-col gap-sm">
            <h4 className="text-heading font-semibold text-sm-sz m-0 uppercase text-muted">System Health</h4>
            <div className="d-flex align-center justify-between mt-xs">
              <span className="text-xs-sz text-main">API Status</span>
              <Badge variant="success" inset={true}>Online</Badge>
            </div>
            <div className="d-flex align-center justify-between">
              <span className="text-xs-sz text-main">Sync Interval</span>
              <span className="text-xs-sz font-bold text-heading">5 Mins</span>
            </div>
            <div className="d-flex align-center justify-between">
              <span className="text-xs-sz text-main">Database Load</span>
              <span className="text-xs-sz font-bold text-heading">4.2%</span>
            </div>
          </Card>
          
        </div>
        
      </div>
    </PageContainer>
  );
};

export default Dashboard;
