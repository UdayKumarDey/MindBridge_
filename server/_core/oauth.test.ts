import express from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { encodeOAuthState, OAUTH_STATE_COOKIE } from "../../shared/const";

const dbMocks = vi.hoisted(() => ({
  getUserByOpenId: vi.fn(),
  recordLoginActivity: vi.fn(),
  upsertUser: vi.fn(),
}));

const sdkMocks = vi.hoisted(() => ({
  createSessionToken: vi.fn(),
  exchangeCodeForToken: vi.fn(),
  getUserInfo: vi.fn(),
}));

vi.mock("../db", () => dbMocks);
vi.mock("./sdk", () => ({ sdk: sdkMocks }));
vi.mock("./cookies", () => ({
  getSessionCookieOptions: vi.fn().mockReturnValue({ httpOnly: true, secure: true }),
}));

import { registerOAuthRoutes } from "./oauth";

type ResponseSpy = {
  clearCookie: ReturnType<typeof vi.fn>;
  cookie: ReturnType<typeof vi.fn>;
  json: ReturnType<typeof vi.fn>;
  redirect: ReturnType<typeof vi.fn>;
  status: ReturnType<typeof vi.fn>;
};

function getCallbackHandler() {
  const app = express();
  registerOAuthRoutes(app);
  type ExpressLayer = { route?: { path?: string; stack: Array<{ handle: Function }> } };
  const stack = (app as unknown as { _router: { stack: ExpressLayer[] } })._router.stack;
  const layer = stack.find(item => item.route?.path === "/api/oauth/callback");
  if (!layer?.route) throw new Error("OAuth callback route was not registered");
  return layer.route.stack[0].handle;
}

function createResponse(): ResponseSpy {
  const response = {} as ResponseSpy;
  response.status = vi.fn().mockReturnValue(response);
  response.json = vi.fn().mockReturnValue(response);
  response.clearCookie = vi.fn().mockReturnValue(response);
  response.cookie = vi.fn().mockReturnValue(response);
  response.redirect = vi.fn().mockReturnValue(response);
  return response;
}

describe("OAuth callback", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sdkMocks.exchangeCodeForToken.mockResolvedValue({ accessToken: "access-token" });
    sdkMocks.getUserInfo.mockResolvedValue({
      openId: "oauth-user-22",
      name: "Test Member",
      email: "member@example.com",
      loginMethod: "oauth",
    });
    sdkMocks.createSessionToken.mockResolvedValue("session-token");
    dbMocks.getUserByOpenId.mockResolvedValue({ id: 22, openId: "oauth-user-22" });
  });

  it("updates the user profile and records one durable sign-in event", async () => {
    const handler = getCallbackHandler();
    const response = createResponse();
    const state = encodeOAuthState({ redirectUri: "https://example.com/api/oauth/callback", nonce: "safe-nonce" });
    const request = {
      query: { code: "authorization-code", state },
      headers: { cookie: `${OAUTH_STATE_COOKIE}=safe-nonce` },
    };

    await handler(request, response);

    expect(dbMocks.upsertUser).toHaveBeenCalledWith(expect.objectContaining({
      openId: "oauth-user-22",
      email: "member@example.com",
      loginMethod: "oauth",
    }));
    expect(dbMocks.recordLoginActivity).toHaveBeenCalledWith(22, "oauth");
    expect(response.redirect).toHaveBeenCalledWith(302, "/");
  });
});
