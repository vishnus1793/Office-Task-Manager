import { useFetch } from '../../hooks';
import { useAuth } from '../../contexts/AuthContext';
import { Avatar, Badge, Spinner } from '../ui';
import { formatDate, statusConfig, priorityConfig, isOverdue } from '../../utils';

const StatCard = ({ label, value, icon, color, sub }) => (
  <div className="card p-6 flex items-start justify-between hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
    <div>
      <p className="text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider mb-2">{label}</p>
      <p className="text-3xl font-display font-bold text-surface-900 dark:text-white mb-1 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">{value ?? '—'}</p>
      {sub && <p className="text-xs text-surface-400 mt-1">{sub}</p>}
    </div>
    <div className={`w-12 h-12 ${color} rounded-2xl flex items-center justify-center text-xl shrink-0 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>{icon}</div>
  </div>
);

const DashboardPage = () => {
  const { user } = useAuth();
  const { data, loading } = useFetch('/tasks/dashboard');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  const stats = data?.stats || {};
  const pct = stats.total ? Math.round((stats.done / stats.total) * 100) : 0;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-brand-50 to-violet-50 dark:from-brand-900/20 dark:to-violet-900/20 rounded-2xl p-6 -mx-6 -mt-6 mb-8 border border-brand-100 dark:border-brand-800/30">
        <h1 className="text-3xl font-display font-bold text-surface-900 dark:text-white mb-2">
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-surface-600 dark:text-surface-300 text-base">Here's what's happening with your projects today.</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard label="Total Tasks" value={stats.total} icon="📋" color="bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-blue-500/25" />
        <StatCard label="Completed" value={stats.done} icon="✅" color="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-emerald-500/25"
          sub={`${pct}% completion rate`} />
        <StatCard label="In Progress" value={stats.inProgress} icon="🔄" color="bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-amber-500/25" />
        <StatCard label="Overdue" value={stats.overdue} icon="⚠️" color="bg-gradient-to-br from-red-500 to-red-600 text-white shadow-red-500/25"
          sub={stats.overdue > 0 ? 'Needs attention' : 'All on track'} />
      </div>

      {/* Progress bar */}
      <div className="card p-6 hover:shadow-lg transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-bold text-surface-900 dark:text-white text-lg">Overall Progress</h2>
          <span className="text-sm font-semibold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/20 px-3 py-1 rounded-full">{pct}%</span>
        </div>
        <div className="h-3 bg-surface-100 dark:bg-surface-700 rounded-full overflow-hidden mb-4 shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-brand-500 to-violet-500 rounded-full transition-all duration-700 shadow-sm"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="flex flex-wrap gap-4">
          {[
            { label: 'To Do', value: stats.todo, color: 'bg-slate-400' },
            { label: 'In Progress', value: stats.inProgress, color: 'bg-amber-400' },
            { label: 'Done', value: stats.done, color: 'bg-emerald-400' },
          ].map(({ label, value, color }) => (
            <div key={label} className="flex items-center gap-2 text-sm text-surface-500 dark:text-surface-400">
              <span className={`w-3 h-3 rounded-full ${color} shadow-sm`} />
              <span className="font-medium">{label}:</span>
              <strong className="text-surface-700 dark:text-surface-200">{value ?? 0}</strong>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Tasks */}
      <div>
        <h2 className="font-display font-bold text-surface-900 dark:text-white mb-5 text-lg">Recent Activity</h2>
        {data?.recentTasks?.length === 0 ? (
          <div className="card p-8 text-center text-surface-400 bg-surface-50 dark:bg-surface-800/50">
            <div className="text-4xl mb-3">📋</div>
            <p className="font-medium text-surface-600 dark:text-surface-300">No recent tasks</p>
            <p className="text-sm text-surface-400 mt-1">Your recent activity will appear here</p>
          </div>
        ) : (
          <div className="card divide-y divide-surface-100 dark:divide-surface-700 overflow-hidden hover:shadow-lg transition-all duration-300">
            {data?.recentTasks?.map((task) => {
              const sc = statusConfig[task.status];
              const over = isOverdue(task.dueDate, task.status);
              return (
                <div key={task.id} className="flex items-center gap-4 p-5 hover:bg-surface-50 dark:hover:bg-surface-700/30 transition-colors group cursor-pointer">
                  <span className={`w-3 h-3 rounded-full ${sc.dot} shrink-0 shadow-sm`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-surface-900 dark:text-white truncate group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                      {task.title}
                    </p>
                    <p className="text-xs text-surface-400 mt-1">
                      <span className="font-medium text-surface-600 dark:text-surface-300">{task.project?.name}</span>
                      <span className="mx-2">•</span>
                      {over ? <span className="text-red-500 font-medium">⚠ Overdue</span> : formatDate(task.dueDate)}
                    </p>
                  </div>
                  <span className={`badge ${sc.color} text-xs font-medium px-2 py-1`}>{sc.label}</span>
                  {task.assignee && <Avatar user={task.assignee} size="sm" />}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
