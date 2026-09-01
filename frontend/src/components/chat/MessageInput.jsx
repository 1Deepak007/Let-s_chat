import React, { useState, useRef, useEffect } from 'react';
import { FiSend } from 'react-icons/fi';

const MessageInput = ({ onSend, onTyping, disabled }) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 100) + 'px';
    }
  }, [message]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-2 p-4 bg-white border-t border-gray-200 dark:bg-gray-900 dark:border-gray-700">
      <textarea
        ref={textareaRef}
        value={message}
        onChange={(e) => {
          setMessage(e.target.value);
          onTyping?.();
        }}
        onKeyDown={handleKeyDown}
        placeholder="Type a message..."
        className="flex-1 input-field resize-none min-h-[44px] max-h-[100px]"
        rows="1"
        disabled={disabled}
      />
      <button
        type="submit"
        disabled={!message.trim() || disabled}
        className="btn-primary flex items-center gap-2 h-[44px] px-6"
      >
        <FiSend className="w-4 h-4" />
        <span className="hidden sm:inline">Send</span>
      </button>
    </form>
  );
};

export default MessageInput;