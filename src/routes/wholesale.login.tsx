import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { LockKeyhole } from "lucide-react";
import { toast } from "sonner";
import { AppLink } from "@/components/site/AppLink";
import { PageHeader } from "@/components/site/PageHeader";
import { loginB2b } from "@/server/b2b-actions";

export const Route = createFileRoute("/wholesale/login")({
  validateSearch: (search: Record<string, unknown>) => ({
    registered: search["registered"] === "1" ? "1" : undefined,
  }),
  component: LoginPage,
});

function LoginPage() {
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const search = Route.useSearch();
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      setBusy(true);
      await loginB2b({
        data: {
          identifier: String(form.get("identifier")),
          password: String(form.get("password")),
          remember: form.get("remember") === "on",
          actor: "customer",
        },
      });
      toast.success("Welcome to your wholesale account.");
      await navigate({ to: "/wholesale/dashboard" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to log in.");
    } finally {
      setBusy(false);
    }
  };
  return (
    <div>
      <PageHeader
        title="B2B Login"
        subtitle="Approved wholesale customers only."
        trail={[{ label: "Wholesale", to: "/wholesale" }, { label: "Login" }]}
      />
      <div className="mx-auto max-w-md px-4 py-12">
        {search.registered ? (
          <div className="mb-5 rounded-md border border-primary/30 bg-secondary p-4 text-sm text-leaf-deep">
            Application submitted. Your account is pending admin verification.
          </div>
        ) : null}
        <form onSubmit={submit} className="rounded-md border border-border bg-card p-6 shadow-soft">
          <span className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-secondary text-primary">
            <LockKeyhole size={20} />
          </span>
          <label className="mt-6 block text-sm">
            Email or mobile number
            <input
              name="identifier"
              className="mt-1 h-11 w-full rounded-md border border-border bg-background px-3"
              required
            />
          </label>
          <label className="mt-4 block text-sm">
            Password
            <input
              name="password"
              type="password"
              className="mt-1 h-11 w-full rounded-md border border-border bg-background px-3"
              required
            />
          </label>
          <div className="mt-4 flex items-center justify-between gap-3 text-sm">
            <label className="flex items-center gap-2">
              <input name="remember" type="checkbox" />
              Remember me
            </label>
            <AppLink to="/wholesale/reset-password" className="text-primary">
              Forgot password?
            </AppLink>
          </div>
          <button
            disabled={busy}
            className="mt-6 w-full rounded-md bg-primary py-3 text-sm font-medium text-primary-foreground disabled:opacity-60"
          >
            {busy ? "Signing in..." : "Sign in"}
          </button>
          <p className="mt-5 text-center text-sm text-muted-foreground">
            New wholesale buyer?{" "}
            <AppLink to="/wholesale/register" className="text-primary">
              Apply now
            </AppLink>
          </p>
        </form>
      </div>
    </div>
  );
}
