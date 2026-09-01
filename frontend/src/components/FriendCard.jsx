import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMessageCircle, FiUserMinus } from 'react-icons/fi';

const FriendCard = ({ friend, onUnfriend }) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between p-3 transition bg-white rounded-lg shadow-sm hover:shadow-md">
      <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate(`/chat?userId=${friend._id}`)}>
        <img
          src={friend.profilePicture || `https://ui-avatars.com/api/?name=${friend.firstname}&background=3b82f6&color=fff`}
          alt={friend.firstname}
          className="object-cover w-10 h-10 rounded-full"
        />
        <div>
          <p className="font-medium text-gray-800">{friend.firstname}</p>
          <p className="text-sm text-gray-500">@{friend.username}</p>
        </div>
      </div>
      <div className="flex gap-2">
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