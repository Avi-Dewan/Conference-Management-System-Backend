const express = require('express');
const db = require('../db/database');  // Assuming you have a Supabase-compatible database object

const router = express.Router();

// Create a new conference
router.post("/", async (req, res) => {
  try {
    const { conference_title, conference_status, conference_description, conference_webpage, start_date, end_date, submission_deadline, related_fields } = req.body;

    const { data, error } = await db
      .from('conference')
      .insert([
        {
          conference_title,
          conference_status,
          conference_description,
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

// Get all conferences
router.get("/all", async (req, res) => {
  try {
    const { data, error } = await db
      .from('conference')
      .select('*');

    if (error) {
      throw error;
    }

    res.status(200).json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get conferences with status = open
router.get("/open", async (req, res) => {
  try {
    const { data, error } = await db
      .from('conference')
      .select('*')
      .eq('conference_status', 'open');

    if (error) {
      throw error;
    }

    res.status(200).json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get conferences with status = upcoming
router.get("/upcoming", async (req, res) => {
  try {
    const { data, error } = await db
      .from('conference')
      .select('*')
      .eq('conference_status', 'upcoming');

    if (error) {
      throw error;
    }

    res.status(200).json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get a specific conference by ID
router.get("/:conference_id", async (req, res) => {
  try {
    const conference_id = req.params.conference_id;

    const { data, error } = await db
      .from('conference')
      .select('*')
      .eq('conference_id', conference_id);

    if (error) {
      throw error;
    }

    res.status(200).json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
