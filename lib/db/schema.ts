import { pgTable, serial, text, varchar, boolean, timestamp, integer, primaryKey } from 'drizzle-orm/pg-core';
import type { AdapterAccount } from "next-auth/adapters";

// Tabelle per l'autenticazione NextAuth.js
export const users = pgTable("user", {
  id: text("id").notNull().primaryKey(),
  name: text("name"),
  email: text("email").notNull(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
});

export const accounts = pgTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccount["type"]>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => ({
    compoundKey: primaryKey({ columns: [account.provider, account.providerAccountId] }),
  })
);

export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").notNull().primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
  })
);

// Tabella per i leads
export const leads = pgTable('leads', {
  id: serial('id').primaryKey(),
  nome: varchar('nome', { length: 255 }).notNull(),
  localita: varchar('localita', { length: 255 }).notNull(),
  camere: integer('camere').notNull(),
  telefono: varchar('telefono', { length: 50 }),
  email: varchar('email', { length: 255 }),
  contattato: boolean('contattato').default(false),
  note: text('note'),
  status: varchar('status', { length: 50 }).default('lead'), // 'lead', 'foto', 'appuntamento', 'ghost', 'ricontattare', 'cliente_attesa', 'cliente_confermato'
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Tabella per gli appuntamenti
export const appuntamenti = pgTable('appuntamenti', {
  id: serial('id').primaryKey(),
  leadId: integer('lead_id').references(() => leads.id),
  data: timestamp('data').notNull(),
  tipo: varchar('tipo', { length: 100 }), // 'incontro', 'sopralluogo', 'chiamata', etc.
  luogo: varchar('luogo', { length: 255 }),
  note: text('note'),
  completato: boolean('completato').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Tabella per i tasks/eventi generali
export const tasks = pgTable('tasks', {
  id: serial('id').primaryKey(),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }),
  leadId: integer('lead_id').references(() => leads.id, { onDelete: 'set null' }), // Riferimento opzionale alla lead
  titolo: varchar('titolo', { length: 255 }).notNull(),
  descrizione: text('descrizione'),
  tipo: varchar('tipo', { length: 50 }).notNull(), // 'task', 'reminder', 'call', 'meeting', 'follow-up', 'personal'
  priorita: varchar('priorita', { length: 20 }).default('media'), // 'bassa', 'media', 'alta', 'urgente'
  stato: varchar('stato', { length: 20 }).default('da_fare'), // 'da_fare', 'in_corso', 'completato', 'annullato'
  dataScadenza: timestamp('data_scadenza'),
  completato: boolean('completato').default(false),
  colore: varchar('colore', { length: 50 }).default('#3b82f6'), // hex color or CSS classes for calendar
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export type Lead = typeof leads.$inferSelect;
export type NewLead = typeof leads.$inferInsert;
export type Appuntamento = typeof appuntamenti.$inferSelect;
export type NewAppuntamento = typeof appuntamenti.$inferInsert;
export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;