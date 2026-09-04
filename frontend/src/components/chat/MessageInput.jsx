import React, { useState, useRef, useEffect } from 'react';
import { FiSend, FiPaperclip, FiSmile, FiX, FiCornerUpLeft } from 'react-icons/fi';
import EmojiPicker from 'emoji-picker-react';
import { GifPicker } from '../../utils/giphy';

const MessageInput = ({ onSend, onTyping, disabled, replyingTo, onCancelReply }) => {
  const [message, setMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showGifPicker, setShowGifPicker] = useState(false);

  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 100) + 'px';
    }
  }, [message]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      if (file.type.startsWith('image/')) {
        setFilePreview(URL.createObjectURL(file));
      } else {
        setFilePreview(null);
      }
    }
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleEmojiClick = (emojiData) => {
    setMessage((prev) => prev + emojiData.emoji);
  };

  const handleSendGif = (gifUrl) => {
    onSend({ gifUrl, messageType: 'image', replyTo: replyingTo ? (replyingTo._id || replyingTo.id) : null });
    setShowGifPicker(false);
    onCancelReply?.();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if ((message.trim() || selectedFile) && !disabled) {
      onSend({
        text: message.trim(),
        file: selectedFile,
        replyTo: replyingTo ? (replyingTo._id || replyingTo.id) : null
      });
      setMessage('');
      removeSelectedFile();
      setShowEmojiPicker(false);
      setShowGifPicker(false);
      onCancelReply?.();
    }
  };

  return (
    <div className="relative bg-white border-t border-gray-200 dark:border-gray-700 dark:bg-gray-900">
      {/* Replying To Preview Bar */}
      {replyingTo && (
        <div className="flex items-center justify-between p-2.5 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 pl-2 overflow-hidden border-l-4 border-primary-500">
            <FiCornerUpLeft className="flex-shrink-0 w-4 h-4 text-primary-500" />
            <div className="text-xs truncate">
              <p className="font-semibold text-gray-700 dark:text-gray-200">
                Replying to {replyingTo.sender?.firstname || replyingTo.senderName || 'Message'}
              </p>
              <p className="text-gray-500 truncate dark:text-gray-400">{replyingTo.content || 'Attachment'}</p>
            </div>
          </div>
          <button type="button" onClick={onCancelReply} className="p-1 text-gray-400 hover:text-red-500">
            <FiX className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* File Preview Bar */}
      {selectedFile && (
        <div className="flex items-center gap-3 p-2 bg-gray-100 border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
          {filePreview ? (
            <img src={filePreview} alt="Preview" className="object-cover w-12 h-12 rounded" />
          ) : (
            <div className="p-2 text-xs font-semibold rounded bg-primary-100 text-primary-600">
              {selectedFile.name.split('.').pop().toUpperCase()}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium truncate dark:text-gray-200">{selectedFile.name}</p>
            <p className="text-[10px] text-gray-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
          </div>
          <button type="button" onClick={removeSelectedFile} className="p-1 text-gray-400 hover:text-red-500">
            <FiX className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Popover Emoji Picker */}
      {showEmojiPicker && (
        <div className="absolute z-50 mb-2 bottom-full left-4">
          <EmojiPicker onEmojiClick={handleEmojiClick} />
        </div>
      )}

      {/* Popover GIF Picker */}
      {showGifPicker && (
        <GifPicker onSelectGif={handleSendGif} onClose={() => setShowGifPicker(false)} />
      )}

      {/* Input Controls */}
      <form onSubmit={handleSubmit} className="flex items-end gap-2 p-3">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.zip"
          onChange={handleFileChange}
          className="hidden"
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          className="p-2 text-gray-500 transition hover:text-primary-500"
          title="Attach File"
        >
          <FiPaperclip className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => {
            setShowGifPicker((prev) => !prev);
            setShowEmojiPicker(false);
          }}
          disabled={disabled}
          className="px-0.5 py-0.5 mb-1.5 text-xs md:text-xs font-bold text-gray-500 transition border border-gray-300 rounded hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300"
        >
          GIF
        </button>

        <button
          type="button"
          onClick={() => {
            setShowEmojiPicker((prev) => !prev);
            setShowGifPicker(false);
          }}
          disabled={disabled}
          className="p-2 text-gray-500 transition hover:text-yellow-500"
          title="Emojis"
        >
          <FiSmile className="w-4 h-4" />
        </button>

        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            onTyping?.();
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
          placeholder="Type a message..."
          className="flex-1 input-field resize-none min-h-[40px] max-h-[100px] py-2 px-3 text-sm rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          rows="1"
          disabled={disabled}
        />

        <button
          type="submit"
          disabled={(!message.trim() && !selectedFile) || disabled}
          className="btn-primary flex items-center justify-center h-[40px] px-4 rounded-lg bg-primary-600 text-white disabled:opacity-50"
        >
          <FiSend className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

export default MessageInput;