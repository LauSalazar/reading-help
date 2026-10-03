import { createFileRoute } from "@tanstack/react-router";
import { Star, ThumbsDown, ThumbsUp } from "lucide-react";
import { AppShell, Card, Cover, PageHeader } from "@/components/AppShell";
import { POSITIVE_TAGS, useReading } from "@/lib/reading-store";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "Reading History — Bookmark" },
      { name: "description", content: "Every book you've finished, with your ratings and notes." },
      { property: "og:title", content: "Reading History — Bookmark" },
      { property: "og:description", content: "Every book you've finished, with your ratings and notes." },
    ],
  }),
  component: HistoryPage,
});

function HistoryPage() {
  const { state } = useReading();
  return (
    <AppShell>
      <PageHeader eyebrow={`${state.finished.length} books finished`} title="Your shelf" />
      <div className="space-y-3">
        {state.finished.map((b) => (
          <Card key={b.id} className="p-4">
            <div className="flex gap-4">
              <Cover title={b.title} />
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0"><h2 className="truncate text-lg font-semibold">{b.title}</h2><p className="text-sm text-muted-foreground">{b.author}</p></div>
                  {b.liked ? <ThumbsUp className="h-4 w-4 shrink-0 text-primary" /> : <ThumbsDown className="h-4 w-4 shrink-0 text-clay" />}
                </div>
                <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="flex">{[1, 2, 3, 4, 5].map((n) => <Star key={n} className={`h-3.5 w-3.5 ${n <= (b.rating ?? 0) ? "fill-clay text-clay" : "text-border"}`} />)}</span>
                  <span>· {new Date(b.finishedAt!).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</span>
                </div>
                {!!b.tags?.length && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {b.tags.map((t) => <span key={t} className={`rounded-full px-2 py-0.5 text-[11px] ${POSITIVE_TAGS.has(t) ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"}`}>{t}</span>)}
                  </div>
                )}
                {b.notes && <p className="mt-2 text-sm italic text-muted-foreground">“{b.notes}”</p>}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
