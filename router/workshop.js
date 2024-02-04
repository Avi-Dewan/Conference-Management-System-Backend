const express = require('express');
const db = require('../db/database');  // Assuming you have a Supabase-compatible database object

const router = express.Router();

const sqlQuery = `
    INSERT INTO workshop (workshop_title,workshop_description,related_fields,workshop_duration)
    VALUES ($1, $2, $3, $4);
`;

// Create a new conference
router.post("/create", async (req, res) => {
  try {
    const { workshop_title, workshop_description,related_fields,workshop_duration} = req.body;

    console.log(req.body)
    const { data, error } = await db
      .from('workshop')
      .insert([
        {
          workshop_title,
          workshop_description,
          related_fields,
          workshop_duration
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

