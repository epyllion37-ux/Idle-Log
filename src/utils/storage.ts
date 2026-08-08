import { IdleRecord, UserAccount, UserSession } from '../types';

const ACCOUNTS_KEY = 'supervisor-accounts';
const SESSION_KEY = 'session';
const RECORDS_PREFIX = 'idle-records:';

function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function monthKeyFor(dateStr: string): string {
  return RECORDS_PREFIX + dateStr.slice(0, 7);
}

// Default initial accounts if clean slate
export function getStoredAccounts(): Record<string, UserAccount> {
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading accounts', e);
  }
  return {};
}

export function saveAccounts(accounts: Record<string, UserAccount>): boolean {
  try {
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
    return true;
  } catch (e) {
    console.error('Error saving accounts', e);
    return false;
  }
}

export function getStoredSession(): UserSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const accounts = getStoredAccounts();
      if (parsed.username && accounts[parsed.username]) {
        const acc = accounts[parsed.username];
        return {
          username: parsed.username,
          displayName: acc.displayName,
          role: acc.role || 'supervisor'
        };
      }
    }
  } catch (e) {
    console.error('Error reading session', e);
  }
  return null;
}

export function saveSession(username: string) {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify({ username }));
  } catch (e) {
    console.error('Error saving session', e);
  }
}

export function clearSession() {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch (e) {
    console.error('Error clearing session', e);
  }
}

export function listMonthKeys(): string[] {
  const keys: string[] = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(RECORDS_PREFIX)) {
        keys.push(k);
      }
    }
  } catch (e) {
    console.error('Error listing keys', e);
  }
  return keys;
}

export function loadMonth(monthKey: string): IdleRecord[] {
  try {
    const raw = localStorage.getItem(monthKey);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Error loading month', e);
    return [];
  }
}

export function saveMonth(monthKey: string, records: IdleRecord[]): boolean {
  try {
    localStorage.setItem(monthKey, JSON.stringify(records));
    return true;
  } catch (e) {
    console.error('Error saving month', e);
    return false;
  }
}

export function deleteMonth(monthKey: string): boolean {
  try {
    localStorage.removeItem(monthKey);
    return true;
  } catch (e) {
    console.error('Error deleting month', e);
    return false;
  }
}

export function getRecordsInRange(fromDate?: string | null, toDate?: string | null): IdleRecord[] {
  const keys = listMonthKeys();
  let all: IdleRecord[] = [];
  for (const k of keys) {
    all = all.concat(loadMonth(k));
  }
  
  return all.filter(r => {
    if (fromDate && r.date < fromDate) return false;
    if (toDate && r.date > toDate) return false;
    return true;
  });
}

export function addRecord(rec: IdleRecord): boolean {
  const mk = monthKeyFor(rec.date);
  const monthRecords = loadMonth(mk);
  monthRecords.unshift(rec);
  return saveMonth(mk, monthRecords);
}

export function replaceRecord(originalDate: string, newRec: IdleRecord): boolean {
  const oldMk = monthKeyFor(originalDate);
  const newMk = monthKeyFor(newRec.date);

  if (oldMk === newMk) {
    const records = loadMonth(oldMk);
    const idx = records.findIndex(r => r.id === newRec.id);
    if (idx < 0) return false;
    records[idx] = newRec;
    return saveMonth(oldMk, records);
  } else {
    const oldRecords = loadMonth(oldMk);
    const oldIdx = oldRecords.findIndex(r => r.id === newRec.id);
    if (oldIdx >= 0) oldRecords.splice(oldIdx, 1);
    const okOld = saveMonth(oldMk, oldRecords);

    const newRecords = loadMonth(newMk);
    newRecords.unshift(newRec);
    const okNew = saveMonth(newMk, newRecords);
    return okOld && okNew;
  }
}

export function deleteRecord(date: string, id: string): boolean {
  const mk = monthKeyFor(date);
  const monthRecords = loadMonth(mk);
  const idx = monthRecords.findIndex(r => r.id === id);
  if (idx < 0) return false;
  monthRecords.splice(idx, 1);
  return saveMonth(mk, monthRecords);
}

// Seed realistic initial data if clean database
export function seedInitialDataIfEmpty() {
  const accounts = getStoredAccounts();
  if (Object.keys(accounts).length === 0) {
    // Seed default master account
    const defaultAccounts: Record<string, UserAccount> = {
      rahim: {
        password: "123",
        displayName: "Rahim Uddin",
        role: "master"
      },
      karim: {
        password: "123",
        displayName: "Karim Hossain",
        role: "supervisor"
      }
    };
    saveAccounts(defaultAccounts);
  }

  const existingKeys = listMonthKeys();
  if (existingKeys.length === 0) {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const todayNum = now.getDate();

    const sampleRecords: IdleRecord[] = [
      {
        id: uid(),
        date: `${year}-${month}-${String(Math.max(1, todayNum)).padStart(2, '0')}`,
        unit: "EKL",
        machineNo: 12,
        shift: "A",
        idleFrom: "08:15",
        idleTo: "10:45",
        durationHours: 2.5,
        reason: "Yarn shortage",
        recordedBy: "Rahim Uddin",
        recordedByUser: "rahim",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        history: []
      },
      {
        id: uid(),
        date: `${year}-${month}-${String(Math.max(1, todayNum)).padStart(2, '0')}`,
        unit: "EXT",
        machineNo: 5,
        shift: "A",
        idleFrom: "09:00",
        idleTo: "12:30",
        durationHours: 3.5,
        reason: "Mechanical breakdown",
        recordedBy: "Karim Hossain",
        recordedByUser: "karim",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        history: [
          {
            timestamp: new Date().toISOString(),
            editor: "Rahim Uddin",
            changes: {
              idleTo: { old: "12:00", new: "12:30" },
              reason: { old: "Need mechanic", new: "Mechanical breakdown" }
            }
          }
        ]
      },
      {
        id: uid(),
        date: `${year}-${month}-${String(Math.max(1, todayNum - 1)).padStart(2, '0')}`,
        unit: "EFL",
        machineNo: 22,
        shift: "B",
        idleFrom: "15:00",
        idleTo: "16:45",
        durationHours: 1.75,
        reason: "No operator available",
        recordedBy: "Karim Hossain",
        recordedByUser: "karim",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        history: []
      },
      {
        id: uid(),
        date: `${year}-${month}-${String(Math.max(1, todayNum - 2)).padStart(2, '0')}`,
        unit: "ESL",
        machineNo: 18,
        shift: "C",
        idleFrom: "23:00",
        idleTo: "02:15",
        durationHours: 3.25,
        reason: "Power failure",
        recordedBy: "Rahim Uddin",
        recordedByUser: "rahim",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        history: []
      },
      {
        id: uid(),
        date: `${year}-${month}-${String(Math.max(1, todayNum - 3)).padStart(2, '0')}`,
        unit: "EFL-02",
        machineNo: 8,
        shift: "A",
        idleFrom: "07:30",
        idleTo: "09:00",
        durationHours: 1.5,
        reason: "Scheduled maintenance",
        recordedBy: "Karim Hossain",
        recordedByUser: "karim",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        history: []
      },
      {
        id: uid(),
        date: `${year}-${month}-${String(Math.max(1, todayNum - 4)).padStart(2, '0')}`,
        unit: "EKL",
        machineNo: 4,
        shift: "B",
        idleFrom: "14:30",
        idleTo: "18:00",
        durationHours: 3.5,
        reason: "Yarn shortage",
        recordedBy: "Rahim Uddin",
        recordedByUser: "rahim",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        history: []
      }
    ];

    const currentMonthKey = `${RECORDS_PREFIX}${year}-${month}`;
    saveMonth(currentMonthKey, sampleRecords);
  }
}
