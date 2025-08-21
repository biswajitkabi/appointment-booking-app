// Utilities to generate 30-min slots between 09:00–17:00 for a date range, in UTC.
import { prisma } from "../db.js";

// Normalize a date (YYYY-MM-DD) to a Date at 00:00:00 UTC
function startOfDayUTC(yyyyMmDd) {
  const [y, m, d] = yyyyMmDd.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d, 0, 0, 0));
}

export async function ensureSlotsForRange(from, to) {
  // Create 30-min slots 09:00–17:00 UTC for [from..to]
  const startDate = startOfDayUTC(from);
  const endDate = startOfDayUTC(to);

  for (let dt = new Date(startDate); dt <= endDate; dt.setUTCDate(dt.getUTCDate() + 1)) {
    const day = new Date(dt);
    for (let hour = 9; hour < 17; hour++) {
      for (let minute of [0, 30]) {
        const startAt = new Date(Date.UTC(
          day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate(), hour, minute, 0
        ));
        const endAt = new Date(startAt.getTime() + 30 * 60 * 1000);
        // Upsert by unique compound would be ideal; we use findFirst+create for simplicity
        const exists = await prisma.slot.findFirst({
          where: { startAt, endAt }
        });
        if (!exists) {
          await prisma.slot.create({ data: { startAt, endAt } });
        }
      }
    }
  }
}
