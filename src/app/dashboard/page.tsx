import { redirect } from "next/navigation";
import { currentKey, isInitialized } from "@/lib/auth";
import VaultApp from "@/components/VaultApp";

export const dynamic = "force-dynamic";

export default function DashboardPage() {
  if (!isInitialized()) redirect("/setup");
  if (!currentKey()) redirect("/login");
  return <VaultApp />;
}
