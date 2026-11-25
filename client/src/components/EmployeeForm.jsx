import { useState } from 'react';
import { DEPARTMENTS, toInputDate, validate } from '../utils';

const EMPTY = { name: '', email: '', phone: '', department: '', designation: '', joiningDate: '', status: 'Active' };

export default function EmployeeForm({ initial, onSubmit, onCancel }) {
  const [form, setForm] = useState(() =>
    initial ? { ...EMPTY, ...initial, joiningDate: toInputDate(initial.joiningDate) } : EMPTY
  );
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    if (errors[key]) setErrors((er) => ({ ...er, [key]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    const v = validate(form);
    setErrors(v);
    if (Object.keys(v).length) return;

    setSubmitting(true);
    try {
      const { name, email, phone, department, designation, joiningDate, status } = form;
      await onSubmit({ name, email, phone, department, designation, joiningDate, status });
    } catch (err) {
      setErrors(err.errors || {});
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const field = (key, label, input) => (
    <label className={`field ${errors[key] ? 'has-error' : ''}`}>
      <span>{label}</span>
      {input}
      {errors[key] && <small className="error-text">{errors[key]}</small>}
    </label>
  );

  return (
    <form onSubmit={handleSubmit} noValidate>
      {formError && <div className="alert alert-error">{formError}</div>}
      <div className="form-grid">
        {field('name', 'Employee Name *', <input value={form.name} onChange={set('name')} placeholder="e.g. Priya Nair" autoFocus />)}
        {field('email', 'Email *', <input type="email" value={form.email} onChange={set('email')} placeholder="name@company.com" />)}
        {field('phone', 'Phone Number *', <input type="tel" value={form.phone} onChange={set('phone')} placeholder="+91 98765 43210" />)}
        {field(
          'department',
          'Department *',
          <select value={form.department} onChange={set('department')}>
            <option value="">Select department</option>
            {[...new Set([...DEPARTMENTS, form.department].filter(Boolean))].map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
        )}
        {field('designation', 'Designation *', <input value={form.designation} onChange={set('designation')} placeholder="e.g. Software Engineer" />)}
        {field('joiningDate', 'Joining Date *', <input type="date" value={form.joiningDate} onChange={set('joiningDate')} />)}
        {field(
          'status',
          'Status',
          <select value={form.status} onChange={set('status')}>
            <option>Active</option>
            <option>Inactive</option>
          </select>
        )}
      </div>
      <div className="form-actions">
        <button type="button" className="btn btn-ghost" onClick={onCancel} disabled={submitting}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? <span className="spinner sm" /> : null}
          {submitting ? 'Saving…' : initial ? 'Save Changes' : 'Add Employee'}
        </button>
      </div>
    </form>
  );
}
