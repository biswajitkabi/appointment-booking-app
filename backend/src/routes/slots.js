import { Router } from "express";
import { prisma } from "../db.js";
import { ensureSlotsForRange } from "../utils/slots.js";

const router = Router();

/**
 * GET /api/slots?from=YYYY-MM-DD&to=YYYY-MM-DD
 * Returns available slots (not yet booked) within range.
 * Times are ISO in UTC.
 */
router.get("/slots", async (req, res) => {
  try {
    const { from, to } = req.query;
    if (!from || !to) {
      return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "from and to (YYYY-MM-DD) required" } });
    }

    // Ensure slots exist for the requested range
    await ensureSlotsForRange(from, to);

    const fromDate = new Date(`${from}T00:00:00.000Z`);
    const toDate = new Date(`${to}T23:59:59.999Z`);

    const slots = await prisma.slot.findMany({
      where: {
        startAt: { gte: fromDate },
        endAt: { lte: toDate }
      },
      orderBy: { startAt: "asc" },
      include: { bookings: true }
    });

    const available = slots.filter(s => !s.bookings);
    return res.json(available.map(s => ({
      id: s.id,
      startAt: s.startAt,
      endAt: s.endAt
    })));
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: { code: "SERVER_ERROR", message: "Something went wrong" } });
  }
});

export default router;
