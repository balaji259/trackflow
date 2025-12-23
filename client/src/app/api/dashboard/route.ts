import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

console.log("ENV CHECK:", process.env.NEXT_PUBLIC_BACKEND_URL);



export async function GET() {
  try {

    console.log("inside get");
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await currentUser();

    const resp = await fetch(
      `${BACKEND_URL}/api/dashboard?userId=${userId}&email=${encodeURIComponent(user?.emailAddresses[0]?.emailAddress || '')}&name=${encodeURIComponent(user?.fullName || user?.firstName || 'User')}`,
      {
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
      }
    );

    if (!resp.ok) {
      const errData = await resp.json().catch(() => ({}));
      return NextResponse.json(
        { error: errData.message || "Failed to fetch dashboard data" },
        { status: resp.status }
      );
    }

    const data = await resp.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("GETT /api/dashboard error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
