// ─── Types ────────────────────────────────────────────────────────────────────

import {LucideIcon} from "lucide-react";

export interface NavLink {
  href: string;
  label: string;
  hidden?: boolean;
}

export interface NavAction {
  id: string;
  label?: string;
  icon?: LucideIcon;
  href?: string;
  onClick?: () => void;
  hidden?: boolean;
}

// Circle buttons — standalone rounded icon buttons like the theme toggle.
// Add user avatar, settings, notifications, etc. here.
export interface NavCircle {
  id: string;
  icon: LucideIcon;
  href?: string;
  onClick?: () => void;
  label: string; // aria-label
  hidden?: boolean;
}