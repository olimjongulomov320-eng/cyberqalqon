/**
 * Re-mounted on every navigation, so the arrival animation replays per page.
 * Pure CSS (.page-enter): content is visible before hydration, and the
 * animation ends on `transform: none`, so it never leaves a containing block
 * behind for sticky or fixed descendants.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="page-enter">{children}</div>;
}
