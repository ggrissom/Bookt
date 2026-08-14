import { DEAL_STATUSES, type DealStatus } from "@/lib/constants";

export type OpportunityInput = {
  venueId: string;
  contactId?: string;
  sourceType: string;
  status?: string;
  proposedDate?: string;
  notes?: string;
};

export type OpportunityCreateData = {
  venueId: string;
  contactId: string | null;
  sourceType: string;
  status: DealStatus;
  proposedDates: string | null;
  notes: string | null;
};

function clean(value?: string): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export function buildOpportunityCreateInput(input: OpportunityInput): { data: OpportunityCreateData } | { error: string } {
  const venueId = input.venueId?.trim();
  if (!venueId) return { error: "Choose a venue for this opportunity." };
  const sourceType = input.sourceType?.trim();
  if (!sourceType) return { error: "Choose how this opportunity was discovered." };
  const status = (input.status?.trim() || "LEAD") as DealStatus;
  if (!DEAL_STATUSES.includes(status)) return { error: "Invalid opportunity status." };
  let proposedDates: string | null = null;
  if (input.proposedDate?.trim()) {
    const parsed = new Date(input.proposedDate);
    if (Number.isNaN(parsed.getTime())) return { error: "Proposed date is not valid." };
    proposedDates = JSON.stringify([parsed.toISOString()]);
  }
  return { data: { venueId, contactId: clean(input.contactId), sourceType, status, proposedDates, notes: clean(input.notes) } };
}
