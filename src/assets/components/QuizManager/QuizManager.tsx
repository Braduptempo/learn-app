import React from 'react';
import styles from './QuizManager.module.css';
import { type Vraag } from '../../../utils/types';

interface QuizManagerProps {
  moduleNaam: string;
  vragen: Vraag[];
  onBack: () => void;
  onAddVraag: () => void;
  onDeleteVraag: (id: number) => void;
  onEditVraag: (vraag: Vraag) => void;
  onImportVragen: (vragen: Vraag[]) => void; // Nieuwe prop voor de import
}

const QuizManager = ({ 
  moduleNaam, 
  vragen, 
  onBack, 
  onAddVraag, 
  onDeleteVraag, 
  onEditVraag,
  onImportVragen 
}: QuizManagerProps) => {

  // Functie: Exporteer vragen naar JSON bestand
  const exporteerVragen = () => {
    if (vragen.length === 0) {
      alert("Er zijn geen vragen om te exporteren.");
      return;
    }

    const dataStr = JSON.stringify(vragen, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `${moduleNaam.replace(/\s+/g, '-').toLowerCase()}-quiz.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  // Functie: Importeer vragen uit een JSON bestand
  const importeerVragen = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    const file = event.target.files?.[0];
    
    if (file) {
      fileReader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const geimporteerdeVragen = JSON.parse(content);
          
          if (Array.isArray(geimporteerdeVragen)) {
            onImportVragen(geimporteerdeVragen); 
            alert(`${geimporteerdeVragen.length} vragen succesvol geïmporteerd!`);
          } else {
            throw new Error("Ongeldig formaat");
          }
        } catch (error) {
          alert("Fout bij het lezen van het bestand. Zorg dat het een geldig JSON-bestand is.");
        }
      };
      fileReader.readAsText(file);
    }
    // Reset de input zodat hetzelfde bestand opnieuw gekozen kan worden
    event.target.value = '';
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.leftHeader}>
          <button onClick={onBack} className={styles.backBtn}>← Terug</button>
          <h2 className={styles.title}>Quiz Beheer: {moduleNaam}</h2>
        </div>
        
        <div className={styles.headerActions}>
          <button onClick={exporteerVragen} className={styles.secondaryBtn}>📤 Export</button>
          <label className={styles.secondaryBtn}>
            📥 Import
            <input 
              type="file" 
              accept=".json" 
              onChange={importeerVragen} 
              style={{ display: 'none' }} 
            />
          </label>
          <button onClick={onAddVraag} className={styles.addBtn}>+ Vraag Toevoegen</button>
        </div>
      </div>

      <div className={styles.vragenLijst}>
        {vragen.length === 0 ? (
          <div className={styles.emptyState}>
            <p>Er zijn nog geen vragen voor deze module.</p>
            <p>Maak er zelf een aan of importeer een bestaand JSON-bestand.</p>
          </div>
        ) : (
          vragen.map((v, index) => (
            <div key={v.id} className={styles.vraagCard}>
              <div className={styles.vraagContent}>
                <span className={styles.number}>#{index + 1}</span>
                <p className={styles.tekst}>{v.vraagTekst}</p>
                <div className={styles.antwoordenPreview}>
                  <span className={styles.correct}>✔ {v.antwoorden[0]}</span>
                  <span className={styles.wrong}>✖ {v.antwoorden[1]}</span>
                  <span className={styles.wrong}>✖ {v.antwoorden[2]}</span>
                  <span className={styles.wrong}>✖ {v.antwoorden[3]}</span>
                </div>
              </div>
              <div className={styles.acties}>
                <button onClick={() => onEditVraag(v)} className={styles.editBtn}>✏️</button>
                <button onClick={() => onDeleteVraag(v.id)} className={styles.deleteBtn}>🗑️</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default QuizManager;