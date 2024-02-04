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


// Get all workshops for a conference by conference ID
router.get('/all/:conference_id', async (req, res) => {
  try {
    const conferenceId = req.params.conference_id;
    const { data, error } = await db
      .from('workshops')
      .select('*')
      .eq('conference_id', conferenceId);

    if (error) {
      throw error;
    }

    res.json(data);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Internal Server Error');
  }
});

// Get a workshop by specific ID
router.get('/:id', async (req, res) => {
  try {
    const workshopId = req.params.id;
    const { data, error } = await db
      .from('workshops')
      .select('*')
      .eq('id', workshopId);

    if (error) {
      throw error;
    }

    if (data.length === 0) {
      res.status(404).send('Workshop not found');
    } else {
      res.json(data[0]);
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Internal Server Error');
  }
});


// workshops Table ( workshop_id, workshop_title, workshop_description, related_fields, workshop_duration, workshop_time, conference_id)
// workshoop_user Table (workshop_id, user_id, role)
// user( first_name,last_name,date_of_birth,email,current_institution,personal_links,expertise)


// Suggest users for a workshop based on related fields
router.post('/suggestTeachers', async (req, res) => {
  try {
    const { related_fields } = req.body;
    let suggestedUsers = [];

    console.log(related_fields);
  
    for (let field of related_fields) {
      const { data, error } = await db
        .from('user')
        .select('*')
        .filter('expertise', 'cs', `{${field}}`);
  
      if (error) {
        throw error;
      }
      
      // Combine first_name and last_name to create a full_name property
      const usersWithFullName = data.map(user => ({
        user_id : user.user_id,
        full_name: `${user.first_name} ${user.last_name}`,
        current_institution: user.current_institution,
        expertise: user.expertise
      }));
  
      suggestedUsers = [...suggestedUsers, ...usersWithFullName];
    }
  
    res.json(suggestedUsers);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;

