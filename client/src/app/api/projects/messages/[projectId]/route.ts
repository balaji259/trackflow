import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

if (!BACKEND_URL) {
  throw new Error("NEXT_PUBLIC_BACKEND_URL is not defined");
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await context.params;

  const resp = await fetch(
    `${BACKEND_URL}/api/projects/${projectId}/messages`,
    { cache: "no-store" }
  );

  const data = await resp.json();
  return NextResponse.json(data);
}
