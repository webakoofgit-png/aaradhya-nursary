import { useState } from "react";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { PageHeader } from "@/components/site/PageHeader";
import { AppLink } from "@/components/site/AppLink";
import { getProduct } from "@/data/catalog";
import { inr, useStore } from "@/lib/store";
import { getRetailAccount, logoutRetailCustomer } from "@/server/retail-actions";

export const Route = createFileRoute("/account")({
  loader: async () => {
    try {
      return await getRetailAccount();
    } catch {
      throw redirect({ to: "/login", search: { redirect: "/account" } });
    }
  },
  head: () => ({
    meta: [
      { title: "My Account — Aaradhya rose nursary" },
      {
        name: "description",
        content: "Manage your profile, addresses, orders, wishlist and reviews.",
      },
      { property: "og:title", content: "My Account — Aaradhya rose nursary" },
      { property: "og:description", content: "Your nursery account dashboard." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AccountPage,
});

const tabs = [
  "Dashboard",
  "Profile",
  "Addresses",
  "My Orders",
  "Track Order",
  "Wishlist",
  "Recently Viewed",
  "Reviews",
  "Change Password",
];

function AccountPage() {
  const [tab, setTab] = useState("Dashboard");
  const { wishlist, recent } = useStore();
  const account = Route.useLoaderData();
  const orders = account.orders as Array<Record<string, unknown>>;
  const navigate = useNavigate();

  const signOut = async () => {
    await logoutRetailCustomer();
    await navigate({ to: "/login", search: { redirect: "/account" } });
  };

  return (
    <div>
      <PageHeader
        title="My Account"
        subtitle={`Welcome, ${String(account.user.full_name)}.`}
        trail={[{ label: "Account" }]}
      />
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:px-8">
        <aside className="no-scrollbar flex gap-2 overflow-x-auto lg:flex-col">
          {tabs.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`shrink-0 rounded-xl px-4 py-2.5 text-left text-sm ${tab === t ? "bg-primary text-primary-foreground" : "bg-card text-foreground hover:bg-secondary"}`}
            >
              {t}
            </button>
          ))}
          <button
            type="button"
            onClick={signOut}
            className="shrink-0 rounded-xl px-4 py-2.5 text-left text-sm text-destructive"
          >
            Logout
          </button>
        </aside>

        <section className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-display text-xl">{tab}</h2>
          {tab === "Dashboard" ? (
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              {[
                ["Orders", orders.length],
                ["Wishlist", wishlist.length],
                ["Recently viewed", recent.length],
              ].map(([l, v]) => (
                <div key={String(l)} className="rounded-xl bg-secondary p-4">
                  <p className="text-2xl font-semibold text-leaf-deep">{v}</p>
                  <p className="text-xs text-muted-foreground">{l}</p>
                </div>
              ))}
            </div>
          ) : null}
          {tab === "My Orders" || tab === "Track Order" ? (
            <ul className="mt-4 space-y-3">
              {orders.map((o) => (
                <li
                  key={String(o["id"])}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border p-4 text-sm"
                >
                  <span className="font-medium">{String(o["order_number"])}</span>
                  <span className="text-muted-foreground">
                    {new Date(String(o["created_at"])).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                  <span>{inr(Number(o["grand_total"]))}</span>
                  <span className="rounded-full bg-secondary px-3 py-1 text-xs text-leaf-deep">
                    {String(o["status"]).replaceAll("_", " ")}
                  </span>
                </li>
              ))}
            </ul>
          ) : null}
          {tab === "Profile" || tab === "Addresses" || tab === "Change Password" ? (
            <form onSubmit={(e) => e.preventDefault()} className="mt-4 grid gap-4 sm:grid-cols-2">
              {(tab === "Change Password"
                ? ["Current password", "New password", "Confirm new password"]
                : tab === "Addresses"
                  ? ["Address line", "City", "State", "PIN code"]
                  : ["Full name", "Mobile number", "Email address", "GSTIN (optional)"]
              ).map((f) => (
                <label key={f} className="text-sm">
                  {f}
                  <input
                    type={f.toLowerCase().includes("password") ? "password" : "text"}
                    className="mt-1 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm"
                  />
                </label>
              ))}
              <button
                type="submit"
                className="w-fit rounded-full bg-primary px-6 py-2.5 text-sm text-primary-foreground"
              >
                Save changes
              </button>
            </form>
          ) : null}
          {tab === "Wishlist" || tab === "Recently Viewed" ? (
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {(tab === "Wishlist" ? wishlist : recent).map((s) => {
                const p = getProduct(s);
                return p ? (
                  <li
                    key={s}
                    className="flex items-center gap-3 rounded-xl border border-border p-3 text-sm"
                  >
                    <img src={p.image} alt="" className="h-12 w-12 rounded-lg object-cover" />
                    {p.name}
                  </li>
                ) : null;
              })}
              {(tab === "Wishlist" ? wishlist : recent).length === 0 ? (
                <li className="text-sm text-muted-foreground">Nothing here yet.</li>
              ) : null}
            </ul>
          ) : null}
          {tab === "Reviews" ? (
            <p className="mt-4 text-sm text-muted-foreground">
              You have written 2 reviews. Thank you for helping other gardeners!
            </p>
          ) : null}
        </section>
      </div>
    </div>
  );
}
