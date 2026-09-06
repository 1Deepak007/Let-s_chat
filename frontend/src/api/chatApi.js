import api from './axiosConfig';

export const getMessages = (data) => 
  api.post('/api/chat/messages', data);

export const sendMessage = (data) => {
  const isFormData = data instanceof FormData;
  return api.post('/api/chat/sendmessage', data, {
    headers: {
      'Content-Type': isFormData ? 'multipart/form-data' : 'application/json',
    },
  });
};

export const editMessage = ({ 
  messageId, 
  id, 
  newContent, 
  content, 
  userId,
  encryptedContent 
}) => {
  const targetId = messageId || id;
  const targetContent = newContent !== undefined ? newContent : content;

  const payload = {
    messageId: targetId,
    id: targetId,
    newContent: targetContent,
    content: targetContent,
    userId,
  };

  // ✅ Check if backend expects stringified encrypted content
  if (encryptedContent) {
    // If the backend expects a string:
    payload.encryptedContent = JSON.stringify(encryptedContent);
    // OR if it expects the object directly:
    // payload.encryptedContent = encryptedContent;
  }

  return api.put('/api/chat/editmessage', payload);
};

export const toggleReaction = ({ messageId, emoji }) =>
  api.put('/api/chat/reaction', { messageId, emoji });

export const deleteMessage = (data) => 
  api.delete('/api/chat/deletemessage', { data });

export const deleteConversation = (data) => 
  api.delete('/api/chat/delete-conversation', { data });