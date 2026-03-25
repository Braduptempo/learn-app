import express from 'express';
import db from '../config/db.js';

const router = express.Router();


// 1. GET: Alle vragen voor een specifieke module
router.get('/module/:moduleId', async (req, res) => {
  const { moduleId } = req.params;
  try {
    const [rows] = await db.query("SELECT * FROM vragen WHERE module_id = ?", [moduleId]);
    const geformatteerdeVragen = rows.map(v => ({
      ...v,
      antwoorden: typeof v.antwoorden === 'string' ? JSON.parse(v.antwoorden) : v.antwoorden
    }));
    res.json(geformatteerdeVragen);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. POST: Een nieuwe vraag toevoegen
router.post('/', async (req, res) => {
  const { module_id, vraag_tekst, antwoorden, categorie, uitleg } = req.body;
  try {
    const sql = `INSERT INTO vragen (module_id, vraag_tekst, antwoorden, correct_index, categorie, uitleg) 
                 VALUES (?, ?, ?, ?, ?, ?)`;
    const [result] = await db.query(sql, [
      module_id, 
      vraag_tekst, 
      JSON.stringify(antwoorden), 
      0, // Standaard index 0 (bovenste is correct)
      categorie, 
      uitleg
    ]);
    res.status(201).json({ message: "Vraag toegevoegd!", id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. PUT: Vraag bewerken
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { vraag_tekst, categorie, antwoorden, uitleg } = req.body; // Gebruik vraag_tekst!
  try {
    await db.query(
      "UPDATE vragen SET vraag_tekst = ?, categorie = ?, antwoorden = ?, uitleg = ? WHERE id = ?",
      [vraag_tekst, categorie, JSON.stringify(antwoorden), uitleg, id]
    );
    res.json({ message: "Vraag bijgewerkt" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. DELETE & BULK blijven hetzelfde...
router.delete('/:id', async (req, res) => {
  try {
    await db.query("DELETE FROM vragen WHERE id = ?", [req.params.id]);
    res.json({ message: "Vraag verwijderd" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/module/:moduleId/categorie', async (req, res) => {
  const { moduleId } = req.params;
  const { categorie } = req.body;
  try {
    await db.query("UPDATE vragen SET categorie = ? WHERE module_id = ?", [categorie, moduleId]);
    res.json({ message: "Alle vragen bijgewerkt" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// In je vragen routes bestand (bijv. routes/vragen.js)

router.post('/bulk', async (req, res) => {
  const { vragen } = req.body; 
  
  if (!Array.isArray(vragen)) {
    return res.status(400).json({ error: "Data moet een array van vragen zijn." });
  }

  try {
    // Verander 'pool.query' naar 'db.query'
    for (const v of vragen) {
      await db.query(
        "INSERT INTO vragen (module_id, vraag_tekst, antwoorden, categorie, uitleg, correct_index) VALUES (?, ?, ?, ?, ?, ?)",
        [
          v.module_id, 
          v.vraag_tekst, 
          JSON.stringify(v.antwoorden), 
          v.categorie || 'Algemeen', 
          v.uitleg || '', 
          0 
        ]
      );
    }
    
    res.json({ message: `${vragen.length} vragen succesvol geïmporteerd!` });
  } catch (err) {
    console.error("Bulk import fout:", err);
    res.status(500).json({ error: "Fout bij opslaan in database: " + err.message });
  }
});

export default router;