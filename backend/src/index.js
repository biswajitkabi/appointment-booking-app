import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import slotRoutes from "./routes/slots.js";
import bookingRoutes from "./routes/bookings.js";

const app = express();
app.use(cors({ origin: process.env.FRONTEND_URL }));
app.use(express.json());

app.use("/api", authRoutes);
app.use("/api", slotRoutes);
app.use("/api", bookingRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`API running on ${PORT}`));
