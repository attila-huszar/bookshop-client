export type FormikInput = {
  showPassword?: boolean
  setShowPassword?: React.Dispatch<React.SetStateAction<boolean>>
} & React.PropsWithChildren &
  React.DetailedHTMLProps<
    React.InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  > &
  React.DetailedHTMLProps<
    React.TextareaHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  >
