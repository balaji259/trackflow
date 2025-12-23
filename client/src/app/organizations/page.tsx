'use client';
import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";

interface Organization {
  id: string;
  name: string;
  description?: string;
}

export default function OrganizationsPage() {
  const { user, isLoaded } = useUser();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [creating, setCreating] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrgs() {
      if (!isLoaded) return;
      
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setError(null);
        const res = await fetch("/api/organizations", {
          method: "GET",
          cache: "no-store",
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "Failed to fetch organizations");
        }

        const data = await res.json();
        const orgs = (data.organizations || []).map((org: any) => ({
          id: org._id || org.id,
          name: org.name,
          description: org.description,
        }));
        setOrganizations(orgs);
      } catch (err) {
        console.error("Error loading organizations:", err);
        setError(err instanceof Error ? err.message : "Failed to load organizations");
      } finally {
        setLoading(false);
      }
    }

    fetchOrgs();
  }, [user, isLoaded]);

  async function handleCreateOrg(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;

    setCreating(true);
    setError(null);

    try {
      const res = await fetch("/api/organizations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName.trim(),
          description: newDescription.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to create organization");
      }

      const data = await res.json();
      const newOrg: Organization = {
        id: data.organization?._id || data.organization?.id,
        name: data.organization?.name || newName,
        description: data.organization?.description,
      };

      setOrganizations((prev) => [...prev, newOrg]);
      setNewName("");
      setNewDescription("");
    } catch (err) {
      console.error("Error creating organization:", err);
      setError(err instanceof Error ? err.message : "Failed to create organization");
    } finally {
      setCreating(false);
    }
  }

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center pt-20">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-600 font-medium">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center pt-20">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Authentication Required</h2>
          <p className="text-slate-600">Please sign in to view your organizations.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-slate-900 mb-2 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Your Organizations
          </h1>
          <p className="text-slate-600">Manage and create organizations for your projects</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 rounded-lg p-4 shadow-sm">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div>
                <h3 className="text-red-800 font-medium">Error</h3>
                <p className="text-red-700 text-sm mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  Organizations
                  <span className="ml-auto bg-white/20 backdrop-blur-sm text-white text-sm px-3 py-1 rounded-full">
                    {organizations.length}
                  </span>
                </h2>
              </div>

              <div className="p-6">
                {organizations.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-700 mb-1">No organizations yet</h3>
                    <p className="text-slate-500 text-sm">Create your first organization to get started!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {organizations.map((org) => (
                      <div key={org.id} className="group">
                        <Link href={`/organizations/${org.id}/projects`}>
                          <div className="p-5 border border-slate-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all duration-200 bg-gradient-to-br from-white to-slate-50 hover:from-blue-50 hover:to-indigo-50">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors flex items-center gap-2">
                                  {org.name}
                                  <svg className="w-4 h-4 text-slate-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                  </svg>
                                </h3>
                                {org.description && (
                                  <p className="text-sm text-slate-600 mt-2 line-clamp-2">{org.description}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        </Link>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            setInviteModalOpen(org.id);
                          }}
                          className="mt-2 ml-5 text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                          </svg>
                          Invite Members
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden sticky top-24">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-5">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Create New
                </h2>
              </div>

              <form onSubmit={handleCreateOrg} className="p-6 space-y-5">
                <div>
                  <label htmlFor="org-name" className="block text-sm font-medium text-slate-700 mb-2">
                    Organization Name
                  </label>
                  <input
                    id="org-name"
                    type="text"
                    placeholder="RK Valley"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:bg-slate-100 disabled:cursor-not-allowed text-slate-900 placeholder:text-slate-400"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    required
                    disabled={creating}
                  />
                </div>

                <div>
                  <label htmlFor="org-description" className="block text-sm font-medium text-slate-700 mb-2">
                    Description <span className="text-slate-400 font-normal">(optional)</span>
                  </label>
                  <textarea
                    id="org-description"
                    placeholder="Brief description of your organization..."
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:bg-slate-100 disabled:cursor-not-allowed resize-none text-slate-900 placeholder:text-slate-400"
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    rows={4}
                    disabled={creating}
                  />
                </div>

                <button
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-lg font-semibold disabled:from-slate-400 disabled:to-slate-400 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
                  type="submit"
                  disabled={creating || !newName.trim()}
                >
                  {creating ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Create Organization
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {inviteModalOpen && (
        <InviteModal
          organizationId={inviteModalOpen}
          organizationName={organizations.find(o => o.id === inviteModalOpen)?.name || ""}
          isOpen={!!inviteModalOpen}
          onClose={() => setInviteModalOpen(null)}
        />
      )}
    </div>
  );
}

function InviteModal({ 
  organizationId, 
  organizationName,
  isOpen,
  onClose 
}: { 
  organizationId: string;
  organizationName: string;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  async function handleCreateInvite(e: React.FormEvent) {
    e.preventDefault();
    setInviting(true);
    setError(null);
    setInviteLink(null);

    try {
      const res = await fetch("/api/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationId,
          invitedEmail: inviteEmail.trim() || undefined,
          role: "member",
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to create invitation");
      }

      const data = await res.json();
      setInviteLink(data.inviteLink);
      setInviteEmail("");
    } catch (err) {
      console.error("Error creating invitation:", err);
      setError(err instanceof Error ? err.message : "Failed to create invitation");
    } finally {
      setInviting(false);
    }
  }

  function copyInviteLink() {
    if (inviteLink) {
      navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h3 className="text-2xl font-bold text-slate-900 mb-2">Invite to {organizationName}</h3>
        <p className="text-slate-600 text-sm mb-6">Invite members via email or shareable link</p>

        {error && (
          <div className="mb-4 bg-red-50 border-l-4 border-red-500 rounded p-3">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleCreateInvite} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Email Address <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <input
              type="email"
              placeholder="colleague@example.com"
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 placeholder:text-slate-400"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              disabled={inviting}
            />
            <p className="text-xs text-slate-500 mt-1">
              Leave empty to generate a shareable link
            </p>
          </div>

          <button
            type="submit"
            disabled={inviting}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-lg font-semibold disabled:from-slate-400 disabled:to-slate-400 transition-all shadow-lg hover:shadow-xl"
          >
            {inviting ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Creating...
              </span>
            ) : inviteEmail ? (
              "Send Email Invite"
            ) : (
              "Generate Invite Link"
            )}
          </button>
        </form>

        {inviteLink && (
          <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
            <p className="text-sm font-medium text-green-800 mb-2 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Invite Link Created!
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={inviteLink}
                className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded text-sm text-slate-700"
              />
              <button
                onClick={copyInviteLink}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium text-sm transition-colors whitespace-nowrap"
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
            <p className="text-xs text-green-700 mt-2">Valid for 7 days</p>
          </div>
        )}
      </div>
    </div>
  );
}
