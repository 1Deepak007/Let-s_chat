import { FiArrowLeft } from 'react-icons/fi';
import OnlineStatus from '../common/OnlineStatus';
import MessageSearch from './MessageSearch';

const ChatHeader = ({ friend, onBack, isOnline, messages, onSelectMessage }) => {
  return (
    <div className="flex items-center justify-between gap-2 p-3 bg-white border-b border-gray-200 sm:gap-4 sm:p-4 dark:bg-gray-900 dark:border-gray-700">
      
      {/* Left Section: Back Button, User Info, and Message Search */}
      <div className="flex items-center flex-1 min-w-0 gap-2 sm:gap-4">
        
        {/* Back button (Mobile only) */}
        <button 
          onClick={onBack} 
          className="p-1.5 text-gray-600 rounded-lg md:hidden dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition flex-shrink-0"
          aria-label="Back to chats"
        >
          <FiArrowLeft className="w-5 h-5" />
        </button>

        {/* Profile Avatar */}
        <img
          src={friend?.profilePicture || `https://ui-avatars.com/api/?name=${friend?.firstname}&background=3b82f6&color=fff`}
          alt={friend?.firstname}
          className="flex-shrink-0 object-cover rounded-full w-9 h-9 sm:w-10 sm:h-10"
        />

        {/* Name & Username */}
        <div className="min-w-0 max-w-[120px] sm:max-w-[200px] md:max-w-xs">
          <p className="text-sm font-semibold leading-tight text-gray-900 truncate sm:text-base dark:text-gray-100">
            {friend?.firstname} {friend?.lastname || ''}
          </p>
          <p className="text-xs text-gray-500 truncate sm:text-sm dark:text-gray-400">
            @{friend?.username}
          </p>
        </div>

        {/* Message Search (Left side, next to user details) */}
      </div>

      {/* Right Section: Online/Offline Status (Rightmost side) */}
      <div className="flex items-center justify-end flex-shrink-0 pl-2">
        <div className="min-w-0 flex-1 max-w-[180px] sm:max-w-xs ml-1 md:mr-4 sm:ml-2">
          <MessageSearch messages={messages} onSelectMessage={onSelectMessage} />
        </div>
        <OnlineStatus isOnline={isOnline} lastSeen={friend?.lastSeen} />
      </div>

    </div>
  );
};

export default ChatHeader;