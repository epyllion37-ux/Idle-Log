export type Unit = "EKL" | "EXT" | "EFL" | "ESL" | "EFL-02" | "Auto";

export type Shift = "A" | "B" | "C";

export type UserRole = "master" | "supervisor";

export interface UserAccount {
  password: string;
  displayName: string;
  role: UserRole;
}

export interface EditChange {
  old: string | number | undefined | null;
  new: string | number | undefined | null;
}

export interface HistoryEntry {
  timestamp: string;
  editor: string;
  changes: Record<string, EditChange>;
}

export interface IdleRecord {
  id: string;
  date: string; // YYYY-MM-DD
  unit: Unit;
  machineNo: number;
  shift: Shift;
  idleFrom: string; // HH:MM
  idleTo: string;   // HH:MM
  durationHours: number;
  reason: string;
  recordedBy: string;
  recordedByUser: string;
  createdAt: string;
  updatedAt: string;
  history: HistoryEntry[];
}

export interface UserSession {
  username: string;
  displayName: string;
  role: UserRole;
}

export const UNITS: Unit[] = ["EKL", "EXT", "EFL", "ESL", "EFL-02", "Auto"];

export const MC_MAX: Record<Unit, number> = {
  "EKL": 29,
  "EXT": 38,
  "EFL": 66,
  "ESL": 38,
  "EFL-02": 43,
  "Auto": 10
};

export const FIELD_LABELS: Record<string, string> = {
  date: "Date",
  unit: "Unit",
  machineNo: "Mc Number",
  shift: "Shift",
  idleFrom: "Idle From",
  idleTo: "Idle To",
  reason: "Idle Reason"
};

export const REASON_SUGGESTIONS = [
  "Yarn shortage",
  "Mechanical breakdown",
  "No operator available",
  "Power failure",
  "Scheduled maintenance",
  "Quality issue / rework",
  "Order / style change",
  "Waiting for spare parts"
];
