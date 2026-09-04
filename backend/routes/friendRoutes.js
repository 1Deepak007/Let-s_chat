const express = require('express');
const router = express.Router(); // Correct: No io here
const authenticate = require("../middleware/authMiddleware");

const { 
  sendRequest, 
  acceptRequest, 
  rejectFriendRequest, 
  getFriends, 
  getFriendRequests,
  getFriendByUsernameId,
  getSuggestions,
  unfriend
} = require('../controllers/friendController');

module.exports = (io) => {
  
  router.post('/send-request/:receiverId', authenticate, (req, res) => sendRequest(req, res));
  router.post('/accept-request/:senderId', authenticate, (req, res) => acceptRequest(req, res, io));
  router.delete('/reject-request/:requestId', authenticate, (req, res) => rejectFriendRequest(req, res, io));
  router.get('/get-friends/:userId', authenticate, getFriends);
  router.get('/get-requests', authenticate, getFriendRequests);
  router.get('/find-friend-by-username-or-id/:usernameOrId', authenticate, getFriendByUsernameId);
  router.get('/suggestions', authenticate, getSuggestions);
  router.delete('/unfriend/:friendId', authenticate, (req, res) => unfriend(req, res, io));

  return router;
};