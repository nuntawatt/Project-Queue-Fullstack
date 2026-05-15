import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4 bg-neutral-50">
      <h1 className="text-6xl font-bold tracking-tight text-neutral-900">
        404
      </h1>
      <p className="text-neutral-500">
        This page doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/"
        className="mt-2 rounded-lg bg-neutral-900 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-neutral-800"
      >
        Back to home
      </Link>
    </div>
  );
}
