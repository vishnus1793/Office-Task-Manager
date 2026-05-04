const sequelize = require('../config/database');
const User = require('./User');
const Project = require('./Project');
const ProjectMember = require('./ProjectMember');
const Task = require('./Task');

// User <-> Project (creator)
User.hasMany(Project, { foreignKey: 'createdBy', as: 'createdProjects' });
Project.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });

// User <-> Project (membership)
User.belongsToMany(Project, {
  through: ProjectMember,
  foreignKey: 'userId',
  as: 'memberProjects',
});
Project.belongsToMany(User, {
  through: ProjectMember,
  foreignKey: 'projectId',
  as: 'members',
});

// Direct associations for ProjectMember
ProjectMember.belongsTo(User, { foreignKey: 'userId', as: 'user' });
ProjectMember.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });
User.hasMany(ProjectMember, { foreignKey: 'userId' });
Project.hasMany(ProjectMember, { foreignKey: 'projectId', as: 'projectMembers', onDelete: 'CASCADE' });

// Task associations
Task.belongsTo(User, { foreignKey: 'assignedTo', as: 'assignee' });
Task.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
Task.belongsTo(Project, { foreignKey: 'projectId', as: 'project', onDelete: 'CASCADE' });
Project.hasMany(Task, { foreignKey: 'projectId', as: 'tasks', onDelete: 'CASCADE' });
User.hasMany(Task, { foreignKey: 'assignedTo', as: 'assignedTasks' });

module.exports = { sequelize, User, Project, ProjectMember, Task };
