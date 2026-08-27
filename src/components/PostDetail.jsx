import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Avatar } from './Avatar';
import { LikedByModal } from './LikedByModal';
import { PostMediaCarousel } from './PostMediaCarousel';
import { EmojiBar } from './EmojiBar';
import { apiFetch } from '../utils/api';
import {
  Heart,
  MessageCircle,
  Repeat,
  Send,
  Loader2,
  Trash2,
  Edit3,
  X,
  ArrowLeft,
  BarChart2,
  Reply,
  CornerDownRight
} from 'lucide-react';

export const PostDetail = () => {
  const { user } = useAuth();
  const { postId } = useParams();
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Editing state
  const [isEditing, setIsEditing] = useState(false);
  const [editCaption, setEditCaption] = useState('');
  const [updateLoading, setUpdateLoading] = useState(false);

  // Comment state
  const [commentText, setCommentText] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [replyInputs, setReplyInputs] = useState({});
  const [replyingToCommentId, setReplyingToCommentId] = useState(null);
  const [expandedReplies, setExpandedReplies] = useState({});

  // Liked By Modal
  const [showLikesModal, setShowLikesModal] = useState(false);

  const fetchPost = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await apiFetch(`/api/posts/${postId}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to load post');
      }

      setPost(data);
      setEditCaption(data.caption || '');
    } catch (err) {
      setError(err.message || 'Could not fetch post details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPost();
  }, [postId]);

  const handleUpdateCaption = async (e) => {
    e.preventDefault();
    setUpdateLoading(true);
    try {
      const res = await apiFetch(`/api/posts/${postId}`, {
        method: 'PUT',
        body: JSON.stringify({ caption: editCaption.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update post');

      setPost(data);
      setIsEditing(false);
    } catch (err) {
      setError(err.message || 'Failed to update post');
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleToggleLike = async () => {
    try {
      const res = await apiFetch(`/api/posts/${postId}/like`, { method: 'POST' });
      if (!res.ok) return;

      const data = await res.json();
      setPost((prev) => (prev ? { ...prev, likes: data.likes } : prev));
    } catch (err) {
      console.error('Like Toggle Error:', err);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setCommentLoading(true);
    try {
      const res = await apiFetch(`/api/posts/${postId}/comment`, {
        method: 'POST',
        body: JSON.stringify({ text: commentText.trim() }),
      });
      const data = await res.json();
      if (!res.ok) return;

      setPost((prev) => (prev ? { ...prev, comments: data.comments } : prev));
      setCommentText('');
    } catch (err) {
      console.error('Comment Add Error:', err);
    } finally {
      setCommentLoading(false);
    }
  };

  const handleToggleLikeComment = async (commentId) => {
    try {
      const res = await apiFetch(`/api/posts/${postId}/comments/${commentId}/like`, { method: 'POST' });
      if (!res.ok) return;
      const data = await res.json();
      setPost((prev) => (prev ? { ...prev, comments: data.comments } : prev));
    } catch (err) {
      console.error('Like Comment Error:', err);
    }
  };

  const handleAddReply = async (commentId) => {
    const text = replyInputs[commentId];
    if (!text || !text.trim()) return;

    try {
      const res = await apiFetch(`/api/posts/${postId}/comments/${commentId}/reply`, {
        method: 'POST',
        body: JSON.stringify({ text: text.trim() })
      });
      if (!res.ok) return;
      const data = await res.json();
      setPost((prev) => (prev ? { ...prev, comments: data.comments } : prev));
      setReplyInputs((prev) => ({ ...prev, [commentId]: '' }));
      setReplyingToCommentId(null);
      setExpandedReplies((prev) => ({ ...prev, [commentId]: true }));
    } catch (err) {
      console.error('Add Reply Error:', err);
    }
  };

  const handleToggleLikeReply = async (commentId, replyId) => {
    try {
      const res = await apiFetch(`/api/posts/${postId}/comments/${commentId}/replies/${replyId}/like`, { method: 'POST' });
      if (!res.ok) return;
      const data = await res.json();
      setPost((prev) => (prev ? { ...prev, comments: data.comments } : prev));
    } catch (err) {
      console.error('Like Reply Error:', err);
    }
  };

  const handleRepost = async () => {
    try {
      const res = await apiFetch(`/api/posts/${postId}/repost`, { method: 'POST' });
      if (!res.ok) return;
      fetchPost();
    } catch (err) {
      console.error('Repost Error:', err);
    }
  };

  const handleDeletePost = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      const res = await apiFetch(`/api/posts/${postId}`, { method: 'DELETE' });
      if (!res.ok) return;
      navigate(-1);
    } catch (err) {
      console.error('Delete Post Error:', err);
    }
  };

  const toggleRepliesView = (commentId) => {
    setExpandedReplies((prev) => ({
      ...prev,
      [commentId]: !prev[commentId]
    }));
  };

  const formatTimestamp = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-slate-500 font-bold gap-2 text-sm">
        <Loader2 className="w-6 h-6 animate-spin text-[#FF5A5F]" />
        Loading post details & insights...
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="flex-1 p-8 text-center space-y-4">
        <div className="neo-box p-8 max-w-md mx-auto space-y-3">
          <h3 className="font-extrabold text-base text-red-500">{error || 'Post not found'}</h3>
          <button onClick={() => navigate(-1)} className="neo-btn-secondary px-4 py-2 text-xs">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const isAuthor = post.author?._id === user?._id;
  const isLiked = post.likes?.some(l => (l._id || l).toString() === user?._id?.toString());
  const likesList = post.likes || [];
  const likesCount = likesList.length;

  // Total comments count including replies
  const topLevelCommentsCount = post.comments?.length || 0;
  const repliesCount = post.comments?.reduce((acc, c) => acc + (c.replies?.length || 0), 0) || 0;
  const totalCommentsCount = topLevelCommentsCount + repliesCount;

  const repostsCount = post.reposts?.length || 0;

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-[#FAF7F2] text-slate-900 flex justify-center">
      <div className="max-w-2xl w-full space-y-6">
        {/* Header Bar */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl border-2 border-slate-900 transition cursor-pointer"
            title="Go Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-[#FF5A5F]" />
              Post Details & Insights
            </h2>
            <p className="text-xs font-semibold text-slate-500">View post analytics and full engagement</p>
          </div>
        </div>

        {/* Post Main Card */}
        <article className="neo-box p-6 space-y-5">
          {/* Repost Header Badge */}
          {post.originalPost && (
            <div className="flex items-center gap-1.5 text-xs font-extrabold text-indigo-600 pb-2 border-b-2 border-slate-200">
              <Repeat className="w-4 h-4" />
              <span>Reposted by {post.author?.name}</span>
            </div>
          )}

          {/* Author Header */}
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

            {isAuthor && (
              <div className="flex items-center gap-1">
                {!post.originalPost && (
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="p-2 text-slate-500 hover:text-indigo-600 rounded-xl transition cursor-pointer"
                    title="Edit post text"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={handleDeletePost}
                  className="p-2 text-slate-500 hover:text-red-500 rounded-xl transition cursor-pointer"
                  title="Delete post"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Inline Edit Form */}
          {isEditing ? (
            <form onSubmit={handleUpdateCaption} className="space-y-3 p-4 bg-amber-50 rounded-2xl border-2 border-slate-900">
              <label className="block text-xs font-extrabold text-slate-700">Edit Caption Text:</label>
              <textarea
                rows={3}
                value={editCaption}
                onChange={(e) => setEditCaption(e.target.value)}
                className="w-full neo-input p-3 text-sm resize-none font-semibold"
              />
              <EmojiBar onSelectEmoji={(emoji) => setEditCaption((prev) => prev + emoji)} />
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1.5 neo-btn-secondary text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateLoading}
                  className="px-4 py-1.5 neo-btn text-xs flex items-center gap-1.5"
                >
                  {updateLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Save Changes'}
                </button>
              </div>
            </form>
          ) : (
            post.caption && (
              <p className="text-base font-semibold text-slate-800 whitespace-pre-wrap leading-relaxed">
                {post.caption}
              </p>
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
          <div className="flex items-center justify-between pt-3 border-t-2 border-slate-200 text-xs font-black">
            <button
              onClick={handleToggleLike}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl border-2 border-slate-900 cursor-pointer transition ${
                isLiked
                  ? 'bg-rose-500 text-white shadow-[1.5px_1.5px_0px_0px_#000]'
                  : 'bg-slate-100 text-slate-700 hover:bg-rose-50'
              }`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-white' : ''}`} />
              <span>{likesCount} Likes</span>
            </button>

            <button
              onClick={handleRepost}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 text-slate-700 rounded-xl border-2 border-slate-900 cursor-pointer"
            >
              <Repeat className="w-4 h-4" />
              <span>{repostsCount} Reposts</span>
            </button>
          </div>
        </article>

        {/* Post Insights Analytics Card */}
        <div className="neo-box p-6 space-y-4">
          <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-[#FF5A5F]" /> Post Engagement Insights
          </h3>

          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => setShowLikesModal(true)}
              className="p-3 bg-amber-50 rounded-2xl border-2 border-slate-900 text-center hover:scale-[1.02] transition cursor-pointer"
            >
              <span className="block text-2xl font-black text-rose-500">{likesCount}</span>
              <span className="text-[11px] font-extrabold uppercase text-slate-500">Liked By</span>
            </button>

            <div className="p-3 bg-amber-50 rounded-2xl border-2 border-slate-900 text-center">
              <span className="block text-2xl font-black text-blue-500">{totalCommentsCount}</span>
              <span className="text-[11px] font-extrabold uppercase text-slate-500">Comments</span>
            </div>

            <div className="p-3 bg-amber-50 rounded-2xl border-2 border-slate-900 text-center">
              <span className="block text-2xl font-black text-indigo-500">{repostsCount}</span>
              <span className="text-[11px] font-extrabold uppercase text-slate-500">Reposts</span>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="neo-box p-6 space-y-4">
          <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-blue-500" />
            Comments ({totalCommentsCount})
          </h3>

          {/* Add Comment Form */}
          <form onSubmit={handleAddComment} className="space-y-2">
            <div className="flex items-center gap-2">
              <Avatar src={user?.profilePic} seed={user?.avatarSeed} name={user?.name} size="sm" />
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 neo-input px-3.5 py-2 text-xs font-semibold"
              />
              <button
                type="submit"
                disabled={commentLoading || !commentText.trim()}
                className="px-4 py-2 bg-[#FF5A5F] text-white border-2 border-slate-900 rounded-xl shadow-[1.5px_1.5px_0px_0px_#000] text-xs font-extrabold cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
              >
                {commentLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>
            <EmojiBar onSelectEmoji={(emoji) => setCommentText((prev) => prev + emoji)} />
          </form>

          {/* Comments Stream */}
          <div className="space-y-3 pt-2">
            {post.comments?.length === 0 ? (
              <p className="text-xs font-semibold text-slate-400 py-3 text-center">
                No comments yet. Be the first to comment!
              </p>
            ) : (
              post.comments.map((comment) => {
                const isCommentLiked = comment.likes?.some((l) => (l._id || l).toString() === user?._id?.toString());
                const commentLikesCount = comment.likes?.length || 0;
                const isReplying = replyingToCommentId === comment._id;
                const hasReplies = comment.replies && comment.replies.length > 0;
                const isRepliesExpanded = expandedReplies[comment._id];

                return (
                  <div key={comment._id} className="space-y-2">
                    <div className="p-3 bg-amber-50/60 rounded-2xl border border-slate-200 space-y-2">
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
                          onClick={() => handleToggleLikeComment(comment._id)}
                          className={`flex items-center gap-1 cursor-pointer transition ${
                            isCommentLiked ? 'text-rose-500' : 'text-slate-500 hover:text-slate-900'
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
                          <Avatar src={user?.profilePic} seed={user?.avatarSeed} name={user?.name} size="xs" />
                          <input
                            type="text"
                            value={replyInputs[comment._id] || ''}
                            onChange={(e) =>
                              setReplyInputs({ ...replyInputs, [comment._id]: e.target.value })
                            }
                            onKeyDown={(e) => e.key === 'Enter' && handleAddReply(comment._id)}
                            placeholder={`Reply to ${comment.user?.name || 'comment'}...`}
                            className="flex-1 neo-input px-3 py-1 text-xs font-semibold"
                          />
                          <button
                            onClick={() => handleAddReply(comment._id)}
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
                                (l) => (l._id || l).toString() === user?._id?.toString()
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
                                      onClick={() => handleToggleLikeReply(comment._id, reply._id)}
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
      </div>

      {/* Liked By Modal */}
      <LikedByModal
        isOpen={showLikesModal}
        onClose={() => setShowLikesModal(false)}
        likes={likesList}
      />
    </div>
  );
};
