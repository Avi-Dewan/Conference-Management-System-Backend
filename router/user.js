const express = require('express');
const db = require('../db/database'); 

const router = express.Router();


// user_id ( int) , first_name (text), last_name(text), date_of_birth(date), email(text), current_institution(text), personal_links(array of text), expertise ( array of text)


// Add a new user
router.post("/add", async (req, res) => {
  try {
    const {  
      first_name, 
      last_name, 
      date_of_birth, 
      email, 
      current_institution, 
      personal_links, 
      expertise 
    } = req.body;

    const { data, error } = await db.from('user').upsert([
      {
        first_name,
        last_name,
        date_of_birth,
        email,
        current_institution,
        personal_links,
        expertise,
      },
    ]);

    if (error) {
      throw error;
    }

    res.status(201).json('User added successfully');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

// Get all users
router.get("/all", async (req, res) => {
  try {
    const { data } = await db.from('user').select('*');

    for(let i=0;i<data.length;i++)
    {
      data[i].full_name = data[i].first_name + ' ' + data[i].last_name
    }
    res.json(data);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Internal Server Error');
  }
});

// Get a user by user_id
router.get("/:user_id", async (req, res) => {
  try {
    const userId = req.params.user_id;
    const { data } = await db.from('user').select('*').eq('user_id', userId);
    
    if (data.length === 0) {
      res.status(404).send('User not found');
    } else {
      res.json(data[0]);
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Internal Server Error');
  }
});

// Delete user by user_id
router.delete("/:user_id", async (req, res) => {
  try {
    const userId = req.params.user_id;

    const { data, error } = await db.from('user').delete().eq('user_id', userId);

    if (error) {
      throw error;
    }

    res.send('User deleted successfully');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;
