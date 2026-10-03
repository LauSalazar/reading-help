import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Book = {
  id: string;
  title: string;
  author: string;
  totalPages: number;
  currentPage: number;
  genres: string[];
  startedAt: string;
  finishedAt?: string;
  liked?: boolean;
  rating?: number;
  tags?: string[];
  notes?: string;
  minutesSpent?: number;
};
export type WishItem = { id: string; title: string; author?: string };
export type Settings = {
  goalType: "pages" | "minutes";
  goalValue: number;
  remindersOn: boolean;
  reminderTime: string;
  reminderMessage: string;
};
export type State = {
  current: Book | null;
  finished: Book[];
  wishlist: WishItem[];
  log: Record<string, { pages: number; minutes: number }>;
  checkedIn: Record<string, boolean>;
  settings: Settings;
};

export const FEEDBACK_TAGS = [
  "Engaging Plot", "Inspiring", "Informative", "Beautiful Prose", "Memorable Characters",
  "Slow Pacing", "Confusing", "Predictable", "Too Long",
];
export const POSITIVE_TAGS = new Set(FEEDBACK_TAGS.slice(0, 5));

export const dayKey = (d: Date) => d.toISOString().slice(0, 10);
const daysAgo = (n: number) => { const d = new Date(); d.setDate(d.getDate() - n); return d; };
const uid = () => Math.random().toString(36).slice(2, 10);

function seed(): State {
  const log: State["log"] = {};
  const checkedIn: State["checkedIn"] = {};
  for (let i = 1; i < 56; i++) {
    const skip = (i * 7) % 5 === 0 && i > 3;
    if (skip) continue;
    const pages = 8 + ((i * 13) % 25) + Math.floor(i < 21 ? 6 : 0);
    log[dayKey(daysAgo(i))] = { pages, minutes: Math.round(pages * 1.6) };
    if (pages >= 20) checkedIn[dayKey(daysAgo(i))] = true;
  }
  log[dayKey(new Date())] = { pages: 8, minutes: 12 };
  const fin = (t: string, a: string, p: number, g: string[], d: number, liked: boolean, rating: number, tags: string[], notes = ""): Book => ({
    id: uid(), title: t, author: a, totalPages: p, currentPage: p, genres: g,
    startedAt: dayKey(daysAgo(d + 14)), finishedAt: dayKey(daysAgo(d)), liked, rating, tags, notes,
    minutesSpent: Math.round(p * 1.7),
  });
  return {
    current: { id: uid(), title: "The Overstory", author: "Richard Powers", totalPages: 502, currentPage: 214, genres: ["literary", "nature"], startedAt: dayKey(daysAgo(12)) },
    finished: [
      fin("Braiding Sweetgrass", "Robin Wall Kimmerer", 391, ["nature", "essays"], 15, true, 5, ["Inspiring", "Beautiful Prose"], "Read slowly, like a prayer."),
      fin("Project Hail Mary", "Andy Weir", 476, ["sci-fi", "adventure"], 33, true, 4, ["Engaging Plot", "Memorable Characters"]),
      fin("Atomic Habits", "James Clear", 320, ["self-help", "nonfiction"], 52, true, 4, ["Informative"]),
      fin("The Silmarillion", "J.R.R. Tolkien", 365, ["fantasy", "classic"], 78, false, 2, ["Slow Pacing", "Confusing"], "Beautiful world, hard going."),
      fin("Klara and the Sun", "Kazuo Ishiguro", 303, ["literary", "sci-fi"], 101, true, 5, ["Beautiful Prose", "Memorable Characters"]),
      fin("The 5 AM Club", "Robin Sharma", 336, ["self-help"], 130, false, 1, ["Predictable", "Too Long"]),
    ],
    wishlist: [
      { id: uid(), title: "Piranesi", author: "Susanna Clarke" },
      { id: uid(), title: "Four Thousand Weeks", author: "Oliver Burkeman" },
      { id: uid(), title: "The Left Hand of Darkness", author: "Ursula K. Le Guin" },
    ],
    log, checkedIn,
    settings: { goalType: "pages", goalValue: 20, remindersOn: true, reminderTime: "21:00", reminderMessage: "Time to curl up with your book 📖" },
  };
}

const KEY = "reading-companion-v1";

type Ctx = {
  state: State;
  updatePage: (page: number) => void;
  checkIn: () => void;
  addWish: (title: string, author?: string) => void;
  removeWish: (id: string) => void;
  startReading: (wishId: string, totalPages: number) => void;
  finishCurrent: (fb: { liked: boolean; rating: number; tags: string[]; notes: string }) => void;
  updateSettings: (s: Partial<Settings>) => void;
  reset: () => void;
};
const C = createContext<Ctx | null>(null);

export function ReadingProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(seed);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    try { const raw = localStorage.getItem(KEY); if (raw) setState(JSON.parse(raw)); } catch { /* ignore */ }
    setLoaded(true);
  }, []);
  useEffect(() => { if (loaded) localStorage.setItem(KEY, JSON.stringify(state)); }, [state, loaded]);

  const today = dayKey(new Date());
  const ctx: Ctx = {
    state,
    updatePage: (page) => setState((s) => {
      if (!s.current) return s;
      const p = Math.max(0, Math.min(page, s.current.totalPages));
      const delta = Math.max(0, p - s.current.currentPage);
      const t = s.log[today] ?? { pages: 0, minutes: 0 };
      return { ...s, current: { ...s.current, currentPage: p }, log: { ...s.log, [today]: { pages: t.pages + delta, minutes: t.minutes + Math.round(delta * 1.6) } } };
    }),
    checkIn: () => setState((s) => ({ ...s, checkedIn: { ...s.checkedIn, [today]: !s.checkedIn[today] } })),
    addWish: (title, author) => setState((s) => ({ ...s, wishlist: [...s.wishlist, { id: uid(), title, author }] })),
    removeWish: (id) => setState((s) => ({ ...s, wishlist: s.wishlist.filter((w) => w.id !== id) })),
    startReading: (wishId, totalPages) => setState((s) => {
      const w = s.wishlist.find((x) => x.id === wishId);
      if (!w) return s;
      return { ...s, wishlist: s.wishlist.filter((x) => x.id !== wishId), current: { id: uid(), title: w.title, author: w.author ?? "Unknown", totalPages, currentPage: 0, genres: [], startedAt: today } };
    }),
    finishCurrent: (fb) => setState((s) => {
      if (!s.current) return s;
      const b: Book = { ...s.current, ...fb, currentPage: s.current.totalPages, finishedAt: today, minutesSpent: Math.round(s.current.totalPages * 1.7) };
      return { ...s, current: null, finished: [b, ...s.finished] };
    }),
    updateSettings: (p) => setState((s) => ({ ...s, settings: { ...s.settings, ...p } })),
    reset: () => setState(seed()),
  };
  return <C.Provider value={ctx}>{children}</C.Provider>;
}

export function useReading() {
  const c = useContext(C);
  if (!c) throw new Error("useReading outside provider");
  return c;
}

export function todayProgress(s: State) {
  const t = s.log[dayKey(new Date())] ?? { pages: 0, minutes: 0 };
  const val = s.settings.goalType === "pages" ? t.pages : t.minutes;
  return { val, goal: s.settings.goalValue, done: val >= s.settings.goalValue || !!s.checkedIn[dayKey(new Date())] };
}

export function streak(s: State) {
  let n = 0;
  const d = new Date();
  if (!(s.log[dayKey(d)]?.pages)) d.setDate(d.getDate() - 1);
  while (s.log[dayKey(d)]?.pages) { n++; d.setDate(d.getDate() - 1); }
  return n;
}
