import { requireAdmin } from "@/lib/auth";
import { Shell } from "@/components/shell";
export default async function ProtectedLayout({ children }: { children: React.ReactNode }): Promise<React.ReactNode> { await requireAdmin(); return <Shell>{children}</Shell>; }
