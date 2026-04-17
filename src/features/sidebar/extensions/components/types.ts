export interface PluginViewModel {
  id: string
  name: string
  description: string
  version: string
  icon: string
  status: 'installed' | 'active' | 'inactive' | 'error'
  hasSettings: boolean
}
