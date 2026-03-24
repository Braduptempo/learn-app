import { useState } from 'react';
import styles from './CourseDetail.module.css';

interface Module {
  id: number;
  naam: string;
}

interface Props {
  courseName: string;
  onBack: () => void;
}

interface Vraag {
  id: number;
  vraagTekst: string;
  antwoorden: string[]; // [goed, fout1, fout2, fout3]
  correctAntwoordIndex: number; // meestal 0 als je het eerste antwoord altijd als 'goed' opslaat
}

interface Module {
  id: number;
  naam: string;
  quiz?: Vraag[]; // Optioneel: niet elke module hoeft direct een quiz te hebben
}

const CourseDetail = ({ courseName, onBack }: Props) => {
  const [modules, setModules] = useState<Module[]>([
    { id: 1, naam: 'Introductie' },
    { id: 2, naam: 'Basis Concepten' }
  ]);

  const voegModuleToe = () => {
    const naam = prompt("Naam van de nieuwe module:");
    if (naam) {
      const nieuweModule = { id: Date.now(), naam };
      setModules([...modules, nieuweModule]);
    }
  };

  const bewerkModule = (id: number) => {
    const mod = modules.find(m => m.id === id);
    const nieuweNaam = prompt("Pas module naam aan:", mod?.naam);
    if (nieuweNaam) {
      setModules(modules.map(m => m.id === id ? { ...m, naam: nieuweNaam } : m));
    }
  };

  const startModule = (naam: string) => {
    alert(`Module "${naam}" wordt gestart...`);
  };

  return (
    <div className={styles.mainWrapper}>
      <div className={styles.dashboard}>
        <div className={styles.header}>
          <button onClick={onBack} className={styles.backBtn}>← Terug</button>
          <h2 className={styles.pageTitle}>{courseName}</h2>
          <button onClick={voegModuleToe} className={styles.addBtn}>+ Nieuwe Module</button>
        </div>

        <div className={styles.moduleLijst}>
          {modules.map((mod) => (
            <div key={mod.id} className={styles.moduleCard}>
              <div className={styles.info}>
                <span className={styles.moduleName}>{mod.naam}</span>
                <button onClick={() => bewerkModule(mod.id)} className={styles.iconBtn}>✏️</button>
              </div>
              <button 
                onClick={() => startModule(mod.naam)} 
                className={styles.playBtn}
              >
                Starten
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;