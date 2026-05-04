import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { useFetch } from '../../hooks';
import { Modal, Avatar, Badge, Spinner, EmptyState } from '../ui';
import TaskBoard from '../tasks/TaskBoard';
import CreateTaskModal from '../tasks/CreateTaskModal';

const AddMemberModal = ({ open, onClose, projectId, onAdded }) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('member');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post(`/projects/${projectId}/members`, { email, role });
      toast.success('Member added!');
      setEmail('');
      onAdded();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add member');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Add Team Member">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Email Address</label>
          <input type="email" className="input" placeholder="colleague@company.com"
            value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label className="label">Role</label>
          <select className="input" value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="member">Member</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center">
            {loading ? <Spinner size="sm" /> : 'Add Member'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

const ProjectDetailPage = () => {
  const { id } = useParams();
  const { data, loading, refetch } = useFetch(`/projects/${id}`);
  const [showAddMember, setShowAddMember] = useState(false);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [activeTab, setActiveTab] = useState('board');

  const project = data?.project;
  const userRole = data?.userRole;
  const isAdmin = userRole === 'admin';

  const removeMember = async (userId) => {
    try {
      await api.delete(`/projects/${id}/members/${userId}`);
      toast.success('Member removed');
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove member');
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div>;
  }

  if (!project) {
    return (
      <EmptyState icon="🔍" title="Project not found"
        description="This project doesn't exist or you don't have access."
        action={<Link to="/projects" className="btn-primary">Back to Projects</Link>} />
    );
  }

  const tasks = project.tasks || [];
  const members = project.projectMembers || [];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-display font-bold text-xl"
            style={{ backgroundColor: project.color || '#6366f1' }}>
            {project.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <Link to="/projects" className="text-sm text-surface-400 hover:text-surface-600 transition-colors">Projects</Link>
              <span className="text-surface-300">/</span>
              <h1 className="text-2xl font-display font-bold text-surface-900 dark:text-white">{project.name}</h1>
            </div>
            {project.description && (
              <p className="text-sm text-surface-500 dark:text-surface-400 mt-0.5">{project.description}</p>
            )}
          </div>
        </div>
        {isAdmin && (
          <div className="flex gap-2">
            <button onClick={() => setShowAddMember(true)} className="btn-secondary">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Member
            </button>
            <button onClick={() => setShowCreateTask(true)} className="btn-primary">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Task
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-surface-200 dark:border-surface-700">
        {['board', 'members'].map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm font-medium capitalize transition-all border-b-2 -mb-px ${
              activeTab === tab
                ? 'border-brand-500 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-surface-500 hover:text-surface-700'
            }`}>
            {tab} {tab === 'board' ? `(${tasks.length})` : `(${members.length})`}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'board' && (
        <TaskBoard tasks={tasks} projectId={id} isAdmin={isAdmin} members={members} onUpdate={refetch} />
      )}

      {activeTab === 'members' && (
        <div className="card divide-y divide-surface-100 dark:divide-surface-700">
          {members.length === 0 ? (
            <div className="p-8 text-center text-surface-400">No members yet</div>
          ) : (
            members.map((m) => (
              <div key={m.id} className="flex items-center gap-4 p-4">
                <Avatar user={m.user} size="md" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-surface-900 dark:text-white">{m.user?.name}</p>
                  <p className="text-xs text-surface-400">{m.user?.email}</p>
                </div>
                <span className={`badge capitalize ${m.role === 'admin' ? 'bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400' : 'bg-surface-100 dark:bg-surface-700 text-surface-600 dark:text-surface-300'}`}>
                  {m.role}
                </span>
                {isAdmin && (
                  <button
  onClick={() => removeMember(m.userId)}
  className="px-3 py-1 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
>
  Remove Member
</button>
                )}
              </div>
            ))
          )}
        </div>
      )}

      <AddMemberModal open={showAddMember} onClose={() => setShowAddMember(false)} projectId={id} onAdded={refetch} />
      {showCreateTask && (
        <CreateTaskModal open={showCreateTask} onClose={() => setShowCreateTask(false)}
          projectId={id} members={members} onCreated={refetch} />
      )}
    </div>
  );
};

export default ProjectDetailPage;
