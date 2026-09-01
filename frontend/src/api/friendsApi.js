import api from './axiosConfig';

export const getFriends = (userId) => 
  api.get(`/api/friends/get-friends/${userId}`);

// export const getFriendRequests = (userId) =>
//   api.get(`/api/friends/get-requests/${userId}`);

export const getFriendRequests = () =>
  api.get(`/api/friends/get-requests/`);

export const sendFriendRequest = (receiverId) => 
  api.post(`/api/friends/send-request/${receiverId}`);

export const acceptFriendRequest = (senderId) => 
  api.post(`/api/friends/accept-request/${senderId}`);

export const rejectFriendRequest = (requestId) => 
  api.delete(`/api/friends/reject-request/${requestId}`);

export const unfriend = (friendId, currentUserId) => 
  api.delete(`/api/friends/unfriend/${friendId}`, {
    data: { userId: currentUserId }
  });

export const searchFriend = (query) => 
  api.get(`/api/friends/find-friend-by-username-or-id/${query}`);

export const getSuggestions = () => 
  api.get('/api/friends/suggestions');