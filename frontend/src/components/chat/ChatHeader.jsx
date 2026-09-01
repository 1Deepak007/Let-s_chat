import React from 'react';
import { FiArrowLeft } from 'react-icons/fi';
import OnlineStatus from '../common/OnlineStatus';

const ChatHeader = ({ friend, onBack, isOnline }) => {
    return (
        <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200 dark:bg-gray-900 dark:border-gray-700">
            <div className="flex items-center gap-3">
                <button 
                    onClick={onBack} 
                    className="p-1.5 text-gray-600 rounded-lg md:hidden dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                    aria-label="Back to chats"
                >
                    <FiArrowLeft className="w-5 h-5" />
                </button>
                <img
                    src={friend?.profilePicture || `https://ui-avatars.com/api/?name=${friend?.firstname}&background=3b82f6&color=fff`}
                    alt={friend?.firstname}
                    className="object-cover w-10 h-10 rounded-full"
                />
                <div>
                    <p className="font-medium text-gray-800 dark:text-gray-100">{friend?.firstname} {friend?.lastname || ''}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">@{friend?.username}</p>
                </div>
            </div>
            <div>
                <OnlineStatus isOnline={isOnline} lastSeen={friend?.lastSeen} />
            </div>
        </div>
    );
};

export default ChatHeader;