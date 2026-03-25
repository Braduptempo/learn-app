import { useState, useEffect, useCallback } from 'react';
import QuizEditor from '../QuizEditor/QuizEditor';
import QuizManager from '../QuizManager/QuizManager';
import QuizPlayer from '../QuizPlayer/QuizPlayer';
import { type Vraag, STANDAARD_CATEGORIEEN } from '../../../utils/types';
import styles from './CourseDetail.module.css';

interface Props {
  courseId: number;   
  courseName: string; 
  onBack: () => void; 
}

const CourseDetail = ({ courseId, courseName, onBack }: Props) => {
  const [modules, setModules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [viewingQuizModuleId, setViewingQuizModuleId] = useState<number | null>(null);
  const [showQuizEditor, setShowQuizEditor] = useState(false);
  const [editingVraag, setEditingVraag] = useState<Vraag | null>(null);
  const [activeQuizModule, setActiveQuizModule] = useState<any>(null);
  const [selectedCatForPlay, setSelectedCatForPlay] = useState<Record<number, string>>({});

  const API_BASE_URL = 'http://localhost:3001/api/modules';

  // Stabiele functie om modules (en hun vragen) op te halen
  const haalModulesOp = useCallback(async () => {
    if (!courseId) {
      console.warn("HaalModulesOp afgebroken: courseId is undefined");
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/vak/${courseId}`);
      if (!response.ok) throw new Error(`Server fout: ${response.status}`);
      
      const data = await response.json();
      setModules(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Fetch error in CourseDetail:", error);
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    haalModulesOp();
  }, [haalModulesOp]);

  // NIEUW: Functie die aangeroepen wordt nadat een import is geslaagd
  const handleImportGereed = () => {
    // We verversen simpelweg de hele lijst vanuit de DB zodat alle IDs kloppen
    haalModulesOp();
  };

  const voegModuleToe = async () => {
    const naam = prompt("Naam van de nieuwe module:");
    if (!courseId) return alert("Fout: Geen vak geselecteerd.");

    if (naam && naam.trim() !== "") {
      try {
        const response = await fetch(API_BASE_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            vak_id: Number(courseId), 
            naam: naam.trim() 
          }),
        });

        if (response.ok) {
          haalModulesOp();
        } else {
          const err = await response.json();
          alert(`Fout: ${err.error}`);
        }
      } catch (error) {
        console.error("Netwerkfout bij toevoegen:", error);
      }
    }
  };

  const verwijderModule = async (id: number, naam: string) => {
    if (window.confirm(`Weet je zeker dat je de module '${naam}' wilt verwijderen?`)) {
      try {
        const response = await fetch(`${API_BASE_URL}/${id}`, { method: 'DELETE' });
        if (response.ok) haalModulesOp();
      } catch (error) {
        console.error("Fout bij verwijderen:", error);
      }
    }
  };

  const activeModule = modules.find(m => m.id === viewingQuizModuleId);

  const startQuiz = (mod: any) => {
    const gekozenCat = selectedCatForPlay[mod.id] || 'Alle';
    let vragenVoorQuiz = mod.quiz || [];
    if (gekozenCat !== 'Alle') {
      vragenVoorQuiz = vragenVoorQuiz.filter((v: Vraag) => v.categorie === gekozenCat);
    }
    if (vragenVoorQuiz.length === 0) {
      return alert("Geen vragen gevonden in deze categorie!");
    }
    setActiveQuizModule({ ...mod, quiz: vragenVoorQuiz });
  };

  if (loading) {
    return (
      <div className={styles.mainWrapper}>
        <div className={styles.loading}>Modules voor {courseName} laden...</div>
      </div>
    );
  }

  // WEERGAVE: Quiz Beheer Modus
  if (viewingQuizModuleId && activeModule) {
    return (
      <div className={styles.mainWrapper}>
        <QuizManager
          moduleId={activeModule.id}
          moduleNaam={activeModule.naam}
          vragen={activeModule.quiz || []}
          onBack={() => setViewingQuizModuleId(null)}
          onAddVraag={() => { setEditingVraag(null); setShowQuizEditor(true); }}
          onEditVraag={(v) => { setEditingVraag(v); setShowQuizEditor(true); }}
          onDeleteVraag={haalModulesOp}
          onImportVragen={handleImportGereed} // Gebruik de nieuwe handler hier
        />
        {showQuizEditor && (
          <QuizEditor
            moduleId={activeModule.id}
            onClose={() => setShowQuizEditor(false)}
            onSave={() => { setShowQuizEditor(false); haalModulesOp(); }}
            vraagToEdit={editingVraag}
          />
        )}
      </div>
    );
  }

  // WEERGAVE: Module Overzicht
  return (
    <div className={styles.mainWrapper}>
      <div className={styles.container}>
        <header className={styles.header}>
          <button onClick={onBack} className={styles.backBtn}>← Vakken</button>
          <h2 className={styles.pageTitle}>{courseName}</h2>
          <button onClick={voegModuleToe} className={styles.addBtn}>+ Module</button>
        </header>

        <div className={styles.moduleLijst}>
          {modules.length > 0 ? (
            modules.map((mod) => (
              <div key={mod.id} className={styles.moduleCard}>
                <div className={styles.infoSection}>
                  <div className={styles.titleRow}>
                    <span className={styles.moduleName}>{mod.naam}</span>
                    <button className={styles.deleteIcon} onClick={() => verwijderModule(mod.id, mod.naam)}>🗑️</button>
                  </div>
                  <span className={mod.quiz?.length > 0 ? styles.badge : styles.emptyBadge}>
                    {mod.quiz?.length || 0} vragen
                  </span>
                </div>
                <div className={styles.actionRow}>
                  <select
                    className={styles.miniSelect}
                    value={selectedCatForPlay[mod.id] || 'Alle'}
                    onChange={(e) => setSelectedCatForPlay({ ...selectedCatForPlay, [mod.id]: e.target.value })}
                  >
                    <option value="Alle">Alles oefenen</option>
                    {STANDAARD_CATEGORIEEN.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <div className={styles.buttonGroup}>
                    <button className={styles.playBtn} onClick={() => startQuiz(mod)}>Starten</button>
                    <button className={styles.manageBtn} onClick={() => setViewingQuizModuleId(mod.id)}>📝 Beheer</button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className={styles.emptyState}>Nog geen modules voor dit vak.</div>
          )}
        </div>
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