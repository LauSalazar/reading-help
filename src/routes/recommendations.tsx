import { createFileRoute } from "@tanstack/react-router";
import { Plus, Check } from "lucide-react";
import { toast } from "sonner";
import { AppShell, Card, Cover, PageHeader } from "@/components/AppShell";
import { useTranslation } from "@/lib/i18n";
import { useReading, type Book } from "@/lib/reading-store";

export const Route = createFileRoute("/recommendations")({
  head: () => ({
    meta: [
      { title: "Recommended for You — Bookmark" },
      { name: "description", content: "Book suggestions shaped by what you loved and what you didn't." },
      { property: "og:title", content: "Recommended for You — Bookmark" },
      { property: "og:description", content: "Book suggestions shaped by what you loved and what you didn't." },
    ],
  }),
  component: Recs,
});

const CATALOG = [
  { title: "Piranesi", author: "Susanna Clarke", genres: ["fantasy", "literary"], blurb: "A labyrinth house of tides and statues." },
  { title: "The Hidden Life of Trees", author: "Peter Wohlleben", genres: ["nature", "nonfiction"], blurb: "How forests talk, share and remember." },
  { title: "Never Let Me Go", author: "Kazuo Ishiguro", genres: ["literary", "sci-fi"], blurb: "Quiet, devastating, unforgettable." },
  { title: "The Martian", author: "Andy Weir", genres: ["sci-fi", "adventure"], blurb: "Science your way off Mars." },
  { title: "Gathering Moss", author: "Robin Wall Kimmerer", genres: ["nature", "essays"], blurb: "Small plants, big wisdom." },
  { title: "Deep Work", author: "Cal Newport", genres: ["self-help", "nonfiction"], blurb: "Focus in a distracted world." },
  { title: "A Psalm for the Wild-Built", author: "Becky Chambers", genres: ["sci-fi", "nature"], blurb: "A cozy robot-and-monk road trip." },
  { title: "The Hobbit", author: "J.R.R. Tolkien", genres: ["fantasy", "classic"], blurb: "There and back again." },
  { title: "The Miracle Morning", author: "Hal Elrod", genres: ["self-help"], blurb: "Six habits before 8am." },
  { title: "Station Eleven", author: "Emily St. John Mandel", genres: ["literary", "sci-fi"], blurb: "Art survives the end of the world." },
];

function recommend(finished: Book[], exclude: Set<string>) {
  return CATALOG.filter((c) => !exclude.has(c.title.toLowerCase()))
    .map((c) => {
      let score = 0; let because: Book | undefined; let best = 0;
      for (const b of finished) {
        const overlap = b.genres.filter((g) => c.genres.includes(g)).length + (b.author === c.author ? 1 : 0);
        if (!overlap) continue;
        const w = ((b.rating ?? 3) - 3) * overlap;
        score += w;
        if (w > best) { best = w; because = b; }
      }
      return { ...c, score, because };
    })
    .filter((c) => c.score > 0 && c.because)
    .sort((a, b) => b.score - a.score);
}

function Recs() {
  const { state, addWish } = useReading();
  const { t } = useTranslation();
  const ex = new Set([...state.finished, ...(state.current ? [state.current] : [])].map((b) => b.title.toLowerCase()));
  const wished = new Set(state.wishlist.map((w) => w.title.toLowerCase()));
  const recs = recommend(state.finished, ex);
  const disliked = state.finished.filter((b) => b.liked === false);

  return (
    <AppShell>
      <PageHeader eyebrow={t("recs.eyebrow")} title={t("recs.title")} />
      {disliked.length > 0 && (
        <p className="mb-4 rounded-xl bg-muted px-4 py-3 text-xs text-muted-foreground">{t("recs.steering", { titles: disliked.map((b) => `“${b.title}”`).join(", ") })}</p>
      )}
      <div className="space-y-3">
        {recs.map((r) => {
          const added = wished.has(r.title.toLowerCase());
          return (
            <Card key={r.title} className="p-4">
              <div className="flex gap-4">
                <Cover title={r.title} />
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg font-semibold leading-tight">{r.title}</h2>
                  <p className="text-sm text-muted-foreground">{r.author}</p>
                  <p className="mt-1 text-sm">{r.blurb}</p>
                  <span className="mt-2 inline-block rounded-full bg-accent px-2.5 py-0.5 text-[11px] font-medium text-accent-foreground">{t("recs.becauseYouEnjoyed", { title: r.because!.title })}</span>
                </div>
                <button disabled={added} aria-label={t("recs.addToNextUp")} onClick={() => { addWish(r.title, r.author); toast.success(t("home.addedToNextUp")); }} className={`press h-9 w-9 shrink-0 self-start rounded-full border flex items-center justify-center ${added ? "bg-primary text-primary-foreground" : "text-primary"}`}>
                  {added ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                </button>
              </div>
            </Card>
          );
        })}
        {recs.length === 0 && <p className="text-sm text-muted-foreground">{t("recs.rateMore")}</p>}
      </div>
    </AppShell>
  );
}
