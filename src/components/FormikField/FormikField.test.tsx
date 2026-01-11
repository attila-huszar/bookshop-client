import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { Form, Formik, FormikContextType, useFormikContext } from 'formik'
import { MockedFunction, vi } from 'vitest'
import { FormikField } from './FormikField'

vi.mock(import('formik'), async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    useFormikContext: vi.fn(),
  }
})

describe('FormikField', () => {
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

  it('should render the password eye icon and toggle password visibility', async () => {
    let showPassword = false
    const setShowPasswordMock = vi.fn((prev) => !prev)
    showPassword = setShowPasswordMock(showPassword)

    render(
      <Formik initialValues={{ password: '' }} onSubmit={() => undefined}>
        <Form>
          <FormikField
            name="password"
            placeholder="Enter password"
            type="password"
            showPassword={false}
            setShowPassword={setShowPasswordMock}
          />
        </Form>
      </Formik>,
    )

    const passwordEye = screen.getByRole('button')
    expect(passwordEye).toBeInTheDocument()

    await userEvent.click(passwordEye)

    expect(setShowPasswordMock).toHaveBeenCalledWith(false)
    expect(showPassword).toBe(true)
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

  it('should display error messages when validation fails', async () => {
    render(
      <Formik
        initialValues={{ testField: '' }}
        onSubmit={() => undefined}
        validate={(values) => {
          const errors: Record<string, string> = {}
          if (!values.testField) {
            errors.testField = 'Field is required'
          }
          return errors
        }}>
        <Form>
          <FormikField name="testField" placeholder="Enter value" type="text" />
          <button type="submit">Submit</button>
        </Form>
      </Formik>,
    )

    const submitButton = screen.getByRole('button', { name: /submit/i })
    await userEvent.click(submitButton)

    const errorMessage = screen.getByText('Field is required')
    expect(errorMessage).toBeInTheDocument()
  })
})
