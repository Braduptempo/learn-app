// Dashboard.tsx
import styles from './dashboard.module.css';

const Dashboard = () => {
  return (
    <div className={styles.mainWrapper}>
      <main className={styles.dashboard}>
        <div className={styles.headerSection}>
          <h2 className={styles.pageTitle}>Vakken</h2>
          
          {/* Nieuwe knop om een vak aan te maken */}
          <button className={styles.addCourseBtn}>
            <span className={styles.plusIcon}>+</span> Nieuw Vak
          </button>
        </div>

        <div className={styles.topBar}>
          <div className={styles.searchWrapper}>
            <span className={styles.searchIcon}>🔍</span>
            <input type="text" className={styles.searchInput} placeholder="Zoek een vak..." />
          </div>
          
          <button className={styles.settingsBtn}>
            <span>⚙️</span> Vak Settings
          </button>
        </div>

        {/* De lijst met vakken */}
        <div className={styles.courseCard}>
          <span className={styles.courseName}>Security</span>
          <button className={styles.startBtn}>Start</button>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;