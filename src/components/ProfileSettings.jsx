import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Avatar } from './Avatar';
import { apiFetch } from '../utils/api';
import {
  User,
  Lock,
  BadgeCheck,
  CreditCard,
  LogOut,
  ChevronRight,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  X,
  Loader2
} from 'lucide-react';

export const ProfileSettings = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Modals state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showSubModal, setShowSubModal] = useState(false);

  // Change Password state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordSuccess('');
    setPasswordError('');

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    setPasswordLoading(true);

    try {
      const res = await apiFetch('/api/users/profile', {
        method: 'PUT',
        body: JSON.stringify({ password: newPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to change password');
      }

      setPasswordSuccess('Password updated successfully!');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setShowPasswordModal(false), 1500);
    } catch (err) {
      setPasswordError(err.message || 'Failed to update password');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="flex-1 p-4 md:p-8 overflow-y-auto bg-[#FAF7F2] text-slate-900 flex justify-center">
      <div className="max-w-xl w-full space-y-6">
        {/* Header & User Banner */}
        <div className="neo-box p-6 space-y-4">
          <div className="flex items-center gap-4">
            <Avatar src={user?.profilePic} seed={user?.avatarSeed} name={user?.name} size="lg" />
            <div className="min-w-0 flex-1">
              <h2 className="text-xl font-black text-slate-900 truncate">{user?.name}</h2>
              <p className="text-xs font-semibold text-slate-500 truncate">{user?.email}</p>
            </div>
            <Link
              to="/settings/edit-profile"
              className="px-3.5 py-1.5 neo-btn-secondary text-xs font-extrabold cursor-pointer"
            >
              Edit
            </Link>
          </div>
        </div>

        {/* Account Settings List Section */}
        <div className="neo-box p-4 space-y-2">
          <h3 className="px-3 text-xs font-black uppercase tracking-wider text-slate-500">
            Account & Security
          </h3>

          <div className="space-y-1 pt-1">
            {/* Edit Profile */}
            <Link
              to="/settings/edit-profile"
              className="flex items-center justify-between p-3.5 rounded-2xl hover:bg-slate-100 transition cursor-pointer"
            >
              <div className="flex items-center gap-3.5">
                <div className="p-2.5 bg-blue-100 text-blue-600 rounded-xl border border-slate-900 shadow-[1px_1px_0px_0px_#000]">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900">Edit Profile</h4>
                  <p className="text-xs font-semibold text-slate-500">Name, email, and profile photo</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </Link>

            {/* Change Password */}
            <button
              onClick={() => setShowPasswordModal(true)}
              className="w-full flex items-center justify-between p-3.5 rounded-2xl hover:bg-slate-100 transition cursor-pointer text-left"
            >
              <div className="flex items-center gap-3.5">
                <div className="p-2.5 bg-amber-100 text-amber-600 rounded-xl border border-slate-900 shadow-[1px_1px_0px_0px_#000]">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900">Change Password</h4>
                  <p className="text-xs font-semibold text-slate-500">Update account password</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            {/* Verify Account */}
            <button
              onClick={() => setShowVerifyModal(true)}
              className="w-full flex items-center justify-between p-3.5 rounded-2xl hover:bg-slate-100 transition cursor-pointer text-left"
            >
              <div className="flex items-center gap-3.5">
                <div className="p-2.5 bg-emerald-100 text-emerald-600 rounded-xl border border-slate-900 shadow-[1px_1px_0px_0px_#000]">
                  <BadgeCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900">Verification Status</h4>
                  <p className="text-xs font-semibold text-slate-500">Verify creator badge</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            {/* Subscriptions */}
            <button
              onClick={() => setShowSubModal(true)}
              className="w-full flex items-center justify-between p-3.5 rounded-2xl hover:bg-slate-100 transition cursor-pointer text-left"
            >
              <div className="flex items-center gap-3.5">
                <div className="p-2.5 bg-purple-100 text-purple-600 rounded-xl border border-slate-900 shadow-[1px_1px_0px_0px_#000]">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900">Subscriptions</h4>
                  <p className="text-xs font-semibold text-slate-500">Manage plan & features</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Logout Section */}
        <div className="neo-box p-4">
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 p-3 text-red-500 hover:bg-red-50 rounded-2xl font-black text-sm transition cursor-pointer"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout Account</span>
          </button>
        </div>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-md w-full neo-box p-6 space-y-4 relative">
            <div className="flex items-center justify-between border-b-2 border-slate-900 pb-3">
              <h3 className="text-base font-black text-slate-900">Change Password</h3>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="p-1 hover:bg-slate-200 rounded-xl transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {passwordSuccess && (
              <div className="bg-emerald-500 text-white font-extrabold text-xs p-3 rounded-xl border-2 border-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> {passwordSuccess}
              </div>
            )}

            {passwordError && (
              <div className="bg-red-500 text-white font-extrabold text-xs p-3 rounded-xl border-2 border-slate-900">
                {passwordError}
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-900 uppercase mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password (min 6 chars)"
                  className="w-full neo-input px-3.5 py-2.5 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-900 uppercase mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full neo-input px-3.5 py-2.5 text-xs font-semibold"
                />
              </div>

              <button
                type="submit"
                disabled={passwordLoading}
                className="w-full py-3 neo-btn text-xs font-black flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {passwordLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Update Password'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Verify Modal */}
      {showVerifyModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-md w-full neo-box p-6 space-y-4 text-center">
            <ShieldCheck className="w-12 h-12 text-emerald-500 mx-auto" />
            <h3 className="text-lg font-black text-slate-900">Account Verification</h3>
            <p className="text-xs font-semibold text-slate-500">
              Your account is registered and active. Verification badges are awarded to active creators with 50+ posts!
            </p>
            <button
              onClick={() => setShowVerifyModal(false)}
              className="w-full py-2.5 neo-btn-secondary text-xs font-black cursor-pointer"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {/* Subscriptions Modal */}
      {showSubModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-md w-full neo-box p-6 space-y-4 text-center">
            <Sparkles className="w-12 h-12 text-[#FF5A5F] mx-auto" />
            <h3 className="text-lg font-black text-slate-900">Current Plan: Free Tier</h3>
            <p className="text-xs font-semibold text-slate-500">
              You are currently on the unlimited Free tier! Enjoy unlimited messaging, feed posts, and profile customization.
            </p>
            <button
              onClick={() => setShowSubModal(false)}
              className="w-full py-2.5 neo-btn text-xs font-black cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
