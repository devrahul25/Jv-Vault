import { redirect } from "next/navigation";
import { isInitialized } from "@/lib/auth";
import SetupForm from "@/components/SetupForm";

export const dynamic = "force-dynamic";

export default function SetupPage() {
  if (isInitialized()) redirect("/login");
  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-accent-500 text-white font-bold">
            JV
          </div>
          <h1 className="text-2xl font-semibold text-ink-100">Set up your vault</h1>
          <p className="mt-1 text-sm text-ink-400">
            Choose a strong master password. It encrypts everything and cannot be recovered.
          </p>
        </div>
        <div className="rounded-2xl border border-ink-700 bg-ink-800 p-6 shadow-soft">
          <SetupForm />
        </div>
        <p className="mt-6 text-center text-xs text-ink-400">
          Write this password down somewhere safe. There is no "forgot password".
        </p>
      </div>
    </main>
  );
}
