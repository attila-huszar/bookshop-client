import { useTranslation } from 'react-i18next'
import { Navigate, Outlet } from 'react-router'
import { useUserProfileQuery } from '@/store/api/usersApi'
import { Alert } from '@/components/Alert'
import { Button } from '@/components/Button'
import { Loading } from '@/components/Loading'
import { useAppSelector } from '@/hooks/redux'
import { UserRole } from '@/types'

export function ProtectedRoute({ adminRequired = false }) {
  const { t } = useTranslation()
  const accessToken = useAppSelector((state) => state.user.accessToken)
  const {
    data: profile,
    isError,
    error,
    refetch,
  } = useUserProfileQuery(undefined, {
    skip: !accessToken,
  })

  if (!accessToken) {
    return <Navigate to="/login" replace />
  }

  if (!profile) {
    if (isError) {
      return (
        <>
          <Alert error={error} />
          <Button onClick={() => void refetch()}>
            {t('common.actions.refresh')}
          </Button>
        </>
      )
    }

    return <Loading fullScreen />
  }

  if (adminRequired && profile.role !== UserRole.Admin) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
