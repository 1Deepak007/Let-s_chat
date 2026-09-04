import MainLayout from '../components/MainLayout';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const HomePage = () => {
  const { user } = useAuth();
  const { darkMode } = useTheme;

  return (
    <MainLayout>
      <div className={({ isActive }) => `${isActive ? 'card text-2xl font-bold text-gray-600' : 'card text-2xl font-bold text-green-50'}`}>
        <div className="p-3 rounded-lg shadow-md md:p-6 md:mt-0 md:card card  md:mr-[15%] md:ml-[15%]">
          <h1 className=''>Welcome, {user?.firstname}! 👋</h1>
          <p> Start chatting with your friends or find new people to connect with. </p>
          <div className="grid grid-cols-1 gap-4 mt-6 md:grid-cols-2">
            <div className="p-4 rounded-lg bg-primary-50">
              <h3 className="font-semibold text-primary-700">💬 Start Chatting</h3>
              <p className="mt-1 text-sm text-gray-600">
                Click on Chat to see your conversations
              </p>
            </div>
            {/* <div className="p-4 rounded-lg bg-green-50"> */}
            <div className={darkMode ? 'p-4 rounded-lg bg-gray-700' : 'p-4 rounded-lg bg-green-50'}>
              <h3 className="font-semibold text-green-700">👥 Find Friends</h3>
              <p className="mt-1 text-sm text-gray-600">
                Discover new people to connect with
              </p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default HomePage;