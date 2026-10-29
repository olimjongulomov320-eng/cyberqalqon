import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';

// GFM gives lessons their tables. It also auto-links bare URLs, and the
// phishing lessons are full of deliberately fake ones, so links are rendered as
// plain text: nothing in the curriculum should be clickable from inside a lesson.
const components: Components = {
  a: ({ children }) => <span className="font-mono text-[0.9em] text-text-primary">{children}</span>,
  table: ({ children }) => (
    <div className="lesson-table">
      <table>{children}</table>
    </div>
  ),
};

export default function Markdown({ children }: { children: string }) {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
      {children}
    </ReactMarkdown>
  );
}
