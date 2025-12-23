import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

if (!BACKEND_URL) {
  throw new Error("NEXT_PUBLIC_BACKEND_URL is not defined");
}


export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ organizationId: string }> }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await currentUser();
    const { organizationId } = await params;

    const resp = await fetch(
      `${BACKEND_URL}/api/organizations/${organizationId}/members?userId=${userId}&email=${encodeURIComponent(user?.emailAddresses[0]?.emailAddress || '')}&name=${encodeURIComponent(user?.fullName || user?.firstName || 'User')}`,
      {
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
      }
    );

    if (!resp.ok) {
      const errData = await resp.json().catch(() => ({}));
      return NextResponse.json(
        { error: errData.message || "Failed to fetch members" },
        { status: resp.status }
      );
    }

    const data = await resp.json();
    return NextResponse.json({ members: data.members || [] });
  } catch (error) {
    console.error("GET /api/organizations/members error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
