export type PlasticType = "PET" | "HDPE" | "PVC" | "LDPE" | "PP" | "OTHER";
export type MachineStatus = "active" | "full" | "offline" | "maintenance";

export const PLASTIC_TYPES: PlasticType[] = ["PET", "HDPE", "PVC", "LDPE", "PP"];

export const PLASTIC_LABELS: Record<PlasticType, string> = {
  PET: "PET",
  HDPE: "HDPE",
  PVC: "PVC",
  LDPE: "LDPE",
  PP: "PP",
  OTHER: "Other",
};

export type Profile = {
  id: string;
  full_name: string;
  role: "citizen" | "admin";
  coins_balance: number;
  total_bottles: number;
  total_weight_g: number;
  impact_score: number;
  created_at: string;
};

export type Machine = {
  id: string;
  code: string;
  name: string;
  address: string | null;
  lat: number;
  lng: number;
  status: MachineStatus;
  fill_level: number;
  accepted_materials: string[];
  capacity_g: number;
  last_seen_at: string | null;
};

export type MapMachine = {
  id: string;
  code: string;
  name: string;
  address: string | null;
  lat: number;
  lng: number;
  status: MachineStatus;
  fill_level: number;
  accepted_materials: string[];
  last_seen_at: string | null;
  distance_m?: number;
};

export type Deposit = {
  id: string;
  machine_id: string | null;
  plastic_type: PlasticType;
  quantity: number;
  weight_g: number;
  coins_awarded: number;
  impact_points: number;
  created_at: string;
  machines?: { name: string; code: string } | null;
};

export type Reward = {
  id: string;
  title: string;
  description: string | null;
  cost_coins: number;
  stock: number | null;
  image_url: string | null;
  active: boolean;
};

export type Redemption = {
  id: string;
  reward_id: string;
  cost_coins: number;
  status: string;
  code: string | null;
  created_at: string;
  rewards?: { title: string } | null;
};

export type Badge = {
  id: string;
  key: string;
  name: string;
  description: string;
  icon: string;
  metric: "total_bottles" | "impact_score";
  threshold: number;
  sort: number;
};

export type BadgeProgress = Badge & { earned: boolean; current: number; pct: number };

export type LeaderboardRow = {
  rank: number;
  is_me: boolean;
  full_name: string;
  total_bottles: number;
  impact_score: number;
};

export type MyRank = {
  rank: number;
  total_bottles: number;
  impact_score: number;
};

export type AppNotification = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  read_at: string | null;
  created_at: string;
};

export type AdminStats = {
  total_deposits: number;
  total_bottles: number;
  total_weight_g: number;
  total_users: number;
  total_machines: number;
  active_machines: number;
  avg_fill: number;
};

export type DailyDeposit = { day: string; bottles: number; weight: number };
export type TopMachine = { code: string; name: string; deposits: number; weight: number };
export type PlasticSplit = { plastic_type: PlasticType; count: number };

export type AdminUser = {
  id: string;
  full_name: string;
  role: "citizen" | "admin";
  total_bottles: number;
  coins_balance: number;
  impact_score: number;
  created_at: string;
};
