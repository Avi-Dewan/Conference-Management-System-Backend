const express = require('express');
const db = require('../db/database');  // Assuming you have a Supabase-compatible database object

const router = express.Router();



// Create a new conference
router.post("/create", async (req, res) => {
  try {
    const { workshop_title, workshop_description,related_fields,workshop_duration,conference_id} = req.body;

    // console.log(req.body)


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


router.get("/get_conference/:workshop_id", async (req, res) => { //retrieves paper info based on paper id
  try {

    const workshop_id = req.params.workshop_id;

    let { data, error } = await db
      .from('workshop')
      .select('conference_id')
      .eq('workshop_id', workshop_id);

    if (error) {
      throw error;
    }

   
     

     let conference_id = data[0].conference_id
     
     let conference_details = (await db
        .from('conference')
        .select('conference_id,conference_title')
        .eq('conference_id', conference_id)).data;
      
      let chair_id = (await db
        .from('conferenceChair')
        .select('user_id')
        .eq('conference_id', conference_id)).data;

        let result = {
        chair_id : chair_id[0].user_id,
        conference_details : {conference_id: conference_details[0].conference_id, conference_title: conference_details[0].conference_title}

     }
      
      
      res.status(200).json(result);
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

    data.sort(((a, b) => b.count - a.count));

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

    // console.log("popular list");
    

    data.sort(((a, b) => b.count - a.count));

    // console.log(data);
   
    res.json(data);
  } catch (error) {

    // console.error(error.message);
    
    res.status(500).send('Internal Server Error');
  }
});




// Get a workshop by specific ID
router.get('/:id', async (req, res) => {
  try {
    const workshopId = req.params.id;

    // console.log("je id diye check kora hbe")
    // console.log(workshopId)
    
    
    const { data, error } = await db
      .from('workshop')
      .select('*')
      .eq('workshop_id', workshopId);
    
    // console.log("workshop details print korte cahcchi")
    // console.log(data)

    if (error) {
      throw error;
    }

    if (data.length === 0) {

      // console.log("workshop not found")
      
      res.status(404).send('Workshop not found');
    } else {

      // console.log("workshop found")
      // console.log(data[0])

      res.json(data);
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Internal Server Error');
  }
});


// workshops Table ( workshop_id, workshop_title, workshop_description, related_fields, workshop_duration, workshop_time, conference_id)
// workshop_taker Table (workshop_id, user_id, role("assigned", "requested", "normal"))
// user( first_name,last_name,date_of_birth,email,current_institution,personal_links,expertise)


// Suggest users for a workshop based on related fields
// edit: filter out those users whose role = assigned, requested in workshop_taker table
router.post('/suggestTeachers', async (req, res) => {
  try {
    const { related_fields, workshop_id } = req.body;
    let suggestedUsers = new Set();

    // Fetch all users who have been assigned or requested
    const { data: assignedOrRequestedUsers, error: assignedOrRequestedError } = await db
      .from('workshop_taker')
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

    // console.log("suggested users")
    // console.log(suggestedUsers);

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

      // console.log("all data after joining");
      // console.log(data);

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



    // console.log("count hocche");

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



router.post("/request", async (req, res) => {
  try {

    user_id = req.body.user_id
    workshop_id = req.body.workshop_id
    
    
    const { data, error } = await db
      .from('workshop_request')
      .insert([
        {
          user_id,
          workshop_id
        },
      ]);

    if (error) {
      throw error;
    }

    // console.log("does it come here");


    res.status(201).json("Request sent");
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


router.get("/get_request/:user_id", async (req, res) => {
  try {

    const user_id = req.params.user_id;

    // console.log(user_id);



    var { data, error } = await db //fetching data from paper table.
      .from('workshop_request')
      .select('*')
      .eq('user_id', user_id); 

    //   data = data.flat();

    const workshopIds = [...new Set(data.map(item => item.workshop_id))];



    // console.log(workshopIds);

    let workshop_info = [];
    for(let i = 0; i<workshopIds.length; i++){

        let wid = workshopIds[i];
        var {data, error} = await db
        .from('workshop')
        .select('*')
        .eq('workshop_id' , wid);


        workshop_info.push(data);
    }

    workshop_info =  workshop_info.flat();


    // console.log(workshop_info);



    //   console.log(data);

    res.status(200).json(workshop_info);

    
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


router.post("/reject_request", async (req, res) => {
  try {


      let {user_id, workshop_id} = req.body;
    

    const { data, error } = await db
      .from('workshop_request')
      .delete()
      .match({"user_id":user_id , "workshop_id":workshop_id});

      
      


    res.status(201).json("deleted successfully");
  } catch (error2) {
    console.error(error2);
    
    res.status(500).json({ error: 'Internal Server Error' });
  }
  
});



router.post("/request_delete", async (req, res) => {
  try {
    
    const workshop_id = req.body.workshop_id;

    const user_id = req.body.user_id;
    
    // console.log(paper_id,user_id,"delete")

    const { data, error } = await db
      .from('workshop_request')
      .delete()
      .match({"user_id":user_id , "workshop_id":workshop_id});
      res.status(201).json("deleted successfully");

    if (error) {
      throw error;
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


router.post("/accept_request", async (req, res) => {
  try {
      const { user_id, workshop_id } = req.body;

      // Insert data into paperReviewer table
      const result = await db.from('assignedInstructor').insert([{ user_id, workshop_id }]);

      res.status(200).json({ message: 'Workshop accepted successfully'});
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});



router.get("/sent_request/:workshop_id", async (req, res) => {
  try {

     
    const workshop_id = req.params.workshop_id;

    // console.log(paper_id)

    
    //let paper_id = "31ad3d24-a21e-4191-9cd9-c3e1bfef251e";
    
    
    const { data, error } = await db
      .from('workshop_request')
      .select('*')
      .eq("workshop_id",workshop_id);


      const UserIds = [...new Set(data.map(item => item.user_id))];

      let user_info = [];
      for(let i = 0; i<UserIds.length; i++){
  
          let uid = UserIds[i];
          const {data, error} = await db
          .from('user')
          .select('*')
          .eq('user_id' , uid);

          user_info.push(data);
  
          
      }
  
      user_info =  user_info.flat();
      
      // console.log(user_info);

      const output = user_info.map(user => {
        const full_name = `${user.first_name} ${user.last_name}`;
        return {
          ...user,
          full_name: full_name,
        }
      });


    if (error) {
      throw error;
    }

    // console.log("does it come here");


    res.status(201).json(output);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



router.get("/accepted_request/:workshop_id", async (req, res) => {
  try {

     
    const workshop_id = req.params.workshop_id;

    // console.log(paper_id)

    
    //let paper_id = "31ad3d24-a21e-4191-9cd9-c3e1bfef251e";
    
    
    const { data, error } = await db
      .from('assignedInstructor')
      .select('*')
      .eq("workshop_id",workshop_id);


      const UserIds = [...new Set(data.map(item => item.user_id))];

      let user_info = [];
      for(let i = 0; i<UserIds.length; i++){
  
          let uid = UserIds[i];
          const {data, error} = await db
          .from('user')
          .select('*')
          .eq('user_id' , uid);

          user_info.push(data);
  
          
      }
  
      user_info =  user_info.flat();
      // console.log(user_info);

      const output = user_info.map(user => {
        const full_name = `${user.first_name} ${user.last_name}`;
        return {
          ...user,
          full_name: full_name,
        }
      });


    if (error) {
      throw error;
    }

    // console.log("does it come here");


    res.status(201).json(output);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});




router.post("/updateData", async (req, res) => {
  try {

    // console.log("does it come to update data??")

    
    workshop_id = req.body.workshop_id;
    workshop_time = req.body.workshop_time;
    workshop_date = req.body.workshop_date;


    // const jsonData = {
    //   dateTime: `${workshop_date} ${workshop_time}`
    // };

    const jsonEntries = {
      date: workshop_date,
      time: workshop_time
    };

    const jsonString = JSON.stringify(jsonEntries);

    // console.log(jsonString);



    
    const { data, error } = await db
      .from('workshop')
      .update({ workshop_time:jsonString})
      .eq('workshop_id' , workshop_id)

    if (error) {
      throw error;
    }

    // console.log("does it come here");


    res.status(201).json("Request sent");
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});








router.get("/auto_suggest/:workshop_id", async (req, res) => {
  try {

    // console.log("workshop er autosuggestion")
    const workshop_id = req.params.workshop_id;

    // console.log(workshop_id);

    
    var already_assigned = [];
    //already_assigned.push("66df2a4d-0ad9-462d-9953-d2453c2b2175"); // reviewers that are already assinged

    //const paper_id = paper3;


    var {data, error} = await db
      .from('workshop_request')
      .select('user_id').eq('workshop_id',workshop_id);


      let already_requested = data.map(item =>item.user_id);

      var {data, error} = await db
      .from('assignedInstructor')
      .select('user_id').eq('workshop_id',workshop_id);


      let already_accepted = data.map(item =>item.user_id);  

      already_assigned = [...already_accepted , ...already_requested];

      const temp_unique = new Set(already_assigned);

      already_assigned = [...temp_unique];

    



    var { data, error } = await db //fetching data from paper table.
      .from('workshop')
      .select('*')
      .eq('workshop_id', workshop_id); // needs to be equal to paper_id, that means infos corresponding to that specific id will come

    var related_fields = data.map(item => item.related_fields); // from that data, the fields that the paper has will be selected (cutting off the unneccessary data)

    related_fields = related_fields.flat(); // flattening the array to get rid of annoying [] 's

    // console.log("RELATED fields");
    // console.log(related_fields);




    // var {data, error} = await db // similarly data will be fetched from paperAuthor table to get the author info
    //     .from('paperAuthor')
    //     .select('*')
    //     .eq('paper_id', paper_id);

    // var authors = data.map(item => item.user_id); // making an array of only the author ids.

    // authors = authors.flat(); // similar to previous one

    // console.log("author id");
    // console.log(authors);


    var {data, error} = await db // all user info are extracted
    .from('user')
    .select('*')
    
   
    var all_expertise = data.map(({user_id, expertise , current_institution}) => ({user_id, expertise, current_institution})); // from that data, only 3 fields are selected, user_id, expertise, institution


    // var related_institution = all_expertise.filter(item => authors.includes(item.user_id)).map(item => item.current_institution);
    /*
    explanation of above line:
    at first filter is used . this is to filter out all the data that matches with the author id.
    Then from those values, their institutions are selected, 
    thus we  get an array of author's institutions
    */

    // console.log("related institution");
    // console.log(related_institution);

    var possible_user_id = all_expertise.filter(user => {
        return related_fields.some(keyword => user.expertise.includes(keyword));
    });

    /*
    explanation:
    filter is used on all_expertise. Inside the filter, "user" is a placeholder for all_expertise values. 
    then user.expertise value is checked against the related fields values.
    Any value that is in related_fields will be inside the possible_user_id
    */

    // console.log("possible user id");
    // console.log(possible_user_id);


    // possible_user_id = possible_user_id.filter(user =>  !related_institution.includes(user.current_institution));

    /*
    more filtering is used to filter out the instittution that matches with the author
    */
    
    

    // var actual_reviewer_id = possible_user_id.filter(user => !authors.includes(user.user_id));
    /*
    finally, the id's that matches with the author will be discarded
    */


    var actual_reviewer_id = possible_user_id.filter(user => !already_assigned.includes(user.user_id));
    /*
      filter out the already assigned reviewers
    */

    let dataT = []

      
    //console.log(actual_reviewer_id)

    let allAuthorName = []

  
    
    if(actual_reviewer_id.length === 0){
       // to check if there is any reviewer or not

       
        res.status(200).json(allAuthorName);

    }
    else{
        actual_reviewer_id = actual_reviewer_id.map(user => user.user_id); // extract only the reviewer id, and remove other data

        

        // console.log(actual_reviewer_id)

        
        for(let i = 0; i<actual_reviewer_id.length;i++)
        {
          let {data,err} = await db.from('user').select(`*`).eq('user_id',actual_reviewer_id[i]);
          
          let full_name = data[0].first_name + ' ' + data[0].last_name
          
          data[0].full_name = full_name
         
          
          allAuthorName = [...allAuthorName,data[0]]

          
        }
       
        res.status(200).json(allAuthorName);
    }


    if (error) {
      throw error;
    }
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



// table: conferenceChair(conference_id, user_id), workshop(workshop_id, workshop_details, conference_id), workshop_taker(workshop_id, user_id), conference(conference_id, conference_title)

// given a user_id from conferenceChair, get all the workshops that are without any unassigned workshop_taker
router.get('/unassignedInstructor/:user_id', async (req, res) => {
  try {
    const user_id = req.params.user_id;

    // Fetch all conferences chaired by the user
    const { data: conferences, error: conferenceError } = await db
      .from('conferenceChair')
      .select('conference_id')
      .eq('user_id', user_id);

    if (conferenceError) {
      throw conferenceError;
    }

    const conferenceIds = conferences.map(conference => conference.conference_id);

    // Fetch all workshops with conference details
    const { data: allWorkshops, error: workshopError } = await db
      .from('workshop')
      .select('*, conference(conference_title)')
      .in('conference_id', conferenceIds);

    if (workshopError) {
      throw workshopError;
    }

    // Fetch all workshops with a taker
    const { data: takenWorkshops, error: takenWorkshopError } = await db
      .from('assignedInstructor')
      .select('workshop_id');

    if (takenWorkshopError) {
      throw takenWorkshopError;
    }

    const takenWorkshopIds = takenWorkshops.map(workshop => workshop.workshop_id);

    // Filter out workshops that have a taker
    const workshops = allWorkshops.filter(workshop => !takenWorkshopIds.includes(workshop.workshop_id));


    res.status(200).json(workshops);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;

