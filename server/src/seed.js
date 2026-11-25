const Employee = require('./models/Employee');

const SAMPLE = [
  { name: 'Aarav Sharma', email: 'aarav.sharma@example.com', phone: '+91 98765 43210', department: 'Engineering', designation: 'Senior Developer', joiningDate: '2021-04-12', status: 'Active' },
  { name: 'Priya Nair', email: 'priya.nair@example.com', phone: '+91 91234 56789', department: 'Human Resources', designation: 'HR Manager', joiningDate: '2020-01-06', status: 'Active' },
  { name: 'Rohan Mehta', email: 'rohan.mehta@example.com', phone: '+91 99887 76655', department: 'Sales', designation: 'Account Executive', joiningDate: '2022-08-22', status: 'Inactive' },
  { name: 'Sneha Iyer', email: 'sneha.iyer@example.com', phone: '+91 90000 11122', department: 'Design', designation: 'UI/UX Designer', joiningDate: '2023-02-15', status: 'Active' },
  { name: 'Karthik Reddy', email: 'karthik.reddy@example.com', phone: '+91 93456 78901', department: 'Finance', designation: 'Financial Analyst', joiningDate: '2019-11-03', status: 'Active' },
  { name: 'Meera Joshi', email: 'meera.joshi@example.com', phone: '+91 97654 32109', department: 'Engineering', designation: 'QA Engineer', joiningDate: '2024-06-10', status: 'Inactive' },
];

async function seedIfEmpty() {
  if ((await Employee.estimatedDocumentCount()) === 0) {
    await Employee.insertMany(SAMPLE);
    console.log(`Seeded ${SAMPLE.length} sample employees`);
  }
}

module.exports = { seedIfEmpty, SAMPLE };

// `npm run seed` -> seed the configured database
if (require.main === module) {
  require('dotenv').config();
  const { connectDB, disconnectDB } = require('./config/db');
  (async () => {
    await connectDB();
    await seedIfEmpty();
    await disconnectDB();
  })().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
