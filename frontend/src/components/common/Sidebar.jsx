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
      className={`fixed top-16 bottom-0 left-0 z-30 flex flex-col justify-between bg-white border-r border-gray-200 dark:bg-gray-900 dark:border-gray-700 transition-all duration-300 ease-in-out ${
        isOpen ? 'w-64' : 'w-20'
      }`}
    >
      {/* Upper Section: Toggle Header + Nav Items */}
      <div className="flex-1 px-3 py-4 space-y-4">
        {/* Internal Toggle Button */}
        <div className={`flex items-center ${isOpen ? 'justify-end px-1' : 'justify-center'}`}>
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
              title={!isOpen ? item.label : undefined}
              className={({ isActive }) =>
                `flex items-center gap-4 px-3 py-3 rounded-lg transition-colors duration-150 ${
                  isOpen ? 'justify-start' : 'justify-center'
                } ${
                  isActive
                    ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 font-semibold'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`
              }
            >
              <item.icon className="w-6 h-6 shrink-0" />
              {isOpen && (
                <span className="transition-opacity duration-200 whitespace-nowrap">
                  {item.label}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;