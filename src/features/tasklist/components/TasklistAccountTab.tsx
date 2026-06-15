// Account tab — DESIGN ONLY (per spec). Mirrors the app's Account look. Shows
// the move details we already have (read-only); other rows are visual only.
// Account management happens in the main app, not on this WhatsApp-linked page.

import { User, Calendar, Home, Bell, Shield, HelpCircle, ChevronRight } from "lucide-react";
import { LuaLogo } from "@/components/LuaLogo";
import type { TasklistResponse } from "../types";

type Props = {
  user: TasklistResponse["user"];
};

function formatDate(iso: string | null): string {
  if (!iso) return "Niet ingesteld";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "Niet ingesteld";
  return d.toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" });
}

export const TasklistAccountTab = ({ user }: Props) => {
  const moveType =
    user.move_type === "rent" ? "Huurwoning" : user.move_type === "buy" ? "Koopwoning" : "Onbekend";

  const infoRows = [
    { icon: User, label: "Naam", value: user.name ?? "Niet ingesteld" },
    { icon: Calendar, label: "Verhuisdatum", value: formatDate(user.move_date) },
    { icon: Home, label: "Type woning", value: moveType },
  ];

  const settingRows = [
    { icon: Bell, label: "Notificaties" },
    { icon: Shield, label: "Privacy" },
    { icon: HelpCircle, label: "Help & support" },
  ];

  return (
    <>
      <div className="px-4 pt-4 pb-2">
        <LuaLogo size="md" />
      </div>

      <div className="px-4 sm:px-6 mt-2">
        <h2 className="text-lg font-semibold text-foreground mb-4">Account</h2>

        {/* Move details (read-only) */}
        <div className="rounded-3xl bg-white shadow-lg shadow-primary/10 divide-y divide-border/60 mb-4">
          {infoRows.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-3 p-4">
              <div className="h-10 w-10 rounded-xl bg-primary-light text-primary flex items-center justify-center shrink-0">
                <Icon className="h-5 w-5" aria-hidden />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-sm font-medium text-foreground truncate">{value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Settings (visual) */}
        <div className="rounded-3xl bg-white shadow-lg shadow-primary/10 divide-y divide-border/60">
          {settingRows.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-3 p-4">
              <div className="h-10 w-10 rounded-xl bg-secondary/60 text-muted-foreground flex items-center justify-center shrink-0">
                <Icon className="h-5 w-5" aria-hidden />
              </div>
              <span className="flex-1 text-sm font-medium text-foreground">{label}</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" aria-hidden />
            </div>
          ))}
        </div>
      </div>
    </>
  );
};
