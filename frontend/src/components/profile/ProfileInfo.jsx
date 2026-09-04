import React from 'react';
import {
  FiUser,
  FiUsers,
  FiCalendar,
  FiMapPin,
  FiHome,
  FiBriefcase,
  FiHeart,
  FiSmile
} from 'react-icons/fi';

// Reusable Card Wrapper
const InfoCard = ({ title, children, className = '' }) => (
  <div className={`bg-white dark:bg-gray-800 p-4 md:p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 ${className}`}>
    <h3 className="mb-2 text-sm font-semibold text-gray-900 md:text-md md:mb-4 dark:text-gray-100">{title}</h3>
    {children}
  </div>
);

// Reusable Icon + Text Row Component
const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
    <Icon className="w-5 h-5 text-xs text-indigo-500 md:text-base shrink-0" />
    <span className="text-xs font-medium md:text-md">{label}:</span>
    <span className="text-xs font-semibold text-gray-900 truncate md:text-md dark:text-gray-100">
      {value || 'Not specified'}
    </span>
  </div>
);

// Reusable Chip/Badge List for Arrays (Hobbies, Favorite Places)
const BadgeList = ({ items, emptyMessage }) => {
  if (!items || items.length === 0) {
    return <p className="text-sm italic text-gray-400 md:text-md">{emptyMessage}</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item, index) => (
        <span
          key={index}
          className="px-3 py-1 text-xs font-medium text-indigo-600 rounded-full bg-indigo-50 dark:bg-indigo-900/30 dark:text-indigo-400"
        >
          {item}
        </span>
      ))}
    </div>
  );
};

const ProfileInfo = ({ user }) => {
  const fullName = [user?.firstname, user?.lastname].filter(Boolean).join(' ') || user?.username;
  const joinedDate = user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric'
  }) : 'N/A';

  return (
    <div className="md:px-[15%] px-3 pb-3 mx-auto space-y-2  md:space-y-2">
      {/* Header Profile Summary */}
      <div className="flex items-center gap-4 p-2 border border-gray-100 shadow-sm dark:bg-gray-800 rounded-xl dark:border-gray-700">
        <div className="flex items-center justify-center w-10 overflow-hidden text-3xl font-bold text-indigo-600 bg-indigo-100 border-2 border-indigo-500 rounded-full md:text-2xl md:w-16 md:h-16 dark:bg-indigo-900/50 dark:text-indigo-400">
          {user?.profilePicture ? (
            <img src={user.profilePicture} alt={fullName} className="object-cover w-full h-full" />
          ) : (
            user?.firstname?.[0]?.toUpperCase() || <FiUser />
          )}
        </div>
        <div>
          <h2 className="text-sm font-bold text-gray-900 md:text-xl dark:text-gray-100">{fullName}</h2>
          <p className="text-xs text-gray-500 md:text-sm dark:text-gray-400">@{user?.username}</p>
        </div>
      </div>

      {/* Main Grid Details */}
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
        {/* Favorite Places */}
        <InfoCard title="Favorite Places" >
          <BadgeList items={user?.favoritePlaces} emptyMessage="No favorite places added yet." />
        </InfoCard>

        {/* Quick Stats */}
        <InfoCard title="Overview">
          <div className="space-y-3">
            <InfoRow icon={FiUsers} label="Friends" value={user?.friends?.length || 0} />
            <InfoRow icon={FiCalendar} label="Joined" value={joinedDate} />
            <InfoRow icon={FiBriefcase} label="Profession" value={user?.profession} />
            {/* <BadgeList items={user?.profession} emptyMessage="No profession listed." /> */}
          </div>
        </InfoCard>

        {/* Location Details */}
        <InfoCard title="Locations">
          <div className="space-y-3">
            <InfoRow icon={FiMapPin} label="Current Location" value={user?.currentLocation} />
            <InfoRow icon={FiHome} label="Hometown" value={user?.hometown} />
          </div>
        </InfoCard>

        {/* Hobbies & Passions */}
        <InfoCard title="Hobbies">
          <BadgeList items={user?.hobbies} emptyMessage="No hobbies listed." />
        </InfoCard>

        {/* About & Bio */}
        <InfoCard title="About" className="md:col-span-2">
          <p className="text-xs leading-relaxed text-gray-600 md:text-sm dark:text-gray-300">
            {user?.bio || 'No bio added yet.'}
          </p>
        </InfoCard>
      </div>
    </div>
  );
};

export default ProfileInfo;