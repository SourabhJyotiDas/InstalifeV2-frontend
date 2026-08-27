import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { apiFetch } from '../utils/api';
import { Avatar } from './Avatar';
import { Send, MessageSquare, ArrowLeft, Loader2 } from 'lucide-react';

export const ChatWindow = ({ activeFriend, onBackToSidebar }) => {
  const { user } = useAuth();
  const { socket, onlineUsers } = useSocket();

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const isOnline = activeFriend && onlineUsers.includes(activeFriend._id);

  // Fetch message history with cache-busting apiFetch
  useEffect(() => {
    if (!activeFriend) return;

    const fetchMessages = async () => {
      setLoading(true);
      try {
        const res = await apiFetch(`/api/messages/${activeFriend._id}`);
        if (res.ok) {
          const data = await res.json();
          setMessages(data);
        }
      } catch (err) {
        console.error('Fetch messages error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [activeFriend]);

  // Socket event listeners for real-time messages
  useEffect(() => {
    if (!socket || !activeFriend) return;

    const handleReceiveMessage = (msg) => {
      if (msg.sender === activeFriend._id || msg.recipient === activeFriend._id) {
        setMessages((prev) => [...prev, msg]);
      }
    };

    const handleMessageSent = (msg) => {
      if (msg.recipient === activeFriend._id) {
        setMessages((prev) => [...prev, msg]);
      }
    };

    socket.on('receive_message', handleReceiveMessage);
    socket.on('message_sent', handleMessageSent);

    return () => {
      socket.off('receive_message', handleReceiveMessage);
      socket.off('message_sent', handleMessageSent);
    };
  }, [socket, activeFriend]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim() || !socket || !activeFriend) return;

    socket.emit('send_message', {
      recipientId: activeFriend._id,
      content: inputText.trim()
    });

    setInputText('');
  };

  if (!activeFriend) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#FAF7F2] text-slate-500 p-8 text-center select-none">
        <div className="w-20 h-20 rounded-3xl bg-white border-2 border-slate-900 text-[#FF5A5F] flex items-center justify-center mb-5 shadow-[4px_4px_0px_0px_#000]">
          <MessageSquare className="w-10 h-10" />
        </div>
        <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Select a Friend to Chat</h3>
        <p className="text-sm font-semibold text-slate-600 max-w-sm leading-relaxed">
          Pick a friend from your sidebar or discover new people to start messaging!
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-[#FAF7F2] text-slate-900">
      {/* Top Header */}
      <div className="p-4 border-b-2 border-slate-900 flex items-center justify-between bg-white shadow-xs">
        <div className="flex items-center gap-3">
          {/* Mobile Back Button */}
          <button
            onClick={onBackToSidebar}
            className="md:hidden neo-btn-secondary p-2 flex items-center justify-center cursor-pointer"
            title="Back to friends"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="relative">
            <Avatar src={activeFriend.profilePic} seed={activeFriend.avatarSeed} name={activeFriend.name} size="md" />
            <span
              className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-slate-900 ${
                isOnline ? 'bg-emerald-500' : 'bg-slate-400'
              }`}
            />
          </div>
          <div>
            <h2 className="text-base font-black text-slate-900">{activeFriend.name}</h2>
            <p className="text-xs font-bold text-slate-500">
              {isOnline ? 'Active Now' : 'Offline'}
            </p>
          </div>
        </div>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#FAF7F2]">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-slate-500 gap-2 text-sm font-bold">
            <Loader2 className="w-5 h-5 animate-spin text-[#FF5A5F]" />
            Loading messages...
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-16 text-slate-500 font-bold text-sm">
            No messages yet. Send a message to break the ice! 👋
          </div>
        ) : (
          messages.map((msg, index) => {
            const isMe = msg.sender === user._id || msg.sender?._id === user._id;
            const time = new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            return (
              <div
                key={msg._id || index}
                className={`flex items-end gap-2.5 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {!isMe && (
                  <Avatar src={activeFriend.profilePic} seed={activeFriend.avatarSeed} name={activeFriend.name} size="xs" />
                )}
                <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-3 rounded-2xl text-sm font-semibold border-2 border-slate-900 leading-relaxed ${
                      isMe
                        ? 'bg-[#FF5A5F] text-white shadow-[2px_2px_0px_0px_#000] rounded-br-xs'
                        : 'bg-white text-slate-900 shadow-[2px_2px_0px_0px_#000] rounded-bl-xs'
                    }`}
                  >
                    {msg.content}
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 mt-1 px-1">{time}</span>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Bar */}
      <form onSubmit={handleSend} className="p-4 border-t-2 border-slate-900 bg-white flex items-center gap-3">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={`Type a message to ${activeFriend.name}...`}
          className="flex-1 px-4 py-3 neo-input text-sm font-semibold"
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="py-3 px-5 neo-btn flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
};
