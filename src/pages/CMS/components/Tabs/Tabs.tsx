import { Users, Books, Authors, Orders } from '../'
import { StyledTabs } from './Tabs.style'

const TABS = [
  { label: 'Orders', value: 'order' },
  { label: 'Books', value: 'book' },
  { label: 'Authors', value: 'author' },
  { label: 'Users', value: 'user' },
] as const

export type TabValue = (typeof TABS)[number]['value']

type Props = {
  activeTab: TabValue
  setActiveTab: (tab: TabValue) => void
}

export const Tabs = ({ activeTab, setActiveTab }: Props) => {
  const TAB_COMPONENTS = {
    order: Orders,
    book: Books,
    author: Authors,
    user: Users,
  }

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
