import React from 'react';

const TypingIndicator = ({ isTyping, username }) => {
  if (!isTyping) return null;

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 mb-2 text-xs italic text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-full w-max">
      <div className="flex gap-1">
        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
      </div>
      <span>{username || 'Someone'} is typing...</span>
    </div>
  );
};

export default TypingIndicator;