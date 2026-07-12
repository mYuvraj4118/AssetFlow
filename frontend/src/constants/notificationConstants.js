export const INITIAL_NOTIFICATIONS = [
  {
    id: 'notif-1',
    type: 'alert',
    message: 'CRITICAL ALERT: MacBook Pro (AF-0098) return deadline was July 10, 2026. Action required.',
    timestamp: '2026-07-12T13:30:00Z',
    read: false,
    refId: 'AF-0098'
  },
  {
    id: 'notif-2',
    type: 'maintenance',
    message: 'MAINTENANCE UPDATE: Server Cabinet Fan repair request marked as IN PROGRESS.',
    timestamp: '2026-07-12T11:15:00Z',
    read: false,
    refId: 'MNT-049'
  },
  {
    id: 'notif-3',
    type: 'booking',
    message: 'BOOKING CONFIRMED: Conference Room C reserved for tomorrow at 14:00 - 15:30.',
    timestamp: '2026-07-12T09:00:00Z',
    read: true,
    refId: 'BKG-182'
  },
  {
    id: 'notif-4',
    type: 'system',
    message: 'SYSTEM UPDATE: Weekly automated database replication finished with zero warnings.',
    timestamp: '2026-07-11T23:00:00Z',
    read: true,
    refId: null
  },
  {
    id: 'notif-5',
    type: 'alert',
    message: 'TRANSFER APPROVED: Dell XPS (AF-0045) transfer from Facilities to Engineering approved.',
    timestamp: '2026-07-11T16:45:00Z',
    read: true,
    refId: 'TR-1092'
  },
  {
    id: 'notif-6',
    type: 'maintenance',
    message: 'MAINTENANCE COMPLETED: Desktop Monitor (AF-0771) repair completed. Moved back to Available.',
    timestamp: '2026-07-11T10:30:00Z',
    read: false,
    refId: 'AF-0771'
  }
];
