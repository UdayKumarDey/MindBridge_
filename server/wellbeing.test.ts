import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

const dbMocks = vi.hoisted(() => ({
  createConversationMessage: vi.fn(),
  listConversation: vi.fn(),
  listLoginActivity: vi.fn(),
}));

const llmMocks = vi.hoisted(() => ({
  invokeLLM: vi.fn(),
}));

vi.mock("./db", () => ({
  ...dbMocks,
  listCheckins: vi.fn().mockResolvedValue([]),
  createCheckin: vi.fn(),
}));

vi.mock("./_core/llm", () => llmMocks);

import { appRouter } from "./routers";

function createContext(): TrpcContext {
  return {
    user: {
      id: 7,
      openId: "mindbridge-test-user",
      name: "MindBridge Test",
      email: "test@example.com",
      loginMethod: "oauth",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("wellbeing procedures", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    dbMocks.createConversationMessage.mockResolvedValue({ id: 1 });
    dbMocks.listConversation.mockResolvedValue([
      { id: 1, userId: 7, sender: "user", content: "Work has felt busy all week.", isSafetyGuidance: false, createdAt: new Date() },
    ]);
    llmMocks.invokeLLM.mockResolvedValue({
      choices: [{ message: { role: "assistant", content: "That sounds exhausting after a long week. Which part of work feels hardest to step away from tonight?" } }],
    });
  });

  it("persists a message and a model response grounded in recent conversation context", async () => {
    const caller = appRouter.createCaller(createContext());

    const result = await caller.wellbeing.chat.send({ message: "I feel overwhelmed today." });

    expect(result.showSafetyGuidance).toBe(false);
    expect(result.response).toContain("Which part of work");
    expect(llmMocks.invokeLLM).toHaveBeenCalledWith(expect.objectContaining({
      model: "gpt-5-mini",
      messages: expect.arrayContaining([
        expect.objectContaining({ content: "Work has felt busy all week." }),
        expect.objectContaining({ content: "I feel overwhelmed today." }),
      ]),
    }));
    expect(dbMocks.createConversationMessage).toHaveBeenNthCalledWith(1, 7, "user", "I feel overwhelmed today.");
    expect(dbMocks.createConversationMessage).toHaveBeenNthCalledWith(2, 7, "companion", result.response, false);
  });

  it("returns safety guidance for a high-risk phrase without calling the general companion model", async () => {
    const caller = appRouter.createCaller(createContext());

    const result = await caller.wellbeing.chat.send({ message: "I want to hurt myself." });

    expect(result.showSafetyGuidance).toBe(true);
    expect(result.response).toContain("immediate, human support");
    expect(llmMocks.invokeLLM).not.toHaveBeenCalled();
    expect(dbMocks.createConversationMessage).toHaveBeenNthCalledWith(2, 7, "companion", result.response, true);
  });

  it("uses a specific contextual fallback if the model is unavailable", async () => {
    llmMocks.invokeLLM.mockRejectedValue(new Error("service unavailable"));
    const caller = appRouter.createCaller(createContext());

    const result = await caller.wellbeing.chat.send({ message: "I have been so anxious about tomorrow." });

    expect(result.response).toContain("uncertain");
    expect(dbMocks.createConversationMessage).toHaveBeenNthCalledWith(2, 7, "companion", result.response, false);
  });

  it("returns recent sign-in activity for the authenticated user", async () => {
    const activity = [{ id: 4, userId: 7, eventType: "sign_in", loginMethod: "oauth", signedInAt: new Date() }];
    dbMocks.listLoginActivity.mockResolvedValue(activity);
    const caller = appRouter.createCaller(createContext());

    await expect(caller.auth.activity()).resolves.toEqual(activity);
    expect(dbMocks.listLoginActivity).toHaveBeenCalledWith(7);
  });
});
