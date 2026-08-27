import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createServer, type Server } from "node:http";

const dbMocks = vi.hoisted(() => ({
  createConversationMessage: vi.fn(),
  listConversation: vi.fn(),
  listCheckins: vi.fn(),
  upsertUser: vi.fn(),
  getUserByOpenId: vi.fn(),
  recordLoginActivity: vi.fn(),
}));

const llmMocks = vi.hoisted(() => ({
  invokeLLM: vi.fn(),
}));

vi.mock("./db", () => dbMocks);
vi.mock("./_core/llm", () => llmMocks);
vi.mock("./_core/context", () => ({
  createContext: () => ({
    user: {
      id: 7,
      openId: "http-route-test-user",
      name: "Route Test",
      email: "route@example.com",
      loginMethod: "oauth",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
  }),
}));

import { createMindBridgeApp } from "./createApp";

describe("wellbeing.chat.send HTTP route", () => {
  let server: Server;
  let baseUrl = "";

  beforeEach(async () => {
    vi.clearAllMocks();
    dbMocks.listConversation.mockResolvedValue([]);
    dbMocks.listCheckins.mockResolvedValue([]);
    dbMocks.createConversationMessage.mockResolvedValue({ id: 1 });
    llmMocks.invokeLLM.mockResolvedValue({
      choices: [{ message: { role: "assistant", content: "Missing your grandfather this week can feel especially sharp. What is one memory of him that feels close today?" } }],
    });
    server = createServer(createMindBridgeApp());
    await new Promise<void>(resolve => server.listen(0, "127.0.0.1", resolve));
    const address = server.address();
    const port = typeof address === "object" && address ? address.port : 0;
    baseUrl = `http://127.0.0.1:${port}`;
  });

  afterEach(async () => {
    await new Promise<void>(resolve => server.close(() => resolve()));
  });

  it("returns a reflection-mode response through the chat API and stores both messages", async () => {
    const response = await fetch(`${baseUrl}/api/trpc/wellbeing.chat.send?batch=1`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 0: { json: { message: "I miss my grandfather this week." } } }),
    });

    const payload = await response.json() as { result: { data: { json: { response: string; showSafetyGuidance: boolean } } } }[];

    expect(response.status).toBe(200);
    expect(payload[0]?.result.data.json.response).toContain("grandfather");
    expect(payload[0]?.result.data.json.showSafetyGuidance).toBe(false);
    expect(dbMocks.createConversationMessage).toHaveBeenNthCalledWith(1, 7, "user", "I miss my grandfather this week.");
    expect(dbMocks.createConversationMessage).toHaveBeenNthCalledWith(2, 7, "companion", expect.stringContaining("grandfather"), false);
  });
});
