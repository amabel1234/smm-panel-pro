import { pgTable, text, serial, timestamp, numeric, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const nokosAppsTable = pgTable("nokos_apps", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  icon: text("icon").notNull(),
  price: numeric("price", { precision: 15, scale: 2 }).notNull(),
  stock: integer("stock").notNull().default(100),
  countries: text("countries").array().notNull().default([]),
  isActive: text("is_active").notNull().default("true"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const nokosNumbersTable = pgTable("nokos_numbers", {
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

export const insertNokosNumberSchema = createInsertSchema(nokosNumbersTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertNokosNumber = z.infer<typeof insertNokosNumberSchema>;
export type NokosNumber = typeof nokosNumbersTable.$inferSelect;
