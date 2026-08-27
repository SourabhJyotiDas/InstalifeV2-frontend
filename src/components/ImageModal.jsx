import React, { useEffect } from 'react';
import { X, Download } from 'lucide-react';

export const ImageModal = ({ isOpen, onClose, imageUrl }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !imageUrl) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 md:p-8 cursor-pointer select-none"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-5xl max-h-[90vh] flex flex-col items-center justify-center cursor-default"
      >
        {/* Top Control Bar */}
        <div className="absolute -top-12 right-0 flex items-center gap-2 z-10">
          <a
            href={imageUrl}
            target="_blank"
            rel="noopener noreferrer"
            download
            className="p-2 bg-slate-900/90 hover:bg-slate-800 text-white rounded-xl border border-slate-700 transition cursor-pointer flex items-center gap-1.5 text-xs font-bold shadow-lg"
            title="Download / Open Original"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Full Size</span>
          </a>

          <button
            onClick={onClose}
            className="p-2 bg-slate-900/90 hover:bg-red-600 text-white rounded-xl border border-slate-700 transition cursor-pointer shadow-lg"
            title="Close Lightbox (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Full Image */}
        <img
          src={imageUrl}
          alt="Full screen media view"
          className="max-h-[85vh] max-w-full w-auto h-auto object-contain rounded-2xl border-2 border-slate-700 shadow-2xl"
        />
      </div>
    </div>
  );
};
