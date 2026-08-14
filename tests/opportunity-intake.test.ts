import { describe, expect, it } from "vitest";
import { buildOpportunityCreateInput } from "../lib/opportunity-intake";

describe("buildOpportunityCreateInput", () => {
  it("rejects a missing venue", () => {
    const result = buildOpportunityCreateInput({ venueId: "  ", sourceType: "manual" });
    expect(result).toEqual({ error: "Choose a venue for this opportunity." });
  });

  it("rejects a missing source type", () => {
    const result = buildOpportunityCreateInput({ venueId: "venue_1", sourceType: "  " });
    expect(result).toEqual({ error: "Choose how this opportunity was discovered." });
  });

  it("rejects an invalid status", () => {
    const result = buildOpportunityCreateInput({ venueId: "venue_1", sourceType: "manual", status: "NOT_A_REAL_STATUS" });
    expect(result).toEqual({ error: "Invalid opportunity status." });
  });

  it("rejects an unparseable proposed date", () => {
    const result = buildOpportunityCreateInput({ venueId: "venue_1", sourceType: "manual", proposedDate: "not-a-date" });
    expect(result).toEqual({ error: "Proposed date is not valid." });
  });

  it("defaults status to LEAD and omits proposed dates when none given", () => {
    const result = buildOpportunityCreateInput({ venueId: "venue_1", sourceType: "manual" });
    expect("error" in result).toBe(false);
    if ("error" in result) return;
    expect(result.data.status).toBe("LEAD");
    expect(result.data.proposedDates).toBeNull();
    expect(result.data.contactId).toBeNull();
  });

  it("builds a clean payload with a proposed date and contact", () => {
    const result = buildOpportunityCreateInput({ venueId: "venue_1", contactId: "contact_1", sourceType: "venue_website", status: "READY_FOR_OUTREACH", proposedDate: "2026-09-01T19:00:00.000Z", notes: "Found via their booking page." });
    expect("error" in result).toBe(false);
    if ("error" in result) return;
    expect(result.data.status).toBe("READY_FOR_OUTREACH");
    expect(result.data.contactId).toBe("contact_1");
    expect(JSON.parse(result.data.proposedDates as string)).toEqual(["2026-09-01T19:00:00.000Z"]);
  });
});
