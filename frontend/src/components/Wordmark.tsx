/** The product name as a wordmark: "Cyber" in primary text, "Qalqon" in the accent. */
export default function Wordmark({ className = '' }: { className?: string }) {
  return (
    <span className={`font-mono font-bold tracking-tight text-text-primary ${className}`}>
      Cyber<span className="text-cyan-400">Qalqon</span>
    </span>
  );
}
