import { Suspense } from 'react'
import { useTranslation } from 'react-i18next'
import { Outlet } from 'react-router'
import { Footer } from '@/components/Footer'
import { ExtraSpace, Header } from '@/components/Header'
import { Loading } from '@/components/Loading'
import { MainContent, PageShadow, SkipLink, StyledLayout } from './Layout.style'

export function Layout() {
  const { t } = useTranslation()

  return (
    <StyledLayout>
      <SkipLink href="#main-content">{t('navigation.skipToContent')}</SkipLink>
      <PageShadow aria-hidden="true" />
      <ExtraSpace />
      <Header />
      <MainContent id="main-content" tabIndex={-1}>
        <Suspense fallback={<Loading fullScreen />}>
          <Outlet />
        </Suspense>
      </MainContent>
      <Footer />
    </StyledLayout>
  )
}
