import { Router, type IRouter } from "express";
import { eq, and, desc } from "drizzle-orm";
import { db, nokosAppsTable, nokosNumbersTable, usersTable, transactionsTable, notificationsTable } from "@workspace/db";
import { requireAuth, type AuthRequest } from "../middlewares/requireAuth";
import { BuyNumberBody } from "@workspace/api-zod";

const router: IRouter = Router();

const COUNTRIES = [
  { code: "ID", name: "Indonesia", flag: "🇮🇩", phoneCode: "+62" },
  { code: "US", name: "United States", flag: "🇺🇸", phoneCode: "+1" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧", phoneCode: "+44" },
  { code: "RU", name: "Russia", flag: "🇷🇺", phoneCode: "+7" },
  { code: "IN", name: "India", flag: "🇮🇳", phoneCode: "+91" },
  { code: "BR", name: "Brazil", flag: "🇧🇷", phoneCode: "+55" },
  { code: "DE", name: "Germany", flag: "🇩🇪", phoneCode: "+49" },
  { code: "FR", name: "France", flag: "🇫🇷", phoneCode: "+33" },
  { code: "JP", name: "Japan", flag: "🇯🇵", phoneCode: "+81" },
  { code: "CN", name: "China", flag: "🇨🇳", phoneCode: "+86" },
  { code: "MY", name: "Malaysia", flag: "🇲🇾", phoneCode: "+60" },
  { code: "SG", name: "Singapore", flag: "🇸🇬", phoneCode: "+65" },
  { code: "TH", name: "Thailand", flag: "🇹🇭", phoneCode: "+66" },
  { code: "VN", name: "Vietnam", flag: "🇻🇳", phoneCode: "+84" },
  { code: "PH", name: "Philippines", flag: "🇵🇭", phoneCode: "+63" },
];

router.get("/nokos/countries", (_req, res): void => {
  res.json(COUNTRIES);
});

router.get("/nokos/apps", async (req, res): Promise<void> => {
  const country = req.query.country as string | undefined;
  const apps = await db.select().from(nokosAppsTable).where(eq(nokosAppsTable.isActive, "true"));
  const filtered = country
    ? apps.filter(a => a.countries.includes(country) || a.countries.length === 0)
    : apps;
  res.json(filtered.map(a => ({
    id: a.id, name: a.name, icon: a.icon,
    price: parseFloat(a.price), stock: a.stock, country: country ?? "ALL",
  })));
});

router.get("/nokos/numbers", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const numbers = await db.select().from(nokosNumbersTable)
    .where(eq(nokosNumbersTable.userId, req.userId!))
    .orderBy(desc(nokosNumbersTable.createdAt));
  res.json(numbers.map(n => ({
    id: n.id, number: n.number, country: n.country, app: n.app,
    status: n.status, price: parseFloat(n.price), otp: n.otp,
    otpHistory: n.otpHistory as { code: string; receivedAt: string }[],
    createdAt: n.createdAt.toISOString(), expiresAt: n.expiresAt.toISOString(),
  })));
});

router.post("/nokos/numbers", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const parsed = BuyNumberBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const { appId, country } = parsed.data;

  const apps = await db.select().from(nokosAppsTable).where(eq(nokosAppsTable.id, appId));
  if (apps.length === 0) { res.status(404).json({ error: "App not found" }); return; }
  const app = apps[0];

  if (app.stock <= 0) { res.status(400).json({ error: "No stock available" }); return; }

  const users = await db.select().from(usersTable).where(eq(usersTable.id, req.userId!));
  if (users.length === 0) { res.status(404).json({ error: "User not found" }); return; }
  const user = users[0];

  const price = parseFloat(app.price);
  if (parseFloat(user.balance) < price) { res.status(400).json({ error: "Insufficient balance" }); return; }

  const countryData = COUNTRIES.find(c => c.code === country);
  const phoneCode = countryData?.phoneCode.replace("+", "") ?? "62";
  const randomNum = Math.floor(Math.random() * 9000000000) + 1000000000;
  const generatedNumber = `${phoneCode}${randomNum}`;

  const newBalance = parseFloat(user.balance) - price;
  await db.update(usersTable).set({ balance: newBalance.toFixed(2) }).where(eq(usersTable.id, req.userId!));
  await db.update(nokosAppsTable).set({ stock: app.stock - 1 }).where(eq(nokosAppsTable.id, appId));

  const expiresAt = new Date(Date.now() + 20 * 60 * 1000);
  const [number] = await db.insert(nokosNumbersTable).values({
    userId: req.userId!,
    appId,
    number: generatedNumber,
    country,
    app: app.name,
    status: "active",
    price: price.toFixed(2),
    expiresAt,
  }).returning();

  await db.insert(transactionsTable).values({
    userId: req.userId!,
    type: "order",
    amount: (-price).toFixed(2),
    balance: newBalance.toFixed(2),
    description: `Virtual Number - ${app.name} (${country})`,
    referenceId: number.id,
  });

  res.status(201).json({
    id: number.id, number: number.number, country: number.country, app: number.app,
    status: number.status, price: parseFloat(number.price), otp: null, otpHistory: [],
    createdAt: number.createdAt.toISOString(), expiresAt: number.expiresAt.toISOString(),
  });
});

router.get("/nokos/numbers/:id", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);
  const numbers = await db.select().from(nokosNumbersTable)
    .where(and(eq(nokosNumbersTable.id, id), eq(nokosNumbersTable.userId, req.userId!)));
  if (numbers.length === 0) { res.status(404).json({ error: "Number not found" }); return; }
  const n = numbers[0];
  res.json({
    id: n.id, number: n.number, country: n.country, app: n.app,
    status: n.status, price: parseFloat(n.price), otp: n.otp,
    otpHistory: n.otpHistory as { code: string; receivedAt: string }[],
    createdAt: n.createdAt.toISOString(), expiresAt: n.expiresAt.toISOString(),
  });
});

router.post("/nokos/numbers/:id/cancel", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);
  const numbers = await db.select().from(nokosNumbersTable)
    .where(and(eq(nokosNumbersTable.id, id), eq(nokosNumbersTable.userId, req.userId!)));
  if (numbers.length === 0) { res.status(404).json({ error: "Number not found" }); return; }
  const number = numbers[0];
  if (number.status !== "active") { res.status(400).json({ error: "Number is not active" }); return; }

  await db.update(nokosNumbersTable).set({ status: "cancelled" }).where(eq(nokosNumbersTable.id, id));

  const users = await db.select().from(usersTable).where(eq(usersTable.id, req.userId!));
  if (users.length > 0) {
    const refundAmount = parseFloat(number.price) * 0.5;
    const newBalance = parseFloat(users[0].balance) + refundAmount;
    await db.update(usersTable).set({ balance: newBalance.toFixed(2) }).where(eq(usersTable.id, req.userId!));
    await db.insert(transactionsTable).values({
      userId: req.userId!,
      type: "refund",
      amount: refundAmount.toFixed(2),
      balance: newBalance.toFixed(2),
      description: `Refund for cancelled virtual number`,
      referenceId: id,
    });
  }

  res.json({ success: true });
});

export default router;
