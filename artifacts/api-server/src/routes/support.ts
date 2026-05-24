import { Router, type IRouter } from "express";
import { eq, and, desc } from "drizzle-orm";
import { db, ticketsTable, notificationsTable, usersTable } from "@workspace/db";
import { requireAuth, type AuthRequest } from "../middlewares/requireAuth";
import { CreateTicketBody, ReplyTicketBody } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/tickets", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const tickets = await db.select().from(ticketsTable)
    .where(eq(ticketsTable.userId, req.userId!))
    .orderBy(desc(ticketsTable.createdAt));
  res.json(tickets.map(t => ({
    id: t.id, subject: t.subject, status: t.status, priority: t.priority,
    messages: t.messages as { sender: string; message: string; createdAt: string }[],
    createdAt: t.createdAt.toISOString(),
  })));
});

router.post("/tickets", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const parsed = CreateTicketBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const { subject, message, priority } = parsed.data;

  const users = await db.select().from(usersTable).where(eq(usersTable.id, req.userId!));
  const userName = users.length > 0 ? users[0].name : "User";

  const messages = [{ sender: userName, message, createdAt: new Date().toISOString() }];
  const [ticket] = await db.insert(ticketsTable).values({
    userId: req.userId!,
    subject,
    priority,
    status: "open",
    messages,
  }).returning();

  res.status(201).json({
    id: ticket.id, subject: ticket.subject, status: ticket.status, priority: ticket.priority,
    messages: ticket.messages as { sender: string; message: string; createdAt: string }[],
    createdAt: ticket.createdAt.toISOString(),
  });
});

router.post("/tickets/:id/reply", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);
  const parsed = ReplyTicketBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const tickets = await db.select().from(ticketsTable)
    .where(and(eq(ticketsTable.id, id), eq(ticketsTable.userId, req.userId!)));
  if (tickets.length === 0) { res.status(404).json({ error: "Ticket not found" }); return; }
  const ticket = tickets[0];

  const users = await db.select().from(usersTable).where(eq(usersTable.id, req.userId!));
  const userName = users.length > 0 ? users[0].name : "User";

  const messages = ticket.messages as { sender: string; message: string; createdAt: string }[];
  messages.push({ sender: userName, message: parsed.data.message, createdAt: new Date().toISOString() });

  await db.update(ticketsTable).set({ messages, status: "open" }).where(eq(ticketsTable.id, id));
  res.json({ success: true });
});

router.get("/notifications", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const notifs = await db.select().from(notificationsTable)
    .where(eq(notificationsTable.userId, req.userId!))
    .orderBy(desc(notificationsTable.createdAt));
  res.json(notifs.map(n => ({
    id: n.id, title: n.title, message: n.message, type: n.type,
    isRead: n.isRead, createdAt: n.createdAt.toISOString(),
  })));
});

router.post("/notifications/read-all", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  await db.update(notificationsTable)
    .set({ isRead: true })
    .where(eq(notificationsTable.userId, req.userId!));
  res.json({ success: true });
});

export default router;
