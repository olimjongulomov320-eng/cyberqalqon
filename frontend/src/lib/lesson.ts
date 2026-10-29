/**
 * Lesson markdown often opens with a heading that repeats the page title (the
 * title is already shown above the two panes). Drop that one heading, and only
 * when it really is the same text, so a genuine first section is never lost.
 */
// Punctuation and whitespace are ignored; letters of any alphabet are kept as they are.
const norm = (s: string) => s.toLowerCase().replace(/[\s.,:;!?'"`\u2018\u2019\u02bb\u02bc()\[\]\-\u2013\u2014/\\]+/g, ' ').trim();

export function stripLeadingTitle(markdown: string, title: string): string {
  const m = markdown.match(/^\s*#{1,3}[ \t]+(.+?)[ \t]*(?:\r?\n|$)/);
  if (!m || norm(m[1]) !== norm(title)) return markdown;
  return markdown.slice(m[0].length).replace(/^\s+/, '');
}
