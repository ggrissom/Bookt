export type VenueInput = {
  name: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  website?: string;
  phone?: string;
  venueType: string;
  musicStyleTags?: string;
  soloAcousticSuitability?: string;
  paProvided?: string;
  indoorOutdoor?: string;
  parkingNotes?: string;
  loadInNotes?: string;
  notes?: string;
  discoveredVia?: string;
  sourceUrl?: string;
  contactName?: string;
  contactRole?: string;
  contactEmail?: string;
  contactPhone?: string;
};

export type VenueCreateData = {
  name: string;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  website: string | null;
  phone: string | null;
  venueType: string;
  musicStyleTags: string | null;
  soloAcousticSuitability: number | null;
  paProvided: boolean | null;
  indoorOutdoor: string | null;
  parkingNotes: string | null;
  loadInNotes: string | null;
  notes: string | null;
  discoveredVia: string | null;
  sourceUrl: string | null;
};

export type ContactCreateData = { name: string; role: string | null; email: string | null; phone: string | null } | null;

function clean(value?: string): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export function buildVenueCreateInput(input: VenueInput): { venue: VenueCreateData; contact: ContactCreateData } | { error: string } {
  const name = input.name?.trim();
  if (!name) return { error: "Venue name is required." };
  const venueType = input.venueType?.trim();
  if (!venueType) return { error: "Venue type is required." };
  const suitabilityRaw = input.soloAcousticSuitability?.trim();
  let soloAcousticSuitability: number | null = null;
  if (suitabilityRaw) {
    const parsed = Number(suitabilityRaw);
    if (!Number.isFinite(parsed) || parsed < 0 || parsed > 100) return { error: "Solo acoustic suitability must be a number between 0 and 100." };
    soloAcousticSuitability = Math.round(parsed);
  }
  const venue: VenueCreateData = {
    name,
    address: clean(input.address),
    city: clean(input.city),
    state: clean(input.state),
    zip: clean(input.zip),
    website: clean(input.website),
    phone: clean(input.phone),
    venueType,
    musicStyleTags: clean(input.musicStyleTags),
    soloAcousticSuitability,
    paProvided: input.paProvided === "yes" ? true : input.paProvided === "no" ? false : null,
    indoorOutdoor: clean(input.indoorOutdoor),
    parkingNotes: clean(input.parkingNotes),
    loadInNotes: clean(input.loadInNotes),
    notes: clean(input.notes),
    discoveredVia: clean(input.discoveredVia),
    sourceUrl: clean(input.sourceUrl),
  };
  const contactName = clean(input.contactName);
  const contact: ContactCreateData = contactName ? { name: contactName, role: clean(input.contactRole), email: clean(input.contactEmail), phone: clean(input.contactPhone) } : null;
  return { venue, contact };
}
