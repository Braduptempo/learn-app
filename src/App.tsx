import './App.css'
import Sidebar from './assets/components/sidebar/sidebar.tsx'
import Dashboard from './assets/components/dashboard/dashboard.tsx'

function App() {
  return (
    <>
     <div className='app-layout'> 
        <Sidebar />
        <Dashboard />
      </div>
    </>
  )
}

export default App
