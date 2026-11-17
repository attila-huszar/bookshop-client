import type { ParseKeys } from 'i18next'
import type { ButtonColor } from '@/components/Button/Button.types'
import { CmsTab, type SelectContext } from '@/types'

type CmsTabConfig = {
  value: CmsTab
  entity: ParseKeys
  actions: { add: boolean; delete: boolean }
}

export type BulkAction = {
  label: ParseKeys
  success: ParseKeys
  color: ButtonColor
}

export const TABS = [
  {
    value: CmsTab.Orders,
    entity: 'cms.entities.order',
    actions: { add: false, delete: false },
  },
  {
    value: CmsTab.Books,
    entity: 'cms.entities.book',
    actions: { add: true, delete: true },
  },
  {
    value: CmsTab.Authors,
    entity: 'cms.entities.author',
    actions: { add: true, delete: true },
  },
  {
    value: CmsTab.Users,
    entity: 'cms.entities.user',
    actions: { add: true, delete: false },
  },
] as const satisfies readonly CmsTabConfig[]

export const BULK_ACTIONS = {
  restore: {
    label: 'common.actions.restore',
    success: 'cms.actions.restored',
    color: 'secondary',
  },
  remove: {
    label: 'common.actions.remove',
    success: 'cms.actions.removed',
    color: 'danger',
  },
  delete: {
    label: 'common.actions.delete',
    success: 'cms.actions.deleted',
    color: 'danger',
  },
} as const satisfies Record<string, BulkAction>

export const EMPTY_SELECTION: SelectContext = {
  [CmsTab.Orders]: [],
  [CmsTab.Books]: [],
  [CmsTab.Authors]: [],
  [CmsTab.Users]: [],
}
