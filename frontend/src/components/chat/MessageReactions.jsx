import React, { useState } from 'react';
import { FiSmile } from 'react-icons/fi';

const REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

const MessageReactions = ({ messageId, reactions, onReact, onRemoveReaction }) => {
  const [showPicker, setShowPicker] = useState(false);
  const userReaction = reactions?.find(r => r.userId === 'current_user_id');

  const handleReaction = (emoji) => {
    if (userReaction?.emoji === emoji) {
      onRemoveReaction(messageId, emoji);
    } else {
      onReact(messageId, emoji);
    }
    setShowPicker(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowPicker(!showPicker)}
        className="text-gray-400 transition hover:text-gray-600"
      >
        <FiSmile className="w-4 h-4" />
      </button>
      
      {showPicker && (
        <div className="absolute left-0 z-10 flex gap-1 p-2 mb-2 bg-white rounded-lg shadow-lg bottom-full">
          {REACTIONS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => handleReaction(emoji)}
              className={`p-1 hover:bg-gray-100 rounded transition ${
                userReaction?.emoji === emoji ? 'bg-primary-50' : ''
              }`}
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
      
      {reactions && reactions.length > 0 && (
        <div className="flex gap-1 mt-1">
          {Object.entries(
            reactions.reduce((acc, r) => {
              acc[r.emoji] = (acc[r.emoji] || 0) + 1;
              return acc;
            }, {})
          ).map(([emoji, count]) => (
            <span key={emoji} className="text-xs bg-gray-100 px-1.5 py-0.5 rounded-full">
              {emoji} {count}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default MessageReactions;