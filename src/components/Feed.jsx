import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  Image as ImageIcon,
  Send,
  Loader2,
  Trash2,
  X,
  Sparkles,
  Edit3,
  BarChart2,
  Reply,
  CornerDownRight
} from 'lucide-react';

export const Feed = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [caption, setCaption] = useState('');
  
  // Multi-image selection state (up to 5)
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  
  const [uploadingImage, setUploadingImage] = useState(false);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState('');

  // Editing post state
  const [editingPostId, setEditingPostId] = useState(null);
  const [editingCaption, setEditingCaption] = useState('');

  // Liked By Modal state
  const [likedByModalPost, setLikedByModalPost] = useState(null);

  // Comments state
  const [commentInputs, setCommentInputs] = useState({});
  const [expandedComments, setExpandedComments] = useState({});
  const [replyInputs, setReplyInputs] = useState({});
  const [replyingToCommentId, setReplyingToCommentId] = useState(null);
  const [expandedReplies, setExpandedReplies] = useState({});

  const fetchPosts = async () => {
    try {
      setLoadingPosts(true);
      const res = await apiFetch('/api/posts');
      if (res.ok) {
        const data = await res.json();
        setPosts(data);
      }
    } catch (err) {
      console.error('Fetch Posts Error:', err);
    } finally {
      setLoadingPosts(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const compressImageFile = (file) => {
    return new Promise((resolve) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        const MAX_DIM = 1920;
        let width = img.width;
        let height = img.height;

        if (width > MAX_DIM || height > MAX_DIM) {
          if (width > height) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          } else {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.85));
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(file);
      };
      img.src = url;
    });
  };

  const handleImageSelect = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    if (selectedImages.length + files.length > 5) {
      setError('You can upload a maximum of 5 images per post');
      return;
    }

    setUploadingImage(true);
    setError('');

    try {
      const newPreviews = [];
      const newBase64s = [];

      for (const file of files) {
        if (!file.type.startsWith('image/')) continue;

        const objectUrl = URL.createObjectURL(file);
        newPreviews.push(objectUrl);

        const compressedBase64 = await compressImageFile(file);
        newBase64s.push(compressedBase64);
      }

      setImagePreviews((prev) => [...prev, ...newPreviews]);
      setSelectedImages((prev) => [...prev, ...newBase64s]);
    } catch (err) {
      setError('Failed to process images');
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveSinglePreview = (index) => {
    if (imagePreviews[index]) URL.revokeObjectURL(imagePreviews[index]);
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!caption.trim() && selectedImages.length === 0) {
      setError('Please add a caption or select at least one image to post');
      return;
    }

    setPosting(true);
    setError('');

    try {
      const res = await apiFetch('/api/posts', {
        method: 'POST',
        body: JSON.stringify({
          caption: caption.trim(),
          images: selectedImages
        }),
      });

      const newPost = await res.json();
      if (!res.ok) {
        throw new Error(newPost.message || 'Failed to create post');
      }

      setPosts((prev) => [newPost, ...prev]);
      setCaption('');
      imagePreviews.forEach((url) => URL.revokeObjectURL(url));
      setImagePreviews([]);
      setSelectedImages([]);
    } catch (err) {
      setError(err.message || 'Failed to create post');
    } finally {
      setPosting(false);
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

      setPosts((prev) => prev.map((p) => (p._id === postId ? data : p)));
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
      setPosts((prev) =>
        prev.map((p) => {
          if (p._id === postId) {
            return { ...p, likes: data.likes };
          }
          return p;
        })
      );
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

      setPosts((prev) =>
        prev.map((p) => {
          if (p._id === postId) {
            return { ...p, comments: data.comments };
          }
          return p;
        })
      );

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
      setPosts((prev) => prev.map((p) => (p._id === postId ? { ...p, comments: data.comments } : p)));
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
      setPosts((prev) => prev.map((p) => (p._id === postId ? { ...p, comments: data.comments } : p)));
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
      setPosts((prev) => prev.map((p) => (p._id === postId ? { ...p, comments: data.comments } : p)));
    } catch (err) {
      console.error('Like Reply Error:', err);
    }
  };

  const handleRepost = async (post) => {
    const targetPostId = post.originalPost?._id || post._id;

    try {
      const res = await apiFetch(`/api/posts/${targetPostId}/repost`, { method: 'POST' });
      if (!res.ok) return;

      const data = await res.json();

      if (data.isReposted && data.newRepost) {
        setPosts((prev) => [
          data.newRepost,
          ...prev.map((p) => {
            if (p._id === targetPostId) {
              return { ...p, reposts: data.reposts };
            }
            return p;
          })
        ]);
      } else {
        setPosts((prev) =>
          prev
            .filter((p) => p._id !== data.deletedRepostId)
            .map((p) => {
              if (p._id === targetPostId) {
                return { ...p, reposts: data.reposts };
              }
              return p;
            })
        );
      }
    } catch (err) {
      console.error('Repost Error:', err);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;

    try {
      const res = await apiFetch(`/api/posts/${postId}`, { method: 'DELETE' });
      if (!res.ok) return;
      setPosts((prev) => prev.filter((p) => p._id !== postId));
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

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-[#FAF7F2] text-slate-900 flex justify-center">
      <div className="max-w-2xl w-full space-y-6">
        {/* Create Post Box */}
        <div className="neo-box p-5 space-y-4">
          <div className="flex items-center gap-3">
            <Avatar src={user?.profilePic} seed={user?.avatarSeed} name={user?.name} size="md" />
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">Create Post</h3>
              <p className="text-xs font-semibold text-slate-500">Share photos (up to 5), updates or thoughts</p>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border-2 border-red-500 text-red-600 text-xs font-bold p-3 rounded-xl">
              {error}
            </div>
          )}

          <form onSubmit={handleCreatePost} className="space-y-3">
            <textarea
              rows={3}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder={`What's on your mind, ${user?.name || 'there'}?`}
              className="w-full neo-input p-3 text-sm resize-none"
            />

            {/* Emoji Suggestion Bar */}
            <EmojiBar onSelectEmoji={(emoji) => setCaption((prev) => prev + emoji)} />

            {/* Multi-Image Selected Previews (Centered in the middle) */}
            {imagePreviews.length > 0 && (
              <div className="space-y-2 text-center">
                <div className="flex items-center justify-center">
                  <span className="text-xs font-extrabold text-slate-500">
                    Selected Images ({imagePreviews.length}/5)
                  </span>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-3 py-2">
                  {imagePreviews.map((url, idx) => (
                    <div key={idx} className="relative border-2 border-slate-900 rounded-2xl overflow-hidden shadow-[2px_2px_0px_0px_#000] bg-slate-950/5 flex items-center justify-center p-1">
                      <img src={url} alt={`Preview #${idx + 1}`} className="h-32 w-auto max-w-[200px] object-contain mx-auto rounded-xl" />
                      <button
                        type="button"
                        onClick={() => handleRemoveSinglePreview(idx)}
                        className="absolute top-1.5 right-1.5 p-1 bg-slate-900/80 text-white rounded-lg hover:bg-red-500 cursor-pointer transition shadow-md"
                        title="Remove image"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t-2 border-slate-200">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageSelect}
                accept="image/*"
                multiple
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingImage || posting || selectedImages.length >= 5}
                className="px-3.5 py-2 bg-amber-100 text-slate-800 hover:bg-amber-200 text-xs font-bold rounded-xl border-2 border-slate-900 shadow-[1.5px_1.5px_0px_0px_#000] flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <ImageIcon className="w-4 h-4 text-emerald-500" />
                <span>Photos ({selectedImages.length}/5)</span>
              </button>

              <button
                type="submit"
                disabled={posting || uploadingImage || (!caption.trim() && selectedImages.length === 0)}
                className="px-5 py-2 neo-btn text-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {posting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Posting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" /> Post
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Feed Posts List */}
        {loadingPosts ? (
          <div className="flex items-center justify-center py-16 text-slate-500 font-bold gap-2 text-sm">
            <Loader2 className="w-5 h-5 animate-spin text-[#FF5A5F]" />
            Loading feed...
          </div>
        ) : posts.length === 0 ? (
          <div className="neo-box p-12 text-center space-y-3">
            <Sparkles className="w-8 h-8 text-[#FF5A5F] mx-auto" />
            <h4 className="font-black text-base text-slate-900">No posts in feed yet</h4>
            <p className="text-xs font-semibold text-slate-500">Be the first to share a post or image!</p>
          </div>
        ) : (
          posts.map((post) => {
            const targetPostObj = post.originalPost || post;
            const isAuthor = post.author?._id === user?._id;
            const isLiked = post.likes?.some(l => (l._id || l).toString() === user?._id?.toString());
            const isReposted = targetPostObj.reposts?.some((id) => (id._id || id).toString() === user?._id?.toString());
            const likesList = post.likes || [];
            const likesCount = likesList.length;

            const topLevelCommentsCount = post.comments?.length || 0;
            const repliesCount = post.comments?.reduce((acc, c) => acc + (c.replies?.length || 0), 0) || 0;
            const totalCommentsCount = topLevelCommentsCount + repliesCount;

            const repostsCount = targetPostObj.reposts?.length || 0;
            const showComments = expandedComments[post._id];

            return (
              <article key={post._id} className="neo-box p-5 space-y-4">
                {/* Repost Header Badge */}
                {post.originalPost && (
                  <div className="flex items-center gap-1.5 text-xs font-extrabold text-indigo-600 pb-1 border-b-2 border-slate-200">
                    <Repeat className="w-3.5 h-3.5" />
                    <span>Reposted by {post.author?.name}</span>
                  </div>
                )}

                {/* Post Author Header */}
                <div className="flex items-center justify-between">
                  <Link to={`/profile/${post.author?._id}`} className="flex items-center gap-3 hover:opacity-80 transition cursor-pointer">
                    <Avatar
                      src={post.author?.profilePic}
                      seed={post.author?.avatarSeed}
                      name={post.author?.name}
                      size="md"
                    />
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

                {/* Action Bar (Like, Comment, Repost) */}
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

                {/* Comment Section (Expandable) */}
                {showComments && (
                  <div className="pt-3 border-t border-slate-200 space-y-3">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Avatar src={user?.profilePic} seed={user?.avatarSeed} name={user?.name} size="xs" />
                        <input
                          type="text"
                          value={commentInputs[post._id] || ''}
                          onChange={(e) =>
                            setCommentInputs({ ...commentInputs, [post._id]: e.target.value })
                          }
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
                          No comments yet. Be the first to comment!
                        </p>
                      ) : (
                        post.comments.map((comment) => {
                          const isCommentLiked = comment.likes?.some(
                            (l) => (l._id || l).toString() === user?._id?.toString()
                          );
                          const commentLikesCount = comment.likes?.length || 0;
                          const isReplying = replyingToCommentId === comment._id;
                          const hasReplies = comment.replies && comment.replies.length > 0;
                          const isRepliesExpanded = expandedReplies[comment._id];

                          return (
                            <div key={comment._id} className="space-y-2">
                              <div className="p-3 bg-amber-50/50 rounded-xl border border-slate-200 space-y-2">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex items-center gap-2">
                                    <Avatar
                                      src={comment.user?.profilePic}
                                      seed={comment.user?.avatarSeed}
                                      name={comment.user?.name}
                                      size="xs"
                                    />
                                    <div>
                                      <Link
                                        to={`/profile/${comment.user?._id}`}
                                        className="font-extrabold text-xs text-slate-900 hover:opacity-80 transition"
                                      >
                                        {comment.user?.name}
                                      </Link>
                                      <span className="text-[10px] text-slate-400 font-medium block">
                                        {formatTimestamp(comment.createdAt)}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                <p className="text-xs font-medium text-slate-800 pl-7">
                                  {comment.text}
                                </p>

                                <div className="flex items-center gap-3 pl-7 pt-1 text-[11px] font-bold">
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
                                    onClick={() =>
                                      setReplyingToCommentId(isReplying ? null : comment._id)
                                    }
                                    className="flex items-center gap-1 text-slate-500 hover:text-indigo-600 cursor-pointer transition"
                                  >
                                    <Reply className="w-3.5 h-3.5" />
                                    <span>Reply</span>
                                  </button>
                                </div>
                              </div>

                              {isReplying && (
                                <div className="ml-6 pl-2 border-l-2 border-slate-300 space-y-2">
                                  <div className="flex items-center gap-2">
                                    <Avatar src={user?.profilePic} seed={user?.avatarSeed} name={user?.name} size="xs" />
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
                                                onClick={() =>
                                                  handleToggleLikeReply(post._id, comment._id, reply._id)
                                                }
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

      {/* Liked By Modal */}
      <LikedByModal
        isOpen={Boolean(likedByModalPost)}
        onClose={() => setLikedByModalPost(null)}
        likes={likedByModalPost?.likes || []}
      />
    </div>
  );
};
