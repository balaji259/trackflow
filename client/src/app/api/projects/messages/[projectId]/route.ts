import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

if (!BACKEND_URL) {
  throw new Error("NEXT_PUBLIC_BACKEND_URL is not defined");
}


export async function GET(req: NextRequest, { params }: { params: { projectId: string } }) {
  const resp = await fetch(`${BACKEND_URL}/api/projects/${params.projectId}/messages`, { cache: "no-store" });
  const data = await resp.json();
  return NextResponse.json(data);
}

