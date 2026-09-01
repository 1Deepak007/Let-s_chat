import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoginForm from '../auth/LoginForm';
import AuthLayout from '../components/AuthLayout';

const LoginPage = () => {
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (values) => {
    const result = await login(values);
    if (result.success) {
      navigate('/');
    }
  };

  return (
    <AuthLayout title="Welcome Back" subtitle="Login to continue chatting">
      <LoginForm onSubmit={handleSubmit} loading={loading} />
    </AuthLayout>
  );
};

export default LoginPage;