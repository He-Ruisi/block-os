import { Puzzle } from 'lucide-react'
import './ExtensionsView.css'

export function ExtensionsView() {
  return (
    <div className="extensions-view">
      <div className="extensions-placeholder">
        <Puzzle size={48} className="extensions-icon" />
        <div className="extensions-title">插件市场</div>
        <div className="extensions-hint">即将推出</div>
        <div className="extensions-desc">
          支持自定义插件扩展 BlockOS 功能
        </div>
      </div>
    </div>
  )
}
