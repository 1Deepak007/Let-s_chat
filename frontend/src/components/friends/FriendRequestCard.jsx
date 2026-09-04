import React from 'react';
import { FiCheck, FiX } from 'react-icons/fi';

const FriendRequestCard = ({ request, onAccept, onReject }) => {
  const senderId = typeof request.userId === 'object'
    ? (request.userId?.$oid || request.userId?._id || request.userId?.$id)
    : request.userId;

  // Extract string ID safely
  const requestId = typeof request._id === 'object'
    ? (request._id?.$oid || request._id?._id || request._id?.$id)
    : request._id;

  const sender = typeof request.userId === 'object' ? request.userId : {};
  const firstname = sender.firstname || request.firstname || request.username || 'User';
  const username = sender.username || request.username || '';
  const profilePicture = sender.profilePicture || request.profilePicture;

  return (
    <div className="flex items-center justify-between p-3 transition bg-white rounded-lg shadow-md md:hover:shadow-xl md:hover:bg-gradient-to-r md:hover:-hue-rotate-60 md:w-1/3">
      <div className="flex items-center gap-3">
        <img
          src={profilePicture || `https://ui-avatars.com/api/?name=${firstname}&background=10b981&color=fff`}
          alt={firstname}
          className="object-cover w-10 h-10 rounded-full"
        />
        <div>
          <p className="font-medium text-gray-800">{firstname}</p>
          <p className="text-sm text-gray-500">@{username}</p>
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => onAccept(senderId)}
          className="p-2 text-green-500 transition rounded-full hover:bg-green-50"
        >
          <FiCheck className="w-5 h-5" />
        </button>
        <button
          onClick={() => onReject(requestId)}
          className="p-2 text-red-500 transition rounded-full hover:bg-red-50"
        >
          <FiX className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default FriendRequestCard;