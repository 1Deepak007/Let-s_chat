import { FiUserPlus, FiCheck } from 'react-icons/fi';

const extractId = (id) => {
  if (!id) return '';
  if (typeof id === 'object') return String(id._id || id.$oid || id.$id || id);
  return String(id);
};

const FriendSuggestions = ({ suggestions = [], onSendRequest, sentRequestIds = [] }) => {
  if (!suggestions || suggestions.length === 0) {
    return (
      <div className="py-8 text-center text-gray-500">
        <p>No suggestions right now</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center">
  {suggestions.map((suggestion) => {
    const suggestionId = extractId(suggestion._id);

    const isRequestSent =
      sentRequestIds.some((id) => extractId(id) === suggestionId) ||
      suggestion.isPending;

    return (
      <div
        key={suggestionId}
        className="flex items-center justify-between min-w-0 p-3 transition bg-white rounded-lg shadow-md hover:shadow-lg dark:bg-gray-800 dark:border-gray-700/50 md:flex-1"
      >
        {/* User Info */}
        <div className="flex items-center min-w-0 gap-3 mr-2">
          <img
            src={
              suggestion.profilePicture ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                suggestion.firstname || suggestion.username
              )}&background=10b981&color=fff`
            }
            alt={suggestion.username}
            className="flex-shrink-0 object-cover w-10 h-10 rounded-full"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-800 truncate dark:text-gray-100">
              {suggestion.firstname || suggestion.username}
            </p>
            <p className="text-xs text-gray-500 truncate dark:text-gray-400">
              @{suggestion.username}
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex-shrink-0">
          {isRequestSent ? (
            <span className="flex items-center gap-1 text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 dark:text-gray-300 px-2.5 py-1.5 rounded-full font-medium">
              <FiCheck className="w-3.5 h-3.5 text-green-500" />
              <span className="hidden sm:inline">Request</span> Sent
            </span>
          ) : (
            <button
              onClick={() => onSendRequest(suggestion._id)}
              className="p-2 text-purple-600 transition rounded-full hover:bg-purple-50 dark:hover:bg-purple-950/40"
              title="Add Friend"
            >
              <FiUserPlus className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    );
  })}
</div>
  );
};

export default FriendSuggestions;