import 'dotenv/config';
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import db from "@/db";
import { headers } from "next/headers";

if (!db) {
  throw new Error("Database not initialized. Ensure DATABASE_URL is set in environment.");
}

export const auth = betterAuth({
    database: drizzleAdapter(db, { 
        provider: "pg",
    }),
    pages: {
        signIn: "/login",
    },  
    socialProviders: {
        github: { 
            clientId: process.env.GITHUB_CLIENT_ID as string, 
            clientSecret: process.env.GITHUB_CLIENT_SECRET as string, 
        }, 
        google: { 
            clientId: process.env.GOOGLE_CLIENT_ID as string, 
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string, 
        },
    },
});

export const getSession = async () => {
    try {
        return await auth.api.getSession({
            headers: await headers(),
        });
    } catch {
        return null;
    }
};