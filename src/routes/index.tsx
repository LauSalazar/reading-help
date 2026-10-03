import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Flame, Plus, X, BookMarked } from "lucide-react";
import { toast } from "sonner";
import { AppShell, Card, Cover } from "@/components/AppShell";
import { FinishDialog } from "@/components/FinishDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { streak, todayProgress, useReading } from "@/lib/reading-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Bookmark — Your cozy reading companion" },
      { name: "description", content: "Track your current book, daily reading goal and next reads." },
      { property: "og:title", content: "Bookmark — Your cozy reading companion" },
      { property: "og:description", content: "Track your current book, daily reading goal and next reads." },
    ],
  }),
  component: Home,
});

function Ring({ pct, done }: { pct: number; done: boolean }) {
  const r = 30, c = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 72 72" className="h-20 w-20 -rotate-90">
      <circle cx="36" cy="36" r={r} className="fill-none stroke-muted" strokeWidth="7" />
      <circle cx="36" cy="36" r={r} className={`fill-none transition-all duration-700 ${done ? "stroke-primary" : "stroke-clay"}`} strokeWidth="7" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - Math.min(pct, 1))} />
    </svg>
  );
}

function Home() {
  const { state, updatePage, checkIn, addWish, removeWish, startReading } = useReading();
  const [page, setPage] = useState("");
  const [finishOpen, setFinishOpen] = useState(false);
  const [wTitle, setWTitle] = useState("");
  const [wAuthor, setWAuthor] = useState("");
  const b = state.current;
  const pct = b ? Math.round((b.currentPage / b.totalPages) * 100) : 0;
  const tp = todayProgress(state);
  const unit = state.settings.goalType;

  const submitPage = () => {
    const n = parseInt(page, 10);
    if (!b || Number.isNaN(n)) return;
    updatePage(n);
    setPage("");
    if (n >= b.totalPages) setFinishOpen(true);
    else toast.success(`Page ${Math.min(n, b.totalPages)} logged`, { description: "Nice progress ✨" });
  };

  return (
    <AppShell>
      <header className="mb-6 flex items-end justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Good to see you</p>
          <h1 className="mt-1 text-3xl font-semibold">Your reading nook</h1>
        </div>
        <span className="flex items-center gap-1 rounded-full bg-accent px-3 py-1 text-sm font-medium text-accent-foreground"><Flame className="h-4 w-4" />{streak(state)}d</span>
      </header>

      <div className="space-y-4">
        <Card>
          <p className="mb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground">Currently reading</p>
          {b ? (
            <>
              <div className="flex gap-4">
                <Cover title={b.title} size="lg" />
                <div className="flex min-w-0 flex-1 flex-col">
                  <h2 className="text-xl font-semibold leading-tight">{b.title}</h2>
                  <p className="text-sm text-muted-foreground">{b.author}</p>
                  <div className="mt-auto">
                    <div className="mb-1 flex justify-between text-sm"><span>p. {b.currentPage} / {b.totalPages}</span><span className="font-semibold text-primary">{pct}%</span></div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary transition-all duration-700" style={{ width: `${pct}%` }} /></div>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <Input type="number" inputMode="numeric" placeholder="Current page" value={page} onChange={(e) => setPage(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submitPage()} className="rounded-xl bg-background" />
                <Button onClick={submitPage} className="press rounded-xl">Update page</Button>
              </div>
              <button onClick={() => setFinishOpen(true)} className="mt-3 w-full text-center text-sm text-muted-foreground underline-offset-4 hover:underline">Mark as finished</button>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">No book in progress. Start one from your Next Up list below.</p>
          )}
        </Card>

        <Card className={tp.done ? "border-primary/40 bg-accent/40" : ""}>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Ring pct={tp.val / tp.goal} done={tp.done} />
              <span className="absolute inset-0 flex items-center justify-center text-sm font-semibold">{tp.done ? <Check className="h-6 w-6 text-primary animate-scale-in" /> : `${Math.round((tp.val / tp.goal) * 100)}%`}</span>
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Daily goal</p>
              <p className="font-display text-lg">Read {tp.goal} {unit} today</p>
              <p className="text-sm text-muted-foreground">{tp.val} of {tp.goal} {unit}{tp.done && " · Goal complete!"}</p>
            </div>
          </div>
          <Button variant={state.checkedIn[new Date().toISOString().slice(0, 10)] ? "secondary" : "outline"} onClick={() => { checkIn(); }} className="press mt-4 w-full rounded-xl">
            <Check className="h-4 w-4" />{state.checkedIn[new Date().toISOString().slice(0, 10)] ? "Checked in today" : "Check in for today"}
          </Button>
        </Card>

        <Card>
          <p className="mb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground">Next up</p>
          <ul className="space-y-2">
            {state.wishlist.map((w) => (
              <li key={w.id} className="flex animate-fade-in items-center gap-3 rounded-xl bg-background p-2">
                <Cover title={w.title} size="sm" />
                <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{w.title}</p>{w.author && <p className="truncate text-xs text-muted-foreground">{w.author}</p>}</div>
                {!b && <button aria-label="Start reading" onClick={() => { startReading(w.id, 300); toast.success(`Started “${w.title}”`); }} className="press rounded-full p-2 text-primary"><BookMarked className="h-4 w-4" /></button>}
                <button aria-label="Remove" onClick={() => removeWish(w.id)} className="press rounded-full p-2 text-muted-foreground"><X className="h-4 w-4" /></button>
              </li>
            ))}
            {state.wishlist.length === 0 && <li className="text-sm text-muted-foreground">Your list is empty.</li>}
          </ul>
          <form className="mt-3 space-y-2" onSubmit={(e) => { e.preventDefault(); const t = wTitle.trim().slice(0, 120); if (!t) return; addWish(t, wAuthor.trim().slice(0, 80) || undefined); setWTitle(""); setWAuthor(""); }}>
            <Input value={wTitle} onChange={(e) => setWTitle(e.target.value)} placeholder="Book title" maxLength={120} className="rounded-xl bg-background" />
            <div className="flex gap-2">
              <Input value={wAuthor} onChange={(e) => setWAuthor(e.target.value)} placeholder="Author (optional)" maxLength={80} className="rounded-xl bg-background" />
              <Button type="submit" size="icon" className="press shrink-0 rounded-xl" aria-label="Add"><Plus className="h-4 w-4" /></Button>
            </div>
          </form>
        </Card>
      </div>
      <FinishDialog open={finishOpen} onOpenChange={setFinishOpen} />
    </AppShell>
  );
}
