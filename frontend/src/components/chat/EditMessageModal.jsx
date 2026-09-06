import React, { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';

const EditMessageModal = ({ message, onSave, onClose }) => {
  const [content, setContent] = useState('');

  useEffect(() => {
  if (message) {
    // Check for decrypted text properties first before falling back to message.content
    const initialText = message.decryptedContent || message.text || message.content || '';
    setContent(initialText);
  }
}, [message]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log(content);

    // Safely extract the ID string directly from the 'message' prop
    const targetMessageId = message?._id || message?.id;

    if (!targetMessageId) {
      console.error("Missing message ID");
      return;
    }

    if (!content.trim()) {
      return;
    }

    try {
      // Pass messageId and content as separate arguments to match onEditMessage(messageId, newContent)
      await onSave(targetMessageId, content.trim());
    } catch (error) {
      console.error("Failed to submit edit:", error);
    }
  };

  if (!message) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-xl dark:bg-gray-900 dark:border dark:border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Edit Message</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full h-24 p-2 border rounded-md resize-none dark:bg-gray-800 dark:text-white dark:border-gray-700 input-field focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Edit your message..."
            autoFocus
          />
          <div className="flex gap-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 transition border border-gray-300 rounded-md btn-secondary dark:border-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!content.trim()}
              className="flex-1 px-4 py-2 text-white transition bg-blue-600 rounded-md btn-primary hover:bg-blue-700 disabled:opacity-50"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditMessageModal;