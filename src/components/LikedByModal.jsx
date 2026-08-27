import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Avatar } from './Avatar';
import { Heart, X, MessageSquare } from 'lucide-react';

export const LikedByModal = ({ isOpen, onClose, likes = [], onSelectChat }) => {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleMessageClick = (uId, likedUser) => {
    onClose();
    if (onSelectChat) {
      onSelectChat(likedUser);
    } else {
      navigate(`/chats/${uId}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="max-w-md w-full neo-box p-6 space-y-4 relative animate-scale-up">
        <div className="flex items-center justify-between border-b-2 border-slate-900 pb-3">
          <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
            <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
            Liked By ({likes.length})
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-200 rounded-xl transition cursor-pointer text-slate-500 hover:text-slate-900"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
          {likes.length === 0 ? (
            <p className="text-xs font-semibold text-slate-400 text-center py-4">No likes yet</p>
          ) : (
            likes.map((likedUser) => {
              const uId = (likedUser._id || likedUser).toString();
              const uName = likedUser.name || 'User';
              const uEmail = likedUser.email || '';
              const uPic = likedUser.profilePic;
              const uSeed = likedUser.avatarSeed;
              const isSelf = currentUser?._id?.toString() === uId;

              return (
                <div
                  key={uId}
                  className="p-3 bg-amber-50/50 rounded-xl border border-slate-200 flex items-center justify-between gap-3"
                >
                  <Link
                    to={`/profile/${uId}`}
                    onClick={onClose}
                    className="flex items-center gap-3 min-w-0 flex-1 hover:opacity-80 transition cursor-pointer"
                  >
                    <Avatar src={uPic} seed={uSeed} name={uName} size="md" />
                    <div className="min-w-0 flex-1">
                      <h4 className="font-extrabold text-xs text-slate-900 truncate">
                        {uName}
                      </h4>
                      {uEmail && (
                        <span className="text-[11px] font-semibold text-slate-500 truncate block">
                          {uEmail}
                        </span>
                      )}
                    </div>
                  </Link>

                  {!isSelf && (
                    <button
                      onClick={() => handleMessageClick(uId, likedUser)}
                      className="p-2.5 neo-btn text-xs rounded-xl cursor-pointer"
                      title="Send Message"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
