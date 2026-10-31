'use client';
import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { ApiError, UNAUTHORIZED_EVENT, User, fetchMe, updateMe } from '@/lib/api';
import { Lang, LANGS } from '@/lib/i18n';
import { AgeGroup, isAgeGroup } from '@/lib/ageGroups';
import { safeStorage } from '@/lib/safeStorage';

interface AppState {
  user: User | null;
  lang: Lang;
  lowBandwidth: boolean;
  /** The chosen age band, or null until someone picks one. */
  ageGroup: AgeGroup | null;
  /** True until the persisted session has been checked. Pages wait on this. */
  ready: boolean;
  setUser: (u: User | null) => void;
  setLang: (l: Lang) => void;
  setLowBandwidth: (v: boolean) => void;
  setAgeGroup: (g: AgeGroup) => void;
  logout: () => void;
}

const Ctx = createContext<AppState>({} as AppState);

const isLang = (v: unknown): v is Lang => typeof v === 'string' && (LANGS as string[]).includes(v);

export function AppProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUserState] = useState<User | null>(null);
  const [lang, setLangState] = useState<Lang>('uz');
  const [lowBandwidth, setLowBandwidthState] = useState(false);
  const [ageGroup, setAgeGroupState] = useState<AgeGroup | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const storedLang = safeStorage.get('cq_lang');
    if (isLang(storedLang)) setLangState(storedLang);
    else if (navigator.language?.startsWith('ru')) setLangState('ru');

    if (safeStorage.get('cq_low_bw') === '1') setLowBandwidthState(true);

    const storedAge = safeStorage.get('cq_age');
    if (isAgeGroup(storedAge)) setAgeGroupState(storedAge);

    const token = safeStorage.get('cq_token');
    if (!token) {
      setReady(true);
      return;
    }
    fetchMe()
      .then(me => {
        setUserState(me);
        // The account's choice wins; a choice made before signing in is kept.
        if (isAgeGroup(me.age_group)) {
          setAgeGroupState(me.age_group);
          safeStorage.set('cq_age', me.age_group);
        } else if (isAgeGroup(storedAge)) {
          updateMe({ age_group: storedAge }).then(setUserState).catch(() => {});
        }
      })
      .catch(err => {
        // Only a server-side rejection invalidates the session. A timeout or a
        // dropped connection (e.g. the free API waking up) must keep the login.
        if (err instanceof ApiError && err.status === 401) safeStorage.remove('cq_token');
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
    if (u && isAgeGroup(u.age_group)) {
      setAgeGroupState(u.age_group);
      safeStorage.set('cq_age', u.age_group);
    }
  }, []);

  const setAgeGroup = useCallback((g: AgeGroup) => {
    setAgeGroupState(g);
    safeStorage.set('cq_age', g);
    // Best effort, like the language: the local choice already applies. Picking
    // a minor group also takes the account off the leaderboard, server-side.
    if (safeStorage.get('cq_token')) {
      updateMe({ age_group: g }).then(setUserState).catch(() => {});
    }
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    safeStorage.set('cq_lang', l);
    // Best effort. The profile copy of the language is a nice-to-have, not the
    // source of truth - a failed PATCH must never block the UI switch.
    if (safeStorage.get('cq_token')) {
      updateMe({ lang: l }).catch(() => {});
    }
  }, []);

  const setLowBandwidth = useCallback((v: boolean) => {
    setLowBandwidthState(v);
    safeStorage.set('cq_low_bw', v ? '1' : '0');
    if (safeStorage.get('cq_token')) {
      updateMe({ low_bandwidth_mode: v }).catch(() => {});
    }
  }, []);

  // A 401 mid-session (expired token) signs out instead of leaving a broken UI.
  useEffect(() => {
    const onUnauthorized = () => {
      safeStorage.remove('cq_token');
      setUserState(null);
    };
    window.addEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
  }, []);

  const logout = useCallback(() => {
    safeStorage.remove('cq_token');
    // Drop any cached API responses so the next person on this device never
    // sees the previous user's data.
    if (typeof caches !== 'undefined') {
      caches.keys().then(keys => keys.forEach(k => void caches.delete(k))).catch(() => {});
    }
    // The next person on this device should be asked, not inherit a child's group.
    safeStorage.remove('cq_age');
    setAgeGroupState(null);
    setUserState(null);
    router.replace('/auth');
  }, [router]);

  return (
    <Ctx.Provider
      value={{ user, lang, lowBandwidth, ageGroup, ready, setUser, setLang, setLowBandwidth, setAgeGroup, logout }}
    >
      {children}
    </Ctx.Provider>
  );
}

export const useApp = () => useContext(Ctx);
