export default function Loading() {
  return (
    <div className="max-w-3xl mx-auto py-10 px-4 animate-pulse">
      <div className="h-8 w-56 bg-zinc-200 dark:bg-zinc-800 rounded mb-8" />

      {/* Styles */}
      <div className="mb-10">
        <div className="h-6 w-28 bg-zinc-200 dark:bg-zinc-800 rounded mb-3" />
        <div className="space-y-3">
          <div className="h-24 bg-zinc-200 dark:bg-zinc-800 rounded" />
          <div className="h-24 bg-zinc-200 dark:bg-zinc-800 rounded" />
        </div>
      </div>

      {/* Environments */}
      <div>
        <div className="h-6 w-44 bg-zinc-200 dark:bg-zinc-800 rounded mb-3" />
        <div className="space-y-3">
          <div className="h-24 bg-zinc-200 dark:bg-zinc-800 rounded" />
          <div className="h-24 bg-zinc-200 dark:bg-zinc-800 rounded" />
        </div>
      </div>
    </div>
  );
}