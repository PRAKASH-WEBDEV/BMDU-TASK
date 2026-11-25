const express = require('express');
const c = require('../controllers/employeeController');

// Wrap async handlers so rejected promises reach the error middleware.
const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

const router = express.Router();

router.route('/').get(wrap(c.getEmployees)).post(wrap(c.createEmployee));
router.route('/:id').get(wrap(c.getEmployee)).put(wrap(c.updateEmployee)).delete(wrap(c.deleteEmployee));

module.exports = router;
