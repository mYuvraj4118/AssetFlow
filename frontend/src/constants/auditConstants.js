export const AUDIT_CYCLES = [
  {
    id: 'cycle-1',
    name: 'Annual Hardware Inventory Audit 2026',
    startDate: '2026-06-01',
    endDate: '2026-07-31',
    status: 'Active',
    totalAssets: 480,
    auditedCount: 326,
    discrepancyCount: 14
  },
  {
    id: 'cycle-2',
    name: 'Q1 Office Furniture Audit',
    startDate: '2026-01-10',
    endDate: '2026-02-15',
    status: 'Completed',
    totalAssets: 150,
    auditedCount: 150,
    discrepancyCount: 2
  }
];

export const AUDIT_RECORDS = [
  {
    id: 'rec-1',
    assetId: 'AF-0098',
    assetName: 'MacBook Pro 16" M3 Max',
    department: 'Engineering',
    expectedLocation: 'Main Lab Desk 4',
    assignedAuditor: 'Amit Patel',
    lastAuditDate: '2026-07-10',
    status: 'Verified',
    notes: 'In excellent physical shape, barcode scan successful.'
  },
  {
    id: 'rec-2',
    assetId: 'AF-0123',
    assetName: 'iPad Pro 11" Cellular',
    department: 'Facilities',
    expectedLocation: 'Storage Locker B',
    assignedAuditor: 'Rohan Mehta',
    lastAuditDate: '2026-07-08',
    status: 'Discrepancy',
    notes: 'Asset expected in Storage Locker B, but was found at Front Reception Desk.'
  },
  {
    id: 'rec-3',
    assetId: 'AF-0045',
    assetName: 'Dell XPS 15 9530',
    department: 'Engineering',
    expectedLocation: 'Remote Assignment',
    assignedAuditor: 'Aditi Rao',
    lastAuditDate: '2026-07-11',
    status: 'Verified',
    notes: 'Self-audit form verified by employee.'
  },
  {
    id: 'rec-4',
    assetId: 'AF-0822',
    assetName: 'Logitech MX Master 3',
    department: 'Operations',
    expectedLocation: 'Main Desk 12',
    assignedAuditor: 'Sana Iqbal',
    lastAuditDate: null,
    status: 'Pending',
    notes: ''
  },
  {
    id: 'rec-5',
    assetId: 'AF-0311',
    assetName: 'MacBook Air 15" M2',
    department: 'Operations',
    expectedLocation: 'Operations Room Desk 1',
    assignedAuditor: 'Sana Iqbal',
    lastAuditDate: '2026-07-09',
    status: 'Discrepancy',
    notes: 'Reported battery swelling issue. Shifted to Maintenance, but state records not updated.'
  }
];

export const AUDITORS = [
  'Aditi Rao',
  'Rohan Mehta',
  'Sana Iqbal',
  'Amit Patel',
  'Priya Sharma'
];
