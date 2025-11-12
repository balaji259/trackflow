import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:4000/api/organizations";

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get full user details from Clerk
    const user = await currentUser();

    const resp = await fetch(`${BACKEND_URL}?userId=${userId}&email=${encodeURIComponent(user?.emailAddresses[0]?.emailAddress || '')}&name=${encodeURIComponent(user?.fullName || user?.firstName || 'User')}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!resp.ok) {
      const errData = await resp.json().catch(() => ({}));
      return NextResponse.json(
        { error: errData.message || "Failed to fetch organizations" },
        { status: resp.status }
      );
    }

    const data = await resp.json();
    return NextResponse.json({ organizations: data.organizations || [] });
  } catch (error) {
    console.error("GET /api/organizations error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get full user details from Clerk
    const user = await currentUser();

    const body = await req.json();
    const { name, description } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "Organization name is required" },
        { status: 400 }
      );
    }

    const resp = await fetch(BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        name: name.trim(), 
        description, 
        userId,
        userEmail: user?.emailAddresses[0]?.emailAddress || '',
        userName: user?.fullName || user?.firstName || 'User'
      }),
    });

    if (!resp.ok) {
      const errData = await resp.json().catch(() => ({}));
      return NextResponse.json(
        { error: errData.message || "Failed to create organization" },
        { status: resp.status }
      );
    }

    const data = await resp.json();
    return NextResponse.json({ organization: data });
  } catch (error) {
    console.error("POST /api/organizations error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
