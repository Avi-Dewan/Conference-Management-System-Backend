// trial.js
const express = require('express');
const db = require('../db/database'); 

const router = express.Router();


// Get all trials
router.get('/', async (req, res) => {
  try {
    const { data } = await db.from('trial').select('*');
    res.json(data);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Internal Server Error');
  }
});

// Get a trial by specific ID
router.get('/:id', async (req, res) => {
  try {
    const trialId = req.params.id;
    const { data } = await db.from('trial').select('*').eq('id', trialId);
    
    if (data.length === 0) {
      res.status(404).send('Trial not found');
    } else {
      res.json(data[0]);
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Internal Server Error');
  }
});

// Add a new trial
router.post('/', async (req, res) => {
  try {

    console.log("Try");
    // Example: Extract trial data from request body
    const { id, name, expertise, deadline, dob } = req.body;

    // Your Supabase insert operation here
    const { data, error } = await db.from('trial').upsert([
      {
        id,
        name,
        expertise,
        deadline,
        dob
      },
    ]);

    if (error) {
      throw error;
    }

    res.status(201).send('Trial added successfully');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

// Update trial by specific ID
router.put('/:id', async (req, res) => {
  try {
    const trialId = req.params.id;
    const { name } = req.body;

    // Your Supabase update operation here
    const { data, error } = await db.from('trial').upsert([
      {
        id: trialId,
        name,
      },
    ]);

    if (error) {
      throw error;
    }

    res.send('Trial updated successfully');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

// Delete trial by specific ID
router.delete('/:id', async (req, res) => {
  try {
    const trialId = req.params.id;

    // Your Supabase delete operation here
    const { data, error } = await db.from('trial').delete().eq('id', trialId);

    if (error) {
      throw error;
    }

    res.send('Trial deleted successfully');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;
