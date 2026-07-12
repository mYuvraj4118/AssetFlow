export const initialNotifications = [
  {
    id: 'notif-1',
    title: 'Overdue Return Reminder',
    description: 'MacBook Pro (AST-0892) return deadline was July 10, 2026. Action required.',
    timestamp: '2026-07-12T13:30:00Z',
    priority: 'Critical',
    read: false,
    category: 'Audit',
    refId: 'AST-0892'
  },
  {
    id: 'notif-2',
    title: 'Booking Approved',
    description: 'Conference Room C reserved for tomorrow at 14:00 - 15:30 approved.',
    timestamp: '2026-07-12T11:15:00Z',
    priority: 'Medium',
    read: false,
    category: 'Bookings',
    refId: 'BKG-182'
  },
  {
    id: 'notif-3',
    title: 'Maintenance Request Approved',
    description: 'Repair request for Desktop Monitor AST-0311 marked as IN PROGRESS.',
    timestamp: '2026-07-12T09:00:00Z',
    priority: 'High',
    read: true,
    category: 'Maintenance',
    refId: 'MNT-049'
  },
  {
    id: 'notif-4',
    title: 'Asset Assigned',
    description: 'New Dell XPS Laptop assigned to Engineering Department pool.',
    timestamp: '2026-07-11T23:00:00Z',
    priority: 'Low',
    read: true,
    category: 'System',
    refId: 'AST-0056'
  },
  {
    id: 'notif-5',
    title: 'Transfer Completed',
    description: 'iPhone 15 transfer from Facilities to Engineering completed.',
    timestamp: '2026-07-11T16:45:00Z',
    priority: 'Medium',
    read: true,
    category: 'Approvals',
    refId: 'TR-1092'
  },
  {
    id: 'notif-6',
    title: 'Audit Started',
    description: 'Q3 Enterprise Asset Audit cycle has been initialized by Admin.',
    timestamp: '2026-07-11T10:30:00Z',
    priority: 'High',
    read: false,
    category: 'Audit',
    refId: 'cycle-2026-q3'
  }
];

export const timelineEvents = [
  {
    id: 'time-1',
    user: 'Amit Patel',
    action: 'Approved asset return request',
    module: 'Allocations',
    timestamp: '2026-07-12T14:10:00Z',
    status: 'Completed'
  },
  {
    id: 'time-2',
    user: 'Rohan Mehta',
    action: 'Scheduled maintenance repair',
    module: 'Maintenance',
    timestamp: '2026-07-12T10:00:00Z',
    status: 'Scheduled'
  },
  {
    id: 'time-3',
    user: 'Sana Iqbal',
    action: 'Logged asset discrepancy',
    module: 'Audit',
    timestamp: '2026-07-11T15:20:00Z',
    status: 'Pending'
  },
  {
    id: 'time-4',
    user: 'Aditi Rao',
    action: 'Initiated resource booking',
    module: 'Bookings',
    timestamp: '2026-07-11T09:45:00Z',
    status: 'Approved'
  }
];

export const categories = ['All', 'Unread', 'Approvals', 'Maintenance', 'Bookings', 'Audit', 'System'];
export const priorities = ['All', 'Critical', 'High', 'Medium', 'Low'];
export const statuses = ['All', 'Read', 'Unread'];
