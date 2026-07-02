"use client";

import { useEffect, useState } from "react";

interface Activity {
  _id: string;
  userName: string;
  action: string;
  targetName?: string;
  createdAt: string;
}

interface ActivityLogWidgetProps {
  projectId: string;
}

export default function ActivityLogWidget({ projectId }: ActivityLogWidgetProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchActivities() {
      try {
        const res = await fetch(`/api/activities/${projectId}`);
        if (res.ok) {
          const data = await res.json();
          setActivities(data);
        }
      } catch (error) {
        console.error("Failed to fetch activities", error);
      } finally {
        setLoading(false);
      }
    }
    fetchActivities();
  }, [projectId]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-4">
              <div className="w-8 h-8 bg-gray-200 rounded-full shrink-0"></div>
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 h-full max-h-[600px] flex flex-col">
      <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Activity Log
      </h3>
      
      <div className="flex-1 overflow-y-auto pr-2 space-y-6">
        {activities.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <svg className="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <p>No recent activity</p>
          </div>
        ) : (
          activities.map((activity, index) => (
            <div key={activity._id} className="relative pl-10">
              {/* Timeline line */}
              {index !== activities.length - 1 && (
                <div className="absolute left-[15px] top-8 bottom-[-24px] w-0.5 bg-gray-100"></div>
              )}
              
              {/* Avatar dot */}
              <div className="absolute left-0 top-1.5 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm border-2 border-white shadow-sm">
                {activity.userName.charAt(0).toUpperCase()}
              </div>
              
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                <p className="text-sm text-gray-800">
                  <span className="font-semibold text-gray-900">{activity.userName}</span>{' '}
                  <span className="text-gray-600">{activity.action}</span>{' '}
                  {activity.targetName && (
                    <span className="font-medium text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                      {activity.targetName}
                    </span>
                  )}
                </p>
                <p className="text-xs text-gray-400 mt-1.5 font-medium flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {new Date(activity.createdAt).toLocaleString(undefined, {
                    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
