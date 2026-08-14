export function formatDate(value?: Date | string | null, options: Intl.DateTimeFormatOptions = { dateStyle: "medium" }): string { return value ? new Intl.DateTimeFormat("en-US", options).format(new Date(value)) : "—"; }
export function formatMoney(cents?: number | null): string { return cents == null ? "—" : new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100); }
export function formatMultiline(value?: string | null): string[] { return value?.split("\n").filter(Boolean) ?? []; }
