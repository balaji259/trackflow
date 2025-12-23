import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

if (!BACKEND_URL) {
  throw new Error("NEXT_PUBLIC_BACKEND_URL is not defined");
}


// GET single task
export async function GET(
  req: NextRequest,
  { params }: { params: { organizationId: string; projectId: string; taskId: string } }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await currentUser();
    const { organizationId, projectId, taskId } = params;

    const resp = await fetch(
      `${BACKEND_URL}/api/tasks/${organizationId}/${projectId}/${taskId}?userId=${userId}&email=${encodeURIComponent(user?.emailAddresses[0]?.emailAddress || '')}&name=${encodeURIComponent(user?.fullName || user?.firstName || 'User')}`,
      {
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
      }
    );

    if (!resp.ok) {
      const errData = await resp.json().catch(() => ({}));
      return NextResponse.json(
        { error: errData.message || "Failed to fetch task" },
        { status: resp.status }
      );
    }

    const data = await resp.json();
    return NextResponse.json({ task: data.task });
  } catch (error) {
    console.error("GET /api/tasks/[taskId] error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// PUT - Update task
export async function PUT(
  req: NextRequest,
  { params }: { params: { organizationId: string; projectId: string; taskId: string } }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { organizationId, projectId, taskId } = params;
    const body = await req.json();

    const resp = await fetch(`${BACKEND_URL}/api/tasks/${organizationId}/${projectId}/${taskId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...body,
        userId,
      }),
    });

    if (!resp.ok) {
      const errData = await resp.json().catch(() => ({}));
      return NextResponse.json(
        { error: errData.message || "Failed to update task" },
        { status: resp.status }
      );
    }

    const data = await resp.json();
    return NextResponse.json({ task: data });
  } catch (error) {
    console.error("PUT /api/tasks error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// DELETE task
export async function DELETE(
  req: NextRequest,
  { params }: { params: { organizationId: string; projectId: string; taskId: string } }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { organizationId, projectId, taskId } = params;

    const resp = await fetch(
      `${BACKEND_URL}/api/tasks/${organizationId}/${projectId}/${taskId}?userId=${userId}`,
      {
        method: "DELETE",
      }
    );

    if (!resp.ok) {
      const errData = await resp.json().catch(() => ({}));
      return NextResponse.json(
        { error: errData.message || "Failed to delete task" },
        { status: resp.status }
      );
    }

    const data = await resp.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("DELETE /api/tasks error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
