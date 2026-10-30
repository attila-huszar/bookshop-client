import { useEffect } from 'react'
import {
  useCurrentTermsVersionQuery,
  usePaymentTermsQuery,
} from '@/store/api/termsApi'

export function useCheckoutTerms(paymentId: string | undefined) {
  const review = usePaymentTermsQuery(paymentId ?? '', {
    skip: !paymentId,
    refetchOnMountOrArgChange: true,
    refetchOnFocus: false,
    refetchOnReconnect: false,
  })
  const version = useCurrentTermsVersionQuery(undefined, {
    skip: !paymentId,
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  })
  // Ignore checks started before the latest review finished loading.
  const changed = Boolean(
    review.currentData &&
    version.isSuccess &&
    !version.isFetching &&
    (version.startedTimeStamp ?? 0) > (review.fulfilledTimeStamp ?? 0) &&
    version.currentData?.version !==
      (review.currentData.terms?.version ?? null),
  )
  const { refetch } = review

  useEffect(() => {
    if (changed && !review.isFetching && !review.isError) {
      void refetch()
    }
  }, [changed, review.isFetching, review.isError, refetch])

  return {
    review: review.currentData,
    isLoading: review.isFetching || (changed && !review.isError),
    isError: review.isError,
    refetch,
  }
}
