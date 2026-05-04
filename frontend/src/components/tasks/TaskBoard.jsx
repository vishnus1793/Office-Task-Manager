import { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { Avatar, EmptyState, ConfirmDialog } from '../ui';
import { formatDate, statusConfig, priorityConfig, isOverdue } from '../../utils';
import EditTaskModal from './EditTaskModal';

const COLUMNS = [
  { key: 'todo', label: 'To Do' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'done', label: 'Done' },
];

const TaskCard = ({ task, isAdmin, onEdit, onDelete }) => {
  const sc = statusConfig[task.status];
  const pc = priorityConfig[task.priority];
  const over = isOverdue(task.dueDate, task.status);

  return (
    <div className="bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl p-3.5 shadow-sm hover:shadow-md transition-all duration-200 group">
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="text-sm font-medium text-surface-900 dark:text-white leading-snug flex-1">{task.title}</p>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          {isAdmin && (
            <button onClick={() => onEdit(task)} className="p-1 rounded-md text-surface-400 hover:text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          )}
          {isAdmin && (
            <button onClick={() => onDelete(task)} className="p-1 rounded-md text-surface-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {task.description && (
        <p className="text-xs text-surface-400 mb-3 line-clamp-2">{task.description}</p>
      )}

      <div className="flex items-center gap-1.5 flex-wrap mb-3">
        <span className={`badge text-xs ${pc.color}`}>{pc.label}</span>
        {over && <span className="badge bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 text-xs">Overdue</span>}
      </div>

      <div className="flex items-center justify-between mt-2">
        {task.dueDate ? (
          <span className={`text-xs ${over ? 'text-red-500' : 'text-surface-400'}`}>📅 {formatDate(task.dueDate)}</span>
        ) : <span />}
        {task.assignee ? (
          <div className="flex items-center gap-1.5">
            <Avatar user={task.assignee} size="sm" />
          </div>
        ) : (
          <span className="text-xs text-surface-300 dark:text-surface-600">Unassigned</span>
        )}
      </div>
    </div>
  );
};

const Column = ({ column, tasks, isAdmin, onEdit, onDelete }) => {
  const sc = statusConfig[column.key];
  return (
    <div className="flex-1 min-w-[280px] max-w-sm">
      <div className="flex items-center gap-2.5 mb-4">
        <span className={`w-2.5 h-2.5 rounded-full ${sc.dot}`} />
        <h3 className="font-display font-bold text-sm text-surface-700 dark:text-surface-300 uppercase tracking-wider">{column.label}</h3>
        <span className="ml-auto bg-surface-100 dark:bg-surface-700 text-surface-500 dark:text-surface-400 text-xs font-semibold px-2 py-0.5 rounded-full">
          {tasks.length}
        </span>
      </div>
      <div className="space-y-3">
        {tasks.length === 0 ? (
          <div className="border-2 border-dashed border-surface-200 dark:border-surface-700 rounded-xl p-6 text-center text-xs text-surface-400">
            No tasks here
          </div>
        ) : (
          tasks.map((task) => (
            <TaskCard key={task.id} task={task} isAdmin={isAdmin} onEdit={onEdit} onDelete={onDelete} />
          ))
        )}
      </div>
    </div>
  );
};

const TaskBoard = ({ tasks, projectId, isAdmin, members, onUpdate }) => {
  const [editTask, setEditTask] = useState(null);
  const [deleteTask, setDeleteTask] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/tasks/${deleteTask.id}`);
      toast.success('Task deleted');
      setDeleteTask(null);
      onUpdate();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete task');
    } finally {
      setDeleting(false);
    }
  };

  if (tasks.length === 0) {
    return (
      <EmptyState icon="📝" title="No tasks yet" description="Create your first task to start tracking work." />
    );
  }

  const grouped = COLUMNS.reduce((acc, col) => {
    acc[col.key] = tasks.filter((t) => t.status === col.key);
    return acc;
  }, {});

  return (
    <div>
      <div className="flex gap-5 overflow-x-auto pb-4">
        {COLUMNS.map((col) => (
          <Column key={col.key} column={col} tasks={grouped[col.key]}
            isAdmin={isAdmin} onEdit={setEditTask} onDelete={setDeleteTask} />
        ))}
      </div>

      {editTask && (
        <EditTaskModal open={!!editTask} task={editTask} onClose={() => setEditTask(null)}
          members={members} isAdmin={isAdmin} onUpdated={() => { setEditTask(null); onUpdate(); }} />
      )}
      <ConfirmDialog open={!!deleteTask} onClose={() => setDeleteTask(null)} onConfirm={handleDelete}
        loading={deleting} title="Delete Task"
        message={`Delete "${deleteTask?.title}"? This cannot be undone.`} />
    </div>
  );
};

export default TaskBoard;
