import './App.css'
import { useState } from 'react';
import Sidebar from './assets/components/sidebar/Sidebar.tsx'
import Dashboard from './assets/components/dashboard/Dashboard.tsx'
import CourseDetail from './assets/components/CourseDetail/CourseDetail.tsx'; 

// We definiëren een type voor de geselecteerde cursus
interface SelectedCourse {
  id: number;
  name: string;
}

function App() {
  // AANGEPAST: De state is nu een object of null, niet alleen een string
  const [selectedCourse, setSelectedCourse] = useState<SelectedCourse | null>(null);

  return (
    <div className="app-layout">
      <Sidebar />
      
      {selectedCourse ? (
        <CourseDetail 
          // We geven nu het ID uit het object door
          courseId={selectedCourse.id} 
          courseName={selectedCourse.name} 
          onBack={() => setSelectedCourse(null)} 
        />
      ) : (
        /* AANGEPAST: De Dashboard component geeft nu id én name terug */
        <Dashboard 
          onSelectCourse={(id, name) => setSelectedCourse({ id, name })} 
        />
      )}
    </div>
  )
}

export default App;