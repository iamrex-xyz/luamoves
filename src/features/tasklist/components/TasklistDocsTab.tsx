// Docs tab — DESIGN ONLY (per spec). Mirrors the app's Documents look but isn't
// wired to any backend; document management lives in the main app, not on this
// WhatsApp-linked page.

import { Upload, FolderOpen } from "lucide-react";
import { LuaLogo } from "@/components/LuaLogo";

export const TasklistDocsTab = () => {
  return (
    <>
      <div className="px-4 pt-4 pb-2">
        <LuaLogo size="md" />
      </div>

      <div className="px-4 sm:px-6 mt-2">
        <h2 className="text-lg font-semibold text-foreground mb-1">Documenten</h2>
        <p className="text-xs text-muted-foreground mb-4">
          Bewaar belangrijke documenten voor je verhuizing op één plek.
        </p>

        {/* Upload card (visual) */}
        <div className="rounded-3xl bg-white shadow-lg shadow-primary/10 p-6 mb-4">
          <div className="border-2 border-dashed border-primary/30 rounded-2xl p-8 flex flex-col items-center text-center">
            <div className="h-14 w-14 rounded-2xl bg-primary-light text-primary flex items-center justify-center mb-3">
              <Upload className="h-7 w-7" aria-hidden />
            </div>
            <p className="text-sm font-medium text-foreground mb-1">Document toevoegen</p>
            <p className="text-xs text-muted-foreground">
              Huurcontract, energiemeterstanden, offertes en meer.
            </p>
          </div>
        </div>

        {/* Empty state (visual) */}
        <div className="rounded-3xl bg-white shadow-lg shadow-primary/10 p-8 text-center flex flex-col items-center">
          <div className="h-14 w-14 rounded-2xl bg-secondary/60 text-muted-foreground flex items-center justify-center mb-3">
            <FolderOpen className="h-7 w-7" aria-hidden />
          </div>
          <p className="text-sm font-medium text-foreground mb-1">Nog geen documenten</p>
          <p className="text-xs text-muted-foreground max-w-xs">
            Je documenten verschijnen hier zodra je ze toevoegt.
          </p>
        </div>
      </div>
    </>
  );
};
