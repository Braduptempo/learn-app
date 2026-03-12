import styles from './sidebar.module.css';

const Sidebar = () => {
  const menuItems = ['Overzicht', 'Vakken', 'Resultaten'];

  return (
    <div className={styles.sidebarWrapper}>
      <aside className={styles.sidebar}>
        <div className={styles.header}>
          <h1 className={styles.title}>Leer App</h1>
          <hr className={styles.divider} />
        </div>
        
        <nav className={styles.nav}>
          {menuItems.map((item) => (
            <button 
              key={item} 
              className={`${styles.navButton} ${item === 'Vakken' ? styles.active : ''}`}
            >
              {item}
            </button>
          ))}
        </nav>
      </aside>
    </div>
  );
};

export default Sidebar;