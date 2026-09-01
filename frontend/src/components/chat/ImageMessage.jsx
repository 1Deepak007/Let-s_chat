import React, { useState } from 'react';
import { FiX } from 'react-icons/fi';

const ImageMessage = ({ url, alt, onClose }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  return (
    <>
      <img
        src={url}
        alt={alt}
        onClick={() => setIsFullscreen(true)}
        className="max-w-[200px] max-h-[200px] rounded-lg cursor-pointer hover:opacity-90 transition"
      />
      
      {isFullscreen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90"
          onClick={() => setIsFullscreen(false)}
        >
          <button
            onClick={() => setIsFullscreen(false)}
            className="absolute text-white top-4 right-4 hover:text-gray-300"
          >
            <FiX className="w-8 h-8" />
          </button>
          <img
            src={url}
            alt={alt}
            className="max-h-[90vh] max-w-[90vw] object-contain"
          />
        </div>
      )}
    </>
  );
};

export default ImageMessage;