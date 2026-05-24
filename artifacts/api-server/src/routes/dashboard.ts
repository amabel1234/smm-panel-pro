import { Router, type IRouter } from "express";
import { eq, and, desc, sql, gte } from "drizzle-orm";
import { db, usersTable, ordersTable, depositsTable, transactionsTable, ticketsTable, notificationsTable, referralsTable } from "@workspace/db";
import { requireAuth, requireAdmin, type AuthRequest } from "../middlewares/requireAuth";
import { AdminUpdateUserBalanceBody, AdminBroadcastBody } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/dashboard/stats", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const users = await db.select().from(usersTable).where(eq(usersTable.id, req.userId!));
  if (users.length === 0) { res.status(404).json({ error: "User not found" }); return; }
  const user = users[0];

  const [totalOrdersRes] = await db.select({ count: sql<number>`count(*)::int` })
    .from(ordersTable).where(eq(ordersTable.userId, req.userId!));
  const [activeOrdersRes] = await db.select({ count: sql<number>`count(*)::int` })
    .from(ordersTable).where(and(eq(ordersTable.userId, req.userId!), eq(ordersTable.status, "processing")));
  const [pendingOrdersRes] = await db.select({ count: sql<number>`count(*)::int` })
    .from(ordersTable).where(and(eq(ordersTable.userId, req.userId!), eq(ordersTable.status, "pending")));
  const [completedOrdersRes] = await db.select({ count: sql<number>`count(*)::int` })
    .from(ordersTable).where(and(eq(ordersTable.userId, req.userId!), eq(ordersTable.status, "completed")));
  const [cancelledOrdersRes] = await db.select({ count: sql<number>`count(*)::int` })
    .from(ordersTable).where(and(eq(ordersTable.userId, req.userId!), eq(ordersTable.status, "cancelled")));

  const startOfMonth = new Date();
  startOfMonth.setDate(1); startOfMonth.setHours(0, 0, 0, 0);
  const monthlySpent = await db.select({ total: sql<number>`coalesce(sum(abs(amount::numeric)), 0)::float` })
    .from(transactionsTable).where(and(eq(transactionsTable.userId, req.userId!), eq(transactionsTable.type, "order"), gte(transactionsTable.createdAt, startOfMonth)));

  res.json({
    balance: parseFloat(user.balance),
    totalOrders: totalOrdersRes.count,
    activeOrders: activeOrdersRes.count,
    pendingOrders: pendingOrdersRes.count,
    totalDeposited: parseFloat(user.totalDeposited),
    spentThisMonth: monthlySpent[0]?.total ?? 0,
    completedOrders: completedOrdersRes.count,
    cancelledOrders: cancelledOrdersRes.count,
  });
});

router.get("/dashboard/recent-orders", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const orders = await db.select().from(ordersTable)
    .where(eq(ordersTable.userId, req.userId!))
    .orderBy(desc(ordersTable.createdAt)).limit(5);
  res.json(orders.map(o => ({
    id: o.id, serviceId: o.serviceId, serviceName: o.serviceName, platform: o.platform,
    quantity: o.quantity, price: parseFloat(o.price), status: o.status, link: o.link,
    startCount: o.startCount, remains: o.remains,
    createdAt: o.createdAt.toISOString(), completedAt: o.completedAt?.toISOString() ?? null,
  })));
});

router.get("/referrals", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const users = await db.select().from(usersTable).where(eq(usersTable.id, req.userId!));
  if (users.length === 0) { res.status(404).json({ error: "User not found" }); return; }
  const user = users[0];

  const refs = await db.select({ ref: referralsTable, refUser: usersTable })
    .from(referralsTable)
    .leftJoin(usersTable, eq(referralsTable.referredUserId, usersTable.id))
    .where(eq(referralsTable.referrerId, req.userId!));

  const totalEarnings = refs.reduce((sum, r) => sum + parseFloat(r.ref.earned), 0);

  res.json({
    code: user.referralCode ?? "",
    totalReferrals: refs.length,
    totalEarnings,
    referrals: refs.map(r => ({
      name: r.refUser?.name ?? "Unknown",
      joinedAt: r.ref.createdAt.toISOString(),
      earned: parseFloat(r.ref.earned),
    })),
  });
});

router.get("/admin/stats", requireAdmin, async (_req, res): Promise<void> => {
  const [totalUsersRes] = await db.select({ count: sql<number>`count(*)::int` }).from(usersTable);
  const [totalOrdersRes] = await db.select({ count: sql<number>`count(*)::int` }).from(ordersTable);
  const [activeOrdersRes] = await db.select({ count: sql<number>`count(*)::int` }).from(ordersTable).where(eq(ordersTable.status, "processing"));
  const [pendingDepositsRes] = await db.select({ count: sql<number>`count(*)::int` }).from(depositsTable).where(eq(depositsTable.status, "pending"));
  const [openTicketsRes] = await db.select({ count: sql<number>`count(*)::int` }).from(ticketsTable).where(eq(ticketsTable.status, "open"));

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const startOfMonth = new Date(); startOfMonth.setDate(1); startOfMonth.setHours(0, 0, 0, 0);

  const [revenueTotal] = await db.select({ total: sql<number>`coalesce(sum(amount::numeric), 0)::float` }).from(transactionsTable).where(eq(transactionsTable.type, "deposit"));
  const [revenueToday] = await db.select({ total: sql<number>`coalesce(sum(amount::numeric), 0)::float` }).from(transactionsTable).where(and(eq(transactionsTable.type, "deposit"), gte(transactionsTable.createdAt, today)));
  const [revenueMonth] = await db.select({ total: sql<number>`coalesce(sum(amount::numeric), 0)::float` }).from(transactionsTable).where(and(eq(transactionsTable.type, "deposit"), gte(transactionsTable.createdAt, startOfMonth)));
  const [newUsersToday] = await db.select({ count: sql<number>`count(*)::int` }).from(usersTable).where(gte(usersTable.createdAt, today));
  const [ordersToday] = await db.select({ count: sql<number>`count(*)::int` }).from(ordersTable).where(gte(ordersTable.createdAt, today));

  res.json({
    totalUsers: totalUsersRes.count,
    totalRevenue: revenueTotal.total ?? 0,
    totalOrders: totalOrdersRes.count,
    activeOrders: activeOrdersRes.count,
    pendingDeposits: pendingDepositsRes.count,
    openTickets: openTicketsRes.count,
    revenueToday: revenueToday.total ?? 0,
    revenueThisMonth: revenueMonth.total ?? 0,
    newUsersToday: newUsersToday.count,
    ordersToday: ordersToday.count,
  });
});

router.get("/admin/users", requireAdmin, async (req, res): Promise<void> => {
  const page = parseInt(req.query.page as string ?? "1", 10);
  const search = req.query.search as string | undefined;
  const limit = 20;
  const offset = (page - 1) * limit;

  let query = db.select().from(usersTable);
  const users = search
    ? await query.where(sql`name ilike ${`%${search}%`} or email ilike ${`%${search}%`}`).limit(limit).offset(offset)
    : await query.orderBy(desc(usersTable.createdAt)).limit(limit).offset(offset);

  res.json(users.map(u => ({
    id: u.id, name: u.name, email: u.email, balance: parseFloat(u.balance),
    role: u.role, referralCode: u.referralCode, totalOrders: u.totalOrders,
    totalDeposited: parseFloat(u.totalDeposited), createdAt: u.createdAt.toISOString(),
  })));
});

router.patch("/admin/users/:id/balance", requireAdmin, async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);
  const parsed = AdminUpdateUserBalanceBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const { amount, type } = parsed.data;

  const users = await db.select().from(usersTable).where(eq(usersTable.id, id));
  if (users.length === 0) { res.status(404).json({ error: "User not found" }); return; }
  const user = users[0];

  let newBalance: number;
  if (type === "add") newBalance = parseFloat(user.balance) + amount;
  else if (type === "subtract") newBalance = parseFloat(user.balance) - amount;
  else newBalance = amount;

  if (newBalance < 0) newBalance = 0;
  await db.update(usersTable).set({ balance: newBalance.toFixed(2) }).where(eq(usersTable.id, id));
  res.json({ success: true, newBalance });
});

router.get("/admin/orders", requireAdmin, async (req, res): Promise<void> => {
  const page = parseInt(req.query.page as string ?? "1", 10);
  const limit = 20;
  const offset = (page - 1) * limit;

  const conditions = req.query.status ? [eq(ordersTable.status, req.query.status as string)] : [];
  const [totalResult] = await db.select({ count: sql<number>`count(*)::int` }).from(ordersTable).where(conditions.length > 0 ? and(...conditions) : undefined);

  const orders = await db.select().from(ordersTable)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(ordersTable.createdAt)).limit(limit).offset(offset);

  res.json({
    orders: orders.map(o => ({
      id: o.id, serviceId: o.serviceId, serviceName: o.serviceName, platform: o.platform,
      quantity: o.quantity, price: parseFloat(o.price), status: o.status, link: o.link,
      startCount: o.startCount, remains: o.remains,
      createdAt: o.createdAt.toISOString(), completedAt: o.completedAt?.toISOString() ?? null,
    })),
    total: totalResult.count,
    page,
    totalPages: Math.ceil(totalResult.count / limit),
  });
});

router.get("/admin/deposits", requireAdmin, async (_req, res): Promise<void> => {
  const deposits = await db.select().from(depositsTable).orderBy(desc(depositsTable.createdAt));
  res.json(deposits.map(d => ({
    id: d.id, amount: parseFloat(d.amount), method: d.method, status: d.status,
    qrisCode: d.qrisCode, qrisImageUrl: d.qrisImageUrl,
    expiredAt: d.expiredAt?.toISOString() ?? null, createdAt: d.createdAt.toISOString(),
  })));
});

router.get("/admin/services", requireAdmin, async (_req, res): Promise<void> => {
  const services = await db.select().from((await import("@workspace/db")).servicesTable);
  res.json(services.map(s => ({
    id: s.id, name: s.name, category: s.category, platform: s.platform,
    price: parseFloat(s.price), minOrder: s.minOrder, maxOrder: s.maxOrder,
    description: s.description, isActive: s.isActive, refillAvailable: s.refillAvailable,
    avgCompletionTime: s.avgCompletionTime, isFavorited: false,
  })));
});

router.post("/admin/services", requireAdmin, async (req, res): Promise<void> => {
  const { AdminCreateServiceBody } = await import("@workspace/api-zod");
  const parsed = AdminCreateServiceBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const { servicesTable } = await import("@workspace/db");
  const [service] = await db.insert(servicesTable).values({
    ...parsed.data,
    price: parsed.data.price.toString(),
  }).returning();
  res.status(201).json({
    id: service.id, name: service.name, category: service.category, platform: service.platform,
    price: parseFloat(service.price), minOrder: service.minOrder, maxOrder: service.maxOrder,
    description: service.description, isActive: service.isActive, refillAvailable: service.refillAvailable ?? false,
    avgCompletionTime: service.avgCompletionTime, isFavorited: false,
  });
});

router.post("/admin/broadcast", requireAdmin, async (req, res): Promise<void> => {
  const parsed = AdminBroadcastBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const { title, message, type } = parsed.data;
  const users = await db.select({ id: usersTable.id }).from(usersTable);
  for (const user of users) {
    await db.insert(notificationsTable).values({ userId: user.id, title, message, type });
  }
  res.json({ success: true, sent: users.length });
});

export default router;
