import { Router, type IRouter } from "express";
import { eq, and, desc } from "drizzle-orm";
import { db, depositsTable, usersTable, transactionsTable, notificationsTable } from "@workspace/db";
import { requireAuth, requireAdmin, type AuthRequest } from "../middlewares/requireAuth";
import { CreateDepositBody } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/deposits", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const deposits = await db.select().from(depositsTable)
    .where(eq(depositsTable.userId, req.userId!))
    .orderBy(desc(depositsTable.createdAt));
  res.json(deposits.map(d => ({
    id: d.id, amount: parseFloat(d.amount), method: d.method, status: d.status,
    qrisCode: d.qrisCode, qrisImageUrl: d.qrisImageUrl,
    expiredAt: d.expiredAt?.toISOString() ?? null,
    createdAt: d.createdAt.toISOString(),
  })));
});

router.post("/deposits", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const parsed = CreateDepositBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { amount } = parsed.data;

  if (amount < 10000) {
    res.status(400).json({ error: "Minimum deposit is Rp 10.000" });
    return;
  }

  const expiredAt = new Date(Date.now() + 15 * 60 * 1000);
  const qrisCode = `00020101021226610016ID.CO.QRIS.WWW011893600914300000001300000000021303UME51440014ID.LINKAJA.WWW0215ID2020051900001520303UME5204899953033605802ID5905PANEL6007Jakarta61057017462070703A0163042B9D`;
  const qrisImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrisCode)}&bgcolor=ffffff`;

  const [deposit] = await db.insert(depositsTable).values({
    userId: req.userId!,
    amount: amount.toFixed(2),
    method: "qris",
    status: "pending",
    qrisCode,
    qrisImageUrl,
    expiredAt,
  }).returning();

  res.status(201).json({
    id: deposit.id, amount: parseFloat(deposit.amount), method: deposit.method,
    status: deposit.status, qrisCode: deposit.qrisCode, qrisImageUrl: deposit.qrisImageUrl,
    expiredAt: deposit.expiredAt?.toISOString() ?? null,
    createdAt: deposit.createdAt.toISOString(),
  });
});

router.delete("/deposits/:id", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);
  const deposits = await db.select().from(depositsTable)
    .where(and(eq(depositsTable.id, id), eq(depositsTable.userId, req.userId!)));
  if (deposits.length === 0) { res.status(404).json({ error: "Deposit not found" }); return; }
  await db.delete(depositsTable).where(eq(depositsTable.id, id));
  res.json({ success: true });
});

router.get("/deposits/:id", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);
  const deposits = await db.select().from(depositsTable)
    .where(and(eq(depositsTable.id, id), eq(depositsTable.userId, req.userId!)));
  if (deposits.length === 0) { res.status(404).json({ error: "Deposit not found" }); return; }
  const d = deposits[0];
  res.json({
    id: d.id, amount: parseFloat(d.amount), method: d.method, status: d.status,
    qrisCode: d.qrisCode, qrisImageUrl: d.qrisImageUrl,
    expiredAt: d.expiredAt?.toISOString() ?? null,
    createdAt: d.createdAt.toISOString(),
  });
});

router.get("/transactions", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const page = parseInt(req.query.page as string ?? "1", 10);
  const limit = 20;
  const offset = (page - 1) * limit;

  const conditions = [eq(transactionsTable.userId, req.userId!)];
  if (req.query.type) conditions.push(eq(transactionsTable.type, req.query.type as string));

  const txns = await db.select().from(transactionsTable)
    .where(and(...conditions))
    .orderBy(desc(transactionsTable.createdAt))
    .limit(limit).offset(offset);

  res.json(txns.map(t => ({
    id: t.id, type: t.type, amount: parseFloat(t.amount),
    balance: parseFloat(t.balance), description: t.description,
    createdAt: t.createdAt.toISOString(),
  })));
});

router.post("/admin/deposits/:id/approve", requireAdmin, async (req: AuthRequest, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);
  const deposits = await db.select().from(depositsTable).where(eq(depositsTable.id, id));
  if (deposits.length === 0) { res.status(404).json({ error: "Deposit not found" }); return; }
  const deposit = deposits[0];

  if (deposit.status !== "pending") {
    res.status(400).json({ error: "Deposit is not pending" });
    return;
  }

  const users = await db.select().from(usersTable).where(eq(usersTable.id, deposit.userId));
  if (users.length === 0) { res.status(404).json({ error: "User not found" }); return; }
  const user = users[0];

  const newBalance = parseFloat(user.balance) + parseFloat(deposit.amount);
  const newDeposited = parseFloat(user.totalDeposited) + parseFloat(deposit.amount);

  await db.update(usersTable).set({
    balance: newBalance.toFixed(2),
    totalDeposited: newDeposited.toFixed(2),
  }).where(eq(usersTable.id, deposit.userId));

  await db.update(depositsTable).set({ status: "completed" }).where(eq(depositsTable.id, id));

  await db.insert(transactionsTable).values({
    userId: deposit.userId,
    type: "deposit",
    amount: deposit.amount,
    balance: newBalance.toFixed(2),
    description: `Deposit via QRIS - Rp ${parseFloat(deposit.amount).toLocaleString("id-ID")}`,
    referenceId: deposit.id,
  });

  await db.insert(notificationsTable).values({
    userId: deposit.userId,
    title: "Deposit Confirmed",
    message: `Your deposit of Rp ${parseFloat(deposit.amount).toLocaleString("id-ID")} has been confirmed.`,
    type: "success",
  });

  res.json({ success: true });
});

export default router;
