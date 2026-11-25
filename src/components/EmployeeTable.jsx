import { formatDate, initials } from '../utils';

export default function EmployeeTable({ employees, onView, onEdit, onDelete }) {
  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th>Employee</th>
            <th>Phone</th>
            <th>Department</th>
            <th>Designation</th>
            <th>Joining Date</th>
            <th>Status</th>
            <th className="right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((e) => (
            <tr key={e._id} onClick={() => onView(e)} className="clickable">
              <td data-label="Employee">
                <div className="emp-cell">
                  <div className="avatar">{initials(e.name)}</div>
                  <div>
                    <div className="emp-name">{e.name}</div>
                    <div className="muted small">{e.email}</div>
                  </div>
                </div>
              </td>
              <td data-label="Phone">{e.phone}</td>
              <td data-label="Department">{e.department}</td>
              <td data-label="Designation">{e.designation}</td>
              <td data-label="Joining Date">{formatDate(e.joiningDate)}</td>
              <td data-label="Status">
                <span className={`badge badge-${e.status.toLowerCase()}`}>{e.status}</span>
              </td>
              <td className="right actions" onClick={(ev) => ev.stopPropagation()}>
                <button className="btn btn-sm btn-ghost" onClick={() => onView(e)}>View</button>
                <button className="btn btn-sm btn-ghost" onClick={() => onEdit(e)}>Edit</button>
                <button className="btn btn-sm btn-danger-ghost" onClick={() => onDelete(e)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
