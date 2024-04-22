import { useNavigate } from 'react-router-dom'
import { Formik, Form } from 'formik'
import { Label, ButtonWrapper } from '../../styles/Form.styles'
import { AuthorizationMenu, FormikField, Button } from '../../components'
import { registrationSchema } from '../../utils/validationSchema'
import { passwordEncrypt } from '../../utils/passwordHash'
import { v4 as uuidv4 } from 'uuid'
import { useAppDispatch, useLocalStorage } from '../../hooks'
import {
  registerUser,
  loginUser,
  uploadImage,
  updateAvatar,
} from '../../store/userSlice'
import toast from 'react-hot-toast'
import { registrationInitialValues } from '../../lib/defaultValues'

export function Registration() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { setToLocalStorage } = useLocalStorage()

  return (
    <AuthorizationMenu>
      <Formik
        initialValues={registrationInitialValues}
        validationSchema={registrationSchema}
        validateOnBlur={false}
        onSubmit={(values, actions) => {
          const user = {
            uuid: uuidv4() as string,
            firstName: values.firstName,
            lastName: values.lastName,
            email: values.email,
            phone: values.phone,
            password: passwordEncrypt(values.password),
            avatar: values.avatar,
          }

          dispatch(registerUser(user))
            .then((registerResponse) => {
              if (registerResponse.meta.requestStatus === 'fulfilled') {
                if (values.avatar) {
                  dispatch(uploadImage(values.avatar as unknown as File)).then(
                    (imageResponse) =>
                      dispatch(
                        updateAvatar({
                          uuid: user.uuid,
                          avatar: imageResponse.payload.url,
                        }),
                      ),
                  )
                }

                dispatch(
                  loginUser({ email: values.email, password: values.password }),
                ).then((loginResponse) => {
                  if (loginResponse.meta.requestStatus === 'fulfilled') {
                    setToLocalStorage('uuid', loginResponse.payload.uuid)
                    navigate('/', { replace: true })
                    toast.success(
                      `${loginResponse.payload.email} registered successfully! You are now logged in!`,
                    )
                  } else if (loginResponse.meta.requestStatus === 'rejected') {
                    toast.error('Login failed')
                  }
                })
              } else if (registerResponse.meta.requestStatus === 'rejected') {
                toast.error(registerResponse.payload)
              } else {
                toast.error('Registration Failed')
              }
            })
            .finally(() => {
              actions.setSubmitting(false)
            })
        }}>
        {({ isSubmitting }) => (
          <Form>
            <Label>First Name</Label>
            <FormikField name="firstName" placeholder="First Name" focus />

            <Label>Last Name</Label>
            <FormikField name="lastName" placeholder="Last Name" />

            <Label>Email</Label>
            <FormikField
              name="email"
              placeholder="Email"
              type="email"
              inputMode="email"
            />

            <Label>Password</Label>
            <FormikField
              name="password"
              placeholder="Password"
              type="password"
            />

            <Label>Password Confirm</Label>
            <FormikField
              name="passwordConfirmation"
              placeholder="Confirm Password"
              type="password"
            />

            <Label>Phone</Label>
            <FormikField
              name="phone"
              placeholder="Phone"
              type="tel"
              inputMode="numeric"
            />

            <Label>Upload Avatar</Label>
            <FormikField name="avatar" type="file" />

            <ButtonWrapper>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </Button>
            </ButtonWrapper>
          </Form>
        )}
      </Formik>
    </AuthorizationMenu>
  )
}
