import api from './axiosConfig';

export const getMessages = (data) => 
  api.post('/api/chat/messages', data);

export const sendMessage = (data) => 
  api.post('/api/chat/sendmessage', data);

export const editMessage = (data) => 
  api.put('/api/chat/editmessage', data);

export const deleteMessage = (data) => 
  api.delete('/api/chat/deletemessage', { data });

export const deleteConversation = (data) => 
  api.delete('/api/chat/delete-conversation', { data });