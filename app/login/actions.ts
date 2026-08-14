"use server";
import { redirect } from "next/navigation";
import { createAdminToken, setAdminSession } from "@/lib/auth";
export async function login(formData: FormData): Promise<void> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const validEmail = process.env.ADMIN_EMAIL || "admin@bookt.app";
  const validPassword = process.env.ADMIN_PASSWORD || "bookt-demo-password";
  if (email !== validEmail || password !== validPassword) redirect("/login?error=invalid");
  await setAdminSession(createAdminToken(email));
  redirect("/");
}
