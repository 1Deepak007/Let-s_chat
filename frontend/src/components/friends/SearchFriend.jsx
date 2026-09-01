import React, { useState } from 'react';
import { FiSearch, FiUserPlus, FiUserMinus } from 'react-icons/fi';
import { searchFriend } from '../../api/friendsApi';
import { toast } from 'react-toastify';

const extractId = (id) => {
  if (!id) return '';
  if (typeof id === 'object') return String(id._id || id.$oid || id.$id || id);
  return String(id);
};

const SearchFriend = ({ onSendRequest, onUnfriend, currentUserId, sentRequestIds = [] }) => {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [loading, setLoading] = useState(false);

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
    <div className="card">
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <FiSearch className="absolute text-gray-400 -translate-y-1/2 left-3 top-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by username or ID..."
            className="pl-10 input-field"
          />
        </div>
        <button type="submit" disabled={loading} className="px-6 btn-primary">
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {searchResults && (
        <div className="flex items-center justify-between p-3 mt-4 rounded-lg bg-primary-50">
          <div className="flex items-center gap-3">
            <img
              src={
                searchResults.profilePicture ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(searchResults.firstname || 'User')}&background=3b82f6&color=fff`
              }
              alt={searchResults.firstname}
              className="object-cover w-10 h-10 rounded-full"
            />
            <div>
              <p className="font-medium text-gray-800">{searchResults.firstname}</p>
              <p className="text-sm text-gray-500">@{searchResults.username}</p>
            </div>
          </div>

          {isAlreadyFriend ? (
            <button
              onClick={handleUnfriendUser}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition bg-red-600 rounded-md hover:bg-red-700"
            >
              <FiUserMinus />
              Unfriend
            </button>
          ) : isRequestSent ? (
            <span className="px-4 py-2 text-sm font-medium text-gray-500 bg-gray-100 rounded-md cursor-default">
              Request Sent
            </span>
          ) : (
            <button
              onClick={handleSendRequest}
              className="flex items-center gap-2 btn-primary"
            >
              <FiUserPlus />
              Add Friend
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchFriend;