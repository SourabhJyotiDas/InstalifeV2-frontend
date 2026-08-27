import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Avatar } from './Avatar';
import { apiFetch } from '../utils/api';
import { X, Image as ImageIcon, Send, Loader2, Camera } from 'lucide-react';

export const CreatePostModal = ({ isOpen, onClose, onPostCreated }) => {
  const { user } = useAuth();
  const fileInputRef = useRef(null);

  const [caption, setCaption] = useState('');
  const [selectedImage, setSelectedImage] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleImageSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (JPEG, PNG, WebP, etc.)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      return;
    }

    setUploadingImage(true);
    setError('');

    const objectUrl = URL.createObjectURL(file);
    setImagePreview(objectUrl);

    try {
      const base64Data = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('Failed to read image file'));
        reader.readAsDataURL(file);
      });
      setSelectedImage(base64Data);
    } catch (err) {
      setError('Failed to process image');
      setImagePreview('');
      setSelectedImage('');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview('');
    setSelectedImage('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!caption.trim() && !selectedImage) {
      setError('Please enter a caption or add an image');
      return;
    }

    setPosting(true);
    setError('');

    try {
      const res = await apiFetch('/api/posts', {
        method: 'POST',
        body: JSON.stringify({
          caption: caption.trim(),
          image: selectedImage
        })
      });

      const newPost = await res.json();
      if (!res.ok) {
        throw new Error(newPost.message || 'Failed to create post');
      }

      setCaption('');
      handleRemoveImage();
      if (onPostCreated) onPostCreated(newPost);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create post');
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="max-w-lg w-full neo-box p-6 space-y-4 relative animate-scale-up">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-slate-900 pb-3">
          <h3 className="text-lg font-black text-slate-900">Create New Post</h3>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-200 rounded-xl transition cursor-pointer text-slate-500 hover:text-slate-900"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border-2 border-red-500 text-red-600 text-xs font-bold p-3 rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center gap-3">
            <Avatar src={user?.profilePic} seed={user?.avatarSeed} name={user?.name} size="md" />
            <div>
              <h4 className="font-extrabold text-sm text-slate-900">{user?.name}</h4>
              <span className="text-xs font-semibold text-slate-500">Public Post</span>
            </div>
          </div>

          <textarea
            rows={4}
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder={`What's on your mind, ${user?.name || ''}?`}
            className="w-full neo-input p-3 text-sm resize-none"
          />

          {/* Image Preview & Loader */}
          {imagePreview && (
            <div className="relative inline-block border-2 border-slate-900 rounded-2xl overflow-hidden shadow-[2px_2px_0px_0px_#000]">
              <img src={imagePreview} alt="Preview" className="max-h-56 w-auto object-cover" />
              {uploadingImage && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center text-white">
                  <Loader2 className="w-7 h-7 animate-spin text-[#FF5A5F]" />
                </div>
              )}
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 p-1.5 bg-slate-900/80 text-white rounded-xl hover:bg-red-500 cursor-pointer transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {uploadingImage && (
            <div className="flex items-center justify-center gap-2 text-xs font-extrabold text-indigo-600 bg-indigo-50 p-2.5 rounded-xl border border-indigo-300 animate-pulse">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
              Uploading image to ImageKit...
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t-2 border-slate-200">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageSelect}
              accept="image/*"
              className="hidden"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingImage || posting}
              className="px-4 py-2 bg-amber-100 text-slate-800 hover:bg-amber-200 text-xs font-bold rounded-xl border-2 border-slate-900 shadow-[1.5px_1.5px_0px_0px_#000] flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <ImageIcon className="w-4 h-4 text-emerald-500" />
              Add Photo
            </button>

            <button
              type="submit"
              disabled={posting || uploadingImage || (!caption.trim() && !selectedImage)}
              className="px-6 py-2.5 neo-btn text-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
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
    </div>
  );
};
