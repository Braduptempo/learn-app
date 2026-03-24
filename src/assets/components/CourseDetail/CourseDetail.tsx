import { useState } from 'react';
import QuizEditor from '../QuizEditor/QuizEditor';
import {type Vraag} from '../../../utils/types';
import styles from './CourseDetail.module.css';

interface Module {
  id: number;
  naam: string;
  quiz?: Vraag[]; // Hier slaan we de vragen op
}

interface Props {
  courseName: string;
  onBack: () => void;
}

const CourseDetail = ({ courseName, onBack }: Props) => {
  // 2. States voor de modules en de interface-beheer
  const [showQuizEditor, setShowQuizEditor] = useState(false);
  const [activeModuleId, setActiveModuleId] = useState<number | null>(null);

  const [modules, setModules] = useState<Module[]>([
    { id: 1, naam: 'Introductie', quiz: [] },
    { id: 2, naam: 'Netwerk Beveiliging', quiz: [] }
  ]);

  // 3. Functies voor module beheer
  const openQuizCreator = (id: number) => {
    setActiveModuleId(id);
    setShowQuizEditor(true);
  };

  const voegModuleToe = () => {
    const naam = prompt("Naam van de nieuwe module:");
    if (naam) {
      const nieuweModule: Module = { id: Date.now(), naam, quiz: [] };
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

  const startModule = (mod: Module) => {
    if (!mod.quiz || mod.quiz.length === 0) {
      alert(`De module "${mod.naam}" heeft nog geen quizvragen! Klik op 'Quiz Instellen'.`);
    } else {
      alert(`De quiz voor "${mod.naam}" met ${mod.quiz.length} vragen start nu!`);
    }
  };

  // 4. De functie die de vraag daadwerkelijk in de juiste module zet
  const handleSaveVraag = (nieuweVraag: Vraag) => {
    setModules(prevModules => 
      prevModules.map(m => {
        if (m.id === activeModuleId) {
          // Voeg de nieuwe vraag toe aan de bestaande quiz-array van deze module
          return { ...m, quiz: [...(m.quiz || []), nieuweVraag] };
        }
        return m;
      })
    );
    console.log("Vraag toegevoegd aan module:", activeModuleId);
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
                {mod.quiz && mod.quiz.length > 0 && (
                  <span className={styles.quizBadge}>{mod.quiz.length} vragen</span>
                )}
              </div>
              
              <div className={styles.buttonGroup}>
                <button 
                  onClick={() => openQuizCreator(mod.id)} 
                  className={styles.quizBtn}
                >
                  📝 Quiz Instellen
                </button>

                <button 
                  onClick={() => startModule(mod)} 
                  className={styles.playBtn}
                >
                  Starten
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Modal Overlay voor de Quiz Editor */}
        {showQuizEditor && (
          <QuizEditor 
            onClose={() => setShowQuizEditor(false)} 
            onSave={handleSaveVraag} 
          />
        )}
      </div>
    </div>
  );
};

export default CourseDetail;