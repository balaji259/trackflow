'use client';
import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

interface Stats {
  totalOrganizations: number;
  totalProjects: number;
  totalTasks: number;
  myTasks: number;
  tasksByStatus: {
    todo: number;
    inProgress: number;
    inReview: number;
    completed: number;
  };
  myTasksByStatus: {
    todo: number;
    inProgress: number;
    inReview: number;
    completed: number;
  };
  tasksByPriority: {
    highest: number;
    high: number;
    medium: number;
    low: number;
    lowest: number;
  };
  overdueTasks: number;
  completionRate: number;
}

interface Organization {
  _id: string;
  name: string;
  description?: string;
  createdBy: {
    name: string;
    email: string;
  };
  createdAt: string;
}

interface Project {
  _id: string;
  name: string;
  description?: string;
  organizationId: string;
  taskCount: number;
  completedTasks: number;
  completionRate: number;
  createdAt: string;
}

interface Task {
  _id: string;
  title: string;
  status: string;
  priority: string;
  projectId: string;
  organizationId: string;
  assignee?: {
    name: string;
  };
  dueDate?: string;
  createdAt: string;
}

interface DashboardData {
  stats: Stats;
  organizations: Organization[];
  projects: Project[];
  recentTasks: Task[];
}

export default function DashboardPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDashboard() {
      if (!isLoaded || !user) return;

      try {
        setError(null);
        const res = await fetch('/api/dashboard', {
          method: "GET",
          cache: "no-store",
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "Failed to fetch dashboard");
        }

        const dashboardData = await res.json();
        setData(dashboardData);
      } catch (err) {
        console.error("Error loading dashboard:", err);
        setError(err instanceof Error ? err.message : "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    }

    fetchDashboard();
  }, [user, isLoaded]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'todo':
        return 'bg-slate-100 text-slate-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'in-review':
        return 'bg-purple-100 text-purple-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'highest':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-blue-100 text-blue-800';
      case 'lowest':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center pt-20">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-600 mb-4"></div>
          <p className="text-gray-600 text-lg">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    router.push('/sign-in');
    return null;
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center pt-20">
        <div className="bg-red-50 border border-red-200 p-8 rounded-lg shadow-lg max-w-md">
          <h2 className="text-red-800 text-xl font-semibold mb-2">Error</h2>
          <p className="text-red-700 mb-4">{error || "Failed to load dashboard"}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome back, {user.firstName || 'User'} 
          </h1>
          <p className="text-gray-600">Look what is happening with your projects today</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Organizations */}
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Organizations</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{data.stats.totalOrganizations}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </div>
          </div>

          {/* Total Projects */}
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Projects</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{data.stats.totalProjects}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Total Tasks */}
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Total Tasks</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{data.stats.totalTasks}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
          </div>

          {/* My Tasks */}
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-orange-500 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">My Tasks</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{data.stats.myTasks}</p>
              </div>
              <div className="bg-orange-100 p-3 rounded-full">
                <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Completion Rate & Overdue Tasks */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Completion Rate */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Overall Completion Rate</h3>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-green-600 h-4 rounded-full transition-all duration-500"
                    style={{ width: `${data.stats.completionRate}%` }}
                  ></div>
                </div>
              </div>
              <span className="text-2xl font-bold text-green-600">{data.stats.completionRate}%</span>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              {data.stats.tasksByStatus.completed} of {data.stats.totalTasks} tasks completed
            </p>
          </div>

          {/* Overdue Tasks */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Task Status Overview</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">To Do</span>
                <span className="font-semibold text-gray-900">{data.stats.tasksByStatus.todo}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">In Progress</span>
                <span className="font-semibold text-blue-600">{data.stats.tasksByStatus.inProgress}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">In Review</span>
                <span className="font-semibold text-purple-600">{data.stats.tasksByStatus.inReview}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Overdue</span>
                <span className="font-semibold text-red-600">{data.stats.overdueTasks}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Organizations & Projects */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Organizations */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Your Organizations</h3>
              <button
                onClick={() => router.push('/organizations')}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                View All →
              </button>
            </div>
            
            {data.organizations.length > 0 ? (
              <div className="space-y-3">
                {data.organizations.slice(0, 5).map((org) => (
                  <div
                    key={org._id}
                    onClick={() => router.push(`/organizations/${org._id}/projects`)}
                    className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all cursor-pointer group"
                  >
                    <h4 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                      {org.name}
                    </h4>
                    {org.description && (
                      <p className="text-sm text-gray-500 mt-1 line-clamp-1">{org.description}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <p className="text-sm">No organizations yet</p>
                <button
                  onClick={() => router.push('/organizations')}
                  className="mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Create your first organization
                </button>
              </div>
            )}
          </div>

          {/* Projects */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Recent Projects</h3>
            </div>
            
            {data.projects.length > 0 ? (
              <div className="space-y-3">
                {data.projects.slice(0, 5).map((project) => (
                  <div
                    key={project._id}
                    onClick={() => router.push(`/organizations/${project.organizationId}/projects/${project._id}`)}
                    className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                        {project.name}
                      </h4>
                      <span className="text-xs text-gray-500">
                        {project.taskCount} tasks
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full transition-all"
                        style={{ width: `${project.completionRate}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {project.completionRate}% complete
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <p className="text-sm">No projects yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Tasks */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Tasks</h3>
          
          {data.recentTasks.length > 0 ? (
            <div className="space-y-3">
              {data.recentTasks.map((task) => (
                <div
                  key={task._id}
                  className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                        {task.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(task.status)}`}>
                          {task.status.replace('-', ' ')}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                        {task.assignee && (
                          <span className="text-xs text-gray-500">
                            → {task.assignee.name}
                          </span>
                        )}
                      </div>
                    </div>
                    {task.dueDate && (
                      <span className="text-xs text-gray-500">
                        {new Date(task.dueDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <p className="text-sm">No tasks yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
