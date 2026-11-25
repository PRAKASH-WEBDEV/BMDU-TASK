const mongoose = require('mongoose');
const Employee = require('../models/Employee');
const { validateEmployee } = require('../validators/employeeValidator');
const { ApiError } = require('../middleware/errorHandler');

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function assertValidId(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) throw new ApiError(400, 'Invalid employee id');
}

// GET /api/employees?search=&status=&department=
async function getEmployees(req, res) {
  const { search, status, department } = req.query;
  const filter = {};

  if (status && status !== 'All') {
    if (!Employee.STATUSES.includes(status)) throw new ApiError(400, 'Status filter must be Active or Inactive');
    filter.status = status;
  }
  if (department && department !== 'All') filter.department = department;
  if (search && search.trim()) {
    const re = new RegExp(escapeRegex(search.trim()), 'i');
    filter.$or = [{ name: re }, { email: re }, { phone: re }, { department: re }, { designation: re }];
  }

  const employees = await Employee.find(filter).sort({ createdAt: -1 });
  const [total, active] = await Promise.all([
    Employee.countDocuments(),
    Employee.countDocuments({ status: 'Active' }),
  ]);

  res.json({
    success: true,
    count: employees.length,
    stats: { total, active, inactive: total - active },
    data: employees,
  });
}

// GET /api/employees/:id
async function getEmployee(req, res) {
  assertValidId(req.params.id);
  const employee = await Employee.findById(req.params.id);
  if (!employee) throw new ApiError(404, 'Employee not found');
  res.json({ success: true, data: employee });
}

// POST /api/employees
async function createEmployee(req, res) {
  const { errors, data } = validateEmployee(req.body);
  if (Object.keys(errors).length) throw new ApiError(400, 'Validation failed', errors);

  const employee = await Employee.create(data);
  res.status(201).json({ success: true, message: 'Employee created', data: employee });
}

// PUT /api/employees/:id
async function updateEmployee(req, res) {
  assertValidId(req.params.id);
  const { errors, data } = validateEmployee(req.body, true);
  if (Object.keys(errors).length) throw new ApiError(400, 'Validation failed', errors);
  if (!Object.keys(data).length) throw new ApiError(400, 'No valid fields provided to update');

  const employee = await Employee.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true });
  if (!employee) throw new ApiError(404, 'Employee not found');
  res.json({ success: true, message: 'Employee updated', data: employee });
}

// DELETE /api/employees/:id
async function deleteEmployee(req, res) {
  assertValidId(req.params.id);
  const employee = await Employee.findByIdAndDelete(req.params.id);
  if (!employee) throw new ApiError(404, 'Employee not found');
  res.json({ success: true, message: 'Employee deleted', data: { _id: employee._id } });
}

module.exports = { getEmployees, getEmployee, createEmployee, updateEmployee, deleteEmployee };
