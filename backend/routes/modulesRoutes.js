import express from 'express';
import db from '../config/db.js';

const router = express.Router();

// 1. GET: Modules ophalen voor een vak
router.get('/vak/:vakId', async (req, res) => {
  const { vakId } = req.params;

  if (!vakId || vakId === 'undefined') {
    return res.status(400).json({ error: "Geldig vakId is verplicht" });
  }

  try {
    const [modules] = await db.query(
      "SELECT * FROM modules WHERE vak_id = ? ORDER BY volgorde ASC", 
      [vakId]
    );

    // Vragen per module ophalen
    const modulesMetVragen = await Promise.all(modules.map(async (mod) => {
      const [vragen] = await db.query("SELECT * FROM vragen WHERE module_id = ?", [mod.id]);
      
      const geformatteerdeVragen = vragen.map(v => {
        let geparsteAntwoorden = [];
        try {
          geparsteAntwoorden = typeof v.antwoorden === 'string' ? JSON.parse(v.antwoorden) : v.antwoorden;
        } catch (e) {
          geparsteAntwoorden = ["Data error", "", "", ""];
        }
        return { ...v, antwoorden: geparsteAntwoorden };
      });

      return { ...mod, quiz: geformatteerdeVragen };
    }));

    res.json(modulesMetVragen);
  } catch (err) {
    console.error("Backend GET error:", err);
    res.status(500).json({ error: "Fout bij ophalen van modules uit database." });
  }
});

// 2. POST: Module toevoegen (5 kolommen)
router.post('/', async (req, res) => {
  const { vak_id, naam } = req.body;
  
  if (!vak_id || !naam) {
    return res.status(400).json({ error: "vak_id en naam zijn verplicht" });
  }

  try {
    const [result] = await db.query(
      "INSERT INTO modules (vak_id, naam, beschrijving, volgorde) VALUES (?, ?, ?, ?)", 
      [vak_id, naam, '', 0] 
    );

    res.status(201).json({ 
      id: result.insertId, 
      vak_id, 
      naam, 
      quiz: [] 
    });
  } catch (err) {
    console.error("Backend POST error:", err);
    res.status(500).json({ error: "Database weigert toevoeging." });
  }
});

// 3. DELETE: Module verwijderen
router.delete('/:id', async (req, res) => {
  try {
    await db.query("DELETE FROM modules WHERE id = ?", [req.params.id]);
    res.json({ message: "Module verwijderd" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;