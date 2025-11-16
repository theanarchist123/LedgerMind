import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { getDbSync } from "./mongodb";

export const auth = betterAuth({
  database: mongodbAdapter(getDbSync()),
  secret: process.env.BETTER_AUTH_SECRET || "default-secret-change-in-production-min-32-chars-long",
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  trustedOrigins: ["http://localhost:3000"],
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  user: {
    additionalFields: {
      name: {
        type: "string",
        required: false,
      },
    },
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
  },
  advanced: {
    cookiePrefix: "ledgermind",
  },
});

export type Session = typeof auth.$Infer.Session;
