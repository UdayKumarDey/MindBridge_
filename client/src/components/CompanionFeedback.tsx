import { AlertCircle, Loader2, ShieldCheck } from "lucide-react";
import React from "react";

type CompanionFeedbackProps = {
  isLoading?: boolean;
  hasHistoryError?: boolean;
  hasSendError?: boolean;
  showSafetyGuidance?: boolean;
  onOpenSupport?: () => void;
};

export function CompanionFeedback({
  isLoading = false,
  hasHistoryError = false,
  hasSendError = false,
  showSafetyGuidance = false,
  onOpenSupport,
}: CompanionFeedbackProps) {
  if (showSafetyGuidance) {
    return <section role="alert" className="rounded-2xl border border-[#E8C795] bg-[#FFF7EF] px-5 py-4 text-sm leading-6 text-[#704C1E]"><strong>You deserve support right now.</strong> If you may be in immediate danger, call your local emergency number. In the U.S. or Canada, call or text 988. <button className="font-bold underline" onClick={onOpenSupport}>Open support options</button></section>;
  }

  if (hasHistoryError || hasSendError) {
    const message = hasHistoryError ? "Your conversation history could not be loaded right now. Please refresh and try again." : "Your message could not be sent. Please try again.";
    return <section role="alert" className="flex items-start gap-3 rounded-2xl border border-[#F0D8B2] bg-[#FFF7EF] px-5 py-4 text-sm leading-6 text-[#875920]"><AlertCircle className="mt-0.5 size-4 shrink-0" />{message}</section>;
  }

  if (isLoading) {
    return <p role="status" aria-live="polite" className="inline-flex items-center gap-2 px-1 text-xs font-semibold text-[#707A9A]"><Loader2 className="size-3.5 animate-spin" /> MindBridge is responding…</p>;
  }

  return null;
}
