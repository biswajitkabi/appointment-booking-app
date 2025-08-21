import { Router } from "express";
import { prisma } from "../db.js";
import { authRequired, requireRole } from "../middleware/auth.js";

const router = Router();

/**
 * POST /api/book  { slotId }
 * Auth: patient
 * Enforces unique(slotId) to prevent double booking.
 */
router.post("/book", authRequired, requireRole("patient"), async (req, res) => {
  try {
    const { slotId } = req.body || {};
    if (!slotId) {
      return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "slotId required" } });
    }

    // verify slot exists
    const slot = await prisma.slot.findUnique({ where: { id: Number(slotId) } });
    if (!slot) {
      return res.status(404).json({ error: { code: "NOT_FOUND", message: "Slot not found" } });
    }

    // Create booking – rely on DB unique constraint for atomicity
    try {
      const booking = await prisma.booking.create({
        data: { userId: req.user.id, slotId: Number(slotId) },
        include: { slot: true }
      });
      return res.status(201).json({
        id: booking.id,
        slot: { id: booking.slot.id, startAt: booking.slot.startAt, endAt: booking.slot.endAt }
      });
    } catch (err) {
      // Prisma P2002 unique constraint violation
      if (err.code === "P2002") {
        return res.status(409).json({ error: { code: "SLOT_TAKEN", message: "This slot is already booked" } });
      }
      throw err;
    }
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: { code: "SERVER_ERROR", message: "Something went wrong" } });
  }
});

/**
 * GET /api/my-bookings
 * Auth: patient
 */
router.get("/my-bookings", authRequired, requireRole("patient"), async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" },
      include: { slot: true }
    });
    return res.json(bookings.map(b => ({
      id: b.id,
      slot: { id: b.slot.id, startAt: b.slot.startAt, endAt: b.slot.endAt },
      createdAt: b.createdAt
    })));
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: { code: "SERVER_ERROR", message: "Something went wrong" } });
  }
});

/**
 * GET /api/all-bookings
 * Auth: admin
 */
router.get("/all-bookings", authRequired, requireRole("admin"), async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      orderBy: { createdAt: "desc" },
      include: { slot: true, user: true }
    });
    return res.json(bookings.map(b => ({
      id: b.id,
      user: { id: b.user.id, name: b.user.name, email: b.user.email },
      slot: { id: b.slot.id, startAt: b.slot.startAt, endAt: b.slot.endAt },
      createdAt: b.createdAt
    })));
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: { code: "SERVER_ERROR", message: "Something went wrong" } });
  }
});

export default router;
