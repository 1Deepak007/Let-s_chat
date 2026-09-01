📋 Base URL
text
http://localhost:5000
🔐 Authentication APIs
1. Register User
Endpoint: POST /api/auth/signup
Auth Required: ❌ No

Sample Payload:

json
{
  "firstname": "Deepak",
  "username": "deepakgautam",
  "password": "root@123"
}
Sample Response:

json
{
  "message": "User created successfully",
  "user": {
    "_id": "67b45d643dd419aa110b1158",
    "firstname": "Deepak",
    "username": "deepakgautam"
  }
}
2. Login User
Endpoint: POST /api/auth/login
Auth Required: ❌ No

Sample Payload:

json
{
  "username": "deepakgautam",
  "password": "root@123"
}
Sample Response:

json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "67b45d643dd419aa110b1158",
    "username": "deepakgautam",
    "firstname": "Deepak"
  }
}
3. Logout User
Endpoint: POST /api/auth/logout
Auth Required: ✅ Bearer Token

Headers:

text
Authorization: Bearer <your_jwt_token>
👤 Profile APIs (All require authentication)
4. Get User Profile
Endpoint: GET /api/profile/:userId
Auth Required: ✅ Bearer Token

Example: GET /api/profile/67b45d643dd419aa110b1158

Sample Response:

json
{
  "user": {
    "_id": "67b45d643dd419aa110b1158",
    "firstname": "Deepak",
    "username": "deepakgautam",
    "profilePicture": "uploads/profile-123.jpg",
    "friends": ["67b45d433dd419aa110b114f"],
    "friendRequests": [],
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
5. Update User Profile
Endpoint: PUT /api/profile/update-profile
Auth Required: ✅ Bearer Token

Sample Payload:

json
{
  "firstname": "Deepak Kumar",
  "username": "deepak_gautam_123",
  "bio": "Software Developer | Tech Enthusiast"
}
6. Update Profile Picture
Endpoint: PUT /api/profile/update-profile-picture
Auth Required: ✅ Bearer Token
Content-Type: multipart/form-data

Form Data:

text
profilePicture: [image file]
Sample Response:

json
{
  "message": "Profile picture updated successfully",
  "profilePicture": "uploads/profile-1734567890.jpg"
}
7. Change Password
Endpoint: PUT /api/profile/change-password
Auth Required: ✅ Bearer Token

Sample Payload:

json
{
  "oldPassword": "password123",
  "newPassword": "root@123"
}
8. Reject Friend Request (via Profile)
Endpoint: PUT /api/profile/reject-request/:requestId
Auth Required: ✅ Bearer Token

Example: PUT /api/profile/reject-request/67b2f4c7e9844722c75b70b3

9. Unfriend (via Profile)
Endpoint: DELETE /api/profile/unfriend/:friendId
Auth Required: ✅ Bearer Token

Example: DELETE /api/profile/unfriend/67b45d433dd419aa110b114f

👥 Friend APIs (All require authentication)
10. Send Friend Request
Endpoint: POST /api/friends/send-request/:receiverId
Auth Required: ✅ Bearer Token

Example: POST /api/friends/send-request/67b45d433dd419aa110b114f

Sample Response:

json
{
  "message": "Friend request sent successfully"
}
11. Accept Friend Request
Endpoint: POST /api/friends/accept-request/:senderId
Auth Required: ✅ Bearer Token

Example: POST /api/friends/accept-request/67b45d433dd419aa110b114f

Sample Response:

json
{
  "message": "Friend request accepted",
  "friendship": {
    "friendId": "67b45d433dd419aa110b114f",
    "status": "accepted"
  }
}
12. Reject Friend Request
Endpoint: DELETE /api/friends/reject-request/:requestId
Auth Required: ✅ Bearer Token

Example: DELETE /api/friends/reject-request/67b2f4c7e9844722c75b70b3

13. Unfriend
Endpoint: DELETE /api/friends/unfriend/:friendId
Auth Required: ✅ Bearer Token

Example: DELETE /api/friends/unfriend/67b45d433dd419aa110b114f

14. Get Friend List
Endpoint: GET /api/friends/get-friends/:userId
Auth Required: ✅ Bearer Token

Example: GET /api/friends/get-friends/67b45d433dd419aa110b114f

Sample Response:

json
{
  "friends": [
    {
      "_id": "67b45d643dd419aa110b1158",
      "username": "deepakgautam",
      "firstname": "Deepak",
      "profilePicture": "uploads/profile-123.jpg"
    },
    {
      "_id": "67b45d643dd419aa110b1159",
      "username": "sonugautam",
      "firstname": "Sonu"
    }
  ]
}
15. Find Friend by Username or ID
Endpoint: GET /api/friends/find-friend-by-username-or-id/:usernameOrId
Auth Required: ✅ Bearer Token

Examples:

GET /api/friends/find-friend-by-username-or-id/sonugautam

GET /api/friends/find-friend-by-username-or-id/67ae03955a68812e06d08c80

Sample Response:

json
{
  "user": {
    "_id": "67ae03955a68812e06d08c80",
    "username": "sonugautam",
    "firstname": "Sonu",
    "profilePicture": "uploads/profile-456.jpg"
  }
}
16. Get Friend Suggestions
Endpoint: GET /api/friends/suggestions/:userId
Auth Required: ✅ Bearer Token

Example: GET /api/friends/suggestions/67b45d643dd419aa110b1158

Sample Response:

json
{
  "suggestions": [
    {
      "_id": "67b45d643dd419aa110b1159",
      "username": "suggesteduser",
      "firstname": "Suggested",
      "mutualFriends": 3
    }
  ]
}
💬 Chat APIs (All require authentication)
17. Get Messages Between Two Users
Endpoint: POST /api/chat/messages
Auth Required: ✅ Bearer Token

Sample Payload:

json
{
  "senderId": "67b45d433dd419aa110b114f",
  "receiverId": "67b45d643dd419aa110b1158"
}
Sample Response:

json
{
  "messages": [
    {
      "_id": "67b61717a9c79c343af52d4f",
      "sender": "67b45d433dd419aa110b114f",
      "receiver": "67b45d643dd419aa110b1158",
      "content": "Hi! Deepak this side.",
      "messageType": "text",
      "timestamp": "2024-01-15T10:30:00.000Z",
      "isEdited": false
    }
  ]
}
18. Send Message
Endpoint: POST /api/chat/sendmessage
Auth Required: ✅ Bearer Token

Sample Payload:

json
{
  "sender": "67b45d643dd419aa110b1158",
  "receiver": "67b45d433dd419aa110b114f",
  "content": "Hi! Deepak this side.",
  "messageType": "text"
}
Sample Response:

json
{
  "message": "Message sent successfully",
  "chatMessage": {
    "_id": "67b61717a9c79c343af52d4f",
    "sender": "67b45d643dd419aa110b1158",
    "receiver": "67b45d433dd419aa110b114f",
    "content": "Hi! Deepak this side.",
    "messageType": "text",
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
19. Edit Message
Endpoint: PUT /api/chat/editmessage
Auth Required: ✅ Bearer Token

Sample Payload:

json
{
  "messageId": "67b61717a9c79c343af52d4f",
  "newContent": "Hi! Deepak here.",
  "userId": "67b45d643dd419aa110b1158"
}
Sample Response:

json
{
  "message": "Message edited successfully",
  "updatedMessage": {
    "_id": "67b61717a9c79c343af52d4f",
    "content": "Hi! Deepak here.",
    "isEdited": true,
    "editedAt": "2024-01-15T10:35:00.000Z"
  }
}
20. Delete Message
Endpoint: DELETE /api/chat/deletemessage
Auth Required: ✅ Bearer Token

Sample Payload:

json
{
  "messageId": "67b5f7d85ce366aa167df46c",
  "senderId": "67b45d433dd419aa110b114f"
}
Sample Response:

json
{
  "message": "Message deleted successfully"
}
21. Delete Conversation
Endpoint: DELETE /api/chat/delete-conversation
Auth Required: ✅ Bearer Token

Sample Payload:

json
{
  "userId1": "67b45d433dd419aa110b114f",
  "userId2": "67b45d643dd419aa110b1158"
}
Sample Response:

json
{
  "message": "Conversation deleted successfully"
}
🏥 Utility APIs
22. Server Health Check
Endpoint: GET /
Auth Required: ❌ No

Sample Response:

text
Server is running 🚀
23. Get All Users
Endpoint: GET /getallusers
Auth Required: ❌ No (Public endpoint)

Sample Response:

json
[
  {
    "_id": "67b45d643dd419aa110b1158",
    "firstname": "Deepak",
    "username": "deepakgautam",
    "profilePicture": "uploads/profile-123.jpg"
  },
  {
    "_id": "67b45d433dd419aa110b114f",
    "firstname": "Sonu",
    "username": "sonugautam"
  }
]
24. Serve Uploaded Files
Endpoint: GET /uploads/:filename
Auth Required: ❌ No

Example: GET /uploads/profile-1734567890.jpg

🔌 WebSocket (Socket.IO) Configuration
Connection Setup
javascript
const socket = io('http://localhost:5000', {
  auth: {
    token: 'your_jwt_token_here'
  },
  transports: ['websocket']
});
Socket Events
On Connection
javascript
socket.on('connect', () => {
  console.log('Connected to server');
});

socket.on('connect_error', (error) => {
  console.error('Connection error:', error);
});
Join Room (User's Personal Room)
javascript
socket.emit('join', userId);
Disconnect
javascript
socket.on('disconnect', () => {
  console.log('Disconnected from server');
});







📊 Complete API Summary - Let's Chat MongoDB
BASE URL: http://localhost:5000
🔐 AUTHENTICATION APIS
Method	Endpoint	Auth	Description
POST	/api/auth/signup	No	Register new user
POST	/api/auth/login	No	Login user
POST	/api/auth/logout	Yes	Logout user
👤 PROFILE APIS
Method	Endpoint	Auth	Description
GET	/api/profile/:userId	Yes	Get user profile
PUT	/api/profile/update-profile	Yes	Update user profile
PUT	/api/profile/update-profile-picture	Yes	Update profile picture (multipart/form-data)
PUT	/api/profile/change-password	Yes	Change password
PUT	/api/profile/reject-request/:requestId	Yes	Reject friend request
DELETE	/api/profile/unfriend/:friendId	Yes	Unfriend user
👥 FRIEND APIS
Method	Endpoint	Auth	Description
POST	/api/friends/send-request/:receiverId	Yes	Send friend request
POST	/api/friends/accept-request/:senderId	Yes	Accept friend request
DELETE	/api/friends/reject-request/:requestId	Yes	Reject friend request
DELETE	/api/friends/unfriend/:friendId	Yes	Unfriend user
GET	/api/friends/get-friends/:userId	Yes	Get friend list
GET	/api/friends/find-friend-by-username-or-id/:usernameOrId	Yes	Find friend by username or ID
GET	/api/friends/suggestions/:userId	Yes	Get friend suggestions
💬 CHAT APIS
Method	Endpoint	Auth	Description
POST	/api/chat/messages	Yes	Get messages between two users
POST	/api/chat/sendmessage	Yes	Send a new message
PUT	/api/chat/editmessage	Yes	Edit an existing message
DELETE	/api/chat/deletemessage	Yes	Delete a message
DELETE	/api/chat/delete-conversation	Yes	Delete entire conversation
🏥 UTILITY APIS
Method	Endpoint	Auth	Description
GET	/	No	Server health check
GET	/getallusers	No	Get all users
GET	/uploads/:filename	No	Serve uploaded files
📦 SAMPLE PAYLOADS
Register
json
{
  "firstname": "Deepak",
  "username": "deepakgautam",
  "password": "root@123"
}
Login
json
{
  "username": "deepakgautam",
  "password": "root@123"
}
Update Profile
json
{
  "firstname": "Deepak Kumar",
  "username": "deepak_gautam_123",
  "bio": "Software Developer"
}
Change Password
json
{
  "oldPassword": "password123",
  "newPassword": "root@123"
}
Get Messages
json
{
  "senderId": "67b45d433dd419aa110b114f",
  "receiverId": "67b45d643dd419aa110b1158"
}
Send Message
json
{
  "sender": "67b45d643dd419aa110b1158",
  "receiver": "67b45d433dd419aa110b114f",
  "content": "Hello!",
  "messageType": "text"
}
Edit Message
json
{
  "messageId": "67b61717a9c79c343af52d4f",
  "newContent": "Updated message content",
  "userId": "67b45d643dd419aa110b1158"
}
Delete Message
json
{
  "messageId": "67b5f7d85ce366aa167df46c",
  "senderId": "67b45d433dd419aa110b114f"
}
Delete Conversation
json
{
  "userId1": "67b45d433dd419aa110b114f",
  "userId2": "67b45d643dd419aa110b1158"
}
🔑 AUTHENTICATION HEADER
For all protected endpoints (marked with "Yes" in Auth column):

text
Authorization: Bearer <your_jwt_token>
📝 PATH PARAMETERS
Parameter	Description	Example
:userId	MongoDB ObjectId	67b45d643dd419aa110b1158
:friendId	MongoDB ObjectId	67b45d433dd419aa110b114f
:senderId	MongoDB ObjectId	67b45d433dd419aa110b114f
:receiverId	MongoDB ObjectId	67b45d643dd419aa110b1158
:requestId	MongoDB ObjectId	67b2f4c7e9844722c75b70b3
:usernameOrId	Username or MongoDB ObjectId	sonugautam or 67ae03955a68812e06d08c80
🛠️ TECHNOLOGY STACK
Backend: Node.js, Express

Database: MongoDB (Mongoose ODM)

Cache: Redis (ioredis)

Authentication: JWT (JSON Web Tokens)

WebSocket: Socket.IO

File Upload: Multer

Security: bcrypt, cors, cookie-parser

🚀 ENVIRONMENT VARIABLES
text
MONGO_URI=mongodb://localhost:27017/letschat
JWT_SECRET=your_jwt_secret_key
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
📡 SOCKET.IO EVENTS
Connection
javascript
io('http://localhost:5000', { auth: { token: 'jwt_token' } })
Events
Event	Direction	Description
join	Client → Server	Join user's personal room
connect	Server → Client	Socket connection established
disconnect	Server → Client	Socket disconnected
🔒 ALL PROTECTED ROUTES
All routes under these prefixes require JWT authentication:

/api/profile/*

/api/friends/*

/api/chat/*

/api/auth/logout

📦 RESPONSE STATUS CODES
Code	Meaning
200	Success
201	Created
400	Bad Request
401	Unauthorized
403	Forbidden
404	Not Found
500	Internal Server Error
