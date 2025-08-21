import { Router } from "express";
import { prisma } from "../db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import rateLimit from "express-rate-limit";

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10
});

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body || {};
    if (!name || !email || !password) {
      return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "name, email, password required" } });
    }
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: { code: "EMAIL_TAKEN", message: "Email already registered" } });
    }
    const hash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, passwordHash: hash, role: "patient" }
    });
    return res.status(201).json({ id: user.id, email: user.email });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: { code: "SERVER_ERROR", message: "Something went wrong" } });
  }
});

router.post("/login", loginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "email and password required" } });
    }
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: { code: "INVALID_CREDENTIALS", message: "Invalid email or password" } });
    }
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ error: { code: "INVALID_CREDENTIALS", message: "Invalid email or password" } });
    }
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });
    return res.status(200).json({ token, role: user.role });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: { code: "SERVER_ERROR", message: "Something went wrong" } });
  }
});

export default router;
