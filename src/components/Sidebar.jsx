import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Avatar } from './Avatar';
import {
  Newspaper,
  SquarePlus,
  Compass,
  MessageSquare,
  UserPlus,
  User,
  Settings,
  LogOut,
  Sparkles
} from 'lucide-react';

export const Sidebar = ({ onOpenCreatePost, mobileHideSidebar }) => {
  const { user, logout } = useAuth();

  return (
    <aside
      className={`w-full md:w-64 lg:w-72 bg-white border-r-2 border-slate-900 flex flex-col justify-between h-full p-4 select-none text-slate-900 ${
        mobileHideSidebar ? 'hidden md:flex' : 'flex'
      }`}
    >
      {/* Top Section: App Brand & Main Nav Links */}
      <div className="space-y-6">
        {/* Brand App Logo Header */}
        <div className="flex items-center justify-between px-2 pt-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FF5A5F] text-white border-2 border-slate-900 flex items-center justify-center shadow-[2.5px_2.5px_0px_0px_#000]">
              <Sparkles className="w-5 h-5 fill-white" />
            </div>
            <span className="font-black text-xl text-slate-900 tracking-tight">
              Instalife
            </span>
          </div>
        </div>

        {/* User Compact Card */}
        <NavLink
          to="/profile"
          className="flex items-center gap-3 p-3 bg-amber-50/70 rounded-2xl border-2 border-slate-900 hover:scale-[1.01] transition shadow-[2px_2px_0px_0px_#000]"
        >
          <Avatar src={user?.profilePic} seed={user?.avatarSeed} name={user?.name} size="md" />
          <div className="flex flex-col min-w-0 flex-1">
            <span className="font-extrabold text-sm text-slate-900 truncate">{user?.name}</span>
            <span className="text-xs font-semibold text-slate-500 truncate">{user?.email}</span>
          </div>
        </NavLink>

        {/* Main Navigation Links List */}
        <nav className="space-y-2">
          <NavLink
            to="/feed"
            className={({ isActive }) =>
              `flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-black transition border-2 ${
                isActive
                  ? 'bg-[#FF5A5F] text-white border-slate-900 shadow-[3px_3px_0px_0px_#000]'
                  : 'border-transparent text-slate-700 hover:bg-slate-100'
              }`
            }
          >
            <Newspaper className="w-5 h-5 text-amber-500" />
            <span>Feed</span>
          </NavLink>

          <button
            type="button"
            onClick={onOpenCreatePost}
            className="w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-black text-slate-700 hover:bg-slate-100 border-2 border-transparent transition cursor-pointer"
          >
            <SquarePlus className="w-5 h-5 text-emerald-500" />
            <span>Create</span>
          </button>

          <NavLink
            to="/discover"
            className={({ isActive }) =>
              `flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-black transition border-2 ${
                isActive
                  ? 'bg-[#FF5A5F] text-white border-slate-900 shadow-[3px_3px_0px_0px_#000]'
                  : 'border-transparent text-slate-700 hover:bg-slate-100'
              }`
            }
          >
            <Compass className="w-5 h-5 text-indigo-500" />
            <span>Explore</span>
          </NavLink>

          <NavLink
            to="/chats"
            className={({ isActive }) =>
              `flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-black transition border-2 ${
                isActive
                  ? 'bg-[#FF5A5F] text-white border-slate-900 shadow-[3px_3px_0px_0px_#000]'
                  : 'border-transparent text-slate-700 hover:bg-slate-100'
              }`
            }
          >
            <MessageSquare className="w-5 h-5 text-rose-500" />
            <span>Messages</span>
          </NavLink>

          <NavLink
            to="/discover"
            className={({ isActive }) =>
              `flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-black transition border-2 ${
                isActive
                  ? 'bg-[#FF5A5F] text-white border-slate-900 shadow-[3px_3px_0px_0px_#000]'
                  : 'border-transparent text-slate-700 hover:bg-slate-100'
              }`
            }
          >
            <UserPlus className="w-5 h-5 text-cyan-500" />
            <span>Discover</span>
          </NavLink>

          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-black transition border-2 ${
                isActive
                  ? 'bg-[#FF5A5F] text-white border-slate-900 shadow-[3px_3px_0px_0px_#000]'
                  : 'border-transparent text-slate-700 hover:bg-slate-100'
              }`
            }
          >
            <User className="w-5 h-5 text-purple-500" />
            <span>Profile</span>
          </NavLink>
        </nav>
      </div>

      {/* Bottom Section: Settings & Logout Links */}
      <div className="pt-4 border-t-2 border-slate-200 space-y-2">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-black transition border-2 ${
              isActive
                ? 'bg-[#FF5A5F] text-white border-slate-900 shadow-[3px_3px_0px_0px_#000]'
                : 'border-transparent text-slate-700 hover:bg-slate-100'
            }`
          }
        >
          <Settings className="w-5 h-5 text-slate-500" />
          <span>Settings</span>
        </NavLink>

        <button
          onClick={logout}
          className="w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-black text-red-500 hover:bg-red-50 transition cursor-pointer"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};
