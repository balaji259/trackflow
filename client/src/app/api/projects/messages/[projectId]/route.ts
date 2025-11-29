import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:4000/api/projects";

export async function GET(req: NextRequest, { params }: { params: { projectId: string } }) {
  const resp = await fetch(`${BACKEND_URL}/${params.projectId}/messages`, { cache: "no-store" });
  const data = await resp.json();
  return NextResponse.json(data);
}

