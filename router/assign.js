const express = require('express');
const db = require('../db/database');  // Assuming you have a Supabase-compatible database object

const router = express.Router();


router.get("/auto/:paper_id", async (req, res) => {
  try {

     const paper_id = req.params.paper_id;



   

    var already_assigned = [];
    //already_assigned.push("66df2a4d-0ad9-462d-9953-d2453c2b2175"); // reviewers that are already assinged

    //const paper_id = paper3;


    var {data, error} = await db
      .from('request')
      .select('user_id').eq('paper_id',paper_id);


      let already_requested = data.map(item =>item.user_id);

      var {data, error} = await db
      .from('assignedReviewer')
      .select('user_id').eq('paper_id',paper_id);


      let already_accepted = data.map(item =>item.user_id);  

      already_assigned = [...already_accepted , ...already_requested];

      const temp_unique = new Set(already_assigned);

      already_assigned = [...temp_unique];













    var { data, error } = await db //fetching data from paper table.
      .from('paper')
      .select('*')
      .eq('paper_id', paper_id); // needs to be equal to paper_id, that means infos corresponding to that specific id will come

    var related_fields = data.map(item => item.related_fields); // from that data, the fields that the paper has will be selected (cutting off the unneccessary data)

    related_fields = related_fields.flat(); // flattening the array to get rid of annoying [] 's

    console.log("RELATED fields");
    console.log(related_fields);




    var {data, error} = await db // similarly data will be fetched from paperAuthor table to get the author info
        .from('paperAuthor')
        .select('*')
        .eq('paper_id', paper_id);

    var authors = data.map(item => item.user_id); // making an array of only the author ids.

    authors = authors.flat(); // similar to previous one

    console.log("author id");
    console.log(authors);


    var {data, error} = await db // all user info are extracted
    .from('user')
    .select('*')
    
   
    var all_expertise = data.map(({user_id, expertise , current_institution}) => ({user_id, expertise, current_institution})); // from that data, only 3 fields are selected, user_id, expertise, institution


    var related_institution = all_expertise.filter(item => authors.includes(item.user_id)).map(item => item.current_institution);
    /*
    explanation of above line:
    at first filter is used . this is to filter out all the data that matches with the author id.
    Then from those values, their institutions are selected, 
    thus we  get an array of author's institutions
    */

    console.log("related institution");
    console.log(related_institution);

    var possible_user_id = all_expertise.filter(user => {
        return related_fields.some(keyword => user.expertise.includes(keyword));
    });

    /*
    explanation:
    filter is used on all_expertise. Inside the filter, "user" is a placeholder for all_expertise values. 
    then user.expertise value is checked against the related fields values.
    Any value that is in related_fields will be inside the possible_user_id
    */

    console.log("possible user id");
    console.log(possible_user_id);


    possible_user_id = possible_user_id.filter(user =>  !related_institution.includes(user.current_institution));

    /*
    more filtering is used to filter out the instittution that matches with the author
    */
    
    

    var actual_reviewer_id = possible_user_id.filter(user => !authors.includes(user.user_id));
    /*
    finally, the id's that matches with the author will be discarded
    */


    actual_reviewer_id = actual_reviewer_id.filter(user => !already_assigned.includes(user.user_id));
    /*
      filter out the already assigned reviewers
    */

    let dataT = []

      
    //console.log(actual_reviewer_id)

    let allAuthorName = []

  
    
    if(actual_reviewer_id.length === 0){ // to check if there is any reviewer or not
        res.status(200).json(allAuthorName);
    }
    else{
        actual_reviewer_id = actual_reviewer_id.map(user => user.user_id); // extract only the reviewer id, and remove other data

        

        console.log(actual_reviewer_id)

        
        for(let i = 0; i<actual_reviewer_id.length;i++)
        {
          let {data,err} = await db.from('user').select(`first_name,last_name`).eq('user_id',actual_reviewer_id[i]);
          
          let full_name = data[0].first_name + ' ' + data[0].last_name
          
          allAuthorName = [...allAuthorName,{user_id:actual_reviewer_id[i],full_name:full_name}]
        }
        
        res.status(200).json(allAuthorName);
    }


    if (error) {
      throw error;
    }

    // console.log(related_fields);
    // console.log(authors);
    // console.log(all_expertise);
    // console.log(possible_user_id);
    // console.log(actual_reviewer_id);

    // console.log(data_paperAuthor);

    
    
    // res.status(200).json(authors);
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



router.get("/manual/:paper_id", async (req, res) => {
  try {

    //  const paper_id = req.params.paper_id;



    const paper1 = "7b3b5479-e7c9-4298-8432-07a95f34ef9b";
    const paper2 = "2b8d62f2-fa14-4ce1-9d78-3f132fbe7d98";
    const paper3 = "31ad3d24-a21e-4191-9cd9-c3e1bfef251e";

    const paper_id = paper3;

    var already_assigned = [];
    //already_assigned.push("66df2a4d-0ad9-462d-9953-d2453c2b2175"); // reviewers that are already assinged


    var {data, error} = await db
      .from('request')
      .select('user_id');


      let already_requested = data.map(item =>item.user_id);

      var {data, error} = await db
      .from('assignedReviewer')
      .select('user_id');


      let already_accepted = data.map(item =>item.user_id);  

      already_assigned = [...already_accepted , ...already_requested];

      const temp_unique = new Set(already_assigned);

      already_assigned = [...temp_unique];

      // already_assigned = [];

      console.log("already assigned");

      console.log(already_assigned);




    var { data, error } = await db //fetching data from paper table.
      .from('paper')
      .select('*')
      .eq('paper_id', paper_id); // needs to be equal to paper_id, that means infos corresponding to that specific id will come

    var related_fields = data.map(item => item.related_fields); // from that data, the fields that the paper has will be selected (cutting off the unneccessary data)

    related_fields = related_fields.flat(); // flattening the array to get rid of annoying [] 's

    console.log("RELATED fields");
    console.log(related_fields);




    var {data, error} = await db // similarly data will be fetched from paperAuthor table to get the author info
        .from('paperAuthor')
        .select('*')
        .eq('paper_id', paper_id);

    var authors = data.map(item => item.user_id); // making an array of only the author ids.

    authors = authors.flat(); // similar to previous one

    console.log("author id");
    console.log(authors);


    var {data, error} = await db // all user info are extracted
    .from('user')
    .select('*')
    
   
    var all_expertise = data.map(({user_id, expertise}) => ({user_id, expertise})); // from that data, only 3 fields are selected, user_id, expertise, institution


    // var related_institution = all_expertise.filter(item => authors.includes(item.user_id)).map(item => item.current_institution);
    /*
    explanation of above line: // commented out code
    at first filter is used . this is to filter out all the data that matches with the author id.
    Then from those values, their institutions are selected, 
    thus we  get an array of author's institutions
    */


    var possible_user_id = all_expertise.filter(user => {
        return related_fields.some(keyword => user.expertise.includes(keyword));
    });

    /*
    explanation:
    filter is used on all_expertise. Inside the filter, "user" is a placeholder for all_expertise values. 
    then user.expertise value is checked against the related fields values.
    Any value that is in related_fields will be inside the possible_user_id
    */

    console.log("possible user id");
    console.log(possible_user_id);


    // possible_user_id = possible_user_id.filter(user =>  !related_institution.includes(user.current_institution));

    /*
    more filtering is used to filter out the instittution that matches with the author
    */
    
    

    var actual_reviewer_id = possible_user_id.filter(user => !authors.includes(user.user_id));
    /*
    finally, the id's that matches with the author will be discarded
    */


    actual_reviewer_id = actual_reviewer_id.filter(user => !already_assigned.includes(user.user_id));
    /*
      filter out the already assigned reviewers
    */

     let allAuthorName = []

  
    
    if(actual_reviewer_id.length === 0){ // to check if there is any reviewer or not
        
      console.log("is empty");
      res.status(200).json(allAuthorName);
    }
    else{
        actual_reviewer_id = actual_reviewer_id.map(user => user.user_id); // extract only the reviewer id, and remove other data

        

        console.log(actual_reviewer_id)

        
        for(let i = 0; i<actual_reviewer_id.length;i++)
        {
          let {data,err} = await db.from('user').select(`first_name,last_name`).eq('user_id',actual_reviewer_id[i]);
          
          let full_name = data[0].first_name + ' ' + data[0].last_name
          
          allAuthorName = [...allAuthorName,{user_id:actual_reviewer_id[i],full_name:full_name}]
        }
        
        res.status(200).json(allAuthorName);
    }


    if (error) {
      throw error;
    }

    // console.log(related_fields);
    // console.log(authors);
    // console.log(all_expertise);
    // console.log(possible_user_id);
    // console.log(actual_reviewer_id);

    // console.log(data_paperAuthor);

    
    
    // res.status(200).json(authors);
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



router.post("/request", async (req, res) => {
  try {

    user_id = req.body.user_id
    paper_id = req.body.paper_id
    
    
    const { data, error } = await db
      .from('request')
      .insert([
        {
          user_id,
          paper_id
        },
      ]);

    if (error) {
      throw error;
    }

    console.log("does it come here");


    res.status(201).json("Request sent");
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


router.get("/sent_request", async (req, res) => {
  try {

    // user_id = req.body.user_id
    // paper_id = req.body.paper_id

    
    let paper_id = "31ad3d24-a21e-4191-9cd9-c3e1bfef251e";
    
    
    const { data, error } = await db
      .from('request')
      .select('*')
      .eq("paper_id",paper_id);


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
      console.log(user_info);

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

    console.log("does it come here");


    res.status(201).json(output);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post("/request_delete", async (req, res) => {
  try {
    
    const paper_id = "b04ffd91-7316-4a42-9bf1-54b0e0e1f83f";

    const user_id = "66df2a4d-0ad9-462d-9953-d2453c2b2175";

    const { data, error } = await db
      .from('request')
      .delete()
      .match({"user_id":user_id , "paper_id":paper_id});
      res.status(201).json("deleted successfully");

    if (error) {
      throw error;
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});




module.exports = router;
