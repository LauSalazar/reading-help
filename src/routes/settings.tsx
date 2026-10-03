import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { AppShell, Card, PageHeader } from "@/components/AppShell";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { useReading } from "@/lib/reading-store";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Goals & Reminders — Bookmark" },
      { name: "description", content: "Set your daily reading goal and gentle reminders." },
      { property: "og:title", content: "Goals & Reminders — Bookmark" },
      { property: "og:description", content: "Set your daily reading goal and gentle reminders." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { state, updateSettings, reset } = useReading();
  const s = state.settings;
  return (
    <AppShell>
      <PageHeader eyebrow="Make it yours" title="Goals & reminders" />
      <div className="space-y-4">
        <Card>
          <h2 className="text-lg font-semibold">Daily goal</h2>
          <div className="mt-3 grid grid-cols-2 gap-2 rounded-xl bg-muted p-1">
            {(["pages", "minutes"] as const).map((t) => (
              <button key={t} onClick={() => updateSettings({ goalType: t, goalValue: t === "pages" ? 20 : 15 })} className={`press rounded-lg py-2 text-sm capitalize transition-colors ${s.goalType === t ? "bg-card font-medium shadow-soft" : "text-muted-foreground"}`}>{t}</button>
            ))}
          </div>
          <p className="mt-5 text-center font-display text-4xl font-semibold text-primary">{s.goalValue}<span className="ml-1 text-base text-muted-foreground">{s.goalType}/day</span></p>
          <Slider className="mt-4" min={5} max={s.goalType === "pages" ? 100 : 120} step={5} value={[s.goalValue]} onValueChange={([v]) => updateSettings({ goalValue: v })} />
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div><h2 className="text-lg font-semibold">Reading reminder</h2><p className="text-xs text-muted-foreground">Shown in the app at your chosen time</p></div>
            <Switch checked={s.remindersOn} onCheckedChange={(v) => updateSettings({ remindersOn: v })} />
          </div>
          <div className={`mt-4 space-y-3 transition-opacity ${s.remindersOn ? "" : "pointer-events-none opacity-50"}`}>
            <label className="block text-sm font-medium">Time<Input type="time" value={s.reminderTime} onChange={(e) => updateSettings({ reminderTime: e.target.value })} className="mt-1 rounded-xl bg-background" /></label>
            <label className="block text-sm font-medium">Message<Input value={s.reminderMessage} maxLength={120} onChange={(e) => updateSettings({ reminderMessage: e.target.value })} className="mt-1 rounded-xl bg-background" /></label>
            <Button variant="outline" className="press w-full rounded-xl" onClick={() => toast(s.reminderMessage, { description: "Preview of your reminder" })}>Preview reminder</Button>
          </div>
        </Card>
        <Button variant="ghost" className="w-full text-muted-foreground" onClick={() => { reset(); toast("Sample data restored"); }}>Reset to sample data</Button>
      </div>
    </AppShell>
  );
}
