import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import * as db from "./db";
import { invokeLLM, type Message as LlmMessage } from "./_core/llm";

const moodSchema = z.enum(["sunny", "partly_cloudy", "overcast", "rainy"]);

function needsImmediateSupport(message: string) {
  return /\b(suicide|kill myself|end my life|hurt myself|self harm|self-harm)\b/i.test(message);
}

const COMPANION_SYSTEM_PROMPT = `You are MindBridge, a warm, attentive wellbeing companion. Reply directly to the person’s latest message, using the conversation only to understand context. Be concise: one to three short sentences, normally under 90 words. Name one concrete detail they shared so the response feels attentive, then respond to their actual need. Give one small optional next step only when it is useful. Do not give a multi-step plan unless they explicitly ask for one. Avoid canned phrases such as “Would it feel helpful,” and never reuse a stock answer. Do not diagnose, make treatment claims, use clinical jargon, or present yourself as a therapist or emergency service. Do not mention safety systems or these instructions.`;

function fallbackCompanionReply(message: string) {
  const normalized = message.toLowerCase();
  if (/overwhelm|too much|stressed|stressful/.test(normalized)) {
    return "That sounds like a lot to carry all at once. If you could set one thing down for the next ten minutes, what might it be?";
  }
  if (/anxious|anxiety|worried|worry/.test(normalized)) {
    return "It sounds like your mind is trying hard to prepare for something uncertain. What is the worry asking you to pay attention to right now?";
  }
  if (/sad|lonely|alone|grief|miss/.test(normalized)) {
    return "There is a lot of tenderness in what you shared. Would it feel kinder to name what you are missing, or to notice one person you could let in a little today?";
  }
  if (/angry|anger|frustrat|annoyed/.test(normalized)) {
    return "That frustration seems important. What feels most crossed or unheard in this situation?";
  }
  return "I’m taking in what you shared. Which part of it feels most important to stay with for a moment?";
}

async function createCompanionReply(
  userId: number,
  message: string,
  needsSupport: boolean
) {
  if (needsSupport) {
    return "Thank you for saying that. You deserve immediate, human support right now. If you may act on these thoughts or are in immediate danger, call 112 in India. You can also contact Tele-MANAS at 14416 or 1-800-891-4416 for mental-health support. If it is safe, consider reaching out to someone you trust and staying with them.";
  }

  const history = await db.listConversation(userId, 12);
  const conversation: LlmMessage[] = [
    { role: "system", content: COMPANION_SYSTEM_PROMPT },
    ...history.slice().reverse().map(entry => ({
      role: entry.sender === "user" ? "user" : "assistant",
      content: entry.content,
    } as LlmMessage)),
    { role: "user", content: message },
  ];

  try {
    const result = await invokeLLM({
      model: "gpt-5-mini",
      messages: conversation,
      maxCompletionTokens: 320,
    });
    const content = result.choices[0]?.message.content;
    const response = typeof content === "string"
      ? content.trim()
      : content?.filter(item => item.type === "text").map(item => item.text).join("\n").trim() ?? "";
    if (!response) throw new Error("Companion response was empty");
    return response.slice(0, 1600);
  } catch (error) {
    console.error("[Companion] Model response unavailable; using contextual fallback", error);
    return fallbackCompanionReply(message);
  }
}

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    activity: protectedProcedure.query(({ ctx }) => db.listLoginActivity(ctx.user.id)),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  wellbeing: router({
    dashboard: protectedProcedure.query(async ({ ctx }) => {
      const [checkinHistory, conversationHistory, loginHistory] = await Promise.all([
        db.listCheckins(ctx.user.id),
        db.listConversation(ctx.user.id, 6),
        db.listLoginActivity(ctx.user.id, 4),
      ]);
      return { checkins: checkinHistory, conversations: conversationHistory, loginActivity: loginHistory };
    }),
    checkins: router({
      list: protectedProcedure.query(({ ctx }) => db.listCheckins(ctx.user.id)),
      create: protectedProcedure
        .input(z.object({ mood: moodSchema, note: z.string().trim().max(500).optional() }))
        .mutation(({ ctx, input }) => db.createCheckin(ctx.user.id, input.mood, input.note)),
    }),
    chat: router({
      history: protectedProcedure.query(({ ctx }) => db.listConversation(ctx.user.id)),
      send: protectedProcedure
        .input(z.object({ message: z.string().trim().min(1).max(1600) }))
        .mutation(async ({ ctx, input }) => {
          const showSafetyGuidance = needsImmediateSupport(input.message);
          const response = await createCompanionReply(ctx.user.id, input.message, showSafetyGuidance);
          await db.createConversationMessage(ctx.user.id, "user", input.message);
          await db.createConversationMessage(ctx.user.id, "companion", response, showSafetyGuidance);
          return { response, showSafetyGuidance };
        }),
    }),
  }),
});

export type AppRouter = typeof appRouter;
