import { useNavigate } from 'react-router-dom';
import { GlassCard } from '@/components/shared/GlassCard';
import { Icon } from '@/components/shared/Icon';

const actions = [
  { label: 'Nový záznam', icon: 'new-record', path: '/evidence/new', gradient: 'from-indigo-500 to-violet-500' },
  { label: 'Evidence', icon: 'evidence', path: '/evidence', gradient: 'from-emerald-500 to-teal-500' },
  { label: 'Stroje', icon: 'machines', path: '/machines', gradient: 'from-amber-500 to-orange-500' },
  { label: 'Uživatelé', icon: 'users', path: '/admin/users', gradient: 'from-sky-500 to-blue-500' },
];

export function QuickActions() {
  const navigate = useNavigate();

  return (
    <GlassCard hover={false} className="animate-fade-in-up" style={{ animationDelay: '400ms' }}>
      <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-4">Rychlé akce</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {actions.map((action, i) => (
          <button
            key={action.path}
            onClick={() => navigate(action.path)}
            className="flex flex-col items-center gap-2 p-4 rounded-2xl hover:bg-white/50 dark:hover:bg-slate-700/50 transition-all duration-300 animate-fade-in"
            style={{ animationDelay: `${450 + i * 60}ms` }}
          >
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${action.gradient} flex items-center justify-center shadow-md text-white`}>
              <Icon name={action.icon} size={20} />
            </div>
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{action.label}</span>
          </button>
        ))}
      </div>
    </GlassCard>
  );
}
