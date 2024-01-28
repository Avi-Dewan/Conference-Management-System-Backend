const express = require('express');
const db = require('../db/database'); 
const bcrypt = require('bcrypt');

const router = express.Router();

// user table
// user_id ( uuid) , first_name (text), last_name(text), date_of_birth(date), email(text), current_institution(text), personal_links(array of text), expertise ( array of text)


// auth table
// email(text, foreign key from 'user') , user_id (uuid , foreign key from 'user'), hashed_password


// Sign up
router.post('/signup', async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      date_of_birth,
      email,
      current_institution,
      personal_links,
      expertise,
      password,
    } = req.body;

    // Check if email already exists
    
    const {data, error } = await db.from('user').select('*').eq('email', email);

    // console.log(data);
    if(data.length != 0) {
      return res.status(422).json({ error: "A user already exists!" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user details into the user table
    const { data: userData, error: userError } = await db.from('user').upsert([
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

    if (userError) {
      throw userError;
    }


    const {data: user_data } = await db.from('user').select('*').eq('email', email).single();
    const user_id = user_data.user_id;

    // console.log(user_data);

    // Use the authentication system to register the user
    const { data: authData, error: authError } = await db.from('auth').upsert([
      {
        email,
        user_id,
        hashed_password: hashedPassword,
      },
    ]);

    if (authError) {
      throw authError;
    }

    res.status(201).json('User added successfully');

  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

// Login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Use authentication system to sign in
    const { data: authData, error: authError } = await db.from('auth').select().eq('email', email).single();

    if (!authData) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, authData.hashed_password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Wrong Password!' });
    }

    // You can return the user_id or any other relevant information
    res.status(200).json({ user_id: authData.user_id, user_type: authData.user_type });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;

