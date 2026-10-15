import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/site/PageHeader";
import { requestPasswordReset, resetB2bPassword } from "@/server/b2b-actions";

export const Route = createFileRoute("/wholesale/reset-password")({
  validateSearch: (search: Record<string, unknown>) => ({
    token: typeof search["token"] === "string" ? search["token"] : "",
  }),
  component: ResetPasswordPage,
});

const inputClass = "mt-1 h-11 w-full rounded-md border border-border bg-background px-3";

function ResetPasswordPage() {
  const { token } = Route.useSearch();
  const [developmentToken, setDevelopmentToken] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  const request = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      setBusy(true);
      const result = await requestPasswordReset({
        data: { identifier: String(form.get("identifier")) },
      });
      setDevelopmentToken(result.developmentToken ?? "");
      toast.success("If the account exists, a secure reset link has been prepared.");
    } finally {
      setBusy(false);
    }
  };

  const reset = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      setBusy(true);
      await resetB2bPassword({
        data: {
          token,
          password: String(form.get("password")),
          confirmPassword: String(form.get("confirmPassword")),
        },
      });
      toast.success("Password changed. Please sign in.");
      await navigate({ to: "/wholesale/login" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Password reset failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Reset B2B Password"
        subtitle="Secure links expire after 30 minutes and work once."
        trail={[{ label: "B2B Login", to: "/wholesale/login" }, { label: "Reset password" }]}
      />
      <div className="mx-auto max-w-md px-4 py-10">
        {token ? (
          <form onSubmit={reset} className="border border-border bg-card p-6 shadow-soft">
            <label className="block text-sm">
              New password
              <input
                name="password"
                type="password"
                minLength={8}
                className={inputClass}
                required
              />
            </label>
            <label className="mt-4 block text-sm">
              Confirm new password
              <input
                name="confirmPassword"
                type="password"
                minLength={8}
                className={inputClass}
                required
              />
            </label>
            <button
              disabled={busy}
              className="mt-6 w-full rounded-md bg-primary py-3 text-sm text-primary-foreground"
            >
              Update password
            </button>
          </form>
        ) : (
          <form onSubmit={request} className="border border-border bg-card p-6 shadow-soft">
            <label className="block text-sm">
              Registered email or mobile
              <input name="identifier" className={inputClass} required />
            </label>
            <button
              disabled={busy}
              className="mt-6 w-full rounded-md bg-primary py-3 text-sm text-primary-foreground"
            >
              Request secure link
            </button>
            {developmentToken ? (
              <a
                href={`/wholesale/reset-password?token=${developmentToken}`}
                className="mt-4 block text-center text-sm text-primary underline"
              >
                Open local development reset link
              </a>
            ) : null}
          </form>
        )}
      </div>
    </div>
  );
}
