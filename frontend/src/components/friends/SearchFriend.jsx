import React, { useState } from 'react';
import { FiSearch, FiUserPlus, FiUserMinus, FiCrosshair } from 'react-icons/fi';
import { searchFriend } from '../../api/friendsApi';
import { toast } from 'react-toastify';
import { useTheme } from '../../contexts/ThemeContext';
import { RiCloseCircleFill } from 'react-icons/ri';




const extractId = (id) => {
  if (!id) return '';
  if (typeof id === 'object') return String(id._id || id.$oid || id.$id || id);
  return String(id);
};



const SearchFriend = ({ onSendRequest, onUnfriend, currentUserId, sentRequestIds = [] }) => {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isFriendRequestSent, setIsFriendRequestSent] = useState(false);

  const { darkMode, toggleDarkMode } = useTheme();

  const handleSearch = async (e) => {
    e.preventDefault();

    if (!query.trim()) return;

    setLoading(true);
    try {
      const response = await searchFriend(query);
      const data = response.data;
      const matchedUser = Array.isArray(data) ? data[0] : data;

      if (!matchedUser) {
        toast.error('User not found');
        setSearchResults(null);
        return;
      }

      if (extractId(matchedUser._id) === extractId(currentUserId)) {
        toast.info("You cannot search or add yourself.");
        setSearchResults(null);
        return;
      }

      setSearchResults(matchedUser);
    } catch (error) {
      toast.error('User not found');
      setSearchResults(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSendRequest = () => {
    if (searchResults) {
      onSendRequest(searchResults._id);
    }
  };

  const handleUnfriendUser = async () => {
    if (searchResults && onUnfriend) {
      await onUnfriend(searchResults._id, currentUserId);
      setSearchResults(null);
      setQuery('');
    }
  };


  const isAlreadyFriend = searchResults?.friends?.some(
    (friend) => extractId(friend) === extractId(currentUserId)
  );

  const isRequestSent = searchResults
    ? sentRequestIds.some((id) => extractId(id) === extractId(searchResults._id))
    : false;

  return (
    <div className="p-4 transition-all duration-300 border shadow-sm bg-white/80 backdrop-blur-md border-gray-200/80 rounded-xl dark:bg-gray-900/80 dark:border-gray-800">
      {/* Search Form */}
      <form onSubmit={handleSearch} className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <FiSearch className="absolute text-lg text-gray-400 -translate-y-1/2 left-3.5 top-1/2 transition-colors group-focus-within:text-purple-500" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by username or ID..."
            className="w-full py-2.5 pl-10 pr-4 text-sm border border-gray-200 rounded-lg bg-gray-50/50 dark:bg-gray-800/50 dark:border-gray-700/80 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className={`w-full sm:w-auto px-5 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 shadow-sm active:scale-[0.98] ${darkMode
              ? 'bg-white text-gray-900 hover:bg-gray-100 active:bg-gray-200'
              : 'bg-gradient-to-r from-purple-600 to-pink-500 text-white hover:opacity-95 hover:shadow-purple-500/25 hover:shadow-md'
            } disabled:opacity-60 disabled:cursor-not-allowed`}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
              Searching...
            </span>
          ) : (
            'Search'
          )}
        </button>
      </form>

      {/* Search Results */}
      {searchResults && (
        <div className="flex sm:flex-row sm:items-center justify-between gap-3 p-3.5 mt-4 border border-gray-100 dark:border-gray-700/50 rounded-xl bg-gray-50/80 dark:bg-gray-800/40 transition-all">

          {/* User Info */}
          <div className="flex items-center min-w-0 gap-3">
            <div className="relative shrink-0">
              <img
                src={
                  searchResults.profilePicture ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    searchResults.firstname || 'User'
                  )}&background=8b5cf6&color=fff`
                }
                alt={searchResults.firstname}
                className="object-cover rounded-full shadow-sm w-11 h-11 ring-2 ring-white dark:ring-gray-700"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate dark:text-gray-100">
                {searchResults.firstname}
              </p>
              <p className="text-xs font-medium text-gray-500 truncate dark:text-gray-400">
                @{searchResults.username}
              </p>
            </div>
          </div>

          {/* Action Controls */}
          <div className="flex items-center gap-2 shrink-0 sm:self-auto">
            {isAlreadyFriend ? (
              <>
                <button
                  onClick={handleUnfriendUser}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/60 transition active:scale-95"
                >
                  <FiUserMinus className="text-base" />
                  <span>Unfriend</span>
                </button>
                <button
                  onClick={() => setSearchResults(null)}
                  className="p-2 text-gray-400 transition rounded-lg hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-200/60 dark:hover:bg-gray-700/60 active:scale-95 shrink-0"
                  aria-label="Close"
                >
                  <RiCloseCircleFill className="text-xl" />
                </button>
              </>
            ) : isRequestSent ? (
              <>
                <span className="flex-1 sm:flex-none text-center px-3.5 py-2 text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-200/70 dark:bg-gray-700/60 rounded-lg cursor-default border border-gray-300/40 dark:border-gray-600/40">
                  Request Sent
                </span>
                <button
                  onClick={() => setSearchResults(null)}
                  className="p-2 text-gray-400 transition rounded-lg hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-200/60 dark:hover:bg-gray-700/60 active:scale-95 shrink-0"
                  aria-label="Close"
                >
                  <RiCloseCircleFill className="text-xl" />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleSendRequest}
                  className="flex items-center text-xs justify-center gap-1.5 px-3.5 py-2 md:text-xs sm:text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-sm shadow-purple-500/20 transition active:scale-95"
                >
                  <FiUserPlus className="text-base" />
                </button>
                <button
                  onClick={() => setSearchResults(null)}
                  className="pl-3 text-gray-400 transition rounded-lg hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-200/60 dark:hover:bg-gray-700/60 active:scale-95 shrink-0"
                  aria-label="Close"
                >
                  <RiCloseCircleFill className="text-xl" />
                </button>
              </>
            )}
          </div>

        </div>
      )}
    </div>

  );
};

export default SearchFriend;