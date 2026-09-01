import React, { useState } from 'react';
import { format } from 'date-fns';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';

const MessageItem = ({ message, isOwn, onEdit, onDelete }) => {
  const [showActions, setShowActions] = useState(false);

  const formattedTime = (() => {
    try {
      const date = message.timestamp || message.createdAt;
      return date ? format(new Date(date), 'HH:mm') : '';
    } catch {
      return '';
    }
  })();

  return (
    <div
      className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-3`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className={`max-w-[70%] ${isOwn ? 'order-2' : 'order-1'}`}
      >
        <div
          className={`rounded-lg p-3 ${
            isOwn
              ? 'bg-primary-500 text-white'
              : 'bg-white text-gray-800 dark:bg-gray-800 dark:text-gray-100 shadow-sm border border-gray-100 dark:border-gray-700'
          }`}
        >
          <p className="break-words">{message.content}</p>
          <div className={`flex items-center justify-end gap-1 mt-1 text-xs ${isOwn ? 'text-primary-100' : 'text-gray-400 dark:text-gray-400'}`}
          >
            <span>{formattedTime}</span>
            {message.isEdited && <span>(edited)</span>}
          </div>
        </div>
        {isOwn && showActions && (
          <div className="flex justify-end gap-2 mt-1">
            <button
              onClick={() => onEdit(message)}
              className="p-1 text-gray-400 transition hover:text-primary-500 dark:hover:text-primary-400"
              title="Edit message"
            >
              <FiEdit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onDelete(message._id)}
              className="p-1 text-gray-400 transition hover:text-red-500 dark:hover:text-red-400"
              title="Delete message"
            >
              <FiTrash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageItem;