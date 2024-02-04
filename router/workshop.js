const express = require('express');
const db = require('../db/database');  // Assuming you have a Supabase-compatible database object

const router = express.Router();

// Create a new conference
router.post("/create", async (req, res) => {
  try {
    const { workshop_title, workshop_description,related_fields,workshop_duration,workshop_time } = req.body;

    const { data, error } = await db
      .from('conference')
      .insert([
        {
          conference_title,
          conference_description,
          venue,
          conference_webpage,
          start_date,
          end_date,
          submission_deadline,
          related_fields,
        },
      ]);

    if (error) {
      throw error;
    }

    res.status(201).json("Conference created successfully");
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});




module.exports = router;

