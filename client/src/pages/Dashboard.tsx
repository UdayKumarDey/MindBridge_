import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { Cloud, CloudRain, CloudSun, Heart, Leaf, Loader2, ShieldCheck, Sparkles, Sun, TrendingUp } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { toast } from "sonner";

const moods = [
  { id: "sunny", label: "Clear", note: "Feeling open or steady", icon: Sun, color: "bg-[#FFF5D6] text-[#BE8616]" },
  { id: "partly_cloudy", label: "Mixed", note: "A little of everything", icon: CloudSun, color: "bg-[#EEF0FF] text-[#6372D2]" },
  { id: "overcast", label: "Heavy", note: "Low energy or unclear", icon: Cloud, color: "bg-[#F0F1F4] text-[#788092]" },
  { id: "rainy", label: "Rainy", note: "Needing softness today", icon: CloudRain, color: "bg-[#EAF3F8] text-[#4F7E9B]" },
] as const;

type Mood = (typeof moods)[number]["id"];

function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(new Date(date));
}

function formatSignIn(date: Date | string) {
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(date));
}

export default function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  const utils = trpc.useUtils();
  const [mood, setMood] = useState<Mood>("partly_cloudy");
  const [note, setNote] = useState("");
  const dashboard = trpc.wellbeing.dashboard.useQuery(undefined, { enabled: isAuthenticated });
  const createCheckin = trpc.wellbeing.checkins.create.useMutation({
    onSuccess: async () => {
      setNote("");
      await utils.wellbeing.dashboard.invalidate();
      await utils.wellbeing.checkins.invalidate();
      toast.success("Your check-in is saved.", { description: "Thank you for noticing what is here." });
    },
    onError: () => toast.error("Your check-in could not be saved. Please try again."),
  });
  const firstName = user?.name?.split(" ")[0] || "there";
  const latest = dashboard.data?.checkins[0];

  const saveCheckin = () => createCheckin.mutate({ mood, note: note.trim() || undefined });

  return (
    <div className="space-y-7">
      <section className="relative overflow-hidden rounded-[28px] bg-[#293254] px-6 py-7 text-white soft-shadow sm:px-8 lg:px-10 lg:py-9">
        <div className="absolute -right-16 -top-20 size-72 rounded-full bg-[#697AE8]/35 blur-2xl" />
        <div className="absolute -bottom-32 right-20 size-64 rounded-full bg-[#8AB29A]/25 blur-2xl" />
        <div className="relative max-w-2xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/90"><span className="size-1.5 rounded-full bg-[#A9D4B7]" /> Your private wellbeing space</div>
          <h1 className="font-display text-3xl font-extrabold tracking-[-0.045em] sm:text-4xl">Good to see you, {firstName}.</h1>
          <p className="mt-3 max-w-lg text-sm leading-6 text-[#E4E7FF] sm:text-base">There’s nothing to fix right now. This is simply a place to notice the weather within.</p>
        </div>
      </section>

      <div className="grid gap-7 xl:grid-cols-[minmax(0,1.45fr)_minmax(330px,0.8fr)]">
        <section className="rounded-[26px] border border-[#E8E8E2] bg-white p-5 soft-shadow sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div><p className="font-display text-xl font-extrabold tracking-[-0.03em]">What’s your emotional weather?</p><p className="mt-1 text-sm text-[#73798B]">Choose the closest feeling. There is no wrong answer.</p></div>
            {latest && <span className="rounded-full bg-[#F5F6F9] px-3 py-1.5 text-xs font-semibold text-[#747B8C]">Last check-in {formatDate(latest.createdAt)}</span>}
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {moods.map(({ id, label, note: moodNote, icon: Icon, color }) => (
              <button key={id} type="button" onClick={() => setMood(id)} className={`group relative rounded-2xl border p-4 text-left transition-all duration-200 ${mood === id ? "border-[#5B6EE1] bg-[#F8F9FF] shadow-[0_10px_22px_-18px_rgba(91,110,225,0.7)]" : "border-[#ECECE7] bg-white hover:border-[#BFC7F7] hover:bg-[#FBFBFF]"}`}>
                <span className={`mb-4 grid size-10 place-items-center rounded-xl ${color}`}><Icon className="size-5" /></span>
                <span className="block text-sm font-bold text-[#2D3142]">{label}</span>
                <span className="mt-1 block text-xs leading-4 text-[#858B99]">{moodNote}</span>
                {mood === id && <span className="absolute right-3 top-3 size-2 rounded-full bg-[#5B6EE1]" />}
              </button>
            ))}
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end"><div className="space-y-2"><Label htmlFor="checkin-note" className="text-xs font-bold text-[#646B7C]">A few words, if you’d like</Label><Input id="checkin-note" value={note} onChange={event => setNote(event.target.value)} maxLength={500} placeholder="What is taking up space today?" className="h-12 rounded-xl border-[#E6E7EC] bg-[#FCFCFB] px-4 text-sm placeholder:text-[#A0A5B2] focus-visible:ring-[#5B6EE1]" /></div><Button disabled={createCheckin.isPending} onClick={saveCheckin} className="h-12 rounded-xl bg-[#5B6EE1] px-6 font-bold hover:bg-[#4C5FCB]">{createCheckin.isPending ? <Loader2 className="size-4 animate-spin" /> : "Save check-in"}</Button></div>
          <p className="mt-4 text-xs leading-5 text-[#838999]"><Heart className="mr-1 inline size-3.5 text-[#E18F82]" />Your check-in is only visible in your account.</p>
        </section>

        <section className="rounded-[26px] border border-[#E8E8E2] bg-[#F3F8F4] p-5 leaf-shadow sm:p-7">
          <div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-white text-[#5E8D6B]"><Leaf className="size-5" /></span><div><p className="font-display text-lg font-extrabold tracking-[-0.025em]">A gentle nudge</p><p className="text-xs text-[#668172]">Small support for this moment</p></div></div>
          <p className="mt-5 text-sm leading-6 text-[#456152]">Before you move on, try noticing the contact of your feet with the floor. You do not have to change anything. Just notice.</p>
          <Link href="/library" className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#4A7A59] hover:underline">Choose a short practice <span aria-hidden>→</span></Link>
        </section>
      </div>

      <div className="grid gap-7 xl:grid-cols-[minmax(0,1.45fr)_minmax(330px,0.8fr)]">
        <section className="rounded-[26px] border border-[#E8E8E2] bg-white p-5 soft-shadow sm:p-7">
          <div className="flex items-start justify-between gap-4"><div><p className="font-display text-xl font-extrabold tracking-[-0.03em]">Your weather over time</p><p className="mt-1 text-sm text-[#73798B]">A gentle view, shaped only by your check-ins.</p></div><TrendingUp className="mt-1 size-5 text-[#7FA88F]" /></div>
          {dashboard.isLoading ? <div className="mt-8 h-48 animate-pulse rounded-2xl bg-[#F5F6F8]" /> : dashboard.error ? <div className="mt-7 rounded-2xl bg-[#FFF7EF] p-5 text-sm text-[#8A5B22]">Your weather history is taking a moment to load. Please refresh or try again soon.</div> : (dashboard.data?.checkins.length ?? 0) < 2 ? <div className="mt-7 grid min-h-48 place-items-center rounded-2xl border border-dashed border-[#DCDDE6] bg-[#FCFCFB] px-8 text-center"><div><span className="mx-auto grid size-11 place-items-center rounded-xl bg-[#EEF0FF] text-[#5B6EE1]"><CloudSun className="size-5" /></span><p className="mt-4 text-sm font-bold text-[#4F5668]">Your pattern will take shape here.</p><p className="mt-1 text-sm leading-5 text-[#838999]">Two or more check-ins help reveal a softer, longer view.</p></div></div> : <WeatherCurve checkins={dashboard.data!.checkins.slice(0, 8).reverse()} />}
        </section>
        <section className="rounded-[26px] border border-[#E8E8E2] bg-white p-5 soft-shadow sm:p-7"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-[#FFF1ED] text-[#D77A69]"><Sparkles className="size-5" /></span><div><p className="font-display text-lg font-extrabold tracking-[-0.025em]">Your next small step</p><p className="text-xs text-[#838999]">A few quiet minutes can be enough.</p></div></div><p className="mt-5 text-sm leading-6 text-[#555C6C]">Choose a reflection practice, or talk through what’s on your mind with the companion.</p><div className="mt-5 flex flex-wrap gap-2"><Link href="/library" className="rounded-xl bg-[#EEF7F0] px-3.5 py-2.5 text-xs font-bold text-[#4A7A59] hover:bg-[#E0F0E4]">Explore practices</Link><Link href="/chat" className="rounded-xl bg-[#EEF0FF] px-3.5 py-2.5 text-xs font-bold text-[#5265D8] hover:bg-[#E3E6FF]">Talk it through</Link></div></section>
      </div>
      {!dashboard.isLoading && !dashboard.error && dashboard.data?.loginActivity[0] && <section className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#E5E7ED] bg-white px-5 py-4 shadow-[0_10px_24px_-22px_rgba(45,49,66,0.45)]"><div className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-xl bg-[#EEF7F0] text-[#5A8A68]"><ShieldCheck className="size-4" /></span><div><p className="text-sm font-bold text-[#4D5566]">Your space is securely connected.</p><p className="mt-0.5 text-xs text-[#858B99]">Latest successful sign-in: {formatSignIn(dashboard.data.loginActivity[0].signedInAt)}</p></div></div><span className="rounded-full bg-[#F3F8F4] px-3 py-1.5 text-xs font-bold text-[#5B8165]">Sign-in saved</span></section>}
    </div>
  );
}

function WeatherCurve({ checkins }: { checkins: { id: number; mood: Mood; createdAt: Date }[] }) {
  const scores: Record<Mood, number> = { sunny: 84, partly_cloudy: 63, overcast: 43, rainy: 27 };
  const points = checkins.map((entry, index) => `${10 + index * (80 / Math.max(checkins.length - 1, 1))},${96 - scores[entry.mood] * 0.72}`).join(" ");
  return <div className="mt-7"><div className="relative h-48 rounded-2xl bg-[linear-gradient(180deg,#F8FBF9_0%,#FFFFFF_100%)] p-4"><svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full overflow-visible" aria-label="Emotional weather trend"><defs><linearGradient id="area" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#7FA88F" stopOpacity="0.22" /><stop offset="100%" stopColor="#7FA88F" stopOpacity="0" /></linearGradient></defs><path d={`M 10 100 L ${points.replaceAll(" ", " L ")} L 90 100 Z`} fill="url(#area)" /><polyline points={points} fill="none" stroke="#6F9F7E" strokeWidth="2.4" vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" />{checkins.map((entry, index) => { const x = 10 + index * (80 / Math.max(checkins.length - 1, 1)); const y = 96 - scores[entry.mood] * 0.72; return <circle key={entry.id} cx={x} cy={y} r="2.4" fill="#FFFFFF" stroke="#6F9F7E" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />; })}</svg></div><div className="mt-3 flex justify-between text-[11px] font-medium text-[#9499A7]"><span>{formatDate(checkins[0].createdAt)}</span><span>Today</span></div></div>;
}
