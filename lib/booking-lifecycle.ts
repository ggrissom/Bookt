import type { PrismaClient } from "@prisma/client";
import { BOOKING_TRIGGER_STATUSES, type DealStatus } from "@/lib/constants";

type Db = Pick<PrismaClient, "opportunity" | "booking">;
export async function ensureBookingForOpportunity(opportunityId: string, db: Db): Promise<{ id: string }> {
  const opportunity = await db.opportunity.findUnique({ where: { id: opportunityId }, include: { booking: true, venue: true, contact: true } });
  if (!opportunity) throw new Error("Opportunity not found");
  if (opportunity.booking) return opportunity.booking;
  if (!BOOKING_TRIGGER_STATUSES.has(opportunity.status as DealStatus)) throw new Error("A booking cannot be created before a date is proposed");
  return db.booking.create({ data: { opportunityId: opportunity.id, artistId: opportunity.artistId, venueId: opportunity.venueId, contactId: opportunity.contactId, status: opportunity.status, venueAddressSnapshot: [opportunity.venue.address, opportunity.venue.city, opportunity.venue.state, opportunity.venue.zip].filter(Boolean).join(", ") || null, contactPhoneSnapshot: opportunity.contact?.phone ?? null } });
}
export function scoreOpportunity(input: { suitability?: number | null; relationshipStatus: string; hasContact: boolean; proposedDates?: string | null }): { score: number; reasons: string } {
  let score = Math.round((input.suitability ?? 50) * 0.55); const reasons = [`Solo acoustic fit: ${input.suitability ?? 50}/100.`];
  if (["PAST_VENUE", "REPEAT_VENUE"].includes(input.relationshipStatus)) { score += 25; reasons.push("Prior relationship improves likelihood of a response."); }
  if (input.hasContact) { score += 12; reasons.push("A named contact is available for direct outreach."); }
  if (input.proposedDates) { score += 8; reasons.push("Possible performance dates have been identified."); }
  return { score: Math.min(100, score), reasons: reasons.map((reason) => `• ${reason}`).join("\n") };
}
