export type AuthSubmission = {
  isSubmitting: boolean
  isSubmissionPending: () => boolean
  startSubmission: () => boolean
  finishSubmission: () => void
}
