// localStorage that never throws. Blocked or private-mode storage makes every
// call throw; this falls back to memory so the session still works until the
// tab closes.
const memory = new Map<string, string>();

export const safeStorage = {
  get(key: string): string | null {
    try {
      const v = localStorage.getItem(key);
      return v ?? memory.get(key) ?? null;
    } catch {
      return memory.get(key) ?? null;
    }
  },
  set(key: string, value: string): void {
    memory.set(key, value);
    try {
      localStorage.setItem(key, value);
    } catch {
      /* kept in memory only */
    }
  },
  remove(key: string): void {
    memory.delete(key);
    try {
      localStorage.removeItem(key);
    } catch {
      /* nothing to remove */
    }
  },
};
