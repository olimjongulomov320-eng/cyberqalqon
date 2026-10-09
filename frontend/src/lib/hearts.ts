'use client';
import { useCallback, useSyncExternalStore } from 'react';

/**
 * Client-side hearts: 5 max, one per wrong answer, refilled every new day.
 * Hearts never block learning — at zero the lesson shows a "restore a heart"
 * practice card instead of a hard wall — so this is purely localStorage.
 */

export const MAX_HEARTS = 5;

const KEY = 'cq_hearts';

interface HeartState {
  /** ISO date (yyyy-mm-dd, local) the snapshot belongs to. */
  day: string;
  n: number;
}

function today(): string {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${dd}`;
}

function read(): HeartState {
  if (typeof window === 'undefined') return { day: today(), n: MAX_HEARTS };
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { day: today(), n: MAX_HEARTS };
    const parsed = JSON.parse(raw) as HeartState;
    if (parsed.day === today()) return { day: parsed.day, n: Math.min(parsed.n, MAX_HEARTS) };
    return { day: today(), n: MAX_HEARTS }; // new day → full hearts
  } catch {
    return { day: today(), n: MAX_HEARTS };
  }
}

let listeners = new Set<() => void>();

function emit() {
  for (const l of Array.from(listeners)) l();
}

function persist(next: HeartState) {
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* storage full or blocked — hearts are cosmetic, never fatal */
  }
  emit();
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

function heartCount() {
  return read().n;
}

/** Deduct one heart (wrong answer). Never goes below zero. */
export function loseHeart() {
  const cur = read();
  if (cur.n <= 0) return;
  persist({ day: cur.day, n: cur.n - 1 });
}

/** Restore a heart (practice card success). Capped at MAX_HEARTS. */
export function restoreHeart() {
  const cur = read();
  if (cur.n >= MAX_HEARTS) return;
  persist({ day: cur.day, n: cur.n + 1 });
}

/** Live hearts value — re-renders on any change. */
export function useHearts() {
  // Server snapshot = full hearts (localStorage only exists on the client).
  return useSyncExternalStore(subscribe, heartCount, () => MAX_HEARTS);
}