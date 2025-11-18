'use client';
import { useEffect, useState, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { useParams, useRouter } from "next/navigation";

function ProjectChat({ projectId, user }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ignore = false;
    const fetchMessages = async () => {
      const res = await fetch(`/api/projects/messages/${projectId}`);
      const data = await res.json();
      if (!ignore) setMessages(data.messages || []);
    };
    fetchMessages();
    const interval = setInterval(fetchMessages, 2000);
    return () => { ignore = true; clearInterval(interval); };
  }, [projectId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    setInput("");
    setMessages(msgs =>
      [...msgs, {
        _id: "local-" + Date.now(),
        userName: user.firstName || user.fullName || "User",
        text: input,
        createdAt: new Date().toISOString()
      }]
    );
    await fetch(`/api/projects/messages/${projectId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: input }),
    });
  }

  return (
    <div className="bg-white border rounded-xl shadow-md mb-8 p-4 max-w-2xl mx-auto w-full">
      <h2 className="font-semibold mb-2 text-lg text-gray-900">Project Chat</h2>
      <div className="overflow-y-auto mb-2 max-h-56 min-h-[64px] space-y-2 px-1 bg-gray-50 rounded">
        {messages.length === 0 && (
          <div className="text-gray-400 text-sm text-center py-8">No messages yet. Start the conversation!</div>
        )}
        {messages.map((m) => (
          <div key={m._id} className="flex gap-2 items-end">
            <span className="font-semibold text-blue-700">{m.userName}:</span>
            <span className="text-gray-800">{m.text}</span>
            <span className="text-gray-400 text-xs ml-auto">
              {m.createdAt ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
            </span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form className="flex gap-2 items-center" onSubmit={sendMessage}>
        <input
          className="flex-1 border rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 transition"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type a message..."
          maxLength={300}
        />
        <button
          type="submit"
          className="bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700 transition font-medium"
        >
          Send
        </button>
      </form>
    </div>
  );
}

export default function ChatPage() {
  const { user, isLoaded } = useUser();
  const params = useParams();
  const router = useRouter();
  const organizationId = params.organizationId as string;
  const projectId = params.projectId as string;

  // Show loading or sign-in redirect if needed
  if (!isLoaded) return null;
  if (!user)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-lg">Sign in to view chat</div>
      </div>
    );

    return (
  <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 px-2 py-12 flex flex-col items-center">
    <div className="bg-white border rounded-xl shadow-md mb-8 p-4 max-w-2xl w-full">
      {/* Back Button at the top */}
      <button
        onClick={() => router.push(`/organizations/${organizationId}/projects/${projectId}`)}
        className="mb-4 flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-800 focus:outline-none"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Project
      </button>
      {/* Chat UI */}
      <ProjectChat projectId={projectId} user={user} />
    </div>
  </div>
);

}
