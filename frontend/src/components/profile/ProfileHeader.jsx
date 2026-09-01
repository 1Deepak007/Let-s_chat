import React from 'react';
import { FiCamera } from 'react-icons/fi';
import { useTheme } from '../../contexts/ThemeContext';


const ProfileHeader = ({ user, onUploadPicture }) => {

  const {darkmode} = useTheme

  return (
    <div className="relative">
      <div className="h-32 rounded-t-lg bg-gradient-to-r from-primary-500 to-primary-700"></div>
      <div className="relative px-6 -mt-12">
        <div className="flex items-end gap-4">
          <div className="relative">
            <img
              src={user?.profilePicture || `https://ui-avatars.com/api/?name=${user?.firstname}&size=128&background=3b82f6&color=fff`}
              alt={user?.firstname}
              className="object-cover w-24 h-24 border-4 border-white rounded-full"
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
          <div className="pb-4">
            <h2 className="text-2xl font-bold">{user?.firstname}</h2>
            <p className="">@{user?.username}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;