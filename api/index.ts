import express, { type Express, Router, type Request, type Response, type NextFunction, type RequestHandler } from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import { eq, and, desc, sql as drizzleSql, ilike } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import jwt from "jsonwebtoken";
import crypto from "crypto";

// ── Schema (inline to avoid workspace import issues) ─────────────────────────
import { pgTable, text, serial, timestamp, numeric, integer, boolean, jsonb } from "drizzle-orm/pg-core";

const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("user"),
  balance: numeric("balance", { precision: 15, scale: 2 }).notNull().default("0"),
  apiKey: text("api_key"),
  referralCode: text("referral_code"),
  referredBy: integer("referred_by"),
  totalOrders: integer("total_orders").notNull().default(0),
  totalDeposited: numeric("total_deposited", { precision: 15, scale: 2 }).notNull().default("0"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

const servicesCategoryTable = pgTable("service_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  platform: text("platform").notNull(),
  icon: text("icon").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

const servicesTable = pgTable("services", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  platform: text("platform").notNull(),
  price: numeric("price", { precision: 15, scale: 4 }).notNull(),
  minOrder: integer("min_order").notNull().default(100),
  maxOrder: integer("max_order").notNull().default(100000),
  description: text("description").notNull().default(""),
  isActive: boolean("is_active").notNull().default(true),
  refillAvailable: boolean("refill_available").notNull().default(false),
  avgCompletionTime: text("avg_completion_time"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

const favoriteServicesTable = pgTable("favorite_services", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  serviceId: integer("service_id").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

const ordersTable = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  serviceId: integer("service_id").notNull(),
  serviceName: text("service_name").notNull(),
  platform: text("platform").notNull(),
  link: text("link").notNull(),
  quantity: integer("quantity").notNull(),
  price: numeric("price", { precision: 15, scale: 2 }).notNull(),
  status: text("status").notNull().default("pending"),
  startCount: integer("start_count"),
  remains: integer("remains"),
  externalOrderId: text("external_order_id"),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

const depositsTable = pgTable("deposits", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  amount: numeric("amount", { precision: 15, scale: 2 }).notNull(),
  method: text("method").notNull().default("qris"),
  status: text("status").notNull().default("pending"),
  qrisCode: text("qris_code"),
  qrisImageUrl: text("qris_image_url"),
  expiredAt: timestamp("expired_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

const transactionsTable = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  type: text("type").notNull(),
  amount: numeric("amount", { precision: 15, scale: 2 }).notNull(),
  balance: numeric("balance", { precision: 15, scale: 2 }).notNull(),
  description: text("description").notNull(),
  referenceId: integer("reference_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

const ticketsTable = pgTable("tickets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  subject: text("subject").notNull(),
  status: text("status").notNull().default("open"),
  priority: text("priority").notNull().default("medium"),
  messages: jsonb("messages").notNull().default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

const notificationsTable = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull().default("info"),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

const referralsTable = pgTable("referrals", {
  id: serial("id").primaryKey(),
  referrerId: integer("referrer_id").notNull(),
  referredUserId: integer("referred_user_id").notNull(),
  earned: text("earned").notNull().default("0"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

const nokosAppsTable = pgTable("nokos_apps", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  icon: text("icon").notNull(),
  price: numeric("price", { precision: 15, scale: 2 }).notNull(),
  stock: integer("stock").notNull().default(100),
  countries: text("countries").array().notNull().default([]),
  isActive: text("is_active").notNull().default("true"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

const nokosNumbersTable = pgTable("nokos_numbers", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  appId: integer("app_id").notNull(),
  number: text("number").notNull(),
  country: text("country").notNull(),
  app: text("app").notNull(),
  status: text("status").notNull().default("active"),
  price: numeric("price", { precision: 15, scale: 2 }).notNull(),
  otp: text("otp"),
  otpHistory: jsonb("otp_history").notNull().default([]),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

// ── DB ────────────────────────────────────────────────────────────────────────
const sql = neon(process.env.DATABASE_URL as string);
const db = drizzle(sql, {
  schema: {
    usersTable, servicesCategoryTable, servicesTable, favoriteServicesTable,
    ordersTable, depositsTable, transactionsTable, ticketsTable,
    notificationsTable, referralsTable, nokosAppsTable, nokosNumbersTable,
  }
});

// ── JWT ───────────────────────────────────────────────────────────────────────
const SECRET = process.env.SESSION_SECRET ?? "smm-panel-secret-key";

function signToken(payload: { userId: number; role: string }): string {
  return jwt.sign(payload, SECRET, { expiresIn: "30d" });
}

function verifyToken(token: string): { userId: number; role: string } | null {
  try { return jwt.verify(token, SECRET) as { userId: number; role: string }; }
  catch { return null; }
}

// ── Auth Middleware ───────────────────────────────────────────────────────────
interface AuthRequest extends Request {
  userId?: number;
  userRole?: string;
}

function requireAuth(req: AuthRequest, res: Response, next: NextFunction): void {
  const auth = req.headers.authorization as string | undefined;
  if (!auth?.startsWith("Bearer ")) { res.status(401).json({ error: "Unauthorized" }); return; }
  const payload = verifyToken(auth.slice(7));
  if (!payload) { res.status(401).json({ error: "Invalid or expired token" }); return; }
  req.userId = payload.userId;
  req.userRole = payload.role;
  next();
}

function requireAdmin(req: AuthRequest, res: Response, next: NextFunction): void {
  requireAuth(req, res, () => {
    if (req.userRole !== "admin") { res.status(403).json({ error: "Forbidden" }); return; }
    next();
  });
}

// ── Express App ───────────────────────────────────────────────────────────────
const app: Express = express();
app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const router = Router();

// Health
router.get("/healthz", (_req, res) => res.json({ status: "ok" }));

// ── Auth ──────────────────────────────────────────────────────────────────────
router.post("/auth/register", async (req: any, res: any): Promise<void> => {
  const { name, email, password, referralCode } = req.body;
  if (!name || !email || !password) { res.status(400).json({ error: "Nama, email, dan password wajib diisi" }); return; }
  const existing = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (existing.length > 0) { res.status(400).json({ error: "Email sudah terdaftar" }); return; }
  let referredBy: number | undefined;
  if (referralCode) {
    const ref = await db.select().from(usersTable).where(eq(usersTable.referralCode, referralCode));
    if (ref.length > 0) referredBy = ref[0].id;
  }
  const passwordHash = await bcrypt.hash(password, 12);
  const myCode = crypto.randomBytes(4).toString("hex").toUpperCase();
  const apiKey = crypto.randomBytes(16).toString("hex");
  const [user] = await db.insert(usersTable).values({ name, email, passwordHash, referralCode: myCode, referredBy, apiKey }).returning();
  const token = signToken({ userId: user.id, role: user.role });
  res.status(201).json({ token, user: serializeUser(user) });
});

router.post("/auth/login", async (req: any, res: any): Promise<void> => {
  const { email, password } = req.body;
  if (!email || !password) { res.status(400).json({ error: "Email dan password wajib diisi" }); return; }
  const users = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (users.length === 0) { res.status(401).json({ error: "Email atau password salah" }); return; }
  const valid = await bcrypt.compare(password, users[0].passwordHash);
  if (!valid) { res.status(401).json({ error: "Email atau password salah" }); return; }
  const token = signToken({ userId: users[0].id, role: users[0].role });
  res.json({ token, user: serializeUser(users[0]) });
});

router.post("/auth/logout", (_req: any, res: any) => res.json({ success: true }));

router.get("/auth/me", requireAuth, async (req: any, res: any): Promise<void> => {
  const users = await db.select().from(usersTable).where(eq(usersTable.id, req.userId!));
  if (!users.length) { res.status(404).json({ error: "User tidak ditemukan" }); return; }
  res.json(serializeUser(users[0]));
});

router.patch("/users/profile", requireAuth, async (req: any, res: any): Promise<void> => {
  const { name, currentPassword, newPassword } = req.body;
  const users = await db.select().from(usersTable).where(eq(usersTable.id, req.userId!));
  if (!users.length) { res.status(404).json({ error: "User tidak ditemukan" }); return; }
  const updates: any = {};
  if (name) updates.name = name;
  if (currentPassword && newPassword) {
    const valid = await bcrypt.compare(currentPassword, users[0].passwordHash);
    if (!valid) { res.status(400).json({ error: "Password saat ini salah" }); return; }
    updates.passwordHash = await bcrypt.hash(newPassword, 12);
  }
  const [updated] = await db.update(usersTable).set(updates).where(eq(usersTable.id, req.userId!)).returning();
  res.json(serializeUser(updated));
});

router.get("/users/api-key", requireAuth, async (req: any, res: any): Promise<void> => {
  const users = await db.select().from(usersTable).where(eq(usersTable.id, req.userId!));
  res.json({ apiKey: users[0]?.apiKey ?? "" });
});

router.post("/users/api-key", requireAuth, async (req: any, res: any): Promise<void> => {
  const newKey = crypto.randomBytes(16).toString("hex");
  await db.update(usersTable).set({ apiKey: newKey }).where(eq(usersTable.id, req.userId!));
  res.json({ apiKey: newKey });
});

// ── Services ──────────────────────────────────────────────────────────────────
router.get("/services", async (req: any, res: any): Promise<void> => {
  const conds: any[] = [eq(servicesTable.isActive, true)];
  if (req.query.category) conds.push(eq(servicesTable.category, req.query.category));
  if (req.query.platform) conds.push(eq(servicesTable.platform, req.query.platform));
  if (req.query.search) conds.push(ilike(servicesTable.name, `%${req.query.search}%`));
  const services = await db.select().from(servicesTable).where(and(...conds)).orderBy(servicesTable.sortOrder);
  let favIds: number[] = [];
  const auth = req.headers.authorization as string | undefined;
  if (auth?.startsWith("Bearer ")) {
    const payload = verifyToken(auth.slice(7));
    if (payload) {
      const favs = await db.select().from(favoriteServicesTable).where(eq(favoriteServicesTable.userId, payload.userId));
      favIds = favs.map(f => f.serviceId);
    }
  }
  res.json(services.map(s => ({ ...s, price: parseFloat(s.price), isFavorite: favIds.includes(s.id) })));
});

router.get("/services/categories", async (_req: any, res: any): Promise<void> => {
  const cats = await db.select().from(servicesCategoryTable).orderBy(servicesCategoryTable.sortOrder);
  res.json(cats);
});

router.post("/services/:id/favorite", requireAuth, async (req: any, res: any): Promise<void> => {
  const serviceId = parseInt(req.params.id);
  const existing = await db.select().from(favoriteServicesTable).where(and(eq(favoriteServicesTable.userId, req.userId!), eq(favoriteServicesTable.serviceId, serviceId)));
  if (existing.length > 0) {
    await db.delete(favoriteServicesTable).where(and(eq(favoriteServicesTable.userId, req.userId!), eq(favoriteServicesTable.serviceId, serviceId)));
    res.json({ isFavorite: false });
  } else {
    await db.insert(favoriteServicesTable).values({ userId: req.userId!, serviceId });
    res.json({ isFavorite: true });
  }
});

// ── Orders ────────────────────────────────────────────────────────────────────
router.get("/orders", requireAuth, async (req: any, res: any): Promise<void> => {
  const page = parseInt(req.query.page ?? "1", 10);
  const limit = parseInt(req.query.limit ?? "20", 10);
  const offset = (page - 1) * limit;
  const conds: any[] = [eq(ordersTable.userId, req.userId!)];
  if (req.query.status) conds.push(eq(ordersTable.status, req.query.status));
  const [{ count }] = await db.select({ count: drizzleSql<number>`count(*)::int` }).from(ordersTable).where(and(...conds));
  const orders = await db.select().from(ordersTable).where(and(...conds)).orderBy(desc(ordersTable.createdAt)).limit(limit).offset(offset);
  res.json({ orders: orders.map(serializeOrder), total: count, page, limit });
});

router.post("/orders", requireAuth, async (req: any, res: any): Promise<void> => {
  const { serviceId, link, quantity, notes } = req.body;
  if (!serviceId || !link || !quantity) { res.status(400).json({ error: "serviceId, link, dan quantity wajib diisi" }); return; }
  const svcs = await db.select().from(servicesTable).where(eq(servicesTable.id, serviceId));
  if (!svcs.length) { res.status(404).json({ error: "Layanan tidak ditemukan" }); return; }
  const svc = svcs[0];
  if (quantity < svc.minOrder || quantity > svc.maxOrder) { res.status(400).json({ error: `Quantity harus antara ${svc.minOrder} dan ${svc.maxOrder}` }); return; }
  const totalPrice = (quantity / 1000) * parseFloat(svc.price);
  const users = await db.select().from(usersTable).where(eq(usersTable.id, req.userId!));
  if (!users.length) { res.status(404).json({ error: "User tidak ditemukan" }); return; }
  if (parseFloat(users[0].balance) < totalPrice) { res.status(400).json({ error: "Saldo tidak cukup" }); return; }
  const [order] = await db.insert(ordersTable).values({ userId: req.userId!, serviceId, serviceName: svc.name, platform: svc.platform, link, quantity, price: totalPrice.toString(), status: "pending" }).returning();
  const newBal = parseFloat(users[0].balance) - totalPrice;
  await db.update(usersTable).set({ balance: newBal.toString(), totalOrders: users[0].totalOrders + 1 }).where(eq(usersTable.id, req.userId!));
  await db.insert(transactionsTable).values({ userId: req.userId!, type: "order", amount: (-totalPrice).toString(), balance: newBal.toString(), description: `Order #${order.id}: ${svc.name}` });
  await db.insert(notificationsTable).values({ userId: req.userId!, title: "Order dibuat", message: `Order #${order.id} berhasil dibuat`, type: "order" });
  res.status(201).json(serializeOrder(order));
});

// ── Deposits ──────────────────────────────────────────────────────────────────
router.get("/deposits", requireAuth, async (req: any, res: any): Promise<void> => {
  const deps = await db.select().from(depositsTable).where(eq(depositsTable.userId, req.userId!)).orderBy(desc(depositsTable.createdAt));
  res.json(deps.map(d => ({ ...d, amount: parseFloat(d.amount), expiredAt: d.expiredAt?.toISOString() ?? null, createdAt: d.createdAt.toISOString(), updatedAt: d.updatedAt.toISOString() })));
});

router.post("/deposits", requireAuth, async (req: any, res: any): Promise<void> => {
  const { amount, method } = req.body;
  if (!amount || !method) { res.status(400).json({ error: "Amount dan method wajib diisi" }); return; }
  const expiredAt = new Date(Date.now() + 30 * 60 * 1000);
  const [dep] = await db.insert(depositsTable).values({ userId: req.userId!, amount: amount.toString(), method, status: "pending", expiredAt }).returning();
  await db.insert(notificationsTable).values({ userId: req.userId!, title: "Deposit dibuat", message: `Deposit Rp ${amount} sedang diproses`, type: "deposit" });
  res.status(201).json({ ...dep, amount: parseFloat(dep.amount), expiredAt: dep.expiredAt?.toISOString() ?? null, createdAt: dep.createdAt.toISOString(), updatedAt: dep.updatedAt.toISOString() });
});

// ── Transactions ──────────────────────────────────────────────────────────────
router.get("/transactions", requireAuth, async (req: any, res: any): Promise<void> => {
  const txs = await db.select().from(transactionsTable).where(eq(transactionsTable.userId, req.userId!)).orderBy(desc(transactionsTable.createdAt)).limit(50);
  res.json(txs.map(t => ({ ...t, amount: parseFloat(t.amount), balance: parseFloat(t.balance), createdAt: t.createdAt.toISOString() })));
});

// ── Dashboard ─────────────────────────────────────────────────────────────────
router.get("/dashboard/stats", requireAuth, async (req: any, res: any): Promise<void> => {
  const users = await db.select().from(usersTable).where(eq(usersTable.id, req.userId!));
  if (!users.length) { res.status(404).json({ error: "User tidak ditemukan" }); return; }
  const user = users[0];
  const [{ count: totalOrders }] = await db.select({ count: drizzleSql<number>`count(*)::int` }).from(ordersTable).where(eq(ordersTable.userId, req.userId!));
  const [{ count: activeOrders }] = await db.select({ count: drizzleSql<number>`count(*)::int` }).from(ordersTable).where(and(eq(ordersTable.userId, req.userId!), eq(ordersTable.status, "processing")));
  const [{ count: pendingOrders }] = await db.select({ count: drizzleSql<number>`count(*)::int` }).from(ordersTable).where(and(eq(ordersTable.userId, req.userId!), eq(ordersTable.status, "pending")));
  const [{ count: completedOrders }] = await db.select({ count: drizzleSql<number>`count(*)::int` }).from(ordersTable).where(and(eq(ordersTable.userId, req.userId!), eq(ordersTable.status, "completed")));
  const recentOrders = await db.select().from(ordersTable).where(eq(ordersTable.userId, req.userId!)).orderBy(desc(ordersTable.createdAt)).limit(5);
  const recentTransactions = await db.select().from(transactionsTable).where(eq(transactionsTable.userId, req.userId!)).orderBy(desc(transactionsTable.createdAt)).limit(5);
  res.json({
    balance: parseFloat(user.balance), totalOrders, activeOrders, pendingOrders, completedOrders,
    recentOrders: recentOrders.map(serializeOrder),
    recentTransactions: recentTransactions.map(t => ({ ...t, amount: parseFloat(t.amount), balance: parseFloat(t.balance), createdAt: t.createdAt.toISOString() })),
  });
});

// ── Notifications ─────────────────────────────────────────────────────────────
router.get("/notifications", requireAuth, async (req: any, res: any): Promise<void> => {
  const notifs = await db.select().from(notificationsTable).where(eq(notificationsTable.userId, req.userId!)).orderBy(desc(notificationsTable.createdAt)).limit(50);
  res.json(notifs.map(n => ({ ...n, createdAt: n.createdAt.toISOString() })));
});

router.patch("/notifications/read-all", requireAuth, async (req: any, res: any): Promise<void> => {
  await db.update(notificationsTable).set({ isRead: true }).where(eq(notificationsTable.userId, req.userId!));
  res.json({ success: true });
});

router.patch("/notifications/:id/read", requireAuth, async (req: any, res: any): Promise<void> => {
  await db.update(notificationsTable).set({ isRead: true }).where(and(eq(notificationsTable.id, parseInt(req.params.id)), eq(notificationsTable.userId, req.userId!)));
  res.json({ success: true });
});

// ── Tickets ───────────────────────────────────────────────────────────────────
router.get("/tickets", requireAuth, async (req: any, res: any): Promise<void> => {
  const tickets = await db.select().from(ticketsTable).where(eq(ticketsTable.userId, req.userId!)).orderBy(desc(ticketsTable.createdAt));
  res.json(tickets.map(t => ({ ...t, createdAt: t.createdAt.toISOString(), updatedAt: t.updatedAt.toISOString() })));
});

router.post("/tickets", requireAuth, async (req: any, res: any): Promise<void> => {
  const { subject, message, priority } = req.body;
  if (!subject || !message) { res.status(400).json({ error: "Subject dan pesan wajib diisi" }); return; }
  const users = await db.select().from(usersTable).where(eq(usersTable.id, req.userId!));
  const userName = users[0]?.name ?? "User";
  const messages = [{ sender: userName, message, createdAt: new Date().toISOString() }];
  const [ticket] = await db.insert(ticketsTable).values({ userId: req.userId!, subject, status: "open", priority: priority ?? "medium", messages }).returning();
  await db.insert(notificationsTable).values({ userId: req.userId!, title: "Tiket dibuat", message: `Tiket "${subject}" berhasil dibuat`, type: "ticket" });
  res.status(201).json({ ...ticket, createdAt: ticket.createdAt.toISOString(), updatedAt: ticket.updatedAt.toISOString() });
});

// ── Referrals ─────────────────────────────────────────────────────────────────
router.get("/referrals", requireAuth, async (req: any, res: any): Promise<void> => {
  const refs = await db.select().from(referralsTable).where(eq(referralsTable.referrerId, req.userId!)).orderBy(desc(referralsTable.createdAt));
  res.json(refs.map(r => ({ ...r, createdAt: r.createdAt.toISOString() })));
});

// ── Nokos ──────────────────────────────────────────────────────────────────────
const COUNTRIES = [
  { code: "ID", name: "Indonesia", flag: "🇮🇩", phoneCode: "+62" },
  { code: "US", name: "United States", flag: "🇺🇸", phoneCode: "+1" },
  { code: "RU", name: "Russia", flag: "🇷🇺", phoneCode: "+7" },
  { code: "IN", name: "India", flag: "🇮🇳", phoneCode: "+91" },
  { code: "MY", name: "Malaysia", flag: "🇲🇾", phoneCode: "+60" },
];

router.get("/nokos/apps", async (_req: any, res: any) => {
  const apps = await db.select().from(nokosAppsTable).where(eq(nokosAppsTable.isActive, "true"));
  res.json(apps.map(a => ({ ...a, price: parseFloat(a.price) })));
});

router.get("/nokos/countries", (_req: any, res: any) => res.json(COUNTRIES));

router.get("/nokos/numbers", requireAuth, async (req: any, res: any): Promise<void> => {
  const numbers = await db.select().from(nokosNumbersTable).where(eq(nokosNumbersTable.userId, req.userId!)).orderBy(desc(nokosNumbersTable.createdAt));
  res.json(numbers.map(n => ({ ...n, price: parseFloat(n.price), expiresAt: n.expiresAt?.toISOString() ?? null, createdAt: n.createdAt.toISOString() })));
});

router.post("/nokos/buy", requireAuth, async (req: any, res: any): Promise<void> => {
  const { appId, country } = req.body;
  if (!appId || !country) { res.status(400).json({ error: "appId dan country wajib diisi" }); return; }
  const apps = await db.select().from(nokosAppsTable).where(eq(nokosAppsTable.id, appId));
  if (!apps.length) { res.status(404).json({ error: "App tidak ditemukan" }); return; }
  const app = apps[0];
  const users = await db.select().from(usersTable).where(eq(usersTable.id, req.userId!));
  if (!users.length) { res.status(404).json({ error: "User tidak ditemukan" }); return; }
  if (parseFloat(users[0].balance) < parseFloat(app.price)) { res.status(400).json({ error: "Saldo tidak cukup" }); return; }
  const cInfo = COUNTRIES.find(c => c.code === country);
  const phoneCode = cInfo?.phoneCode ?? "+62";
  const randomNum = Math.floor(Math.random() * 9000000000) + 1000000000;
  const number = `${phoneCode}${randomNum}`;
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
  const [num] = await db.insert(nokosNumbersTable).values({ userId: req.userId!, appId, number, country, app: app.name, price: app.price, status: "active", expiresAt }).returning();
  const newBal = parseFloat(users[0].balance) - parseFloat(app.price);
  await db.update(usersTable).set({ balance: newBal.toString() }).where(eq(usersTable.id, req.userId!));
  res.status(201).json({ ...num, price: parseFloat(num.price), expiresAt: num.expiresAt?.toISOString() ?? null, createdAt: num.createdAt.toISOString() });
});

// ── Admin ─────────────────────────────────────────────────────────────────────
router.get("/admin/stats", requireAdmin, async (_req: any, res: any): Promise<void> => {
  const [{ count: totalUsers }] = await db.select({ count: drizzleSql<number>`count(*)::int` }).from(usersTable);
  const [{ count: totalOrders }] = await db.select({ count: drizzleSql<number>`count(*)::int` }).from(ordersTable);
  const [{ count: pendingDeposits }] = await db.select({ count: drizzleSql<number>`count(*)::int` }).from(depositsTable).where(eq(depositsTable.status, "pending"));
  const [{ total: totalRevenue }] = await db.select({ total: drizzleSql<number>`coalesce(sum(amount::numeric), 0)::float` }).from(depositsTable).where(eq(depositsTable.status, "approved"));
  res.json({ totalUsers, totalOrders, pendingDeposits, totalRevenue: totalRevenue ?? 0 });
});

router.get("/admin/users", requireAdmin, async (_req: any, res: any): Promise<void> => {
  const users = await db.select().from(usersTable).orderBy(desc(usersTable.createdAt));
  res.json(users.map(serializeUser));
});

router.patch("/admin/users/:id/balance", requireAdmin, async (req: any, res: any): Promise<void> => {
  const { amount, description } = req.body;
  const userId = parseInt(req.params.id);
  const users = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (!users.length) { res.status(404).json({ error: "User tidak ditemukan" }); return; }
  const newBalance = parseFloat(users[0].balance) + amount;
  await db.update(usersTable).set({ balance: newBalance.toString() }).where(eq(usersTable.id, userId));
  await db.insert(transactionsTable).values({ userId, type: "adjustment", amount: amount.toString(), balance: newBalance.toString(), description: description ?? "Admin adjustment" });
  res.json({ success: true, newBalance });
});

router.get("/admin/orders", requireAdmin, async (_req: any, res: any): Promise<void> => {
  const orders = await db.select().from(ordersTable).orderBy(desc(ordersTable.createdAt)).limit(100);
  res.json(orders.map(serializeOrder));
});

router.get("/admin/deposits", requireAdmin, async (_req: any, res: any): Promise<void> => {
  const deps = await db.select().from(depositsTable).orderBy(desc(depositsTable.createdAt)).limit(100);
  res.json(deps.map(d => ({ ...d, amount: parseFloat(d.amount), expiredAt: d.expiredAt?.toISOString() ?? null, createdAt: d.createdAt.toISOString(), updatedAt: d.updatedAt.toISOString() })));
});

router.patch("/admin/deposits/:id/approve", requireAdmin, async (req: any, res: any): Promise<void> => {
  const id = parseInt(req.params.id);
  const deps = await db.select().from(depositsTable).where(eq(depositsTable.id, id));
  if (!deps.length) { res.status(404).json({ error: "Deposit tidak ditemukan" }); return; }
  if (deps[0].status !== "pending") { res.status(400).json({ error: "Deposit sudah diproses" }); return; }
  await db.update(depositsTable).set({ status: "approved" }).where(eq(depositsTable.id, id));
  const users = await db.select().from(usersTable).where(eq(usersTable.id, deps[0].userId));
  if (users.length) {
    const newBal = parseFloat(users[0].balance) + parseFloat(deps[0].amount);
    const newDep = parseFloat(users[0].totalDeposited) + parseFloat(deps[0].amount);
    await db.update(usersTable).set({ balance: newBal.toString(), totalDeposited: newDep.toString() }).where(eq(usersTable.id, deps[0].userId));
    await db.insert(transactionsTable).values({ userId: deps[0].userId, type: "deposit", amount: deps[0].amount, balance: newBal.toString(), description: `Deposit via ${deps[0].method}` });
    await db.insert(notificationsTable).values({ userId: deps[0].userId, title: "Deposit disetujui", message: `Deposit Rp ${deps[0].amount} telah disetujui`, type: "deposit" });
  }
  res.json({ success: true });
});

router.patch("/admin/deposits/:id/reject", requireAdmin, async (req: any, res: any): Promise<void> => {
  await db.update(depositsTable).set({ status: "rejected" }).where(eq(depositsTable.id, parseInt(req.params.id)));
  res.json({ success: true });
});

router.get("/admin/services", requireAdmin, async (_req: any, res: any): Promise<void> => {
  const svcs = await db.select().from(servicesTable).orderBy(servicesTable.sortOrder);
  res.json(svcs.map(s => ({ ...s, price: parseFloat(s.price) })));
});

router.post("/admin/services", requireAdmin, async (req: any, res: any): Promise<void> => {
  const { name, description, platform, category, price, minOrder, maxOrder, sortOrder } = req.body;
  const [svc] = await db.insert(servicesTable).values({ name, description, platform, category, price: price.toString(), minOrder, maxOrder, sortOrder: sortOrder ?? 0, isActive: true }).returning();
  res.status(201).json({ ...svc, price: parseFloat(svc.price) });
});

router.patch("/admin/services/:id", requireAdmin, async (req: any, res: any): Promise<void> => {
  const updates = { ...req.body };
  if (updates.price) updates.price = updates.price.toString();
  const [updated] = await db.update(servicesTable).set(updates).where(eq(servicesTable.id, parseInt(req.params.id))).returning();
  res.json({ ...updated, price: parseFloat(updated.price) });
});

router.delete("/admin/services/:id", requireAdmin, async (req: any, res: any): Promise<void> => {
  await db.update(servicesTable).set({ isActive: false }).where(eq(servicesTable.id, parseInt(req.params.id)));
  res.json({ success: true });
});

router.post("/admin/broadcast", requireAdmin, async (req: any, res: any): Promise<void> => {
  const { title, message, type } = req.body;
  const allUsers = await db.select({ id: usersTable.id }).from(usersTable);
  await Promise.all(allUsers.map(u => db.insert(notificationsTable).values({ userId: u.id, title, message, type: type ?? "info" })));
  res.json({ success: true, sent: allUsers.length });
});

// ── Serializers ───────────────────────────────────────────────────────────────
function serializeUser(u: any) {
  return { id: u.id, name: u.name, email: u.email, balance: parseFloat(u.balance), role: u.role, referralCode: u.referralCode, totalOrders: u.totalOrders, totalDeposited: parseFloat(u.totalDeposited), createdAt: u.createdAt instanceof Date ? u.createdAt.toISOString() : u.createdAt };
}

function serializeOrder(o: any) {
  return { ...o, price: parseFloat(o.price), createdAt: o.createdAt instanceof Date ? o.createdAt.toISOString() : o.createdAt, updatedAt: o.updatedAt instanceof Date ? o.updatedAt.toISOString() : o.updatedAt };
}

// ── Mount & Export ────────────────────────────────────────────────────────────
app.use("/api", router);

// Express 5 global error handler
app.use((err: any, _req: any, res: any, _next: any) => {
  console.error("API Error:", err?.message);
  res.status(err?.status ?? 500).json({ error: err?.message ?? "Internal server error" });
});

export default app;
