import { boolean, integer, pgTable, real, text, timestamp, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

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


export const plan = pgTable("plan", {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    stripePriceId: text("stripe_price_id"),
    price: text("price"),
    interval: text("interval").notNull(),
    meetingLimit: text("meeting_limit"),
    minuteLimit: text("minute_limit"),
    aiLimit: text("ai_limit"),
    features: text("features"),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at").notNull(),
    updatedAt: timestamp("updated_at").notNull(),
});

export const subscription = pgTable("subscription", {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
    stripeCustomerId: text("stripe_customer_id").notNull().unique(),
    stripeSubscriptionId: text("stripe_subscription_id").unique(),
    planId: text("plan_id").notNull().references(() => plan.id, { onDelete: "cascade" }),
    status: text("status").notNull().default("inactive"),
    currentPeriodStart: timestamp("current_period_start"),
    currentPeriodEnd: timestamp("current_period_end"),
    createdAt: timestamp("created_at").notNull(),
    updatedAt: timestamp("updated_at").notNull(),
});

export const usage = pgTable("usage", {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
    meetingsUsed: text("meetings_used").notNull().default("0"),
    minutesUsed: text("minutes_used").notNull().default("0"),
    aiInteractionsUsed: text("ai_interactions_used").notNull().default("0"),
    periodStart: timestamp("period_start").notNull(),
    periodEnd: timestamp("period_end").notNull(),
    createdAt: timestamp("created_at").notNull(),
    updatedAt: timestamp("updated_at").notNull(),
});

export const userRelations = relations(user, ({ many }) => ({
    subscriptions: many(subscription),
    sessions: many(session),
    accounts: many(account),
    usage: many(usage),
}));

export const subscriptionRelations = relations(subscription, ({ one }) => ({
    user: one(user, {
        fields: [subscription.userId],
        references: [user.id],
    }),
    plan: one(plan, {
        fields: [subscription.planId],
        references: [plan.id],
    }),
}));

export const usageRelations = relations(usage, ({ one }) => ({
    user: one(user, {
        fields: [usage.userId],
        references: [user.id],
    }),
}));

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

export const summaries = pgTable("summaries", {
    id: text("id").primaryKey(),
    meetingId: text("meeting_id").notNull().references(() => meetings.id, { onDelete: "cascade" }),
    executiveSummary: text("executive_summary"),
    topics: jsonb("topics"),
    actionItems: jsonb("action_items"),
    decisions: jsonb("decisions"),
    sentiment: text("sentiment"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const meetingAnalytics = pgTable("meeting_analytics", {
    id: text("id").primaryKey(),
    meetingId: text("meeting_id").notNull().references(() => meetings.id, { onDelete: "cascade" }),
    speakerId: text("speaker_id").references(() => speakers.id, { onDelete: "set null" }),
    speakerName: text("speaker_name"),
    talkTimeMs: integer("talk_time_ms").notNull().default(0),
    wordCount: integer("word_count").notNull().default(0),
    speakingTurns: integer("speaking_turns").notNull().default(0),
    sentimentScore: real("sentiment_score"),
    engagementScore: real("engagement_score"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type User = typeof user.$inferSelect;
export type Session = typeof session.$inferSelect;
export type Account = typeof account.$inferSelect;
export type Verification = typeof verification.$inferSelect;
export type Meeting = typeof meetings.$inferSelect;
export type Speaker = typeof speakers.$inferSelect;
export type Transcript = typeof transcripts.$inferSelect;
export type Summary = typeof summaries.$inferSelect;
export type MeetingAnalytics = typeof meetingAnalytics.$inferSelect;
export type NewMeeting = typeof meetings.$inferInsert;
export type NewSummary = typeof summaries.$inferInsert;
export type NewMeetingAnalytics = typeof meetingAnalytics.$inferInsert;

