import * as Yup from 'yup';

export const loginValidation = Yup.object({
  username: Yup.string()
    .required('Username is required')
    .min(3, 'Username must be at least 3 characters'),
  password: Yup.string()
    .required('Password is required')
    .min(6, 'Password must be at least 6 characters'),
});

export const registerValidation = Yup.object({
  firstname: Yup.string()
    .required('First name is required')
    .min(2, 'First name must be at least 2 characters'),
  username: Yup.string()
    .required('Username is required')
    .min(3, 'Username must be at least 3 characters'),
  password: Yup.string()
    .required('Password is required')
    .min(6, 'Password must be at least 6 characters'),
});

export const updateProfileValidation = Yup.object({
  firstname: Yup.string()
    .min(2, 'First name must be at least 2 characters'),
  username: Yup.string()
    .min(3, 'Username must be at least 3 characters'),
  bio: Yup.string()
    .max(200, 'Bio must be at most 200 characters'),
});

export const changePasswordValidation = Yup.object({
  oldPassword: Yup.string()
    .required('Current password is required'),
  newPassword: Yup.string()
    .required('New password is required')
    .min(6, 'Password must be at least 6 characters'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('newPassword'), null], 'Passwords must match')
    .required('Please confirm your password'),
});

export const messageValidation = Yup.object({
  content: Yup.string()
    .required('Message cannot be empty')
    .max(1000, 'Message is too long'),
});