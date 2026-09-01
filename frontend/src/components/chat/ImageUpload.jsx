import React, { useRef } from 'react';
import { FiImage } from 'react-icons/fi';

const ImageUpload = ({ onUpload, disabled }) => {
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      onUpload(file);
      e.target.value = '';
    }
  };

  return (
    <>
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={disabled}
        className="p-2 text-gray-500 transition hover:text-primary-500"
      >
        <FiImage className="w-5 h-5" />
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </>
  );
};

export default ImageUpload;