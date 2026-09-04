import { NavLink } from 'react-router-dom';
import { 
  FiHome, 
  FiUsers, 
  FiMessageCircle, 
  FiUser, 
  FiChevronLeft, 
  FiChevronRight 
} from 'react-icons/fi';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const menuItems = [
    { path: '/', icon: FiHome, label: 'Home' },
    { path: '/friends', icon: FiUsers, label: 'Friends' },
    { path: '/chat', icon: FiMessageCircle, label: 'Chat' },
    { path: '/profile', icon: FiUser, label: 'Profile' },
  ];

  return (
    <aside
      className={`fixed top-12 md:top-16 bottom-0 left-0 z-40 flex flex-col justify-between bg-white border-r border-gray-200 dark:bg-gray-900 dark:border-gray-800 transition-all duration-300 ease-in-out ${
        /* Mobile: off-screen drawer | Desktop: collapsed or expanded width */
        isOpen 
          ? 'w-48 md:w-64 translate-x-0' 
          : '-translate-x-full md:translate-x-0 md:w-20'
      }`}
    >
      <div className="flex-1 px-3 py-4 space-y-4 overflow-y-auto">
        {/* Desktop Expand/Collapse Chevron Button */}
        <div className="items-center justify-end hidden px-1 md:flex">
          <button
            onClick={toggleSidebar}
            className="p-2 text-gray-500 transition-colors bg-gray-100 rounded-lg hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 dark:bg-gray-800 focus:outline-none"
            aria-label="Toggle Sidebar"
            title={isOpen ? "Collapse Sidebar" : "Expand Sidebar"}
          >
            {isOpen ? <FiChevronLeft className="w-5 h-5" /> : <FiChevronRight className="w-5 h-5" />}
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-2">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => {
                if (window.innerWidth < 768) toggleSidebar();
              }}
              title={!isOpen ? item.label : undefined}
              className={({ isActive }) =>
                `flex items-center gap-4 px-1 py-2 md:px-2 md:p-3 rounded-lg transition-colors duration-150 ${
                  isOpen ? 'justify-start' : 'md:justify-center justify-start'
                } ${
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-semibold'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`
              }
            >
              <item.icon className="w-6 h-6 shrink-0" />
              <span
                className={`transition-opacity duration-200 whitespace-nowrap ${
                  isOpen ? 'block' : 'block md:hidden'
                }`}
              >
                {item.label}
              </span>
            </NavLink>
          ))}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;