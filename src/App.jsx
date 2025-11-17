import { Outlet } from 'react-router-dom'
import StarsBackground from './components/StarsBackground.jsx'
import './App.css'

function App() {
  return (
    <div className="App">
      <StarsBackground />
      <Outlet />
    </div>
  )
}

export default App
