import { useState } from 'react';
import Navbar from './common/Navbar';
import Sidebar from './common/Sidebar';
import { FiMenu } from 'react-icons/fi';

const MainLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Top Header / Navbar */}
      <header className="fixed top-0 left-0 right-0 z-40 flex items-center h-16 px-4 bg-white border-b border-gray-200 dark:bg-gray-900 dark:border-gray-700">
        <button
          onClick={toggleSidebar}
          className="p-2 mr-3 text-gray-600 transition rounded-lg dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none"
          aria-label="Toggle Sidebar"
        >
          <FiMenu className="w-6 h-6" />
        </button>
        <Navbar />
      </header>

      {/* Main Content Area */}
      <div className="flex pt-16">
        <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

        <main
          className={`flex-1 p-6 transition-all duration-300 ease-in-out ${
            isSidebarOpen ? 'ml-64' : 'ml-20'
          }`}
        >
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;