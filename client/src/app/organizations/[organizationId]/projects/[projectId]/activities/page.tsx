"use client";

import { useUser } from "@clerk/nextjs";
import { useParams, useRouter } from "next/navigation";
import ActivityLogWidget from "@/app/components/ActivityLogWidget";

export default function ActivitiesPage() {
  const { isLoaded, user } = useUser();
  const params = useParams();
  const router = useRouter();
  
  const organizationId = params.organizationId as string;
  const projectId = params.projectId as string;

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-indigo-600 mb-4"></div>
          <p className="text-gray-600 text-lg">Loading activities...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <p className="text-gray-800 text-lg">Please sign in to view activities.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => router.push(`/organizations/${organizationId}/projects/${projectId}`)}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors group"
        >
          <svg className="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Tasks
        </button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Project Activities</h1>
          <p className="text-gray-600">Complete log of all events and changes in this project.</p>
        </div>

        <div className="w-full h-auto">
          {/* We remove max-h constraints here so the page can scroll natively if needed */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200">
            <ActivityLogWidget projectId={projectId} fullPage={true} />
          </div>
        </div>
      </div>
    </div>
  );
}
