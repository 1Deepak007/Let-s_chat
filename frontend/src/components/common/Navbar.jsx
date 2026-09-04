// Navbar.jsx
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useFont } from '../../contexts/FontContext';
import { useNavigate } from 'react-router-dom';
import { FiLogOut, FiMoon, FiSun, FiMenu, FiType, FiCheck } from 'react-icons/fi';
import { IoMdArrowDropdown } from "react-icons/io";

const Navbar = ({ toggleSidebar }) => {
  const { user, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const { fontSize, setFontSize } = useFont();
  const navigate = useNavigate();

  // State to manage custom dropdown visibility
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const fontOptions = [
    { id: 'xs', label: 'X-Small' },
    { id: 'small', label: 'Small' },
    { id: 'normal', label: 'Normal' },
    { id: 'large', label: 'Large' },
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-40 h-12 transition-colors duration-200 bg-white border-b border-gray-200 md:h-16 dark:bg-gray-900 dark:border-gray-800">
      <div className="flex items-center justify-between w-full h-full px-4">
        {/* Left Section: Mobile Menu + App Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleSidebar}
            className="p-2 text-gray-600 transition rounded-lg dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none md:hidden"
            aria-label="Toggle Sidebar"
          >
            <FiMenu className="w-4 h-4 md:w-6 md:h-6" />
          </button>

          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <span className="text-sm font-bold text-gray-800 sm:inline dark:text-white md:text-xl">
              Let's Chat
            </span>
            <span className="w-4 h-4 mb-4 mr-2 text-xl font-bold md:text-2xl text-primary-600">💬</span>
          </div>
        </div>

        {/* Right Section: User Controls */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Custom Font Size Selector Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              id="dropdown-toggle"
              onClick={() => setIsOpen(!isOpen)}
              className="p-1 text-gray-600 transition rounded-full md:p-2 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none"
              title="Font Size"
              aria-label="Toggle Font Size Menu"
            >
              <IoMdArrowDropdown className="w-5 h-5" />
            </button>

            <ul
              id="dropdown-menu"
              aria-labelledby="dropdown-toggle"
              className={`${
                isOpen ? 'block' : 'hidden'
              } absolute right-0 mt-2 p-2 w-28 md:min-w-40 text-slate-800 text-sm font-medium bg-white border border-slate-300 rounded-md shadow-lg z-20 overflow-hidden dark:text-slate-400 dark:bg-neutral-800 dark:border-neutral-700`}
            >
              {fontOptions.map((option) => {
                const isSelected = fontSize === option.id;
                return (
                  <li key={option.id}>
                    <button
                      onClick={() => {
                        setFontSize(option.id);
                        setIsOpen(false);
                      }}
                      className={`dropdown-item w-full p-2 flex items-center justify-between rounded-md cursor-pointer transition-colors hover:text-slate-900 hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:hover:text-slate-50 dark:hover:bg-neutral-700 ${
                        isSelected ? 'text-blue-600 dark:text-blue-400 font-semibold' : ''
                      }`}
                    >
                      <span>{option.label}</span>
                      {isSelected && <FiCheck className="w-4 h-4" />}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="flex items-center md:gap-2 sm:gap-3">
            <button
              onClick={() => navigate('/profile')}
              className="p-0 transition rounded-full md:p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
              title="Profile"
            >
              <img
                src={
                  user?.profilePicture ||
                  `https://ui-avatars.com/api/?name=${user?.firstname || 'User'}&background=3b82f6&color=fff`
                }
                alt={user?.firstname || 'User'}
                className="object-cover w-6 h-6 rounded-full md:w-8 md:h-8"
              />
            </button>
          </div>

          <button
            onClick={toggleDarkMode}
            className="p-1 transition rounded-full md:p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
            title="Toggle Theme"
          >
            {darkMode ? (
              <FiSun className="w-5 h-5 text-yellow-400" />
            ) : (
              <FiMoon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            )}
          </button>

          <button
            onClick={logout}
            className="p-0 text-red-500 transition rounded-full md:p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
            title="Logout"
          >
            <FiLogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;