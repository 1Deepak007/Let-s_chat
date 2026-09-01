import { Formik, Form, Field, ErrorMessage } from 'formik';
// import { loginValidation } from '../../utils/validations';
import { loginValidation } from '../utils/validations';
import { Link } from 'react-router-dom';

const LoginForm = ({ onSubmit, loading }) => {
  return (
    <Formik
      initialValues={{ username: '', password: '' }}
      validationSchema={loginValidation}
      onSubmit={onSubmit}
    >
      {({ isSubmitting }) => (
        <Form className="space-y-4">
          <div>
            <label className="block mb-1 text-sm font-medium text-white">
              Username
            </label>
            <Field
              name="username"
              type="text"
              className="input-field"
              placeholder="Enter your username"
            />
            <ErrorMessage
              name="username"
              component="div"
              className="mt-1 text-sm text-red-500"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-white">
              Password
            </label>
            <Field
              name="password"
              type="password"
              className="input-field"
              placeholder="Enter your password"
            />
            <ErrorMessage
              name="password"
              component="div"
              className="mt-1 text-sm text-red-500"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || loading}
            className="w-full btn-primary"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>

          <p className="text-sm text-center text-white">
            Don't have an account?{' '}
            <Link to="/register" className="font-medium text-primary-600 hover:underline">
              Register
            </Link>
          </p>
        </Form>
      )}
    </Formik>
  );
};

export default LoginForm;