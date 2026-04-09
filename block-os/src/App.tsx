import { ActivityBar } from './components/ActivityBar'
import { Editor } from './components/Editor'
import { RightPanel } from './components/RightPanel'
import './App.css'

function App() {
  return (
    <div className="app">
      <ActivityBar />
      <Editor />
      <RightPanel />
    </div>
  )
}

export default App
