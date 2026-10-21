import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { Form, Formik } from 'formik'
import { getUserCountry } from '@/api/users'
import { useRegisterMutation } from '@/store/api/bookshopApi'
import { toast } from '@/components/AppToaster'
import { AuthorizationMenu } from '@/components/AuthorizationMenu'
import { Button, IconButton } from '@/components/Button'
import { CountrySelect } from '@/components/CountrySelect'
import { FormikField } from '@/components/FormikField'
import { getErrorMessage } from '@/helpers/errors'
import { scrollToTop } from '@/helpers/scrollToTop'
import { registrationSchema } from '@/validation/userSchemas'
import {
  defaultCountry,
  registrationInitialValues,
} from '@/constants/defaultValues'
import { RegisterRequest } from '@/types'
import { BackIcon, SpinnerIcon } from '@/assets/svg'
import { ButtonWrapper } from '@/styles/form.styles'

export function Registration() {
  const { t } = useTranslation()

  const [register] = useRegisterMutation()
  const [country, setCountry] = useState(defaultCountry)
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    scrollToTop()
  }, [])

  useEffect(() => {
    const fetchCountry = async () => {
      const data = await getUserCountry()
      setCountry(data.country || defaultCountry)
    }
    void fetchCountry()
  }, [])

  const handleSubmit = async (values: RegisterRequest) => {
    try {
      const { email } = await register(values).unwrap()
      toast.success(t('auth.registered', { email: email }))
      void navigate('/', { replace: true })
    } catch (error) {
      toast.error(getErrorMessage(error, t('auth.registerError')))
    }
  }

  return (
    <AuthorizationMenu>
      <Formik
        initialValues={{ ...registrationInitialValues, country }}
        enableReinitialize
        validationSchema={registrationSchema}
        validateOnBlur={false}
        onSubmit={handleSubmit}>
        {({ isSubmitting }) => (
          <Form noValidate>
            <p>{t('common.fields.firstName')}</p>
            <FormikField
              name="firstName"
              placeholder={t('common.fields.firstName')}
              autoComplete="given-name"
              focus
            />
            <p>{t('common.fields.lastName')}</p>
            <FormikField
              name="lastName"
              placeholder={t('common.fields.lastName')}
              autoComplete="family-name"
            />
            <p>{t('common.fields.email')}</p>
            <FormikField
              name="email"
              placeholder={t('common.fields.email')}
              type="email"
              inputMode="email"
              autoComplete="email"
            />
            <p>{t('common.fields.password')}</p>
            <FormikField
              name="password"
              placeholder={t('common.fields.password')}
              type={showPassword ? 'text' : 'password'}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              autoComplete="new-password"
            />
            <p>{t('auth.confirmPassword')}</p>
            <FormikField
              name="passwordConfirmation"
              placeholder={t('auth.confirmPassword')}
              type={showPassword ? 'text' : 'password'}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              autoComplete="new-password"
            />
            <p>{t('common.fields.country')}</p>
            <CountrySelect initial={country} />
            <p>{t('auth.uploadAvatar')}</p>
            <FormikField
              name="avatar"
              type="file"
              aria-label={t('auth.uploadAvatar')}
            />
            <ButtonWrapper>
              <IconButton
                icon={<BackIcon />}
                $size="lg"
                $color="var(--color-outline)"
                type="reset"
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
