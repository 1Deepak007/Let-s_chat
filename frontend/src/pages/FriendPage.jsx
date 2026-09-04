import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getFriends, getFriendRequests, sendFriendRequest, acceptFriendRequest, rejectFriendRequest, unfriend, getSuggestions } from '../api/friendsApi';
import MainLayout from '../components/MainLayout';
import FriendCard from '../components/FriendCard';
import FriendRequestCard from '../components/friends/FriendRequestCard';
import SearchFriend from '../components/friends/SearchFriend';
import FriendSuggestions from '../components/friends/FriendSuggestions';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { toast } from 'react-toastify';


const FriendsPage = () => {
  const { user } = useAuth();
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [suggestions, setSuggestions] = useState([]);

  const [sentRequests, setSentRequests] = useState([]); // Track sent requests
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('friends');

  const storedUser = localStorage.getItem('user');
  const currentUserId = user?._id || (storedUser ? JSON.parse(storedUser)._id : null);
  const fetchData = useCallback(async () => {
    if (!currentUserId) return;
    try {
      const [friendsRes, requestsRes, suggestionsRes] = await Promise.all([
        getFriends(currentUserId),
        getFriendRequests(currentUserId),
        getSuggestions(currentUserId)
      ]);
      setFriends(friendsRes.data || []);
      setFriendRequests(requestsRes.data || []);
      setSuggestions(Array.isArray(suggestionsRes.data) ? suggestionsRes.data : []);
      // If sent requests are part of user or response, set them:
      if (user?.sentFriendRequests) {
        setSentRequests(user.sentFriendRequests);
      }
    } catch (error) {
      toast.error('Failed to load friends data');
    } finally {
      setLoading(false);
    }
  }, [currentUserId, user?.sentFriendRequests]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSendRequest = async (receiverId) => {
    try {
      await sendFriendRequest(receiverId);
      toast.success('Friend request sent!');

      // Instantly update parent state with receiverId
      setSentRequests((prev) => [...prev, receiverId]);

      await fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send request');
    }
  };

  const handleAcceptRequest = async (senderId) => {
    if (!senderId) {
      toast.error('Invalid sender ID');
      return;
    }

    try {
      await acceptFriendRequest(senderId);
      toast.success('Friend request accepted!');

      await fetchData();
    } catch (error) {
      toast.error('Failed to accept request');
    }
  };

  const handleRejectRequest = async (requestId) => {

    console.log('Rejecting request with ID:', requestId); // Debugging log

    if (!requestId) {
      toast.error('Invalid request ID');
      return;
    }
    try {
      await rejectFriendRequest(requestId);
      toast.success('Friend request rejected');

      await fetchData();
    } catch (error) {
      toast.error('Failed to reject request');
    }
  };

  const handleUnfriend = (friendId, userId = currentUserId) => {
    toast(
      ({ closeToast }) => (
        <div>
          <p className="font-medium text-gray-800">Unfriend this person?</p>
          <div className="flex justify-end gap-2 mt-3">
            <button
              onClick={closeToast}
              className="px-3 py-1 text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={async () => {
                closeToast();
                try {
                  await unfriend(friendId, userId);
                  toast.success('Unfriended successfully');
                  await fetchData();
                } catch (error) {
                  toast.error('Failed to unfriend');
                }
              }}
              className="px-3 py-1 text-white bg-red-600 rounded hover:bg-red-700"
            >
              Confirm
            </button>
          </div>
        </div>
      ),
      {
        autoClose: false,
        closeOnClick: false,
        draggable: false,
      }
    );
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className=''>
        <div className="max-w-6xl mx-auto">
          <div className="card">
            <h1 className="mb-4 font-bold">Friends</h1>

            <div className="flex gap-4 mb-4 border-b">
              <button
                onClick={() => setActiveTab('friends')}
                className={`px-4 py-2 transition ${activeTab === 'friends'
                  ? 'border-b-2 border-primary-500 text-primary-600 text-base md:font-medium'
                  : ' hover:text-gray-800'
                  }`}
              >
                Friends ({friends.length})
              </button>
              <button
                onClick={() => setActiveTab('requests')}
                className={`px-4 py-2 transition ${activeTab === 'requests'
                  ? 'border-b-2 border-primary-500 text-primary-600 text-base md:font-medium'
                  : ' hover:text-gray-800'
                  }`}
              >
                Requests ({friendRequests.length})
              </button>
              <button
                onClick={() => setActiveTab('suggestions')}
                className={`px-4 py-2 transition ${activeTab === 'suggestions'
                  ? 'border-b-2 border-primary-500 text-primary-600 text-base md:font-medium'
                  : ' hover:text-gray-800'
                  }`}
              >
                Suggestions
              </button>
            </div>

            <SearchFriend
              onSendRequest={handleSendRequest}
              onUnfriend={handleUnfriend}
              currentUserId={currentUserId}
              sentRequestIds={sentRequests}
            />

            {activeTab === 'friends' && (
              <div className="flex flex-col gap-3 mt-4 md:flex-row md:flex-wrap md:gap-5">
                {friends.length === 0 ? (
                  <p className="py-8 text-center text-gray-500">No friends yet. Start connecting!</p>
                ) : (
                  friends.map((friend) => (
                    <FriendCard key={friend._id} friend={friend} onUnfriend={handleUnfriend} />
                  ))
                )}
              </div>
            )}

            {activeTab === 'requests' && (
              <div className="mt-4 space-y-3">
                {friendRequests.length === 0 ? (
                  <p className="py-8 text-center text-gray-500">No pending friend requests</p>
                ) : (
                  friendRequests.map((request) => {
                    const senderId = typeof request.userId === 'object'
                      ? (request.userId?.$id || request.userId?._id)
                      : request.userId;
                    return (
                      <FriendRequestCard
                        key={request._id?.$id || request._id || senderId}
                        request={request}
                        onAccept={() => handleAcceptRequest(senderId)}
                        onReject={() => handleRejectRequest(request._id?.$oid || request._id)}
                      />
                    );
                  })
                )}
              </div>
            )}

            {activeTab === 'suggestions' && (
              <div className="mt-4">
                <FriendSuggestions suggestions={suggestions} onSendRequest={handleSendRequest} sentRequestIds={sentRequests} />
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default FriendsPage;
