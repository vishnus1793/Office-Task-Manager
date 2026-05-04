const { body, validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
  }
  next();
};

const signupRules = [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be 2–100 characters.'),
  body('email').isEmail().normalizeEmail().withMessage('Must be a valid email.'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters.')
    .matches(/\d/)
    .withMessage('Password must contain a number.'),
];

const loginRules = [
  body('email').isEmail().normalizeEmail().withMessage('Must be a valid email.'),
  body('password').notEmpty().withMessage('Password is required.'),
];

const projectRules = [
  body('name').trim().isLength({ min: 2, max: 150 }).withMessage('Project name must be 2–150 characters.'),
  body('description').optional().trim(),
  body('color').optional().matches(/^#[0-9A-Fa-f]{6}$/).withMessage('Color must be a valid hex color.'),
];

const taskRules = [
  body('title').trim().isLength({ min: 2, max: 200 }).withMessage('Task title must be 2–200 characters.'),
  body('description').optional().trim(),
  body('status').optional().isIn(['todo', 'in_progress', 'done']).withMessage('Invalid status.'),
  body('priority').optional().isIn(['low', 'medium', 'high']).withMessage('Invalid priority.'),
  body('projectId').isUUID().withMessage('Valid project ID required.'),
  body('dueDate').optional().isDate().withMessage('Invalid date format.'),
];

const taskUpdateRules = [
  body('title').optional().trim().isLength({ min: 2, max: 200 }),
  body('status').optional().isIn(['todo', 'in_progress', 'done']),
  body('priority').optional().isIn(['low', 'medium', 'high']),
  body('dueDate').optional().isDate(),
];

module.exports = { validate, signupRules, loginRules, projectRules, taskRules, taskUpdateRules };
