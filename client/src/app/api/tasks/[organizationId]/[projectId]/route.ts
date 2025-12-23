import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

if (!BACKEND_URL) {
  throw new Error("NEXT_PUBLIC_BACKEND_URL is not defined");
}

// GET all tasks for a project
export async function GET(
  req: NextRequest,
  context: {
    params: Promise<{ organizationId: string; projectId: string }>;
  }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await currentUser();
    const { organizationId, projectId } = await context.params;

    console.log("Next.js API - organizationId:", organizationId);
    console.log("Next.js API - projectId:", projectId);

    const resp = await fetch(
      `${BACKEND_URL}/api/tasks/${organizationId}/${projectId}?userId=${userId}&email=${encodeURIComponent(
        user?.emailAddresses[0]?.emailAddress || ""
      )}&name=${encodeURIComponent(
        user?.fullName || user?.firstName || "User"
      )}`,
      {
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      }
    );

    if (!resp.ok) {
      const errData = await resp.json().catch(() => ({}));
      return NextResponse.json(
        { error: errData.message || "Failed to fetch tasks" },
        { status: resp.status }
      );
    }

    const data = await resp.json();
    return NextResponse.json({ tasks: data.tasks || [] });
  } catch (error) {
    console.error("GET /api/tasks error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// POST - Create a new task
export async function POST(
  req: NextRequest,
  context: {
    params: Promise<{ organizationId: string; projectId: string }>;
  }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await currentUser();
    const { organizationId, projectId } = await context.params;
    const body = await req.json();
    const { title, description, priority, status, assignee, dueDate } = body;

    console.log("Next.js API POST - organizationId:", organizationId);
    console.log("Next.js API POST - projectId:", projectId);

    if (!title || !title.trim()) {
      return NextResponse.json(
        { error: "Task title is required" },
        { status: 400 }
      );
    }

    const resp = await fetch(
      `${BACKEND_URL}/api/tasks/${organizationId}/${projectId}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description?.trim(),
          priority: priority || "medium",
          status: status || "todo",
          assignee,
          dueDate,
          userId,
          userEmail: user?.emailAddresses[0]?.emailAddress || "",
          userName: user?.fullName || user?.firstName || "User",
        }),
      }
    );

    if (!resp.ok) {
      const errData = await resp.json().catch(() => ({}));
      return NextResponse.json(
        { error: errData.message || "Failed to create task" },
        { status: resp.status }
      );
    }

    const data = await resp.json();
    return NextResponse.json({ task: data });
  } catch (error) {
    console.error("POST /api/tasks error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
