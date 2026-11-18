export type AuthSubmission = {
  isSubmitting: boolean
  isSessionLoading: boolean
  hasActiveSubmission: () => boolean
  runSubmission: (submit: () => Promise<void>) => Promise<void>
}
