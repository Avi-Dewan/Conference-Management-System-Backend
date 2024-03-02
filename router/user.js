const express = require('express');
const db = require('../db/database'); 

const router = express.Router();


// user_id ( int) , first_name (text), last_name(text), date_of_birth(date), email(text), current_institution(text), personal_links(array of text), expertise ( array of text)


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

router.get("/getFullName/:user_id", async (req, res) => {
  try {
    const userId = req.params.user_id;

    
    const { data } = await db.from('user').select('first_name,last_name').eq('user_id', userId);
    
    if (data.length === 0) {
      res.status(404).send('User not found');
    } else {
      res.json(data[0].first_name + ' ' + data[0].last_name);
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


// update user details
// only change the details that are passed in the request body, don't change the rest

router.put("/:user_id", async (req, res) => {
  try {
    const userId = req.params.user_id;
    const { first_name, last_name, date_of_birth, email, current_institution, personal_links, expertise } = req.body;
    
    // Create an object with the fields to update
    const fieldsToUpdate = {
      user_id: userId,
    };

    if (first_name) {
      fieldsToUpdate.first_name = first_name;
    }

    if (last_name) {
      fieldsToUpdate.last_name = last_name;
    }
    
    if (date_of_birth) {
      fieldsToUpdate.date_of_birth = date_of_birth;
    }
    
    if (email) {
      fieldsToUpdate.email = email;
    }
    
    if (current_institution) {
      fieldsToUpdate.current_institution = current_institution;
    }
    
    if (personal_links.size !== 0 && personal_links[0]) {
      fieldsToUpdate.personal_links = personal_links;
    }
    
    if (expertise.size !== 0 && expertise[0]) {
      fieldsToUpdate.expertise = expertise;
    }

    const { data, error } = await db.from('user').update(fieldsToUpdate).eq('user_id', userId);
    
    if (error) {
      throw error;
    }

    res.status(201).json('User details updated successfully');
  } catch (error) {
    console.error(error);
    res.status(500).json('Internal Server Error');
  }
});

module.exports = router;
