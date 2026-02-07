import { Employee, WorkHistoryEntry } from "./constants";

// ===== Transfer Analytics =====

export interface TransferRecord {
  employeeId: string;
  employeeName: string;
  kgid: string;
  fromCity: string;
  toCity: string;
  fromPosition: string;
  toPosition: string;
  fromHospital: string;
  toHospital: string;
  date: string;
  isPromotion: boolean; // position changed to a higher/different role
  isCityTransfer: boolean; // city changed
}

export interface TransferSummary {
  totalTransfers: number;
  totalPromotions: number;
  totalCityTransfers: number;
  totalPositionChanges: number;
  transfersByCity: Record<string, number>;
  transfersFromCity: Record<string, number>;
  transfersByMonth: { month: string; transfers: number; promotions: number }[];
  transfersByYear: { year: string; transfers: number; promotions: number }[];
  topDestinations: { city: string; count: number }[];
  topSources: { city: string; count: number }[];
  recentTransfers: TransferRecord[];
}

/**
 * Extract transfer records from employee assignment histories.
 * A "transfer" is any transition between consecutive assignment entries.
 * A "promotion" is detected when the position changes.
 * A "city transfer" is when the city changes.
 */
export function extractTransfers(employees: Employee[]): TransferRecord[] {
  const transfers: TransferRecord[] = [];

  for (const emp of employees) {
    const history = emp.workHistory;
    if (!history || history.length < 2) continue;

    // Sort by fromDate ascending
    const sorted = [...history].sort(
      (a, b) => new Date(a.fromDate).getTime() - new Date(b.fromDate).getTime()
    );

    for (let i = 1; i < sorted.length; i++) {
      const prev = sorted[i - 1];
      const curr = sorted[i];

      const isCityTransfer = prev.city !== curr.city;
      const isPromotion = prev.position !== curr.position;

      transfers.push({
        employeeId: emp.id,
        employeeName: emp.name,
        kgid: emp.kgid,
        fromCity: prev.city,
        toCity: curr.city,
        fromPosition: prev.position,
        toPosition: curr.position,
        fromHospital: prev.hospitalName,
        toHospital: curr.hospitalName,
        date: curr.fromDate,
        isPromotion,
        isCityTransfer,
      });
    }
  }

  // Sort by date descending (most recent first)
  transfers.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return transfers;
}

/**
 * Compute summary statistics from transfer records.
 */
export function computeTransferSummary(transfers: TransferRecord[]): TransferSummary {
  const transfersByCity: Record<string, number> = {};
  const transfersFromCity: Record<string, number> = {};
  const monthlyMap: Record<string, { transfers: number; promotions: number }> = {};
  const yearlyMap: Record<string, { transfers: number; promotions: number }> = {};

  let totalPromotions = 0;
  let totalCityTransfers = 0;
  let totalPositionChanges = 0;

  for (const t of transfers) {
    // Count destinations
    transfersByCity[t.toCity] = (transfersByCity[t.toCity] || 0) + 1;
    transfersFromCity[t.fromCity] = (transfersFromCity[t.fromCity] || 0) + 1;

    // Count types
    if (t.isPromotion) totalPromotions++;
    if (t.isCityTransfer) totalCityTransfers++;
    if (t.fromPosition !== t.toPosition) totalPositionChanges++;

    // Monthly aggregation
    const date = new Date(t.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    if (!monthlyMap[monthKey]) monthlyMap[monthKey] = { transfers: 0, promotions: 0 };
    monthlyMap[monthKey].transfers++;
    if (t.isPromotion) monthlyMap[monthKey].promotions++;

    // Yearly aggregation
    const yearKey = String(date.getFullYear());
    if (!yearlyMap[yearKey]) yearlyMap[yearKey] = { transfers: 0, promotions: 0 };
    yearlyMap[yearKey].transfers++;
    if (t.isPromotion) yearlyMap[yearKey].promotions++;
  }

  // Sort monthly
  const transfersByMonth = Object.entries(monthlyMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, data]) => ({ month, ...data }));

  // Sort yearly
  const transfersByYear = Object.entries(yearlyMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([year, data]) => ({ year, ...data }));

  // Top destinations
  const topDestinations = Object.entries(transfersByCity)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([city, count]) => ({ city, count }));

  // Top sources
  const topSources = Object.entries(transfersFromCity)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([city, count]) => ({ city, count }));

  return {
    totalTransfers: transfers.length,
    totalPromotions,
    totalCityTransfers,
    totalPositionChanges,
    transfersByCity,
    transfersFromCity,
    transfersByMonth,
    transfersByYear,
    topDestinations,
    topSources,
    recentTransfers: transfers.slice(0, 20),
  };
}

// ===== Promotion Analytics =====

export interface PromotionRecord {
  employeeId: string;
  employeeName: string;
  kgid: string;
  fromPosition: string;
  toPosition: string;
  city: string;
  hospital: string;
  date: string;
  withCityTransfer: boolean;
}

/**
 * Extract promotion-specific records (position changes only).
 */
export function extractPromotions(employees: Employee[]): PromotionRecord[] {
  const promotions: PromotionRecord[] = [];

  for (const emp of employees) {
    const history = emp.workHistory;
    if (!history || history.length < 2) continue;

    const sorted = [...history].sort(
      (a, b) => new Date(a.fromDate).getTime() - new Date(b.fromDate).getTime()
    );

    for (let i = 1; i < sorted.length; i++) {
      const prev = sorted[i - 1];
      const curr = sorted[i];

      if (prev.position !== curr.position) {
        promotions.push({
          employeeId: emp.id,
          employeeName: emp.name,
          kgid: emp.kgid,
          fromPosition: prev.position,
          toPosition: curr.position,
          city: curr.city,
          hospital: curr.hospitalName,
          date: curr.fromDate,
          withCityTransfer: prev.city !== curr.city,
        });
      }
    }
  }

  promotions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return promotions;
}
