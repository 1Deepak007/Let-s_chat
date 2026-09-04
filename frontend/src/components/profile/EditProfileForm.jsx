import { Formik, Form, Field, ErrorMessage } from 'formik';
import { updateProfileValidation } from '../../utils/validations';
import { useTheme } from '../../contexts/ThemeContext';


const EditProfileForm = ({ initialValues, onSubmit, loading }) => {

  console.log(initialValues);
  
  const {toggleDarkMode, darkMode} = useTheme();
  console.log(darkMode)

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={updateProfileValidation}
      onSubmit={onSubmit}
      enableReinitialize
    >
      {() => (
        <Form className={`md:px-[15%] px-3 pb-3 space-y-4 ${darkMode ? 'text-gray-100' : 'text-black'}`}>
          <div className='flex flex-wrap -mx-2'>
            <div className="w-full px-2 md:w-1/2">
              <label className="block mb-1 text-xs font-medium md:text-md">
                First Name
              </label>
              <Field
                name="firstname"
                type="text"
                className="text-xs input-field md:text-md"
                placeholder="Your first name"
              />
              <ErrorMessage
                name="firstname"
                component="div"
                className="mt-1 text-xs text-red-500 md:text-md"
              />
            </div>
            <div className="w-full px-2 md:w-1/2">
              <label className="block mt-3 mb-1 text-xs font-medium md:mt-0 md:text-md">
                Last Name
              </label>
              <Field
                name="lastname"
                type="text"
                className="text-xs input-field md:text-md"
                placeholder="Your last name"
              />
              <ErrorMessage
                name="lastname"
                component="div"
                className="mt-1 text-xs text-red-500 md:text-md"
              />
            </div>
          </div>

          <div className='flex flex-wrap -mx-2'>
            <div className="w-full px-2 md:w-1/2">
              <label className="block mb-1 text-xs font-medium md:text-md">
                Hometown
              </label>
              <Field
                name="hometown"
                type="text"
                className="text-xs input-field md:text-md"
                placeholder="Your home town"
              />
              <ErrorMessage
                name="hometown"
                component="div"
                className="mt-1 text-xs text-red-500 md:text-md"
              />
            </div>
            <div className="w-full px-2 md:w-1/2">
              <label className="block mt-3 mb-1 text-xs font-medium md:mt-0 md:text-md">
                Favourite Places
              </label>
              <Field
                name="favoritePlaces"
                type="text"
                className="text-xs input-field md:text-md"
                placeholder="Your favourite places"
              />
              <ErrorMessage
                name="favoritePlaces"
                component="div"
                className="mt-1 text-xs text-red-500 md:text-md"
              />
            </div>
          </div>
          <div className='flex flex-wrap -mx-2'>
            <div className="w-full px-2 md:w-1/2">
              <label className="block mb-1 text-xs font-medium md:text-md">
                Profession
              </label>
              <Field
                name="profession"
                type="text"
                className="text-xs input-field md:text-md"
                placeholder="Your profession"
              />
              <ErrorMessage
                name="profession"
                component="div"
                className="mt-1 text-xs text-red-500 md:text-md"
              />
            </div>
            <div className="w-full px-2 mt-3 md:mt-0 md:w-1/2">
              <label className="block mb-1 text-xs font-medium md:text-md">
                Hobbies
              </label>
              <Field
                name="hobbies"
                type="text"
                className="text-xs input-field md:text-md"
                placeholder="Your hobbies"
              />
              <ErrorMessage
                name="hobbies"
                component="div"
                className="mt-1 text-xs text-red-500 md:text-md"
              />
            </div>
          </div>

          <div>
            <label className="block mb-1 text-xs font-medium md:text-md">
              Bio
            </label>
            <Field
              name="bio"
              as="textarea"
              rows="3"
              className="text-xs input-field md:text-md"
              placeholder="Tell us about yourself..."
            />
            <ErrorMessage
              name="bio"
              component="div"
              className="mt-1 text-xs text-red-500 md:text-md"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary"
          >
            {loading ? 'Updating...' : 'Update Profile'}
          </button>
        </Form>
      )}
    </Formik>
  );
};

export default EditProfileForm;