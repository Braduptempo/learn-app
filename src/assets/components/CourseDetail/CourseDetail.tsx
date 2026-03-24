import { useState } from 'react';
import QuizEditor from '../QuizEditor/QuizEditor';
import QuizManager from '../QuizManager/QuizManager'; // Zorg dat je dit pad checkt!
import styles from './CourseDetail.module.css';

interface Vraag {
  id: number;
  vraagTekst: string;
  antwoorden: string[];
  correctAntwoordIndex: number;
}

interface Module {
  id: number;
  naam: string;
  quiz?: Vraag[];
}

interface Props {
  courseName: string;
  onBack: () => void;
}


const CourseDetail = ({ courseName, onBack }: Props) => {
  const [modules, setModules] = useState<Module[]>([
    { id: 1, naam: 'Introductie', quiz: [] },
    { id: 2, naam: 'Netwerk Beveiliging', quiz: [] }
  ]);

  // States voor navigatie en beheer
  const [showQuizEditor, setShowQuizEditor] = useState(false);
  const [viewingQuizModuleId, setViewingQuizModuleId] = useState<number | null>(null);
  const [editingVraag, setEditingVraag] = useState<Vraag | null>(null);

  // Zoek de actieve module op basis van het ID dat we bekijken
  const activeModule = modules.find(m => m.id === viewingQuizModuleId);

  // --- Functies voor Quiz Beheer ---

  const handleSaveVraag = (nieuweVraag: Vraag) => {
    setModules(prevModules =>
      prevModules.map(m => {
        if (m.id === viewingQuizModuleId) {
          const bestaandeQuiz = m.quiz || [];
          // Als we aan het editen waren, vervang de oude vraag. Anders voeg toe.
          const updateVragen = editingVraag
            ? bestaandeQuiz.map(q => q.id === nieuweVraag.id ? nieuweVraag : q)
            : [...bestaandeQuiz, nieuweVraag];

          return { ...m, quiz: updateVragen };
        }
        return m;
      })
    );
    setEditingVraag(null); // Reset na opslaan
  };

  const verwijderVraag = (vraagId: number) => {
    if (window.confirm("Weet je zeker dat je deze vraag wilt verwijderen?")) {
      setModules(prev => prev.map(m => {
        if (m.id === viewingQuizModuleId) {
          return { ...m, quiz: m.quiz?.filter(q => q.id !== vraagId) };
        }
        return m;
      }));
    }
  };

  const openEditorVoorNieuw = () => {
    setEditingVraag(null);
    setShowQuizEditor(true);
  };

  const openEditorVoorBestaand = (vraag: Vraag) => {
    setEditingVraag(vraag);
    setShowQuizEditor(true);
  };

  // --- Functies voor Module Beheer ---

  const voegModuleToe = () => {
    const naam = prompt("Naam van de nieuwe module:");
    if (naam) setModules([...modules, { id: Date.now(), naam, quiz: [] }]);
  };

  // --- RENDER LOGICA ---

  // SCHERM 1: De Quiz Manager (als er een module geselecteerd is om te beheren)
  if (viewingQuizModuleId && activeModule) {
    return (
      <div className={styles.mainWrapper}>
        <div className={styles.dashboard}>
          <QuizManager
            moduleNaam={activeModule.naam}
            vragen={activeModule.quiz || []}
            onBack={() => setViewingQuizModuleId(null)}
            onAddVraag={openEditorVoorNieuw}
            onDeleteVraag={verwijderVraag}
            onEditVraag={openEditorVoorBestaand}
            onImportVragen={(geimporteerdeVragen) => {
              setModules(prev => prev.map(m => {
                if (m.id === viewingQuizModuleId) {
                  // We voegen de nieuwe vragen toe aan de huidige (of vervangen ze)
                  return { ...m, quiz: [...(m.quiz || []), ...geimporteerdeVragen] };
                }
                return m;
              }));
            }}
          />

          {showQuizEditor && (
            <QuizEditor
              onClose={() => setShowQuizEditor(false)}
              onSave={handleSaveVraag}
              vraagToEdit={editingVraag}
            />
          )}
        </div>
      </div>
    );
  }

  // SCHERM 2: Het standaard Module Overzicht
  return (
    <div className={styles.mainWrapper}>
      <div className={styles.dashboard}>
        <div className={styles.header}>
          <button onClick={onBack} className={styles.backBtn}>← Terug naar Vakken</button>
          <h2 className={styles.pageTitle}>{courseName}</h2>
          <button onClick={voegModuleToe} className={styles.addBtn}>+ Nieuwe Module</button>
        </div>

        <div className={styles.moduleLijst}>
          {modules.map((mod) => (
            <div key={mod.id} className={styles.moduleCard}>
              <div className={styles.info}>
                <span className={styles.moduleName}>{mod.naam}</span>
                {mod.quiz && mod.quiz.length > 0 && (
                  <span className={styles.badge}>{mod.quiz.length} vragen</span>
                )}
              </div>

              <div className={styles.buttonGroup}>
                <button
                  onClick={() => setViewingQuizModuleId(mod.id)}
                  className={styles.quizBtn}
                >
                  📝 Quiz Beheren
                </button>
                <button className={styles.playBtn}>Starten</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;