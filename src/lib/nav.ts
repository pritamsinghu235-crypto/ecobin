import {
  LayoutDashboard,
  Recycle,
  History,
  Trophy,
  Gift,
  Map,
  Bell,
  Cpu,
  Users,
  type LucideIcon,
} from "lucide-react";

export type NavItem = { label: string; href: string; icon: LucideIcon };

/** Citizen-facing navigation. */
export const userNav: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Deposit", href: "/deposit", icon: Recycle },
  { label: "History", href: "/history", icon: History },
  { label: "Leaderboard", href: "/leaderboard", icon: Trophy },
  { label: "Rewards", href: "/rewards", icon: Gift },
  { label: "Bin Map", href: "/map", icon: Map },
  { label: "Notifications", href: "/notifications", icon: Bell },
];

/** Admin-area navigation. */
export const adminNav: NavItem[] = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard },
  { label: "Machines", href: "/admin/machines", icon: Cpu },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Rewards", href: "/admin/rewards", icon: Gift },
];
