import { useState } from "react";
import { Star, ThumbsDown, ThumbsUp } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FEEDBACK_TAGS, useReading } from "@/lib/reading-store";
import { toast } from "sonner";

export function FinishDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const { state, finishCurrent } = useReading();
  const [liked, setLiked] = useState<boolean | null>(null);
  const [rating, setRating] = useState(0);
  const [tags, setTags] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const toggle = (t: string) => setTags((x) => (x.includes(t) ? x.filter((y) => y !== t) : [...x, t]));
  const submit = () => {
    const title = state.current?.title;
    finishCurrent({ liked: liked ?? rating >= 3, rating: rating || (liked ? 4 : 2), tags, notes: notes.slice(0, 1000) });
    toast.success(`Finished “${title}” 🎉`, { description: "Added to your history." });
    setLiked(null); setRating(0); setTags([]); setNotes("");
    onOpenChange(false);
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm rounded-2xl bg-card">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">You finished it!</DialogTitle>
          <DialogDescription>{state.current?.title}</DialogDescription>
        </DialogHeader>
        <div className="space-y-5">
          <div>
            <p className="mb-2 text-sm font-medium">Did you like this book?</p>
            <div className="flex gap-2">
              {[true, false].map((v) => (
                <button key={String(v)} onClick={() => setLiked(v)} className={`press flex flex-1 items-center justify-center gap-2 rounded-xl border py-2.5 text-sm ${liked === v ? "border-primary bg-accent text-accent-foreground" : ""}`}>
                  {v ? <ThumbsUp className="h-4 w-4" /> : <ThumbsDown className="h-4 w-4" />}{v ? "Yes" : "No"}
                </button>
              ))}
            </div>
            <div className="mt-3 flex justify-center gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} onClick={() => setRating(n)} aria-label={`${n} stars`} className="press p-1">
                  <Star className={`h-7 w-7 ${n <= rating ? "fill-clay text-clay" : "text-border"}`} />
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-sm font-medium">Why?</p>
            <div className="flex flex-wrap gap-2">
              {FEEDBACK_TAGS.map((t) => (
                <button key={t} onClick={() => toggle(t)} className={`press rounded-full border px-3 py-1 text-xs ${tags.includes(t) ? "border-primary bg-primary text-primary-foreground" : "bg-background"}`}>{t}</button>
              ))}
            </div>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={1000} placeholder="Optional notes…" className="mt-3 bg-background" />
          </div>
          <Button onClick={submit} disabled={liked === null && rating === 0} className="w-full rounded-xl">Save to history</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
