import { createFileRoute } from "@tanstack/react-router";
import { Bar, BarChart, Line, LineChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { AppShell, Card, PageHeader } from "@/components/AppShell";
import { useTranslation } from "@/lib/i18n";
import { dayKey, streak, useReading } from "@/lib/reading-store";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "Reading Analytics — Bookmark" },
      { name: "description", content: "See your reading streaks, pages per day and habit trends." },
      { property: "og:title", content: "Reading Analytics — Bookmark" },
      { property: "og:description", content: "See your reading streaks, pages per day and habit trends." },
    ],
  }),
  component: Analytics,
});

const tip = { contentStyle: { background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 } };

function Analytics() {
  const { state } = useReading();
  const { t } = useTranslation();
  const f = state.finished;
  const totalPages = f.reduce((a, b) => a + b.totalPages, 0) + (state.current?.currentPage ?? 0);
  const avgHrs = f.length ? (f.reduce((a, b) => a + (b.minutesSpent ?? 0), 0) / f.length / 60).toFixed(1) : "0";

  const daily = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (13 - i));
    return { day: d.toLocaleDateString(undefined, { weekday: "narrow" }), pages: state.log[dayKey(d)]?.pages ?? 0 };
  });
  const weekly = Array.from({ length: 8 }, (_, w) => {
    let pages = 0, days = 0;
    for (let i = 0; i < 7; i++) { const d = new Date(); d.setDate(d.getDate() - ((7 - w) * 7 + i)); const p = state.log[dayKey(d)]?.pages ?? 0; pages += p; if (p) days++; }
    return { week: `W${w + 1}`, pages, days };
  });
  const last4 = weekly.slice(4).reduce((a, w) => a + w.pages, 0), prev4 = weekly.slice(0, 4).reduce((a, w) => a + w.pages, 0);
  const change = prev4 ? Math.round(((last4 - prev4) / prev4) * 100) : 0;
  const liked = f.filter((b) => b.liked).length;
  const recent = f.slice(0, 3), older = f.slice(3);
  const avg = (xs: typeof f) => (xs.length ? xs.reduce((a, b) => a + (b.rating ?? 0), 0) / xs.length : 0);

  const stats = [
    { label: t("analytics.booksRead"), value: f.length },
    { label: t("analytics.pagesRead"), value: totalPages.toLocaleString() },
    { label: t("analytics.avgHours"), value: avgHrs },
    { label: t("analytics.currentStreak"), value: `${streak(state)}${t("general.days")}` },
  ];

  return (
    <AppShell>
      <PageHeader eyebrow={t("analytics.eyebrow")} title={t("analytics.title")} />
      <div className="mb-4 grid grid-cols-2 gap-3">
        {stats.map((s) => (
          <Card key={s.label} className="p-4"><p className="font-display text-3xl font-semibold text-primary">{s.value}</p><p className="text-xs text-muted-foreground">{s.label}</p></Card>
        ))}
      </div>
      <div className="space-y-4">
        <Card>
          <h2 className="text-lg font-semibold">{t("analytics.pagesPerDay")}</h2>
          <p className="mb-3 text-xs text-muted-foreground">{t("analytics.last14Days")}</p>
          <div className="h-40"><ResponsiveContainer width="100%" height="100%"><BarChart data={daily}><XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={11} /><Tooltip {...tip} cursor={{ fill: "var(--muted)" }} /><Bar dataKey="pages" fill="var(--chart-1)" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer></div>
        </Card>
        <Card>
          <h2 className="text-lg font-semibold">{t("analytics.weeklyConsistency")}</h2>
          <p className="mb-3 text-xs text-muted-foreground">{t("analytics.pagesPerWeek")}</p>
          <div className="h-40"><ResponsiveContainer width="100%" height="100%"><LineChart data={weekly}><XAxis dataKey="week" tickLine={false} axisLine={false} fontSize={11} /><Tooltip {...tip} /><Line type="monotone" dataKey="pages" stroke="var(--chart-2)" strokeWidth={3} dot={{ r: 3 }} /></LineChart></ResponsiveContainer></div>
          <div className="mt-3 grid grid-cols-8 gap-1">
            {weekly.map((w) => <div key={w.week} title={`${w.days}/7 days`} className="h-2 rounded-full bg-primary" style={{ opacity: 0.15 + (w.days / 7) * 0.85 }} />)}
          </div>
        </Card>
        <Card className="bg-accent/40">
          <h2 className="text-lg font-semibold">{t("analytics.insights")}</h2>
          <ul className="mt-2 space-y-2 text-sm">
            <li>
              {change >= 0 ? "📈" : "📉"} {t("analytics.progressSummary", {
                percent: Math.abs(change),
                direction: change >= 0 ? t("analytics.more") : t("analytics.less"),
              })}
            </li>
            <li>💚 {t("analytics.favoriteSummary", { liked, total: f.length })}</li>
            <li>
              ⭐ {t("analytics.ratingSummary", {
                recent: avg(recent).toFixed(1),
                older: avg(older).toFixed(1),
                status: avg(recent) >= avg(older) ? t("analytics.picksBetter") : t("analytics.tryGenres"),
              })}
            </li>
          </ul>
        </Card>
      </div>
    </AppShell>
  );
}
