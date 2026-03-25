import { useEffect, useState } from 'react';
import { type Vraag, STANDAARD_CATEGORIEEN } from '../../../utils/types';
import styles from './QuizEditor.module.css';

interface QuizEditorProps {
  moduleId: number;
  onSave: () => void;
  onClose: () => void;
  vraagToEdit?: Vraag | null;
}

const QuizEditor = ({ moduleId, onSave, onClose, vraagToEdit }: QuizEditorProps) => {
  const [vraagTekst, setVraagTekst] = useState('');
  const [categorie, setCategorie] = useState('Algemeen');
  const [antwoorden, setAntwoorden] = useState(['', '', '', '']);
  const [uitleg, setUitleg] = useState('');

  const API_URL = 'http://localhost:3001/api/vragen';

useEffect(() => {
  if (vraagToEdit) {
    // Check beide mogelijkheden voor de zekerheid
    const tekst = vraagToEdit.vraag_tekst || (vraagToEdit as any).vraagTekst || '';
    setVraagTekst(tekst);
    
    let baseAntwoorden = vraagToEdit.antwoorden;
    if (typeof baseAntwoorden === 'string') {
      try {
        baseAntwoorden = JSON.parse(baseAntwoorden);
      } catch (e) {
        baseAntwoorden = ['', '', '', ''];
      }
    }
    
    setAntwoorden(Array.isArray(baseAntwoorden) ? baseAntwoorden : ['', '', '', '']);
    setCategorie(vraagToEdit.categorie || 'Algemeen');
    setUitleg(vraagToEdit.uitleg || '');
  }
}, [vraagToEdit]);

  const pasToeOpAlles = async () => {
    if (!window.confirm(`Wil je de categorie "${categorie}" op ALLE vragen in deze module toepassen?`)) return;
    try {
      const response = await fetch(`${API_URL}/module/${moduleId}/categorie`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categorie }),
      });
      if (response.ok) {
        alert("Categorie overal bijgewerkt!");
        onSave();
      }
    } catch (error) {
      console.error("Fout bij bulk update:", error);
    }
  };

  const opslaan = async () => {
    if (!vraagTekst.trim() || antwoorden.some(a => !a.trim())) {
      alert("Vul de vraag en alle 4 de antwoorden in!");
      return;
    }

    const vraagData = {
      module_id: moduleId,
      vraag_tekst: vraagTekst.trim(), 
      categorie: categorie,
      antwoorden: antwoorden,        
      correct_index: 0,              
      uitleg: uitleg.trim()
    };

    try {
      const url = vraagToEdit ? `${API_URL}/${vraagToEdit.id}` : API_URL;
      const method = vraagToEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vraagData),
      });

      if (response.ok) {
        onSave();
        onClose();
      } else {
        const errorData = await response.json();
        alert("Fout bij opslaan: " + (errorData.error || "Onbekende fout"));
      }
    } catch (error) {
      console.error("Fout bij opslaan vraag:", error);
      alert("Server onbereikbaar.");
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h3 className={styles.modalTitle}>
          {vraagToEdit ? 'Vraag Bewerken' : 'Nieuwe Quiz Vraag'}
        </h3>

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

        <div className={styles.inputGroup}>
          <label className={styles.label}>De Vraag</label>
          <input
            className={styles.input}
            placeholder="Bijv: Wat is de hoofdstad van Frankrijk?"
            value={vraagTekst}
            onChange={(e) => setVraagTekst(e.target.value)}
          />
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.label}>Antwoorden (Bovenste is correct)</label>
          <div className={styles.answerGrid}>
            {antwoorden.map((a, i) => (
              <input
                key={i}
                /* Hier worden de classes correctInput of wrongInput toegepast */
                className={i === 0 ? styles.correctInput : styles.wrongInput}
                placeholder={i === 0 ? "✅ Juiste antwoord" : `❌ Fout antwoord ${i}`}
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

        <div className={styles.inputGroup}>
          <label className={styles.label}>Uitleg (optioneel)</label>
          <textarea
            className={styles.textarea}
            value={uitleg}
            onChange={(e) => setUitleg(e.target.value)}
            placeholder="Leg uit waarom het eerste antwoord het juiste is..."
          />
        </div>

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