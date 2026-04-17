import { redirect } from "next/navigation";
import { currentKey, isInitialized } from "@/lib/auth";
import LoginForm from "@/components/LoginForm";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  if (!isInitialized()) redirect("/setup");
  if (currentKey()) redirect("/dashboard");
  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-accent-500 text-white font-bold">
            JV
          </div>
          <h1 className="text-2xl font-semibold text-ink-100">Unlock JV Vault</h1>
          <p className="mt-1 text-sm text-ink-400">
            Enter the master password to decrypt your vault.
          </p>
        </div>
        <div className="rounded-2xl border border-ink-700 bg-ink-800 p-6 shadow-soft">
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
