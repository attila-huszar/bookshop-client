export interface IUpdateUser {
  uuid: string
  field: string | 'avatar'
  value: string | File
}
