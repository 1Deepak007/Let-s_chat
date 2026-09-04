import React, { use, useState } from 'react';
import { FiCamera, FiEdit2, FiTrash2 } from 'react-icons/fi';

const ProfileHeader = ({ user, onUploadPicture, onUploadBackground, onDeleteBackground }) => {



  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const backgroundUrl = user?.backgroundWall
    ? user.backgroundWall.startsWith('http')
      ? user.backgroundWall
      : `${API_URL}/${user.backgroundWall.replace(/\\/g, '/')}`
    : null;

  return (
    <div className="relative max-h-screen overflow-y-auto">
      {/* Background Wall Container */}
      <div className="relative overflow-hidden rounded-t-lg h-28 md:h-80 bg-gradient-to-r from-primary-500 to-primary-600">
        <div
          className="absolute inset-0 transition-transform duration-[1000ms] ease-in-out bg-center bg-cover md:hover:scale-110"
          style={backgroundUrl ? { backgroundImage: `url(${backgroundUrl})` } : {}}
        />
        {/* Action Controls in Top-Right Corner */}
        <div className="absolute flex items-center gap-2 top-2 right-2">
          {user?.backgroundWall && (
            <button
              onClick={onDeleteBackground}
              title="Remove background wallpaper"
              className="p-1 text-white transition duration-200 rounded-full opacity-50 md:p-2 bg-black/50 hover:bg-red-600/80"
            >
              <FiTrash2 className="w-2 h-2 md:w-4 md:h-4" />
            </button>
          )}

          <label
            title="Update background wallpaper"
            className="flex items-center justify-center p-1 text-white transition duration-200 rounded-full opacity-50 cursor-pointer bg-black/50 hover:bg-black/70"
          >
            <FiEdit2 className="w-2 h-2 md:w-4 md:h-4" />
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onUploadBackground}
            />
          </label>
        </div>
      </div>
      {/* </div> */}

      {/* Avatar & User Details */}
      <div className="relative px-6 -mt-12 md:ml-[13%]">
        <div className="flex items-end gap-4">
          <div className="relative">
            <img
              src={
                user?.profilePicture ||
                `https://ui-avatars.com/api/?name=${user?.firstname}&size=128&background=3b82f6&color=fff`
              }
              alt={user?.firstname}
              className="object-cover w-16 h-16 border-4 border-white rounded-full md:w-24 md:h-24"
            />
            <label className="absolute bottom-0 right-0 p-1.5 bg-primary-500 rounded-full cursor-pointer hover:bg-primary-600 transition">
              <FiCamera className="w-4 h-4 text-white" />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onUploadPicture}
              />
            </label>
          </div>
          <div className="pb-3">
            <h2 className="pt-1 mt-5 text-sm font-bold text-white md:pt-0 md:text-2xl md:pb-2">
              {user?.firstname}
            </h2>
            <p className="pt-1.5 md:pt-0 text-sm font-semibold text-blue-500 md:text-blue-500 md:text-xl">
              @{user?.username}
            </p>
          </div>
        </div>
      </div>
    </div >
  );
};

export default ProfileHeader;