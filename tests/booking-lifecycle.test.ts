import { describe, expect, it } from "vitest";
import { ensureBookingForOpportunity, scoreOpportunity } from "../lib/booking-lifecycle";

describe("booking lifecycle", () => {
  it("creates a booking automatically once an opportunity reaches DATE_PROPOSED", async () => {
    const create = async ({ data }: { data: Record<string, unknown> }) => ({ id: "booking-1", ...data });
    const db = {
      opportunity: { findUnique: async () => ({ id: "opportunity-1", artistId: "artist-1", venueId: "venue-1", contactId: "contact-1", status: "DATE_PROPOSED", booking: null, venue: { address: "100 Example Ave", city: "Seattle", state: "WA", zip: "98101" }, contact: { phone: "206-555-0100" } }) },
      booking: { create }
    };
    const booking = await ensureBookingForOpportunity("opportunity-1", db as never);
    expect(booking.id).toBe("booking-1");
    expect(booking.opportunityId).toBe("opportunity-1");
  });

  it("does not create a booking before dates are proposed", async () => {
    const db = { opportunity: { findUnique: async () => ({ id: "opportunity-1", artistId: "artist-1", venueId: "venue-1", contactId: null, status: "READY_FOR_OUTREACH", booking: null, venue: {}, contact: null }) }, booking: { create: async () => ({ id: "should-not-happen" }) } };
    await expect(ensureBookingForOpportunity("opportunity-1", db as never)).rejects.toThrow("cannot be created before a date is proposed");
  });

  it("explains a priority score instead of treating it as a black box", () => {
    const result = scoreOpportunity({ suitability: 90, relationshipStatus: "REPEAT_VENUE", hasContact: true, proposedDates: "[\"2026-09-01\"]" });
    expect(result.score).toBeGreaterThan(80);
    expect(result.reasons).toContain("Prior relationship");
    expect(result.reasons).toContain("named contact");
  });
});
