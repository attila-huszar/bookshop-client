export type RegistrationTypes = React.DetailedHTMLProps<
  React.InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
> & {
  $valid: boolean
  $error: string | false | undefined
}
