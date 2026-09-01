import api from './axiosConfig';

export const getProfile = (userId) => 
  api.get(`/api/profile/${userId}`);

export const updateProfile = (data) => 
  api.put('/api/profile/update-profile', data);

export const updateProfilePicture = (formData) => 
  api.put('/api/profile/update-profile-picture', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });

export const changePassword = (data) => 
  api.put('/api/profile/change-password', data);