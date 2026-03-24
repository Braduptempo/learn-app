import { useState } from 'react';
import styles from './dashboard.module.css';

const Dashboard = () => {
  const [vakken, setVakken] = useState(['Security', 'Databases']);

  const voegVakToe = () => {
    const naam = prompt("Wat is de naam van het nieuwe vak?");
    if (naam && naam.trim() !== "") {
      setVakken([...vakken, naam]);
    }
  };

  const bewerkVak = (index: number) => {
    const huidigeNaam = vakken[index];
    const nieuweNaam = prompt("Pas de naam van het vak aan:", huidigeNaam);
    
    if (nieuweNaam && nieuweNaam.trim() !== "" && nieuweNaam !== huidigeNaam) {
      const nieuweLijst = [...vakken];
      nieuweLijst[index] = nieuweNaam; // Vervang de naam op de specifieke plek
      setVakken(nieuweLijst);
    }
  };

  return (
    <div className={styles.mainWrapper}>
      <main className={styles.dashboard}>
        <h2 className={styles.pageTitle}>Vakken</h2>

        <div className={styles.topBar}>
          <div className={styles.searchWrapper}>
            <span className={styles.searchIcon}>🔍</span>
            <input type="text" className={styles.searchInput} placeholder="Zoek een vak..." />
          </div>
          
          <button className={styles.settingsBtn}>
            <span>⚙️</span> Vak Settings
          </button>

          <button className={styles.addCourseBtn} onClick={voegVakToe}>
            <span className={styles.plusIcon}>+</span> Nieuw Vak
          </button>
        </div>

        <div className={styles.vakkenLijst}>
          {vakken.map((vak, index) => (
            <div key={index} className={styles.courseCard}>
              <div className={styles.courseInfo}>
                <span className={styles.courseName}>{vak}</span>
                {/* Bewerk knopje naast de naam */}
                <button 
                  className={styles.editBtn} 
                  onClick={() => bewerkVak(index)}
                  title="Naam aanpassen"
                >
                  ✏️
                </button>
              </div>
              <button className={styles.startBtn}>Start</button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;