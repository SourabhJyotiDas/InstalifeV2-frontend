import React, { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import { apiFetch } from '../utils/api';
import { Avatar } from './Avatar';
import { UserPlus, Check, X, MessageSquare, Sparkles, RefreshCw, Loader2 } from 'lucide-react';

export const FriendsTab = ({
  friends = [],
  pendingRequests = [],
  onFriendAccepted,
  onRequestHandled,
  onSelectChat
}) => {
  const { socket } = useSocket();
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [actionMessage, setActionMessage] = useState('');

  const fetchSuggestions = async () => {
    setLoadingSuggestions(true);
    try {
      const res = await apiFetch('/api/users/suggestions');
      if (res.ok) {
        const data = await res.json();
        setSuggestions(data);
      }
    } catch (err) {
      console.error('Fetch suggestions error:', err);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  useEffect(() => {
    fetchSuggestions();
  }, [friends, pendingRequests]);

  const handleSendRequest = async (targetUserId) => {
    try {
      const res = await apiFetch(`/api/friends/request/${targetUserId}`, {
        method: 'POST'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setActionMessage('Friend request sent!');
      setTimeout(() => setActionMessage(''), 3000);

      if (socket) {
        socket.emit('send_friend_request', { targetUserId });
      }

      fetchSuggestions();
    } catch (err) {
      alert(err.message || 'Error sending request');
    }
  };

  const handleAcceptRequest = async (senderId) => {
    try {
      const res = await apiFetch(`/api/friends/accept/${senderId}`, {
        method: 'POST'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setActionMessage('Friend request accepted!');
      setTimeout(() => setActionMessage(''), 3000);

      if (socket) {
        socket.emit('accept_friend_request', { senderUserId: senderId });
      }

      if (onFriendAccepted) onFriendAccepted(data.newFriend);
      if (onRequestHandled) onRequestHandled();
      fetchSuggestions();
    } catch (err) {
      alert(err.message || 'Error accepting request');
    }
  };

  const handleRejectRequest = async (senderId) => {
    try {
      const res = await apiFetch(`/api/friends/reject/${senderId}`, {
        method: 'POST'
      });
      if (!res.ok) throw new Error('Failed to reject request');

      if (onRequestHandled) onRequestHandled();
      fetchSuggestions();
    } catch (err) {
      alert(err.message || 'Error rejecting request');
    }
  };

  return (
    <div className="flex-1 p-6 md:p-8 overflow-y-auto bg-[#FAF7F2] text-slate-900 space-y-8">
      {actionMessage && (
        <div className="bg-emerald-500 text-white font-extrabold text-sm px-4 py-3 neo-box shadow-[2px_2px_0px_0px_#000]">
          {actionMessage}
        </div>
      )}

      {/* Pending Incoming Friend Requests */}
      {pendingRequests.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">
              Pending Requests
            </h3>
            <span className="bg-[#FF5A5F] text-white text-xs px-2 py-0.5 rounded-full font-black border border-slate-900 shadow-[1px_1px_0px_0px_#000]">
              {pendingRequests.length}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingRequests.map((req) => (
              <div
                key={req._id}
                className="neo-box p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <Avatar src={req.from?.profilePic} seed={req.from?.avatarSeed} name={req.from?.name} size="md" />
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900">{req.from?.name}</h4>
                    <p className="text-xs font-semibold text-slate-500">{req.from?.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleAcceptRequest(req.from?._id)}
                    className="p-2.5 bg-emerald-500 text-white font-extrabold border-2 border-slate-900 rounded-xl shadow-[2px_2px_0px_0px_#000] flex items-center gap-1 cursor-pointer text-xs"
                  >
                    <Check className="w-4 h-4" /> Accept
                  </button>
                  <button
                    onClick={() => handleRejectRequest(req.from?._id)}
                    className="p-2.5 neo-btn-secondary text-xs cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Suggested Friends Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#FF5A5F]" />
            Discover People
          </h3>
          <button
            onClick={fetchSuggestions}
            disabled={loadingSuggestions}
            className="neo-btn-secondary px-3 py-1.5 text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingSuggestions ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>

        {loadingSuggestions ? (
          <div className="flex items-center justify-center py-12 text-slate-500 gap-2 text-sm font-bold">
            <Loader2 className="w-5 h-5 animate-spin text-[#FF5A5F]" /> Loading suggestions...
          </div>
        ) : suggestions.length === 0 ? (
          <div className="neo-box p-8 text-center text-xs font-bold text-slate-500">
            No suggestions available right now. Check back later!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {suggestions.map((user) => (
              <div
                key={user._id}
                className="neo-box p-5 flex flex-col items-center text-center space-y-3"
              >
                <Avatar src={user.profilePic} seed={user.avatarSeed} name={user.name} size="lg" />
                <div className="w-full">
                  <h4 className="text-sm font-extrabold text-slate-900 truncate">{user.name}</h4>
                  <p className="text-xs font-semibold text-slate-500 truncate">{user.email}</p>
                </div>
                <button
                  onClick={() => handleSendRequest(user._id)}
                  className="w-full py-2.5 px-3 neo-btn text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  Add Friend
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Existing Friends List */}
      <section className="space-y-4">
        <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">
          Your Friends ({friends.length})
        </h3>

        {friends.length === 0 ? (
          <div className="neo-box p-8 text-center text-xs font-bold text-slate-500">
            You don't have any accepted friends yet. Add friends from the suggestions above!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {friends.map((friend) => (
              <div
                key={friend._id}
                className="neo-box p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar src={friend.profilePic} seed={friend.avatarSeed} name={friend.name} size="md" />
                  <div className="min-w-0">
                    <h4 className="text-sm font-extrabold text-slate-900 truncate">{friend.name}</h4>
                    <p className="text-xs font-semibold text-slate-500 truncate">{friend.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => onSelectChat(friend)}
                  className="py-2 px-3.5 neo-btn text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  Message
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
