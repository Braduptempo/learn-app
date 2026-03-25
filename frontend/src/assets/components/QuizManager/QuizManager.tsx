import React, { useState } from 'react';
import styles from './QuizManager.module.css';
import { type Vraag, STANDAARD_CATEGORIEEN } from '../../../utils/types';

interface QuizManagerProps {
  moduleId: number;
  moduleNaam: string;
  vragen: Vraag[];
  onBack: () => void;
  onAddVraag: () => void;
  onDeleteVraag: (id: number) => void;
  onEditVraag: (vraag: Vraag) => void;
  onImportVragen: (vragen: Vraag[]) => void;
}

const QuizManager = ({ 
  moduleId, moduleNaam, vragen, onBack, onAddVraag, onDeleteVraag, onEditVraag, onImportVragen 
}: QuizManagerProps) => {
  const [filter, setFilter] = useState('Alle');

  const gefilterdeVragen = filter === 'Alle' 
    ? vragen 
    : vragen.filter(v => v.categorie === filter);

  const handleExport = () => {
    if (vragen.length === 0) return alert("Geen vragen om te exporteren.");
    const dataStr = JSON.stringify(vragen, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `${moduleNaam.replace(/\s+/g, '_')}_quiz.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const importeerBestand = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const resultaat = e.target?.result as string;
        // .trim() verwijdert onzichtbare witruimte/BOM aan begin en eind
        const json = JSON.parse(resultaat.trim());
        const rawVragen = Array.isArray(json) ? json : [json];
        
        const vragenMetModuleId = rawVragen.map((v: any) => ({
          module_id: moduleId,
          vraag_tekst: v.vraag_tekst || v.vraagTekst || "Geen tekst",
          antwoorden: Array.isArray(v.antwoorden) ? v.antwoorden : ["Optie 1", "Optie 2", "Optie 3", "Optie 4"],
          categorie: v.categorie || 'Algemeen',
          uitleg: v.uitleg || '',
          correct_index: v.correct_index ?? 0
        }));

        const response = await fetch('http://localhost:3001/api/vragen/bulk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ vragen: vragenMetModuleId }),
        });

        if (response.ok) {
          alert(`${vragenMetModuleId.length} vragen succesvol geïmporteerd!`);
          onImportVragen([]);
        } else {
          const errData = await response.json();
          alert("Server fout: " + (errData.error || "Onbekende fout"));
        }
      } catch (err: any) {
        // HIER LOGGEN WE DE ECHTE FOUT
        console.error("Gedetailleerde Import Fout:", err);
        alert(`Fout bij verwerken: ${err.message || "Leesfout"}`);
      }
    };
    reader.readAsText(file);
    event.target.value = ''; 
  };

  const bevestigVerwijderen = async (id: number) => {
    if (window.confirm("Weet je zeker dat je deze vraag wilt verwijderen?")) {
      try {
        const response = await fetch(`http://localhost:3001/api/vragen/${id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          onDeleteVraag(id);
        }
      } catch (error) {
        console.error("Fout bij verwijderen:", error);
      }
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.leftHeader}>
          <button onClick={onBack} className={styles.backBtn}>← Terug</button>
          <h2 className={styles.title}>{moduleNaam}</h2>
        </div>
        
        <div className={styles.headerActions}>
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)} 
            className={styles.filterSelect}
          >
            <option value="Alle">Filter: Alle ({vragen.length})</option>
            {STANDAARD_CATEGORIEEN.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <button onClick={handleExport} className={styles.secondaryBtn}>📤 Export</button>

          <label className={styles.secondaryBtn} style={{ cursor: 'pointer' }}>
            📥 Import
            <input 
              type="file" 
              accept=".json" 
              onChange={importeerBestand} 
              style={{ display: 'none' }} 
            />
          </label>

          <button onClick={onAddVraag} className={styles.addBtn}>+ Vraag</button>
        </div>
      </header>

      <div className={styles.vragenLijst}>
        {gefilterdeVragen.length === 0 ? (
          <p className={styles.emptyMsg}>Geen vragen gevonden.</p>
        ) : (
          gefilterdeVragen.map((v) => (
            <div key={v.id} className={styles.vraagCard}>
              <div className={styles.vraagContent}>
                <div className={styles.metaInfo}>
                  <span className={styles.categoryTag}>{v.categorie || 'Algemeen'}</span>
                </div>
                
                <p className={styles.tekst}>{(v as any).vraag_tekst || v.vraagTekst}</p>

                <div className={styles.answersPreview}>
                  {(() => {
                    let ants = v.antwoorden;
                    if (typeof ants === 'string') {
                      try { ants = JSON.parse(ants); } catch(e) { ants = []; }
                    }
                    return Array.isArray(ants) && ants.map((antw, index) => (
                      <span 
                        key={index} 
                        className={index === 0 ? styles.correctPreview : styles.wrongPreview}
                      >
                        {index === 0 ? '✅ ' : '• '}{antw}
                      </span>
                    ));
                  })()}
                </div>
              </div>
              
              <div className={styles.acties}>
                <button onClick={() => onEditVraag(v)} className={styles.editBtn} title="Bewerken">✏️</button>
                <button onClick={() => bevestigVerwijderen(v.id)} className={styles.deleteBtn} title="Verwijderen">🗑️</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default QuizManager;