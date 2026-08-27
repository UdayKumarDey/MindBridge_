import { AIChatBox, type Message } from "@/components/AIChatBox";
import { CompanionFeedback } from "@/components/CompanionFeedback";
import { ShieldCheck } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";

export default function Chat() {
  const utils = trpc.useUtils();
  const [, setLocation] = useLocation();
  const [showSupport, setShowSupport] = useState(false);
  const history = trpc.wellbeing.chat.history.useQuery();
  const send = trpc.wellbeing.chat.send.useMutation({
    onSuccess: async result => {
      if (result.showSafetyGuidance) setShowSupport(true);
      await utils.wellbeing.chat.history.invalidate();
      await utils.wellbeing.dashboard.invalidate();
    },
    onError: () => toast.error("Your message could not be sent. Please try again."),
  });
  const messages: Message[] = (history.data ?? []).map(entry => ({ role: entry.sender === "user" ? "user" : "assistant", content: entry.content }));

  return <div className="mx-auto max-w-4xl space-y-5"><section className="relative overflow-hidden rounded-[26px] bg-[#EEF0FF] px-6 py-6 sm:px-8"><div className="absolute -right-10 top-0 size-36 rounded-full bg-[#DADFFF]" /><div className="relative flex flex-wrap items-center justify-between gap-4"><div><p className="font-display text-2xl font-extrabold tracking-[-0.035em] text-[#303A77]">Talk it through</p><p className="mt-1 text-sm leading-6 text-[#56618F]">A calm place to name what’s on your mind, one thought at a time.</p></div><span className="inline-flex items-center gap-2 rounded-full border border-[#C9D0FA] bg-white/70 px-3 py-1.5 text-xs font-bold text-[#5466CC]"><ShieldCheck className="size-3.5" /> Safety guidance available</span></div></section>
    <CompanionFeedback showSafetyGuidance={showSupport} hasHistoryError={Boolean(history.error)} hasSendError={Boolean(send.error)} onOpenSupport={() => setLocation("/support")} />
    {history.isLoading ? <div className="h-[570px] animate-pulse rounded-[26px] bg-white" /> : history.error ? null : <AIChatBox messages={messages} onSendMessage={message => send.mutate({ message })} isLoading={send.isPending} height="min(64vh, 640px)" className="rounded-[26px] border-[#E7E8EF] shadow-[0_18px_50px_-25px_rgba(45,49,66,0.2)]" placeholder="Share what’s on your mind…" emptyStateMessage="There’s space for whatever you want to share." suggestedPrompts={["I need a moment to slow down.", "Help me sort through a busy thought.", "Can we do a grounding exercise?"]} />}
    <CompanionFeedback isLoading={send.isPending && !showSupport && !send.error} />
    <p className="px-1 text-xs leading-5 text-[#858B9A]">MindBridge is a wellbeing companion, not a replacement for professional care. <Link href="/support" className="font-semibold text-[#A85B12] hover:underline">View immediate support options</Link>.</p>
  </div>;
}
