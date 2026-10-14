import { Link, useLocation } from "@tanstack/react-router";
import { BarChart3, BookOpen, History, Settings, Sparkles } from "lucide-react";
import { useEffect, useRef, type ReactNode } from "react";
import { toast } from "sonner";
import { useTranslation } from "@/lib/i18n";
import { useReading } from "@/lib/reading-store";

function Reminder() {
  const { state } = useReading();
  const { t } = useTranslation();
  const fired = useRef<string>("");
  useEffect(() => {
    const id = setInterval(() => {
      const s = state.settings;
      if (!s.remindersOn) return;
      const n = new Date();
      const hm = `${String(n.getHours()).padStart(2, "0")}:${String(n.getMinutes()).padStart(2, "0")}`;
      const key = n.toDateString() + hm;
      if (hm === s.reminderTime && fired.current !== key) {
        fired.current = key;
        toast(s.reminderMessage, { description: t("reminder.description") });
      }
    }, 20000);
    return () => clearInterval(id);
  }, [state.settings, t]);
  return null;
}

export function AppShell({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const { t } = useTranslation();
  const tabs = [
    { to: "/", label: t("nav.home"), icon: BookOpen },
    { to: "/history", label: t("nav.history"), icon: History },
    { to: "/analytics", label: t("nav.analytics"), icon: BarChart3 },
    { to: "/recommendations", label: t("nav.recommendations"), icon: Sparkles },
    { to: "/settings", label: t("nav.settings"), icon: Settings },
  ] as const;

  return (
    <div className="mx-auto min-h-screen max-w-md bg-background pb-28">
      <Reminder />
      <main key={pathname} className="animate-fade-in px-5 pt-8">{children}</main>
      <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-md border-t bg-card/95 backdrop-blur">
        <ul className="grid grid-cols-5 px-2 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-2">
          {tabs.map(({ to, label, icon: Icon }) => {
            const active = pathname === to;
            return (
              <li key={to}>
                <Link to={to} className={`press flex flex-col items-center gap-1 rounded-xl py-1.5 text-[11px] font-medium transition-colors ${active ? "text-primary" : "text-muted-foreground"}`}>
                  <span className={`rounded-full px-4 py-1 transition-colors ${active ? "bg-accent" : ""}`}><Icon className="h-5 w-5" /></span>
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}

export function PageHeader({ eyebrow, title }: { eyebrow?: string; title: string }) {
  return (
    <header className="mb-6">
      {eyebrow && <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">{eyebrow}</p>}
      <h1 className="mt-1 text-3xl font-semibold">{title}</h1>
    </header>
  );
}

const covers = ["bg-cover-1", "bg-cover-2", "bg-cover-3", "bg-cover-4"];
export function Cover({ title, size = "md" }: { title: string; size?: "sm" | "md" | "lg" }) {
  const c = covers[[...title].reduce((a, ch) => a + ch.charCodeAt(0), 0) % covers.length];
  const dims = size === "lg" ? "h-36 w-24 text-sm" : size === "sm" ? "h-14 w-10 text-[8px]" : "h-20 w-14 text-[10px]";
  return (
    <div className={`${c} ${dims} flex shrink-0 items-end rounded-md p-1.5 font-display leading-tight text-primary-foreground shadow-soft`}>
      <span className="line-clamp-3">{size === "sm" ? "" : title}</span>
    </div>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-2xl border bg-card p-5 shadow-soft ${className}`}>{children}</section>;
}
