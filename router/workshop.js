const express = require('express');
const db = require('../db/database');  // Assuming you have a Supabase-compatible database object

const router = express.Router();



// Create a new conference
router.post("/create", async (req, res) => {
  try {
    const { workshop_title, workshop_description,related_fields,workshop_duration,conference_id} = req.body;

    console.log(req.body)
    const { data, error } = await db
      .from('workshop')
      .insert([
        {
          workshop_title,
          workshop_description,
          related_fields,
          workshop_duration,
          conference_id
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
      .from('workshop')
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


// Get all workshops for a conference by conference ID
router.get('/popular/:conference_id', async (req, res) => {
  try {
    const conferenceId = req.params.conference_id;

  
    const { data, error } = await db
      .from('workshop')
      .select('*')
      .eq('conference_id', conferenceId);

    if (error) {
      throw error;
    }

    console.log("popular list");
    

    data.sort(((a, b) => b.count - a.count));
    console.log(data);
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
      .from('workshop')
      .select('*')
      .eq('workshop_id', workshopId);

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
// workshop_user Table (workshop_id, user_id, role("assigned", "requested", "normal"))
// user( first_name,last_name,date_of_birth,email,current_institution,personal_links,expertise)


// Suggest users for a workshop based on related fields
// edit: filter out those users whose role = assigned, requested in workshop_user table
router.post('/suggestTeachers', async (req, res) => {
  try {
    const { related_fields, workshop_id } = req.body;
    let suggestedUsers = new Set();

    // Fetch all users who have been assigned or requested
    const { data: assignedOrRequestedUsers, error: assignedOrRequestedError } = await db
      .from('workshop_user')
      .select('user_id')
      .in('role', ['Assigned', 'Requested'])
      .eq('workshop_id', workshop_id);

    if (assignedOrRequestedError) {
      throw assignedOrRequestedError;
    }

    const assignedOrRequestedUserIds = assignedOrRequestedUsers.map(user => user.user_id);


    for (let field of related_fields) {
      const { data, error } = await db
        .from('user')
        .select('*')
        .filter('expertise', 'cs', `{${field}}`);


      if (error) {
        throw error;
      }

     // Filter out assigned or requested users and combine first_name and last_name to create a full_name property
     const usersWithFullName = data
     .filter(user => !assignedOrRequestedUserIds.includes(user.user_id))
     .map(user => ({
       user_id: user.user_id,
       full_name: `${user.first_name} ${user.last_name}`,
       current_institution: user.current_institution,
       expertise: user.expertise
     }));

      usersWithFullName.forEach(user => suggestedUsers.add(JSON.stringify(user)));
    }

    suggestedUsers = Array.from(suggestedUsers).map(user => JSON.parse(user));

    res.json(suggestedUsers);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Internal Server Error');
  }
});


router.get('/interested/:conference_id/:user_id', async (req, res) => {
  try {
    const conference_id = req.params.conference_id;
    const user_id = req.params.user_id;

    // const conference_id = "73f16d7a-ccf1-4eb6-b815-85ed745d80d5";
    // const user_id = "c86e4d14-5aef-463b-8fa3-a326a6a7a6c7";

    const { data, error } = await db
      .from('workshop_interested')
      .select(`workshop_id , user_id , workshop(workshop_id , conference_id)`)
      .eq('workshop.conference_id', conference_id)
      .eq('user_id', user_id);

      console.log("all data after joining");
      console.log(data);

      const transformed_data = data.map(({ workshop_id, user_id }) => ({ workshop_id, user_id }));

      res.json(transformed_data);

    if (error) {
      throw error;
    }


  } catch (error) {
    console.error(error.message);
    res.status(500).send('Internal Server Error');
  }
});


router.post('/interested/:conference_id', async (req, res) => {
  try {
    let workshop_id = req.body.workshop_id;

    let user_id = req.body.user_id;

    // let workshop_id = "e63d4221-f3fb-45d2-b7cd-cea0f0b837c6";

    let val = req.body.value;

    var {data, error} = await db
    .from('workshop')
    .select('*')
    .eq('workshop_id' , workshop_id);

    // console.log("ekhane ase, workshop e")
    // console.log(data);



    console.log("count hocche");
    let interest_count = data[0].count;

    // console.log(interest_count);

    let new_count;
    if(val === "1"){
      new_count = 1;

      const { error } = await db
      .from('workshop_interested')
      .insert({ workshop_id: workshop_id, user_id: user_id })


    }
    else{
      new_count = -1;

      const { error } = await db
      .from('workshop_interested')
      .delete()
      .match({workshop_id:workshop_id , user_id:user_id})      

    }

    var {data, error} = await db
    .from('workshop')
    .update({ count:interest_count +new_count })
    .eq('workshop_id' , workshop_id);

    res.status(201).json("success");

  } catch (error) {
    console.error(error.message);
    res.status(500).send('Internal Server Error');
  }
});


module.exports = router;

