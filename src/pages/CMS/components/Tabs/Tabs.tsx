import { useState } from 'react'
import { Users, Books, Authors, Orders } from '../'
import { StyledTabs } from './Tabs.style'

const TABS = [
  { label: 'Orders', value: 'orders' },
  { label: 'Books', value: 'books' },
  { label: 'Authors', value: 'authors' },
  { label: 'Users', value: 'users' },
] as const

type TabValue = (typeof TABS)[number]['value']

export const Tabs = () => {
  const TAB_COMPONENTS = {
    orders: Orders,
    books: Books,
    authors: Authors,
    users: Users,
  }
  const [activeTab, setActiveTab] = useState<TabValue>('orders')
  const ActiveComponent = TAB_COMPONENTS[activeTab]

  return (
    <StyledTabs>
      <div className="tab-list">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            className={activeTab === tab.value ? 'active' : ''}
            onClick={() => setActiveTab(tab.value)}
            type="button">
            {tab.label}
          </button>
        ))}
      </div>
      <div className="tab-content">
        <ActiveComponent />
      </div>
    </StyledTabs>
  )
}
