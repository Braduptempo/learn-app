import { useState, useEffect } from 'react';
import styles from './Dashboard.module.css';

interface Vak {
  id: number;
  naam: string;
  kleur_code: string;
}

interface DashboardProps {
  // AANGEPAST: accepteer nu ook het ID
  onSelectCourse: (id: number, name: string) => void;
}

const Dashboard = ({ onSelectCourse }: DashboardProps) => {
  const [vakken, setVakken] = useState<Vak[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const haalVakkenOp = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/vakken');
      if (!response.ok) throw new Error(`Status: ${response.status}`);
      const data = await response.json();
      if (Array.isArray(data)) setVakken(data);
    } catch (error) {
      console.error("Fout bij ophalen vakken:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    haalVakkenOp();
  }, []);

  const voegVakToe = async () => {
    const naam = prompt("Wat is de naam van het nieuwe vak?");
    if (naam && naam.trim() !== "") {
      try {
        const response = await fetch('http://localhost:3001/api/vakken', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            naam: naam.trim(), 
            kleur_code: '#3498db' 
          }),
        });
        if (response.ok) haalVakkenOp();
      } catch (error) {
        console.error("Fout bij toevoegen:", error);
      }
    }
  };

  // ... bewerkVak en verwijderVak functies blijven hetzelfde ...

  const gefilterdeVakken = vakken.filter(v => 
    v.naam.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className={styles.mainWrapper}>
        <div className={styles.loadingState}>Vakken laden uit database...</div>
      </div>
    );
  }

  return (
    <div className={styles.mainWrapper}>
      <main className={styles.dashboard}>
        <h2 className={styles.pageTitle}>Vakken</h2>

        <div className={styles.topBar}>
          <div className={styles.searchWrapper}>
            <span className={styles.searchIcon}>🔍</span>
            <input 
              type="text" 
              className={styles.searchInput} 
              placeholder="Zoek een vak..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className={styles.addCourseBtn} onClick={voegVakToe}>
            <span className={styles.plusIcon}>+</span> 
            <span>Nieuw Vak</span>
          </button>
        </div>

        <div className={styles.vakkenLijst}>
          {gefilterdeVakken.map((vak) => (
            <div 
              key={vak.id} 
              className={styles.courseCard} 
              style={{ borderLeft: `5px solid ${vak.kleur_code}` }}
            >
              <div className={styles.courseInfo}>
                <span className={styles.courseName}>{vak.naam}</span>
                {/* Action buttons (edit/delete) ... */}
              </div>
              
              {/* DE FIX: Geef vak.id ÉN vak.naam mee aan de functie */}
              <button 
                className={styles.startBtn} 
                onClick={() => onSelectCourse(vak.id, vak.naam)}
              >
                Start
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;