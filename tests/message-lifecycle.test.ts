import { describe, expect, it } from "vitest";
import { assertMessageTransition } from "../lib/message-lifecycle";

describe("outreach draft guardrail", () => {
  it("does not permit a message to skip directly from draft to sent", () => {
    expect(() => assertMessageTransition("draft", "sent")).toThrow("Draft → Review → Approve → Send");
  });
  it("permits the explicit draft, approval, then sent sequence", () => {
    expect(() => assertMessageTransition("draft", "approved")).not.toThrow();
    expect(() => assertMessageTransition("approved", "sent")).not.toThrow();
  });
});
