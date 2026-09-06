import React, { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import EmojiPicker from 'emoji-picker-react';
import { FiEdit2, FiTrash2, FiFileText, FiDownload, FiCornerUpLeft, FiSmile } from 'react-icons/fi';
import { RiArrowDropDownLine } from 'react-icons/ri';

const MessageItem = ({ message, isOwn, onEdit, onDelete, onReply, onReact, currentUserId, onScrollToMessage }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const menuRef = useRef(null);
  const messageRef = useRef(null); // ✅ Add ref for the message element

  const messageId = message._id || message.id;
  const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const getFullUrl = (url) => (url?.startsWith('http') ? url : `${backendUrl}${url}`);

  const isGifOrImageUrl = (text) => {
    return (
      typeof text === 'string' &&
      (text.startsWith('http://') || text.startsWith('https://')) &&
      (text.includes('giphy.com') || text.match(/\.(jpeg|jpg|gif|png|webp)$/i))
    );
  };

  const formattedTime = (() => {
    try {
      const date = message.timestamp || message.createdAt;
      return date ? format(new Date(date), 'HH:mm') : '';
    } catch {
      return '';
    }
  })();

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ✅ Handle scroll to this message when called
  const handleScrollToSelf = () => {
    if (onScrollToMessage) {
      onScrollToMessage(messageId);
    }
  };

  const renderMediaContent = () => {
    const fileUrl = getFullUrl(message.fileUrl);

    switch (message.messageType) {
      case 'image':
        return (
          <img
            src={fileUrl}
            alt="Attachment"
            className="object-cover max-w-xs mb-1 rounded-lg cursor-pointer max-h-60 hover:opacity-95"
            onClick={() => window.open(fileUrl, '_blank')}
          />
        );
      case 'video':
        return (
          <video controls className="max-w-xs mb-1 rounded-lg max-h-60">
            <source src={fileUrl} />
          </video>
        );
      case 'audio':
        return (
          <audio controls className="max-w-xs mb-1">
            <source src={fileUrl} />
          </audio>
        );
      case 'file':
        return (
          <a
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            download
            className="flex items-center gap-3 p-3 text-sm bg-gray-100 rounded-lg dark:bg-gray-700"
          >
            <FiFileText className="w-6 h-6 text-primary-500" />
            <span className="flex-1 truncate">{message.content || 'Attachment'}</span>
            <FiDownload className="w-4 h-4" />
          </a>
        );
      default:
        return null;
    }
  };

  const renderQuotedMessage = (quotedMessage) => {
    if (!quotedMessage || typeof quotedMessage !== 'object') return null;
    const quotedSender = quotedMessage.sender?.firstname
      ? `
      ${quotedMessage.sender.firstname} 
      ${quotedMessage.sender.lastname || ''}`.trim()
      : 'Message';

    // ✅ Make quoted message clickable to scroll to it
    const handleQuotedClick = (e) => {
      e.stopPropagation();
      const quotedId = quotedMessage._id || quotedMessage.id || quotedMessage;
      if (onScrollToMessage) {
        onScrollToMessage(quotedId);
      }
    };

    return (
      <div
        onClick={handleQuotedClick}
        className={`mb-1 pt-2 px-3 rounded text-xs cursor-pointer border-l-4 transition ${isOwn
          ? 'bg-black/15 border-white/80 text-white/90 hover:bg-black/25'
          : 'bg-gray-100 dark:bg-gray-700/60 border-primary-500 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600/60'
        }`}
        title="Click to scroll to quoted message"
      >
        <p className="font-semibold text-[11px] opacity-80">↪ {quotedSender}</p>
        {quotedMessage.content && (
          <p className="break-words whitespace-pre-wrap line-clamp-2">{quotedMessage.content}</p>
        )}
        {quotedMessage.fileUrl && (
          quotedMessage.messageType === 'image' ? (
            <img
              src={getFullUrl(quotedMessage.fileUrl)}
              alt="Quoted attachment"
              className="object-cover w-12 h-12 mt-1 rounded"
            />
          ) : (
            <p className="mt-1 opacity-80 text-[10px]">
              📎 {quotedMessage.content || quotedMessage.messageType}
            </p>
          )
        )}
      </div>
    );
  };

  // Group reactions by emoji key
  const groupedReactions = (message.reactions || []).reduce((acc, r) => {
    acc[r.emoji] = acc[r.emoji] || [];
    acc[r.emoji].push(String(r.userId || r.user));
    return acc;
  }, {});

  return (
    <div
      id={`message-${messageId}`}
      data-message-id={messageId}
      ref={messageRef} 
      className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}
      mb-4 group transition-colors duration-500 p-0 rounded-lg scroll-mt-20`} 
    >
      <div className="relative max-w-[85%] sm:max-w-[70%]" ref={menuRef}>
        <div
          className={`relative px-3.5 py-2 rounded-2xl shadow-sm ${isOwn
            ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-br-md'
            : 'bg-white text-gray-800 border border-gray-200 rounded-bl-md dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700'
            }`}
        >
          {/* Action Dropdown Trigger */}
          <button
            onClick={() => setShowMenu((prev) => !prev)}
            className={`absolute top-1 ${isOwn ? 'left-1 text-white/80 hover:text-white' : 'right-1 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
              } p-0.5 rounded-full transition`}
            title="Message options"
          >
            <RiArrowDropDownLine className="w-6 h-6" />
          </button>

          {/* Quoted Reply Reference - Now clickable */}
          {message.replyTo && (
            <div className="mb-1">
              {renderQuotedMessage(message.replyTo)}
            </div>
          )}

          {/* Render uploaded file attachments */}
          {message.fileUrl && renderMediaContent()}

          {/* Render text or GIF image content */}
          {message.content && (
            isGifOrImageUrl(message.content) ? (
              <img
                src={message.content}
                alt="GIF"
                className="object-cover max-w-xs mb-1 rounded-lg cursor-pointer max-h-60 hover:opacity-95"
                onClick={() => window.open(message.content, '_blank')}
              />
            ) : (
              <p className="text-sm leading-relaxed break-words whitespace-pre-wrap sm:text-[15px] pt-1 pr-5">
                {message.content}
              </p>
            )
          )}

          {/* Time + Status */}
          <div
            className={`flex items-center justify-end gap-1.5 mt-1 text-[10px] select-none ${isOwn ? 'text-white/70' : 'text-gray-400 dark:text-gray-500'
              }`}
          >
            <span>{formattedTime}</span>
            {message.isEdited && <span className="italic">• edited</span>}
          </div>

          {/* Dropdown Action Menu */}
          {showMenu && (
            <div
              className={`absolute z-30 w-44 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl py-1 text-sm top-8 ${isOwn ? 'right-0' : 'left-0'
                }`}
            >
              <button
                onClick={() => {
                  setShowEmojiPicker(true);
                  setShowMenu(false);
                }}
                className="flex items-center w-full gap-2 px-3 py-2 text-left text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <FiSmile className="w-4 h-4 text-yellow-500" />
                <span>React with emoji</span>
              </button>

              <button
                onClick={() => {
                  onReply(message);
                  setShowMenu(false);
                }}
                className="flex items-center w-full gap-2 px-3 py-2 text-left text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <FiCornerUpLeft className="w-4 h-4 text-blue-500" />
                <span>Reply to message</span>
              </button>

              {isOwn && !message.fileUrl && !isGifOrImageUrl(message.content) && (
                <button
                  onClick={() => {
                    onEdit(message);
                    setShowMenu(false);
                  }}
                  className="flex items-center w-full gap-2 px-3 py-2 text-left text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <FiEdit2 className="w-4 h-4 text-emerald-500" />
                  <span>Edit</span>
                </button>
              )}

              {isOwn && (
                <button
                  onClick={() => {
                    onDelete(messageId);
                    setShowMenu(false);
                  }}
                  className="flex items-center w-full gap-2 px-3 py-2 text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <FiTrash2 className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              )}
            </div>
          )}

          {/* Emoji Picker Popover */}
          {showEmojiPicker && (
            <div
              className={`absolute z-40 overflow-hidden bg-white border border-gray-200 rounded-xl shadow-xl dark:bg-gray-800 dark:border-gray-700 ${isOwn ? 'right-0 -top-72' : 'left-0 -top-72'}`}
            >
              <EmojiPicker
                onEmojiClick={(emojiData) => {
                  onReact(messageId, emojiData.emoji);
                  setShowEmojiPicker(false);
                }}
                width={280}
                height={320}
                searchDisabled={false}
                skinTonesDisabled={true}
                previewConfig={{ showPreview: false }}
              />
            </div>
          )}
        </div>

        {/* Display Reactions */}
        {Object.keys(groupedReactions).length > 0 && (
          <div className={`flex flex-wrap gap-1 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
            {Object.entries(groupedReactions).map(([emoji, users]) => {
              const hasReacted = users.includes(String(currentUserId));
              return (
                <button
                  key={emoji}
                  onClick={() => onReact(messageId, emoji)}
                  className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border shadow-xs transition ${hasReacted
                    ? 'bg-primary-50 border-primary-300 text-primary-600 dark:bg-primary-900/40 dark:border-primary-700 dark:text-primary-300'
                    : 'bg-white border-gray-200 text-gray-600 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300'
                    }`}
                >
                  <span className="leading-none text-md">{emoji}</span>
                  <span className="font-semibold text-[10px]">{users.length}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageItem;