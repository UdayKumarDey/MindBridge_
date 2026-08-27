import { describe, expect, it, vi } from "vitest";

const appMock = vi.hoisted(() => vi.fn());

vi.mock("./createApp", () => ({
  createMindBridgeApp: () => appMock,
}));

import handler from "../api/index";

describe("Vercel API handler", () => {
  it("delegates an incoming serverless request to the MindBridge Express app", () => {
    const request = {};
    const response = {};

    handler(request as never, response as never);

    expect(appMock).toHaveBeenCalledWith(request, response);
  });
});
