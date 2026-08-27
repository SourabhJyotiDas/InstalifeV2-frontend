import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Avatar } from './Avatar';
import { apiFetch, safeJson } from '../utils/api';
import {
  MessageSquare,
  User,
  Mail,
  Lock,
  Sparkles,
  ArrowRight,
  Loader2,
  Camera,
  CheckCircle2,
  ImageIcon,
  Trash2
} from 'lucide-react';

export const Signup = () => {
  const { signup, updateProfile } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [step, setStep] = useState(1); // 1: Credentials, 2: Profile Picture
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [avatarSeed, setAvatarSeed] = useState(Math.random().toString(36).substring(7));
  const [profilePic, setProfilePic] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadingPic, setUploadingPic] = useState(false);

  const handleRandomizeAvatar = () => {
    setAvatarSeed(Math.random().toString(36).substring(7));
  };

  const handleStep1Submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signup(name, email, password, avatarSeed);
      // Move to Step 2: Add/Skip Profile Picture
      setStep(2);
    } catch (err) {
      setError(err.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    setError('');
    setUploadingPic(true);

    const previousPic = profilePic;
    const previewUrl = URL.createObjectURL(file);
    setProfilePic(previewUrl);

    try {
      const formData = new FormData();
      formData.append('profilePic', file);

      const res = await apiFetch('/api/users/profile-pic', {
        method: 'POST',
        body: formData,
      });

      const data = await safeJson(res);
      if (!res.ok) {
        throw new Error(data.message || 'Failed to upload profile picture');
      }

      setProfilePic(data.profilePic);
      await updateProfile({ profilePic: data.profilePic });
    } catch (err) {
      setProfilePic(previousPic);
      setError(err.message || 'Failed to upload profile picture');
    } finally {
      URL.revokeObjectURL(previewUrl);
      setUploadingPic(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleRemovePic = async () => {
    setUploadingPic(true);
    setError('');
    try {
      const res = await apiFetch('/api/users/profile-pic', {
        method: 'DELETE'
      });
      const data = await safeJson(res);
      if (!res.ok) {
        throw new Error(data.message || 'Failed to remove picture');
      }
      setProfilePic('');
      await updateProfile({ profilePic: '' });
    } catch (err) {
      setError(err.message || 'Failed to remove picture');
    } finally {
      setUploadingPic(false);
    }
  };

  const handleCompleteSignup = () => {
    navigate('/chats');
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#FAF7F2] px-4 py-12 relative">
      <div className="max-w-md w-full neo-box p-8 space-y-6">
        {/* Header & Step Indicator */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#FF5A5F] text-white border-2 border-slate-900 shadow-[3px_3px_0px_0px_#000] mb-1">
            <MessageSquare className="w-7 h-7" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
            {step === 1 ? 'Create Account' : 'Profile Picture'}
          </h2>
          <p className="text-sm font-medium text-slate-600">
            {step === 1 ? 'Step 1 of 2: Enter your details' : `Welcome, ${name}! Step 2 of 2: Set your photo`}
          </p>

          {/* Step Dots */}
          <div className="flex justify-center items-center gap-2 pt-1">
            <span className={`h-2.5 rounded-full transition-all duration-300 ${step === 1 ? 'w-8 bg-[#FF5A5F]' : 'w-2.5 bg-slate-300'}`} />
            <span className={`h-2.5 rounded-full transition-all duration-300 ${step === 2 ? 'w-8 bg-[#FF5A5F]' : 'w-2.5 bg-slate-300'}`} />
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border-2 border-red-500 text-red-600 text-sm font-bold px-4 py-3 rounded-xl shadow-[2px_2px_0px_0px_#000]">
            {error}
          </div>
        )}

        {/* STEP 1: Account Info Form */}
        {step === 1 && (
          <form onSubmit={handleStep1Submit} className="space-y-4">
            <div>
              <label className="block text-xs font-black text-slate-900 uppercase tracking-wider mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="w-5 h-5 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 neo-input"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-900 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 neo-input"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-900 uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 neo-input"
                  placeholder="Minimum 6 characters"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 neo-btn text-base flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  Next: Add Profile Picture
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        )}

        {/* STEP 2: Profile Picture / Skip Section */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="flex flex-col items-center p-6 bg-amber-50 rounded-2xl border-2 border-slate-900 space-y-4 text-center">
              <div className="relative group">
                <Avatar src={profilePic} seed={avatarSeed} name={name} size="xl" />

                {uploadingPic && (
                  <div className="absolute inset-0 rounded-2xl bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center text-white z-10 space-y-1">
                    <Loader2 className="w-8 h-8 animate-spin text-[#FF5A5F]" />
                    <span className="text-[10px] font-black tracking-wider uppercase">Setting up...</span>
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
                  className="absolute bottom-0 right-0 p-2.5 bg-[#FF5A5F] text-white border-2 border-slate-900 rounded-xl shadow-[2px_2px_0px_0px_#000] hover:scale-105 cursor-pointer disabled:opacity-50 transition z-20"
                  title="Upload Profile Photo"
                >
                  {uploadingPic ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                </button>
              </div>

              {uploadingPic && (
                <div className="flex items-center justify-center gap-2 text-xs font-extrabold text-indigo-600 bg-indigo-50 p-2.5 rounded-xl border border-indigo-300 animate-pulse w-full max-w-xs">
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                  Setting up image with ImageKit...
                </div>
              )}

              <div className="flex items-center gap-2 flex-wrap justify-center">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingPic}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-xl border-2 border-slate-900 shadow-[2px_2px_0px_0px_#000] flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <ImageIcon className="w-4 h-4" />
                  {uploadingPic ? 'Uploading...' : profilePic ? 'Change Image' : 'Upload Image'}
                </button>

                {profilePic && (
                  <button
                    type="button"
                    onClick={handleRemovePic}
                    className="px-3 py-2 bg-slate-200 text-slate-700 hover:text-red-500 text-xs font-bold rounded-xl border-2 border-slate-900 shadow-[1px_1px_0px_0px_#000] flex items-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Remove
                  </button>
                )}
              </div>

              {/* Avatar Seed Control (Fallback) */}
              <div className="w-full pt-3 border-t border-slate-200 space-y-2">
                <span className="text-[11px] font-bold text-slate-500 block">
                  Or customize your fallback SVG avatar seed:
                </span>
                <div className="flex items-center gap-2 w-full max-w-xs mx-auto">
                  <input
                    type="text"
                    value={avatarSeed}
                    onChange={(e) => setAvatarSeed(e.target.value)}
                    placeholder="Avatar seed string"
                    className="flex-1 text-xs px-3 py-2 neo-input font-bold"
                  />
                  <button
                    type="button"
                    onClick={handleRandomizeAvatar}
                    className="p-2 bg-[#FF5A5F] text-white border-2 border-slate-900 rounded-xl shadow-[1px_1px_0px_0px_#000] cursor-pointer"
                    title="Randomize Avatar Seed"
                  >
                    <Sparkles className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons: Add/Continue vs Skip */}
            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={handleCompleteSignup}
                className="w-full py-3.5 px-4 neo-btn text-base flex items-center justify-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-5 h-5" />
                {profilePic ? 'Continue to Chat' : 'Save & Continue to Chat'}
              </button>

              <button
                type="button"
                onClick={handleCompleteSignup}
                className="w-full py-2.5 px-4 text-xs font-extrabold text-slate-500 hover:text-slate-900 transition text-center cursor-pointer"
              >
                Skip for now
              </button>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="text-center text-sm font-semibold text-slate-600 pt-2 border-t-2 border-slate-200">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-[#FF5A5F] hover:opacity-80 font-extrabold"
            >
              Sign in
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
