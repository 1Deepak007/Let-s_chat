import React from 'react';

const OnlineStatus = ({ isOnline, lastSeen }) => {
  return (
    <div className="flex items-center gap-1.5">
      <span className={`w-2.5 h-2.5 rounded-full ${
        isOnline ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
      }`} />
      <span className="text-xs text-gray-500 dark:text-gray-400">
        {isOnline ? 'Online' : lastSeen ? `Last seen ${new Date(lastSeen).toLocaleTimeString()}` : 'Offline'}
      </span>
    </div>
  );
};

export default OnlineStatus;