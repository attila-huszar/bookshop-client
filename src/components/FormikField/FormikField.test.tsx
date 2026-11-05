import { useState } from 'react'
import { i18n } from '@/i18n'
import { act, render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { Form, Formik, FormikContextType, useFormikContext } from 'formik'
import { MockedFunction, vi } from 'vitest'
import { registrationSchema } from '@/validation/userSchemas'
import { FormikField } from './FormikField'

vi.mock(import('formik'), async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    useFormikContext: vi.fn(),
  }
})

describe('FormikField', () => {
  it.each(['text', 'select', 'textarea'] as const)(
    'translates a visible %s error without resetting the form',
    async (type) => {
      render(
        <Formik
          initialValues={{ firstName: '', email: 'reader@example.com' }}
          validationSchema={registrationSchema.pick(['firstName', 'email'])}
          onSubmit={vi.fn()}>
          <Form>
            <FormikField name="firstName" placeholder="First name" type={type}>
              {type === 'select' && <option value="">Choose a name</option>}
            </FormikField>
            <FormikField name="email" placeholder="Email" />
            <button type="submit">Save</button>
          </Form>
        </Formik>,
      )

      await userEvent.click(screen.getByRole('button', { name: 'Save' }))
      expect(await screen.findByText('Required')).toBeInTheDocument()

      await act(async () => {
        await i18n.changeLanguage('hu')
      })

      expect(await screen.findByText('Kötelező')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Email')).toHaveValue(
        'reader@example.com',
      )
    },
  )

  const mockSetFieldValue = vi.fn()
  const mockSetFieldTouched = vi.fn()
  const mockValidateField = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    const mockUseFormikContext = useFormikContext as MockedFunction<
      typeof useFormikContext
    >
    mockUseFormikContext.mockReturnValue({
      setFieldValue: mockSetFieldValue,
      setFieldTouched: mockSetFieldTouched,
      validateField: mockValidateField,
      submitCount: 0,
      getFieldMeta: () => ({
        touched: false,
        error: '',
      }),
    } as unknown as FormikContextType<unknown>)
  })

  it('should render the input field and allow typing', async () => {
    render(
      <Formik initialValues={{ testField: '' }} onSubmit={() => undefined}>
        <Form>
          <FormikField name="testField" placeholder="Enter value" type="text" />
        </Form>
      </Formik>,
    )

    const input = screen.getByPlaceholderText('Enter value')
    expect(input).toBeInTheDocument()

    await userEvent.type(input, 'Test Value')
    expect(input).toHaveValue('Test Value')
  })

  it.each(['', 0, 'reader@example.com'])(
    'renders an explicit value outside Formik and updates it: %s',
    (value) => {
      const { rerender } = render(
        <FormikField value={value} placeholder="Display value" readOnly />,
      )

      expect(screen.getByPlaceholderText('Display value')).toHaveValue(
        String(value),
      )

      rerender(
        <FormikField value="Updated" placeholder="Display value" readOnly />,
      )

      expect(screen.getByPlaceholderText('Display value')).toHaveValue(
        'Updated',
      )
    },
  )

  it('keeps an unnamed display input out of Formik values and touched state', async () => {
    const onSubmit = vi.fn()
    const user = userEvent.setup()

    render(
      <Formik initialValues={{ name: 'Reader' }} onSubmit={onSubmit}>
        {({ values, touched, dirty }) => (
          <Form>
            <FormikField name="name" placeholder="Name" />
            <FormikField
              value="reader@example.com"
              placeholder="Email"
              readOnly
            />
            <output data-testid="form-state">
              {JSON.stringify({ values, touched, dirty })}
            </output>
            <button type="submit">Save</button>
          </Form>
        )}
      </Formik>,
    )

    await user.click(screen.getByPlaceholderText('Email'))
    await user.tab()

    expect(screen.getByTestId('form-state')).toHaveTextContent(
      JSON.stringify({
        values: { name: 'Reader' },
        touched: {},
        dirty: false,
      }),
    )

    await user.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        { name: 'Reader' },
        expect.anything(),
      )
    })
  })

  it('should render the password eye icon and toggle password visibility', async () => {
    function PasswordField() {
      const [showPassword, setShowPassword] = useState(false)

      return (
        <Formik initialValues={{ password: '' }} onSubmit={() => undefined}>
          <Form>
            <FormikField
              name="password"
              placeholder="Enter password"
              type={showPassword ? 'text' : 'password'}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
            />
          </Form>
        </Formik>
      )
    }

    render(<PasswordField />)
    const input = screen.getByPlaceholderText('Enter password')
    expect(input).toHaveAttribute('type', 'password')

    await userEvent.click(screen.getByRole('button', { name: 'Show password' }))
    expect(input).toHaveAttribute('type', 'text')
    await userEvent.click(screen.getByRole('button', { name: 'Hide password' }))
    expect(input).toHaveAttribute('type', 'password')
  })

  it('should handle file input changes', async () => {
    const testFile = new File(['dummy'], 'test.png', { type: 'image/png' })

    render(
      <Formik initialValues={{ avatar: null }} onSubmit={() => undefined}>
        <Form>
          <FormikField name="avatar" type="file" />
        </Form>
      </Formik>,
    )

    const fileInput = screen.getByLabelText(/avatar/i)
    expect(fileInput).toBeInTheDocument()

    await userEvent.upload(fileInput, testFile)
    expect(mockSetFieldValue).toHaveBeenCalledWith('avatar', testFile)
    expect(mockSetFieldTouched).toHaveBeenCalledWith('avatar', true)
    expect(mockValidateField).toHaveBeenCalledWith('avatar')
  })
})
