
require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// DATABASE CONNECTION 
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

pool.on('connect', () => console.log('Connected to Neon Postgres'));
pool.on('error', (err) => console.error('DB Error:', err));

//  JWT & LOGGING
const JWT_SECRET = process.env.JWT_SECRET || 'hrms-super-secret-2025';

const logAction = async (userId, orgId, action, meta = {}) => {
  try {
    await pool.query(
      `INSERT INTO logs (user_id, organisation_id, action, meta, timestamp)
       VALUES ($1, $2, $3, $4, NOW())`,
      [userId, orgId, action, JSON.stringify(meta)]
    );
  } catch (err) {
    console.error('Log failed:', err);
  }
};

//  AUTH MIDDLEWARE 
const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};



// 1. Register Organisation 
app.post('/api/auth/register', async (req, res) => {
  const { orgName, adminName, email, password } = req.body;
  if (!orgName || !adminName || !email || !password) {
    return res.status(400).json({ error: 'All fields required' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const orgRes = await client.query(
      `INSERT INTO organisations (name) VALUES ($1) RETURNING id`, [orgName]
    );
    const orgId = orgRes.rows[0].id;

    const hash = await bcrypt.hash(password, 12);
    await client.query(
      `INSERT INTO users (organisation_id, name, email, password_hash)
       VALUES ($1, $2, $3, $4)`,
      [orgId, adminName, email, hash]
    );

    const userRes = await client.query(`SELECT id FROM users WHERE email = $1`, [email]);
    const userId = userRes.rows[0].id;

    const token = jwt.sign({ userId, orgId }, JWT_SECRET, { expiresIn: '8h' });

    await logAction(userId, orgId, 'org_created', { orgName, adminName });
    await client.query('COMMIT');

    res.json({ token, message: 'Organisation created successfully' });
  } catch (err) {
    await client.query('ROLLBACK');
    if (err.code === '23505') {
      res.status(400).json({ error: 'Email already exists' });
    } else {
      res.status(500).json({ error: 'Server error', details: err.message });
    }
  } finally {
    client.release();
  }
});

// 2. Login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email & password required' });

  try {
    const { rows } = await pool.query(
      `SELECT id, password_hash, organisation_id FROM users WHERE email = $1`, [email]
    );

    if (rows.length === 0 || !await bcrypt.compare(password, rows[0].password_hash)) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const { id, organisation_id } = rows[0];
    const token = jwt.sign({ userId: id, orgId: organisation_id }, JWT_SECRET, { expiresIn: '8h' });

    await logAction(id, organisation_id, 'login');
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// 3. Get Employees + Teams
app.get('/api/employees', authMiddleware, async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT e.id, e.first_name, e.last_name, e.email, e.phone,
             COALESCE(array_agg(t.name) FILTER (WHERE t.name IS NOT NULL), '{}') as teams
      FROM employees e
      LEFT JOIN employee_teams et ON e.id = et.employee_id
      LEFT JOIN teams t ON et.team_id = t.id
      WHERE e.organisation_id = $1
      GROUP BY e.id
    `, [req.user.orgId]);

    res.json(rows.map(r => ({ ...r, teams: r.teams || [] })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Create Employee
app.post('/api/employees', authMiddleware, async (req, res) => {
  const { first_name, last_name, email, phone } = req.body;
  if (!first_name || !last_name) return res.status(400).json({ error: 'Name required' });

  try {
    const { rows } = await pool.query(
      `INSERT INTO employees (organisation_id, first_name, last_name, email, phone)
       VALUES ($1, $2, $3, $4, $5) RETURNING id, first_name, last_name, email, phone`,
      [req.user.orgId, first_name, last_name, email || null, phone || null]
    );

    await logAction(req.user.userId, req.user.orgId, 'employee_created', { employeeId: rows[0].id });
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Get Teams + Member Count
app.get('/api/teams', authMiddleware, async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT t.id, t.name, t.description,
             COUNT(et.employee_id) as member_count
      FROM teams t
      LEFT JOIN employee_teams et ON t.id = et.team_id
      WHERE t.organisation_id = $1
      GROUP BY t.id
    `, [req.user.orgId]);

    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Create Team
app.post('/api/teams', authMiddleware, async (req, res) => {
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ error: 'Team name required' });

  try {
    const { rows } = await pool.query(
      `INSERT INTO teams (organisation_id, name, description)
       VALUES ($1, $2, $3) RETURNING id, name, description`,
      [req.user.orgId, name, description || null]
    );

    await logAction(req.user.userId, req.user.orgId, 'team_created', { teamId: rows[0].id });
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 7. Assign Employee to Team
app.post('/api/teams/:teamId/assign', authMiddleware, async (req, res) => {
  const { employeeId } = req.body;
  if (!employeeId) return res.status(400).json({ error: 'employeeId required' });

  try {
    await pool.query(
      `INSERT INTO employee_teams (employee_id, team_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [employeeId, req.params.teamId]
    );

    await logAction(req.user.userId, req.user.orgId, 'assigned_to_team', { employeeId, teamId: req.params.teamId });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// 13. Update Team
app.put('/api/teams/:id', authMiddleware, async (req, res) => {
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ error: 'Team name required' });

  try {
    const { rows } = await pool.query(`
      UPDATE teams 
      SET name = $1, description = $2
      WHERE id = $3 AND organisation_id = $4
      RETURNING id, name, description
    `, [name, description || null, req.params.id, req.user.orgId]);

    if (rows.length === 0) return res.status(404).json({ error: 'Team not found' });

    await logAction(req.user.userId, req.user.orgId, 'team_updated', { teamId: rows[0].id });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// 10. Get Single Employee
app.get('/api/employees/:id', authMiddleware, async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT e.id, e.first_name, e.last_name, e.email, e.phone,
             COALESCE(array_agg(t.name) FILTER (WHERE t.name IS NOT NULL), '{}') as teams
      FROM employees e
      LEFT JOIN employee_teams et ON e.id = et.employee_id
      LEFT JOIN teams t ON et.team_id = t.id
      WHERE e.id = $1 AND e.organisation_id = $2
      GROUP BY e.id
    `, [req.params.id, req.user.orgId]);

    if (rows.length === 0) return res.status(404).json({ error: 'Employee not found' });

    res.json({
      ...rows[0],
      teams: rows[0].teams || []
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 11. Update Employee
app.put('/api/employees/:id', authMiddleware, async (req, res) => {
  const { first_name, last_name, email, phone } = req.body;
  if (!first_name || !last_name) return res.status(400).json({ error: 'Name required' });

  try {
    const { rows } = await pool.query(`
      UPDATE employees 
      SET first_name = $1, last_name = $2, email = $3, phone = $4
      WHERE id = $5 AND organisation_id = $6
      RETURNING id, first_name, last_name, email, phone
    `, [first_name, last_name, email || null, phone || null, req.params.id, req.user.orgId]);

    if (rows.length === 0) return res.status(404).json({ error: 'Employee not found' });

    await logAction(req.user.userId, req.user.orgId, 'employee_updated', { employeeId: rows[0].id });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 12. Delete Employee
app.delete('/api/employees/:id', authMiddleware, async (req, res) => {
  try {
    const { rowCount } = await pool.query(
      `DELETE FROM employees WHERE id = $1 AND organisation_id = $2`,
      [req.params.id, req.user.orgId]
    );

    if (rowCount === 0) return res.status(404).json({ error: 'Employee not found' });

    await logAction(req.user.userId, req.user.orgId, 'employee_deleted', { employeeId: req.params.id });
    res.json({ success: true, message: 'Employee deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// 14. Delete Team
app.delete('/api/teams/:id', authMiddleware, async (req, res) => {
  try {
    const { rowCount } = await pool.query(
      `DELETE FROM teams WHERE id = $1 AND organisation_id = $2`,
      [req.params.id, req.user.orgId]
    );

    if (rowCount === 0) return res.status(404).json({ error: 'Team not found' });

    await logAction(req.user.userId, req.user.orgId, 'team_deleted', { teamId: req.params.id });
    res.json({ success: true, message: 'Team deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// 8. Remove from Team
app.delete('/api/teams/:teamId/unassign', authMiddleware, async (req, res) => {
  const { employeeId } = req.body;
  if (!employeeId) return res.status(400).json({ error: 'employeeId required' });

  try {
    await pool.query(
      `DELETE FROM employee_teams WHERE employee_id = $1 AND team_id = $2`,
      [employeeId, req.params.teamId]
    );

    await logAction(req.user.userId, req.user.orgId, 'removed_from_team', { employeeId, teamId: req.params.teamId });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 9. Logs
app.get('/api/logs', authMiddleware, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM logs WHERE organisation_id = $1 ORDER BY timestamp DESC LIMIT 50`,
      [req.user.orgId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`HRMS Backend Running on http://localhost:${PORT}`);
  console.log(`Neon Postgres Connected`);
  console.log(`Register: POST /api/auth/register`);
  console.log(`Login: POST /api/auth/login`);
});