const { Op } = require('sequelize');
const { Task, User, Project, ProjectMember } = require('../models');

const createTask = async (req, res, next) => {
  try {
    const { title, description, status, priority, assignedTo, projectId, dueDate } = req.body;

    const membership = await ProjectMember.findOne({
      where: { userId: req.user.id, projectId },
    });
    if (!membership) {
      return res.status(403).json({ message: 'You are not a member of this project.' });
    }
    if (membership.role !== 'admin') {
      return res.status(403).json({ message: 'Only project admins can create tasks.' });
    }

    if (assignedTo) {
      const assigneeMembership = await ProjectMember.findOne({
        where: { userId: assignedTo, projectId },
      });
      if (!assigneeMembership) {
        return res.status(400).json({ message: 'Assigned user is not a project member.' });
      }
    }

    const task = await Task.create({
      title,
      description,
      status: status || 'todo',
      priority: priority || 'medium',
      assignedTo: assignedTo || null,
      projectId,
      createdBy: req.user.id,
      dueDate: dueDate || null,
    });

    const full = await Task.findByPk(task.id, {
      include: [
        { model: User, as: 'assignee', attributes: ['id', 'name', 'email', 'avatar'] },
        { model: User, as: 'creator', attributes: ['id', 'name', 'email', 'avatar'] },
        { model: Project, as: 'project', attributes: ['id', 'name', 'color'] },
      ],
    });

    res.status(201).json({ message: 'Task created.', task: full });
  } catch (err) {
    next(err);
  }
};

const getTasks = async (req, res, next) => {
  try {
    const { status, priority, projectId, assignedTo, search, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    // Get all projects user belongs to
    const memberships = await ProjectMember.findAll({
      where: { userId: req.user.id },
      attributes: ['projectId'],
    });
    const accessibleProjectIds = memberships.map((m) => m.projectId);

    const where = { projectId: { [Op.in]: accessibleProjectIds } };

    if (projectId) {
      if (!accessibleProjectIds.includes(projectId)) {
        return res.status(403).json({ message: 'Access denied.' });
      }
      where.projectId = projectId;
    }

    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (assignedTo) where.assignedTo = assignedTo === 'me' ? req.user.id : assignedTo;
    if (search) where.title = { [Op.iLike]: `%${search}%` };

    const { count, rows } = await Task.findAndCountAll({
      where,
      include: [
        { model: User, as: 'assignee', attributes: ['id', 'name', 'email', 'avatar'] },
        { model: User, as: 'creator', attributes: ['id', 'name', 'email', 'avatar'] },
        { model: Project, as: 'project', attributes: ['id', 'name', 'color'] },
      ],
      limit: parseInt(limit),
      offset,
      order: [['createdAt', 'DESC']],
      distinct: true,
    });

    res.json({
      tasks: rows,
      pagination: { total: count, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(count / limit) },
    });
  } catch (err) {
    next(err);
  }
};

const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findByPk(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found.' });

    const membership = await ProjectMember.findOne({
      where: { userId: req.user.id, projectId: task.projectId },
    });
    if (!membership) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    // Members can only update status of assigned tasks
    if (membership.role === 'member') {
      if (task.assignedTo !== req.user.id) {
        return res.status(403).json({ message: 'You can only update your own tasks.' });
      }
      const { status } = req.body;
      if (status) await task.update({ status });
      else return res.status(403).json({ message: 'Members can only update task status.' });
    } else {
      // Admin can update everything
      const { title, description, status, priority, assignedTo, dueDate } = req.body;
      await task.update({
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(status && { status }),
        ...(priority && { priority }),
        ...(assignedTo !== undefined && { assignedTo }),
        ...(dueDate !== undefined && { dueDate }),
      });
    }

    const updated = await Task.findByPk(task.id, {
      include: [
        { model: User, as: 'assignee', attributes: ['id', 'name', 'email', 'avatar'] },
        { model: User, as: 'creator', attributes: ['id', 'name', 'email', 'avatar'] },
        { model: Project, as: 'project', attributes: ['id', 'name', 'color'] },
      ],
    });

    res.json({ message: 'Task updated.', task: updated });
  } catch (err) {
    next(err);
  }
};

const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findByPk(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found.' });

    const membership = await ProjectMember.findOne({
      where: { userId: req.user.id, projectId: task.projectId },
    });
    if (!membership || membership.role !== 'admin') {
      return res.status(403).json({ message: 'Only project admins can delete tasks.' });
    }

    await task.destroy();
    res.json({ message: 'Task deleted.' });
  } catch (err) {
    next(err);
  }
};

const getDashboard = async (req, res, next) => {
  try {
    const memberships = await ProjectMember.findAll({
      where: { userId: req.user.id },
      attributes: ['projectId'],
    });
    const projectIds = memberships.map((m) => m.projectId);

    const today = new Date().toISOString().split('T')[0];

    const [total, done, inProgress, todo, overdue] = await Promise.all([
      Task.count({ where: { projectId: { [Op.in]: projectIds } } }),
      Task.count({ where: { projectId: { [Op.in]: projectIds }, status: 'done' } }),
      Task.count({ where: { projectId: { [Op.in]: projectIds }, status: 'in_progress' } }),
      Task.count({ where: { projectId: { [Op.in]: projectIds }, status: 'todo' } }),
      Task.count({
        where: {
          projectId: { [Op.in]: projectIds },
          status: { [Op.ne]: 'done' },
          dueDate: { [Op.lt]: today },
        },
      }),
    ]);

    const recentTasks = await Task.findAll({
      where: { projectId: { [Op.in]: projectIds } },
      include: [
        { model: User, as: 'assignee', attributes: ['id', 'name', 'avatar'] },
        { model: Project, as: 'project', attributes: ['id', 'name', 'color'] },
      ],
      limit: 5,
      order: [['updatedAt', 'DESC']],
    });

    res.json({
      stats: { total, done, inProgress, todo, overdue },
      recentTasks,
      projectCount: projectIds.length,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { createTask, getTasks, updateTask, deleteTask, getDashboard };
