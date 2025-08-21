import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "../db.js";
import { ensureSlotsForRange } from "../utils/slots.js";

async function main() {
  // Seed admin
  const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com";
  const admin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!admin) {
    const hash = await bcrypt.hash(process.env.ADMIN_PASSWORD || "Passw0rd!", 10);
    await prisma.user.create({
      data: {
        name: process.env.ADMIN_NAME || "Admin",
        email: adminEmail,
        passwordHash: hash,
        role: "admin"
      }
    });
    console.log("Seeded admin:", adminEmail);
  }

  // Seed demo patient (optional)
  const patientEmail = process.env.PATIENT_EMAIL || "patient@example.com";
  const patient = await prisma.user.findUnique({ where: { email: patientEmail } });
  if (!patient) {
    const hash = await bcrypt.hash(process.env.PATIENT_PASSWORD || "Passw0rd!", 10);
    await prisma.user.create({
      data: {
        name: process.env.PATIENT_NAME || "Patient",
        email: patientEmail,
        passwordHash: hash,
        role: "patient"
      }
    });
    console.log("Seeded patient:", patientEmail);
  }

  // Ensure 7 days of slots from today
  const today = new Date();
  const y = today.getUTCFullYear();
  const m = String(today.getUTCMonth() + 1).padStart(2, "0");
  const d = String(today.getUTCDate()).padStart(2, "0");
  const from = `${y}-${m}-${d}`;

  const future = new Date(today);
  future.setUTCDate(future.getUTCDate() + 6);
  const y2 = future.getUTCFullYear();
  const m2 = String(future.getUTCMonth() + 1).padStart(2, "0");
  const d2 = String(future.getUTCDate()).padStart(2, "0");
  const to = `${y2}-${m2}-${d2}`;

  await ensureSlotsForRange(from, to);
  console.log("Ensured slots for", from, "to", to);
}

main()
  .then(() => process.exit(0))
  .catch(e => {
    console.error(e);
    process.exit(1);
  });
