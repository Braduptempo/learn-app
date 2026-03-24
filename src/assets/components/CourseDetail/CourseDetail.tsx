import { useState } from 'react';
import QuizEditor from '../QuizEditor/QuizEditor';
import QuizManager from '../QuizManager/QuizManager';
import QuizPlayer from '../QuizPlayer/QuizPlayer';
import { type Vraag, STANDAARD_CATEGORIEEN } from '../../../utils/types';
import styles from './CourseDetail.module.css';

interface Props {
  courseName: string;
  onBack: () => void;
}

const CourseDetail = ({ courseName, onBack }: Props) => {
  const [modules, setModules] = useState<any[]>([
    { id: 1, naam: 'Introductie', quiz: [] },
    { id: 2, naam: 'Netwerk Beveiliging', quiz: [] }
  ]);

  // UI States
  const [viewingQuizModuleId, setViewingQuizModuleId] = useState<number | null>(null);
  const [showQuizEditor, setShowQuizEditor] = useState(false);
  const [editingVraag, setEditingVraag] = useState<Vraag | null>(null);
  const [activeQuizModule, setActiveQuizModule] = useState<any>(null);
  const [selectedCatForPlay, setSelectedCatForPlay] = useState<Record<number, string>>({});

  const activeModule = modules.find(m => m.id === viewingQuizModuleId);

  // --- CORE LOGICA ---

  // Vraag opslaan of bewerken
  const handleSaveVraag = (nieuweVraag: Vraag) => {
    setModules(prevModules =>
      prevModules.map(m => {
        if (m.id === viewingQuizModuleId) {
          const bestaandeQuiz = m.quiz || [];
          // Als de vraag al bestond (editingVraag is set), vervang hem. Anders voeg toe.
          const updateVragen = editingVraag
            ? bestaandeQuiz.map((q: Vraag) => q.id === nieuweVraag.id ? nieuweVraag : q)
            : [...bestaandeQuiz, nieuweVraag];
          return { ...m, quiz: updateVragen };
        }
        return m;
      })
    );
    setEditingVraag(null);
  };

  // Vraag verwijderen
  const verwijderVraag = (vraagId: number) => {
    if (window.confirm("Weet je zeker dat je deze vraag wilt verwijderen?")) {
      setModules(prev => prev.map(m => {
        if (m.id === viewingQuizModuleId) {
          return { ...m, quiz: m.quiz?.filter((q: Vraag) => q.id !== vraagId) };
        }
        return m;
      }));
    }
  };

  // Bulk update van categorieën
  const handleBulkUpdate = (nieuweCategorie: string) => {
    setModules(prev => prev.map(m => {
      if (m.id === viewingQuizModuleId) {
        const updateVragen = (m.quiz || []).map((v: Vraag) => ({ ...v, categorie: nieuweCategorie }));
        return { ...m, quiz: updateVragen };
      }
      return m;
    }));
  };

  // Quiz starten met optionele filter
  const startQuiz = (mod: any) => {
    const gekozenCat = selectedCatForPlay[mod.id] || 'Alle';
    let vragenVoorQuiz = mod.quiz || [];

    if (gekozenCat !== 'Alle') {
      vragenVoorQuiz = vragenVoorQuiz.filter((v: Vraag) => v.categorie === gekozenCat);
    }

    if (vragenVoorQuiz.length === 0) {
      alert("Geen vragen gevonden in deze categorie!");
      return;
    }

    setActiveQuizModule({ ...mod, quiz: vragenVoorQuiz });
  };

  const voegModuleToe = () => {
    const naam = prompt("Naam van de nieuwe module:");
    if (naam) setModules([...modules, { id: Date.now(), naam, quiz: [] }]);
  };

  // --- RENDER LOGICA ---

  // SCHERM: Quiz Beheer (Manager)
  if (viewingQuizModuleId && activeModule) {
    return (
      <div className={styles.mainWrapper}>
        <QuizManager
          moduleNaam={activeModule.naam}
          vragen={activeModule.quiz || []}
          onBack={() => setViewingQuizModuleId(null)}
          onAddVraag={() => { setEditingVraag(null); setShowQuizEditor(true); }}
          onEditVraag={(v) => { setEditingVraag(v); setShowQuizEditor(true); }}
          onDeleteVraag={verwijderVraag}
          onImportVragen={(geimporteerdeVragen) => {
            setModules(prev => prev.map(m => {
              if (m.id === viewingQuizModuleId) {
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
            onBulkUpdate={handleBulkUpdate}
          />
        )}
      </div>
    );
  }

  // SCHERM: Module Overzicht (Dashboard)
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

              <div className={styles.playControls}>
                {/* Selector staat nu direct naast de knoppen op dezelfde regel */}
                <select
                  className={styles.miniSelect}
                  value={selectedCatForPlay[mod.id] || 'Alle'}
                  onChange={(e) => setSelectedCatForPlay({ ...selectedCatForPlay, [mod.id]: e.target.value })}
                >
                  <option value="Alle">Alles oefenen</option>
                  {STANDAARD_CATEGORIEEN.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>

                <div className={styles.buttonGroup}>
                  <button className={styles.playBtn} onClick={() => startQuiz(mod)}>Starten</button>
                  <button className={styles.quizBtn} onClick={() => setViewingQuizModuleId(mod.id)}>📝 Beheer</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Overlay voor de Quiz speler */}
        {activeQuizModule && (
          <QuizPlayer
            moduleNaam={activeQuizModule.naam}
            vragen={activeQuizModule.quiz}
            onClose={() => setActiveQuizModule(null)}
          />
        )}
      </div>
    </div>
  );
};

export default CourseDetail;