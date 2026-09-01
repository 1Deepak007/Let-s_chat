import { Formik, Form, Field, ErrorMessage } from 'formik';
import { updateProfileValidation } from '../../utils/validations';

const EditProfileForm = ({ initialValues, onSubmit, loading }) => {

  console.log(initialValues);

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={updateProfileValidation}
      onSubmit={onSubmit}
      enableReinitialize
    >
      {() => (
        <Form className="space-y-4">
          <div className='flex flex-wrap -mx-2'>
            <div className="w-full px-2 md:w-1/2">
              <label className="block mb-1 text-sm font-medium text-gray-700">
                First Name
              </label>
              <Field
                name="firstname"
                type="text"
                className="input-field"
                placeholder="Your first name"
              />
              <ErrorMessage
                name="firstname"
                component="div"
                className="mt-1 text-sm text-red-500"
              />
            </div>
            <div className="w-full px-2 md:w-1/2">
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Last Name
              </label>
              <Field
                name="lastname"
                type="text"
                className="input-field"
                placeholder="Your last name"
              />
              <ErrorMessage
                name="lastname"
                component="div"
                className="mt-1 text-sm text-red-500"
              />
            </div>
          </div>

          <div className='flex flex-wrap -mx-2'>
            <div className="w-full px-2 md:w-1/2">
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Hometown
              </label>
              <Field
                name="hometown"
                type="text"
                className="input-field"
                placeholder="Your home town"
              />
              <ErrorMessage
                name="hometown"
                component="div"
                className="mt-1 text-sm text-red-500"
              />
            </div>
            <div className="w-full px-2 md:w-1/2">
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Favourite Places
              </label>
              <Field
                name="favoritePlaces"
                type="text"
                className="input-field"
                placeholder="Your favourite places"
              />
              <ErrorMessage
                name="firstname"
                component="div"
                className="mt-1 text-sm text-red-500"
              />
            </div>
          </div>
          <div className='flex flex-wrap -mx-2'>
            <div className="w-full px-2 md:w-1/2">
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Profession
              </label>
              <Field
                name="profession"
                type="text"
                className="input-field"
                placeholder="Your profession"
              />
              <ErrorMessage
                name="profession"
                component="div"
                className="mt-1 text-sm text-red-500"
              />
            </div>
            <div className="w-full px-2 md:w-1/2">
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Hobbies
              </label>
              <Field
                name="hobbies"
                type="text"
                className="input-field"
                placeholder="Your hobbies"
              />
              <ErrorMessage
                name="hobbies"
                component="div"
                className="mt-1 text-sm text-red-500"
              />
            </div>
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Bio
            </label>
            <Field
              name="bio"
              as="textarea"
              rows="3"
              className="input-field"
              placeholder="Tell us about yourself..."
            />
            <ErrorMessage
              name="bio"
              component="div"
              className="mt-1 text-sm text-red-500"
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