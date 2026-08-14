import { cookies } from "next/headers";
import crypto from "node:crypto";
import { redirect } from "next/navigation";
const COOKIE_NAME = "bookt_admin_session";
function secret(): string { return process.env.ADMIN_SESSION_SECRET || "dev-secret-change-me"; }
function sign(payload: string): string { return crypto.createHmac("sha256", secret()).update(payload).digest("hex"); }
export function createAdminToken(email: string): string { const payload = Buffer.from(JSON.stringify({ email, ts: Date.now() })).toString("base64url"); return `${payload}.${sign(payload)}`; }
export function verifyAdminToken(token?: string | null): boolean { if (!token) return false; const [payload, signature] = token.split("."); if (!payload || !signature) return false; const expected = sign(payload); if (signature.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return false; try { const decoded = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { email: string; ts: number }; return decoded.email === (process.env.ADMIN_EMAIL || "admin@bookt.app") && Date.now() - decoded.ts < 1000 * 60 * 60 * 24 * 7; } catch { return false; } }
export async function setAdminSession(token: string): Promise<void> { const store = await cookies(); store.set(COOKIE_NAME, token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 60 * 60 * 24 * 7, path: "/" }); }
export async function requireAdmin(): Promise<void> { const store = await cookies(); if (!verifyAdminToken(store.get(COOKIE_NAME)?.value)) redirect("/login"); }
