"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-base-200 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Library konnte nicht geladen werden</h1>
        <div className="alert alert-error mb-6">
          <span>{error?.message || "Unbekannter Fehler."}</span>
        </div>

        <button
          onClick={() => reset()}
          className="btn btn-primary"
        >
          Nochmal versuchen
        </button>
      </div>
    </div>
  );
}