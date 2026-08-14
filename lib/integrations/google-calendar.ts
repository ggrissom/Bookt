export function isGoogleCalendarConfigured(): boolean { return false; }
export async function syncEventToGoogleCalendar(): Promise<{ synced: false; reason: string }> { return { synced: false, reason: "Google Calendar is not configured. TODO Phase 2: add OAuth and event sync." }; }
