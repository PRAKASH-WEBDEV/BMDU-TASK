import { formatDate, initials } from '../utils';

export default function EmployeeDetails({ employee, onEdit, onDelete }) {
  const rows = [
    ['Email', <a href={`mailto:${employee.email}`}>{employee.email}</a>],
    ['Phone', <a href={`tel:${employee.phone}`}>{employee.phone}</a>],
    ['Department', employee.department],
    ['Designation', employee.designation],
    ['Joining Date', formatDate(employee.joiningDate)],
    ['Status', <span className={`badge badge-${employee.status.toLowerCase()}`}>{employee.status}</span>],
    ['Added On', formatDate(employee.createdAt)],
    ['Last Updated', formatDate(employee.updatedAt)],
  ];

  return (
    <div className="details">
      <div className="details-head">
        <div className="avatar lg">{initials(employee.name)}</div>
        <div>
          <h3>{employee.name}</h3>
          <p className="muted">
            {employee.designation} · {employee.department}
          </p>
        </div>
      </div>
      <dl className="details-list">
        {rows.map(([k, v]) => (
          <div key={k}>
            <dt>{k}</dt>
            <dd>{v}</dd>
          </div>
        ))}
      </dl>
      <div className="form-actions">
        <button className="btn btn-danger-ghost" onClick={onDelete}>
          Delete
        </button>
        <button className="btn btn-primary" onClick={onEdit}>
          Edit Employee
        </button>
      </div>
    </div>
  );
}
