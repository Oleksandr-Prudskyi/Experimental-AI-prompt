export function RightPanel() {
  return (
    <aside className="hidden xl:block w-[280px] shrink-0 p-4 border-l border-ev-200 dark:border-ev-700/30 bg-white/30 dark:bg-ev-900/30 overflow-y-auto">
      <div className="flex flex-col gap-4">
        <div className="rounded-2xl p-4 border border-ev-200 dark:border-ev-600/40 bg-white dark:bg-ev-800">
          <h3 className="text-sm font-semibold text-ev-600 dark:text-ev-300 mb-2">
            Oznámení
          </h3>
          <p className="text-xs text-ev-400">Žádná nová oznámení</p>
        </div>
      </div>
    </aside>
  );
}
