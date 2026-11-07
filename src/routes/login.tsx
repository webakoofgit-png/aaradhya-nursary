import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { LockKeyhole } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/site/PageHeader";
import { loginRetailCustomer } from "@/server/retail-actions";

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: search["redirect"] === "/account" ? "/account" : "/checkout",
  }),
  component: RetailLoginPage,
});

function RetailLoginPage() {
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const search = Route.useSearch();
  const destination = search.redirect === "/account" ? "/account" : "/checkout";

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      setBusy(true);
      await loginRetailCustomer({
        data: {
          identifier: String(form.get("identifier")),
          password: String(form.get("password")),
          remember: form.get("remember") === "on",
        },
      });
      toast.success("Welcome back.");
      await navigate({ to: destination });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to log in.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Customer Login"
        subtitle="Sign in securely to continue to checkout."
        trail={[{ label: "Login" }]}
      />
      <div className="mx-auto max-w-md px-4 py-12">
        <form
          onSubmit={submit}
          className="rounded-2xl border border-border bg-card p-6 shadow-soft"
        >
          <span className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-secondary text-primary">
            <LockKeyhole size={20} />
          </span>
          <label className="mt-6 block text-sm">
            Email or mobile number
            <input
              name="identifier"
              autoComplete="username"
              className="mt-1 h-11 w-full rounded-xl border border-border bg-background px-3"
              required
            />
          </label>
          <label className="mt-4 block text-sm">
            Password
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              className="mt-1 h-11 w-full rounded-xl border border-border bg-background px-3"
              required
            />
          </label>
          <label className="mt-4 flex items-center gap-2 text-sm">
            <input name="remember" type="checkbox" /> Remember me
          </label>
          <button
            disabled={busy}
            className="mt-6 w-full rounded-full bg-primary py-3 text-sm font-medium text-primary-foreground disabled:opacity-60"
          >
            {busy ? "Signing in..." : "Sign in and continue"}
          </button>
          <p className="mt-5 text-center text-sm text-muted-foreground">
            New customer?{" "}
            <a
              href={`/register?redirect=${encodeURIComponent(destination)}`}
              className="font-medium text-primary hover:underline"
            >
              Create an account
            </a>
          </p>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            Wholesale buyer? Use the separate{" "}
            <a href="/wholesale" className="text-primary hover:underline">
              B2B enquiry
            </a>{" "}
            flow.
          </p>
        </form>
      </div>
    </div>
  );
}
