import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSocket } from '../contexts/SocketContext';
import { useAuth } from '../contexts/AuthContext';
import ChatHeader from '../components/chat/ChatHeader';
import MainLayout from '../components/MainLayout';
import MessageItem from '../components/chat/MessageItem';
import MessageInput from '../components/chat/MessageInput';
import EditMessageModal from '../components/chat/EditMessageModal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import TypingIndicator from '../components/chat/TypingIndicator';
import {
  fetchFriends,
  fetchMessages,
  handleSelectFriend,
  handleSendMessage,
  handleEditMessage,
  handleDeleteMessage,
  handleTyping,
  createReceiveMessageHandler,
  createTypingHandler,
  createEditMessageHandler,
  createDeleteMessageHandler
} from '../controllers/ChatPage';
import { toggleReaction } from '../api/chatApi';

const ChatPage = () => {
  const { user } = useAuth();
  const { socket, isConnected, joinRoom, emitTyping, onlineUsers } = useSocket();
  const [searchParams] = useSearchParams();
  const [friends, setFriends] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [editingMessage, setEditingMessage] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);

  const messagesEndRef = useRef(null);
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);

  const currentUserId = user?._id || user?.id;

  // Helper to format avatar image path dynamically
  const getAvatarUrl = (friend) => {
    if (!friend?.profilePicture) {
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(
        friend?.firstname || 'User'
      )}&background=3b82f6&color=fff`;
    }
    if (friend.profilePicture.startsWith('http://') || friend.profilePicture.startsWith('https://')) {
      return friend.profilePicture;
    }
    const formattedPath = friend.profilePicture.replace(/\\/g, '/');
    return `http://localhost:5000/${formattedPath}`;
  };

  // Fetch friends list
  useEffect(() => {
    if (currentUserId) {
      fetchFriends({ userId: currentUserId, setFriends, setLoading });
    }
  }, [currentUserId]);

  // Handle friend selection from URL parameters
  useEffect(() => {
    const friendId = searchParams.get('userId');
    if (friendId && friends.length > 0) {
      const friend = friends.find((f) => String(f._id) === String(friendId));
      if (friend) {
        handleSelectFriend({
          friend,
          setSelectedFriend,
          fetchMessages,
          currentUserId,
          setMessages
        });
      }
    }
  }, [searchParams, friends, currentUserId]);

  // Join socket room
  useEffect(() => {
    if (currentUserId && joinRoom) {
      joinRoom(currentUserId);
    }
  }, [currentUserId, joinRoom]);

  // Attach real-time socket listeners
  useEffect(() => {
    if (!socket) return;

    const handleReceiveMsg = createReceiveMessageHandler({
      selectedFriend,
      user,
      setMessages
    });

    const handleTypingEvt = createTypingHandler({
      selectedFriend,
      setIsTyping
    });

    const handleEditMsg = createEditMessageHandler({ setMessages });
    const handleDeleteMsg = createDeleteMessageHandler({ setMessages });

    socket.on('receiveMessage', handleReceiveMsg);
    socket.on('newMessage', handleReceiveMsg);
    socket.on('typing', handleTypingEvt);
    socket.on('messageEdited', handleEditMsg);
    socket.on('editMessage', handleEditMsg);
    socket.on('messageDeleted', handleDeleteMsg);
    socket.on('deleteMessage', handleDeleteMsg);

    // Sync Reactions over WebSockets
    socket.on('messageReaction', ({ messageId, reactions }) => {
      setMessages((prev) =>
        prev.map((m) => (String(m._id || m.id) === String(messageId) ? { ...m, reactions } : m))
      );
    });

    return () => {
      socket.off('receiveMessage', handleReceiveMsg);
      socket.off('newMessage', handleReceiveMsg);
      socket.off('typing', handleTypingEvt);
      socket.off('messageEdited', handleEditMsg);
      socket.off('editMessage', handleEditMsg);
      socket.off('messageDeleted', handleDeleteMsg);
      socket.off('deleteMessage', handleDeleteMsg);
      socket.off('messageReaction');
    };
  }, [socket, selectedFriend, user]);

  // Auto-scroll on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Handler wrappers
  const onSelectFriend = (friend) => {
    handleSelectFriend({
      friend,
      setSelectedFriend,
      fetchMessages,
      currentUserId,
      setMessages
    });
  };

  const onSendMessage = async (payload) => {
    if (!selectedFriend) return;

    try {
      setSending(true);

      let text = payload.text || '';
      let file = payload.file || null;
      let messageType = 'text';

      if (payload.gifUrl) {
        text = payload.gifUrl;
        messageType = 'image';
      } else if (file) {
        if (file.type.startsWith('image/')) messageType = 'image';
        else if (file.type.startsWith('video/')) messageType = 'video';
        else if (file.type.startsWith('audio/')) messageType = 'audio';
        else messageType = 'file';
      } else if (!text.trim()) {
        return;
      }

      await handleSendMessage({
        text,
        file,
        messageType,
        replyTo: payload.replyTo,
        selectedFriend,
        user,
        socket,
        isConnected,
        setSending,
        setMessages
      });
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setSending(false);
      setReplyingTo(null);
    }
  };

  const onToggleReaction = async (messageId, emoji) => {
    const previousMessages = messages;
    const message = messages.find((item) => String(item._id || item.id) === String(messageId));
    if (!message) return;

    const existingReaction = (message.reactions || []).find(
      (reaction) => String(reaction.userId || reaction.user) === String(currentUserId)
    );
    const optimisticReactions = (message.reactions || []).filter(
      (reaction) => String(reaction.userId || reaction.user) !== String(currentUserId)
    );

    if (!existingReaction || existingReaction.emoji !== emoji) {
      optimisticReactions.push({ userId: currentUserId, emoji });
    }

    setMessages((prev) =>
      prev.map((item) =>
        String(item._id || item.id) === String(messageId)
          ? { ...item, reactions: optimisticReactions }
          : item
      )
    );

    try {
      const response = await toggleReaction({ messageId, emoji });
      const savedReactions = response.data?.reactions || [];
      setMessages((prev) =>
        prev.map((item) =>
          String(item._id || item.id) === String(messageId)
            ? { ...item, reactions: savedReactions }
            : item
        )
      );
    } catch (error) {
      setMessages(previousMessages);
      console.error('Failed to save reaction:', error);
    }
  };

  const handleScrollToMessage = (targetId) => {
    const el = document.getElementById(`message-${targetId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('bg-yellow-200', 'dark:bg-yellow-900/40');
      setTimeout(() => {
        el.classList.remove('bg-yellow-200', 'dark:bg-yellow-900/40');
      }, 1500);
    }
  };

  const onEditMessage = (messageId, newContent) => {
    handleEditMessage({
      messageId,
      newContent,
      userId: currentUserId,
      socket,
      isConnected,
      setMessages,
      setEditingMessage
    });
  };

  const onDeleteMessage = (messageId) => {
    handleDeleteMessage({
      messageId,
      userId: currentUserId,
      socket,
      isConnected,
      setMessages
    });
  };

  const onTyping = () => {
    handleTyping({
      selectedFriend,
      emitTyping,
      socket,
      isConnected,
      typingTimeout,
      setTypingTimeout
    });
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto h-[calc(100vh-5.5rem)] sm:h-[calc(100vh-8rem)]">
        <div className="flex h-full overflow-hidden bg-white border border-gray-200 rounded-lg shadow-md dark:bg-gray-900 dark:border-gray-800">
          {/* Sidebar */}
          <div
            className={`${selectedFriend ? 'hidden md:flex' : 'flex'
              } flex-col w-full md:w-64 border-r border-gray-200 bg-gray-50 dark:bg-gray-900 dark:border-gray-800`}
          >
            <div className="p-4 bg-white border-b border-gray-200 dark:bg-gray-900 dark:border-gray-800">
              <h3 className="font-semibold text-gray-800 dark:text-gray-100">Chats</h3>
            </div>
            <div className="flex-1 p-2 space-y-1 overflow-y-auto">
              {friends.length === 0 ? (
                <p className="py-4 text-sm text-center text-gray-500 dark:text-gray-400">
                  No friends yet
                </p>
              ) : (
                friends.map((friend) => {
                  const isActive = selectedFriend?._id === friend._id;
                  return (
                    <button
                      key={friend._id}
                      onClick={() => onSelectFriend(friend)}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg transition text-left ${isActive
                          ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 font-semibold shadow-sm'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/60'
                        }`}
                    >
                      <div className="relative flex-shrink-0">
                        <img
                          src={getAvatarUrl(friend)}
                          alt={friend.firstname}
                          className="object-cover w-10 h-10 rounded-full"
                          onError={(e) => {
                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                              friend.firstname
                            )}&background=3b82f6&color=fff`;
                          }}
                        />
                        {onlineUsers?.includes(friend._id) && (
                          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full dark:border-gray-900" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm truncate ${isActive
                              ? 'font-semibold text-primary-600 dark:text-primary-400'
                              : 'font-medium text-gray-900 dark:text-gray-100'
                            }`}
                        >
                          {friend.firstname} {friend.lastname || ''}
                        </p>
                        <p className="text-xs text-gray-500 truncate dark:text-gray-400">
                          @{friend.username}
                        </p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>









          {/* Chat Area */}
          <div
            className={`${selectedFriend ? 'flex' : 'hidden md:flex'
              } flex-col flex-1 min-w-0 bg-white dark:bg-gray-900`}
          >
            {selectedFriend ? (
              <>
                <ChatHeader
                  friend={selectedFriend}
                  onBack={() => setSelectedFriend(null)}
                  isOnline={onlineUsers?.some(
                    (id) => String(id) === String(selectedFriend._id)
                  )}
                  messages={messages}
                  onSelectMessage={(msg) => handleScrollToMessage(msg._id || msg.id)}
                />

                <div className="flex-1 p-4 overflow-y-auto bg-gray-50 dark:bg-gray-950">
                  {messages.map((message, index) => {
                    const senderId =
                      typeof message.sender === 'object'
                        ? message.sender?._id
                        : message.sender;

                    const isOwnMessage = String(senderId) === String(currentUserId);
                    const messageKey = message._id || message.id || `temp-key-${index}`;

                    return (
                      <MessageItem
                        key={messageKey}
                        message={message}
                        isOwn={isOwnMessage}
                        currentUserId={currentUserId}
                        onEdit={(msgToEdit) => setEditingMessage(msgToEdit)}
                        onDelete={() => onDeleteMessage(message._id || message.id)}
                        onReply={(msg) => setReplyingTo(msg)}
                        onReact={onToggleReaction}
                        onScrollToMessage={handleScrollToMessage}
                      />
                    );
                  })}

                  <TypingIndicator isTyping={isTyping} username={selectedFriend.firstname} />
                  <div ref={messagesEndRef} />
                </div>

                <MessageInput
                  onSend={onSendMessage}
                  onTyping={onTyping}
                  disabled={sending || !isConnected}
                  replyingTo={replyingTo}
                  onCancelReply={() => setReplyingTo(null)}
                />
              </>
            ) : (
              <div className="flex items-center justify-center flex-1 p-8 text-gray-500 bg-gray-50 dark:bg-gray-950 dark:text-gray-400">
                <div className="text-center">
                  <p className="mb-4 text-6xl">💬</p>
                  <p className="text-lg font-medium text-gray-800 dark:text-gray-200">
                    Select a friend to start chatting
                  </p>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    or add new friends from the Friends page
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Message Modal */}
      {editingMessage && (
        <EditMessageModal
          message={editingMessage}
          onClose={() => setEditingMessage(null)}
          onSave={onEditMessage}
        />
      )}
    </MainLayout>
  );
};

export default ChatPage;
