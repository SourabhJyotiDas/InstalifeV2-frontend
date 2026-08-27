import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Avatar } from './Avatar';
import { MessageSquare, LogOut, Newspaper, SquarePlus, User, Compass } from 'lucide-react';

export const MobileHeader = ({ pendingRequestsCount = 0 }) => {
  const { user, logout } = useAuth();

  return (
    <header className="md:hidden bg-white border-b-2 border-slate-900 px-4 py-3 flex items-center justify-between shadow-xs select-none">
      <div className="flex items-center gap-2">
        <div className="w-9 h-9 rounded-xl bg-[#FF5A5F] text-white border-2 border-slate-900 flex items-center justify-center shadow-[1px_1px_0px_0px_#000]">
          <MessageSquare className="w-5 h-5" />
        </div>
        <span className="font-black text-base text-slate-900 tracking-tight">Instalife</span>
      </div>

      <div className="flex items-center gap-2">
        <NavLink to="/profile">
          <Avatar src={user?.profilePic} seed={user?.avatarSeed} name={user?.name} size="sm" />
        </NavLink>

        <button
          onClick={logout}
          title="Logout"
          className="p-2 text-slate-500 hover:text-red-500 rounded-xl transition cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};

export const MobileBottomNav = ({ pendingRequestsCount = 0, onTabClick, onOpenCreatePost }) => {
  return (
    <nav className="md:hidden bg-white border-t-2 border-slate-900 px-2 py-2 flex items-center justify-around shadow-2xl z-40 select-none">
      <NavLink
        to="/feed"
        onClick={onTabClick}
        className={({ isActive }) =>
          `flex flex-col items-center gap-1 px-3 py-1 rounded-xl text-[11px] font-black transition ${
            isActive
              ? 'bg-[#FF5A5F] text-white border-2 border-slate-900 shadow-[1.5px_1.5px_0px_0px_#000]'
              : 'text-slate-600'
          }`
        }
      >
        <Newspaper className="w-5 h-5" />
        <span>Feed</span>
      </NavLink>

      <button
        type="button"
        onClick={() => {
          if (onTabClick) onTabClick();
          if (onOpenCreatePost) onOpenCreatePost();
        }}
        className="flex flex-col items-center gap-1 px-3 py-1 rounded-xl text-[11px] font-black text-slate-600 cursor-pointer"
      >
        <SquarePlus className="w-5 h-5 text-emerald-500" />
        <span>Create</span>
      </button>

      <NavLink
        to="/discover"
        onClick={onTabClick}
        className={({ isActive }) =>
          `flex flex-col items-center gap-1 px-3 py-1 rounded-xl text-[11px] font-black transition relative ${
            isActive
              ? 'bg-[#FF5A5F] text-white border-2 border-slate-900 shadow-[1.5px_1.5px_0px_0px_#000]'
              : 'text-slate-600'
          }`
        }
      >
        <Compass className="w-5 h-5" />
        <span>Explore</span>
        {pendingRequestsCount > 0 && (
          <span className="absolute -top-1 right-1 bg-rose-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-black border border-slate-900">
            {pendingRequestsCount}
          </span>
        )}
      </NavLink>

      <NavLink
        to="/chats"
        onClick={onTabClick}
        className={({ isActive }) =>
          `flex flex-col items-center gap-1 px-3 py-1 rounded-xl text-[11px] font-black transition ${
            isActive
              ? 'bg-[#FF5A5F] text-white border-2 border-slate-900 shadow-[1.5px_1.5px_0px_0px_#000]'
              : 'text-slate-600'
          }`
        }
      >
        <MessageSquare className="w-5 h-5" />
        <span>Chats</span>
      </NavLink>

      <NavLink
        to="/profile"
        onClick={onTabClick}
        className={({ isActive }) =>
          `flex flex-col items-center gap-1 px-3 py-1 rounded-xl text-[11px] font-black transition ${
            isActive
              ? 'bg-[#FF5A5F] text-white border-2 border-slate-900 shadow-[1.5px_1.5px_0px_0px_#000]'
              : 'text-slate-600'
          }`
        }
      >
        <User className="w-5 h-5" />
        <span>Profile</span>
      </NavLink>
    </nav>
  );
};
