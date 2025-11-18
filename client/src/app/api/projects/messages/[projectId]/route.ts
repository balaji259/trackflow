import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:4000/api/projects";

export async function GET(req: NextRequest, { params }: { params: { projectId: string } }) {
  const resp = await fetch(`${BACKEND_URL}/${params.projectId}/messages`, { cache: "no-store" });
  const data = await resp.json();
  return NextResponse.json(data);
}

export async function POST(req: NextRequest, { params }: { params: { projectId: string } }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = await currentUser();
  const body = await req.json();

  const resp = await fetch(`${BACKEND_URL}/${params.projectId}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      text: body.text,
      userId,
      userName: user?.fullName || user?.firstName || "User"
    }),
  });
  const data = await resp.json();
  return NextResponse.json(data, { status: resp.ok ? 200 : resp.status });
}
