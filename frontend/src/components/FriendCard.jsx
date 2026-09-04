import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMessageCircle, FiUserMinus } from 'react-icons/fi';

const FriendCard = ({ friend, onUnfriend }) => {
  const navigate = useNavigate();

  const getAvatarUrl = (profilePic) => {
    if (!profilePic) {
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(friend.firstname)}&background=3b82f6&color=fff`;
    }
    if (profilePic.startsWith('http://') || profilePic.startsWith('https://')) {
      return profilePic;
    }
    const formattedPath = profilePic.replace(/\\/g, '/');
    return `http://localhost:5000/${formattedPath}`;
  };

  return (
    <div className="flex items-center justify-between p-3 transition-all duration-200 bg-white rounded-lg shadow-md hover:shadow-xl w-full md:w-[calc(33.333%-1.25rem)] min-w-[260px]">
      <div
        className="flex items-center gap-3 overflow-hidden cursor-pointer"
        onClick={() => navigate(`/chat?userId=${friend._id}`)}
      >
        <img
          src={getAvatarUrl(friend.profilePicture)}
          alt={friend.firstname}
          className="flex-shrink-0 object-cover w-10 h-10 rounded-full"
          onError={(e) => {
            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(friend.firstname)}&background=3b82f6&color=fff`;
          }}
        />
        <div className="truncate">
          <p className="font-medium text-gray-800 truncate">{friend.firstname}</p>
          <p className="text-sm text-gray-500 truncate">@{friend.username}</p>
        </div>
      </div>

      <div className="flex flex-shrink-0 gap-1">
        <button
          onClick={() => navigate(`/chat?userId=${friend._id}`)}
          className="p-2 transition rounded-full text-primary-500 hover:bg-primary-50"
          title="Chat"
        >
          <FiMessageCircle className="w-4 h-4" />
        </button>
        <button
          onClick={() => onUnfriend(friend._id)}
          className="p-2 text-red-500 transition rounded-full hover:bg-red-50"
          title="Unfriend"
        >
          <FiUserMinus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default FriendCard;