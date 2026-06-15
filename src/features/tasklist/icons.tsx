// Maps a task to a lucide icon. Our API doesn't send icons, so we infer one
// from the title/category keywords. Used in the task detail sheet.

import type { ReactNode } from "react";
import {
  Zap,
  Wifi,
  Truck,
  Shield,
  Box,
  Trees,
  Key,
  FileText,
  Home,
  Sparkles,
  PawPrint,
  Baby,
  Mail,
  ClipboardList,
} from "lucide-react";

type IconRule = { test: (s: string) => boolean; icon: ReactNode };

const CLS = "w-5 h-5 text-primary";

const RULES: IconRule[] = [
  { test: (s) => s.includes("energie") || s.includes("gas") || s.includes("stroom"), icon: <Zap className={CLS} /> },
  { test: (s) => s.includes("internet") || s.includes("wifi") || s.includes("tv"), icon: <Wifi className={CLS} /> },
  { test: (s) => s.includes("verhuis") || s.includes("verhuizer"), icon: <Truck className={CLS} /> },
  { test: (s) => s.includes("verzekering") || s.includes("inboedel"), icon: <Shield className={CLS} /> },
  { test: (s) => s.includes("doos") || s.includes("dozen") || s.includes("inpak"), icon: <Box className={CLS} /> },
  { test: (s) => s.includes("tuin"), icon: <Trees className={CLS} /> },
  { test: (s) => s.includes("sleutel") || s.includes("slot"), icon: <Key className={CLS} /> },
  { test: (s) => s.includes("post") || s.includes("doorsturen"), icon: <Mail className={CLS} /> },
  { test: (s) => s.includes("schoonmaak") || s.includes("schilder"), icon: <Sparkles className={CLS} /> },
  { test: (s) => s.includes("huisdier") || s.includes("hond") || s.includes("kat"), icon: <PawPrint className={CLS} /> },
  { test: (s) => s.includes("kind") || s.includes("school"), icon: <Baby className={CLS} /> },
  { test: (s) => s.includes("inschrij") || s.includes("gemeente") || s.includes("administ"), icon: <FileText className={CLS} /> },
  { test: (s) => s.includes("woning") || s.includes("thuis") || s.includes("huis"), icon: <Home className={CLS} /> },
];

export function taskIcon(task: { title: string; category: string }): ReactNode {
  const s = `${task.title} ${task.category}`.toLowerCase();
  for (const rule of RULES) {
    if (rule.test(s)) return rule.icon;
  }
  return <ClipboardList className={CLS} />;
}
