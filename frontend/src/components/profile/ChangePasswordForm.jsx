import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { changePasswordValidation } from '../../utils/validations';
import { FiEye, FiEyeOff } from 'react-icons/fi';

const ChangePasswordForm = ({ onSubmit, loading }) => {
  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false
  });

  const togglePassword = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  return (
    <Formik
      initialValues={{ oldPassword: '', newPassword: '', confirmPassword: '' }}
      validationSchema={changePasswordValidation}
      onSubmit={onSubmit}
    >
      {() => (
        <Form className="space-y-4">
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Current Password
            </label>
            <div className="relative">
              <Field
                name="oldPassword"
                type={showPasswords.old ? 'text' : 'password'}
                className="pr-10 input-field"
                placeholder="Enter current password"
              />
              <button
                type="button"
                className="absolute text-gray-500 -translate-y-1/2 right-3 top-1/2"
                onClick={() => togglePassword('old')}
              >
                {showPasswords.old ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
            <ErrorMessage
              name="oldPassword"
              component="div"
              className="mt-1 text-sm text-red-500"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              New Password
            </label>
            <div className="relative">
              <Field
                name="newPassword"
                type={showPasswords.new ? 'text' : 'password'}
                className="pr-10 input-field"
                placeholder="Enter new password"
              />
              <button
                type="button"
                className="absolute text-gray-500 -translate-y-1/2 right-3 top-1/2"
                onClick={() => togglePassword('new')}
              >
                {showPasswords.new ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
            <ErrorMessage
              name="newPassword"
              component="div"
              className="mt-1 text-sm text-red-500"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Confirm Password
            </label>
            <div className="relative">
              <Field
                name="confirmPassword"
                type={showPasswords.confirm ? 'text' : 'password'}
                className="pr-10 input-field"
                placeholder="Confirm new password"
              />
              <button
                type="button"
                className="absolute text-gray-500 -translate-y-1/2 right-3 top-1/2"
                onClick={() => togglePassword('confirm')}
              >
                {showPasswords.confirm ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
            <ErrorMessage
              name="confirmPassword"
              component="div"
              className="mt-1 text-sm text-red-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary"
          >
            {loading ? 'Changing...' : 'Change Password'}
          </button>
        </Form>
      )}
    </Formik>
  );
};

export default ChangePasswordForm;