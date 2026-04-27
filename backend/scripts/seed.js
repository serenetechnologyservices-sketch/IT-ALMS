const sequelize = require('../src/config/database');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

async function seed() {
  const qi = sequelize.getQueryInterface();
  const now = new Date();

  // 1. Roles
  const roles = [
    { id: 1, name: 'Employee', description: 'Regular employee', created_at: now, updated_at: now },
    { id: 2, name: 'Reporting Manager', description: 'Team manager with approval rights', created_at: now, updated_at: now },
    { id: 3, name: 'Admin', description: 'IT Administrator', created_at: now, updated_at: now },
    { id: 4, name: 'CIO', description: 'Chief Information Officer', created_at: now, updated_at: now },
    { id: 5, name: 'Service Partner', description: 'External service vendor', created_at: now, updated_at: now },
    { id: 6, name: 'Service Engineer', description: 'Individual technician', created_at: now, updated_at: now },
  ];
  await qi.bulkInsert('roles', roles);
  console.log('Roles seeded.');

  // 2. Users
  const hash = await bcrypt.hash('password123', 10);
  const adminHash = await bcrypt.hash('admin123', 10);

  const users = [
    { id: 1, username: 'admin', password: adminHash, full_name: 'System Admin', email: 'admin@assetplatform.com', role_id: 3, manager_id: null, department: 'IT', status: 'active', created_at: now, updated_at: now },
    { id: 2, username: 'manager1', password: hash, full_name: 'Raj Kumar', email: 'raj@assetplatform.com', role_id: 2, manager_id: null, department: 'Engineering', status: 'active', created_at: now, updated_at: now },
    { id: 3, username: 'employee1', password: hash, full_name: 'Priya Sharma', email: 'priya@assetplatform.com', role_id: 1, manager_id: 2, department: 'Engineering', status: 'active', created_at: now, updated_at: now },
    { id: 4, username: 'employee2', password: hash, full_name: 'Amit Patel', email: 'amit@assetplatform.com', role_id: 1, manager_id: 2, department: 'Engineering', status: 'active', created_at: now, updated_at: now },
    { id: 5, username: 'cio', password: hash, full_name: 'Vikram Singh', email: 'vikram@assetplatform.com', role_id: 4, manager_id: null, department: 'Executive', status: 'active', created_at: now, updated_at: now },
    { id: 6, username: 'partner1', password: hash, full_name: 'TechServ Solutions', email: 'partner@techserv.com', role_id: 5, manager_id: null, department: 'External', status: 'active', created_at: now, updated_at: now },
    { id: 7, username: 'engineer1', password: hash, full_name: 'Suresh Technician', email: 'suresh@techserv.com', role_id: 6, manager_id: null, department: 'External', status: 'active', created_at: now, updated_at: now },
  ];
  await qi.bulkInsert('users', users);
  console.log('Users seeded.');

  // 3. Asset Categories
  const categories = [
    { id: 1, name: 'Laptop', description: 'Portable computers', created_at: now, updated_at: now },
    { id: 2, name: 'Desktop', description: 'Desktop computers', created_at: now, updated_at: now },
    { id: 3, name: 'Server', description: 'Server hardware', created_at: now, updated_at: now },
    { id: 4, name: 'Monitor', description: 'Display monitors', created_at: now, updated_at: now },
    { id: 5, name: 'Printer', description: 'Printers and scanners', created_at: now, updated_at: now },
    { id: 6, name: 'Network Equipment', description: 'Routers, switches, access points', created_at: now, updated_at: now },
  ];
  await qi.bulkInsert('asset_categories', categories);
  console.log('Asset categories seeded.');

  // 4. Vendors
  const vendors = [
    { id: 1, name: 'Dell Technologies', contact_person: 'Sales Team', email: 'sales@dell.com', phone: '1800-425-0000', service_type: 'Hardware', status: 'active', created_at: now, updated_at: now },
    { id: 2, name: 'HP Inc', contact_person: 'Enterprise Sales', email: 'sales@hp.com', phone: '1800-108-4747', service_type: 'Hardware', status: 'active', created_at: now, updated_at: now },
    { id: 3, name: 'Lenovo', contact_person: 'Business Sales', email: 'sales@lenovo.com', phone: '1800-419-7555', service_type: 'Hardware', status: 'active', created_at: now, updated_at: now },
  ];
  await qi.bulkInsert('vendors', vendors);
  console.log('Vendors seeded.');

  // 5. Sample Assets
  const assets = [
    { id: 1, name: 'Dell Latitude 5540', category_id: 1, serial_number: 'DL-5540-001', configuration: 'i7, 16GB RAM, 512GB SSD', purchase_date: '2023-06-15', purchase_cost: 85000.00, salvage_value: 10000.00, useful_life_years: 5, vendor_id: 1, status: 'allocated', qr_code: uuidv4(), maintenance_cost: 2500.00, created_at: now, updated_at: now },
    { id: 2, name: 'HP EliteDesk 800', category_id: 2, serial_number: 'HP-800-001', configuration: 'i5, 8GB RAM, 256GB SSD', purchase_date: '2023-01-10', purchase_cost: 55000.00, salvage_value: 5000.00, useful_life_years: 5, vendor_id: 2, status: 'available', qr_code: uuidv4(), maintenance_cost: 0, created_at: now, updated_at: now },
    { id: 3, name: 'Lenovo ThinkPad X1', category_id: 1, serial_number: 'LN-X1-001', configuration: 'i7, 32GB RAM, 1TB SSD', purchase_date: '2024-01-20', purchase_cost: 120000.00, salvage_value: 15000.00, useful_life_years: 5, vendor_id: 3, status: 'allocated', qr_code: uuidv4(), maintenance_cost: 0, created_at: now, updated_at: now },
    { id: 4, name: 'Dell PowerEdge R740', category_id: 3, serial_number: 'DL-R740-001', configuration: 'Xeon, 64GB RAM, 4TB RAID', purchase_date: '2022-03-01', purchase_cost: 350000.00, salvage_value: 50000.00, useful_life_years: 7, vendor_id: 1, status: 'available', qr_code: uuidv4(), maintenance_cost: 15000.00, created_at: now, updated_at: now },
    { id: 5, name: 'HP LaserJet Pro', category_id: 5, serial_number: 'HP-LJ-001', configuration: 'Color, Duplex, Network', purchase_date: '2021-08-15', purchase_cost: 25000.00, salvage_value: 2000.00, useful_life_years: 5, vendor_id: 2, status: 'available', qr_code: uuidv4(), maintenance_cost: 8000.00, created_at: now, updated_at: now },
  ];
  await qi.bulkInsert('assets', assets);
  console.log('Assets seeded.');

  // 6. Sample Allocations
  const allocations = [
    { id: 1, asset_id: 1, user_id: 3, allocated_by: 1, allocation_date: '2023-07-01', return_date: null, location: 'Office - Floor 2', status: 'active', created_at: now, updated_at: now },
    { id: 2, asset_id: 3, user_id: 4, allocated_by: 1, allocation_date: '2024-02-01', return_date: null, location: 'Office - Floor 3', status: 'active', created_at: now, updated_at: now },
  ];
  await qi.bulkInsert('asset_allocations', allocations);
  console.log('Allocations seeded.');

  // 7. Asset History
  const history = [
    { asset_id: 1, event_type: 'created', description: 'Asset created', performed_by: 1, created_at: '2023-06-15' },
    { asset_id: 1, event_type: 'allocated', description: 'Allocated to Priya Sharma', performed_by: 1, created_at: '2023-07-01' },
    { asset_id: 3, event_type: 'created', description: 'Asset created', performed_by: 1, created_at: '2024-01-20' },
    { asset_id: 3, event_type: 'allocated', description: 'Allocated to Amit Patel', performed_by: 1, created_at: '2024-02-01' },
  ];
  await qi.bulkInsert('asset_history', history);
  console.log('Asset history seeded.');

  // 8. Service Partners
  const partners = [
    { id: 1, name: 'TechServ Solutions', contact_person: 'Ramesh', email: 'ramesh@techserv.com', phone: '9876543210', service_type: 'Hardware Repair', user_id: 6, status: 'active', created_at: now, updated_at: now },
  ];
  await qi.bulkInsert('service_partners', partners);
  console.log('Service partners seeded.');

  // 9. Service Engineers
  const engineers = [
    { id: 1, name: 'Suresh Kumar', email: 'suresh@techserv.com', phone: '9876543211', specialization: 'Laptop Repair', partner_id: 1, user_id: 7, status: 'active', created_at: now, updated_at: now },
  ];
  await qi.bulkInsert('service_engineers', engineers);
  console.log('Service engineers seeded.');

  // 10. Catalog Items
  const catalogItems = [
    { id: 1, name: 'Dell Latitude 5550', description: 'Business laptop - i7, 16GB, 512GB SSD', category_id: 1, image_url: null, created_at: now, updated_at: now },
    { id: 2, name: 'HP Monitor 24"', description: '24 inch IPS display, Full HD', category_id: 4, image_url: null, created_at: now, updated_at: now },
    { id: 3, name: 'Logitech Keyboard & Mouse', description: 'Wireless combo set', category_id: 6, image_url: null, created_at: now, updated_at: now },
  ];
  await qi.bulkInsert('catalog', catalogItems);

  const inventoryItems = [
    { catalog_id: 1, available: 5, allocated: 2, reserved: 1, scrap: 0, created_at: now, updated_at: now },
    { catalog_id: 2, available: 10, allocated: 3, reserved: 0, scrap: 1, created_at: now, updated_at: now },
    { catalog_id: 3, available: 0, allocated: 8, reserved: 0, scrap: 2, created_at: now, updated_at: now },
  ];
  await qi.bulkInsert('inventory', inventoryItems);
  console.log('Catalog and inventory seeded.');

  console.log('\nSeed completed successfully!');
  console.log('\nDemo Accounts:');
  console.log('  Admin:    admin / admin123');
  console.log('  Manager:  manager1 / password123');
  console.log('  Employee: employee1 / password123');
  console.log('  CIO:      cio / password123');
  console.log('  Partner:  partner1 / password123');
  console.log('  Engineer: engineer1 / password123');
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Seed failed:', err.message);
    process.exit(1);
  });
