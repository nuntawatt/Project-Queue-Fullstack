export default function Loading() {
  return (
    <div className="flex h-screen items-center justify-center bg-neutral-950">
      <div className="flex flex-col items-center gap-3">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-neutral-700 border-t-indigo-400" />
        <p className="text-sm text-neutral-500">Loading…</p>
      </div>
    </div>
  );
}
