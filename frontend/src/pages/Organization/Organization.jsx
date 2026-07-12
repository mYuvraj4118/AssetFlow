import React, { useState } from 'react';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Building2, 
  Layers, 
  Users, 
  X, 
  AlertCircle,
  FolderPlus,
  UserPlus
} from 'lucide-react';
import PageContainer from '../../components/layout/PageContainer';
import { Card, Button, Badge, SearchBar, EmptyState } from '../../components/common';
import './Organization.css';

const Organization = () => {
  // State variables
  const [activeTab, setActiveTab] = useState('Departments');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Dialog/Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  
  // Department Form fields
  const [deptName, setDeptName] = useState('');
  const [deptHead, setDeptHead] = useState('');
  const [deptParent, setDeptParent] = useState('');
  const [deptStatus, setDeptStatus] = useState('Active');

  // Category Form fields
  const [catName, setCatName] = useState('');
  const [catCode, setCatCode] = useState('');
  const [catDesc, setCatDesc] = useState('');

  // Employee Form fields
  const [empName, setEmpName] = useState('');
  const [empEmail, setEmpEmail] = useState('');
  const [empDept, setEmpDept] = useState('');
  const [empRole, setEmpRole] = useState('');
  const [empStatus, setEmpStatus] = useState('Active');

  // 1. Departments mock data (from index.js approved content)
  const [departments, setDepartments] = useState([
    {
      id: 1,
      department: 'Engineering',
      head: 'Aditi Rao',
      parent: '-',
      status: 'Active'
    },
    {
      id: 2,
      department: 'Facilities',
      head: 'Rohan Mehta',
      parent: '-',
      status: 'Active'
    },
    {
      id: 3,
      department: 'Field Ops',
      head: 'Sana Iqbal',
      parent: 'Operations',
      status: 'Inactive'
    }
  ]);

  // 2. Categories mock data (Starts empty to showcase the Empty State component)
  const [categories, setCategories] = useState([]);

  // 3. Employees mock data
  const [employees, setEmployees] = useState([
    {
      id: 1,
      name: 'Aditi Rao',
      email: 'aditi.rao@assetflow.com',
      department: 'Engineering',
      role: 'Department Head',
      status: 'Active'
    },
    {
      id: 2,
      name: 'Rohan Mehta',
      email: 'rohan.mehta@assetflow.com',
      department: 'Facilities',
      role: 'Department Head',
      status: 'Active'
    },
    {
      id: 3,
      name: 'Sana Iqbal',
      email: 'sana.iqbal@assetflow.com',
      department: 'Field Ops',
      role: 'Lead Operator',
      status: 'Active'
    },
    {
      id: 4,
      name: 'Amit Patel',
      email: 'amit.patel@assetflow.com',
      department: 'Engineering',
      role: 'Senior Developer',
      status: 'Active'
    }
  ]);

  // Search Filter Handler
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  // Add Button Click Handler
  const handleOpenAddModal = () => {
    setEditingItem(null);
    if (activeTab === 'Departments') {
      setDeptName('');
      setDeptHead('');
      setDeptParent('-');
      setDeptStatus('Active');
    } else if (activeTab === 'Categories') {
      setCatName('');
      setCatCode('');
      setCatDesc('');
    } else if (activeTab === 'Employees') {
      setEmpName('');
      setEmpEmail('');
      setEmpDept('Engineering');
      setEmpRole('');
      setEmpStatus('Active');
    }
    setIsModalOpen(true);
  };

  // Row Edit Handler
  const handleEditRow = (item) => {
    setEditingItem(item);
    if (activeTab === 'Departments') {
      setDeptName(item.department);
      setDeptHead(item.head);
      setDeptParent(item.parent);
      setDeptStatus(item.status);
    } else if (activeTab === 'Categories') {
      setCatName(item.name);
      setCatCode(item.code);
      setCatDesc(item.description);
    } else if (activeTab === 'Employees') {
      setEmpName(item.name);
      setEmpEmail(item.email);
      setEmpDept(item.department);
      setEmpRole(item.role);
      setEmpStatus(item.status);
    }
    setIsModalOpen(true);
  };

  // Row Delete Handler
  const handleDeleteRow = (id) => {
    if (activeTab === 'Departments') {
      setDepartments(departments.filter(d => d.id !== id));
    } else if (activeTab === 'Categories') {
      setCategories(categories.filter(c => c.id !== id));
    } else if (activeTab === 'Employees') {
      setEmployees(employees.filter(e => e.id !== id));
    }
  };

  // Form Submit Handler
  const handleFormSubmit = (e) => {
    e.preventDefault();

    if (activeTab === 'Departments') {
      if (editingItem) {
        setDepartments(departments.map(d => d.id === editingItem.id ? {
          ...d,
          department: deptName,
          head: deptHead,
          parent: deptParent,
          status: deptStatus
        } : d));
      } else {
        const newDept = {
          id: Date.now(),
          department: deptName,
          head: deptHead,
          parent: deptParent || '-',
          status: deptStatus
        };
        setDepartments([...departments, newDept]);
      }
    } else if (activeTab === 'Categories') {
      if (editingItem) {
        setCategories(categories.map(c => c.id === editingItem.id ? {
          ...c,
          name: catName,
          code: catCode,
          description: catDesc
        } : c));
      } else {
        const newCat = {
          id: Date.now(),
          name: catName,
          code: catCode.toUpperCase(),
          description: catDesc,
          totalAssets: 0
        };
        setCategories([...categories, newCat]);
      }
    } else if (activeTab === 'Employees') {
      if (editingItem) {
        setEmployees(employees.map(emp => emp.id === editingItem.id ? {
          ...emp,
          name: empName,
          email: empEmail,
          department: empDept,
          role: empRole,
          status: empStatus
        } : emp));
      } else {
        const newEmp = {
          id: Date.now(),
          name: empName,
          email: empEmail,
          department: empDept,
          role: empRole,
          status: empStatus
        };
        setEmployees([...employees, newEmp]);
      }
    }
    setIsModalOpen(false);
  };

  // Toggle Item Status (Active <-> Inactive)
  const handleToggleStatus = (item) => {
    if (activeTab === 'Departments') {
      setDepartments(departments.map(d => d.id === item.id ? {
        ...d,
        status: d.status === 'Active' ? 'Inactive' : 'Active'
      } : d));
    } else if (activeTab === 'Employees') {
      setEmployees(employees.map(emp => emp.id === item.id ? {
        ...emp,
        status: emp.status === 'Active' ? 'Inactive' : 'Active'
      } : emp));
    }
  };

  // Filters Data based on Active Tab and Search Queries
  const getFilteredData = () => {
    const q = searchQuery.toLowerCase().trim();
    if (activeTab === 'Departments') {
      return departments.filter(d => 
        d.department.toLowerCase().includes(q) || 
        d.head.toLowerCase().includes(q) ||
        d.parent.toLowerCase().includes(q)
      );
    } else if (activeTab === 'Categories') {
      return categories.filter(c => 
        c.name.toLowerCase().includes(q) || 
        c.code.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q)
      );
    } else if (activeTab === 'Employees') {
      return employees.filter(emp => 
        emp.name.toLowerCase().includes(q) || 
        emp.email.toLowerCase().includes(q) ||
        emp.department.toLowerCase().includes(q) ||
        emp.role.toLowerCase().includes(q)
      );
    }
    return [];
  };

  const filteredData = getFilteredData();

  // Switch Tab Handler
  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
    setSearchQuery(''); // clear search on tab shift
  };

  // Helper labels depending on the active tab
  const getTabLabelSingular = () => {
    if (activeTab === 'Departments') return 'Department';
    if (activeTab === 'Categories') return 'Category';
    return 'Employee';
  };

  return (
    <PageContainer title="Organization Setup">
      {/* 1. Header Toolbar (Search and Add Button) */}
      <div className="org-toolbar">
        <div className="org-search-wrapper">
          <SearchBar
            placeholder={`Search ${activeTab.toLowerCase()}...`}
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>
        <Button 
          variant="primary" 
          onClick={handleOpenAddModal}
          icon={<Plus size={16} />}
        >
          Add {getTabLabelSingular()}
        </Button>
      </div>

      {/* 2. Tabs Switcher */}
      <div className="org-tabs-container">
        <button 
          className={`org-tab-btn ${activeTab === 'Departments' ? 'active' : ''}`}
          onClick={() => handleTabChange('Departments')}
        >
          Departments
        </button>
        <button 
          className={`org-tab-btn ${activeTab === 'Categories' ? 'active' : ''}`}
          onClick={() => handleTabChange('Categories')}
        >
          Categories
        </button>
        <button 
          className={`org-tab-btn ${activeTab === 'Employees' ? 'active' : ''}`}
          onClick={() => handleTabChange('Employees')}
        >
          Employees
        </button>
      </div>

      {/* 3. Main Data Content Area */}
      <Card variant="flat" className="org-table-card p-lg">
        
        {/* Render EmptyState if search returned nothing */}
        {searchQuery && filteredData.length === 0 ? (
          <EmptyState
            title="No Results Found"
            description={`We couldn't find any match for "${searchQuery}" in ${activeTab.toLowerCase()}.`}
            icon={<AlertCircle size={36} className="text-warning" />}
            actionButton={
              <Button variant="flat" onClick={handleClearSearch}>
                Clear Search
              </Button>
            }
          />
        ) : activeTab === 'Categories' && categories.length === 0 ? (
          // Showcase the EmptyState component out-of-the-box on Categories
          <EmptyState
            title="No Categories Configured"
            description="Add asset categories (e.g. IT Equipment, Office Furniture) to establish organizational structures."
            icon={<Layers size={36} className="text-primary" />}
            actionButton={
              <Button variant="primary" onClick={handleOpenAddModal} icon={<Plus size={16} />}>
                Create Category
              </Button>
            }
          />
        ) : filteredData.length === 0 ? (
          <EmptyState
            title={`No ${activeTab} Added`}
            description={`Get started by adding your first ${getTabLabelSingular().toLowerCase()} to the system.`}
            icon={<Building2 size={36} className="text-primary" />}
            actionButton={
              <Button variant="primary" onClick={handleOpenAddModal} icon={<Plus size={16} />}>
                Add {getTabLabelSingular()}
              </Button>
            }
          />
        ) : (
          /* 4. Responsive Data Tables */
          <div className="org-table-responsive-wrapper">
            {activeTab === 'Departments' && (
              <table className="org-table">
                <thead>
                  <tr>
                    <th>Department</th>
                    <th>Head</th>
                    <th>Parent Department</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((d) => (
                    <tr key={d.id}>
                      <td className="font-semibold text-heading">{d.department}</td>
                      <td>{d.head || '-'}</td>
                      <td>{d.parent}</td>
                      <td>
                        <span 
                          onClick={() => handleToggleStatus(d)} 
                          className="cursor-pointer" 
                          title="Click to toggle status"
                        >
                          <Badge variant={d.status === 'Active' ? 'success' : 'neutral'} inset={true}>
                            {d.status}
                          </Badge>
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons-cell">
                          <button 
                            className="row-action-btn edit-btn" 
                            onClick={() => handleEditRow(d)}
                            title="Edit Department"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button 
                            className="row-action-btn delete-btn" 
                            onClick={() => handleDeleteRow(d.id)}
                            title="Delete Department"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === 'Categories' && (
              <table className="org-table">
                <thead>
                  <tr>
                    <th>Category Name</th>
                    <th>Code</th>
                    <th>Description</th>
                    <th>Total Assets</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((c) => (
                    <tr key={c.id}>
                      <td className="font-semibold text-heading">{c.name}</td>
                      <td>
                        <Badge variant="info" inset={false}>
                          {c.code}
                        </Badge>
                      </td>
                      <td style={{ maxWidth: '280px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                        {c.description || '-'}
                      </td>
                      <td className="font-semibold">{c.totalAssets}</td>
                      <td>
                        <div className="action-buttons-cell">
                          <button 
                            className="row-action-btn edit-btn" 
                            onClick={() => handleEditRow(c)}
                            title="Edit Category"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button 
                            className="row-action-btn delete-btn" 
                            onClick={() => handleDeleteRow(c.id)}
                            title="Delete Category"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === 'Employees' && (
              <table className="org-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Department</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((emp) => (
                    <tr key={emp.id}>
                      <td className="font-semibold text-heading">{emp.name}</td>
                      <td>{emp.email}</td>
                      <td>{emp.department}</td>
                      <td>{emp.role || '-'}</td>
                      <td>
                        <span 
                          onClick={() => handleToggleStatus(emp)} 
                          className="cursor-pointer" 
                          title="Click to toggle status"
                        >
                          <Badge variant={emp.status === 'Active' ? 'success' : 'neutral'} inset={true}>
                            {emp.status}
                          </Badge>
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons-cell">
                          <button 
                            className="row-action-btn edit-btn" 
                            onClick={() => handleEditRow(emp)}
                            title="Edit Employee"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button 
                            className="row-action-btn delete-btn" 
                            onClick={() => handleDeleteRow(emp.id)}
                            title="Delete Employee"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </Card>

      {/* Neumorphic Mock Modal for Add / Edit Actions */}
      {isModalOpen && (
        <div 
          className="org-simulation-modal pos-fixed top-0 left-0 w-screen h-screen z-50 d-flex align-center justify-center p-md" 
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(3px)' }}
        >
          <Card variant="flat" className="w-full max-w-md p-lg">
            <div className="d-flex justify-between align-center mb-md" style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: 'var(--spacing-sm)' }}>
              <h3 className="text-heading font-semibold text-lg-sz m-0">
                {editingItem ? 'Edit' : 'Add'} {getTabLabelSingular()}
              </h3>
              <button 
                className="nm-btn rounded-full p-xs d-flex align-center justify-center cursor-pointer"
                onClick={() => setIsModalOpen(false)}
                style={{ border: 'none', background: 'transparent' }}
              >
                <X size={16} className="text-muted" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="d-flex flex-col gap-sm">
              {activeTab === 'Departments' && (
                <>
                  <div className="org-field-group">
                    <label>Department Name</label>
                    <input 
                      type="text" 
                      required 
                      className="nm-field"
                      value={deptName} 
                      onChange={(e) => setDeptName(e.target.value)} 
                      placeholder="e.g. Engineering"
                    />
                  </div>
                  <div className="org-field-group">
                    <label>Department Head</label>
                    <input 
                      type="text" 
                      required 
                      className="nm-field"
                      value={deptHead} 
                      onChange={(e) => setDeptHead(e.target.value)} 
                      placeholder="e.g. Aditi Rao"
                    />
                  </div>
                  <div className="org-field-group">
                    <label>Parent Department</label>
                    <input 
                      type="text" 
                      className="nm-field"
                      value={deptParent} 
                      onChange={(e) => setDeptParent(e.target.value)} 
                      placeholder="e.g. Operations (use '-' if none)"
                    />
                  </div>
                  <div className="org-field-group">
                    <label>Status</label>
                    <select 
                      className="org-select"
                      value={deptStatus} 
                      onChange={(e) => setDeptStatus(e.target.value)}
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </>
              )}

              {activeTab === 'Categories' && (
                <>
                  <div className="org-field-group">
                    <label>Category Name</label>
                    <input 
                      type="text" 
                      required 
                      className="nm-field"
                      value={catName} 
                      onChange={(e) => setCatName(e.target.value)} 
                      placeholder="e.g. IT Equipment"
                    />
                  </div>
                  <div className="org-field-group">
                    <label>Category Code</label>
                    <input 
                      type="text" 
                      required 
                      className="nm-field"
                      value={catCode} 
                      onChange={(e) => setCatCode(e.target.value)} 
                      placeholder="e.g. ITEQ"
                    />
                  </div>
                  <div className="org-field-group">
                    <label>Description</label>
                    <textarea 
                      className="nm-field"
                      value={catDesc} 
                      onChange={(e) => setCatDesc(e.target.value)} 
                      placeholder="e.g. Computers, servers and mobile devices"
                      rows={3}
                      style={{ resize: 'none', fontFamily: 'inherit' }}
                    />
                  </div>
                </>
              )}

              {activeTab === 'Employees' && (
                <>
                  <div className="org-field-group">
                    <label>Employee Name</label>
                    <input 
                      type="text" 
                      required 
                      className="nm-field"
                      value={empName} 
                      onChange={(e) => setEmpName(e.target.value)} 
                      placeholder="e.g. Amit Patel"
                    />
                  </div>
                  <div className="org-field-group">
                    <label>Email Address</label>
                    <input 
                      type="email" 
                      required 
                      className="nm-field"
                      value={empEmail} 
                      onChange={(e) => setEmpEmail(e.target.value)} 
                      placeholder="e.g. amit@assetflow.com"
                    />
                  </div>
                  <div className="org-field-group">
                    <label>Department</label>
                    <select 
                      className="org-select"
                      value={empDept} 
                      onChange={(e) => setEmpDept(e.target.value)}
                    >
                      {departments.map(d => (
                        <option key={d.id} value={d.department}>{d.department}</option>
                      ))}
                    </select>
                  </div>
                  <div className="org-field-group">
                    <label>Job Title/Role</label>
                    <input 
                      type="text" 
                      required 
                      className="nm-field"
                      value={empRole} 
                      onChange={(e) => setEmpRole(e.target.value)} 
                      placeholder="e.g. Software Engineer"
                    />
                  </div>
                  <div className="org-field-group">
                    <label>Status</label>
                    <select 
                      className="org-select"
                      value={empStatus} 
                      onChange={(e) => setEmpStatus(e.target.value)}
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </>
              )}

              <div className="d-flex justify-end gap-sm mt-md" style={{ borderTop: '1px solid var(--color-border)', paddingTop: 'var(--spacing-md)' }}>
                <Button variant="flat" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Save Changes
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </PageContainer>
  );
};

export default Organization;
