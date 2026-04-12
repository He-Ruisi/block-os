import './ActivityBar.css'

export function ActivityBar() {
  return (
    <div className="activity-bar">
      <div className="activity-icon active" title="文件">
        ≡
      </div>
      <div className="activity-icon" title="块空间">
        ◫
      </div>
      <div className="activity-icon" title="搜索">
        ○
      </div>
      <div className="activity-spacer" />
      <div className="activity-icon" title="设置">
        ◎
      </div>
    </div>
  )
}
