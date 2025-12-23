'use client';
import { use, useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

interface Invitation {
  organization: {
    _id: string;
    name: string;
    description?: string;
  };
  invitedBy: {
    name: string;
    email: string;
  };
  role: string;
  expiresAt: string;
}

export default function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  // Use React.use() to unwrap the params Promise in Next.js 15
  const { token } = use(params);
  
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchInvitation() {
      try {
        const res = await fetch(`/api/invitations/${token}`);
        
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "Failed to fetch invitation");
        }

        const data = await res.json();
        setInvitation(data.invitation);
      } catch (err) {
        console.error("Error fetching invitation:", err);
        setError(err instanceof Error ? err.message : "Invalid or expired invitation");
      } finally {
        setLoading(false);
      }
    }

    if (token) {
      fetchInvitation();
    }
  }, [token]);

  async function handleAcceptInvite() {
    if (!user) {
      router.push(`/sign-in?redirect_url=/invite/${token}`);
      return;
    }

    setAccepting(true);
    setError(null);

    try {
      const res = await fetch(`/api/invitations/${token}/accept`, {
        method: "POST",
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to accept invitation");
      }

      const data = await res.json();
      router.push(`/organizations/${data.organization.id}/projects`);
    } catch (err) {
      console.error("Error accepting invitation:", err);
      setError(err instanceof Error ? err.message : "Failed to accept invitation");
    } finally {
      setAccepting(false);
    }
  }

  if (loading || !isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !invitation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Invalid Invitation</h2>
          <p className="text-slate-600 mb-6">{error || "This invitation is no longer valid"}</p>
          <button
            onClick={() => router.push('/organizations')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
          >
            Go to Organizations
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>

        <h2 className="text-2xl font-bold text-slate-800 mb-2 text-center">
          You are Invited!
        </h2>

        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 mb-6">
          <p className="text-sm text-slate-600 mb-2">
            <span className="font-semibold">{invitation.invitedBy.name}</span> has invited you to join
          </p>
          <h3 className="text-xl font-bold text-slate-900 mb-1">
            {invitation.organization.name}
          </h3>
          {invitation.organization.description && (
            <p className="text-sm text-slate-600">{invitation.organization.description}</p>
          )}
          <p className="text-xs text-slate-500 mt-3">
            Role: <span className="font-medium">{invitation.role}</span>
          </p>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border-l-4 border-red-500 rounded p-3">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {!user ? (
          <div className="space-y-3">
            <p className="text-sm text-slate-600 text-center mb-4">
              Please sign in to accept this invitation
            </p>
            <button
              onClick={() => router.push(`/sign-in?redirect_url=/invite/${token}`)}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-lg font-semibold transition-all"
            >
              Sign In to Accept
            </button>
          </div>
        ) : (
          <button
            onClick={handleAcceptInvite}
            disabled={accepting}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-lg font-semibold disabled:from-slate-400 disabled:to-slate-400 transition-all flex items-center justify-center gap-2"
          >
            {accepting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Joining...
              </>
            ) : (
              "Accept Invitation"
            )}
          </button>
        )}

        <p className="text-xs text-slate-500 text-center mt-4">
          Expires: {new Date(invitation.expiresAt).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}
