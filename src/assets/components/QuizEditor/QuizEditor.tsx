import { useState } from 'react';
import {type Vraag} from '../../../utils/types';
import styles from './QuizEditor.module.css';

interface QuizEditorProps {
  onSave: (vraag: Vraag) => void;
  onClose: () => void;
}

const QuizEditor = ({ onSave, onClose }: QuizEditorProps) => {
  const [vraagTekst, setVraagTekst] = useState('');
  const [antwoorden, setAntwoorden] = useState(['', '', '', '']);

  const handleAntwoordChange = (index: number, waarde: string) => {
    const nieuweAntwoorden = [...antwoorden];
    nieuweAntwoorden[index] = waarde;
    setAntwoorden(nieuweAntwoorden);
  };

  const opslaan = () => {
    if (!vraagTekst || antwoorden.some(a => !a)) {
      alert("Vul alle velden in!");
      return;
    }
    
    onSave({
      id: Date.now(),
      vraagTekst,
      antwoorden,
      correctAntwoordIndex: 0 // We spreken af: de eerste is altijd de goede
    });
    onClose();
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h3>Nieuwe Quiz Vraag</h3>
        <p className={styles.hint}>Het eerste veld is altijd het <strong>juiste</strong> antwoord.</p>
        
        <input 
          className={styles.input}
          placeholder="Vraag..." 
          value={vraagTekst}
          onChange={(e) => setVraagTekst(e.target.value)}
        />

        <div className={styles.answerGrid}>
          {antwoorden.map((a, i) => (
            <input 
              key={i}
              className={i === 0 ? styles.correctInput : styles.wrongInput}
              placeholder={i === 0 ? "Correct antwoord" : `Fout antwoord ${i}`}
              value={a}
              onChange={(e) => handleAntwoordChange(i, e.target.value)}
            />
          ))}
        </div>

        <div className={styles.actions}>
          <button onClick={onClose} className={styles.cancelBtn}>Annuleren</button>
          <button onClick={opslaan} className={styles.saveBtn}>Vraag Toevoegen</button>
        </div>
      </div>
    </div>
  );
};

export default QuizEditor;