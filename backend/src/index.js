import "dotenv/config";
import express from "express";
import cors from "cors";
import { prisma } from "./db.js";
import authRoutes from "./routes/auth.js";
import slotRoutes from "./routes/slots.js";
import bookingRoutes from "./routes/bookings.js";

const app = express();
app.use(express.json());

// CORS: allow configured frontend origin
app.use(cors({
  origin: process.env.FRONTEND_URL?.split(",") || ["http://localhost:5173"],
  credentials: false
}));

app.get("/api/health", async (_req, res) => {
  // basic health & db check
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ ok: true });
  } catch {
    res.status(500).json({ ok: false });
  }
});

app.use("/api", authRoutes);
app.use("/api", slotRoutes);
app.use("/api", bookingRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`API listening on port ${PORT}`);
});
