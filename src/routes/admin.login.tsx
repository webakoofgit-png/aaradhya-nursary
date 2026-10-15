import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { loginB2b } from "@/server/b2b-actions";

export const Route = createFileRoute("/admin/login")({ component: AdminLogin });

function AdminLogin() {
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      setBusy(true);
      await loginB2b({
        data: {
          identifier: String(form.get("email")),
          password: String(form.get("password")),
          remember: form.get("remember") === "on",
          actor: "admin",
        },
      });
      await navigate({ to: "/admin" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Login failed.");
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="grid min-h-[70vh] place-items-center px-4">
      <form
        onSubmit={submit}
        className="w-full max-w-sm border border-border bg-card p-6 shadow-soft"
      >
        <ShieldCheck className="text-primary" />
        <h1 className="mt-4 font-display text-2xl text-leaf-deep">Admin sign in</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Protected nursery operations workspace.
        </p>
        <label className="mt-6 block text-sm">
          Email
          <input
            name="email"
            type="email"
            className="mt-1 h-11 w-full rounded-md border border-border px-3"
            required
          />
        </label>
        <label className="mt-4 block text-sm">
          Password
          <input
            name="password"
            type="password"
            className="mt-1 h-11 w-full rounded-md border border-border px-3"
            required
          />
        </label>
        <label className="mt-4 flex items-center gap-2 text-sm">
          <input name="remember" type="checkbox" />
          Remember me
        </label>
        <button
          disabled={busy}
          className="mt-6 w-full rounded-md bg-primary py-3 text-sm text-primary-foreground"
        >
          {busy ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </div>
  );
}
