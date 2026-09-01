import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { FiLogOut, FiUser, FiMoon, FiSun } from 'react-icons/fi';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 transition-colors duration-200 bg-white shadow-sm dark:bg-gray-900">
      <div className="flex items-center justify-between h-full px-4 mx-auto max-w-7xl">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-primary-600">💬</span>
          <span className="text-xl font-bold text-gray-800 dark:text-white">Let's Chat</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <img
              src={user?.profilePicture || `https://ui-avatars.com/api/?name=${user?.firstname}&background=3b82f6&color=fff`}
              alt={user?.firstname}
              className="object-cover w-8 h-8 rounded-full"
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {user?.firstname}
            </span>
          </div>
          
          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 transition rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {darkMode ? (
              <FiSun className="w-5 h-5 text-yellow-400" />
            ) : (
              <FiMoon className="w-5 h-5 text-gray-600" />
            )}
          </button>
          
          <button
            onClick={() => navigate('/profile')}
            className="p-2 transition rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <FiUser className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
          
          <button
            onClick={logout}
            className="p-2 transition rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <FiLogOut className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;