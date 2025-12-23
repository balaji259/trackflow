'use client';
import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useParams, useRouter } from "next/navigation";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
} from "@dnd-kit/core";

interface Task {
  _id: string;
  title: string;
  description?: string;
  status: "todo" | "in-progress" | "in-review" | "completed";
  priority: "lowest" | "low" | "medium" | "high" | "highest";
  assignee?: {
    userId: string;
    name: string;
    email: string;
  };
  createdBy: {
    userId: string;
    name: string;
    email: string;
  };
  dueDate?: string;
  createdAt: string;
}

interface Member {
  _id: string;
  name: string;
  email: string;
  clerkId: string;
}

export default function KanbanBoardPage() {
  const { user, isLoaded } = useUser();
  const params = useParams();
  const router = useRouter();
  const organizationId = params.organizationId as string;
  const projectId = params.projectId as string;

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [filterAssignee, setFilterAssignee] = useState<string>("all");

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const columns = [
    { id: "todo", title: "To Do", color: "bg-slate-500" },
    { id: "in-progress", title: "In Progress", color: "bg-blue-500" },
    { id: "in-review", title: "In Review", color: "bg-purple-500" },
    { id: "completed", title: "Completed", color: "bg-green-500" },
  ];

  // Fetch tasks
  useEffect(() => {
    async function fetchTasks() {
      if (!isLoaded || !user) return;

      try {
        setError(null);
        const res = await fetch(`/api/tasks/${organizationId}/${projectId}`, {
          method: "GET",
          cache: "no-store",
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "Failed to fetch tasks");
        }

        const data = await res.json();
        setTasks(data.tasks || []);
      } catch (err) {
        console.error("Error loading tasks:", err);
        setError(err instanceof Error ? err.message : "Failed to load tasks");
      } finally {
        setLoading(false);
      }
    }

    fetchTasks();
  }, [user, isLoaded, organizationId, projectId]);

  // Fetch members
  useEffect(() => {
    async function fetchMembers() {
      if (!isLoaded || !user) return;

      try {
        const res = await fetch(`/api/organizations/${organizationId}/members`, {
          method: "GET",
          cache: "no-store",
        });

        if (res.ok) {
          const data = await res.json();
          setMembers(data.members || []);
        }
      } catch (err) {
        console.error("Error loading members:", err);
      }
    }

    fetchMembers();
  }, [user, isLoaded, organizationId]);

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t) => t._id === event.active.id);
    setActiveTask(task || null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const taskId = active.id as string;
    const newStatus = over.id as "todo" | "in-progress" | "in-review" | "completed";

    const task = tasks.find((t) => t._id === taskId);
    if (!task || task.status === newStatus) return;

    // Optimistic update (update UI immediately)
    setTasks((prevTasks) =>
      prevTasks.map((t) =>
        t._id === taskId ? { ...t, status: newStatus } : t
      )
    );

    // Update on backend
    try {
      const res = await fetch(`/api/tasks/${organizationId}/${projectId}/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        throw new Error("Failed to update task status");
      }
    } catch (err) {
      console.error("Error updating task:", err);
      // Revert on error
      setTasks((prevTasks) =>
        prevTasks.map((t) =>
          t._id === taskId ? { ...t, status: task.status } : t
        )
      );
      setError("Failed to update task status");
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'highest':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'lowest':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

 function getPriorityIcon(priority: string): string {
  switch (priority) {
    case "highest":
    case "high":
      return "↑";
    case "medium":
      return "-";
    case "low":
    case "lowest":
      return "↓";
    default:
      return ""; // ✅ FIX: guarantees string
  }
}


  // Filter tasks
  const filteredTasks = tasks.filter((task) => {
    if (filterAssignee === "all") return true;
    if (filterAssignee === "unassigned") return !task.assignee;
    if (filterAssignee === "me") return task.assignee?.userId === members.find(m => m.clerkId === user?.id)?._id;
    return task.assignee?.userId === filterAssignee;
  });

  const getTasksByStatus = (status: string) => {
    return filteredTasks.filter((task) => task.status === status);
  };

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-600 mb-4"></div>
          <p className="text-gray-600 text-lg">Loading board...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <p className="text-gray-800 text-lg">Please sign in to view board.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push(`/organizations/${organizationId}/projects/${projectId}`)}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors group"
          >
            <svg className="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Tasks
          </button>
          
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Kanban Board</h1>
              <p className="text-gray-600">Drag and drop tasks to update their status</p>
            </div>
            
            <div className="flex gap-3 items-center">
              {/* View Toggle */}
              <div className="flex bg-white rounded-lg shadow-md p-1">
                <button
                  onClick={() => router.push(`/organizations/${organizationId}/projects/${projectId}`)}
                  className="px-4 py-2 rounded-md text-gray-600 hover:bg-gray-100 transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                  List
                </button>
                <button
                  className="px-4 py-2 rounded-md bg-blue-100 text-blue-600 font-medium flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                  </svg>
                  Board
                </button>
              </div>

              {/* Filter */}
              <select
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-900 bg-white shadow-md"
                value={filterAssignee}
                onChange={(e) => setFilterAssignee(e.target.value)}
              >
                <option value="all">All Tasks</option>
                <option value="me">My Tasks</option>
                <option value="unassigned">Unassigned</option>
                <optgroup label="Team Members">
                  {members.map((member) => (
                    <option key={member._id} value={member._id}>
                      {member.name}
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-6 flex items-start">
            <svg className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Kanban Board */}
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {columns.map((column) => (
              <KanbanColumn
                key={column.id}
                id={column.id}
                title={column.title}
                color={column.color}
                tasks={getTasksByStatus(column.id)}
                getPriorityColor={getPriorityColor}
                getPriorityIcon={getPriorityIcon}
                onTaskClick={(taskId) =>
                  router.push(`/organizations/${organizationId}/projects/${projectId}/tasks/${taskId}`)
                }
              />
            ))}
          </div>

          <DragOverlay>
            {activeTask && (
              <TaskCard
                task={activeTask}
                getPriorityColor={getPriorityColor}
                getPriorityIcon={getPriorityIcon}
                isDragging
              />
            )}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
}

// ==================== KANBAN COLUMN COMPONENT ====================
function KanbanColumn({
  id,
  title,
  color,
  tasks,
  getPriorityColor,
  getPriorityIcon,
  onTaskClick,
}: {
  id: string;
  title: string;
  color: string;
  tasks: Task[];
  getPriorityColor: (priority: string) => string;
  getPriorityIcon: (priority: string) => string;
  onTaskClick: (taskId: string) => void;
}) {
  const { setNodeRef } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className="bg-gray-50 rounded-xl p-4 min-h-[600px] border-2 border-dashed border-gray-200"
    >
      <div className="flex items-center justify-between mb-4 sticky top-0 bg-gray-50 pb-2 z-10">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${color}`}></div>
          <h3 className="font-semibold text-gray-900 text-sm">{title}</h3>
          <span className="text-xs text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full font-medium">
            {tasks.length}
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {tasks.map((task) => (
          <DraggableTask
            key={task._id}
            task={task}
            getPriorityColor={getPriorityColor}
            getPriorityIcon={getPriorityIcon}
            onClick={() => onTaskClick(task._id)}
          />
        ))}
        
        {tasks.length === 0 && (
          <div className="text-center py-12 text-gray-400 text-sm">
            <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            Drop tasks here
          </div>
        )}
      </div>
    </div>
  );
}

// ==================== DRAGGABLE TASK COMPONENT ====================
function DraggableTask({
  task,
  getPriorityColor,
  getPriorityIcon,
  onClick,
}: {
  task: Task;
  getPriorityColor: (priority: string) => string;
  getPriorityIcon: (priority: string) => string;
  onClick: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: task._id,
  });

  const style = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
  
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
    >
      <div onClick={onClick}>
        <TaskCard
          task={task}
          getPriorityColor={getPriorityColor}
          getPriorityIcon={getPriorityIcon}
        />
      </div>
    </div>
  );
}

// ==================== TASK CARD COMPONENT ====================
function TaskCard({
  task,
  getPriorityColor,
  getPriorityIcon,
  isDragging = false,
}: {
  task: Task;
  getPriorityColor: (priority: string) => string;
  getPriorityIcon: (priority: string) => string;
  isDragging?: boolean;
}) {
  return (
    <div
      className={`bg-white p-4 rounded-lg shadow-md hover:shadow-xl transition-all duration-200 border border-gray-200 cursor-pointer group ${
        isDragging ? "rotate-3 scale-105" : ""
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-medium text-gray-900 text-sm line-clamp-2 flex-1 group-hover:text-blue-600 transition-colors">
          {task.title}
        </h4>
        <span
          className={`ml-2 px-2 py-0.5 rounded text-xs font-bold capitalize border flex-shrink-0 ${getPriorityColor(
            task.priority
          )}`}
        >
          {getPriorityIcon(task.priority)}
        </span>
      </div>

      {task.description && (
        <p className="text-xs text-gray-600 mb-3 line-clamp-2">
          {task.description}
        </p>
      )}

      <div className="flex items-center justify-between text-xs">
        {task.assignee ? (
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm">
              {task.assignee.name.charAt(0).toUpperCase()}
            </div>
            <span className="text-xs font-medium text-gray-700">{task.assignee.name.split(' ')[0]}</span>
          </div>
        ) : (
          <span className="text-gray-400 italic text-xs">Unassigned</span>
        )}

        {task.dueDate && (
          <div className="flex items-center gap-1 text-gray-500">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-xs">
              {new Date(task.dueDate).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
