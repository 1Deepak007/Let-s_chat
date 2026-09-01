import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import RegisterForm from '../auth/RegisterForm';
import AuthLayout from '../components/AuthLayout';

const RegisterPage = () => {
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (values) => {
    const result = await register(values);
    if (result.success) {
      navigate('/login');
    }
  };

  return (
    <AuthLayout title="Create Account" subtitle="Join the conversation">
      <RegisterForm onSubmit={handleSubmit} loading={loading} />
    </AuthLayout>
  );
};

export default RegisterPage;