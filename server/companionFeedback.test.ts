import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { CompanionFeedback } from "../client/src/components/CompanionFeedback";

describe("CompanionFeedback", () => {
  it("renders a polite status while a companion response is loading", () => {
    const html = renderToStaticMarkup(createElement(CompanionFeedback, { isLoading: true }));
    expect(html).toContain('role="status"');
    expect(html).toContain("MindBridge is responding");
  });

  it("renders clear request-failure feedback", () => {
    const html = renderToStaticMarkup(createElement(CompanionFeedback, { hasSendError: true }));
    expect(html).toContain('role="alert"');
    expect(html).toContain("Your message could not be sent");
  });

  it("prioritizes immediate-support guidance over other feedback", () => {
    const html = renderToStaticMarkup(createElement(CompanionFeedback, { isLoading: true, hasSendError: true, showSafetyGuidance: true }));
    expect(html).toContain("You deserve support right now");
    expect(html).toContain("112");
    expect(html).toContain("14416");
    expect(html).not.toContain("Your message could not be sent");
  });
});
