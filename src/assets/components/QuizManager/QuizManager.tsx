import React, { useState } from 'react';
import styles from './QuizManager.module.css';
import { type Vraag, STANDAARD_CATEGORIEEN } from '../../../utils/types';

interface QuizManagerProps {
  moduleNaam: string;
  vragen: Vraag[];
  onBack: () => void;
  onAddVraag: () => void;
  onDeleteVraag: (id: number) => void;
  onEditVraag: (vraag: Vraag) => void;
  onImportVragen: (vragen: Vraag[]) => void;
}

const QuizManager = ({ 
  moduleNaam, vragen, onBack, onAddVraag, onDeleteVraag, onEditVraag, onImportVragen 
}: QuizManagerProps) => {
  const [filter, setFilter] = useState('Alle');

  const gefilterdeVragen = filter === 'Alle' 
    ? vragen 
    : vragen.filter(v => v.categorie === filter);

  // --- LOGICA VOOR EXPORT ---
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

  // --- LOGICA VOOR IMPORT ---
  const importeerBestand = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        const gevalideerd = Array.isArray(json) ? json.map(v => ({
          ...v,
          id: v.id || Date.now() + Math.random(),
          categorie: v.categorie || 'Algemeen'
        })) : [];
        onImportVragen(gevalideerd);
      } catch (err) {
        alert("Fout bij het lezen van het JSON bestand.");
      }
    };
    reader.readAsText(file);
    event.target.value = ''; 
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.leftHeader}>
          <button onClick={onBack} className={styles.backBtn}>← Terug</button>
          <h2 className={styles.title}>{moduleNaam}</h2>
        </div>
        
        <div className={styles.headerActions}>
          {/* 1. Filter */}
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)} 
            className={styles.filterSelect}
          >
            <option value="Alle">Filter: Alle ({vragen.length})</option>
            {STANDAARD_CATEGORIEEN.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          {/* 2. EXPORT (Nieuw hersteld) */}
          <button onClick={handleExport} className={styles.secondaryBtn}>
            📤 Export JSON
          </button>

          {/* 3. IMPORT */}
          <label className={styles.secondaryBtn}>
            📥 Import JSON
            <input 
              type="file" 
              accept=".json" 
              onChange={importeerBestand} 
              style={{ display: 'none' }} 
            />
          </label>

          {/* 4. Toevoegen */}
          <button onClick={onAddVraag} className={styles.addBtn}>+ Vraag</button>
        </div>
      </div>

      <div className={styles.vragenLijst}>
        {gefilterdeVragen.length === 0 ? (
          <p className={styles.emptyMsg}>Geen vragen gevonden in deze categorie.</p>
        ) : (
          gefilterdeVragen.map((v) => (
            <div key={v.id} className={styles.vraagCard}>
              <div className={styles.vraagContent}>
                <div className={styles.metaInfo}>
                  <span className={styles.categoryTag}>{v.categorie || 'Algemeen'}</span>
                </div>
                <p className={styles.tekst}>{v.vraagTekst}</p>
              </div>
              <div className={styles.acties}>
                <button onClick={() => onEditVraag(v)} className={styles.editBtn} title="Bewerken">✏️</button>
                <button onClick={() => onDeleteVraag(v.id)} className={styles.deleteBtn} title="Verwijderen">🗑️</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default QuizManager;