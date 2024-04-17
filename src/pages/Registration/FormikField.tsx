import { InputWrapper, Input, ErrorMessage } from './Registration.styles'
import { IFormikField } from './Registration.types'

export function FormikField({ field, meta, ...props }: IFormikField) {
  return (
    <InputWrapper>
      <Input
        $valid={meta.touched && !meta.error}
        $error={meta.touched && meta.error}
        type={props.type || 'text'}
        placeholder={props.placeholder}
        {...field}
      />
      {meta.touched && meta.error && <ErrorMessage>{meta.error}</ErrorMessage>}
    </InputWrapper>
  )
}
