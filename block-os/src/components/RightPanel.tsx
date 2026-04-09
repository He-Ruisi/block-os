import './RightPanel.css'

export function RightPanel() {
  return (
    <div className="right-panel">
      <div className="panel-header">
        <span className="panel-title">AI 副驾驶</span>
        <span className="panel-badge">即将推出</span>
      </div>
      <div className="panel-body">
        <div className="panel-placeholder">
          <div className="placeholder-icon">🤖</div>
          <div className="placeholder-text">AI 对话功能即将推出</div>
          <div className="placeholder-hint">
            当前版本专注于基础编辑器功能
          </div>
        </div>
      </div>
    </div>
  )
}
