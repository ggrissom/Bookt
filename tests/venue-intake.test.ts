import { describe, expect, it } from "vitest";
import { buildVenueCreateInput } from "../lib/venue-intake";

describe("buildVenueCreateInput", () => {
  it("rejects a missing name", () => {
    const result = buildVenueCreateInput({ name: "  ", venueType: "pub" });
    expect(result).toEqual({ error: "Venue name is required." });
  });

  it("rejects a missing venue type", () => {
    const result = buildVenueCreateInput({ name: "The Sample Room", venueType: "  " });
    expect(result).toEqual({ error: "Venue type is required." });
  });

  it("rejects an out-of-range suitability score", () => {
    const result = buildVenueCreateInput({ name: "The Sample Room", venueType: "pub", soloAcousticSuitability: "150" });
    expect(result).toEqual({ error: "Solo acoustic suitability must be a number between 0 and 100." });
  });

  it("builds a clean venue payload with no contact when contact name is blank", () => {
    const result = buildVenueCreateInput({ name: "  The Sample Room  ", venueType: "pub", city: "Seattle", soloAcousticSuitability: "82.6" });
    expect("error" in result).toBe(false);
    if ("error" in result) return;
    expect(result.venue.name).toBe("The Sample Room");
    expect(result.venue.city).toBe("Seattle");
    expect(result.venue.soloAcousticSuitability).toBe(83);
    expect(result.venue.address).toBeNull();
    expect(result.contact).toBeNull();
  });

  it("attaches a contact when a contact name is provided", () => {
    const result = buildVenueCreateInput({ name: "The Sample Room", venueType: "pub", contactName: "Jordan Booker", contactEmail: "jordan@example.test" });
    expect("error" in result).toBe(false);
    if ("error" in result) return;
    expect(result.contact).toEqual({ name: "Jordan Booker", role: null, email: "jordan@example.test", phone: null });
  });

  it("maps paProvided yes/no/unknown correctly", () => {
    const yes = buildVenueCreateInput({ name: "A", venueType: "pub", paProvided: "yes" });
    const no = buildVenueCreateInput({ name: "A", venueType: "pub", paProvided: "no" });
    const unknown = buildVenueCreateInput({ name: "A", venueType: "pub" });
    if (!("error" in yes)) expect(yes.venue.paProvided).toBe(true);
    if (!("error" in no)) expect(no.venue.paProvided).toBe(false);
    if (!("error" in unknown)) expect(unknown.venue.paProvided).toBeNull();
  });
});
