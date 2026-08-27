import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Avatar } from './Avatar';
import { LikedByModal } from './LikedByModal';
import { PostMediaCarousel } from './PostMediaCarousel';
import { EmojiBar } from './EmojiBar';
import { apiFetch } from '../utils/api';
import {
  User,
  Mail,
  Calendar,
  MessageSquare,
  UserPlus,
  Check,
  Settings,
  Heart,
  MessageCircle,
  Repeat,
  Trash2,
  Send,
  Loader2,
  Grid,
  Image as ImageIcon,
  Sparkles,
  Users,
  Lock,
  Edit3,
  BarChart2,
  Reply,
  CornerDownRight,
  Globe
} from 'lucide-react';

const LinkedinIcon = ({ className = "w-3.5 h-3.5" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.25V10.9H6.46M7.86 6.74a1.6 1.6 0 1 0 1.6 1.6 1.6 1.6 0 0 0-1.6-1.6Z" />
  </svg>
);

const InstagramIcon = ({ className = "w-3.5 h-3.5" }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);

const YoutubeIcon = ({ className = "w-3.5 h-3.5" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

const FacebookIcon = ({ className = "w-3.5 h-3.5" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H7.5v-3H10V9.5C10 7.01 11.49 5.65 13.75 5.65c1.08 0 2.21.19 2.21.19v2.43h-1.25c-1.23 0-1.61.77-1.61 1.56V12h2.74l-.44 3h-2.3v6.8c4.56-.93 8-4.96 8-9.8z"/>
  </svg>
);

export const UserProfile = ({ onSelectChat }) => {
  const { user: currentUser } = useAuth();
  const { userId } = useParams();
  const navigate = useNavigate();

  const targetId = userId || currentUser?._id;

  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('posts'); // 'posts' | 'reposts' | 'media' | 'friends'

  // Post editing state
  const [editingPostId, setEditingPostId] = useState(null);
  const [editingCaption, setEditingCaption] = useState('');

  // Liked By Modal state
  const [likedByModalPost, setLikedByModalPost] = useState(null);

  // Comments state per post
  const [commentInputs, setCommentInputs] = useState({});
  const [expandedComments, setExpandedComments] = useState({});
  const [replyInputs, setReplyInputs] = useState({});
  const [replyingToCommentId, setReplyingToCommentId] = useState(null);
  const [expandedReplies, setExpandedReplies] = useState({});

  const [actionLoading, setActionLoading] = useState(false);

  const fetchProfile = async () => {
    if (!targetId) return;
    try {
      setLoading(true);
      setError('');
      const res = await apiFetch(`/api/users/profile/${targetId}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to load profile');
      }

      setProfileData(data);
    } catch (err) {
      setError(err.message || 'Could not fetch profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [targetId]);

  const handleSendFriendRequest = async () => {
    try {
      setActionLoading(true);
      const res = await apiFetch(`/api/friends/request/${targetId}`, { method: 'POST' });
      if (res.ok) {
        fetchProfile();
      }
    } catch (err) {
      console.error('Send Request Error:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAcceptFriendRequest = async () => {
    try {
      setActionLoading(true);
      const res = await apiFetch(`/api/friends/accept/${targetId}`, { method: 'POST' });
      if (res.ok) {
        fetchProfile();
      }
    } catch (err) {
      console.error('Accept Request Error:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdatePost = async (postId) => {
    try {
      const res = await apiFetch(`/api/posts/${postId}`, {
        method: 'PUT',
        body: JSON.stringify({ caption: editingCaption.trim() }),
      });
      const data = await res.json();
      if (!res.ok) return;

      setProfileData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          posts: prev.posts.map((p) => (p._id === postId ? data : p))
        };
      });
      setEditingPostId(null);
    } catch (err) {
      console.error('Update Post Error:', err);
    }
  };

  const handleToggleLike = async (postId) => {
    try {
      const res = await apiFetch(`/api/posts/${postId}/like`, { method: 'POST' });
      if (!res.ok) return;

      const data = await res.json();
      setProfileData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          posts: prev.posts.map((p) => {
            if (p._id === postId) {
              return { ...p, likes: data.likes };
            }
            return p;
          })
        };
      });
    } catch (err) {
      console.error('Like Toggle Error:', err);
    }
  };

  const handleAddComment = async (postId) => {
    const text = commentInputs[postId];
    if (!text || !text.trim()) return;

    try {
      const res = await apiFetch(`/api/posts/${postId}/comment`, {
        method: 'POST',
        body: JSON.stringify({ text: text.trim() })
      });

      if (!res.ok) return;
      const data = await res.json();

      setProfileData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          posts: prev.posts.map((p) => {
            if (p._id === postId) {
              return { ...p, comments: data.comments };
            }
            return p;
          })
        };
      });

      setCommentInputs((prev) => ({ ...prev, [postId]: '' }));
    } catch (err) {
      console.error('Add Comment Error:', err);
    }
  };

  const handleToggleLikeComment = async (postId, commentId) => {
    try {
      const res = await apiFetch(`/api/posts/${postId}/comments/${commentId}/like`, { method: 'POST' });
      if (!res.ok) return;
      const data = await res.json();
      setProfileData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          posts: prev.posts.map((p) => (p._id === postId ? { ...p, comments: data.comments } : p))
        };
      });
    } catch (err) {
      console.error('Like Comment Error:', err);
    }
  };

  const handleAddReply = async (postId, commentId) => {
    const text = replyInputs[commentId];
    if (!text || !text.trim()) return;

    try {
      const res = await apiFetch(`/api/posts/${postId}/comments/${commentId}/reply`, {
        method: 'POST',
        body: JSON.stringify({ text: text.trim() })
      });
      if (!res.ok) return;
      const data = await res.json();
      setProfileData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          posts: prev.posts.map((p) => (p._id === postId ? { ...p, comments: data.comments } : p))
        };
      });
      setReplyInputs((prev) => ({ ...prev, [commentId]: '' }));
      setReplyingToCommentId(null);
      setExpandedReplies((prev) => ({ ...prev, [commentId]: true }));
    } catch (err) {
      console.error('Add Reply Error:', err);
    }
  };

  const handleToggleLikeReply = async (postId, commentId, replyId) => {
    try {
      const res = await apiFetch(`/api/posts/${postId}/comments/${commentId}/replies/${replyId}/like`, { method: 'POST' });
      if (!res.ok) return;
      const data = await res.json();
      setProfileData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          posts: prev.posts.map((p) => (p._id === postId ? { ...p, comments: data.comments } : p))
        };
      });
    } catch (err) {
      console.error('Like Reply Error:', err);
    }
  };

  const handleRepost = async (post) => {
    const targetPostId = post.originalPost?._id || post._id;
    try {
      const res = await apiFetch(`/api/posts/${targetPostId}/repost`, { method: 'POST' });
      if (!res.ok) return;
      fetchProfile();
    } catch (err) {
      console.error('Repost Error:', err);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      const res = await apiFetch(`/api/posts/${postId}`, { method: 'DELETE' });
      if (!res.ok) return;

      setProfileData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          posts: prev.posts.filter((p) => p._id !== postId)
        };
      });
    } catch (err) {
      console.error('Delete Post Error:', err);
    }
  };

  const toggleCommentsView = (postId) => {
    setExpandedComments((prev) => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  const toggleRepliesView = (commentId) => {
    setExpandedReplies((prev) => ({
      ...prev,
      [commentId]: !prev[commentId]
    }));
  };

  const formatTimestamp = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffSec = Math.floor((now - date) / 1000);

    if (diffSec < 60) return 'just now';
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    if (diffSec < 604800) return `${Math.floor(diffSec / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-slate-500 font-bold gap-2 text-sm">
        <Loader2 className="w-6 h-6 animate-spin text-[#FF5A5F]" />
        Loading profile...
      </div>
    );
  }

  if (error || !profileData) {
    return (
      <div className="flex-1 p-8 text-center space-y-4">
        <div className="neo-box p-8 max-w-md mx-auto space-y-3">
          <h3 className="font-extrabold text-base text-red-500">{error || 'User not found'}</h3>
          <button onClick={() => navigate(-1)} className="neo-btn-secondary px-4 py-2 text-xs">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const { user, relationship, posts } = profileData;

  const userOwnPosts = posts.filter((p) => !p.originalPost);
  const userReposts = posts.filter((p) => p.originalPost);
  const mediaPosts = posts.filter((p) => p.image);

  let filteredPosts = userOwnPosts;
  if (activeTab === 'reposts') filteredPosts = userReposts;
  if (activeTab === 'media') filteredPosts = mediaPosts;

  const canViewFriends = relationship.isSelf || relationship.isFriend;

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-[#FAF7F2] text-slate-900 flex justify-center">
      <div className="max-w-2xl w-full space-y-6">
        {/* Profile Card Header */}
        <div className="neo-box p-6 md:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
            <Avatar src={user.profilePic} seed={user.avatarSeed} name={user.name} size="xl" />

            <div className="flex-1 space-y-2 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">{user.name}</h2>
                  <p className="text-xs font-semibold text-slate-500">{user.email}</p>
                </div>

                {/* Profile Action Buttons */}
                <div className="flex items-center gap-2 justify-center sm:justify-end">
                  {relationship.isSelf ? (
                    <Link
                      to="/settings/edit-profile"
                      className="px-4 py-2 neo-btn-secondary text-xs font-extrabold flex items-center gap-1.5 cursor-pointer"
                    >
                      <Settings className="w-4 h-4" /> Edit Profile
                    </Link>
                  ) : relationship.isFriend ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          if (onSelectChat) onSelectChat(user);
                          else navigate(`/chats/${user._id}`);
                        }}
                        className="px-4 py-2 neo-btn text-xs font-extrabold flex items-center gap-1.5 cursor-pointer"
                      >
                        <MessageSquare className="w-4 h-4" /> Message
                      </button>
                      <span className="px-3 py-2 bg-emerald-500/10 border-2 border-emerald-500 text-emerald-600 rounded-xl text-xs font-black flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Friend
                      </span>
                    </div>
                  ) : relationship.hasPendingRequestFromMe ? (
                    <button disabled className="px-4 py-2 neo-btn-secondary text-xs font-extrabold opacity-60">
                      Request Sent
                    </button>
                  ) : relationship.hasPendingRequestToMe ? (
                    <button
                      onClick={handleAcceptFriendRequest}
                      disabled={actionLoading}
                      className="px-4 py-2 bg-emerald-500 text-white font-extrabold border-2 border-slate-900 rounded-xl shadow-[2px_2px_0px_0px_#000] text-xs cursor-pointer"
                    >
                      Accept Friend Request
                    </button>
                  ) : (
                    <button
                      onClick={handleSendFriendRequest}
                      disabled={actionLoading}
                      className="px-4 py-2 neo-btn text-xs font-extrabold flex items-center gap-1.5 cursor-pointer"
                    >
                      <UserPlus className="w-4 h-4" /> Add Friend
                    </button>
                  )}
                </div>
              </div>

              {/* Joined Date */}
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 justify-center sm:justify-start pt-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>Joined {new Date(user.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}</span>
              </div>
            </div>
          </div>

          {/* Bio & Social Links Section */}
          <div className="pt-4 border-t-2 border-slate-200 space-y-3">
            {user.bio ? (
              <p className="text-xs font-semibold text-slate-800 whitespace-pre-wrap leading-relaxed">
                {user.bio}
              </p>
            ) : relationship.isSelf ? (
              <p className="text-xs font-semibold text-slate-400 italic">
                No bio added yet.{' '}
                <Link to="/settings/edit-profile" className="text-[#FF5A5F] hover:opacity-80 font-bold not-italic">
                  Add bio & social links
                </Link>
              </p>
            ) : null}

            {/* Social Links Badges */}
            {user.socialLinks && (
              <div className="flex items-center gap-2 flex-wrap pt-1">
                {user.socialLinks.linkedin && (
                  <a
                    href={user.socialLinks.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 border border-blue-500/30 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <LinkedinIcon className="w-3.5 h-3.5" /> LinkedIn
                  </a>
                )}

                {user.socialLinks.instagram && (
                  <a
                    href={user.socialLinks.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-pink-500/10 hover:bg-pink-500/20 text-pink-600 border border-pink-500/30 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <InstagramIcon className="w-3.5 h-3.5" /> Instagram
                  </a>
                )}

                {user.socialLinks.youtube && (
                  <a
                    href={user.socialLinks.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-600 border border-red-500/30 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <YoutubeIcon className="w-3.5 h-3.5" /> YouTube
                  </a>
                )}

                {user.socialLinks.portfolio && (
                  <a
                    href={user.socialLinks.portfolio}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 border border-emerald-500/30 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Globe className="w-3.5 h-3.5" /> Portfolio
                  </a>
                )}

                {user.socialLinks.facebook && (
                  <a
                    href={user.socialLinks.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-blue-600/10 hover:bg-blue-600/20 text-blue-700 border border-blue-600/30 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <FacebookIcon className="w-3.5 h-3.5" /> Facebook
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Profile Content Navigation Tabs */}
        <div className="flex p-2 bg-white border-2 border-slate-900 rounded-2xl shadow-[2px_2px_0px_0px_#000] gap-1.5 flex-wrap">
          <button
            onClick={() => setActiveTab('posts')}
            className={`flex-1 py-2 px-3 text-xs font-black rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'posts'
                ? 'bg-[#FF5A5F] text-white border-2 border-slate-900 shadow-[1.5px_1.5px_0px_0px_#000]'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Grid className="w-4 h-4" /> Posts ({userOwnPosts.length})
          </button>

          <button
            onClick={() => setActiveTab('reposts')}
            className={`flex-1 py-2 px-3 text-xs font-black rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'reposts'
                ? 'bg-[#FF5A5F] text-white border-2 border-slate-900 shadow-[1.5px_1.5px_0px_0px_#000]'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Repeat className="w-4 h-4" /> Reposts ({userReposts.length})
          </button>

          <button
            onClick={() => setActiveTab('media')}
            className={`flex-1 py-2 px-3 text-xs font-black rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'media'
                ? 'bg-[#FF5A5F] text-white border-2 border-slate-900 shadow-[1.5px_1.5px_0px_0px_#000]'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <ImageIcon className="w-4 h-4" /> Media ({mediaPosts.length})
          </button>

          <button
            onClick={() => setActiveTab('friends')}
            className={`flex-1 py-2 px-3 text-xs font-black rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'friends'
                ? 'bg-[#FF5A5F] text-white border-2 border-slate-900 shadow-[1.5px_1.5px_0px_0px_#000]'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Users className="w-4 h-4" /> Friends ({user.friendsCount})
          </button>
        </div>

        {/* Tab Content Display */}
        {activeTab === 'friends' ? (
          <div className="space-y-4">
            {!canViewFriends ? (
              <div className="neo-box p-10 text-center space-y-3">
                <Lock className="w-10 h-10 text-amber-500 mx-auto" />
                <h4 className="font-extrabold text-base text-slate-900">Friends list is private</h4>
                <p className="text-xs font-semibold text-slate-500 max-w-sm mx-auto">
                  Add {user.name} as a friend to view their connected friends list.
                </p>
              </div>
            ) : user.friends?.length === 0 ? (
              <div className="neo-box p-10 text-center space-y-2">
                <Users className="w-8 h-8 text-slate-400 mx-auto" />
                <h4 className="font-extrabold text-sm text-slate-900">No friends yet</h4>
                <p className="text-xs font-semibold text-slate-500">
                  {relationship.isSelf
                    ? 'Explore suggestions in the Discover tab to connect with people!'
                    : `${user.name} hasn't added any friends yet.`}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {user.friends.map((friend) => (
                  <div
                    key={friend._id}
                    className="p-4 neo-box flex items-center justify-between gap-3 hover:scale-[1.01] transition"
                  >
                    <Link
                      to={`/profile/${friend._id}`}
                      className="flex items-center gap-3 min-w-0 flex-1 hover:opacity-80 transition cursor-pointer"
                    >
                      <Avatar
                        src={friend.profilePic}
                        seed={friend.avatarSeed}
                        name={friend.name}
                        size="md"
                      />
                      <div className="min-w-0 flex-1">
                        <h4 className="font-extrabold text-sm text-slate-900 truncate">
                          {friend.name}
                        </h4>
                        <span className="text-xs font-semibold text-slate-500 truncate block">
                          {friend.email}
                        </span>
                      </div>
                    </Link>

                    <button
                      onClick={() => {
                        if (onSelectChat) onSelectChat(friend);
                        else navigate(`/chats/${friend._id}`);
                      }}
                      className="p-2.5 neo-btn text-xs rounded-xl cursor-pointer"
                      title="Send Message"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* User Posts Stream */
          <div className="space-y-5">
            {filteredPosts.length === 0 ? (
              <div className="neo-box p-10 text-center space-y-2">
                <Sparkles className="w-7 h-7 text-[#FF5A5F] mx-auto" />
                <h4 className="font-extrabold text-sm text-slate-900">
                  {activeTab === 'media'
                    ? 'No photos shared yet'
                    : activeTab === 'reposts'
                    ? 'No reposts yet'
                    : 'No posts yet'}
                </h4>
                <p className="text-xs font-semibold text-slate-500">
                  {relationship.isSelf
                    ? 'Share posts or repost content from the Feed tab!'
                    : `${user.name} has no ${activeTab} to show right now.`}
                </p>
              </div>
            ) : (
              filteredPosts.map((post) => {
                const targetPostObj = post.originalPost || post;
                const isAuthor = post.author?._id === currentUser?._id;
                const isLiked = post.likes?.some(l => (l._id || l).toString() === currentUser?._id?.toString());
                const isReposted = targetPostObj.reposts?.some((id) => (id._id || id).toString() === currentUser?._id?.toString());
                const likesList = post.likes || [];
                const likesCount = likesList.length;

                // Total comments count including replies
                const topLevelCommentsCount = post.comments?.length || 0;
                const repliesCount = post.comments?.reduce((acc, c) => acc + (c.replies?.length || 0), 0) || 0;
                const totalCommentsCount = topLevelCommentsCount + repliesCount;

                const repostsCount = targetPostObj.reposts?.length || 0;
                const showComments = expandedComments[post._id];

                return (
                  <article key={post._id} className="neo-box p-5 space-y-4">
                    {/* Repost Banner */}
                    {post.originalPost && (
                      <div className="flex items-center gap-1.5 text-xs font-extrabold text-indigo-600 pb-1 border-b-2 border-slate-200">
                        <Repeat className="w-3.5 h-3.5" />
                        <span>Reposted by {post.author?.name}</span>
                      </div>
                    )}

                    {/* Post Author Info */}
                    <div className="flex items-center justify-between">
                      <Link to={`/profile/${post.author?._id}`} className="flex items-center gap-3 hover:opacity-80 transition cursor-pointer">
                        <Avatar src={post.author?.profilePic} seed={post.author?.avatarSeed} name={post.author?.name} size="md" />
                        <div>
                          <h4 className="font-extrabold text-sm text-slate-900 leading-tight">
                            {post.author?.name}
                          </h4>
                          <span className="text-[11px] font-semibold text-slate-500">
                            {formatTimestamp(post.createdAt)}
                          </span>
                        </div>
                      </Link>

                      <div className="flex items-center gap-1">
                        <Link
                          to={`/post/${post._id}`}
                          className="p-2 text-slate-400 hover:text-slate-800 rounded-xl transition cursor-pointer"
                          title="View Insights & Full Details"
                        >
                          <BarChart2 className="w-4 h-4" />
                        </Link>

                        {isAuthor && !post.originalPost && (
                          <button
                            onClick={() => {
                              setEditingPostId(post._id);
                              setEditingCaption(post.caption || '');
                            }}
                            className="p-2 text-slate-400 hover:text-indigo-600 rounded-xl transition cursor-pointer"
                            title="Edit post text"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                        )}

                        {isAuthor && (
                          <button
                            onClick={() => handleDeletePost(post._id)}
                            className="p-2 text-slate-400 hover:text-red-500 rounded-xl transition cursor-pointer"
                            title="Delete post"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Inline Editing Form or Post Caption */}
                    {editingPostId === post._id ? (
                      <div className="space-y-2 p-3 bg-amber-50 rounded-2xl border-2 border-slate-900">
                        <textarea
                          rows={3}
                          value={editingCaption}
                          onChange={(e) => setEditingCaption(e.target.value)}
                          className="w-full neo-input p-2.5 text-xs font-semibold resize-none"
                        />
                        <EmojiBar onSelectEmoji={(emoji) => setEditingCaption((prev) => prev + emoji)} />
                        <div className="flex items-center justify-end gap-2 pt-1">
                          <button onClick={() => setEditingPostId(null)} className="px-3 py-1 neo-btn-secondary text-[11px]">
                            Cancel
                          </button>
                          <button onClick={() => handleUpdatePost(post._id)} className="px-3 py-1 neo-btn text-[11px]">
                            Save Text
                          </button>
                        </div>
                      </div>
                    ) : (
                      post.caption && (
                        <div className="text-sm font-semibold text-slate-800 leading-relaxed">
                          {post.caption.length > 180 ? (
                            <>
                              <span>{post.caption.slice(0, 180)}... </span>
                              <Link
                                to={`/post/${post._id}`}
                                className="text-[#FF5A5F] hover:opacity-80 font-extrabold cursor-pointer inline-flex items-center"
                              >
                                See more
                              </Link>
                            </>
                          ) : (
                            <span className="whitespace-pre-wrap">{post.caption}</span>
                          )}
                        </div>
                      )
                    )}

                    {/* Post Images Swiper Carousel */}
                    <PostMediaCarousel post={post} />

                    {/* Original Post Card (If Repost) */}
                    {post.originalPost && (
                      <div className="p-4 rounded-2xl bg-amber-50/70 border-2 border-slate-900 space-y-2">
                        <div className="flex items-center gap-2">
                          <Avatar
                            src={post.originalPost.author?.profilePic}
                            seed={post.originalPost.author?.avatarSeed}
                            name={post.originalPost.author?.name}
                            size="xs"
                          />
                          <span className="font-bold text-xs text-slate-900">
                            {post.originalPost.author?.name}
                          </span>
                        </div>
                        {post.originalPost.caption && (
                          <p className="text-xs font-semibold text-slate-700">
                            {post.originalPost.caption}
                          </p>
                        )}
                        <PostMediaCarousel post={post.originalPost} />
                      </div>
                    )}

                    {/* Action Bar */}
                    <div className="flex items-center justify-between pt-2 border-t-2 border-slate-200 text-xs font-black">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleLike(post._id)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2 border-slate-900 cursor-pointer transition ${
                            isLiked
                              ? 'bg-rose-500 text-white shadow-[1.5px_1.5px_0px_0px_#000]'
                              : 'bg-slate-100 text-slate-700 hover:bg-rose-50'
                          }`}
                        >
                          <Heart className={`w-4 h-4 ${isLiked ? 'fill-white' : ''}`} />
                        </button>

                        <button
                          onClick={() => setLikedByModalPost(post)}
                          className="text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer transition"
                        >
                          {likesCount} {likesCount === 1 ? 'like' : 'likes'}
                        </button>
                      </div>

                      <button
                        onClick={() => toggleCommentsView(post._id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl border-2 border-slate-900 cursor-pointer transition"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>{totalCommentsCount}</span>
                      </button>

                      <button
                        onClick={() => handleRepost(post)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2 border-slate-900 cursor-pointer transition ${
                          isReposted
                            ? 'bg-indigo-600 text-white shadow-[1.5px_1.5px_0px_0px_#000]'
                            : 'bg-slate-100 text-slate-700 hover:bg-indigo-50'
                        }`}
                        title={isReposted ? 'Undo Repost' : 'Repost to feed'}
                      >
                        <Repeat className="w-4 h-4" />
                        <span>{repostsCount}</span>
                      </button>
                    </div>

                    {/* Comment Section */}
                    {showComments && (
                      <div className="pt-3 border-t border-slate-200 space-y-3">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Avatar src={currentUser?.profilePic} seed={currentUser?.avatarSeed} name={currentUser?.name} size="xs" />
                            <input
                              type="text"
                              value={commentInputs[post._id] || ''}
                              onChange={(e) => setCommentInputs({ ...commentInputs, [post._id]: e.target.value })}
                              onKeyDown={(e) => e.key === 'Enter' && handleAddComment(post._id)}
                              placeholder="Write a comment..."
                              className="flex-1 neo-input px-3 py-1.5 text-xs font-semibold"
                            />
                            <button
                              onClick={() => handleAddComment(post._id)}
                              className="p-2 bg-[#FF5A5F] text-white border-2 border-slate-900 rounded-xl shadow-[1px_1px_0px_0px_#000] cursor-pointer"
                            >
                              <Send className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <EmojiBar
                            onSelectEmoji={(emoji) =>
                              setCommentInputs((prev) => ({
                                ...prev,
                                [post._id]: (prev[post._id] || '') + emoji
                              }))
                            }
                          />
                        </div>

                        <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                          {post.comments?.length === 0 ? (
                            <p className="text-[11px] font-semibold text-slate-400 py-1 text-center">
                              No comments yet.
                            </p>
                          ) : (
                            post.comments.map((comment) => {
                              const isCommentLiked = comment.likes?.some(
                                (l) => (l._id || l).toString() === currentUser?._id?.toString()
                              );
                              const commentLikesCount = comment.likes?.length || 0;
                              const isReplying = replyingToCommentId === comment._id;
                              const hasReplies = comment.replies && comment.replies.length > 0;
                              const isRepliesExpanded = expandedReplies[comment._id];

                              return (
                                <div key={comment._id} className="space-y-2">
                                  <div className="p-3 bg-amber-50/50 rounded-xl border border-slate-200 space-y-2">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        <Avatar
                                          src={comment.user?.profilePic}
                                          seed={comment.user?.avatarSeed}
                                          name={comment.user?.name}
                                          size="xs"
                                        />
                                        <Link
                                          to={`/profile/${comment.user?._id}`}
                                          className="font-extrabold text-xs text-slate-900 hover:opacity-80 transition"
                                        >
                                          {comment.user?.name}
                                        </Link>
                                      </div>
                                      <span className="text-[10px] text-slate-400 font-medium">
                                        {formatTimestamp(comment.createdAt)}
                                      </span>
                                    </div>

                                    <p className="text-xs font-medium text-slate-700 pl-6 whitespace-pre-wrap">
                                      {comment.text}
                                    </p>

                                    <div className="flex items-center gap-3 pl-6 pt-1 text-[11px] font-bold">
                                      <button
                                        onClick={() => handleToggleLikeComment(post._id, comment._id)}
                                        className={`flex items-center gap-1 cursor-pointer transition ${
                                          isCommentLiked
                                            ? 'text-rose-500'
                                            : 'text-slate-500 hover:text-slate-900'
                                        }`}
                                      >
                                        <Heart className={`w-3.5 h-3.5 ${isCommentLiked ? 'fill-rose-500' : ''}`} />
                                        <span>{commentLikesCount > 0 && commentLikesCount}</span>
                                      </button>

                                      <button
                                        onClick={() => setReplyingToCommentId(isReplying ? null : comment._id)}
                                        className="flex items-center gap-1 text-slate-500 hover:text-indigo-600 cursor-pointer transition"
                                      >
                                        <Reply className="w-3.5 h-3.5" />
                                        <span>Reply</span>
                                      </button>
                                    </div>
                                  </div>

                                  {/* Inline Reply Input */}
                                  {isReplying && (
                                    <div className="ml-6 pl-2 border-l-2 border-slate-300 space-y-2">
                                      <div className="flex items-center gap-2">
                                        <Avatar src={currentUser?.profilePic} seed={currentUser?.avatarSeed} name={currentUser?.name} size="xs" />
                                        <input
                                          type="text"
                                          value={replyInputs[comment._id] || ''}
                                          onChange={(e) =>
                                            setReplyInputs({
                                              ...replyInputs,
                                              [comment._id]: e.target.value
                                            })
                                          }
                                          onKeyDown={(e) => e.key === 'Enter' && handleAddReply(post._id, comment._id)}
                                          placeholder={`Reply to ${comment.user?.name || 'comment'}...`}
                                          className="flex-1 neo-input px-3 py-1 text-xs font-semibold"
                                        />
                                        <button
                                          onClick={() => handleAddReply(post._id, comment._id)}
                                          className="p-1.5 bg-indigo-600 text-white border border-slate-900 rounded-lg cursor-pointer"
                                        >
                                          <Send className="w-3 h-3" />
                                        </button>
                                      </div>
                                      <EmojiBar
                                        onSelectEmoji={(emoji) =>
                                          setReplyInputs((prev) => ({
                                            ...prev,
                                            [comment._id]: (prev[comment._id] || '') + emoji
                                          }))
                                        }
                                      />
                                    </div>
                                  )}

                                  {/* Nested Replies Stream (Toggle Button & Expandable List) */}
                                  {hasReplies && (
                                    <div className="ml-6 border-l-2 border-slate-300 pl-3 space-y-2">
                                      <button
                                        onClick={() => toggleRepliesView(comment._id)}
                                        className="text-xs font-black text-indigo-600 hover:opacity-80 cursor-pointer flex items-center gap-1 py-1"
                                      >
                                        <CornerDownRight className="w-3.5 h-3.5" />
                                        <span>
                                          {isRepliesExpanded
                                            ? 'Hide replies'
                                            : `View ${comment.replies.length} ${
                                                comment.replies.length === 1 ? 'reply' : 'replies'
                                              }`}
                                        </span>
                                      </button>

                                      {isRepliesExpanded && (
                                        <div className="space-y-2">
                                          {comment.replies.map((reply) => {
                                            const isReplyLiked = reply.likes?.some(
                                              (l) => (l._id || l).toString() === currentUser?._id?.toString()
                                            );
                                            const replyLikesCount = reply.likes?.length || 0;

                                            return (
                                              <div
                                                key={reply._id}
                                                className="p-2.5 bg-slate-100/60 rounded-xl border border-slate-200 space-y-1"
                                              >
                                                <div className="flex items-center justify-between">
                                                  <div className="flex items-center gap-2">
                                                    <Avatar
                                                      src={reply.user?.profilePic}
                                                      seed={reply.user?.avatarSeed}
                                                      name={reply.user?.name}
                                                      size="xs"
                                                    />
                                                    <Link
                                                      to={`/profile/${reply.user?._id}`}
                                                      className="font-extrabold text-[11px] text-slate-900 hover:opacity-80 transition"
                                                    >
                                                      {reply.user?.name}
                                                    </Link>
                                                  </div>
                                                  <span className="text-[9px] text-slate-400 font-medium">
                                                    {formatTimestamp(reply.createdAt)}
                                                  </span>
                                                </div>

                                                <p className="text-xs font-medium text-slate-700 pl-6">
                                                  {reply.text}
                                                </p>

                                                <div className="pl-6 pt-0.5">
                                                  <button
                                                    onClick={() => handleToggleLikeReply(post._id, comment._id, reply._id)}
                                                    className={`flex items-center gap-1 text-[10px] font-bold cursor-pointer transition ${
                                                      isReplyLiked
                                                        ? 'text-rose-500'
                                                        : 'text-slate-500 hover:text-slate-900'
                                                    }`}
                                                  >
                                                    <Heart className={`w-3 h-3 ${isReplyLiked ? 'fill-rose-500' : ''}`} />
                                                    <span>{replyLikesCount > 0 && replyLikesCount}</span>
                                                  </button>
                                                </div>
                                              </div>
                                            );
                                          })}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    )}
                  </article>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Liked By Modal */}
      <LikedByModal
        isOpen={Boolean(likedByModalPost)}
        onClose={() => setLikedByModalPost(null)}
        likes={likedByModalPost?.likes || []}
      />
    </div>
  );
};
