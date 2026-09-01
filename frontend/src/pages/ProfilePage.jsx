import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getProfile, updateProfile, updateProfilePicture, changePassword } from '../api/profileApi';
import MainLayout from '../components/MainLayout';
import ProfileHeader from '../components/profile/ProfileHeader';
import ProfileInfo from '../components/profile/ProfileInfo';
import EditProfileForm from '../components/profile/EditProfileForm';
import ChangePasswordForm from '../components/profile/ChangePasswordForm';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { toast } from 'react-toastify';

const ProfilePage = () => {
  const { user, token } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState('info');

  useEffect(() => {
    fetchProfile();
  }, [user?._id]);

  const fetchProfile = async () => {
    try {
      // console.log(user)
      // console.log(user._id)
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
      setProfile(prev => ({
        ...prev,
        profilePicture: response.data.profilePicture
      }));
    } catch (error) {
      toast.error('Failed to upload picture');
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
      <div className={({ isActive }) => `${isActive ? 'text-gray-600' : 'text-green-50'}`}>
        <div className="max-w-4xl mx-auto">
          <div className="card">
            <ProfileHeader user={profile} onUploadPicture={handleUploadPicture} />

            <div className="px-6 py-4 border-b">
              <div className="flex gap-4">
                <button
                  onClick={() => setActiveTab('info')}
                  className={`px-4 py-2 rounded-lg transition ${activeTab === 'info'
                      ? 'bg-primary-500 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                    }`}
                >
                  Profile Info
                </button>
                <button
                  onClick={() => setActiveTab('edit')}
                  className={`px-4 py-2 rounded-lg transition ${activeTab === 'edit'
                      ? 'bg-primary-500 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                    }`}
                >
                  Edit Profile
                </button>
                <button
                  onClick={() => setActiveTab('password')}
                  className={`px-4 py-2 rounded-lg transition ${activeTab === 'password'
                      ? 'bg-primary-500 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                    }`}
                >
                  Change Password
                </button>
              </div>
            </div>

            <div className="p-6">
              {activeTab === 'info' && <ProfileInfo user={profile} />}
              {activeTab === 'edit' && (
                <EditProfileForm
                  initialValues={{
                    bio: profile?.bio || '',
                    firstname: profile?.firstname || '',
                    lastname: profile?.lastname || '',
                    username: profile?.username || '',
                    currentLocation: profile?.currenLocation || '',
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
      </div>
    </MainLayout>
  );
};

export default ProfilePage;