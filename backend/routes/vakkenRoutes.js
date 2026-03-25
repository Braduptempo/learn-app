import express from 'express';
import db from '../config/db.js';

const router = express.Router();

// GET alle vakken
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM vakken");
    res.json(rows);
  } catch (err) {
    console.error("FOUT IN VAKKEN ROUTE:", err);
    res.status(500).json({ error: "Interne server fout: " + err.message });
  }
});

// POST: Een nieuw vak toevoegen
router.post('/', async (req, res) => {
  const { naam, kleur_code } = req.body;
  
  if (!naam) {
    return res.status(400).json({ error: "Naam is verplicht" });
  }

  try {
    const [result] = await db.query(
      "INSERT INTO vakken (naam, kleur_code) VALUES (?, ?)",
      [naam, kleur_code || '#3498db']
    );
    res.status(201).json({ 
      message: "Vak succesvol aangemaakt!", 
      id: result.insertId 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT: Een vak bijwerken
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { naam, kleur_code } = req.body;
  try {
    await db.query(
      "UPDATE vakken SET naam = ?, kleur_code = ? WHERE id = ?",
      [naam, kleur_code || '#3498db', id]
    );
    res.json({ message: "Vak bijgewerkt" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// DELETE: Een vak verwijderen
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.query("DELETE FROM vakken WHERE id = ?", [id]);
    res.json({ message: "Vak verwijderd" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Kon vak niet verwijderen" });
  }
});

export default router;