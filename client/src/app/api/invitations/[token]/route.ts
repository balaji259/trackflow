import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

if (!BACKEND_URL) {
  throw new Error("NEXT_PUBLIC_BACKEND_URL is not defined");
}


export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    // Await params in Next.js 15
    const { token } = await params;

    const resp = await fetch(`${BACKEND_URL}/api/invitations/${token}`, {
      cache: 'no-store',
    });

    if (!resp.ok) {
      const errData = await resp.json().catch(() => ({}));
      return NextResponse.json(
        { error: errData.message || "Failed to fetch invitation" },
        { status: resp.status }
      );
    }

    const data = await resp.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("GET /api/invitations/[token] error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
