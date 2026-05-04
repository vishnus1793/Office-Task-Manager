const { Op } = require('sequelize');
const { Project, ProjectMember, User, Task } = require('../models');

const createProject = async (req, res, next) => {
  try {
    const { name, description, color } = req.body;

    const project = await Project.create({
      name,
      description,
      color: color || '#6366f1',
      createdBy: req.user.id,
    });

    // Creator is automatically an admin member
    await ProjectMember.create({
      userId: req.user.id,
      projectId: project.id,
      role: 'admin',
    });

    const full = await Project.findByPk(project.id, {
      include: [
        { model: User, as: 'creator', attributes: ['id', 'name', 'email', 'avatar'] },
        {
          model: ProjectMember,
          as: 'projectMembers',
          include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email', 'avatar'] }],
        },
      ],
    });

    res.status(201).json({ message: 'Project created.', project: full });
  } catch (err) {
    next(err);
  }
};

const getProjects = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const offset = (page - 1) * limit;

    const memberProjects = await ProjectMember.findAll({
      where: { userId: req.user.id },
      attributes: ['projectId'],
    });
    const projectIds = memberProjects.map((m) => m.projectId);

    const where = { id: { [Op.in]: projectIds } };
    if (search) {
      where.name = { [Op.iLike]: `%${search}%` };
    }

    const { count, rows } = await Project.findAndCountAll({
      where,
      include: [
        { model: User, as: 'creator', attributes: ['id', 'name', 'email', 'avatar'] },
        {
          model: ProjectMember,
          as: 'projectMembers',
          include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email', 'avatar'] }],
        },
        { model: Task, as: 'tasks', attributes: ['id', 'status'] },
      ],
      limit: parseInt(limit),
      offset,
      order: [['createdAt', 'DESC']],
      distinct: true,
    });

    res.json({
      projects: rows,
      pagination: { total: count, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(count / limit) },
    });
  } catch (err) {
    next(err);
  }
};

const getProject = async (req, res, next) => {
  try {
    const membership = await ProjectMember.findOne({
      where: { userId: req.user.id, projectId: req.params.id },
    });
    if (!membership) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    const project = await Project.findByPk(req.params.id, {
      include: [
        { model: User, as: 'creator', attributes: ['id', 'name', 'email', 'avatar'] },
        {
          model: ProjectMember,
          as: 'projectMembers',
          include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email', 'avatar'] }],
        },
        {
          model: Task,
          as: 'tasks',
          include: [{ model: User, as: 'assignee', attributes: ['id', 'name', 'email', 'avatar'] }],
        },
      ],
    });

    if (!project) return res.status(404).json({ message: 'Project not found.' });
    res.json({ project, userRole: membership.role });
  } catch (err) {
    next(err);
  }
};

const addMember = async (req, res, next) => {
  try {
    const { email, role = 'member' } = req.body;
    const projectId = req.params.id;

    // Only project admins can add members
    const requesterMembership = await ProjectMember.findOne({
      where: { userId: req.user.id, projectId },
    });
    if (!requesterMembership || requesterMembership.role !== 'admin') {
      return res.status(403).json({ message: 'Only project admins can add members.' });
    }

    const userToAdd = await User.findOne({ where: { email } });
    if (!userToAdd) {
      return res.status(404).json({ message: 'User with that email not found.' });
    }

    const existing = await ProjectMember.findOne({
      where: { userId: userToAdd.id, projectId },
    });
    if (existing) {
      return res.status(409).json({ message: 'User is already a member.' });
    }

    const member = await ProjectMember.create({
      userId: userToAdd.id,
      projectId,
      role,
    });

    res.status(201).json({
      message: 'Member added.',
      member: { ...member.toJSON(), user: userToAdd.toSafeJSON() },
    });
  } catch (err) {
    next(err);
  }
};

const removeMember = async (req, res, next) => {
  try {
    const { projectId, userId } = req.params;

    const requesterMembership = await ProjectMember.findOne({
      where: { userId: req.user.id, projectId },
    });
    if (!requesterMembership || requesterMembership.role !== 'admin') {
      return res.status(403).json({ message: 'Only project admins can remove members.' });
    }

    if (userId === req.user.id) {
      return res.status(400).json({ message: 'You cannot remove yourself.' });
    }

    await ProjectMember.destroy({ where: { userId, projectId } });
    res.json({ message: 'Member removed.' });
  } catch (err) {
    next(err);
  }
};

const deleteProject = async (req, res, next) => {
  try {
    const membership = await ProjectMember.findOne({
      where: { userId: req.user.id, projectId: req.params.id },
    });
    if (!membership || membership.role !== 'admin') {
      return res.status(403).json({ message: 'Only project admins can delete projects.' });
    }

    await Project.destroy({ where: { id: req.params.id } });
    res.json({ message: 'Project deleted.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { createProject, getProjects, getProject, addMember, removeMember, deleteProject };
