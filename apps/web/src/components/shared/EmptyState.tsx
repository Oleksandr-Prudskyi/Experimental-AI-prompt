import { Icon } from '@/components/shared/Icon';

export function EmptyState({ icon, title, description }: { icon: string; title: string; description?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
      <div className="w-14 h-14 rounded-lg bg-ev-100 dark:bg-ev-800 flex items-center justify-center mb-4 text-ev-400">
        <Icon name={icon} size={28} />
      </div>
      <h3 className="text-base font-semibold text-ev-700 dark:text-ev-200">{title}</h3>
      {description && <p className="text-sm text-ev-400 mt-1 max-w-sm">{description}</p>}
    </div>
  );
}
