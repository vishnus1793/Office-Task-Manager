import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { useFetch, useDebounce } from '../../hooks';
import { Modal, Spinner, Avatar, ConfirmDialog } from '../ui';

const PROJECT_COLORS = ['#6366f1','#8b5cf6','#ec4899','#f43f5e','#f59e0b','#10b981','#06b6d4','#3b82f6'];

const CreateProjectModal = ({ open, onClose, onCreated }) => {
  const [form, setForm] = useState({ name: '', description: '', color: '#6366f1' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/projects', form);
      toast.success('Project created!');
      onCreated(data.project);
      onClose();
      setForm({ name: '', description: '', color: '#6366f1' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="New Project">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Project Name</label>
          <input className="input" placeholder="e.g. Website Redesign" value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })} required minLength={2} />
        </div>
        <div>
          <label className="label">Description</label>
          <textarea className="input resize-none h-20" placeholder="What's this project about?"
            value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
        <div>
          <label className="label">Color</label>
          <div className="flex gap-2">
            {PROJECT_COLORS.map((c) => (
              <button type="button" key={c} onClick={() => setForm({ ...form, color: c })}
                className={`w-7 h-7 rounded-full transition-transform hover:scale-110 ${form.color === c ? 'ring-2 ring-offset-2 ring-brand-500 scale-110' : ''}`}
                style={{ backgroundColor: c }} />
            ))}
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center">
            {loading ? <Spinner size="sm" /> : 'Create Project'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

const ProjectCard = ({ project, onDelete }) => {
  const tasks = project.tasks || [];
  const done = tasks.filter((t) => t.status === 'done').length;
  const total = tasks.length;
  const pct = total ? Math.round((done / total) * 100) : 0;
  const members = project.projectMembers || [];

  const isCompleted = total > 0 && done === total;
  const isActive = total > 0 && done < total;
  const status = isCompleted ? 'Completed' : isActive ? 'Active' : 'Planning';

  const statusColors = {
    'Completed': 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300',
    'Active': 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300',
    'Planning': 'bg-gray-100 dark:bg-gray-900/20 text-gray-700 dark:text-gray-300'
  };

  return (
    <Link
      to={`/projects/${project.id}`}
      className="group relative bg-white dark:bg-surface-800 rounded-xl border border-surface-200 dark:border-surface-700 p-6 hover:shadow-lg hover:shadow-brand-500/5 hover:border-brand-200 dark:hover:border-brand-700 transition-all duration-300 hover:-translate-y-1 cursor-pointer"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-display font-bold text-xl shadow-sm"
            style={{ backgroundColor: project.color || '#6366f1' }}
          >
            {project.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-display font-bold text-surface-900 dark:text-white text-lg truncate group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
              {project.name}
            </h3>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[status]}`}>
              {status}
            </span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={(e) => { e.preventDefault(); onDelete(project); }}
            className="p-2 rounded-lg text-surface-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Description */}
      {project.description && (
        <p className="text-sm text-surface-600 dark:text-surface-400 mb-4 line-clamp-2 leading-relaxed">
          {project.description}
        </p>
      )}

      {/* Progress */}
      <div className="space-y-3 mb-4">
        <div className="flex justify-between items-center text-sm">
          <span className="text-surface-600 dark:text-surface-400 font-medium">
            {done} of {total} tasks completed
          </span>
          <span className="text-surface-900 dark:text-white font-semibold">{pct}%</span>
        </div>
        <div className="h-2 bg-surface-100 dark:bg-surface-700 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${pct}%`,
              backgroundColor: project.color || '#6366f1',
              boxShadow: `0 0 10px ${project.color || '#6366f1'}40`
            }}
          />
        </div>
      </div>

      {/* Team Members */}
      {members.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {members.slice(0, 3).map((m) => (
                <div key={m.id} className="ring-2 ring-white dark:ring-surface-800 rounded-full">
                  <Avatar user={m.user} size="sm" />
                </div>
              ))}
            </div>
            {members.length > 3 && (
              <span className="text-xs text-surface-500 dark:text-surface-400 font-medium ml-1">
                +{members.length - 3}
              </span>
            )}
          </div>
          <div className="text-xs text-surface-500 dark:text-surface-400">
            {members.length} member{members.length !== 1 ? 's' : ''}
          </div>
        </div>
      )}

      {/* Hover indicator */}
      <div className="absolute inset-0 rounded-xl ring-1 ring-transparent group-hover:ring-brand-500/20 transition-all duration-300 pointer-events-none" />
    </Link>
  );
};

const ProjectsPage = () => {
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [filter, setFilter] = useState('all');
  const debouncedSearch = useDebounce(search);
  const { data, loading, refetch } = useFetch(`/projects?search=${debouncedSearch}&filter=${filter}`);

  const projects = data?.projects || [];
  const filteredProjects = projects.filter(project => {
    if (filter === 'all') return true;
    if (filter === 'active') return project.tasks?.some(task => task.status !== 'done') ?? true;
    if (filter === 'completed') return project.tasks?.every(task => task.status === 'done') ?? false;
    return true;
  });

  const handleCreated = () => refetch();

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/projects/${deleteTarget.id}`);
      toast.success('Project deleted');
      setDeleteTarget(null);
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-surface-900 dark:text-white">Projects</h1>
          <p className="text-surface-600 dark:text-surface-300 mt-1">
            {data?.pagination?.total ?? 0} project{(data?.pagination?.total ?? 0) !== 1 ? 's' : ''} total
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="btn-primary flex items-center gap-2 px-3 py-2 text-sm font-medium self-start sm:self-auto"
        >
          {/* <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg> */}
          New Project
        </button>
      </div>

      {/* Filters & Search */}
      <div className="space-y-4">
        {/* Filter Tabs */}
       <div
  className="flex gap-1 p-1 rounded-xl w-fit"
  style={{ backgroundColor: 'var(--color-surface-100)' }}
>
  {[
    { key: 'all', label: 'All Projects', count: projects.length },
    {
      key: 'active',
      label: 'Active',
      count: projects.filter(p => p.tasks?.some(t => t.status !== 'done')).length
    },
    {
      key: 'completed',
      label: 'Completed',
      count: projects.filter(p => p.tasks?.every(t => t.status === 'done')).length
    }
  ].map(({ key, label, count }) => (
    <button
      key={key}
      onClick={() => setFilter(key)}
      className="px-4 py-2 text-sm font-medium rounded-lg transition-all"
      style={{
        backgroundColor:
          filter === key
            ? 'var(--color-brand)'
            : 'transparent',
        color:
          filter === key
            ? '#ffffff'
            : 'var(--color-muted)'
      }}
    >
      {label} ({count})
    </button>
  ))}
</div>

        {/* Search Bar */}
        <div className="max-w-md">
          <input
            className="input w-full"
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-24 h-24 mx-auto mb-6 bg-surface-100 dark:bg-surface-800 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-xl font-display font-bold text-surface-900 dark:text-white mb-2">
            {search || filter !== 'all' ? 'No projects found' : 'No projects yet'}
          </h3>
          <p className="text-surface-600 dark:text-surface-400 mb-6 max-w-sm mx-auto">
            {search || filter !== 'all'
              ? 'Try adjusting your search or filter criteria.'
              : 'Create your first project to get started with task management.'
            }
          </p>
          {!search && filter === 'all' && (
            <button onClick={() => setShowCreate(true)} className="btn-primary">
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create your first project
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((p) => <ProjectCard key={p.id} project={p} onDelete={setDeleteTarget} />)}
        </div>
      )}

      <CreateProjectModal open={showCreate} onClose={() => setShowCreate(false)} onCreated={handleCreated} />
      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete}
        loading={deleting} title="Delete Project"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? All tasks will be permanently deleted.`} />
    </div>
  );
};

export default ProjectsPage;
