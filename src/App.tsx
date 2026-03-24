import './App.css'
import { useState } from 'react';
import Sidebar from './assets/components/sidebar/Sidebar.tsx'
import Dashboard from './assets/components/dashboard/Dashboard.tsx'
import CourseDetail from './assets/components/CourseDetail/CourseDetail.tsx'; 

function App() {
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  return (
    <div className="app-layout">
      <Sidebar />
      
      {selectedCourse ? (
        <CourseDetail 
          courseName={selectedCourse} 
          onBack={() => setSelectedCourse(null)} 
        />
      ) : (
        <Dashboard onSelectCourse={(name) => setSelectedCourse(name)} />
      )}
    </div>
  )
}

export default App
