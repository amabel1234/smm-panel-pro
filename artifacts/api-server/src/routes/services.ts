import { Router, type IRouter } from "express";
import { eq, ilike, and, sql } from "drizzle-orm";
import { db, servicesTable, servicesCategoryTable, favoriteServicesTable } from "@workspace/db";
import { requireAuth, type AuthRequest } from "../middlewares/requireAuth";

const router: IRouter = Router();

router.get("/services", async (req, res): Promise<void> => {
  let query = db.select().from(servicesTable).where(eq(servicesTable.isActive, true)).$dynamic();

  const conditions = [eq(servicesTable.isActive, true)];
  if (req.query.category) conditions.push(eq(servicesTable.category, req.query.category as string));
  if (req.query.platform) conditions.push(eq(servicesTable.platform, req.query.platform as string));
  if (req.query.search) conditions.push(ilike(servicesTable.name, `%${req.query.search}%`));

  const services = await db.select().from(servicesTable).where(and(...conditions)).orderBy(servicesTable.sortOrder);

  let favIds: number[] = [];
  const auth = req.headers.authorization;
  if (auth?.startsWith("Bearer ")) {
    const { verifyToken } = await import("../lib/jwt");
    const payload = verifyToken(auth.slice(7));
    if (payload) {
      const favs = await db.select().from(favoriteServicesTable).where(eq(favoriteServicesTable.userId, payload.userId));
      favIds = favs.map(f => f.serviceId);
    }
  }

  res.json(services.map(s => ({
    id: s.id, name: s.name, category: s.category, platform: s.platform,
    price: parseFloat(s.price), minOrder: s.minOrder, maxOrder: s.maxOrder,
    description: s.description, isActive: s.isActive, refillAvailable: s.refillAvailable,
    avgCompletionTime: s.avgCompletionTime, isFavorited: favIds.includes(s.id),
  })));
});

router.get("/services/categories", async (_req, res): Promise<void> => {
  const cats = await db.select().from(servicesCategoryTable).orderBy(servicesCategoryTable.sortOrder);
  const counts = await db.select({
    category: servicesTable.category,
    count: sql<number>`count(*)::int`,
  }).from(servicesTable).where(eq(servicesTable.isActive, true)).groupBy(servicesTable.category);

  const countMap = Object.fromEntries(counts.map(c => [c.category, c.count]));
  res.json(cats.map(c => ({
    id: c.id, name: c.name, platform: c.platform, icon: c.icon,
    serviceCount: countMap[c.name] ?? 0,
  })));
});

router.get("/services/featured", async (_req, res): Promise<void> => {
  const services = await db.select().from(servicesTable)
    .where(eq(servicesTable.isActive, true)).orderBy(servicesTable.sortOrder).limit(12);
  res.json(services.map(s => ({
    id: s.id, name: s.name, category: s.category, platform: s.platform,
    price: parseFloat(s.price), minOrder: s.minOrder, maxOrder: s.maxOrder,
    description: s.description, isActive: s.isActive, refillAvailable: s.refillAvailable,
    avgCompletionTime: s.avgCompletionTime, isFavorited: false,
  })));
});

router.get("/services/:id", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);
  const services = await db.select().from(servicesTable).where(eq(servicesTable.id, id));
  if (services.length === 0) { res.status(404).json({ error: "Service not found" }); return; }
  const s = services[0];
  res.json({
    id: s.id, name: s.name, category: s.category, platform: s.platform,
    price: parseFloat(s.price), minOrder: s.minOrder, maxOrder: s.maxOrder,
    description: s.description, isActive: s.isActive, refillAvailable: s.refillAvailable,
    avgCompletionTime: s.avgCompletionTime, isFavorited: false,
  });
});

router.post("/services/:id/favorite", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);
  const existing = await db.select().from(favoriteServicesTable)
    .where(and(eq(favoriteServicesTable.userId, req.userId!), eq(favoriteServicesTable.serviceId, id)));

  if (existing.length > 0) {
    await db.delete(favoriteServicesTable)
      .where(and(eq(favoriteServicesTable.userId, req.userId!), eq(favoriteServicesTable.serviceId, id)));
    res.json({ favorited: false });
  } else {
    await db.insert(favoriteServicesTable).values({ userId: req.userId!, serviceId: id });
    res.json({ favorited: true });
  }
});

export default router;
