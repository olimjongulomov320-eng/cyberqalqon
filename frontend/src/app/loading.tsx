/**
 * Route-level loading fallback. Mirrors the dashboard skeleton so route
 * transitions show structure instead of a flash of empty space.
 */
export default function Loading() {
  return (
    <div className="flex flex-col pt-2" aria-busy="true" aria-live="polite">
      <div className="skeleton h-7 w-40 rounded-xl" />
      <div className="skeleton mt-3 h-4 w-64 rounded-md" />
      <div className="skeleton mt-8 h-32 w-full rounded-2xl" />
      <div className="skeleton mt-3 h-24 w-full rounded-2xl" />
      <span className="sr-only">Loading…</span>
    </div>
  );
}
