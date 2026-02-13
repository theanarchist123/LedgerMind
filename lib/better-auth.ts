import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { getDbSync } from "./mongodb";

export const auth = betterAuth({
  database: mongodbAdapter(getDbSync()),
  secret: process.env.BETTER_AUTH_SECRET || "default-secret-change-in-production-min-32-chars-long",
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  trustedOrigins: [
    "http://localhost:3000",
    "http://localhost:3001",
    "https://ledger-mind-30.vercel.app",
    "ledgermind://auth", // Deep link for mobile OAuth
    "capacitor://localhost"
  ],
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    sendResetPassword: async ({ user, url }) => {
      // Password reset email - log to console for now
      console.log(`Password reset link for ${user.email}: ${url}`);
      // TODO: Integrate with email service (SendGrid, Resend, Nodemailer, etc.)
      // Example: await sendEmail({ to: user.email, subject: "Reset Password", html: `Click here: ${url}` });
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      enabled: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
      redirectURI: process.env.GOOGLE_REDIRECT_URI, // Can be set for mobile deep link
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
      enabled: !!(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET),
      redirectURI: process.env.GITHUB_REDIRECT_URI, // Can be set for mobile deep link
    },
  },
  callbacks: {
    async onSignIn({ user }) {
      // After successful OAuth sign in, this will be called
      console.log("User signed in:", user.email)
      return true
    },
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
