/**
 * The brand mark as inline SVG so it can animate: on page load the guard ring
 * draws itself, then the prompt and tail fade in. It plays once per document
 * load (client-side navigations keep the header mounted, so it never repeats).
 * The geometry matches public/logo.svg, which stays the static source for the
 * favicon and app icons. Reduced motion renders the finished mark.
 */
export default function LogoMark({ size = 28, className = '' }: { size?: number; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" aria-hidden="true" focusable="false" className={className}>
      <path
        pathLength={1}
        className="logo-ring"
        d="M15.29 19.95 L8.71 19.95 L4.05 15.29 L4.05 8.71 L8.71 4.05 L15.29 4.05 L19.95 8.71 L19.95 15.29"
        stroke="#39d98a"
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <g className="logo-fade" stroke="#39d98a" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 9.2 12.2 12 9 14.8" strokeWidth="1.8" />
        <path d="M12.9 14.8H15.1" strokeWidth="1.8" />
        <path d="M17.1 17.1 20.6 20.6" strokeWidth="2.2" />
      </g>
    </svg>
  );
}
