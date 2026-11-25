export const DEPARTMENTS = ['Engineering', 'Human Resources', 'Sales', 'Marketing', 'Finance', 'Design', 'Operations', 'Support'];

export const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

export const toInputDate = (d) => (d ? new Date(d).toISOString().slice(0, 10) : '');

export const initials = (name = '') =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+?[0-9\s-]{7,15}$/;

/** Client-side validation mirroring the API rules, for instant feedback. */
export function validate(form) {
  const e = {};
  if (!form.name.trim()) e.name = 'Employee name is required';
  else if (form.name.trim().length < 2) e.name = 'Name must be at least 2 characters';
  if (!form.email.trim()) e.email = 'Email is required';
  else if (!EMAIL_RE.test(form.email.trim())) e.email = 'Email is invalid';
  if (!form.phone.trim()) e.phone = 'Phone number is required';
  else if (!PHONE_RE.test(form.phone.trim())) e.phone = 'Use 7-15 digits (+, spaces, dashes allowed)';
  if (!form.department.trim()) e.department = 'Department is required';
  if (!form.designation.trim()) e.designation = 'Designation is required';
  if (!form.joiningDate) e.joiningDate = 'Joining date is required';
  return e;
}
