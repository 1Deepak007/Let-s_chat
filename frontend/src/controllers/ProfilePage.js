export const updateBackgroundWall = async (formData) => {
  return await API.put('/profile/update-background-wall', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const deleteBackgroundWall = async () => {
  return await API.delete('/profile/delete-background-wall');
};


export const handleUploadBackground = async (e) => {
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

export const handleDeleteBackground = async () => {
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