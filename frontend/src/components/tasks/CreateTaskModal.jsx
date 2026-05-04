import { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { Modal, Spinner } from '../ui';

const CreateTaskModal = ({ open, onClose, projectId, members, onCreated }) => {
  const [form, setForm] = useState({
    title: '', description: '', status: 'todo', priority: 'medium',
    assignedTo: '', dueDate: '', projectId,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/tasks', { ...form, assignedTo: form.assignedTo || undefined, dueDate: form.dueDate || undefined });
      toast.success('Task created!');
      onCreated();
      onClose();
      setForm({ title: '', description: '', status: 'todo', priority: 'medium', assignedTo: '', dueDate: '', projectId });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  const f = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  return (
    <Modal open={open} onClose={onClose} title="Create Task">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Title</label>
          <input className="input" placeholder="What needs to be done?" value={form.title} onChange={f('title')} required minLength={2} />
        </div>
        <div>
          <label className="label">Description</label>
          <textarea className="input resize-none h-20" placeholder="Optional details..." value={form.description} onChange={f('description')} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Status</label>
            <select className="input" value={form.status} onChange={f('status')}>
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="done">Done</option>
            </select>
          </div>
          <div>
            <label className="label">Priority</label>
            <select className="input" value={form.priority} onChange={f('priority')}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Assign To</label>
            <select className="input" value={form.assignedTo} onChange={f('assignedTo')}>
              <option value="">Unassigned</option>
              {members?.map((m) => (
                <option key={m.userId} value={m.userId}>{m.user?.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Due Date</label>
            <input type="date" className="input" value={form.dueDate} onChange={f('dueDate')} />
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center">
            {loading ? <Spinner size="sm" /> : 'Create Task'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateTaskModal;
