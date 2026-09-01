import { Formik, Form, Field, ErrorMessage } from 'formik';
import { registerValidation } from '../utils/validations';
import { Link } from 'react-router-dom';

const RegisterForm = ({ onSubmit, loading }) => {
  return (
    <Formik
      initialValues={{ firstname: '', username: '', password: '' }}
      validationSchema={registerValidation}
      onSubmit={onSubmit}
    >
      {({ isSubmitting }) => (
        <Form className="space-y-4">
          <div>
            <label className="block mb-1 text-sm font-medium text-white">
              Full Name
            </label>
            <Field
              name="firstname"
              type="text"
              className="input-field"
              placeholder="Enter your full name"
            />
            <ErrorMessage
              name="firstname"
              component="div"
              className="mt-1 text-sm text-red-500"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-white">
              Username
            </label>
            <Field
              name="username"
              type="text"
              className="input-field"
              placeholder="Choose a username"
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
              placeholder="Create a password"
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
            {loading ? 'Creating account...' : 'Create Account'}
          </button>

          <p className="text-sm text-center text-white">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-primary-600 hover:underline">
              Login
            </Link>
          </p>
        </Form>
      )}
    </Formik>
  );
};

export default RegisterForm;