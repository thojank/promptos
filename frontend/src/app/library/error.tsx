"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-4">Library konnte nicht geladen werden</h1>
      <p className="text-zinc-600 dark:text-zinc-300 mb-6">
        {error?.message || "Unbekannter Fehler."}
      </p>

      <button
        onClick={() => reset()}
        className="rounded bg-zinc-900 text-white px-4 py-2 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 transition"
      >
        Nochmal versuchen
      </button>
    </div>
  );
}