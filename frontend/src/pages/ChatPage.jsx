import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getMessages, sendMessage, editMessage, deleteMessage } from '../api/chatApi';
import { getFriends } from '../api/friendsApi';
import { toast } from 'react-toastify';
import { useSocket } from '../contexts/SocketContext';
import { useAuth } from '../contexts/AuthContext';
import ChatHeader from '../components/chat/ChatHeader';
import MainLayout from '../components/MainLayout';
import MessageItem from '../components/chat/MessageItem';
import MessageInput from '../components/chat/MessageInput';
import EditMessageModal from '../components/chat/EditMessageModal';
import LoadingSpinner from '../components/common/LoadingSpinner';

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
    const messagesEndRef = useRef(null);

    const [isTyping, setIsTyping] = useState(false);
    const [typingTimeout, setTypingTimeout] = useState(null);

    useEffect(() => {
        fetchFriends();
    }, []);

    useEffect(() => {
        const friendId = searchParams.get('userId');
        if (friendId && friends.length > 0) {
            const friend = friends.find(f => f._id === friendId);
            if (friend) {
                setSelectedFriend(friend);
                fetchMessages(friendId);
            }
        }
    }, [searchParams, friends]);

    useEffect(() => {
        if (user?._id) {
            joinRoom(user._id);
        }
    }, [user, joinRoom]);

    useEffect(() => {
        if (!socket) return;

        const handleNewMessage = (newMessage) => {
            if (
                (newMessage.sender === selectedFriend?._id && newMessage.receiver === user._id) ||
                (newMessage.sender === user._id && newMessage.receiver === selectedFriend?._id)
            ) {
                setMessages(prev => [...prev, newMessage]);
            }
        };

        const handleMessageEdited = (updatedMessage) => {
            setMessages(prev =>
                prev.map(msg =>
                    msg._id === updatedMessage._id ? updatedMessage : msg
                )
            );
        };

        const handleMessageDeleted = (messageId) => {
            setMessages(prev => prev.filter(msg => msg._id !== messageId));
        };

        socket.on('newMessage', handleNewMessage);
        socket.on('messageEdited', handleMessageEdited);
        socket.on('messageDeleted', handleMessageDeleted);

        return () => {
            socket.off('newMessage', handleNewMessage);
            socket.off('messageEdited', handleMessageEdited);
            socket.off('messageDeleted', handleMessageDeleted);
        };
    }, [socket, selectedFriend, user]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const fetchFriends = async () => {
        try {
            const response = await getFriends(user._id);
            setFriends(response.data.friends || []);
        } catch (error) {
            toast.error('Failed to load friends');
        } finally {
            setLoading(false);
        }
    };

    const fetchMessages = async (friendId) => {
        setLoading(true);
        try {
            const response = await getMessages({
                senderId: user._id,
                receiverId: friendId
            });
            setMessages(response.data.messages || []);
        } catch (error) {
            toast.error('Failed to load messages');
        } finally {
            setLoading(false);
        }
    };

    const handleSendMessage = async (content) => {
        setSending(true);
        try {
            const response = await sendMessage({
                sender: user._id,
                receiver: selectedFriend._id,
                content,
                messageType: 'text'
            });
            const newMessage = response.data.chatMessage;
            setMessages(prev => [...prev, newMessage]);

            // Emit via socket for real-time
            if (socket && isConnected) {
                socket.emit('sendMessage', newMessage);
            }
        } catch (error) {
            toast.error('Failed to send message');
        } finally {
            setSending(false);
        }
        // Stop typing indicator
        if (emitTyping && selectedFriend?._id) {
            emitTyping(selectedFriend._id, false);
        } else if (socket && isConnected && selectedFriend?._id) {
            socket.emit('typing', { receiverId: selectedFriend._id, isTyping: false });
        }
    };

    const handleEditMessage = async (messageId, newContent) => {
        try {
            const response = await editMessage({
                messageId,
                newContent,
                userId: user._id
            });

            const updatedMessage = response.data.updatedMessage;
            setMessages(prev =>
                prev.map(msg =>
                    msg._id === messageId ? updatedMessage : msg
                )
            );

            if (socket && isConnected) {
                socket.emit('editMessage', updatedMessage);
            }

            setEditingMessage(null);
            toast.success('Message edited');
        } catch (error) {
            toast.error('Failed to edit message');
        }
    };

    const handleDeleteMessage = async (messageId) => {
        if (!window.confirm('Delete this message?')) return;

        try {
            await deleteMessage({
                messageId,
                senderId: user._id
            });

            setMessages(prev => prev.filter(msg => msg._id !== messageId));

            if (socket && isConnected) {
                socket.emit('deleteMessage', { messageId, senderId: user._id });
            }

            toast.success('Message deleted');
        } catch (error) {
            toast.error('Failed to delete message');
        }
    };

    const handleSelectFriend = (friend) => {
        setSelectedFriend(friend);
        fetchMessages(friend._id);
    };

    const handleTyping = () => {
        if (selectedFriend?._id) {
            if (emitTyping) {
                emitTyping(selectedFriend._id, true);
            } else if (socket && isConnected) {
                socket.emit('typing', { receiverId: selectedFriend._id, isTyping: true });
            }

            // Clear existing timeout
            if (typingTimeout) clearTimeout(typingTimeout);

            // Set timeout to stop typing after 2 seconds of inactivity
            const timeout = setTimeout(() => {
                if (emitTyping) {
                    emitTyping(selectedFriend._id, false);
                } else if (socket && isConnected) {
                    socket.emit('typing', { receiverId: selectedFriend._id, isTyping: false });
                }
            }, 2000);
            setTypingTimeout(timeout);
        }
    };

    useEffect(() => {
        if (!socket) return;

        const handleUserTyping = ({ userId, isTyping }) => {
            if (userId === selectedFriend?._id) {
                setIsTyping(isTyping);
            }
        };

        socket.on('userTyping', handleUserTyping);

        return () => {
            socket.off('userTyping', handleUserTyping);
        };
    }, [socket, selectedFriend]);

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
            <div className="max-w-6xl mx-auto h-[calc(100vh-8rem)]">
                <div className="flex h-full overflow-hidden bg-white border border-gray-200 rounded-lg shadow-md dark:bg-gray-900 dark:border-gray-800">
                    {/* Friends List */}
                    <div className="flex flex-col w-64 border-r border-gray-200 sm:w-72 md:w-80 bg-gray-50 dark:bg-gray-900 dark:border-gray-800">
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
                                            onClick={() => handleSelectFriend(friend)}
                                            className={`w-full flex items-center gap-3 p-3 rounded-lg transition text-left ${
                                                isActive
                                                    ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 font-semibold shadow-sm'
                                                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/60'
                                            }`}
                                        >
                                            <div className="relative flex-shrink-0">
                                                <img
                                                    src={friend.profilePicture || `https://ui-avatars.com/api/?name=${friend.firstname}&background=3b82f6&color=fff`}
                                                    alt={friend.firstname}
                                                    className="object-cover w-10 h-10 rounded-full"
                                                />
                                                {onlineUsers?.includes(friend._id) && (
                                                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full dark:border-gray-900" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-sm truncate ${
                                                    isActive
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
                    <div className="flex flex-col flex-1 bg-white dark:bg-gray-900">
                        {selectedFriend ? (
                            <>
                                <ChatHeader
                                    friend={selectedFriend}
                                    onBack={() => setSelectedFriend(null)}
                                    isOnline={onlineUsers?.includes(selectedFriend._id)}
                                />

                                <div className="flex-1 p-4 overflow-y-auto bg-gray-50 dark:bg-gray-950">
                                    {messages.map((message) => (
                                        <MessageItem
                                            key={message._id}
                                            message={message}
                                            isOwn={message.sender === user._id}
                                            onEdit={setEditingMessage}
                                            onDelete={handleDeleteMessage}
                                        />
                                    ))}
                                    {isTyping && (
                                        <div className="flex items-center gap-2 mb-2 text-xs italic text-gray-500 dark:text-gray-400">
                                            <span>{selectedFriend.firstname} is typing...</span>
                                        </div>
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>

                                <MessageInput
                                    onSend={handleSendMessage}
                                    onTyping={handleTyping}
                                    disabled={sending || !isConnected}
                                />
                            </>
                        ) : (
                            <div className="flex items-center justify-center flex-1 p-8 text-gray-500 bg-gray-50 dark:bg-gray-950 dark:text-gray-400">
                                <div className="text-center">
                                    <p className="mb-4 text-6xl">💬</p>
                                    <p className="text-lg font-medium text-gray-800 dark:text-gray-200">Select a friend to start chatting</p>
                                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">or add new friends from the Friends page</p>
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
                    onSave={handleEditMessage}
                    onClose={() => setEditingMessage(null)}
                />
            )}
        </MainLayout>
    );
};

export default ChatPage;