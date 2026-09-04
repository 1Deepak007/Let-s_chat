const express = require('express');
const authenticate = require('../middleware/authMiddleware');
const uploadChatMedia = require('../middleware/upload');

module.exports = (io) => {
    const { getMessages, sendMessage, deleteMessage, editMessage, toggleReaction, deleteConversation } = require('../controllers/chatController')(io);
    const router = express.Router();

    router.post('/messages', authenticate, getMessages);
    router.post('/sendmessage', authenticate, uploadChatMedia.single('file'), sendMessage);
    router.put('/editmessage', authenticate, editMessage);
    router.put('/reaction', authenticate, toggleReaction);
    router.delete('/deletemessage', authenticate, deleteMessage);
    router.delete('/delete-conversation', authenticate, deleteConversation); 

    return router;
};
