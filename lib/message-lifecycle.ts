export type DraftStatus = "draft" | "approved" | "sent" | "received";
const ALLOWED: Record<DraftStatus, DraftStatus[]> = { draft: ["approved"], approved: ["sent"], sent: [], received: [] };
export function assertMessageTransition(from: DraftStatus, to: DraftStatus): void { if (!ALLOWED[from].includes(to)) throw new Error(`Cannot change message status from ${from} to ${to}. Outreach must follow Draft → Review → Approve → Send.`); }
export function createTemplateDraft(input: { venueName: string; artistName: string; relationshipStatus: string }): { subject: string; body: string } {
  const familiar = ["PAST_VENUE", "REPEAT_VENUE"].includes(input.relationshipStatus);
  return { subject: familiar ? `Checking in about music at ${input.venueName}` : `Live acoustic music for ${input.venueName}`, body: familiar ? `Hi there,\n\nI hope things are going well at ${input.venueName}. I’d love to come back and play another solo acoustic set. Are you booking any upcoming dates?\n\nThanks,\n${input.artistName}` : `Hi there,\n\nI’m ${input.artistName}, a Seattle-area solo acoustic performer. I’m reaching out because ${input.venueName} looks like a great fit for live music. Are you booking upcoming dates?\n\nThanks,\n${input.artistName}` };
  // TODO Phase 2: replace with OpenAI-generated draft using conversation history.
}
