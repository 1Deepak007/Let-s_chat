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

export const editMessage = ({ messageId, newContent, userId }) => 
  api.put('/api/chat/editmessage', { messageId, newContent, userId });

export const toggleReaction = ({ messageId, emoji }) =>
  api.put('/api/chat/reaction', { messageId, emoji });

export const deleteMessage = (data) => 
  api.delete('/api/chat/deletemessage', { data });

export const deleteConversation = (data) => 
  api.delete('/api/chat/delete-conversation', { data });