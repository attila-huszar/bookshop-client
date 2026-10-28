import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { Form, Formik, type FormikProps } from 'formik'
import { getUserCountry } from '@/api/users'
import { useRegisterMutation } from '@/store/api/usersApi'
import { toast } from '@/components/AppToaster'
import { AuthorizationMenu } from '@/components/AuthorizationMenu'
import { Button, IconButton } from '@/components/Button'
import { CountrySelect } from '@/components/CountrySelect'
import { FormikField } from '@/components/FormikField'
import { getErrorMessage } from '@/helpers/errors'
import { scrollToTop } from '@/helpers/scrollToTop'
import { registrationSchema } from '@/validation/userSchemas'
import { registrationInitialValues } from '@/constants/defaultValues'
import { RegisterRequest } from '@/types'
import { BackIcon, SpinnerIcon } from '@/assets/svg'
import { ButtonWrapper } from '@/styles/form.styles'

type RegistrationValues = RegisterRequest & { passwordConfirmation: string }

export function Registration() {
  const { t, i18n } = useTranslation()

  const [register] = useRegisterMutation()
  const formikRef = useRef<FormikProps<RegistrationValues>>(null)
  const lifecycleRef = useRef<{ active: boolean } | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const lifecycle = { active: true }
    lifecycleRef.current = lifecycle
    scrollToTop()

    void getUserCountry().then(({ country }) => {
      const form = formikRef.current

      if (
        lifecycle.active &&
        form &&
        !form.touched.country &&
        !form.isSubmitting
      ) {
        void form.setFieldValue('country', country, false)
      }
    })

    return () => {
      lifecycle.active = false
    }
  }, [])

  const handleSubmit = async (values: RegistrationValues) => {
    const lifecycle = lifecycleRef.current

    if (!lifecycle?.active) {
      return
    }

    try {
      const { email } = await register(values).unwrap()

      if (!lifecycle.active) {
        return
      }

      toast.success(i18n.t('auth.registered', { email }))
      void navigate('/', { replace: true })
    } catch (error) {
      if (lifecycle.active) {
        toast.error(getErrorMessage(error, i18n.t('auth.registerError')))
      }
    }
  }

  return (
    <AuthorizationMenu>
      <Formik<RegistrationValues>
        innerRef={formikRef}
        initialValues={registrationInitialValues}
        validationSchema={registrationSchema}
        validateOnBlur={false}
        onSubmit={handleSubmit}>
        {({ isSubmitting }) => (
          <Form noValidate>
            <p>
              <label htmlFor="register-first-name">
                {t('common.fields.firstName')}
              </label>
            </p>
            <FormikField
              id="register-first-name"
              name="firstName"
              placeholder={t('common.fields.firstName')}
              autoComplete="given-name"
              disabled={isSubmitting}
              autoFocus
            />
            <p>
              <label htmlFor="register-last-name">
                {t('common.fields.lastName')}
              </label>
            </p>
            <FormikField
              id="register-last-name"
              name="lastName"
              placeholder={t('common.fields.lastName')}
              autoComplete="family-name"
              disabled={isSubmitting}
            />
            <p>
              <label htmlFor="register-email">{t('common.fields.email')}</label>
            </p>
            <FormikField
              id="register-email"
              name="email"
              placeholder={t('common.fields.email')}
              type="email"
              inputMode="email"
              autoComplete="email"
              disabled={isSubmitting}
            />
            <p>
              <label htmlFor="register-password">
                {t('common.fields.password')}
              </label>
            </p>
            <FormikField
              id="register-password"
              name="password"
              placeholder={t('common.fields.password')}
              type={showPassword ? 'text' : 'password'}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              autoComplete="new-password"
              disabled={isSubmitting}
            />
            <p>
              <label htmlFor="register-password-confirmation">
                {t('auth.confirmPassword')}
              </label>
            </p>
            <FormikField
              id="register-password-confirmation"
              name="passwordConfirmation"
              placeholder={t('auth.confirmPassword')}
              type={showPassword ? 'text' : 'password'}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              autoComplete="new-password"
              disabled={isSubmitting}
            />
            <p>{t('common.fields.country')}</p>
            <CountrySelect readOnly={isSubmitting} />
            <p>
              <label htmlFor="register-avatar">{t('auth.uploadAvatar')}</label>
            </p>
            <FormikField
              id="register-avatar"
              name="avatar"
              type="file"
              aria-label={t('auth.uploadAvatar')}
              disabled={isSubmitting}
            />
            <ButtonWrapper>
              <IconButton
                icon={<BackIcon />}
                $size="lg"
                $color="var(--color-outline)"
                type="button"
                title={t('common.actions.back')}
                disabled={isSubmitting}
                onClick={() => void navigate('/')}
              />
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <SpinnerIcon height={28} />}
                {t('auth.register')}
              </Button>
              <div style={{ width: '3rem' }} />
            </ButtonWrapper>
          </Form>
        )}
      </Formik>
    </AuthorizationMenu>
  )
}
