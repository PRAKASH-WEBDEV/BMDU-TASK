import { useCallback, useEffect, useState } from 'react';
import { employeeApi } from './api/employees';
import { DEPARTMENTS } from './utils';
import EmployeeTable from './components/EmployeeTable';
import EmployeeForm from './components/EmployeeForm';
import EmployeeDetails from './components/EmployeeDetails';
import Modal from './components/Modal';
import Toast from './components/Toast';

function useDebounced(value, delay = 300) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

export default function App() {
  const [employees, setEmployees] = useState([]);
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');
  const [department, setDepartment] = useState('All');
  const debouncedSearch = useDebounced(search);

  // modal: { type: 'create' | 'edit' | 'view' | 'delete', employee? }
  const [modal, setModal] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState(null);
  const closeModal = useCallback(() => setModal(null), []);
  const clearToast = useCallback(() => setToast(null), []);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await employeeApi.list({ search: debouncedSearch, status, department });
      setEmployees(res.data);
      setStats(res.stats);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, status, department]);

  useEffect(() => {
    load();
  }, [load]);

  const handleCreate = async (data) => {
    await employeeApi.create(data);
    setModal(null);
    setToast({ type: 'success', message: 'Employee added successfully' });
    load();
  };

  const handleUpdate = async (data) => {
    await employeeApi.update(modal.employee._id, data);
    setModal(null);
    setToast({ type: 'success', message: 'Employee updated successfully' });
    load();
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await employeeApi.remove(modal.employee._id);
      setModal(null);
      setToast({ type: 'success', message: 'Employee deleted' });
      load();
    } catch (err) {
      setToast({ type: 'error', message: err.message });
    } finally {
      setDeleting(false);
    }
  };

  const filtersActive = search || status !== 'All' || department !== 'All';
  const resetFilters = () => {
    setSearch('');
    setStatus('All');
    setDepartment('All');
  };

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <div className="logo">EMS</div>
          <div>
            <h1>Employee Management</h1>
            <p className="muted small">Admin dashboard</p>
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => setModal({ type: 'create' })}>
          + Add Employee
        </button>
      </header>

      <main className="container">
        <section className="stats">
          <div className="stat-card">
            <span className="muted small">Total Employees</span>
            <strong>{stats.total}</strong>
          </div>
          <div className="stat-card">
            <span className="muted small">Active</span>
            <strong className="text-success">{stats.active}</strong>
          </div>
          <div className="stat-card">
            <span className="muted small">Inactive</span>
            <strong className="text-muted">{stats.inactive}</strong>
          </div>
        </section>

        <section className="card">
          <div className="toolbar">
            <div className="search">
              <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                <path fill="currentColor" d="M10 2a8 8 0 0 1 6.32 12.9l5.39 5.4-1.41 1.4-5.4-5.39A8 8 0 1 1 10 2Zm0 2a6 6 0 1 0 0 12 6 6 0 0 0 0-12Z" />
              </svg>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, email, phone, department…"
                aria-label="Search employees"
              />
            </div>
            <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter by status">
              <option value="All">All statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
            <select value={department} onChange={(e) => setDepartment(e.target.value)} aria-label="Filter by department">
              <option value="All">All departments</option>
              {DEPARTMENTS.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
            {filtersActive && (
              <button className="btn btn-ghost" onClick={resetFilters}>
                Clear
              </button>
            )}
          </div>

          {error ? (
            <div className="state">
              <div className="alert alert-error">{error}</div>
              <button className="btn btn-ghost" onClick={load}>
                Retry
              </button>
            </div>
          ) : loading && employees.length === 0 ? (
            <div className="state">
              <span className="spinner" />
              <p className="muted">Loading employees…</p>
            </div>
          ) : employees.length === 0 ? (
            <div className="state">
              <p className="muted">{filtersActive ? 'No employees match your filters.' : 'No employees yet. Add your first one!'}</p>
            </div>
          ) : (
            <div className={loading ? 'is-refreshing' : ''}>
              <EmployeeTable
                employees={employees}
                onView={(e) => setModal({ type: 'view', employee: e })}
                onEdit={(e) => setModal({ type: 'edit', employee: e })}
                onDelete={(e) => setModal({ type: 'delete', employee: e })}
              />
              <p className="muted small footer-note">
                Showing {employees.length} of {stats.total} employees
              </p>
            </div>
          )}
        </section>
      </main>

      {modal?.type === 'create' && (
        <Modal title="Add Employee" onClose={closeModal}>
          <EmployeeForm onSubmit={handleCreate} onCancel={closeModal} />
        </Modal>
      )}
      {modal?.type === 'edit' && (
        <Modal title="Edit Employee" onClose={closeModal}>
          <EmployeeForm initial={modal.employee} onSubmit={handleUpdate} onCancel={closeModal} />
        </Modal>
      )}
      {modal?.type === 'view' && (
        <Modal title="Employee Details" onClose={closeModal}>
          <EmployeeDetails
            employee={modal.employee}
            onEdit={() => setModal({ type: 'edit', employee: modal.employee })}
            onDelete={() => setModal({ type: 'delete', employee: modal.employee })}
          />
        </Modal>
      )}
      {modal?.type === 'delete' && (
        <Modal title="Delete Employee" onClose={closeModal} width={420}>
          <p>
            Are you sure you want to delete <strong>{modal.employee.name}</strong>? This cannot be undone.
          </p>
          <div className="form-actions">
            <button className="btn btn-ghost" onClick={closeModal} disabled={deleting}>
              Cancel
            </button>
            <button className="btn btn-danger" onClick={handleDelete} disabled={deleting}>
              {deleting ? 'Deleting…' : 'Delete'}
            </button>
          </div>
        </Modal>
      )}

      <Toast toast={toast} onDone={clearToast} />
    </div>
  );
}
