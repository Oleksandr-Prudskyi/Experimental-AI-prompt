import { useThemeStore } from '@/stores/theme.store';
import { Icon } from '@/components/shared/Icon';

export function ThemeToggle() {
  const { theme, toggle } = useThemeStore();
  const isLight = theme === 'light';

  return (
    <button
      onClick={toggle}
      className="w-full px-3 py-2 text-sm text-left text-ev-300 hover:bg-ev-700/50 flex items-center gap-2 transition-colors"
    >
      <Icon name={isLight ? 'moon' : 'sun'} size={16} />
      {isLight ? 'Noc' : 'Den'}
    </button>
  );
}
