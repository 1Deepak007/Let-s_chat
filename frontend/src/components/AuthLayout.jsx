import React from 'react';

const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <div className="relative z-0 flex items-center justify-center min-h-screen p-4 overflow-hidden">
      
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute top-0 left-0 object-cover w-full h-full -z-20"
      >
        <source src="../../extras/flowing-dots.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-900/40 to-purple-900/40 -z-10" />

      <div className="z-10 w-full max-w-md p-8 bg-transparent shadow-xl rounded-2xl">
        <div className="mb-8 font-sans text-center">
          <h1 className="text-3xl font-bold text-white">{title || "Let's Chat"}</h1>
          <p className="mt-2 text-white">{subtitle}</p>
        </div>
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;
