import { useEffect, useState } from 'react';
import { type Vraag, STANDAARD_CATEGORIEEN } from '../../../utils/types';
import styles from './QuizEditor.module.css';

interface QuizEditorProps {
  onSave: (vraag: Vraag) => void;
  onClose: () => void;
  onBulkUpdate?: (categorie: string) => void;
  vraagToEdit?: Vraag | null;
}

const QuizEditor = ({ onSave, onClose, onBulkUpdate, vraagToEdit }: QuizEditorProps) => {
  // States voor de velden
  const [vraagTekst, setVraagTekst] = useState('');
  const [categorie, setCategorie] = useState('Algemeen');
  const [antwoorden, setAntwoorden] = useState(['', '', '', '']);
  const [uitleg, setUitleg] = useState(''); // Nieuwe state voor de uitleg

  // Effect om data te laden als we een bestaande vraag bewerken
  useEffect(() => {
    if (vraagToEdit) {
      setVraagTekst(vraagToEdit.vraagTekst);
      setAntwoorden(vraagToEdit.antwoorden);
      setCategorie(vraagToEdit.categorie || 'Algemeen');
      setUitleg(vraagToEdit.uitleg || ''); // Laad de bestaande uitleg in
    }
  }, [vraagToEdit]);

  // Bulk update functie
  const pasToeOpAlles = () => {
    if (window.confirm(`Wil je de categorie "${categorie}" op ALLE vragen in deze module toepassen?`)) {
      onBulkUpdate?.(categorie);
      alert("Categorie overal toegepast!");
    }
  };

  // Vraag opslaan
  const opslaan = () => {
    if (!vraagTekst || antwoorden.some(a => !a.trim())) {
      alert("Vul de vraag en alle antwoorden in!");
      return;
    }
    
    onSave({
      id: vraagToEdit ? vraagToEdit.id : Date.now(),
      vraagTekst,
      categorie,
      antwoorden,
      correctAntwoordIndex: 0, // In jouw logica is het eerste antwoord altijd correct
      uitleg // De uitleg wordt nu meegegeven aan het object
    });
    
    onClose();
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h3 className={styles.modalTitle}>
          {vraagToEdit ? 'Vraag Bewerken' : 'Nieuwe Quiz Vraag'}
        </h3>

        {/* Categorie Selectie */}
        <div className={styles.inputGroup}>
          <label className={styles.label}>Onderwerp / Categorie</label>
          <div className={styles.categoryRow}>
            <select
              className={styles.select}
              value={categorie}
              onChange={(e) => setCategorie(e.target.value)}
            >
              {STANDAARD_CATEGORIEEN.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <button type="button" onClick={pasToeOpAlles} className={styles.bulkBtn}>
              ✨ Overal toepassen
            </button>
          </div>
        </div>

        {/* De Vraag */}
        <div className={styles.inputGroup}>
          <label className={styles.label}>De Vraag</label>
          <input
            className={styles.input}
            placeholder="Typ hier de vraag..."
            value={vraagTekst}
            onChange={(e) => setVraagTekst(e.target.value)}
          />
        </div>

        {/* Antwoorden */}
        <div className={styles.inputGroup}>
          <label className={styles.label}>Antwoorden (Bovenste is correct)</label>
          <div className={styles.answerGrid}>
            {antwoorden.map((a, i) => (
              <input
                key={i}
                className={i === 0 ? styles.correctInput : styles.wrongInput}
                placeholder={i === 0 ? "Correct antwoord" : `Fout antwoord ${i}`}
                value={a}
                onChange={(e) => {
                  const n = [...antwoorden]; 
                  n[i] = e.target.value; 
                  setAntwoorden(n);
                }}
              />
            ))}
          </div>
        </div>

        {/* Uitleg Sectie */}
        <div className={styles.inputGroup}>
          <label className={styles.label}>Uitleg (waarom is dit het antwoord?)</label>
          <textarea
            className={styles.textarea}
            value={uitleg}
            onChange={(e) => setUitleg(e.target.value)}
            placeholder="Leg uit waarom het juiste antwoord correct is... Dit helpt bij het leren!"
          />
        </div>

        {/* Actie Knoppen */}
        <div className={styles.actions}>
          <button onClick={onClose} className={styles.cancelBtn}>Annuleren</button>
          <button onClick={opslaan} className={styles.saveBtn}>
            {vraagToEdit ? 'Wijzigingen Opslaan' : 'Vraag Toevoegen'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizEditor;