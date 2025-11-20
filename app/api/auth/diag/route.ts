import { NextResponse } from "next/server";
import { getDbSync } from "@/lib/mongodb";

/**
 * Diagnostic route to check Better Auth database collections
 * Access: /api/auth/diag
 */
export async function GET() {
  try {
    const db = getDbSync();
    const collections = await db.listCollections().toArray();
    
    // Check if Better Auth collections exist
    const collectionNames = collections.map(c => c.name);
    const hasUsers = collectionNames.includes("user");
    const hasSessions = collectionNames.includes("session");
    const hasAccounts = collectionNames.includes("account");

    return NextResponse.json({
      success: true,
      database: db.databaseName,
      collections: collectionNames,
      betterAuth: {
        hasUsers,
        hasSessions,
        hasAccounts,
        ready: hasUsers && hasSessions,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
