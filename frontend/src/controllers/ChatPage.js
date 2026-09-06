import React from 'react';
import { getMessages, sendMessage, editMessage, deleteMessage } from '../api/chatApi';
import { getFriends } from '../api/friendsApi';
import { toast } from 'react-toastify';

export const fetchFriends = async ({ userId, setFriends, setLoading }) => {
    try {
        const response = await getFriends(userId);
        setFriends(response.data || []);
    } catch (error) {
        toast.error('Failed to load friends');
    } finally {
        if (setLoading) setLoading(false);
    }
};

export const fetchMessages = async ({ currentUserId, friendId, setMessages }) => {
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

        setMessages(messageList);
    } catch (error) {
        console.error('Error fetching messages:', error);
        toast.error('Failed to load messages');
    }
};

export const handleSelectFriend = ({ friend, setSelectedFriend, fetchMessages, currentUserId, setMessages }) => {
    setSelectedFriend(friend);
    if (friend?._id) {
        fetchMessages({ currentUserId, friendId: friend._id, setMessages });
    }
};

export const handleSendMessage = async ({
  text,
  file,
  messageType = 'text',
  replyTo,
  selectedFriend,
  user,
  socket,
  isConnected,
  setSending,
  setMessages,
}) => {
  try {
    let payload;
    
    if (file) {
      payload = new FormData();
      payload.append('receiver', selectedFriend._id);
      payload.append('content', text ? text.trim() : '');
      payload.append('messageType', messageType);
      payload.append('file', file);
      if (replyTo) {
        payload.append('replyTo', replyTo);
      }
    } else {
      payload = {
        receiver: selectedFriend._id,
        content: text ? text.trim() : '',
        messageType,
        ...(replyTo && { replyTo }),
      };
    }

    // 1. Send to Backend API
    const response = await sendMessage(payload);
    
    // Extract the saved message returned by the server
    const savedMessage = response?.data?.chatMessage || response?.data?.data || response?.data;

    if (savedMessage) {
      // 2. IMMEDIATELY append the new message to the sender's local state
      setMessages((prevMessages) => {
        // Prevent duplicate append if socket also echoes it back
        const exists = prevMessages.some(
          (m) => (m._id || m.id) === (savedMessage._id || savedMessage.id)
        );
        return exists ? prevMessages : [...prevMessages, savedMessage];
      });

      // 3. Emit over WebSockets to notify the receiver
      if (socket?.connected) {
        socket.emit('sendMessage', savedMessage);
      }
    }
  } catch (error) {
    console.error('Error sending message:', error);
  }
};

export const handleEditMessage = async ({
    messageId,
    newContent,
    userId,
    socket,
    isConnected,
    setMessages,
    setEditingMessage
}) => {
    try {
        const response = await editMessage({
            messageId,
            newContent,
            userId
        });

        // Get the updated message object from the response payload
        const updatedMessage = response.data?.updatedMessage || response.data?.data || response.data;

        // Preserve original position and creation timestamps
        setMessages((prev) =>
            prev.map((msg) => {
                if (String(msg._id || msg.id) === String(messageId)) {
                    return {
                        ...msg, // Preserve original creation dates & structure
                        content: newContent,
                        decryptedContent: newContent,
                        text: newContent,
                        isEdited: true,
                        lastEditedAt: updatedMessage?.lastEditedAt || new Date()
                    };
                }
                return msg;
            })
        );

        if (socket?.connected && updatedMessage) {
            socket.emit('editMessage', updatedMessage);
        }

        if (setEditingMessage) setEditingMessage(null);
        toast.success('Message edited');
    } catch (error) {
        console.error("Edit message error details:", error?.response?.data || error.message);
        const errorMsg = error?.response?.data?.message || 'Failed to edit message';
        toast.error(errorMsg);
    }
};

export const handleDeleteMessage = async ({
    messageId,
    userId,
    socket,
    isConnected,
    setMessages,
}) => {
    try {
        // 1. Remove locally on sender's UI
        setMessages((prev) => prev.filter((msg) => String(msg._id || msg.id) !== String(messageId)));

        // 2. Call API to delete in DB
        await deleteMessage({ messageId, userId });

        // 3. Broadcast real-time deletion over WebSockets
        if (socket && isConnected) {
            socket.emit('deleteMessage', { messageId, userId });
        }
    } catch (err) {
        console.error('Failed to delete message:', err);
    }
};

export const handleTyping = ({
    selectedFriend,
    emitTyping,
    socket,
    isConnected,
    typingTimeout,
    setTypingTimeout
}) => {
    if (selectedFriend?._id) {
        if (emitTyping) {
            emitTyping(selectedFriend._id, true);
        } else if (socket?.connected) {
            socket.emit('typing', { receiverId: selectedFriend._id, isTyping: true });
        }

        if (typingTimeout) clearTimeout(typingTimeout);

        const timeout = setTimeout(() => {
            if (emitTyping) {
                emitTyping(selectedFriend._id, false);
            } else if (socket?.connected) {
                socket.emit('typing', { receiverId: selectedFriend._id, isTyping: false });
            }
        }, 2000);

        setTypingTimeout(timeout);
    }
};

// --- Socket Listener Handlers ---
export const createReceiveMessageHandler = ({ selectedFriend, user, setMessages }) => {
    return (incomingMessage) => {
        const senderId = typeof incomingMessage.sender === 'object'
            ? incomingMessage.sender?._id
            : incomingMessage.sender;

        const receiverId = typeof incomingMessage.receiver === 'object'
            ? incomingMessage.receiver?._id
            : incomingMessage.receiver;

        const activeFriendId = selectedFriend?._id;
        const currentUserId = user?._id || user?.id;

        if (
            (String(senderId) === String(activeFriendId) && String(receiverId) === String(currentUserId)) ||
            (String(senderId) === String(currentUserId) && String(receiverId) === String(activeFriendId))
        ) {
            setMessages((prev) => {
                const incomingId = incomingMessage._id || incomingMessage.id;
                if (prev.some((m) => String(m._id || m.id) === String(incomingId))) return prev;
                return [...prev, incomingMessage];
            });
        }
    };
};

export const createTypingHandler = ({ selectedFriend, setIsTyping }) => {
    return (data) => {
        const typingSenderId = typeof data === 'object' ? data.senderId || data.userId : data;
        if (String(typingSenderId) === String(selectedFriend?._id)) {
            setIsTyping(Boolean(data.isTyping ?? true));
        }
    };
};

export const createEditMessageHandler = ({ setMessages }) => {
    return (updatedMessage) => {
        if (!updatedMessage) return;

        const updatedId = updatedMessage._id || updatedMessage.id;

        setMessages((prevMessages) =>
            prevMessages.map((msg) => {
                const currentId = msg._id || msg.id;
                if (String(currentId) === String(updatedId)) {
                    return {
                        ...msg, // Keeps original createdAt and array order intact
                        content: updatedMessage.content || msg.content,
                        decryptedContent: updatedMessage.content || msg.decryptedContent,
                        text: updatedMessage.content || msg.text,
                        isEdited: true,
                        lastEditedAt: updatedMessage.lastEditedAt || new Date()
                    };
                }
                return msg;
            })
        );
    };
};

export const createDeleteMessageHandler = ({ setMessages }) => {
    return (deletedData) => {
        // Extracts deleted message ID regardless of backend format
        const deletedId = typeof deletedData === 'object' ? (deletedData.messageId || deletedData.id || deletedData._id) : deletedData;

        setMessages((prevMessages) =>
            prevMessages.filter((msg) => String(msg._id || msg.id) !== String(deletedId))
        );
    };
};