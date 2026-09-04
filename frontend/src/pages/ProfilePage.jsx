import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  getProfile,
  updateProfile,
  updateProfilePicture,
  updateBackgroundWall,
  deleteBackgroundWall,
  changePassword
} from '../api/profileApi';
import MainLayout from '../components/MainLayout';
import ProfileHeader from '../components/profile/ProfileHeader';
import ProfileInfo from '../components/profile/ProfileInfo';
import EditProfileForm from '../components/profile/EditProfileForm';
import ChangePasswordForm from '../components/profile/ChangePasswordForm';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { toast } from 'react-toastify';
import { useTheme } from '../contexts/ThemeContext';


const ProfilePage = () => {
  const { user, token } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState('info');

  const{toggleDarkMode, darkMode} = useTheme();

  useEffect(() => {
    fetchProfile();
  }, [user?._id]);

  const fetchProfile = async () => {
    if (!user?._id) return;

    try {
      const response = await getProfile(user._id);
      setProfile(response.data);
    } catch (error) {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (values) => {
    setUpdating(true);
    try {
      await updateProfile(values);
      toast.success('Profile updated successfully!');
      await fetchProfile();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Update failed');
    } finally {
      setUpdating(false);
    }
  };

  const handleUploadPicture = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('profilePicture', file);

    try {
      const response = await updateProfilePicture(formData);
      toast.success('Profile picture updated!');
      setProfile((prev) => ({
        ...prev,
        profilePicture: response.data.profilePicture
      }));
    } catch (error) {
      toast.error('Failed to upload picture');
    }
  };

  const handleUploadBackground = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('backgroundWall', file);

    try {
      const response = await updateBackgroundWall(formData);
      toast.success('Background wallpaper updated!');
      setProfile((prev) => ({
        ...prev,
        backgroundWall: response.data.backgroundWall
      }));
    } catch (error) {
      toast.error('Failed to upload background wallpaper');
    }
  };

  const handleDeleteBackground = async () => {
    try {
      await deleteBackgroundWall();
      toast.success('Background wallpaper removed!');
      setProfile((prev) => ({
        ...prev,
        backgroundWall: ''
      }));
    } catch (error) {
      toast.error('Failed to remove background wallpaper');
    }
  };

  const handleChangePassword = async (values) => {
    setUpdating(true);
    try {
      await changePassword({
        oldPassword: values.oldPassword,
        newPassword: values.newPassword
      });
      toast.success('Password changed successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setUpdating(false);
    }
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
      <div className={`text-gray-600 ${darkMode ? 'text-white':'text-black'}`}>
        <div className="p-0 card md:mr-[15%] md:ml-[15%]">
          <ProfileHeader
            user={profile}
            onUploadPicture={handleUploadPicture}
            onUploadBackground={handleUploadBackground}
            onDeleteBackground={handleDeleteBackground}
          />

          <div className={`py-3 font-medium pl-1 md:pl-3 mt-1 md:px-3 md:ml-5`}>
            <div className={`flex gap-2 md:gap-4 md:ml-[12%]`}>
              <button
                onClick={() => setActiveTab('info')}
                className={`md:px-4 md:py-1 text-sm md:text-base px-2 py-1 rounded-md md:rounded-lg transition ${
                  activeTab === 'info'
                    ? 'text-blue-500'
                    : 'hover:bg-white hover:text-black'
                }`}
              >
                Profile Info
              </button>
              <button
                onClick={() => setActiveTab('edit')}
                className={`md:px-4 md:py-1 md:text-base px-2 py-1 rounded-md md:rounded-lg transition ${
                  activeTab === 'edit'
                    ? 'text-blue-500'
                    : 'hover:bg-white hover:text-black'
                }`}
              >
                Edit Profile
              </button>
              <button
                onClick={() => setActiveTab('password')}
                className={`md:px-4 md:py-1  md:text-base px-2 py-1 rounded-md md:rounded-lg transition ${
                  activeTab === 'password'
                    ? 'text-blue-500'
                    : 'hover:bg-white hover:text-black'
                }`}
              >
                Change Password
              </button>
            </div>
          </div>

          <div className="p-0">
            {activeTab === 'info' && <ProfileInfo user={profile} />}
            {activeTab === 'edit' && (
              <EditProfileForm
                initialValues={{
                  bio: profile?.bio || '',
                  firstname: profile?.firstname || '',
                  lastname: profile?.lastname || '',
                  username: profile?.username || '',
                  currentLocation: profile?.currentLocation || '',
                  favoritePlaces: profile?.favoritePlaces || '',
                  hobbies: profile?.hobbies || '',
                  hometown: profile?.hometown || '',
                  profession: profile?.profession || ''
                }}
                onSubmit={handleUpdateProfile}
                loading={updating}
              />
            )}
            {activeTab === 'password' && (
              <ChangePasswordForm
                onSubmit={handleChangePassword}
                loading={updating}
              />
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ProfilePage;