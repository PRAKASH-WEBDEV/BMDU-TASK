const { STATUSES } = require('../models/Employee');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+?[0-9\s-]{7,15}$/;
const FIELDS = ['name', 'email', 'phone', 'department', 'designation', 'joiningDate', 'status'];

/**
 * Validates an employee payload.
 * @param {object} body request body
 * @param {boolean} partial true for updates (only provided fields are checked)
 * @returns {{ errors: object, data: object }}
 */
function validateEmployee(body = {}, partial = false) {
  const errors = {};
  const data = {};

  for (const key of FIELDS) {
    if (body[key] !== undefined) {
      data[key] = typeof body[key] === 'string' ? body[key].trim() : body[key];
    }
  }

  const required = (key, label) => {
    if (!partial && (data[key] === undefined || data[key] === '')) {
      errors[key] = `${label} is required`;
      return false;
    }
    if (partial && data[key] === '') {
      errors[key] = `${label} cannot be empty`;
      return false;
    }
    return data[key] !== undefined;
  };

  if (required('name', 'Employee name')) {
    if (typeof data.name !== 'string' || data.name.length < 2) errors.name = 'Name must be at least 2 characters';
    else if (data.name.length > 100) errors.name = 'Name must be at most 100 characters';
  }
  if (required('email', 'Email')) {
    if (typeof data.email !== 'string' || !EMAIL_RE.test(data.email)) errors.email = 'Email is invalid';
    else data.email = data.email.toLowerCase();
  }
  if (required('phone', 'Phone number')) {
    if (typeof data.phone !== 'string' || !PHONE_RE.test(data.phone)) {
      errors.phone = 'Phone number must be 7-15 digits (may include +, spaces, dashes)';
    }
  }
  required('department', 'Department');
  required('designation', 'Designation');
  if (required('joiningDate', 'Joining date')) {
    const d = new Date(data.joiningDate);
    if (Number.isNaN(d.getTime())) errors.joiningDate = 'Joining date is invalid';
    else if (d > new Date(Date.now() + 365 * 24 * 3600 * 1000)) errors.joiningDate = 'Joining date is too far in the future';
    else data.joiningDate = d;
  }
  if (data.status !== undefined && !STATUSES.includes(data.status)) {
    errors.status = 'Status must be Active or Inactive';
  }

  return { errors, data };
}

module.exports = { validateEmployee };
