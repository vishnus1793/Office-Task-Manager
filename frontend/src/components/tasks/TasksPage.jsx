import { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { useFetch, useDebounce } from '../../hooks';
import { Avatar, Spinner, EmptyState } from '../ui';
import { formatDate, statusConfig, priorityConfig, isOverdue } from '../../utils';
import EditTaskModal from './EditTaskModal';

const TaskRow = ({ task, onEdit }) => {
  const sc = statusConfig[task.status];
  const pc = priorityConfig[task.priority];
  const over = isOverdue(task.dueDate, task.status);

  return (
    <div
      onClick={() => onEdit(task)}
      className="flex items-center gap-4 px-4 py-3.5 hover:bg-surface-50 dark:hover:bg-surface-700/30 transition-colors cursor-pointer group"
    >
      <span className={`w-2 h-2 rounded-full ${sc.dot} shrink-0`} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-surface-900 dark:text-white truncate group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
          {task.title}
        </p>
        <p className="text-xs text-surface-400 mt-0.5">{task.project?.name}</p>
      </div>
      <span className={`badge text-xs hidden sm:inline-flex ${sc.color}`}>{sc.label}</span>
      <span className={`badge text-xs hidden md:inline-flex ${pc.color}`}>{pc.label}</span>
      {task.dueDate ? (
        <span className={`text-xs hidden lg:block ${over ? 'text-red-500 font-medium' : 'text-surface-400'}`}>
          {over ? '⚠ ' : ''}{formatDate(task.dueDate)}
        </span>
      ) : <span className="w-24 hidden lg:block" />}
      {task.assignee ? <Avatar user={task.assignee} size="sm" /> : <div className="w-7 h-7" />}
    </div>
  );
};

const TasksPage = () => {
  const [filters, setFilters] = useState({ status: '', priority: '', assignedTo: '' });
  const [search, setSearch] = useState('');
  const [editTask, setEditTask] = useState(null);
  const debouncedSearch = useDebounce(search);

  const params = new URLSearchParams();
  if (filters.status) params.set('status', filters.status);
  if (filters.priority) params.set('priority', filters.priority);
  if (filters.assignedTo) params.set('assignedTo', filters.assignedTo);
  if (debouncedSearch) params.set('search', debouncedSearch);

  const { data, loading, refetch } = useFetch(`/tasks?${params.toString()}`);
  const tasks = data?.tasks || [];

  const setFilter = (k, v) =>
    setFilters((f) => ({ ...f, [k]: f[k] === v ? '' : v }));

  // 🔥 UPDATED PROFESSIONAL BUTTON
  const FilterBtn = ({ label, field, value, active }) => (
    <button
      onClick={() => setFilter(field, value)}
      className={`
        px-4 py-2 rounded-xl text-sm font-semibold
        transition-all duration-200
        border flex items-center justify-center
        ${
          active
            ? 'text-white shadow-md scale-[1.02]'
            : 'text-surface-600 dark:text-surface-300 hover:scale-[1.02]'
        }
      `}
      style={{
        background: active
          ? 'var(--color-brand)'
          : 'var(--color-surface)',
        borderColor: active
          ? 'var(--color-brand)'
          : 'var(--color-border)'
      }}
    >
      {label}
    </button>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-surface-900 dark:text-white">
          My Tasks
        </h1>
        <p className="text-sm text-surface-500 dark:text-surface-400 mt-0.5">
          {data?.pagination?.total ?? 0} tasks across all projects
        </p>
      </div>

      {/* 🔥 FILTERS */}
      <div className="flex flex-wrap gap-4 items-center">

        {/* Search */}
        <div className="relative">
          <input
            className="input pl-10 w-56"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Status */}
        <div className="flex items-center gap-2 bg-surface-100 dark:bg-surface-800 p-2 rounded-xl">
          <span className="text-xs font-semibold text-surface-400 mr-1">
            Status:
          </span>
          <FilterBtn label="To Do" field="status" value="todo" active={filters.status === 'todo'} />
          <FilterBtn label="In Progress" field="status" value="in_progress" active={filters.status === 'in_progress'} />
          <FilterBtn label="Done" field="status" value="done" active={filters.status === 'done'} />
        </div>

        {/* Assigned */}
        <div className="flex items-center gap-2 bg-surface-100 dark:bg-surface-800 p-2 rounded-xl">
          <span className="text-xs font-semibold text-surface-400 mr-1">
            Mine:
          </span>
          <FilterBtn label="Assigned to me" field="assignedTo" value="me" active={filters.assignedTo === 'me'} />
        </div>

        {/* Clear */}
        {(filters.status || filters.assignedTo || filters.priority || search) && (
          <button
            onClick={() => {
              setFilters({ status: '', priority: '', assignedTo: '' });
              setSearch('');
            }}
            className="text-sm px-3 py-2 rounded-lg border transition-all hover:bg-surface-100 dark:hover:bg-surface-800"
            style={{
              borderColor: 'var(--color-border)',
              color: 'var(--color-muted)'
            }}
          >
            Clear filters
          </button>
        )}
      </div>

      {/* TASK LIST */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : tasks.length === 0 ? (
        <EmptyState
          icon="✅"
          title="No tasks found"
          description="No tasks match your current filters."
        />
      ) : (
        <div className="card divide-y divide-surface-100 dark:divide-surface-700">
          {/* Header */}
          <div className="flex items-center gap-4 px-4 py-2.5 bg-surface-50 dark:bg-surface-800/50 rounded-t-2xl">
            <div className="w-2" />
            <p className="flex-1 text-xs font-semibold text-surface-500 uppercase">Task</p>
            <p className="text-xs font-semibold text-surface-500 w-20 hidden sm:block">Status</p>
            <p className="text-xs font-semibold text-surface-500 w-20 hidden md:block">Priority</p>
            <p className="text-xs font-semibold text-surface-500 w-24 hidden lg:block">Due Date</p>
            <p className="text-xs font-semibold text-surface-500">User</p>
          </div>

          {tasks.map((task) => (
            <TaskRow key={task.id} task={task} onEdit={setEditTask} />
          ))}
        </div>
      )}

      {editTask && (
        <EditTaskModal
          open={!!editTask}
          task={editTask}
          onClose={() => setEditTask(null)}
          isAdmin={false}
          onUpdated={() => {
            setEditTask(null);
            refetch();
          }}
        />
      )}
    </div>
  );
};

export default TasksPage;