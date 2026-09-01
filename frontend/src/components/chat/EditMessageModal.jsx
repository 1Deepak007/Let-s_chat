import React, { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';

const EditMessageModal = ({ message, onSave, onClose }) => {
  const [content, setContent] = useState('');

  useEffect(() => {
    if (message) {
      setContent(message.content);
    }
  }, [message]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (content.trim()) {
      onSave(message._id, content.trim());
    }
  };

  if (!message) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-xl dark:bg-gray-900 dark:border dark:border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Edit Message</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <FiX className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="h-24 resize-none input-field"
            placeholder="Edit your message..."
            autoFocus
          />
          <div className="flex gap-2 mt-4">
            <button type="button" onClick={onClose} className="flex-1 btn-secondary">
              Cancel
            </button>
            <button type="submit" className="flex-1 btn-primary">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditMessageModal;