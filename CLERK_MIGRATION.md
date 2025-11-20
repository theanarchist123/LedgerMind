# Clerk Migration

The authentication system has been migrated from Better Auth to Clerk.

## Changes Made

1.  **Dependencies**:
    *   Removed `better-auth`.
    *   Added `@clerk/nextjs`.

2.  **Configuration**:
    *   Updated `middleware.ts` to use `clerkMiddleware`.
    *   Updated `app/layout.tsx` to wrap the app with `<ClerkProvider>`.
    *   Added `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` to `.env.local` (User needs to provide these).

3.  **Pages Updated**:
    *   `app/auth/login/page.tsx`: Uses `<SignIn />`.
    *   `app/auth/signup/page.tsx`: Uses `<SignUp />`.
    *   `app/app/dashboard/page.tsx`: Uses `useUser`.
    *   `app/app/reports/page.tsx`: Uses `useUser`.
    *   `app/app/upload/page.tsx`: Uses `useUser`.
    *   `app/app/receipts/page.tsx`: Uses `useUser`.
    *   `app/app/receipts/[id]/page.tsx`: Uses `useUser`.

4.  **Components Updated**:
    *   `components/navbar.tsx`: Uses `<UserButton />`.
    *   `components/auth-guard.tsx`: Uses `useAuth`.

5.  **API Routes Updated**:
    *   `app/api/analytics/route.ts`: Uses `auth()` from `@clerk/nextjs/server`.

6.  **Files Deleted**:
    *   `lib/better-auth.ts`
    *   `lib/auth-client.ts`
    *   `app/api/auth/[...all]/route.ts`
    *   `app/auth/forgot-password/page.tsx`
    *   `app/auth/reset-password/page.tsx`

## Next Steps

1.  Ensure `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` are set in your `.env.local` file.
2.  Run `npm install` to update dependencies.
3.  Start the development server with `npm run dev`.
