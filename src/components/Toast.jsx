import React, { createContext, useContext, useState, useCallback } from 'react';
import { Avatar } from './Avatar';
import { X, MessageSquare, Circle, Clock } from 'lucide-react';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(({ title, message, avatarSeed, profilePic, type = 'message', duration = 3500 }) => {
    const id = Date.now() + Math.random().toString();
    const newToast = { id, title, message, avatarSeed, profilePic, type, duration };
    
    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}

      {/* Floating Toast Notification Stack */}
      <div className="fixed top-5 right-5 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto bg-white border-2 border-slate-900 text-slate-900 p-4 rounded-2xl shadow-[4px_4px_0px_0px_#000] flex flex-col gap-2 relative overflow-hidden transition duration-300 animate-slide-in"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                {toast.avatarSeed || toast.profilePic ? (
                  <Avatar src={toast.profilePic} seed={toast.avatarSeed} name={toast.title} size="sm" />
                ) : toast.type === 'online' ? (
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border-2 border-slate-900 text-emerald-500 flex items-center justify-center">
                    <Circle className="w-4 h-4 fill-emerald-500 text-emerald-500" />
                  </div>
                ) : (
                  <div className="w-9 h-9 rounded-xl bg-[#FF5A5F]/10 border-2 border-slate-900 text-[#FF5A5F] flex items-center justify-center">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                )}

                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold text-slate-900 truncate">{toast.title}</span>
                    <span className="text-[10px] text-slate-500 flex items-center gap-1 font-semibold">
                      <Clock className="w-3 h-3" /> just now
                    </span>
                  </div>
                  <span className="text-xs text-slate-600 truncate font-medium">{toast.message}</span>
                </div>
              </div>

              <button
                onClick={() => removeToast(toast.id)}
                className="text-slate-400 hover:text-slate-900 p-1 rounded-lg transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Timer Progress Bar */}
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden border border-slate-900/10">
              <div
                className={`h-full ${
                  toast.type === 'online' ? 'bg-emerald-500' : 'bg-[#FF5A5F]'
                }`}
                style={{
                  animation: `toastProgress ${toast.duration || 3500}ms linear forwards`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
