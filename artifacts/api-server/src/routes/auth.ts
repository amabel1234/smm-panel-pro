import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db, usersTable } from "@workspace/db";
import { signToken } from "../lib/jwt";
import { requireAuth, type AuthRequest } from "../middlewares/requireAuth";
import { RegisterBody, LoginBody } from "@workspace/api-zod";
import crypto from "crypto";

const router: IRouter = Router();

router.post("/auth/register", async (req, res): Promise<void> => {
  const parsed = RegisterBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { name, email, password, referralCode } = parsed.data;

  const existing = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (existing.length > 0) {
    res.status(400).json({ error: "Email already registered" });
    return;
  }

  let referredBy: number | null = null;
  if (referralCode) {
    const referrer = await db.select().from(usersTable).where(eq(usersTable.referralCode, referralCode));
    if (referrer.length > 0) referredBy = referrer[0].id;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const myReferralCode = crypto.randomBytes(4).toString("hex").toUpperCase();
  const apiKey = crypto.randomBytes(16).toString("hex");

  const [user] = await db.insert(usersTable).values({
    name,
    email,
    passwordHash,
    referralCode: myReferralCode,
    referredBy: referredBy ?? undefined,
    apiKey,
  }).returning();

  const token = signToken({ userId: user.id, role: user.role });
  res.status(201).json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      balance: parseFloat(user.balance),
      role: user.role,
      referralCode: user.referralCode,
      totalOrders: user.totalOrders,
      totalDeposited: parseFloat(user.totalDeposited),
      createdAt: user.createdAt.toISOString(),
    },
  });
});

router.post("/auth/login", async (req, res): Promise<void> => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { email, password } = parsed.data;

  const users = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (users.length === 0) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }
  const user = users[0];
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const token = signToken({ userId: user.id, role: user.role });
  res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      balance: parseFloat(user.balance),
      role: user.role,
      referralCode: user.referralCode,
      totalOrders: user.totalOrders,
      totalDeposited: parseFloat(user.totalDeposited),
      createdAt: user.createdAt.toISOString(),
    },
  });
});

router.post("/auth/logout", (_req, res): void => {
  res.json({ success: true });
});

router.get("/auth/me", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const users = await db.select().from(usersTable).where(eq(usersTable.id, req.userId!));
  if (users.length === 0) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  const user = users[0];
  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    balance: parseFloat(user.balance),
    role: user.role,
    referralCode: user.referralCode,
    totalOrders: user.totalOrders,
    totalDeposited: parseFloat(user.totalDeposited),
    createdAt: user.createdAt.toISOString(),
  });
});

router.patch("/users/profile", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const { name, currentPassword, newPassword } = req.body;
  const users = await db.select().from(usersTable).where(eq(usersTable.id, req.userId!));
  if (users.length === 0) { res.status(404).json({ error: "User not found" }); return; }
  const user = users[0];

  const updates: Partial<typeof usersTable.$inferInsert> = {};
  if (name) updates.name = name;

  if (currentPassword && newPassword) {
    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) { res.status(400).json({ error: "Current password is incorrect" }); return; }
    updates.passwordHash = await bcrypt.hash(newPassword, 12);
  }

  const [updated] = await db.update(usersTable).set(updates).where(eq(usersTable.id, req.userId!)).returning();
  res.json({
    id: updated.id, name: updated.name, email: updated.email,
    balance: parseFloat(updated.balance), role: updated.role,
    referralCode: updated.referralCode, totalOrders: updated.totalOrders,
    totalDeposited: parseFloat(updated.totalDeposited), createdAt: updated.createdAt.toISOString(),
  });
});

router.get("/users/api-key", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const users = await db.select().from(usersTable).where(eq(usersTable.id, req.userId!));
  if (users.length === 0) { res.status(404).json({ error: "Not found" }); return; }
  res.json({ apiKey: users[0].apiKey ?? "" });
});

router.post("/users/api-key", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const newKey = crypto.randomBytes(16).toString("hex");
  await db.update(usersTable).set({ apiKey: newKey }).where(eq(usersTable.id, req.userId!));
  res.json({ apiKey: newKey });
});

export default router;
