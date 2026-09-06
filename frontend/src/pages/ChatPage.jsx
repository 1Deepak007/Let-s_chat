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
import { toggleReaction, getMessages, sendMessage, editMessage } from '../api/chatApi';
import { encryptMessage, decryptMessage } from '../utils/encryption';
import { toast } from 'react-toastify';

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

  // 🔐 Fetch messages with decryption - MOVED BEFORE useEffect that uses it
  const fetchMessagesWithDecryption = async ({ currentUserId, friendId, setMessages }) => {
    if (!currentUserId || !friendId) return;
    try {
      const response = await getMessages({
        senderId: currentUserId,
        receiverId: friendId,
      });

      const messageList = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response.data?.messages)
          ? response.data.messages
          : Array.isArray(response.data?.data)
            ? response.data.data
            : [];

      const decryptedMessages = await Promise.all(
        messageList.map(async (msg) => {
          if (msg.encryptedContent && msg.encryptedContent.encrypted) {
            try {
              const senderId = typeof msg.sender === 'object' ? msg.sender?._id : msg.sender;
              const receiverId = typeof msg.receiver === 'object' ? msg.receiver?._id : msg.receiver;

              const decryptedContent = await decryptMessage(
                msg.encryptedContent,
                senderId,
                receiverId
              );

              return {
                ...msg,
                content: decryptedContent || '🔒 [Empty encrypted message]',
                isEncrypted: true
              };
            } catch (error) {
              console.error(`❌ Failed to decrypt message ${msg._id}:`, error);
              return {
                ...msg,
                content: '🔒 [Unable to decrypt]',
                isEncrypted: true,
                decryptionError: true
              };
            }
          }
          return msg;
        })
      );

      // ✅ Set messages array cleanly (newest first)
      setMessages(decryptedMessages.reverse());

    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load messages');
    }
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
        setSelectedFriend(friend);
        fetchMessagesWithDecryption({
          currentUserId,
          friendId: friend._id,
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

    const handleReceiveMsg = async (incomingMessage) => {
      const senderId = typeof incomingMessage.sender === 'object'
        ? incomingMessage.sender?._id
        : incomingMessage.sender;

      const receiverId = typeof incomingMessage.receiver === 'object'
        ? incomingMessage.receiver?._id
        : incomingMessage.receiver;

      const activeFriendId = selectedFriend?._id;
      const activeUserId = user?._id || user?.id;

      if (
        (String(senderId) === String(activeFriendId) && String(receiverId) === String(activeUserId)) ||
        (String(senderId) === String(activeUserId) && String(receiverId) === String(activeFriendId))
      ) {
        let decryptedContent = incomingMessage.content || '';

        if (incomingMessage.encryptedContent && incomingMessage.encryptedContent.encrypted) {
          try {
            decryptedContent = await decryptMessage(
              incomingMessage.encryptedContent,
              senderId,
              receiverId
            );
          } catch (error) {
            console.error('Failed to decrypt incoming message:', error);
            decryptedContent = '🔒 [Encrypted message]';
          }
        }

        setMessages((prev) => {
          const incomingId = incomingMessage._id || incomingMessage.id;
          if (prev.some((m) => String(m._id || m.id) === String(incomingId))) return prev;
          // Add to end (newest at bottom)
          return [
            ...prev,
            {
              ...incomingMessage,
              content: decryptedContent,
              isEncrypted: !!incomingMessage.encryptedContent
            }
          ];
        });
      }
    };

    const handleTypingEvt = createTypingHandler({
      selectedFriend,
      setIsTyping
    });

    const handleEditMsg = async (updatedMessage) => {
      if (!updatedMessage) return;
      const updatedId = updatedMessage._id || updatedMessage.id;

      let decryptedContent = updatedMessage.content || '';
      if (updatedMessage.encryptedContent && updatedMessage.encryptedContent.encrypted) {
        try {
          const senderId = typeof updatedMessage.sender === 'object'
            ? updatedMessage.sender?._id
            : updatedMessage.sender;
          const receiverId = typeof updatedMessage.receiver === 'object'
            ? updatedMessage.receiver?._id
            : updatedMessage.receiver;

          decryptedContent = await decryptMessage(
            updatedMessage.encryptedContent,
            senderId,
            receiverId
          );
        } catch (error) {
          console.error('Failed to decrypt edited message:', error);
          decryptedContent = '🔒 [Encrypted message]';
        }
      }

      setMessages((prevMessages) =>
        prevMessages.map((msg) => {
          const currentId = msg._id || msg.id;
          if (String(currentId) === String(updatedId)) {
            return {
              ...msg,
              ...updatedMessage,
              content: decryptedContent,
              isEdited: true,
              isEncrypted: !!updatedMessage.encryptedContent,
              lastEditedAt: updatedMessage.lastEditedAt || new Date()
            };
          }
          return msg;
        })
      );
    };

    const handleDeleteMsg = (deletedData) => {
      const deletedId = typeof deletedData === 'object'
        ? (deletedData.messageId || deletedData.id || deletedData._id)
        : deletedData;

      setMessages((prevMessages) =>
        prevMessages.filter((msg) => String(msg._id || msg.id) !== String(deletedId))
      );
    };

    socket.on('receiveMessage', handleReceiveMsg);
    socket.on('newMessage', handleReceiveMsg);
    socket.on('typing', handleTypingEvt);
    socket.on('messageEdited', handleEditMsg);
    socket.on('editMessage', handleEditMsg);
    socket.on('messageDeleted', handleDeleteMsg);
    socket.on('deleteMessage', handleDeleteMsg);

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
    setSelectedFriend(friend);
    if (friend?._id) {
      fetchMessagesWithDecryption({
        currentUserId,
        friendId: friend._id,
        setMessages
      });
    }
  };

  

  // ✅ FIXED: Send message with proper encryption and socket emit
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

      // 🔐 Encrypt the message before sending (for text messages)
      let encryptedData = null;
      let contentToSend = text || '';

      if (messageType === 'text' && text && text.trim()) {
        try {
          console.log('🔐 Frontend encrypting message');
          encryptedData = await encryptMessage(text, currentUserId, selectedFriend._id);
          contentToSend = ''; // Don't send plain text
          console.log('✅ Frontend encryption complete');
        } catch (error) {
          console.error('Encryption failed:', error);
          // Fallback to plain text if encryption fails
          contentToSend = text;
          encryptedData = null;
        }
      }

      // ✅ Prepare payload with encrypted content
      let payloadToSend;

      if (file) {
        payloadToSend = new FormData();
        payloadToSend.append('receiver', selectedFriend._id);
        payloadToSend.append('content', contentToSend);
        payloadToSend.append('messageType', messageType);
        payloadToSend.append('file', file);
        if (payload.replyTo) payloadToSend.append('replyTo', payload.replyTo);
        if (encryptedData) {
          payloadToSend.append('encryptedContent', JSON.stringify(encryptedData));
        }
      } else {
        payloadToSend = {
          receiver: selectedFriend._id,
          content: contentToSend,
          messageType,
          ...(payload.replyTo && { replyTo: payload.replyTo }),
        };

        if (encryptedData) {
          payloadToSend.encryptedContent = encryptedData;
        }
      }

      console.log('📤 Sending payload:', {
        hasEncryptedContent: !!encryptedData,
        messageType,
        contentLength: contentToSend.length,
      });

      // Send the message
      const response = await sendMessage(payloadToSend);
      const savedMessage = response?.data?.chatMessage || response?.data?.data || response?.data;

      if (savedMessage) {
        // ✅ FIXED: Add to local state with decrypted content (add to end for chronological order)
        setMessages((prev) => {
          const exists = prev.some(
            (m) => (m._id || m.id) === (savedMessage._id || savedMessage.id)
          );
          if (exists) return prev;
          // ✅ Add to end (newest at bottom)
          return [
            ...prev,
            {
              ...savedMessage,
              content: text || '',
              isEncrypted: !!encryptedData
            }
          ];
        });

        // ✅ FIXED: Emit via socket with proper encrypted data
        if (socket?.connected) {
          socket.emit('sendMessage', {
            ...savedMessage,
            content: '', // Don't send plain text
            encryptedContent: encryptedData // Include encrypted data
          });
        }
      }
    } catch (err) {
      console.error('Failed to send message:', err);
      toast.error('Failed to send message');
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

  const onEditMessage = async (messageId, newContent) => {
  try {
    let encryptedData = null;
    let contentToSend = newContent;

    try {
      encryptedData = await encryptMessage(newContent, currentUserId, selectedFriend._id);
      contentToSend = ''; // Don't send plain text
    } catch (error) {
      console.error('Encryption failed for edit:', error);
      contentToSend = newContent;
    }

    // ✅ Pass encryptedContent to the API
    const response = await editMessage({
      messageId,
      newContent: contentToSend,
      userId: currentUserId,
      encryptedContent: encryptedData // This is now correctly passed
    });

    const updatedMessage = response.data?.updatedMessage || response.data?.data || response.data;

    setMessages((prev) =>
      prev.map((msg) => {
        const currentId = msg._id || msg.id;
        if (String(currentId) === String(messageId)) {
          return {
            ...msg,
            ...updatedMessage,
            content: newContent, // Show plain text locally
            isEdited: true,
            isEncrypted: !!encryptedData,
            lastEditedAt: updatedMessage.lastEditedAt || new Date()
          };
        }
        return msg;
      })
    );

    if (socket?.connected) {
      socket.emit('editMessage', {
        ...updatedMessage,
        content: '', // Don't send plain text
        encryptedContent: encryptedData
      });
    }

    setEditingMessage(null);
    toast.success('Message edited');
  } catch (error) {
    console.error('Edit message error:', error);
    toast.error(error?.response?.data?.message || 'Failed to edit message');
  }
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