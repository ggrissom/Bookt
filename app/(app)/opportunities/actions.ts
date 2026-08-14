"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { BOOKING_ADVANCE_STATUSES, DEAL_STATUSES, type DealStatus } from "@/lib/constants";
import { ensureBookingForOpportunity, scoreOpportunity } from "@/lib/booking-lifecycle";
import { assertMessageTransition, createTemplateDraft, type DraftStatus } from "@/lib/message-lifecycle";
import { buildOpportunityCreateInput } from "@/lib/opportunity-intake";
import { requireAdmin } from "@/lib/auth";
function path(id: string): string { return `/opportunities/${id}`; }
export async function createOpportunity(form: FormData): Promise<void> {
  await requireAdmin();
  const result = buildOpportunityCreateInput({ venueId: String(form.get("venueId") ?? ""), contactId: String(form.get("contactId") ?? ""), sourceType: String(form.get("sourceType") ?? ""), status: String(form.get("status") ?? ""), proposedDate: String(form.get("proposedDate") ?? ""), notes: String(form.get("notes") ?? "") });
  if ("error" in result) redirect(`/opportunities/new?error=${encodeURIComponent(result.error)}`);
  const artist = await prisma.artist.findFirst();
  if (!artist) redirect(`/opportunities/new?error=${encodeURIComponent("No artist profile exists yet.")}`);
  const venue = await prisma.venue.findUnique({ where: { id: result.data.venueId } });
  if (!venue) redirect(`/opportunities/new?error=${encodeURIComponent("Venue not found.")}`);
  const scoring = scoreOpportunity({ suitability: venue.soloAcousticSuitability, relationshipStatus: venue.relationshipStatus, hasContact: Boolean(result.data.contactId), proposedDates: result.data.proposedDates });
  const opportunity = await prisma.opportunity.create({ data: { venueId: result.data.venueId, contactId: result.data.contactId, artistId: artist.id, status: result.data.status, sourceType: result.data.sourceType, proposedDates: result.data.proposedDates, notes: result.data.notes, priorityScore: scoring.score, scoreReasons: scoring.reasons } });
  revalidatePath("/opportunities"); revalidatePath("/");
  redirect(path(opportunity.id));
}
export async function generateDraft(form: FormData): Promise<void> { await requireAdmin(); const opportunityId = String(form.get("opportunityId")); const opportunity = await prisma.opportunity.findUnique({ where: { id: opportunityId }, include: { artist: true, venue: true, conversations: true } }); if (!opportunity) throw new Error("Opportunity not found"); const conversation = opportunity.conversations[0] ?? await prisma.conversation.create({ data: { opportunityId, venueId: opportunity.venueId, channel: "email" } }); const draft = createTemplateDraft({ venueName: opportunity.venue.name, artistName: opportunity.artist.name, relationshipStatus: opportunity.venue.relationshipStatus }); await prisma.message.create({ data: { conversationId: conversation.id, direction: "outbound", channel: "email", subject: draft.subject, body: draft.body, draftStatus: "draft" } }); revalidatePath(path(opportunityId)); }
export async function updateDraft(form: FormData): Promise<void> { await requireAdmin(); const messageId = String(form.get("messageId")); const opportunityId = String(form.get("opportunityId")); await prisma.message.update({ where: { id: messageId }, data: { subject: String(form.get("subject") ?? ""), body: String(form.get("body") ?? "") } }); revalidatePath(path(opportunityId)); }
export async function transitionMessage(form: FormData): Promise<void> { await requireAdmin(); const messageId = String(form.get("messageId")); const opportunityId = String(form.get("opportunityId")); const to = String(form.get("to")) as DraftStatus; const message = await prisma.message.findUnique({ where: { id: messageId } }); if (!message) throw new Error("Message not found"); assertMessageTransition(message.draftStatus as DraftStatus, to); await prisma.message.update({ where: { id: messageId }, data: { draftStatus: to, sentAt: to === "sent" ? new Date() : null } }); revalidatePath(path(opportunityId)); }
export async function updateOpportunityStatus(form: FormData): Promise<void> { await requireAdmin(); const id = String(form.get("opportunityId")); const status = String(form.get("status")) as DealStatus; if (!DEAL_STATUSES.includes(status)) throw new Error("Invalid opportunity status"); const opportunity = await prisma.opportunity.findUnique({ where: { id }, include: { booking: true } }); if (!opportunity) throw new Error("Opportunity not found"); if (BOOKING_ADVANCE_STATUSES.has(status)) { const proposed = opportunity.proposedDates ? JSON.parse(opportunity.proposedDates) as string[] : []; const startsAt = proposed[0] ? new Date(proposed[0]) : null; if (!startsAt) redirect(`${path(id)}?error=no-date`); const endsAt = new Date(startsAt); endsAt.setHours(endsAt.getHours() + 3); const conflicts = await prisma.calendarEvent.count({ where: { startsAt: { lt: endsAt }, OR: [{ endsAt: { gt: startsAt } }, { endsAt: null }] } }); if (conflicts) redirect(`${path(id)}?error=calendar-conflict`); }
  await prisma.opportunity.update({ where: { id }, data: { status } });
  if (["DATE_PROPOSED", "TENTATIVE", "CONFIRMED", "UPCOMING", "PERFORMED", "PAYMENT_PENDING", "PAID", "FOLLOW_UP", "REPEAT_OPPORTUNITY"].includes(status)) { const booking = await ensureBookingForOpportunity(id, prisma); await prisma.booking.update({ where: { id: booking.id }, data: { status } }); }
  revalidatePath(path(id)); revalidatePath("/opportunities"); revalidatePath("/");
}
