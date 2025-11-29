'use client';
import { useEffect, useState, useRef } from "react";
import { io, Socket } from 'socket.io-client';

interface ProjectChatProps {
  projectId: string;
  user: any;
}

interface Message {
  _id: string;
  userName: string;
  userId: string;  // ✅ Add userId field
  text: string;
  createdAt: string;
}

export default function ProjectChat({ projectId, user }: ProjectChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [connected, setConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000', {
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('✅ Connected to Socket.io server');
      setConnected(true);
      socket.emit('join_project', projectId);
    });

    socket.on('disconnect', () => {
      console.log('❌ Disconnected from Socket.io server');
      setConnected(false);
    });

    socket.on('new_message', (message: Message) => {
      console.log('📩 New message received:', message);
      setMessages(prev => [...prev, message]);
    });

    socket.on('message_error', (error: any) => {
      console.error('❌ Message error:', error);
      setSending(false);
    });

    fetchInitialMessages();

    return () => {
      socket.emit('leave_project', projectId);
      socket.disconnect();
    };
  }, [projectId]);

  const fetchInitialMessages = async () => {
    try {
      const res = await fetch(`/api/projects/messages/${projectId}`);
      const data = await res.json();
      setMessages(data.messages || []);
    } catch (error) {
      console.error('Error fetching initial messages:', error);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || sending || !socketRef.current) return;
    
    const messageText = input.trim();
    setInput("");
    setSending(true);
    
    try {
      socketRef.current.emit('send_message', {
        projectId,
        text: messageText,
        clerkUserId: user.id,
      });
      
      setTimeout(() => setSending(false), 500);
    } catch (error) {
      console.error('Error sending message:', error);
      setSending(false);
    }
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {!connected && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-2 text-sm text-center">
          ⚠️ Connecting to chat server...
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="bg-orange-100 rounded-full p-4 mb-4">
              <svg className="w-12 h-12 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No messages yet</h3>
            <p className="text-gray-500 text-sm">Start the conversation with your team!</p>
          </div>
        ) : (
          <>
            {messages.map((msg) => {
              // ✅ FIX: Compare by Clerk userId instead of userName
              const isCurrentUser = msg.userId === user.id;
              
              return (
                <div
                  key={msg._id}
                  className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'} animate-fadeIn`}
                >
                  <div className={`max-w-[80%] ${isCurrentUser ? 'bg-orange-600 text-white' : 'bg-white text-gray-900'} rounded-2xl px-4 py-3 shadow-md`}>
                    {!isCurrentUser && (
                      <div className="text-xs font-semibold mb-1 opacity-75">
                        {msg.userName}
                      </div>
                    )}
                    <p className="text-sm break-words">{msg.text}</p>
                  </div>
                  <div className={`text-xs text-gray-500 mt-1 px-2 ${isCurrentUser ? 'text-right' : 'text-left'}`}>
                    {new Date(msg.createdAt).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      <div className="border-t border-gray-200 bg-white p-4">
        <form onSubmit={sendMessage} className="flex gap-3">
          <input
            type="text"
            className="flex-1 border border-gray-300 rounded-full px-5 py-3 text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={connected ? "Type your message..." : "Connecting..."}
            maxLength={300}
            disabled={sending || !connected}
          />
          <button
            type="submit"
            disabled={!input.trim() || sending || !connected}
            className="bg-orange-600 text-white rounded-full px-6 py-3 hover:bg-orange-700 transition-all font-medium shadow-lg hover:shadow-xl disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {sending ? (
              <div className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>
        <p className="text-xs text-gray-500 mt-2 text-center">
          {connected ? (
            <>Press Enter to send • Max 300 characters</>
          ) : (
            <>Connecting to chat server...</>
          )}
        </p>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
