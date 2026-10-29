/**
 * Re-mounted on every navigation, so the arrival animation replays per page.
 * Pure CSS (.page-enter): content is visible before hydration, and the
 * animation ends on `transform: none`, so it never leaves a containing block
 * behind for sticky or fixed descendants.
 *
 * The wrapper is a full-width flex column so it is transparent to its parent:
 * the auth layout centres its form inside a flex <main>, and without this the
 * wrapper shrank to its content and pinned the form to the left.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="page-enter flex w-full min-w-0 flex-1 flex-col">{children}</div>;
}
