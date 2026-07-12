export const initialKPIs = {
  totalAssets: 1245,
  allocatedAssets: 842,
  availableAssets: 376,
  maintenanceAssets: 27,
  activeBookings: 142,
  auditCompletion: 76 // 76%
};

export const utilizationData = [
  { name: 'Allocated', value: 842, color: '#aa3bff' },
  { name: 'Available', value: 376, color: '#10b981' },
  { name: 'In Maintenance', value: 27, color: '#f59e0b' },
  { name: 'Retired/Disposed', value: 15, color: '#ef4444' }
];

export const departmentData = [
  { name: 'Engineering', count: 480, value: 58000 },
  { name: 'Operations', count: 240, value: 29000 },
  { name: 'Facilities', count: 120, value: 14500 },
  { name: 'Marketing', count: 90, value: 11000 },
  { name: 'HR/Admin', count: 60, value: 7200 }
];

export const maintenanceData = [
  { month: 'Jan', cost: 1200, count: 8 },
  { month: 'Feb', cost: 1900, count: 12 },
  { month: 'Mar', cost: 1400, count: 9 },
  { month: 'Apr', cost: 2300, count: 15 },
  { month: 'May', cost: 1700, count: 11 },
  { month: 'Jun', cost: 3100, count: 19 },
  { month: 'Jul', cost: 2200, count: 14 }
];

export const heatmapData = [
  { day: 'Mon', '09:00': 4, '12:00': 8, '15:00': 6, '18:00': 2 },
  { day: 'Tue', '09:00': 6, '12:00': 9, '15:00': 7, '18:00': 3 },
  { day: 'Wed', '09:00': 8, '12:00': 10, '15:00': 9, '18:00': 5 },
  { day: 'Thu', '09:00': 5, '12:00': 7, '15:00': 8, '18:00': 4 },
  { day: 'Fri', '09:00': 3, '12:00': 6, '15:00': 5, '18:00': 1 }
];

export const upcomingRetirement = [
  { tag: 'AST-0091', name: 'MacBook Pro 15" Intel', retireDate: '2026-08-15', department: 'Operations' },
  { tag: 'AST-0223', name: 'Dell Monitor U2415', retireDate: '2026-09-01', department: 'Engineering' },
  { tag: 'AST-0841', name: 'iPad Air 4th Gen', retireDate: '2026-09-20', department: 'Marketing' }
];

export const insights = {
  mostUtilized: 'Meeting Room Conference A (92% usage)',
  leastUtilized: 'Logistics Van C (14% usage)',
  maintenanceFrequency: 'High load in Jun due to thermal upgrades',
  rankings: [
    { name: 'Engineering', rate: 94 },
    { name: 'Operations', rate: 86 },
    { name: 'Marketing', rate: 78 }
  ]
};

export const summary = {
  highlights: 'Asset pool capacity is stable. Space utilisation rose 14% on Wednesdays.',
  recommendations: 'Retire out-of-warranty Intel models by August 15. Standardise on M-series chips.',
  operationalHighlight: 'Overall audit cycle stands at 76% completion. Outstanding audits are primarily in Remote Operations.'
};

export const departments = ['All', 'Engineering', 'Operations', 'Facilities', 'Marketing', 'HR/Admin'];
export const categories = ['All', 'Hardware', 'Software', 'Furniture', 'Vehicles'];
export const statuses = ['All', 'Active', 'Under Maintenance', 'Retired', 'Available'];
