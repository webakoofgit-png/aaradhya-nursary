import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { UserPlus } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/site/PageHeader";
import { registerRetailCustomer } from "@/server/retail-actions";

export const Route = createFileRoute("/register")({
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: search["redirect"] === "/account" ? "/account" : "/checkout",
  }),
  component: RetailRegisterPage,
});

function RetailRegisterPage() {
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const search = Route.useSearch();
  const destination = search.redirect === "/account" ? "/account" : "/checkout";

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      setBusy(true);
      await registerRetailCustomer({
        data: {
          fullName: String(form.get("fullName")),
          mobile: String(form.get("mobile")),
          email: String(form.get("email")),
          password: String(form.get("password")),
          confirmPassword: String(form.get("confirmPassword")),
        },
      });
      toast.success("Account created successfully.");
      await navigate({ to: destination });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to create your account.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Create Customer Account"
        subtitle="Register once, then continue securely to checkout."
        trail={[{ label: "Create account" }]}
      />
      <div className="mx-auto max-w-lg px-4 py-12">
        <form
          onSubmit={submit}
          className="rounded-2xl border border-border bg-card p-6 shadow-soft"
        >
          <UserPlus className="text-primary" />
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="text-sm sm:col-span-2">
              Full name
              <input
                name="fullName"
                autoComplete="name"
                minLength={2}
                maxLength={120}
                required
                className="mt-1 h-11 w-full rounded-xl border border-border bg-background px-3"
              />
            </label>
            <label className="text-sm">
              Mobile number
              <input
                name="mobile"
                inputMode="numeric"
                autoComplete="tel"
                pattern="[6-9][0-9]{9}"
                required
                className="mt-1 h-11 w-full rounded-xl border border-border bg-background px-3"
              />
            </label>
            <label className="text-sm">
              Email address
              <input
                name="email"
                type="email"
                autoComplete="email"
                required
                className="mt-1 h-11 w-full rounded-xl border border-border bg-background px-3"
              />
            </label>
            <label className="text-sm">
              Password
              <input
                name="password"
                type="password"
                autoComplete="new-password"
                minLength={8}
                required
                className="mt-1 h-11 w-full rounded-xl border border-border bg-background px-3"
              />
            </label>
            <label className="text-sm">
              Confirm password
              <input
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                minLength={8}
                required
                className="mt-1 h-11 w-full rounded-xl border border-border bg-background px-3"
              />
            </label>
          </div>
          <button
            disabled={busy}
            className="mt-6 w-full rounded-full bg-primary py-3 text-sm font-medium text-primary-foreground disabled:opacity-60"
          >
            {busy ? "Creating account..." : "Create account and continue"}
          </button>
          <p className="mt-5 text-center text-sm text-muted-foreground">
            Already registered?{" "}
            <a
              href={`/login?redirect=${encodeURIComponent(destination)}`}
              className="font-medium text-primary hover:underline"
            >
              Sign in
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}
