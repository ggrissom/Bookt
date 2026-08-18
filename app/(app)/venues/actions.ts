"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { buildVenueCreateInput } from "@/lib/venue-intake";

export async function createVenue(form: FormData): Promise<void> {
  await requireAdmin();
  const result = buildVenueCreateInput({
    name: String(form.get("name") ?? ""),
    address: String(form.get("address") ?? ""),
    city: String(form.get("city") ?? ""),
    state: String(form.get("state") ?? ""),
    zip: String(form.get("zip") ?? ""),
    website: String(form.get("website") ?? ""),
    phone: String(form.get("phone") ?? ""),
    venueType: String(form.get("venueType") ?? ""),
    musicStyleTags: String(form.get("musicStyleTags") ?? ""),
    soloAcousticSuitability: String(form.get("soloAcousticSuitability") ?? ""),
    paProvided: String(form.get("paProvided") ?? ""),
    indoorOutdoor: String(form.get("indoorOutdoor") ?? ""),
    parkingNotes: String(form.get("parkingNotes") ?? ""),
    loadInNotes: String(form.get("loadInNotes") ?? ""),
    notes: String(form.get("notes") ?? ""),
    discoveredVia: String(form.get("discoveredVia") ?? ""),
    sourceUrl: String(form.get("sourceUrl") ?? ""),
    contactName: String(form.get("contactName") ?? ""),
    contactRole: String(form.get("contactRole") ?? ""),
    contactEmail: String(form.get("contactEmail") ?? ""),
    contactPhone: String(form.get("contactPhone") ?? ""),
  });
  if ("error" in result) redirect(`/venues/new?error=${encodeURIComponent(result.error)}`);
  const venue = await prisma.venue.create({ data: result.venue });
  if (result.contact) await prisma.contact.create({ data: { venueId: venue.id, ...result.contact } });
  revalidatePath("/venues");
  redirect(`/venues/${venue.id}`);
}
