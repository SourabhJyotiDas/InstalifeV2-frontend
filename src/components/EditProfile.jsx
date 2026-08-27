import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Avatar } from './Avatar';
import { apiFetch } from '../utils/api';
import {
  User,
  Mail,
  Sparkles,
  CheckCircle2,
  Loader2,
  Camera,
  Trash2,
  ImageIcon,
  ArrowLeft,
  Globe,
  Share2
} from 'lucide-react';

const LinkedinIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.25V10.9H6.46M7.86 6.74a1.6 1.6 0 1 0 1.6 1.6 1.6 1.6 0 0 0-1.6-1.6Z" />
  </svg>
);

const InstagramIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);

const YoutubeIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

const FacebookIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H7.5v-3H10V9.5C10 7.01 11.49 5.65 13.75 5.65c1.08 0 2.21.19 2.21.19v2.43h-1.25c-1.23 0-1.61.77-1.61 1.56V12h2.74l-.44 3h-2.3v6.8c4.56-.93 8-4.96 8-9.8z"/>
  </svg>
);

export const EditProfile = () => {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [avatarSeed, setAvatarSeed] = useState(user?.avatarSeed || 'default');
  const [profilePic, setProfilePic] = useState(user?.profilePic || '');
  const [bio, setBio] = useState(user?.bio || '');

  const [linkedin, setLinkedin] = useState(user?.socialLinks?.linkedin || '');
  const [instagram, setInstagram] = useState(user?.socialLinks?.instagram || '');
  const [youtube, setYoutube] = useState(user?.socialLinks?.youtube || '');
  const [portfolio, setPortfolio] = useState(user?.socialLinks?.portfolio || '');
  const [facebook, setFacebook] = useState(user?.socialLinks?.facebook || '');

  const [loading, setLoading] = useState(false);
  const [uploadingPic, setUploadingPic] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleRandomizeAvatar = () => {
    setAvatarSeed(Math.random().toString(36).substring(7));
  };

  const handleFileChange = async (e) => {
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

    setUploadingPic(true);
    setMessage('');
    setError('');

    const previewUrl = URL.createObjectURL(file);
    const previousPic = profilePic;
    setProfilePic(previewUrl);

    try {
      const base64Data = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('Failed to read image file'));
        reader.readAsDataURL(file);
      });

      const res = await apiFetch('/api/users/upload-profile-pic', {
        method: 'POST',
        body: JSON.stringify({ file: base64Data }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to upload image to ImageKit');
      }

      setProfilePic(data.profilePic);
      await updateProfile({ profilePic: data.profilePic });
      setMessage('Profile picture uploaded successfully!');
    } catch (err) {
      setProfilePic(previousPic);
      setError(err.message || 'Failed to upload profile picture');
    } finally {
      URL.revokeObjectURL(previewUrl);
      setUploadingPic(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleRemoveProfilePic = async () => {
    setUploadingPic(true);
    setMessage('');
    setError('');
    try {
      const res = await apiFetch('/api/users/profile-pic', { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to remove profile picture');
      }
      setProfilePic('');
      await updateProfile({ profilePic: '' });
      setMessage('Photo removed');
    } catch (err) {
      setError(err.message || 'Failed to remove profile picture');
    } finally {
      setUploadingPic(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);

    try {
      await updateProfile({
        name,
        email,
        avatarSeed,
        profilePic,
        bio,
        socialLinks: {
          linkedin,
          instagram,
          youtube,
          portfolio,
          facebook
        }
      });
      setMessage('Profile updated successfully!');
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 p-4 md:p-8 overflow-y-auto bg-[#FAF7F2] text-slate-900 flex justify-center">
      <div className="max-w-2xl w-full space-y-6">
        {/* Header Bar */}
        <div className="flex items-center gap-3">
          <Link
            to="/settings"
            className="p-2.5 bg-white hover:bg-amber-100 rounded-2xl border-2 border-slate-900 shadow-[2px_2px_0px_0px_#000] transition cursor-pointer"
            title="Back to Settings"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Edit Profile</h2>
            <p className="text-xs font-semibold text-slate-500">Manage your profile photo, bio, and social links</p>
          </div>
        </div>

        {/* Success Alert */}
        {message && (
          <div className="bg-emerald-500 text-white font-extrabold text-xs p-3.5 rounded-2xl border-2 border-slate-900 shadow-[2px_2px_0px_0px_#000] flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            {message}
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="bg-red-500 text-white font-extrabold text-xs p-3.5 rounded-2xl border-2 border-slate-900 shadow-[2px_2px_0px_0px_#000]">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Card 1: Avatar & Profile Picture */}
          <div className="neo-box p-6 space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b-2 border-slate-200 pb-2">
              Profile Photo & Avatar
            </h3>

            <div className="flex flex-col sm:flex-row items-center gap-5">
              <div className="relative group">
                <Avatar src={profilePic} seed={avatarSeed} name={name} size="xl" />

                {uploadingPic && (
                  <div className="absolute inset-0 rounded-2xl bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center text-white z-10 space-y-1">
                    <Loader2 className="w-7 h-7 animate-spin text-[#FF5A5F]" />
                    <span className="text-[9px] font-black tracking-wider uppercase">Uploading...</span>
                  </div>
                )}

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingPic}
                  className="absolute bottom-0 right-0 p-2 bg-[#FF5A5F] text-white border-2 border-slate-900 rounded-xl shadow-[1.5px_1.5px_0px_0px_#000] hover:scale-105 cursor-pointer disabled:opacity-50 transition z-20"
                  title="Upload Profile Picture"
                >
                  {uploadingPic ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                </button>
              </div>

              <div className="flex-1 space-y-3 text-center sm:text-left">
                <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingPic}
                    className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl border-2 border-slate-900 shadow-[1.5px_1.5px_0px_0px_#000] flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <ImageIcon className="w-4 h-4" />
                    {uploadingPic ? 'Uploading...' : profilePic ? 'Change Photo' : 'Upload Photo'}
                  </button>

                  {profilePic && (
                    <button
                      type="button"
                      onClick={handleRemoveProfilePic}
                      disabled={uploadingPic}
                      className="px-3.5 py-2 bg-slate-200 text-slate-700 hover:text-red-500 text-xs font-bold rounded-xl border-2 border-slate-900 shadow-[1.5px_1.5px_0px_0px_#000] flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" />
                      Remove Photo
                    </button>
                  )}
                </div>

                {/* Avatar Seed */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-extrabold text-slate-500 block">
                    SVG Avatar Seed (Fallback)
                  </span>
                  <div className="flex items-center gap-2 max-w-xs mx-auto sm:mx-0">
                    <input
                      type="text"
                      value={avatarSeed}
                      onChange={(e) => setAvatarSeed(e.target.value)}
                      placeholder="Avatar seed string"
                      className="flex-1 text-xs px-3 py-1.5 neo-input font-bold"
                    />
                    <button
                      type="button"
                      onClick={handleRandomizeAvatar}
                      className="p-1.5 bg-[#FF5A5F] text-white border-2 border-slate-900 rounded-xl shadow-[1px_1px_0px_0px_#000] cursor-pointer"
                      title="Randomize Seed"
                    >
                      <Sparkles className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Basic Info (Name & Email) */}
          <div className="neo-box p-6 space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b-2 border-slate-200 pb-2">
              Personal Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black text-slate-900 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 neo-input text-xs font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-900 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 neo-input text-xs font-semibold"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Bio / About Me */}
          <div className="neo-box p-6 space-y-3">
            <div className="flex items-center justify-between border-b-2 border-slate-200 pb-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                Bio / About Me
              </h3>
              <span className="text-[11px] font-bold text-slate-400">
                {bio.length}/300
              </span>
            </div>

            <textarea
              rows={3}
              maxLength={300}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell others about yourself, your interests or work..."
              className="w-full p-3 neo-input text-xs font-semibold resize-none"
            />
          </div>

          {/* Card 4: Social Links & Portfolio */}
          <div className="neo-box p-6 space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b-2 border-slate-200 pb-2 flex items-center gap-1.5">
              <Share2 className="w-4 h-4 text-[#FF5A5F]" /> Social Links & Portfolio
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* LinkedIn */}
              <div>
                <label className="block text-[11px] font-extrabold text-slate-600 mb-1">
                  LinkedIn URL
                </label>
                <div className="relative">
                  <LinkedinIcon className="w-4 h-4 text-blue-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="url"
                    value={linkedin}
                    onChange={(e) => setLinkedin(e.target.value)}
                    placeholder="https://linkedin.com/in/username"
                    className="w-full pl-10 pr-3 py-2 neo-input text-xs font-semibold"
                  />
                </div>
              </div>

              {/* Instagram */}
              <div>
                <label className="block text-[11px] font-extrabold text-slate-600 mb-1">
                  Instagram URL
                </label>
                <div className="relative">
                  <InstagramIcon className="w-4 h-4 text-pink-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="url"
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    placeholder="https://instagram.com/username"
                    className="w-full pl-10 pr-3 py-2 neo-input text-xs font-semibold"
                  />
                </div>
              </div>

              {/* YouTube */}
              <div>
                <label className="block text-[11px] font-extrabold text-slate-600 mb-1">
                  YouTube Channel URL
                </label>
                <div className="relative">
                  <YoutubeIcon className="w-4 h-4 text-red-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="url"
                    value={youtube}
                    onChange={(e) => setYoutube(e.target.value)}
                    placeholder="https://youtube.com/@channel"
                    className="w-full pl-10 pr-3 py-2 neo-input text-xs font-semibold"
                  />
                </div>
              </div>

              {/* Facebook */}
              <div>
                <label className="block text-[11px] font-extrabold text-slate-600 mb-1">
                  Facebook URL
                </label>
                <div className="relative">
                  <FacebookIcon className="w-4 h-4 text-blue-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="url"
                    value={facebook}
                    onChange={(e) => setFacebook(e.target.value)}
                    placeholder="https://facebook.com/username"
                    className="w-full pl-10 pr-3 py-2 neo-input text-xs font-semibold"
                  />
                </div>
              </div>

              {/* Portfolio (Span 2 on sm) */}
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-extrabold text-slate-600 mb-1">
                  Personal Portfolio / Website URL
                </label>
                <div className="relative">
                  <Globe className="w-4 h-4 text-emerald-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="url"
                    value={portfolio}
                    onChange={(e) => setPortfolio(e.target.value)}
                    placeholder="https://yourportfolio.com"
                    className="w-full pl-10 pr-3 py-2 neo-input text-xs font-semibold"
                  />
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || uploadingPic}
            className="w-full py-3.5 px-4 neo-btn text-base flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Saving Changes...
              </>
            ) : (
              'Save Profile Changes'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
