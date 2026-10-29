'use client';
import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { ApiError, UNAUTHORIZED_EVENT, User, fetchMe, updateMe } from '@/lib/api';
import { Lang, LANGS } from '@/lib/i18n';

interface AppState {
  user: User | null;
  lang: Lang;
  lowBandwidth: boolean;
  /** True until the persisted session has been checked. Pages wait on this. */
  ready: boolean;
  setUser: (u: User | null) => void;
  setLang: (l: Lang) => void;
  setLowBandwidth: (v: boolean) => void;
  logout: () => void;
}

const Ctx = createContext<AppState>({} as AppState);

const isLang = (v: unknown): v is Lang => typeof v === 'string' && (LANGS as string[]).includes(v);

export function AppProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUserState] = useState<User | null>(null);
  const [lang, setLangState] = useState<Lang>('uz');
  const [lowBandwidth, setLowBandwidthState] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const storedLang = localStorage.getItem('cq_lang');
    if (isLang(storedLang)) setLangState(storedLang);
    else if (navigator.language?.startsWith('ru')) setLangState('ru');

    if (localStorage.getItem('cq_low_bw') === '1') setLowBandwidthState(true);

    const token = localStorage.getItem('cq_token');
    if (!token) {
      setReady(true);
      return;
    }
    fetchMe()
      .then(setUserState)
      .catch(err => {
        // Only a server-side rejection invalidates the session. A timeout or a
        // dropped connection (e.g. the free API waking up) must keep the login.
        if (err instanceof ApiError && err.status === 401) localStorage.removeItem('cq_token');
      })
      .finally(() => setReady(true));
  }, []);

  // Keep the document in sync with the chosen language, and strip the
  // background texture entirely in low-bandwidth mode.
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  useEffect(() => {
    document.documentElement.classList.toggle('low-bandwidth', lowBandwidth);
  }, [lowBandwidth]);

  const setUser = useCallback((u: User | null) => {
    setUserState(u);
    if (u && isLang(u.lang)) setLangState(u.lang);
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    localStorage.setItem('cq_lang', l);
    // Best effort. The profile copy of the language is a nice-to-have, not the
    // source of truth - a failed PATCH must never block the UI switch.
    if (localStorage.getItem('cq_token')) {
      updateMe({ lang: l }).catch(() => {});
    }
  }, []);

  const setLowBandwidth = useCallback((v: boolean) => {
    setLowBandwidthState(v);
    localStorage.setItem('cq_low_bw', v ? '1' : '0');
    if (localStorage.getItem('cq_token')) {
      updateMe({ low_bandwidth_mode: v }).catch(() => {});
    }
  }, []);

  // A 401 mid-session (expired token) signs out instead of leaving a broken UI.
  useEffect(() => {
    const onUnauthorized = () => {
      localStorage.removeItem('cq_token');
      setUserState(null);
    };
    window.addEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('cq_token');
    // Drop any cached API responses so the next person on this device never
    // sees the previous user's data.
    if (typeof caches !== 'undefined') {
      caches.keys().then(keys => keys.forEach(k => void caches.delete(k))).catch(() => {});
    }
    setUserState(null);
    router.replace('/auth');
  }, [router]);

  return (
    <Ctx.Provider
      value={{ user, lang, lowBandwidth, ready, setUser, setLang, setLowBandwidth, logout }}
    >
      {children}
    </Ctx.Provider>
  );
}

export const useApp = () => useContext(Ctx);
