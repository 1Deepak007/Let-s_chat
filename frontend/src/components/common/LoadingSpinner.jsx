import React from 'react';

const LoadingSpinner = ({ size = 'md', color = 'primary' }) => {
  const sizeMap = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  const colorMap = {
    primary: 'border-primary-500',
    white: 'border-white',
    gray: 'border-gray-500',
  };

  return (
    <div
      className={`${sizeMap[size]} border-4 ${colorMap[color]} border-t-transparent rounded-full animate-spin`}
    />
  );
};

export default LoadingSpinner;