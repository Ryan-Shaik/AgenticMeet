import { boolean, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const user =  pgTable("user", {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    image: text("image"),
    emailVerified: boolean("email_verified").notNull().default(false),
    createdAt: timestamp("created_at").notNull(),
    updatedAt: timestamp("updated_at").notNull(),
});

export const session = pgTable("session", {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull().references(() => user.id, {onDelete: "cascade"}),
    token: text("token").notNull().unique(),
    expiresAt: timestamp("expires_at").notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at").notNull(),
    updatedAt: timestamp("updated_at").notNull(),
});

export const account = pgTable("account", {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id").notNull().references(() => user.id, {onDelete: "cascade"}),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").notNull(),
    updatedAt: timestamp("updated_at").notNull(),
});

export const verification = pgTable("verification", {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at"),
    updatedAt: timestamp("updated_at"),
});

export const meetings = pgTable("meetings", {
    id: text("id").primaryKey(),
    title: text("title"),
    hostId: text("host_id"),
    status: text("status").default("active"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const speakers = pgTable("speakers", {
    id: text("id").primaryKey(),
    meetingId: text("meeting_id").notNull().references(() => meetings.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
    isAI: boolean("is_ai").notNull().default(false),
    createdAt: timestamp("created_at").notNull(),
});

export const transcripts = pgTable("transcripts", {
    id: text("id").primaryKey(),
    meetingId: text("meeting_id").notNull().references(() => meetings.id, { onDelete: "cascade" }),
    speakerId: text("speaker_id").references(() => speakers.id, { onDelete: "set null" }),
    speakerName: text("speaker_name"),
    content: text("content").notNull(),
    timestamp: timestamp("timestamp").notNull(),
    createdAt: timestamp("created_at").notNull(),
});

export type User = typeof user.$inferSelect;
export type Session = typeof session.$inferSelect;
export type Account = typeof account.$inferSelect;
export type Verification = typeof verification.$inferSelect;
export type Meeting = typeof meetings.$inferSelect;
export type Speaker = typeof speakers.$inferSelect;
export type Transcript = typeof transcripts.$inferSelect;
export type NewMeeting = typeof meetings.$inferInsert;


