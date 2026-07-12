export const initialAuditCycle = {
  id: 'cycle-2026-q3',
  name: 'Q3 Enterprise Asset Audit 2026',
  quarter: 'Q3 2026',
  department: 'All Departments',
  startDate: '2026-07-01',
  endDate: '2026-08-31',
  assignedAuditors: ['Aditi Rao', 'Rohan Mehta', 'Sana Iqbal', 'Amit Patel'],
  status: 'In Progress'
};

export const initialAssetList = [
  {
    assetTag: 'AST-0892',
    assetName: 'MacBook Pro 16" M3 Max',
    expectedLocation: 'Main Lab Desk 4',
    currentHolder: 'Sarah Jenkins',
    verificationStatus: 'Verified',
    lastVerified: '2026-07-10',
    department: 'Engineering'
  },
  {
    assetTag: 'AST-0412',
    assetName: 'iPad Pro 11" Cellular',
    expectedLocation: 'Front Reception Desk',
    currentHolder: 'David Lee',
    verificationStatus: 'Missing',
    lastVerified: '2026-07-08',
    department: 'Facilities'
  },
  {
    assetTag: 'AST-0056',
    assetName: 'Dell XPS 15 9530',
    expectedLocation: 'Engineering Room B',
    currentHolder: 'John Doe',
    verificationStatus: 'Verified',
    lastVerified: '2026-07-11',
    department: 'Engineering'
  },
  {
    assetTag: 'AST-0771',
    assetName: 'LG UltraFine 27" Monitor',
    expectedLocation: 'Operations Desk 12',
    currentHolder: 'Alice Cooper',
    verificationStatus: 'Pending',
    lastVerified: null,
    department: 'Operations'
  },
  {
    assetTag: 'AST-0311',
    assetName: 'MacBook Air 15" M2',
    expectedLocation: 'Operations Room Desk 1',
    currentHolder: 'Sana Iqbal',
    verificationStatus: 'Damaged',
    lastVerified: '2026-07-09',
    department: 'Operations'
  },
  {
    assetTag: 'AST-0105',
    assetName: 'ThinkPad T14 Gen 4',
    expectedLocation: 'HR Office Cab 2',
    currentHolder: 'Priya Sharma',
    verificationStatus: 'Pending',
    lastVerified: null,
    department: 'HR/Admin'
  },
  {
    assetTag: 'AST-0229',
    assetName: 'iPhone 15 Pro 256GB',
    expectedLocation: 'Executive Cabin 1',
    currentHolder: 'Aditi Rao',
    verificationStatus: 'Verified',
    lastVerified: '2026-07-12',
    department: 'Engineering'
  },
  {
    assetTag: 'AST-0994',
    assetName: 'Sony WH-1000XM5 Headset',
    expectedLocation: 'Marketing Lab 1',
    currentHolder: 'Amit Patel',
    verificationStatus: 'Damaged',
    lastVerified: '2026-07-05',
    department: 'Marketing'
  }
];

export const departments = [
  'All',
  'Engineering',
  'Operations',
  'Facilities',
  'HR/Admin',
  'Marketing'
];
