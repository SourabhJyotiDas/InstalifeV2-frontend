import React from 'react';

const EMOJIS = [
  '❤️', '🔥', '👏', '😍', '😂', '🎉', '🙌', '✨', '💯', '👍', '🚀', '😊'
];

export const EmojiBar = ({ onSelectEmoji }) => {
  return (
    <div className="flex items-center justify-center gap-2 py-1 px-3 bg-amber-50/70 rounded-xl border border-slate-200 overflow-x-auto">
      {EMOJIS.map((emoji, index) => (
        <button
          key={`${emoji}-${index}`}
          type="button"
          onClick={() => onSelectEmoji(emoji)}
          className="p-1 hover:bg-white text-sm rounded-lg transition hover:scale-125 cursor-pointer select-none"
        >
          {emoji}
        </button>
      ))}
    </div>
  );
};
