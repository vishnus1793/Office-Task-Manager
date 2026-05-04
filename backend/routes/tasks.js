const express = require('express');
const router = express.Router();
const { createTask, getTasks, updateTask, deleteTask, getDashboard } = require('../controllers/taskController');
const { verifyToken } = require('../middleware/auth');
const { taskRules, taskUpdateRules, validate } = require('../validators');

router.use(verifyToken);

router.get('/dashboard', getDashboard);
router.get('/', getTasks);
router.post('/', taskRules, validate, createTask);
router.put('/:id', taskUpdateRules, validate, updateTask);
router.delete('/:id', deleteTask);

module.exports = router;
