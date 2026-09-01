import React from 'react';
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
    <div className="space-y-3">
      {suggestions.map((suggestion) => {
        const suggestionId = extractId(suggestion._id);
        
        // Check if ID exists in parent's sentRequestIds array or backend flag
        const isRequestSent =
          sentRequestIds.some((id) => extractId(id) === suggestionId) ||
          suggestion.isPending;

        return (
          <div key={suggestionId} className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
            <div className="flex items-center gap-3">
              <img
                src={
                  suggestion.profilePicture ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(suggestion.firstname || suggestion.username)}&background=10b981&color=fff`
                }
                alt={suggestion.username}
                className="object-cover w-10 h-10 rounded-full"
              />
              <div>
                <p className="font-medium text-gray-800">{suggestion.firstname || suggestion.username}</p>
                <p className="text-sm text-gray-500">@{suggestion.username}</p>
              </div>
            </div>

            {isRequestSent ? (
              <span className="flex items-center gap-1 text-sm text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full font-medium">
                <FiCheck className="w-4 h-4 text-green-500" /> Request Sent
              </span>
            ) : (
              <button
                onClick={() => onSendRequest(suggestion._id)}
                className="p-2 transition rounded-full text-primary-500 hover:bg-primary-50"
                title="Add Friend"
              >
                <FiUserPlus className="w-5 h-5" />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default FriendSuggestions;