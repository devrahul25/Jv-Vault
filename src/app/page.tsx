import { redirect } from "next/navigation";
import { currentKey, isInitialized } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default function Home() {
  if (!isInitialized()) redirect("/setup");
  if (!currentKey()) redirect("/login");
  redirect("/dashboard");
}
