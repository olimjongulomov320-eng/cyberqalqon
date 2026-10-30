'use client';
import { useApp } from '@/context/AppContext';
import { makeT } from '@/lib/i18n';
import { AGE_GROUPS, AgeGroup } from '@/lib/ageGroups';
import { ContentIcon } from '@/components/icons';

/**
 * Pick who is learning. A band, never a date of birth. Each card is a plain
 * toggle button so it works with Tab/Enter and reads as "pressed" to a screen
 * reader. `compact` drops the description for tight spots (settings, sign-up).
 */
export default function AgePicker({
  value,
  onChange,
  compact = false,
}: {
  value: AgeGroup | null;
  onChange: (g: AgeGroup) => void;
  compact?: boolean;
}) {
  const { lang } = useApp();
  const tr = makeT(lang);

  return (
    <div role="group" aria-label={tr('agePickTitle')} className={`grid grid-cols-2 gap-2 sm:grid-cols-3 ${compact ? '' : 'lg:grid-cols-5'}`}>
      {AGE_GROUPS.map(g => {
        const on = value === g.slug;
        return (
          <button
            key={g.slug}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(g.slug)}
            className={`group flex min-h-[4.5rem] flex-col items-start gap-1 rounded-lg border p-3 text-left transition-[border-color,background-color,transform] duration-200 active:scale-[0.98] ${
              on
                ? 'border-cyan-400/70 bg-cyan-500/10'
                : 'border-border bg-surface-900 hover:border-border-light hover:bg-surface-800/70'
            }`}
          >
            <span className="flex w-full items-center gap-2">
              <ContentIcon
                name={g.icon}
                size={20}
                className={`shrink-0 transition-transform duration-200 group-hover:scale-110 ${on ? 'text-cyan-300' : 'text-text-muted'}`}
              />
              <span className="num text-sm font-bold text-text-primary">{g.title[lang]}</span>
            </span>
            <span className="text-xs text-text-secondary">{g.who[lang]}</span>
            {!compact && <span className="mt-0.5 hidden text-[0.6875rem] leading-snug text-text-muted lg:block">{g.description[lang]}</span>}
          </button>
        );
      })}
    </div>
  );
}
