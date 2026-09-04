import { useState } from 'react';
import Navbar from './common/Navbar';
import Sidebar from './common/Sidebar';

const MainLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  return (
    <div className="min-h-screen text-gray-900 bg-gray-50 dark:bg-gray-950 dark:text-gray-100">
      {/* Navbar directly renders top bar */}
      <Navbar toggleSidebar={toggleSidebar} />

      {/* Mobile Backdrop Overlay */}
      {isSidebarOpen && (
        <button
          type="button"
          aria-label="Close Sidebar"
          onClick={toggleSidebar}
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
        />
      )}

      {/* Sidebar Component */}
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Main Content Area adjusting to Sidebar status */}
      <div className="flex flex-col min-h-screen pt-10 md:pt-16">
        <main
          className={`flex-1 p-4 sm:p-6 transition-all duration-300 ease-in-out ${
            isSidebarOpen ? 'md:ml-64' : 'md:ml-20'
          }`}
        >
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;