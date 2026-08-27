import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { CompanionFeedback } from "./CompanionFeedback";

describe("CompanionFeedback", () => {
  it("renders a polite status while a companion response is loading", () => {
    const html = renderToStaticMarkup(<CompanionFeedback isLoading />);
    expect(html).toContain('role="status"');
    expect(html).toContain("MindBridge is responding");
  });

  it("renders clear request failure feedback", () => {
    const html = renderToStaticMarkup(<CompanionFeedback hasSendError />);
    expect(html).toContain('role="alert"');
    expect(html).toContain("Your message could not be sent");
  });

  it("prioritizes immediate-support guidance over other feedback", () => {
    const html = renderToStaticMarkup(<CompanionFeedback isLoading hasSendError showSafetyGuidance />);
    expect(html).toContain("You deserve support right now");
    expect(html).not.toContain("Your message could not be sent");
  });
});
