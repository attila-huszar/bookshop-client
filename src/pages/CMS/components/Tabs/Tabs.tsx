import { NavLink } from 'react-router'
import { StyledTabs } from './Tabs.style'

const TABS = [
  { label: 'Orders', value: 'orders' },
  { label: 'Books', value: 'books' },
  { label: 'Authors', value: 'authors' },
  { label: 'Users', value: 'users' },
] as const

export type TabValue = (typeof TABS)[number]['value']

export const Tabs = () => {
  return (
    <StyledTabs>
      {TABS.map((tab) => (
        <NavLink to={`/cms/${tab.value}`} key={tab.value}>
          {tab.label}
        </NavLink>
      ))}
    </StyledTabs>
  )
}
