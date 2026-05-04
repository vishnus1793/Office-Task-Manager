import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { useFetch, useDebounce } from '../../hooks';
import { Modal, EmptyState, Spinner, Avatar, ConfirmDialog } from '../ui';

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
  const pct = tasks.length ? Math.round((done / tasks.length) * 100) : 0;
  const members = project.projectMembers || [];

  return (
    <Link to={`/projects/${project.id}`} className="card p-5 block hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group">
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-display font-bold text-lg shrink-0"
          style={{ backgroundColor: project.color || '#6366f1' }}>
          {project.name.charAt(0)}
        </div>
        <button onClick={(e) => { e.preventDefault(); onDelete(project); }}
          className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 text-surface-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <h3 className="font-display font-bold text-surface-900 dark:text-white mb-1 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
        {project.name}
      </h3>
      {project.description && (
        <p className="text-xs text-surface-500 dark:text-surface-400 mb-3 line-clamp-2">{project.description}</p>
      )}

      <div className="space-y-2 mt-3">
        <div className="flex justify-between text-xs text-surface-500">
          <span>{tasks.length} tasks</span>
          <span>{pct}% done</span>
        </div>
        <div className="h-1.5 bg-surface-100 dark:bg-surface-700 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: project.color || '#6366f1' }} />
        </div>
      </div>

      {members.length > 0 && (
        <div className="flex items-center gap-1 mt-4">
          <div className="flex -space-x-2">
            {members.slice(0, 4).map((m) => (
              <div key={m.id} className="ring-2 ring-white dark:ring-surface-800 rounded-full">
                <Avatar user={m.user} size="sm" />
              </div>
            ))}
          </div>
          {members.length > 4 && (
            <span className="text-xs text-surface-400 ml-2">+{members.length - 4} more</span>
          )}
        </div>
      )}
    </Link>
  );
};

const ProjectsPage = () => {
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const debouncedSearch = useDebounce(search);
  const { data, loading, refetch } = useFetch(`/projects?search=${debouncedSearch}`);

  const projects = data?.projects || [];

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
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-surface-900 dark:text-white">Projects</h1>
          <p className="text-sm text-surface-500 dark:text-surface-400 mt-0.5">{data?.pagination?.total ?? 0} projects</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary">
          {/* <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg> */}
          New Project
        </button>
      </div>

      <div className="relative max-w-sm">
        {/* <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg> */}
        <input className="input pl-10" placeholder="Search projects..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : projects.length === 0 ? (
        <EmptyState icon="📁" title="No projects yet" description="Create your first project to get started with task management."
          action={<button onClick={() => setShowCreate(true)} className="btn-primary">Create Project</button>} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {projects.map((p) => <ProjectCard key={p.id} project={p} onDelete={setDeleteTarget} />)}
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
