import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { ArrowRight, Brain, Heart, Leaf, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";

const tones = [
  { id: "reflect", icon: Heart, label: "Just listen", text: "A spacious place to put words to what you’re carrying." },
  { id: "mindful", icon: Leaf, label: "Mindfulness", text: "Gentle invitations to pause, notice, and come back to the present." },
  { id: "practical", icon: Brain, label: "Practical reflection", text: "Kind, structured prompts for sorting through a busy thought." },
];

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(1);
  const [tone, setTone] = useState("reflect");
  const [privacyChecked, setPrivacyChecked] = useState(false);
  const finish = () => {
    localStorage.setItem("mindbridge-tone", tone);
    localStorage.setItem("mindbridge-onboarded", "true");
    setLocation("/dashboard");
  };

  return <div className="mx-auto max-w-3xl py-2 sm:py-7"><div className="rounded-[28px] border border-[#E8E8E2] bg-white p-6 soft-shadow sm:p-9"><div className="flex items-center justify-between gap-5"><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-[#6B7EE1]">A few gentle choices</p><h1 className="mt-2 font-display text-2xl font-extrabold tracking-[-0.04em] sm:text-3xl">Settle into your space</h1></div><span className="rounded-full bg-[#F4F5FA] px-3 py-1.5 text-xs font-bold text-[#7B8190]">Step {step} of 2</span></div><div className="mt-7 h-1.5 overflow-hidden rounded-full bg-[#EFF0F3]"><div className="h-full rounded-full bg-[#7FA88F] transition-all duration-300" style={{ width: `${step * 50}%` }} /></div>
    {step === 1 ? <div className="mt-9"><p className="font-display text-xl font-extrabold tracking-[-0.03em]">How would you like MindBridge to show up?</p><p className="mt-2 text-sm leading-6 text-[#73798B]">You can change this anytime. It simply helps us begin in a way that feels closer to you.</p><div className="mt-6 grid gap-3">{tones.map(({ id, icon: Icon, label, text }) => <button key={id} onClick={() => setTone(id)} className={cn("flex items-start gap-4 rounded-2xl border p-4 text-left transition-colors", tone === id ? "border-[#5B6EE1] bg-[#F8F9FF]" : "border-[#E9E9E5] hover:border-[#C7CEF7]")}><span className={cn("grid size-10 shrink-0 place-items-center rounded-xl", tone === id ? "bg-[#5B6EE1] text-white" : "bg-[#F5F6F9] text-[#707A9A]")}><Icon className="size-5" /></span><span><span className="block text-sm font-extrabold text-[#34394B]">{label}</span><span className="mt-1 block text-sm leading-5 text-[#73798B]">{text}</span></span></button>)}</div><Button onClick={() => setStep(2)} className="mt-7 h-12 rounded-xl bg-[#5B6EE1] px-6 font-bold hover:bg-[#4C5FCB]">Continue <ArrowRight className="ml-2 size-4" /></Button></div> : <div className="mt-9"><span className="grid size-12 place-items-center rounded-2xl bg-[#EEF7F0] text-[#5A8A68]"><ShieldCheck className="size-6" /></span><p className="mt-5 font-display text-xl font-extrabold tracking-[-0.03em]">Your space is yours.</p><p className="mt-2 text-sm leading-6 text-[#73798B]">Your check-ins and conversations stay connected to your account. MindBridge is a wellbeing companion, not a therapy or emergency service.</p><div className="mt-6 flex items-start gap-3 rounded-2xl bg-[#F8F8F6] p-4"><Checkbox id="privacy-consent" checked={privacyChecked} onCheckedChange={checked => setPrivacyChecked(checked === true)} /><Label htmlFor="privacy-consent" className="cursor-pointer text-sm leading-6 text-[#555C6C]">I understand that I can use the <strong>Support</strong> space whenever I need immediate human help.</Label></div><div className="mt-7 flex flex-wrap gap-3"><Button disabled={!privacyChecked} onClick={finish} className="h-12 rounded-xl bg-[#5B6EE1] px-6 font-bold hover:bg-[#4C5FCB]">Enter my space <ArrowRight className="ml-2 size-4" /></Button><Button variant="ghost" onClick={() => setStep(1)} className="h-12 rounded-xl px-4 font-bold text-[#697083]">Back</Button></div></div>}
  </div></div>;
}
