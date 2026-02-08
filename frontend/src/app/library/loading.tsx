export default function Loading() {
  return (
    <div className="max-w-3xl mx-auto py-10 px-4 animate-pulse">
      <div className="skeleton h-8 w-56 mb-8" />

      {/* Styles */}
      <div className="mb-10">
        <div className="skeleton h-6 w-28 mb-3" />
        <div className="space-y-3">
          <div className="skeleton h-24" />
          <div className="skeleton h-24" />
        </div>
      </div>

      {/* Environments */}
      <div>
        <div className="skeleton h-6 w-44 mb-3" />
        <div className="space-y-3">
          <div className="skeleton h-24" />
          <div className="skeleton h-24" />
        </div>
      </div>
    </div>
  );
}