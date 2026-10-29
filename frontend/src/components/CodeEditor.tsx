'use client';
import { useEffect, useRef } from 'react';

/**
 * CodeMirror 6 editor, loaded lazily (it is only needed on the solve page, so
 * it stays out of every other route's bundle). The editor surface is dark in
 * both themes on purpose — it is the "developer tool" half of the design.
 *
 * Tab is NOT bound to indentation: trapping Tab would make the editor a
 * keyboard trap. Press Esc then Tab to leave, as CodeMirror documents.
 */
export default function CodeEditor({
  value,
  onChange,
  onRun,
  label,
}: {
  value: string;
  onChange: (v: string) => void;
  /** Ctrl/Cmd+Enter */
  onRun?: () => void;
  label: string;
}) {
  const host = useRef<HTMLDivElement>(null);
  const viewRef = useRef<import('@codemirror/view').EditorView | null>(null);
  const onChangeRef = useRef(onChange);
  const onRunRef = useRef(onRun);
  onChangeRef.current = onChange;
  onRunRef.current = onRun;

  useEffect(() => {
    let disposed = false;
    (async () => {
      const [{ EditorView, basicSetup }, { keymap }, { python }, { oneDark }] = await Promise.all([
        import('codemirror'),
        import('@codemirror/view'),
        import('@codemirror/lang-python'),
        import('@codemirror/theme-one-dark'),
      ]);
      if (disposed || !host.current) return;
      viewRef.current = new EditorView({
        doc: value,
        parent: host.current,
        extensions: [
          basicSetup,
          python(),
          oneDark,
          keymap.of([{ key: 'Mod-Enter', run: () => (onRunRef.current?.(), true) }]),
          EditorView.contentAttributes.of({ 'aria-label': label }),
          EditorView.updateListener.of(u => {
            if (u.docChanged) onChangeRef.current(u.state.doc.toString());
          }),
          EditorView.theme({
            '&': { height: '100%', fontSize: '14px' },
            '.cm-scroller': { fontFamily: 'var(--font-mono), ui-monospace, monospace', minHeight: '16rem' },
          }),
        ],
      });
    })();
    return () => {
      disposed = true;
      viewRef.current?.destroy();
      viewRef.current = null;
    };
    // The editor owns its document after mount; `value` is only the initial text.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Allow the parent to replace the code (Reset button) without remounting.
  useEffect(() => {
    const v = viewRef.current;
    if (v && v.state.doc.toString() !== value) {
      v.dispatch({ changes: { from: 0, to: v.state.doc.length, insert: value } });
    }
  }, [value]);

  return <div ref={host} className="h-full min-h-[16rem] overflow-hidden rounded-xl border border-border-light bg-[#282c34]" />;
}
