/* Simple end-to-end CRUD check against a running API.
 * Usage: API_URL=http://localhost:5000/api npm run test:api
 */
const BASE = process.env.API_URL || 'http://localhost:5000/api';
let failures = 0;

async function call(method, path, body) {
  const res = await fetch(BASE + path, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  return { status: res.status, body: await res.json() };
}

function check(label, cond, extra) {
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${label}`);
  if (!cond) {
    failures++;
    if (extra) console.log('      ', JSON.stringify(extra));
  }
}

(async () => {
  const email = `smoke.${Date.now()}@example.com`;
  const valid = { name: 'Smoke Test', email, phone: '+91 90000 00000', department: 'QA', designation: 'Tester', joiningDate: '2024-01-01', status: 'Active' };

  let r = await call('GET', '/health');
  check('health check', r.status === 200 && r.body.db === 'connected', r.body);

  r = await call('POST', '/employees', valid);
  check('create employee -> 201', r.status === 201 && r.body.data?._id, r.body);
  const id = r.body.data?._id;

  r = await call('POST', '/employees', valid);
  check('duplicate email -> 409', r.status === 409, r.body);

  r = await call('POST', '/employees', { name: 'X', email: 'bad', phone: 'abc', status: 'Maybe' });
  check('invalid payload -> 400 with field errors', r.status === 400 && r.body.errors?.email && r.body.errors?.department && r.body.errors?.status, r.body);

  r = await call('GET', '/employees');
  check('get all employees', r.status === 200 && r.body.data.some((e) => e._id === id), r.body.count);

  r = await call('GET', `/employees?search=smoke&status=Active`);
  check('search + status filter', r.status === 200 && r.body.data.length >= 1 && r.body.data.every((e) => e.status === 'Active'));

  r = await call('GET', `/employees?status=Inactive`);
  check('status filter excludes new active employee', r.status === 200 && !r.body.data.some((e) => e._id === id));

  r = await call('PUT', `/employees/${id}`, { status: 'Inactive', designation: 'Lead Tester' });
  check('update employee', r.status === 200 && r.body.data.status === 'Inactive' && r.body.data.designation === 'Lead Tester', r.body);

  r = await call('PUT', `/employees/${id}`, { email: 'nope' });
  check('update with invalid email -> 400', r.status === 400, r.body);

  r = await call('GET', '/employees/not-an-id');
  check('invalid id -> 400', r.status === 400, r.body);

  r = await call('DELETE', `/employees/${id}`);
  check('delete employee', r.status === 200, r.body);

  r = await call('GET', `/employees/${id}`);
  check('deleted employee -> 404', r.status === 404, r.body);

  r = await call('GET', '/unknown');
  check('unknown route -> 404', r.status === 404, r.body);

  console.log(failures ? `\n${failures} check(s) failed` : '\nAll checks passed');
  process.exit(failures ? 1 : 0);
})().catch((e) => {
  console.error('Smoke test crashed:', e.message);
  process.exit(1);
});
