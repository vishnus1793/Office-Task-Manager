const express = require('express');
const router = express.Router();
const {
  createProject,
  getProjects,
  getProject,
  addMember,
  removeMember,
  deleteProject,
} = require('../controllers/projectController');
const { verifyToken } = require('../middleware/auth');
const { projectRules, validate } = require('../validators');

router.use(verifyToken);

router.get('/', getProjects);
router.post('/', projectRules, validate, createProject);
router.get('/:id', getProject);
router.delete('/:id', deleteProject);
router.post('/:id/members', addMember);
router.delete('/:projectId/members/:userId', removeMember);

module.exports = router;
