const BASE = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');

export class ApiError extends Error {
  constructor(message, status, errors) {
    super(message);
    this.status = status;
    this.errors = errors || {};
  }
}

async function request(path, options = {}) {
  let res;
  try {
    res = await fetch(`${BASE}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });
  } catch {
    throw new ApiError('Cannot reach the server. Is the API running?', 0);
  }

  let json = null;
  try {
    json = await res.json();
  } catch {
    /* non-JSON response */
  }

  if (!res.ok || json?.success === false) {
    throw new ApiError(json?.message || `Request failed (${res.status})`, res.status, json?.errors);
  }
  return json;
}

export const employeeApi = {
  list: ({ search = '', status = 'All', department = 'All' } = {}) => {
    const qs = new URLSearchParams();
    if (search.trim()) qs.set('search', search.trim());
    if (status !== 'All') qs.set('status', status);
    if (department !== 'All') qs.set('department', department);
    const q = qs.toString();
    return request(`/employees${q ? `?${q}` : ''}`);
  },
  get: (id) => request(`/employees/${id}`),
  create: (data) => request('/employees', { method: 'POST', body: data }),
  update: (id, data) => request(`/employees/${id}`, { method: 'PUT', body: data }),
  remove: (id) => request(`/employees/${id}`, { method: 'DELETE' }),
};
