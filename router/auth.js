const express = require('express');
const db = require('../db/database'); 
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
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

    res.status(201).json({success: 'User added successfully', user_id: user_id});

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

    // Create a JWT token and send it to the user if the credentials are valid  
    const token = jwt.sign({ user_id: authData.user_id}, process.env.JWT_SECRET_KEY);

    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    res.status(200).json({ message: 'User logged in successfully'});

  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

// authentification check
router.get('/', async (req, res) => {
  try {
    const token = req.cookies.token;

    console.log(token);

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    jwt.verify(token, process.env.JWT_SECRET_KEY, (err, user) => {
      if (err) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      console.log(user);

      res.status(200).json({ user_id: user.user_id });
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});


// Logout route
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.status(200).json({ message: 'User logged out successfully' });
});


// changePassword route

router.post('/changePassword', async (req, res) => {
  try {
    const { email, oldPassword, confirmPassword, newPassword } = req.body;

    if (confirmPassword !== newPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    // Use authentication system to sign in
    const { data: authData, error: authError } = await db.from('auth').select().eq('email', email).single();

    if (!authData) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(oldPassword, authData.hashed_password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Wrong Password!' });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the password
    const { data, error } = await db.from('auth').upsert([
      {
        email,
        user_id: authData.user_id,
        hashed_password: hashedPassword,
      },
    ]);

    if (error) {
      throw error;
    }

    res.status(200).json({ message: 'Password updated successfully' });

  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});


module.exports = router;

