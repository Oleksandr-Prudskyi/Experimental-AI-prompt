export function RightPanel() {
  return (
    <aside className="hidden xl:block w-[280px] shrink-0 p-4 border-l border-white/10 dark:border-slate-700/30 bg-white/30 dark:bg-slate-900/30 backdrop-blur-xl overflow-y-auto">
      <div className="flex flex-col gap-4">
        <div className="glass-card rounded-2xl p-4">
          <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2">
            Oznámení
          </h3>
          <p className="text-xs text-slate-400">Žádná nová oznámení</p>
        </div>
      </div>
    </aside>
  );
}
