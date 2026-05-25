import { Router, type IRouter } from "express";
import { eq, and, desc, sql } from "drizzle-orm";
import { db, ordersTable, servicesTable, usersTable, transactionsTable, notificationsTable } from "@workspace/db";
import { requireAuth, type AuthRequest } from "../middlewares/requireAuth";
import { CreateOrderBody } from "@workspace/api-zod";
import { sendToUser } from "../ws";

const router: IRouter = Router();

router.get("/orders", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const page = parseInt(req.query.page as string ?? "1", 10);
  const limit = parseInt(req.query.limit as string ?? "20", 10);
  const offset = (page - 1) * limit;

  const conditions = [eq(ordersTable.userId, req.userId!)];
  if (req.query.status) conditions.push(eq(ordersTable.status, req.query.status as string));

  const [totalResult] = await db.select({ count: sql<number>`count(*)::int` })
    .from(ordersTable).where(and(...conditions));
  const total = totalResult.count;

  const orders = await db.select().from(ordersTable)
    .where(and(...conditions))
    .orderBy(desc(ordersTable.createdAt))
    .limit(limit).offset(offset);

  res.json({
    orders: orders.map(o => ({
      id: o.id, serviceId: o.serviceId, serviceName: o.serviceName, platform: o.platform,
      quantity: o.quantity, price: parseFloat(o.price), status: o.status, link: o.link,
      startCount: o.startCount, remains: o.remains,
      createdAt: o.createdAt.toISOString(),
      completedAt: o.completedAt?.toISOString() ?? null,
    })),
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
});

router.post("/orders", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const parsed = CreateOrderBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { serviceId, link, quantity } = parsed.data;

  const services = await db.select().from(servicesTable).where(eq(servicesTable.id, serviceId));
  if (services.length === 0 || !services[0].isActive) {
    res.status(400).json({ error: "Service not found or inactive" });
    return;
  }
  const service = services[0];

  if (quantity < service.minOrder || quantity > service.maxOrder) {
    res.status(400).json({ error: `Quantity must be between ${service.minOrder} and ${service.maxOrder}` });
    return;
  }

  const users = await db.select().from(usersTable).where(eq(usersTable.id, req.userId!));
  if (users.length === 0) { res.status(404).json({ error: "User not found" }); return; }
  const user = users[0];

  const totalCost = (parseFloat(service.price) * quantity) / 1000;
  if (parseFloat(user.balance) < totalCost) {
    res.status(400).json({ error: "Insufficient balance" });
    return;
  }

  const newBalance = parseFloat(user.balance) - totalCost;
  await db.update(usersTable).set({
    balance: newBalance.toFixed(2),
    totalOrders: user.totalOrders + 1,
  }).where(eq(usersTable.id, req.userId!));

  const [order] = await db.insert(ordersTable).values({
    userId: req.userId!,
    serviceId,
    serviceName: service.name,
    platform: service.platform,
    link,
    quantity,
    price: totalCost.toFixed(2),
    status: "pending",
    startCount: 0,
    remains: quantity,
  }).returning();

  await db.insert(transactionsTable).values({
    userId: req.userId!,
    type: "order",
    amount: (-totalCost).toFixed(2),
    balance: newBalance.toFixed(2),
    description: `Order #${order.id} - ${service.name}`,
    referenceId: order.id,
  });

  await db.insert(notificationsTable).values({
    userId: req.userId!,
    title: "Order Dibuat",
    message: `Order #${order.id} untuk ${service.name} berhasil dibuat! Sedang diproses...`,
    type: "success",
  });

  sendToUser(req.userId!, {
    type: "notification",
    title: "Order Berhasil!",
    message: `Order #${order.id} untuk ${service.name} sedang diproses.`,
    notifType: "success",
  });

  sendToUser(req.userId!, { type: "order_update" });
  sendToUser(req.userId!, { type: "balance_update" });

  res.status(201).json({
    id: order.id, serviceId: order.serviceId, serviceName: order.serviceName,
    platform: order.platform, quantity: order.quantity, price: parseFloat(order.price),
    status: order.status, link: order.link, startCount: order.startCount,
    remains: order.remains, createdAt: order.createdAt.toISOString(), completedAt: null,
  });
});

router.get("/orders/:id", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);
  const orders = await db.select().from(ordersTable)
    .where(and(eq(ordersTable.id, id), eq(ordersTable.userId, req.userId!)));
  if (orders.length === 0) { res.status(404).json({ error: "Order not found" }); return; }
  const o = orders[0];
  res.json({
    id: o.id, serviceId: o.serviceId, serviceName: o.serviceName, platform: o.platform,
    quantity: o.quantity, price: parseFloat(o.price), status: o.status, link: o.link,
    startCount: o.startCount, remains: o.remains,
    createdAt: o.createdAt.toISOString(), completedAt: o.completedAt?.toISOString() ?? null,
  });
});

router.post("/orders/:id/refill", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);
  const orders = await db.select().from(ordersTable)
    .where(and(eq(ordersTable.id, id), eq(ordersTable.userId, req.userId!)));
  if (orders.length === 0) { res.status(404).json({ error: "Order not found" }); return; }
  await db.update(ordersTable).set({ status: "processing" }).where(eq(ordersTable.id, id));
  res.json({ success: true, message: "Refill requested" });
});

export default router;
